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
import exceptions.MissingDatabaseEntryException;
import exceptions.MissingParameterException;
import rulemanager.models.Condition;
import org.bson.Document;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.eq;

/**

 * Manages all methods which handels the internal conditions.
 */
public class ConditionManager {

    // Attributes

    private IDManager IDManager;

    private String FIELDUSERID= "userId";
    // Collection
    private MongoCollection<Condition> ccollection;
    // Days
    private MongoCollection<Document> dayscollection;
    private String userId;

    // Methodes

    /**
     * The constructor which initialize the collection for condition and days.
     * @param database The used database.
     */
    public ConditionManager(MongoDatabase database, String userId){
        this.userId =userId;
        // Condition Collection
        ccollection = database.getCollection("Conditions", Condition.class);
        // Days Collection
        dayscollection = database.getCollection("Days");
    }

    /**
     * Sets the managers which will be used by this class.
     * @param idManager IDManager.
     */
    public void setManager(IDManager idManager){
        IDManager = idManager;
    }
    //******************************************************************************************************************
    //******************************************************************************************************************
    //******************************************************************************************************************
    // save-methods
    //******************************************************************************************************************
    //******************************************************************************************************************
    //******************************************************************************************************************

    /**
     * Stores a given condition and an ID of a database entry of days.
     * The ID will be set in a calling method. In case of the condition does not represent days, the ID is zero.
     *
     * @param cond A internal condition which belongs to a trigger or an action.
     * @param daysID The ID of an database entry of days.
     */
    private void saveCondition(Condition cond, int daysID){
        cond.userId= userId;
        cond.DaysID= daysID;
        ccollection.insertOne(cond);
    }

    /**
     * Stores a given list of days and an given internal ID.
     *
     * @param days A list of days.
     * @param ID The internal ID to unique identify this list in the database.
     */
    private void saveDays(List<String> days, int ID){
        Document doc = new Document().
                append(FIELDUSERID, userId).
                append("ID", ID).
                append("Monday", days.get(0)).
                append("Tuesday", days.get(1)).
                append("Wednesday", days.get(2)).
                append("Thursday", days.get(3)).
                append("Friday", days.get(4)).
                append("Saturday", days.get(5)).
                append("Sunday", days.get(6));

        dayscollection.insertOne(doc);
    }


    //******************************************************************************************************************
    //******************************************************************************************************************
    //******************************************************************************************************************
    // get-methods
    //******************************************************************************************************************
    //******************************************************************************************************************
    //******************************************************************************************************************

    /**
     * This method takes a condition and looks up the database if an identically entry exists. If it exists the existing
     * condition will be returned. In the other case an internal unique ID for the condition will be generated and
     * the condition will be stored.
     *
     * @param cond A internal condition.
     * @return Returns a {@link Condition}.
     */
    public Condition getCondition(Condition cond)throws MissingParameterException{
        int daysID = 0;

        if(cond.days != null) {
            if (cond.days.size() > 0 && cond.days.size() < 7) {
                throw new MissingParameterException("Parametersize from days is invalid.");
            }
            if (cond.days.size() == 7) {
                daysID = getDaysID(cond.days);
            }
        }

        Condition dbCondition = ccollection.find(and(
                eq(FIELDUSERID, userId),
                eq("command", cond.command),
                eq("time", cond.time),
                eq("DaysID", daysID),
                eq("location", cond.location),
                eq("weather", cond.weather),
                eq("activity", cond.activity),
                eq("trafficsituation", cond.trafficsituation),
                eq("temperature", cond.temperature),
                eq("operator", cond.operator),
                eq("telephonenumber", cond.telephonenumber),
                eq("email", cond.email),
                eq("communicationtype", cond.communicationtype),
                eq("notification", cond.notification),
                eq("physical", cond.physical),
                eq("servicetype", cond.servicetype),
                eq("entry", cond.entry),
                eq("living", cond.living),
                eq("human", cond.human),
               eq("itemtype", cond.itemtype),
                eq("place", cond.place))).first();


        if(dbCondition == null){
            cond.ID = IDManager.getIDforCollectionEntry("condition");
            saveCondition(cond, daysID);
        } else {
            cond.ID = dbCondition.ID;
        }
        return cond;
    }

    /**
     * This method takes an internal ID of a condition and returns the corresponding condition.
     *
     * @param ID An internal ID of a condition.
     * @return Returns a {@link Condition}.
     * @throws MissingDatabaseEntryException An exception will be thrown when the corresponding condition does not exist.
     */
    public Condition getConditionByID(int ID) throws MissingDatabaseEntryException{
        Condition condition = ccollection.find(and(eq("ID", ID), eq(FIELDUSERID, userId))).first();


        if(condition == null){
            throw new MissingDatabaseEntryException("Condition with ID : "+ID+ " not found.");
        }

        condition.days= getDaysByID(condition.DaysID);
        condition.ID = ID;


        return condition;
    }

