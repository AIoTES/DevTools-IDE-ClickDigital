/*
* Copyright 2017-2020 Fraunhofer Institute for Computer Graphics Research IGD
*
* Licensed under the GNU AFFERO GENERAL PUBLIC LICENSE, Version 3, 19 November 2007
* You may not use this work except in compliance with the Version 3 Licence.
* You may obtain a copy of the Licence at:
* https://www.gnu.org/licenses/agpl-3.0.html
*
* See the Licence for the specific permissions and limitations under the Licence.
*/
package  devicemanager.platforms.openHab;


import devicemanager.EntityType;
import devicemanager.Models.Action;
import devicemanager.Models.Sensor;
import devicemanager.Models.StateOption;
import devicemanager.Models.ValueOption;
import services.IdTranslator;
import exceptions.InvalidIdentificationNumberException;
import exceptions.InvalidParameterException;
import exceptions.PlatformDataProcessingException;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import platforms.openHab.Helper.OpenHabModelRetriever;
import platforms.openHab.Helper.RequestHelper;
import platforms.openHab.Models.Channel;
import platforms.openHab.Models.Item;
import platforms.openHab.Models.Option;
import platforms.openHab.Models.Thing;

import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.*;

/**
 * This class helps to convert an openHab device to a ClickDigital {@Link Device}
 */
public class DeviceConvertHelper {
    private OpenHabModelRetriever openHabModelRetriever;
    private RequestHelper requestHelper;
    String errorDescription;

    Logger logger = LogManager.getRootLogger();


    public DeviceConvertHelper(OpenHabModelRetriever openHabModelRetriever, RequestHelper requestHelper) {
        this.openHabModelRetriever = openHabModelRetriever;
        this.requestHelper = requestHelper;
    }


    /**
     * Helps to build a ClickDigital {@Link Device} by building a {@Link Sensor} by OpenHab data
     *
     * @param internalDeviceId the id of the device to build
     * @param sensorId         the sensor id of the OpenHab channel
     * @return a {@Link Sensor}
     * @throws PlatformDataProcessingException      if an error occurs on openHab
     * @throws InvalidIdentificationNumberException if an id is invalid
     * @throws InvalidParameterException            if a parameter is invalid
     */
    public Sensor convertToSensor(String internalDeviceId, String sensorId) throws PlatformDataProcessingException, InvalidIdentificationNumberException, InvalidParameterException {
        String externalDeviceId = IdTranslator.internalIdToExternalD(internalDeviceId, 1);

        Thing thing = openHabModelRetriever.getThingFromOpenHab(externalDeviceId);
        List<Channel> channels = thing.getChannels();
        Channel sensorChannel = (channels.stream().
                filter(c -> c.getUid().equals(sensorId)).
                findAny().orElse(null));


        if (sensorChannel == null) {
            errorDescription = "channel is null";
            return null;
        }
        if (sensorChannel.getLinkedItems().isEmpty()) {

            String uid = openHabModelRetriever.generateOpenHabUUID();

            //TODO use unique item name, cause its an id
            String itemName = "";

            itemName = (sensorChannel.getUid() + UUID.randomUUID()).replaceAll("[^A-Za-z0-9]", "");


            Response response = requestHelper
                    .sendPutRequest(
                            "links",
                            new String[]{"itemName", "channelUID"},
                            new Object[]{itemName, sensorChannel.getUid()},
                            new String[]{},
                            new Object[]{},
                            MediaType.APPLICATION_JSON_TYPE,
                            "");


            if (response.getStatus() != 200)
                throw new PlatformDataProcessingException();

            //wenn das item generiert wurde muss der channel mit der neuen verlinkung neu geladen werden
            return convertToSensor(internalDeviceId, sensorId);
        }

        return new Sensor(sensorId, sensorChannel.getLabel(), null);
    }

