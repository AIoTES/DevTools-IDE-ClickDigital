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
package platformmanager;

import acpmanager.logfilter.Log;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoCursor;
import com.mongodb.client.result.DeleteResult;
import devicemanager.DeviceManager;
import devicemanager.platforms.aiotessil.AiotesSilDeviceManager;
import exceptions.*;
//import platforms.aiotessil.RequestHelper;
import org.apache.logging.log4j.Level;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import platforms.aiotessil.RequestHelper;
import platforms.aiotessil.models.Device;
import platforms.aiotessil.models.RegisterClientInput;
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
import javax.ws.rs.core.GenericType;
import javax.ws.rs.core.MediaType;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Updates.set;
import static services.UtilityService.getDatabase;

@Path("/system")
public class PlatformManager {
    public final static String OPENHABID = "openHab";
    public final static String AIOTESSILID = "aiotesil";
    public final static String TESTID = "test";
    public final static String TAG_PLATFORMID= "platformId";
    private final static String TAG_USERID=UserManager.TAG_USERID;
    private UserSessionManager userSessionManager = new UserSessionManager();
    private final static Logger logger = LogManager.getLogger(UserManager.class.getName());

    private MongoCollection<Platform> connectedPlatforms = getDatabase(UtilityService.PropertyKeys.BACKEND_DATABASE_NAME).getCollection("ConnectedPlatforms", Platform.class);

    private MongoCollection<AiotesConfig> aiotesConfig = getDatabase(UtilityService.PropertyKeys.BACKEND_DATABASE_NAME).getCollection("AiotesConfig", AiotesConfig.class);

