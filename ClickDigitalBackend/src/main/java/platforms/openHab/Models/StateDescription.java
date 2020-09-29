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

import java.util.List;

/**
 * This class represents a StateDescription on OpenHab
 */
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class StateDescription {

    public int minimum;
    public int maximum;
    public int step;
    public String pattern;
    public boolean readOnly;
    public List<Option> options;

    public StateDescription(int minimum, int maximum, int step, String pattern, boolean readOnly, List<Option> options) {
        this.minimum = minimum;
        this.maximum = maximum;
        this.step = step;
        this.pattern = pattern;
        this.readOnly = readOnly;
        this.options = options;
    }

    public  StateDescription(){}

    /**
     *
     * @return minimum
     */
    public int getMinimum() {
        return minimum;
    }


    /**
     *
     * @return maximum
     */
    public int getMaximum() {
        return maximum;
    }

    /**
     *
     * @return step
     */
    public int getStep() {
        return step;
    }

    /**
     *
     * @return pattern
     */
    public String getPattern() {
        return pattern;
    }

    /**
     *
     * @return readOnly
     */
    public boolean isReadOnly() {
        return readOnly;
    }

    /**
     *
     * @return options
     */
    public List<Option> getOptions() {
        return options;
    }
}
