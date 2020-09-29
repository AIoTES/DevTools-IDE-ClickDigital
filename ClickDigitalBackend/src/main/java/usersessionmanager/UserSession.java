package usersessionmanager;


import com.fasterxml.jackson.annotation.JsonAutoDetect;

import java.util.concurrent.TimeUnit;

/**
 * @author Philipp Grenz
 * this class models the users session
 */
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class UserSession {

    /**
     * The user's id.
     */
    public String userId;

    /**
     * The user's role
     */
    public String userRole;

    /**
     * The unique sessionId will be updated after 5 minutes
     */
    public String sessionId;

    /**
     * The last id used by the session
     */
    public String lastSessionId;

    /**
     * The time the user's session expires in milliseconds
     */
    public long sessionExpiryTime;

    /**
     * The time the session was last used
     * If this was more than 5 minutes ago the sessionId will be updated
     */
    public long nextUpdate;

    /**
     * The Users IP. Don't use if App should be accessible from mobile
     */
    public String ip;

    public UserSession(String userId, String sessionId, String userRole, String ip){
        this.userId = userId;
        this.userRole = userRole;
        this.sessionId = sessionId;
        this.lastSessionId = sessionId;
        this.sessionExpiryTime = System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(30);
        this.nextUpdate = System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(5);
        this.ip = ip;
    }

    public UserSession(){}

}
