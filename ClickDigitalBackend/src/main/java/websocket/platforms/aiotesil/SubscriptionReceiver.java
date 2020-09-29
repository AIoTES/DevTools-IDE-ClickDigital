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
package  websocket.platforms.aiotesil;


import com.github.jsonldjava.core.JsonLdOptions;
import com.github.jsonldjava.core.JsonLdProcessor;
import com.github.jsonldjava.utils.JsonUtils;
import exceptions.PlatformDataProcessingException;
import org.apache.logging.log4j.Logger;
import org.glassfish.jersey.media.sse.EventOutput;
import org.glassfish.jersey.media.sse.OutboundEvent;
import org.glassfish.jersey.media.sse.SseBroadcaster;
import org.glassfish.jersey.media.sse.SseFeature;
import platformmanager.AiotesConfig;
import platformmanager.PlatformConnectionInfo;
import platformmanager.PlatformManager;
import platforms.aiotessil.RequestHelper;
import platforms.aiotessil.models.Subscription;
import usermanager.UserManager;

import javax.inject.Singleton;
import javax.servlet.http.HttpServlet;
import javax.ws.rs.*;
import javax.ws.rs.core.GenericType;
import javax.ws.rs.core.MediaType;
import java.io.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

import static org.apache.logging.log4j.LogManager.getLogger;

/**
 This class receives the subscriptions from aiotes and processes them.
 * This Endpoint is subscribed by ClickDigital itself in {@link AiotessilWebSocketService#entityStateChanged(Consumer)} and
 * messages are forwarded to frontend by websocket.
 */
@Singleton
@Path("/messageReceiver")
public class SubscriptionReceiver extends HttpServlet {

    private String conversationId = "";
    private String dateTime = "";
    private String externalPlatformId = "";
    private String value = "";

    @POST
    @Path("/placeholder")
    public void placeholer() {
    }

    private SseBroadcaster broadcaster = new SseBroadcaster();


    /**
     * This class tries to parse the observation message sent from aiotes and to model it as a {@link websocket.models.EntityStateChangeResponse} for sending it
     * through the wbsocket channel to the frontend
     *
     * @param projectId the projectId is submitted by aiotes as the client id, this is configured when registering the client callback url in {@link AiotessilWebSocketService#entityStateChanged(Consumer)}
     * @param message   the json ld observer message
     * @throws IOException
     * @throws PlatformDataProcessingException
     */
    @POST
    @Path("/{projectId}")
    //@Consumes(MediaType.APPLICATION_JSON)
    public void broadcastMessage(@PathParam("projectId") String projectId, String message) throws IOException, PlatformDataProcessingException {
        OutboundEvent.Builder eventBuilder = new OutboundEvent.Builder();




        // Read the file into an Object (The type of this object will be a List, Map, String, Boolean,
        // Number or null depending on the root object in the file).
        Object jsonObject = JsonUtils.fromString(message);
        // Create a context JSON map containing prefixes and definitions
        Map context = new HashMap();//(Map) ((Map) jsonObject).get("@context");
        // Customise context...
        // Create an instance of JsonLdOptions with the standard JSON-LD options
        JsonLdOptions options = new JsonLdOptions();
        // Customise options...
        // Call whichever JSONLD function you want! (e.g. compact)
        Object compact = JsonLdProcessor.compact(jsonObject, context, options);

        OutboundEvent event = null;


        Map resource = (Map) compact; // this map holds the complete jsonld message

        extractInformation(resource);

        // Check if all needed data could be gathered and then send to frontend, otherwise it will not send anything
        if (!conversationId.equals("") && !dateTime.equals("") && !externalPlatformId.equals("") && !value.equals("")) {
            String externalDeviceId = getExternalDeviceId(conversationId, projectId);

            websocket.platforms.aiotesil.Subscription subscription = new websocket.platforms.aiotesil.Subscription(externalPlatformId, externalDeviceId, dateTime, beautifyValue(value));

            event = eventBuilder
                    .mediaType(MediaType.APPLICATION_JSON_TYPE)
                    .data(websocket.platforms.aiotesil.Subscription.class, subscription)
                    .build();

            //reset values
            conversationId="";
            dateTime="";
            externalPlatformId="";
            value="";

        }

        if (event != null)
            broadcaster.broadcast(event);
    }


    @GET
    @Path("listen/{projectId}")
    @Produces(SseFeature.SERVER_SENT_EVENTS)
    public EventOutput listenToBroadcast(@PathParam("projectId") String projectId) {

        EventOutput eventOutput = new EventOutput();
        this.broadcaster.add(eventOutput);
        return eventOutput;
    }


