package acpmanager;

import acpmanager.logfilter.Log;
import acpmanager.logfilter.LogFilter;
import acpmanager.logfilter.LogFilterDaterange;
import acpmanager.logfilter.LogFilterDaterangeUsername;
import com.mongodb.BasicDBObject;
import com.mongodb.DBObject;
import com.mongodb.DocumentToDBRefTransformer;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoCursor;
import com.mongodb.client.MongoDatabase;
import dataprotectionmanager.DataPrivacyBackup;
import dataprotectionmanager.DataPrivacyElement;
import exceptions.*;

import org.bson.Document;
import services.LogConstants;
import services.UtilityService;
import usermanager.User;
import usermanager.UserId;
import usermanager.UserManager;

import java.io.UnsupportedEncodingException;
import java.security.NoSuchAlgorithmException;
import java.util.*;
import javax.mail.MessagingException;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;


import static com.mongodb.client.model.Filters.eq;
import static services.UtilityService.*;

import org.apache.logging.log4j.*;

/**
 * This class manages all actions around an admin
 */
@Path("/acp")
public class ACPManager {
    private MongoDatabase db;
    private MongoCollection<DataPrivacyElement> privacyCollection;
    private MongoCollection<DataPrivacyBackup> privacyBackupCollection;
    private MongoCollection<User> userCollection;
    private UserManager userManager;
    private final String FIELDID = "_id";
    private final String FIELDUSERID = "userId";
    private final String FIELDUSERMAME = "username";
    private final String FIELDEMAIL =  "email";
    private final String FIELDCONTEXTID = "contextID";
    private final String FIELDDESCRIPTIONS = "descriptions";
    private static Logger logger = LogManager.getLogger(ACPManager.class.getName());

    public ACPManager() throws UnsupportedEncodingException {
        db = getDatabase(UtilityService.PropertyKeys.BACKEND_DATABASE_NAME);
        userCollection = db.getCollection(USERCOLLECTIONSTRING, User.class);
        privacyCollection = db.getCollection(PRIVACYSETTINGSCOLLECTION, DataPrivacyElement.class);
        privacyBackupCollection = db.getCollection(PRIVACYBACKUPSCOLLECTION, DataPrivacyBackup.class);

        userManager = new UserManager();

    }

    /* ---------------------------- USER ----------------------------*/
    private User getUser(String userID  ) {
        try {
            logger.log(Level.INFO, (new Log(LogConstants.EMPTY_FIELD, LogConstants.ADMIN_GET_USER, loadUserFromDatabase(userID, null).toString(), LogConstants.SUCCESS)));
        }catch (MissingDatabaseEntryException e){

        }
        return userCollection.find(eq(FIELDUSERID, userID)).first();
    }

    private boolean existUser(String userID) {
        return getUser(userID) != null;
    }

    private ArrayList<User> getArrayListOfUsers(String fromType) {
        ArrayList<User> result = new ArrayList<>();

        MongoCursor cursor = userCollection.find().iterator(); //cursor auf "-1"
        while (cursor.hasNext()) {
            User currentUser = (User)cursor.next();
            result.add(currentUser);
        }

        return result;
    }

    /**
     * This method is responsible for creating a new user
     *
	 * @param usr user object
	 * @return UserId
     */
    @Path("/user/add")
    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public UserId adduser(User usr) throws MessagingException, UserAlreadyExistsException, NoSuchAlgorithmException {
        logger.log(Level.INFO, (new Log(LogConstants.EMPTY_FIELD, LogConstants.ADMIN_ADD_ACCOUNT, usr.toString(), LogConstants.SUCCESS)));
        return userManager.create_account(usr);
    }
	
	/**
     * This method is responsible for updating user properties.
     *
	 * @param newUser object with new properties
	 * @param userID ID of user
     */
    @Path("/user/{userID}/update")
    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public void updateUser(User newUser, @PathParam("userID") String userID) throws MessagingException {
        if (!existUser(userID)) throw new MessagingException("user doesn't exist " + userID);
        User current = getUser(userID);

        if (!current.username.equals(newUser.username)) {
            if (userCollection.find(eq(FIELDUSERMAME, newUser.username)).first() != null) {
                logger.log(Level.WARN, (new Log(LogConstants.EMPTY_FIELD, LogConstants.ADMIN_UPDATE_ACCOUNT, current.toString(), LogConstants.FAILED)).toString());
                throw new MessagingException("this username already exists!");
            }
        } else if (!current.email.equals(newUser.email)) {
            if (userCollection.find(eq(FIELDEMAIL, newUser.email)).first() != null) {
                logger.log(Level.WARN, (new Log(LogConstants.EMPTY_FIELD, LogConstants.ADMIN_UPDATE_ACCOUNT, current.toString(), LogConstants.FAILED)).toString());
                throw new MessagingException("this email already exists!");
            }
        }
        logger.log(Level.INFO, (new Log(LogConstants.EMPTY_FIELD, LogConstants.ADMIN_UPDATE_ACCOUNT, current.toString(), LogConstants.SUCCESS)).toString());
        userCollection.replaceOne(eq(FIELDUSERID, userID), newUser);
    }

