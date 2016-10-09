import React from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import JSONTree from 'react-json-tree';
import _ from 'lodash';

const theme = {
  scheme: 'ocean',
  author: 'chris kempson (http://chriskempson.com)',
  base00: '#2b303b',
  base01: '#343d46',
  base02: '#4f5b66',
  base03: '#65737e',
  base04: '#a7adba',
  base05: '#c0c5ce',
  base06: '#dfe1e8',
  base07: '#eff1f5',
  base08: '#bf616a',
  base09: '#d08770',
  base0A: '#ebcb8b',
  base0B: '#a3be8c',
  base0C: '#96b5b4',
  base0D: '#8fa1b3',
  base0E: '#b48ead',
  base0F: '#ab7967',
};

const fieldPropsToPick = [
  'path',
  'default',
  'initial',
  'value',
  'label',
  'disabled',
  'hasError',
  'isValid',
  'isEmpty',
  'isDefault',
  'isPristine',
  'isDirty',
  'error',
  'related',
];

const parseFormData = form =>
  toJS(_.pick(form, [
    'validating',
    'hasError',
    'isValid',
    'isEmpty',
    'isDefault',
    'isPristine',
    'isDirty',
  ]));

const parseFieldsData = fields =>
  _.reduce(fields.values(), (obj, field) => {
    const $nested = $fields => ($fields.size !== 0)
      ? parseFieldsData($fields)
      : undefined;

    const data = toJS(_.pick(field, fieldPropsToPick));

    Object.assign(obj, {
      [field.key]: Object.assign(data, {
        fields: $nested(field.fields),
      }),
    });

    return obj;
  }, {});

export default observer(({ form }) => (
  <div>
    <h3>Form</h3>
    <JSONTree
      data={parseFormData(form)}
      theme={theme}
      isLightTheme={false}
    />
    <h3>Fields</h3>
    <JSONTree
      data={parseFieldsData(form.fields)}
      theme={theme}
      isLightTheme={false}
    />
  </div>
));