    /**
     * This method extracts all needed information from the received messages by parsing the json ld structure.
     * @param resource the jsonld message
     */
    private void extractInformation(Map resource){
        if (resource.containsKey("@graph")) {
            List graph = (List) resource.get("@graph");
            Map metaData = (Map) graph.get(0);
            Map payloadData = (Map) graph.get(1);

            List metaDataGraph = (List) metaData.get("@graph");

            Map metaDataGraphMap = (Map) metaDataGraph.get(0);


            if (metaDataGraphMap.containsKey("http://inter-iot.eu/message/conversationID")) {
                conversationId = metaDataGraphMap.get("http://inter-iot.eu/message/conversationID").toString();

            }


            if (metaDataGraphMap.containsKey("http://inter-iot.eu/message/dateTimeStamp")) {
                dateTime = metaDataGraphMap.get("http://inter-iot.eu/message/dateTimeStamp").toString();

            }


            if (metaDataGraphMap.containsKey("http://inter-iot.eu/message/SenderPlatformId")) {
                Map senderPlatform = (Map) metaDataGraphMap.get("http://inter-iot.eu/message/SenderPlatformId");
                externalPlatformId = senderPlatform.get("@id").toString();

            }


            List<Map> payloadDataGraph = (List<Map>) payloadData.get("@graph");

            //traverse the map for finding the result time
            for (Map map : payloadDataGraph) {

                if (map.containsKey("http://www.w3.org/ns/sosa/hasResultTime")) {
                    dateTime = map.get("http://www.w3.org/ns/sosa/hasResultTime").toString();
                    break;
                }
            }

            //traversing the map for finding the result value
            payloadDataLoop:
            for (Map map : payloadDataGraph) {

                if (map.containsKey("http://www.w3.org/ns/sosa/hasResult")) { //try to parse the value sent within the message
                    try { // in case the result is boxed casting to map will succeed. Otherwise the result ist written directly as a string and we can map the value.
                        Map data = (Map) map.get("http://www.w3.org/ns/sosa/hasResult");
                        if (data.containsKey("@id")) { // check if there is a link to the result
                            String idOfResultObject = data.get("@id").toString(); // save the link (id) to the result
                            for (Map m : payloadDataGraph) { // iterate throuh the whole payload data graph to get the object witch is linked as a result
                                if (m.containsValue(idOfResultObject)) { //gather the object if its exists
                                    if (m.containsKey("http://inter-iot.eu/GOIoTP#hasResultValue")) { //checks if the result is here
                                        try{
                                            Map valueData = (Map) m.get("http://inter-iot.eu/GOIoTP#hasResultValue");
                                            if(valueData.containsKey("@value")){
                                                value= valueData.get("@value").toString(); // gather the result
                                                break payloadDataLoop;
                                            }
                                            else if(valueData.containsKey("@id")){
                                                value= valueData.get("@id").toString(); // gather the result
                                                break payloadDataLoop;
                                            }
                                        }
                                        catch(ClassCastException e){
                                            value = m.get("http://inter-iot.eu/GOIoTP#hasResultValue").toString(); // gather the result
                                            break payloadDataLoop;
                                        }

                                    }
                                    else if (m.containsKey("http://www.w3.org/ns/sosa/hasResultValue")) {
                                        Map valueData = (Map) m.get("http://www.w3.org/ns/sosa/hasResultValue");
                                        if(valueData.containsKey("@value")){
                                            value= valueData.get("@value").toString(); // gather the result
                                            break payloadDataLoop;
                                        }
                                    }
                                }
                            }
                            if(data.containsKey("@value")){
                                value= data.get("@value").toString();
                                break;
                            }
                            else {
                                value= data.get("@id").toString(); // gather the result
                                break;
                            }
                        } else if(data.containsKey("@value")){
                            value= data.get("@value").toString();
                            break;
                        }


                    } catch (ClassCastException ex) {
                        try{
                            Map valueData = (Map) map.get("http://www.w3.org/ns/sosa/hasResult");
                            if(valueData.containsKey("@value")){
                                value= valueData.get("@value").toString(); // gather the result
                                break;
                            }
                            if(valueData.containsKey("@id")){
                                value= valueData.get("@id").toString(); // gather the result
                                break;
                            }
                        }
                        catch(ClassCastException e){
                            value = map.get("http://www.w3.org/ns/sosa/hasResult").toString(); // gather the result
                            break;
                        }
                    }


                }
                else if (map.containsKey("http://www.w3.org/ns/sosa/hasResultValue")) {
                    try{
                        Map valueData = (Map) map.get("http://www.w3.org/ns/sosa/hasResultValue");
                        if(valueData.containsKey("@value")){
                            value= valueData.get("@value").toString(); // gather the result
                            break ;
                        }
                        if(valueData.containsKey("@id")){
                            value= valueData.get("@id").toString(); // gather the result
                            break;
                        }
                    }
                    catch(ClassCastException e){
                        value = map.get("http://www.w3.org/ns/sosa/hasResultValue").toString(); // gather the result
                        break;
                    }
                }
            }

        }
    }


    /**
     * This methods beautify an aiotes send value of a device. Quick fix.
     * @param value the value to beautify
     * @return the beautified value
     */
    private String beautifyValue(String value){
        if(value.contains(":off"))
            return "0";
        else if(value.contains(":on")){
            return "1";
        }
        else if (value.contains("#Detected")){
            return "1";
        }
        else if (value.contains("#NotDetected")){
            return "0";
        }
        else if (value.contains("#Activated")){
            return "1";
        }
        else if (value.contains("#NotActivated")){
            return "0";
        }
        else if (value.contains("true")){
            return "1";
        }
        else if (value.contains("false")){
            return "0";
        }
        return value;
    }


    /**
     * This method gathers the device id from the device which has sent an observation message.
     *
     * @param conversationId the conversation id
     * @param projectId      the project id which is the client id on aitoes sil
     * @return the external id of the device
     * @throws PlatformDataProcessingException if an error occurs
     */
    private String getExternalDeviceId(String conversationId, String projectId) throws PlatformDataProcessingException, UnsupportedEncodingException {

        AiotesConfig config = new PlatformManager().getAiotesConfig(new UserManager().getUserFromProject(projectId), projectId);
        RequestHelper requestHelper = new RequestHelper(new PlatformConnectionInfo(config.ip, config.port));

        List<Subscription> subscriptions = requestHelper.sendGetRequest(
                "/subscriptions",
                "Client-ID",
                projectId,
                new String[]{},
                new Object[]{},
                new String[]{"clientId"},
                new Object[]{projectId},
                MediaType.APPLICATION_JSON_TYPE).readEntity(new GenericType<List<Subscription>>() {
        });

        for (Subscription subscription : subscriptions) {
            if (subscription.conversationId.equals(conversationId)) {
                return subscription.deviceIds.get(0);
            }
        }

        return null;
    }


}
