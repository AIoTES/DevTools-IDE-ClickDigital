package rulemanager.platforms;

import exceptions.PlatformNotFoundException;
import platformmanager.PlatformManager;
import rulemanager.Manager.RuleManager;
import rulemanager.Manager.TriggergroupManager;
import rulemanager.platforms.openhab.OpenHabRuleManager;
import services.IdTranslator;

import java.io.IOException;

/**

 * Manages many differents platforms.
 */
public class PlatformRuleManagerFactory {

    public PlatformRuleManagerFactory(){
    }

    /**
     * Factory method which consumes the id of a platform and produces an instance of {@link PlatformRuleManager}
     * for that platform if the id is known, otherwise a {@link PlatformNotFoundException} is thrown.
     * @param id The id of the platform for which to produce the {@link PlatformRuleManager} instance.
     * @return An instance of a class derived from {@link PlatformRuleManager} which can send a rule to a
     * specific platform.
     * @throws PlatformNotFoundException If the given id is not known.
     */
    public PlatformRuleManager CreatePlatformRuleManager(String platformId, RuleManager rm, TriggergroupManager tm, String userId, String projectID) throws PlatformNotFoundException, IOException {
        String internalId= IdTranslator.deserializePlatformId(platformId)[1];
        switch (internalId){
            case PlatformManager.OPENHABID: return new OpenHabRuleManager(rm, tm, userId, projectID, platformId);
            default: throw new PlatformNotFoundException("Unknown id: " + platformId);
        }
    }
}
