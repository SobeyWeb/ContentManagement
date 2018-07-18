<template>
  <div class="player" :style="isDvModel&&currentCtrl==='video-ctrl'?{height:dvStyle.height + 110 + 'px', top:dvStyle.padding+'px'}:{}">
    <div class="player_box" ref="playerBox">
      <keep-alive>
        <component :options="options" :height="dvStyle.height" class="player_container" ref="player" @change="sourceChange" :is="currentCtrl" @add="addMarker"></component>
      </keep-alive>
    </div>
    <property-ctrl ref="property" @change="sourceChange" @editing="editingChange" @markerclick="markerclick"></property-ctrl>
  </div>
</template>

<script>
import Video from './Player/Video'
import Picture from './Player/Picture'
import Document from './Player/Document'
import Other from './Player/Other'
import Property from './Property/Index'
export default {
  name: 'player',
  components: {
    'video-ctrl': Video,
    'picture-ctrl': Picture,
    'document-ctrl': Document,
    'property-ctrl': Property,
    'other-ctrl': Other
  },
  data () {
    return {
      curIndex: 0
    }
  },
  mounted () {
    this.initialize()
  },
  computed: {
    isPremiere () {
      return this.$store.state.system
    },
    dvStyle () {
      return this.$store.state.detailviewSymbol ? this.$store.state.dvStyle : {}
    },
    isDvModel: {
      get () {
        return this.$store.state.detailviewSymbol
      },
      set (val) {
        this.$store.state.detailviewSymbol = val
      }
    },
    options () {
      return this.$store.state.previewOptions
    },
    curSource () {
      return this.options.source[this.curIndex] || {}
    },
    currentCtrl () {
      var material = this.options.materials.find(item => item.guid === this.curSource.guid) || this.options.materials[0] || {}
      return material && material.canPreview ? material.previewType + '-ctrl' : 'other-ctrl'
    }
  },
  methods: {
    initialize () {
      window.player = this
    },
    dispose () {
      this.sourceChange(0)
      this.$refs.player.dispose()
    },
    exitFullscreen () {
      this.$refs.player.exitFullscreen()
    },
    sourceChange (index) {
      this.curIndex = index
      this.$nextTick(() => {
        this.$refs.property.changeIndex(index)
        this.$refs.player.changeIndex(index)
      })
    },
    markerclick (marker) {
      this.$refs.player.markerclick(marker)
    },
    addMarker (marker) {
      this.$refs.property.selectHeader('Marks')
    },
    editingChange (status) {
      this.$refs.player.changeEditing(status)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
