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

import java.util.List;

/**
 * This class models an actuation input
 * at aiotes sil. It is the payload for sending a actuation message.
 */
public class ActuationInput {
   public String actuatorId;
   public String actuatorLocalId;
   public List<ActuationResult> actuationResultSet;


    /**
     * Default constructor
     */
    public ActuationInput(){}

    public ActuationInput(String actuatorId, String actuatorLocalId, List<ActuationResult> actuationResultSet){
        this.actuatorId= actuatorId;
        this.actuatorLocalId= actuatorLocalId;
        this.actuationResultSet= actuationResultSet;
    }

}
