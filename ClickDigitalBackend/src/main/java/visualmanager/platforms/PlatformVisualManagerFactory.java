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
package visualmanager.platforms;

import exceptions.PlatformNotFoundException;
import platformmanager.PlatformManager;
import services.IdTranslator;
import services.UtilityService;
import visualmanager.platforms.aiotessil.AiotesSilVisualManager;
import visualmanager.platforms.openhab.OpenHabVisualManager;
import visualmanager.platforms.test.TestVisualManager;

import java.io.IOException;

/**

 * Factory class which produces an instance of {@link PlatformVisualManager} for a given PlatformId.
 */
public class PlatformVisualManagerFactory {

    /**
     * The default constructor for this class.
     */
    public PlatformVisualManagerFactory(){}

    /**
     * Factory method which consumes the id of a platform and produces an instance of {@link PlatformVisualManager}
     * for that platform if the id is known, otherwise a {@link PlatformNotFoundException} is thrown.
     * @param id The id of the platform for which to produce the {@link PlatformVisualManager} instance.
     * @return An instance of a class derived from {@link PlatformVisualManager} which can retrieve visual data from a
     * specific platform.
     * @throws PlatformNotFoundException If the given id is not known.
     */
    public PlatformVisualManager CreatePlatformVisualManager(String id, String userId, String projectId) throws PlatformNotFoundException, IOException {
        if(UtilityService.IsNullOrEmpty(id)){
            throw new PlatformNotFoundException("Platform Id was null or empty.");
        }

        String internalId= IdTranslator.deserializePlatformId(id)[1];
        switch (internalId){
            case PlatformManager.OPENHABID:
                return new OpenHabVisualManager(userId, projectId, id);
            case PlatformManager.AIOTESSILID:
                return new AiotesSilVisualManager(userId, projectId, id);
            case "test":
                return new TestVisualManager(id);
            default:
                throw new PlatformNotFoundException("Unknown id: " + id);
        }
    }
}
