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

/**

 * An obejct of this class represents an action in openHab.
 *
 */
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class Openhab_Action {
    public String id = null;
    public String label = null;
    public String description = null;
    public Openhab_Configuration configuration = new Openhab_Configuration();
    public String type = null;
    public Openhab_Inputs inputs = new Openhab_Inputs();

    public Openhab_Action(){};
}
