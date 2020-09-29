package devicemanager;

import com.fasterxml.jackson.databind.ObjectMapper;
import devicemanager.Models.SensorTypeList;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.nio.file.Files;

/**
 * This class handles the actions arround reading and writing to the Json tpyes file.
 */
public class SensorTypesParser {

    //TODO add methods to add types and units

    public SensorTypeList readTypes() throws IOException {
        byte[] jsonData = Files.readAllBytes(getFileFromResources("types.json").toPath());

        //create ObjectMapper instance
        ObjectMapper objectMapper = new ObjectMapper();


        return objectMapper.readValue(jsonData, SensorTypeList.class);
    }

    // get file from classpath, resources folder
    private File getFileFromResources(String fileName) {

        ClassLoader classLoader = getClass().getClassLoader();

        URL resource = classLoader.getResource(fileName);
        if (resource == null) {
            throw new IllegalArgumentException("file is not found!");
        } else {
            return new File(resource.getFile());
        }

    }
}
