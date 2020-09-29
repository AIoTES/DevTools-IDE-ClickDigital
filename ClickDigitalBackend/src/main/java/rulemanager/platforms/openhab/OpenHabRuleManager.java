package rulemanager.platforms.openhab;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import platformmanager.PlatformManager;
import platforms.openHab.Helper.RequestHelper;
import rulemanager.models.RuleAction;
import rulemanager.models.Rule;
import rulemanager.models.Trigger;
import rulemanager.models.Triggergroup;
import rulemanager.platforms.PlatformRuleManager;
import services.IdTranslator;
import devicemanager.Models.Device;
import exceptions.*;
import platforms.openHab.Helper.OpenHabModelRetriever;
import rulemanager.Manager.RuleManager;
import rulemanager.Manager.TriggergroupManager;
import platforms.openHab.Models.Openhab_Action;
import platforms.openHab.Models.Openhab_Rule;
import platforms.openHab.Models.Openhab_Trigger;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.ArrayList;
import java.util.List;

/**

 * The manager for the openHab platform.
 */
public class OpenHabRuleManager extends PlatformRuleManager {

    private RuleManager RuleManager;
    private TriggergroupManager TriggerManager;
    private OpenHabModelRetriever OpenHabmMR;
    private RequestHelper RequestHelper;
    private String userId;


    /**
     * Constructor for initializing an instance of {@link OpenHabRuleManager}.
     * This constructor simply calls the {@link PlatformRuleManager} super constructor.
     */
    public OpenHabRuleManager(
                              RuleManager ruleManager, TriggergroupManager triggerManager, String userId, String projectID, String platformId) throws  PlatformNotFoundException {

        super(userId, projectID, platformId);
        RequestHelper= new RequestHelper(new PlatformManager().getConnectionInfo(userId, platformId, projectID));
        this.RuleManager = ruleManager;
        this.TriggerManager = triggerManager;
        this.OpenHabmMR = new OpenHabModelRetriever(RequestHelper);

        this.userId=userId;
    }

    /**
     * Sends a rule to a platform.
     *
     * @param ruleID The internal ID of the target rule.
     * @throws PlatformDataProcessingException An excpetion will be thrown when the creating of the rule failed.
     */
    @Override
    public void sendRule(int ruleID) throws PlatformDataProcessingException {
        Openhab_Rule ohr = new Openhab_Rule();

        try {
            Rule currule = RuleManager.getRule(ruleID);
            List<Triggergroup> tgs = new ArrayList<>();
            tgs = TriggerManager.getTGsForRule(currule.rootTGID, tgs);
            for (Triggergroup tg : tgs) {
                // create Openhab Trigger
                if (tg.trigger != null) {
                    checkParameters(tg.trigger);
                    ohr.triggers.add(getohtrigger(tg.trigger));
                }
            }

            for (RuleAction a : currule.ruleActions) {
                // create Openhab RuleAction
                ohr.actions.add(getOpenhabAction(a));
            }

            // sets the platform-internal ID
            String uid = RuleManager.getUID(ruleID);

            // entry does not exist
            ohr.name = currule.name;
            ohr.visibility = "true";
            ohr.description = currule.description;

            if(uid.equals("")) {
                uid = String.valueOf(currule.ID); //getUID();
                RuleManager.saveUID(ruleID, uid, currule.platformID);
                ohr.uid = uid;
                RequestHelper.sendPostRequest("rules", new String[]{}, new Object[]{}, new String[]{}, new Object[]{}, MediaType.APPLICATION_JSON_TYPE, ohr);

                updateRule(uid, ohr);
            }else{
                ohr.uid = uid;
                RequestHelper.sendPutRequest("rules", new String[]{"ruleUID"}, new Object[]{uid}, new String[]{}, new Object[]{}, MediaType.APPLICATION_JSON_TYPE, ohr);
                updateRule(uid, ohr);
            }

            if(currule.active){
                this.activateRule(ohr.uid);
            }else{
                this.deactivateRule(ohr.uid);
            }
        }
        catch(PlatformDataProcessingException ex){
                if(ex.getResponseStatus().getStatusCode() == 400){
                    throw new PlatformDataProcessingException("Creation of the rule is refused. Missing required parameter.");
                } else if(ex.getResponseStatus().getStatusCode() == 409){
                    throw new PlatformDataProcessingException("Creation of the rule is refused. Rule with the same UID already exists.");
                } else {
                    throw new PlatformDataProcessingException(ex.getResponseStatus().getReasonPhrase());
                }
        }
        catch(MissingDatabaseEntryException ex){
            throw new PlatformDataProcessingException("Rule not found.");
        }
        catch(ActionCycleException ex){
            throw new PlatformDataProcessingException("List of action in the rule has cycles.");
        }
        catch(MissingParameterException ex){
            throw new PlatformDataProcessingException("Parameter of a triggergroup is missing.");
        }
    }

