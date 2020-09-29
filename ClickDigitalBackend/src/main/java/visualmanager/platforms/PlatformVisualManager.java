/*
* Copyright 2017-2020 Fraunhofer Institute for Computer Graphics Research IGD
*
* Licensed under the GNU AFFERO GENERAL PUBLIC LICENSE, Version 3, 19 November 2007
* You may not use this work except in compliance with the Version 3 Licence.
* You may obtain a copy of the Licence at:
* https://www.gnu.org/licenses/agpl-3.0.html
*
* See the Licence for the specific permissions and limitations under the Licence.
*/
package  visualmanager.platforms;

import exceptions.PlatformDataProcessingException;
import visualmanager.models.SensorDataModel;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**

 * Abstract base class for visual manager classes for specific platforms.
 * Instances should be created via the {@link PlatformVisualManagerFactory}.
 */
public abstract class PlatformVisualManager {
    protected String userId;
    protected String projectId;
    protected String platformId;

    /**
     * The {@link DateTimeFormatter} to be used by the instantiated visual manager classes.
     */
    protected static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    /**
     * Default constructor for instantiating platform specific visual manager classes.
     */
    public PlatformVisualManager(String platformId){
        this.platformId = platformId;
    }

    /**
     * Retrieves data for a sensor from a specific platform given the external ids of the target device and sensor.
     * @param externalDeviceId The deviceId that is used by the target platform.
     * @param externalSensorId The sensorId that is used by the target platform.
     * @return A {@link SensorDataModel} which represents the data of the sensor retrieved from the platform.
     * @throws PlatformDataProcessingException If the sensor data could not be retrieved successfully from the platform.
     */
    public abstract SensorDataModel getSensorData(String externalDeviceId, String externalSensorId) throws PlatformDataProcessingException;

    /**
     * Gets the data from within a specified time span with a specified step size for a sensor from a specific platform.
     * @param externalDeviceId The deviceId that is used by the target platform.
     * @param externalSensorId The sensorId that is used by the target platform.
     * @param startTime The start of the target time span.
     * @param endTime The end of the target time span.
     * @param interval The step size between the retrieved values.
     * @return A {@link SensorDataModel} containing the historic values of the sensor.
     * @throws PlatformDataProcessingException If the sensor data could not be retrieved successfully from the platform.
     */
    public abstract SensorDataModel getSensorDataOverTime(String externalDeviceId,
                                                          String externalSensorId,
                                                          LocalDateTime startTime,
                                                          LocalDateTime endTime,
                                                          Duration interval) throws PlatformDataProcessingException;
}
