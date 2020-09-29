package platforms.aiotessil.models;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.*;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
        "@graph",
        "@id"
})
public class Graph {
    @JsonProperty("@graph")
    public List graph;
    @JsonProperty("@id")
    public String id;

    @JsonIgnore
    public Map<String, Object> additionalProperties = new HashMap<String, Object>();

    public Graph() {
    }
}
