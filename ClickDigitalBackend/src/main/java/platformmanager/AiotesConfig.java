package platformmanager;

import com.fasterxml.jackson.annotation.JsonAutoDetect;

@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class AiotesConfig {

    public String ip;
    public String port;
    public String systemIp;
    public String clickdigitalPort;
    public String projectId;
    public String userId;

    public AiotesConfig(){}
    public AiotesConfig(String ip, String port, String systemip, String clickdigitalPort, String projectId, String userId){
        this.ip= ip;
        this.port = port;
        this.systemIp= systemip;
        this.clickdigitalPort=clickdigitalPort;
        this.projectId = projectId;
        this.userId = userId;
    }

}
