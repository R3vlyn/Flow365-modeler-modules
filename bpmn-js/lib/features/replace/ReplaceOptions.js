'use strict';

module.exports.START_EVENT = [{
        label: 'Start Event',
        actionName: 'replace-with-none-start',
        className: 'bpmn-icon-start-event-none',
        target: {
            type: 'bpmn:StartEvent'
        }
    },
    {
        label: 'End Event',
        actionName: 'replace-with-none-end',
        className: 'bpmn-icon-end-event-none',
        target: {
            type: 'bpmn:EndEvent'
        }
    }
];

module.exports.END_EVENT = [{
        label: 'Start Event',
        actionName: 'replace-with-none-start',
        className: 'bpmn-icon-start-event-none',
        target: {
            type: 'bpmn:StartEvent'
        }
    },
    {
        label: 'Terminate End Event',
        actionName: 'replace-with-terminate-end',
        className: 'bpmn-icon-end-event-terminate',
        target: {
            type: 'bpmn:EndEvent',
            eventDefinitionType: 'bpmn:TerminateEventDefinition'
        }
    }
];

module.exports.TASK = [{
        label: 'Task',
        actionName: 'replace-with-task',
        className: 'bpmn-icon-task',
        target: {
            type: 'bpmn:Task'
        }
    },
    {
        label: 'User Task',
        actionName: 'replace-with-user-task',
        className: 'bpmn-icon-user',
        target: {
            type: 'bpmn:UserTask'
        }
    },
    {
        label: 'Service Task',
        actionName: 'replace-with-service-task',
        className: 'bpmn-icon-service',
        target: {
            type: 'bpmn:ServiceTask'
        }
    }
];