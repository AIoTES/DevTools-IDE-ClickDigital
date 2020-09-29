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

import com.mongodb.client.AggregateIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Aggregates;
import exceptions.MissingDatabaseEntryException;
import exceptions.MissingParameterException;
import javafx.print.Collation;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.bson.conversions.Bson;
import org.jvnet.hk2.internal.Collector;
import rulemanager.models.Trigger;
import rulemanager.models.Triggergroup;
import org.bson.Document;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Filters.or;
import static com.mongodb.client.model.Updates.combine;
import static com.mongodb.client.model.Updates.set;

/**

 * Manages all methods which handels the internal triggergroups and triggers.
 */
public class TriggergroupManager {

	// Attributes

	private ConditionManager conditionManager;
	private IDManager IDManager;
	private String userId;

	// Collection
	private MongoCollection<Triggergroup> tgcollection;
	private MongoCollection<Document> temporal;
	private MongoCollection<Document> spatial;
	private MongoCollection<Document> situation;
	private MongoCollection<Document> communication;
	private MongoCollection<Document> service;
	private MongoCollection<Document> entitysituation;
	private MongoCollection<Document> system;
	private String FIELDUSERID = "userId";


	// Methodes
	/**
	 * The constructor which initialize the collection for triggergroups and triggers.
	 *
	 * @param database The used database.
	 */
	public TriggergroupManager(MongoDatabase database, String userId) {
		this.userId = userId;
		// Triggergroup Collection
		tgcollection = database.getCollection("Triggergroups", Triggergroup.class);
		// trigger collections
		temporal = database.getCollection("Temporals");
		spatial = database.getCollection("Spatials");
		situation = database.getCollection("Situations");
		communication = database.getCollection("Communications");
		service = database.getCollection("Services");
		entitysituation = database.getCollection("Entitysituations");
		system = database.getCollection("Systems");
	}

	/**
	 * Sets the managers which will be used by this class.
	 *
	 * @param cM        ConditionManager.
	 * @param idManager IDManager.
	 */
	public void setManager(ConditionManager cM, IDManager idManager) {
		conditionManager = cM;
		IDManager = idManager;
	}


	//******************************************************************************************************************
	//******************************************************************************************************************
	//******************************************************************************************************************
	// create-methods
	//******************************************************************************************************************
	//******************************************************************************************************************
	//******************************************************************************************************************

	/**
	 * Update existing Triggergroup
	 *
	 * @param trigger
	 * @throws MissingDatabaseEntryException
	 */
	public Triggergroup updateTriggergroup(Triggergroup trigger, String userId) throws MissingDatabaseEntryException {

		Triggergroup triggerDatabase = tgcollection.find(and(eq(FIELDUSERID, userId), eq("ID", trigger.ID))).first();
		if(triggerDatabase == null){
			 throw new MissingDatabaseEntryException("Triggergroup not found. userid : "+userId+" Trigger ID : "+trigger.ID);
		}

		if(isTGanOperator(trigger)){
			tgcollection.updateOne(and(eq("ID", trigger.ID), eq(FIELDUSERID, userId)), combine(
				set("name", trigger.name),
				set("userId", userId),
				set("leftchild", trigger.leftchild),
				set("rightchild", trigger.rightchild),
				set("triggerclass", trigger.triggerclass),
				set("operator", trigger.operator)));
		}else{
			tgcollection.updateOne(and(eq("ID", trigger.ID), eq(FIELDUSERID, userId)), combine(
				set("name", trigger.name),
				set("userId", userId),
				set("leftchild", trigger.leftchild),
				set("rightchild", trigger.rightchild),
				set("trigger", trigger.trigger),
				set("triggerclass", trigger.triggerclass),
				set("triggerID", trigger.trigger.ID),
				set("operator", trigger.operator)));
		}

		return trigger;
	}

