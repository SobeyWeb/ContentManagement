let EventEmitter = require('../lib/EventEmitter.min.js').EventEmitter
console.log(require('../lib/EventEmitter.min.js'))
export default {
  install (Vue, opt) {
    Vue.$app = Vue.prototype.$app = new EventEmitter()
  }
}
