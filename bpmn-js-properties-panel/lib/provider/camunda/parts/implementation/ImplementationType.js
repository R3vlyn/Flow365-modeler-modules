'use strict';

var entryFactory = require('../../../../factory/EntryFactory'),
    cmdHelper = require('../../../../helper/CmdHelper');

var assign = require('lodash/object/assign');

var DEFAULT_DELEGATE_PROPS = ['class', 'expression', 'delegateExpression'];

var DELEGATE_PROPS = {
    'camunda:class': undefined,
    'camunda:expression': undefined,
    'camunda:delegateExpression': undefined,
    'camunda:resultVariable': undefined
};


var EXTERNAL_CAPABLE_PROPS = {
    'camunda:type': undefined,
    'camunda:topic': undefined
};

var DEFAULT_OPTIONS = [
    { value: 'expression', name: 'Expression' }
];

var EXTERNAL_OPTION = [
    { value: 'external', name: 'External' }
];

var SCRIPT_OPTION = [
    { value: 'script', name: 'Script' }
];

module.exports = function(element, bpmnFactory, options) {

    var getType = options.getImplementationType,
        getBusinessObject = options.getBusinessObject;

    var hasExternalSupport = options.hasExternalSupport,
        hasScriptSupport = options.hasScriptSupport;

    var entries = [];

    var selectOptions = DEFAULT_OPTIONS.concat([]);

    if (hasExternalSupport) {
        selectOptions = selectOptions.concat(EXTERNAL_OPTION);
    }

    if (hasScriptSupport) {
        selectOptions = selectOptions.concat(SCRIPT_OPTION);
    }

    entries.push(entryFactory.comboBox({
        id: 'implementation',
        label: 'Implementation',
        selectOptions: selectOptions,
        modelProperty: 'implType',

        get: function(element, node) {
            return {
                implType: getType(element) || ''
            };
        },

        set: function(element, values, node) {
            var bo = getBusinessObject(element);
            var oldType = getType(element);
            var newType = values.implType;

            var props = assign({}, DELEGATE_PROPS);

            if (DEFAULT_DELEGATE_PROPS.indexOf(newType) !== -1) {

                var newValue = '';
                if (DEFAULT_DELEGATE_PROPS.indexOf(oldType) !== -1) {
                    newValue = bo.get('camunda:' + oldType);
                }
                props['camunda:' + newType] = newValue;
            }

            if (hasExternalSupport) {
                props = assign(props, EXTERNAL_CAPABLE_PROPS);
                if (newType === 'external') {
                    props['camunda:type'] = 'external';
                    props['camunda:topic'] = '';
                }
            }

            var commands = [];
            commands.push(cmdHelper.updateBusinessObject(element, bo, props));
            return commands;
        }
    }));
    return entries;

};