import _ from 'lodash';
import { toJS } from 'mobx';
import utils from '../utils';

/**
  Vanilla JavaScript Functions
*/
export default class VJF {

  enabled = true;

  options = {};

  constructor(enabled, { promises = [], options = {} }) {
    this.enabled = enabled;
    this.promises = promises;
    this.options = options;
  }

  validateField(field, fields) {
    // exit if field does not have validation functions
    if (!field.validate) return;

    // get validators from validate property
    const $fn = toJS(field.validate);

    // map only if is an array of validator functions
    if (_.isArray($fn)) {
      $fn.map((fn) => this.collectData(fn, field, fields));
    }

    // it's just one function
    if (_.isFunction($fn)) {
      this.collectData($fn, field, fields);
    }

    // execute the function validation
    this.executeValidation(field);
  }

  collectData($fn, field, fields) {
    const res = this.handleFunctionResult($fn, field, fields);

    // check and execute only if is a promise
    if (utils.isPromise(res)) {
      if (!field.hasError) field.setInvalid(this.loadingMessage(), true);

      const $p = res
        .then(($res) => field.setValidationAsyncData({
          valid: $res[0],
          message: $res[1],
        }))
        .then(() => this.executeAsyncValidation(field))
        .then(() => field.showAsyncErrors());

      // push the promise into array
      this.promises.push($p);
      return;
    }

    // is a plain function
    field.validationFunctionsData.unshift({
      valid: res[0],
      message: res[1],
    });
  }

  executeValidation(field) {
    // otherwise find an error message to show
    field.validationFunctionsData
      .map((rule) => (rule.valid === false)
        && field.setInvalid(rule.message));
  }

  executeAsyncValidation(field) {
    if (field.validationAsyncData.valid === false) {
      field.setInvalid(field.validationAsyncData.message, true);
    }
  }

  handleFunctionResult($fn, field, fields) {
    // executre validation function
    const res = $fn({ field, fields });

    /**
      Handle "array"
    */
    if (_.isArray(res)) {
      const isValid = res[0] || false;
      const message = res[1] || 'Error';
      return [isValid, message];
    }

    /**
      Handle "boolean"
    */
    if (_.isBoolean(res)) {
      return [res, 'Error'];
    }

    /**
      Handle "string"
    */
    if (_.isString(res)) {
      return [false, res];
    }

    /**
      Handle "object / promise"
    */
    if (utils.isPromise(res)) {
      return res; // the promise
    }

    /**
      Handle other cases
    */
    return [false, 'Error'];
  }

  loadingMessage() {
    return this.options.loadingMessage || 'validating...';
  }
}
