package devicemanager.platforms.openHab;

import com.mongodb.client.MongoCursor;
import com.mongodb.client.result.UpdateResult;
import devicemanager.EntityType;
import devicemanager.Models.*;
import devicemanager.Predicates;
import platformmanager.PlatformManager;
import platforms.openHab.Models.*;
import services.IdTranslator;
import devicemanager.platforms.PlatformDeviceManager;
import exceptions.*;
import platforms.openHab.Helper.OpenHabModelRetriever;
import platforms.openHab.Helper.RequestHelper;

import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Updates.set;


public class OpenHabDeviceManager extends PlatformDeviceManager {
    private OpenHabModelRetriever openHabModelRetriever;
    private RequestHelper requestHelper;
    private DeviceConvertHelper deviceConvertHelper;
    public String errorDescription = "";


    public OpenHabDeviceManager(String userId, String projectId, String platformId) throws  PlatformNotFoundException {
        super(userId, projectId, platformId);
        requestHelper= new RequestHelper(new PlatformManager().getConnectionInfo(userId, this.platformId, projectId));
        openHabModelRetriever = new OpenHabModelRetriever(requestHelper);
        deviceConvertHelper = new DeviceConvertHelper(openHabModelRetriever, requestHelper);
    }


    /**
     * {@inheritDoc}
     */
    @Override

