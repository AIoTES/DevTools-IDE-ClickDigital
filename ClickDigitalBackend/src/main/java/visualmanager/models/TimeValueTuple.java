package visualmanager.models;

/**

 * Data model class representing a tuple of a timestamp formatted as a {@link String}
 * and either  a {@link Float} value or a {@link String} value.
 * The value fields are supposed to be used mutually exclusive, i.e. one of them is always null.
 */
@SuppressWarnings("WeakerAccess")
public class TimeValueTuple {
    /**
     * The point of time at which the value was valid.
     */
    public String DateTime;

    /**
     * The value if it is representable as a {@link Float}.
     */
    public Float FloatValue;

    /**
     * The value if it is not representable as a {@link Float}.
     */
    public String StringValue;

    /**
     * The default constructor.
     */
    public TimeValueTuple(){}

    /**
     * The constructor for a {@link TimeValueTuple} containing a {@link Float} value.
     * @param dateTime The point of time at which the value was valid.
     * @param floatValue The value at the given point of time.
     */
    public TimeValueTuple(String dateTime, Float floatValue){
        DateTime = dateTime;
        FloatValue = floatValue;
    }

    /**
     * The constructor for a {@link TimeValueTuple} containing a {@link String} value.
     * @param dateTime The point of time at which the value was valid.
     * @param stringValue The value at the given point of time.
     */
    public TimeValueTuple(String dateTime, String stringValue){
        DateTime = dateTime;
        StringValue = stringValue;
    }
}
