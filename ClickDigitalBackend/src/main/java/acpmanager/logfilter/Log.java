package acpmanager.logfilter;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import org.apache.logging.log4j.Level;
import services.LogConstants;

@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class Log {
    /**
     * date and time the log was made
     */
    String date = LogConstants.EMPTY_FIELD;
    /**
     * priority of the log
     */
    String priority = LogConstants.EMPTY_FIELD;
    /**
     * class where the log was made
     */
    String source = LogConstants.EMPTY_FIELD;
    /**
     * the associated username
     */
    String username = LogConstants.EMPTY_FIELD;
    /**
     * the action that was performed
     */
    String action = LogConstants.EMPTY_FIELD;
    /**
     * the affected object
     */
    String object = LogConstants.EMPTY_FIELD;
    /**
     * states if action was successful or if it failed
     */
    String status = LogConstants.EMPTY_FIELD;


    public Log(String date, String priority, String source, String username, String action, String object, String status) {

        this.date = date;
        this.priority = priority;
        this.source = source;
        this.username = username;
        this.action = action;
        this.object = object;
        this.status = status;
    }

    public Log(String username, String action, String object, String status) {
        this.username = username;
        this.action = action;
        this.object = object;
        this.status = status;
    }


    public Log() {

    }

    @Override
    public String toString() {
        return username + " " + action + " " + object + " " + status;
    }

}
