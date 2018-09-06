<template>
  <div class="sv_marker_list">
    <div class="sv_marker_title_box">
      <span>Mark Point</span>
    </div>
    <div class="sv_marker_nav clearfix">
      <div :class="{markSelected: esMarkerSymbol}" class="sv_marker_nav_item fl" v-on:click="esMarkerSymbol = !esMarkerSymbol">Essence Mark</div>
      <div :class="{markSelected: scMarkerSymbol}" class="sv_marker_nav_item fl" v-on:click="scMarkerSymbol = !scMarkerSymbol">Scence Mark</div>
      <div :class="{markSelected: chMarkerSymbol}" class="sv_marker_nav_item fl" v-on:click="chMarkerSymbol = !chMarkerSymbol">Change Mark</div>
      <div :class="{markSelected: loMarkerSymbol}" class="sv_marker_nav_item fl" v-on:click="loMarkerSymbol = !loMarkerSymbol">Logging Mark</div>
    </div>
    <div class="filter_container">
      <input v-focus type="text" class="filter_input" v-model="condition" placeholder="input keywords to filter" @keydown.esc.prevent.stop="condition=''" />
      <span class="clear_btn" v-show="condition" @click.stop.prevent="condition=''"></span>
    </div>
    <vue-nice-scrollbar :speed="150" style="height:calc(100% - 70px);">
      <div class="sv_marker_box">
        <sv-marker-ctrl v-on:marker="markerClick" @delete="deleteMarker" @save="saveMarker" :m="material" :data="m" :disabled="!editing" v-for="m in markerList" :key="m.markguid" :markers="markerList">
        </sv-marker-ctrl>
      </div>
    </vue-nice-scrollbar>
  </div>
</template>

