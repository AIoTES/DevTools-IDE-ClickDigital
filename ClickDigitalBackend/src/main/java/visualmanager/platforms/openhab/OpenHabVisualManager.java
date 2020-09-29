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
package  visualmanager.platforms.openhab;

import devicemanager.platforms.openHab.OpenHabDeviceManager;
import exceptions.PlatformDataProcessingException;
import exceptions.PlatformNotFoundException;
import platformmanager.PlatformManager;
import platforms.openHab.Helper.RequestHelper;
import platforms.openHab.Models.*;
import visualmanager.models.SensorDataModel;
import visualmanager.models.TimeValueTuple;
import visualmanager.platforms.PlatformVisualManager;
import platforms.openHab.Helper.OpenHabModelRetriever;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.time.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.TimeZone;

/**

 * This class sends REST requests to OpenHab with the {@link OpenHabModelRetriever} in order to retrieve data for visualization.
 */
public class OpenHabVisualManager extends PlatformVisualManager {

    /**
     * A list of types in OpenHab which can be parsed as a float number.
     */
    private static ArrayList<String> NumericTypes = new ArrayList<>(Arrays.asList("Number", "Dimmer", "Rollershutter"));

    /**
     * The {@link OpenHabModelRetriever} to be used for retrieving data from OpenHab via REST.
     */
    private OpenHabModelRetriever modelRetriever;

    /**
     * The default constructor for this class.
     */
    public OpenHabVisualManager(String userId, String projectId, String platformId) throws PlatformNotFoundException {
        super(platformId);
        modelRetriever = new OpenHabModelRetriever(new RequestHelper(new PlatformManager().getConnectionInfo(userId, this.platformId, projectId)));
    }

    /**
     * Retrieves data for a {@link Item} from OpenHab given the external ids of the {@link Thing} which the {@link Item}
     * belongs to and of the {@link Channel} which links the {@link Item} to the {@link Thing}.
     * Only the data for the first {@link Item} in the {@link Channel} can be retrieved, multiple Items per Channel are
     * not supported.
     * @param openHabDeviceId The id of the Thing in OpenHab.
     * @param openHabSensorId The id of the {@link Channel} in OpenHab linking the {@link Thing} with the target {@link Item}.
     * @return An {@link SensorDataModel} representing the state of the Item in OpenHab.
     * @throws PlatformDataProcessingException If there was an error retrieving the Item data.
     */
    @Override
    public SensorDataModel getSensorData(String openHabDeviceId, String openHabSensorId) throws PlatformDataProcessingException {

        Item item = modelRetriever.getItemFromOpenHab(openHabDeviceId, openHabSensorId);
        String nowTimeStamp = DATE_TIME_FORMATTER.withZone(ZoneId.systemDefault()).format(Instant.now());

        SensorDataModel model = new SensorDataModel();
        String type = item.getType();
        String state = item.getState();

        TimeValueTuple tuple = createTimeValueTupleFromTimeAndValue(type, nowTimeStamp, OpenHabDeviceManager.itemStateTranslator(state));

        model.Values.add(tuple);
        model.Type = type;
        return model;
    }

    /**
     * Creates a {@link TimeValueTuple} for a given datatype, time stamp and value and populates either
     * the {@link TimeValueTuple#FloatValue} or {@link TimeValueTuple#StringValue} depending on the given type.
     * @param type The {@link Item#type} of the item to which the given state belongs.
     * @param timeStamp The point of time at which the {@link Item} had the given state.
     * @param value The value of the {@link Item} at the given time.
     * @return A {@link TimeValueTuple} containing the given time stamp and value as string or float.
     */
    private TimeValueTuple createTimeValueTupleFromTimeAndValue(String type, String timeStamp, String value){

        TimeValueTuple tuple;
        if (NumericTypes.contains(type)) {
            tuple = new TimeValueTuple(timeStamp, Float.parseFloat(value));
        } else {
            tuple = new TimeValueTuple(timeStamp, value);
        }
        return tuple;
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
     * @param interval This parameter is not supported for historic data from OpenHab and can be omitted.
     * @return A {@link SensorDataModel} containing the historic data of the {@link Item}.
     * @throws PlatformDataProcessingException If there was an error retrieving the historic Item data.
     */
    @Override
    public SensorDataModel getSensorDataOverTime(String openHabDeviceId,
                                                 String openHabSensorId,
                                                 LocalDateTime startTime,
                                                 LocalDateTime endTime,
                                                 Duration interval) throws PlatformDataProcessingException {
        String formattedStartTime = DATE_TIME_FORMATTER.format(startTime);
        String formattedEndTime = DATE_TIME_FORMATTER.format(endTime);

        Item item = modelRetriever.getItemFromOpenHab(openHabDeviceId, openHabSensorId);

        SensorDataModel model = new SensorDataModel();
        String type = item.getType();

        ItemHistoryDTO itemHistory = modelRetriever.getItemHistoryFromOpenHab(
                openHabDeviceId,
                openHabSensorId,
                formattedStartTime,
                formattedEndTime);


        for (HistoryDataBean dataBean : itemHistory.data) {
            if (dataBean.state != null){
                Long epoch= Long.parseLong(dataBean.time);
                Date date = new Date(epoch);
                DateFormat format = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
//                DateFormat format = new SimpleDateFormat("dd/MM/yyyy HH:mm");
                format.setTimeZone(TimeZone.getTimeZone("Etc/UTC"));
                String formatted = format.format(date);
                TimeValueTuple tuple = createTimeValueTupleFromTimeAndValue(type, formatted, OpenHabDeviceManager.itemStateTranslator(dataBean.state));
                model.Values.add(tuple);
            }
        }

        model.Type = type;

        return model;
    }
}
