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

import com.fasterxml.jackson.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
        "@id",
        "@type",
        "InterIoTMsg:ReceiverPlatformId",
        "InterIoTMsg:conversationID",
        "InterIoTMsg:dateTimeStamp",
        "InterIoTMsg:messageID",
})
public class Metadatagraph {
    @JsonProperty("@id")
    public String id;
    @JsonProperty("@type")
    public List<String> type;
    @JsonProperty("InterIoTMsg:ReceiverPlatformId")
    public InterIoTMsgReceiverPlatformId interIoTMsgReceiverPlatformId;
    @JsonProperty("InterIoTMsg:conversationID")
    public String interIoTMsgConversationID;
    @JsonProperty("InterIoTMsg:dateTimeStamp")
    public String interIoTMsgDateTimeStamp;
    @JsonProperty("InterIoTMsg:messageID")
    public String interIoTMsgMessageID;

    @JsonIgnore
    public Map<String, Object> additionalProperties = new HashMap<String, Object>();

    public Metadatagraph() {
    }



}
