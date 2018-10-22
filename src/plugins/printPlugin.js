export default {
  install: function(Vue) {
    Vue.prototype.$print = Vue.print = function(template, replacements) {
      let frame = document.getElementById('printer')
      let templateUrl = './print/' + template + '.html?t=' + new Date().getTime()
      frame.onload = () => {
        let content = frame.contentDocument.documentElement.innerHTML
        for (var key in replacements) {
          var regularExpression = new RegExp('{{' + key + '}}', 'gi')
          content = content.replace(regularExpression, replacements[key])
        }
        frame.contentDocument.documentElement.innerHTML = content
        frame.contentWindow.print()
        frame.onload = null
      }
      frame.src = templateUrl
    }
    Vue.prototype.$open = Vue.open = function(template, replacements) {
      let templateUrl = './print/' + template + '.html?t=' + new Date().getTime()
      let debugWindow = window.open(templateUrl)
      debugWindow.onload = () => {
        let content = debugWindow.document.documentElement.innerHTML
        for (var key in replacements) {
          var regularExpression = new RegExp('{{' + key + '}}', 'gi')
          content = content.replace(regularExpression, replacements[key])
        }
        debugWindow.document.documentElement.innerHTML = content
      }
    }
  }
}
