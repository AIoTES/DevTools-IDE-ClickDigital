package visualmanager.models;

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
public class SensorDataModel {
    /**
     * The data type of the state of the sensor.
     */
    public String Type;

    /**
     * A list containing {@link TimeValueTuple}s which consist of a time stamp and the state of the item at that time.
     */
    public ArrayList<TimeValueTuple> Values = new ArrayList<>();

    /**
     * The unit of the item state.
     */
    @SuppressWarnings("unused")
    public String Unit;

    /**
     * Default constructor for {@link SensorDataModel}.
     */
    public SensorDataModel (){}
}