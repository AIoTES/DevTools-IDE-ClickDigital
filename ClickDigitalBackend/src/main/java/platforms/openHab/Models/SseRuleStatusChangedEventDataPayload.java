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
package  platforms.openHab.Models;

import com.fasterxml.jackson.annotation.JsonAutoDetect;


@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
/**

 * This class represents the details of the payload of an RuleStatusChangedEvent received from OpenHab via Server Sent Events.
 */
public class SseRuleStatusChangedEventDataPayload {

    public String status;
    public String statusDetail;

    public SseRuleStatusChangedEventDataPayload() {}
}
