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

import com.google.gson.Gson;

import static devicemanager.platforms.openHab.OpenHabDeviceManager.itemStateTranslator;

/**

 * This class represents the response for the frontend for a changed value of an entity of a device
 */
public abstract class Response {
    /**
     * Gson for json conversion in {@link this#toJson()}
     */
    private transient Gson gson = new Gson();

    /**
     * The topic of the subscription
     */
    public String topic;

    /**
     * The date and time of the registered event as ISO 8601 DateTime
     */
    public String dateTime;


    /**
     * This method converts this response to a JSON string
     * @return the json string
     */
    public String toJson (){
        return gson.toJson(this);
    }

}
