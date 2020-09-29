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
package devicemanager.platforms;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.mongodb.client.MongoCollection;

import devicemanager.Models.*;
import exceptions.*;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import services.UtilityService;


import javax.ws.rs.core.Response;
import java.util.List;

import static com.mongodb.client.model.Filters.eq;
import static services.UtilityService.DEVICESCOLLECTIONSTRING;
import static services.UtilityService.getDatabase;


public abstract class PlatformDeviceManager {
    protected Logger logger;
    protected MongoCollection<Device> devices = getDatabase(UtilityService.PropertyKeys.BACKEND_DATABASE_NAME).getCollection(DEVICESCOLLECTIONSTRING, Device.class);
    protected Response response;
    protected final String FIELDPLATFORMID = "platformId";
    protected final String  FIELDEXTERNALPLATFORMID = "externalPlatformId";
    protected final String FIELDDEVICEID = "deviceId";
    protected final String FIELDUSERID = "userId";
    protected final String FIELDPROJECTID = "projectId";
    protected String userId;
    protected String projectId;
    protected String platformId;




    public PlatformDeviceManager(String userId, String projectId, String platformId) {
        this.userId = userId;
        this.projectId = projectId;
        this.platformId = platformId;
        logger = LogManager.getLogger(PlatformDeviceManager.class);
    }

    /**
     * TODO
     * This method adds a specific devicemanager to a specific platform. The devicemanager information to handle this action remain underspecified at this time.
     * Afterwards the devicemanager should be imported.
     */
    public abstract boolean addDevice(DeviceAddingInfo deviceAddingInfo) throws PlatformDataProcessingException, InvalidIdentificationNumberException, InvalidParameterException, JsonProcessingException;

    /**
     * This method return all available devices on this platform.
     *
     * @return a list with all devices
     * @throws JsonProcessingException, InvalidIdentificationNumberException, PlatformDataProcessingException, InvalidParameterException
     */
    public abstract List<Device> getAllDevices() throws JsonProcessingException, InvalidIdentificationNumberException, PlatformDataProcessingException, InvalidParameterException;

    /**
     * This method accepts an internal identification number and returns the corresponding device.
     *
     * @param internalDeviceId the internal clickdigital identification for a specific device
     * @return returns a device or null if no device matches with the given id
     * @throws DeviceNotFoundException
     */
    public abstract Device getDeviceById(String internalDeviceId) throws DeviceNotFoundException;

    /**
     * This method searches for all devices imported to ClickDigital from this platform which match the given tags and returns them.
     *
     * @param tags
     * @return a list with devices
     * @throws JsonProcessingException
     */
    public abstract List<Device> getDevicesByTag(List<String> tags) throws JsonProcessingException, InvalidIdentificationNumberException, PlatformDataProcessingException, InvalidParameterException;

    /**
     * This method consumpts a platform ID and imports all available devices into the backend
     * database. More precisely an internal  ID is created and stored with its corresponding sensors- and action IDs.
     *
     * @return true, if devices imported successfully, else false
     */
    public abstract boolean importDevices(DeviceAddingInfo deviceAddingInfo) throws JsonProcessingException, PlatformDataProcessingException, InvalidIdentificationNumberException, InvalidParameterException;

    /**
     * This method deletes a device on its corresponding platform and also the link in the click digital backend database.
     *
     * @param internalDeviceId - the device to delete
     * @return true if device was deleted
     * @throws PlatformDataProcessingException, InvalidIdentificationNumberException, DatabaseDataProcessingException
     */
    public abstract boolean deleteDevice(String internalDeviceId) throws PlatformDataProcessingException, InvalidIdentificationNumberException, DatabaseDataProcessingException, InvalidParameterException;

    /**
     * This method changes a state of a specific action.
     *
     * @param valueState - the state or value to which it should switch
     * @throws JsonProcessingException
     */
    public abstract boolean changeActionState(String deviceId, String actionId, int valueState) throws PlatformDataProcessingException, InvalidIdentificationNumberException, InvalidParameterException, IncompatibleItemTypeException, DeviceNotFoundException;

    /**
     * This methods requests an update for the by internalDeviceId given device
     *
     * @param internalDeviceId -the device to update
     * @return an update report consisting of a status (0= failed, 1= succeed, 2= no update available) and an error report.
     * @throws JsonProcessingException
     */
    public abstract UpdateReport updateDevice(String internalDeviceId) throws InvalidIdentificationNumberException;


    /**
     * TODO
     *
     * @param id
     */
    public abstract List<DeviceInfo> searchForDevices(String id) throws PlatformDataProcessingException;

    /**
     * This method return the state or value of an action.
     *
     * @param actionId
     * @param deviceId
     * @return
     */
    public abstract String getActionValueOrState(String actionId, String deviceId) throws InvalidIdentificationNumberException, InvalidParameterException, PlatformDataProcessingException;


    public abstract void setSensorType(String deviceId, String sensorId, String type) throws DatabaseDataProcessingException;

    public abstract void setDeviceType(String deviceId, String type);

    public abstract void setActuatorType(String deviceId, String actuatorId, String type);

    public abstract void setLocation(String deviceId, String location);

    public abstract List<Device> getDevicesBySensorType(String type) throws InvalidIdentificationNumberException, PlatformDataProcessingException, InvalidParameterException, JsonProcessingException;

    public abstract List<Device> getDevicesByActuatorType(String type) throws InvalidIdentificationNumberException, PlatformDataProcessingException, InvalidParameterException, JsonProcessingException;

    public abstract List<Device> getDevicesByLocation(String location) throws InvalidIdentificationNumberException, PlatformDataProcessingException, InvalidParameterException;


}
