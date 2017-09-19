'use strict';

var entryFactory = require('../../../../factory/EntryFactory'),
        popupwindow = require('../../../../popup'),
        cmdHelper = require('../../../../helper/CmdHelper');


module.exports = function (element, bpmnFactory, options) {

    var getImplementationType = options.getImplementationType,
            getBusinessObject = options.getBusinessObject;

    function isExternal(element) {
        return getImplementationType(element) === 'external';
    }

    var topicEntry = entryFactory.selectBox({

        id: 'externalTopic',
        label: 'Topic',
        selectOptions: [
            {name: 'Runscript', value: 'runscript'},
            {name: 'Update', value: 'update'},
            {name: 'Servicetask', value: 'servicetask'}
        ],
        modelProperty: 'externalTopic',

        
        get: function (element, node) {
            var bo = getBusinessObject(element);
            return {externalTopic: bo.get('camunda:topic')};
        },

        set: function (element, values, node) {
            var popupoptions = {
            'popup-header': "header",
            'popup-body': "body",
            'popup-footer': "footer"};
        
            var popup = new popupwindow();
            popup.open();
            
            var bo = getBusinessObject(element);
            return cmdHelper.updateBusinessObject(element, bo, {
                'camunda:topic': values.externalTopic
            });
        },

        validate: function (element, values, node) {
            return isExternal(element) && !values.externalTopic ? {externalTopic: 'Must provide a value'} : {};
        },

        hidden: function (element, node) {
            return !isExternal(element);
        }
    });

    return [topicEntry];

};
