package rulemanager.models;

import com.fasterxml.jackson.annotation.JsonAutoDetect;

import java.util.List;
import java.util.Objects;

/**

 * An object of this class represents a internal condition of a trigger or action.
 */
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class Condition {
    public String userId;
    public int ID = 0;

    public int DaysID;

    //RuleAction
    public String command = "";

    //Trigger
    public String state = "";

    //Temporal
    public String time = "";
    public List<String> days = null;

    //Spatial
    public String location = ""; // Fixed or Moving location

    //Situation
    public String weather = "";
    public String activity = "";
    public String trafficsituation = "";
    public int temperature = 0;
    public String operator = "";

    //Communication
    public long telephonenumber = 0;
    public String email = "";

    public String communicationtype = ""; //The kind of communication

    public String notification = "";

    //Service
    public Boolean physical = false;
    //physical
    public String servicetype = ""; //Post or Package
    //non physical
    public String entry = "";

    //Physical Entity
    public Boolean living = false;  //living or non living

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Condition condition = (Condition) o;
        return ID == condition.ID &&
                temperature == condition.temperature &&
                telephonenumber == condition.telephonenumber &&
                Objects.equals(command, condition.command) &&
                Objects.equals(state, condition.state) &&
                Objects.equals(time, condition.time) &&
                Objects.equals(days, condition.days) &&
                Objects.equals(location, condition.location) &&
                Objects.equals(weather, condition.weather) &&
                Objects.equals(activity, condition.activity) &&
                Objects.equals(trafficsituation, condition.trafficsituation) &&
                Objects.equals(operator, condition.operator) &&
                Objects.equals(email, condition.email) &&
                Objects.equals(communicationtype, condition.communicationtype) &&
                Objects.equals(notification, condition.notification) &&
                Objects.equals(physical, condition.physical) &&
                Objects.equals(servicetype, condition.servicetype) &&
                Objects.equals(entry, condition.entry) &&
                Objects.equals(living, condition.living) &&
                Objects.equals(human, condition.human) &&
                Objects.equals(itemtype, condition.itemtype) &&
                Objects.equals(place, condition.place);
    }

    @Override
    public int hashCode() {

        return Objects.hash(ID, command, state, time, days, location, weather, activity, trafficsituation, temperature, operator, telephonenumber, email, communicationtype, notification, physical, servicetype, entry, living, human, itemtype, place);
    }

    //living
    public Boolean human = false; //human or animal
    //non living
    public String itemtype = ""; //vehicle, lights..
    public String place = ""; //city, apartment..


    public Condition(){}
}
