package usersessionmanager;

import acpmanager.logfilter.Log;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import exceptions.InvalidSessionException;
import exceptions.MissingDatabaseEntryException;
import org.apache.logging.log4j.Level;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import services.LogConstants;
import services.UtilityService;
import usermanager.User;
import usermanager.UserId;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.concurrent.TimeUnit;

import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Updates.combine;
import static com.mongodb.client.model.Updates.set;
import static services.UtilityService.*;

/**
 * @author Philipp Grenz
 * This class manages all actions arround a {@link UserSession}
 */
@Path("/session")
public class UserSessionManager {

    private final Logger logger = LogManager.getLogger(UserSessionManager.class.getName());
    private MongoDatabase database;
    private MongoCollection<UserSession> userSessionCollection;
    private MongoCollection<User> userCollection;
    private final String FIELDUSERID = "userId";
    private final String FIELDSESSIONID = "sessionId";
    private final String FIELDSESSIONEXPIRY = "sessionExpiryTime";
    private final String FIELDLASTSESSIONID = "lastSessionId";
    private final String FIELDNEXTUPDATE = "nextUpdate";


    public UserSessionManager(){
        database = getDatabase(UtilityService.PropertyKeys.BACKEND_DATABASE_NAME);
        userSessionCollection = database.getCollection(SESSIONCOLLECTION, UserSession.class);
        userCollection = database.getCollection(USERCOLLECTIONSTRING, User.class);
    }

    /**
     * called by the frontend to check if there's a user associated with the sent session id
     * @param request the request context
     * @return userId of the user that's associated with the sessionid
     * @throws InvalidSessionException throws if session is invalid
     */
    @Path("/")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public UserId restoreSession(@Context HttpServletRequest request, @Context HttpServletResponse response) throws InvalidSessionException {

        Cookie cookie = null;
        try {
            cookie = validateUserSession(request.getCookies(), request.getRemoteAddr());
        } catch(InvalidSessionException e) {}

        response.addCookie(cookie);

        return new UserId(getUserID(request.getCookies()));
    }

    /**
     * invalidates a session by removing it from the database
     * @param sessionID id of the session to be invalidated
     */
    private void removeUserSession(String sessionID){
        userSessionCollection.deleteOne(eq(FIELDSESSIONID, sessionID));
    }

    /**
     * refreshes a sessions id and duration
     * @param sessionId the id of the session to be refreshed
     * @throws NoSuchAlgorithmException
     */
    private synchronized Cookie refreshUserSession(String sessionId, UserSession session) {
        String newSessionId = null;
        //Check if the sessionId is the current one and if the last update was less than 5 minutes ago
        if (sessionId.equals(session.sessionId) && System.currentTimeMillis() < session.nextUpdate) {
            userSessionCollection.updateOne(eq(FIELDSESSIONID, sessionId),
                    set(FIELDSESSIONEXPIRY, System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(30))
            );
            newSessionId = sessionId;
        } else {
            //Check if the sessionId is the last one used and if the last update was less than 5 minutes ago
            if (sessionId.equals(session.lastSessionId) && System.currentTimeMillis() < session.nextUpdate) {
                userSessionCollection.updateOne(eq(FIELDLASTSESSIONID, sessionId),
                        set(FIELDSESSIONEXPIRY, System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(30))
                );
                newSessionId = session.sessionId;
            } else {
                //The last update of the sessionId was more than 5 minutes ago, sessionId will be updated
                //generate a secure random number as seed for our prng
                SecureRandom random = new SecureRandom();
                byte[] randomNumber = new byte[32];
                random.nextBytes(randomNumber);
                //generate the bytes of the session id based on the random number
                MessageDigest digest = null;
                try {
                    digest = MessageDigest.getInstance("SHA-256");
                } catch (NoSuchAlgorithmException e) {
                    e.printStackTrace();
                }
                byte[] sessionBytes = digest.digest(randomNumber);
                //convert the array of bytes to a string in hex format
                StringBuilder sb = new StringBuilder();
                for (byte b : sessionBytes) {
                    sb.append(String.format("%02X", b));
                }
                //update the user's session entry with the new id
                userSessionCollection.updateOne(eq(FIELDSESSIONID, sessionId),
                        combine(set(FIELDSESSIONID, sb.toString()),
                                set(FIELDSESSIONEXPIRY, System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(30)),
                                set(FIELDLASTSESSIONID, sessionId),
                                set(FIELDNEXTUPDATE, System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(5))
                        )
                );
                newSessionId = sb.toString();
            }
        }
        Cookie sessionCookie = new Cookie("Id", newSessionId);
        sessionCookie.setHttpOnly(true);
        //once Clickdigital is set up to only accept https uncomment following line
        //sessionCookie.setSecure(true);
        sessionCookie.setPath("/");
        return sessionCookie;
    }

