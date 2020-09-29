package usermanager;

import com.fasterxml.jackson.annotation.JsonAutoDetect;

/**

 * This class modells the userId for JSON conversion
 */
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class UserId {
    /**
     * The user's id
     */
    public String userId;

    /**
     * Default constructor
     */
    public UserId(){};

    /**
     * Constructor for initializing the id
     * @param id
     */
    public UserId(String id){
        this.userId= id;
    }
}
