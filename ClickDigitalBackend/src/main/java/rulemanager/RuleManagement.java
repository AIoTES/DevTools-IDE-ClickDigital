package rulemanager;

import com.mongodb.client.MongoDatabase;
import exceptions.*;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import rulemanager.Manager.*;
import rulemanager.models.Notification;
import rulemanager.models.Rule;
import rulemanager.models.Triggergroup;
import rulemanager.platforms.PlatformRuleManager;
import rulemanager.platforms.PlatformRuleManagerFactory;
import services.UtilityService;
import usersessionmanager.UserSessionManager;
import usermanager.User;

import javax.annotation.Nullable;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**

 *
 * The mainclass, which handels all rest requests and calls the internal methods.
 */
@Path("/ruleManagement")
public class RuleManagement {
	public RuleManager ruleManager;
	private TriggergroupManager triggerManager;
    private UserSessionManager userSessionManager = new UserSessionManager();

	// PlatformFactory
	private PlatformRuleManagerFactory ruleManagerFactory = new PlatformRuleManagerFactory();
	private MongoDatabase database = services.UtilityService.getDatabase(UtilityService.PropertyKeys.BACKEND_DATABASE_NAME);
	private ActionManager actionManager; // = new ActionManager(database);
	ConditionManager conditionManager; // = new ConditionManager(database);
	IDManager idManager; //new IDManager(database);

	/**
	 * The constructor of the mainclass RuleManagerment.
	 * It initialize the database and the different manager, which manages different parts of the whole functionality.
	 * Manager for each manager will be set, so the can interact with each other.
	 */
	public RuleManagement() {

	}

	/**
	 * Method to initialize the manager classes with the respective user id
	 *
	 * @param userID
	 */
	public void initManager(String userID) {
		idManager = new IDManager(database, userID);
		conditionManager = new ConditionManager(database, userID);
		conditionManager.setManager(idManager);
		actionManager = new ActionManager(database, userID);
		actionManager.setManager(conditionManager, idManager);

		ruleManager = new RuleManager(database, userID);
		ruleManager.setManager(actionManager, idManager);
		triggerManager = new TriggergroupManager(database, userID);
		triggerManager.setManager(conditionManager, idManager);

	}