	/**
	 * Delete Triggergroup by Id
	 *
	 * @param triggerID
	 * @param userId
	 * @return boolean
	 */
	public boolean deleteTriggerGroup(int triggerID, String userId) throws MissingDatabaseEntryException, MissingParameterException {
		tgcollection.deleteMany(and(eq("ID", triggerID), eq(FIELDUSERID, userId)));
		Triggergroup trigger = tgcollection.find(and(eq("ID", triggerID), eq(FIELDUSERID, userId))).first();
		if (trigger == null) {
			return true;
		}
		return false;
	}
	/**
	 * Takes a triggergroup without an ID and looks up the database, whether it has an entry.
	 * If it has one, it will returns the complete triggergroup with its ID.
	 * In case of the triggergroup does not exist, a new database entry will be generated and the triggergroup will
	 * be returned with a new generated ID.
	 *
	 * @param tg The current triggergroup which was generated on dashboard-side.
	 * @return Returns a {@link Triggergroup} with all its attributes set.
	 * @throws MissingParameterException An exception will be thrown when an important parameter is missing.
	 */
	public Triggergroup createTriggergroupWithoutChildCheck(Triggergroup tg) throws MissingParameterException {
		Triggergroup triggergroup;

		// case : triggergroup represents a trigger (Leaf)
		if (isTGaTrigger(tg)) {
			tg.trigger = createTrigger(tg.trigger);
			triggergroup = tgcollection.find(and(eq(FIELDUSERID, userId), eq("name", tg.name), eq("triggerID", tg.trigger.ID), eq("triggerclass", tg.trigger.triggerclass))).first();
		}
		// case : triggergroup is not a leaf, so it is an operator with children
		else if (isTGanOperator(tg)) {

			triggergroup = tgcollection.aggregate(Arrays.asList(
					Aggregates.match(eq(FIELDUSERID, userId)),
					Aggregates.match(eq("Name", tg.name)),
					Aggregates.match(eq("Operator", tg.operator)),
					Aggregates.match(eq("Leftchild", tg.leftchild)),
					Aggregates.match(eq("Rightchild", tg.rightchild))
			)).first();
		} else throw new MissingParameterException("Triggergroup has invalid arguments");

		// kein passendes Dokument in Tabelle gefunden
		if (triggergroup == null) {
			tg.ID = IDManager.getIDforCollectionEntry("triggergroup");
			saveTriggergroup(tg);
		} else {
			tg.ID = triggergroup.ID;
		}
		return tg;
	}
	/**
	 * Takes a triggergroup without an ID and looks up the database, whether it has an entry.
	 * If it has one, it will returns the complete triggergroup with its ID.
	 * In case of the triggergroup does not exist, a new database entry will be generated and the triggergroup will
	 * be returned with a new generated ID.
	 *
	 * @param tg The current triggergroup which was generated on dashboard-side.
	 * @return Returns a {@link Triggergroup} with all its attributes set.
	 * @throws MissingParameterException An exception will be thrown when an important parameter is missing.
	 */
	public Triggergroup createTriggergroup(Triggergroup tg) throws MissingParameterException {
		Triggergroup triggergroup;

		// case : triggergroup represents a trigger (Leaf)
		if (isTGaTrigger(tg)) {
			//Trigger
			tg.trigger = createTrigger(tg.trigger);

			triggergroup = tgcollection.find(and(eq(FIELDUSERID, userId), eq("name", tg.name), eq("triggerID", tg.trigger.ID), eq("triggerclass", tg.trigger.triggerclass))).first();

            /* output = tgcollection.aggregate(Arrays.asList(
					Aggregates.match(eq(FIELDUSERID, userId)),
                    Aggregates.match(eq("Name", tg.name)),
                    Aggregates.match(eq("TriggerID", tg.trigger.ID)),
                    Aggregates.match(eq("Triggerclass", tg.trigger.triggerclass)))).first();*/
		}
		// case : triggergroup is not a leaf, so it is an operator with children
		else if (isTGanOperator(tg)) {

			// case : at least one child not found, then throw an error
			if (tgcollection.aggregate(Arrays.asList(
				Aggregates.match(eq(FIELDUSERID, userId)),
				Aggregates.match(eq("ID", tg.leftchild)))).first() == null ||
				tgcollection.aggregate(Arrays.asList(
					Aggregates.match(eq(FIELDUSERID, userId)),
					Aggregates.match(eq("ID", tg.rightchild)))).first() == null) {
				throw new MissingParameterException("Invalid child");
			}
			triggergroup = tgcollection.aggregate(Arrays.asList(
				Aggregates.match(eq(FIELDUSERID, userId)),
				Aggregates.match(eq("Name", tg.name)),
				Aggregates.match(eq("Operator", tg.operator)),
				Aggregates.match(eq("Leftchild", tg.leftchild)),
				Aggregates.match(eq("Rightchild", tg.rightchild))
			)).first();
		} else throw new MissingParameterException("Triggergroup has invalid arguments");

		// kein passendes Dokument in Tabelle gefunden
		if (triggergroup == null) {
			tg.ID = IDManager.getIDforCollectionEntry("triggergroup");
			saveTriggergroup(tg);
		} else {
			tg.ID = triggergroup.ID;
		}
		return tg;
	}

