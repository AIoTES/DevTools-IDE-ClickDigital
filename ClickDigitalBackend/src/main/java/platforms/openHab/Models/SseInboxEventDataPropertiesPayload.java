package platforms.openHab.Models;

import com.fasterxml.jackson.annotation.JsonAutoDetect;


@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
/**
* This class represents the payload of an ItemStateChangedEvent received from OpenHab via Server Sent Events.
 */
public class SseInboxEventDataPropertiesPayload {

    public String brideUID;
    public String flag;
    public String label;
    public String properties;
    public String thingUID;
    public String thingTypeUID;

    public SseInboxEventDataPropertiesPayload() {}
}
