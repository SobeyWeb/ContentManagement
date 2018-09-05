<template>
  <div class="property_container">
    <div class="property_top" @mousewheel.stop.prevent="moveTab">
      <tab-header-ctrl ref="propertyHeader" :headers="headers" @hswap="hswap" @hresize="hresize" @checked="checked"></tab-header-ctrl>
      <div class="prop_slider fr" v-if="headers&&headers.length>6">
        <span class="prop_left prop_icon" @click="leftMove"></span>
        <span class="prop_right prop_icon" @click="rightMove"></span>
      </div>
    </div>
    <div class="property_content">
      <keep-alive>
        <component :is="currentCtrl" :options="values" :editing="editing" @markerclick="markerclick" :material="curMaterial" :tab="curTab" :materials="materials"></component>
      </keep-alive>
    </div>
    <div class="property_bottom">
      <rd-button type="" :disabled="editing" @click="refresh">Refresh</rd-button>
      <rd-button type="" :disabled="editing||readonly" @click="modify">Modify</rd-button>
      <rd-button type="" :disabled="!editing" @click="save">Save</rd-button>
      <rd-button type="" :disabled="!editing" @click="cancel">Cancel</rd-button>
    </div>
  </div>
</template>

<script>
import Common from './Common'
import FileList from './FileList'
import MarkList from './MarkList'
import Rights from './Rights'
import TabHeader from '../../common/TabHeader'
import * as util from '../../../lib/util'
import { getRepository } from '../../../data/repository'
import TYPES from '../../../dicts/mutationTypes'
import { GetEntityType } from '../../../lib/transform'
import { GetFrameNumByHundredNS } from '../../../lib/format'
export default {
  template: '#property_ctrl',
  name: 'property_ctrl',
  data () {
    return {
      editing: false,
      curIndex: 0,
      rId: -1
    }
  },
  components: {
    'basic-prop-page-ctrl': Common,
    'file-list-ctrl': FileList,
    'mark-list-ctrl': MarkList,
    'rights-prop-ctrl': Rights,
    'tab-header-ctrl': TabHeader
  },
  computed: {
    isPremiere () {
      return this.$store.state.system
    },
    readonly () {
      return this.materials.some(item => (item.subtype === 256 || util.getAllFather(item).some(i => i.subtype === 256) || item.floor === 1 || (item.father && item.father.guid === 0) || item.readonly)) // OA  第一级的folders
    },
    currentCtrl () {
      if (this.curTab && this.curTab.name === 'File List') {
        return 'file-list-ctrl'
      } else if (this.curTab && this.curTab.name === 'Marks') {
        return 'mark-list-ctrl'
      } else if (this.curTab && this.curTab.name === 'Rights') {
        return 'rights-prop-ctrl'
      }
      return 'basic-prop-page-ctrl'
    },
    curMaterial () {
      return this.curSource && this.materials.find(item => item.guid === this.curSource.guid) || this.materials[0] || {}
    },
    materials () {
      return this.$store.state.previewOptions.materials.length ? this.$store.state.previewOptions.materials : [this.$store.state.emptyMaterial]
    },
    curSource () {
      return this.$store.state.previewOptions.source[this.curIndex]
    },
    headers () {
      return this.curMaterial.properties
    },
    lastCheckedHeaderName () {
      return this.$store.state.lastCheckedHeaderName
    },
    curTab () {
      var lastHeader
      var header = this.headers && this.headers.filter(item => item.selected)[0]
      if (!header && this.headers && this.headers.length && this.$refs.propertyHeader) {
        lastHeader = this.headers.find(item => item.name === this.lastCheckedHeaderName)
        if (lastHeader) {
          header = lastHeader
          this.$refs.propertyHeader.selectHeader(this.headers.indexOf(header))
        } else {
          this.$refs.propertyHeader.selectHeader(0, true)
          this.$refs.propertyHeader.init()
        }
      }
      return header || this.headers && this.headers[0] || {}
    },
    values () {
      var kvs = this.curTab && this.curTab.keyValues || []
      kvs.forEach && kvs.forEach(k => {
        if (util.isArray(k.value)) {
          k.value.forEach(i => {
            i.disabled = i.readonly || !this.editing
          })
        } else {
          k.disabled = k.readonly || !this.editing
          if (k.multiOption) {
            k.multiOption.disabled = k.readonly || !this.editing
          }
          if (typeof k.value === 'object' && k.value) {
            if (k.value.value) {
              k.value.disabled = k.readonly || !this.editing
            } else {
              k.value.disabled = k.value.readonly || !this.editing
            }
          }
        }
      })
      if (typeof kvs === 'object' && kvs.radio) {
        kvs.radio.forEach(item => {
          item.disabled = kvs.readonly || !this.editing
        })
        kvs.access.forEach(item => {
          item.disabled = kvs.readonly || !this.editing || !kvs.radio[2].checked
          console.log(item.disabled)
        })
        kvs.checkbox.disabled = kvs.readonly || !this.editing
        kvs.multiOption.disabled = kvs.readonly || !this.editing
      }
      return kvs
    }
  },
  methods: {
    selectHeader (name) {
      var header = this.headers.find(item => item.name === name)
      this.$refs.propertyHeader.selectHeader(this.headers.indexOf(header))
    },
    markerclick (marker) {
      this.$emit('markerclick', marker)
    },
    hswap (data) {
      console.log(data)
      // util.setCookie('props_headers' + _userToken, JSON.stringify(data.headers))
    },
    checked (header) {
      this.$store.state.lastCheckedHeaderName = header.name
      if (this.$store.state.lastCheckedHeaderName !== util.getCookie('last_header' + this.$store.state.userInfo.usercode)) {
        util.setCookie('last_header' + this.$store.state.userInfo.usercode, header.name)
      }
    },
    hresize (data) {
      console.log(data)
    },
    changeIndex (index) {
      this.curIndex = index
    },
    bakData () {
      // this.bak = JSON.parse(JSON.stringify(this.headers))
      this.materials.forEach(material => {
        var headers = material.properties
        headers.forEach(h => {
          var kvs = h.keyValues
          kvs.forEach && kvs.forEach(k => {
            if (util.isArray(k.value) && k.value.some(i => !i.readonly)) {
              k.value.forEach(v => {
                if (!v.readonly) {
                  v.bakValue = v.value
                  v.bakChecked = v.checked
                }
              })
            } else if (typeof k.value === 'object') {
              if (!k.value.readonly) {
                k.value.bakValue = k.value.value
                k.value.bakChecked = k.value.checked
              }
            } else if (!k.readonly) {
              k.bakValue = k.value
              k.bakChecked = k.checked
              if (k.multiplable) {
                k.multiOption.bakChecked = k.multiOption.checked
                k.multiBakValue = k.value
              }
            }
          })
        })
      })
    },
    bakPermission () {
      this.materials.forEach(material => {
        var headers = material.properties
        var tab = headers.find(item => item.keyValues.radio) && headers.find(item => item.keyValues.radio)
        var kvs = tab.keyValues
        if (typeof kvs === 'object' && kvs.radio && !kvs.readonly) {
          kvs.radio.forEach(k => {
            k.bakChecked = k.checked
          })
          kvs.access.forEach(k => {
            k.bakChecked = k.checked
            k.bakDeptTree = JSON.stringify(k.deptTree)
          })
          kvs.checkbox.bakChecked = kvs.checkbox.checked
          kvs.multiOption.bakChecked = kvs.multiOption.checked
          tab.multiBakvalue = JSON.stringify(kvs)
          //  kvs.bakDeptTree = JSON.stringify(kvs.deptTree)
        }
      })
    },
    bakMarkers () {
      this.materials.forEach(material => {
        var headers = material.properties
        var kvs = headers.find(item => item.name === 'Marks') && headers.find(item => item.name === 'Marks').keyValues
        if (kvs) {
          kvs.bakValues = JSON.stringify(kvs.values)
        }
      })
    },
    restoreMarkers () {
      this.materials.forEach(material => {
        var headers = material.properties
        var kvs = headers.find(item => item.name === 'Marks') && headers.find(item => item.name === 'Marks').keyValues
        if (kvs && kvs.bakValues) {
          kvs.values = JSON.parse(kvs.bakValues)
        }
      })
    },
    restorePermission () {
      this.materials.forEach(material => {
        var headers = material.properties
        var kvs = headers.find(item => item.keyValues.radio) && headers.find(item => item.keyValues.radio).keyValues
        if (typeof kvs === 'object' && kvs.radio && !kvs.readonly) {
          kvs.radio.forEach(k => {
            k.checked = k.bakChecked
          })
          kvs.access.forEach(k => {
            k.checked = k.bakChecked
            if (k.bakDeptTree) {
              k.deptTree = JSON.parse(k.bakDeptTree)
            }
          })
          kvs.checkbox.checked = kvs.checkbox.bakChecked
          kvs.multiOption.checked = kvs.multiOption.bakChecked
          // kvs.deptTree = JSON.parse(kvs.bakDeptTree)
        }
      })
    },
    restoreData () {
      this.materials.forEach(material => {
        var headers = material.properties
        headers.forEach(h => {
          var kvs = h.keyValues
          kvs.forEach && kvs.forEach(k => {
            if (util.isArray(k.value) && k.value.some(i => !i.readonly)) {
              k.value.forEach(v => {
                if (!v.readonly) {
                  v.value = v.bakValue
                  v.checked = v.bakChecked
                }
              })
            } else if (typeof k.value === 'object') {
              if (!k.value.readonly) {
                k.value.value = k.value.bakValue
                k.value.checked = k.value.bakChecked
              }
            } else if (!k.readonly) {
              k.value = k.bakValue
              k.checked = k.bakChecked
              if (k.multiplable) {
                k.multiOption.checked = k.multiOption.Bakchecked
              }
            }
          })
        })
      })
    },
    saveData () {
      this.materials.forEach(material => {
        var headers = material.properties
        var modifyFlag = false
        // ar material = this.$store.state.previewOptions.materials[0]
        this.$store.dispatch({
          type: TYPES.GET_OBJECT_INFO,
          data: {
            contentid: material.guid,
            pathtype: 'http',
            type: material.typeid
          }
        }).then(res => {
          var object = res.data.ext
          // delete object.entity.item
          let json = {
            object: {
              entity: /* object.entity */ {
                guid: res.data.ext.entity.guid,
                type: res.data.ext.entity.type,
                subtype: res.data.ext.entity.subtype,
                folderpath: res.data.ext.entity.folderpath,
                modifier: this.$store.state.userInfo.usercode,
                modifyterminal: this.$store.state.userInfo.ip,
                modifydate: new Date().format('yyyy-MM-dd hh:mm:ss')
              }
            },
            version: 1,
            type: GetEntityType(material.typeid, material.subtype)
          }
          if (material.strimout && (object.entity.item.trimin !== Math.round(material.strimin * 10000000) || object.entity.item.trimout !== Math.round(material.strimout * 10000000))) {
            json.object.entity.item = {
              trimin: Math.round(material.strimin * 10000000),
              trimout: Math.round(material.strimout * 10000000)
            } // save in out point
            modifyFlag = true
          }
          var promiseArr = []
          var markersArr = []
          headers.forEach(h => {
            console.log(json)
            var kvs = h.keyValues
            kvs.forEach && kvs.forEach(k => {
              if (util.isArray(k.value) && k.value.some(i => !i.readonly)) {
                k.value.forEach(v => {
                  if (!v.readonly && (v.value !== v.bakValue || v.checked !== v.bakChecked)) {
                    // save
                    if (v.keys && v.keys.length) {
                      modifyFlag = addToJson(json, v)
                    } else {

                    }
                    console.log('save')
                  }
                })
              } else if (typeof k.value === 'object') {
                if (!k.value.readonly && (k.value.value !== k.value.bakValue || k.value.checked !== k.value.bakChecked)) {
                  // save
                  if (k.keys && k.keys.length) {
                    modifyFlag = addToJson(json, k)
                  } else {

                  }
                  console.log('save')
                }
              } else if (!k.readonly && (k.value !== k.bakValue || k.checked !== k.bakChecked)) {
                if (k.keys && k.keys.length) {
                  modifyFlag = addToJson(json, k)
                } else {

                }
                console.log('save')
              }
            })
            if (typeof kvs === 'object' && kvs.radio && !kvs.readonly) {
              var isChange = false
              var checkedRadio = kvs.radio.find(item => item.checked)
              if (checkedRadio.value === 'Condition' && kvs.access.some(item => item.checked !== item.bakChecked || item.bakDeptTree !== JSON.stringify(item.deptTree))) {
                isChange = true
              } else if (checkedRadio.checked !== checkedRadio.bakChecked || kvs.checkbox.bakChecked !== kvs.checkbox.checked) {
                isChange = true
              }
              isChange && promiseArr.push(() => this.$store.dispatch({
                type: TYPES.SET_PERMISSION,
                source: material
              }).then(res => {
                util.updateMaterial(getRepository(material.father.guid), material, this.$store) // 更新元数据
                // util.Notice.success('Set permission success')
              }).catch(res => {
                this.restorePermission()
                if (res.data.code === 'B2055') {
                  util.Notice.failed('Operation failed. Because this folder contains more than 10000 items.', '', 3000)
                } else {
                  util.Notice.failed('Failed set permission', '', 3000)
                }
              }))
            }
            if (h.name === 'Marks' && kvs.bakValues && JSON.stringify(kvs.values) !== kvs.bakValues) {
              // 保存markers
              var bakMarkers = JSON.parse(kvs.bakValues)
              var oldMarkers = kvs.values.filter(i => i.markguid)
              var markguidArr = oldMarkers.map(i => i.markguid)

              var addMarkers = kvs.values.filter(item => !item.markguid)
              var deleteMarkers = bakMarkers.filter(item => markguidArr.indexOf(item.markguid) === -1)
              var updateMarkers = kvs.values.filter(item => bakMarkers.find(i => i.markguid === item.markguid) && JSON.stringify(bakMarkers.find(i => i.markguid === item.markguid)) !== JSON.stringify(item))
              var j
              var framerate
              // add
              if (addMarkers.length) {
                modifyFlag = true
                framerate = material.framerate
                j = addMarkers.map(item => {
                  var m = {
                    color: item.color,
                    createdate: item.createdate,
                    creator: item.creator,
                    iconframe: item.iconframe,
                    iconlevel: item.iconlevel,
                    icon: item.icon,
                    keyframe: item.keyframe,
                    modifydate: item.modifydate,
                    name: item.name,
                    startframe: item.startframe,
                    type: item.type,
                    endkeyframe: item.endkeyframe,
                    note: item.note,
                    iconfilename: item.iconfilename,
                    objectguid: item.objectguid || material.guid
                  }
                  return m
                })
                markersArr.push(this.$store.dispatch({
                  type: TYPES.UPDATE_MARKERPOINTS,
                  data: {
                    json: j,
                    guid: material.guid
                  }
                }).then(res => {
                  var totalFrames = GetFrameNumByHundredNS(Math.round(material.duration * 10000000), material.videostandard, material.ntsctcmode)
                  // kvs.values = util.updateMarkerList(res.data.ext, framerate, material.ntsctcmode, material.videostandard, material.vtrin, totalFrames).sort((i1, i2) => {
                  //   return i1.keyframe - i2.keyframe
                  // }) // cmapi 添加mark不再返回所有mark
                  var newMark = util.updateMarkerList(res.data.ext, framerate, material.ntsctcmode, material.videostandard, material.vtrin, totalFrames) // cmapi 添加mark不再返回所有mark
                  if (newMark.length === addMarkers.length) {
                    addMarkers.forEach((item, index) => {
                      Object.assign(item, newMark[index])
                    })
                  } else {
                    this.refresh()
                  }
                  console.log('save success')
                }).catch(res => {
                  console.log('save failed')
                }))
              }
              // delete
              deleteMarkers.forEach(item => {
                modifyFlag = true
                markersArr.push(this.$store.dispatch({
                  type: TYPES.DELETE_MARKERPOINTS,
                  data: {
                    json: item.markguid,
                    guid: material.guid
                  }
                }).then(res => {
                  console.log('save success')
                }).catch(res => {
                  kvs.values.add(item)
                }))
              })
              // update
              if (updateMarkers.length) {
                modifyFlag = true
                framerate = material.framerate
                j = updateMarkers.map(item => {
                  var m = {
                    color: item.color,
                    createdate: item.createdate,
                    creator: item.creator,
                    iconframe: item.iconframe,
                    iconlevel: item.iconlevel,
                    icon: item.icon,
                    keyframe: item.keyframe,
                    modifydate: item.modifydate,
                    name: item.name,
                    startframe: item.startframe,
                    type: item.type,
                    endkeyframe: item.endkeyframe,
                    note: item.note,
                    iconfilename: item.iconfilename,
                    markguid: item.markguid,
                    objectguid: item.objectguid || material.guid
                  }
                  return m
                }
                )
                markersArr.push(this.$store.dispatch({
                  type: TYPES.UPDATE_MARKERPOINTS,
                  data: {
                    json: j,
                    guid: material.guid
                  }
                }).then(res => {
                  console.log('save success')
                }).catch(res => {
                  console.log('save failed')
                }))
              }
            }
          })
          modifyFlag && this.$store.dispatch({
            type: TYPES.SAVE_OBJECT_INFO,
            data: json
          }).then(res => {
            util.updateMaterial(getRepository(material.father.guid), material, this.$store) // 更新元数据
            Promise.all(markersArr).then(() => promiseArr.forEach(item => item()))
            // util.Notice.success('modify success', material.name, 3000)
          }).catch(res => {
            // this.unlockMaterials()
            this.cancel()
            util.Notice.warning('Failed to modify metadata', '', 3000)
          })
          if (!modifyFlag) {
            Promise.all(markersArr).then(() => promiseArr.forEach(item => item()))
          }
        }).catch(res => {
          this.cancel()
          util.Notice.warning('Failed to modify metadata', '', 3000)
        })
      })
      this.unlockMaterials()
      this.editing = false
      function addToJson (json, field) {
        var temp = json.object
        var flag = false
        var value = typeof field.value === 'object' ? util.getValue(field.value.value, field.value.checked, field.value) : util.getValue(field.value, field.checked)
        var v = field.dt(value)
        util.getValue(value, v) !== undefined && typeof v !== 'object' && field.keys.forEach((k, i) => {
          if (i < field.keys.length - 1) {
            if (!temp[k]) {
              temp[k] = {}
            }
            temp = temp[k]
          } else {
            temp[k] = v
            flag = true
          }
        })
        return flag
      }
    },
    leftMove () {
      this.$refs.propertyHeader.leftMove()
    },
    rightMove () {
      this.$refs.propertyHeader.rightMove(600)
    },
    moveTab (event) {
      if (event.deltaY < 0) {
        this.leftMove()
      } else {
        this.rightMove()
      }
    },
    refresh () {
      if (this.editing) {
        clearTimeout(this.rId)
        this.rId = setTimeout(() => this.refresh(), 5000) // 能刷新吗？不能刷新我5秒后再来问问
        this.$store.dispatch({
          type: TYPES.OPEN_PLAYER,
          target: this.$store.state.previewOptions.materials,
          data: {
            isRefresh: true,
            onlyPlayer: true
          }
        }).then(res => {

        })
      } else {
        this.$store.dispatch({
          type: TYPES.OPEN_PLAYER,
          target: this.$store.state.previewOptions.materials,
          data: {
            isRefresh: true
          }
        }).then(res => {
          if (!this.editing) {
            var index = this.headers.indexOf(this.curTab)
            var leftIndex = this.$refs.propertyHeader.leftIndex
            var marginLeft = this.$refs.propertyHeader.marginLeft
            res && res.forEach && res.forEach(f => f()) // 执行设置properties
            this.$nextTick(res => {
              this.$refs.propertyHeader.selectHeader(index, true)
              this.$refs.propertyHeader.leftIndex = leftIndex
              this.$refs.propertyHeader.marginLeft = marginLeft
            })
          } else {
            clearTimeout(this.rId)
            this.rId = setTimeout(() => this.refresh(), 5000) // 能刷新吗？不能刷新我5秒后再来问问
          }
        })
      }
    },
    lockMaterials () {
      return this.$store.dispatch({
        type: TYPES.LOCK_OBEJCTS,
        source: this.materials,
        data: {
          isLock: true
        }
      })
    },
    unlockMaterials () {
      window.onbeforeunload = null
      return this.$store.dispatch({
        type: TYPES.LOCK_OBEJCTS,
        source: this.materials,
        data: {
          isLock: false
        }
      })
    },
    modify () {
      // 备份数据 加锁
      this.lockMaterials().then(() => {
        window.onbeforeunload = this.unlockMaterials
        this.editing = true
        this.bakMarkers()
        this.bakData()
        this.bakPermission()
      }).catch(() => {
        // this.unlockMaterials()
      })
      // 对所有的can edited 的属性设置disable = false
    },
    save () {
      // 调接口保存数据 解锁
      this.saveData()
      // 和备份数据进行比较，对不相等的字段进行更新
    },
    cancel () {
      // 解锁
      this.unlockMaterials()
      this.restoreMarkers()
      this.restorePermission()
      this.restoreData()
      // 还原数据为备份数据
      this.editing = false
    },
    initialize () {
      this.$store.state.property = this
    },
    dispose () {
      if (this.editing) {
        this.cancel()
      }
      this.curIndex = 0
    }
  },
  watch: {
    editing: function (value) {
      this.$emit('editing', value)
    }
  },
  mounted () {
    this.initialize()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
