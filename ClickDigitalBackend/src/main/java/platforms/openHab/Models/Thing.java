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

@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
/**
 * This class represents a Thing in OpenHab
 */
public class Thing {
    public String label;
    public String bridgeUID;
    @JsonIgnore
    public Configuration configuration;
    @JsonIgnore
    public Properties properties;
    public  String UID;
    public String thingTypeUID;
    public List<Channel> channels;
    public String location;
    public StatusInfo statusInfo;
    public FirmwareStatus firmwareStatus;
    public boolean editable;



   public Thing(){}

    public Thing(String label, String bridgeUID, Configuration configuration, Properties properties, String UID, String thingTypeUID, List<Channel> channels, String location, StatusInfo statusInfo, FirmwareStatus firmwareStatus, boolean editable) {
        this.label = label;
        this.bridgeUID = bridgeUID;
        this.configuration = configuration;
        this.properties = properties;
        this.UID = UID;
        this.thingTypeUID = thingTypeUID;
        this.channels = channels;
        this.location = location;
        this.statusInfo = statusInfo;
        this.firmwareStatus = firmwareStatus;
        this.editable = editable;
    }

    public String getLabel() {
        return label;
    }

    public String getBridgeUID() {
        return bridgeUID;
    }

    public Configuration getConfiguration() {
        return configuration;
    }

    public Properties getProperties() {
        return properties;
    }

    public String getUID() {
        return UID;
    }

    public String getThingTypeUID() {
        return thingTypeUID;
    }

    public List<Channel> getChannels() {
        return channels;
    }

    public String getLocation() {
        return location;
    }

    public StatusInfo getStatusInfo() {
        return statusInfo;
    }

    public FirmwareStatus getFirmwareStatus() {
        return firmwareStatus;
    }

    public boolean isEditable() {
        return editable;
    }
}
