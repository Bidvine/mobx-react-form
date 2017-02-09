import { observe } from 'mobx';
import _ from 'lodash';

import Bindings from './Bindings';
import Options from './Options';
import utils from './utils';

export default class State {

  strict = false;

  form;

  type;

  options;

  bindings;

  $struct = [];

  initial = {
    props: {},
    fields: {},
  };

  current = {
    props: {},
    fields: {},
  };

  constructor({ form, initial, options, bindings }) {
    this.set('form', form);
    this.initProps(initial);
    this.initOptions(options);
    this.initBindings(bindings);
    this.observeOptions(bindings);
  }

  initOptions(options) {
    this.options = new Options();
    this.options.set(options);
  }

  initProps(initial) {
    const $props = [...utils.iprops, ...utils.vprops];
    const initialProps = _.pick(initial, $props);

    this.set('initial', 'props', initialProps);

    if (utils.isStruct(initial.fields) || utils.hasSeparatedProps(initial)) {
      this.strict = true;
      this.type = 'separated';
      this.struct(initial.fields);
      return;
    }

    if (utils.hasUnifiedProps(initial.fields)) {
      this.type = 'unified';
    }
  }

  initBindings(bindings) {
    this.bindings = new Bindings();
    this.bindings.register(bindings);
  }

  /**
    Get/Set Fields Structure
  */
  struct(data = null) {
    if (data) this.$struct = data;
    return this.$struct;
  }

  /**
    Get Props/Fields
  */
  get(type, subtype) {
    return this[type][subtype];
  }

  /**
    Set Props/Fields
  */
  set(type, subtype, state = null) {
    if (type === 'form') {
      // subtype is the form here
      this.form = subtype;
    }

    if (type === 'initial') {
      Object.assign(this.initial[subtype], state);
      Object.assign(this.current[subtype], state);
    }

    if (type === 'current') {
      Object.assign(this.current[subtype], state);
    }
  }

  observeOptions() {
    // Fix Issue #201
    observe(this.options.options, utils.checkObserve([{
      // start observing fields
      key: 'validateOnChange',
      to: true,
      type: 'update',
      exec: () => this.form.forEach(field => field.observe()),
    }, {
      // stop observing fields
      key: 'validateOnChange',
      to: false,
      type: 'update',
      exec: () => this.form.forEach(field => field.dispose()),
    }]));
  }
}
