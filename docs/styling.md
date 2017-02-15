# Styling

## 1. Introduction

In the spirit of keeping our UIs as a set of modular, self-contained components, we use [CSS Modules](https://github.com/css-modules/css-modules) to author style sheets. The core idea is that:

> A CSS Module is a CSS file in which all class names and animation names are scoped locally by default.

Many attempts have been made to circumvent the fact that everything in CSS lives in the global namespace. One of these attempts is the [BEM](http://getbem.com/introduction/) naming convention, which falls short precisely for being just a naming convention — its ability to prevent unwanted side-effects in a style sheet depends exclusively on how rigorously developers adhere to the conventions without ever taking shortcuts and bypassing the norms.

With CSS Modules, this modularity is enforced by a build tool, and it's guaranteed that any class within a CSS file will be unique across the codebase. This is done by dynamically transforming class names into unique strings.

*Example (Button.css):*
```css
/* This is what you write */
.title {
  color: tomato;
}

/* This is what gets rendered */
.Button__title___17WL8 {
  color: tomato;
}
```
## 2. Writing styles

To guarantee that components are truly modular and depend exclusively on themselves (and not on the environment in which they're placed), there are **no global styles**.

### 2.1. Folder structure

Each component is styled using a single CSS file placed in the same directory as the JSX file that describes it.

*Example:*
```
components 
│
└───Button
|    └───Button.css
|    └───Button.jsx
└───Nav
    └───Nav.css
    └───Nav.jsx    
```

### 2.2. Use classes

To make sure styling is independent of the type of node being used and of any DOM structure, you should only **target elements by class name**.

```css
/* Good */
.title {
  color: tomato;
}

/* Bad */
div {
  color: tomato;
}


/* Bad */
header .title {
  color: tomato;
}
```

Remember that the scope of the styles you write is limited to the CSS Module file, so you don't need to worry about global namespacing when naming your classes (i.e. don't use a BEM-like syntax).

```css
/* Good */
.title {
  color: tomato;
}

/* Bad */
.Button__title {
  color: tomato;
}
```

## 3. Using styles

To apply styles to your component, you first need to import the style sheet into your component's file. Each class is added as a property to the object being imported, which can be used to establish the connection between the DOM elements and their styling classes.
**Button.jsx**
```js
import styles from './Button'

class Button extends Component {
  render () {
    <button className={styles.title}>Click me</button>
  }
}
```

## 4. Other notes

Webpack can make the CSS part of the bundle, but we choose to keep it in a separate CSS file (`public/main.css`). This keeps the size of the bundle under control and ensures that the delivery of assets to the client can be made efficiently, as browsers are capable of downloading the bundle and the styles in parallel.
