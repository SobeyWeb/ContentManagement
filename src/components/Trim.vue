<template>
  <div class="save_clip_container clearfix">
    <div class="save_clip_content">
      <div class="save_clip_item format" v-if="option.isSaveFrame">
        <span class="save_clip_title">Format</span>
        <rd-radio-group class="save_clip_value" :radios="radios"></rd-radio-group>
      </div>
      <div class="save_clip_item format">
        <span class="save_clip_title">Title</span>
        <input class="save_clip_input save_clip_value" :title="option.title" v-model="option.title" maxlength="255" @keyup="volidInput($event,1)" checkchar="true" type="text">
      </div>
      <div class="save_clip_item format">
        <span class="save_clip_title">Rights</span>
        <input v-model="option.note" :title="option.note" class="save_clip_input save_clip_value" maxlength="256" @keyup="volidInput($event,2)" />
      </div>
      <div class="save_clip_item format">
        <span class="save_clip_title">Comments</span>
        <input v-model="option.comments" :title="option.comments" class="save_clip_input save_clip_value" maxlength="1000" @keyup="volidInput($event,3)" />
      </div>
      <div class="save_clip_item format">
        <span class="save_clip_title">Destination</span>
        <input class="save_clip_input save_clip_value" :title="displayPath" type="text" v-model="displayPath" readonly="readonly">
        <div class="save_clip_path_container">
          <vue-nice-scrollbar class="folder_box" :speed="150" id="save_clip_folder_box" style="height: 100%">
            <div class="clearfix">
              <tree-ctrl5 :data="node" v-for="node in copiedLinkNodes" :callback="callback" :key="node.guid"></tree-ctrl5>
              <tree-ctrl2 :data="node" v-for="node in saveNodes" :callback="callback" :key="node.guid"></tree-ctrl2>
            </div>
          </vue-nice-scrollbar>
        </div>
      </div>
    </div>
    <div class="save_clip_bottom fr">
      <rd-button type="" @click="saveNewclip">Confirm</rd-button>
      <rd-button type="" @click="cancel">Cancel</rd-button>
    </div>
  </div>
</template>

