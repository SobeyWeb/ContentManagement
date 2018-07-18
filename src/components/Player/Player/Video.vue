<template>
  <div>
    <div class="player-top">
      <div class="title_container fl">
        <span class="dv_icon" :class="{dv_in_icon: isDvModel}" v-show="(curMaterial.father&&curMaterial.father.guid||isPremiere) &&!fullscreenSymbol" title="Detail View" @click="isDvModel=!isDvModel"></span>
        <span :title="curMaterial.name" class="player_name_span" @click="findClip(curMaterial)">{{curMaterial.name}}</span>
      </div>
      <span class="tc_btn fr" @click="isShowTC=!isShowTC" :class="{tc_btn_active:isShowTC}" v-show="curMaterial.father&&curMaterial.father.guid&&!curMaterial.isAudio">TC</span>
      <div class="time_container fr">
        <time-code class="curtime_timecode" :option="curTimeOption" @change="setTime"></time-code>
        <!--span class="player_timecode">{{displayCurrentTime}}</span-->
        <span class="gray_color">/</span>
        <span class="gray_color player_timecode" :class="{clipping_duration: curMaterial.clipping}">{{displayDuration}}</span>
      </div>
    </div>
    <div class="video-player clearfix" :style="{background:curMaterial.isAudio?'url(./images/audio_player.png) center center no-repeat':''}">
      <time-code-bar :option="tcWindowOption" v-if="curMaterial.father&&curMaterial.father.guid&&!curMaterial.isAudio&&isShowTC" @change="setTime" ref="timecode"></time-code-bar>
      <div class="emptyDiv fl" :style="{height: (fullscreenSymbol?computedHeight:height?height:360) + 'px'}">
      </div>
      <!-- <transition name="fade">
            <div class="rate_display" v-show="isShowRate">
              X {{displayRate}}
            </div>
        </transition> -->
      <video :key="s.src" v-dispose @mousewheel.stop.prevent="mousewheel" @contextmenu.stop.prevent="contextMenu" @click.stop.prevent @dblclick.stop.prevent="isDvModel=!isDvModel" draggable="false" :src="s.src" v-if="!isLive" crossOrigin="anonymous" class="video-item main_player" :class="{fullscreen:curMaterial.is16_9sd}" :style="{width: (fullscreenSymbol?computedWidth:100) + '%', height: (fullscreenSymbol?computedHeight:height?height:360) + 'px', opacity: curMaterial.isAudio?0:1, zIndex: s.index===curIndex?1:-1}" v-show="!isLive" :ref="'video'+ s.index" v-for="s in options.source" :preload="(s.index-curIndex)===1||(s.index-curIndex)===0?'auto':'none'">
      </video>
      <video :key="s.src" v-dispose @mousewheel.stop.prevent="mousewheel" @contextmenu.stop.prevent="contextMenu" @mousedown.stop @click.stop.prevent @dblclick.stop.prevent="isDvModel=!isDvModel" v-show="isLive" v-if="isLive" :ref="'liveVideo'+ s.index" :class="{fullscreen:curMaterial.is16_9sd}" v-for="s in options.source" crossOrigin="anonymous" class="video-item main_player" :style="{width: (fullscreenSymbol?computedWidth:100) + '%', height: (fullscreenSymbol?computedHeight:height?height:360) + 'px', opacity: curMaterial.isAudio?0:1,zIndex:s.index===curIndex?1:-1}"></video>
      <div class="progress_bar_container" ref="progressBar" @mousedown.stop="seek" @mousemove="preview">
        <div class="preview_img_container" v-if="previewMaterial&&previewMaterial.previewicon" :style="{left:mouseLeft*100+'%'}">
          <img class="video_preview_img" :src="previewMaterial.previewicon" :style="{top:previewTop+'px'}" />
        </div>
        <div class="preview_triangle" v-if="previewMaterial&&previewMaterial.previewicon" :style="{left:mouseLeft*100+'%'}"> </div>
        <div :key="m.src" class="buffered_progress_bar" v-for="m in options.source" :style="{left:getSpaceTime(m)*100/frameDuration+'%',width: Math.min(m.buffered,m.end)*100/frameDuration+'%'}"></div>
        <div class="slider-bar" @mousedown.stop.self="seek" :style="{width: Math.min(100,currentTime*100/(frameDuration||1))+'%'}"></div>
        <div class="in_out_div" v-if="ioMaterial!==undefined&&!curMaterial.isAudio&&options.materials.length===1" :style="{width:(displayOut-displayIn)*100/frameDuration+'%',left:displayIn*100/frameDuration+'%'}">
          <div class="in_flag fl in_out_icon" :title="displayIn" @mousedown.stop="locateIn"></div>
          <div class="out_flag fr in_out_icon" :title="displayOut" @mousedown.stop="locateOut"></div>
        </div>
      </div>
    </div>
    <div class="marker_container" @mousedown.stop="seek">
      <div :key="index" @dragstart.stop="dragstart($event, m)" :draggable="isPremiere" @dragover.stop.prevent @dragenter.stop.prevent @contextmenu.stop.prevent class="es_marker_div" v-for="(m, index) in ESMarkerList" :style="{left:(m.time+m.spaceTime)*100/frameDuration+'%'}" @mousedown.prevent.stop="markerclick(m)">
        <div class="es_marker_rect" :style="m.bgcolor"></div>
        <div class="es_marker_ang" :style="{borderTop:'5px solid '+ m.bgcolor.background}"></div>
      </div>
      <div :key="index" @dragstart.stop="dragstart($event, m)" :draggable="isPremiere" @dragover.stop.prevent @dragenter.stop.prevent @contextmenu.stop.prevent class="es_marker_div" v-for="(m, index) in LMarkerList" :style="{left:(m.time+m.spaceTime)*100/frameDuration+'%'}" @mousedown.prevent.stop="markerclick(m)">
        <div class="es_marker_ang" :style="{borderTop:'15px solid '+ m.bgcolor.background}"></div>
      </div>
      <div :key="index" @dragstart.stop="dragstart($event, m)" :draggable="isPremiere" @dragover.stop.prevent @dragenter.stop.prevent @contextmenu.stop.prevent class="ch_marker_div" v-for="(m, index) in CMarkerList" :style="{left:(m.time+m.spaceTime)*100/frameDuration+'%'}" @mousedown.prevent.stop="markerclick(m)">
      </div>
      <div :key="index" @dragstart.stop="dragstart($event, m)" :draggable="isPremiere" @dragover.stop.prevent @dragenter.stop.prevent @contextmenu.stop.prevent class="smark_in_out_div" v-for="(m, index) in SMarkerList" @mousedown.prevent.stop="markerclick(m)" :style="{width:(m.outtime-m.intime)*100/frameDuration+'%',left:(m.intime+m.spaceTime)*100/frameDuration+'%',background:m.bgcolor.background}">
        <div class="smark_in_flag fl smark_in_out_icon"></div>
        <div class="smark_out_flag fr smark_in_out_icon"></div>
      </div>
      <div class="smark_in_flag fl smark_in_out_icon" v-show="smarkerIn!==undefined" :style="{left:smarkerDisplayIn*100/frameDuration+'%'}"></div>
    </div>
    <div class="player-bottom">
      <div class="controls_container fl">
        <span class="player_icon play_icon fl" title="Play" v-show="paused" @click="play"></span>
        <span class="player_icon pause_icon fl" title="Pause" v-show="played" @click="pause"></span>
        <span class="player_icon to_start_icon fl" title="ToStart" @click="toStart"></span>
        <span class="player_icon last_frame_icon fl" title="LastFrame" @click="lastFrame"></span>
        <span class="player_icon next_frame_icon fl" title="NextFrame" @click="nextFrame"></span>
        <span class="player_icon to_end_icon fl" title="ToEnd" @click="toEnd"></span>
      </div>
      <div class="controls_container fr">
        <span v-show="!curMaterial.isAudio" class="player_icon fullscreen_icon fr" title="FullScreen" @click="enterFullscreen" v-if="!fullscreenSymbol"></span>
        <span v-show="!curMaterial.isAudio" class="player_icon exitFullscreen_icon fr" title="ExitFullScreen" @click="exitFullscreen" v-else></span>
        <div class="player_icon volume_box fr">
          <span class="volume_icon" title="Volume" :style="{'background-position': -27*Math.ceil(volume*3) + 'px 0px'}" @click="muteOrRecover"></span>
          <div class="player_volume_container fr" @mousedown.stop="setVolume" :class="{volume_show:settingVolume}">
            <div class="volume_total" ref="volumeTotal">
              <div class="volume_current" :style="{height:volume*100+'%'}">
                <div class="volume_ball" @mousedown.stop="dragSetVolume" ref="volumeBall"></div>
              </div>
            </div>
          </div>
        </div>
        <span v-if="!curMaterial.isAudio&&options.materials.length===1" class="player_icon smarker_in_icon fl" title="MarkerIn" :class="{smarker_in_down_icon: smarkerIn !== undefined}" @click="addsMarkerIn" v-show="editing"></span>
        <span v-if="!curMaterial.isAudio&&options.materials.length===1" class="player_icon smarker_out_icon fl" title="MarkerOut" @click="addsMarkerOut" v-show="editing"></span>
        <!--span class="player_icon retrieve_icon fr" title="Retrieve" @click="saveAsNewClip(true)" v-if="this.curMaterial.operations.indexOf('Retrieve')>-1&&curMaterial.father&&curMaterial.father.guid&&!curMaterial.isAudio&&options.materials.length===1"></span>
            <span class="player_icon save_icon fr" title="SaveAs New Clip" @click="saveAsNewClip(false)" v-else-if="curMaterial.father&&curMaterial.father.guid&&!curMaterial.isAudio&&options.materials.length===1"></span-->
        <div class="player_icon export_box fr" v-if="!curMaterial.isAudio">
          <span class="player_icon export_icon fr" v-show="curMaterial.father&&curMaterial.father.guid&&options.materials.length===1"></span>
          <div class="player_export_container">
            <ul>
              <li :key="op.name" class="export_menu_item" v-show="(curMaterial.operations.indexOf('Retrieve')===-1&&curMaterial.operations.indexOf('Export')>-1||op.name!=='Export')&&((curMaterial.operations.indexOf('Retrieve')===-1&&curMaterial.father&&curMaterial.father.guid&&!curMaterial.isAudio&&options.materials.length===1)||op.name!=='Save as New Clip')&&(op.name!=='Marks to Clip'||curMaterial.markers.values.filter(function(item){return item.type == 4 || item.type == 65536}).length&&curMaterial.operations.indexOf('Retrieve')===-1)&&(op.name!=='Retrieve'||(curMaterial.operations.indexOf('Retrieve')>-1&&curMaterial.father&&curMaterial.father.guid&&!curMaterial.isAudio&&options.materials.length===1))&&(op.name!=='In-Out to OA'||curMaterial.operations.indexOf('Retrieve')===-1&&!curMaterial.isAudio)" @click.stop="apply(op.action)" v-for="op in operations">
                <a>{{op.name}}</a>
                <span :class="op.icon+'_menu_icon'"></span>
              </li>
            </ul>
          </div>
        </div>
        <!--span class="fr inout_timecode">{{formatOut}}</span-->
        <time-code v-if="!curMaterial.isAudio&&options.materials.length===1" :option="outOption" class="inout_timecode fr" v-show="curMaterial.father&&curMaterial.father.guid" @change="setOutPoint"></time-code>
        <span v-if="!curMaterial.isAudio&&options.materials.length===1" class="player_icon out_icon fr" title="OutPoint" v-show="curMaterial.father&&curMaterial.father.guid" @click="addOutPoint"></span>
        <!--span class="fr inout_timecode">{{formatIn}}</span-->
        <time-code v-if="!curMaterial.isAudio&&options.materials.length===1" :option="inOption" class="inout_timecode fr" v-show="curMaterial.father&&curMaterial.father.guid" @change="setInPoint"></time-code>
        <span v-if="!curMaterial.isAudio&&options.materials.length===1" class="player_icon in_icon fr" title="InPoint" v-show="curMaterial.father&&curMaterial.father.guid" @click="addInPoint"></span>
        <span v-if="!curMaterial.isAudio&&options.materials.length===1" class="player_icon set_stamp_icon fr" title="SetStamp" @click="setStamp" v-show="editing"></span>
        <span v-if="!curMaterial.isAudio&&options.materials.length===1" class="player_icon add_marker_icon fr" title="EssenceMark" @click="addMarker" v-show="editing"></span>
      </div>
    </div>
  </div>
