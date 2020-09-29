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
package anomalymanager;

import anomalymanager.models.AnomalySensorDataModel;
import anomalymanager.models.PersistenceNetwork;
import anomalymanager.models.TimeValueAnomalyScoreTuple;
import anomalymanager.nupic.launcher.AnomalyDetector;
import anomalymanager.nupic.network.Inference;
import anomalymanager.nupic.network.Network;
import anomalymanager.nupic.network.Persistence;
import anomalymanager.nupic.network.PersistenceAPI;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import exceptions.*;
import rx.Observer;
import services.UtilityService;
import sun.rmi.runtime.Log;
import usersessionmanager.UserSessionManager;
import visualmanager.VisualManager;
import visualmanager.models.TimeValueTuple;
import visualmanager.models.SensorDataModel;

import java.util.HashMap;
import java.util.logging.ConsoleHandler;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import java.io.IOException;


import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Updates.set;


/**
 * This class receives REST-Requests from frontend for the retrieval of sensor data with anomaly score.
 */
@Path("/anomalyManager")
public class AnomalyManager {

    boolean waitforprocess = false;
    static HashMap<String, PersistenceAPI> map = new HashMap<>(5);
    String dateTime;
    Float floatValue;
    String stringValue;
    AnomalyDetector anomalyDetector;
    Network network;
    boolean train;
    private PersistenceAPI api = Persistence.get();;
    private VisualManager visualManager = new VisualManager();
    private UserSessionManager userSessionManager = new UserSessionManager();


    /**
     * This is the default constructor for the {@link AnomalyManager} class.
     */

    public AnomalyManager(){
    }
//    api = Persistence.get();
//    visualManager = new VisualManager();