	/**
	 * This method takes a trigger and looks up the database
	 * whether it has an identically entry. In this case the whole trigger will be returned. When the database
	 * does not has any identically entries an unique internal ID for this trigger will be generated and the trigger will
	 * be stored.
	 *
	 * @param t A internal trigger.
	 * @return Returns a {@link Trigger}.
	 * @throws MissingParameterException An exception will be thrown when a parameter is missing.
	 */
	private Trigger createTrigger(Trigger t) throws MissingParameterException {
		MongoCollection<Document> collection = getCollection(t.triggerclass);

		if (collection == null) {
			throw new MissingParameterException("Trigger has an invalid triggerclass.");
		}

		if ((t.name).equals("") || t.condition == null) {
			throw new MissingParameterException("Trigger has invalid arguments");
		}

		t.condition = conditionManager.getCondition(t.condition);

		//Checks if condition is set well
		conditionManager.getConditionStatus(t.condition, t.triggerclass);


		Document output;
		if (!(t.deviceID).equals("")) {

			output = collection.aggregate(Arrays.asList(
				Aggregates.match(eq(FIELDUSERID, userId)),
				Aggregates.match(eq("Name", t.name)),
				Aggregates.match(eq("DeviceID", t.deviceID)),
				Aggregates.match(eq("SensorID", t.sensorID)),
				Aggregates.match(eq("ConditionID", t.condition.ID))
			)).first();
		} else {
			output = collection.aggregate(Arrays.asList(
				Aggregates.match(eq(FIELDUSERID, userId)),
				Aggregates.match(eq("Name", t.name)),
				Aggregates.match(eq("DeviceID", "")),
				Aggregates.match(eq("SensorID", "")),
				Aggregates.match(eq("ConditionID", t.condition.ID))
			)).first();
		}

		// trigger does not exists in database
		if (output == null) {
			t.ID = IDManager.getIDforCollectionEntry(t.triggerclass.toLowerCase());
			saveTrigger(t, collection);
		} else {
			t.ID = output.getInteger("ID");
		}
		return t;
	}

	/**
	 * Validates whether a given triggergroup represents a trigger.
	 *
	 * @param tg A internal triggergroup.
	 * @return Returns true if the given triggergroup represents a trigger. In the other case it returns false.
	 */
	private Boolean isTGaTrigger(Triggergroup tg) {
		return (tg.trigger != null && (tg.operator).equals("") && tg.leftchild == 0 && tg.rightchild == 0 && !(tg.name).equals(""));
	}

	/**
	 * Validates whether a given triggergroup represents an operator with children.
	 *
	 * @param tg A internal triggergroup.
	 * @return Returns true if the given triggergroup represents an operator. In the other case it returns false.
	 */
	private Boolean isTGanOperator(Triggergroup tg) {
		return (tg.trigger == null && !(tg.operator).equals("") && tg.leftchild != 0 && tg.rightchild != 0 && !(tg.name).equals(""));
	}