    public boolean addDevice(DeviceAddingInfo deviceAddingInfo) throws PlatformDataProcessingException, InvalidIdentificationNumberException, InvalidParameterException{
        Response response= requestHelper.sendPostRequest(
                "inbox",
                new String[]{"thingUID", "approve"},
                new Object[]{deviceAddingInfo.deviceInfo.id, "approve"},
                new String[]{},
                new Object[]{},
                MediaType.TEXT_PLAIN_TYPE,
                deviceAddingInfo.name);

        if(importDevices(deviceAddingInfo))
            return true;
       return false;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public List<Device> getAllDevices() throws InvalidIdentificationNumberException, PlatformDataProcessingException, InvalidParameterException {
        importDevices(new DeviceAddingInfo(platformId));

        List<Device> devices = new ArrayList<>();
        MongoCursor<Device> dbDeviceIterator = this.devices.find(and(eq(FIELDPLATFORMID, platformId), eq(FIELDUSERID, userId), eq(FIELDPROJECTID, projectId))).iterator();
        while (dbDeviceIterator.hasNext()) {

            final Device device = dbDeviceIterator.next();
                devices.add(device);
        }
        return devices;
    }

    /**
     *{@inheritDoc}
     */
    @Override
    public Device getDeviceById(String internalDeviceId) throws DeviceNotFoundException {
        Device device = this.devices.find(and(eq(FIELDDEVICEID, internalDeviceId), eq(FIELDUSERID, userId), eq(FIELDPROJECTID, projectId))).first();
        if (device == null)
            throw new DeviceNotFoundException("Device: "+ internalDeviceId + " was not found in database, try to import devices");
        return device;
    }


    /**
     * {@inheritDoc}
     */
    @Override
    public List<Device> getDevicesByTag(List<String> tags) throws  InvalidIdentificationNumberException, PlatformDataProcessingException, InvalidParameterException {
        return getAllDevices().stream().filter(device -> device.filterTags.stream().anyMatch(tag -> tags.contains(tag))).collect(Collectors.toList());
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public boolean importDevices(DeviceAddingInfo deviceAddingInfo) throws PlatformDataProcessingException, InvalidIdentificationNumberException,  InvalidParameterException {

        List<Thing> things = openHabModelRetriever.getThingsFromOpenHab();

        if (things.isEmpty()) { //TODO throw exception or return true
            errorDescription = "There are no available devices to import";
            return false;
        }


        Device device;
        //add each thing in openhab as device to click digital
        for (int i = 0; i < things.size(); i++) {
            device = new Device();

            // check if id already exists
            String internId = IdTranslator.externalIdToInternalID(platformId, things.get(i).getUID());
            Device isAlreadyInDatabase = this.devices.find(and(eq(FIELDDEVICEID, internId),eq(FIELDUSERID, userId), eq(FIELDPROJECTID, projectId))).first(); //TODO is null obwohl ein eintrag vorhanden ist
            if (isAlreadyInDatabase == null) {
                Channel channel;
                String channelTypeUid;
                ChannelType channelType;

                //go through each channel and add it as action or sensor to a device
                for (int j = 0; j < things.get(i).getChannels().size(); j++) {
                    //go through each channel and decide whether its an action or a sensor
                    channel = things.get(i).getChannels().get(j);

                    channelType = openHabModelRetriever.getChannelTypeFromOpenHab(channel.getChannelTypeUID());

                    //TODO aktuell werden auch bridges importiert vllt. mit if bridgeID is null
                    //TODO total unsicher!!!!!!!!!!!! ich nehm das jetzt mal so an. andere anhaltspunkte habe ich derzeit (23.03.2018) nicht
                    //add sensors
                    if (channelType.getStateDescription() != null && channelType.getStateDescription().isReadOnly()) { //TODO könnte sich hierbei nur um einen sensor handeln
                        device.sensors.add(deviceConvertHelper.convertToSensor(internId, channel.getUid()));

                    }
                    //add ruleActions
                    else //TODO es ist null oder es ist nicht null und readonly ist false
                    {
                        if (channel.getKind().equalsIgnoreCase("state")) //TODO implemented because of events in openhab
                            device.actions.add(deviceConvertHelper.convertToAction(internId, channel.getUid()));
                    }

                }
                //set id
                device.deviceId = internId;
                //set name
                device.name = things.get(i).label;

                //add tags
                for (int l = 0; l < things.get(i).getChannels().size(); l++) {
                    device.filterTags.addAll(((Channel) things.get(i).getChannels().get(l)).getDefaultTags());

                    if (!((Channel) things.get(i).getChannels().get(l)).getLinkedItems().isEmpty()) {

                        //get all available things from openhab
                        //TODO was ist wenn mehere items
                        Item item = openHabModelRetriever.getItemFromOpenHab(things.get(i).getUID(), things.get(i).getChannels().get(l).getUid());

                        if (item.getTags() != null)
                            device.filterTags.addAll(item.getTags());
                    }
                }

                //add tags from newly added device
                if(deviceAddingInfo.tags!= null && !deviceAddingInfo.tags.isEmpty())
                    device.filterTags.addAll(deviceAddingInfo.tags);

                //add protocolls for newly added device
                if(deviceAddingInfo.protocols!=null && !deviceAddingInfo.tags.isEmpty())
                    device.protocols.addAll(deviceAddingInfo.protocols);

                if(deviceAddingInfo.location != null)
                    device.location = deviceAddingInfo.location;


                int status;
                switch (things.get(i).getStatusInfo().status) {
                    case "ONLINE":
                        status = 1;
                        break;
                    case "OFFLINE":
                        status = 0;
                        break;
                    case "INITIALIZING":
                        status = 2;
                        break;
                    case "REMOVING":
                        status = 2;
                        break;
                    default:
                        status = 3;
                        errorDescription = things.get(i).getStatusInfo().statusDetail + " " + things.get(i).getStatusInfo().getDescription();
                        device.errorReport = errorDescription;
                        break;
                }
                device.status = status;
                device.platformId= platformId;
                device.userId= userId;
                device.projectId = projectId;
                this.devices.insertOne(device);

            }

        }

        deleteExcessData();
        return true;
    }

    /**
     * This method compares the ClickDigital Database and deletes all devices that are not available on OpenHab anymore.
     * This case can occur if the user deletes a device on the IoT platform but not on OpenHab.
     * The method is called through {@link this#getAllDevices()}.
     * @throws InvalidIdentificationNumberException
     * @throws InvalidParameterException
     * @throws PlatformDataProcessingException
     */
    public boolean deleteExcessData() throws InvalidIdentificationNumberException, InvalidParameterException, PlatformDataProcessingException {
        MongoCursor<Device> dbDeviceIterator = this.devices.find(and(eq(FIELDPLATFORMID, platformId), eq(FIELDUSERID, userId), eq(FIELDPROJECTID, projectId))).iterator();
        List<Thing> things = openHabModelRetriever.getThingsFromOpenHab();
        while (dbDeviceIterator.hasNext()) {
            boolean canDelete= true;
            final Device device = dbDeviceIterator.next();
            //jedes device aus der datenbank, id holen, übersetzen und checken ob es in der liste von oh things steht
            for(int i=0; i<things.size(); i++){ //für jedes gerät die geräte auf oh prüfen, wenn gefunden: break
                if(things.get(i).UID.equals(IdTranslator.internalIdToExternalD(device.deviceId, 1))) { // wenn gefunden, dann break
                    canDelete=false;
                    break;
                }
            }
            if(canDelete)
                this.devices.deleteOne(eq("deviceId",device.deviceId));


        }
        return true;
    }
    /**
     * {@inheritDoc}
     */
    @Override
    public boolean deleteDevice(String internalDeviceId) throws PlatformDataProcessingException, InvalidIdentificationNumberException, DatabaseDataProcessingException, InvalidParameterException {
        if (!Predicates.isValidId().test(internalDeviceId))
            throw new InvalidIdentificationNumberException("Identification number is null or empty");

        String externalDeviceId = IdTranslator.internalIdToExternalD(internalDeviceId, 1);

        //if there is an database entry but the deletion request is false
        if (this.devices.find(and(eq(FIELDDEVICEID, internalDeviceId), eq(FIELDUSERID, userId), eq(FIELDPROJECTID, projectId))).first() != null &&
                !this.devices.deleteOne(and(eq(FIELDDEVICEID, internalDeviceId), eq(FIELDUSERID, userId), eq(FIELDPROJECTID, projectId))).wasAcknowledged())
            throw new DatabaseDataProcessingException("Error while deletion of device : " + internalDeviceId);

        Thing thing;
        try { // if device is not available anymore return that it was deleted
            thing =openHabModelRetriever.getThingFromOpenHab(externalDeviceId);

        } catch (PlatformDataProcessingException e) {
            if (e.getResponseStatus().equals(Response.Status.NOT_FOUND))
                return true;
            throw e;
        }

        //delete all corresponding items on each channel
        for (int i = 0; i < thing.getChannels().size(); i++) {
            for (int p = 0; p < thing.getChannels().get(i).getLinkedItems().size(); p++) {

                try {
                    response = requestHelper
                            .sendDeleteRequest(
                                    "items",
                                    new String[]{"itemName"},
                                    new Object[]{thing.getChannels().get(i).getLinkedItems().get(p)},
                                    new String[]{},
                                    new Object[]{},
                                    MediaType.APPLICATION_JSON_TYPE);
                } catch (PlatformDataProcessingException e) {
                    if (e.getResponseStatus().equals(Response.Status.NOT_FOUND)) //either the item is not found or not editable, both cases can be ignored and treated as a successful deletion
                        break;
                    throw e;
                }
            }
        }

        //delete thing

        response = requestHelper
                .sendDeleteRequest(
                        "things",
                        new String[]{"thingUID"},
                        new Object[]{externalDeviceId},
                        new String[]{"force"},
                        new Object[]{true},
                        MediaType.APPLICATION_JSON_TYPE);

        return true;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public boolean changeActionState(String deviceId, String actionId, int valueState) throws PlatformDataProcessingException, InvalidIdentificationNumberException, InvalidParameterException, IncompatibleItemTypeException, DeviceNotFoundException {
        Action action= null;
        List<Action> actions=  getDeviceById(deviceId).actions;
        for(Action a: actions){
            if(a.id != null && a.id.equals(actionId))
                action = a;
        }
        if(action == null)
            throw new PlatformDataProcessingException("RuleAction not found");

        //RuleAction action = ruleActions.stream().filter(a ->  a.id.equals(actionId)).findFirst().get();
        String internalDeviceId = deviceId;
        String externalDeviceId = IdTranslator.internalIdToExternalD(internalDeviceId, 1);

        Item item = openHabModelRetriever.getItemFromOpenHab(externalDeviceId, actionId);

        switch (item.getType()) {
            case "Color":
                throw new IncompatibleItemTypeException("Color type Contact is not compatible with ClickDigital");
            case "Contact":

                throw new IncompatibleItemTypeException("Item type Contact is not compatible with ClickDigital");
            case "DateTime":
                throw new IncompatibleItemTypeException("Item type DateTime is not compatible with ClickDigital");
            case "Dimmer":
                //TODO validate input from frontend
                response = requestHelper
                        .sendPostRequest(
                                "items",
                                new String[]{"itemName"},
                                new Object[]{item.getName()},
                                new String[]{},
                                new Object[]{},
                                MediaType.TEXT_PLAIN_TYPE,
                                valueState);

                if (response.getStatus() != 200) {
                    errorDescription = "Error while platform request " + response.getStatusInfo().getReasonPhrase();
                    return false;
                }
                break;
            case "Group":
                throw new IncompatibleItemTypeException("Item Group Contact is not compatible with ClickDigital");
            case "Image":
                errorDescription = "Image Type not implemented yet";
                return false;
            case "Location":
                throw new IncompatibleItemTypeException("Item type Location is not compatible with ClickDigital");
            case "Number":
                //TODO validate input from frontend
                if (!action.valueable) { //states

                    response = requestHelper
                            .sendPostRequest(
                                    "items",
                                    new String[]{"itemName"},
                                    new Object[]{item.getName()},
                                    new String[]{},
                                    new Object[]{},
                                    MediaType.TEXT_PLAIN_TYPE,
                                    valueState);

                    if (response.getStatus() != 200) {
                        errorDescription = "Error while platform request " + response.getStatusInfo().getReasonPhrase();
                        return false;
                    }
                } else { // value or percentage
                    if (action.getValueOption().percentage) { //percentage
                        response = requestHelper
                                .sendPostRequest(
                                        "items",
                                        new String[]{"itemName"},
                                        new Object[]{item.getName()},
                                        new String[]{},
                                        new Object[]{},
                                        MediaType.TEXT_PLAIN_TYPE,
                                        valueState);

                        if (response.getStatus() != 200) {
                            errorDescription = "Error while platform request " + response.getStatusInfo().getReasonPhrase();
                            return false;
                        }
                    } else { //value
                        response = requestHelper
                                .sendPostRequest(
                                        "items",
                                        new String[]{"itemName"},
                                        new Object[]{item.getName()},
                                        new String[]{},
                                        new Object[]{},
                                        MediaType.TEXT_PLAIN_TYPE,
                                        valueState);

                        if (response.getStatus() != 200) {
                            errorDescription = "Error while platform request " + response.getStatusInfo().getReasonPhrase();
                            return false;
                        }

                    }
                }
                break;
            case "Player":
                throw new IncompatibleItemTypeException("Item type Player is not compatible with ClickDigital");
            case "Rollershutter":
                response = requestHelper
                        .sendPostRequest(
                                "items",
                                new String[]{"itemName"},
                                new Object[]{item.getName()},
                                new String[]{},
                                new Object[]{},
                                MediaType.TEXT_PLAIN_TYPE,
                                valueState);

                if (response.getStatus() != 200) {
                    errorDescription = "Error while platform request " + response.getStatusInfo().getReasonPhrase();
                    return false;
                }
                break;
            case "String":
                throw new IncompatibleItemTypeException("Item type String is not compatible with ClickDigital");
            case "Switch":
                String stateSt = "";
                if (valueState == 0)
                    stateSt = "OFF";
                else if (valueState == 1)
                    stateSt = "ON";

                response = requestHelper
                        .sendPostRequest(
                                "items",
                                new String[]{"itemName"},
                                new Object[]{item.getName()},
                                new String[]{},
                                new Object[]{},
                                MediaType.TEXT_PLAIN_TYPE,
                                stateSt);


                if (response.getStatus() != 200) {
                    errorDescription = "Error while platform request " + response.getStatusInfo().getReasonPhrase();
                    return false;
                }
                break;
        }
        return true;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public UpdateReport updateDevice(String internalDeviceId) throws InvalidIdentificationNumberException {
        if (!Predicates.isValidId().test(internalDeviceId))
            throw new InvalidIdentificationNumberException("Identification number is null or empty");

        return new UpdateReport(2);
    }

    /**
     *
     * {@inheritDoc}
     */
    public List<DeviceInfo> searchForDevices(String id) throws PlatformDataProcessingException {
        //send request to openhab to get all installed autoBindings
        List<DeviceInfo> deviceInfos = new ArrayList<>();
        //List<Binding> compatibleBindings= new ArrayList<>();
        //List<String> autoBindings= openHabModelRetriever.getAutoBindings();
        List<Binding> bindings = openHabModelRetriever.getBindings();
       /* for(int i=0; i< bindings.size(); i++){
            if(autoBindings.contains(bindings.get(i).id))
                compatibleBindings.add(bindings.get(i));
        }*/
        for(int i=0; i< bindings.size(); i++){
           Response response =requestHelper.sendPostRequest(
                   "discovery/bindings/",
                   new String[]{"bindingId", "scan"},
                   new Object[]{bindings.get(i).id, "scan"},
                   new String[]{},
                   new Object[]{},
                   MediaType.TEXT_PLAIN_TYPE,
                   "");


        }
        List<InboxThings> inboxThings= openHabModelRetriever.getInboxThings();
        for(int p= 0; p< inboxThings.size(); p++){
            deviceInfos.add(new DeviceInfo(inboxThings.get(p).label, inboxThings.get(p).thingUID));
        }
        return deviceInfos;
    }

    @Override
    /**
     * This method requests the current value or state of an item and returns it.
     */
    public String getActionValueOrState(String actionId, String deviceId) throws InvalidIdentificationNumberException, InvalidParameterException, PlatformDataProcessingException {
        Item item = openHabModelRetriever.getItemFromOpenHab(IdTranslator.internalIdToExternalD(deviceId, 1), actionId);
        switch (item.getType()) {
            case "Color":
                break;
            case "Contact":
                break;
            case "DateTime":
                break;
            case "Dimmer":
                if(item.getState().equals("NULL")){
                    errorDescription="Value wurde nicht initialisiert";
                    return "0";
                }
                else
                    return item.getState();
            case "Group":
                break;
            case "Image":
                break;
            case "Location":
                break;
            case "Number":
                if (item.getStateDescription() != null) { //if there is a StateDescription
                    if(item.getStateDescription().getOptions()!= null) { //if there are options the action consists of states,
                        if(item.getStateDescription().getOptions().isEmpty()){ //but if options are empty the action consits of values with min and max
                            if(item.getState().equals("NULL")){
                                errorDescription="Value wurde nicht initialisiert";
                                return "0";
                            }
                            else
                                return item.getState();
                        }
                        else { //options is not empty so there are states
                            if (item.getState().equals("NULL")) {
                                errorDescription = "State wurde nicht initialisiert";
                                return "0";
                            } else
                                return item.getState();

                        }
                    }

                    else{  //if there are no options the action is a value
                        if(item.getState().equals("NULL")){
                            errorDescription="Value wurde nicht initialisiert";
                            return "0";
                        }
                        else
                            return item.getState();
                    }
                } else { // if there is no state description

                }
                break;
            case "Player":
                break;
            case "Rollershutter":
                if(item.getState().equals("NULL")){
                    errorDescription="Value wurde nicht initialisiert";
                    return "0";
                }
                else
                    return item.getState();
            case "String":
                break;
            case "Switch":
                List<StateOption> stateOptions = Arrays.asList(new StateOption("Off", "Indicates an offline status", 0), new StateOption("ON", "Indicates an online status", 1));


                if(item.getState().equals("NULL")){
                    errorDescription="State wurde nicht initialisiert";
                    return "0";
                }
                else{
                    if(item.getState().equals("ON"))
                        return "1";
                    else
                        return "0";
                }

            default:
                return "";
        }
        return "";
    }

    /**
     * This method translates an openHab Item state into a ClickDigital State representation.
     * @param itemState the item state
     * @return
     */
    public static String itemStateTranslator (String itemState){
        switch (itemState.toUpperCase()){
            case "ON":
                return "1";

            case  "OFF":
                return "0";

             default:
               return itemState;

        }
    }

    @Override
    public void setSensorType(String deviceId, String sensorId, String type) throws DatabaseDataProcessingException {
        //TODO check if type can be setted
        Device device = this.devices.find(and(eq("deviceId", deviceId), eq("userId", userId), eq("projectId", projectId))).first();
        if(device == null){} //throw device not found
        List<Sensor> sensors= device.sensors;
        for(Sensor sensor: sensors){
            if(sensor.id.equals(sensorId)){
                sensor.type= type;
            }
        }

        UpdateResult result = devices.updateOne(and(eq("deviceId", deviceId), eq("userId", userId), eq("projectId", projectId)), set("sensors", sensors));
        if(!result.wasAcknowledged())
            throw new DatabaseDataProcessingException("Error setting sensor type");

    }

    @Override
    public void setActuatorType(String deviceId, String actuatorId, String type){
       /* //TODO check if type can be setted
        Device device = this.devices.find(and(eq("deviceId", deviceId), eq("userId", userId), eq("projectId", projectId))).first();
        if(device == null){} //throw device not found
        List<Action> actions= device.actions;
        for(Action action: actions){
            if(action.id.equals(actuatorId)){
                action.type= type;
            }
        }

        devices.updateOne(and(eq("deviceId", deviceId), eq("userId", userId), eq("projectId", projectId)), set("actions", actions));*/
    }

    @Override
    public void setDeviceType(String deviceId, String type){
        //TODO check if type can be setted
        devices.updateOne(and(eq("deviceId", deviceId), eq("userId", userId), eq("projectId", projectId)), set("type", type));
    }

    @Override
    public void setLocation(String deviceId, String location){
        devices.updateOne(and(eq("deviceId", deviceId), eq("userId", userId), eq("projectId", projectId)), set("location", location));
    }

    @Override
    public List<Device> getDevicesBySensorType(String type) throws InvalidIdentificationNumberException, PlatformDataProcessingException, InvalidParameterException {

        List<Device> devices = new ArrayList<>();
        List<Device> allDevices= getAllDevices();
        for(Device device: allDevices) {
            for(Sensor sensor: device.sensors){
                if(sensor.type != null && sensor.type.equals(type))
                    devices.add(device);
            }


        }
        return devices;
    }

    @Override
    public List<Device> getDevicesByActuatorType(String type) throws InvalidIdentificationNumberException, PlatformDataProcessingException, InvalidParameterException {

        List<Device> devices = new ArrayList<>();
        List<Device> allDevices= getAllDevices();
        for(Device device: allDevices) {
            for(Action action: device.actions){
                if(action.type != null && action.type.equals(type))
                    devices.add(device);
            }


        }
        return devices;
    }

    @Override
    public List<Device> getDevicesByLocation(String location) throws InvalidIdentificationNumberException, PlatformDataProcessingException, InvalidParameterException {

        List<Device> devices = new ArrayList<>();
        MongoCursor<Device> dbDeviceIterator = this.devices.find(and(eq(FIELDPLATFORMID, platformId), eq(FIELDUSERID, userId), eq(FIELDPROJECTID, projectId), eq("location", location))).iterator();
        while (dbDeviceIterator.hasNext()) {

            final Device device = dbDeviceIterator.next();
            devices.add(device);
        }
        return devices;
    }

}
