const ArrayStringFieldSchema = {
  type: 'array',
  valueType: 'string',
  valueArrayType: 'array',
  itemContainerComponent: 'FieldArrayItem',
  fieldClasses: 'kong-form-array-string-field',
  fieldItemsClasses: 'kong-form-array-string-field-item',
  inputAttributes: { class: 'form-control', style: { minWidth: '200px' } },
  validator: 'array',
  styleClasses: 'kong-form-field-wrapper',
  newElementButtonLabel: '+ Add',
  newElementButtonLabelClasses: 'kong-form-new-element-button-label',
}

export { ArrayStringFieldSchema }
