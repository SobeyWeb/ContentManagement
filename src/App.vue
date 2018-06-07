<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
import util from './lib/util.js'
import TYPES from './dicts/mutationTypes.js'
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
    }
  },
  created () {
    this.initNativeEvents()
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
