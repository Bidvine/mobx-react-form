import { action, observable, computed, isObservableArray, toJS, asMap } from 'mobx';
import _ from 'lodash';

import fieldsInitializer from './FieldsInit';

export default class Field {

  fields = asMap({});

  key;
  name;

  $rules;
  $validate;
  $related;
  @observable $label;
  @observable $value;
  @observable $disabled = false;
  @observable $error = null;
  @observable validationErrorStack = [];
  @observable asyncErrorMessage = null;
  @observable showError = true;

  @observable validationFunctionsData = [];
  @observable validationAsyncData = {};

  defaultValue = undefined;
  initialValue = undefined;
  interacted = false;

  constructor(key, field = {}, obj = {}) {
    this.initField(key, field, obj);
    // init nested fields
    if (_.has(field, 'fields')) {
      Object.assign(this, fieldsInitializer(this));
      this.initNestedFields(field.fields);
    }
  }

  @action
  initNestedFields(fields) {
    this.initFields({ fields });
  }

  @action
  initField($key, $field, {
    $value = null,
    $label = null,
    $default = null,
    $disabled = null,
    $related = null,
    $validate = null,
    $rules = null,
  } = {}) {
    this.key = $key;

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
      this.initialValue = this.parseInitialValue($value || $field);
      this.defaultValue = $default || this.initialValue;
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
      this.initialValue = this.parseInitialValue($value || $field.value);
      this.defaultValue = this.parseDefaultValue($default || $field.default);
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

  parseInitialValue(value) {
    // handle boolean
    if (_.isBoolean(value)) return value;
    // handle others types
    return !_.isUndefined(value) ? value : '';
  }

  parseDefaultValue($default) {
    return !_.isUndefined($default) ? $default : this.initialValue;
  }

  /**
    Add Field
  */
  @action
  add() {
    const $n = _.random(999, 9999);
    this.initField($n);
  }

  @action
  setInvalid(message, async = false) {
    if (async === true) {
      this.asyncErrorMessage = message;
      return;
    }

    if (_.isArray(message)) {
      this.validationErrorStack = message;
      return;
    }

    this.validationErrorStack.unshift(message);
  }

  @action
  resetValidation() {
    this.showError = true;
    this.$error = null;
    this.asyncErrorMessage = null;
    this.validationAsyncData = {};
    this.validationFunctionsData = [];
    this.validationErrorStack = [];
  }

  @action
  setValidationAsyncData(obj = {}) {
    this.validationAsyncData = obj;
  }

  @action
  clear() {
    this.interacted = false;
    this.resetValidation();
    if (isObservableArray(this.$value)) this.$value = [];
    if (_.isBoolean(this.$value)) this.$value = false;
    if (_.isNumber(this.$value)) this.$value = 0;
    if (_.isString(this.$value)) this.$value = '';
  }

  @action
  reset() {
    const useDefaultValue = (this.defaultValue !== this.initialValue);
    if (useDefaultValue) this.value = this.defaultValue;
    if (!useDefaultValue) this.value = this.initialValue;
    this.interacted = false;
  }

  @action
  update(obj) {
    this.value = obj;
  }

  @action
  showErrors(showErrors = true) {
    if (showErrors === false) {
      this.showError = false;
      return;
    }

    this.$error = _.head(this.validationErrorStack);
    this.validationErrorStack = [];
  }

  @action
  showAsyncErrors() {
    if (this.validationAsyncData.valid === false) {
      this.asyncErrorMessage = this.validationAsyncData.message;
      return;
    }
    this.asyncErrorMessage = null;
  }

  @action
  set(key, val) {
    _.set(this, `$${key}`, val);
  }

  @computed
  get value() {
    if (isObservableArray(this.$value)) {
      return [].slice.call(this.$value);
    }
    return this.$value;
  }

  set value(newVal) {
    if (!this.interacted) this.interacted = true;
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
    return this.defaultValue;
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
  get initial() {
    return this.initialValue;
  }

  @computed
  get error() {
    if (this.showError === false) return null;
    return (this.asyncErrorMessage || this.$error);
  }

  @computed
  get hasError() {
    return (!_.isEmpty(this.validationAsyncData)
      && (this.validationAsyncData.valid === false))
      || (this.validationErrorStack.length !== 0)
      || _.isString(this.asyncErrorMessage)
      || _.isString(this.$error);
  }

  @computed
  get isValid() {
    return !this.hasError;
  }

  @computed
  get isDirty() {
    return (this.defaultValue !== this.$value);
  }

  @computed
  get isPristine() {
    return (this.defaultValue === this.$value);
  }

  @computed
  get isDefault() {
    return (this.defaultValue === this.$value);
  }

  @computed
  get isEmpty() {
    if (_.isNumber(this.$value)) return false;
    if (_.isBoolean(this.$value)) return !this.$value;
    return _.isEmpty(this.$value);
  }

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

  handleAdd = (e) => {
    e.preventDefault();
    this.add();
  };
}
