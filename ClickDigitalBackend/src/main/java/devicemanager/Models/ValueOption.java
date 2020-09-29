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
package  devicemanager.Models;

import com.fasterxml.jackson.annotation.JsonAutoDetect;

/**
 * This class represents StateOption in ClickDigital for Actions
 */
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class ValueOption {
    public double minimum;
    public double maximum;
    public boolean percentage;

    public ValueOption(double minimum, double maximum, boolean percentage) {
        this.minimum = minimum;
        this.maximum = maximum;
        this.percentage = percentage;
    }

    public ValueOption(boolean percentage) {
        this.percentage = percentage;
    }

    public ValueOption(){}

}
