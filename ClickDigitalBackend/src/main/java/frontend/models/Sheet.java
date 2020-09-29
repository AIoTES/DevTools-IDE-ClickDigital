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
package frontend.models;

import org.bson.types.ObjectId;

import java.util.List;

/**
 * This class represents a Dashboard for the frontend.
 */
public class Sheet {
    public ObjectId _id;
    public String id;
    public String name;
    public List<String> widgets;
}
