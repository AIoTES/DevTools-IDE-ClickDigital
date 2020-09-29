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

import java.util.List;

/**
 * This class represents an Option on OpenHab
 */
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class Option {

    public String value;
    public String label;

    public Option(String value, String label) {
        this.value = value;
        this.label = label;
    }
    public Option(){}

    /**
     *
     * @return value
     */
    public String getValue() {
        return value;
    }

    /**
     *
     * @return label
     */
    public String getLabel() {
        return label;
    }
}
