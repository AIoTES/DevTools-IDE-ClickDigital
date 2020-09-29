package visualmanager;

import exceptions.InvalidSessionException;
import usersessionmanager.UserSessionManager;
import visualmanager.models.SensorDataModel;
import visualmanager.platforms.PlatformVisualManager;
import visualmanager.platforms.PlatformVisualManagerFactory;
import exceptions.PlatformDataProcessingException;
import exceptions.PlatformNotFoundException;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.io.IOException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import static services.IdTranslator.tryParsePlatformAndExternalIds;

/**

 * This class receives REST-Requests from frontend for the retrieval of sensor data.
 */
@Path("/visualManager")
public class VisualManager {

    private UserSessionManager userSessionManager = new UserSessionManager();

    /**
     * This is the default constructor for the {@link VisualManager} class.
     */
    public VisualManager(){}

    /**
     * This constructor reveals the dependencies of {@link VisualManager} and is used for instantiation in test classes.
     * @param platformVisualManagerFactory The {@link PlatformVisualManagerFactory} to be used by this class.
     */
    public VisualManager(PlatformVisualManagerFactory platformVisualManagerFactory){
        this.visualManagerFactory = platformVisualManagerFactory;
    }

    /**
     * This formatter is used to convert DateTimes to Strings and vice versa.
     */
    private DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    /**
     * This factory produces instances of classes derived from {@link PlatformVisualManager} for requesting
     * data from specific platforms.
     */
    private PlatformVisualManagerFactory visualManagerFactory = new PlatformVisualManagerFactory();

    /**
     * Gets the most recent data available for a sensor.
     *
     * @param deviceId The internal Id of the target device.
     * @param sensorId The external Id of the target sensor that belongs to the target device.
     * @return Returns a {@link SensorDataModel} for the target sensor.
     * @throws PlatformDataProcessingException If there was an error retrieving the Item data.
     * @throws PlatformNotFoundException If the given deviceId contains an unknown platform Id.
     */
    @Path("{userId}/{projectId}/getSensorDataNow")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public SensorDataModel getSensorDataNowREST(
            @QueryParam("deviceId") String deviceId,
            @QueryParam("sensorId") String sensorId,
            @PathParam("userId") String userId,
            @PathParam("projectId") String projectId,
            @Context HttpServletRequest request,
            @Context HttpServletResponse response)
            throws PlatformDataProcessingException, PlatformNotFoundException, IOException, InvalidSessionException {

        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);

        String[] externalIds = tryParsePlatformAndExternalIds(deviceId);

        String id = externalIds[0];
        String externalDeviceId = externalIds[1];

        PlatformVisualManager visualManager = visualManagerFactory.CreatePlatformVisualManager(id, userId, projectId);

