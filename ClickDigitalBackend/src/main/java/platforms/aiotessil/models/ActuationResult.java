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

/**
* This class models an actuation result set
 * at aiotes sil. It is an subclass of {@link ActuationInput}.
 */
public class ActuationResult {
   public String actuatableProperty;
   public String value;
   public String unit;
   public String resultTime;


    /**
     * Default constructor
     */
    public ActuationResult(){}

    public ActuationResult(String actuatableProperty, String value, String unit, String resultTime){
        this.actuatableProperty= actuatableProperty;
        this.value= value;
        this.unit = unit;
        this.resultTime= resultTime;
    }

}
