package rulemanager.models;

import com.fasterxml.jackson.annotation.JsonAutoDetect;

/**

 * An object of this class represents a internal triggergroup.
 */
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class Triggergroup {
    public String name = "";
    public int ID = 0;
    public String operator = "";
    public int leftchild = 0;
    public int rightchild = 0;
    public Trigger trigger = null;
    public String userId;
    public int triggerID;
    public String triggerclass;
    public String projectID;

    public Triggergroup(){}
}
