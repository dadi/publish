## Coding guidelines

This is a simple WIP formatting guide, to be build as we go. This is subject to change, and may require some input from the wider team once it's substantial.

#### Function chaining formats

Chaining should only span multiple lines where 3 or more chains occur, or one or more chain should be multiline

```javascript

// Wrong
let chained = new constructor()
  .foo()
  .bar()

// Correct
let chained = new constructor().foo().bar()

// Wrong
let chained = new constructor().foo().bar().baz()

// Correct
let chained = new constructor()
  .foo()
  .bar(baz => {
    // Do something
  })
```


Chaining indentation

```javascript
// Wrong
let chained = new constructor().foo()
                               .bar()
// Wrong
let chained = new constructor().foo()
.bar()

// Correct
let chained = new constructor()
  .foo()
  .bar()
```

#### White-space

Usually, code within a method is divided into three phases:

- Declaration and initialisation of variables
- Main block
- Return

Ideally, we want to separate these three with a blank line. For example:

```js
const foo = 1
const bar = 3

let sum = foo + bar
let prod = foo * bar
let mod = foo % bar
let data = {
  sum,
  prod,
  mod
}

return data
```

#### Constructor props

- No spaces around props
- Space at the end

```html
  // Wrong
  <Field key={ key }/>

  // Wrong
  <Field key={key}/>

  // Correct
  <Field key={key} />

  // Wrong
  <Field/>

  // Correct
  <Field />
```

#### Single and Double quotes

The current logic is simple. We prefer single quotes in JS. In JSX, we use double quotes with static values and single quotes for logic.

```html

// Wrong
<Foo
  name='Bar'
/>

// Correct
<Foo
  name="Bar"
/>

// Wrong
<Foo
  name={ bar ? "Bar": "Baz"}
/>

// Correct
<Foo
  name={ somebarthing ? 'Bar': 'Baz'}
/>

```
