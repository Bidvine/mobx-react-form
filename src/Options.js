export default class Options {

  options = {
    showErrorsOnInit: false,
    validateOnInit: true,
    validateOnChange: true,
    strictUpdate: false,
    strictDelete: true,
    showErrorsOnUpdate: true,
    alwaysShowDefaultError: false,
    defaultGenericError: null,
    loadingMessage: null,
    allowRequired: false,
    autoParseNumbers: false,
  };

  get(key = null) {
    if (key) return this.options[key];
    return this.options;
  }

  set(options) {
    Object.assign(this.options, options);
  }
}
