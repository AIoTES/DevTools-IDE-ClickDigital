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

import java.util.ArrayList;
import java.util.List;

/**

 * An object of this class represents a rule in openHab.
 */
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class Openhab_Rule {
    public List<Openhab_Trigger> triggers = new ArrayList<>();
    public List<Openhab_Condition> conditions = null;
    public List<Openhab_Action> actions = new ArrayList<>();
    public Openhab_Configuration configuration = new Openhab_Configuration();
    public List<String> configDescriptions = null;
    public String uid = "";
    public String name = "";
    public String enabled;
    public List<String> tags = null;
    public String visibility = "";
    public String description = "";

    public Openhab_Rule(){}

}
