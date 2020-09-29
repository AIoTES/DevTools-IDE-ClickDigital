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
package  rulemanager.Manager;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Aggregates;
import exceptions.ActionCycleException;
import exceptions.MissingDatabaseEntryException;
import exceptions.MissingParameterException;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import rulemanager.NotificationData;
import rulemanager.models.RuleAction;
import rulemanager.models.Notification;
import rulemanager.models.Rule;
import org.bson.Document;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Indexes.descending;
import static com.mongodb.client.model.Sorts.ascending;
import static com.mongodb.client.model.Updates.combine;
import static com.mongodb.client.model.Updates.set;

/**

 * Manages all methods which handels the internal rules.
 */
public class RuleManager {

    // Attributes

    private ActionManager actionManager;
    private IDManager IDManager;
    private String userId;
    private String FIELDUSERID= "userId";

    // Rule Collection
    private MongoCollection<Rule> rcollection;
    // Notification Collection
    private MongoCollection<Notification> ncollection;
    // Rule UID Collection
    private MongoCollection<Document> uidcollection;

    // Methodes

    /**
     * The constructor which initialize the collection for rules and IDs.
     * @param database The used database.
     */
    public RuleManager(MongoDatabase database, String userId){
        this.userId = userId;
        // Rule Collection
        rcollection = database.getCollection("Rules", Rule.class);
        // Rule Notification Collection
        ncollection = database.getCollection("Notifications", Notification.class);
        uidcollection = database.getCollection("UIDs");
    }

    /**
     * Sets the managers which will be used by this class.
     *
     * @param aM ActionManager.
     * @param idManager IDManager.
     */
    public void setManager(ActionManager aM, IDManager idManager){
        actionManager = aM;
        IDManager = idManager;
    }


    //******************************************************************************************************************
    //******************************************************************************************************************
    //******************************************************************************************************************
    // create-method
    //******************************************************************************************************************
    //******************************************************************************************************************
    //******************************************************************************************************************


    /**
     * Takes a rule without an ID and looks up the database, whether it has an entry.
     * If it has one, it will returns the complete rule with its ID.
     * In case of the rule does not exist, a new database entry will be generated and the rule will
     * be returned with a new generated ID.
     *
     * @param r The current rule which was generated on dashboard-side.
     * @return Returns a {@link Rule} with all its attributes set.
     * @throws MissingParameterException An exception will be thrown when an important parameter is missing.
     */
    public Rule createRule(Rule r) throws MissingParameterException{
        Rule databaseRule;

        // ID from the root action
        int aID = actionManager.getRootActionID(r.ruleActions);

        if(isRuleValid(r)){
            databaseRule=rcollection.find(and(eq(FIELDUSERID, userId), eq("name", r.name),eq("description", r.description), eq("rootTGID", r.rootTGID), eq("actionID", aID),
                    eq("platformID", r.platformID), eq("projectID", r.projectID))).first();

        } else throw new MissingParameterException("Rule has invalid arguments");

        if (databaseRule == null) {
            r.ID = IDManager.getIDforCollectionEntry("rule");
            saveRule(r, aID);
        } else {
            r.ID = databaseRule.ID;
        }
        return r;
    }

    /**
     * creates Notification
     *
     * @param n notification
     * @return saved Notification
     * @throws MissingParameterException
     */
    public Notification createNotification(Notification n) throws MissingParameterException{
        Logger logger = LogManager.getLogger();
        if(isNotificationValid(n)){
            n.ID = IDManager.getIDforCollectionEntry("notification");
            ncollection.insertOne(n);
        }else throw new MissingParameterException("Notification has invalid arguments");

        return n;
    }


    /**
     * Takes a rule and validates whether its attributes are set correctly.
     *
     * @param r A internal rule.
     * @return Returns true if the rules attributes are set well. In the other case false.
     */
    private Boolean isRuleValid(Rule r){
        return (!(r.name).equals("") && !(r.description).equals("") &&
                r.rootTGID != 0 && r.ruleActions.size() >= 1 && !(r.platformID).equals("") && !(r.projectID).equals(""));
    }

