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

/**
 * This class models data to be sent when we register a new client
 * at aiotes sil
 */
public class RegisterClientInput {
    public String clientId;
    public String callbackUrl;
    public int receivingCapacity;
    public String responseFormat; //either JSON-LD or JSON
    public String responseDelivery; //either SERVER_PUSH or CLIENT_PULL

    /**
     * Default constructor
     */
    public RegisterClientInput(){}

    /**
     * Constructor to initiate all values
     * @param clientId the id of the new client to register
     * @param callbackUrl the url where new messages e.g. sensor stati are sent to
     * @param receivingCapacity limit of pull messages
     * @param responseFormat either JSON-LD or JSON
     * @param responseDelivery either SERVER_PUSH or CLIENT_PULL
     */
    public RegisterClientInput(String clientId, String callbackUrl, int receivingCapacity, String responseFormat, String responseDelivery) {
        this.clientId = clientId;
        this.callbackUrl = callbackUrl;
        this.receivingCapacity = receivingCapacity;
        this.responseFormat = responseFormat;
        this.responseDelivery = responseDelivery;
    }
}
