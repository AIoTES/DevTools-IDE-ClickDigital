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
package platformmanager;

import com.fasterxml.jackson.annotation.JsonAutoDetect;

/**
 * This class models an IoTPlatform in CLickDigital.
 */
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class Platform {
    public String name;
    public String ip;
    public String port;
    public String username;
    public String password;
    public String platformId;
    public String userId;
    public String projectId;
    public String externalPlatformId;


    public Platform(){

    }


    public Platform(String name, String platformId){
        this.name = name;
        this.platformId = platformId;
    }




}