<script>
import { volidInput, Notice } from '../lib/util'
import appSetting from '../config/appSetting'
import Guid from '../lib/Guid'
import { GetEntityType } from '../../../lib/transform'
import { GetMillSecondsByFrameNum, GetSkipFrameByVideoStandard } from '../../../lib/format'
import TYPES from '../dicts/mutationTypes'
import SaveFolderTree from './common/SaveFolderTree.vue'
import SaveQuickLink from './common/SaveQuickLink.vue'
export default {
  name: 'save_clip_ctrl',
  data () {
    return {
      radios: [
        {
          checked: true,
          value: 'BMP'
        },
        {
          checked: false,
          value: 'JPG'
        }
      ],
      copiedLinkNodes: []
    }
  },
  computed: {
    option () {
      return this.$store.state.exportInfo
    },
    material () {
      return this.option.material
    },
    saveNodes () {
      return this.$store.state.publicPath
    },
    linkNodes () {
      return this.$store.state.linkNodes
    },
    displayPath () {
      return this.option.path.replace('global_sobey_defaultclass/MaterialList/', 'Network/').replace(/\//g, ' / ')
    },
    lastSeletedNode () {
      return this.$store.state.lastSeletedNode
    }
  },
  watch: {
    lastSeletedNode: {
      deep: false,
      handler (newVal, oldVal) {
        oldVal.checked = false
        this.callback(this.lastSeletedNode)
      }
    },
    'lastSeletedNode.path': {
      deep: false,
      handler (newVal, oldVal) {
        this.callback({ path: newVal })
      }
    },
    linkNodes: {
      deep: true,
      handler () {
        this.copiedLinkNodes = this.linkNodes.map(item => ({
          name: item.name,
          selected: item.selected,
          checked: item.checked,
          open: item.open,
          renaming: item.renaming,
          selecting: item.selecting,
          operations: [],
          guid: item.guid,
          floor: item.floor,
          folders: [],
          type: item.type
        }))
        this.copiedLinkNodes.forEach((item, index) => {
          item.folders = this.linkNodes[index].folders.map(item => ({
            name: item.name,
            selected: item.selected,
            checked: item.checked,
            open: item.open,
            folderpath: item.folderpath,
            path: item.path,
            renaming: item.renaming,
            selecting: item.selecting,
            operations: [],
            guid: item.guid,
            isDing: item.isDing,
            floor: item.floor,
            type: item.type
          }))
        })
        if (this.lastSeletedNode.isDing) {
          this.copiedLinkNodes[0].folders.forEach(item => {
            if (item.guid === this.lastSeletedNode.guid) {
              item.checked = true
              this.$store.state.lastSeletedNode.checked = false
              this.$store.state.lastSeletedNode = item
              this.callback(item)
            }
          })
        }
      }
    }
  },
  components: {
    'save-folder-tree': SaveFolderTree,
    'save-quick-lin': SaveQuickLink
  },
  methods: {
    cancel () {
      this.$store.state.saveClipWindow.hide()
    },
    callback (data) {
      this.option.path = data.path
    },
    volidInput (event, type) {
      var maxLength = event.target.attributes.maxlength.nodeValue
      var Val = volidInput(event.target.value, parseInt(maxLength), event.target, type !== 1, type === 3 ? 'Comments' : type !== 1 ? 'Rights' : 'Name')
      if (type === 1) {
        this.option.title = Val
      } else if (type === 3) {
        this.option.comments = Val
      } else {
        this.option.note = Val
      }
    },
    saveNewclip () {
      var _this = this
      var saveData = this.option
      if (!saveData.title) {
        Notice.warning('The Title and Destination is required!', '', 3000)
        return
        // saveData.name = this.saveData.tempName //this.name
      }
      if (!saveData.path) {
        saveData.path = this.material.folderpath
      }
      if (saveData.path === appSetting.OAPATH || saveData.path === appSetting.PreSNSPublishPath || saveData.path.indexOf(appSetting.OAPATH) >= 0) {
        Notice.warning('The file is not allowed to operate, please select the path again!', '', 3000) // this.saveData.name
        return
      }
      var fileSize = 0
      var currentSurplusSpace = 0 // 表示剩余空间
      var source = {
        'type': this.material.typeid,
        'guid': this.material.guid
      }
      this.cancel()
      Promise.all([_this.$store.dispatch({ // 获取素材空间信息
        type: TYPES.GET_FILESIZE,
        source: source
      }).then((result) => {
        var res = result.data
        if (res) {
          if (res.code === '0') {
            var size = res.ext
            if (size) {
              fileSize = size // 空间 换算成MB
            }
          }
        }
      }).catch((re) => {

      }), _this.$store.dispatch({
        type: TYPES.GET_USERSPACE,
        data: {
          usertoken: _this.$store.state.userInfo.usertoken,
          loginName: _this.$store.state.userInfo.username
        }
      }).then((re) => {
        var StorageData = re.ext
        var storagesize = StorageData.storagesize // 总空间
        var storageusage = StorageData.storageusage // 已使用空间
        // var storagewarningpct = StorageData.storagewarningpct //预警值
        if (storagesize === -1) {
          // -1表示不受限制
          currentSurplusSpace = -1
        } else {
          currentSurplusSpace = storagesize - storageusage
        }
      }).catch((re) => {

      })]).then(() => {
        if (currentSurplusSpace !== -1 && currentSurplusSpace < fileSize) {
          Notice.warning('There is no enough space for the operation!', '', 3000)
        } else {
          // var currentData = this.$store.state.previewMaterials[0]
          // var clipId = currentData.guid
          // var cliptype = currentData.guid
          this.$store.dispatch({
            type: TYPES.GET_OBJECT_INFO,
            data: {
              contentid: this.material.guid,
              pathtype: 'unc',
              type: this.material.typeid
            }
          }).then((result) => {
            var newGuid = Guid.NewGuid().ToString('N')
            var Clipdata = result.data.ext

            if (this.$store.state.exportInfo.isSaveFrame) {
              let obj = Clipdata
              // merge data
              obj.entity.folderpath = this.option.path
              obj.entity.guid = newGuid
              obj.entity.modifyterminal = this.$store.state.userInfo.ip
              obj.entity.creator = this.$store.state.userInfo.usercode
              obj.entity.name = this.option.title.trim()
              obj.entity.status = 0
              obj.entity.subtype = 32
              obj.entity.type = 32
              obj.entity.rights = this.option.note
              obj.entity.note = this.option.comments
              obj.entity.usedflag = 0
              obj.entity.item.capturestatus = 0
              obj.entity.item.videostandard = 16
              obj.entity.item.trimin = 0
              obj.entity.item.trimout = 40000000
              obj.entity.item.length = 863999600000
              this.$store.dispatch({
                type: TYPES.SAVE_FRAME_AS_CLIP,
                data: {
                  filename: this.$store.state.exportInfo.file.filename,
                  iconno: this.$store.state.exportInfo.iconno,
                  extendname: this.radios.find(item => item.checked).value.toLowerCase(),
                  fileformatid: this.$store.state.exportInfo.file.formatid,
                  json: {
                    type: 'biz_sobey_picture',
                    version: 1,
                    object: obj
                  }
                }
              }).then(res => {
                Notice.success('save picture success', '', 3000)
              }).catch(res => {
                Notice.warning('save picture failed', '', 3000)
              })
              return
            }

            var timeIn = this.$store.state.exportInfo.TRIMIN
            var timeOut = this.$store.state.exportInfo.TRIMOUT
            if ((timeIn === timeOut) && (timeOut !== -1)) {
              timeOut = parseInt(timeIn) + 1
            }
            // 除mark点外赋值及将id赋为��?
            var deleteMarkers = []
            var isDeleteAllMarker = false
            Clipdata.entity.name = this.option.title.trim()
            Clipdata.entity.iconframe = 0
            // 去掉两个节点，让后台重新抽首帧图
            delete Clipdata.entity.iconfilename
            Clipdata.entity.rights = this.option.note
            Clipdata.entity.note = this.option.comments
            Clipdata.entity.creator = this.$store.state.userInfo.usercode

            Clipdata.entity.folderpath = this.option.path
            Clipdata.entity.id = '' // 避免重复
            var oldObj = JSON.parse(JSON.stringify(Clipdata)) // for 采集中的save as
            oldObj.entity.item.length = this.$store.state.exportInfo.liveLength // 采集中素材的长度
            if (this.$store.state.exportInfo.isMarks2Clip) {
              delete Clipdata.streammedia
              var markers = this.$store.state.exportInfo.material.markers.values.filter(i => !i.markguid)
              Clipdata.entity.item.markpoints.push(...markers)
              // if (!cliping && IsSendMPCFlow) {
              //   Clipdata.entity.item.capturestatus = 32
              // }
              this.$store.dispatch({
                type: TYPES.MARKERS_TO_CLIP,
                data: {
                  isLive: this.$store.state.exportInfo.isLive,
                  object: Clipdata, // this.$store.state.exportInfo.isLive ? oldObj : Clipdata,
                  version: 1,
                  type: GetEntityType(Clipdata.entity.type, Clipdata.entity.subtype)
                }
              }).then((res) => {
                Notice.success('Save new clip successfully', '', 3000)
              }).catch(() => Notice.failed('Failed to save new clip', '', 3000))
              return
            }
            Clipdata.entity.guid = newGuid
            //  Clipdata.entity.guid = Guid.NewGuid().ToString("N") //避免重复

            if ((timeIn === '' || timeIn === -1) && (timeOut === '' || timeOut === -1)) {
              var obj = Clipdata
              var guid = _this.material.guid
              Clipdata.entity.item.markpoints && Clipdata.entity.item.markpoints.forEach(item => item.objectguid = newGuid)
              // delete obj.entity.guid
              this.$store.dispatch({
                type: this.$store.state.exportInfo.isRetrieve ? TYPES.COPY_OBJECT : TYPES.SAVE_AS_NEWCLIP, //  SAVE_OBJECT_INFO
                data: {
                  isLive: this.$store.state.exportInfo.isLive,
                  trimin: 0,
                  trimout: this.$store.state.exportInfo.TRIMOUT,
                  nanoSecIn: 0,
                  nanoSecOut: this.$store.state.exportInfo.liveLength,
                  object: this.$store.state.exportInfo.isLive || !this.$store.state.exportInfo.isRetrieve ? oldObj : obj,
                  version: 1,
                  type: GetEntityType(obj.entity.type, obj.entity.subtype)
                },
                source: {
                  guid: guid
                },
                target: {
                  path: Clipdata.entity.folderpath
                }
              }).then(res => {
                if (this.$store.state.exportInfo.isRetrieve) {
                  var contentid = res.data.ext // .contentid
                  this.$store.dispatch({
                    type: TYPES.PART_RETRIEVE,
                    data: {
                      contentid: this.material.guid,
                      newcontentid: contentid,
                      trimin: 0,
                      trimout: parseInt(this.material.duration * 10000000)
                    }
                  })
                } else {
                  Notice.success('save as new clip success', '', 3000)
                }
              }).catch(res => {
                if (this.$store.state.exportInfo.isRetrieve) {
                  Notice.warning('Failed to retrieve', '', 3000)
                } else {
                  Notice.warning('save as new clip failed', '', 3000)
                }
                // util.Notice.warning('save as new clip failed', '', 3000)
              })
            } else {
              if (Clipdata.entity.item) {
                if (Clipdata.entity.item.markpoints) {
                  var newMarkpoints = []
                  deleteMarkers = Clipdata.entity.item.markpoints.map(item => item.markguid)
                  for (var i = 0; i < Clipdata.entity.item.markpoints.length; i++) {
                    // 处理mark��?
                    var marker = Clipdata.entity.item.markpoints[i]
                    marker.objectguid = newGuid
                    if (marker.markguid !== undefined) {
                      marker.markguid = ''
                    }
                    if (marker.type === 4) {
                      // 入出点包住marker��?
                      if (timeIn <= marker.keyframe && timeOut >= marker.endkeyframe) {
                        marker.keyframe = marker.keyframe - timeIn
                        marker.endkeyframe = marker.endkeyframe - timeIn
                        newMarkpoints.push(marker)
                      } else if (timeIn >= marker.keyframe && timeOut <= marker.endkeyframe) {
                        marker.keyframe = 0 // marker段包住入出点
                        marker.endkeyframe = timeOut - timeIn
                        newMarkpoints.push(marker)
                      } else if (timeIn < marker.endkeyframe && timeIn >= marker.keyframe) {
                        marker.keyframe = 0 // marker段只包住入点
                        marker.endkeyframe = marker.endkeyframe - timeIn
                        newMarkpoints.push(marker)
                      } else if (timeOut <= marker.endkeyframe && timeOut > marker.keyframe) {
                        marker.keyframe = marker.keyframe - timeIn
                        marker.endkeyframe = timeOut - timeIn
                        newMarkpoints.push(marker)
                      }
                    } else if (marker.keyframe < timeOut && marker.keyframe >= timeIn) {
                      if (marker.type === 65536) {
                        var start = marker.keyframe - marker.startframe
                        var end = marker.keyframe + marker.endkeyframe

                        marker.startframe = start < timeIn ? marker.keyframe - timeIn : marker.startframe
                        marker.endkeyframe = end > timeOut ? timeOut - marker.keyframe : marker.endkeyframe
                      }
                      marker.keyframe = marker.keyframe - timeIn
                      newMarkpoints.push(marker)
                    }
                  }
                  if (deleteMarkers.length && !newMarkpoints.length) {
                    isDeleteAllMarker = true
                  }
                  Clipdata.entity.item.markpoints = newMarkpoints
                }
              }
              delete Clipdata.streammedia

              var videostandard = Clipdata.entity.item.videostandard

              if (videostandard !== undefined) {
                // timeIn = parseInt(timeIn)
                timeIn = parseInt(this.$store.state.exportInfo.INPOINT)

                // timeOut = parseInt(this.$store.state.exportInfo.outPoint)
                // 纠正整段回迁时候少一帧的问题
                var _outext = parseInt(GetMillSecondsByFrameNum(timeOut + GetSkipFrameByVideoStandard(videostandard), videostandard, '') * 10000000)
                if (_outext >= Clipdata.entity.item.trimout + Clipdata.entity.item.length) {
                  timeOut = Clipdata.entity.item.trimout + Clipdata.entity.item.length
                } else {
                  timeOut = parseInt(this.$store.state.exportInfo.OUTPOINT)
                  // timeOut = parseInt(GetMillSecondsByFrameNum(timeOut, videostandard, "") * 10000000)
                }

                var MarkIn = parseInt(timeIn)
                var length = parseInt(timeOut - timeIn)
                var MarkOut = parseInt(timeIn + length)
                // 开始赋��?
                Clipdata.entity.item.trimin = 0
                Clipdata.entity.item.length = length
                Clipdata.entity.item.trimout = length

                var oldVtrin = Clipdata.entity.item.vtrin
                var oldVtrout = Clipdata.entity.item.vtrout

                if (oldVtrin !== undefined) {
                  Clipdata.entity.item.vtrin = MarkIn + oldVtrin
                } else {
                  var _item = Clipdata.entity.item
                  _item = JSON.stringify(_item)
                  var str = _item.substring(1, _item.length)
                  _item = '{"vtrin": "' + MarkIn + '",'
                  _item += str
                  _item = JSON.parse(_item)
                  Clipdata.entity.item = _item
                }

                if (oldVtrout !== undefined) {
                  Clipdata.entity.item.vtrout = MarkOut + oldVtrout
                } else {
                  _item = Clipdata.entity.item
                  _item = JSON.stringify(_item)
                  str = _item.substring(1, _item.length)
                  _item = '{"vtrout": "' + MarkOut + '",'
                  _item += str
                  _item = JSON.parse(_item)
                  Clipdata.entity.item = _item
                }
                var saveFlag = true
                if (Clipdata.entity.item.clipfile !== undefined) {
                  var newClipFile = []
                  var len = Clipdata.entity.item.clipfile.length
                  var oldClipfile = Clipdata.entity.item.clipfile
                  if (len && Clipdata.entity.item.clipfile[0].clipin > 0) {
                    timeIn += Clipdata.entity.item.clipfile[0].clipin
                    timeOut += Clipdata.entity.item.clipfile[0].clipin
                  }
                  for (var j = 0; j < len; j++) {
                    // 文件的入出点包住打的入出��?
                    if (Clipdata.entity.item.clipfile[j].clipin <= timeIn && Clipdata.entity.item.clipfile[j].clipout >= timeOut) {
                      Clipdata.entity.item.clipfile[j].filein += timeIn - Clipdata.entity.item.clipfile[j].clipin
                      Clipdata.entity.item.clipfile[j].clipin = 0
                      Clipdata.entity.item.clipfile[j].clipout = length
                      Clipdata.entity.item.clipfile[j].length = length
                      Clipdata.entity.item.clipfile[j].fileout = Clipdata.entity.item.clipfile[j].filein + length
                      newClipFile.push(Clipdata.entity.item.clipfile[j])
                    } else if (Clipdata.entity.item.clipfile[j].clipin >= timeIn && Clipdata.entity.item.clipfile[j].clipout <= timeOut) {
                      Clipdata.entity.item.clipfile[j].clipin = Clipdata.entity.item.clipfile[j].clipin - timeIn
                      Clipdata.entity.item.clipfile[j].clipout = Clipdata.entity.item.clipfile[j].clipout - timeIn
                      newClipFile.push(Clipdata.entity.item.clipfile[j])
                    } else if (Clipdata.entity.item.clipfile[j].clipin >= timeIn && Clipdata.entity.item.clipfile[j].clipout >= timeOut && Clipdata.entity.item.clipfile[j].clipin <= timeOut) {
                      Clipdata.entity.item.clipfile[j].clipin = Clipdata.entity.item.clipfile[j].clipin - timeIn
                      Clipdata.entity.item.clipfile[j].clipout = timeOut - timeIn // 文件的入点被打的入出点包��?
                      Clipdata.entity.item.clipfile[j].length = Clipdata.entity.item.clipfile[j].clipout - Clipdata.entity.item.clipfile[j].clipin
                      Clipdata.entity.item.clipfile[j].fileout = Clipdata.entity.item.clipfile[j].filein + Clipdata.entity.item.clipfile[j].length
                      newClipFile.push(Clipdata.entity.item.clipfile[j])
                    } else if (Clipdata.entity.item.clipfile[j].clipin <= timeIn && Clipdata.entity.item.clipfile[j].clipout <= timeOut && Clipdata.entity.item.clipfile[j].clipout >= timeIn) {
                      Clipdata.entity.item.clipfile[j].filein = Clipdata.entity.item.clipfile[j].filein + timeIn - Clipdata.entity.item.clipfile[j].clipin
                      Clipdata.entity.item.clipfile[j].clipin = 0 // 文件的出点被打的入出点包��?
                      Clipdata.entity.item.clipfile[j].clipout = Clipdata.entity.item.clipfile[j].clipout - timeIn
                      Clipdata.entity.item.clipfile[j].length = Clipdata.entity.item.clipfile[j].clipout
                      newClipFile.push(Clipdata.entity.item.clipfile[j])
                    }
                  }
                  Clipdata.entity.item.clipfile = this.$store.state.exportInfo.isLive ? oldClipfile : newClipFile
                  if (Clipdata.entity.modifyterminal !== undefined) {
                    Clipdata.entity.modifyterminal = this.$store.state.userInfo.ip
                  } else {
                    var entity = Clipdata.entity
                    entity = JSON.stringify(entity)
                    str = entity.substring(1, entity.length)
                    entity = '{"modifyterminal": "' + this.$store.state.userInfo.ip + '",'
                    entity += str
                    entity = JSON.parse(entity)
                    Clipdata.entity = entity
                  }

                  saveFlag = true
                }
                if (saveFlag) {
                  obj = Clipdata
                  guid = _this.material.guid
                  //  delete obj.entity.guid
                  delete obj.streammedia
                  // if (!cliping && IsSendMPCFlow && !this.$store.state.exportInfo.isRetrieve) {
                  //   obj.entity.item.capturestatus = 32
                  // }
                  this.$store.dispatch({
                    type: this.$store.state.exportInfo.isRetrieve ? TYPES.COPY_OBJECT : TYPES.SAVE_AS_NEWCLIP, // SAVE_OBJECT_INFO
                    data: {
                      isLive: this.$store.state.exportInfo.isLive,
                      trimin: this.$store.state.exportInfo.TRIMIN,
                      trimout: this.$store.state.exportInfo.TRIMOUT,
                      nanoSecIn: this.$store.state.exportInfo.INPOINT,
                      nanoSecOut: this.$store.state.exportInfo.OUTPOINT,
                      object: this.$store.state.exportInfo.isLive || !this.$store.state.exportInfo.isRetrieve ? oldObj : obj,
                      version: 1,
                      type: GetEntityType(obj.entity.type, obj.entity.subtype)
                    },
                    source: {
                      guid: guid
                    },
                    target: {
                      path: Clipdata.entity.folderpath
                    }
                  }).then(res => {
                    // exportInfo
                    isDeleteAllMarker && this.$store.dispatch({
                      type: TYPES.DELETE_MARKERPOINTS,
                      data: {
                        json: '',
                        guid: res.data.ext
                      }
                    })
                    if (this.$store.state.exportInfo.isRetrieve) {
                      var contentid = res.data.ext
                      this.$store.dispatch({
                        type: TYPES.PART_RETRIEVE,
                        data: {
                          contentid: this.material.guid,
                          newcontentid: contentid,
                          trimin: this.$store.state.exportInfo.INPOINT,
                          trimout: this.$store.state.exportInfo.OUTPOINT
                        }
                      })
                    } else {
                      Notice.success('Save as new clip success', '', 3000)
                    }
                  }).catch(res => {
                    if (this.$store.state.exportInfo.isRetrieve) {
                      Notice.warning('Failed to retrieve', '', 3000)
                    } else {
                      Notice.warning('Save as new clip failed', '', 3000)
                    }
                  }) // 打点保存
                }
              } else { // 素材的videostandard无法转码
                Notice.warning('Material videostandard does not exist can not be transcoding', '', 3000) // item.name
              }
            }
          }).catch((res) => {
            Notice.warning(res.data.msg, '', 3000)
          })
        }
      })
    }
  }
}
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style scoped>
.save_clip_container {
  width: 550px;
  background: #222;
  padding: 10px 20px 15px;
}

.save_clip_path_container {
  height: 200px;
  width: 80%;
  left: 19%;
  position: relative;
  border: 1px solid #000;
  margin: 5px 0;
}

.save_clip_title {
  width: 19%;
  margin: 5px 0;
  display: inline-block;
}

.save_clip_input {
  font-size: 0.9rem;
  line-height: 1.7rem;
  color: #cfd2d4;
  background-color: #000;
  background-image: none;
  border: none;
  border-radius: 4px;
  padding: 0.1rem 0.5rem;
  height: 32px;
  outline: none;
  resize: none;
  box-sizing: border-box;
  transition: border-color 0.3s ease-in;
}

.save_clip_value {
  width: 80%;
  margin: 5px 0;
  display: inline-block;
}

.save_clip_bottom {
  margin-top: 10px;
}
</style>
