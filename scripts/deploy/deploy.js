const child_process = require('child_process')

// Post install build script

console.log('Post Install starting...')

child_process.exec("npm run build", (error, stdout, stderr) => {
  console.log(`stdout: ${stdout}`)
  console.log(`stderr: ${stderr}`)
  if (error !== null) {
    console.log(`exec error: ${error}`)
  }
})
