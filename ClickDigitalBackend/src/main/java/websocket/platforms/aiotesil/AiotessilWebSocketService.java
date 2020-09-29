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

import com.fasterxml.jackson.databind.ObjectMapper;
import devicemanager.DeviceManager;
import devicemanager.Models.Device;
import exceptions.*;
import org.apache.logging.log4j.Logger;
import org.glassfish.jersey.client.ClientConfig;
import org.glassfish.jersey.client.JerseyClientBuilder;
import org.glassfish.jersey.client.JerseyWebTarget;
import platformmanager.Platform;
import platformmanager.PlatformManager;
import platforms.aiotessil.RequestHelper;
import platforms.aiotessil.models.DeviceIds;
import platforms.aiotessil.models.Observation;
import platforms.openHab.Models.SseEventData;
import services.IdTranslator;
import services.UtilityService;
import websocket.models.EntityStateChangeResponse;
import websocket.platforms.PlatformWebSocketService;

import javax.rmi.CORBA.Util;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.GenericType;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.sse.InboundSseEvent;
import javax.ws.rs.sse.SseEventSource;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.function.Consumer;

import static org.apache.logging.log4j.LogManager.getLogger;

/**
 * This class builds up an own sse stream to its own backend, to catch the events that are sent from aitoes to the callback url {@link SubscriptionReceiver}
 */
public class AiotessilWebSocketService extends PlatformWebSocketService {

    private SseEventSource eventSource;
    Logger logger = getLogger(AiotessilWebSocketService.class);
    PlatformManager platformManager = new PlatformManager();
    RequestHelper requestHelper;

    {
        try {
            requestHelper = new RequestHelper(platformManager.getConnectionInfo(userId, platformId, projectId));
        } catch (PlatformNotFoundException e) {
            e.printStackTrace();
        }
    }

    public AiotessilWebSocketService(String platformId, String projectId, String userId) {
        super(platformId, projectId, userId);
    }

    @Override
    public void entityStateChanged(Consumer<String> messageSender) throws InvalidIdentificationNumberException, InvalidParameterException {
        JerseyWebTarget wt = JerseyClientBuilder.createClient(new ClientConfig())
                .target(UtilityService.getConfigProperty(UtilityService.PropertyKeys.HTTP_MODE.toString())
                        + "://"
                        + platformManager.getAiotesConfig(userId, projectId).systemIp
                        + ":"
                        + platformManager.getAiotesConfig(userId, projectId).clickdigitalPort
                        + "/"
                        + UtilityService.getConfigProperty(UtilityService.PropertyKeys.EXPLODED_PATH.toString())
                        + "/messageReceiver/listen/" + projectId); //build sse to own backend

        DeviceManager deviceManager = new DeviceManager();

        List<Device> devices = deviceManager.getAllDevicesByPlatform(platformId, userId, projectId);

        DeviceIds deviceIds;

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

        for (Device device : devices) {
                if (subscribedDevices != null)
                    if (subscribedDevices.stream().noneMatch(x -> {
                        try {
                            return x.deviceIds.contains(IdTranslator.internalIdToExternalD(device.deviceId, 1));
                        } catch (InvalidIdentificationNumberException e) {
                            e.printStackTrace();
                        } catch (InvalidParameterException e) {
                            e.printStackTrace();
                        }
                        return true; // if an error occurs dont subscribe to that device in case it is already registerd
                    })) {
                        deviceIds = new DeviceIds();
                        deviceIds.deviceIds.add(IdTranslator.internalIdToExternalD(device.deviceId, 1));
                        try {
                            requestHelper.sendPostRequest("/subscriptions", "Client-ID", projectId,
                                    new String[]{},
                                    new Object[]{},
                                    new String[]{},
                                    new Object[]{},
                                    MediaType.APPLICATION_JSON_TYPE,
                                    deviceIds
                            );
                        } catch (PlatformDataProcessingException e) {
                            e.printStackTrace();
                        }
                    }
        }

        eventSource = SseEventSource
                .target(wt)
                .build();
        eventSource.register((event) -> {
            try {
                processItemChangedEvent(event, messageSender);
            } catch (InvalidIdentificationNumberException e) {
                e.printStackTrace();
            }
        });
        eventSource.open();


    }

    @Override
    public void deviceStatusChanged(Consumer<String> messageSender) {

    }

    @Override
    public void deviceDiscovered(Consumer<String> messageSender) {

    }

    @Override
    public void ruleStateChanged(Consumer<String> messageSender, String userID) {

    }

    private void processItemChangedEvent(InboundSseEvent event, Consumer<String> messageSender) throws InvalidIdentificationNumberException {
        Subscription subscription = event.readData(Subscription.class, MediaType.APPLICATION_JSON_TYPE);
        String platformId = IdTranslator.serializePlatformId(subscription.externalPlatformId, PlatformManager.AIOTESSILID);
        String deviceId = IdTranslator.externalIdToInternalID(platformId, subscription.externalDeviceId);

        //external device Id is simultaneously entity id
        messageSender.accept(new EntityStateChangeResponse(subscription.dateTime, deviceId, subscription.externalDeviceId, subscription.value).toJson());
    }

    @Override
    public void onClose() {

    }
}