    /**
     * Starts a HTM Network
     *
     * @param deviceId The internal Id of the target device.
     * @param sensorId The external Id of the target sensor that belongs to the target device.
     * @return Returns a {@link SensorDataModel} for the target sensor.
     * @throws PlatformDataProcessingException If there was an error retrieving the Item data.
     * @throws PlatformNotFoundException If the given deviceId contains an unknown platform Id.
     */
    @Path("{userId}/{projectId}/startAnomalyNetworkRealtime")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public void startNetwork(
            @QueryParam("deviceId") String deviceId,
            @QueryParam("sensorId") String sensorId,
            @QueryParam("startTrainingTime") String startTrainingTime,
            @QueryParam("dateTime") String dateTime,
            @QueryParam("interval") String interval,
            @PathParam("userId") String userId,
            @PathParam("projectId") String projectId,
            @Context HttpServletRequest request, @Context HttpServletResponse response)
            throws InvalidSessionException, PlatformDataProcessingException, PlatformNotFoundException, IOException, InterruptedException, MissingDatabaseEntryException, ActionCycleException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);

        while(waitforprocess){
            if(!waitforprocess)
                break;
        }
        waitforprocess = true;

        if(isNetworkInDatabase(sensorId)){
            return;
        }

        try{
            SensorDataModel trainingSensorDataModel = visualManager.getSensorDataOverTime(deviceId, sensorId, startTrainingTime, dateTime, interval, userId, projectId);

            anomalyDetector = new AnomalyDetector();
            network = anomalyDetector.setupNetwork();
            int counter = 0;
            train  = true;
            // Subscribes and receives Network Output
            network.observe().subscribe(new Observer<Inference>() {
                @Override public void onCompleted() { /* Any finishing touches after Network is finished */
                train = false;}
                @Override public void onError(Throwable e) { /* Handle your errors here */ }
                @Override public void onNext(Inference inf) {

                    /* This is the OUTPUT of the network after each input has been "reacted" to. */
                }
            });

            while(train){
                for(TimeValueTuple tuple: trainingSensorDataModel.Values){
                    dateTime = tuple.DateTime;
                    floatValue = tuple.FloatValue;
                    stringValue = tuple.StringValue;
                    network.getPublisher().onNext(anomalyDateTimeFormat(dateTime) + "," + floatValue);
                    Thread.sleep(7);
                    counter ++;

                    // if to many training data, just do 3500 data
                    if(counter >= 4000){
                        counter = 0;
                        break;
                    }
                }
                train = false;
            }
            api.store(network);
            map.put(sensorId, api);
            waitforprocess = false;
//            savePersistenceNetwork(api, sensorId);
        }  catch(Exception ex) {
            throw new IOException("An error occurred while starting Anomalynetwork");
        }
    }

    /**
     * Gets the most recent data available for a sensor with AnomalyScore.
     *
     * @param deviceId The internal Id of the target device.
     * @param sensorId The external Id of the target sensor that belongs to the target device.
     * @return Returns a {@link SensorDataModel} for the target sensor.
     * @throws PlatformDataProcessingException If there was an error retrieving the Item data.
     * @throws PlatformNotFoundException If the given deviceId contains an unknown platform Id.
     */
    @Path("{userId}/{projectId}/getSensorWithAnomalyScoreDataNow")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public AnomalySensorDataModel getSensorWithAnomalyScoreDataNow(
            @QueryParam("deviceId") String deviceId,
            @QueryParam("sensorId") String sensorId,
            @PathParam("userId") String userId,
            @PathParam("projectId") String projectId,
            @Context HttpServletRequest request,
            @Context HttpServletResponse response)
            throws InvalidSessionException, PlatformDataProcessingException, PlatformNotFoundException, IOException, InterruptedException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);

        while(waitforprocess){
            if(!waitforprocess)
                break;
        }
        waitforprocess = true;

        AnomalySensorDataModel anomalySensorDataModel = new AnomalySensorDataModel();

        try{
            SensorDataModel data = visualManager.getSensorDataNow(deviceId, sensorId, userId, projectId);

            anomalySensorDataModel.Unit = data.Unit;
            anomalySensorDataModel.Type = data.Type;

            network = map.get(sensorId).load();
            network.restart();
            if(network == null){
                anomalyDetector = new AnomalyDetector();
                network = anomalyDetector.setupNetwork();
            }

            // Subscribes and receives Network Output
            network.observe().subscribe(new Observer<Inference>() {
                @Override public void onCompleted() { /* Any finishing touches after Network is finished */ }
                @Override public void onError(Throwable e) { /* Handle your errors here */}
                @Override public void onNext(Inference inf) {
                    anomalySensorDataModel.Values.add(new TimeValueAnomalyScoreTuple(dateTime, floatValue, stringValue, (float) inf.getAnomalyScore()));
                    /* This is the OUTPUT of the network after each input has been "reacted" to. */
                }
            });
            dateTime = data.Values.get(0).DateTime;
            floatValue = data.Values.get(0).FloatValue;
            stringValue = data.Values.get(0).StringValue;
            network.getPublisher().onNext(anomalyDateTimeFormat(dateTime) + "," + floatValue);
        } catch(PlatformDataProcessingException ex){
            throw ex;
        } catch(Exception ex) {
            throw new PlatformDataProcessingException("An error occurred while processing Sensor Data. Exception: " + ex.toString());
        }
        //time to calculate, not to be less
        Thread.sleep(9);
        api.store(network);
        map.put(sensorId, api);
        waitforprocess = false;
        return anomalySensorDataModel;
    }






    /**
     * Gets the most recent data available for a sensor with AnomalyScore.
     *
     * @param deviceId The internal Id of the target device.
     * @param sensorId The external Id of the target sensor that belongs to the target device.
     * @return Returns a {@link SensorDataModel} for the target sensor.
     * @throws PlatformDataProcessingException If there was an error retrieving the Item data.
     * @throws PlatformNotFoundException If the given deviceId contains an unknown platform Id.
     */
    @Path("{userId}/{projectId}/getSensorWithAnomalyScoreDataSocket")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public float getSensorWithAnomalyScoreDataSocket(
            @QueryParam("deviceId") String deviceId,
            @QueryParam("sensorId") String sensorId,
            @QueryParam("result") float score,
            @QueryParam("dateTime") String dateTime,
            @PathParam("userId") String userId,
            @PathParam("projectId") String projectId,
            @Context HttpServletRequest request,
            @Context HttpServletResponse response)
            throws InvalidSessionException, PlatformDataProcessingException, PlatformNotFoundException, IOException, InterruptedException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);

        while(waitforprocess){
            if(!waitforprocess)
                break;
        }
        waitforprocess = true;
        AnomalySensorDataModel anomalySensorDataModel = new AnomalySensorDataModel();
        final float[] anoamlyscore = {-1.0f};
        try{
            network = map.get(sensorId).load();
            network.restart();

            // Subscribes and receives Network Output
            network.observe().subscribe(new Observer<Inference>() {
                @Override public void onCompleted() { /* Any finishing touches after Network is finished */ }
                @Override public void onError(Throwable e) { /* Handle your errors here */ }
                @Override public void onNext(Inference inf) {
                    anoamlyscore[0] = (float) inf.getAnomalyScore();
                    /* This is the OUTPUT of the network after each input has been "reacted" to. */
                }
            });
            dateTime = dateTime;


            network.getPublisher().onNext(anomalyDateTimeFormat(dateTime) + "," + score);
        } catch(Exception ex) {
            throw new PlatformDataProcessingException("An error occurred while processing HTM " + ex.toString());
        }
        Thread.sleep(9);
        api.store(network);
        map.put(sensorId, api);
        waitforprocess = false;
        return anoamlyscore[0];
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
    @Path("{userId}/{projectId}/getSensorWithAnomalyScoreDataOverTime")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public AnomalySensorDataModel getSensorWithAnomalyScoreDataOverTime(
            @QueryParam("deviceId") String deviceId,
            @QueryParam("sensorId") String sensorId,
            @QueryParam("startTrainingTime") String startTrainingTime,
            @QueryParam("startTime") String startTime,
            @QueryParam("endTime") String endTime,
            @QueryParam("interval") String interval,
            @PathParam("userId") String userId,
            @PathParam("projectId") String projectId,
            @Context HttpServletRequest request,
            @Context HttpServletResponse response)
            throws InvalidSessionException, PlatformDataProcessingException, PlatformNotFoundException, IOException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);

        while(waitforprocess){
            if(!waitforprocess)
                break;
        }
        waitforprocess = true;


        AnomalySensorDataModel anomalySensorDataModel = new AnomalySensorDataModel();
        int counter = 0;

        try {
            SensorDataModel trainingSensorDataModel = visualManager.getSensorDataOverTime(deviceId, sensorId, startTrainingTime, startTime, interval, userId, projectId);
            SensorDataModel sensorDataModel = visualManager.getSensorDataOverTime(deviceId, sensorId, startTime, endTime, interval, userId, projectId);
            anomalySensorDataModel.Type = sensorDataModel.Type;
            anomalySensorDataModel.Unit = sensorDataModel.Unit;
            anomalyDetector = new AnomalyDetector();
            network = anomalyDetector.setupNetwork();
            train  = true;


            // Subscribes and receives Network Output
            network.observe().subscribe(new Observer<Inference>() {
              @Override public void onCompleted() { /* Any finishing touches after Network is finished */}
              @Override public void onError(Throwable e) { /* Handle your errors here */ }
              @Override public void onNext(Inference inf) {
                  if(!train){
                  anomalySensorDataModel.Values.add(new TimeValueAnomalyScoreTuple(dateTime, floatValue, stringValue, (float) inf.getAnomalyScore()));
                  }
                  /* This is the OUTPUT of the network after each input has been "reacted" to. */
              }
            });

            for(TimeValueTuple tuple: trainingSensorDataModel.Values){
                dateTime = tuple.DateTime;
                floatValue = tuple.FloatValue;
                stringValue = tuple.StringValue;
                network.getPublisher().onNext(anomalyDateTimeFormat(dateTime) + "," + floatValue);
                Thread.sleep(7);
                counter ++;

                // if to many training data, just do 5000 data
                if(counter == 4000){
                    counter = 0;
                    break;
                }
            }
            train = false;

            for(TimeValueTuple tuple: sensorDataModel.Values){
                dateTime = tuple.DateTime;
                floatValue = tuple.FloatValue;
                stringValue = tuple.StringValue;
                network.getPublisher().onNext(anomalyDateTimeFormat(dateTime) + "," + floatValue);
                Thread.sleep(7);
            }
            waitforprocess = false;
            return anomalySensorDataModel;
        } catch (PlatformDataProcessingException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new PlatformDataProcessingException("An error occurred while processing Sensor Data. Exception: " + ex.toString());
        }
    }




