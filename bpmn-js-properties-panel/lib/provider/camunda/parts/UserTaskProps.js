'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
        entryFactory = require('../../../factory/EntryFactory');


module.exports = function (group, element) {
    if (is(element, 'camunda:Assignable')) {

        // Assignee
        group.entries.push(entryFactory.textField({
            id: 'assignee',
            label: 'Assignee',
            modelProperty: 'assignee'
        }));

        // Candidate Users
        group.entries.push(entryFactory.textField({
            id: 'candidateUsers',
            label: 'Candidate Users',
            modelProperty: 'candidateUsers'
        }));
        
        // Due Date
        group.entries.push(entryFactory.textField({
            id: 'dueDate',
            description: 'The due date as an EL expression (e.g. ${someDate} or an ISO date (e.g. 2015-06-26T09:54:00)',
            label: 'Due Date',
            modelProperty: 'dueDate'
        }));

        group.entries.push(entryFactory.textBox({
            id: 'description',
            label: 'Description',
            modelProperty: 'description'
        }));
    }
};
