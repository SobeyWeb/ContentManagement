<template>
  <div @contextmenu.prevent.stop v-show="position.active" class="menu_container animated2 zoomIn" :style="{left: position.x + 'px', top: position.y + 'px'}">
    <ul>
      <li class="menu_item" :class="{operation_disabled : op.enabled}" @mousedown.stop.prevent.left="apply(op)" v-for="op in operations" :key="op.action">
        <a>{{op.checked?op.name+'&nbsp;&nbsp;&nbsp;&nbsp;✓':op.name}}</a>
        <span class="sub_menu_icon fr" v-if="op.subOperations"></span>
        <div v-if="op.subOperations" class="sub_menu_container" :class="{sub_menu_container_left: isRight}" :style="{top: (op.subOperations.length >2?top:'undefined') + 'px'}">
          <ul class="menu_box">
            <li class="munu_item" :class="{operation_disabled : subOp.enabled}" @mousedown.stop.prevent.left="apply(subOp)" v-for="subOp in op.subOperations" :key="subOp.action">
              <a>{{subOp.checked?subOp.name+'&nbsp;&nbsp;&nbsp;&nbsp;✓':subOp.name}}</a>
            </li>
          </ul>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import TYPES from '../dicts/mutationTypes'
import { Model, getValue, getCookie } from '../lib/util'
export default {
  data: function () {
    return {
      lastCheckedOpt: {},
      isRight: false,
      top: 0,
      baseOpts: [{
        name: 'Order By',
        subOperations: [{
          name: 'Title  ↑',
          action: TYPES.SET_SORTTYPE,
          isMultiple: false,
          checked: false
        }, {
          name: 'Title  ↓',
          action: TYPES.SET_SORTTYPE,
          isMultiple: false,
          checked: false
        }, {
          name: 'Create time  ↑',
          action: TYPES.SET_SORTTYPE,
          isMultiple: false,
          checked: false
        }, {
          name: 'Create time  ↓',
          action: TYPES.SET_SORTTYPE,
          isMultiple: false,
          checked: false
        }, {
          name: 'Type',
          action: TYPES.SET_SORTTYPE,
          isMultiple: false,
          checked: false
        }]
      }, {
        name: 'Archive Status',
        subOperations: [{
          name: 'Online',
          action: TYPES.SET_ARCHIVETYPE,
          isMultiple: true,
          checked: true
        }, {
          name: 'HDD',
          action: TYPES.SET_ARCHIVETYPE,
          isMultiple: true,
          checked: true
        }, {
          name: 'ODA',
          action: TYPES.SET_ARCHIVETYPE,
          isMultiple: true,
          checked: true
        }
          // {
          //   name: 'Archive',
          //   action: TYPES.SET_ARCHIVETYPE,
          //   isMultiple: true,
          //   checked: true,
          // }
        ]
      }, {
        name: 'Refresh',
        action: TYPES.REFRESH_MATERIAL
      }],
      opts: [{
        name: 'Open',
        action: TYPES.OPEN_FOLDER
      }, {
        name: 'Show OA File',
        action: TYPES.SET_OA_FILTER,
        isMultiple: true,
        checked: true
      }, {
        name: 'Rename',
        action: TYPES.DISPATCH_RENAME
      }, {
        name: 'Cut',
        action: TYPES.CUT
      }, {
        name: 'Copy',
        action: TYPES.COPY
      }, {
        name: 'Create New',
        action: TYPES.DISPATCH_ADD_FOLDER
      }, {
        name: 'Paste',
        action: TYPES.PASTE
      }, {
        name: 'Preview',
        action: TYPES.PROPERTIES
      }, {
        name: '16:9',
        action: TYPES.SD169,
        isMultiple: false,
        checked: false
      }, {
        name: 'Delete',
        action: TYPES.RECYCLE
      }, {
        name: 'Export',
        action: TYPES.EXPORT
      }, {
        name: 'Retrieve',
        action: TYPES.RETRIEVE
      }, {
        name: 'Download',
        action: TYPES.DOWNLOAD
      }, {
        name: 'Register to OA',
        action: TYPES.REGISTER_OA
      }, {
        name: 'Publish to SNS',
        action: TYPES.OPEN_PUBLISHTOSNS
      }, {
        name: 'Auto Package',
        action: TYPES.AUTO_PACKEGE
      }, {
        name: 'Detail View',
        action: TYPES.DETAIL_VIEW // TYPES.PROPERTIES
      }, {
        name: 'Restore',
        action: TYPES.RESTORE
      }, {
        name: 'Upload',
        action: TYPES.DISPATCH_UPLOAD
      }, {
        name: 'Restore All Materials',
        action: TYPES.RESTORE_ALL
      }, {
        name: 'Empty Trash Can',
        action: TYPES.CLEAR_TRASHCAN_OBJECTS
      }, {
        name: 'Save Search Result',
        action: TYPES.DISPATCH_SAVE_SEARCHRESULT
      }, {
        name: 'To Publish Folder',
        action: TYPES.PRE_SNSPUBLISH
      }, {
        name: 'Open Path',
        action: TYPES.OPEN_PATH
      }, {
        name: 'Save Picture',
        action: TYPES.DISPATCH_SAVE_PICTURE
      }, {
        name: 'Set Frame',
        action: TYPES.DISPATCH_SET_FRAME
      }, {
        name: 'FullScreen',
        action: TYPES.DISPATCH_FULLSCREEN
      }, {
        name: 'Exit FullScreen',
        action: TYPES.DISPATCH_EXIT_FULLSCREEN
      }, {
        name: 'Add to Quick Link',
        action: TYPES.DISPATCH_SET_DING
      }, {
        name: 'Remove',
        action: TYPES.DISPATCH_DELETE_DING
      }, {
        name: 'Generate Proxy',
        action: TYPES.DISPATCH_GENERATE_PROXY
      }, {
        name: 'One Generation',
        action: TYPES.DISPATCH_ONE_GENERATION
      }
      ]
    }
  },
  methods: {
    apply: function (operation) {
      this.$store.commit({
        type: TYPES.SET_MENUSTATUS,
        data: {
          status: false
        }
      })
      var _this = this
      if (operation.action) {
        if (operation.isMultiple === false) {
          _this.lastCheckedOpt.checked = false
          _this.lastCheckedOpt = operation
          operation.checked = true
        } else if (operation.isMultiple === true) {
          operation.checked = !operation.checked
          if (this.baseOpts[1].subOperations.every(item => !item.checked)) {
            operation.checked = true
            return
          }
        }
        if (['Empty Trash Can', 'Restore All Materials', 'Restore', 'Delete', 'Retrieve'].indexOf(operation.name) > -1) {
          var isShowCount = ['Empty Trash Can', 'Restore All Materials'].indexOf(operation.name) === -1
          Model.confirm(operation.name, 'Are You Sure to ' + operation.name + ' ' + (isShowCount ? (this.data.length ? this.data.length + ' Materials' : '') : ''),
            () => {
              _this.$store.dispatch({
                type: operation.action,
                target: this.data.slice(),
                data: {
                  name: operation.name,
                  checked: operation.checked
                }
              })
            },
            () => {
            },
            {
              large: true, // Boolean
              confirmButton: {
                show: true,
                type: 'primary',
                text: 'Confirm'
              },
              cancelButton: {
                show: true, // Boolean
                type: '', // String 请参考 Button
                text: 'Cancel' // String
              }
            })
        } else {
          _this.$store.state.exportInfo.INPOINT = -1
          _this.$store.state.exportInfo.OUTPOINT = -1
          _this.$store.state.exportInfo.TRIMIN = -1
          _this.$store.state.exportInfo.TRIMOUT = -1
          _this.$store.state.exportInfo.material = this.data
          _this.$store.dispatch({
            type: operation.action,
            target: this.data.slice(),
            data: {
              name: operation.name,
              checked: operation.checked
            }
          })
        }
      }
    }
  },
  watch: {
    showOAMaterials (val) {
      this.opts[1].checked = val
    },
    position (val) {
      var p = val
      var height = this.isPremiere ? 24 : 30
      if (p.x + 300 > document.body.clientWidth) {
        this.isRight = true // 控制子菜单方向
      } else {
        this.isRight = false // 控制子菜单方向
      }
      if (p.y + height * this.operations.length > document.body.clientHeight) {
        p.y -= height * this.operations.length
        if (this.operations.length < 5) {
          this.top = (-5 + this.operations.length) * height
        }
      } else {
        this.top = 0
      }
    }
  },
  computed: {
    userInfo () {
      return this.$store.state.userInfo
    },
    showOAMaterials () {
      return this.$store.state.showOAMaterials
    },
    data () {
      return this.$store.state.selectedMaterials.slice()
    },
    isMarker () {
      return this.$store.state.isMarker
    },
    isPremiere () {
      return this.$store.state.system
    },
    position () {
      var p = {}
      if (this.$store.state.menuStatus) {
        p.active = this.$store.state.menuStatus
        p.x = this.$store.state.mousePosition.x
        p.y = this.$store.state.mousePosition.y
        // 如果超出则自动适应根据
        if (p.x + 150 > document.body.clientWidth) {
          p.x -= 150
        }
      }
      return p
    },
    clipBoard () {
      return this.$store.state.clipBoard
    },
    operations () {
      console.log(this.showOAMaterials) // 依赖
      var opts
      // 根据当前可操作的素材过滤操作
      var _this = this
      if (this.data.length > 0) {
        opts = this.opts.filter(item => _this.data.every(i => i.operations.indexOf(item.name) > -1))
        if (_this.data.length > 1 || !_this.data[0].selecting) {
          opts = opts.filter(item => item.name !== 'Create New')
        }
        if (_this.data.length > 1) {
          opts = opts.filter(item => ['To Publish Folder', 'Publish to SNS', 'Rename', 'Open', 'Upload', 'Register to OA', 'Paste', 'Open Path'].indexOf(item.name) === -1) // 过滤不支持多选的操作
        }
        var opt169 = opts.find(item => item.action === TYPES.SD169)
        if (opt169 && _this.data.some(item => !item.img16_9sd)) { // 如果有素材不是16：9
          opt169.checked = false
        } else if (opt169) {
          opt169.checked = true
        }
      } else {
        opts = _this.baseOpts.concat(this.opts.filter(item => _this.$store.getters.currentNode.operations.indexOf(item.name) > -1 && ['Cut', 'Copy', 'Open', 'Delete', 'Rename', 'Add to Quick Link'].indexOf(item.name) < 0))
        if (_this.$store.state.listSymbol) {
          opts.remove(_this.baseOpts[0])
        } else if (this.isMarker) {
          opts.remove(_this.baseOpts[0])
          opts.remove(_this.baseOpts[1])
        }
      }
      if (this.isPremiere) {
        opts = opts.filter(item => item.name !== 'Preview' && item.name !== 'Upload' && item.name !== 'Download')
      }
      if (!this.clipBoard.length) {
        opts = opts.filter(item => item.name !== 'Paste') // 未复制剪贴不显示paste
      }
      return opts
    }
  },
  created () {
    var last = this.baseOpts[0].subOperations[0]
    var dict = {
      title: 'Title',
      createTime: 'Create time'
    }
    this.$store.dispatch({
      type: TYPES.GET_SEARCH_QUERY
    }).then(res => {
      var temp = res.find(item => item.templateName === ('default' + this.$store.state.userInfo.usercode))
      if (temp) {
        var lastVisit = JSON.stringify(temp.condition.lastVisit) || getCookie('last_visit' + this.userInfo.usercode)
        if (lastVisit) {
          lastVisit = JSON.parse(lastVisit)
          var type = getValue(lastVisit.sortType, this.$store.state.sortType)

          var symbol = getValue(lastVisit.sortSymbol, this.$store.state.sortSymbol) ? '  ↑' : '  ↓'
          if (type === 'type') {
            last = this.baseOpts[0].subOperations[4]
          } else {
            last = this.baseOpts[0].subOperations.find(item => item.name === (dict[type] + symbol)) || last
          }
        }
        last.checked = true
        this.lastCheckedOpt = last
        if (temp.condition.archiveFiters) {
          this.baseOpts[1].subOperations[0].checked = getValue(temp.condition.archiveFiters.Online, true)
          this.baseOpts[1].subOperations[1].checked = getValue(temp.condition.archiveFiters.HDD, true)
          this.baseOpts[1].subOperations[2].checked = getValue(temp.condition.archiveFiters.ODA, true)
        }
      }
    })
  }
}

