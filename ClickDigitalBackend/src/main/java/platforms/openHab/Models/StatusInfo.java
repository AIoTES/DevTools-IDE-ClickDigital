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

@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class StatusInfo {

    public String status;

    public String statusDetail;

    public String description;


    public StatusInfo(){}

    public StatusInfo(String status, String statusDetail, String description) {
        this.status = status;
        this.statusDetail = statusDetail;
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public String getStatusDetail() {
        return statusDetail;
    }

    public String getDescription() {
        return description;
    }
}
