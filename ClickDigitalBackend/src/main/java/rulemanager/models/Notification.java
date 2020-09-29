package rulemanager.models;

import com.fasterxml.jackson.annotation.JsonAutoDetect;

import java.util.Date;

/**

 * <p>
 * An object of this class represents an internal rule notification.
 */
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class Notification{

    public int ID;
    public String name;
    public boolean notified;
    public String relation;
    public int relationID;
    public String event;
    public Date date = null;
    public String userId;

    public Notification() {
    }
}