    /**
     * this method is responsible for returning a searched user
     *
	 * @param userID ID of user
	 * @return User
     */
    @Path("/user/{userID}")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public User getUserG(@PathParam("userID") String userID) throws MessagingException {
        if (!existUser(userID)) throw new MessagingException("user doesn't exist " + userID);
        return getUser(userID);
    }

    /**
     * this method is responsible for returning all users of a certain type
	 *
     * <the method is currently not complete due to lack of use of fromType>
	 *
	 * @param fromType specifies which characteristic is to be used for filtering
	 * @return User[] 
     */
    @Path("/user/all/{fromType}")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public User[] getAllUsers(@PathParam("fromType") String fromType) {
        ArrayList<User> result = getArrayListOfUsers(fromType);
        logger.log(Level.INFO, (new Log(LogConstants.EMPTY_FIELD, LogConstants.ADMIN_GET_ALL_USERS, "usertype:" + fromType, LogConstants.SUCCESS)).toString());
        return result.toArray(new User[result.size()]);
    }

    /**
     * the method is responsible for resetting the user passwords
	 *
	 * @param userID ID of user
     */
    @Path("/user/{userID}/resetPassword")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public void resetUserPassword(@PathParam("userID") String userID) throws MessagingException, InvalidUserDataException {
        if (!existUser(userID)) throw new MessagingException("user doesn't exist" + userID);
        User user = getUser(userID);
        userManager.requestPasswordReset(user.email);
        logger.log(Level.INFO, (new Log(LogConstants.EMPTY_FIELD, LogConstants.ADMIN_CHANGE_PASSWORD, userID, LogConstants.SUCCESS)).toString());
    }
	
    /**
     * the method is responsible for deleting a user
	 *
	 * @param userID ID of user
     */
    @Path("/user/{userID}/remove")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public void removeUser(@PathParam("userID") String userID) throws MessagingException, DeletionException, InvalidIdentificationNumberException, DatabaseDataProcessingException, InvalidParameterException, MissingDatabaseEntryException, PlatformDataProcessingException {
        if (!existUser(userID)) throw new MessagingException("user doesn't exist" + userID);
        User user = null;
        try {
            user = loadUserFromDatabase(userID, null);
        }catch (MissingDatabaseEntryException e) {}
        logger.log(Level.INFO, (new Log(LogConstants.EMPTY_FIELD, LogConstants.ADMIN_DELETE_ACCOUNT, user.toString(), LogConstants.SUCCESS)));
        userManager.deleteAccount(userID);
    }

    /* ---------------------------- PRIVACY ----------------------------*/
    private boolean existPrivacyElement(String elementID) {
        return getPrivacyElement(elementID) != null;
    }
    private DataPrivacyElement getPrivacyElement(String elementID) {
        return privacyCollection.find(eq(FIELDID, elementID)).first();
    }

    private ArrayList<DataPrivacyElement> getArrayListOfPrivacyElements() {
        return getArrayListOfPrivacyElements("default");
    }
    
	/**
     * this method is responsible for returning all data privacy elements
	 *
	 * @param type "root" for upper elements, "leaf" for subelements
	 * @return ArrayList<DataPrivacyElement>
     */
    private ArrayList<DataPrivacyElement> getArrayListOfPrivacyElements(String type) {
        ArrayList<DataPrivacyElement> result = new ArrayList<>();

        MongoCursor cursor = privacyCollection.find().iterator(); //cursor auf "-1"
        while (cursor.hasNext()) {
            DataPrivacyElement currentElement = (DataPrivacyElement)cursor.next();
            boolean addElement = true;
            switch (type) {
                case "root":
                    if (!currentElement.contextID.equals("")) addElement = false;
                    break;
                case "leaf":
                    if (currentElement.contextID.equals("")) addElement = false;
                    break;
            }
           if (addElement) result.add(currentElement);
        }

        return result;
    }

