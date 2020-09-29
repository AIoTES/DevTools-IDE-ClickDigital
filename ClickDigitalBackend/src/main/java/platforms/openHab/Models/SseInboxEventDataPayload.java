package platforms.openHab.Models;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.bson.codecs.pojo.annotations.BsonIgnore;


@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
/**
 * This class represents the payload of an ItemStateChangedEvent received from OpenHab via Server Sent Events.
 */
public class SseInboxEventDataPayload {

    public String brideUID;
    public String flag;
    public String label;

    @JsonIgnore
    @BsonIgnore
    public transient String properties;

    public String thingUID;
    public String thingTypeUID;

    public SseInboxEventDataPayload() {}
}
