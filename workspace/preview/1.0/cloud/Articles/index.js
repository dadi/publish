window.registerPreviewTemplate('1.0/cloud/Articles', document => {
  if(document.remote)
    return `<html><body>preview:<h1>${document.remote.title}</h1>${document.remote.body}</body></html>`
  else
    return `<html><body><h1>Document has no body</h1></body></html>`
})