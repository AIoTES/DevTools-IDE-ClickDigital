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
package devicemanager.platforms.aiotessil;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.mongodb.client.MongoCursor;
import devicemanager.Models.*;
import devicemanager.platforms.PlatformDeviceManager;
import exceptions.*;
import platformmanager.PlatformManager;
import platforms.aiotessil.RequestHelper;
import platforms.aiotessil.models.DeviceIds;
import platforms.aiotessil.models.Platform;
import platforms.aiotessil.models.PlatformCreateDeviceInput;
import platforms.aiotessil.models.Subscription;
import services.IdTranslator;

import javax.ws.rs.core.GenericType;
import javax.ws.rs.core.MediaType;
import java.util.ArrayList;
import java.util.List;

import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Updates.set;

public class AiotesSilDeviceManager extends PlatformDeviceManager {
    private RequestHelper requestHelper;


    public AiotesSilDeviceManager(String userId, String projectId, String platformId) {
        super(userId, projectId, platformId);
        PlatformManager platformManager = new PlatformManager();
        try {
            requestHelper = new RequestHelper(platformManager.getConnectionInfo(userId, platformId, projectId));
        } catch (PlatformNotFoundException e) {
            e.printStackTrace();
        }


    }

    @Override
    public boolean addDevice(DeviceAddingInfo deviceAddingInfo) throws PlatformDataProcessingException, InvalidIdentificationNumberException, InvalidParameterException, JsonProcessingException {
        ArrayList<platforms.aiotessil.models.Device> devices = new ArrayList<platforms.aiotessil.models.Device>();
        String externalPlatformId = IdTranslator.deserializePlatformId(deviceAddingInfo.platformId)[0];
        devices.add(new platforms.aiotessil.models.Device(deviceAddingInfo.externalDeviceId, externalPlatformId, deviceAddingInfo.name));

        requestHelper.sendPostRequest("/devices", "Client-ID", projectId,
                new String[]{},
                new Object[]{},
                new String[]{},
                new Object[]{},
                MediaType.APPLICATION_JSON_TYPE, new PlatformCreateDeviceInput(devices));

        importDevices(new DeviceAddingInfo());


        // add new device subscription for new device
        DeviceIds deviceIds = new DeviceIds();
        deviceIds.deviceIds.add(deviceAddingInfo.externalDeviceId);
        requestHelper.sendPostRequest("/subscriptions", "Client-ID", projectId,
                new String[]{},
                new Object[]{},
                new String[]{},
                new Object[]{},
                MediaType.APPLICATION_JSON_TYPE,
                deviceIds
        );
        return true;
    }

    @Override
    public List<Device> getAllDevices() throws JsonProcessingException, InvalidIdentificationNumberException, PlatformDataProcessingException, InvalidParameterException {
        importDevices(null);
        List<Device> devices = new ArrayList<>();
        MongoCursor<Device> dbDeviceIterator = this.devices.find(and(eq(FIELDPLATFORMID, platformId), eq(FIELDUSERID, userId), eq(FIELDPROJECTID, projectId))).iterator();
        while (dbDeviceIterator.hasNext())
            devices.add(dbDeviceIterator.next());
        return devices;
    }

    @Override
    public Device getDeviceById(String internalDeviceId) throws DeviceNotFoundException {
        Device device = this.devices.find(and(eq(FIELDDEVICEID, internalDeviceId), eq(FIELDUSERID, userId), eq(FIELDPROJECTID, projectId))).first();
        if (device == null)
            throw new DeviceNotFoundException("Device: " + internalDeviceId + " was not found in database, try to import devices");
        return device;
    }

    @Override
    public List<Device> getDevicesByTag(List<String> tags) throws JsonProcessingException, InvalidIdentificationNumberException, PlatformDataProcessingException, InvalidParameterException {
        return new ArrayList<>();
    }