    /**
     * this method is responsible for returning all data privacy elements of a certain type
	 *
	 * @param fromType specifies which characteristic is to be used for filtering
	 * @return DataPrivacyElement[] 
     */
    @Path("/privacy/all/{fromType}")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public DataPrivacyElement[] getAllPrivacyElements(@PathParam("fromType") String fromType) {
        ArrayList<DataPrivacyElement> result = getArrayListOfPrivacyElements(fromType);
        logger.log(Level.INFO, (new Log(LogConstants.EMPTY_FIELD, LogConstants.ADMIN_GET_ALL_PRIVACYELEMENTS, "elementtype:" + fromType, LogConstants.SUCCESS)));

        return result.toArray(new DataPrivacyElement[result.size()]);
    }
    
	/**
     * this method is responsible for creating a new data privacy element
     *
	 * @param elm object
     */
    @Path("/privacy/add")
    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public void addPrivacyElement(DataPrivacyElement elm) throws MessagingException {
        if (privacyCollection.find(eq(FIELDID, elm.id)).first() != null) throw new MessagingException("element already exists");
        if (!elm.contextID.equals("") && privacyCollection.find(eq(FIELDID, elm.contextID)).first() == null) throw new MessagingException("contextID is invalid");

        if (elm.id.equals("")) elm.id = UUID.randomUUID().toString();
        logger.log(Level.INFO, (new Log(LogConstants.EMPTY_FIELD, LogConstants.ADMIN_ADD_PRIVACYELEMENT, elm.id, LogConstants.SUCCESS)).toString());
        privacyCollection.insertOne(elm);
    }

    private void addPrivacyElements(DataPrivacyElement[] elements)  throws MessagingException {
        addPrivacyElements(elements, false);
    }

    private void addPrivacyElements(DataPrivacyElement[] elements, boolean override) throws MessagingException {
        //Eingabesequenz festlegen
        ArrayList<DataPrivacyElement> rootElements = new ArrayList<DataPrivacyElement>();
        ArrayList<DataPrivacyElement> leafElements = new ArrayList<DataPrivacyElement>();

        for (DataPrivacyElement currentElement : elements) {
             if (!override || (override && !existPrivacyElement(currentElement.id))) {
                if (currentElement.contextID.equals("")) {
                    rootElements.add(currentElement);
                } else {
                    leafElements.add(currentElement);
                }
            } else {
               updatePrivacyElement(currentElement, currentElement.id);
           }
        }

        //Einfügen
        for (DataPrivacyElement currentElement : rootElements) addPrivacyElement(currentElement);
        for (DataPrivacyElement currentElement : leafElements) addPrivacyElement(currentElement);
    }

    /**
     * this method is responsible for returning the searched data privacy element
     *
	 * @param elementID ID of data privacy element
     */
    @Path("/privacy/{elementID}")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public DataPrivacyElement[] getPrivacyElementWithChilds(@PathParam("elementID") String elementID) throws MessagingException {
        if (!existPrivacyElement(elementID)) throw new MessagingException("element doesn't exist" + elementID);

        DataPrivacyElement parent = getPrivacyElement(elementID);
        ArrayList<DataPrivacyElement> result = new ArrayList<DataPrivacyElement>();
        result.add(parent);

        ArrayList<DataPrivacyElement> availableElements = getArrayListOfPrivacyElements();
        for (DataPrivacyElement elm : availableElements) {
            if (parent.id.equals(elm.contextID)) result.add(elm);
        }

        return result.toArray(new DataPrivacyElement[result.size()]);
    }

    /**
     * this method is responsible for updating data privacy elements
     *
	 * @param newElement object with new properties
	 * @param elementID ID of data privacy element
     */
    @Path("/privacy/{elementID}/update")
    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public void updatePrivacyElement(DataPrivacyElement newElement, @PathParam("elementID") String elementID) throws MessagingException {
        if (!existPrivacyElement(elementID)) throw new MessagingException("element doesn't exist" + elementID);
        if (!newElement.contextID.equals("") && privacyCollection.find(eq(FIELDID, newElement.contextID)).first() == null) throw new MessagingException("contextID is invalid");

        logger.log(Level.INFO, (new Log(LogConstants.EMPTY_FIELD, LogConstants.ADMIN_UPDATE_PRIVACYELEMENT, elementID, LogConstants.SUCCESS)).toString());
        if (elementID.equals(newElement.id)) {
            privacyCollection.replaceOne(eq(FIELDID, elementID), newElement);
        } else {
            String newID = newElement.id;
            privacyCollection.deleteOne(eq(FIELDID, elementID));
            addPrivacyElement(newElement);

            ArrayList<DataPrivacyElement> children = new ArrayList<>();

            MongoCursor cursor = privacyCollection.find(eq(FIELDCONTEXTID, elementID)).iterator();
            while (cursor.hasNext()) {
                DataPrivacyElement child = (DataPrivacyElement) cursor.next();

                privacyCollection.updateOne(eq(FIELDID, child.id), new Document("$set", new Document("contextID", newID)));
            }
        }
    }
	
