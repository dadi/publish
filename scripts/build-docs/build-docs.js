const fs = require('fs')
const generateMarkdown = require('./generateMarkdown')
const mkdirp = require('mkdirp')
const path = require('path')

// Create directory
const outputPath = process.argv[2] || __dirname

mkdirp(outputPath, err => {
  if (err) {
    return console.log('ERROR! Couldn\'t create output path.')
  }

  readInput(outputPath)
})

function readInput(outputPath) {
  let json = ''

  process.stdin.setEncoding('utf8')
  process.stdin.on('readable', () => {
    const chunk = process.stdin.read()

    if (chunk !== null) {
      json += chunk
    }
  })

  process.stdin.on('end', function() {
    buildDocs(JSON.parse(json), outputPath)
  })  
}

function buildDocs(api, outputPath) {
  // api is an object keyed by filepath. We use the file name as component name.
  for (var filepath in api) {
    const name = getComponentName(filepath)
    const markdown = generateMarkdown(name, api[filepath])
    const filePath = path.resolve(outputPath, `${name}.md`)

    fs.writeFileSync(filePath, markdown)
    process.stdout.write(filepath + ' -> ' + name + '.md\n')
  }
}

function getComponentName(filepath) {
  let name = path.basename(filepath)
  let ext

  while ((ext = path.extname(name))) {
    name = name.substring(0, name.length - ext.length)
  }

  return name
}
