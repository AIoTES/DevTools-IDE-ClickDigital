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
package  platforms.aiotessil.models;

import java.util.ArrayList;
import java.util.List;

/**
 * This class models a device
 * at aiotes sil
 */
public class Device {
   public List<String> deviceTypes = new ArrayList<String>();
   public String deviceId;
   public String hostedBy;
   public String location;
   public String name;
   public List<String> hosts= new ArrayList<String>();
   public List<String> forProperty= new ArrayList<String>(); //changed from just String to list of string since aiotes integration  april 19
   public String madeActuation;
   public String implementsProcedure;
   public List<String> observes= new ArrayList<String>(); //changed from just String to list of string since aiotes integration  april 19
   public String detects;
   public String madeObservation;

    /**
     * Default constructor
     */
    public Device(){}

    public Device(String deviceId, String hostedBy, String name){
       location = "http://nolocation"; //TODO get all available locations from aiotes platform display and map them on clickdigital locations
       this.deviceId = deviceId;
       this.hostedBy = hostedBy;
       this.name = name;
    }

}
