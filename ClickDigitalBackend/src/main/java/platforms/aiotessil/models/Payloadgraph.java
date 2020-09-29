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

import com.fasterxml.jackson.annotation.*;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
        "@id",
        "@type",
        "iiot:hasName",
        "sosa:resultTime",
        "sosa:hasResult",
        "sosa:madeBySensor",
        "iiot:hasResultValue",
        "iiot:hasUnit",
        "InterIoT:GOIoTP#hasName",
        "sosa:isHostedBy"
})
public class Payloadgraph {
    @JsonProperty("@id")
    public String id;
    @JsonProperty("@type")
    public String type;
    @JsonProperty("iiot:hasName")
    public String iiotHasName;
    @JsonProperty("sosa:resultTime")
    public SosaResultTime sosaResultTime;
    @JsonProperty("sosa:hasResult")
    public SosaHasResult sosaHasResult;
    @JsonProperty("sosa:madeBySensor")
    public SosaMadeBySensor sosaMadeBySensor;
    @JsonProperty("iiot:hasResultValue")
    public IiotHasResultValue iiotHasResultValue;
    @JsonProperty("iiot:hasUnit")
    public IiotHasUnit iiotHasUnit;
    @JsonProperty("InterIoT:GOIoTP#hasName")
    public String interIoTGOIoTPHasName;
    @JsonProperty("sosa:isHostedBy")
    public SosaIsHostedBy sosaIsHostedBy;
    @JsonIgnore
    public Map<String, Object> additionalProperties = new HashMap<String, Object>();

    public Payloadgraph() {
    }

}
