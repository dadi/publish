### router ([dadi/frontend/lib/router.js](https://github.com/dadi/publish/blob/master/dadi/frontend/lib/router.js))

Call basic routes as before, as well as update or override url parameters.

```javascript
// Defaults
router({path=window.location.pathname, params=null, update=false})
```

```javascript

// Basic route change
router({path: '/'})

// Change parameters
// Note that path will default to `window.location.pathname`
router({params: {foo: "bar"}})

// Append existing parameters with `Object.assign`
router({params: {foo: "bar", update: true}})

// Clear all parameters in the current route (not that useful)
router()
The other minor change is that now state.router has an extra parameter, params. This stores an Object of the query parameters:

{
  foo: "bar",
  filters: {
    email: "publish_wizard@dadi.co"
  }
}
```
