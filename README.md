# [Mobx](https://www.npmjs.com/package/mobx)-Form

Simple helper for state management

TODO:

- Add examples
- Add unit tests
- Add better documentation

## Example:

```javascript
const model = this.model = createModel({
  email: '', // initial value for email
  password: '', // initial value for password
}, {
  // validator for email
  email: {
    interactive: false,
    // validator function
    fn(field) {
      const email = trim(field.value);
      // super simple and naive email validation
      if (!email || !(email.indexOf('@') > 0)) {
        return Promise.reject({
          error: 'Please provide an error message'
        });
      }
    },
  },
  // validator for password
  password: {
    interactive: false,
    // validator function
    fn(field) {
      if (!trim(field.value)) {
        return Promise.reject({
          error: 'Please provide your password'
        });
      }
    },
  },
});
```