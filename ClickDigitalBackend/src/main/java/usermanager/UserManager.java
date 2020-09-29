package usermanager;


import acpmanager.logfilter.Log;
import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoCursor;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.result.DeleteResult;
import com.sun.istack.internal.Nullable;
import devicemanager.Models.Device;
import exceptions.*;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.apache.logging.log4j.*;
import org.json.*;
import platformmanager.Platform;
import platformmanager.PlatformManager;
import services.EMailSender;
import services.LogConstants;
import services.UtilityService;

import javax.mail.MessagingException;
import javax.rmi.CORBA.Util;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import java.io.UnsupportedEncodingException;
import java.security.Key;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.security.NoSuchAlgorithmException;

import static com.mongodb.client.model.Filters.all;
import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Updates.combine;
import static com.mongodb.client.model.Updates.set;
import static services.UtilityService.*;


import usersessionmanager.*;

/**

 * This class manages all ruleActions arround a {@link User}
 */
@Path("/user")
public class UserManager {


    private MongoDatabase database;
    private MongoCollection<User> userCollection;
    private MongoCollection<frontend.models.User> frontendUserColelction;
    private UserPasswordHasher pwdHasherPBKDF2 = new UserPasswordHasher();
    private UserSessionManager userSessionManager = new UserSessionManager();
    private final static Logger logger = LogManager.getLogger(UserManager.class.getName());
    // We need a signing key, so we'll create one just for this example. Usually
    // the key would be read from your application configuration instead.
    private final String SECRET = "ysirex0FlMFZFzaGpey2PiefJLx3jqXT";
    private final Key KEY = Keys.hmacShaKeyFor(SECRET.getBytes("UTF-8"));
    public final static String TAG_USERID = "userId";
    private static final String FIELDEMAIL = "email";

    //**
    private  final String FIELDUSERNAME = "username";
    private  final String FIELDFIRSTNAME = "firstname";
    private  final String FIELDSURNAME = "surname";
    private  final String FIELDCONFIRMED= "confirmed";
    private final String FRONTENDFIELDID = "id";
    private String httpMode= "https";

    public UserManager() throws UnsupportedEncodingException {
        database = getDatabase(PropertyKeys.BACKEND_DATABASE_NAME);
        userCollection = database.getCollection(USERCOLLECTIONSTRING, User.class);
        database = getDatabase(PropertyKeys.FRONTEND_DATABASE_NAME);
        frontendUserColelction = database.getCollection("Users", frontend.models.User.class);
        httpMode= UtilityService.getConfigProperty(PropertyKeys.HTTP_MODE.toString());
    }


    /**
     * This method checks if the users data is valid.
     *
     * @param username the user's username
     * @param password the user's password
     * @return {@link User#userId}
     * @throws MissingDatabaseEntryException
     */
    @Path("/login")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public UserId login(@Context HttpServletRequest request, @Context HttpServletResponse response, @QueryParam("username") String username, @QueryParam("password") String password) throws InvalidUserDataException, InvalidSessionException {
        User user;
        try {
            user = loadUserFromDatabase(null, username);
        } catch (MissingDatabaseEntryException e) {
            user = new User("123", "empty", "asd");
            user.password = "1000000:ffffffffffffffffffffffffffffffff:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
            pwdHasherPBKDF2.validateUser(user, password);
            logger.log(Level.WARN, (new Log(LogConstants.EMPTY_FIELD, LogConstants.LOGIN, LogConstants.EMPTY_FIELD, LogConstants.FAILED)).toString());
            throw new InvalidUserDataException("Username and password do not match");
        }
        if (!user.confirmed) {
            logger.log(Level.WARN, (new Log(user.toString(), LogConstants.LOGIN, LogConstants.EMPTY_FIELD, LogConstants.FAILED)));
            throw new InvalidUserDataException("We have sent you a confirmation mail. Please confirm your email first.");
        }
        if (!pwdHasherPBKDF2.validateUser(user, password)) {
            logger.log(Level.WARN, (new Log(user.toString(), LogConstants.LOGIN, LogConstants.EMPTY_FIELD, LogConstants.FAILED)));
            throw new InvalidUserDataException("Username and password do not match.");
        }

        try {
            response.addCookie(userSessionManager.createUserSession(user, request.getRemoteAddr()));
        } catch (NoSuchAlgorithmException e) {
            logger.log(Level.WARN, (new Log(user.toString(), LogConstants.LOGIN, LogConstants.EMPTY_FIELD, LogConstants.FAILED)));
            throw new InvalidSessionException("Error creating session");
        }

        logger.log(Level.INFO, (new Log(user.toString(), LogConstants.LOGIN, LogConstants.EMPTY_FIELD, LogConstants.SUCCESS)).toString());
        return new UserId(user.userId);
    }

