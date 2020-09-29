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
 *
 * This class represents a ChannelType on OpenHab
 */
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class ChannelType {

    public List<Parameter> parameters;
    public List<ParameterGroup> parameterGroups;
    public String description;
    public String label;
    public String category;
    public String itemType;
    public String kind;
    public StateDescription stateDescription;
    public List<String> tags;
    public String UID;
    public boolean advanced;


    public ChannelType(List<Parameter> parameters, List<ParameterGroup> parameterGroups, String description, String label, String category, String itemType, String kind, StateDescription stateDescription, List<String> tags, String UID, boolean advanced) {
        this.parameters = parameters;
        this.parameterGroups = parameterGroups;
        this.description = description;
        this.label = label;
        this.category = category;
        this.itemType = itemType;
        this.kind = kind;
        this.stateDescription = stateDescription;
        this.tags = tags;
        this.UID = UID;
        this.advanced = advanced;
    }

    public ChannelType(){}

    public List<Parameter> getParameters() {
        return parameters;
    }

    public List<ParameterGroup> getParameterGroups() {
        return parameterGroups;
    }

    public String getDescription() {
        return description;
    }

    public String getLabel() {
        return label;
    }

    public String getCategory() {
        return category;
    }

    public String getItemType() {
        return itemType;
    }

    public String getKind() {
        return kind;
    }

    public StateDescription getStateDescription() {
        return stateDescription;
    }

    public List<String> getTags() {
        return tags;
    }

    public String getUID() {
        return UID;
    }

    public boolean isAdvanced() {
        return advanced;
    }
}
