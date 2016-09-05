import React from 'react';
import { observer } from 'mobx-react';
import jsonStringifySafe from 'json-stringify-safe';
import _ from 'lodash';

const merge = (field) => ({
  default: field.default,
  error: field.error,
  hasError: field.hasError,
  isValid: field.isValid,
  isDirty: field.isDirty,
  isPristine: field.isPristine,
  isDefault: field.isDefault,
  isEmpty: field.isEmpty,
  value: field.value,
});

const toJson = (data) => {
  const $data = jsonStringifySafe(data);
  return JSON.stringify(JSON.parse($data), null, 2);
};

const parseFormData = (form) => {
  const omit = ['fields', 'schema', 'extend', 'options', 'validator', 'events'];
  return toJson(_.merge(_.omit(form, omit), merge(form)));
};

const parseFieldData = (field) => {
  const omit = [
    '$value',
    'form',
    'related',
    'label',
    'name',
    'key',
    'rules',
    'validate',
    'disabled',
    'showError',
    'errorMessage',
    'initialValue',
    'defaultValue',
    'asyncErrorMessage',
    'validationAsyncData',
    'validationErrorStack',
    'validationFunctionsData',
    'validateProperty',
  ];

  return toJson(_.merge(_.omit(field, omit), merge(field)));
};

export const DebugField = observer(({ field }) => (
  <div>
    <h4>{field.label}</h4>
    <pre>
      {parseFieldData(field)}
    </pre>
  </div>
));

export const DebugForm = observer(({ form }) => (
  <div>
    <h4>Form</h4>
    <pre>
      {parseFormData(form)}
    </pre>
    <hr />
    {_.map(form.fields, (field) =>
      <DebugField field={field} key={field.key} />
    )}
  </div>
));
