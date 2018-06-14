// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

import Vuex from 'vuex'
import state from './store/state.js'
import getters from './store/getters.js'
import mutations from './store/mutations.js'
import actions from './store/actions.js'

import vuexI18n from 'vuex-i18n'
import translationsEn from './dicts/translationsEn.js'

import eventPlugin from './plugins/eventPlugin.js'
import EVENT from './dicts/EventTypes.js'
import './lib/prototype.js'

Vue.use(Vuex)
Vue.use(eventPlugin)

let store = new Vuex.Store({
  state,
  getters,
  mutations,
  actions
})
Vue.use(vuexI18n.plugin, store, {
  moduleName: 'i18n',
  onTranslationNotFound (locale, key) {
    console.warn(`i18n :: Key '${key}' not found for locale '${locale}'`) // async translate support
  }
})
Vue.i18n.add('en', translationsEn)
Vue.i18n.set('en')

Vue.config.keyCodes = {
  num: [
    48,
    49,
    50,
    51,
    52,
    53,
    54,
    55,
    56,
    57,
    96,
    97,
    98,
    99,
    100,
    101,
    102,
    103,
    104,
    105
  ]
}

Vue.directive('focus', {
  inserted: function (el) {
    el.value = el.getAttribute('val')
    el.focus()
    el.select()
  }
})

Vue.directive('dispose', {
  unbind: function (el) {
    el.src = 'http://'
  }
})
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  components: { App },
  template: '<App/>',
  created () {
    this.$app.emit(EVENT.CREATED, [this])
  },
  mounted () {
    this.$app.emit(EVENT.MOUNTED, [this])
  }
})