	/**
	 * Create a rule in the database
	 * Created rule will be also sent to the target platform
	 *
	 * @param rule from dashboard generated rule
	 * @param userID user id of client
	 * @return created rule
	 * @throws MissingParameterException is thrown if the rule parameter is missing
	 * @throws PlatformDataProcessingException if the rule which has been sent to the platform is missing parameter or UID already exists
	 * @throws PlatformNotFoundException if rule target platform was not found.
	 * @throws IOException for general exception purpose
	 */
	@POST
	@Path("/createRule/{userID}")
	@Consumes("application/json")
	@Produces(MediaType.APPLICATION_JSON)
	public Rule createRule(Rule rule, @PathParam("userID") String userID, @Context HttpServletRequest request, @Context HttpServletResponse response) throws MissingParameterException, PlatformDataProcessingException, PlatformNotFoundException, IOException, InvalidSessionException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);

	    initManager(userID);

		Rule createdRule = ruleManager.createRule(rule);

		PlatformRuleManager platformRuleManager = ruleManagerFactory.CreatePlatformRuleManager(rule.platformID, ruleManager, triggerManager, userID, rule.projectID);

		platformRuleManager.sendRule(createdRule.ID);

		return createdRule;
	}


	/**
	 * Creates a triggergroup by calling the responsible method.
	 *
	 * @param trigger The current triggergroup which was generated on dashboard-side.
	 * @param userID trigger is associated with user id
	 * @return Returns a {@link Triggergroup} with all its attributes set.
	 * @throws MissingParameterException
	 */
	@POST
	@Path("/createTriggergroup/{userID}")
	@Consumes("application/json")
	@Produces(MediaType.APPLICATION_JSON)
	public Triggergroup createTriggergroupREST(Triggergroup trigger, @PathParam("userID") String userID, @Context HttpServletRequest request, @Context HttpServletResponse response) throws MissingParameterException, PlatformDataProcessingException, PlatformNotFoundException, IOException, InvalidSessionException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);
	    initManager(userID);
		return triggerManager.createTriggergroup(trigger);
	}

	/**
	 * Creates a triggergroup by calling the responsible method.
	 *
	 * @param trigger The current triggergroup which was generated on dashboard-side.
	 * @param userID trigger is associated with user id
	 * @return Returns a {@link Triggergroup} with all its attributes set.
	 * @throws MissingParameterException
	 */
	public Triggergroup createTriggergroup(Triggergroup trigger,String userID) throws MissingParameterException {
		initManager(userID);
		return triggerManager.createTriggergroup(trigger);
	}

	/**
	 * Shares a all triggergroups by calling the responsible method.
	 * @param triggers
	 * @param userID
	 * @return Returns  Trigger root ID.
	 * @throws MissingParameterException
	 */

	/**
	 * Shares a all triggergroups by calling the responsible method.
	 *
	 * @param triggers list of triggers which should be shared
	 * @param userID shared user id
	 * @param TGID root id of triggers
	 * @return result trigger tree root id
	 * @throws MissingParameterException if trigger parameter is missing.
	 */
	@POST
	@Path("/shareAllTriggergroup/{userID}/{TGID}")
	@Consumes("application/json")
	@Produces(MediaType.APPLICATION_JSON)
	public int shareAllTriggergroup(ArrayList<Triggergroup> triggers, @PathParam("userID") String userID, @PathParam("TGID") int TGID, @Context HttpServletRequest request, @Context HttpServletResponse response) throws MissingParameterException, PlatformDataProcessingException, PlatformNotFoundException, IOException, InvalidSessionException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);
	    initManager(userID);
		int resultTGID = 0;
		ArrayList<Triggergroup> resultTGList = new ArrayList<>();
		for(Triggergroup triggergroup : triggers){
			try {
				int oldSavedTriggergroupID = triggergroup.ID;
				Triggergroup resultTg = triggerManager.createTriggergroupWithoutChildCheck(triggergroup);
				resultTGList.add(resultTg);

				if(TGID == oldSavedTriggergroupID){
					resultTGID = resultTg.ID;
				}
				boolean needUpdate  = false;

				for (int i = 0; i < triggers.size(); i++) {
					Triggergroup updatedTrigger = triggers.get(i);
					if(updatedTrigger.leftchild == oldSavedTriggergroupID){
						updatedTrigger.leftchild = resultTg.ID;
						needUpdate = true;
					}
					if(updatedTrigger.rightchild == oldSavedTriggergroupID){
						updatedTrigger.rightchild = resultTg.ID;
						needUpdate = true;
					}
					if(needUpdate) {
							triggers.set(i, updatedTrigger);
					}
					for (int j = 0; j < resultTGList.size(); j++) {
						needUpdate = false;
						Triggergroup updatedTriggerAdded = triggers.get(j);
						if (updatedTriggerAdded.leftchild == oldSavedTriggergroupID) {
							updatedTriggerAdded.leftchild = resultTg.ID;
							needUpdate = true;
						}
						if (updatedTriggerAdded.rightchild == oldSavedTriggergroupID) {
							updatedTriggerAdded.rightchild = resultTg.ID;
							needUpdate = true;
						}
						if (needUpdate) {
							try {
								triggerManager.updateTriggergroup(updatedTriggerAdded, userID);
							} catch (MissingDatabaseEntryException e) {
								e.printStackTrace();
							}
						}
					}
				}
			} catch (MissingParameterException e) {
				e.printStackTrace();
			}
		}
		return resultTGID;
	}

	/**
	 * Creates a triggergroups by calling the responsible method.
	 * @param triggers
	 * @param userID
	 * @return Returns  all triggers with all its attributes set.
	 * @throws MissingParameterException
	 */
	@POST
	@Path("/saveAllTriggergroup/{userID}")
	@Consumes("application/json")
	@Produces(MediaType.APPLICATION_JSON)
	public ArrayList<Triggergroup> saveAllTriggergroups(ArrayList<Triggergroup> triggers, @PathParam("userID") String userID, @Context HttpServletRequest request, @Context HttpServletResponse response) throws MissingParameterException, PlatformDataProcessingException, PlatformNotFoundException, IOException, InvalidSessionException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);
	    initManager(userID);
		triggers.forEach(triggergroup -> {
			try {
				createTriggergroup(triggergroup,userID);
			} catch (MissingParameterException e) {
				e.printStackTrace();
			}
		});
		return triggers;
	}

	/**
	 * Delete Triggergroup by ID
	 *
	 * @param triggerID
	 * @param userID
	 * @return
	 * @throws MissingParameterException
	 */
	@DELETE
	@Path("/deleteTriggergroup/{triggerID}/{userID}")
	@Consumes("application/json")
	public boolean deleteTriggergroup(@PathParam("triggerID") int triggerID, @PathParam("userID") String userID, @Context HttpServletRequest request, @Context HttpServletResponse response) throws MissingParameterException, PlatformDataProcessingException, PlatformNotFoundException, IOException, InvalidSessionException, MissingDatabaseEntryException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);
	    initManager(userID);
		return triggerManager.deleteTriggerGroup(triggerID, userID);
	}

	/**
	 * Returns a rule which belongs to a given ID.
	 *
	 * @param ID An internal ID of a rule.
	 * @return Returns a {@link Rule}.
	 * @throws MissingDatabaseEntryException An exception will be thrown when the rule not found.
	 */
	@Path("/getRule/{userID}")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Rule getRuleREST(@QueryParam("ID") int ID, @PathParam("userID") String userID, @Context HttpServletRequest request, @Context HttpServletResponse response) throws MissingParameterException, PlatformDataProcessingException, PlatformNotFoundException, IOException, InvalidSessionException, MissingDatabaseEntryException, ActionCycleException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);
	    initManager(userID);
		return ruleManager.getRule(ID);
	}

	/**
	 * Returns a rule which belongs to a given ID.
	 *
	 * @param ID An internal ID of a rule.
	 * @return Returns a {@link Rule}.
	 * @throws MissingDatabaseEntryException An exception will be thrown when the rule not found.
	 */
	public Rule getRule(int ID,@Nullable String userID) throws MissingDatabaseEntryException, ActionCycleException {
		initManager(userID);
		return ruleManager.getRule(ID);
	}

	/**
	 * Returns all stored rules with specific user id.
	 *
	 * @param userID user id
	 * @return  a {@link List<Rule>}.
	 * @throws MissingDatabaseEntryException exception will be thrown when a rule not found.
	 * @throws ActionCycleException if Cycle in the list of ruleActions is detected
	 */
	@Path("/getAllRules/{userID}")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public List<Rule> getAllRules(@PathParam("userID") String userID, @QueryParam("projectID") String projectID, @Context HttpServletRequest request, @Context HttpServletResponse response) throws MissingParameterException, PlatformDataProcessingException, PlatformNotFoundException, IOException, InvalidSessionException, ActionCycleException, MissingDatabaseEntryException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);
	    Logger logger = LogManager.getLogger();
		logger.warn("  getAllRules projectID "+ projectID);
		initManager(userID);
		return ruleManager.getAllRules(projectID);
	}

	/**
	 * Returns the status of the rule which belongs to the given ID.
	 *
	 * @param ID The internal ID of the target rule.
	 * @return Returns true if the rule is activ, else it returns false.
	 * @throws MissingDatabaseEntryException An exception will be thrown when the rule not found.
	 */
	@Path("/getRuleStatus/{userID}")
	@GET
	@Produces(MediaType.TEXT_PLAIN)
	public Boolean getRuleStatus(@QueryParam("ID") int ID, @PathParam("userID") String userID, @Context HttpServletRequest request, @Context HttpServletResponse response) throws MissingParameterException, PlatformDataProcessingException, PlatformNotFoundException, IOException, InvalidSessionException, ActionCycleException, MissingDatabaseEntryException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);
	    initManager(userID);
		return ruleManager.getRuleStatus(ID);
	}

	/**
	 * This method returns a list of all stored triggergroups.
	 *
	 * @param userID user id
	 * @return List of Triggergroups
	 * @throws MissingDatabaseEntryException This exception will be thrown when a triggergroup or trigger not found.
	 * @throws MissingParameterException     This exception will be thrown when a parameter is missing.
	 */
	@Path("/getAllTriggergroups/{userID}")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public List<Triggergroup> getAllTriggergroups(@PathParam("userID") String userID, @QueryParam("projectID") String projectID, @Context HttpServletRequest request, @Context HttpServletResponse response) throws MissingParameterException, PlatformDataProcessingException, PlatformNotFoundException, IOException, InvalidSessionException, ActionCycleException, MissingDatabaseEntryException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);
	    initManager(userID);
		return triggerManager.getAllTriggergroups(projectID);
	}

	/**
	 * returns trigger tree as a list witch is based on TGID
	 *
	 * @param TGID
	 * @return list of triggers
	 * @throws MissingDatabaseEntryException
	 * @throws MissingParameterException
	 */
	@Path("/getTriggersByTGID/{TGID}")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public List<Triggergroup> getTriggersByTGID(@QueryParam("userID") String userID, @PathParam("TGID") int TGID, @Context HttpServletRequest request, @Context HttpServletResponse response) throws InvalidSessionException, MissingDatabaseEntryException, MissingParameterException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);
	    List<Triggergroup> list = new ArrayList<>();
		initManager(userID);
		return triggerManager.getTGsForRule(TGID, list);
	}

	/**
	 * This method returns a list of all trigger which are grouped by a given category.
	 *
	 * @param category A category of a trigger. (category is corresponding to triggerclass)
	 * @return Returns a {@link List<Triggergroup>}.
	 * @throws MissingDatabaseEntryException This exception will be thrown when a triggergroup or trigger not found.
	 * @throws MissingParameterException     This exception will be thrown when a parameter is missing.
	 */
	@Path("/getAllTriggerByCategory/{userID}")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public List<Triggergroup> getAllTriggerByCategory(@QueryParam("category") String category, @PathParam("userID") String userID, @Context HttpServletRequest request, @Context HttpServletResponse response) throws InvalidSessionException, MissingDatabaseEntryException, MissingParameterException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);
	    initManager(userID);
		return triggerManager.getAllTriggerByCategory(category);
	}

	/**
	 * Deletes a rule by a given ID.
	 *
	 * @param ruleID     The internal ID of the target rule.
	 * @param platformID The ID of the target platform.
	 * @param projectID  The ID of the project.
	 * @throws PlatformNotFoundException when platform not found.
	 * @throws PlatformDataProcessingException  when an error occur.
	 */
	@DELETE
	@Path("/deleteRule/{ruleID}")
	public void deleteRule(@PathParam("ruleID") int ruleID,
						   @QueryParam("userID") String userID,
						   @QueryParam("platformID") String platformID,
						   @QueryParam("projectID") String projectID, @Context HttpServletRequest request, @Context HttpServletResponse response) throws InvalidSessionException, PlatformNotFoundException, PlatformDataProcessingException, IOException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);
	    initManager(userID);
		Boolean result = ruleManager.deleteRule(ruleID);
		if (result) {
			PlatformRuleManager platformRuleManager = ruleManagerFactory.CreatePlatformRuleManager(platformID, ruleManager, triggerManager, userID, projectID);
			platformRuleManager.deleteRule(ruleManager.getUID(ruleID));
		}
	}

	/**
	 *  Activate a rule by a given ID
	 *
	 * @param ruleID The internal ID of the target rule.
	 * @param userID rule connected user id
	 * @param platformID The ID of the target platform.
	 * @param projectID The ID of the target project.
	 * @return Returns true if success.
	 * @throws PlatformNotFoundException when platform not found.
	 * @throws PlatformDataProcessingException when an error occur.
	 * @throws IOException general exception
	 */
	@GET
	@Path("/activateRule/{ruleID}")
	@Produces(MediaType.APPLICATION_JSON)
	public Boolean activateRule(@PathParam("ruleID") int ruleID,
								@QueryParam("userID") String userID,
								@QueryParam("platformID") String platformID,
								@QueryParam("projectID") String projectID, @Context HttpServletRequest request, @Context HttpServletResponse response) throws InvalidSessionException, PlatformNotFoundException, PlatformDataProcessingException, IOException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);
	    initManager(userID);
		Boolean result = ruleManager.activateRule(ruleID);
		if (result) {
			PlatformRuleManager platformRuleManager = ruleManagerFactory.CreatePlatformRuleManager(platformID, ruleManager, triggerManager, userID, projectID);
			platformRuleManager.activateRule(ruleManager.getUID(ruleID));
		}
		return result;
	}

	/**
	 * Deactivate a rule by a given ID
	 * @param ruleID The internal ID of the target rule.
	 * @param userID The rule connected user id
	 * @param platformID The ID of the target platform.
	 * @param projectID
	 * @return Returns true if success.
	 * @throws PlatformNotFoundException when platform not found.
	 * @throws PlatformDataProcessingException when an error occur.
	 * @throws IOException general exception
	 */
	@GET
	@Path("/deactivateRule/{ruleID}")
	@Produces(MediaType.APPLICATION_JSON)
	public Boolean deactivateRule(@PathParam("ruleID") int ruleID,
								  @QueryParam("userID") String userID,
								  @QueryParam("platformID") String platformID,
								  @QueryParam("projectID") String projectID, @Context HttpServletRequest request, @Context HttpServletResponse response) throws InvalidSessionException, PlatformNotFoundException, PlatformDataProcessingException, IOException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);
	    initManager(userID);
		Boolean result = ruleManager.deactivateRule(ruleID);
		if (result) {
			PlatformRuleManager platformRuleManager = ruleManagerFactory.CreatePlatformRuleManager(platformID, ruleManager, triggerManager, userID, projectID);
			platformRuleManager.deactivateRule(ruleManager.getUID(ruleID));
		}
		return result;
	}

	/**
	 * Edits a existing rule.
	 *
	 * @param rule The edited rule.
	 * @throws MissingDatabaseEntryException   Throws when the rule not found.
	 * @throws PlatformNotFoundException       Throws when platform not found.
	 * @throws PlatformDataProcessingException Throws when an error occur.
	 */
	@PUT
	@Path("/updateRule/{userID}")
	@Consumes("application/json")
	public void updateRule(Rule rule, @PathParam("userID") String userID, @Context HttpServletRequest request, @Context HttpServletResponse response) throws InvalidSessionException, MissingDatabaseEntryException, PlatformNotFoundException, PlatformDataProcessingException, IOException, MissingParameterException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);
	    initManager(userID);
		ruleManager.editRule(rule);
		PlatformRuleManager platformRuleManager = ruleManagerFactory.CreatePlatformRuleManager(rule.platformID, ruleManager, triggerManager, userID, rule.projectID);
		//platformRuleManager.deleteRule(ruleManager.getUID(rule.ID));
		platformRuleManager.sendRule(rule.ID);
	}

	/**
	 * Creates a notification by calling the responsible method.
	 *
	 * @param notification The current notification which was changed on dashboard-side.
	 * @return Returns a {@link Notification} with all its attributes set.
	 * @throws MissingParameterException An exception will be thrown when an important parameter is missing.
	 */
	@POST
	@Path("/createNotification/{userID}")
	@Consumes("application/json")
	@Produces(MediaType.APPLICATION_JSON)
	public Notification createNotification(Notification notification, @PathParam("userID") String userID, @Context HttpServletRequest request, @Context HttpServletResponse response) throws InvalidSessionException, MissingParameterException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);
	    initManager(userID);
		Notification savedNotification = ruleManager.createNotification(notification);
		return savedNotification;
	}
	/**
	 * Update a notifications by calling the responsible method.
	 *
	 * @param notifications The current notification which was changed on dashboard-side.
	 * @return Returns a {@link Notification} with all its attributes set.
	 * @throws MissingParameterException An exception will be thrown when an important parameter is missing.
	 */
	@PUT
	@Path("/updateNotifications/{userID}")
	@Consumes("application/json")
	@Produces(MediaType.APPLICATION_JSON)
	public ArrayList<Notification> updateNotifications(ArrayList<Notification> notifications, @PathParam("userID") String userID, @Context HttpServletRequest request, @Context HttpServletResponse response) throws InvalidSessionException, MissingParameterException, PlatformDataProcessingException, PlatformNotFoundException, IOException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);
	    initManager(userID);
		for(int i = 0; i < notifications.size();  i++){
			try {
				ruleManager.updateNotification(notifications.get(i));
			} catch (MissingDatabaseEntryException e) {
				e.printStackTrace();
			} catch (MissingParameterException e) {
				e.printStackTrace();
			}
		}

		return notifications;
	}
	/**
	 * This method returns list of notifications with user id
	 *
	 * @param userID
	 * @return list of notifications
	 * @throws MissingDatabaseEntryException
	 */
	@Path("/getAllNotifications/{userID}")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public ArrayList<NotificationData> getAllNotifications(@PathParam("userID") String userID, @Context HttpServletRequest request, @Context HttpServletResponse response) throws InvalidSessionException, MissingDatabaseEntryException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);
	    initManager(userID);
		ArrayList<NotificationData> notificationList = new ArrayList<>();
		for (NotificationData n : ruleManager.getAllNotifications(userID)) {
			notificationList.add(n);
		}
		return notificationList;
	}

	/**
	 *
	 * @param notificationID
	 * @param userID
	 * @return
	 * @throws PlatformNotFoundException
	 * @throws PlatformDataProcessingException
	 * @throws IOException
	 */
	@DELETE
	@Path("/deleteNotification/{userID}/{notificationID}")
	public boolean deleteNotification(@PathParam("notificationID") int notificationID,
									  @PathParam("userID") String userID, @Context HttpServletRequest request, @Context HttpServletResponse response) throws InvalidSessionException, PlatformNotFoundException, PlatformDataProcessingException, IOException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);
	    initManager(userID);
		Boolean result = ruleManager.deleteNotification(notificationID);

		return result;
	}
}
