import { action, observable, computed, isObservableArray, toJS, asMap } from 'mobx';
import _ from 'lodash';

import fieldsInitializer from './FieldsInit';
import fieldHelpers from './FieldHelpers';

export default class Field {

  incremental = false;
  fields = asMap({});
  state;
  path;
  key;
  name;

  $rules;
  $validate;
  $related;

  @observable $label;
  @observable $value;
  @observable $default;
  @observable $disabled = false;

  initialValue = undefined;

  @observable errorSync = null;
  @observable errorAsync = null;

  @observable showError = true;

  @observable validationErrorStack = [];
  @observable validationFunctionsData = [];
  @observable validationAsyncData = {};

  constructor(key, path, field = {}, state, props = {}) {
    this.state = state;

    this.assignFieldHelpers();
    this.assignFieldsInitializer();

    this.setupField(key, path, field, props);
    this.initNestedFields(field.fields);

    // set as auto-incremental
    if (this.hasIntKeys() || !this.fields.size) {
      this.incremental = true;
    }
  }

  assignFieldHelpers() {
    Object.assign(this, fieldHelpers(this));
  }

  assignFieldsInitializer() {
    Object.assign(this, fieldsInitializer(this));
  }

  @action
  initNestedFields(fields) {
    this.initFields({ fields });
  }

  @action
  setupField($key, $path, $field, {
    $value = null,
    $label = null,
    $default = null,
    $disabled = null,
    $related = null,
    $validate = null,
    $rules = null,
  } = {}) {
    this.key = $key;
    this.path = $path;

    /**
      Assume the field is an array, a boolean, a string or a number
      Example:

        {
          username: 'test',
          password: '12345',
        }
    */
    if (
    _.isBoolean($field) ||
    _.isArray($field) ||
    _.isString($field) ||
    _.isNumber($field)) {
      /* The field IS the value here */
      this.name = $key;
      this.initialValue = this.parseInitialValue($field, $value);
      this.$default = this.parseDefaultValue($field.default, $default);
      this.$value = this.initialValue;
      this.$label = $label || $key;
      this.$rules = $rules || null;
      this.$disabled = $disabled || false;
      this.$related = $related || [];
      this.$validate = toJS($validate || null);
      return;
    }

    /**
      Assume the field is an object.
      Example:

        {
          username: {
            value: 'test';
            label: 'Username',
            message: 'This is a message!'
            validate: (field, fields) => {},
          },
        }
    */
    if (_.isObject($field)) {
      const { name, label, disabled, rules, validate, related } = $field;
      this.initialValue = this.parseInitialValue($field.value, $value);
      this.$default = this.parseDefaultValue($field.default, $default);
      this.name = name || $key;
      this.$value = this.initialValue;
      this.$label = $label || label || this.name;
      this.$rules = $rules || rules || null;
      this.$disabled = $disabled || disabled || false;
      this.$related = $related || related || [];
      this.$validate = toJS($validate || validate || null);
      return;
    }
  }

  parseInitialValue(unified, separated) {
    if (separated === 0) return separated;
    const $value = separated || unified;
    // handle boolean
    if (_.isBoolean($value)) return $value;
    // handle others types
    return !_.isUndefined($value) ? $value : '';
  }

  parseDefaultValue(initial, separated) {
    if (separated === 0) return separated;
    const $value = separated || initial;
    return !_.isUndefined($value) ? $value : this.initialValue;
  }

  /* ------------------------------------------------------------------ */
  /* INDEX / KEYS */

  hasIntKeys() {
    return _.every(this.parseIntKeys(), _.isInteger);
  }

  parseIntKeys() {
    return _.map(this.fields.keys(), _.ary(parseInt, 1));
  }

  maxKey() {
    const max = _.max(this.parseIntKeys());
    return _.isUndefined(max) ? 0 : max;
  }

  /* ------------------------------------------------------------------ */
  /* ACTIONS */

  /**
    Add Field
  */
  @action
  add(path = null) {
    if (_.isString(path)) {
      this.select(path).add();
      return;
    }

    const $n = this.maxKey() + 1;
    this.initField($n, [this.path, $n].join('.'));
  }

  /**
    Del Field
  */
  @action
  del(key = null) {
    this.fields.delete(key);
  }

  @action
  setInvalid(message, async = false) {
    if (async === true) {
      this.errorAsync = message;
      return;
    }

    if (_.isArray(message)) {
      this.validationErrorStack = message;
      return;
    }

    this.validationErrorStack.unshift(message);
  }

