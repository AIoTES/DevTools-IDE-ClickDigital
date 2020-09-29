package devicemanager;

import acpmanager.logfilter.Log;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoCursor;
import com.mongodb.client.result.DeleteResult;
import devicemanager.Models.*;

import java.io.IOException;
import java.util.*;

import devicemanager.platforms.PlatformDeviceManagerFactory;
import devicemanager.platforms.aiotessil.AiotesSilDeviceManager;
import exceptions.*;
import org.apache.logging.log4j.Level;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import platformmanager.Platform;
import platformmanager.PlatformManager;
import services.IdTranslator;
import services.LogConstants;
import services.UtilityService;
import usermanager.UserManager;
import usersessionmanager.UserSessionManager;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import java.util.List;

import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.eq;
import static platformmanager.PlatformManager.TAG_PLATFORMID;
import static services.UtilityService.DEVICESCOLLECTIONSTRING;
import static services.UtilityService.getDatabase;
import static usermanager.UserManager.TAG_USERID;


/**
 * This class represents a devicemanager manager. Through this devicemanager manager other classes e.g. RuleManager or Frontend can access devices and their corresponding sensors and actuators.
 * This class provides a REST interface as well as it connects to some IOT platform to gather devicemanager data, sensor data, actuators states et cetera.
 */

@Path("/devicemanager")
public class DeviceManager {

    private UserSessionManager userSessionManager = new UserSessionManager();
    private MongoCollection<Device> devices = getDatabase(UtilityService.PropertyKeys.BACKEND_DATABASE_NAME).getCollection(DEVICESCOLLECTIONSTRING, Device.class);
    private final static Logger logger = LogManager.getLogger(UserManager.class.getName());

    //TODO newest version

    /**
     * a factory which produces the corresponding {@Link PlatformDeviceManager}
     */
    private PlatformDeviceManagerFactory platformDeviceManagerFactory = new PlatformDeviceManagerFactory();
    private List<Platform> platforms;


    public DeviceManager() {
        platformDeviceManagerFactory = new PlatformDeviceManagerFactory();
    }


    /**
     * This method accepts an internal identification number and returns the corresponding device.
     *
     * @param internalDeviceID the internal clickdigital identification for a specific device
     * @return returns a device or null if no device matches with the given id
     * @throws DeviceNotFoundException, InvalidIdentificationNumberException, InvalidParameterException, PlatformNotFoundException
     */

