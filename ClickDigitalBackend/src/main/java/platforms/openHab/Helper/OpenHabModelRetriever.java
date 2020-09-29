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
package  platforms.openHab.Helper;

import exceptions.PlatformDataProcessingException;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import platforms.openHab.Models.*;
import rulemanager.models.Rule;

import javax.ws.rs.core.GenericType;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.List;

/**
 * This class is used to retrieve data from the OpenHab platform in the form of model classes representing that data.
 */
public class OpenHabModelRetriever {

    /**
     * The {@link RequestHelper} to be used for REST requests.
     */
    private RequestHelper requestHelper;



    /**
     * This constructor reveals the dependencies of this class and is used for instantiation in test classes
     * and injection of mocks.
     * @param requestHelper The {@link RequestHelper} to be used in this class.
     */
    public OpenHabModelRetriever(RequestHelper requestHelper) {
        this.requestHelper = requestHelper;
    }

    /**
     * Retrieves a {@link Thing} from OpenHab for a given deviceId, or throws a {@link PlatformDataProcessingException}
     * if the Thing could be retrieved successfully.
     * @param openHabDeviceId The id of the Thing in OpenHab.
     * @return A {@link Thing} representing a Thing in OpenHab.
     * @throws PlatformDataProcessingException If an error occurs during the request to the platform.
     */
    public Thing getThingFromOpenHab(String openHabDeviceId) throws PlatformDataProcessingException {

        Response response = requestHelper.sendGetRequest(
                "things",
                new String[]{"thingUID"},
                new Object[]{openHabDeviceId},
                new String[]{},
                new Object[]{},
                MediaType.APPLICATION_JSON_TYPE);

        return response.readEntity(Thing.class);
    }

    /**
     * Retrieves all available {@link Thing} from OpenHab or throws a {@link PlatformDataProcessingException}
     * if the Things could be retrieved successfully.
     * @return a List consisting of {@link Thing}
     * @throws PlatformDataProcessingException If an error occurs during the request to the platform.
     */
    public List<Thing> getThingsFromOpenHab() throws PlatformDataProcessingException {
        Response response = requestHelper
                .sendGetRequest(
                        "things",
                        new String[]{},
                        new Object[]{},
                        new String[]{},
                        new Object[]{},
                        MediaType.APPLICATION_JSON_TYPE);

        return response.readEntity(new GenericType<List<Thing>>(){});
    }
    public List<Rule> getRulesFromOpenHab() throws PlatformDataProcessingException {
        Response response = requestHelper
                .sendGetRequest(
                        "rules",
                        new String[]{},
                        new Object[]{},
                        new String[]{},
                        new Object[]{},
                        MediaType.APPLICATION_JSON_TYPE);

        return response.readEntity(new GenericType<List<Rule>>(){});
    }
    /**
     * Retrieves the name of an Item from OpenHab for a given Id of a Thing and a Channel connecting the Item to the Thing.
     * The first Item in the Channel is retreived.
     * @param openHabDeviceId The id of the {@link Thing} to which the {@link Item} is linked via the {@link Channel}.
     * @param openHabChannelUID The id of the {@link Channel} in OpenHab linking the {@link Thing} with the target {@link Item}.
     * @return The name of the Item in OpenHab.
     * @throws PlatformDataProcessingException If there was an error retrieving the data from openHab.
     */
    public String getItemNameFromOpenHab(String openHabDeviceId, String openHabChannelUID) throws PlatformDataProcessingException {
        return getItemNameFromThing(getThingFromOpenHab(openHabDeviceId), openHabChannelUID);
    }

    /**
     * Gets the name of an {@link Item} in OpenHab for a given {@link Thing} and the id of the {@link Channel}
     * which links the {@link Thing} with the {@link Item} in OpenHab.
     * @param thing The {@link Thing} to which the target {@link Item} is linked.
     * @param openHabChannelUID The id of the {@link Channel} in OpenHab linking the {@link Thing} with the target {@link Item}.
     * @return The id of the first {@link Item} which belongs to the {@link Channel} in OpenHab.
     * @throws PlatformDataProcessingException If the {@link Channel} could not be found or it does not contain an {@link Item}.
     */
    private String getItemNameFromThing(Thing thing, String openHabChannelUID) throws PlatformDataProcessingException {

        List<Channel> channels = thing.getChannels();
        Channel channel = channels
                .stream()
                .filter(c -> c.getUid().equals(openHabChannelUID))
                .findAny()
                .orElse(null);

        if (channel == null || channel.getLinkedItems().isEmpty()) {
            throw new PlatformDataProcessingException("Sensor or RuleAction not found in OpenHab: " + openHabChannelUID, Response.Status.NOT_FOUND);
        }
        return channel.getLinkedItems().get(0);
    }

