'use strict';

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    getExtensionElements = require('../../../helper/ExtensionElementsHelper').getExtensionElements,
    extensionElements = require('./implementation/ExtensionElements'),
    properties = require('./implementation/Properties'),
    entryFactory = require('../../../factory/EntryFactory'),
    elementHelper = require('../../../helper/ElementHelper'),
    cmdHelper = require('../../../helper/CmdHelper'),
    formHelper = require('../../../helper/FormHelper'),
    utils = require('../../../Utils'),
    is = require('bpmn-js/lib/util/ModelUtil').is,
    find = require('lodash/collection/find'),
    each = require('lodash/collection/forEach');

function generateValueId() {
    return utils.nextId('Value_');
}

/**
 * Generate a form field specific textField using entryFactory.
 *
 * @param  {string} options.id
 * @param  {string} options.label
 * @param  {string} options.modelProperty
 * @param  {function} options.validate
 *
 * @return {Object} an entryFactory.textField object
 */
function formFieldTextField(options, getSelectedFormField) {

    var id = options.id,
        label = options.label,
        modelProperty = options.modelProperty,
        validate = options.validate;

    return entryFactory.textField({
        id: id,
        label: label,
        modelProperty: modelProperty,
        get: function(element, node) {
            var selectedFormField = getSelectedFormField(element, node) || {},
                values = {};
            values[modelProperty] = selectedFormField[modelProperty];

            return values;
        },

        set: function(element, values, node) {
            var commands = [];

            if (typeof options.set === 'function') {
                var cmd = options.set(element, values, node);

                if (cmd) {
                    commands.push(cmd);
                }
            }

            var formField = getSelectedFormField(element, node),
                properties = {};

            properties[modelProperty] = values[modelProperty] || undefined;

            commands.push(cmdHelper.updateBusinessObject(element, formField, properties));

            return commands;
        },
        hidden: function(element, node) {
            return !getSelectedFormField(element, node);
        },
        validate: validate
    });
}

function ensureFormKeyAndDataSupported(element) {
    return (is(element, 'bpmn:StartEvent') && !is(element.parent, 'bpmn:SubProcess')) ||
        is(element, 'bpmn:UserTask');
}