    /**
     * This method is called to register a new {@link User}. It checks if the user email is already registered and calls the method {@link UserManager#sendEmail(User)}
     * to send an email verification link
     *
     * @param user the new user
     * @throws MessagingException         if an error during sending the verification mail occurs
     * @throws UserAlreadyExistsException if the email is already registered
     */
    @Path("/create")
    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public UserId create_account(User user) throws MessagingException, UserAlreadyExistsException, NoSuchAlgorithmException {
        if (userCollection.find(eq(FIELDUSERNAME, user.username)).first() != null) {
            logger.log(Level.WARN, (new Log(user.toString(), LogConstants.CREATE_ACCOUNT, user.toString(), LogConstants.FAILED)).toString());
            throw new UserAlreadyExistsException("Username is already registered.");
        }

        if (userCollection.find(eq(FIELDEMAIL, user.email)).first() != null) {
            logger.log(Level.WARN, (new Log(user.toString(), LogConstants.CREATE_ACCOUNT, user.toString(), LogConstants.FAILED)).toString());
            throw new UserAlreadyExistsException("Email is already registered.");
        }

        user.userId = UUID.randomUUID().toString();
        user.token = null;
        pwdHasherPBKDF2.createUserWithHashedPassword(user);


        if (UtilityService.getConfigProperty(PropertyKeys.IS_DEVELOPER.toString()).equals("false")) {
            user.confirmed = false;
            sendEmail(user);
        } else {
            user.confirmed = true;
        }

        userCollection.insertOne(user);
        logger.log(Level.INFO, (new Log(user.toString(), LogConstants.CREATE_ACCOUNT, user.toString(), LogConstants.SUCCESS)).toString());
        return new UserId(user.userId);
    }

    /**
     * This method is called to terminate open Connections to the various IOT Platforms
     *
     * @param id The users id
     * @return A boolean value indicating success or failure
     */
    @GET
    @Path("/{id}/logout")
    @Produces(MediaType.APPLICATION_JSON)
    public String logout(@Context HttpServletRequest request, @PathParam("id") String id) throws MissingDatabaseEntryException, InvalidSessionException {
        String user = getUserString(id, null);

        userSessionManager.invalidateUserSession(request.getCookies(), request.getRemoteAddr());
        logger.log(Level.INFO, (new Log(user, LogConstants.LOGOUT, user, LogConstants.SUCCESS)));
        return new JSONObject().put("success", "true").put("message", "user " + user + " logged out").toString();
    }

    @Path("{id}")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public User getUser(@PathParam("id") String id) throws MissingDatabaseEntryException {
        return loadUserFromDatabase(id, null);
    }

    /**
     * This method is called to get all users
     *
     * @return list of users
     * @throws MissingDatabaseEntryException
     */
    @Path("/getAllUsers")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public ArrayList<User> getAllUsers() throws MissingDatabaseEntryException {
        ArrayList<User> userList = new ArrayList<>();
        for (User user : userCollection.find()) {
            userList.add(user);
        }
        return userList;
    }

    /**
     * This method loads a user from the database either by id or email
     *
     * @param id       the id of the requested user
     * @param username the email of the requested user
     * @return a {@link User}
     * @throws MissingDatabaseEntryException if user was not found
     */

    private User loadUserFromDatabase(@Nullable String id, @Nullable String username) throws MissingDatabaseEntryException {
        User user = null;
        if (username == null)
            user = userCollection.find(eq(TAG_USERID, id)).first();
        else if (id == null)
            user = userCollection.find(eq(FIELDUSERNAME, username)).first();

        if (user == null) {
            logger.log(Level.ERROR, (new Log(LogConstants.EMPTY_FIELD, LogConstants.LOAD_USER, LogConstants.EMPTY_FIELD, LogConstants.FAILED)).toString());
            throw new MissingDatabaseEntryException("User not found in Database");
        }

        return user;
    }