    /**
     * this method is responsible for deleting a data privacy element
     *
     * @param elementID the ID of the data privacy element
     */
    @Path("/privacy/{elementID}/remove")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public void removePrivacyElement(@PathParam("elementID") String elementID) throws MessagingException {
        if (!existPrivacyElement(elementID)) throw new MessagingException("element doesn't exist" + elementID);
        logger.log(Level.INFO, (new Log(LogConstants.EMPTY_FIELD, LogConstants.ADMIN_DELETE_PRIVACYELEMENT, elementID, LogConstants.SUCCESS)).toString());
        privacyCollection.deleteMany(eq(FIELDCONTEXTID, elementID));
        privacyCollection.deleteOne(eq(FIELDID, elementID));
    }

    /* ---------------------------- PRIVACY_BACKUP ----------------------------*/
    private boolean existPrivacyBackup(String backupID) {
        return getPrivacyBackup(backupID) != null;
    }

    private DataPrivacyBackup getPrivacyBackup(String backupID) {
        return privacyBackupCollection.find(eq(FIELDID, backupID)).first();
    }

    /**
     * this method is responsible for returning all backups of a certain type
     *
	 * for the future:
	 * @param fromType specifies which characteristic is to be used for filtering
	 * @return DataPrivacyBackup[] 
     */
    @Path("/privacyBackup/all/{fromType}")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public DataPrivacyBackup[] getAllPrivacyBackups() {
        ArrayList<DataPrivacyBackup> result = new ArrayList<>();

        MongoCursor cursor = privacyBackupCollection.find().iterator(); //cursor auf "-1"
        while (cursor.hasNext()) {
            result.add((DataPrivacyBackup) cursor.next());
        }
        logger.log(Level.INFO, (new Log(LogConstants.EMPTY_FIELD, LogConstants.ADMIN_GET_ALL_PRIVACYBACKUPS, LogConstants.EMPTY_FIELD, LogConstants.SUCCESS)));

        return result.toArray(new DataPrivacyBackup[result.size()]);
    }
	
    /**
     * this method is responsible for deleting a backup
     *
	 * @param newElement object with new properties
     * @param backupID the ID of the backup
     */
    @Path("/privacyBackup/{backupID}/update")
    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public void updatePrivacyBackup(DataPrivacyBackup newElement, @PathParam("backupID") String backupID)  {
        if (backupID.equals("null") || !existPrivacyBackup(backupID)) {
            if (backupID.equals("null")) newElement.id = UUID.randomUUID().toString();

            privacyBackupCollection.insertOne(newElement);
        } else {
            privacyBackupCollection.replaceOne(eq(FIELDID, backupID), newElement);
        }
        logger.log(Level.INFO, (new Log(LogConstants.EMPTY_FIELD, LogConstants.ADMIN_UPDATE_PRIVACYBACKUP, backupID, LogConstants.SUCCESS)));
    }

    /**
     * this method is responsible for deleting a backup
     *
     * @param elementID the ID of the backup
     */
    @Path("/privacyBackup/{elementID}/remove")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public void removePrivacBackup(@PathParam("elementID") String elementID) throws MissingDatabaseEntryException {
        if (!existPrivacyBackup(elementID)) throw new MissingDatabaseEntryException("element doesn't exist" + elementID);
        logger.log(Level.INFO, (new Log(LogConstants.EMPTY_FIELD, LogConstants.ADMIN_DELETE_PRIVACYBACKUP, elementID, LogConstants.SUCCESS)));
        privacyBackupCollection.deleteOne(eq(FIELDID, elementID));
    }
	
