const child_process = require('child_process')

console.log('POST INSTALL')

child_process.exec("npm run build", (error, stdout, stderr) => {
  console.log(`stdout: ${stdout}`)
  console.log(`stderr: ${stderr}`)
  if (error !== null) {
    console.log(`exec error: ${error}`)
  }
})
