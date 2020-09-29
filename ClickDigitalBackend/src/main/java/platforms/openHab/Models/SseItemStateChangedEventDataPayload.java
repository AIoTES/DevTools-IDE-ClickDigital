package platforms.openHab.Models;

import com.fasterxml.jackson.annotation.JsonAutoDetect;


@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
/**
 * This class represents the payload of an ItemStateChangedEvent received from OpenHab via Server Sent Events.
 */
public class SseItemStateChangedEventDataPayload {

    public String type;
    public String value;
    public String oldType;
    public String oldValue;

    public SseItemStateChangedEventDataPayload() {}
}