	//******************************************************************************************************************
	//******************************************************************************************************************
	//******************************************************************************************************************
	// save-method
	//******************************************************************************************************************
	//******************************************************************************************************************
	//******************************************************************************************************************

	/**
	 * Stores a given triggergroup in the database.
	 * If the triggergroup represents an operator the ID of the trigger is initialized with zero.
	 *
	 * @param tg A internal triggergroup.
	 */
	private void saveTriggergroup(Triggergroup tg) {
		int triggerid = 0;
		String triggerclass = "";
		if (tg.trigger != null) {
			triggerid = tg.trigger.ID;
			triggerclass = tg.trigger.triggerclass;
		}
		tg.triggerID = triggerid;
		tg.userId = userId;
		tg.triggerclass = triggerclass;
		tgcollection.insertOne(tg);
	}


	/**
	 * Stores a given trigger in a given collection (table) of the database.
	 *
	 * @param t A internal trigger.
	 * @param c A collection which represents the table in which the trigger will be stored.
	 */
	private void saveTrigger(Trigger t, MongoCollection<Document> c) {
		Document doc = new Document().
			append("Name", t.name).
			append("ID", t.ID).
			append("Class", t.triggerclass).
			append("DeviceID", t.deviceID).
			append("SensorID", t.sensorID).
			append("ConditionID", t.condition.ID).append(FIELDUSERID, userId);
		c.insertOne(doc);
	}

	//******************************************************************************************************************
	//******************************************************************************************************************
	//******************************************************************************************************************
	// get-methods
	//******************************************************************************************************************
	//******************************************************************************************************************
	//******************************************************************************************************************

	/**
	 * This method returns a list of all stored triggergroups.
	 *
	 * @return Returns a {@link List <Triggergroup>}.
	 * @throws MissingDatabaseEntryException This exception will be thrown when a triggergroup or trigger not found.
	 * @throws MissingParameterException     This exception will be thrown when a parameter is missing.
	 */
	public List<Triggergroup> getAllTriggergroups(String projectID) throws MissingDatabaseEntryException, MissingParameterException {
		List<Triggergroup> triggergroups = new ArrayList<>();
		for (Triggergroup d : tgcollection.find(and(eq(FIELDUSERID, userId),eq("projectID",projectID)))) {
			triggergroups.add(getTriggergroupByID(d.ID));
		}
		return triggergroups;
	}

	/**
	 * This method returns a list of all trigger which are grouped by a given category.
	 *
	 * @param category A category of a trigger. (category is corresponding to triggerclass)
	 * @return Returns a {@link List<Triggergroup>}.
	 * @throws MissingDatabaseEntryException This exception will be thrown when a triggergroup or trigger not found.
	 * @throws MissingParameterException     This exception will be thrown when a parameter is missing.
	 */
	public List<Triggergroup> getAllTriggerByCategory(String category) throws MissingDatabaseEntryException, MissingParameterException {
		List<Triggergroup> triggergroups = new ArrayList<>();

		AggregateIterable<Triggergroup> output = tgcollection.aggregate(Arrays.asList(
			Aggregates.match(eq(FIELDUSERID, userId)),
			Aggregates.match(eq("Triggerclass", category))
		));

		for (Triggergroup d : output) {
			triggergroups.add(getTriggergroupByID(d.ID));
		}
		return triggergroups;
	}

