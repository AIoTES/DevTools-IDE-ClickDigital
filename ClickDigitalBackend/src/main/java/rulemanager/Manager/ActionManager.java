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
import exceptions.ActionCycleException;
import exceptions.MissingDatabaseEntryException;
import exceptions.MissingParameterException;
import rulemanager.models.RuleAction;

import java.util.List;

import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.eq;

/**
 *
 * Manages all methods which handels the internal ruleActions.
 */
public class ActionManager {

    // Attributes
    private String userId;
    private ConditionManager conditionManager;
    private IDManager IDManager;
    private String FIELDUSERID= "userId";

    // Collection
    private MongoCollection<RuleAction> acollection;

    // Methodes

    /**
     * The constructor which initialize the collection for ruleActions.
     * @param database The used database.
     */
    public ActionManager(MongoDatabase database, String userId){
        // RuleAction Collection
        acollection = database.getCollection("Actions", RuleAction.class);
        this.userId=userId;
    }

    /**
     * Sets the managers which will be used by this class.
     *
     * @param cM ConditionManager.
     * @param idManager IDManager.
     */
    public void setManager(ConditionManager cM, IDManager idManager){
        conditionManager = cM;
        IDManager = idManager;
    }

    //******************************************************************************************************************
    //******************************************************************************************************************
    //******************************************************************************************************************
    // save-method
    //******************************************************************************************************************
    //******************************************************************************************************************
    //******************************************************************************************************************

    /**
     * Stores a given action, its internal ID and the ID of the following action in the action-chain.
     *
     * @param a An internal action.
     * @param ID The internal ID of this action.
     * @param nextID The internal ID of the next action in the action-chain.
     */
    private void saveAction(RuleAction a, int ID, int nextID){
        a.ID= ID;
        a.ActionID = ID;
        a.ConditionID= a.condition.ID;
        a.NextID=nextID;
        a.userId=userId;
        acollection.insertOne(a);
    }

    //******************************************************************************************************************
    //******************************************************************************************************************
    //******************************************************************************************************************
    // get-methods
    //******************************************************************************************************************
    //******************************************************************************************************************
    //******************************************************************************************************************


    /**
     * Builds a list of ruleActions.
     * The list will be build by walking through the action-chain and create every single
     * action and store them into the list.
     *
     * @param ID An internal ID of an action.
     * @param ruleActions A empty list of ruleActions. (At the beginning the list should be empty, because of the recursion)
     * @return Returns a {@link List <RuleAction>}.
     * @throws MissingDatabaseEntryException An exception will be thrown when an action not found.
     */
    public List<RuleAction> getActions(int ID, List<RuleAction> ruleActions) throws ActionCycleException, MissingDatabaseEntryException{
        if(ID != 0) {
            RuleAction a = acollection.find(and(eq("ID", ID), eq(FIELDUSERID, userId))).first();

            if(a == null) {
                throw new MissingDatabaseEntryException("RuleAction with ID: "+ID+" is missing.");
            }

            // get the condition which belongs to the action
            a.condition = conditionManager.getConditionByID(a.ConditionID);

            // check the array for cycles.
            for(RuleAction ruleAction : ruleActions){
                if(ruleAction.equals(a)){
                    throw new ActionCycleException("Cycle in the list of ruleActions detected!");
                }
            }

            ruleActions.add(a);
            getActions(a.NextID, ruleActions);
        }
        return ruleActions;
    }

    /**
     * This method takes a list of ruleActions and returns the internal ID of the first action in the given list.
     *
     * @param ruleActions A list of ruleActions.
     * @return Returns the internal ID {@link Integer} of the first action.
     */
    public int getRootActionID(List<RuleAction> ruleActions) throws MissingParameterException{
        int j = ruleActions.size();
        int nextID = 0;
        for(int i = 1; j > 0; i++){
            j = ruleActions.size() - i;
            nextID = getActionID(ruleActions.get(j), nextID);
        }
        return nextID;
    }

    /**
     * This method takes an action and the internal unique ID of its following action and looks up the database
     * whether it has an identically entry. In this case its internal ID will be returned. When the database
     * does not has any identically entries an unique internal ID for this action will be generated and the action will
     * be stored.
     *
     * @param a An internal action.
     * @param nextID The internal ID of the following action.
     * @return Returns the internal ID {@link Integer} of the given action.
     */
    public int getActionID(RuleAction a, int nextID) throws MissingParameterException{
        int resultID;
        if(a.condition.command.equals("")){
            throw new MissingParameterException("Command is missing.");
        }
        a.condition = conditionManager.getCondition(a.condition);


        RuleAction databaseRuleAction = acollection.find(and(eq(FIELDUSERID, userId),eq("name", a.name), eq("deviceID", a.deviceID),eq("sensorID", a.sensorID), eq("ConditionID", a.condition.ID), eq("NextID", nextID))).first();

        // action not in database
        if(databaseRuleAction == null){
            resultID = IDManager.getIDforCollectionEntry("action");
            saveAction(a, resultID, nextID);
        } else {
            resultID = databaseRuleAction.ID;
        }
        return resultID;
    }
}
