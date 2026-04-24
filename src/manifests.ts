import './PropertyEditors/MultiLanguageTextbox/vns-multilanguagetextbox-property-editor-ui.element';

const multiLanguageTextboxManifests = [
  {
    type: 'propertyEditorUi',
    alias: 'VNS.Umbraco.PropertyEditors.PropertyEditor.MultiLanguageTextbox.Ui',
    name: 'VNS Umbraco Property Editors Multi Language Textbox Property Editor UI',
    elementName: 'vns-umbraco-property-editors-multilanguagetextbox-property-editor-ui',
    meta: {
      label: 'Multi Language Textbox',
      icon: 'icon-indent',
      group: 'common',
      propertyEditorSchemaAlias: 'Umbraco.Plain.String',
      settings: {
        properties: [
          {
            alias: 'useTextArea',
            label: 'Use text area',
            description: 'Use a text area instead of text input field',
            propertyEditorUiAlias: 'Umb.PropertyEditorUi.Toggle',
          },
          {
            alias: 'isMandatoryLanguageRequired',
            label: 'Make mandatory language(s) required',
            description:
              'Make mandatory language(s) required. Only applicable if the property is not marked as mandatory',
            propertyEditorUiAlias: 'Umb.PropertyEditorUi.Toggle',
          },
        ],
      },
    },
  },
  {
    type: 'propertyEditorSchema',
    alias: 'VNS.Umbraco.PropertyEditors.PropertyEditor.MultiLanguageTextbox',
    name: 'VNS Umbraco Property Editors Multi Language Textbox Property Editor Schema',
    meta: {
      defaultPropertyEditorUiAlias:
        'VNS.Umbraco.PropertyEditors.PropertyEditor.MultiLanguageTextbox.Ui',
    },
  },
];

export const manifests = [...multiLanguageTextboxManifests];
