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

 * This class represents the response for the frontend for a changed status of a device
 */
public class ThingStatusChangedResponse extends Response {

    /**
     * The id of the device
     */
    public String deviceId;
    /**
     * The new value (ONLINE, OFFLINE)
     */
    public String value;

    /**
     * Constructor with all values to set
     * @param deviceId the id of the device
     * @param value the new updated value
     */
    public ThingStatusChangedResponse(String dateTime, String deviceId, String value){
        this.dateTime = dateTime;
        this.topic = Constants.DEVICESTATUSCHANGED;
        this.deviceId=deviceId;
        this.value = value;
    }



}
