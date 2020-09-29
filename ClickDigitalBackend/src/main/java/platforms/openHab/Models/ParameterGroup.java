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

 * This class represents a ParameterGroup on OpenHab
 */
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class ParameterGroup {
    public String name;
    public String context;
    public boolean advanced;
    public String label;
    public String description;

    public ParameterGroup(String name, String context, boolean advanced, String label, String description) {
        this.name = name;
        this.context = context;
        this.advanced = advanced;
        this.label = label;
        this.description = description;
    }
    public ParameterGroup(){}

    public String getName() {
        return name;
    }

    public String getContext() {
        return context;
    }

    public boolean isAdvanced() {
        return advanced;
    }

    public String getLabel() {
        return label;
    }

    public String getDescription() {
        return description;
    }
}
