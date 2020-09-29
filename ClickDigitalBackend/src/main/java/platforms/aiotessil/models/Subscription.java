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
package platforms.aiotessil.models;

import java.util.List;

/**
 * This class models a subscription
 * at aiotes sil
 */
public class Subscription {
   public String conversationId;
   public List<String> deviceIds;
   public String clientId;

    /**
     * Default constructor
     */
    public Subscription(){}

}