    @Path("{userId}/{projectId}/getDeviceById")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Device getDeviceByID(@QueryParam("internalDeviceId") String internalDeviceID, @PathParam("userId") String userId, @PathParam("projectId") String projectId, @Context HttpServletRequest request, @Context HttpServletResponse response) throws DeviceNotFoundException, InvalidIdentificationNumberException, InvalidParameterException, PlatformNotFoundException, IOException, InvalidSessionException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);

        String id = IdTranslator.internalIdToExternalD(internalDeviceID, 0);
        return platformDeviceManagerFactory.getPlatformDeviceManager(id, userId, projectId).getDeviceById(internalDeviceID);
    }

    @Path("{userId}/{projectId}/getAllDevicesByPlatform")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public List<Device> getAllDevicesByPlatform(@QueryParam("platformId") String platformId, @PathParam("userId") String userId, @PathParam("projectId") String projectId, @Context HttpServletRequest request, @Context HttpServletResponse response) throws InvalidSessionException {
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);

        return getAllDevicesByPlatform(platformId, userId, projectId);
    }

    public List<Device> getAllDevicesByPlatform(String platformId, String userId, String projectId) {

        MongoCursor<Device> deviceMongoCursor = this.devices.find(and(eq("userId", userId), eq("projectId", projectId), eq("platformId", platformId))).iterator();
        List<Device> result = new ArrayList<>();
        while (deviceMongoCursor.hasNext()) {
            result.add(deviceMongoCursor.next());
        }
        return result;
    }



    /**
     * This method searches for all devices imported to ClickDigital which match the given tags and returns them.
     *
     * @param tags
     * @return a list with devices
     * @throws JsonProcessingException, DeviceNotFoundException, PlatformNotFoundException, InvalidIdentificationNumberException, PlatformDataProcessingException
     */
    @Path("{userId}/{projectId}/getDevicesByTag")
    @Produces(MediaType.APPLICATION_JSON)
    @GET
    public List<Device> getDevicesByTag(@QueryParam("tags") List<String> tags, @PathParam("userId") String userId, @PathParam("projectId") String projectId, @Context HttpServletRequest request, @Context HttpServletResponse response) throws IOException, PlatformNotFoundException, InvalidIdentificationNumberException, PlatformDataProcessingException, InvalidParameterException, InvalidSessionException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);


        List<Device> devices = new ArrayList<>();
        for (int i = 0; i < platforms.size(); i++)
            devices.addAll(platformDeviceManagerFactory.getPlatformDeviceManager(platforms.get(i).platformId, userId, projectId).getDevicesByTag(tags));
        return devices;
    }

    @Path("{userId}/{projectId}/getDevicesByEntityType")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public List<Device> getDeviceByEntityType(@PathParam("userId") String userId, @PathParam("projectId") String projectId, @QueryParam("type") String type, @Context HttpServletRequest request, @Context HttpServletResponse response) throws InvalidSessionException {

        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);

        ArrayList<Device> allDevices = new ArrayList<>();
        ArrayList<Device> result = new ArrayList<>();
        MongoCursor<Device> deviceMongoCursor = this.devices.find(and(eq("userId", userId), eq("projectId", projectId))).iterator();

        while (deviceMongoCursor.hasNext()) {
            allDevices.add(deviceMongoCursor.next());
        }
        for (Device device : allDevices) {
            for (Sensor sensor : device.sensors) {
                if (sensor.type != null && sensor.type.equals(type))
                    if(result.stream().noneMatch(x -> x.deviceId.equals(device.deviceId)))
                        result.add(device);
            }
            for (Action action : device.actions) {
                if (action.type != null && action.type.equals(type))
                    if(result.stream().noneMatch(x -> x.deviceId.equals(device.deviceId)))
                        result.add(device);
            }

        }
        return result;
    }


    /**
     * This method returns all available devices which are imported to ClickDigital
     *
     * @return a list with all devices
     * @throws JsonProcessingException
     * @throws PlatformNotFoundException
     * @throws InvalidIdentificationNumberException
     * @throws PlatformDataProcessingException
     * @throws InvalidParameterException
     */
    @Path("{userId}/{projectId}/getAllDevices")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public List<Device> getAllDevicesREST(@PathParam("userId") String userId, @PathParam("projectId") String projectId, @Context HttpServletRequest request, @Context HttpServletResponse response) throws IOException, PlatformNotFoundException, InvalidIdentificationNumberException, PlatformDataProcessingException, InvalidParameterException, InvalidSessionException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);

        return getAllDevices(userId, projectId);
    }

    /**
     * This method returns all available devices which are imported to ClickDigital
     *
     * @return a list with all devices
     * @throws JsonProcessingException
     * @throws PlatformNotFoundException
     * @throws InvalidIdentificationNumberException
     * @throws PlatformDataProcessingException
     * @throws InvalidParameterException
     */
    public List<Device> getAllDevices(String userId, String projectId) throws IOException, PlatformNotFoundException, InvalidIdentificationNumberException, PlatformDataProcessingException, InvalidParameterException {

        List<Device> devices = new ArrayList<>();
        platforms = new PlatformManager().getConnectedPlatforms(userId, projectId);
        for (int i = 0; i < platforms.size(); i++)
            devices.addAll(platformDeviceManagerFactory.getPlatformDeviceManager(platforms.get(i).platformId, userId, projectId).getAllDevices());
        return devices;
    }


    /**
     * This method adds a specific devicemanager to a specific platform. The devicemanager information to handle this action remain underspecified at this time.
     * Afterwards the devicemanager should be imported.
     */
    @Path("{userId}/{projectId}/addDevice")
    @POST
    @Consumes("application/json")
    @Produces("application/json")
    public boolean addDevice(DeviceAddingInfo deviceAddingInfo, @PathParam("userId") String userId, @PathParam("projectId") String projectId, @Context HttpServletRequest request, @Context HttpServletResponse response) throws PlatformNotFoundException, PlatformDataProcessingException, InvalidIdentificationNumberException, InvalidParameterException, IOException, InvalidSessionException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);
        return platformDeviceManagerFactory.getPlatformDeviceManager(deviceAddingInfo.platformId, userId, projectId).addDevice(deviceAddingInfo);
    }

    /**
     * This method deletes a device on its corresponding platform and also the link in the click digital backend database.
     *
     * @param internalDeviceID - the device to delete
     * @return true, if device was deleted, else false
     * @throws JsonProcessingException
     * @throws PlatformNotFoundException
     * @throws InvalidIdentificationNumberException
     * @throws PlatformDataProcessingException
     * @throws InvalidParameterException
     */
    @Path("{userId}/{projectId}/deleteDevice")
    @DELETE
    @Consumes("application/json")
    @Produces("text/plain")
    public boolean deleteDevice(@QueryParam("internalDeviceId") String internalDeviceID, @PathParam("userId") String userId, @PathParam("projectId") String projectId, @Context HttpServletRequest request, @Context HttpServletResponse response) throws IOException, PlatformNotFoundException, InvalidIdentificationNumberException, PlatformDataProcessingException, DatabaseDataProcessingException, InvalidParameterException, InvalidSessionException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);

        return platformDeviceManagerFactory.getPlatformDeviceManager(IdTranslator.internalIdToExternalD(internalDeviceID, 0), userId, projectId).deleteDevice(internalDeviceID);
    }

    /**
     * This method changes a state of a specific action.
     *
     * @param valueState - the state or value to which it should switch
     * @return true, if state was changed
     * @throws PlatformNotFoundException
     * @throws InvalidIdentificationNumberException
     * @throws PlatformDataProcessingException
     * @throws InvalidParameterException
     */
    @GET
    @Path("{userId}/{projectId}/{deviceId}/{entityId}/changeActionState")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public boolean changeActionState(@QueryParam("valueState") int valueState,
                                     @PathParam("userId") String userId,
                                     @PathParam("projectId") String projectId,
                                     @PathParam("deviceId") String deviceId,
                                     @PathParam("entityId") String entityId,
                                     @Context HttpServletRequest request,
                                     @Context HttpServletResponse response) throws PlatformNotFoundException, InvalidIdentificationNumberException, PlatformDataProcessingException, InvalidParameterException, IncompatibleItemTypeException, IOException, DeviceNotFoundException, InvalidSessionException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);

        return platformDeviceManagerFactory.getPlatformDeviceManager(IdTranslator.internalIdToExternalD(deviceId, 0), userId, projectId).changeActionState(deviceId, entityId, valueState);
    }

    /**
     * This method tries to disconnect all devices from ClickDigital referenced with a platform. It defers from {@link this#deleteDevice(String, String, String, HttpServletRequest, HttpServletResponse)} as it does not delete
     * the device on the platform.
     * @param platformId the id of the platform from where the devices are disconnected
     * @param userId the id of the user
     * @param projectId the id of the project
     */
    public void disconnectDevices(String platformId, String userId, String projectId) throws InvalidIdentificationNumberException, InvalidParameterException, DatabaseDataProcessingException, PlatformDataProcessingException {

        long amountOfDevices = devices.count(eq(TAG_PLATFORMID, platformId));

        DeleteResult deleteResult = devices.deleteMany(and(eq(TAG_PLATFORMID, platformId), eq(TAG_USERID, userId), eq("projectId", projectId)));

        if(!(deleteResult!= null && deleteResult.getDeletedCount() == amountOfDevices)){
            String userString= UtilityService.getUserString(userId, null);
            logger.log(Level.ERROR, (new Log(userString, LogConstants.DISCONNECT_DEVICE, userString, LogConstants.FAILED)).toString());
            throw new DatabaseDataProcessingException("Error occured while disconnecting devices from ClickDigital");
        }



    }


    /**
     * This methods requests an update for the by internalDeviceId given device
     *
     * @param internalDeviceId -the device to update
     * @return an update report consisting of a status (0= failed, 1= succeed, 2= no update available) and an error report.
     * @throws PlatformNotFoundException
     * @throws InvalidIdentificationNumberException
     * @throws InvalidParameterException
     */
    @Path("{userId}/{projectId}/updateDevice")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public UpdateReport updateDevice(@QueryParam("internalDeviceId") String internalDeviceId, @PathParam("userId") String userId, @PathParam("projectId") String projectId, @Context HttpServletRequest request, @Context HttpServletResponse response) throws PlatformNotFoundException, InvalidIdentificationNumberException, InvalidParameterException, IOException, InvalidSessionException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);

        return platformDeviceManagerFactory.getPlatformDeviceManager(IdTranslator.internalIdToExternalD(internalDeviceId, 0), userId, projectId).updateDevice(internalDeviceId);
    }


    /**
     * TODO
     */
    @GET
    @Path("{userId}/{projectId}/searchForDevices")
    @Produces(MediaType.APPLICATION_JSON)
    public List<DeviceInfo> searchForDevices(@QueryParam("platformId") String platformId, @PathParam("userId") String userId, @PathParam("projectId") String projectId, @Context HttpServletRequest request, @Context HttpServletResponse response) throws PlatformNotFoundException, PlatformDataProcessingException, InvalidParameterException, IOException, InvalidSessionException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);
        Logger logger = LogManager.getLogger();
        logger.warn(" searchForDevices platformId : " + platformId);
        return platformDeviceManagerFactory.getPlatformDeviceManager(platformId, userId, projectId).searchForDevices(platformId);
    }

    @GET
    @Path("{userId}/{projectId}/getActionValueOrState")
    @Produces(MediaType.APPLICATION_JSON)
    public String getActionValueOrState(@QueryParam("actionId") String actionId, @QueryParam("deviceId") String deviceId, @PathParam("userId") String userId, @PathParam("projectId") String projectId, @Context HttpServletRequest request, @Context HttpServletResponse response) throws InvalidIdentificationNumberException, InvalidParameterException, IOException, PlatformNotFoundException, PlatformDataProcessingException, InvalidSessionException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);

        return platformDeviceManagerFactory.getPlatformDeviceManager(IdTranslator.internalIdToExternalD(deviceId, 0), userId, projectId).getActionValueOrState(actionId, deviceId);
    }

    /**
     * This method returns a list with all supported device types. {@link DeviceType}
     */
    @GET
    @Path("/getDeviceTypes")
    @Produces(MediaType.APPLICATION_JSON)
    public DeviceType[] getDeviceTypes(@Context HttpServletRequest request, @Context HttpServletResponse response) throws InvalidIdentificationNumberException, InvalidParameterException, IOException, PlatformNotFoundException, PlatformDataProcessingException, InvalidSessionException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);

        return DeviceType.values();
    }

    @GET
    @Path("/getSensorTypes")
    @Produces(MediaType.APPLICATION_JSON)
    public SensorTypeList getSensorTypes(@Context HttpServletRequest request, @Context HttpServletResponse response) throws InvalidSessionException, IOException {
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);
        SensorTypesParser tr = new SensorTypesParser();
        return tr.readTypes();
    }

    @GET
    @Path("/getActuatorTypes")
    @Produces(MediaType.APPLICATION_JSON)
    public EntityType.ActuatorType[] getActuatorTypes(@Context HttpServletRequest request, @Context HttpServletResponse response) throws InvalidSessionException {
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);
        return EntityType.ActuatorType.values();
    }


    @POST
    @Path("{userId}/{projectId}/setSensorType")
    public void setSensorType(@PathParam("userId") String userId,
                              @PathParam("projectId") String projectId,
                              @QueryParam("sensorId") String sensorId,
                              @QueryParam("deviceId") String deviceId,
                              @QueryParam("type") String type, @Context HttpServletRequest request, @Context HttpServletResponse response) throws InvalidIdentificationNumberException, InvalidParameterException, IOException, PlatformNotFoundException, PlatformDataProcessingException, InvalidSessionException, DatabaseDataProcessingException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);
        platformDeviceManagerFactory.getPlatformDeviceManager(IdTranslator.internalIdToExternalD(deviceId, 0), userId, projectId).setSensorType(deviceId, sensorId, type);
    }

    @POST
    @Path("{userId}/{projectId}/setActuatorType")
    public void setActuatorType(@PathParam("userId") String userId,
                                @PathParam("projectId") String projectId,
                                @QueryParam("actuatorId") String actuatorId,
                                @QueryParam("deviceId") String deviceId,
                                @QueryParam("type") String type, @Context HttpServletRequest request, @Context HttpServletResponse response) throws InvalidIdentificationNumberException, InvalidParameterException, IOException, PlatformNotFoundException, PlatformDataProcessingException, InvalidSessionException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);
        //platformDeviceManagerFactory.getPlatformDeviceManager(IdTranslator.internalIdToExternalD(deviceId, 0), userId, projectId).setActuatorType(deviceId, actuatorId, type);
    }

    @POST
    @Path("{userId}/{projectId}/{platformId}/setDeviceType")
    public void setDeviceType(@PathParam("userId") String userId,
                              @PathParam("projectId") String projectId,
                              @PathParam("platformId") String platformId,
                              @QueryParam("deviceId") String deviceId,
                              @QueryParam("type") String type, @Context HttpServletRequest request, @Context HttpServletResponse response) throws InvalidIdentificationNumberException, InvalidParameterException, IOException, PlatformNotFoundException, PlatformDataProcessingException, InvalidSessionException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);
        platformDeviceManagerFactory.getPlatformDeviceManager(platformId, userId, projectId).setDeviceType(deviceId, type);
    }

    @GET
    @Path("/getAllLocations")
    @Produces(MediaType.APPLICATION_JSON)
    public Locations[] getLocations (@Context HttpServletRequest request, @Context HttpServletResponse response) throws InvalidSessionException {
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);

        return Locations.values();
    }

    @POST
    @Path("{userId}/{projectId}/setLocation")
    public void setLocation (@PathParam("userId") String userId, @PathParam("projectId") String projectId, @QueryParam("deviceId") String deviceId, @QueryParam("location")String location, @Context HttpServletRequest request, @Context HttpServletResponse response) throws InvalidSessionException, InvalidIdentificationNumberException, InvalidParameterException, IOException, PlatformNotFoundException {
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);
        platformDeviceManagerFactory.getPlatformDeviceManager(IdTranslator.internalIdToExternalD(deviceId, 0), userId, projectId).setLocation(deviceId, location);
    }

    @Path("{userId}/{projectId}/getDevicesBySensorType")
    @Produces(MediaType.APPLICATION_JSON)
    @GET
    public List<Device> getDevicesBySensorType (@PathParam("userId") String userId, @PathParam("projectId") String projectId, @QueryParam("type")String type, @Context HttpServletRequest request, @Context HttpServletResponse response) throws InvalidSessionException, InvalidParameterException, PlatformNotFoundException, IOException, InvalidIdentificationNumberException, PlatformDataProcessingException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);
        platforms = new PlatformManager().getConnectedPlatforms(userId, projectId);

        List<Device> devices = new ArrayList<>();
        for (int i = 0; i < platforms.size(); i++)
            devices.addAll(platformDeviceManagerFactory.getPlatformDeviceManager(platforms.get(i).platformId, userId, projectId).getDevicesBySensorType(type));
        return devices;
    }

    @Path("{userId}/{projectId}/getDevicesByActuatorType")
    @Produces(MediaType.APPLICATION_JSON)
    @GET
    public List<Device> getDevicesByActuatorType (@PathParam("userId") String userId, @PathParam("projectId") String projectId, @QueryParam("type")String type, @Context HttpServletRequest request, @Context HttpServletResponse response) throws InvalidSessionException, InvalidParameterException, PlatformNotFoundException, IOException, InvalidIdentificationNumberException, PlatformDataProcessingException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);
        platforms = new PlatformManager().getConnectedPlatforms(userId, projectId);

        List<Device> devices = new ArrayList<>();
        for (int i = 0; i < platforms.size(); i++)
            devices.addAll(platformDeviceManagerFactory.getPlatformDeviceManager(platforms.get(i).platformId, userId, projectId).getDevicesByActuatorType(type));
        return devices;
    }

    @Path("{userId}/{projectId}/getDevicesByLocation")
    @Produces(MediaType.APPLICATION_JSON)
    @GET
    public List<Device> getDevicesByLocation (@PathParam("userId") String userId, @PathParam("projectId") String projectId, @QueryParam("location")String location, @Context HttpServletRequest request, @Context HttpServletResponse response) throws InvalidSessionException, InvalidParameterException, PlatformNotFoundException, IOException, InvalidIdentificationNumberException, PlatformDataProcessingException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);
        platforms = new PlatformManager().getConnectedPlatforms(userId, projectId);

        List<Device> devices = new ArrayList<>();
        for (int i = 0; i < platforms.size(); i++)
            devices.addAll(platformDeviceManagerFactory.getPlatformDeviceManager(platforms.get(i).platformId, userId, projectId).getDevicesByLocation(location));
        return devices;
    }

    /**
     * This method imports devices from a platform.
     * @param platformId
     * @param userId
     * @param projectId
     * @throws InvalidParameterException
     * @throws PlatformNotFoundException
     * @throws IOException
     * @throws PlatformDataProcessingException
     * @throws InvalidIdentificationNumberException
     */
    public void importDevices(String platformId, String userId, String projectId) throws InvalidParameterException, PlatformNotFoundException, IOException, PlatformDataProcessingException, InvalidIdentificationNumberException {
        platformDeviceManagerFactory.getPlatformDeviceManager(platformId, userId, projectId).importDevices(new DeviceAddingInfo());
    }

}
