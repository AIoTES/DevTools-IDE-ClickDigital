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
package anomalymanager.models;

import anomalymanager.nupic.network.PersistenceAPI;
import com.fasterxml.jackson.annotation.JsonAutoDetect;

@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class PersistenceNetwork {
    /**
     * The networks's id
     */
    public String networkId;

    /**
     * The network
     */
    public PersistenceAPI api;

    public PersistenceNetwork(String id, PersistenceAPI api ){
        this.api =api;
        this.networkId=id;
    }

    public PersistenceNetwork(){}


    public String getId() {
        return networkId;
    }

    public void setId(String id) {
        this.networkId = id;
    }

}
