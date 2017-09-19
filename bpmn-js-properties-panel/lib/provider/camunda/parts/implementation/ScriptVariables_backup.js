'use strict';

var entryFactory = require('../../../../factory/EntryFactory'),
        cmdHelper = require('../../../../helper/CmdHelper');

module.exports = function (element, bpmnFactory, options, scripts) {

    var getRunScript = options.getRunScript,
            getBusinessObject = options.getBusinessObject;

    function selectedScriptEqualsThisScript(element, thisscriptname)
    {
        return(getRunScript(element) === thisscriptname);
    }

    function addVariableEntry(variabledata, scriptname)
    {
        var partentries = [];
        partentries.push(
                entryFactory.label({
                    id: variabledata.name,
                    divider: true,
                    labelText: variabledata.name + ", " + variabledata.type + ", " + variabledata.direction,
                    showLabel: function (element, node) {
                        return selectedScriptEqualsThisScript(element, scriptname);
                    }
                }),
                entryFactory.textField({
                    id: variabledata.name + "variablevalue",
                    label: 'Variable value',
                    modelProperty: 'variablevalue',

                    get: function (element, node) {
                        var bo = getBusinessObject(element);
                        return {variablevalue: bo.get('camunda:variablevalue')};
                    },

                    set: function (element, values, node) {
                        var bo = getBusinessObject(element);

                        var variablevalue = values.variablevalue || undefined;
                        var count = (variablevalue.match('/' + variabledata.name + '/g') || []).length;
                        if(count === 0)
                        {
                            variablevalue = variabledata.name + "-" + variablevalue;
                        }

                        var props = {
                            'camunda:variablevalue': variablevalue
                        };

                        return cmdHelper.updateBusinessObject(element, bo, props);
                    },

                    hidden: function (element, node) {
                        return !selectedScriptEqualsThisScript(element, scriptname);
                    }
                }));

        return partentries;
    }

    function createVariableEntries(scripts)
    {
        var entries = [];
        for (var i = 0, len = scripts.length; i < len; i++) {
            entries = entries.concat(addVariableEntry(scripts[i].variables, scripts[i].name));
        }
        return entries;
    }

    return createVariableEntries(scripts);
};
