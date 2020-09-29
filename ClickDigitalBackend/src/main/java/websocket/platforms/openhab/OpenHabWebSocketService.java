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
package  websocket.platforms.openhab;

import anomalymanager.AnomalyManager;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import exceptions.ActionCycleException;
import exceptions.InvalidIdentificationNumberException;
import exceptions.MissingDatabaseEntryException;
import exceptions.PlatformDataProcessingException;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.glassfish.jersey.client.JerseyWebTarget;
import platforms.openHab.Helper.OpenHabModelRetriever;
import platforms.openHab.Models.*;
import platforms.openHab.Helper.RequestHelper;
import rulemanager.Manager.RuleManager;
import rulemanager.RuleManagement;
import rulemanager.models.Rule;
import websocket.models.DeviceDiscoveryResponse;
import websocket.models.EntityStateChangeResponse;
import websocket.models.RuleStatusChangeResponse;
import websocket.models.ThingStatusChangedResponse;
import websocket.platforms.PlatformWebSocketService;

import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.sse.InboundSseEvent;
import javax.ws.rs.sse.SseEventSource;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.function.Consumer;

import static services.IdTranslator.externalIdToInternalID;

/**
 * This class is used for retrieval of realtime status changes for {@link Item}s in OpenHab.
 */
public class OpenHabWebSocketService extends PlatformWebSocketService {
    private ObjectMapper mapper = new ObjectMapper();
    /**
     * The {@link SseEventSource} used for the Sse connection to the OpenHab events stream.
     */
    private SseEventSource eventSource;

    /**
     * The {@link OpenHabModelRetriever} used by this class for retrieval of an {@link Item}
     * name from OpenHab.
     */
    private OpenHabModelRetriever modelRetriever;

    /**
     * The {@link RequestHelper} used by this class to build the target path for the Sse connection.
     */
    private RequestHelper requestHelper;

    /**
     * This constructor reveals the dependencies of the class and is used for instantiation in
     * test classes with mocks.
     *
     * @param requestHelper The {@link RequestHelper} to be used by this class.
     */

    RuleManagement ruleManagement = new RuleManagement();

    public OpenHabWebSocketService(String platformId, RequestHelper requestHelper, String projectId, String userId) {
        super(platformId, projectId, userId);
        this.modelRetriever = new OpenHabModelRetriever(requestHelper);
        this.requestHelper = requestHelper;
    }

    /**
     * This method gets called through the super method on open if the requested
     * subscription is {@link services.Constants#ENTITYSTATECHANGED}
     * @param messageSender The method to be invoked on every sensor status update, which should consume a String and
     *                      send it to the frontend endpoint.
     */
    @Override
    public void entityStateChanged(Consumer<String> messageSender) {
        String itemName = "*"; // subscribe from all items

        JerseyWebTarget wt = requestHelper.buildTarget(
                "/events",
                new String[0],
                new Object[0],
                new String[]{"topics"},
                new String[]{String.format("smarthome/%s/%s/%s", "items", itemName, "statechanged")});


        eventSource = SseEventSource
                .target(wt)
                .build();

        eventSource.register((event) -> {
            try {
                processItemChangedEvent(event, messageSender);
            } catch (Exception e) {
                e.printStackTrace();
            }

        });
        eventSource.open();
    }


    /**
     * This method gets called through the super method on open if the requested
     * subscription is {@link services.Constants#DEVICESTATUSCHANGED}
     * @param messageSender The method to be invoked on every sensor status update, which should consume a String and
     *                      send it to the frontend endpoint.
     */
    @Override
    public void deviceStatusChanged(Consumer<String> messageSender) {
        String thingName = "*"; // subscribe from all items
        JerseyWebTarget wt = requestHelper.buildTarget(
                "/events",
                new String[0],
                new Object[0],
                new String[]{"topics"},
                new String[]{String.format("smarthome/%s/%s/%s", "things", thingName, "statuschanged")});

        eventSource = SseEventSource
                .target(wt)
                .build();

        eventSource.register((event) -> {

            try {
                processDeviceStatusChangedEvent(event, messageSender);
            } catch (Exception e) {
                e.printStackTrace();
            }

        });
        eventSource.open();
    }

    /**
     * This method gets called through the super method on open if the requested
     * subscription is {@link services.Constants#DEVICESTATUSCHANGED}
     * @param messageSender The method to be invoked on every sensor status update, which should consume a String and
     *                      send it to the frontend endpoint.
     */
    @Override
    public void deviceDiscovered(Consumer<String> messageSender) {
        String thingName = "*"; // subscribe from all items
        JerseyWebTarget wt = requestHelper.buildTarget(
                "/events",
                new String[0],
                new Object[0],
                new String[]{"topics"},
                new String[]{String.format("smarthome/%s", "inbox")});

        eventSource = SseEventSource
                .target(wt)
                .build();

        eventSource.register((event) -> {
            try {
                processDeviceDiscoveredEvent(event, messageSender);
            } catch (Exception e) {
                e.printStackTrace();
            }

        });
        eventSource.open();
    }