    //Each aiotes device is added as a single device in click digital and has either a sensor or an actuator
    @Override
    public boolean importDevices(DeviceAddingInfo deviceAddingInfo) throws JsonProcessingException, PlatformDataProcessingException, InvalidIdentificationNumberException, InvalidParameterException {
        List<platforms.aiotessil.models.Device> aiotesDevices =
                requestHelper.sendGetRequest("/devices", "Client-ID", projectId, new String[]{}, new Object[]{}, new String[]{"platformId"}, new String[]{IdTranslator.deserializePlatformId(platformId)[0]}, MediaType.APPLICATION_JSON_TYPE).readEntity(new GenericType<List<platforms.aiotessil.models.Device>>() {
                });


        for (platforms.aiotessil.models.Device aiotesDevice : aiotesDevices) {
            String internalDeviceId = IdTranslator.externalIdToInternalID(platformId, aiotesDevice.deviceId);
            Device dbDevice = this.devices.find(and(eq(FIELDPLATFORMID, platformId), eq(FIELDUSERID, userId), eq(FIELDPROJECTID, projectId), eq(FIELDDEVICEID, internalDeviceId))).first();
            if (dbDevice == null) {
                // Device device = new Device(internalDeviceId, aiotesDevice.name, platformId, userId, projectId);
                Device device = new Device();
                device.userId = userId;
                device.projectId = projectId;
                device.platformId = platformId;
                device.name = aiotesDevice.name;
                device.deviceId = internalDeviceId;
                if (aiotesDevice.deviceTypes.size() > 2) {
                    logger.info("Attention: Device type size changed.");
                }

                switch (aiotesDevice.deviceTypes.get(0)) {
                    case "SENSOR":
                        logger.info("Identified as sensor");
                        device.sensors.add(new Sensor(aiotesDevice.deviceId, aiotesDevice.name, null));
                        break;
                    case "ACTUATOR":
                        logger.info("Identified as actuator");
                        device.actions.add(new Action(aiotesDevice.deviceId, aiotesDevice.name, internalDeviceId, ""));
                        break;
                    case "DEVICE":
                        logger.info("Identified as device");
                        logger.info("But defined as sensor because of missing declaration from sil team");
                        device.sensors.add(new Sensor(aiotesDevice.deviceId, aiotesDevice.name, null));
                        break;
                    default:
                        logger.error("Not identification possible.");
                        return false;

                }

                this.devices.insertOne(device);
            }
        }

        return false;
    }

    @Override
    public boolean deleteDevice(String internalDeviceId) throws PlatformDataProcessingException, InvalidIdentificationNumberException, DatabaseDataProcessingException, InvalidParameterException {
        String externalDeviceId = IdTranslator.internalIdToExternalD(internalDeviceId, 1);

        if (this.devices.find(and(eq(FIELDDEVICEID, internalDeviceId), eq(FIELDUSERID, userId), eq(FIELDPROJECTID, projectId))).first() != null &&
                !this.devices.deleteOne(and(eq(FIELDDEVICEID, internalDeviceId), eq(FIELDUSERID, userId), eq(FIELDPROJECTID, projectId))).wasAcknowledged())
            throw new DatabaseDataProcessingException("Error while deletion of device : " + internalDeviceId);

        requestHelper.sendDeleteRequest("/devices", "Client-ID", projectId,
                new String[]{"deviceId"},
                new Object[]{externalDeviceId},
                new String[]{},
                new Object[]{},
                MediaType.APPLICATION_JSON_TYPE
        );

        List<platforms.aiotessil.models.Subscription> subscribedDevices = null;
        //send a request to gather all device subscriptions regarding to this client
        try {
            subscribedDevices = requestHelper.sendGetRequest(
                    "/subscriptions",
                    "Client-ID",
                    projectId,
                    new String[]{},
                    new Object[]{},
                    new String[]{"clientId"},
                    new Object[]{projectId},
                    MediaType.APPLICATION_JSON_TYPE).readEntity(new GenericType<List<platforms.aiotessil.models.Subscription>>() {
            });
        } catch (PlatformDataProcessingException e) {
            e.printStackTrace();
            return false;
        }

        if (subscribedDevices != null)
            for (Subscription subscribedDevice : subscribedDevices) { //delete the subscription on aiotes
                if (subscribedDevice.deviceIds.contains(externalDeviceId))
                    requestHelper.sendDeleteRequest(
                            "/subscriptions",
                            "Client-ID",
                            projectId,
                            new String[]{},
                            new Object[]{},
                            new String[]{"conversationId"},
                            new Object[]{subscribedDevice.conversationId},
                            MediaType.APPLICATION_JSON_TYPE).readEntity(new GenericType<List<platforms.aiotessil.models.Subscription>>() {
                    });
            }
        return true;
    }

    @Override
    public boolean changeActionState(String deviceId, String actionId, int valueState) throws PlatformDataProcessingException, InvalidIdentificationNumberException, InvalidParameterException, IncompatibleItemTypeException, DeviceNotFoundException {
        //TODO /devices/{devicId}/actuation with body {@link ActuationInput} gather all information build the object and send the request


        requestHelper.sendPostRequest("/devices", "Client-ID", projectId,
                new String[]{},
                new Object[]{},
                new String[]{},
                new Object[]{},
                MediaType.APPLICATION_JSON_TYPE, null); //TODO add entity actuationinput

        return false;
    }