    /**
     * This method deletes every object from the user with userId in all collections
     *
     * @param userId of the user to delete
     * @throws DeletionException
     */
    public void deleteAccount(String userId) throws DeletionException, InvalidParameterException, DatabaseDataProcessingException, InvalidIdentificationNumberException, MissingDatabaseEntryException, PlatformDataProcessingException {
        String userString = getUserString(userId, null);


        // in frontend db löschen
        MongoDatabase frontenddb = getDatabase(PropertyKeys.FRONTEND_DATABASE_NAME);

        MongoCollection<frontend.models.User> userColl = frontenddb.getCollection("Users", frontend.models.User.class);
        MongoCollection<frontend.models.Project> projectColl = frontenddb.getCollection("Projects", frontend.models.Project.class);
        MongoCollection<frontend.models.Dashboard> dashboardColl = frontenddb.getCollection("Dashboards", frontend.models.Dashboard.class);
        MongoCollection<frontend.models.Sheet> sheetColl = frontenddb.getCollection("Sheets", frontend.models.Sheet.class);
        MongoCollection<frontend.models.Widget> widgetColl = frontenddb.getCollection("Widgets", frontend.models.Widget.class);

        frontend.models.User user = userColl.find(eq(FRONTENDFIELDID, userId)).first();
        frontend.models.Project project;
        frontend.models.Dashboard dashboard;
        frontend.models.Sheet sheet;
        if (user == null) {
            logger.log(Level.ERROR, (new Log(userString, LogConstants.DELETE_ACCOUNT, userString, LogConstants.FAILED)).toString());
            throw new DeletionException("There was an error deleting user data. [user]");
        }
        List<String> projectIds = user.projects;

        for (String projectId : projectIds) {
            project = projectColl.find(eq(FRONTENDFIELDID, projectId)).first();
            if (project == null) {
                logger.log(Level.ERROR, (new Log(userString, LogConstants.DELETE_PROJECT, projectId, LogConstants.FAILED)).toString());
                throw new DeletionException("There was an error deleting user data. [project]");
            }
            for (String dashboardId : project.dashboards) {
                dashboard = dashboardColl.find(eq(FRONTENDFIELDID, dashboardId)).first();
                if (dashboard == null) {
                    logger.log(Level.ERROR, (new Log(userString, LogConstants.DELETE_DASHBOARD, dashboardId, LogConstants.FAILED)).toString());
                    throw new DeletionException("There was an error deleting user data. [dashboard]");
                }
                for (String sheetId : dashboard.sheets) {
                    sheet = sheetColl.find(eq(FRONTENDFIELDID, sheetId)).first();
                    if (sheet == null) {
                        logger.log(Level.ERROR, (new Log(userString, LogConstants.DELETE_SHEET, sheetId, LogConstants.FAILED)).toString());
                        throw new DeletionException("There was an error deleting user data. [sheet]");
                    }
                    for (String widgetId : sheet.widgets) {
                        if (!widgetColl.deleteOne(eq(FRONTENDFIELDID, widgetId)).wasAcknowledged()) {
                            logger.log(Level.ERROR, (new Log(userString, LogConstants.DELETE_WIDGET, widgetId, LogConstants.FAILED)).toString());
                            throw new DeletionException("There was an error deleting user data. [widget]");
                        }
                    }
                    if (!sheetColl.deleteOne(eq(FRONTENDFIELDID, sheetId)).wasAcknowledged()) {
                        logger.log(Level.ERROR, (new Log(userString, LogConstants.DELETE_SHEET, sheetId, LogConstants.FAILED)).toString());
                        throw new DeletionException("There was an error deleting user data. [sheetColl]");
                    }
                }
                if (!dashboardColl.deleteOne(eq(FRONTENDFIELDID, dashboardId)).wasAcknowledged()) {
                    logger.log(Level.ERROR, (new Log(userString, LogConstants.DELETE_DASHBOARD, dashboardId, LogConstants.FAILED)).toString());
                    throw new DeletionException("There was an error deleting user data. [dashboardColl]");
                }
            }

            if (!projectColl.deleteOne(eq(FRONTENDFIELDID, projectId)).wasAcknowledged()) {
                logger.log(Level.ERROR, (new Log(userString, LogConstants.DELETE_PROJECT, projectId, LogConstants.FAILED)).toString());
                throw new DeletionException("There was an error deleting user data. [projectColl]");
            }
        }

        // delete user
        if (!userColl.deleteOne(eq(FRONTENDFIELDID, userId)).wasAcknowledged() ||
                !userCollection.deleteOne(eq(TAG_USERID, userId)).wasAcknowledged()) {
            logger.log(Level.ERROR, (new Log(userString, LogConstants.DELETE_USER, userString, LogConstants.FAILED)).toString());
            throw new DeletionException("There was an error deleting user data. [userColl]");
        }

        // delete all platforms
        PlatformManager platformManager = new PlatformManager();
        for (String projectId : projectIds) {
            List<Platform> platforms = platformManager.getConnectedPlatforms(userId, projectId);
            for (Platform platform : platforms) {
                platformManager.removePlatform(platform.platformId, userId, projectId);
            }
        }

        logger.log(Level.ERROR, (new Log(userString, LogConstants.DELETE_USER, userString, LogConstants.SUCCESS)).toString());
    }

