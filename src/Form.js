import { action, computed, observable, asMap } from 'mobx';
import _ from 'lodash';

import Base from './Base';
import Validator from './Validator';
import State from './State';
import Field from './Field';

import { $try } from './parser';

export default class Form extends Base {

  name;

  state;

  validator;

  @observable $validating = false;

  @observable fields = observable.map ? observable.map({}) : asMap({});

  constructor(setup = {}, {

    name = null,
    options = {},
    plugins = {},
    bindings = {},

  } = {}) {
    super();

    this.name = name;

    // load data from initializers methods
    const initial = _.each({ setup, options, plugins, bindings },
      (val, key) => _.isFunction(this[key])
      ? _.merge(val, this[key].apply(this, [this]))
      : val);

    this.state = new State({
      form: this,
      initial: initial.setup,
      options: initial.options,
      bindings: initial.bindings,
    });

    this.validator = new Validator({
      options: this.state.options,
      plugins: initial.plugins,
      schema: initial.setup.schema,
    });

    this.initFields(initial.setup);

    // execute validation on form initialization
    if (this.state.options.get('validateOnInit') === true) {
      this.validate({ showErrors: this.state.options.get('showErrorsOnInit') });
    }

    // execute onInit() if exist
    if (_.isFunction(this.onInit)) {
      this.onInit.apply(this, [this]);
    }
  }

  /* ------------------------------------------------------------------ */
  /* COMPUTED */

  @computed get validating() {
    return this.$validating;
  }

  @computed get error() {
    return this.validator.genericErrorMessage;
  }

  @computed get hasError() {
    return _.isString(this.validator.genericErrorMessage)
     || this.check('hasError', true);
  }

  @computed get isValid() {
    return !_.isString(this.validator.genericErrorMessage)
      && this.check('isValid', true);
  }

  @computed get isDirty() {
    return this.check('isDirty', true);
  }

  @computed get isPristine() {
    return this.check('isPristine', true);
  }

  @computed get isDefault() {
    return this.check('isDefault', true);
  }

  @computed get isEmpty() {
    return this.check('isEmpty', true);
  }

  @computed get focus() {
    return this.check('focus', true);
  }

  @computed get touched() {
    return this.check('touched', true);
  }

  @computed get changed() {
    return this.check('changed', true);
  }

  @computed get disabled() {
    return this.check('disabled', true);
  }

  /* ------------------------------------------------------------------ */
  /* EVENTS */

  /**
    On Submit
   */
  onSubmit = (e, o = {}) => {
    e.preventDefault();
    this.submit(o);
  };
}

/**
  Prototypes
*/
export const prototypes = {

  makeField(data) {
    return new Field(data);
  },

  validate(opt = {}, obj = {}) {
    action(() => (this.$validating = true))();
    this.validator.resetGenericError();

    const path = $try(opt.path, opt);
    const field = $try(opt.field, this.select(path, null, null));
    const related = $try(opt.related, obj.related, false);
    const $showErrors = $try(opt.showErrors, obj.showErrors, true);

    this.state.events.set('validate', field ? field.path : true);
    // look running events and choose when show errors messages
    const notShowErrorsEvents = ['clear', 'reset'];
    if (this.state.options.get('showErrorsOnUpdate') === false) notShowErrorsEvents.push('update');
    const showErrors = $showErrors && !this.state.events.running(notShowErrorsEvents);

    // wait all promises then resolve
    const $wait = resolve => Promise.all(this.validator.promises)
      .then(action(() => (this.$validating = false)))
      .then(() => this.state.events.set('validate', false))
      .then(() => resolve(this.isValid));

    if (_.isPlainObject(opt) && !_.isString(path)) {
      // validate all fields
      return new Promise((resolve) => {
        this.validator
          .validateAll({
            form: this,
            showErrors,
            related,
          });

        return $wait(resolve);
      });
    }

    // validate single field by path
    return new Promise((resolve) => {
      this.validator
        .validateField({
          form: this,
          showErrors,
          related,
          field,
          path,
        });

      return $wait(resolve);
    });
  },

  invalidate(message) {
    this.validator.invalidate(message);
  },

  /* ------------------------------------------------------------------ */
  /* ACTIONS */

  /**
   Init Form Fields and Nested Fields
   */
  @action
  init($fields = null) {
    _.set(this, 'fields', observable.map
      ? observable.map({})
      : asMap({}));

    if (!_.has(this, 'isField')) {
      this.state.initial.props.values = $fields; // eslint-disable-line
      this.state.current.props.values = $fields; // eslint-disable-line
    }

    this.initFields({
      fields: $fields || this.state.struct(),
    });
  },

  /**
    Clear Form Fields
  */
  @action clear() {
    this.deepAction('clear');
  },

  /**
    Reset Form Fields
  */
  @action reset() {
    this.deepAction('reset');
  },

  /**
    Submit Form
  */
  @action submit(o = {}) {
    const noop = () => {};
    const onSuccess = o.onSuccess || this.onSuccess || noop;
    const onError = o.onError || this.onError || noop;

    this.validate()
      .then(isValid => isValid
        ? onSuccess.apply(this, [this])
        : onError.apply(this, [this]));
  },

};
