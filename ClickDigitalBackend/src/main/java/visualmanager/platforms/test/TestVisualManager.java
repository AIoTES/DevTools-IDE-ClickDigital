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
package  visualmanager.platforms.test;

import visualmanager.models.SensorDataModel;
import visualmanager.models.TimeValueTuple;
import visualmanager.platforms.PlatformVisualManager;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ThreadLocalRandom;

/**

 * This implementation of {@link PlatformVisualManager} produces dummy data and is used for testing purposes.
 */
public class TestVisualManager extends PlatformVisualManager {

    public TestVisualManager(String platformId){
        super(platformId);

    }

    /**
     * This method randomly creates fake Sensor data for a Sensor.
     * One {@link TimeValueTuple} containing a date, a float value and a String value is generated.
     * @param externalDeviceId Any String.
     * @param externalSensorId Any String.
     * @return A {@link SensorDataModel} containing the randomly generated Sensor data.
     */
    @Override
    public SensorDataModel getSensorData(String externalDeviceId, String externalSensorId) {

        TimeValueTuple timeValueTuple = createTupleWithRandomValues();
        timeValueTuple.DateTime = "2018-01-01T18:00:00";

        SensorDataModel result = new SensorDataModel();
        result.Values.add(timeValueTuple);
        result.Type = "Type";
        result.Unit = "Unit";

        return result;
    }

    /**
     * This method generates random fake Sensor data with time values in the given time span with the given
     * time interval step size.
     * @param externalDeviceId Any string.
     * @param externalSensorId Any string.
     * @param startTime The start of the target time span.
     * @param endTime The end of the target time span.
     * @param interval The step size between the retrieved values.
     * @return A {@link SensorDataModel} containing randomly generated {@link TimeValueTuple}s for each date
     * in the given time span with the given time interval step size.
     */
    @Override
    public SensorDataModel getSensorDataOverTime(String externalDeviceId, String externalSensorId, LocalDateTime startTime, LocalDateTime endTime, Duration interval) {
        SensorDataModel result = new SensorDataModel();

        while(!startTime.isAfter(endTime)){

            TimeValueTuple tuple = createTupleWithRandomValues();

            tuple.DateTime = startTime.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            result.Values.add(tuple);

            startTime = (LocalDateTime) interval.addTo(startTime);
        }

        result.Type = "Type";
        result.Unit = "Unit";

        return result;
    }

    /**
     * Creates a {@link TimeValueTuple} with a random float value and either "ON" or "OFF" randomly set as
     * String value, but no time stamp set.
     * @return A {@link TimeValueTuple} with the randomly generated float and String values and no time stamp.
     */
    private TimeValueTuple createTupleWithRandomValues(){
        TimeValueTuple timeValueTuple = new TimeValueTuple();
        timeValueTuple.FloatValue = ThreadLocalRandom.current().nextInt(100) + ThreadLocalRandom.current().nextFloat();
        timeValueTuple.StringValue = ThreadLocalRandom.current().nextBoolean() ? "ON" : "OFF";

        return timeValueTuple;
    }
}
