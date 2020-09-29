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
package websocket.platforms.aiotesil;

/**

 * This class models a subscription for the internal sse events for aiotes.
 */
public class Subscription {
    public String externalPlatformId;
    public String externalDeviceId;
    public String dateTime;
    public String value;

    /**
     * Default constructor
     */
    public Subscription() {
    }

    /**
     * Constructor to initialize all values.
     * @param externalPlatformId id of the external platform which sent an event
     * @param externalDeviceId id of the corresponding device
     * @param dateTime date and time
     */
    public Subscription(String externalPlatformId, String externalDeviceId, String dateTime, String value) {
        this.externalPlatformId = externalPlatformId;
        this.externalDeviceId = externalDeviceId;
        this.dateTime = dateTime;
        this.value=value;
    }
}