<script>
import Marker from './Marker'
import TYPES from '../../../dicts/mutationTypes'
export default {
  name: 'mark_list_ctrl',
  props: {
    options: {
      type: Object,
      required: true
    },
    tab: {
      type: Object,
      required: true
    },
    material: {
      type: Object,
      required: true
    },
    editing: {
      type: Boolean,
      required: true
    }
  },
  data () {
    return {
      esMarkerSymbol: true,
      scMarkerSymbol: true,
      chMarkerSymbol: true,
      loMarkerSymbol: true,
      condition: ''
    }
  },
  components: {
    'sv-marker-ctrl': Marker
  },
  computed: {
    focused () {
      return this.$store.state.isFocusPlayer
    },
    markerList () {
      return this.options.values.filter(item => this[item.tag + 'Symbol'] && (this.regExp.test(item.text) || (item.isLMarker && (item._extendinfo.some(i => {
        if (i[0].itemtype < 2) {
          return i.some(j => j.itemvalue.some(m => this.regExp.test(m.itemvalue)))
        } else {
          return i.some(j => j.itemvalue.filter(n => n.languageid === this.lmLanguage).some(m => this.regExp.test(m.itemvalue)))
        }
      })))))
    },
    regExp () {
      var cond = this.condition.trim()
      if (cond) {
        var regStr = '^'
        var condArr = cond.split('*')
        condArr.forEach((item, index) => {
          if (item !== '' || !index) {
            regStr += item.replace(/\s+/, '\\s+')
            regStr += '.*'
          }
        })
        return new RegExp(regStr, 'i')
      } else {
        return /.*/
      }
    },
    lmLanguage () {
      return this.$store.state.defaultLanguage
    }
  },
  methods: {
    saveMarker (type, tempMarker) {
      var markers = this.markerList
      if (type !== 'add') {
        markers = markers.filter(item => item.markguid)
      } else {
        markers = markers.filter(item => !item.markguid)
      }
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
        if (item.markguid) {
          m.markguid = item.markguid
        }
        return m
      })
      this.$store.dispatch({
        type: TYPES.UPDATE_MARKERPOINTS,
        data: {
          json: json,
          guid: this.material.guid
        }
      }).then(res => {
        console.log('save success')
      }).catch(res => {
        console.log('save failed')
      })
    },
    deleteMarker (marker) {
      var markers = this.options.values
      markers.remove(marker)
    },
    markerClick (marker) {
      this.$emit('markerclick', marker)
    }
  },
  mounted () {
    var _this = this
    window.addEventListener('keydown', function (event) {
      if (document.querySelector('.h5')) {
        return // 弹窗不支持快捷键
      }
      var keycode = event.keyCode
      var targetTag = event.target.tagName.toUpperCase()
      if (_this.focused && targetTag !== 'INPUT' && targetTag !== 'TEXTAREA' && _this.tab.name === 'Marks') {
        // if (event.shiftKey) {
        //   var selectedMarkers = _this.$store.getters.orderedSelectedMaterials
        //   if (selectedMaterials.length) {
        //     if (keycode == 37 || keycode == 38) {
        //       _this.tempIndex = _this.materials.indexOf(selectedMaterials[0])
        //     } else {
        //       _this.tempIndex = _this.materials.indexOf(selectedMaterials[selectedMaterials.length - 1])
        //     }
        //   } else {
        //     _this.tempIndex = _this.$store.state.signIndex
        //   }
        // }
        if (keycode === 65 && event.ctrlKey) {
          _this.$store.commit({
            type: TYPES.CLEAR_SELECTEEDMARKERS
          })
          _this.markerList.forEach(item => {
            item.selected = true
            _this.$store.commit({
              type: TYPES.ADD_SELECTEDMARKER,
              data: item
            })
          })
        }
        // 因为mark点有筛选功能，暂时不提供上下多选 后期再来做
        // if (keycode == 38) { //up
        //   if (event.ctrlKey && event.shiftKey) {
        //     _this.$store.dispatch({
        //       type: types.MULTI_SELECTITEMS,
        //       data: _this.tempIndex - rowCount
        //     })
        //   } else if (!event.ctrlKey && event.shiftKey) {
        //     _this.$store.commit({
        //       type: types.CLEAR_SELECTEEDITEMS
        //     })
        //     _this.$store.dispatch({
        //       type: types.MULTI_SELECTITEMS,
        //       data: _this.tempIndex - rowCount
        //     })
        //   } else {
        //     _this.$store.dispatch({
        //       type: types.SELECT_MATERIAL,
        //       data: _this.$store.state.signIndex - rowCount
        //     })
        //   }
        //
        // } else if (keycode == 40) { //down
        //   if (event.ctrlKey && event.shiftKey) {
        //     _this.$store.dispatch({
        //       type: types.MULTI_SELECTITEMS,
        //       data: _this.tempIndex + rowCount
        //     })
        //   } else if (!event.ctrlKey && event.shiftKey) {
        //     _this.$store.commit({
        //       type: types.CLEAR_SELECTEEDITEMS
        //     })
        //     _this.$store.dispatch({
        //       type: types.MULTI_SELECTITEMS,
        //       data: _this.tempIndex + rowCount
        //     })
        //   } else {
        //     _this.$store.dispatch({
        //       type: types.SELECT_MATERIAL,
        //       data: _this.$store.state.signIndex + rowCount
        //     })
        //   }
        // }
      }
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.sv_marker_list {
  position: relative;
  width: 100%;
  height: 100%;
}

.sv_marker_title_box {
  line-height: 40px;
  height: 40px;
  box-sizing: border-box;
  font-size: 15px;
  color: #9b9b9b;
  padding: 0 10px;
  background-color: #2d2d2d;
  text-transform: uppercase;
  border-bottom: 1px solid #1a1a1a;
  border-top: 1px solid #1a1a1a;
  display: none;
}

.sv_marker_nav {
  line-height: 35px;
  padding: 5px 0;
}

.sv_marker_nav_item {
  display: inline-block;
  background-color: #424242;
  width: 146px;
  font-size: 12px;
  line-height: 25px;
  height: 25px;
  text-align: center;
  margin: 0 1px;
  cursor: pointer;
  padding: 0px 1px;
  position: relative;
  z-index: 10;
  overflow: hidden;
}

.sv_marker_nav_item::before {
  content: '';
  position: absolute;
  z-index: -1;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  pointer-events: none;
  background: #b87b44;
  -webkit-transition: -webkit-transform 0.3s, opacity 0.3s;
  transition: transform 0.3s, opacity 0.3s;
  -webkit-transform: translate3d(-115%, 0, 0) skewX(40deg);
  transform: translate3d(-115%, 0, 0) skewX(40deg);
}

.markSelected.sv_marker_nav_item::before {
  opacity: 1;
  -webkit-transform: translate3d(0, 0, 0) skewX(0deg);
  transform: translate3d(0, 0, 0) skewX(0deg);
}

.filter_container {
  padding: 0 15px 5px 0;
  position: relative;
  line-height: 30px;
}

.clear_btn {
  position: absolute;
  width: 12px;
  height: 12px;
  background: url(../../../assets/images/searchbox_clean_nor.png) no-repeat
    center;
  cursor: pointer;
  top: 9px;
  right: 27px;
}

.filter_input {
  font-size: 0.9rem;
  line-height: 30px;
  color: #cfd2d4;
  background-color: #000;
  background-image: none;
  border: none;
  border-radius: 4px;
  padding: 0 24px 0 10px;
  width: 99%;
  outline: none;
  resize: none;
  box-sizing: border-box;
  transition: border-color 0.3s eas;
}
</style>