    /**
     * creates a session for the given user
     * @param user the user that gets the session
     * @param ip the ip of the user logging in
     * @return the id of the session
     * @throws NoSuchAlgorithmException
     */
    public Cookie createUserSession(User user, String ip) throws NoSuchAlgorithmException {
        //If the user has an active Session it will be invalidated
        while(userSessionCollection.find(eq(FIELDUSERID, user.userId)).first()!=null)
            removeUserSession(userSessionCollection.find(eq(FIELDUSERID, user.userId)).first().sessionId);

        SecureRandom random = new SecureRandom();
        byte[] randomNumber = new byte[32];
        random.nextBytes(randomNumber);

        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] sessionBytes = digest.digest(randomNumber);

        StringBuilder sb = new StringBuilder();
        for (byte b : sessionBytes) {
            sb.append(String.format("%02X", b));
        }
        userSessionCollection.insertOne(new UserSession(user.userId, sb.toString(), user.role, ip));

        Cookie sessionCookie = new Cookie("Id", sb.toString());
        sessionCookie.setHttpOnly(true);
        //once Clickdigital is set up to only accept https uncomment following line
        //sessionCookie.setSecure(true);
        sessionCookie.setPath("/");
        return sessionCookie;
    }

    /**
     * validates the users session, changes the id if the last change was over 5 minutes ago
     * the previous sessionId will still be accepted
     * @param cookies the cookies of the request
     * @param userIp the users ip
     * @throws InvalidSessionException
     */
    public Cookie validateUserSession(Cookie[] cookies, String userIp) throws InvalidSessionException {
        UserSession session;
        User user = null;
        String userString = LogConstants.EMPTY_FIELD;

        if (cookies == null) {
            logger.log(Level.WARN, new Log(LogConstants.EMPTY_FIELD, LogConstants.VALIDATE_USER_SESSION, LogConstants.EMPTY_FIELD, LogConstants.FAILED));
            throw new InvalidSessionException("No session found");
        }

        try {
            user = loadUserFromDatabase(getUserID(cookies), null);
        } catch (MissingDatabaseEntryException e) { }
        if(user != null)
            userString = user.toString();

        for (Cookie cookie : cookies) {
            if("Id".equals(cookie.getName())){
                session = userSessionCollection.find(eq(FIELDSESSIONID, cookie.getValue())).first();

                if ( session == null )
                    session = userSessionCollection.find(eq(FIELDLASTSESSIONID, cookie.getValue())).first();

                if ( session == null ) {
                    logger.log(Level.WARN, new Log(userString, LogConstants.VALIDATE_USER_SESSION, userString, LogConstants.FAILED));
                    throw new InvalidSessionException("No session found");
                }

                if((session.sessionExpiryTime < System.currentTimeMillis()) || !session.ip.equals(userIp)){
                    removeUserSession(cookie.getValue());
                    logger.log(Level.WARN, new Log(userString, LogConstants.VALIDATE_USER_SESSION, userString, LogConstants.FAILED));
                    throw new InvalidSessionException("Session invalid");
                }
                return refreshUserSession(cookie.getValue(), session);
            }
        }
        logger.log(Level.WARN, new Log(userString, LogConstants.VALIDATE_USER_SESSION, userString, LogConstants.FAILED));
        throw new InvalidSessionException("No session found");
    }

    /**
     * Invalidates the given session
     * @param cookies request cookies
     * @param userIp the users ip
     * @throws InvalidSessionException when no session cookie was set
     */
    public void invalidateUserSession(Cookie[] cookies, String userIp) throws InvalidSessionException {
       if (cookies == null)
            throw new InvalidSessionException("No session found");

       for (Cookie cookie : cookies) {
           if("Id".equals(cookie.getName())){
               removeUserSession(cookie.getValue());
               return;
           }
       }
       throw new InvalidSessionException("No session found");
    }

    /**
     * Get the user associated with the given session id
     * @param cookies cookies of the request
     * @return the userId
     * @throws InvalidSessionException throws if session is invalid
     */
    public String getUserID(Cookie[] cookies) throws InvalidSessionException {
        String sessionId = null;
        if (cookies == null)
            throw new InvalidSessionException("No session found");

        for (Cookie cookie : cookies) {
            if("Id".equals(cookie.getName())){
                sessionId = cookie.getValue();
                break;
            }
        }

        UserSession session = userSessionCollection.find(eq(FIELDSESSIONID, sessionId)).first();
        if(session == null)
            session = userSessionCollection.find(eq(FIELDLASTSESSIONID, sessionId)).first();
        if(session == null)
            throw new InvalidSessionException("No session found");

        return session.userId;
    }

    /**
     * Get the role of the user associated with the given session id
     * @param cookies cookies of the request
     * @return the user's role
     * @throws InvalidSessionException throws if session is invalid
     */
    public String getUserRole(Cookie[] cookies) throws InvalidSessionException {
        String sessionId = null;
        if (cookies == null)
            throw new InvalidSessionException("No session found");

        for (Cookie cookie : cookies) {
            if("Id".equals(cookie.getName())){
                sessionId = cookie.getValue();
                break;
            }
        }

        UserSession session = userSessionCollection.find(eq(FIELDSESSIONID, sessionId)).first();
        if(session == null)
            session = userSessionCollection.find(eq(FIELDLASTSESSIONID, sessionId)).first();
        if(session == null)
            throw new InvalidSessionException("No session found");

        return session.userRole;
    }

}
