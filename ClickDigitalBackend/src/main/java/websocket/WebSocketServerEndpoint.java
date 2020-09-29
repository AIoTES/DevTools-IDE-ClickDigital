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
package  websocket;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import acpmanager.logfilter.Log;
import exceptions.MissingDatabaseEntryException;
import org.apache.logging.log4j.*;
import platformmanager.Platform;
import platformmanager.PlatformManager;
import services.LogConstants;
import websocket.platforms.PlatformWebSocketService;
import websocket.platforms.PlatformWebSocketServiceFactory;

import javax.websocket.*;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.List;

//import static services.UtilityService.getUsername;
import static services.UtilityService.loadUserFromDatabase;

/**
 * This class serves as an endpoint that can be accessed for a Websocket session.
 * After the session is opened, the server expects one message from the frontend containing the deviceId
 * and the sensorId of the target Sensor.
 * From then on, the server sends a message to the frontend endpoint whenever the status of the sensor changed.
 */
@ServerEndpoint(value = "/{userId}/{projectId}/webSocket/{topic}")
public class WebSocketServerEndpoint {
    private static Logger logger;

    /**
     * This is the current {@link Session}.
     */
    private Session session;

    /**
     * Gets the {@link #session} property.
     * @return The current {@link Session}.
     */
    public Session getSession(){return this.session;}

    /**
     * Sets the {@link #session} property.
     * @param session The {@link Session} to set.
     */
    public void setSession(Session session) {this.session = session;}

    /**
     * This is the service handling platform specific ruleActions to retrieve sensor status changes.
     */
    private PlatformWebSocketService webSocketService;

    /**
     * Gets the {@link #webSocketService} property.
     * @return The current {@link PlatformWebSocketService}.
     */
    public PlatformWebSocketService getPlatformWebSocketService(){return this.webSocketService;}

    /**
     * Sets the {@link #webSocketService} property.
     * @param platformWebSocketService The {@link PlatformWebSocketService} to set.
     */
    public void setPlatformWebSocketService(PlatformWebSocketService platformWebSocketService) {this.webSocketService = platformWebSocketService;}

    /**
     * This is the {@link PlatformWebSocketServiceFactory} to be used by this class.
     */
    private PlatformWebSocketServiceFactory serviceFactory = new PlatformWebSocketServiceFactory();

    /**
     * The default constructor for this class.
     */
    public WebSocketServerEndpoint(){};

    /**
     * This constructor reveals the dependencies of this class and is used for instantiation in
     * test classes and injecting mocks.
     * @param serviceFactory The {@link PlatformWebSocketServiceFactory} to be used by this class.
     */
    public WebSocketServerEndpoint(PlatformWebSocketServiceFactory serviceFactory){
        this.serviceFactory = serviceFactory;
    }

    /**
     * This method is executed when the Websocket connection is opened. It opens connections to all platforms of the requested project with the specific topic.
     * Each topic gets an own channel.
     * @param session The {@link Session} which is being opened.
     */
    @OnOpen
    public void onOpen(Session session,
                       @PathParam("userId") String userId,
                       @PathParam("projectId") String projectId,
                       @PathParam("topic") String topic) {
        logger = LogManager.getLogger(WebSocketServerEndpoint.class.getName());
        try{
            logger.log(Level.INFO, (new Log(loadUserFromDatabase(userId, null).toString(), LogConstants.OPEN_WEBSOCKET, LogConstants.EMPTY_FIELD, LogConstants.SUCCESS)).toString());
        }catch (MissingDatabaseEntryException e){

        }

        this.session = session;

        List<Platform> connectedPlatforms = new PlatformManager().getConnectedPlatforms(userId, projectId);

        logger.warn(" open socket connection for topic "+ topic);
        if(webSocketService != null){
            return;
        }

        for (Platform platform: connectedPlatforms) {
            try {
                webSocketService = serviceFactory.createPlatformWebSocketService(platform.platformId,userId, projectId);
                webSocketService.onOpen(topic, this::sendTextMessage, userId);
            } catch (Exception e) {
                closeSession(e.getMessage());
            }

        }
    }


    /**
     * Clean up and close the currently running {@link Session}.
     * This method is invoked when an error occurred while connecting to the platform or processing the received data.
     * @param reasonPhrase The reason for the closing of the {@link Session}.
     */
    private void closeSession(String reasonPhrase){
        try {
            closeService();
            session.close(new CloseReason(CloseReason.CloseCodes.UNEXPECTED_CONDITION, reasonPhrase));
        } catch (IOException e) {
            e.printStackTrace(); // No further handling required.
        }
    }

    /**
     * Sends a message to the other endpoint of the {@link Session} (which is the application frontend).
     * @param message The message to be sent to the frontend.
     */
    private void sendTextMessage(String message){
        RemoteEndpoint.Basic frontEnd = session.getBasicRemote();
        try {
            frontEnd.sendText(message);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * Invokes the clean up method of the {@link PlatformWebSocketService}, if it was instantiated.
     */
    private void closeService(){
        if(webSocketService != null){
            webSocketService.onClose();
            logger.log(Level.INFO, (new Log(LogConstants.EMPTY_FIELD, LogConstants.CLOSE_WEBSOCKET, LogConstants.EMPTY_FIELD, LogConstants.SUCCESS)).toString());
        }
    }

    /**
     * This method is called when the {@link Session} is closed.
     * It simply calls {@link #closeService()}.
     */
    @OnClose
    public void onClose(){
        closeService();
    }
}