    /**
     * Retrieves an {@link Item} from OpenHab for a given deviceId and channelId, or throws a {@link PlatformDataProcessingException}
     * if the item could be retrieved successfully.
     * @param openHabDeviceId The id of the Thing in OpenHab to which the Item is linked.
     * @param openHabChannelUID The id of the Channel in OpenHab which links the Thing to the Item.
     * @return A {@link Item} representing the Item in OpenHab.
     * @throws PlatformDataProcessingException If the Item could not be retrieved successfully from the platform.
     */
    public Item getItemFromOpenHab(String openHabDeviceId, String openHabChannelUID) throws PlatformDataProcessingException {

        Response response = requestHelper.sendGetRequest(
                "items",
                new String[]{"itemName"},
                new Object[]{getItemNameFromOpenHab(openHabDeviceId, openHabChannelUID)},
                new String[0],
                new Object[0],
                MediaType.APPLICATION_JSON_TYPE);

        return  response.readEntity(Item.class);
    }

    /**
     * Retrieves historic data for an {@link Item} in OpenHab for a given id of a {@link Thing} and a {@link Channel}
     * linking the {@link Item} to the {@link Thing} and a given time period defined by a start time and an end time.
     * The data is retrieved for the first {@link Item} in the Channel.
     * The data is gathered from the persistence service which is set as the default persistence service in OpenHab.
     * @param openHabDeviceId The Id of the {@link Thing} in OpenHab.
     * @param openHabSensorId The Id of the {@link Channel} in OpenHab which is linking the target {@link Item} to the
     *                        target {@link Thing}.
     * @param startTime The start of the target time span.
     * @param endTime The end of the target time span.
     * @return The {@link ItemHistoryDTO} retrieved from OpenHab via REST.
     * @throws PlatformDataProcessingException If there was an error retrieving the data from OpenHab.
     */
    public ItemHistoryDTO getItemHistoryFromOpenHab(
            String openHabDeviceId,
            String openHabSensorId,
            String startTime,
            String endTime) throws PlatformDataProcessingException {
        Response response = requestHelper.sendGetRequest(
                "persistence/items",
                new String[]{"itemname"},
                new Object[]{getItemNameFromOpenHab(openHabDeviceId, openHabSensorId)},
                new String[]{"starttime", "endtime"},
                new Object[]{startTime, endTime},
                MediaType.APPLICATION_JSON_TYPE);

        return response.readEntity(ItemHistoryDTO.class);
    }

    /**
     * Retrieves an {@link ChannelType} from OpenHab for a given channelTypeUID or throws a {@link PlatformDataProcessingException}
     * if the ChannelType could not be retrieved successfully.
     * @param channelTypeUID The id of the ChannelType in OpenHab.
     * @return A {@link ChannelType} representing the ChannelType in OpenHab.
     * @throws PlatformDataProcessingException If the ChannelType could not be retrieved successfully from the platform.
     */
    public ChannelType getChannelTypeFromOpenHab(String channelTypeUID) throws PlatformDataProcessingException {
        Response response = requestHelper
                .sendGetRequest(
                        "channel-types",
                        new String[]{"channelTypeUID"},
                        new Object[]{channelTypeUID},
                        new String[]{},
                        new Object[]{},
                        MediaType.APPLICATION_JSON_TYPE);
        return response.readEntity(ChannelType.class);
    }

    /**
     * Retrieves a UUID from OpenHab or throws a {@link PlatformDataProcessingException}
     * @return a UUID
     * @throws PlatformDataProcessingException If the UUID could not be retrieved successfully from the platform.
     */
    public String generateOpenHabUUID() throws PlatformDataProcessingException {
        Response response = requestHelper
                .sendGetRequest(
                        "uuid",
                        new String[]{},
                        new Object[]{},
                        new String[]{},
                        new Object[]{},
                        MediaType.TEXT_PLAIN_TYPE);
        return response.readEntity(String.class);
    }

    /**
     * Retrieves all installed {@link Binding}s from the OpenHab platform.
     * @return A list of all {@link Binding}s which are installed in the OpenHab instance.
     * @throws PlatformDataProcessingException If there was an error contacting the platform.
     */
    public List<Binding> getBindings() throws PlatformDataProcessingException {
        Response response = requestHelper.sendGetRequest(
                "bindings",
                new String[]{},
                new Object[]{},
                new String[]{},
                new Object[]{},
                MediaType.APPLICATION_JSON_TYPE);
        return response.readEntity(new GenericType<List<Binding>>() {});
    }

    /**
     * Retrieves all {@link InboxThings} from the openHab inbox.
     * @return All {@link InboxThings}.
     * @throws PlatformDataProcessingException If there was an error contacting the platform.
     */
    public List<InboxThings> getInboxThings() throws PlatformDataProcessingException {
        Response response= requestHelper.sendGetRequest(
                "inbox",
                new String[]{},
                new Object[]{},
                new String[]{},
                new Object[]{},
                MediaType.APPLICATION_JSON_TYPE);
        return response.readEntity(new GenericType<List<InboxThings>>(){});
    }
}
