## Vanilla Javascript Validation Functions

Support for Vanilla Javascript Validation Functions (**VJF**) is enabled by default.

You can optionally enhance the implementation of them by using chriso's [validator](https://github.com/chriso/validator.js).

### Install `validator`
`validator` it's not included in the package, so you have to install it manually.

```bash
npm install --save validator
```

### Define a plugins object

We use `ValidatorJS` as **DVR** plugin.

```javascript
import validator from 'validator';

const plugins = {
  vjf: validator,
};
```

### Using the `validator` functions

You can now access the `validator` object in your custom function.

```javascript
export function isEmail({ field, validator }) {
  const isValid = validator.isEmail(field.value); // <<---
  return [isValid, `The ${field.label} should be an email address.`];
}
``
