## Enabling JsonSchema Validation Keywords

We are using [AJV](https://github.com/epoberezkin/ajv) to enable JsonSchema Validation Keywords with automatic Error Messages.

### Install AJV
`ajv` it's not included in the package, so you have to install it manually.

```bash
npm install --save ajv
```

### Define a plugins object

We use `ajv` as **JVK** plugin.

```javascript
import ajv from 'ajv';

const plugins = {
  svk: ajv,
};
```

### Create the json schema

```javascript
const schema = {
  type: 'object',
  properties: {
    username: { type: 'string', minLength: 6, maxLength: 20 },
    password: { type: 'string', minLength: 6, maxLength: 20 }
  }
};
```

### Create the form passing all the objects

```javascript
new Form({ fields, plugins, schema });
```