    /**
     * Helps to build a ClickDigital {@link devicemanager.Models.Device} by building an {@link Action} by OpenHab data
     *
     * @param internalDeviceId the id of the device to build
     * @param actionId         the action id of the OpenHab channel
     * @return a {@link Action}
     * @throws PlatformDataProcessingException
     * @throws InvalidIdentificationNumberException
     * @throws InvalidParameterException
     */
    public Action convertToAction(String internalDeviceId, String actionId) throws PlatformDataProcessingException, InvalidIdentificationNumberException, InvalidParameterException {
        String externalDeviceId = IdTranslator.internalIdToExternalD(internalDeviceId, 1);

        Thing thing = openHabModelRetriever.getThingFromOpenHab(externalDeviceId);
        List<Channel> channels = thing.getChannels();

        Channel actionChannel = ((Optional<Channel>) channels.stream().
                filter(c -> c.getUid().equals(actionId)).
                findFirst()).get();

        if (actionChannel == null) {
            errorDescription = "channel is null";
            return null;
        }

        // TODO check if auto linking hat auswirkungen
        if (actionChannel.getLinkedItems().isEmpty()) {


            String uid = openHabModelRetriever.generateOpenHabUUID();

            //TODO use unique item name, cause its an id
            String itemName = "";

            itemName = (actionChannel.getUid() + UUID.randomUUID()).replaceAll("[^A-Za-z0-9]", "");


            Response response = requestHelper
                    .sendPutRequest(
                            "links",
                            new String[]{"itemName", "channelUID"},
                            new Object[]{itemName, actionChannel.getUid()},
                            new String[]{},
                            new Object[]{},
                            MediaType.APPLICATION_JSON_TYPE,
                            "");


            if (response.getStatus() != 200)
                throw new PlatformDataProcessingException();

            //wenn das item generiert wurde muss der channel mit der neuen verlinkung neu geladen werden
            return convertToAction(internalDeviceId, actionId);
        }


        Item item = openHabModelRetriever.getItemFromOpenHab(externalDeviceId, actionChannel.getUid());

        Action action = new Action();

        double value;
        int state;
        ValueOption valueOption;
        switch (item.getType()) {
            case "Color":
                action.errorReport = "Color Type not implemented yet";
                break;
            case "Contact":
                action.errorReport = "Contact Type can only be a sensor";
                break;
            case "DateTime":
                action.errorReport = "DateTime Type not implemented yet";
                break;
            case "Dimmer":

                if (item.getState().equals("NULL")) {
                    errorDescription = "Value wurde nicht initialisiert";
                    value = 0;
                } else
                    value = Double.valueOf(item.getState());


                valueOption = new ValueOption(true);
                action = new Action(actionId, actionChannel.getLabel(), internalDeviceId, valueOption, value, errorDescription);
                action.type = EntityType.ActuatorType.Dimmer.toString();
                break;
            case "Group":
                action.errorReport = "Group Type not implemented yet";
                break;
            case "Image":
                action.errorReport = "Image Type not implemented yet";
                break;
            case "Location":
                action.errorReport = "Location Type not implemented yet";
                break;
            case "Number":
                if (item.getStateDescription() != null) { //if there is a StateDescription
                    if (item.getStateDescription().getOptions() != null) { //if there are options the action consists of states,
                        if (item.getStateDescription().getOptions().isEmpty()) { //but if options are empty the action consits of values with min and max
                            valueOption = new ValueOption(Double.valueOf(item.getStateDescription().getMinimum()), Double.valueOf(item.getStateDescription().getMaximum()), false);
                            if (item.getState().equals("NULL")) {
                                errorDescription = "Value wurde nicht initialisiert";
                                value = 0;
                            } else
                                value = Double.valueOf(item.getState());

                            action = new Action(actionId, actionChannel.getLabel(), internalDeviceId, valueOption, value, errorDescription);
                        } else { //options is not empty so there are states
                            List<StateOption> stateOptions = new ArrayList<>();
                            Option option;
                            for (int i = 0; i < item.getStateDescription().getOptions().size(); i++) { //TODO if options is empty check for min and max
                                option = item.getStateDescription().getOptions().get(i);
                                stateOptions.add(new StateOption("State " + String.valueOf(i), option.getLabel(), Integer.parseInt(option.getValue())));
                            }

                            if (item.getState().equals("NULL")) {
                                errorDescription = "State wurde nicht initialisiert";
                                state = 0;
                            } else
                                state = Double.valueOf(item.getState()).intValue();
                            action = new Action(actionId, actionChannel.getLabel(), internalDeviceId, stateOptions, state, errorDescription);
                            action.type= EntityType.ActuatorType.Command.toString();
                        }
                    } else {  //if there are no options the action is a value
                        valueOption = new ValueOption(Double.valueOf(item.getStateDescription().getMinimum()), Double.valueOf(item.getStateDescription().getMaximum()), false);

                        if (item.getState().equals("NULL")) {
                            errorDescription = "Value wurde nicht initialisiert";
                            value = 0;
                        } else
                            value = Double.valueOf(item.getState());

                        action = new Action(actionId, actionChannel.getLabel(), internalDeviceId, valueOption, value, errorDescription);
                        action.type= EntityType.ActuatorType.Command.toString();
                    }
                } else { // if there is no state description
                    //TODO check if it could be any state number
                    errorDescription = "Error while getting state and value information: Too less information to decide wether its a state or a value: " + item.getName();
                    action = new Action(actionId, actionChannel.getLabel(), internalDeviceId, errorDescription);
                }
                break;
            case "Player":
                action.errorReport = "Player Type not implemented yet";
                break;
            case "Rollershutter":
                if (item.getState().equals("NULL")) {
                    errorDescription = "Value wurde nicht initialisiert";
                    value = 0;
                } else
                    value = Double.valueOf(item.getState());
                action = new Action(actionId, actionChannel.getLabel(), internalDeviceId, new ValueOption(true), value, errorDescription);
                break;
            case "String":
                action.errorReport = "String Type not implemented yet";
                break;
            case "Switch":
                List<StateOption> stateOptions = Arrays.asList(new StateOption("Off", "Indicates an offline status", 0), new StateOption("ON", "Indicates an online status", 1));


                if (item.getState().equals("NULL")) {
                    errorDescription = "State wurde nicht initialisiert";
                    state = 0;
                } else {
                    if (item.getState().equals("ON"))
                        state = 1;
                    else
                        state = 0;
                }


                action = new Action(actionId, actionChannel.getLabel(), internalDeviceId, stateOptions, state, errorDescription);
                action.type= EntityType.ActuatorType.Switch.toString();
                break;

            default:
                return null;
        }


        return action;
    }

}
