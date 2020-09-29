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
 * This class represents an item on OpenHab
 */
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class Item {
    public String type;
    public String name;
    public String label;
    public String category;
    public List<String> tags;
    public List<String> groupNames;
    public String link;
    public String state;
    public String transformedState;
    public StateDescription stateDescription;

    public Item() {}

    public Item(String type, String name, String label, String category, List<String> tags, List<String> groupNames, String link, String state, String transformedState, StateDescription stateDescription) {
        this.type = type;
        this.name = name;
        this.label = label;
        this.category = category;
        this.tags = tags;
        this.groupNames = groupNames;
        this.link = link;
        this.state = state;
        this.transformedState = transformedState;
        this.stateDescription = stateDescription;
    }

    public String getType() {
        return type;
    }

    public String getName() {
        return name;
    }

    public String getLabel() {
        return label;
    }

    public String getCategory() {
        return category;
    }

    public List<String> getTags() {
        return tags;
    }

    public List<String> getGroupNames() {
        return groupNames;
    }

    public String getLink() {
        return link;
    }

    public String getState() {
        return state;
    }

    public String getTransformedState() {
        return transformedState;
    }

    public StateDescription getStateDescription() {
        return stateDescription;
    }
}
