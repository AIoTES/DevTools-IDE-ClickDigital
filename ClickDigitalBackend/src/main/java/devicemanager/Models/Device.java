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
import devicemanager.DeviceType;
import devicemanager.SensorType;

import java.util.ArrayList;
import java.util.List;

/**
 * This class modulates a device with its senosrs and actuators
 */
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class Device {

    /**
     * the id of the platform the device belongs to
     */
    public String platformId;

    /**
     * the id of the user's project the device belongs to
     */
    public String projectId;

    /**
     * the type of the device. {@link DeviceType}
     */
    public String type;

    /**
     * the id of the user the device belongs to
     */
    public String userId;

    /**
     * the id of a device
     */
    public String deviceId;

    /**
     * the serial number of a device
     */

    public String serialNumber;

    /**
     * the name of a device
     */
    public String name;

    /**
     * the status of a devicemanager e.g. online, offline, maintenance
     * 0= offline, 1=online, 2 = maintenance, 3=error
     */
    public int status;

    /**
     * if there is an error with the device a note is stored here
     */
    public String errorReport;

    /**
     * the sensors (their ids) of a devicemanager are stored here
     */
    public List<Sensor> sensors=new ArrayList<>();

    /**
     * the ruleActions (their ids) of a device are stored here
     */
    public List<Action> actions=new ArrayList<>();


    /**
     * the tags wich correspond to a device
     */
    public List<String> filterTags= new ArrayList<>();
    /**
     * the by the device supported protocols
     */
    public List protocols = new ArrayList();

    public SensorType sensorType;

    public String location;


    /**
     * Constructor
     * @param serialNumber
     * @param name
     * @param id
     * @param status
     * @param sensors
     * @param actions
     * @param filterTags
     * @param protocols
     */
    public Device(String serialNumber, String name, String id, int status, List sensors, List actions, List filterTags, List protocols, String location){
        this.serialNumber=serialNumber;
        this.deviceId=id;
        this.name=name;
        this.status=status;
        this.sensors=sensors;
        this.actions=actions;
        this.filterTags=filterTags;
        this.protocols=protocols;
        this.location=location;
    }

    /**
     * dummy constructor, neede for Jersey
     */
    public Device(){
        //dummy constructor
    }

    public String getName(){return name;}


}
