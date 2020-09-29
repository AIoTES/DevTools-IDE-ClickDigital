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
package  frontend.database;


import acpmanager.logfilter.Log;
import com.google.gson.Gson;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Updates;
import exceptions.InvalidSessionException;
import frontend.models.FieldValues;

import jdk.nashorn.internal.parser.JSONParser;
import org.apache.logging.log4j.Level;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.bson.Document;
import org.json.JSONArray;
import org.json.JSONObject;
import services.LogConstants;
import usersessionmanager.UserSessionManager;


import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;

import java.util.ArrayList;
import java.util.List;

import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Updates.pull;
import static com.mongodb.client.model.Updates.push;
import static com.mongodb.client.model.Updates.set;
import static services.UtilityService.PropertyKeys.FRONTEND_DATABASE_NAME;
import static services.UtilityService.getDatabase;
import static services.UtilityService.getUserString;

/**
 * This class is an interface for the frontend database it implements simple CRUD operations.
 */
@Path("/database")
public class Database {
    private final Logger logger = LogManager.getLogger(Database.class.getName());
    private UserSessionManager userSessionManager = new UserSessionManager();

    protected MongoDatabase database = getDatabase(FRONTEND_DATABASE_NAME);

    @Path("/{collection}/{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @GET
    public String getDocument(@PathParam("collection")  String coll, @PathParam("id") String id, @Context HttpServletRequest request, @Context HttpServletResponse response) throws InvalidSessionException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);

        MongoCollection<Document> collection = database.getCollection(coll);
        JSONObject jo = new JSONObject(collection.find(eq("id", id)).first().toJson());
        jo.remove("_id");
        return jo.toString();
    }

    @Path("/{collection}/")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @GET
    public String getDocuments(@PathParam("collection")  String coll, @QueryParam("id") List<String> ids, @Context HttpServletRequest request, @Context HttpServletResponse response) throws InvalidSessionException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);

        MongoCollection<Document> collection = database.getCollection(coll);
        List result = new ArrayList<>();
        JSONArray ja = new JSONArray();
        for (String id : ids) {
            JSONObject jo = new JSONObject(collection.find(eq("id", id)).first().toJson());
            jo.remove("_id");
            ja.put(jo);
        }
        return ja.toString() ;
    }

    @Path("/{collection}/insert")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.TEXT_PLAIN)
    @POST
    public void insertDocument(@PathParam("collection") String collection, String obj, @Context HttpServletRequest request, @Context HttpServletResponse response) throws InvalidSessionException {
        //Check if the users session is valid before performing the action
        //userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());

        database.getCollection(collection).insertOne(Document.parse(obj));
    }

    @Path("/{collection}/{id}/delete")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.TEXT_PLAIN)
    @DELETE
    public void deleteDocument(@PathParam("collection") String collection, @PathParam("id") String id, @Context HttpServletRequest request, @Context HttpServletResponse response) throws InvalidSessionException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);
        String activeUserString = getUserString(userSessionManager.getUserID(request.getCookies()), null);

        database.getCollection(collection).deleteOne(eq("id", id));
        logger.log(Level.INFO, new Log(activeUserString, LogConstants.DELETE_ + collection, id, LogConstants.SUCCESS));
    }

    @Path("/{collection}/{id}/update")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.TEXT_PLAIN)
    @PUT
    public void updateDocument(@PathParam("collection") String collection, @PathParam("id") String id, FieldValues fieldValues, @Context HttpServletRequest request, @Context HttpServletResponse response) throws InvalidSessionException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);

        database.getCollection(collection).updateOne(eq("id", id), set(fieldValues.field, fieldValues.value));
    }

    @Path("/{collection}/{id}/push")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.TEXT_PLAIN)
    @PUT
    public void pushToDocumentsList(@PathParam("collection") String collection, @PathParam("id") String id, FieldValues fieldValues, @Context HttpServletRequest request, @Context HttpServletResponse response) throws InvalidSessionException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);

        database.getCollection(collection).updateOne(eq("id", id), push(fieldValues.field, fieldValues.value));
    }

    @Path("/{collection}/{id}/pop")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.TEXT_PLAIN)
    @PUT
    public void popFromDocumentsList(@PathParam("collection") String collection, @PathParam("id") String id, FieldValues fieldValues, @Context HttpServletRequest request, @Context HttpServletResponse response) throws InvalidSessionException {
        //check if the session is valid and refresh the Cookie
        Cookie cookie = userSessionManager.validateUserSession(request.getCookies(), request.getRemoteAddr());
        response.addCookie(cookie);

        database.getCollection(collection).updateOne(eq("id", id), Updates.pull(fieldValues.field, fieldValues.value));
    }

}
