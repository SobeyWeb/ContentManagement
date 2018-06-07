let EventEmitter = require('../lib/EventEmitter.js').EventEmitter
export default {
  install (Vue, opt) {
    Vue.$app = Vue.prototype.$app = new EventEmitter()
    Vue.$keydown = Vue.prototype.$keydown = new EventEmitter()
    Vue.$keyup = Vue.prototype.$keyup = new EventEmitter()

    Vue.$registerKeydown = Vue.prototype.$registerKeydown = (code, func) => {
      Vue.prototype.$keydown.on('keydown-' + code, func)
    }
    Vue.$registerKeyup = Vue.prototype.$registerKeyup = (code, func) => {
      Vue.prototype.$keyup.on('keyup-' + code, func)
    }

    Vue.$unregisterKeydown = Vue.prototype.$unregisterKeydown = (
      code,
      func
    ) => {
      Vue.prototype.$keyup.off('keydown-' + code, func)
    }
    Vue.$unregisterKeyup = Vue.prototype.$unregisterKeyup = (code, func) => {
      Vue.prototype.$keyup.off('keyup-' + code, func)
    }
  }
}
