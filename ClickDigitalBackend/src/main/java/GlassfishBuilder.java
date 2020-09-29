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
import acpmanager.ACPManager;
import authentification.BasicAuth;
import authentification.CORSFilter;
import devicemanager.DeviceManager;
import exceptions.ExceptionHandler;
import frontend.database.Database;
import io.swagger.jaxrs.config.BeanConfig;
//import anomalymanager.nupic.AnomalyManager;
import platformmanager.PlatformManager;
import usermanager.UserManager;
/*@*/import dataprotectionmanager.DataPrivacyManager;
import org.glassfish.jersey.jackson.JacksonFeature;
import org.json.JSONObject;
import rulemanager.RuleManagement;
import usersessionmanager.UserSessionManager;
import visualmanager.VisualManager;
import anomalymanager.AnomalyManager;
import websocket.platforms.aiotesil.SubscriptionReceiver;

import javax.ws.rs.ApplicationPath;
import javax.ws.rs.core.Application;
import java.util.HashSet;
import java.util.Set;


//Defines the base URI for all resource URIs.
@ApplicationPath("/")
//The java class declares root resource and provider classes
public class GlassfishBuilder extends Application {

    public GlassfishBuilder(){
        BeanConfig beanConfig = new BeanConfig();
        beanConfig.setTitle("My API"); // <- mandatory
        beanConfig.setVersion("1.0.0");
        beanConfig.setSchemes(new String[]{"http"});
        beanConfig.setHost("localhost:9999");
        beanConfig.setBasePath("/api");
        beanConfig.setResourcePackage(DeviceManager.class.getPackage().getName());
        beanConfig.setScan(true);
    }

    //The method returns a non-empty collection with classes, that must be included in the published JAX-RS application
    @Override
    public Set<Class<?>> getClasses() {
        HashSet h = new HashSet<Class<?>>();

        h.add(DeviceManager.class ); //for path access
        h.add(RuleManagement.class);
        h.add(VisualManager.class);
        h.add(JacksonFeature.class); // for JSON conversion
        h.add(JSONObject.class);//for User Manager JSON
        h.add(UserManager.class);
		h.add(DataPrivacyManager.class);
		h.add(UserSessionManager.class);
		h.add(ACPManager.class);
        h.add(PlatformManager.class);
        h.add(Database.class);
        h.add(ExceptionHandler.class);
        h.add(SubscriptionReceiver.class);
        h.add(AnomalyManager.class);
        h.add(io.swagger.jaxrs.listing.ApiListingResource.class);
        h.add(io.swagger.jaxrs.listing.SwaggerSerializers.class);
        h.add(BasicAuth.class);
        h.add(CORSFilter.class);
        return h;
    }
}