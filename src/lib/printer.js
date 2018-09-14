let printer = {
  print (template, replacements, isDebug) {
    let frame = document.getElementById('printer')
    let templateUrl = './print-template/' + template + '.html?slug=' + new Date().getTime()
    if (isDebug) {
      let debugWindow = window.open(templateUrl)
      debugWindow.addEventListener('load', () => {
        let content = this.replaceContent(debugWindow.document.documentElement.innerHTML, replacements)
        debugWindow.document.documentElement.innerHTML = content
      }, false)
    } else {
      frame.addEventListener('load', () => {
        let content = this.replaceContent(frame.contentDocument.documentElement.innerHTML, replacements)
        frame.contentDocument.documentElement.innerHTML = content
        frame.contentWindow.print()
        frame.removeEventListener('load', arguments.call, false)
      }, false)
      frame.src = templateUrl
    }
  },
  replaceContent (raw, replacements) {
    for (var key in replacements) {
      var regularExpression = new RegExp('{{' + key + '}}', 'gi')
      raw = raw.replace(regularExpression, replacements[key])
    }
    return raw
  }
}

export default printer