</template>

<script>
import TYPES from '../../../dicts/mutationTypes'
import * as util from '../../../lib/util'
import worker from '../../../worker/player'
import { GetFrameNumByHundredNS, GetSecondByEachFrame, GetTimeStringByFrameNum, GetMillSecondsByFrameNum, GetFrameRateByVideoStandard, FrameRateEnum, Format } from '../../../lib/format.js'
import $ from 'jquery'
import { GetEntityType } from '../../../lib/transform'

import TimeCode from './TimeCode'
import TimeCodeBar from './TimeCodeBar'
import KeyEvent from '../../../lib/KeyEvent.js'
import KEYCODES from '../../../dicts/keycodes.js'
import appSetting from '../../../config/appSetting'

const dashjs = require('../../../lib/dash.all.debug.js')
export default {
  name: 'video_ctrl',
  components: {
    'time-code': TimeCode,
    'time-code-bar': TimeCodeBar
  },
  props: {
    options: {
      type: Object,
      required: true
    },
    height: Number
  },
  data () {
    return {
      curIndex: 0,
      played: false,
      paused: true,
      curVideoTime: 0,
      seekSymbol: false,
      playbackRate: 1,
      muted: false,
      volume: 1,
      esMarkerSymbol: true,
      scMarkerSymbol: true,
      chMarkerSymbol: true,
      loMarkerSymbol: true,
      jid: -1,
      jtype: 1,
      keyupSymbol: true,
      editing: false,
      computedWidth: 100,
      computedHeight: 360,
      inPoint: undefined,
      outPoint: undefined,
      ioMaterial: undefined,
      smarkerIn: undefined,
      smarkerDisplayIn: 0,
      smarkerMaterial: null,
      smarkerOut: undefined,
      // smarkerIndex: undefined,
      settingVolume: false,
      bakVolume: 1,
      mouseLeft: 0,
      previewMaterial: null,
      previewTop: 0,
      isShowTC: false,
      liveDuration: 0,
      operations: [{
        name: 'Export',
        icon: 'export',
        action: TYPES.EXPORT
      }, {
        name: 'In-Out to OA',
        icon: 'register',
        action: TYPES.REGISTER_OA
      }, {
        name: 'Marks to Clip',
        icon: 'markers',
        action: TYPES.MARKER_EXPORT
      }, {
        name: 'Save as New Clip',
        icon: 'markers',
        action: TYPES.SAVE_AS_NEW_CLIP
      }, {
        name: 'Retrieve',
        icon: 'markers',
        action: TYPES.DISPATCH_RETRIEVE
      }, {
        name: 'Save Picture',
        icon: 'markers',
        action: TYPES.DISPATCH_SAVE_PICTURE
      }],
      isShowRate: false,
      displayRate: 0
    }
  },
  computed: {
    isPremiere () {
      return this.$store.state.system
    },
    previewStatus () {
      return this.$store.getters.previewStatus
    },
    isDvModel: {
      get () {
        return this.$store.state.detailviewSymbol
      },
      set (val) {
        this.$store.state.detailviewSymbol = val
      }
    },
    tcWindowOption () {
      return {
        videostandard: this.headSource.videostandard,
        ntsctcmode: this.headSource.ntsctcmode,
        framerate: this.headSource.framerate,
        time: this.currentTime,
        curTime: this.curSource.video.currentTime - this.curSource.start + this.curSource.in,
        duration: this.frameDuration,
        isSkipFrame: this.tcwIsSkipFrame,
        vtrin: this.options.materials[0].vtrin || 0,
        otcfilein: this.curMaterial.otcfilein || 0,
        material: this.curMaterial,
        spaceTime: this.getSpaceTime(this.curMaterial),
        isLive: this.options.isLive
      }
    },
    inoutMaterial () {
      return this.ioMaterial || this.curMaterial
    },
    ioSkipFrame () {
      var videoStandard = this.inoutMaterial.videostandard
      return !this.inoutMaterial.ntsctcmode && (GetFrameRateByVideoStandard(videoStandard) === FrameRateEnum.FR_2997 || GetFrameRateByVideoStandard(videoStandard) === FrameRateEnum.FR_30 || GetFrameRateByVideoStandard(videoStandard) === FrameRateEnum.FR_5994)
    },
    tcwIsSkipFrame () {
      var videoStandard = this.headSource.videostandard
      return !this.headSource.ntsctcmode && (GetFrameRateByVideoStandard(videoStandard) === FrameRateEnum.FR_2997 || GetFrameRateByVideoStandard(videoStandard) === FrameRateEnum.FR_30 || GetFrameRateByVideoStandard(videoStandard) === FrameRateEnum.FR_5994)
    },
    isSkipFrame () {
      var videoStandard = this.curSource.videostandard
      return !this.curSource.ntsctcmode && (GetFrameRateByVideoStandard(videoStandard) === FrameRateEnum.FR_2997 || GetFrameRateByVideoStandard(videoStandard) === FrameRateEnum.FR_30 || GetFrameRateByVideoStandard(videoStandard) === FrameRateEnum.FR_5994)
    },
    curTimeOption () {
      return {
        videostandard: this.headSource.videostandard,
        ntsctcmode: this.headSource.ntsctcmode,
        framerate: this.headSource.framerate,
        time: this.currentTime,
        duration: this.frameDuration,
        isSkipFrame: this.tcwIsSkipFrame,
        isLive: this.isLive
      }
    },
    inOption () {
      return {
        videostandard: this.inoutMaterial.videostandard,
        ntsctcmode: this.inoutMaterial.ntsctcmode,
        framerate: this.inoutMaterial.framerate,
        time: this.displayIn,
        duration: this.frameDuration,
        isSkipFrame: this.ioSkipFrame,
        isLive: this.isLive
      }
    },
    outOption () {
      return {
        videostandard: this.inoutMaterial.videostandard,
        ntsctcmode: this.inoutMaterial.ntsctcmode,
        framerate: this.inoutMaterial.framerate,
        time: this.displayOut,
        duration: this.frameDuration,
        isSkipFrame: this.ioSkipFrame,
        isLive: this.isLive
      }
    },
    focused () {
      return this.$store.state.isFocusPlayer
    },
    markerList () {
      var markerlist = []
      this.options.materials.forEach(m => {
        var markTab = m.properties.find(i => i.name === 'Marks')
        var markers = markTab && markTab.keyValues.values || []
        markers.forEach(item => item.spaceTime = item.spaceTime || this.getSpaceTime(m))
        markerlist.push(...markers)
      })
      return markerlist
    },
    ESMarkerList () {
      return this.markerList.filter(item => item.tag === 'esMarker')
    },
    SMarkerList () {
      return this.markerList.filter(item => item.tag === 'scMarker')
    },
    LMarkerList () {
      return this.markerList.filter(item => item.tag === 'loMarker')
    },
    CMarkerList () {
      return this.markerList.filter(item => item.tag === 'chMarker')
    },
    dict () {
      return this.$store.state.dict
    },
    displayCurrentTime () {
      return this.getTimeString(this.currentTime, this.curSource.videostandard, this.curSource.ntsctcmode)
    },
    displayDuration () {
      return this.getTimeString(this.duration, this.headSource.videostandard, this.headSource.ntsctcmode)
    },
    formatIn () {
      return this.getTimeString(this.displayIn, this.curSource.videostandard, this.curSource.ntsctcmode)
    },
    formatOut () {
      return this.getTimeString(this.displayOut, this.curSource.videostandard, this.curSource.ntsctcmode)
    },
    displayIn () {
      return (this.inoutMaterial !== undefined && this.getSpaceTime(this.inoutMaterial) || 0) + (this.inPoint || 0)
    },
    displayOut () {
      var out
      if (this.isLive) {
        out = this.outPoint || this.duration
      } else if (this.inoutMaterial !== undefined) {
        out = this.getSpaceTime(this.inoutMaterial) + (this.outPoint || this.inoutMaterial.duration)
      } else {
        out = this.duration
      }
      var totalFrames = GetFrameNumByHundredNS(Math.round(out * 10000000), this.inoutMaterial.videostandard, this.inoutMaterial.ntsctcmode)
      var time = GetMillSecondsByFrameNum(Math.max(0, totalFrames), this.inoutMaterial.videostandard)
      return time
    },
    curSource: {
      get () {
        return this.options.source[this.curIndex] || {
          markers: [],
          video: {}
        }
      },
      set () { }
    },
    headSource () {
      return this.options.source[0] || {
        markers: [],
        video: {}
      }
    },
    curMaterial () {
      return this.options.materials.find(item => item.guid === this.curSource.guid) || this.options.materials[0] || {}
    },
    length () {
      return this.options.source.length
    },
    roundBit () {
      var videostandard = Format.ET_GetOldStandard(this.curMaterial.videostandard)
      if (GetFrameRateByVideoStandard(videostandard) === FrameRateEnum.FR_50) {
        return 3
      } else if (GetFrameRateByVideoStandard(videostandard) === FrameRateEnum.FR_5994) {
        return 6
      } else if (GetFrameRateByVideoStandard(videostandard) === FrameRateEnum.FR_25) {
        return 3
      } else if (GetFrameRateByVideoStandard(videostandard) === FrameRateEnum.FR_2997) {
        return 6
      } else if (GetFrameRateByVideoStandard(videostandard) === FrameRateEnum.FR_30) {
        return 6
      } else {
        return 3
      }
    },
    currentFrame () {
      var frames = 0
      for (let i = 0, length = this.options.source.length; i < length; i++) {
        let item = this.options.source[i]
        if (item.index < this.curIndex) {
          frames += GetFrameNumByHundredNS(Math.round((item.end - item.start) * 10000000), item.videostandard, item.ntsctcmode)
        } else if (item.index === this.curIndex) {
          frames += GetFrameNumByHundredNS(Math.round(((this.curVideoTime - item.start).round(this.roundBit)) * 10000000), item.videostandard, item.ntsctcmode)
          break
        }
      }
      return frames
    },
    currentTime: {
      get () {
        var frames = 0
        for (let i = 0, length = this.options.source.length; i < length; i++) {
          let item = this.options.source[i]
          if (item.index < this.curIndex) {
            frames += GetFrameNumByHundredNS(Math.round((item.end - item.start) * 10000000), item.videostandard, item.ntsctcmode)
          } else if (item.index === this.curIndex) {
            frames += GetFrameNumByHundredNS(Math.round(((this.curVideoTime - item.start).round(this.roundBit)) * 10000000), item.videostandard, item.ntsctcmode)
            break
          }
        }
        var time = GetMillSecondsByFrameNum(frames, this.curMaterial.videostandard)
        return time.round(this.roundBit)
      },
      set (value) {
        var total
        value = value.round(this.roundBit)
        if (this.options.loop) {
          if (value < 0) {
            this.currentTime = this.frameDuration + value
          } else {
            total = 0
            for (let i = 0, length = this.options.source.length; i < length; i++) {
              let item = this.options.source[i]
              if ((item.end + total).round(6) >= value && item.start + total <= value) {
                // this.curSource.video && this.curSource.video.pause && this.curSource.video.pause()
                this.curIndex = i
                item.video.currentTime = (value - total) + item.start + (this.roundBit === 6 ? 0.005 : 0) // + (this.isLive ? this.frameSec * 1.1 : 0)
                // if (this.played) {
                //   this.play()
                // } else {
                //   this.pause()
                // }
                break
              } else {
                total += (item.end - item.start)
              }
            }
          }
        } else {
          if (value < 0) {
            this.currentTime = 0
          } else {
            total = 0
            if (this.isLive) {
              for (let i = 0, length = this.options.source.length; i < length; i++) {
                let item = this.options.source[i]
                if ((item.end - item.start + total).round(6) > value && total <= value) {
                  //  this.curSource.video.currentTime = this.curSource.start
                  // this.curSource.video && this.curSource.video.pause && this.curSource.video.pause()
                  this.curIndex = i
                  var newpos
                  newpos = (value - total + item.start).round(this.roundBit) + (this.roundBit === 6 ? 0.005 : 0)
                  if (newpos > item.end) {
                    newpos = item.end - 0.000001
                  }
                  item.video.currentTime = newpos
                  // if (this.played) {
                  //   this.play()
                  // } else {
                  //   this.pause()
                  // }
                  break
                } else {
                  total += (item.end - item.start)
                }
              }
            } else {
              for (let i = 0, length = this.options.source.length; i < length; i++) {
                let item = this.options.source[i]
                if ((item.end - item.start + total).round(6) > value && total <= value) {
                  //  this.curSource.video.currentTime = this.curSource.start
                  // this.curSource.video && this.curSource.video.pause && this.curSource.video.pause()
                  this.curIndex = i
                  item.video.currentTime = (value - total + item.start).round(this.roundBit) + (this.roundBit === 6 ? 0.0001 : 0)
                  break
                } else {
                  total += (item.end - item.start)
                }
              }
            }
          }
        }
      }
    },
    duration: {
      get () {
        var sources = this.options.source
        return sources.reduce(
          (item1, item2) => {
            return {
              end: item1.end - item1.start + item2.end - item2.start,
              start: 0
            }
          }, {
            end: 0,
            start: 0
          }).end || this.options.materials.reduce((item1, item2) => { return { duration: item1.duration + item2.duration } }, { duration: 0 }).duration
      },
      set (value) {
        this.liveDuration = value
        this.curSource.end = value
      }
    },
    frameDuration () {
      var totalFrames = GetFrameNumByHundredNS(Math.round(this.duration * 10000000), this.curMaterial.videostandard, this.curMaterial.ntsctcmode)
      // var diff = this.duration - GetMillSecondsByFrameNum(totalFrames, this.curMaterial.videostandard)
      var time = GetMillSecondsByFrameNum(Math.max(0, totalFrames - 1), this.curMaterial.videostandard)
      return time
      // return this.curMaterial.duration ? (this.duration - this.curMaterial.duration + this.curMaterial.duration.floorByFrame(this.frameSec, this.curMaterial.framerate)).round(6) : this.duration.floorByFrame(this.frameSec, this.curMaterial.framerate).round(6) //(this.duration - this.curSource.end + this.curSource.start + (this.curSource.end - this.curSource.start).floorByFrame(this.frameSec, this.curSource.framerate)).round(4) : this.duration
    },
    curEnd () {
      var totalFrames = GetFrameNumByHundredNS(Math.round(this.curSource.end * 10000000), this.curMaterial.videostandard, this.curMaterial.ntsctcmode)
      if (this.isLive) {
        return this.curSource.end + (this.roundBit === 6 ? 0.0001 : 0)
      }
      var time = GetMillSecondsByFrameNum(Math.max(0, totalFrames - 1), this.curMaterial.videostandard).round(6)
      return time + (this.roundBit === 6 ? 0.00011 : 0)
    },
    fullscreenSymbol () {
      return this.$store.state.fullscreenSymbol
    },
    frameSec () {
      return GetSecondByEachFrame(this.curSource.videostandard).round(6)
    },
    isLive () {
      return this.options.isLive
    }
  },
  mounted () {
    this.currentTime = 0
    window.addEventListener('mousemove', (e) => this.settingVolume && this.setVolume(e))
    window.addEventListener('mouseup', () => this.settingVolume = false)
    window.addEventListener('keydown', this.keydown)
    window.addEventListener('keyup', this.keyup)
    document.addEventListener('webkitfullscreenchange', this.calcWidth)
    worker.addEventListener('message', evt => {
      if (evt.data.type === 'update' && this.$store.state.previewSymbol) {
        if (this.curSource && this.curSource.video && this.curSource.video.currentTime !== undefined) {
          if (this.curSource.video.currentTime > this.curEnd) {
            this.onended()
          } else {
            this.curVideoTime = Math.max(this.curSource.start, Math.min(this.curSource.video.currentTime, this.curSource.end))
          }
        }
      }
    }, false)
    worker.postMessage({
      type: 'start'
    })
    this.$nextTick(() => {
      this.options.source.forEach(item => {
        item.video = this.$refs['video' + item.index][0]
        this.bindEvents(item.video)
        item.video.currentTime = item.start
      })
    })
    this.initialize()
  },
  beforeDestroy () {
    // this.dispose()
  },
  methods: {
    showPlaybackRate (rate) {
      clearTimeout(this.rateId)
      this.displayRate = rate
      this.isShowRate = true
      this.rateId = setTimeout(() => this.isShowRate = false, 3000)
    },
    findClip (material) {
      var pathList = material.father.guid ? material.folderpath : material.father.path
      if (appSetting.USEROOTPATH) {
        pathList = pathList.split('/')
      } else {
        pathList = pathList.split('/').slice(1)
      }
      util.locateFolder(this.$store, pathList,
        {
          children: this.$store.getters.folderTree
        }, {
          materialGuids: [material.guid],
          isPreview: false,
          isShowWaiting: true
        })
    },
    mousewheel () {
      if (event.deltaY < 0) {
        this.lastFrame()
      } else {
        this.nextFrame()
      }
    },
    dragstart (event, marker) {
      // for premiere
      event.dataTransfer.dropEffect = 'copy'
      event.dataTransfer.effectAllowed = 'copy'
      var isWin = (navigator.platform === 'Win32') || (navigator.platform === 'Windows')
      var url = util.getUrl(appSetting.CMAPI + (isWin ? '/CMApi/api/entity/program/getscenemarkfcp7xmlpath' : '/CMApi/api/entity/program/getscenemarkfcp7xmlpathformac'), {
        userToken: this.$store.state.userInfo.usertoken,
        guid: marker.objectguid,
        markguid: marker.markguid
      })
      var _this = this
      $.ajax({
        type: 'post',
        url: '/Handler/MaterialList.ashx',
        data: {
          OperationType: 'ForwardRequest',
          usertoken: this.$store.state.userInfo.usertoken,
          url: url,
          type: 'get',
          body: ''
        },
        dataType: 'json',
        async: false,
        success: function (data) {
          if (data.R) {
            var res = JSON.parse(data.R)
            event.dataTransfer.setData('com.adobe.cep.dnd.file.0', isWin ? res.ext.xmlpath : util.convertPath4Mac(res.ext.xmlpath))
            window.parent.postMessage({
              type: 'sceneMarkDragStart',
              data: marker,
              ext: res.ext,
              auth: _this.$store.state.userInfo
            }, '*')
          }
        }
      })
    },
    initLivePlayer (source) {
      if (!source.livePlayer) {
        source.livePlayer = dashjs.MediaPlayer().create()
        source.livePlayer.initialize(source.video, '', false)
        source.livePlayer.attachSource(source.src)
        source.livePlayer.on('manifestUpdated', this.getLiveDuration(source))
        source.id = setInterval(() => {
          source.livePlayer.streamController.manifestUpdater.refreshManifest() // 暂停自动刷新duration
        }, 5000)
        source.sameTimes = 0
      }
      // source.livePlayer.on('canPlay', this.getLiveDuration(source))
    },
    getLiveDuration (source) {
      var _this = this
      return function () {
        var activeStream = source.livePlayer.getActiveStream()
        var oldEnd = source.end
        var s = _this.options.source.find(item => item.guid === source.guid && item.index === source.index)
        source.end = activeStream && activeStream.getDuration()
        _this.$nextTick(() => {
          _this.curMaterial.duration = _this.duration
        })
        s && (s.end = source.end)
        if (source.end === oldEnd) {
          source.sameTimes++
          if (source.sameTimes > 15) {
            clearInterval(source.id)
          }
        } else {
          source.sameTimes = 0
        }
        if (_this.played) {
          _this.play()
        }
      }
    },
    clearJ () {
      this.isJ = false
      this.animate = function () {
        return null
      }
    },
    animate: function () {
      return null
    },
    j: function (e) {
      var t = this
      this.isJ = true
      this.fps = this.curSource.framerate || 25
      this.fpsInterval = 1e3 / this.fps
      this.last = Date.now()
      this.startTime = this.last
      this.current_time = this.currentTime
      this.animate = function () {
        requestAnimationFrame(t.animate)
        var i = Date.now()
        var n = i - t.last
        if (n > t.fpsInterval) {
          t.last = i - n % t.fpsInterval
          var s = -1 / t.fps * e
          t.currentTime = t.currentTime + s
        }
      }
      this.animate()
    },
    getTimeString (time, videostandard, ntsctcmode, framerate) {
      return GetTimeStringByFrameNum(GetFrameNumByHundredNS(Math.round(time * 10000000), videostandard, ntsctcmode), ntsctcmode, videostandard, framerate)
    },
    getSourceByTime (time) {
      var source
      var total = 0
      var l = this.options.source.length
      for (let i = 0; i < l; i++) {
        total += this.options.source[i].end
        if (total >= time) {
          source = this.options.source[i]
          break
        }
      }
      return source
    },
    preview: util.throttle(50, function (event) {
      var x = $(this.$refs.progressBar).offset().left
      var eventX = event.pageX
      var w = this.$refs.progressBar.clientWidth
      this.mouseLeft = (eventX - x) / w
      var time = this.frameDuration * this.mouseLeft
      var source = this.getSourceByTime(time)
      this.previewMaterial = this.options.materials.find(item => source && item.guid === source.guid)
      if (this.previewMaterial && this.previewMaterial.previewicon) {
        this.$nextTick(() => {
          var picCount = 10
          var picWidth = document.querySelector('.video_preview_img').width
          var picHeight = document.querySelector('.video_preview_img').height / 10
          var iconWidth = 160
          var offset = Math.floor((eventX - x) / (w / picCount))
          this.previewTop = -(picHeight * iconWidth / picWidth) * offset
        })
      }
    }),
    calcWidth () {
      this.$nextTick(() => {
        setTimeout(() => {
          var vh = this.curSource.video.videoHeight
          var vw = this.curSource.video.videoWidth
          if (vh && vw) {
            this.computedHeight = document.body.clientHeight - 100
            if (this.curMaterial.is16_9sd) {
              var width = (this.computedHeight * 1600 / 9) / document.body.clientWidth
              if (width > 100) {
                this.computedWidth = 100
                this.computedHeight *= 100 / width
              } else {
                this.computedWidth = Math.min((this.computedHeight * 1600 / 9) / document.body.clientWidth, 100)
              }
            } else {
              this.computedWidth = Math.min((document.body.clientHeight - 100) / document.body.clientWidth * vw / vh * 100, 100)
            }
          } else {
            this.computedHeight = document.body.clientHeight - 100
          }
        }, 0)
      })
    },
    changeEditing (status) {
      this.editing = status
      if (!status) { // 清空状态
        this.smarkerOut = undefined
        this.smarkerIn = undefined
        this.smarkerMaterial = undefined
      }
    },
    markerclick (marker) {
      this.pause()
      var time = (marker.intime || marker.time) + marker.spaceTime
      this.currentTime = time
    },
    changeIndex (index) {
      this.curIndex = index
    },
    registerKeyup () {
      let keyEvents = []
      // j
      keyEvents.push(new KeyEvent(KEYCODES.j, {
        action: event => {
          this.play()
          this.j(this.jtype)
          this.showPlaybackRate(this.jtype * -1)
          this.jtype = Math.min(3, ++this.jtype)
        }
      }))
      // m
      keyEvents.push(new KeyEvent(KEYCODES.m, {
        action: event => {
          this.addMarker()
        }
      }))
      // i
      keyEvents.push(new KeyEvent(KEYCODES.i, {
        action: event => {
          this.addInPoint()
        }
      }))
      // o
      keyEvents.push(new KeyEvent(KEYCODES.o, {
        action: event => {
          this.addOutPoint()
        }
      }))
      // space
      keyEvents.push(new KeyEvent(KEYCODES.k, {
        action: event => {
          this.clearJ()
          this.playbackRate = 1
          this.showPlaybackRate(1)
          this.pause()
          this.jtype = 1
        }
      }))
      // esc
      keyEvents.push(new KeyEvent(KEYCODES.esc, {
        action: event => {
          this.isDvModel && (0, this.isDvModel = false)
        }
      }))

      this.$keyup.on(/keyup-\d+/g, event => {
        let keycode = event.keycode
        let events = keyEvents.filter(item => item.keycodes.includes(keycode) && event.ctrlKey === item.ctrlKey && event.shiftKey === item.shiftKey && event.metaKey === item.metaKey)
        if (events.length) {
          events.forEach(item => item.action(event))
        }
      })
    },
    registerKeydown () {
      let keyEvents = []
      // right
      keyEvents.push(new KeyEvent(KEYCODES.right, {
        action: event => {
          this.clearJ()
          this.nextFrame()
        }
      }))
      // left
      keyEvents.push(new KeyEvent(KEYCODES.left, {
        action: event => {
          this.clearJ()
          this.lastFrame()
        }
      }))
      // home
      keyEvents.push(new KeyEvent(KEYCODES.home, {
        action: event => {
          this.clearJ()
          this.toStart()
        }
      }))
      // end
      keyEvents.push(new KeyEvent(KEYCODES.end, {
        action: event => {
          this.clearJ()
          this.toEnd()
        }
      }))
      // space
      keyEvents.push(new KeyEvent(KEYCODES.end, {
        action: event => {
          this.clearJ()
          this.playbackRate = 1
          this.jtype = 1
          if (this.played) {
            this.pause()
          } else {
            this.play()
          }
        }
      }))
      // l
      keyEvents.push(new KeyEvent(KEYCODES.l, {
        action: event => {
          this.clearJ()
          if (this.paused) {
            this.playbackRate--
          }
          this.playbackRate = Math.min(++this.playbackRate, 3)
          this.showPlaybackRate(this.playbackRate)
          this.play()
        }
      }))

      this.$keydown.on(/keydown-\d+/g, event => {
        let keycode = event.keycode
        let events = keyEvents.filter(item => item.keycodes.includes(keycode) && event.ctrlKey === item.ctrlKey && event.shiftKey === item.shiftKey && event.metaKey === item.metaKey)
        if (events.length) {
          events.forEach(item => item.action(event))
        }
      })
    },
    saveMarker (type, tempMarker) {
      var markers = this.curSource.markers
      var source
      if (type !== 'add') {
        markers = markers.filter(item => item.markguid)
      } else {
        markers = markers.filter(item => !item.markguid)
      }
      source = this.curSource
      var framerate = this.curSource.framerate
      var json = markers.map(item => {
        var m = {
          color: item.color,
          createdate: item.createdate,
          creator: item.creator,
          iconframe: item.iconframe,
          iconlevel: item.iconlevel,
          keyframe: item.keyframe,
          modifydate: item.modifydate,
          name: item.name,
          startframe: item.startframe,
          type: item.type,
          endkeyframe: item.endkeyframe,
          note: item.note,
          iconfilename: item.iconfilename
        }
        /* if (item.iconfilename && !item.iconfilename.startsWith('data:')) {
          m.iconfilename = item.iconfilename
        } */
        if (item.markguid) {
          m.markguid = item.markguid
        }
        return m
      })
      this.$store.dispatch({
        type: TYPES.UPDATE_MARKERPOINTS,
        data: {
          json: json,
          guid: this.curSource.guid
        }
      }).then(res => {
        if (type === 'add') {
          source.markers = util.updateMarkerList(res.data.ext, framerate).sort((i1, i2) => {
            return i2.createdate.localeCompare(i1.createdate)
          })
        }
        console.log('save success')
      }).catch(res => {
        console.log('save failed')
      })
    },
    deleteMarker (marker) {
      var markers = this.curSource.markers
      markers.remove(marker)
    },
    setStamp () {
      var timespan = this.currentTime - this.getSpaceTime(this.curSource)
      var material = this.curMaterial
      var keyframe = GetFrameNumByHundredNS(Math.round(timespan * 10000000), material.videostandard, material.ntsctcmode)
      let json = {
        object: {
          entity: {
            guid: material.guid,
            type: material.typeid,
            subtype: material.subtype,
            folderpath: material.folderpath,
            modifier: this.$store.state.userInfo.usercode,
            modifyterminal: this.$store.state.userInfo.ip,
            modifydate: new Date().format('yyyy-MM-dd hh:mm:ss'),
            iconframe: keyframe,
            iconfilename: util.videoShot(this.curSource.video, 0.1)
          }
        },
        version: 1,
        type: GetEntityType(material.typeid, material.subtype)
      }
      this.$store.dispatch({
        type: TYPES.SAVE_OBJECT_INFO,
        data: json
      })
      this.curMaterial.iconfilename = util.videoShot(this.curSource.video, 0.1)
    },
    contextMenu (event) {
      if (!this.curMaterial.isAudio) {
        this.$store.commit({
          type: TYPES.CLEAR_SELECTEEDITEMS
        })
        this.$store.commit({
          type: TYPES.ADD_SELECTEDITEM,
          data: this.curSource
        })
        this.$store.commit({
          type: TYPES.SET_MENUSTATUS,
          data: {
            event: event,
            status: true
          }
        })
      }
    },
    inheritInfo (exportInfo, material) {
      var basicTab = material.properties.find((item) => {
        return item.name === 'Basic Info'
      })
      exportInfo.title = basicTab.keyValues.find((item) => {
        return item.name === 'Title'
      }).value
      exportInfo.note = basicTab.keyValues.find((item) => {
        return item.name === 'Rights'
      }).value
      exportInfo.comments = basicTab.keyValues.find((item) => {
        return item.name === 'Comments'
      }).value
      exportInfo.path = material.folderpath
    },
    saveFrame () {
      var material = this.curMaterial
      var time = (this.currentTime - this.getSpaceTime(material)) * 10000000
      var fileList = material.fileList.filter(item => item.displayQuality === 'High' && item.displayTrack === 'Video')
      var file,
        iconno
      fileList.forEach(item => {
        if (item.clipin <= time && item.clipout >= time) {
          file = item
          iconno = GetFrameNumByHundredNS(time - item.clipin + item.filein, material.videostandard, material.ntsctcmode)
        }
      })
      if (this.isLive && !file) {
        file = fileList.find(item => item.filein === item.fileout) // 采集中素材入出点为0的情况
        file && (iconno = GetFrameNumByHundredNS(time - file.clipin + file.filein, material.videostandard, material.ntsctcmode))
      }
      if (file) {
        this.$store.state.exportInfo.material = material
        this.$store.state.exportInfo.file = file
        this.$store.state.exportInfo.iconno = iconno
        this.inheritInfo(this.$store.state.exportInfo, material)
        this.$store.dispatch({
          type: TYPES.DISPATCH_SAVE_FRAME_AS_CLIP,
          target: material
        })
      } else {
        util.Notice.warning('The hi-res part of material is not available, Fail to continue!', '', 3000)
      }
    },
    addMarker (type) {
      var timespan = this.currentTime - this.getSpaceTime(this.curMaterial) // this.curSource.in + this.curSource.video.currentTime
      var newMarker
      var vtrin = this.curMaterial.vtrin
      if (type === 'scMarker') {
        newMarker = {
          color: 6730483,
          createdate: new Date().format('yyyy-MM-dd hh:mm:ss'),
          creator: this.$store.state.userInfo.usercode,
          keyframe: GetFrameNumByHundredNS(Math.round(this.smarkerIn * 10000000), this.smarkerMaterial.videostandard, this.smarkerMaterial.ntsctcmode),
          endkeyframe: GetFrameNumByHundredNS(Math.round(this.smarkerOut * 10000000), this.smarkerMaterial.videostandard, this.smarkerMaterial.ntsctcmode),
          iconlevel: 1,
          iconframe: GetFrameNumByHundredNS(Math.round(this.smarkerIn * 10000000), this.smarkerMaterial.videostandard, this.smarkerMaterial.ntsctcmode),
          icon: this.scmarkerIcon,
          // markguid: Guid.NewGuid().ToString("N"),
          // name: 'new mark',
          note: '',
          startframe: 0,
          type: 4
        }
        if (this.isLive) {
          if (newMarker.keyframe) {
            newMarker.keyframe--
          }
          if (newMarker.endkeyframe) {
            newMarker.endkeyframe--
          }
        }
        newMarker.isSMarker = true
        newMarker.startframe = newMarker.keyframe
        newMarker.inPoint = GetTimeStringByFrameNum(newMarker.keyframe + GetFrameNumByHundredNS(vtrin * 10000000, this.curMaterial.videostandard, this.curMaterial.ntsctcmode), this.smarkerMaterial.ntsctcmode, this.smarkerMaterial.videostandard)
        newMarker.outPoint = GetTimeStringByFrameNum(newMarker.endkeyframe + GetFrameNumByHundredNS(vtrin * 10000000, this.curMaterial.videostandard, this.curMaterial.ntsctcmode), this.smarkerMaterial.ntsctcmode, this.smarkerMaterial.videostandard)
        newMarker.outtime = this.smarkerOut
        newMarker.intime = this.smarkerIn
        newMarker.typeName = 'Scene Mark'
        newMarker.tag = 'scMarker'
      } else {
        newMarker = {
          color: 6730483,
          createdate: new Date().format('yyyy-MM-dd hh:mm:ss'),
          creator: this.$store.state.userInfo.usercode,
          keyframe: GetFrameNumByHundredNS(Math.round(timespan * 10000000), this.curMaterial.videostandard, this.curMaterial.ntsctcmode),
          iconlevel: 1,
          iconframe: GetFrameNumByHundredNS(Math.round(timespan * 10000000), this.curMaterial.videostandard, this.curMaterial.ntsctcmode),
          icon: util.videoShot(this.curSource.video, 0.1),
          // markguid: Guid.NewGuid().ToString("N"),
          // name: 'new mark',
          note: '',
          startframe: 0,
          type: 8
        }
        newMarker.pos = GetTimeStringByFrameNum(newMarker.keyframe + GetFrameNumByHundredNS(vtrin * 10000000, this.curMaterial.videostandard, this.curMaterial.ntsctcmode), this.curSource.ntsctcmode, this.curSource.videostandard)
        newMarker.time = timespan
        newMarker.typeName = 'Essence Mark'
        newMarker.tag = 'esMarker'
      }
      if (newMarker.color) {
        var RedColor = (newMarker.color & 0x0000ff)
        var Gcolor = ((newMarker.color & 0x00ff00) >> 8)
        var Bcolor = ((newMarker.color & 0xff0000) >> 16)
        newMarker.bgcolor = {
          background: 'rgb(' + RedColor + ',' + Gcolor + ',' + Bcolor + ')'
        }
      }
      this.curMaterial.properties.find(item => item.name === 'Marks').keyValues.values.unshift(newMarker)
      // this.curSource.markers.unshift(newMarker)
      this.$emit('add', newMarker)
      // this.saveMarker('add', newMarker)
    },
    getSpaceTime (source) {
      var total = source.in || 0
      var material = this.options.materials.find(item => item.guid === source.guid)
      var index = this.options.materials.indexOf(material)
      for (let i = 0; i < index; i++) {
        var m = this.options.materials[i]
        total += m.duration
      }
      return total
    },
    initialize () {
      // this.$store.state.player = this
      // this.curIndex = 0
      // this.currentTime = 0
    },
    dispose () {
      this.pause()
      this.curIndex = 0
      this.currentTime = 0
      this.playbackRate = 1
      this.smarkerOut = undefined
      this.smarkerIn = undefined
      this.smarkerMaterial = undefined
      this.inPoint = undefined
      this.outPoint = undefined
      this.ioMaterial = undefined
      this.$refs.timecode && this.$refs.timecode.dispose()
    },
    unbindEvents (video) {
      var self = this;
      ['progress', 'timeupdate', 'playing', 'waiting', 'canplaythrough', 'play', 'pause', 'canplay', 'loadeddata', 'error'].forEach(item => {
        video.removeEventListener(item, self['on' + item], false)
      })
    },
    bindEvents (video) {
      var self = this;
      ['progress', 'timeupdate', 'playing', 'waiting', 'canplaythrough', 'play', 'pause', 'canplay', 'loadeddata', 'error'].forEach(item => {
        video.addEventListener(item, self['on' + item], false)
      })
    },
    muteOrRecover () {
      if (this.volume) {
        this.bakVolume = this.volume
        this.volume = 0
        this.mute = true
        this.curSource.video.volume = this.volume
      } else {
        this.volume = this.bakVolume
        this.mute = false
        this.curSource.video.volume = this.volume
      }
    },
    setVolume (event) {
      var y = $(this.$refs.volumeTotal).offset().top
      var eventY = event.pageY
      var h = this.$refs.volumeTotal.clientHeight
      this.volume = Math.max(0, Math.min(1, (h + y - eventY) / h))
      this.curSource.video.volume = this.volume
    },
    dragSetVolume () {
      this.settingVolume = true
    },
    locateIn () {
      // this.curIndex = this.inoutIndex
      this.currentTime = this.inPoint
    },
    locateOut () {
      // this.curIndex = this.inoutIndex
      this.currentTime = this.outPoint
    },
    saveAsNewClip (flag) {
      this.$store.state.saveNewData.inPoint = this.inPoint === undefined ? -1 : Math.round(this.inPoint * 10000000)
      this.$store.state.saveNewData.outPoint = this.inPoint === undefined ? -1 : Math.round(this.outPoint * 10000000)
      this.$store.state.saveNewData.trimin = this.inPoint === undefined ? -1 : GetFrameNumByHundredNS(Math.round(this.inPoint.round(6) * 10000000), this.inoutMaterial.videostandard, this.inoutMaterial.ntsctcmode)
      this.$store.state.saveNewData.trimout = this.inPoint === undefined ? -1 : GetFrameNumByHundredNS(Math.round(this.outPoint.round(6) * 10000000), this.inoutMaterial.videostandard, this.inoutMaterial.ntsctcmode)
      this.$store.state.saveNewData.material = this.inoutMaterial
      this.$store.state.saveNewData.isRetrieve = flag
      this.$store.state.isSaveAs = true // 打开保存窗体
      if (appSetting.USEROOTPATH) {
        util.locateFolder(this.$store, this.inoutMaterial.folderpath.split('/'),
          {
            children: this.$store.state.publicPath
          }, {
            alwaysGet: true,
            isCheck: true,
            onlyFolder: true
          })
      } else {
        util.locateFolder(this.$store, this.inoutMaterial.folderpath.split('/').slice(1),
          {
            children: this.$store.state.publicPath
          }, {
            alwaysGet: true,
            isCheck: true,
            onlyFolder: true
          })
      }
    },
    apply (action) {
      if (this.curMaterial.fileList.some(item => item.displayQuality === 'High' && item.displayTrack === 'Video') || TYPES.DISPATCH_RETRIEVE === action || TYPES.REGISTER_OA === action) { // markers toclip  save as 必须有video高质量 暂不考虑文件不全的问题
        this.$store.state.exportInfo.INPOINT = this.inPoint === undefined ? -1 : Math.round(this.inPoint * 10000000)
        this.$store.state.exportInfo.OUTPOINT = this.inPoint === undefined ? -1 : Math.round(this.outPoint * 10000000)
        this.$store.state.exportInfo.TRIMIN = this.inPoint === undefined ? -1 : GetFrameNumByHundredNS(Math.round(this.inPoint.round(6) * 10000000), this.inoutMaterial.videostandard, this.inoutMaterial.ntsctcmode)
        this.$store.state.exportInfo.TRIMOUT = this.inPoint === undefined ? -1 : GetFrameNumByHundredNS(Math.round(this.outPoint.round(6) * 10000000), this.inoutMaterial.videostandard, this.inoutMaterial.ntsctcmode)
        if (!this.inPoint && this.outPoint === this.duration) {
          this.$store.state.exportInfo.INPOINT = this.$store.state.exportInfo.OUTPOINT = this.$store.state.exportInfo.TRIMIN = this.$store.state.exportInfo.TRIMOUT = -1
        } else if (this.isLive && this.inPoint === undefined) { // 采集中且没打点
          this.$store.state.exportInfo.INPOINT = Math.round(this.displayIn * 10000000)
          this.$store.state.exportInfo.OUTPOINT = Math.round(this.displayOut * 10000000)
          this.$store.state.exportInfo.TRIMIN = GetFrameNumByHundredNS(Math.round(this.displayIn.round(6) * 10000000), this.inoutMaterial.videostandard, this.inoutMaterial.ntsctcmode)
          this.$store.state.exportInfo.TRIMOUT = GetFrameNumByHundredNS(Math.round(this.displayOut.round(6) * 10000000), this.inoutMaterial.videostandard, this.inoutMaterial.ntsctcmode)
        }
        this.$store.state.exportInfo.material = this.inoutMaterial
        this.inheritInfo(this.$store.state.exportInfo, this.inoutMaterial)
        this.$store.state.exportInfo.isLive = this.isLive
        this.$store.state.exportInfo.liveDuration = GetFrameNumByHundredNS(Math.round(this.duration.round(6) * 10000000), this.inoutMaterial.videostandard, this.inoutMaterial.ntsctcmode)
        this.$store.state.exportInfo.liveLength = Math.round(this.duration.round(6) * 10000000)
        this.$store.dispatch({
          type: action,
          target: this.ioMaterial ? [this.inoutMaterial] : [this.curMaterial]
        })
        if (action === TYPES.REGISTER_OA) {
          this.$store.state.isplayerRegister = true
        }
      } else {
        util.Notice.warning('The hi-res part of material is not available, Fail to continue!', '', 3000)
      }
    },
    exportClip () {
      this.$store.state.exportInfo.TRIMIN = GetFrameNumByHundredNS(Math.round(this.inPoint * 10000000), this.inoutMaterial.videostandard, this.inoutMaterial.ntsctcmode) || -1
      this.$store.state.exportInfo.TRIMOUT = GetFrameNumByHundredNS(Math.round(this.outPoint * 10000000), this.inoutMaterial.videostandard, this.inoutMaterial.ntsctcmode) || -1
      this.$store.state.exportInfo.isTrim = true
      this.$store.dispatch({
        type: TYPES.EXPORT,
        target: this.ioMaterial ? [this.inoutMaterial] : this.options.materials
      })
    },
    addsMarkerIn () {
      // this.smarkerIndex = this.curIndex
      this.smarkerIn = this.curSource.video.currentTime - this.curSource.start + this.curSource.in
      this.smarkerDisplayIn = this.getSpaceTime(this.curMaterial) + this.smarkerIn
      this.smarkerMaterial = this.curMaterial
      this.scmarkerIcon = util.videoShot(this.curSource.video, 0.1)
    },
    addsMarkerOut () {
      if (this.smarkerMaterial !== this.curMaterial) {
        // 跨素材
      } else if (this.curSource.video.currentTime - this.curSource.start <= (this.smarkerIn - this.curSource.in)) {
      } else {
        this.smarkerOut = this.curSource.video.currentTime - this.curSource.start + this.curSource.in
        this.addMarker('scMarker')
        this.smarkerOut = undefined
        this.smarkerIn = undefined
        this.smarkerMaterial = undefined
      }
    },
    setInPoint (time) {
      this.currentTime = time // + this.curSource.start
      this.addInPoint(time)
    },
    setOutPoint (time) {
      this.currentTime = time // + this.curSource.start
      this.addOutPoint(time)
    },
    addInPoint (time) {
      var t = typeof time === 'number' ? time : this.currentTime
      if (this.ioMaterial !== this.curMaterial || !this.outPoint) {
        // 跨素材
        this.ioMaterial = this.curMaterial
        this.outPoint = this.curMaterial.duration || this.curSource.end
        this.curMaterial.strimout = this.curMaterial.duration || this.curSource.end
      } else if (t >= this.outPoint) {
        this.outPoint = this.curMaterial.duration || this.curSource.end
        this.curMaterial.strimout = this.curMaterial.duration || this.curSource.end
      }
      this.inPoint = t // this.curSource.video.currentTime - this.curSource.start + this.curSource.in
      this.curMaterial.strimin = t
      this.scmarkerIcon = util.videoShot(this.curSource.video, 0.1)
    },
    addOutPoint (time) {
      var t = typeof time === 'number' ? time : this.currentTime
      if (this.ioMaterial !== this.curMaterial) {
        // 跨素材
        this.ioMaterial = this.curMaterial
        this.inPoint = 0
        this.outPoint = t // this.curSource.video.currentTime - this.curSource.start + this.curSource.in
        this.curMaterial.strimin = 0
        this.curMaterial.strimout = t
      } else if (t <= this.inPoint) {
        this.outPoint = undefined
        this.inPoint = undefined
        this.ioMaterial = undefined
        this.curMaterial.strimin = 0
        this.curMaterial.strimout = this.curMaterial.duration || this.curSource.end
      } else {
        this.outPoint = t // this.curSource.video.currentTime - this.curSource.start + this.curSource.in
        this.curMaterial.strimout = t
      }
    },
    enterFullscreen () {
      this.options.source.forEach(item => {
        item.operations && item.operations.remove('FullScreen')
        item.operations && item.operations.add('Exit FullScreen')
      })
      document.querySelector('.auto_center').appendChild(this.$el)
      this.$store.state.fullscreenSymbol = true
      this.$nextTick(() => {
        util.enterFullscreen()
      })
    },
    exitFullscreen () {
      this.options.source.forEach(item => {
        item.operations && item.operations.add('FullScreen')
        item.operations && item.operations.remove('Exit FullScreen')
      })
      document.querySelector('.player_box').appendChild(this.$el)
      this.$store.state.fullscreenSymbol = false
      this.$nextTick(() => {
        util.exitFullscreen()
      })
      return true
    },
    play () {
      this.clearJ()
      // clearInterval(this.jid)
      this.played = true
      this.paused = false
      var cv = this.curSource.video
      if (cv && cv.play) {
        cv.playbackRate = this.playbackRate
        cv.muted = this.muted
        cv.volume = this.volume
        // this.isLive && cv.play().catch(() => cv.play())
        if (cv.currentTime >= this.curEnd) { // this.curSource.end.floorByFrame(this.frameSec, this.curSource.framerate)) {
          this.onended()
        } else {
          if (cv.currentTime < this.curSource.start) {
            cv.currentTime = this.curSource.start
          }
          try {
            cv.play && cv.play().catch(() => cv.play())
          } catch (e) {
            console.log(e)
            cv.play()
          }
        }
      }
    },
    pause () {
      this.played = false
      this.paused = true
      var cv = this.curSource.video
      this.currentTime = this.currentTime // 暂停时帧对齐
      if (cv && cv.pause) {
        cv.pause()
        if (this.$store.state.system) { // 解决premiere暂停时画面不准
          cv.currentTime = cv.currentTime + 0.0001
        }
      }
    },
    nextFrame () {
      this.clearJ()
      // clearInterval(this.jid)
      this.currentTime += this.frameSec
    },
    lastFrame () {
      this.currentTime -= this.frameSec
    },
    toStart () {
      this.clearJ()
      // clearInterval(this.jid)
      this.currentTime = 0
    },
    toEnd () {
      this.clearJ()
      this.pause()
      // clearInterval(this.jid)
      this.currentTime = this.frameDuration
    },
    setTime (time) {
      this.pause()
      this.currentTime = time
    },
    seek (event, flag) {
      this.clearJ()
      // clearInterval(this.jid)
      var x = Math.min(this.$refs.progressBar.clientWidth, Math.max(event.x - $(this.$refs.progressBar).offset().left, 0))
      this.currentTime = (this.duration * x / this.$refs.progressBar.clientWidth).floorByFrame(this.frameSec)
      // this.curVideoTime = this.curSource.video.currentTime
      if (!flag) {
        window.addEventListener('mousemove', this.mousemove)
        window.addEventListener('mouseup', this.mouseup, true)
      }
    },
    mousemove: util.throttle(50, function (event) {
      this.seek(event, true)
    }),
    mouseup () {
      window.removeEventListener('mousemove', this.mousemove)
      window.removeEventListener('mouseup', this.mouseup)
    },
    onprogress (event) {
      var total = 0
      for (let i = 0, len = event.target.buffered.length; i < len; i++) {
        total += event.target.buffered.end(i)
      }
      var source = this.options.source.find(item => item.video === event.target)
      if (source) {
        source.buffered = Math.max(total, source.buffered)
      }
      // this.curSource.video.currentTime = this.curVideoTime
      console.log('onprogress')
    },
    ontimeupdate (event) {
      // 倒放的时候要预处理上一个video 把时间设置到最后

      console.log('ontimeupdate' + event.target.currentTime)
    },
    onended (event) {
      if (this.isJ) return
      if (this.curIndex < this.length - 1) {
        if (this.curSource.video.currentTime >= this.curEnd) {
          this.curSource.video.currentTime = this.curSource.start
          this.curSource.video.pause()
          this.curIndex++
          this.curSource.video.currentTime = this.curSource.start
          this.played ? this.play() : this.pause()
        } else {
          console.log('may be dispatch more than once update')
        }
      } else {
        this.pause()
        if (this.curSource.video.currentTime > this.curEnd) { // this.curSource.end.floorByFrame(this.frameSec, this.curSource.framerate)) {
          this.curSource.video.currentTime = this.curEnd.fix(6) // add fix(6) to resolve plugin can not to end
        }
      }

      console.log('onended')
    },
    onplaying (event) {
      console.log('onplaying')
    },
    onwaiting (event) {
      console.log('onwaiting')
    },
    oncanplaythrough (event) {
      if (event.target === this.curSource.video && this.played && event.target.paused) {
        // this.curSource.video.currentTime = this.curVideoTime
        this.curSource.video.play()
      }
      console.log('oncanplaythrough')
    },
    onplay (event) {
      console.log('onplay')
    },
    onpause (event) {
      if (event.target === this.curSource.video && this.played && event.target.paused) {
        this.play()
      }
      console.log('onpause')
    },
    oncanplay (event) {
      if (event.target === this.curSource.video && this.played && event.target.paused) {
        // this.curSource.video.currentTime = this.curVideoTime
        this.curSource.video.play()
      }
      console.log('oncanplay')
    },
    onloadeddata (event) {
      var total = 0
      for (let i = 0, len = event.target.buffered.length; i < len; i++) {
        total += event.target.buffered.end(i)
      }
      var source = this.options.source.find(item => item.video === event.target)
      if (source) {
        source.buffered = Math.max(total, source.buffered)
      }
      if (this.isLive) {
        // this.duration = this.livePlayer.getActiveStream().getDuration()
      }
      console.log('onloadeddata')
    },
    onerror (event) {
      console.log('onerror')
    }
  },
  watch: {
    curMaterial (m) {
      this.$store.commit({
        type: TYPES.CLEAR_SELECTEEDMARKERS
      }) // 清空选中的mark
      this.$store.state.signMarkerIndex = 0 // 重置marker selected index
      if (m.strimout && !this.outPoint) { // 如果入出点是素材的长度是否需要不打点？
        this.ioMaterial = m
        this.addOutPoint(m.strimout)
        this.addInPoint(m.strimin)
      }
    },
    previewStatus: function (value) {
      !value && this.pause()
    },
    options: {
      deep: false,
      handler (options, oldOptions) {
        // this.dispose()
      }
    },
    'options.initTime': function (value, oldValue) {
      this.currentTime = value
    },
    'options.source': {
      deep: false,
      handler (value, oldValue) {
        var tag = this.isLive ? 'liveVideo' : 'video'
        oldValue.forEach(item => {
          if (item.video.removeEventListener) {
            this.unbindEvents(item.video)
          }
          var sameSource = value.find(i => i.src === item.src && i.start === item.start)
          if (sameSource) {
            var index = sameSource.index
            var vs = sameSource.videostandard
            var nt = sameSource.ntsctcmode
            Object.assign(sameSource, item)
            sameSource.index = index
            sameSource.videostandard = vs
            sameSource.ntsctcmode = nt
            if (this.fullscreenSymbol) {
              sameSource.operations && sameSource.operations.remove('FullScreen')
              sameSource.operations && sameSource.operations.add('Exit FullScreen')
            }
          } else {
            clearInterval(item.id)
          }
        })
        if (value.length !== oldValue.length) {
          this.initialize()
        }
        this.$nextTick(() => {
          value.forEach(item => {
            item.video = this.$refs[tag + item.index][0]
            this.options.isLive && this.initLivePlayer(item)
            this.bindEvents(item.video)
            if (value.length === oldValue.length && value.map(v => v.guid).join('') === oldValue.map(v => v.guid).join('')) {
            } else {
              item.video.currentTime = item.start + (this.roundBit === 6 ? 0.0001 : 0)
            }
          })
        })
      }
    },
    fullscreenSymbol: function () {
      this.calcWidth()
    },
    curIndex: {
      deep: false,
      handler (value, oldValue) {
        this.$emit('change', value)
        var lastVideo = this.options.source[oldValue]
        var curVideo = this.options.source[value]
        var nextVideo = this.options.source[value + 1]
        if (lastVideo && lastVideo.video && !lastVideo.video.paused) {
          lastVideo.video.pause()
        }
        if (nextVideo && nextVideo.video) {
          nextVideo.video.currentTime = nextVideo.start // 同步时间，避免画面卡顿
        }
        if (curVideo && curVideo.video) {
          curVideo.video.playbackRate = this.playbackRate
          curVideo.video.muted = this.muted
          curVideo.video.volume = this.volume
        }
        this.calcWidth()
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
