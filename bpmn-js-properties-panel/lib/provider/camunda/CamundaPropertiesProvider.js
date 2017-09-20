'use strict';

var inherits = require('inherits');

var PropertiesActivator = require('../../PropertiesActivator');

// bpmn properties
var processProps = require('../bpmn/parts/ProcessProps'),
    eventProps = require('../bpmn/parts/EventProps'),
    linkProps = require('../bpmn/parts/LinkProps'),
    idProps = require('../bpmn/parts/IdProps'),
    nameProps = require('../bpmn/parts/NameProps');
    //executableProps = require('../bpmn/parts/ExecutableProps');

// camunda properties
var serviceTaskDelegateProps = require('./parts/ServiceTaskDelegateProps'),
    userTaskProps = require('./parts/UserTaskProps'),
    sequenceFlowProps = require('./parts/SequenceFlowProps'),
    formProps = require('./parts/FormProps'),
    startEventInitiator = require('./parts/StartEventInitiator'),
    versionTag = require('./parts/VersionTagProps');

//equire your custom property entries.
var ProcessTriggerProps = require('./parts/ProcessTriggerProps');

var elementTemplateChooserProps = require('./element-templates/parts/ChooserProps'),
    elementTemplateCustomProps = require('./element-templates/parts/CustomProps');

function createGeneralTabGroups(element, bpmnFactory, elementRegistry, elementTemplates) {

  var generalGroup = {
    id: 'general',
    label: 'General',
    entries: []
  };
  idProps(generalGroup, element, elementRegistry);
  nameProps(generalGroup, element);
  processProps(generalGroup, element);
  versionTag(generalGroup, element);
  //executableProps(generalGroup, element);
  elementTemplateChooserProps(generalGroup, element, elementTemplates);

  var customFieldsGroup = {
    id: 'customField',
    label: 'Custom Fields',
    entries: []
  };
  elementTemplateCustomProps(customFieldsGroup, element, elementTemplates, bpmnFactory);

  var detailsGroup = {
    id: 'details',
    label: 'Details',
    entries: []
  };
  
  serviceTaskDelegateProps(detailsGroup, element, bpmnFactory);
  userTaskProps(detailsGroup, element);
  linkProps(detailsGroup, element);
  eventProps(detailsGroup, element, bpmnFactory, elementRegistry);
  sequenceFlowProps(detailsGroup, element, bpmnFactory);
  ProcessTriggerProps(detailsGroup, element);
  startEventInitiator(detailsGroup, element); // this must be the last element of the details group!

  return [
    generalGroup,
    customFieldsGroup,
    detailsGroup
  ];

}

function createFormsTabGroups(element, bpmnFactory, elementRegistry) {
  var formGroup = {
    id : 'forms',
    label : 'Variables',
    entries: []
  };
  formProps(formGroup, element, bpmnFactory);

  return [
    formGroup
  ];
}
/**
 * A properties provider for Camunda related properties.
 *
 * @param {EventBus} eventBus
 * @param {BpmnFactory} bpmnFactory
 * @param {ElementRegistry} elementRegistry
 * @param {ElementTemplates} elementTemplates
 */
function CamundaPropertiesProvider(eventBus, bpmnFactory, elementRegistry, elementTemplates) {

  PropertiesActivator.call(this, eventBus);

  this.getTabs = function(element) {

    var generalTab = {
      id: 'general',
      label: 'General',
      groups: createGeneralTabGroups(
                  element, bpmnFactory,
                  elementRegistry, elementTemplates)
    };

    var formsTab = {
      id: 'forms',
      label: 'Variables',
      groups: createFormsTabGroups(element, bpmnFactory, elementRegistry)
    };

    return [
      generalTab,
      formsTab
    ];
  };
}

CamundaPropertiesProvider.$inject = [
  'eventBus',
  'bpmnFactory',
  'elementRegistry',
  'elementTemplates'
];

inherits(CamundaPropertiesProvider, PropertiesActivator);

module.exports = CamundaPropertiesProvider;
