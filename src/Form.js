import { action, computed, observe, observable, asMap } from 'mobx';
import _ from 'lodash';
import Validator from './Validator';
import Options from './Options';
import InitialState from './InitialState';
import fieldsInitializer from './FieldsInit';
import fieldHelpers from './FieldHelpers';

export default class Form {

  name;

  validator;

  @observable fields = asMap({});

  @observable $events = {
    clear: false,
    reset: false,
    update: false,
  };

  constructor(obj = {}, name = null) {
    console.log('NAME', name);
    this.name = name;

    this.assignFieldHelpers();
    this.assignInitData(obj);
    this.initValidator(obj);
    this.assignFieldsInitializer();
    this.initFields(obj);
    this.observeFields();
    this.validateOnInit();

    // execute onInit if exist
    if (_.isFunction(this.onInit)) this.onInit(this);
  }

  assignInitData(initial) {
    InitialState.set(_.omit(initial, ['options', 'plugins']));
    Options.set(Options.defaults);
    Options.set(initial.options);
  }

  assignFieldHelpers() {
    Object.assign(this, fieldHelpers(this));
  }

  assignFieldsInitializer() {
    Object.assign(this, fieldsInitializer(this));
  }

  options(options = {}) {
    if (!_.isEmpty(options)) Options.set(options);
    return Options.get();
  }

  initValidator(obj = {}) {
    this.validator = new Validator(obj);
  }

  on(event, callback) {
    observe(this.$events, ({ name, oldValue, object }) => {
      if (event === name && oldValue && !object[name]) {
        callback(this);
      }
    });
  }

  observeFields() {
    if (Options.get('validateOnChange') === false) return;
    // deep observe and validate each field
    this.observeFieldsDeep(this.fields);
  }

  observeFieldsDeep(fields) {
    fields.forEach((field, key) => {
      observe(fields.get(key), '$value', () =>
        this.validate({ key, field, showErrors: true, related: true }));
      // recursive observe and validate each field
      if (field.fields.size) this.observeFieldsDeep(field.fields);
    });
  }

  validateOnInit() {
    if (Options.get('validateOnInit') === false) return;
    // execute validation on form initialization
    this.validate({ showErrors: Options.get('showErrorsOnInit') });
  }

  validate(opt = {}, obj = {}) {
    this.validator.resetGenericError();

    const $key = _.has(opt, 'key') ? opt.key : opt;
    const $field = _.has(opt, 'field') ? opt.field : null;
    const showErrors = _.has(opt, 'showErrors') ? opt.showErrors : obj.showErrors || true;
    const related = _.has(opt, 'related') ? opt.related : obj.related || false;

    // look running events and choose when show errors messages
    const notShowErrorsEvents = ['clear', 'reset'];
    if (Options.get('showErrorsOnUpdate') === false) notShowErrorsEvents.push('update');
    const $showErrors = showErrors && !this.eventsRunning(notShowErrorsEvents);

    if (_.isObject(opt) && !_.isString($key)) {
      // validate all fields
      return new Promise((resolve) => {
        this.validator.validateAll({
          related,
          form: this,
          showErrors: $showErrors,
        });
        // wait all promises then resolve
        return Promise.all(this.validator.promises)
          .then(() => resolve(this.isValid));
      });
    }
    // validate single field
    return new Promise((resolve) => {
      // validate single field by key
      this.validator
        .validateField({
          related,
          form: this,
          key: $key,
          field: $field,
          showErrors: $showErrors,
        });
      // wait all promises then resolve
      return Promise.all(this.validator.promises)
        .then(() => resolve($field.isValid));
    });
  }

  eventsRunning(events) {
    const running = _.keys(_.omitBy(this.$events, e => e === false));
    return _.intersection(events, running).length > 0;
  }

  invalidate(message) {
    this.validator.invalidate(message);
  }

  /* ------------------------------------------------------------------ */
  /* ACTIONS */

  @action
  clear() {
    this.deepAction('clear', this.fields);
  }

  @action
  reset() {
    this.deepAction('reset', this.fields);
  }

  /* ------------------------------------------------------------------ */
  /* COMPUTED */

  @computed
  get hasError() {
    return _.some(this.deepCheck('some', 'hasError', this.fields))
      || _.isString(this.validator.genericErrorMessage);
  }

  @computed
  get isValid() {
    return _.every(this.deepCheck('every', 'isValid', this.fields))
      && !_.isString(this.validator.genericErrorMessage);
  }

  @computed
  get isDirty() {
    return _.some(this.deepCheck('some', 'isDirty', this.fields));
  }

  @computed
  get isPristine() {
    return _.every(this.deepCheck('every', 'isPristine', this.fields));
  }

  @computed
  get isDefault() {
    return _.every(this.deepCheck('every', 'isDefault', this.fields));
  }

  @computed
  get isEmpty() {
    return _.every(this.deepCheck('every', 'isEmpty', this.fields));
  }

  @computed
  get error() {
    return this.validator.genericErrorMessage;
  }

  /* ------------------------------------------------------------------ */
  /* EVENTS */

  /**
    On Submit
   */
  onSubmit = (e, o = {}) => {
    e.preventDefault();

    const execOnSuccess = _.has(o, 'onSuccess') ? o.onSuccess : this.onSuccess;
    const execOnError = _.has(o, 'onError') ? o.onError : this.onError;

    this.validate()
      .then(isValid => isValid
        ? execOnSuccess(this)
        : execOnError(this));
  };

  /**
    Event: On Clear
  */
  onClear = (e) => {
    e.preventDefault();
    this.clear();
  };

  /**
    Event: On Reset
  */
  onReset = (e) => {
    e.preventDefault();
    this.reset();
  };
}
