// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

import store from './store'

import vuexI18n from 'vuex-i18n'
import translationsEn from './dicts/translationsEn.js'
import hotkeys from 'hotkeys-js'
import eventPlugin from './plugins/eventPlugin.js'
import EVENT from './dicts/EventTypes.js'
import './lib/prototype.js'

import './assets/css/rest.css'
import './assets/css/radon-ui.css'
import './assets/css/main.css'
import './assets/css/animate.css'

import ScrollBar from './lib/scrollbar.js'
const RadonUI = require('./lib/radon-ui.js')['radon-ui']

Vue.use(Vue => {
  for (let key in RadonUI) {
    if (key.startsWith('rd')) {
      Vue.component(key, RadonUI[key])
    }
  }
})
Vue.prototype.$hotkeys = hotkeys
Vue.use(eventPlugin)
Vue.use(RadonUI.RadonInstall, {
  Modal: true,
  Notification: true,
  LoadingBar: true,
  Preview: true
})
Vue.component('vue-nice-scrollbar', ScrollBar)
Vue.component('loading-ctrl', {
  template: `<div class="loading_container" @contextmenu.stop.prevent @keydown.stop.prevent @keyup.stop.prevent @mousedown.stop.prevent  @mouseup.stop.prevent tabindex="-1">
    <div class="loading_spinner" :class="customClass" style="width: 60px; height: 60px;"></div>
    <div class="loading_name" style="margin-top:10px;font-size: 15px;font-weight: bold;">{{name}}</div>
    </div>`,
  props: {
    name: String,
    customClass: String
  }
})

Vue.use(vuexI18n.plugin, store, {
  moduleName: 'i18n',
  onTranslationNotFound(locale, key) {
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
  inserted: function(el) {
    el.value = el.getAttribute('val')
    el.focus()
    el.select()
  }
})

Vue.directive('dispose', {
  unbind: function(el) {
    el.src = 'http://'
  }
})
Vue.config.productionTip = false

/* eslint-disable no-new */
window.CM = new Vue({
  el: '#app',
  store,
  router,
  components: { App },
  template: '<App/>',
  created() {
    this.$app.emit(EVENT.CREATED, [this])
  },
  mounted() {
    this.$app.emit(EVENT.MOUNTED, [this])
  }
})