    /**
     * This method is used to delete a user. All data that correspond to the user gets deleted
     * and the user session gets invalidated
     *
     * @param userId id of the user to delete
     * @throws DeletionException if there was an error while deletion
     */
    @DELETE
    @Path("{userId}/delete")
    @Produces(MediaType.APPLICATION_JSON)
    public void delete_account(@PathParam(TAG_USERID) String userId, @QueryParam("password") String password, @Context HttpServletRequest request) throws DeletionException, InvalidSessionException, InvalidIdentificationNumberException, DatabaseDataProcessingException, InvalidParameterException, MissingDatabaseEntryException, PlatformDataProcessingException {

        //check if the session is valid
        userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        String activeUserString = getUserString(userSessionManager.getUserID(request.getCookies()), null);
        String userString = getUserString(userId, null);
        User bckuser;
        try {
            bckuser = loadUserFromDatabase(userId, null);

            if (!pwdHasherPBKDF2.validateUser(bckuser, password)) {
                throw new DeletionException("Wrong Password!");
            }


        } catch (MissingDatabaseEntryException e) {
            e.printStackTrace();
            throw new DeletionException("Error loading User Data from Database");
        }
        deleteAccount(userId);
        userSessionManager.invalidateUserSession(request.getCookies(), request.getRemoteAddr());
        logger.log(Level.INFO, new Log(activeUserString, LogConstants.DELETE_ACCOUNT, userString, LogConstants.SUCCESS));
    }

