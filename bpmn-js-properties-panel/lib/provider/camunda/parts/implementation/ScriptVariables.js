'use strict';

var entryFactory = require('../../../../factory/EntryFactory'),
    elementHelper = require('../../../../helper/ElementHelper'),
    cmdHelper = require('../../../../helper/CmdHelper');

module.exports = function(element, bpmnFactory, options, scripts) {

    var getRunScript = options.getRunScript,
        getBusinessObject = options.getBusinessObject;

    function selectedScriptEqualsThisScript(element, thisscriptname) {
        return (getRunScript(element) === thisscriptname);
    }

    function addVariableEntry(variables, scriptname) {
        var partentries = [];
        var numOfVars = variables.length;
        for (var i = 0; i < numOfVars; i++) {
            var variabledata = variables[i];
            partentries.push(
                entryFactory.label({
                    id: variabledata.name + "label",
                    divider: true,
                    labelText: variabledata.name + ", " + variabledata.type + ", " + variabledata.direction,
                    showLabel: function(element, node) {
                        return selectedScriptEqualsThisScript(element, scriptname);
                    }
                }),
                entryFactory.textField({
                    id: variabledata.name,
                    label: variabledata.name,
                    modelProperty: 'value',

                    get: function(element, node) {
                        var bo = getBusinessObject(element);
                        var extensionElements = bo.get('extensionElements');
                        var value = "";
                        if (extensionElements) {

                            var formData = extensionElements.values[0];
                            var field = formData.fields.find(element => element.id === this.id);
                            if (field) {
                                value = field.value;
                            }
                        }
                        return { value: value };
                    },

                    set: function(element, values, node) {

                        var commands = [];
                        var bo = getBusinessObject(element);

                        var extensionElements = bo.get('extensionElements');
                        if (!extensionElements) {
                            extensionElements = elementHelper.createElement('bpmn:ExtensionElements', { values: [] }, bo, bpmnFactory);
                            commands.push(cmdHelper.updateBusinessObject(element, bo, { extensionElements: extensionElements }));
                        }

                        var formData = extensionElements.values[0];
                        if (!formData) {
                            formData = elementHelper.createElement('camunda:FormData', { fields: [] }, extensionElements, bpmnFactory);
                            commands.push(cmdHelper.addAndRemoveElementsFromList(
                                element,
                                extensionElements,
                                'values',
                                'extensionElements', [formData], []
                            ));
                        }

                        var field = elementHelper.createElement('camunda:FormField', { id: this.id, value: values.value }, formData, bpmnFactory);
                        if (typeof formData.fields !== 'undefined') {
                            var fields = formData.fields;
                            var existingField = fields.find(f => f.id === this.id);
                            if (existingField) {
                                existingField.value = field.value;
                            } else {
                                fields.push(field);
                            }

                            commands.push(cmdHelper.updateBusinessObject(element, formData, {
                                fields: fields
                            }));
                        } else {
                            commands.push(cmdHelper.addElementsTolist(element, formData, 'fields', [field]));
                        }
                        return commands;

                    },
                    validate: function(element, values, node) {
                        return !values.value ? { value: 'Must provide a value' } : {};
                    },
                    hidden: function(element, node) {
                        return !selectedScriptEqualsThisScript(element, scriptname);
                    }
                }));
        }
        return partentries;
    }

    function createVariableEntries(scripts) {
        var entries = [];
        for (var i = 0, len = scripts.length; i < len; i++) {
            entries = entries.concat(addVariableEntry(scripts[i].variables, scripts[i].name));
        }
        return entries;
    }

    return createVariableEntries(scripts);
};