'use strict';

var entryFactory = require('../../../../factory/EntryFactory'),
        cmdHelper = require('../../../../helper/CmdHelper');

module.exports = function (element, bpmnFactory, options) {

    var getExternalTopic = options.getExternalTopic,
            getBusinessObject = options.getBusinessObject;

    function isUpdate(element) {
        var x = getExternalTopic(element);
        return x === 'update';
    }

    var topicEntry = entryFactory.textField({
        id: 'updatevariables',
        label: 'Camunda-variable(s)',
        modelProperty: 'updatevariables',

        get: function (element, node) {
            var bo = getBusinessObject(element);
            return {updatevariables: bo.get('camunda:updatevariables')};
        },

        set: function (element, values, node) {
            var bo = getBusinessObject(element);
            return cmdHelper.updateBusinessObject(element, bo, {
                'camunda:updatevariables': values.updatevariables
            });
        },

        validate: function (element, values, node) {
            return isUpdate(element) && !values.updatevariables ? {update: 'Must provide a value'} : {};
        },

        hidden: function (element, node) {
            return !isUpdate(element);
        }
    });
    return [topicEntry];
};
