'use strict';

var entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory');

var is = require('bpmn-js/lib/util/ModelUtil').is,
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    cmdHelper = require('../../../helper/CmdHelper');
module.exports = function(group, element) {
    // Only return an entry, if the currently selected
    // element is a start event.

    if (is(element, 'bpmn:StartEvent')) {

        group.entries.push(entryFactory.comboBox({
            id: 'Event',
            label: 'Event',
            selectOptions: [
                { name: 'Create', value: 'Create' },
                { name: 'Update', value: 'Update' },
                { name: 'Delete', value: 'Delete' }
            ],
            emptyParameter: false,
            modelProperty: 'Event',

            get: function(element) {
                var bo = getBusinessObject(element);

                return {
                    Event: bo.get('Viper:Event'),
                };
            },

            set: function(element, values) {
                var bo = getBusinessObject(element);

                return cmdHelper.updateBusinessObject(element, bo, {
                    'Viper:Event': values.Event || undefined,
                });
            },

            validate: function(element, values, node) {
                return !values.Event ? { Event: 'Must provide a value' } : {};
            }
        }));

        group.entries.push(entryFactory.textBox({
            id: 'Object',
            label: 'Object',
            modelProperty: 'Object',
            validate: function(element, values, node) {
                return !values.Object ? { Object: 'Must provide a value' } : {};
            }
        }));
    }
};