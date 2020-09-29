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
package  services;

import devicemanager.Predicates;
import exceptions.InvalidIdentificationNumberException;
import exceptions.InvalidParameterException;
import exceptions.PlatformDataProcessingException;

import javax.ws.rs.core.Response;

/**
 * This class offers methods to translate ids for platforms and backwards.
 */
public class IdTranslator {
    private static final char SEPERATOR = '_';


    /**
     * This method converts an internal Id to its external representation. Either to its parent platform or to its brother device id on the connected platform.
     * @param internalID the internal ClickDigital device id
     * @param kind 0 for platform id, 1 for external device id
     * @return an id (platform or external device id)
     * @throws InvalidIdentificationNumberException if identification number is empty or null
     * @throws InvalidParameterException if kind is not 0 or 1
     */
    public static String internalIdToExternalD(String internalID, int kind) throws InvalidIdentificationNumberException, InvalidParameterException {
        if(!Predicates.isValidId().test(internalID))
            throw new InvalidIdentificationNumberException("Identification number is empty or null");
        if(kind != 1 && kind !=0)
            throw new InvalidParameterException("Invalid Parameter: 'kind' can only be 0 or 1");

        String[] ids = new String[2];
        StringBuilder stringBuilder = new StringBuilder();
        int i = 0;
        while (!(internalID.charAt(i) == SEPERATOR)) {
            stringBuilder.append(internalID.charAt(i));
            i++;
        }
        internalID = internalID.substring(i + 1);
        int length = Integer.parseInt(stringBuilder.toString());
        ids[0] = internalID.substring(0, length);
        ids[1] = internalID.substring(length);

        return ids[kind];
    }

    /**
     * Produces an internal device id for click digital. An internal id consists of a platform id and the external device id.
     * @param id the id of the parent platform
     * @param externalId the id of the device on the parent platfrom
     * @return an internal id
     * @throws InvalidIdentificationNumberException if platform or external id is null or empty
     */
    public static String externalIdToInternalID(String id, String externalId) throws InvalidIdentificationNumberException {
        if(!Predicates.isValidId().test(id) || !Predicates.isValidId().test(externalId))
            throw new InvalidIdentificationNumberException("Identification number is empty or null");

        return new StringBuilder()
                .append(id.length())
                .append(SEPERATOR)
                .append(id)
                .append(externalId).toString();
    }

    /**
     * This method serializes a new unique id out of
     * @param externalPlatformId the id on which a platform is listed under an external platform (e.g. as in aiotes sil)
     * @param internalPlatformId the id which identifies the interface over which the requests from frontend are handled
     * @return a unique id
     */
    public static String serializePlatformId(String externalPlatformId, String internalPlatformId) throws InvalidIdentificationNumberException {
        if(!Predicates.isValidId().test(externalPlatformId)
                || !Predicates.isValidId().test(internalPlatformId))
            throw new InvalidIdentificationNumberException("One or more identification numbers are empty or null");

        return new StringBuilder()
                .append(externalPlatformId.length())
                .append(SEPERATOR)
                .append(externalPlatformId)
                .append(internalPlatformId.length())
                .append(SEPERATOR)
                .append(internalPlatformId).toString();

    }

    /**
     * This method deserialize a given platform into it three parts
     * @param platformId the id of the platform
     * @return an array with [0]= external platformId, [1]= internalPlatformId, [2] = instanceId (deprecated)
     */
    public static String[] deserializePlatformId(String platformId) {
        String[] ids = new String[2]; //length of 3 for instance id
        StringBuilder stringBuilder = new StringBuilder();
        int i = 0;
        while (!(platformId.charAt(i) == SEPERATOR)) {
            stringBuilder.append(platformId.charAt(i));
            i++;
        }
        i=i+1;
        int lengthOfExternalId = Integer.parseInt(stringBuilder.toString());
        ids[0] = platformId.substring(i,i + lengthOfExternalId); // external platform id
        i= lengthOfExternalId + stringBuilder.toString().length() +1 ;
        stringBuilder = new StringBuilder();
        while (!(platformId.charAt(i) == SEPERATOR)) {
            stringBuilder.append(platformId.charAt(i));
            i++;
        }
        i=i+1;
        int lengthOfInternalId = Integer.parseInt(stringBuilder.toString());
        ids[1] = platformId.substring(i, i + lengthOfInternalId);
        //ids[2] = platformId.substring(i + lengthOfInternalId); //for instance id
        return ids;
    }

    /**
     * Attempts to parse the id and the externalId from a given internalId.
     * @param internalId The internalId containing the id and the externalId to be parsed.
     * @return An array of 2 Strings containing the id first and the externalId secondly.
     * @throws PlatformDataProcessingException If one of the Ids could not be parsed successfully.
     */
    public static String[] tryParsePlatformAndExternalIds(String internalId) throws PlatformDataProcessingException {
        String[] externalIds = new String[2];
        try {
            externalIds[0] = IdTranslator.internalIdToExternalD(internalId, 0);
            externalIds[1] = IdTranslator.internalIdToExternalD(internalId, 1);
        } catch(Exception ex) {
            throw new PlatformDataProcessingException("An internal Id could not be converted to its corresponding external Id. Exception: "
                    + ex.toString(), Response.Status.BAD_REQUEST);
        }
        return externalIds;
    }
}
