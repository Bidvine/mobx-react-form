import _ from 'lodash';

/**
  Declarative Validation Rules

    const plugins = {
      dvr: {
        package: validatorjs,
        extend: callback,
      },
    };

*/
export default class DVR {

  promises = [];

  asyncRules = [];

  validators = {};

  validator = null;

  extend = null;

  options;

  constructor(plugin, obj = {}) {
    this.assignInitData(plugin, obj);
    this.extendValidator();
  }

  assignInitData(plugin, { options = {}, promises = [] }) {
    this.options = options;
    this.promises = promises;
    this.extend = plugin.extend;
    this.validator = plugin.package || plugin;
  }

  extendValidator() {
    // extend the validator with custom "registerAsyncRule" method
    _.extend(this.validator, {
      registerAsyncRule: (key, callback) => this.registerAsyncRule(key, callback),
    });
    // extend using "extend" callback
    if (_.isFunction(this.extend)) this.extend(this.validator);
  }

  validateField(field, form) {
    // get form fields data
    const data = form.validatedValues;
    this.validateFieldAsync(field, form, data);
    this.validateFieldSync(field, form, data);
  }

  makeLabels(validation, field, form) {
    const labels = { [field.path]: field.label };
    _.each(validation.rules[field.path], (rule) => {
      if (typeof rule.value === 'string' && rule.name.match(/^(required_|same)/)) {
        _.each(rule.value.split(','), (p) => {
          const f = form.$(p);
          if (f && f.path && f.label) {
            labels[f.path] = f.label;
          }
        });
      }
    });

    validation.setAttributeNames(labels);
  }

  validateFieldSync(field, form, data) {
    const $rules = this.rules(field.rules, 'sync');
    // exit if no rules found
    if (_.isEmpty($rules[0])) return;
    // get field rules
    const rules = { [field.path]: $rules };
    // create the validator instance
    const Validator = this.validator;
    const validation = new Validator(data, rules);
    // set label into errors messages instead key
    this.makeLabels(validation, field, form);
    // check validation
    if (validation.passes()) return;
    // the validation is failed, set the field error
    field.invalidate(_.first(validation.errors.get(field.path)));
  }

  validateFieldAsync(field, form, data) {
    const $rules = this.rules(field.rules, 'async');
    // exit if no rules found
    if (_.isEmpty($rules[0])) return;
    // get field rules
    const rules = { [field.path]: $rules };
    // create the validator instance
    const Validator = this.validator;
    const validation = new Validator(data, rules);
    // set label into errors messages instead key
    this.makeLabels(validation, field, form);

    const $p = new Promise(resolve =>
      validation.checkAsync(
        () => this.handleAsyncPasses(field, resolve),
        () => this.handleAsyncFails(field, validation, resolve),
      ));

    this.promises.push($p);
  }

  handleAsyncPasses(field, resolve) {
    field.setValidationAsyncData(true);
    field.showAsyncErrors();
    resolve();
  }

  handleAsyncFails(field, validation, resolve) {
    field.setValidationAsyncData(false, _.first(validation.errors.get(field.path)));
    this.executeAsyncValidation(field);
    field.showAsyncErrors();
    resolve();
  }

  executeAsyncValidation(field) {
    if (field.validationAsyncData.valid === false) {
      field.invalidate(field.validationAsyncData.message, true);
    }
  }

  registerAsyncRule(key, callback) {
    this.asyncRules.push(key);
    this.validator.registerAsync(key, callback);
  }

  rules(rules, type) {
    const $rules = _.isString(rules) ? _.split(rules, '|') : rules;
    if (type === 'sync') return _.difference($rules, this.asyncRules);
    if (type === 'async') return _.intersection($rules, this.asyncRules);
    return [];
  }
}