    /**
     * Takes a Notification and validates whether its attributes are set correctly.
     *
     * @param n internal notification
     * @return Returns true if the rules attributes are set well. In the other case false.
     */
    private Boolean isNotificationValid(Notification n){
        return n.date != null && n.event!= null && !(n.event).equals("") && !(n.name).equals("") && n.name != null;
    }
    //******************************************************************************************************************
    //******************************************************************************************************************
    //******************************************************************************************************************
    // save-method
    //******************************************************************************************************************
    //******************************************************************************************************************
    //******************************************************************************************************************

    /**
     * Stores a given rule with a given ID of an action in the database.
     *
     * @param r A internal complete rule. (with ID)
     * @param rootAction The internal ID of the action which belongs to the given rule and represents the first
     *                   action in the action-chain which belongs to this rule.
     */
    private void  saveRule(Rule r, int rootAction){
        r.actionID = rootAction;
        r.userId=userId;
        rcollection.insertOne(r);
    }

    /**
     * Stores the uid, generated from a platform, which belongs to the ruleID
     *
     * @param ruleID The internal ID of a rule.
     * @param uid The platform-internal ID of this rule.
     * @param platform The platform the uid belongs to.
     */
    public void saveUID(int ruleID, String uid, String platform){
        Document doc = new Document()
                .append("InternalID", ruleID)
                .append("ExternalID", uid)
                .append("Platform", platform).append(FIELDUSERID, userId);
        uidcollection.insertOne(doc);
    }

    //******************************************************************************************************************
    //******************************************************************************************************************
    //******************************************************************************************************************
    // operation-methods
    //******************************************************************************************************************
    //******************************************************************************************************************
    //******************************************************************************************************************

    /**
     * Deletes a rule by a given internal ID.
     *
     * @param RuleID An internal ID of a rule.
     * @return Returns true if success
     */
    public Boolean deleteRule(int RuleID){
        rcollection.deleteOne(and(eq("ID", RuleID), eq(FIELDUSERID, userId)));
        Rule rule = rcollection.find(and(eq("ID", RuleID), eq(FIELDUSERID, userId))).first();
        if(rule == null){
            return true;
        }
        return false;
    }
    public Boolean deleteNotification(int notificationID){
        ncollection.deleteOne(and(eq("ID", notificationID), eq(FIELDUSERID, userId)));
        Notification notification = ncollection.find(and(eq("ID", notificationID), eq(FIELDUSERID, userId))).first();
        if(notification == null){
            return true;
        }
        return false;
    }
    /**
     * Activate a rule by a given ID.
     *
     * @param RuleID The internal ID of the target rule.
     * @return Returns true if success.
     */
    public Boolean activateRule(int RuleID){
        rcollection.updateOne(and(eq("ID", RuleID), eq(FIELDUSERID, userId)), set("active", true));
        Rule rule = rcollection.find(and(eq(FIELDUSERID, userId), eq("ID", RuleID),eq("active", true) )).first();

        if(rule == null){
            return false;
        }
        return true;
    }

    /**
     * Deactivate a rule by a given ID.
     *
     * @param RuleID The internal ID of the target rule.
     * @return Returns true if success.
     */
    public Boolean deactivateRule(int RuleID){
        rcollection.updateOne(and(eq("ID", RuleID), eq(FIELDUSERID, userId)), set("active", false));
        Rule rule = rcollection.find(and(eq(FIELDUSERID, userId), eq("ID", RuleID),eq("active", false) )).first();
        if(rule == null){
            return false;
        }
        return true;
    }

    /**
     * Edits a existing rule.
     *
     * @param rule A existing rule with new informations.
     * @throws MissingDatabaseEntryException Throws when the given rule not found.
     */
    public void editRule(Rule rule) throws MissingDatabaseEntryException, MissingParameterException {
        Rule ruleDatabase = rcollection.find(and(eq(FIELDUSERID, userId), eq("ID", rule.ID))).first();
        int aID = actionManager.getRootActionID(rule.ruleActions);

        if(ruleDatabase == null){
            throw new MissingDatabaseEntryException("Rule not found.");
        }

        rcollection.updateOne(and(eq("ID", rule.ID),eq(FIELDUSERID, userId)), combine(
                set("name", rule.name),
                set("description", rule.description),
                set("notify", rule.notify),
                set("active", rule.active),
                set("rootTGID", rule.rootTGID),
                set("rootTGID", rule.rootTGID),
                set("actionID", aID),
                set("ruleActions", rule.ruleActions),
                set("platformID", rule.platformID),
                set("projectID", rule.projectID)));
    }

