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
<style>
.player {
  background: #1f1f1f;
  position: relative;
  height: 100%;
}
.player_container {
  max-width: 100%;
  max-height: 100%;
  position: relative;
  background: #222;
  z-index: 2;
}
.video-item {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.video-player .fullscreen {
  object-fit: fill;
}

.video-player {
  width: 100%;
  position: relative;
}

.auto_center .video-player {
  height: calc(100% - 102px);
}

.player-top {
  height: 40px;
  width: 100%;
  border-left: 1px #000 solid;
  border-bottom: 1px #000 solid;
  box-sizing: border-box;
}

.player-top .time_container {
  font-family: 'timecode_text';
  margin-right: -20px;
  font-size: 18px;
  color: #f89b39;
  transform: scale(0.8, 1);
  line-height: 40px;
}

.player-top .title_container {
  max-width: calc(100% - 290px);
  padding-left: 5px;
  padding-right: 15px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: #999999;
  font-size: 18px;
  font-family: 'pro_text', 'Microsoft YaHei', 'sans-serif';
  line-height: 40px;
}

.curtime_timecode .point_flag {
  margin: 0px -6px;
}

.gray_color {
  color: #b4b4b4;
}

.player-bottom {
  height: 46px;
  background: #2f2f2f;
  border-top: 1px #353535 solid;
  box-sizing: border-box;
}

.player-bottom .controls_container {
  /*font-family: "timecode_text";*/
  font-size: 15px;
  color: #f89b39;
  line-height: 40px;
}

.player_icon {
  border: 0;
  outline: none;
  cursor: pointer;
  display: inline-block;
  width: 30px;
  height: 45px;
  line-height: 45px;
  position: relative;
  text-align: center;
}

.prev_item {
  z-index: 3;
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  font-family: Ionicons;
  padding: 0 0.5rem;
  background: transparent;
  border-radius: 0.2rem;
  transition: background 0.3s;
  font-size: 3rem;
}

.prev_item:hover {
  background: rgba(0, 0, 0, 0.53);
}

.next_item:hover {
  background: rgba(0, 0, 0, 0.53);
}

.prev_item::before {
  content: '\F3D2';
}

.next_item::before {
  content: '\F3D3';
}

.next_item {
  z-index: 3;
  font-family: Ionicons;
  position: absolute;
  right: 0;
  top: calc(50% - 25px);
  transform: translateY(-50%);
  padding: 0 0.5rem;
  background: transparent;
  border-radius: 0.2rem;
  transition: background 0.3s;
  font-size: 3rem;
}

.in_out_div {
  position: absolute;
  height: 100%;
  background: rgba(255, 255, 255, 0.3);
}

.smark_in_out_div {
  position: absolute;
  height: 15px;
  opacity: 0.5;
  background: rgb(243, 178, 102);
}

.in_out_icon {
  width: 8px;
  height: 100%;
}

.smark_in_out_icon {
  width: 6px;
  height: 100%;
}

.in_flag {
  transform: translateX(-100%);
  background: url(../../assets/images/IN.png) no-repeat center center;
}

.out_flag {
  transform: translateX(100%);
  background: url(../../assets/images/OUT.png) no-repeat center center;
}

.smark_in_flag {
  transform: translateX(-100%);
  background: url(../../assets/images/SMark1.png) no-repeat center center;
  position: absolute;
  height: 15px;
}

.smark_out_flag {
  transform: translateX(100%);
  background: url(../../assets/images/SMark2.png) no-repeat center center;
}

.in_icon {
  background: url(../../assets/images/setin_normal.jpg) no-repeat center center;
}

.out_icon {
  background: url(../../assets/images/setout_normal.jpg) no-repeat center center;
}

.in_icon:hover {
  background: url(../../assets/images/setin_hover.jpg) no-repeat center center;
}

.out_icon:hover {
  background: url(../../assets/images/setout_hover.jpg) no-repeat center center;
}

.volume_box:hover .player_volume_container {
  visibility: visible;
}

.player_volume_container {
  background: #404040;
  z-index: 1;
  position: absolute;
  top: -76px;
  padding: 9px 8px;
  left: 50%;
  margin-left: -12px;
  visibility: hidden;
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
  border-radius: 4px;
  border: 1px #2a2a2a solid;
  transition: all 0.2s;
  transition-delay: 0.3s;
}

.volume_show {
  display: block;
}

.volume_total {
  width: 4px;
  height: 70px;
  left: 50%;
  background: #fff;
  position: relative;
  transform: translateX(-50%);
}

.volume_current {
  height: 69%;
  background: #f5a623;
  width: 100%;
  bottom: 0;
  position: absolute;
}

.volume_ball {
  width: 6px;
  background: #fff;
  height: 6px;
  position: relative;
  margin-left: 50%;
  margin-top: -3px;
  border-radius: 50%;
  transform: translateX(-50%);
  border: 1px solid #fff;
}

.play_icon {
  background: url(../../assets/images/play_normal.jpg) no-repeat center center;
  width: 45px;
  height: 45px;
}

.pause_icon {
  background: url(../../assets/images/pause_normal.jpg) no-repeat center center;
  width: 45px;
  height: 45px;
}

.to_start_icon {
  background: url(../../assets/images/tostart_normal.jpg) no-repeat center
    center;
  width: 27px;
  height: 45px;
}

.to_end_icon {
  background: url(../../assets/images/toend_normal.jpg) no-repeat center center;
  width: 27px;
  height: 45px;
}

.next_frame_icon {
  background: url(../../assets/images/nextframe_normal.jpg) no-repeat center
    center;
  width: 27px;
  height: 45px;
}

.last_frame_icon {
  background: url(../../assets/images/lastframe_normal.jpg) no-repeat center
    center;
  width: 27px;
  height: 45px;
}

.play_icon:hover {
  background: url(../../assets/images/play_over.jpg) no-repeat center center;
}

.add_marker_icon {
  background: url(../../assets/images/down_nor.png) no-repeat center center;
  width: 27px;
  height: 45px;
}

.add_marker_icon:hover {
  background: url(../../assets/images/down_over.png) no-repeat center center;
}

.set_stamp_icon {
  width: 27px;
  height: 45px;
  background: url(../../assets/images/keyfream_nor.png) no-repeat center center;
}

.set_stamp_icon:hover {
  background: url(../../assets/images/keyfream_down.png) no-repeat center center;
}

.save_icon {
  background: url(../../assets/images/save_nor.png) no-repeat center center;
}

.save_icon:hover {
  background: url(../../assets/images/save_over.png) no-repeat center center;
}

.retrieve_icon {
  background: url(../../assets/images/retrieve_nor.png) no-repeat center center;
}

.retrieve_icon:hover {
  background: url(../../assets/images/retrieve_over.png) no-repeat center center;
}

.export_icon {
  background: url(../../assets/images/export_nor.png) no-repeat center center;
  margin-left: 3px;
}

.export_icon:hover {
  background: url(../../assets/images/export_over.png) no-repeat center center;
}

.fullscreen_icon {
  background: url(../../assets/images/fullscreen_normal.png) no-repeat center
    center;
}

.fullscreen_icon:hover {
  background: url(../../assets/images/fullscreen_over.png) no-repeat center
    center;
}

.smarker_in_icon {
  width: 27px;
  height: 45px;
  background: url(../../assets/images/in_mark_nor.png) no-repeat center center;
}

.smarker_in_down_icon {
  background: url(../../assets/images/in_mark_down.png) no-repeat center center;
}

.smarker_in_icon:hover {
  background: url(../../assets/images/in_mark_down.png) no-repeat center center;
}

.smarker_out_icon {
  width: 27px;
  height: 45px;
  background: url(../../assets/images/out_mark_nor.png) no-repeat center center;
}

.smarker_out_icon:hover {
  background: url(../../assets/images/out_mark_down.png) no-repeat center center;
}

.exitFullscreen_icon {
  background: url(../../assets/images/exit_fullscreen_normal.png) no-repeat
    center center;
}

.exitFullscreen_icon:hover {
  background: url(../../assets/images/exit_fullscreen_over.png) no-repeat center
    center;
}

.volume_icon {
  display: inline-block;
  width: 27px;
  height: 35px;
  background: url(../../assets/images/volume.png) no-repeat center center;
  background-position: -81px 0px;
}

.pause_icon:hover {
  background: url(../../assets/images/pause_over.jpg) no-repeat center center;
}

.to_start_icon:hover {
  background: url(../../assets/images/tostart_over.jpg) no-repeat center center;
}

.to_end_icon:hover {
  background: url(../../assets/images/toend_over.jpg) no-repeat center center;
}

.next_frame_icon:hover {
  background: url(../../assets/images/nextframe_over.jpg) no-repeat center
    center;
}

.last_frame_icon:hover {
  background: url(../../assets/images/lastframe_over.jpg) no-repeat center
    center;
}

.video-player .progress_bar_container {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 5px;
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
  background: rgba(51, 51, 51, 0.5);
  cursor: pointer;
  z-index: 1;
}

.preview_img_container {
  width: 160px;
  height: 90px;
  position: absolute;
  top: 100px;
  overflow: hidden;
  transform: translateX(-50%);
  border-radius: 10px;
  transition: top 0.2s 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.preview_triangle {
  position: absolute;
  border-width: 10px;
  border-style: solid dashed dashed;
  border-color: #f5a623 transparent transparent;
  transform: translateX(-50%);
  top: 100px;
  transition: top 0.2s 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.progress_bar_container:hover .preview_triangle {
  top: -10px;
}

.progress_bar_container:hover .preview_img_container {
  top: -100px;
}

.video_preview_img {
  position: absolute;
  pointer-events: none;
  left: 0px;
  width: 100%;
}

.video-player:hover .progress_bar_container {
  height: 20px;
}

.progress_bar_container .buffered_progress_bar {
  background: rgba(179, 121, 15, 0.2);
  position: absolute;
  height: 100%;
  bottom: 0;
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
  border-left: 1px #07baff solid;
  box-sizing: border-box;
}

.buffered_progress_bar:nth-child(1) {
  border-left: none;
}

.progress_bar_container .slider-bar {
  background: #f5a623;
  opacity: 0.8;
  width: 0;
  position: absolute;
  left: 0;
  bottom: 0;
  height: 100%;
  cursor: pointer;
}

.es_marker_div {
  width: 9px;
  height: 15px;
  position: absolute;
  transform: translateX(-50%);
}

.ch_marker_div {
  width: 9px;
  height: 15px;
  position: absolute;
  transform: translateX(-50%);
  background: url(../../assets/images/chagemarker.png) no-repeat center;
}

.es_marker_ang {
  width: 0px;
  height: 0px;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  position: relative;
}

.es_marker_rect {
  height: 10px;
  width: 8px;
  position: relative;
}

.document_container {
  height: 360px;
}

.picture_container {
  height: 360px;
  width: 100%;
  background: #2e2e2e;
  position: relative;
}

.picture_container .picture-item {
  max-width: 100%;
  max-height: 100%;
  vertical-align: middle;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

/*.picture_container .fullscreen{
width: 100%;
}*/

.document_container embed {
  width: 100%;
  height: 100%;
}

.tab_header_container {
  position: absolute;
  z-index: 1;
  background: #464646;
  height: 38px;
  overflow: hidden;
}

.property_container {
  position: absolute;
  width: 640px;
  bottom: 0;
  top: 463px;
  transition: all 0.2s;
  transition-delay: 0.1s;
}

.property_content {
  position: absolute;
  top: 39px;
  width: 97%;
  left: 15px;
  bottom: 70px;
  overflow: auto;
}

.prop_span {
  width: 19%;
  display: inline-block;
  vertical-align: top;
  margin-top: 10px;
  height: 20px;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.prop_div {
  display: inline-block;
  width: 80%;
}

.property_table {
  margin: 0 10px;
}

.property_row {
  margin: 5px 0;
  min-height: 35px;
}

.file_row {
  white-space: nowrap;
  box-sizing: border-box;
  height: 25px;
  background: #262626;
  margin-bottom: 1px;
  position: relative;
}

.file_col {
  line-height: 25px;
  position: relative;
  text-align: center;
  text-overflow: ellipsis;
  box-sizing: border-box;
  overflow: hidden;
}

.file_row_drak {
  background: #1f1f1f;
}

.files_table {
  position: absolute;
}

.file_header {
  position: relative;
}

.file_header .list_header_item_checked {
  border: none;
}

.property_top .list_header_item {
  cursor: pointer;
  border-left: none;
  background: #222;
  border-bottom: #101010 solid 1px;
}

.property_top .list_header_item_checked {
  border-bottom: 2px solid #f5a623;
  background: #1b1b1b;
  color: #fff;
}

.files_table .list_header_item {
  border-left: #1d1d1d;
  background: #2c2c2c;
}

.files_table .list_header_item_checked {
  border-left: #1d1d1d;
  background: #2c2c2c;
}

.prop_slider {
  height: 37px;
  border-bottom: 1px #000 solid;
  position: absolute;
  z-index: 1;
  right: 0;
  width: 40px;
  background: #222;
}

.prop_icon {
  display: inline-block;
  width: 15px;
  height: 30px;
  cursor: pointer;
}

.prop_left {
  margin-top: 3px;
  background: url(../../assets/images/metadata_left_nor.png) no-repeat center;
}

.prop_right {
  margin-top: 3px;
  background: url(../../assets/images/metadata_right_nor.png) no-repeat center;
}

.prop_left:hover {
  background: url(../../assets/images/metadata_left_over.png) no-repeat center;
}

.prop_right:hover {
  background: url(../../assets/images/metadata_right_over.png) no-repeat center;
}

.property_bottom {
  position: absolute;
  bottom: 20px;
  right: 5%;
}

.dept_selection {
  background: #333;
}

.dept_tips {
  height: 20px;
  line-height: 20px;
  color: #fff;
  font-size: 14px;
  background: #444;
  padding: 5px;
}

.rights_container {
  position: relative;
  height: 100%;
}

.apply_to_all_user {
  overflow: hidden;
  position: relative;
}

.apply_to_all_materials {
  overflow: hidden;
  width: 100%;
  position: relative;
}

.dept_selection {
  overflow: hidden;
  width: 600px;
  height: calc(100% - 40px);
  position: relative;
}

.inout_timecode {
  line-height: 33px;
  color: #fff;
  width: 90px;
  padding: 2px 3px;
  margin-top: 4px;
  background: #212121;
  border-radius: 4px;
  height: 33px;
  text-align: center;
  vertical-align: middle;
}

.inout_timecode span {
  width: 19px;
}

.inout_timecode .point_flag {
  margin: 0px -3px !important;
}

.time_code_container {
  display: inline-block;
}

.tc_margin {
  position: relative;
  display: inline-block;
  top: -33px;
  left: 15px;
  width: 124px;
  text-align: center;
}

.inputclass:focus {
  background: #7b4f09;
}

.ro_inputclass:focus {
  background: rgba(0, 0, 0, 0);
}

.index_total_container {
  padding-left: 20px;
  font-size: 18px;
  text-align: center;
  line-height: 45px;
  display: inline-block;
}

.player_text {
  font-size: 18px;
  position: absolute;
  top: 71%;
  text-align: center;
  width: 100%;
  left: 0px;
  color: #979797;
}
.player_name_span {
  white-space: pre;
  word-wrap: normal;
  cursor: pointer;
}

.player_name_span:hover {
  text-decoration: underline;
}
.dv_icon {
  border-radius: 3px;
  display: inline-block;
  width: 25px;
  height: 25px;
  cursor: pointer;
  background: url(../../assets/images/resize_a_1.png) no-repeat center center;
  vertical-align: middle;
}

.dv_icon:hover {
  background: url(../../assets/images/resize_a_2.png) no-repeat center center;
}

.dv_in_icon {
  background: url(../../assets/images/resize_a_4.png) no-repeat center center;
}

.dv_in_icon:hover {
  background: url(../../assets/images/resize_a_3.png) no-repeat center center;
}
.tc_item {
  font-weight: bold;
  margin-top: 3px;
  font-size: 13px;
  cursor: pointer;
  display: inline-block;
  height: 24px;
  width: 35px;
  line-height: 25px;
  /* border-radius: 2px; */
  text-align: center;
  vertical-align: middle;
  color: #cfd2d4;
  background: #444;
}

.tc_active {
  color: #000;
  background: #f5a623;
}

.time_code_switcher {
  font-size: 0;
  float: left;
}

.time_code_area {
  /*margin: -34px -13px 0px 0px;*/
  font-family: 'timecode_text';
  font-size: 18px;
  color: #f89b39;
  transform: scale(0.8, 1);
  line-height: 40px;
  float: right;
}

.time_code_container .point_flag {
  margin: 0px -5px;
}

.tcw_container {
  background-color: rgba(29, 29, 29, 0.88);
  width: 244px;
  height: 34px;
  border: 1px solid rgba(249, 249, 249, 0.12);
  border-radius: 4px;
  position: absolute;
  line-height: 30px;
  padding: 0 5px;
  right: 0;
  z-index: 2;
}

.tc_btn {
  border-radius: 3px;
  display: inline-block;
  width: 25px;
  height: 25px;
  cursor: pointer;
  background: #505050;
  text-align: center;
  vertical-align: middle;
  margin: 8px 2px;
  line-height: 25px;
  font-weight: bold;
}

.tc_btn_active {
  background: #f5a623;
  color: #000;
}

.tc_btn:hover {
  background: #f5a623;
  color: #000;
}

.export_box:hover .player_export_container {
  visibility: visible;
}

.player_export_container {
  visibility: hidden;
  position: absolute;
  left: -125px;
  bottom: 35px;
  width: 150px;
  z-index: 1;
  background: #fff;
  transition: all 0.2s;
  transition-delay: 0.3s;
}

.export_menu_item {
  height: 25px;
  line-height: 25px;
  font-size: 14px;
  color: #333;
  text-align: left;
  padding-left: 5px;
}

.export_menu_item:hover {
  color: #fff;
  background-color: #f89b39;
}

.marker_export_container {
  width: 400px;
  height: 400px;
  background: #222;
}

.export_path_box {
  height: 27px;
}

.export_title_box {
  padding: 10px;
}

.export_title_box span {
  padding-right: 21px;
}
</style>
