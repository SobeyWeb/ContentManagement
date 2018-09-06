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
import EVENT from './dicts/eventTypes.js'
import TYPES from './dicts/mutationTypes'
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
new Vue({
  el: '#app',
  store,
  router,
  components: { App },
  template: '<App/>',
  methods: {
    initPlugn() {
      window.$Modal = this.$Modal
      window.$Notification = this.$Notification
      window.$app = this.$app
      window.$app.EVENT = EVENT
      window.$app.userInfo = this.$store.state.userInfo
    },
    initDefaultEvent() {
      this.$app.MATERIAL_DRAGSTART_DEFAULT = this.materialDragStart
      this.$app.on(EVENT.MATERIAL_DRAGSTART, this.materialDragStart)

      this.$app.MATERIAL_CONTEXTMENU_DEFAULT = this.materialContextMenu
      this.$app.on(EVENT.MATERIAL_CONTEXTMENU, this.materialContextMenu)
    },
    materialDragStart(event, material) {
      this.$store.state.previewDragSymbol = true
      material.selected = true
      this.$store.commit({
        type: TYPES.ADD_SELECTEDITEM,
        data: material
      })
      var children = this.$store.getters.displayMaterials
      this.$store.commit({
        type: TYPES.SET_SIGNMATERIAL,
        data: children.indexOf(material)
      })
      var dragEle = this.$el.querySelector('.drag_icon')
      event.dataTransfer.setDragImage(
        dragEle,
        dragEle.clientWidth / 2,
        dragEle.clientHeight / 2
      )
      if (event.ctrlKey) {
        event.dataTransfer.dropEffect = 'copy'
        event.dataTransfer.effectAllowed = 'copy'
      } else {
        event.dataTransfer.dropEffect = 'move'
        event.dataTransfer.effectAllowed = 'move'
      }
    },
    materialContextMenu(event, material) {
      if (!material.selected) {
        this.$store.commit({
          type: TYPES.CLEAR_SELECTEEDITEMS
        })
        material.selected = true
        this.$store.commit({
          type: TYPES.ADD_SELECTEDITEM,
          data: material
        })
        var children = this.$store.getters.displayMaterials
        this.$store.commit({
          type: TYPES.SET_SIGNMATERIAL,
          data: children.indexOf(material)
        })
      }
      this.$store.commit({
        type: TYPES.SET_MENUSTATUS,
        data: {
          event: event,
          status: true
        }
      })
    }
  },
  created() {
    this.initPlugn()
    this.initDefaultEvent()
    this.$app.on(EVENT.LOGINED, e => {
      console.log('logined')
    })
    this.$app.emit(EVENT.CREATED, [this])
  },
  mounted() {
    this.$app.emit(EVENT.MOUNTED, [this])
  }
})
