# FORM

## Form Constructor

**Usage:** `new Form({ fields, schema, options, extend });`

|   |   |
|---|---|
| **fields**    | Object which represents the fields: name, label, value. |
| **schema**    | The json-schema for the validation. See [json-schema.org](http://json-schema.org) |
| **options**   | The additional options for ajv. See [github.com/epoberezkin/ajv#options](https://github.com/epoberezkin/ajv#options) |
| **extend**    | Add custom validation keyword for using in the json-schema |

## Form API

| Property | Type | MobX Type | Info |
|---|---|---|---|
| **isValid** | boolean | computed | Check if the form is valid. |
| **isDirty** | boolean | computed | Check if the form is dirty. |
| **validating** | boolean | observable | Check if the form is in validation state. |
| **genericErrorMessage** | string | observable | Generic error message (not related to fields). |


| Method | Input | Output | Info |
|---|---|---|---|
| **syncValue()** | - | - | Synchronizes the value of the field `onChange` event. You must define the name of the field to use this method. |
| **isValid()** | - | boolean | Check if the form is valid. |
| **isDirty()** | - | boolean  | Check if the form is dirty. |
| **fieldKeys()** | - | array | Get an array with all fields keys/names. |
| **update(obj)** | object | - | Pass an object to update the form with new values. |
| **values()** | - | object | Get an object with all fields values. |
| **clear()** | - | - | Clear the form to empty values. |
| **reset()** | - | - | Reset the form to initials values. |
| **validate()** | - | boolean | Check if the form is valid. |
| **invalidate(err)** | string | - | Invalidate the form passing a generic error message. |

## Fields API

| Property | Type | MobX Type | Info |
|---|---|---|---|
| **isValid** | boolean | computed | Check if the form is valid. |
| **isDirty** | boolean | computed | Check if the form is dirty. |
| **key** | string | - | Field key (set on form constructor) |
| **name** | string | - | Field name or key (set on form constructor) |
| **label** | string | - | Field label name (set on form constructor) |
| **value** | string, array, object, boolean | computed | Computed value of the field. |
| **disabled** | boolean | - | The disabled state of the field. |
| **errorMessage** | string | observable | Field error message. |


| Property | Input | Output | Info |
|---|---|---|---|
| **isValid()** | - | boolean | Check if the field is valid. |
| **isDirty()** | - | boolean | Check if the field is dirty. |
| **getValue()** | - | string, array, object | Get the field value. |
| **setValue(val)** | string, array, object | - | Set the field value to the given value. |
| **update(val)** | - | string, array, object | Alias of setValue(). |
| **clear()** | - | - | Clear the field to empty value. |
| **reset()** | - | - | Reset the field to initial value. |
| **setValid()** | - | - | Set the field as valid. |
| **setInvalid(showErrors = true)** | boolean | - | Set the field as invalid. If true is passed, no errors are shown. |

---

# Custom Validation Keywords (extend AJV)

```javascript
// define an 'extend' object with the custom keyword

const extend = {
  range: {
    type: 'number',
    compile: (sch, parentSchema) => {
      const min = sch[0];
      const max = sch[1];

      return parentSchema.exclusiveRange === true
              ? (data) => (data > min && data < max)
              : (data) => (data >= min && data <= max);
    },
  },
};

// then use it the schema

var schema = {
  type: 'object',
  properties: {
    fieldname: {
      "range": [2, 4],
      "exclusiveRange": true,
    },
  },
};

// pass all to the form constructor

new Form({ fields, schema, extend });

```

---

# Custom Validation Functions (without AJV)

```javascript
// define custom functions,
// they must return an array with: [boolean, string];

function shouldBeEqualTo($target) {
  const target = $target;
  return (field, fields) => {
    const current = field.label || field.name;
    const fieldsAreEquals = (fields[target].getValue() === field.getValue());
    return [fieldsAreEquals, `The ${current} should be equals to ${target}`];
  };
}

function isEmail(field) {
  const current = field.label || field.name;
  const isValid = (field.value.indexOf('@') > 0);
  return [isValid, `The ${current} should be an email address.`];
}

// pass them to the field's `validate` property
// as function or as an array of functions
// and set `related` fields to be validated at the same time

const fields = {
  username: {
    label: 'Username',
    value: 's.jobs@apple.com',
    validate: [isEmail, shouldBeEqualTo('email')],
    related: ['email'],
  },
  email: {
    label: 'Email',
    value: 's.jobs@apple.com',
    validate: isEmail,
    related: ['username'],
  },
  ...
};
```

---

## Remove AJV Warnings

Add this line to your webpack config in the `plugins` array:

```javascript
new webpack.IgnorePlugin(/regenerator|nodent|js\-beautify/, /ajv/)
```