        try{
            visualManager.getSensorData(externalDeviceId, sensorId);
            return visualManager.getSensorData(externalDeviceId, sensorId);
        } catch(PlatformDataProcessingException ex){
            throw ex;
        } catch(Exception ex) {
            throw new PlatformDataProcessingException("An error occurred while processing Sensor Data. Exception: " + ex.toString());
        }
    }

    /**
     * Gets the most recent data available for a sensor.
     *
     * @param deviceId The internal Id of the target device.
     * @param sensorId The external Id of the target sensor that belongs to the target device.
     * @return Returns a {@link SensorDataModel} for the target sensor.
     * @throws PlatformDataProcessingException If there was an error retrieving the Item data.
     * @throws PlatformNotFoundException If the given deviceId contains an unknown platform Id.
     */

    public SensorDataModel getSensorDataNow(
            String deviceId,
            String sensorId,
            String userId,
            String projectId)
            throws PlatformDataProcessingException, PlatformNotFoundException, IOException {

        String[] externalIds = tryParsePlatformAndExternalIds(deviceId);

        String id = externalIds[0];
        String externalDeviceId = externalIds[1];

        PlatformVisualManager visualManager = visualManagerFactory.CreatePlatformVisualManager(id, userId, projectId);

        try{
            visualManager.getSensorData(externalDeviceId, sensorId);
            return visualManager.getSensorData(externalDeviceId, sensorId);
        } catch(PlatformDataProcessingException ex){
            throw ex;
        } catch(Exception ex) {
            throw new PlatformDataProcessingException("An error occurred while processing Sensor Data. Exception: " + ex.toString());
        }
    }

    /**
     * Gets the data from within a specified time span with a specified step size for a sensor.
     *
     * @param deviceId The internal Id of the target device.
     * @param sensorId The external Id of the target sensor that belongs to the target device.
     * @param startTime A string in the "yyyy-MM-ddTHH:mm:ss" format representing the start of the target time span.
     * @param endTime A string in the "yyyy-MM-ddTHH:mm:ss" format representing the end of the target time span.
     * @param interval A string in the ISO 8601 format for time durations P[JY][MM][WW][TD][T[hH][mM][s[.f]S]]
     * @return Returns a {@link SensorDataModel} for the target sensor.
     */
    @Path("{userId}/{projectId}/getSensorDataOverTime")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public SensorDataModel getSensorDataOverTimeREST(
            @QueryParam("deviceId") String deviceId,
            @QueryParam("sensorId") String sensorId,
            @QueryParam("startTime") String startTime,
            @QueryParam("endTime") String endTime,
            @QueryParam("interval") String interval,
            @PathParam("userId") String userId,
            @PathParam("projectId") String projectId,
            @Context HttpServletRequest request,
            @Context HttpServletResponse response) throws PlatformDataProcessingException, PlatformNotFoundException, IOException, InvalidSessionException {

        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);

        String[] externalIds = tryParsePlatformAndExternalIds(deviceId);

        String id = externalIds[0];
        String externalDeviceId = externalIds[1];

        LocalDateTime start;
        LocalDateTime end;
        Duration duration;
        try{
            start = LocalDateTime.parse(startTime, DATE_TIME_FORMATTER);
            end = LocalDateTime.parse(endTime, DATE_TIME_FORMATTER);
            duration = Duration.parse(interval);
        } catch (Exception ex){
            throw new PlatformDataProcessingException("DateTime or duration parameter could not be parsed. Exception: "
                    + ex.toString(), Response.Status.BAD_REQUEST);
        }

        PlatformVisualManager visualManager = visualManagerFactory.CreatePlatformVisualManager(id, userId, projectId);


        try{
            return visualManager.getSensorDataOverTime(externalDeviceId, sensorId, start, end, duration);
        } catch(PlatformDataProcessingException ex){
            throw ex;
        } catch(Exception ex) {
            throw new PlatformDataProcessingException("An error occurred while processing Sensor Data. Exception: " + ex.toString());
        }
    }

    /**
     * Gets the data from within a specified time span with a specified step size for a sensor.
     *
     * @param deviceId The internal Id of the target device.
     * @param sensorId The external Id of the target sensor that belongs to the target device.
     * @param startTime A string in the "yyyy-MM-ddTHH:mm:ss" format representing the start of the target time span.
     * @param endTime A string in the "yyyy-MM-ddTHH:mm:ss" format representing the end of the target time span.
     * @param interval A string in the ISO 8601 format for time durations P[JY][MM][WW][TD][T[hH][mM][s[.f]S]]
     * @return Returns a {@link SensorDataModel} for the target sensor.
     */
    public SensorDataModel getSensorDataOverTime(
            String deviceId,
            String sensorId,
            String startTime,
            String endTime,
            String interval,
            String userId,
            String projectId) throws PlatformDataProcessingException, PlatformNotFoundException, IOException{

        String[] externalIds = tryParsePlatformAndExternalIds(deviceId);

        String id = externalIds[0];
        String externalDeviceId = externalIds[1];

        LocalDateTime start;
        LocalDateTime end;
        Duration duration;
        try{
            start = LocalDateTime.parse(startTime, DATE_TIME_FORMATTER);
            end = LocalDateTime.parse(endTime, DATE_TIME_FORMATTER);
            duration = Duration.parse(interval);
        } catch (Exception ex){
            throw new PlatformDataProcessingException("DateTime or duration parameter could not be parsed. Exception: "
                    + ex.toString(), Response.Status.BAD_REQUEST);
        }

        PlatformVisualManager visualManager = visualManagerFactory.CreatePlatformVisualManager(id, userId, projectId);


        try{
            return visualManager.getSensorDataOverTime(externalDeviceId, sensorId, start, end, duration);
        } catch(PlatformDataProcessingException ex){
            throw ex;
        } catch(Exception ex) {
            throw new PlatformDataProcessingException("An error occurred while processing Sensor Data. Exception: " + ex.toString());
        }
    }

}