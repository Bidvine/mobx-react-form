import _ from 'lodash';

import Bindings from './Bindings';
import Options from './Options';
import utils from './utils';

export default class State {

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

  constructor(form, initial) {
    this.set('form', form);
    this.initOptions(initial);
    this.initProps(initial);
    this.initBindings();
  }

  initOptions(initial = {}) {
    this.options = new Options();
    this.options.set(initial.options);
  }

  initProps(initial) {
    const $props = _.union(utils.iprops, utils.vprops);
    const initialProps = _.pick(initial, $props);

    this.set('initial', 'props', initialProps);

    if (utils.isStruct(initial.fields) || utils.hasSeparatedProps(initial)) {
      this.type = 'separated';
      this.struct(initial.fields);
      return;
    }

    if (!utils.hasUnifiedProps(initial.fields)) {
      this.type = 'unified';
    }
  }

  initBindings() {
    this.bindings = new Bindings();
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
}
