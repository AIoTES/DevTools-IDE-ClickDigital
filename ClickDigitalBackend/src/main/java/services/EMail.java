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
package  services;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import org.bson.Document;

import java.util.Date;

@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class EMail {

    public String text;
    public String recipient;
    public String from;
    public String subject;
    public Date sentOn;

    public EMail(String text, String recipient, String from, String subject) {
        this.text = text;
        this.recipient = recipient;
        this.from = from;
        this.subject = subject;
        sentOn = new Date();
    }

    /**
     * This method builds a document based on this email
     *
     * @return document built from this email

    public Document getDocument() {
        Document doc = new Document();
        doc.put("text", this.text);
        doc.put("recipient", this.recipient);
        doc.put("from", from);
        doc.put("subject", subject);
        return doc;
    }
*/

}
