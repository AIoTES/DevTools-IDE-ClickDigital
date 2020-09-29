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

 * This class represents an Option on OpenHab
 */
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class FilterCriteria {

    public String value;
    public String name;

    public FilterCriteria(String value, String name) {
        this.value = value;
        this.name = name;
    }

    public FilterCriteria(){}

    /**
     *
     * @return value
     */
    public String getValue() {
        return value;
    }

    /**
     *
     * @return name
     */
    public String getName() {
        return name;
    }
}