module.exports = function(group, element, bpmnFactory) {

    if (!ensureFormKeyAndDataSupported(element)) {
        return;
    }


    /**
     * Return the currently selected form field querying the form field select box
     * from the DOM.
     *
     * @param  {djs.model.Base} element
     * @param  {DOMElement} node - DOM element of any form field text input
     *
     * @return {ModdleElement} the currently selected form field
     */
    function getSelectedFormField(element, node) {
        var selected = formFieldsEntry.getSelected(element, node.parentNode);

        if (selected.idx === -1) {
            return;
        }

        return formHelper.getFormField(element, selected.idx);
    }

    // [FormData] form field select box
    var formFieldsEntry = extensionElements(element, bpmnFactory, {
        id: 'form-fields',
        label: 'Variables',
        modelProperty: 'id',
        prefix: 'FormField',
        createExtensionElement: function(element, extensionElements, value) {
            var bo = getBusinessObject(element),
                commands = [];

            if (!extensionElements) {
                extensionElements = elementHelper.createElement('bpmn:ExtensionElements', { values: [] }, bo, bpmnFactory);
                commands.push(cmdHelper.updateProperties(element, { extensionElements: extensionElements }));
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

            var field = elementHelper.createElement('camunda:FormField', { id: value }, formData, bpmnFactory);
            if (typeof formData.fields !== 'undefined') {
                commands.push(cmdHelper.addElementsTolist(element, formData, 'fields', [field]));
            } else {
                commands.push(cmdHelper.updateBusinessObject(element, formData, {
                    fields: [field]
                }));
            }
            return commands;
        },
        removeExtensionElement: function(element, extensionElements, value, idx) {
            var formData = getExtensionElements(getBusinessObject(element), 'camunda:FormData')[0],
                entry = formData.fields[idx],
                commands = [];

            commands.push(cmdHelper.removeElementsFromList(element, formData, 'fields', null, [entry]));

            if (entry.id === formData.get('businessKey')) {
                commands.push(cmdHelper.updateBusinessObject(element, formData, { 'businessKey': undefined }));
            }

            return commands;
        },
        getExtensionElements: function(element) {
            var parent = element.parent;
            return formHelper.getFormFields(element);
        },
        hideExtensionElements: function(element, node) {
            return false;
        }
    });
    group.entries.push(formFieldsEntry);


    // [FormData] Form Field label
    group.entries.push(entryFactory.label({
        id: 'form-field-header',
        labelText: 'Variable data',
        showLabel: function(element, node) {
            return !!getSelectedFormField(element, node);
        }
    }));

    if (is(element, 'bpmn:UserTask')) {
        group.entries.push(entryFactory.checkbox({
            id: 'form-field-input',
            label: 'Input',
            modelProperty: 'input',

            get: function(element, node) {
                var selectedFormField = getSelectedFormField(element, node);

                if (selectedFormField) {
                    return { input: selectedFormField.input };
                } else {
                    return {};
                }
            },
            set: function(element, values, node) {
                var selectedFormField = getSelectedFormField(element, node);
                return cmdHelper.updateBusinessObject(element, selectedFormField, { 'input': values.input });
            },

            hidden: function(element, node) {
                return !getSelectedFormField(element, node);
            }
        }));

        group.entries.push(entryFactory.checkbox({
            id: 'form-field-output',
            label: 'Output',
            modelProperty: 'output',


            get: function(element, node) {
                var selectedFormField = getSelectedFormField(element, node);

                if (selectedFormField) {
                    return { output: selectedFormField.output };
                } else {
                    return {};
                }
            },
            set: function(element, values, node) {
                var selectedFormField = getSelectedFormField(element, node);
                return cmdHelper.updateBusinessObject(element, selectedFormField, {
                    'output': values.output
                });
            },

            hidden: function(element, node) {
                return !getSelectedFormField(element, node);
            }
        }));
    };

    // [FormData] form field id text input field
    group.entries.push(entryFactory.validationAwareTextField({
        id: 'form-field-id',
        label: 'Name',
        modelProperty: 'id',

        getProperty: function(element, node) {
            var selectedFormField = getSelectedFormField(element, node) || {};

            return selectedFormField.id;
        },

        setProperty: function(element, properties, node) {
            var formField = getSelectedFormField(element, node);

            return cmdHelper.updateBusinessObject(element, formField, properties);
        },

        hidden: function(element, node) {
            return !getSelectedFormField(element, node);
        },

        validate: function(element, values, node) {

            var formField = getSelectedFormField(element, node);

            if (formField) {

                var idValue = values.id;

                if (!idValue || idValue.trim() === '') {
                    return { id: 'Form field id must not be empty' };
                }

                var formFields = formHelper.getFormFields(element);

                var existingFormField = find(formFields, function(f) {
                    return f !== formField && f.id === idValue;
                });

                if (existingFormField) {
                    return { id: 'Form field id already used in form data.' };
                }
            }
        }
    }));

    // [FormData] form field type combo box
    group.entries.push(entryFactory.comboBox({
        id: 'form-field-type',
        label: 'Type',
        selectOptions: [
            { name: 'string', value: 'string' },
            { name: 'long', value: 'long' },
            { name: 'boolean', value: 'boolean' },
            { name: 'date', value: 'date' }
        ],
        modelProperty: 'type',
        emptyParameter: false,

        get: function(element, node) {
            var selectedFormField = getSelectedFormField(element, node);

            if (selectedFormField) {
                return { type: selectedFormField.type };
            } else {
                return {};
            }
        },
        set: function(element, values, node) {
            var selectedFormField = getSelectedFormField(element, node),
                formData = getExtensionElements(getBusinessObject(element), 'camunda:FormData')[0],
                commands = [];

            if (selectedFormField.type === 'enum' && values.type !== 'enum') {
                // delete camunda:value objects from formField.values when switching from type enum
                commands.push(cmdHelper.updateBusinessObject(element, selectedFormField, { values: undefined }));
            }
            if (values.type === 'boolean' && selectedFormField.get('id') === formData.get('businessKey')) {
                commands.push(cmdHelper.updateBusinessObject(element, formData, { 'businessKey': undefined }));
            }
            commands.push(cmdHelper.updateBusinessObject(element, selectedFormField, values));

            return commands;
        },
        hidden: function(element, node) {
            return !getSelectedFormField(element, node);
        },
        validate: function(element, values, node) {
            if (getSelectedFormField(element, node)) {
                return !values.type ? { type: 'Must provide a value' } : {};
            } else {
                return {};
            }
        }
    }));

    var datasources = [{
            name: "OL_KAND",
            object: "Inschrijving"
        },
        {
            name: "OL_FACTUUR",
            object: "Inschrijving"
        },
        {
            name: "OL_KOSTEN",
            object: "Cursus"
        }
    ];

    function filterDatasources(datasources, viperobject) {
        var filteredDatasources = [];
        datasources.forEach(function(a) {
            if (a.object === viperobject) {
                filteredDatasources.push(a);
            }
        });
        return filteredDatasources;
    };

    function getSelectOptions(datasources) {
        var selectoptions = [];
        datasources.forEach(function(a) {
            selectoptions.push({ name: a.name, value: a.name });
        });
        return selectoptions;
    };

    var datasourceOptions = []
    try {
        var viperobject = element.businessObject.Object;
        var filterdDatasources = filterDatasources(datasources, viperobject);
        datasourceOptions = getSelectOptions(filterdDatasources);
    } catch (e) {}

    if (!is(element, 'bpmn:UserTask')) {
        group.entries.push(entryFactory.comboBox({
            id: 'form-field-datasource',
            label: 'Datasource',
            selectOptions: datasourceOptions,
            modelProperty: 'Datasource',
            emptyParameter: true,

            get: function(element, node) {
                var selectedFormField = getSelectedFormField(element, node);

                if (selectedFormField) {
                    return { Datasource: selectedFormField.Datasource };
                } else {
                    return {};
                }
            },
            set: function(element, values, node) {
                var selectedFormField = getSelectedFormField(element, node),
                    formData = getExtensionElements(getBusinessObject(element), 'camunda:FormData')[0],
                    commands = [];
                commands.push(cmdHelper.updateBusinessObject(element, selectedFormField, values));

                return commands;
            },
            hidden: function(element, node) {
                return !getSelectedFormField(element, node);
            }
        }));
    }

    // [FormData] form field defaultValue text input field
    group.entries.push(formFieldTextField({
        id: 'form-field-defaultValue',
        label: 'Value',
        modelProperty: 'defaultValue'
    }, getSelectedFormField));
};