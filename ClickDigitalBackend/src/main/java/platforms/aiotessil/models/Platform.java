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
package  platforms.aiotessil.models;

/**
 * This class models a platform
 * at aiotes sil
 */
public class Platform {
   public String platformId;
   public String type;
   public String baseEndpoint;
   public String location;
   public String name;
   public String clientId;

    /**
     * Default constructor
     */
    public Platform(){}

    /**
     * Constructor to initialize all parameter
     * @param platformId the id of a platform
     * @param type type of a platform
     * @param baseEndpoint the endpoint of the base
     * @param location the location of the platform
     * @param name the name of the platform
     * @param clientId the id of the client
     */
    public Platform(String platformId, String type, String baseEndpoint, String location, String name, String clientId) {
        this.platformId = platformId;
        this.type = type;
        this.baseEndpoint = baseEndpoint;
        this.location = location;
        this.name = name;
        this.clientId = clientId;
    }
}
