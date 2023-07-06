const ArrayStringFieldSchema = {
  type: 'array',
  valueType: 'string',
  valueArrayType: 'array',
  itemContainerComponent: 'FieldArrayItem',
  fieldClasses: 'w-100',
  fieldItemsClasses: 'd-flex mt-2 w-90',
  inputAttributes: { class: 'k-input', style: { minWidth: '200px' } },
  validator: 'array',
  styleClasses: 'w-100',
  newElementButtonLabel: '+ Add',
  newElementButtonLabelClasses: 'my-5',
}

export { ArrayStringFieldSchema }