    /**
     * This method is used to change the email of a registered user. After the change the user gets sent a new confirmation mail
     *
     * @param id    the id of the user
     * @param email the user with new parameters.
     * @throws MessagingException
     */
    @Path("/{id}/editMailAddress")
    @Produces("application/json")
    @Consumes(MediaType.TEXT_PLAIN)
    @PUT
    public void changeEmail(@QueryParam("password") String password, @PathParam("id") String id, String email, @Context HttpServletRequest request, @Context HttpServletResponse response) throws MessagingException, UserAlreadyExistsException, MissingDatabaseEntryException, InvalidSessionException, InvalidUserDataException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);

        String activeUserString = getUserString(userSessionManager.getUserID(request.getCookies()), null);

        User user = loadUserFromDatabase(id, null);
        if (userCollection.find(eq(FIELDEMAIL, email)).first() != null) {
            logger.log(Level.WARN, (new Log(activeUserString, LogConstants.CHANGE_EMAIL_ADDRESS, user.toString(), LogConstants.FAILED)));
            throw new UserAlreadyExistsException("Email is already registered.");
        }

        if (pwdHasherPBKDF2.validateUser(user, password)) {
            userCollection.updateOne(eq(TAG_USERID, id), combine(set("email", email), set("confirmed", false)));
            sendEmail(getUser(id));
            logger.log(Level.INFO, (new Log(activeUserString, LogConstants.CHANGE_EMAIL_ADDRESS, user.toString(), LogConstants.SUCCESS)));
        } else {
            logger.log(Level.ERROR, (new Log(activeUserString, LogConstants.DELETE_DASHBOARD, user.toString(), LogConstants.FAILED)));
            throw new InvalidUserDataException("Wrong Password");
        }
    }

    /**
     * This method is used to change the username of a registered user.
     *
     * @param id       the id of the user
     * @param username the user with new parameters.
     * @throws MessagingException
     */
    @Path("/{id}/editUsername")
    @Produces("application/json")
    @Consumes(MediaType.TEXT_PLAIN)
    @PUT
    public void changeUsername(@QueryParam("password") String password, @PathParam("id") String id, String username, @Context HttpServletRequest request, @Context HttpServletResponse response) throws UserAlreadyExistsException, InvalidSessionException, InvalidUserDataException {
        User user = null;
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);

        String activeUserString = getUserString(userSessionManager.getUserID(request.getCookies()), null);
        try {
            user = loadUserFromDatabase(id, null);

            if (userCollection.find(eq(FIELDUSERNAME, username)).first() != null)
                throw new UserAlreadyExistsException("Username is already existed.");
            if (pwdHasherPBKDF2.validateUser(user, password)) {
                userCollection.updateOne(eq(TAG_USERID, id), set("username", username));
                sendInfoEmail(user.email, "Your Username has been changed.");
                logger.log(Level.INFO, (new Log(activeUserString, LogConstants.CHANGE_USERNAME, user.toString(), LogConstants.SUCCESS)));
            } else {
                logger.log(Level.ERROR, (new Log(activeUserString, LogConstants.DELETE_DASHBOARD, user.toString(), LogConstants.FAILED)));
                throw new InvalidUserDataException("Wrong Password");
            }
        } catch (MissingDatabaseEntryException | MessagingException e) {
            e.printStackTrace();
            logger.log(Level.WARN, (new Log(activeUserString, LogConstants.CHANGE_USERNAME, user.toString(), LogConstants.FAILED)));
            throw new InvalidUserDataException("Error loading User Data from Database");
        }

    }

    /**
     * This method is used to change the firstname of a registered user.
     *
     * @param id        the id of the user
     * @param firstname the user with new parameters.
     * @throws MessagingException
     */
    @Path("/{id}/editFirstname")
    @Produces("application/json")
    @Consumes(MediaType.TEXT_PLAIN)
    @PUT
    public void changeFirstname(@QueryParam("password") String password, @PathParam("id") String id, String firstname, @Context HttpServletRequest request, @Context HttpServletResponse response) throws InvalidSessionException, InvalidUserDataException {
        User user = null;
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);
        String activeUserString = getUserString(userSessionManager.getUserID(request.getCookies()), null);

        try {
            user = loadUserFromDatabase(id, null);

            if (pwdHasherPBKDF2.validateUser(user, password)) {
                userCollection.updateOne(eq(TAG_USERID, id), set("firstname", firstname));
                sendInfoEmail(user.email, "Your Firstname has been changed.");
                logger.log(Level.INFO, (new Log(activeUserString, LogConstants.CHANGE_FIRSTNAME, user.toString(), LogConstants.SUCCESS)));
            } else {
                logger.log(Level.ERROR, (new Log(activeUserString, LogConstants.DELETE_DASHBOARD, user.toString(), LogConstants.FAILED)));
                throw new InvalidUserDataException("Wrong Password");
            }


        } catch (MissingDatabaseEntryException | MessagingException e) {
            logger.log(Level.WARN, (new Log(activeUserString, LogConstants.CHANGE_FIRSTNAME, user.toString(), LogConstants.FAILED)));
            throw new InvalidUserDataException("Error loading User Data from Database");
        }
    }

    /**
     * This method is used to change the surname of a registered user.
     *
     * @param id      the id of the user
     * @param surname the user with new parameters.
     * @throws MessagingException
     */
    @Path("/{id}/editSurname")
    @Produces("application/json")
    @Consumes(MediaType.TEXT_PLAIN)
    @PUT
    public void changeSurname(@QueryParam("password") String password, @PathParam("id") String id, String surname, @Context HttpServletRequest request, @Context HttpServletResponse response) throws InvalidSessionException, InvalidUserDataException {
        User user = null;
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);
        String activeUserString = getUserString(userSessionManager.getUserID(request.getCookies()), null);

        try {
            user = loadUserFromDatabase(id, null);

            if (pwdHasherPBKDF2.validateUser(user, password)) {
                userCollection.updateOne(eq(TAG_USERID, id), set("lastname", surname));
                sendInfoEmail(user.email, "Your Surname has been changed.");
                logger.log(Level.INFO, (new Log(activeUserString, LogConstants.CHANGE_SURNAME, user.toString(), LogConstants.SUCCESS)));
            } else {
                logger.log(Level.ERROR, (new Log(activeUserString, LogConstants.DELETE_DASHBOARD, user.toString(), LogConstants.FAILED)));
                throw new InvalidUserDataException("Wrong Password");
            }
        } catch (MissingDatabaseEntryException | MessagingException e) {
            e.printStackTrace();
            logger.log(Level.WARN, (new Log(activeUserString, LogConstants.CHANGE_SURNAME, user.toString(), LogConstants.FAILED)));
            throw new InvalidUserDataException("Error loading User Data from Database");
        }
    }


    /**
     * This method is used to change the password of a registered user.
     *
     * @param id       the id of the user
     * @param password the user with new parameters.
     * @throws MessagingException
     */
    @Path("/{id}/editPassword")
    @Produces("application/json")
    @Consumes(MediaType.TEXT_PLAIN)
    @PUT
    public void changePassword(@PathParam("id") String id, @QueryParam("oldpassword") String oldPassword, String password, @Context HttpServletRequest request, @Context HttpServletResponse response) throws InvalidUserDataException, InvalidSessionException {
        User user = null;
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);
        String activeUserString = getUserString(userSessionManager.getUserID(request.getCookies()), null);

        if (oldPassword.equals(password))
            throw new InvalidUserDataException("New password has to be different from the old password! Please try again.");

        try {
            user = loadUserFromDatabase(id, null);

            pwdHasherPBKDF2.changePasswordHash(user, password, oldPassword);

            userCollection.updateOne(eq(TAG_USERID, id), set("password", user.password));

            sendInfoEmail(user.email, "Your Password has been changed.");
            logger.log(Level.INFO, (new Log(activeUserString, LogConstants.CHANGE_PASSWORD, user.toString(), LogConstants.SUCCESS)));
        } catch (MissingDatabaseEntryException | MessagingException e) {
            logger.log(Level.WARN, (new Log(activeUserString, LogConstants.CHANGE_PASSWORD, user.toString(), LogConstants.FAILED)));
            throw new InvalidUserDataException("Error loading User Data from Database");
        }
    }

    /**
     * This method is used to confirm the email of a registered user. It is called through the activation link the user gets
     * send to in {@link UserManager#sendEmail(User)}
     *
     * @param hash the hashcode which is part of the url which was sent to the user
     * @return
     * @throws MessagingException
     * @throws MissingDatabaseEntryException if the user in the URL  is not registered in the database
     */
    @Path("/confirm")
    @Produces(MediaType.APPLICATION_JSON)
    @GET
    @Deprecated //implemented in frontend
    public void confirmUser(@QueryParam("token") String hash) throws MessagingException, MissingDatabaseEntryException, InvalidUserDataException {
        User user;
        Claims jwt;
        User activeUser = null;

        try {
            jwt = Jwts.parser().setSigningKey(KEY).parseClaimsJws(hash).getBody();
            //OK, we can trust this JWT
        } catch (JwtException e) {
            //don't trust the JWT!
            activeUser = loadUserFromDatabase(String.valueOf(((ExpiredJwtException) e).getClaims().get("id")), null);
            if (e.getClass() == ExpiredJwtException.class) {
                sendEmail(loadUserFromDatabase(String.valueOf(((ExpiredJwtException) e).getClaims().get("id")), null));
                logger.log(Level.WARN, (new Log(activeUser.toString(), LogConstants.CONFIRM_USER, activeUser.toString(), LogConstants.FAILED)));
                throw new InvalidUserDataException("Token expired. A new one has been sent");
            }
            logger.log(Level.WARN, (new Log(activeUser.toString(), LogConstants.CONFIRM_USER, activeUser.toString(), LogConstants.FAILED)));
            throw new InvalidUserDataException("Token invalid.");

        }

        try {
            user = loadUserFromDatabase(String.valueOf(jwt.get("id")), null);
        } catch (MissingDatabaseEntryException e) {
            e.printStackTrace();
            throw new InvalidUserDataException("User not found");
        }
        logger.log(Level.INFO, (new Log(user.toString(), LogConstants.CONFIRM_USER, user.toString(), LogConstants.SUCCESS)));

        user.confirmed = true;
        userCollection.updateOne(eq(TAG_USERID, user.userId), set("confirmed", true));
    }

    /**
     * Sends a reset link to the users email address
     *
     * @param email the email entered by the user
     * @return
     * @throws MessagingException
     */
    @Path("/forgotPassword")
    @Produces("application/json")
    @Consumes(MediaType.TEXT_PLAIN)
    @PUT
    public void requestPasswordReset(String email) throws MessagingException, InvalidUserDataException {
        User user;
        user = userCollection.find(eq(FIELDEMAIL, email)).first();

        sendResetEmail(email, user);

    }

    /**
     * @param token
     * @param password
     */
    @Path("/resetPassword")
    @Produces("application/json")
    @Consumes(MediaType.TEXT_PLAIN)
    @PUT
    public void forgotPassword(@QueryParam("token") String token, String password) throws InvalidUserDataException {
        User user;
        Claims jwt;

        try {
            jwt = Jwts.parser().setSigningKey(KEY).parseClaimsJws(token).getBody();
            //OK, we can trust this JWT
        } catch (JwtException e) {
            //don't trust the JWT!
            if (e.getClass() == ExpiredJwtException.class) {

                throw new JwtException("This link has expired.");//return "The reset link has expired. Please request a new one.";
            }
            throw new JwtException("Claim could not be verified");
            //return "The password reset failed. Please contact the system administrator.";
        }

        user = userCollection.find(eq(FIELDEMAIL, String.valueOf(jwt.get("email")))).first();

        if (user == null)
            throw new InvalidUserDataException("Error loading User Data from Database");

        if (user.token.equals("")) {
            logger.log(Level.WARN, (new Log(user.toString(), LogConstants.CHANGE_PASSWORD, user.toString(), LogConstants.FAILED)).toString());
            throw new InvalidUserDataException("User and Token do not match.");
        }
        pwdHasherPBKDF2.resetPasswordHash(user, password);
        userCollection.updateOne(eq(TAG_USERID, user.userId), set("password", user.password));
        userCollection.updateOne(eq(TAG_USERID, user.userId), set("token", ""));
        user.token = null;
        logger.log(Level.INFO, (new Log(user.toString(), LogConstants.CHANGE_PASSWORD, user.toString(), LogConstants.SUCCESS)).toString());

    }

    /**
     * This method builds a Password reset link for the user and sends it to his email
     *
     * @param email the email entered by the user
     * @param user  the user the reset link is being created for
     * @throws MessagingException
     */
    private void sendResetEmail(String email, User user) throws MessagingException {
        String jwt = Jwts.builder()
                .setIssuer("clickdigital.igd.fraunhofer.de")
                .setSubject("users/verification")
                .setExpiration(new Date(System.currentTimeMillis() + TimeUnit.HOURS.toMillis(1))) // the link expires after 1 hour
                .claim("email", email)
                .signWith(KEY)
                .compact();

        user.token = jwt;
        userCollection.updateOne(eq(TAG_USERID, user.userId), set("token", user.token));
        EMailSender.sendResetMail(email, httpMode+ "://" + getProperty(PropertyKeys.FRONTEND_IP) + ":" + getProperty(PropertyKeys.FRONTEND_PORT) + "/#resetPassword?token=" + jwt);


    }

    /**
     * This method builds a verification link and sends it to thh user's mail
     *
     * @param user the user
     * @throws MessagingException
     */
    private void sendEmail(User user) throws MessagingException {
        String jwt = Jwts.builder()
                .setIssuer("clickdigital.igd.fraunhofer.de")
                .setSubject("users/verification")
                .setExpiration(new Date(System.currentTimeMillis() + TimeUnit.HOURS.toMillis(24))) // the link expires after 24 hours
                .claim("id", user.userId)
                .signWith(KEY)
                .compact();

        EMailSender.sendConfirmationMail(user.email, httpMode+ "://" + getProperty(PropertyKeys.FRONTEND_IP) + ":" + getProperty(PropertyKeys.FRONTEND_PORT) +"/#confirmEmail?token=" + jwt);

    }

    private void sendInfoEmail(String email, String content) throws MessagingException {
        EMailSender.sendInfoMail(email, content);
    }

    /**
     * This method delivers a property written in config.properties
     * @param propertyKey
     * @return
     */
    private String getProperty(PropertyKeys propertyKey){
        return UtilityService.getConfigProperty(propertyKey.toString());
    }

    /**
     * This method  returns the user id of a user related to a project.
     * @param projectId the project id
     * @return the user id
     */
    public String getUserFromProject(String projectId) {
        FindIterable<frontend.models.User> iterable = frontendUserColelction.find();
        MongoCursor<frontend.models.User> cursor = iterable.iterator();
        while(cursor.hasNext()){
            frontend.models.User user = cursor.next();
            for(String pId: user.projects){
                if(pId.equals(projectId))
                    return user.id;
            }
        }

        return  null;

    }

}

