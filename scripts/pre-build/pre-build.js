const child_process = require('child_process')

/*
This is temporary - remove once https://github.com/developit/preact-router/pull/223 is merged
 */

console.log('Copying rollup files...')

child_process.exec("cp scripts/deploy/rollup.config.js node_modules/preact-router/ && npm explore preact-router -- npm install && npm explore preact-router -- npm run build", (error, stdout, stderr) => {
  console.log(`stdout: ${stdout}`)
  console.log(`stderr: ${stderr}`)
  if (error !== null) {
    console.log(`exec error: ${error}`)
  }
})