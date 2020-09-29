/*
 * Copyright 2017-2020 Fraunhofer Institute for Computer Graphics Research IGD
 *
 * Licensed under the GNU AFFERO GENERAL PUBLIC LICENSE, Version 3, 19 November 2007
 * You may not use this work except in compliance with the Version 3 Licence.
 * You may obtain a copy of the Licence at:
 * https://www.gnu.org/licenses/agpl-3.0.html
 *
 * See the Licence for the specific permissions and limitations under the Licence.
 */package anomalymanager.models;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import java.util.ArrayList;

/**
 * Data model class representing the data of a sensor over a period of time.
 * It contains a set of sensor values as well as information on the type of the sensor {@see SensorType},
 * the unit of the sensor values {@see SensorValueUnit} and an indicator on the success of retrieving the sensor data.
 * This class is designated to be converted to a JSON object.
 */
@SuppressWarnings("WeakerAccess")
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class AnomalySensorDataModel {
    /**
     * The data type of the state of the sensor.
     */
    public String Type;

    /**
     * A list containing {@link TimeValueAnomalyScoreTuple}s which consist of a time stamp and the state of the item at that time.
     */
    public ArrayList<TimeValueAnomalyScoreTuple> Values = new ArrayList<>();

    /**
     * The unit of the item state.
     */
    @SuppressWarnings("unused")
    public String Unit;

    /**
     * Default constructor for {@link AnomalySensorDataModel}.
     */
    public AnomalySensorDataModel (){}
}