</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style scoped>
.menu_container {
  position: fixed;
  width: 150px;
  z-index: 110;
  background-color: #fff;
}

.menu_container .sub_menu_icon {
  display: inline-block;
  height: 100%;
  width: 30px;
  background: url(../assets/images/arrow_right3.png) center center no-repeat;
}

.menu_container .menu_box {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.175);
  border-radius: 4px;
}

.menu_container li {
  overflow: hidden;
  white-space: nowrap;
  cursor: pointer;
  font-weight: normal;
  height: 30px;
  line-height: 30px;
  font-size: 14px;
  list-style: none;
  text-align: left;
  padding-left: 10px;
  vertical-align: middle;
  color: #333;
}

.menu_container li:hover {
  background-color: #f89b39;
  color: #fff;
}

.menu_container a {
  color: inherit;
  text-decoration: none;
}

.menu_container .sub_menu_container {
  opacity: 0;
  left: 0;
  z-index: -1;
  display: inline-block;
  visibility: hidden;
  width: 150px;
  background: #fff;
  position: absolute;
}

.menu_container li:hover .sub_menu_container {
  left: 150px;
  opacity: 1;
  visibility: visible;
  transition: all 0.2s;
  transition-delay: 0.1s;
}

.menu_container li:hover .sub_menu_container_left {
  left: -150px;
}
</style>
