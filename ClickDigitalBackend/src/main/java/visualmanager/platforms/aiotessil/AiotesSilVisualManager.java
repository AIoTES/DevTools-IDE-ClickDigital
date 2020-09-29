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
package  visualmanager.platforms.aiotessil;

import exceptions.PlatformDataProcessingException;
import visualmanager.models.SensorDataModel;
import visualmanager.models.TimeValueTuple;
import visualmanager.platforms.PlatformVisualManager;

import java.time.Duration;
import java.time.LocalDateTime;

public class AiotesSilVisualManager extends PlatformVisualManager {

    /**
     * constructor for instantiating platform specific visual manager classes.
     *
     * @param userId the id of the user who performs the request
     * @param projectId the id of the project
     * @param platformId the id of the platform
     */
    public AiotesSilVisualManager(String userId, String projectId, String platformId) {
        super(userId);//, projectId, platformId);
    }

    @Override
    public SensorDataModel getSensorData(String externalDeviceId, String externalSensorId) throws PlatformDataProcessingException {
        //TODO implement, no interface for aiotes yet
        TimeValueTuple timeValueTuple = new TimeValueTuple("", "0");
        SensorDataModel sensorDataModel = new SensorDataModel();
        sensorDataModel.Values.add(timeValueTuple);
        return sensorDataModel;
    }

    @Override
    public SensorDataModel getSensorDataOverTime(String externalDeviceId, String externalSensorId, LocalDateTime startTime, LocalDateTime endTime, Duration interval) throws PlatformDataProcessingException {
        //TODO implement, no interface for aiotes yet
        return new SensorDataModel();
    }
}
