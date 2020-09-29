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
import devicemanager.ActuatorType;
import devicemanager.EntityType;

import java.util.List;

//TODO rename actuator
/**
 * This class modulates an actuator.
 */

@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class Action {
    /**
     * the id of an action
     */
    public String id;

    /**
     * The type of a sensor {@link ActuatorType}
     */
    public String type;

    /**
     * the name of an action
     */
    public String name;

    /**
     * the corresponding device
     */
    public String deviceId;

    /**
     * the current state of an action
     */
    public int state;

    /**
     * different states are stored in this list
     */
    public List<StateOption> states ;

    public ValueOption getValueOption() {
        return valueOption;
    }

    public ValueOption valueOption;

    /**
     * the value represents the percentage of a state
     */
    public double value;

    /**
     * if there is an error with the device a note is stored here
     */
    public String errorReport;

    /**
     * indicates whether the action is controlled by states or by value e.g percentage
     */
    public boolean valueable;



    //TODO change const. to protected

    /**
     * This constructor is for an action which consists of states
     * @param id
     * @param name
     * @param deviceId
     * @param states
     * @param state
     * @param errorReport
     */
    public Action(String id, String name, String deviceId, List<StateOption> states, int state, String errorReport) {
        this.id = id;
        this.name = name;
        this.deviceId = deviceId;
        this.state = state;
        this.states = states;
        this.valueOption = valueOption;
        this.value = value;
        this.errorReport = errorReport;
        this.valueable = false;
    }

    /**
     * This constructor is for an action which consists of values
     * @param id
     * @param name
     * @param deviceId
     * @param valueOption
     * @param value
     * @param errorReport
     */
    public Action(String id, String name, String deviceId, ValueOption valueOption, double value, String errorReport) {
        this.id = id;
        this.name = name;
        this.deviceId = deviceId;
        this.state = state;
        this.states = states;
        this.valueOption = valueOption;
        this.value = value;
        this.errorReport = errorReport;
        this.valueable = true;
    }

    /**
     * This constructor is for a failed action
     * @param id
     * @param name
     * @param deviceId
     * @param errorReport
     */
    public Action(String id, String name, String deviceId, String errorReport){
        this.id = id;
        this.name = name;
        this.deviceId = deviceId;
        this.errorReport = errorReport;
    }




    public Action(){
        //dummy consttructor
    }


}
