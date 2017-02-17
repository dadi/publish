## Build process

### Package

When working with or updating the core repository, npm dev dependencies must be installed. We use webpack to build `bundle.js` which includes all frontend assets, scripts, styles and components. 

#### Why webpack?

Aside from some minor global value manipulation (directory alias etc), we use webpack to reduce http requests. Webapps tend to have a lot modular components in the form of small JS files with style siblings. Async requests are not an option as there's no knowing which will be required on, or shortly after pageload, so we bundle them all together. This also reduces the concurrent request count by association, latency.

#### Building

Run `[sudo] npm run build`. That's it.

#### Watch

If you're working on the app and want webpack to watch and build, just run `[sudo] npm run watch`. Webpack will only build where change occurs, so no more 30 second ~~coffee break~~ compiles. 

### NPM

When using publish as part of your project you shouldn't need to compile, however if you're introducing custom components or themes you will. 

Publish defaults to delivering the `bundle.js` found in the app module, however if you add publish to your package `build` block, you can compile to a directory of choice.

package.json

```json
"start": "NODE_ENV=production node index.js",
"build": "publish -d /workspace/public/custom-bundle.js"
```
index.js (your app)

```js
const Publish = require('@dadi/publish')

module.exports = new Publish({
  bundle: 'workspace/public/custom-bundle.js'
})
```

Alternatively, you can can include this directory in your config.

TO-DO @eduardoboucas 
- How to specify whether to post-process css vars (build -ie)
- Style themes, and how to select and build a style based on config