    @Override
    public UpdateReport updateDevice(String internalDeviceId) throws InvalidIdentificationNumberException {
        return new UpdateReport(0);
    }

    @Override
    public List<DeviceInfo> searchForDevices(String id) throws PlatformDataProcessingException {
        return new ArrayList<>();
    }

    @Override
    public String getActionValueOrState(String actionId, String deviceId) throws InvalidIdentificationNumberException, InvalidParameterException, PlatformDataProcessingException {
        return "";
    }

    @Override
    public void setSensorType(String deviceId, String sensorId, String type) {
        //TODO check if type can be set
        Device device = this.devices.find(and(eq("deviceId", deviceId), eq("userId", userId), eq("projectId", projectId))).first();
        if (device == null) {
        } //throw device not found
        List<Sensor> sensors = device.sensors;
        for (Sensor sensor : sensors) {
            if (sensor.id.equals(sensorId)) {
                sensor.type = type;
            }
        }

        devices.updateOne(and(eq("deviceId", deviceId), eq("userId", userId), eq("projectId", projectId)), set("sensors", sensors));
    }

    @Override
    public void setDeviceType(String deviceId, String type) {
        //TODO check if type can be setted
        devices.updateOne(and(eq("deviceId", deviceId), eq("userId", userId), eq("projectId", projectId)), set("type", type));
    }

    @Override
    public void setActuatorType(String deviceId, String actuatorId, String type) {
       /* Device device = this.devices.find(and(eq("deviceId", deviceId), eq("userId", userId), eq("projectId", projectId))).first();
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
    public void setLocation(String deviceId, String location) {
        devices.updateOne(and(eq("deviceId", deviceId), eq("userId", userId), eq("projectId", projectId)), set("location", location));
    }

    @Override
    public List<Device> getDevicesBySensorType(String type) throws InvalidIdentificationNumberException, PlatformDataProcessingException, InvalidParameterException, JsonProcessingException {

        List<Device> devices = new ArrayList<>();
        List<Device> allDevices = getAllDevices();
        for (Device device : allDevices) {
            for (Sensor sensor : device.sensors) {
                if (sensor.type != null && sensor.type.equals(type))
                    devices.add(device);
            }


        }
        return devices;
    }

    @Override
    public List<Device> getDevicesByActuatorType(String type) throws InvalidIdentificationNumberException, PlatformDataProcessingException, InvalidParameterException, JsonProcessingException {

        List<Device> devices = new ArrayList<>();
        List<Device> allDevices = getAllDevices();
        for (Device device : allDevices) {
            for (Action action : device.actions) {
                if (action.type != null && action.type.equals(type))
                    devices.add(device);
            }


        }
        return devices;
    }

    @Override
    public List<Device> getDevicesByLocation(String location) throws InvalidIdentificationNumberException, PlatformDataProcessingException, InvalidParameterException {

        List<Device> devices = new ArrayList<>();
        MongoCursor<Device> dbDeviceIterator = this.devices.find(and(eq(FIELDPLATFORMID, PlatformManager.AIOTESSILID), eq(FIELDUSERID, userId), eq(FIELDPROJECTID, projectId), eq("location", location))).iterator();
        while (dbDeviceIterator.hasNext()) {

            final Device device = dbDeviceIterator.next();
            devices.add(device);
        }
        return devices;
    }

    /**
     * This method cleans all subscription for the specific project (client)
     */
    public void cleanSubscriptions() throws PlatformDataProcessingException {
        List<platforms.aiotessil.models.Subscription> subscribedDevices = null;
        //send a request to gather all device subscriptions regarding to this client
        try {
            subscribedDevices = requestHelper.sendGetRequest(
                    "/subscriptions",
                    "Client-ID",
                    projectId,
                    new String[]{},
                    new Object[]{},
                    new String[]{"clientId"},
                    new Object[]{projectId},
                    MediaType.APPLICATION_JSON_TYPE).readEntity(new GenericType<List<platforms.aiotessil.models.Subscription>>() {
            });
        } catch (PlatformDataProcessingException e) {
            e.printStackTrace();
        }

        if (subscribedDevices != null)
            for (Subscription subscribedDevice : subscribedDevices) {
                requestHelper.sendDeleteRequest(
                        "/subscriptions",
                        "Client-ID",
                        projectId,
                        new String[]{"conversationId"},
                        new Object[]{subscribedDevice.conversationId},
                        new String[]{},
                        new Object[]{},
                        MediaType.APPLICATION_JSON_TYPE);
            }

    }
}