    @Override
    public void ruleStateChanged(Consumer<String> messageSender,String  userID) {
        ruleManagement.initManager(userID);
        String ruleName = "*"; // subscribe from all rules
        JerseyWebTarget wt = requestHelper.buildTarget(
                "/events",
                new String[0],
                new Object[0],
                new String[]{"topics"},
                new String[]{String.format("smarthome/%s/*/%s", "rules", ruleName, "RuleStatusInfoEvent")});

        eventSource = SseEventSource
                .target(wt)
                .build();

       eventSource.register((event) -> {
            try {
                processRuleStatusChangedEvent(event, messageSender);
            } catch (Exception e) {
                e.printStackTrace();
            }

        });

        eventSource.open();
    }

    private void processRuleStatusChangedEvent(InboundSseEvent event, Consumer<String> messageSender) throws IOException, PlatformDataProcessingException, InvalidIdentificationNumberException, MissingDatabaseEntryException, ActionCycleException {

        SseEventData eventData = event.readData(SseEventData.class, MediaType.APPLICATION_JSON_TYPE);
        SseRuleStatusChangedEventDataPayload payload = mapper.readValue(eventData.payload, SseRuleStatusChangedEventDataPayload.class);
        String dateTime = LocalDateTime.now().toString();
        String[] separatedData = eventData.topic.split("/");
        String ruleID = separatedData[2];
        int id = Integer.parseInt(ruleID);

        Rule rule = ruleManagement.ruleManager.getRule(id);
        rule.ID = id;
        RuleStatusChangeResponse response = new RuleStatusChangeResponse(rule, dateTime, payload.status, payload.statusDetail);

        messageSender.accept(response.toJson());
    }

    /**
     * The message to be invoked when the status of the target {@link Item} changes.
     *
     * @param event         The event from the OpenHab Sse event stream.
     * @param messageSender The method which sends the String containing the status update to the frontend client endpoint.
     */
    private void processItemChangedEvent(InboundSseEvent event, Consumer<String> messageSender) throws IOException, PlatformDataProcessingException, InvalidIdentificationNumberException, InterruptedException, MissingDatabaseEntryException, ActionCycleException {
        SseEventData eventData = event.readData(SseEventData.class, MediaType.APPLICATION_JSON_TYPE);
        SseItemStateChangedEventDataPayload payload = mapper.readValue(eventData.payload, SseItemStateChangedEventDataPayload.class);
        String dateTime= LocalDateTime.now().toString();
        String[] separatedData = eventData.topic.split("/");
        String itemName = separatedData[2];
        List<Thing> things = modelRetriever.getThingsFromOpenHab();
        String entityId = "";
        String deviceId = "";
        for (Thing thing : things) {
            for (Channel channel : thing.channels) {
                if (channel.linkedItems.get(0).equals(itemName)) {
                    entityId = channel.uid;
                    deviceId = externalIdToInternalID(this.platformId, thing.UID);
                    break;
                }
            }
        }
        AnomalyManager anomalyManager = new AnomalyManager();
        EntityStateChangeResponse response;
        if(anomalyManager.isNetworkInDatabase(entityId)){
            float anomalyscore = anomalyManager.getScore(dateTime, entityId, payload.value);
            if(anomalyscore != -1.0f){
                 response = new EntityStateChangeResponse(dateTime, deviceId, entityId, payload.value, String.valueOf(anomalyscore));
            }
            else {
                 response = new EntityStateChangeResponse(dateTime, deviceId, entityId, payload.value);
            }

            messageSender.accept(response.toJson());
        }

        else {
            response = new EntityStateChangeResponse(dateTime, deviceId, entityId, payload.value);

            messageSender.accept(response.toJson());
        }
    }

    private void processDeviceStatusChangedEvent(InboundSseEvent event, Consumer<String> messageSender) throws IOException, PlatformDataProcessingException, InvalidIdentificationNumberException {
        SseEventData eventData = event.readData(SseEventData.class, MediaType.APPLICATION_JSON_TYPE);
        List<SseThingStatusChangedEventDetailsDataPayload> eventDataPayload = mapper.readValue(eventData.payload, new TypeReference<List<SseThingStatusChangedEventDetailsDataPayload>>(){});
        //SseThingStatusChangedEventDataPayload eventDataPayload = mapper.readValue(eventData.payload, SseThingStatusChangedEventDataPayload.class);
        String dateTime= LocalDateTime.now().toString();
        String[] separatedData = eventData.topic.split("/");
        String thingUID = separatedData[2];
        String deviceId = externalIdToInternalID(this.platformId, thingUID);


        ThingStatusChangedResponse response = new ThingStatusChangedResponse(dateTime, deviceId, eventDataPayload.get(0).status);

        messageSender.accept(response.toJson());

    }

    private void processDeviceDiscoveredEvent (InboundSseEvent event, Consumer<String> messageSender) throws IOException {
        SseEventData eventData = event.readData(SseEventData.class, MediaType.APPLICATION_JSON_TYPE);
        if(eventData.type.equals("InboxAddedEvent")){
            SseInboxEventDataPayload payload = mapper.readValue(eventData.payload, SseInboxEventDataPayload.class);
            DeviceDiscoveryResponse response = new DeviceDiscoveryResponse(LocalDateTime.now().toString(), payload.label);
            messageSender.accept(response.toJson());
        }
    }

    /**
     * This method should be invoked when the {@link OpenHabWebSocketService} is no longer needed.
     * It closes the Sse connection to OpenHab.
     */
    public void onClose() {
        if (eventSource != null) {
            eventSource.close();
        }
    }
}
