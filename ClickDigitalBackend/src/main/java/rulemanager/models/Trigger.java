package rulemanager.models;

import com.fasterxml.jackson.annotation.JsonAutoDetect;

/**

 * An object of this class represents a internal trigger.
 */
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class Trigger {

    public String name = "";
    public int ID = 0;
    public String triggerclass = "";
    public String deviceID = "";
    public String sensorID = "";
    public Condition condition = null;

    public Trigger(){}
}
