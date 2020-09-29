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
package  websocket.models;

import services.Constants;

import static devicemanager.platforms.openHab.OpenHabDeviceManager.itemStateTranslator;

/**

 * This class represents the response for the frontend for a changed value of an entity of a device
 */
public class EntityStateChangeResponse extends Response {

    /**
     * The id of the device
     */
    public String deviceId;
    /**
     * The id of the entity (action or sensor)
     */
    public String entityId;
    /**
     * The new value
     */
    public String value;

    /**
     * The anomalyscore of the value
     */
    public String anomalyscore;


    /**
     * Constructor with all values to set except anomalyscore
     * @param deviceId the id of the device
     * @param entityId the action or sensor
     * @param value the new updated value
     */
    public EntityStateChangeResponse (String dateTime, String deviceId, String entityId, String value){
        this.dateTime= dateTime;
        this.topic = services.Constants.ENTITYSTATECHANGED;
        this.deviceId=deviceId;
        this.entityId=entityId;
        this.value = itemStateTranslator(value);
        this.anomalyscore = String.valueOf(-1f);
    }


    /**
     * Constructor with all values to set
     * @param deviceId the id of the device
     * @param entityId the action or sensor
     * @param value the new updated value
     * @param anomalyscore the new updated value
     */
    public EntityStateChangeResponse (String dateTime, String deviceId, String entityId, String value, String anomalyscore){
        this.dateTime= dateTime;
        this.topic = services.Constants.ENTITYSTATECHANGED;
        this.deviceId=deviceId;
        this.entityId=entityId;
        this.value = itemStateTranslator(value);
        this.anomalyscore = anomalyscore;
    }





}
