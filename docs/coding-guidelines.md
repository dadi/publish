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

//Correct
let chained = new constructor()
  .foo()
  .bar()
```
