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
package  platforms.openHab.Helper;

import org.glassfish.jersey.client.JerseyClient;
import org.glassfish.jersey.client.JerseyClientBuilder;
import org.glassfish.jersey.client.JerseyWebTarget;
import platformmanager.PlatformConnectionInfo;
import exceptions.PlatformDataProcessingException;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.glassfish.jersey.client.ClientConfig;

import javax.ws.rs.client.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/**
 * This class helps sending requests to openHab
 */
public class RequestHelper {

    private static String REST_URI;
    private static ClientConfig clientConfig = new ClientConfig();
    private static Client client = ClientBuilder.newClient(clientConfig);
    private static WebTarget webRootTarget;
    private static Invocation.Builder invocationBuilder;
    private Logger logger = LogManager.getLogger();
    public RequestHelper(PlatformConnectionInfo connectionInfo) {
        String ip=connectionInfo.ip;
        String port = connectionInfo.port;
        REST_URI="http://"+ ip + ":" + port + "/rest";
        webRootTarget = client.target(REST_URI);

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
    public Response sendGetRequest(String path, String[] pathParams, Object[] pathParamObjects, String[] queryParams, Object[] queryParamObjects, MediaType mediaType) throws PlatformDataProcessingException {

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

        Response response = invocationBuilder.accept(mediaType).get();

        if (!(response.getStatus()  > 199 && response.getStatus() <300))
            throw new PlatformDataProcessingException("Error while platform request " + response.getStatusInfo().getReasonPhrase(), Response.Status.fromStatusCode(response.getStatus()));



        return response;
    }

    /**
     * This method builds a {@link JerseyWebTarget} from a path constructed from a given path and path- and query-parameters.
     * The path is appended to the path stored in the config file under OPENHAB_REST_URI.
     * @param path The target path which is appended to the OpenHab Rest Uri from the config file.
     * @param pathParams The names of path params to be built into the path.
     * @param pathParamObjects The objects to pass to their respective path param in the request to OpenHab.
     * @param queryParams The names of the query params to be used for the request.
     * @param queryParamObjects The objects to populate the query params with.
     * @return The {@link JerseyWebTarget} build from the given path and path params and query params.
     */
    public JerseyWebTarget buildTarget(String path, String[] pathParams, Object[] pathParamObjects, String[] queryParams, Object[] queryParamObjects){

        JerseyClient jclient = JerseyClientBuilder.createClient(clientConfig);
        JerseyWebTarget target = jclient.target(REST_URI).path(path);

        for(int i = 0; i < pathParams.length; i++){
            target = target
                    .path("/{" + pathParams[i] + "}")
                    .resolveTemplate(pathParams[i], pathParamObjects[i]);
        }
        for(int i = 0; i < queryParams.length; i++){
            target = target
                    .queryParam(queryParams[i], queryParamObjects[i]);
        }
        return target;
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
    public Response sendDeleteRequest(String path, String[] pathParams, Object[] pathParamObjects, String[] queryParams, Object[] queryParamObjects , MediaType mediaType) throws PlatformDataProcessingException {

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

        Response response = invocationBuilder.delete();

        if (!(response.getStatus()  > 199 && response.getStatus() <300))
            throw new PlatformDataProcessingException("Error while platform request " + response.getStatusInfo().getReasonPhrase(), Response.Status.fromStatusCode(response.getStatus()));

        return response;
    }

    public <T> Response sendPutRequest(String path, String[] pathParams, Object[] pathParamObjects, String[] queryParams, Object[] queryParamObjects , MediaType mediaType,  T entity) throws PlatformDataProcessingException {

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

        Response response = invocationBuilder.put(Entity.entity(entity, mediaType));

        if (!(response.getStatus()  > 199 && response.getStatus() <300)){
            logger.warn("Error while platform request " + response.getStatusInfo().getReasonPhrase(), Response.Status.fromStatusCode(response.getStatus()));
            throw new PlatformDataProcessingException("Error while platform request " + response.getStatusInfo().getReasonPhrase(), Response.Status.fromStatusCode(response.getStatus()));
        }

        return response;
    }

    public <T> Response sendPostRequest(String path, String[] pathParams, Object[] pathParamObjects, String[] queryParams, Object[] queryParamObjects , MediaType mediaType,  T entity) throws PlatformDataProcessingException {

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

        Response response = invocationBuilder.accept(mediaType).post(Entity.entity(entity, mediaType));
        if (!(response.getStatus()  > 199 && response.getStatus() <300)){
            logger.warn("Error while platform request: " + target.getUri().toString() + " Info : " + response.getStatusInfo().getReasonPhrase(), Response.Status.fromStatusCode(response.getStatus()));
            throw new PlatformDataProcessingException("Error while platform request: " + target.getUri().toString() + " Info : " + response.getStatusInfo().getReasonPhrase(), Response.Status.fromStatusCode(response.getStatus()));
        }
        return response;
    }

}
