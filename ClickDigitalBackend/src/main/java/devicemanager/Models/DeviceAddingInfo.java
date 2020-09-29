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
package  devicemanager.Models;

import com.fasterxml.jackson.annotation.JsonAutoDetect;

import java.util.ArrayList;
import java.util.List;

@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class DeviceAddingInfo {
    public String name;
    public String platformId;
    public DeviceInfo deviceInfo = new DeviceInfo();
    public String serialNumber;
    public String getSerialNumber;
    public List<String> protocols = new ArrayList<>();
    public List<String> tags = new ArrayList<>();
    public String location;
    public String externalDeviceId;

    public DeviceAddingInfo(){}
    public DeviceAddingInfo(String platformId){
        this.platformId = platformId;
    }

    public DeviceAddingInfo(String name, String platformId, DeviceInfo deviceInfo, String serialNumber, List<String> protocols, List<String> tags, String location) {
        this.name = name;
        this.platformId = platformId;
        this.deviceInfo = deviceInfo;
        this.serialNumber = serialNumber;
        this.protocols = protocols;
        this.tags = tags;
        this.location=location;
    }
}
