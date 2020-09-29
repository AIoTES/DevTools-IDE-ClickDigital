package platforms.openHab.Models;

import com.fasterxml.jackson.annotation.JsonAutoDetect;

@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
/**
 * Implementations of this abstract class represent the payload of an event received from OpenHab via Server Sent Events.
 */
public abstract class SseEventDataPayload {
    public SseEventDataPayload() {}
}
