# Observe Fields Props

* [Observe with `observe()` Method](#observe-with-observe-method)
* [Observe with `observers` Object](#observe-with-observers-object)
* [Disposers](#disposers)

---

## Observe with `observe()` Method

If you need to observe **on the fly** the **Field Props** or the **Fields Map** you can use the `observe()` method on the form instance:

```javascript
form.observe({
  path: 'password'
  key: 'value', // can be any field property
  call: ({ form, field, change }) => { ... },
});
```

> Specify the Field `path`, the prop `key` to observe and the function (`call`) to fire when the event occur.

> Specify `fields` as `key` and the nested fields map will be observed (add/del).

The `call` function will receive the `Form` instance, the `Field` instance and the **mobx event object** (`change`).

> For more info on the mobx `change` event object take a look at the mobx [Event Overview Table](http://mobxjs.github.io/mobx/refguide/observe.html) for the `observe` method.

Eventually you can use `observe()` also on a selected Field:

```javascript
form.$('password').observe({
  key: 'value', // can be any field property
  call: ({ form, field, change }) => { ... },
});
```

> The `path` is omitted. It's defined by the selector.

> Specify `fields` as `key` and the nested fields map will be observed (add/del).

## Observe with `observers` Object

This method is useful if you need to handle nested fields. The observers will be automatically loaded when add/del fields dynamically.

The difference from using the `observe()` method is that you can specify an array with one or more observers objects for each field.

Define an `observers` object like this:

```javascript
const observers = {
  'club': [{
    key: 'focus', // can be any field property
    call: data => console.log('CHANGED', data),
  }],
  'members[].hobbies[]': [{
    key: 'touched', // can be any field property
    call: data => console.log('CHANGED', data),
  }],
};
```

then add it to the object in the first argument of the form constructor.

## Disposers

Each observer will automatically create its own `disposer` which will stop the related observable events.

You can use `dispose(key, path)` on the **Form** instance:

```javascript
form.dispose('value', 'password');
```

or providing only the key when selecting the Field:

```javascript
form.$('password').dispose('value');
```

> Nested fields paths can be used as well.


