package rulemanager.models;

import com.fasterxml.jackson.annotation.JsonAutoDetect;

/**

 * An object of this class represents an internal rule action.
 */
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class RuleAction {
    public String name = "";
    public int ID = 0;
    public String deviceID = "";
    public String sensorID = "";
    public Condition condition = null;
    public int ConditionID;
    public String userId;
    public int ActionID;
    public int NextID;

    public RuleAction(){}

}