    /**
     * Update a existing Notification.
     * @param notification
     * @throws MissingDatabaseEntryException
     * @throws MissingParameterException
     */
    public void updateNotification(Notification notification) throws MissingDatabaseEntryException, MissingParameterException {
        Notification notificationDatabase = ncollection.find(and(eq(FIELDUSERID, userId), eq("ID", notification.ID))).first();

        if(notificationDatabase == null){
            throw new MissingDatabaseEntryException("Notification not found.");
        }

        ncollection.updateMany(and(eq("ID", notification.ID),eq(FIELDUSERID, userId)), combine(
                set("name", notification.name),
                set("userId", notification.userId),
                set("relation", notification.relation),
                set("relationID", notification.relationID),
                set("date", notification.date),
                set("event", notification.event),
                set("notified", notification.notified)));
    }
    //******************************************************************************************************************
    //******************************************************************************************************************
    //******************************************************************************************************************
    // get-methods
    //******************************************************************************************************************
    //******************************************************************************************************************
    //******************************************************************************************************************

    /**
     * Returns all stored rules.
     *
     * @return Returns a {@link List<Rule>}.
     * @throws MissingDatabaseEntryException An exception will be thrown when a rule not found.
     */
    public List<Rule> getAllRules(String projectID) throws MissingDatabaseEntryException, ActionCycleException{
        List<Rule> rules = new ArrayList<>();
        for(Rule r : rcollection.find(and(eq(FIELDUSERID, userId), eq("projectID",projectID)))){
            rules.add(getRule(r.ID));
        }
        return rules;
    }

    /**
     * Method return list of notifications
     *
     * @param userId
     * @return notifications
     * @throws MissingDatabaseEntryException
     */
    public List<NotificationData> getAllNotifications(String userId) throws MissingDatabaseEntryException{
        List<NotificationData> notification = new ArrayList<>();
        Logger logger = LogManager.getLogger();

        for(Notification n : ncollection.find(eq(FIELDUSERID, userId)).sort(descending("date"))){

            switch (n.relation.toLowerCase()){
                case "rule":

                    NotificationData<Rule> ruleNotification = new NotificationData<>();
                    ruleNotification.data = rcollection.find(and( eq(FIELDUSERID, userId), eq("ID", n.relationID))).first();
                    ruleNotification.notification = n;
                    notification.add(ruleNotification);
                    break;
                case "some new relations":

                    //TODO
                    break;
            }

        }
        return notification;
    }
    /**
     * Returns a rule which belongs to a given ID.
     *
     * @param ID An internal ID of a rule.
     * @return Returns a {@link Rule}.
     * @throws MissingDatabaseEntryException An exception will be thrown when the rule not found.
     */
    public Rule getRule(int ID) throws MissingDatabaseEntryException, ActionCycleException {
        Rule rule = rcollection.find(and(eq(FIELDUSERID, userId), eq("ID", ID))).first();
        if(rule == null) {
            throw new MissingDatabaseEntryException("Rule not found!");
        }
        List<RuleAction> ruleActions = new ArrayList<>();
        // get the ruleActions which belongs to this rule
        rule.ruleActions = actionManager.getActions(rule.actionID, ruleActions);
        return rule;
    }


    /**
     * Returns the status of the rule which belongs to the given ID.
     *
     * @param ruleID The internal ID of the target rule.
     * @return Returns true if the rule is activ, else it returns false.
     * @throws MissingDatabaseEntryException An exception will be thrown when the rule not found.
     */
    public Boolean getRuleStatus(int ruleID) throws MissingDatabaseEntryException, ActionCycleException{
        return getRule(ruleID).active;
    }

    /**
     * Looks up the collection whether an entry exists. In case of an entry exists, the externalID will be returned.
     *
     * @param ruleID The internal ID of a rule.
     * @return Returns the platform-external ID.
     */
    public String getUID(int ruleID){
        String result = "";

        Document output = uidcollection.aggregate(Arrays.asList(
                Aggregates.match(eq(FIELDUSERID, userId)),
                Aggregates.match(eq("InternalID", ruleID))
        )).first();

        if(output != null){
            result = output.getString("ExternalID");
        }
        return result;
    }
}
