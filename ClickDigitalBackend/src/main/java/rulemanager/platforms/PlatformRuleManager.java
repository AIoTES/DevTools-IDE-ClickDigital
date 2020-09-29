package rulemanager.platforms;

import com.fasterxml.jackson.core.JsonProcessingException;
import exceptions.PlatformDataProcessingException;

/**

 * An object of an implementing class of this represents an IoT-platform.
 */
public abstract class PlatformRuleManager {

    protected String userId;
    protected String projectID;
    protected String platformId;

    public PlatformRuleManager(String userId, String projectID, String platformId){
        this.userId = userId;
        this.projectID = projectID;
        this.platformId = platformId;
    }

    /**
     * This method sends a rule to a given platform.
     *
     * @param ruleID The internal ID of the target rule.
     * @throws PlatformDataProcessingException Throws when an error occurs.
     */
    public abstract void sendRule(int ruleID) throws PlatformDataProcessingException, JsonProcessingException;

    /**
     * Deletes a rule by a given ID.
     *
     * @param ruleID An ID of a rule.
     * @throws PlatformDataProcessingException Throws when an error occurs.
     */
    public abstract void deleteRule(String ruleID)throws PlatformDataProcessingException;

    /**
     * Activate a rule by a given ID.
     *
     * @param ruleID The ID of the target rule.
     * @throws PlatformDataProcessingException Throws when an error occurs.
     */
    public abstract void activateRule(String ruleID)throws PlatformDataProcessingException;

    /**
     * Deactivate a rule by a given ID.
     *
     * @param ruleID The ID of the target rule.
     * @throws PlatformDataProcessingException Throws when an error occurs.
     */
    public abstract void deactivateRule(String ruleID)throws PlatformDataProcessingException;
}
