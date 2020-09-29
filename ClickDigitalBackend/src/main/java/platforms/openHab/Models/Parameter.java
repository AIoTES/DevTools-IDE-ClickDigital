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
 * This class represents a Parameter on OpenHab
 */
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class Parameter {
    public String context;
    public String defaultValue;
    public String description;
    public String label;
    public String name;
    public boolean required;
    public String type;
    public int min;
    public int max;
    public int stepsize;
    public String pattern;
    public boolean readOnly;
    public boolean multiple;
    public int multipleLimit;
    public String groupName;
    public boolean advanced;
    public boolean verify;
    public boolean limitToOptions;
    public String unit;
    public String unitLabel;
    public List<Option> options;
    public List<FilterCriteria> filterCriteria;


    public Parameter(String context, String defaultValue, String description,String label, String name, boolean required, String type, int min, int max, int stepsize, String pattern, boolean readOnly, boolean multiple, int multipleLimit, String groupName, boolean advanced, boolean verify, boolean limitToOptions, String unit, String unitLabel, List<Option> options, List<FilterCriteria> filterCriteria) {
        this.context = context;
        this.defaultValue = defaultValue;
        this.description=description;
        this.label = label;
        this.name = name;
        this.required = required;
        this.type = type;
        this.min = min;
        this.max = max;
        this.stepsize = stepsize;
        this.pattern = pattern;
        this.readOnly = readOnly;
        this.multiple = multiple;
        this.multipleLimit = multipleLimit;
        this.groupName = groupName;
        this.advanced = advanced;
        this.verify = verify;
        this.limitToOptions = limitToOptions;
        this.unit = unit;
        this.unitLabel = unitLabel;
        this.options = options;
        this.filterCriteria = filterCriteria;
    }
    public Parameter(){}

    public String getContext() {
        return context;
    }

    public String getDefaultValue() {
        return defaultValue;
    }

    public String getDescription() {
        return description;
    }

    public String getLabel() {
        return label;
    }

    public String getName() {
        return name;
    }

    public boolean isRequired() {
        return required;
    }

    public String getType() {
        return type;
    }

    public int getMin() {
        return min;
    }

    public int getMax() {
        return max;
    }

    public int getStepsize() {
        return stepsize;
    }

    public String getPattern() {
        return pattern;
    }

    public boolean isReadOnly() {
        return readOnly;
    }

    public boolean isMultiple() {
        return multiple;
    }

    public int getMultipleLimit() {
        return multipleLimit;
    }

    public String getGroupName() {
        return groupName;
    }

    public boolean isAdvanced() {
        return advanced;
    }

    public boolean isVerify() {
        return verify;
    }

    public boolean isLimitToOptions() {
        return limitToOptions;
    }

    public String getUnit() {
        return unit;
    }

    public String getUnitLabel() {
        return unitLabel;
    }

    public List<Option> getOptions() {
        return options;
    }

    public List<FilterCriteria> getFilterCriteria() {
        return filterCriteria;
    }
}
