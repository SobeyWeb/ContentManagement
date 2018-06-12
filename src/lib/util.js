export default {
  getUrl (url, para, ifNotEnc) {
    if (para) {
      var q = ''
      if (url.indexOf('?') >= 0) {
        q = '&'
      } else {
        q = '?'
      }

      for (var k in para) {
        if (typeof para[k] === 'undefined') {
          continue
        }
        if (q.length > 1) {
          q += '&'
        }
        if (ifNotEnc) {
          q = q + k + '=' + para[k]
        } else {
          q = q + k + '=' + encodeURIComponent(para[k])
        }
      }

      url = url + q
    }
    return url
  },
  getValue () {
    let val
    for (let i = 0, l = arguments.length; i < l; i++) {
      if (arguments[i] !== undefined) {
        val = arguments[i]
        break
      }
    }
    return val
  }
}