//    /**
//     * Gets the most recent data available for a sensor.
//     *
//     * @param deviceId The internal Id of the target device.
//     * @param sensorId The external Id of the target sensor that belongs to the target device.
//     * @return Returns a {@link SensorDataModel} for the target sensor.
//     * @throws PlatformDataProcessingException If there was an error retrieving the Item data.
//     * @throws PlatformNotFoundException If the given deviceId contains an unknown platform Id.
//     */
//    @Path("{userId}/{projectId}/deleteNetwork")
//    @GET
//    @Produces(MediaType.APPLICATION_JSON)
//    public void deleteNetwork(
//            @QueryParam("deviceId") String deviceId,
//            @QueryParam("sensorId") String sensorId,
//            @PathParam("userId") String userId,
//            @PathParam("projectId") String projectId)
//            throws PlatformDataProcessingException, PlatformNotFoundException, IOException, InterruptedException {
//
//
//        try{
//            deletePersistenceNetwork(sensorId);
//        } catch(Exception ex) {
//            throw new PlatformDataProcessingException("An error occurred while processing deleteNetwork" + ex.toString());
//        }
//    }




    //TODO better way to format "yyyy-MM-ddTHH:mm:ss" format to "MM/dd/YY HH:mm"

    //"yyyy-MM-ddTHH:mm:ss" format to "MM/dd/YY HH:mm"
    private String anomalyDateTimeFormat(String datetime){

        String year;
        String month;
        String day;
        String hours;
        String minutes;
        String result;

        if(datetime != null) {
            year = datetime.substring(2,4);
            month = datetime.substring(5,7);
            day = datetime.substring(8,10);
            hours = datetime.substring(11, 13);
            minutes = datetime.substring(14,16);
            result = month + "/" + day + "/" + year + " " + hours + ":" + minutes;
            return result;
        }
        return null;
    }

