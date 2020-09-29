package dataprotectionmanager;

import acpmanager.logfilter.Log;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoCursor;
import com.mongodb.client.MongoDatabase;

import exceptions.InvalidSessionException;
import exceptions.MissingDatabaseEntryException;
import org.apache.logging.log4j.*;
import services.LogConstants;
import usermanager.User;
import usersessionmanager.UserSessionManager;

import javax.mail.MessagingException;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import java.io.UnsupportedEncodingException;
import java.util.*;

import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Updates.set;
import static services.UtilityService.*;

/**
 * This class represents a dataprivacy manager. Through this dataprivacy manager the Frontend can access dataprivacy elements.
 * This class provides a REST interface as well.
 */

/**
 * @author 404
 */
@Path("/dataprivacy")
public class DataPrivacyManager {
    private MongoDatabase database;
    private MongoCollection<DataPrivacyElement> dataPrivacyCollection;
    private MongoCollection<User> userCollection;
    private UserSessionManager userSessionManager = new UserSessionManager();
    private final String FIELDID= "id";
    private final String FIELDUSERID= "userId";
    private final String FIELDTITLE = "title";
    private final String FIELDINUSE = "inUse";
    private final String FIELDCHECKED = "checked";
    private final String FIELDCHILDREN = "children";
    private static String[] TITLESOFPRIVACYSETTINGS;
    private static Logger logger = LogManager.getLogger(DataPrivacyManager.class.getName());

    public DataPrivacyManager() throws UnsupportedEncodingException {
        database = getDatabase(PropertyKeys.BACKEND_DATABASE_NAME);
        dataPrivacyCollection = database.getCollection(PRIVACYSETTINGSCOLLECTION, DataPrivacyElement.class);
        userCollection = database.getCollection(USERCOLLECTIONSTRING, User.class);
    }

    private ArrayList<String> getUserCheckedSettings(String userId) throws MissingDatabaseEntryException  {
        User user = userCollection.find(eq(FIELDUSERID, userId)).first();
        if (user == null) throw new MissingDatabaseEntryException("Not Found!");
        return user.checkedSettings;
    }

    /**
     * This method accepts an user id and returns the ids of the checked settings of the user.
     *
     * @param userId the id of a user
     * @return returns a list of ids
     * @throws MissingDatabaseEntryException
     * */
    @Path("/userSettings/{userId}")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public ArrayList<String> getUserSettings(@PathParam("userId") String userId) throws MissingDatabaseEntryException {
        return getUserCheckedSettings(userId);
    }

    /**
     * This method accepts a user id and the settings of the user and saves them in the backend database
     *
     *  @param settings the users settings
     *  @param userId the user id
     *  @throws MissingDatabaseEntryException
     **/
    @Path("/userSettings/{userId}/edit")
    @PUT
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public void changeDataPrivacySettings(HashMap<String, Boolean> settings, @PathParam("userId") String userId, @Context HttpServletRequest request) throws MissingDatabaseEntryException {
        User user = userCollection.find(eq(FIELDUSERID, userId)).first();
        final User activeUser;
        User tempUser;
        ArrayList<String> result = user.checkedSettings;

        settings.forEach((key, value) -> {
            if (!result.contains(key) && value) {
                result.add(key);
            } else if (result.contains(key) && !value) {
                result.remove(key);
            }
        });

        for (int i = 0; i < result.size(); i++ ) {
            if (!settings.containsKey(result.get(i))) {
                result.remove(i);
            }
        }

        try {
            tempUser = loadUserFromDatabase(userSessionManager.getUserID(request.getCookies()) ,null);
        }catch (InvalidSessionException e){
            tempUser = null;
        }
        activeUser = tempUser;
        settings.forEach((key, value) -> {
            logger.log(Level.INFO, (new Log(activeUser.toString(), LogConstants.SET_SETTING_TO + value, key, LogConstants.SUCCESS)));

        });


        userCollection.updateOne(eq(FIELDUSERID, userId), set("checkedSettings", result));
    }

