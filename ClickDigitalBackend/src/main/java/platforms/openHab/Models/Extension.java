package platforms.openHab.Models;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonIgnore;

/**

 * This class represents an Extension on OpenHab
 */
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class Extension {

    public String id;
    public String label;
    public String version;
    public String link;
    public boolean installed;
    public String type;

    public String error;

    public Extension(){}
}
