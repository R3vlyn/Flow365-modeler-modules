'use strict';

var entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory');

var is = require('bpmn-js/lib/util/ModelUtil').is;

module.exports = function (group, element) {

    // Only return an entry, if the currently selected
    // element is a start event.

    if (is(element, 'bpmn:StartEvent')) {
//    group.entries.push(entryFactory.selectBox({
//      id : 'spell',
//      description : 'Apply a black magic spell',
//      label : 'Spell',
//      modelProperty : 'spell'
//    }));

        group.entries.push(entryFactory.selectBox({
            id: 'triggerCrudType',
            label: 'triggerCrudType',
            selectOptions: [
                {name: 'Create', value: 'Create'},
                {name: 'Update', value: 'Update'},
                {name: 'Delete', value: 'Delete'}
            ],
            modelProperty: 'triggerCrudType',
            emptyParameter: false
        }));

        group.entries.push(entryFactory.selectBox({
            id: 'triggerObject',
            label: 'triggerObject',
            selectOptions: [
                {name: 'Inschrijving', value: 'Inschrijving'},
                {name: 'Gebruiker', value: 'Gebruiker'},
                {name: 'Cursus', value: 'Cursus'},
                {name: 'Uitvoering', value: 'Uitvoering'}
            ],
            modelProperty: 'triggerObject',
            emptyParameter: false
        }));
    }
};