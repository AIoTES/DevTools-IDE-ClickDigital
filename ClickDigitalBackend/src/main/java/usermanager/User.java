package usermanager;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import java.util.ArrayList;

@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class User {

    /**
     * indicates if the user's {@link User#email} is confirmed
     */
    public boolean confirmed;
    /**
     * Indicates the administration power of a user
     */
    public String role;
    /**
     * The user's id
     */
    public String userId;
    /**
     * The user's email address
     */
    public String email;
    /**
     * The user's username
     */
    public String username;
    public String firstname;
    public String lastname;
    /**
     * The user's password, format using PBKDF2: iterations:salt:passwordHash
     */
    public String password;
    /**
     * The user's password reset Token. This field is null if there hasn't been a token created for that user. Tokens
     * are single use only.
     */
    public String token;
    /**
     * The users checked settings
     */
    public ArrayList<String> checkedSettings;


    public User(String id, String p, String email){
        this.email=email;
        this.role =p;
        this.userId=id;
    }
    public User(String id, String p, boolean confirmed, String email){
        this.role =p;
        this.userId=id;
        this.confirmed=confirmed;
        this.email=email;
    }


    public User(){}


    public String getId() {
        return userId;
    }

    public void setId(String id) {
        this.userId = id;
    }

    @Override
    public String toString(){
        return userId;
    }


}
