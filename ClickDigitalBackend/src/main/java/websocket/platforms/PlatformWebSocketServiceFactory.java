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

import exceptions.PlatformNotFoundException;
import platformmanager.PlatformManager;
import platforms.openHab.Helper.RequestHelper;
import services.IdTranslator;
import services.UtilityService;
import websocket.platforms.aiotesil.AiotessilWebSocketService;
import websocket.platforms.openhab.OpenHabWebSocketService;
import websocket.platforms.test.TestWebSocketService;

import java.io.IOException;

/**

 * This factory class is used to instantiate an instance of a class derived from {@link PlatformWebSocketService}
 * for a given id.
 */
public class PlatformWebSocketServiceFactory {

    /**
     * This is the factory method used to produce instances of platform specific subclasses of {@link PlatformWebSocketService}.
     * @param platformId The id of the platform for which to produce the {@link PlatformWebSocketService}.
     * @return A subclass of {@link PlatformWebSocketService} for the platform specified by the given platform id.
     * @throws PlatformNotFoundException If the platform id is unknown.
     */
    public PlatformWebSocketService createPlatformWebSocketService(String platformId, String userId, String projectId) throws PlatformNotFoundException, IOException {
        if(UtilityService.IsNullOrEmpty(platformId)){
            throw new PlatformNotFoundException("Platform Id was null or empty.");
        }
        String internalId= IdTranslator.deserializePlatformId(platformId)[1];

        RequestHelper requestHelper = new RequestHelper(new PlatformManager().getConnectionInfo(userId, platformId, projectId));

        switch (internalId){
            case PlatformManager.OPENHABID: return new OpenHabWebSocketService(platformId, requestHelper, projectId, userId);
            case PlatformManager.AIOTESSILID: return new AiotessilWebSocketService(platformId, projectId, userId);
            case "test": return new TestWebSocketService(platformId);
            default: throw new PlatformNotFoundException("Unknown id: " + platformId);
        }
    }
}
