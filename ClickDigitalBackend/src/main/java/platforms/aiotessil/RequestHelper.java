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
package  platforms.aiotessil;

import exceptions.PlatformDataProcessingException;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.glassfish.jersey.client.ClientConfig;
import platformmanager.PlatformConnectionInfo;
import services.UtilityService;

import javax.ws.rs.client.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/**
 * This class helps sending requests to the aiotes sil mediator. Connection address is hardcoded in config properties. Can be changed through rest request.
 */
public class RequestHelper {
    private Logger logger = LogManager.getLogger(RequestHelper.class);
    //private final String CONNECTIONURL= "http://"+ UtilityService.getConfigProperty(UtilityService.PropertyKeys.AIOTESSIL_IP.toString()) + ":"+ UtilityService.getConfigProperty(UtilityService.PropertyKeys.AIOTESSIL_PORT.toString()) + "/api/mw2mw";//activage-test-intermw.inter-iot.eu/api/mw2mw";
    private static ClientConfig clientConfig = new ClientConfig();
    private static Client client = ClientBuilder.newClient(clientConfig);
    private WebTarget webRootTarget;
    private static Invocation.Builder invocationBuilder;



    /**
     * Constructor for reading the connection string from database.
     * @param connectionInfo information about
     */
    public RequestHelper(PlatformConnectionInfo connectionInfo) {
        String ip=connectionInfo.ip;
        String port = connectionInfo.port;
        String REST_URI = "http://" + ip + ":" + port + "/api/mw2mw";
        webRootTarget = client.target(REST_URI);

    }


    public <T> Response sendPostRequest(String path, String headerParam, String headerParamValue, String[] pathParams, Object[] pathParamObjects, String[] queryParams, Object[] queryParamObjects , MediaType mediaType, T entity) throws PlatformDataProcessingException {

        int length = pathParams.length;
        WebTarget target = webRootTarget
                .path(path);
        for(int i = 0; i < length; i++){
            target = target
                    .path("/{" + pathParams[i] + "}")
                    .resolveTemplate(pathParams[i], pathParamObjects[i]);
        }

        length=queryParams.length;
        for(int i = 0; i < length; i++){
            target = target
                    .queryParam(queryParams[i], queryParamObjects[i]);
        }
        invocationBuilder = target.request(mediaType);

        if(!headerParam.equals(""))
            invocationBuilder = invocationBuilder.header(headerParam, headerParamValue);

        Response response = invocationBuilder.accept(mediaType).post(Entity.entity(entity, mediaType));


        if (!(response.getStatus()  > 199 && response.getStatus() <300)){
            if(response.getStatus() == 409)
                return response;
            throw new PlatformDataProcessingException("Error while platform request: " + target.getUri().toString() + " Info : " + response.getStatusInfo().getReasonPhrase(), Response.Status.fromStatusCode(response.getStatus()));
        }

        return response;
    }

    public Response sendGetRequest(String path, String headerParam, String headerParamValue, String[] pathParams, Object[] pathParamObjects, String[] queryParams, Object[] queryParamObjects, MediaType mediaType) throws PlatformDataProcessingException {

        int length = pathParams.length;
        WebTarget target = webRootTarget
                .path(path);
        for(int i = 0; i < length; i++){
            target = target
                    .path("/{" + pathParams[i] + "}")
                    .resolveTemplate(pathParams[i], pathParamObjects[i]);
        }

        length=queryParams.length;
        for(int i = 0; i < length; i++){
            target = target
                    .queryParam(queryParams[i], queryParamObjects[i]);
        }
        invocationBuilder = target.request(mediaType);

        if(!headerParam.equals(""))
            invocationBuilder = invocationBuilder.header(headerParam, headerParamValue);

        Response response = invocationBuilder.accept(mediaType).get();

        if (!(response.getStatus()  > 199 && response.getStatus() <300))
            throw new PlatformDataProcessingException("Error while platform request " + response.getStatusInfo().getReasonPhrase(), Response.Status.fromStatusCode(response.getStatus()));



        return response;
    }

    /**
     *
     * @param path the specific path without "http://localhost:8080/rest" and without the path parameter e.g. "/things"
     * @param pathParams the path parameters eg. "thingUID","itemName"
     * @param pathParamObjects the objects to send to openHab , just Strings e.g "weather_temperature_sensor","switch_item"
     * @param queryParams the query parameters to send
     * @param queryParamObjects the query objects to send, just Strings
     * @param mediaType the media type for the request, e.g MediaType.APPLICATION_JSON
     * @return a response
     */
    public Response sendDeleteRequest(String path, String headerParam, String headerParamValue, String[] pathParams, Object[] pathParamObjects, String[] queryParams, Object[] queryParamObjects , MediaType mediaType) throws PlatformDataProcessingException {

        int length = pathParams.length;
        WebTarget target = webRootTarget
                .path(path);
        for(int i = 0; i < length; i++){
            target = target
                    .path("/{" + pathParams[i] + "}")
                    .resolveTemplate(pathParams[i], pathParamObjects[i]);
        }

        length=queryParams.length;
        for(int i = 0; i < length; i++){
            target = target
                    .queryParam(queryParams[i], queryParamObjects[i]);
        }
        invocationBuilder = target.request(mediaType);

        if(!headerParam.equals(""))
            invocationBuilder = invocationBuilder.header(headerParam, headerParamValue);

        Response response = invocationBuilder.delete();

        if (!(response.getStatus()  > 199 && response.getStatus() <300))
            throw new PlatformDataProcessingException("Error while platform request " + response.getStatusInfo().getReasonPhrase(), Response.Status.fromStatusCode(response.getStatus()));

        return response;
    }

}
