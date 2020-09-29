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
package  platforms.aiotessil.models;

import java.util.HashMap;
import java.util.Map;
import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;


@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
        "InterIoTMsg",
        "InterIoT",
        "sosa",
        "iiot"
})
public class Context {
    @JsonProperty("InterIoTMsg")
    public String interIoTMsg;
    @JsonProperty("InterIoT")
    public String interIoT;
    @JsonProperty("sosa")
    public String sosa;
    @JsonProperty("iiot")
    public String iiot;
    @JsonIgnore
    public Map<String, Object> additionalProperties = new HashMap<String, Object>();

    public Context() {
    }

    @JsonProperty("InterIoTMsg")
    public String getInterIoTMsg() {
        return interIoTMsg;
    }

    @JsonProperty("InterIoTMsg")
    public void setInterIoTMsg(String interIoTMsg) {
        this.interIoTMsg = interIoTMsg;
    }

    @JsonProperty("InterIoT")
    public String getInterIoT() {
        return interIoT;
    }

    @JsonProperty("InterIoT")
    public void setInterIoT(String interIoT) {
        this.interIoT = interIoT;
    }

    @JsonProperty("sosa")
    public String getSosa() {
        return sosa;
    }

    @JsonProperty("sosa")
    public void setSosa(String sosa) {
        this.sosa = sosa;
    }

    @JsonProperty("iiot")
    public String getIiot() {
        return iiot;
    }

    @JsonProperty("iiot")
    public void setIiot(String iiot) {
        this.iiot = iiot;
    }

    @JsonAnyGetter
    public Map<String, Object> getAdditionalProperties() {
        return this.additionalProperties;
    }

    @JsonAnySetter
    public void setAdditionalProperty(String name, Object value) {
        this.additionalProperties.put(name, value);
    }

}
