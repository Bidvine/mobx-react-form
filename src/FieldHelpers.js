import { action } from 'mobx';
import _ from 'lodash';
import utils from './utils';
import Events from './Events';

/**
  Field Helpers
*/
export default $this => ({

  /**
    Fields Selector (alias of select)
  */
  $: key => $this.select(key),

  /**
    Fields Values (recursive with Nested Fields)
  */
  values: (struct = false) => $this.get('value', struct),

  /**
    Fields Errors (recursive with Nested Fields)
  */
  errors: (struct = false) => $this.get('error', struct),

  /**
    Fields Labels (recursive with Nested Fields)
  */
  labels: (struct = false) => $this.get('label', struct),

  /**
    Fields Default Values (recursive with Nested Fields)
  */
  defaults: (struct = false) => $this.get('default', struct),

  /**
    Fields Initial Values (recursive with Nested Fields)
  */
  initials: (struct = false) => $this.get('initial', struct),

  /**
    Fields Iterator
  */
  map: (key, callback) => {
    const field = $this.$(key);
    return field.fields.values().map(callback);
  },

  /**
    Check Field Computed Values
  */
  check: (computed, deep = false) => {
    utils.allowed('computed', [computed]);

    const $ = {
      hasError: 'some',
      isValid: 'every',
      isDirty: 'some',
      isPristine: 'every',
      isDefault: 'every',
      isEmpty: 'every',
    };

    return deep
      ? utils.check({
        type: $[computed],
        data: $this.deepCheck($[computed], computed, $this.fields),
      }) : $this[computed];
  },

  /**
    Fields Selector
  */
  select: (path, fields = null, isStrict = true) => {
    let $path = path;

    $path = _.replace($path, new RegExp('\\[', 'g'), '.');
    $path = _.replace($path, new RegExp('\\]', 'g'), '');

    const keys = _.split($path, '.');
    const head = _.head(keys);

    keys.shift();

    let $fields = _.isNull(fields)
      ? $this.fields.get(head)
      : fields.get(head);

    let stop = false;
    _.each(keys, ($key) => {
      if (stop) { return; }
      if (_.isUndefined($fields)) {
        $fields = undefined;
        stop = true;
      } else {
        $fields = $fields.fields.get($key);
      }
    });

    if (isStrict) utils.throwError(path, $fields);

    return $fields;
  },

  /**
    Update Field Values recurisvely
    OR Create Field if 'undefined'
  */
  update: (data) => {
    const fields = $this.prepareFieldsData({ fields: data });
    $this.deepUpdate(fields);
  },

  deepUpdate: (fields, path = '') => {
    _.each(fields, (val, key) => {
      const $fullPath = _.trimStart(`${path}.${key}`, '.');
      const $field = $this.select($fullPath, null, false);

      if (!_.isUndefined($field)) {
        if (_.isUndefined(val.fields)) {
          $field.set('value', val);
        } else {
          $this.deepUpdate(val.fields, $fullPath);
        }
      } else {
        const cpath = _.trimEnd(path.replace(new RegExp('/[^./]+$/'), ''), '.');
        const container = $this.select(cpath, null, false);
        if (!_.isUndefined(container)) {
          container.initField(key, $fullPath, val, null, true);
        }
      }
    });
  },

  /**
    Get Fields Props
  */
  get: (prop = null, struct = true) => {
    if (_.isNull(prop)) {
      const all = _.union(utils.computed, utils.props, utils.vprops);
      return $this.deepGet(all, $this.fields);
    }

    utils.allowed('all', _.isArray(prop) ? prop : [prop]);

    if (!struct || !_.isArray(prop)) {
      const data = $this.deepMap(prop, $this.fields);
      return $this.incremental ? _.values(data) : data;
    }

    return $this.deepGet(prop, $this.fields);
  },

  /**
    Set Fields Props
  */
  set: action(($, data = null, recursion = false) => {
    const $e = 'update';

    if (!recursion) {
      Events.setRunning($e, true, $this.path);
    }

    // UPDATE CUSTOM PROP
    if ($this.constructor.name === 'Field') {
      if (_.isString($) && !_.isNull(data)) {
        utils.allowed('props', [$]);
        _.set($this, `$${$}`, data);
        if (!recursion) Events.setRunning($e, false);
        return;
      }

      // update just the value
      // $this.value = $; // eslint-disable-line
      // if (!recursion) Events.setRunning($e, false);
      // return;
    }

    // UPDATE NESTED FIELDS VALUE (recursive)
    if (_.isObject($) && !data) {
      // $ is the data
      $this.deepSet('value', $, '', true);
      if (!recursion) Events.setRunning($e, false);
      return;
    }

    // UPDATE NESTED CUSTOM PROP (recursive)
    if (_.isString($) && _.isObject(data)) {
      utils.allowed('props', [$]);
      // $ is the prop key
      $this.deepSet($, data, '', true);
      if (!recursion) Events.setRunning($e, false);
      return;
    }
  }),

  /**
    Set Fields Props Recursively
  */
  deepSet: ($, data, path = '', recursion = false) => {
    const err = 'You are updating a not existent field:';
    const isStrict = $this.$options.get('strictUpdate');

    _.each(data, ($val, $key) => {
      const $path = _.trimStart(`${path}.${$key}`, '.');
      // get the field by path joining keys recursively
      const field = $this.select($path, null, isStrict);
      // if no field found when is strict update, throw error
      if (isStrict) utils.throwError($path, field, err);
      // update the field/fields if defined
      if (!_.isUndefined(field)) {
        // update field values or others props
        field.set($, $val, recursion);
        // update values recursively only if field has nested
        if (field.fields.size && _.isObject($val)) {
          if (field.fields.size !== 0) {
            $this.deepSet($, $val, $key, recursion);
          }
        }
      }
    });
  },

  /**
    Get Fields Props Recursively
  */
  deepGet: (prop, fields) =>
  _.reduce(fields.values(), (obj, field) => {
    const $nested = $fields => ($fields.size !== 0)
      ? $this.deepGet(prop, $fields)
      : undefined;

    Object.assign(obj, {
      [field.key]: { fields: $nested(field.fields) },
    });

    if (_.isArray(prop)) {
      _.each(prop, $prop =>
        Object.assign(obj[field.key], {
          [$prop]: field[$prop],
        }));
    }

    // if (_.isString(prop)) {
    //   Object.assign(obj[field.key], {
    //     [prop]: field[prop],
    //   });
    // }

    return obj;
  }, {}),

  deepMap: (prop, fields) =>
  _.reduce(fields.values(), (obj, field) => {
    if (field.fields.size === 0) {
      return Object.assign(obj, {
        [field.key]: field[prop],
      });
    }

    const data = $this.deepMap(prop, field.fields);

    return Object.assign(obj, {
      [field.key]: field.incremental ? _.values(data) : data,
    });
  }, {}),

  deepAction: ($action, fields, recursion = false) => {
    if (!recursion) {
      Events.setRunning($action, true, $this.path);
    }

    if (fields.size !== 0) {
      fields.forEach((field) => {
        field[$action]();
        $this.deepAction($action, field.fields, true);
      });
    }

    if (!recursion) {
      Events.setRunning($action, false);
    }
  },

  deepCheck: ($, prop, fields) =>
    _.reduce(fields.values(), (check, field) => {
      if (field.fields.size === 0) {
        check.push(field[prop]);
        return check;
      }
      const $deep = $this.deepCheck($, prop, field.fields);
      check.push(utils.check({ type: $, data: $deep }));
      return check;
    }, []),
});
