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
package  rulemanager.Manager;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.bson.Document;

import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Updates.combine;
import static com.mongodb.client.model.Updates.set;

/**

 * Manages all methods which handels the internal and external IDs of rules.
 */
public class IDManager {


    private MongoCollection<Document> idcollection;
    private String userId;
    private String FIELDUSERID= "userId";

    /**
     * The constructor which initialize the collection for the IDs.
     * @param database The used database.
     */
    public IDManager(MongoDatabase database, String userId){
        // ID Collection
        idcollection = database.getCollection("IDCollection");
        this.userId=userId;
        initializeIDCollection();
    }

    /**
     * Looks up the table idcollection for the recent ID.
     *
     * @param collection A string which represents a column of this collection.
     * @return the recent id {@link Integer} of an collection-entry.
     */
    public int getIDforCollectionEntry(String collection){
        int result = 0;
        Document output = idcollection.find(eq(FIELDUSERID, userId)).first();
        Integer number = output.getInteger(collection.toLowerCase());
        if(number != null){
            result = output.getInteger(collection.toLowerCase()) + 1;
        }else{
            result = 1;
        }
        saveIDforCollectionEntry(collection, result);
        return result;
    }

    /**
     * Updates the IDcollection entry.
     *
     * @param collection A string which represents a column of this collection.
     * @param ID the recent ID which will be stored.
     */
    private void saveIDforCollectionEntry(String collection, int ID){

        idcollection.updateOne(idcollection.find(eq(FIELDUSERID, userId)).first(), set(collection, ID));
    }

    /**
     * This method initialized the IDcollection with the first and only entry.
     */
    private void initializeIDCollection(){
        Document output = idcollection.find(eq(FIELDUSERID, userId)).first();
        if(output == null) {
            Document doc = new Document()
                    .append("rule", 0)
                    .append("action", 0)
                    .append("triggergroup", 0)
                    .append("condition", 0)
                    .append("days", 0)
                    .append("temporal", 0)
                    .append("spatial", 0)
                    .append("situation", 0)
                    .append("communication", 0)
                    .append("service", 0)
                    .append("entitysituation", 0)
                    .append("system", 0)
                    .append("userId", userId);
            idcollection.insertOne(doc);
        }
    }
}
