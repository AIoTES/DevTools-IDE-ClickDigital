package dataprotectionmanager;

import com.fasterxml.jackson.annotation.JsonAutoDetect;

import java.util.Date;
import java.util.HashMap;

@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class DataPrivacyElement {
    /**
     * the id of the dataprivacyelement
     */
    public String id;
    /**
     * id of the prior version of the dataprivacyelement
     */
    public String priorVersion;
    /**
     * id of the parent of the dataprivacyelement
     */
    public String contextID;
    /**
     * title of the dataprivacyelement
     */
    public String title;
    /**
     * descriptions of the dataprivacyelement before, after, submit
     */
    public HashMap<String, String> descriptions;
    /**
     * states if the dataprivacyelement is required to be checked to use ClickDigital
     */
    public boolean consentRequired;
    /**
     * states if the dataprivacyelement is checked before the user checks it
     */
    public boolean preChecked;
    /**
     * states if the dataprivacyelement is in use
     */
    public boolean inUse;
    /**
     * since when the dataprivacyelement is valid
     */
    public Date validFrom;

    public DataPrivacyElement() {

    }
}