	/**
	 * This method returns a triggergroup which belongs to the given internal ID.
	 *
	 * @param ID An internal ID of a triggergroup.
	 * @return Returns a {@link Triggergroup}.
	 * @throws MissingDatabaseEntryException This exception will be thrown when the triggergroup or trigger not found.
	 * @throws MissingParameterException     This exception will be thrown when a parameter is missing.
	 */
	private Triggergroup getTriggergroupByID(int ID) throws MissingDatabaseEntryException, MissingParameterException {
		Triggergroup triggergroup = tgcollection.aggregate(Arrays.asList(
			Aggregates.match(eq(FIELDUSERID, userId)),
			Aggregates.match(eq("ID", ID))
		)).first();

		if (triggergroup == null) {
			throw new MissingDatabaseEntryException("Triggergroup with ID : " + ID + " not found.");
		}


		int triggerID = triggergroup.triggerID;
		// triggergroup represents a trigger if ID != 0
		if (triggerID != 0) {
			triggergroup.trigger = getTriggerByID(triggerID, triggergroup.triggerclass);
		}
		return triggergroup;
	}

	/**
	 * This method returns the tree of triggergroups, which represents a rule without ruleActions, as a list.
	 *
	 * @param rootTG An internal ID of a triggergroup.
	 * @param list   A empty list of triggergroups. (At the beginning the list should be empty, because of the recursion)
	 * @return Returns a {@link List<Triggergroup>}.
	 * @throws MissingDatabaseEntryException This exception will be thrown when a triggergroup or trigger not found.
	 * @throws MissingParameterException     This exception will be thrown when a parameter is missing.
	 */
	public List<Triggergroup> getTGsForRule(int rootTG, List<Triggergroup> list) throws MissingDatabaseEntryException, MissingParameterException {
		Triggergroup triggergroup = getTriggergroupByID(rootTG);
		// walk through the tree
		if (triggergroup.leftchild != 0) {
			list = getTGsForRule(triggergroup.leftchild, list);
		}
		list.add(triggergroup);

		if (triggergroup.rightchild != 0) {
			list = getTGsForRule(triggergroup.rightchild, list);
		}
		return list;
	}


	/**
	 * This method takes an internal ID of a trigger and a class of a trigger and returns the trigger which
	 * belongs to the ID.
	 *
	 * @param ID     An internal ID of a trigger.
	 * @param tclass A class of a trigger.
	 * @return Returns a {@link Trigger}.
	 * @throws MissingDatabaseEntryException This exception will be thrown when the trigger not found.
	 * @throws MissingParameterException     This exception will be thrown when a parameter is missing.
	 */
	private Trigger getTriggerByID(int ID, String tclass) throws MissingDatabaseEntryException, MissingParameterException {
		MongoCollection<Document> collection = getCollection(tclass);
		Document output = collection.aggregate(Arrays.asList(
			Aggregates.match(eq(FIELDUSERID, userId)),
			Aggregates.match(eq("ID", ID))
		)).first();

		if (output == null) {
			throw new MissingDatabaseEntryException("Trigger not found.");
		}
		Trigger trigger = new Trigger();
		trigger.name = output.getString("Name");
		trigger.ID = ID;
		trigger.deviceID = output.getString("DeviceID");
		trigger.triggerclass = tclass;
		trigger.sensorID = output.getString("SensorID");
		trigger.condition = conditionManager.getConditionByID(output.getInteger("ConditionID"));
		return trigger;
	}

	/**
	 * This method returns a collection that belongs to a given class of trigger.
	 *
	 * @param tclass A class of trigger.
	 * @return Returns a {@link MongoCollection<Document>}.
	 * @throws MissingParameterException An exception will be thrown when the given class is invalid.
	 */
	private MongoCollection<Document> getCollection(String tclass) throws MissingParameterException {
		MongoCollection<Document> c;
		switch ((tclass).toLowerCase()) {
			case "temporal": {
				c = temporal;
				break;
			}
			case "spatial": {
				c = spatial;
				break;
			}
			case "situation": {
				c = situation;
				break;
			}
			case "communication": {
				c = communication;
				break;
			}
			case "service": {
				c = service;
				break;
			}
			case "entitysituation": {
				c = entitysituation;
				break;
			}
			case "system": {
				c = system;
				break;
			}
			default:
				throw new MissingParameterException("Triggerclass is incorrect.");
		}
		return c;
	}
}
