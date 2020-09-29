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
package authentification;

import javax.inject.Singleton;
import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.container.ContainerResponseContext;
import javax.ws.rs.container.ContainerResponseFilter;
import javax.ws.rs.container.PreMatching;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.Provider;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

@Provider
@Singleton
@PreMatching
public class CORSFilter implements ContainerResponseFilter {

    /**
     * List of valid hosts from hosts file
     */
    private List<String> hosts;

    public CORSFilter(){
        hosts = new ArrayList<>();

        //read the file hosts in the config folder of the glassfish domain and write it into the arraylist hosts
        File f = new File("hosts");
        try{
            f.createNewFile();
            BufferedReader br = new BufferedReader(new FileReader(f));
            String s;
            while((s = br.readLine()) != null){
                hosts.add(s);
            }

        }catch(Exception e){
            System.err.println("Woops, something went wrong! Errormessage: " + e.getMessage());
        }

    }

    /**
     * Check origin of incoming requests, if host is valid allow cross origin
     * @param containerRequestContext the request context
     * @param containerResponseContext the response context
     * @throws IOException
     */
    @Override
    public void filter(ContainerRequestContext containerRequestContext, ContainerResponseContext containerResponseContext) throws IOException {
        if(containerRequestContext.getHeaders().get("Origin") == null || containerRequestContext.getHeaders().getFirst("Origin").isEmpty())
            return;
        //Check if the origin of the request is a valid frontend domain/url
        /*if(!hosts.contains(containerRequestContext
                .getHeaders()
                .get("Origin")
                .get(0))){
            return;
        }*/

        //add the necessary Cross-Origin headers to the response
        containerResponseContext.getHeaders().add("Access-Control-Allow-Origin", containerRequestContext.getHeaders().get("Origin").get(0));
        containerResponseContext.getHeaders().add("Access-Control-Allow-Credentials", "true");
        containerResponseContext.getHeaders().add("Access-Control-Allow-Headers", "origin, content-type, accept, authorization");
        containerResponseContext.getHeaders().add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    }
}
