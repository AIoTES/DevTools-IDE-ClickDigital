/*
* Copyright 2017-2020 Fraunhofer Institute for Computer Graphics Research IGD
*
* Licensed under the GNU AFFERO GENERAL PUBLIC LICENSE, Version 3, 19 November 2007
* You may not use this work except in compliance with the Version 3 Licence.
* You may obtain a copy of the Licence at:
* https://www.gnu.org/licenses/agpl-3.0.html
*
* See the Licence for the specific permissions and limitations under the Licence.
*/
package  services;

import acpmanager.logfilter.Log;
import com.mongodb.MongoClient;
import com.mongodb.MongoClientURI;
import com.mongodb.client.MongoDatabase;
import exceptions.MissingDatabaseEntryException;
import org.apache.logging.log4j.Level;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.bson.codecs.configuration.CodecRegistry;
import org.bson.codecs.pojo.PojoCodecProvider;
import usermanager.User;

import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import static com.mongodb.client.model.Filters.eq;
import static org.bson.codecs.configuration.CodecRegistries.fromProviders;
import static org.bson.codecs.configuration.CodecRegistries.fromRegistries;


/**
 , Sebastian Clermont, Chinaedu Onwukwe
 * This class is used for common utilities and functions for the whole project.
 */
public class UtilityService {

    private final static Logger logger = LogManager.getLogger(UtilityService.class.getName());

    public final static String USERCOLLECTIONSTRING= "Users";
    public final static String DEVICESCOLLECTIONSTRING= "Devices";
    public final static String CONNECTEDPLATFORMSCOLLECTIONSTRING= "ConnectedPlatforms";
    public final static String PROJECTSCOLLECTIONSTRING= "Projects";
    public final static String PERSISTENCECOLLECTIONSTRING= "PersistenceNetwork";
    public final static String USERPRIVACYSETTINGSCOLLECTIONSTRING = "UserPrivacySettings";
    public final static String PRIVACYSETTINGSCOLLECTION = "PrivacySettings";
    public final static String PRIVACYBACKUPSCOLLECTION = "PrivacyBackups";
    public final static String SESSIONCOLLECTION = "Sessions";
    public final static String CONFIRMATIONEMAILCOLLECTION = "ConfirmationEMails";

    /**
     * This enum contains all known keys in the configuration file.
     */
    public enum PropertyKeys {
        OPENHAB_REST_URI,
        MONGO_DB_CONNECTION_STRING,
        BACKEND_DATABASE_NAME,
        FRONTEND_DATABASE_NAME,
        IS_DEVELOPER,
        SERVER_BACKEND_URL,
        HTTP_MODE,
        FRONTEND_IP,
        FRONTEND_PORT,
        EXPLODED_PATH
    };

    /**
     * The path to the config file relative to the classpath root.
     */
    private static final String CONFIG_PATH = "config.properties";

    private final static String connectionStringProperty = getConfigProperty(PropertyKeys.MONGO_DB_CONNECTION_STRING.toString());
    private final static MongoClient mongoClient = new MongoClient(new MongoClientURI(connectionStringProperty));
    private final static CodecRegistry pojoCodecRegistry = fromRegistries(MongoClient.getDefaultCodecRegistry(),
            fromProviders(PojoCodecProvider.builder().automatic(true).build()));

    /**
     * Gets a property from the config file for a given key.
     * @param propertyName The name of the property to get.
     * @return The property which was found in the config file or null if either the property or the config file
     *         could not be found.
     */
    public static String getConfigProperty(String propertyName) {

        if(IsNullOrEmpty(propertyName)){
            return null;
        }

        InputStream inputStream = UtilityService.class.getClassLoader().getResourceAsStream(CONFIG_PATH);

        if (inputStream == null){
            System.out.println("Input stream was null.");
        }

        Properties properties = new Properties();

        try {
            properties.load(inputStream);
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
        return properties.getProperty(propertyName);
    }

    /**
     * This method changes a property in config.properties. It was build to change th ip/ port of aiotes.
     * @param propertyName the name of the property
     * @param value the new value
     */
    public static void changeConfigProperty(String propertyName, String value){
        if(IsNullOrEmpty(propertyName)){
            return;
        }

        InputStream inputStream = UtilityService.class.getClassLoader().getResourceAsStream(CONFIG_PATH);

        if (inputStream == null){
            System.out.println("Input stream was null.");
        }

        Properties properties = new Properties();

        try {
            properties.load(inputStream);
        } catch (IOException e) {
            e.printStackTrace();
            return;
        }

        properties.setProperty(propertyName, value);
        try {
            properties.store(new FileOutputStream(CONFIG_PATH), null);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * Gets the MongoDatabase Object of the database used for the backend.
     * Make sure to configure MONGO_DB_CONNECTION_STRING and BACKEND_DATABASE_NAME correctly, otherwise null is returned.
     * @return the MongoDatabase, where backend data is stored
     */
    public static MongoDatabase getDatabase(Enum<PropertyKeys> databasetype){

        if(IsNullOrEmpty(connectionStringProperty)){
            return null;
        }

        String databaseName = getConfigProperty(databasetype.toString());
        if(IsNullOrEmpty(databaseName)){
            return null;
        }

        return mongoClient.getDatabase(databaseName).withCodecRegistry(pojoCodecRegistry);
    }

    /**
     * Checks whether a given string is either null or empty.
     * @param string The string to check.
     * @return True, if the string is either null or equals the empty string, false otherwise.
     */
    public static boolean IsNullOrEmpty(String string){
        return string == null || string.equals("");
    }


    public static User loadUserFromDatabase(String id, String username) throws MissingDatabaseEntryException {
        User user = null;
        if(username == null)
            user = getDatabase(PropertyKeys.BACKEND_DATABASE_NAME).getCollection(USERCOLLECTIONSTRING, User.class)
                    .find(eq("userId", id)).first();
        else if(id == null)
            user = getDatabase(PropertyKeys.BACKEND_DATABASE_NAME).getCollection(USERCOLLECTIONSTRING, User.class)
                    .find(eq("username", username)).first();

        if (user == null) {
            logger.log(Level.ERROR, (new Log(id, LogConstants.LOAD_USER, id, LogConstants.FAILED)));
            throw new MissingDatabaseEntryException("User not found in Database");
        }

        return user;
    }

    /**
     * This method returns user.toString() from the user with the given username or id
     *
     * @param id
     * @param username
     * @return string representation of user, if user can not be found in database return LogConstants.EMPTY_FIELD
     */
    public static String getUserString(String id, String username) {
        try {
            return loadUserFromDatabase(id, username).toString();
        } catch (MissingDatabaseEntryException e) {}
        return LogConstants.EMPTY_FIELD;
    }
}
