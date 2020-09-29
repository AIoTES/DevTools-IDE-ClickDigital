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
import com.fasterxml.jackson.annotation.JsonIgnore;

/**

 * This class represents a Binding on OpenHab
 */
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class InboxThings {

    public String bridgeUID;
    public String flag;
    public String label;
    @JsonIgnore
    public Properties properties;
    public String representationProperty;
    public String thingUID;
    public String thingTypeUID;

    public InboxThings(){}

    public InboxThings(String bridgeUID, String flag, String label, Properties properties, String representationProperty, String thingUID, String thingTypeUID) {
        this.bridgeUID = bridgeUID;
        this.flag = flag;
        this.label = label;
        this.properties = properties;
        this.representationProperty = representationProperty;
        this.thingUID = thingUID;
        this.thingTypeUID = thingTypeUID;
    }
}