  @action
  setValidationAsyncData(obj = {}) {
    this.validationAsyncData = obj;
  }

  @action
  resetValidation(deep = false) {
    this.showError = true;
    this.errorSync = null;
    this.errorAsync = null;
    this.validationAsyncData = {};
    this.validationFunctionsData = [];
    this.validationErrorStack = [];

    // recursive resetValidation
    if (deep) this.deepAction('resetValidation', this.fields);
  }

  @action
  clear(deep = false) {
    this.resetValidation();
    if (isObservableArray(this.$value)) this.$value = [];
    if (_.isBoolean(this.$value)) this.$value = false;
    if (_.isNumber(this.$value)) this.$value = 0;
    if (_.isString(this.$value)) this.$value = '';

    // recursive clear fields
    if (deep) this.deepAction('clear', this.fields);
  }

  @action
  reset(deep = false) {
    const useDefaultValue = (this.$default !== this.initialValue);
    if (useDefaultValue) this.value = this.$default;
    if (!useDefaultValue) this.value = this.initialValue;

    // recursive clear fields
    if (deep) this.deepAction('reset', this.fields);
  }

  @action
  showErrors(showErrors = true) {
    if (showErrors === false) {
      this.showError = false;
      return;
    }

    this.errorSync = _.head(this.validationErrorStack);
    this.validationErrorStack = [];
  }

  @action
  showAsyncErrors() {
    if (this.validationAsyncData.valid === false) {
      this.errorAsync = this.validationAsyncData.message;
      return;
    }
    this.errorAsync = null;
  }

  /* ------------------------------------------------------------------ */
  /* COMPUTED */

  @computed
  get value() {
    if (isObservableArray(this.$value)) {
      return [].slice.call(this.$value);
    }
    return this.$value;
  }

  set value(newVal) {
    if (this.$value === newVal) return;
    // handle numbers
    if (_.isNumber(this.initialValue)) {
      const numericVal = _.toNumber(newVal);
      if (!_.isString(numericVal) && !_.isNaN(numericVal)) {
        this.$value = numericVal;
        return;
      }
    }
    // handle other types
    this.$value = newVal;
  }

  @computed
  get label() {
    return this.$label;
  }

  @computed
  get related() {
    return this.$related;
  }

  @computed
  get disabled() {
    return this.$disabled;
  }

  @computed
  get default() {
    return this.$default;
  }

  @computed
  get initial() {
    return this.initialValue;
  }

  @computed
  get rules() {
    return this.$rules;
  }

  @computed
  get validate() {
    return this.$validate;
  }

  @computed
  get error() {
    if (this.showError === false) return null;
    return (this.errorAsync || this.errorSync);
  }

  @computed
  get hasError() {
    return ((this.validationAsyncData.valid === false)
      && !_.isEmpty(this.validationAsyncData))
      || !_.isEmpty(this.validationErrorStack)
      || _.isString(this.errorAsync)
      || _.isString(this.errorSync);
  }

  @computed
  get isValid() {
    return !this.hasError;
  }

  @computed
  get isDirty() {
    return !_.isEqual(this.$default, this.value);
  }

  @computed
  get isPristine() {
    return _.isEqual(this.$default, this.value);
  }

  @computed
  get isDefault() {
    return _.isEqual(this.$default, this.value);
  }

  @computed
  get isEmpty() {
    if (_.isNumber(this.$value)) return false;
    if (_.isBoolean(this.$value)) return !this.$value;
    return _.isEmpty(this.$value);
  }

  /* ------------------------------------------------------------------ */
  /* EVENTS */

  sync = (e) => {
    // assume "e" is the value
    if (_.isUndefined(e.target)) {
      this.value = e;
      return;
    }

    // checkbox
    if (_.isBoolean(this.$value) && _.isBoolean(e.target.checked)) {
      this.value = e.target.checked;
      return;
    }

    // text
    this.value = e.target.value;
    return;
  };

  /**
    Event: On Clear
  */
  onClear = (e) => {
    e.preventDefault();
    this.clear(true);
  };

  /**
    Event: On Reset
  */
  onReset = (e) => {
    e.preventDefault();
    this.reset(true);
  };

  /**
    Event: On Add
  */
  onAdd = (e, data) => {
    e.preventDefault();
    this.add(data);
  };

  /**
    Event: On Del
  */
  onDel = (e, key) => {
    e.preventDefault();
    this.del(key);
  };
}