    /**
     * Deletes a rule by a given ID.
     *
     * @param ruleUID An platform-internal ID of a rule.
     * @throws PlatformDataProcessingException Throws when rule not found.
     */
    @Override
    public void deleteRule(String ruleUID) throws PlatformDataProcessingException {
        if (!(ruleUID).equals("")) {
            try {
                RequestHelper.sendDeleteRequest("rules", new String[]{"ruleUID"}, new Object[]{ruleUID}, new String[]{}, new Object[]{}, MediaType.APPLICATION_JSON_TYPE);
            }
            catch(PlatformDataProcessingException ex){
                if(ex.getResponseStatus().getStatusCode() == 404){
                    throw new PlatformDataProcessingException("Rule corresponding to the given UID does not found.");
                }
            }
        }
    }

    /**
     * Activate a rule by a given ID.
     *
     * @param ruleUID The ID of the target rule.
     * @throws PlatformDataProcessingException Throws when rule not found.
     */
    @Override
    public void activateRule(String ruleUID) throws PlatformDataProcessingException {
        if (!(ruleUID).equals("")) {
            try {
                RequestHelper.sendPostRequest("rules", new String[]{"ruleUID", "enable"}, new Object[]{ruleUID, "enable"}, new String[]{}, new Object[]{}, MediaType.TEXT_PLAIN_TYPE, "true");
            }
            catch(PlatformDataProcessingException ex){
                if(ex.getResponseStatus().getStatusCode() == 404){
                    throw new PlatformDataProcessingException("Rule corresponding to the given UID does not found.");
                }
            }
        }
    }

    /**
     * Deactivate a rule by a given ID.
     *
     * @param ruleUID The ID of the target rule.
     * @throws PlatformDataProcessingException Throws when rule not found.
     */
    @Override
    public void deactivateRule(String ruleUID) throws PlatformDataProcessingException {
        if (!(ruleUID).equals("")) {
            try {
                RequestHelper.sendPostRequest("rules", new String[]{"ruleUID", "enable"}, new Object[]{ruleUID, "enable"}, new String[]{}, new Object[]{}, MediaType.TEXT_PLAIN_TYPE, "false");
            }
            catch(PlatformDataProcessingException ex){
                if(ex.getResponseStatus().getStatusCode() == 404){
                    throw new PlatformDataProcessingException("Rule corresponding to the given UID does not found.");
                }
            }
        }
    }

    /**
     * updates a existing rule.
     *
     * @param ruleUID An platform-internal ID.
     */
    public void updateRule(String ruleUID, Openhab_Rule ohr) throws PlatformDataProcessingException {
        RequestHelper.sendPutRequest("rules", new String[]{"ruleUID"}, new Object[]{ruleUID}, new String[]{}, new Object[]{}, MediaType.APPLICATION_JSON_TYPE, ohr);
    }

    /**
     * Takes an internal ruleAction and returns an corresponding ruleAction for openhab.
     *
     * @param ruleAction An internal ruleAction, created on dashboard-side.
     * @return Returns an {@link Openhab_Action} which is corresponding to the given one.
     */
    private Openhab_Action getOpenhabAction(RuleAction ruleAction) throws PlatformDataProcessingException {
        Openhab_Action oha = new Openhab_Action();
        oha.id = ""; // String.valueOf(ruleAction.ID);
        oha.label = ruleAction.name;
        oha.type = "core.ItemCommandAction";
        oha.configuration.command = ruleAction.condition.command;
        oha.configuration.itemName = OpenHabmMR.getItemNameFromOpenHab(getExternalID(ruleAction.deviceID), ruleAction.sensorID);

        return oha;
    }


