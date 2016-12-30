import _ from 'lodash';
import utils from './utils';

const parsePath = (path) => {
  let $path = path;
  $path = _.replace($path, new RegExp('\\[', 'g'), '.');
  $path = _.replace($path, new RegExp('\\]', 'g'), '');
  return $path;
};

// make integers labels empty
const parseGetLabel = label =>
  _.isInteger(_.parseInt(label)) ? '' : label;

const parseInitialValue = ({ unified = null, separated }) => {
  if (separated === 0) return separated;
  const $value = separated || unified;
  // handle boolean
  if (_.isBoolean($value)) return $value;
  // handle others types
  return !_.isNil($value) ? $value : '';
};

const parseDefaultValue = ({ unified = null, separated, initial }) => {
  if (separated === 0) return separated;
  const $value = separated || unified;
  return !_.isNil($value) ? $value : initial;
};

const parseArrayProp = ($val, $prop) => {
  const $values = _.values($val);
  if ($prop === 'value' || $prop === 'initial' || $prop === 'default') {
    return _.without($values, null, undefined, '');
  }
  return $values;
};

const defineFieldsFromStruct = struct =>
  _.reduceRight(struct, ($, name) => {
    if (_.endsWith(name, '[]')) {
      const obj = {};
      obj[_.trimEnd(name, '[]')] = [$];
      return obj;
    }

    // no brakets
    const obj = {};
    obj[name] = $;
    return obj;
  }, {});

const handleFieldsValuesFallback = (fields, initial) => {
  if (!_.has(initial, 'values')) return fields;
  // if the 'fields' object is not provided into the constructor
  // and the 'values' object is passed, use it to create fields
  return _.merge(fields, initial.values);
};

const handleFieldsArrayOfStrings = ($fields) => {
  let fields = $fields;
  // handle array with field struct (strings)
  if (utils.isStruct(fields)) {
    fields = _.reduce(fields, ($obj, $) => {
      const pathStruct = _.split($, '.');
      // as array of strings (with empty values)
      if (!pathStruct.length) return Object.assign($obj, { [$]: '' });
      // define flat or nested fields from pathStruct
      return _.merge($obj, defineFieldsFromStruct(pathStruct));
    }, {});
  }
  return fields;
};

const handleFieldsArrayOfObjects = ($fields) => {
  let fields = $fields;
  // handle array of objects (with unified props)
  if (_.isArray(fields) && _.every(fields, _.isPlainObject)) {
    fields = _.reduce(fields, ($obj, $) => {
      if (!_.has($, 'name')) return undefined;
      return Object.assign($obj, { [$.name]: $ });
    }, {});
  }
  return fields;
};

const handleFieldsNested = (fields, initial, strictProps) =>
  _.reduce(fields, (obj, field, key) => {
    if (_.isObject(field) && !_.isDate(field)
      && !_.has(field, 'fields')
      && ((!utils.hasUnifiedProps(field))
      || utils.hasSeparatedProps(initial)
      || !strictProps)) {
      // define nested field
      return Object.assign(obj, {
        [key]: { fields: handleFieldsNested(field) },
      });
    }
    return Object.assign(obj, { [key]: field });
  }, {});


const mergeSchemaDefaults = (fields, validator) => {
  if (validator) {
    const schema = validator.schema();
    const properties = schema.properties;
    if (_.isEmpty(fields) && !!properties) {
      _.each(properties, (prop, key) => {
        _.set(fields, key, {
          value: prop.default,
          label: prop.title,
        });
      });
    }
  }
  return fields;
};

const prepareFieldsData = (initial, strictProps = true) => {
  let fields = initial.fields || {};
  fields = handleFieldsArrayOfStrings(fields);
  fields = handleFieldsArrayOfObjects(fields);
  fields = handleFieldsValuesFallback(fields, initial);
  fields = handleFieldsNested(fields, initial, strictProps);
  return fields;
};

export default {
  parsePath,
  parseGetLabel,
  parseInitialValue,
  parseDefaultValue,
  parseArrayProp,
  mergeSchemaDefaults,
  handleFieldsNested,
  handleFieldsArrayOfStrings,
  prepareFieldsData,
};