public float getScore(String dateTime, String entityId, String value) throws PlatformDataProcessingException, InterruptedException {


    AnomalySensorDataModel anomalySensorDataModel = new AnomalySensorDataModel();
    final float[] anoamlyscore = {-1.0f};
    try{
        network = map.get(entityId).load();
        network.restart();

        // Subscribes and receives Network Output
        network.observe().subscribe(new Observer<Inference>() {
            @Override public void onCompleted() { /* Any finishing touches after Network is finished */ }
            @Override public void onError(Throwable e) { /* Handle your errors here */ }
            @Override public void onNext(Inference inf) {
                anoamlyscore[0] = (float) inf.getAnomalyScore();
                /* This is the OUTPUT of the network after each input has been "reacted" to. */
            }
        });


        network.getPublisher().onNext(anomalyDateTimeFormat(dateTime) + "," + value);
    } catch(Exception ex) {
        throw new PlatformDataProcessingException("An error occurred while processing HTM " + ex.toString());
    }
    Thread.sleep(20);
    api.store(network);
    map.put(entityId, api);
    return anoamlyscore[0];
}

    public boolean isNetworkInDatabase(String entityId) throws PlatformDataProcessingException, InterruptedException, MissingDatabaseEntryException, ActionCycleException {
        for (String key : map.keySet()) {
            if(entityId.equals(key)){
                return true;
            }
        }
        return false;
    }

}
