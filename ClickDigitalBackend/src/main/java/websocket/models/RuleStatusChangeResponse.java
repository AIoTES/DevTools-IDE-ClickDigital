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
package  websocket.models;

import platforms.openHab.Models.Openhab_Rule;
import rulemanager.models.Rule;
import services.Constants;

import static devicemanager.platforms.openHab.OpenHabDeviceManager.itemStateTranslator;

/**
 * This class represents the response for the frontend for a changed value of an entity of a device
 */
public class RuleStatusChangeResponse extends Response {

    /**
     * The status of the rule
     */
    public String status;

    public String statusDetail;

    public Rule rule;
    /**
     * Constructor with all values to set
     * @param status
     * @param statusDetail
     */
    public RuleStatusChangeResponse(Rule rule, String dateTime, String status, String statusDetail){
        this.dateTime = dateTime;
        this.status = status;
        this.rule = rule;
        this.statusDetail = statusDetail;
        this.topic = Constants.RULESTATUSCHANGED;
    }



}