    /**
     * Takes an internal trigger and returns an corresponding trigger for openhab.
     *
     * @param trigger A internal trigger, created on dashboard-side.
     * @return Returns an {@link Openhab_Trigger} which is corresponding to the given one.
     */
    private Openhab_Trigger getohtrigger(Trigger trigger) throws PlatformDataProcessingException {
        Openhab_Trigger oht = new Openhab_Trigger();
        oht.id = String.valueOf(trigger.ID);
        oht.label = trigger.name;

        switch((trigger.triggerclass).toLowerCase()) {
            case "temporal": {
                oht.configuration.itemName = OpenHabmMR.getItemNameFromOpenHab(getExternalID(trigger.deviceID), trigger.sensorID);
                oht.configuration.state = trigger.condition.state;
                if(!(trigger.condition.time).equals("")) {
                    oht.type = "timer.TimeOfDayTrigger";
                    oht.configuration.time = trigger.condition.time;
                }else {
                    oht.type = "timer.DayOfWeekTrigger";
                    oht.configuration.days = trigger.condition.days;
                }
                break;
            }
            case "situation": {
                oht.type = "core.ItemStateUpdateTrigger";
                oht.configuration.itemName = OpenHabmMR.getItemNameFromOpenHab(getExternalID(trigger.deviceID), trigger.sensorID);
                if(!(trigger.condition.weather).equals("")){
                    oht.configuration.state = trigger.condition.weather;
                }
                if(!(trigger.condition.activity).equals("")){
                    oht.configuration.state = trigger.condition.activity;
                }
                if(!(trigger.condition.trafficsituation).equals("")){
                    oht.configuration.state = trigger.condition.trafficsituation;
                }
                if(trigger.condition.temperature != 0){
                    oht.configuration.state = String.valueOf(trigger.condition.temperature);
                }
                if(!(trigger.condition.operator).equals("") && trigger.condition.temperature != 0){
                    oht.configuration.state = String.valueOf(trigger.condition.temperature);
                    oht.configuration.operator = trigger.condition.operator;
                }
                break;
            }
            case "entitysituation": {


                oht.type = "core.ItemStateChangeTrigger";
                    oht.configuration.itemName = OpenHabmMR.getItemNameFromOpenHab(getExternalID(trigger.deviceID), trigger.sensorID);
                    oht.configuration.state = trigger.condition.state;
                   if(!trigger.condition.command.isEmpty()){
                       oht.configuration.command = trigger.condition.command;
                   }

                break;
            }
            case "system": {
                if(!(trigger.condition.time).equals("")) {
                    oht.type = "timer.TimeOfDayTrigger";
                    oht.configuration.time = trigger.condition.time;
                }else {
                    oht.type = "timer.DayOfWeekTrigger";
                    oht.configuration.days = trigger.condition.days;
                }
                break;
            }
        }
        return oht;
    }

    /**
     * This method checks whether the device and sensor is set for a trigger. This is necessary for a trigger in openHab.
     *
     * @param trigger An internal trigger.
     * @throws PlatformDataProcessingException An exception will be thrown when the deviceID or sensorID is missing.
     */
    public void checkParameters(Trigger trigger) throws PlatformDataProcessingException{
        if(!(trigger.triggerclass).equals("system")){
            if((trigger.deviceID).equals("") || (trigger.sensorID).equals("")){
                throw new PlatformDataProcessingException("The trigger with ID :" +trigger.ID+ " must have a device and a sensor ID.");
            }
        }
    }

    /**
     * This method gets a platform-internal unique ID from the platform.
     *
     * @return Returns the platform-internal ID.
     * @throws PlatformDataProcessingException An exception will be thrown when an error occurs.
     */
    public String getUID() throws PlatformDataProcessingException {
        Response response = RequestHelper.sendGetRequest("uuid", new String[]{}, new Object[]{}, new String[]{}, new Object[]{}, MediaType.APPLICATION_JSON_TYPE);
        return response.readEntity(String.class);
    }

    /**
     * Takes an internal ID of a device and returns the corresponding device.
     *
     * @param deviceID An internal ID of a device.
     * @return Returns a {@link Device}.
     * @throws PlatformDataProcessingException An exception will be thrown when device not found.
     */
    private String getExternalID(String deviceID) throws PlatformDataProcessingException {
        String itemname;
        try {
            itemname = IdTranslator.internalIdToExternalD(deviceID,1);
        } catch (Exception ex) {
            throw new PlatformDataProcessingException("Device for trigger with ID: " + deviceID + " not found.");
        }
        return itemname;
    }
}
