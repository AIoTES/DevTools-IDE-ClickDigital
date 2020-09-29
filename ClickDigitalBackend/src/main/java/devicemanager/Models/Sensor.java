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
package  devicemanager.Models;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import devicemanager.SensorType;

/**
 * This class modulates a sensor.
 */
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class Sensor {

    /**
     * the id of a sensor
     */
    public String id;

    /**
     * The id of the corresponding device.
     */
    public String deviceId;

    /**
     * the name of a sensor
     */
    public String name;

    /**
     * The type of a sensor. {@link SensorType}
     */
    public String type;

    /**
     * if there is an error with the device a note is stored here
     */
    String errorReport;

    public Sensor(String id, String name, String type){
        this.id=id;
        this.name=name;
        this.type = type;
    }

    public Sensor(){
        //dummy constructor
    }



}
