<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import * as util from './lib/util.js'
import TYPES from './dicts/mutationTypes.js'
import EVENT from './dicts/eventTypes'
import { mapState } from 'vuex'
export default {
  name: 'App',
  computed: {
    ...mapState(['player', 'fullscreenSymbol', 'userInfo'])
  },
  methods: {
    initNativeEvents () {
      window.onerror = (msg, url, line, col, error) => {
        this.$store.state.Errors.push({
          type: 'Script Error',
          msg: msg,
          detail: {
            url,
            line,
            col,
            error
          }
        }) // catch script error

        window.addEventListener('resize', util.throttle(100, (e) => {
          let status = document.isFullScreen ||
            document.webkitIsFullScreen ||
            document.mozIsFullScreen ||
            document.msIsFullScreen
          if (this.fullscreenSymbol && !status) {
            this.player && this.player.exitFullscreen()
          }
          this.$store.state.containerUpdate++
          this.$store.commit({
            type: TYPES.SET_THUMBPADDING
          })
          this.$store.commit({
            type: TYPES.SET_DVPADDING
          })
          // this.resizeTaskMonitor()
        }, true))
      }
    },
    getUserInfo () {
      let userInfo = util.getCookie('userInfo')
      if (userInfo) {
        userInfo = JSON.parse(userInfo)
        this.$store.commit({
          type: TYPES.SET_USERINFO,
          data: userInfo
        })
        // validate then go to index page
        this.$app.emit(EVENT.LOGINED)
      } else {
        this.$router.push('/login')
      }
    },
    initPublicEvents () {
      this.$app.on(EVENT.ADD_TASK, e => {
        let data = e.data
        this.$store.commit({
          type: TYPES.PUSH_EVENT,
          data: data.data || {},
          symbol: data.symbol
        })
      })
      this.$app.on(EVENT.REMOVE_TASK, e => {
        let data = e.data
        this.$store.commit({
          type: TYPES.DELETE_EVENT,
          symbol: data.symbol
        })
      })
    }
  },
  created () {
    this.initNativeEvents()
    this.initPublicEvents()
    this.getUserInfo()
  },
  mounted () {

  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  border: 0;
  outline: 0;
  font-size: 100%;
  vertical-align: inherit;
  list-style: none;
  text-decoration: none;
}
#app {
  position: absolute;
  background: #222;
  left: 0;
  top: 0;
  right: 0;
  height: 100%;
}
</style>
