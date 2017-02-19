# Styling

- [1. Introduction](#1-introduction)
  - [1.1. Why not CSSinJS?](#11-why-not-cssinjs)
- [2. Core principles](#2-core-principles)
  - [2.1. Target class names](#21-target-class-names)
  - [2.2. Global constants, not styles](#22-global-constants-not-styles)
  - [2.3. Media queries](#23-media-queries)
  - [2.4. Folder structure](#24-folder-structure)
- [3. Using styles](#3-using-styles)
- [4. Other notes](#4-other-notes)

---

## 1. Introduction

In the spirit of keeping our UIs as a set of modular, self-contained components, we use [CSS Modules](https://github.com/css-modules/css-modules) to author style sheets. The core idea is that:

> A CSS Module is a CSS file in which all class names and animation names are scoped locally by default.

Many attempts have been made to circumvent the fact that everything in CSS lives in the global namespace. One of these attempts is the [BEM](http://getbem.com/introduction/) naming convention, which falls short precisely for being just a naming convention — its ability to prevent unwanted side-effects in a style sheet depends exclusively on how rigorously developers adhere to the conventions without ever taking shortcuts and bypassing the norms.

With CSS Modules, this modularity is enforced by a build tool, and it's guaranteed that any class within a CSS file will be unique across the codebase. This is done by dynamically transforming class names into unique strings.

**Button.css**
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

### 1.1. Why not CSSinJS?

An alternative approach, which is particularly popular in the React community, is using [CSSinJS](https://github.com/cssinjs), which describes styles in the component file itself. But this does mean writing CSS declarations as JavaScript objects and stepping away from an established standard, which we want to avoid.

CSS Modules is still just plain CSS.

## 2. Core principles

### 2.1. Target class names

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

### 2.2. Global constants, not styles

To guarantee that components are truly modular and depend exclusively on themselves (and not on the environment in which they're placed), there are **no global styles**. This is achieved by the removal of a global namespace and by targeting elements only by class name, as mentioned in **2.1.**.

However, there are merits to having global variables containing application-wide settings that are relevant to multiple components, holding information like theme colours or typography (e.g. global variables in Sass).

#### 2.2.1. Don't: Composing CSS Modules

In CSS Modules, this can be replicated by using [composable dependencies](https://github.com/css-modules/css-modules#dependencies), which allows a component to import functionality from another.

```css
/* We DON'T want to do this! */
.button {
  composes: primary-colour from "./../general/colours.css";
}
```

This comes with two problems, though:

1. The property used to import functionality (`composes`) isn't standard CSS, but rather a custom property implemented by CSS Modules. The whole idea of using CSS Modules over CSSinJS is to write plain, vanilla CSS — we don't want to lose that;

2. The component will **break** if there isn't a file to import at that path. This compromises the principle of modularity, because suddenly our component depends on an external file being at a specific location for it to work. We lose the flexibility of being able to change its context.

#### 2.2.2. Do: CSS Custom Properties

A better way to do it is to leverage [CSS Custom Properties](https://www.w3.org/TR/css-variables-1/), a standard CSS spec for defining custom properties (or variables) that are interpreted by the browser itself. We can use this to define **global constants**, or variables that hold information that may or may not be relevant to multiple components.

```css
/* Theme.css */
:root {
  --theme-font: "Karla", Helvetica, sans-serif;
  --theme-primary-colour: darksalmon;
}

/* Button.css */
.title {
  font-family: var(--theme-font, Arial);
  color: var(--theme-primary-colour, blue);
}
```

The big benefit of this approach, other than relying on standard CSS only, is that components don't break if variables don't exist. This enforces the [**robustness principle**](https://en.wikipedia.org/wiki/Robustness_principle) by Jon Postel:

> Be conservative in what you do, be liberal in what you accept from others

In other words, components will look for certain variables and use them if they exist, otherwise ignore them. Note that the `var()` keyword should **always contain a fallback** as the second argument, which will be used if the variable isn't defined.

Custom properties should always be defined at the root level. In [supporting browsers](http://caniuse.com/#feat=css-variables), either CSS or JavaScript are able to affect the entire application by changing the value of a property on-the-fly. For older browsers, a static fallback is added as part of the build process.

### 2.3. Media queries

e use [Custom Media Queries](https://www.w3.org/TR/2016/WD-mediaqueries-4-20160126/#custom-mq) to write media queries. The spec, defined in CSS Media Queries Level 4, allows us to store constants with the various breakpoints, similarly to global constants described in **2.2**, and use them to describe the responsive behaviour of components.

Because browsers still haven't implemented the spec, Custom Media Queries are flattened to regular media queries at build time.

**Main.css**

```css
@custom-media --breakpoint-medium (min-width: 600px);
@custom-media --breakpoint-large (min-width: 1000px); 
```

**Button.css**

```css
/* What you write */
@media (--breakpoint-medium) {
  .title {
    color: olive;
  }
}

/* What is rendered */
@media (min-width: 600px) {
  .title {
    color: olive;
  }
}

```

For true modularity, components should define their responsive behaviour based on the conditions of the context they sit in and not the global state. This is the principle behind [element queries](https://tomhodgins.github.io/element-queries-spec/element-queries.html), which we should probably adopt in the future when (if) it becomes a standard.

### 2.4. Folder structure

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
