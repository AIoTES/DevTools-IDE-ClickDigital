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

/**

 * This class represents the response for the frontend for a changed status of a device
 */
public class DeviceDiscoveryResponse extends Response {

    /**
     * The name of the discovered device
     */
    public String name;

    /**
     * Constructor with all values to set
     */
    public DeviceDiscoveryResponse(String dateTime, String name){
        this.dateTime = dateTime;
        this.topic = Constants.DEVICEDISCOVERLISTENER;
        this.name = name;
    }



}