    /**
     * This method saves a privacyelement to the backend database
     *
     * @param elm the element that is being added
     * @param request
     * @throws MessagingException if the id of the element is already in use
     */
    @Path("/add")
    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public void addPrivacyElement(DataPrivacyElement elm, @Context HttpServletRequest request) throws MessagingException {
        if(dataPrivacyCollection.find(eq(FIELDID, elm.id)).first() != null) throw new MessagingException("element already exists.");
        if (elm.id.equals("")) elm.id = UUID.randomUUID().toString();
        User activeUser = null;
        try {
            activeUser = loadUserFromDatabase(userSessionManager.getUserID(request.getCookies()), null);
        }catch (Exception e) { }

        logger.log(Level.INFO, (new Log(activeUser.toString(), LogConstants.ADMIN_ADD_PRIVACYELEMENT, elm.id, LogConstants.SUCCESS)));
        dataPrivacyCollection.insertOne(elm);
    }

    /**
     * This method saves every privacyelement of the array in the backand database
     *
     * @param elm the array with the elements that are being saved
     * @param request
     * @throws MessagingException if one of the ids of the elements is already in use
     */
    @Path("/addAll")
    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public void addPrivacyElement(DataPrivacyElement[] elm, @Context HttpServletRequest request) throws MessagingException {

        for (DataPrivacyElement currentElement : elm){
            this.addPrivacyElement(currentElement, request);

        }
    }

    /**
     * This method returns all dataprivacyelements stored in the database
     *
     * @return returns all available dataprivacyelements
     */
    @Path("/getAllElements")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public DataPrivacyElement[] getAllElements()  {
        ArrayList<DataPrivacyElement> dps = new ArrayList<>();

        MongoCursor cursor = dataPrivacyCollection.find().iterator(); //cursor auf "-1"
        while (cursor.hasNext()) {
            dps.add((DataPrivacyElement)cursor.next());
        }

        return dps.toArray(new DataPrivacyElement[dps.size()]);
    }

    /**
     * This method gets all dataprivacyelements stored in the database that fit the type
     *
     * @param type type of the wanted dataprivacyelements
     * @return returns all dataprivacyelements that fit the given type
     */
    @Path("/getAllElements/{type}")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public DataPrivacyElement[] getAllElements(@PathParam("type") String type) {
        switch (type) {
            case "onlyInUse": return Arrays.stream(getAllElements()).filter(i -> i.inUse ).toArray(DataPrivacyElement[]::new);
        }
        return null;
    }

    /**
     * This method returns all parent privacyelements (the ones without a contextID)
     *
     * @return all root privacyelements
     */
    @Path("/getAllRootElements")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public DataPrivacyElement[] getAllRootElements()  {
        ArrayList<DataPrivacyElement> dps = new ArrayList<>();

        MongoCursor cursor = dataPrivacyCollection.find().iterator(); //cursor auf "-1"
        while (cursor.hasNext()) {
            DataPrivacyElement elm = (DataPrivacyElement) cursor.next();
            if (elm.inUse && elm.contextID.equals("")) dps.add(elm);
        }

        return dps.toArray(new DataPrivacyElement[dps.size()]);
    }

    /**
     * This method returns all leaf privacyelements (the ones with contextID)
     *
     * @return all leaf privacyelements
     */
    @Path("/getAllLeafElements")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public DataPrivacyElement[] getAllLeafElements()  {
        ArrayList<DataPrivacyElement> dps = new ArrayList<>();

        MongoCursor cursor = dataPrivacyCollection.find().iterator(); //cursor auf "-1"
        while (cursor.hasNext()) {
            DataPrivacyElement elm = (DataPrivacyElement) cursor.next();
            if (elm.inUse && !elm.contextID.equals("")) dps.add(elm);
        }

        return dps.toArray(new DataPrivacyElement[dps.size()]);
    }

    /**
     * This method accepts an id of a dataprivacyelement and returns the dataprivacyelement with the given id
     *
     * @param id id of a dataprivacyelement
     * @return returns the fitting dataprivacyelement
     * @throws MissingDatabaseEntryException
     */
    @Path("{id}")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public DataPrivacyElement getElement(@PathParam("id") String id) throws MissingDatabaseEntryException {
        DataPrivacyElement dp = dataPrivacyCollection.find(eq(FIELDID, id)).first();

        if (dp == null) throw new MissingDatabaseEntryException("Not Found!");
        return dp;
    }

}