	/**
     * this method is responsible for importing a backup
     *
     * @param elementID the ID of the backup
     * @param mode which mode was chose by user
     */
    @Path("/privacyBackup/{elementID}/import/{mode}")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public void importPrivacBackup(@PathParam("elementID") String elementID, @PathParam("mode") String mode) throws MessagingException {
        if (!existPrivacyBackup(elementID)) throw new MessagingException("element doesn't exist" + elementID);

        DataPrivacyBackup b = getPrivacyBackup(elementID);
        ArrayList<DataPrivacyElement> availableElements = this.getArrayListOfPrivacyElements();
        HashMap<String, DataPrivacyElement> insertionElements = b.content;

        switch (mode) {
            case "default":
                for (DataPrivacyElement elm : availableElements) if (insertionElements.containsKey(elm.id)) throw new MessagingException("element " + elm.title + " already exists");

                addPrivacyElements(insertionElements.values().toArray(new DataPrivacyElement[insertionElements.size()]));
                break;
            case "override":
                addPrivacyElements(insertionElements.values().toArray(new DataPrivacyElement[insertionElements.size()]), true);
                break;
            case "only":
                //Alle Elemente löschen
                for (DataPrivacyElement elm : availableElements) privacyCollection.deleteOne(eq(FIELDID, elm.id));
                addPrivacyElements(insertionElements.values().toArray(new DataPrivacyElement[insertionElements.size()]));
                break;
            default: throw new MessagingException("unknown mode!");
        }
        logger.log(Level.INFO, (new Log(LogConstants.EMPTY_FIELD, LogConstants.ADMIN_IMPORT_PRIVACYBACKUP, elementID, LogConstants.SUCCESS)));
    }

    /* ---------------------------- LOGS ----------------------------*/


    /**
     * This method returns the logs in the current logfile without filter
     *
     * @param offset number of logs that are being skipped
     * @param rows number of logs that are going to be returned
     * @return the logs in the current logfile
     */
    @Path("/logs/getLogsNoFilter/{offset}/{rows}")
    @Produces("application/json")
    @Consumes("application/json")
    @GET
    public Log[] getLogsNoFilter(@PathParam("offset") int offset, @PathParam("rows") int rows) {
        logger.log(Level.INFO, (new Log(LogConstants.EMPTY_FIELD, LogConstants.ADMIN_GET_LOGS, LogConstants.LOGS, LogConstants.SUCCESS)).toString());
        Calendar calendarFrom = new GregorianCalendar();
        calendarFrom.set(Calendar.MINUTE, 0);
        Calendar calendarTill = new GregorianCalendar();
        LogFilter filter = new LogFilterDaterange(offset, rows, calendarFrom, calendarTill);
        return filter.getLogs();

    }

    /**
     * This method returns the logs in the given date range
     *
     * @param offset number of logs that are being skipped
     * @param rows number of logs that is going to be returned
     * @param from first date of the date range
     * @param till second date of the date range
     * @return the logs in the given date range
     */
    @Path("/logs/getLogsDaterangeFilter/{from}/{till}/{offset}/{rows}")
    @Produces("application/json")
    @Consumes("application/json")
    @GET
    public Log[] getLogsDaterangeFilter(@PathParam("offset") int offset, @PathParam("rows") int rows,
                                       @PathParam("from") long from, @PathParam("till") long till) {

        Calendar calendarFrom = new GregorianCalendar();
        calendarFrom.setTimeInMillis(from);
        Calendar calendarTill = new GregorianCalendar();
        calendarTill.setTimeInMillis(till);
        LogFilter filter = new LogFilterDaterange(offset, rows, calendarFrom, calendarTill);
        return filter.getLogs();

    }

    /**
     * This method returns the logs in the given date range with the username filter
     *
     * @param offset number of logs that are being skipped
     * @param rows number of logs that is going to be returned
     * @param from first date of the date range
     * @param till second date of the date range
     * @param username after which the logs are filtered
     * @return logs in the given date range with the given username
     */
    @Path("/logs/getLogsUsernameDaterangeFilter/{from}/{till}/{username}/{offset}/{rows}")
    @Produces("application/json")
    @Consumes("application/json")
    @GET
    public Log[] getLogsUsernameDaterangeFilter(@PathParam("offset") int offset, @PathParam("rows") int rows,
                                        @PathParam("from") long from, @PathParam("till") long till,
                                                @PathParam("username") String username) {
        Calendar calendarFrom = new GregorianCalendar();
        calendarFrom.setTimeInMillis(from);
        Calendar calendarTill = new GregorianCalendar();
        calendarTill.setTimeInMillis(till);
        LogFilter filter = new LogFilterDaterangeUsername(offset, rows, calendarFrom, calendarTill, username);
        return filter.getLogs();


    }

}
