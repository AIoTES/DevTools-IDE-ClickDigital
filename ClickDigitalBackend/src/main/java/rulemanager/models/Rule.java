package rulemanager.models;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**

 * An object of this class represents a internal rule.
 */
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class Rule {
    // Attributes
    public String name = "";
    public int ID = 0;
    public String description = "";
    public Boolean active = false;
    public Boolean notify = false;
    public int rootTGID = 0;
    public List<RuleAction> ruleActions =  new ArrayList<>();
    public String platformID = "";
    public String projectID = "";
    public int actionID;
    public String userId;
    // Methods

    public Rule(){}

    @Override
    public String toString() {
        return "Rule{" +
                "name='" + name + '\'' +
                ", ID=" + ID +
                ", description='" + description + '\'' +
                ", active=" + active +
                ", rootTGID=" + rootTGID +
                ", ruleActions=" + ruleActions +
                ", platformID='" + platformID + '\'' +
                ", projectID='" + projectID + '\'' +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Rule rule = (Rule) o;
        return ID == rule.ID &&
                rootTGID == rule.rootTGID &&
                Objects.equals(name, rule.name) &&
                Objects.equals(description, rule.description) &&
                Objects.equals(active, rule.active) &&
                Objects.equals(ruleActions, rule.ruleActions) &&
                Objects.equals(platformID, rule.platformID) &&
                Objects.equals(projectID, rule.projectID);
    }

    @Override
    public int hashCode() {

        return Objects.hash(name, ID, description, active, rootTGID, ruleActions, platformID, projectID);
    }
}
