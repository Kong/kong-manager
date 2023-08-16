/**
 * Get fields to for displaying in table from schema
 * @param {fields} schema Credential schema from schemas/*.js
 */
export const getColumnFields = schema => {
  const fields = Object.fromEntries(schema.fields.map(o => Object.entries(o)[0]))

  // Add `id` field to the last if not exist since this affects the ordering of
  // the fields in the table head.
  if (!('id' in fields)) fields.id = {}

  return fields
}

export const tags = {
  label: 'Tags',
  name: 'tags',
  type: 'input',
  inputType: 'text',
  valueType: 'array',
  valueArrayType: 'string',
  placeholder: 'Enter list of tags',
  help: 'An optional set of strings for grouping and filtering, separated by commas.',
  hint: 'e.g. tag1, tag2, tag3',
}

export const id = {
  label: 'ID',
}

export const enabled = {
  label: 'Enabled',
  indexed: true,
  type: 'boolean',
}

export const created_at = {
  label: 'Created',
}

export const updated_at = {
  label: 'Last updated',
}

export const fields = {
  arrayItems (item) {
    const inputAttributes = item.inputAttributes || {}

    delete item.inputAttributes

    return {
      type: 'array',
      itemContainerComponent: 'FieldArrayItem',
      fieldClasses: 'kong-form-array-field',
      fieldItemsClasses: 'kong-form-array-field-item',
      newElementButtonLabelClasses: 'kong-form-new-element-button-label',
      inputAttributes: { class: 'k-input', style: { minWidth: '200px' }, ...inputAttributes },
      removeElementButtonLabel: 'remove',
      styleClasses: 'kong-form-field-wrapper',
      inputType: 'text',
      valueType: 'array',
      valueArrayType: 'string',
      ...item,
    }
  },
}

export default {
  getColumnFields,
  tags,
  id,
  enabled,
  created_at,
  updated_at,
  fields,
}
