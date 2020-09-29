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
package  platforms.openHab.Models;

import com.fasterxml.jackson.annotation.JsonAutoDetect;

/**
 * This class represents a Binding on OpenHab
 */
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class Binding {

    public String author;
    public String description;
    public String id;
    public String name;
    public String configDescriptionURI;

    public Binding(){}

    public Binding(String author, String description, String id, String name, String configDescriptionURI) {
        this.author = author;
        this.description = description;
        this.id = id;
        this.name = name;
        this.configDescriptionURI = configDescriptionURI;
    }
}
