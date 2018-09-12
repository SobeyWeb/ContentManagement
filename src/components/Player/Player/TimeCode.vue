<template>
  <div class="time_code_container" @mousedown.stop>
    <span tabindex="-1" class="inputclass player_timecode" :class="{ro_inputclass:option.readonly}" ref="hour" @keydown.enter="setTime" @keydown.stop="hKeydown" @mousedown.stop="mousedown" @blur="blur" @focus="focus">{{!editing?displayHour:displayH}}</span>
    <span tabindex="-1" class="point_flag player_timecode">:</span>
    <span tabindex="-1" class="inputclass player_timecode" :class="{ro_inputclass:option.readonly}" ref="minute" @keydown="mKeydown" @keydown.stop.enter="setTime" @mousedown.stop="mousedown" @blur="blur" @focus="focus">{{!editing?displayMinute:displayM}}</span>
    <span tabindex="-1" class="point_flag player_timecode">{{option.isSkipFrame?'.':':'}}</span>
    <span tabindex="-1" class="inputclass player_timecode" :class="{ro_inputclass:option.readonly}" ref="second" @keydown="sKeydown" @keydown.stop.enter="setTime" @mousedown.stop="mousedown" @blur="blur" @focus="focus">{{!editing?displaySecond:displayS}}</span>
    <span tabindex="-1" class="point_flag player_timecode">:</span>
    <span tabindex="-1" class="inputclass player_timecode" :class="{ro_inputclass:option.readonly}" ref="frame" @keydown="fKeydown" @keydown.stop.enter="setTime" @mousedown.stop="mousedown" @blur="blur" @focus="focus">{{!editing?displayFrame:displayF}}</span>
  </div>
</template>

<script>
import { GetFrameNumByHundredNS, GetSecondByEachFrame, GetTimeStringByFrameNum, GetMillSecondsByFrameNum, GetFrameNumByTimeString } from '../../../lib/format.js'
export default {
  name: 'time_code_ctrl',
  props: {
    option: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      hour: {
        value: '',
        index: 0
      },
      minute: {
        value: '',
        index: 0
      },
      second: {
        value: '',
        index: 0
      },
      frame: {
        value: '',
        index: 0
      },
      editing: false
    }
  },
  computed: {
    displayH () {
      return this.hour.value.fixZero()
    },
    displayM () {
      return this.minute.value.fixZero()
    },
    displayS () {
      return this.second.value.fixZero()
    },
    displayF () {
      return this.frame.value.fixZero()
    },
    displayHour () {
      var hours = this.timeArr[0]
      if (parseInt(hours) > 23) {
        return (parseInt(hours) % 24).fixZero()
      }
      return hours
    },
    displayMinute () {
      if (this.timeArr.length > 3) {
        return this.timeArr[1]
      } else {
        return this.timeArr[1].split('.').shift()
      }
      //  return Math.floor(this.option.time % 3600 / 60).fixZero()
    },
    displaySecond () {
      if (this.timeArr.length > 3) {
        return this.timeArr[2]
      } else {
        return this.timeArr[1].split('.').pop()
      }
    },
    displayFrame () {
      return this.timeArr[this.timeArr.length - 1]
    },
    timeArr () {
      var frameNum = GetFrameNumByHundredNS(Math.round(this.option.time * 10000000), this.option.videostandard, this.option.ntsctcmode)
      return this.option.time.indexOf ? this.option.time.split(':') : GetTimeStringByFrameNum(frameNum, this.option.ntsctcmode, this.option.videostandard).split(':')
    },
    frameSec () {
      return GetSecondByEachFrame(this.option.videostandard).round(6)
    }
  },
  methods: {
    blur () {
      this.editing = false
    },
    focus () {
      this.editing = !this.option.readonly
    },
    hKeydown (event) {
      var code = String.fromCharCode(event.keyCode >= 96 ? event.keyCode - 48 : event.keyCode)
      if (this.hour.index === 1) {
        this.hour.value += code
        this.hour.index = 0
        event.target.blur()
        this.$refs.minute.focus()
      } else if (this.hour.index === 0) {
        this.hour.value = code
        this.hour.index++
      } else {
      }
    },
    mKeydown (event) {
      var code = String.fromCharCode(event.keyCode >= 96 ? event.keyCode - 48 : event.keyCode)
      if (this.minute.index === 1) {
        this.minute.value += code
        this.minute.index = 0
        event.target.blur()
        this.$refs.second.focus()
      } else if (this.minute.index === 0) {
        this.minute.value = code
        this.minute.index++
      } else {
      }
    },
    sKeydown (event) {
      var code = String.fromCharCode(event.keyCode >= 96 ? event.keyCode - 48 : event.keyCode)
      if (this.second.index === 1) {
        this.second.value += code
        this.second.index = 0
        event.target.blur()
        this.$refs.frame.focus()
      } else if (this.second.index === 0) {
        this.second.value = code
        this.second.index++
      } else {
      }
    },
    fKeydown (event) {
      var code = String.fromCharCode(event.keyCode >= 96 ? event.keyCode - 48 : event.keyCode)
      if (this.frame.index === 1) {
        this.frame.value += code
        this.frame.index = 0
        event.target.blur()
        this.$refs.hour.focus()
      } else if (this.frame.index === 0) {
        this.frame.value = code
        this.frame.index++
      } else {

      }
    },
    setTime () {
      if (this.option.isSkipFrame && ['00', '0'].indexOf(this.minute.value) === -1 && this.minute.value % 10 !== 0 && !parseInt(this.second.value) && [0, 1].indexOf(parseInt(this.frame.value)) > -1) {
        this.frame.value = '02'
      }
      var timeStr = this.displayH + ':' + this.displayM + (this.option.isSkipFrame ? '.' : ':') + this.displayS + ':' + this.displayF
      var frames = GetFrameNumByTimeString(timeStr, this.option.ntsctcmode, this.option.videostandard, this.option.framerate)
      var time = GetMillSecondsByFrameNum(frames, this.option.videostandard)
      if (time <= this.option.duration && time >= 0) {
        this.$emit('change', time)
        this.editing = false
      } else {
        this.dispose()
      }
    },
    mousedown (event) {
      if (this.option.readonly) {
        return
      }
      if (!this.editing) {
        this.dispose()
      }
      this.hour.value = this.hour.value || this.displayHour
      this.minute.value = this.minute.value || this.displayMinute
      this.second.value = this.second.value || this.displaySecond
      this.frame.value = this.frame.value || this.displayFrame
      event.target.focus()
      this.editing = true
    },
    dispose () {
      this.editing = false
      for (var key in this.$refs) {
        this.$refs[key] && this.$refs[key].blur && this.$refs[key].blur()
      }
      this.hour.index = this.minute.index = this.second.index = this.frame.index = 0
      this.hour.value = this.minute.value = this.second.value = this.frame.value = ''
    }
  },
  mounted () {
    window.addEventListener('mousedown', this.dispose, false)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
