'use strict';

var entryFactory = require('../../../../factory/EntryFactory'),
        cmdHelper = require('../../../../helper/CmdHelper');

module.exports = function (element, bpmnFactory, options, scripts) {

    var getExternalTopic = options.getExternalTopic,
            getBusinessObject = options.getBusinessObject;

    function isRunscript(element) {
        return getExternalTopic(element) === 'runscript';
//                    document.getElementById("cam-extensionElements-create-form-fields").click();
//    var variables = [];
//    variables.push({name: "emailaddress", type:"string", direction:"input"},{name: "Invoicenumber", type:"long", direction:"input"},{name: "birthyear", type:"date", direction:"input"});
//    document.getElementById("form-fields").createElement(variables[0]);
    }


    var topicEntry = entryFactory.selectBox({

        id: 'runscript',
        label: 'Runscript',
        selectOptions: scripts,
        modelProperty: 'runscript',
        emptyParameter: true,

        get: function (element, node) {
            var bo = getBusinessObject(element);
            return {runscript: bo.get('camunda:runscript')};
        },

        set: function (element, values, node) {
            var bo = getBusinessObject(element);
            return cmdHelper.updateBusinessObject(element, bo, {
                'camunda:runscript': values.runscript
            });
        },

        validate: function (element, values, node) {
            return isRunscript(element) && !values.runscript ? {runscript: 'Must provide a value'} : {};
        },

        hidden: function (element, node) {
            return !isRunscript(element);
        }
    });

    return [topicEntry];

};
