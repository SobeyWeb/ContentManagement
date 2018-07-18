<template>
  <div class="tcw_container">
    <div class="time_code_switcher">
      <span class="tc_item" :class="{tc_active:activeIndex===0}" @mousedown="active(0)">LTC</span>
      <span class="tc_item" :class="{tc_active:activeIndex===1}" @mousedown="active(1)">VITC</span>
      <span class="tc_item" :class="{tc_active:activeIndex===2}" @mousedown="active(2)">FTC</span>
      <span class="tc_item" :class="{tc_active:activeIndex===3}" @mousedown="active(3)">CTL</span>
    </div>
    <div class="time_code_area">
      <time-code class="tc_margin" :option="tc" @change="setTime"></time-code>
    </div>
  </div>
</template>

<script>
import { GetSecondByEachFrame } from '../../../lib/format.js'
import ltcRepository from '../../../data/ltcRepository'
import vitcRepository from '../../../data/vitcRepository'
import * as util from '../../../lib/util.js'
import worker from '../../../worker/player.js'
import TimeCode from './TimeCode'
export default {
  name: 'time_code_window_ctrl',
  template: '#time_code_window_ctrl',
  components: {
    'time-code': TimeCode
  },
  props: {
    option: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      editing: false,
      activeIndex: 3,
      tc: {
        time: 0
      }
    }
  },
  watch: {
    'option.time': function () {
      this.calcTC()
    },
    'option.material.guid': function () {
      this.calcTC()
    },
    'option.material.tcUpdate': function () {
      this.calcTC()
    },
    'activeIndex': function () {
      this.calcTC()
    }
  },
  computed: {
    frameSec () {
      return GetSecondByEachFrame(this.option.videostandard).round(6)
    },
    tcOpt () {
      let id = this.option.material.tcUpdate
      console.log(id) // for Update
      var rep = this.activeIndex === 1 ? vitcRepository : ltcRepository
      return {
        tc: rep[this.option.material.guid],
        activeIndex: this.activeIndex,
        videostandard: this.option.videostandard,
        ntsctcmode: this.option.ntsctcmode,
        framerate: this.option.framerate,
        time: this.option.time,
        vtrin: this.option.vtrin,
        isSkipFrame: this.option.isSkipFrame,
        spaceTime: this.option.spaceTime || 0
      }
    }
  },
  methods: {
    calcTC: util.throttle(16, function () {
      worker.postMessage({
        type: 'calcTC',
        option: this.tcOpt
      })
    }, true),
    setTime (time) {
      switch (this.activeIndex) {
        case 0:
          break
        case 1:
          break
        case 2:
          this.$emit('change', Math.max(Math.min(time - this.option.vtrin, this.option.duration), 0))
          break
        case 3:
          this.$emit('change', time)
          break
        default:
      }
    },
    dispose () {
      this.editing = false
      // ['LTC', 'VITC'].forEach(item => this['pre' + item + 'timecode'] = undefined)
    },
    active (idx) {
      this.activeIndex = idx // 0,1,2,3依次为LTC FTC VITC CTL
    }
  },
  mounted () {
    this.tc = {
      material: this.option.material,
      videostandard: this.option.videostandard,
      ntsctcmode: this.option.ntsctcmode,
      framerate: this.option.framerate,
      time: this.option.time,
      duration: this.option.duration,
      isSkipFrame: this.option.isSkipFrame,
      readonly: true // this.activeIndex < 2
    }
    worker.addEventListener('message', (evt) => {
      if (evt.data.type === 'timecode') {
        var ct = evt.data.value
        this.tc = {
          material: this.option.material,
          videostandard: this.option.videostandard,
          ntsctcmode: this.option.ntsctcmode,
          framerate: this.option.framerate,
          time: ct,
          duration: this.option.duration,
          isSkipFrame: this.option.isSkipFrame,
          readonly: true // this.activeIndex < 2
        }
      }
    }, false)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
