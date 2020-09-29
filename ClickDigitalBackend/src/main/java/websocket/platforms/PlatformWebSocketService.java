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
package  websocket.platforms;

import exceptions.InvalidIdentificationNumberException;
import exceptions.InvalidParameterException;
import exceptions.PlatformDataProcessingException;
import services.Constants;
import websocket.WebSocketServerEndpoint;

import java.util.function.Consumer;

/**

 * This abstract class provides in interface for classes which handle real-time retrieval of sensor status changes.
 * These changes are then sent to the frontend via Websocket (see {@link WebSocketServerEndpoint})
 * Classes derived from this class are to be instantiated via the {@link PlatformWebSocketServiceFactory} class.
 */
public abstract class PlatformWebSocketService {
    protected String platformId;
    protected String projectId;
    protected String userId;

    public PlatformWebSocketService(String platformId, String projectId, String userId){
        this.platformId = platformId;
        this.projectId = projectId;
        this.userId =userId;
    }

    /**
     * The method to be invoked when the Websocket connection was opened.
     *
     * @param topic         the topic on which the requester will subscribe
     * @param messageSender The method to be invoked on every sensor status update, which should consume a String and
     *                      send it to the frontend endpoint.
     */
    public void onOpen(String topic, Consumer<String> messageSender, String userID) throws InvalidParameterException, InvalidIdentificationNumberException {
        switch (topic) {
            case Constants
                    .ENTITYSTATECHANGED:
                entityStateChanged(messageSender);
                break;
            case Constants
                .DEVICESTATUSCHANGED:
                deviceStatusChanged(messageSender);
                break;
            case Constants
                    .DEVICEDISCOVERLISTENER:
                deviceDiscovered(messageSender);
                break;
            case Constants
                    .RULESTATUSCHANGED:
                ruleStateChanged(messageSender, userID);
                break;
            default:
                throw new InvalidParameterException("Topic " + topic + " is not a valid topic");

        }
    }

    /**
     * The method to be invoke when the requested subscription type is {@link services.Constants#ENTITYSTATECHANGED}
     *
     * @param messageSender The method to be invoked on every sensor status update, which should consume a String and
     *                      send it to the frontend endpoint.
     */
    public abstract void entityStateChanged(Consumer<String> messageSender) throws InvalidIdentificationNumberException, InvalidParameterException;

    /**
     * The method to be invoke when the requested subscription type is {@link services.Constants#DEVICESTATUSCHANGED}
     *
     * @param messageSender The method to be invoked on every sensor status update, which should consume a String and
     *                      send it to the frontend endpoint.
     */
    public abstract void deviceStatusChanged(Consumer<String> messageSender);

    /**
     * The method to be invoke when the requested subscription type is {@link services.Constants#DEVICEDISCOVERLISTENER}
     *
     * @param messageSender The method to be invoked on every sensor status update, which should consume a String and
     *                      send it to the frontend endpoint.
     */
    public abstract void deviceDiscovered(Consumer<String> messageSender);

    /**
     * The method to be invoke when the requested subscription type is {@link services.Constants#RULESTATUSCHANGED}
     *
     * @param messageSender The method to be invoked on every rule status update, which should consume a String and
     *                      send it to the frontend endpoint.
     */
    public abstract void ruleStateChanged(Consumer<String> messageSender, String userID);
    /**
     * The method to be invoked when the Websocket connection is to be closed.
     * This method is for cleaning up in the instantiated class.
     */
    public abstract void onClose();
}
