'use strict'

const archy = require('archy')
const fs = require('fs')
const path = require('path')

const OUTPUT_PATH  = process.argv[2] || __dirname

function readInput (callback) {
  let json = ''

  process.stdin.setEncoding('utf8')
  process.stdin.on('readable', () => {
    const chunk = process.stdin.read()

    if (chunk !== null) {
      json += chunk
    }
  })

  process.stdin.on('end', () => {
    callback(JSON.parse(json))
  })
}

function transformNode (node) {
  const nodeName = Object.keys(node)[0]

  if (node[nodeName].length === 0) {
    return transformNodename(nodeName)
  }

  const nodes = node[nodeName].map(childNode => {
    return transformNode(childNode)
  })

  return {
    label: transformNodename(nodeName),
    nodes
  }
}

function transformNodename (nodeName) {
  const extension = path.extname(nodeName)
  const componentName = path.basename(nodeName, extension)
  const directories = path.dirname(nodeName).split(path.sep)
  const componentType = directories[directories.length - 2]

  //return `${componentName} (${componentType})`
  return componentName
}

readInput(dependencyTree => {
  const tree = archy(transformNode(dependencyTree))

  fs.writeFileSync(OUTPUT_PATH, tree)
})
