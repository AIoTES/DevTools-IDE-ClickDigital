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

import java.util.List;

/**
 * This class represents a Channel on OpenHab
 */
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class Channel {
    public List<String> linkedItems;
    public String uid;
    public String id;
    public String channelTypeUID;
    public String itemType;
    public String kind;
    public String label;


    public String description;
    public List<String> defaultTags;
    @JsonIgnore
    public Properties properties;
    @JsonIgnore
    public Configuration configuration;

    public Channel(List<String> linkedItems, String uid, String id, String channelTypeUID, String itemType, String kind, String label, String description, List<String> defaultTags, Properties properties, Configuration configuration) {
        this.linkedItems = linkedItems;
        this.uid = uid;
        this.id = id;
        this.channelTypeUID = channelTypeUID;
        this.itemType = itemType;
        this.kind = kind;
        this.label = label;
        this.description = description;
        this.defaultTags = defaultTags;
        this.properties = properties;
        this.configuration = configuration;
    }

    public Channel() {
    }


    public List<String> getLinkedItems() {
        return linkedItems;
    }

    public String getUid() {
        return uid;
    }

    public String getId() {
        return id;
    }

    public String getChannelTypeUID() {
        return channelTypeUID;
    }

    public String getItemType() {
        return itemType;
    }

    public String getKind() {
        return kind;
    }

    public String getLabel() {
        return label;
    }

    public String getDescription() {
        return description;
    }

    public List<String> getDefaultTags() {
        return defaultTags;
    }

    public Properties getProperties() {
        return properties;
    }

    public Configuration getConfiguration() {
        return configuration;
    }
}