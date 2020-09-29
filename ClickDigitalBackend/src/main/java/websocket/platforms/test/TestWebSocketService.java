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
package  websocket.platforms.test;

import exceptions.PlatformDataProcessingException;
import websocket.models.EntityStateChangeResponse;
import websocket.platforms.PlatformWebSocketService;

import java.time.LocalDateTime;
import java.util.concurrent.ThreadLocalRandom;
import java.util.function.Consumer;

/**
 * This implementation of {@link PlatformWebSocketService} sends random dummy data.
 */
public class TestWebSocketService extends PlatformWebSocketService {

    /**
     * While this is true, the  method continues sending
     * test data to the frontend.
     */
    private boolean isOpen;

    public TestWebSocketService(String platformId) {
        super(platformId, null, null);
    }


    @Override
    public void entityStateChanged(Consumer<String> messageSender) {
        isOpen = true;

        String randomState;
        while (isOpen){
            String dateTime= LocalDateTime.now().toString();
            randomState = String.valueOf(ThreadLocalRandom.current().nextInt(100) + ThreadLocalRandom.current().nextFloat());
            messageSender.accept(new EntityStateChangeResponse(dateTime, "TestId", "TestEntityId", randomState).toJson());
            try {
                Thread.sleep(30000);
            } catch (InterruptedException e) {
                isOpen = false;
            }
        }

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


    /**
     * The method to be invoked when the Websocket connection is to be closed.
     * This method is for cleaning up in the instantiated class.
     */
    @Override
    public void onClose() {
        isOpen = false;
    }
}
