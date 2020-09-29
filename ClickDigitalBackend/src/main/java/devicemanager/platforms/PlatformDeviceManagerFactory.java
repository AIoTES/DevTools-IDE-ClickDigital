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
package devicemanager.platforms;

import devicemanager.Predicates;
import devicemanager.platforms.aiotessil.AiotesSilDeviceManager;
import devicemanager.platforms.openHab.OpenHabDeviceManager;
import exceptions.InvalidParameterException;
import exceptions.PlatformNotFoundException;
import platformmanager.PlatformManager;
import services.IdTranslator;

import java.io.IOException;

/**
 * Factory tom produce a specific devicemanger depending on the platform
 */
public class PlatformDeviceManagerFactory {

    public PlatformDeviceManager getPlatformDeviceManager(String id, String userId, String projectId) throws PlatformNotFoundException, InvalidParameterException, IOException {
        if(!Predicates.isValidId().test(id))
            throw new InvalidParameterException("Platform id is empty or null");

        String internalId= IdTranslator.deserializePlatformId(id)[1];
        switch (internalId){
            case PlatformManager.OPENHABID:
                return new OpenHabDeviceManager(userId, projectId, id);

            case PlatformManager.AIOTESSILID:
                return new AiotesSilDeviceManager(userId, projectId, id);

             default:
                 throw new PlatformNotFoundException("Platform not found");
        }
    }
}