    /**
     * This method connects a new iot platform with a user.
     *
     * @param platform the {@link Platform} to add.
     * @param userId   the user which the platform belongs to.
     */
    @Path("{userId}/{projectId}/connectPlatform")
    @Consumes("application/json")
    @POST
    public void connectPlatform(Platform platform, @PathParam(TAG_USERID) String userId, @PathParam("projectId") String projectId,
                                @Context HttpServletRequest request, @Context HttpServletResponse response)
            throws PlatformDataProcessingException, InvalidIdentificationNumberException, InvalidSessionException, InvalidParameterException, PlatformNotFoundException, IOException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);

        platform.userId = userId;
        platform.projectId = projectId;

        if (platform.externalPlatformId == null)
            platform.platformId = IdTranslator.serializePlatformId(platform.platformId, platform.platformId);
        else
            platform.platformId = IdTranslator.serializePlatformId(platform.externalPlatformId, platform.platformId);


        connectedPlatforms.insertOne(platform);
        new DeviceManager().importDevices(platform.platformId, userId, projectId);
    }

    /**
     * This method provides an interface for deleting a platform connection. And calls the procedure for deleting the platform.
     */
    @Path("{userId}/{projectId}/deletePlatform")
    @Produces("application/json")
    @Consumes("application/json")
    @DELETE
    public void removePlatformRest(@QueryParam(TAG_PLATFORMID) String platformId, @PathParam(TAG_USERID) String userId,
                               @PathParam("projectId") String projectId, @Context HttpServletRequest request,
                               @Context HttpServletResponse response) throws MissingDatabaseEntryException, InvalidSessionException, InvalidIdentificationNumberException, InvalidParameterException, DatabaseDataProcessingException, PlatformDataProcessingException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);

        removePlatform(platformId, userId, projectId);

    }

    /**
     * This method deletes a platform connection.
     * @param platformId the id of the platform
     * @param userId the id of the user
     * @param projectId the id of the project
     * @throws MissingDatabaseEntryException if platform was not found in database
     * @throws InvalidIdentificationNumberException
     * @throws InvalidParameterException
     * @throws DatabaseDataProcessingException
     */
    public void removePlatform(String platformId, String userId, String projectId) throws MissingDatabaseEntryException, InvalidIdentificationNumberException, InvalidParameterException, DatabaseDataProcessingException, PlatformDataProcessingException {

        //first delete all subscriptions on aiotes before the connection info gets deleted
        if(IdTranslator.deserializePlatformId(platformId)[1].equals(PlatformManager.AIOTESSILID))
            new AiotesSilDeviceManager(userId, projectId, platformId).cleanSubscriptions();

        DeleteResult r = connectedPlatforms.deleteOne(and(eq(TAG_PLATFORMID, platformId), eq(TAG_USERID, userId), eq("projectId", projectId)));
        if (!(r != null && r.getDeletedCount() > 0)) {
            String userString= UtilityService.getUserString(userId, null);
            logger.log(Level.ERROR, (new Log(userString, LogConstants.DELETE_PLATFORM, userString, LogConstants.FAILED)).toString());
            throw new MissingDatabaseEntryException("Platform with the id: " + platformId + " was not found in database");

        }

        new DeviceManager().disconnectDevices(platformId, userId, projectId);
    }


    /**
     * same as getConnectedPlatformsREST, for internal calls
     *
     * @param userId
     * @param projectId
     * @return
     */
    @GET
    @Path("{userId}/{projectId}/getConnectedPlatforms")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public List<Platform> getConnectedPlatformsREST(@PathParam(TAG_USERID) String userId, @PathParam("projectId") String projectId,
                                                    @Context HttpServletRequest request, @Context HttpServletResponse response) throws InvalidSessionException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);

        return getConnectedPlatforms(userId, projectId);
    }

    @GET
    @Path("{userId}/getConnectedPlatformsFromAllProjects")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public List<Platform> getConnectedPlatformsFromAllProjects(@PathParam(TAG_USERID) String userId, @Context HttpServletRequest request, @Context HttpServletResponse response) throws InvalidSessionException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);

        List<Platform> result = new ArrayList<Platform>();
        MongoCursor<Platform> connectedPlatformsIterator = connectedPlatforms.find(and(eq(TAG_USERID, userId))).iterator();

        while (connectedPlatformsIterator.hasNext()) {
            Platform platform = connectedPlatformsIterator.next();
            platform.password = ""; //erase password for security reasons
            result.add(platform);
        }
        return result;
    }

    /**
     * same as getConnectedPlatformsREST, for internal calls
     *
     * @param userId
     * @param projectId
     * @return
     */
    public List<Platform> getConnectedPlatforms(String userId, String projectId) {
        List<Platform> result = new ArrayList<Platform>();
        //TODO query with mongo driver

        MongoCursor<Platform> connectedPlatformsIterator = connectedPlatforms.find(and(eq(TAG_USERID, userId), eq("projectId", projectId))).iterator();

        while (connectedPlatformsIterator.hasNext()) {
            Platform platform = connectedPlatformsIterator.next();
            platform.password = ""; //erase password for security reasons
            result.add(platform);
        }

        return result;
    }

    /**
     * Returns platform by id
     *
     * @return a platform
     */

    public Platform getPlatformById(String platformId) {
        Platform platform = connectedPlatforms.find(eq(TAG_PLATFORMID, platformId)).first();
        return platform;
    }


    /**
     * Returns a list of all available platforms that are not already connected to the client.
     *
     * @return a list of all available platforms
     * @throws IOException
     */
    @GET
    @Path("{userId}/{projectId}/getAvailablePlatforms")
    @Produces(MediaType.APPLICATION_JSON)
    public List<Platform> getAvailablePlatforms(@PathParam(TAG_USERID) String userId, @PathParam("projectId") String projectId,
                                                @Context HttpServletRequest request, @Context HttpServletResponse response)
            throws PlatformDataProcessingException, InvalidSessionException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);

        ArrayList<Platform> result = new ArrayList<>();
        ArrayList<Platform> implementedPlatforms = new ArrayList<>();
        List<platforms.aiotessil.models.Platform> availableAiotesPlatforms = new ArrayList<platforms.aiotessil.models.Platform>();
       //                                                                                                                                                                                                                                                                                                                                                                                   RequestHelper requestHelper = new RequestHelper();
        //add client to aiotes sil

        AiotesConfig config = getAiotesConfig(userId, projectId);
        if(config !=null) {
            RequestHelper requestHelper = new RequestHelper(new PlatformConnectionInfo(config.ip, config.port));
            String callbackURL= UtilityService.getConfigProperty(UtilityService.PropertyKeys.HTTP_MODE.toString()) + "://"
                    + config.systemIp + ":"
                    + config.clickdigitalPort
                    + "/ClickDigitalBackend_war_exploded/messageReceiver/" + projectId;
            requestHelper
                    .sendPostRequest("/clients", "Client-ID", projectId, new String[]{},
                            new Object[]{},
                            new String[]{},
                            new Object[]{},
                            MediaType.APPLICATION_JSON_TYPE,
                            new RegisterClientInput(projectId, callbackURL, 1, "JSON_LD", "SERVER_PUSH"));


            availableAiotesPlatforms = requestHelper.sendGetRequest(
                    "/platforms",
                    "Client-ID",
                    projectId,
                    new String[]{},
                    new Object[]{},
                    new String[]{},
                    new Object[]{},
                    MediaType.APPLICATION_JSON_TYPE).readEntity(new GenericType<List<platforms.aiotessil.models.Platform>>() {
            });

        }
        result.add(new Platform("OpenHab", OPENHABID));
        //result.add(new Platform("Test", TESTID));

        // sort out the already connected platforms, they cannot be added twice
        List<Platform> connectedPlatforms = getConnectedPlatforms(userId, projectId);

        for (platforms.aiotessil.models.Platform aiotesPlatform : availableAiotesPlatforms) {
            Platform platform = new Platform(aiotesPlatform.name, AIOTESSILID);
            platform.externalPlatformId = aiotesPlatform.platformId;
            result.add(platform);
        }


        List<Platform> unusedPlatforms = new ArrayList<>();
        for (int i = 0; i < result.size(); i++) {
            boolean isConnected = false;
            for (int j = 0; j < connectedPlatforms.size(); j++) {
                if (result.get(i).externalPlatformId != null) {
                    if (result.get(i).externalPlatformId.equals(connectedPlatforms.get(j).externalPlatformId)) {
                        isConnected = true;
                    }
                } else if (result.get(i).platformId.equals(IdTranslator.deserializePlatformId(connectedPlatforms.get(j).platformId)[1])) {
                    isConnected = true;
                }
            }
            if (!isConnected) {
                unusedPlatforms.add(result.get(i));
            }
        }
        return unusedPlatforms;
    }


    /**
     * This class looks up for the port and ip address for a platform to connect to.
     *
     * @param userId     the user the platform is connected to
     * @param platformId the id of the platform
     * @return a {@link PlatformConnectionInfo}
     * @throws PlatformNotFoundException if no platform was found for the user
     */
    public PlatformConnectionInfo getConnectionInfo(String userId, String platformId, String projectId) throws PlatformNotFoundException {
        List<Platform> connectedPlatforms = getConnectedPlatforms(userId, projectId);
        for (Platform platform : connectedPlatforms) {
            if (platform.platformId.equals(platformId)) {
                return new PlatformConnectionInfo(platform.ip, platform.port);
            }
        }
        throw new PlatformNotFoundException("No platform with id: " + platformId + " was found for user: " + userId);
    }

    @GET
    @Path("{userId}/{projectId}/changeAiotesAddress")
    public void changeAiotesAddress(@PathParam("userId")String userId, @PathParam("projectId") String projectId, @QueryParam("ip") String ip, @QueryParam("port")String port, @QueryParam("systemIp") String systemIp, @QueryParam("cdPort") String cdPort, @Context HttpServletRequest request, @Context HttpServletResponse response) throws InvalidSessionException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);

        AiotesConfig config = getAiotesConfig(userId, projectId);

        if(config == null)
            aiotesConfig.insertOne(new AiotesConfig(ip, port,systemIp,cdPort, projectId, userId));
        else{
            aiotesConfig.updateOne(and( eq("userId", userId), eq("projectId", projectId)), set("ip", ip));
            aiotesConfig.updateOne(and( eq("userId", userId), eq("projectId", projectId)), set("port", port));
            aiotesConfig.updateOne(and( eq("userId", userId), eq("projectId", projectId)), set("systemIp", systemIp));
            aiotesConfig.updateOne(and( eq("userId", userId), eq("projectId", projectId)), set("clickdigitalPort", cdPort));
        }


    }

    /**
     * This method return the user and project related aiotes config.
     * @param userId
     * @param projectId
     * @return
     */
    public AiotesConfig getAiotesConfig(String userId, String projectId){
        return aiotesConfig.find(and(eq("userId", userId), eq("projectId", projectId))).first();
    }
}