    /**
     * This method validates whether a given condition fits on a given class of trigger.
     *
     * @param c A internal condition.
     * @param s A class of a trigger.
     * @throws MissingParameterException An exception will be thrown when the attributes of the condition are set not well.
     */
    public void getConditionStatus(Condition c, String s) throws MissingParameterException {
        //Checks if Condition of the trigger is set well
        switch(s.toLowerCase()) {
            case "temporal": {
                if (((!(c.time).equals("") && c.days == null)) || ((c.time).equals("") && c.days != null && c.days.size() == 7)) {
                    break;
                } else {
                    throw new MissingParameterException("Argument time or days is incorrect.");
                }
            }
            case "spatial": {
                if ((c.location).equals("Fixed") ^ (c.location).equals("Moving")) {
                    break;
                } else {
                    throw new MissingParameterException("Argument location is incorrect.");
                }
            }
            case "situation": {

                if(!((c.activity).equals("") && (c.trafficsituation).equals("") && c.itemtype.equals("") && c.place.equals(""))
                        || (!(c.weather).equals("") && !(c.operator).equals(""))){
                    break;
                }else{
                    throw new MissingParameterException("Argument weather, activity, trafficsituation or operator is incorrect.");
                }
            }
            case "communication": {
                if (!(((c.communicationtype).equals("") || (c.notification).equals(""))
                        || (c.telephonenumber == 0 && (c.email).equals("")))) {
                    break;
                } else {
                    throw new MissingParameterException("Argument telephonnumber, email, communication or notification ist incorrect.");
                }
            }
            case "service": {
                if ((c.physical && !(c.servicetype).equals("")) ||
                        (!c.physical && !(c.entry).equals(""))) {
                    break;
                } else {
                    throw new MissingParameterException("Argument physical, servicetype or entry is incorrect.");
                }
            }
            case "entitysituation": {
                if ((c.living && (c.itemtype).equals("") && (c.place).equals("")) || (!c.living && !(c.state).equals("")
                        && (!(c.itemtype).equals("") ^ !(c.place).equals("")))) {
                    break;
                } else {
                    throw new MissingParameterException("Argument living, human, itemtype or place is incorrect.");
                }
            }
            case "system": {
                if(((!(c.time).equals("") && c.days == null)) || ((c.time).equals("") && c.days != null && c.days.size() == 7)){
                    break;
                } else {
                    throw new MissingParameterException("Argument time or days is incorrect.");
                }
            }
            default : throw new MissingParameterException("Triggerclass is incorrect.");
        }
    }

    /**
     * This method takes a list of days, which are belongs to a condition.
     * It looks up the database for identically entries. If such an entry exists, it will be returned.
     * In the other case an internal unique ID will be generated and the days will be stored with this ID.
     *
     * @param days A list of days.
     * @return Returns the internal ID {@link Integer} of the days.
     */
    public int getDaysID(List<String> days) {
        int ID;

        Document output = dayscollection.aggregate(Arrays.asList(
                Aggregates.match(eq(FIELDUSERID, userId)),
                Aggregates.match(eq("Monday", days.get(0))),
                Aggregates.match(eq("Tuesday", days.get(1))),
                Aggregates.match(eq("Wednesday", days.get(2))),
                Aggregates.match(eq("Thursday", days.get(3))),
                Aggregates.match(eq("Friday", days.get(4))),
                Aggregates.match(eq("Saturday", days.get(5))),
                Aggregates.match(eq("Sunday", days.get(6)))
        )).first();

        if(output == null){
            ID = IDManager.getIDforCollectionEntry("days");
            saveDays(days, ID);
        } else {
            ID = output.getInteger("ID");
        }
        return ID;
    }

    /**
     * This method takes an internal ID of an entry of days and returns the days belongs to this ID.
     *
     * @param ID An internal ID which belongs to a list of days.
     * @return Returns a {@link List<String>}.
     */
    public List<String> getDaysByID(int ID){
        List<String> days = null;

        Document output = dayscollection.aggregate(Arrays.asList(
                Aggregates.match(and(eq("ID", ID), eq(FIELDUSERID, userId)))
        )).first();

        if(output != null){
            days = new ArrayList<>();
            days.add(output.getString("Monday"));
            days.add(output.getString("Tuesday"));
            days.add(output.getString("Wednesday"));
            days.add(output.getString("Thursday"));
            days.add(output.getString("Friday"));
            days.add(output.getString("Saturday"));
            days.add(output.getString("Sunday"));
        }
        return days;
    }
}
