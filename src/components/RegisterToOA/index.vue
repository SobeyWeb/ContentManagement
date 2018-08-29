<template id="registertoOa_ctrl">
  <div id="registerOAfolderParentDiv">
    <div id="divRegisterWindow" class="windowDiv animated2 zoomIn">
      <div class="divTitle" @mousedown.stop.capture="mousedown($event)">
        <span class="textTitle">Register To</span>
        <button class="closeIcon" @click="cancelRegisterWindow">
          <div class="icon"></div>
        </button>
      </div>
      <p class="PortionTitle">Which Portion</p>
      <div class="selectPortion">
        <input type="radio" name="Portion" checked="">
        <span>Register Whole material</span>
      </div>
      <div class="selectPortion">
        <input class="Laser" type="radio" name="Portion">
        <span class="Laser">Register Mark in and out portion</span>
      </div>
      <p class="TargetTitle">Target</p>
      <ul id="registerNav">
        <li :key="registertype.text" v-for="registertype in registertypes" @click="changeregistertype(registertype)" class="registerLi" :class="{selecter:registertype.ischecked}">{{registertype.text}}</li>
      </ul>
      <div id="selectParentDiv">
        <keep-alive>
          <component :is="currentRegisterView" :data="props"></component>
        </keep-alive>
      </div>
      <div class="footer cmfooter">
        <input id="btnRegisterToOA" @click="register" class="cmSave" type="button" value="Comfirm">
        <input id="btnRegisterToOACancel" @click="cancelRegisterWindow" class="cmCancel" type="button" value="Cancel">
      </div>
    </div>
  </div>
</template>

<script>
// let programArr = ['storyTitle', 'eventTitle', 'duration', 'version', 'som', 'eom', 'channel', 'eventStatus']
import * as util from '../../lib/util.js'
import $ from 'jquery'
import TYPES from '../../dicts/mutationTypes.js'
import RegisterToEvent from './RegisterToEvent'
import RegisterToOAFolder from './RegisterToOAFolder'
export default {
  name: 'registertoOa_ctrl',
  data () {
    return {
      currentRegisterView: 'registertoevent_ctrl',
      studioText: 'Please select studio',
      props: {
        registerViewPath: 'OA Material / ',
        registerPath: '',
        oaFolderMosid: '',
        studiodata: [],
        rundowntimedata: [],
        timedata: [],
        rundowndata: [],
        programInfo: [],
        selectedStudioid: '',
        selectedStudioMosid: '',
        selectTime: '',
        selectRundownid: '',
        tempStudiodata: [],
        tempTimedata: [],
        tempRundowndata: [],
        tempProgramInfodata: []
      }
    }
  },
  created: function () {
    this.props.studiodata = []
    let usercode = util.getCookie('UserCode')
    let playListData = JSON.parse(localStorage.getItem('registerdata' + usercode))
    this.props.selectedStudioid = playListData.Studioid || ''
    this.props.selectTime = playListData.FirstPlayDate || ''
    this.props.selectRundownid = playListData.rundownid || ''
    this.props.selectedStudioMosid = playListData.StudioMosid || ''
    this.props.registerViewPath = playListData.registerViewPath || 'OA Material / '
    this.props.registerPath = playListData.registerPath || ''
    this.props.oaFolderMosid = playListData.oaFolderMosid || ''
    this.$store.state.registerdata = this.props
  },
  mounted: function () { },
  components: {
    'registertoevent_ctrl': RegisterToEvent,
    'registertooafolder_ctrl': RegisterToOAFolder
  },
  watch: {
    countArr: function () {
      let timeIn = this.$store.state.exportInfo.INPOINT
      let timeOut = this.$store.state.exportInfo.OUTPOINT
      let clipping = this.materials.clipping || false
      let clipstatus = this.materials.capturestatus || 0
      if (clipping && timeIn === -1 && timeOut === -1 && clipstatus !== 32) { // 采集中素材整段注册 不显示注册到OA Folder
        this.currentRegisterView = 'registertoevent_ctrl'
      }
    }
  },
  computed: {
    materials () {
      if (this.$store.state.isplayerRegister) {
        return this.$store.state.exportInfo.material
      } else {
        return this.$store.state.selectedMaterials[0]
      }
    },
    registertypes () {
      let timeIn = this.$store.state.exportInfo.INPOINT
      let timeOut = this.$store.state.exportInfo.OUTPOINT
      let clipping = this.materials.clipping || false
      let clipstatus = this.materials.capturestatus || 0
      if (clipping && timeIn === -1 && timeOut === -1 && clipstatus !== 32) { // 采集中素材整段注册 不显示注册到OA Folder
        return [{
          text: 'Select Event',
          modelname: 'registertoevent_ctrl',
          ischecked: true
        }]
      } else {
        if (this.currentRegisterView === 'registertoevent_ctrl') {
          return [{
            text: 'Select Event',
            modelname: 'registertoevent_ctrl',
            ischecked: true
          }, {
            text: 'Select Folder',
            modelname: 'registertooafolder_ctrl',
            ischecked: false
          }]
        } else {
          return [{
            text: 'Select Event',
            modelname: 'registertoevent_ctrl',
            ischecked: false
          }, {
            text: 'Select Folder',
            modelname: 'registertooafolder_ctrl',
            ischecked: true
          }]
        }
      }
    }
  },
  methods: {
    changeregistertype (registertype) {
      this.registertypes.forEach(function (item) {
        item.ischecked = false
      })
      registertype.ischecked = true
      let currentViewname = registertype.modelname
      this.currentRegisterView = currentViewname
    },
    // 注册
    register () {
      let p = this.currentRegisterView
      let timeIn = this.$store.state.exportInfo.INPOINT
      let timeOut = this.$store.state.exportInfo.OUTPOINT
      let taskType = 3 // CM用3 premire用4
      if (this.$store.state.system) { // premire用4(现task修改枚举值后未5)
        taskType = 5 // 2017-12-21将4改为5
      }
      // 默认不是采集中
      let clipping = this.materials.clipping || false
      let oldclipGuid = this.materials.guid || ''
      let oldclipName = this.materials.name || ''
      let clipstatus = this.materials.capturestatus || 0
      if (clipstatus === 32) { // 如果是正在trim当成完成的素材注册
        clipping = false
      }
      let isfragment = false // 默认不是片段
      if (timeIn === -1 && timeOut === -1) {
        isfragment = true // 整段
      } else {
      }
      if ((timeIn === timeOut) && (timeOut !== -1)) { // 两个值都为-1表示整段注册其余为打点注册
        timeOut = parseInt(timeIn) + 1
      }
      if (p === 'registertoevent_ctrl') { // 注册到event
        let checkInfo = this.props.programInfo.filter((item) => {
          return item.selected
        })
        let selectedStudio = this.props.studiodata.filter((item) => {
          return item.ischeckedStudio
        })
        let eventmosid = selectedStudio && selectedStudio.length ? selectedStudio[0].studiomosid : ''
        let eventId = checkInfo && checkInfo.length ? checkInfo[0].eventId : ''
        let MaterialID = checkInfo && checkInfo.length ? checkInfo[0].MaterialID : ''
        if (eventId && this.materials) {
          if (isfragment && !clipping) { // 完成的素材整段注册
            this.$store.dispatch({
              type: TYPES.REGISTER_TO_EVENT,
              data: {
                'eventId': eventId,
                'objectGuid': oldclipGuid
              }
            }).then((result) => {
              let datas = result
              datas = JSON.parse(datas)
              if (datas.Results) {
                // let type = 3 // CM用3 premire用4
                let selectStudioID = this.props.studiodata.filter((item) => {
                  return item.ischeckedStudio
                })[0].studioid
                util.Notice.success('register to event success.', '', 3000)
                this.$store.dispatch({
                  type: TYPES.ADD_TASK,
                  data: {
                    contentid: datas.Results.ClipGuid,
                    messageid: datas.Results.RequestID,
                    type: taskType,
                    name: oldclipName, // objname
                    studioid: selectStudioID
                  }
                }).then((res) => {
                  if (res.data.IsSuccess) {
                  } else {
                    util.Notice.warning('Add task fail!', '', 3000)
                  }
                }).catch((res) => {
                  util.Notice.warning('Add task fail!', '', 3000)
                })
              } else { // 注册
                if (datas.ErrDetail) {
                  util.Notice.warning(datas.ErrDetail, '', 3000)
                } else {
                  util.Notice.warning('register to event fail!', '', 3000)
                }
              }
            }).catch((res) => {
            })
          } else {
            // 片段注册
            let eventDate = $('#ddlTime').val().replace(/-/g, '/')
            eventDate = $.trim(eventDate)
            let eventFolder = $('#ddlRundown').val()
            eventFolder = $.trim(eventFolder)
            let eventPath = eventDate + '/' + eventFolder
            eventPath = $.trim(eventPath)
            let registerdata = {
              sourceguid: oldclipGuid, // 素材id
              targetmosid: eventmosid,
              targetguid: '',
              relativepath: eventPath,
              clipin: timeIn,
              clipout: timeOut
            }
            if (isfragment) { // 素材整段注册到event
              delete registerdata.clipin
              delete registerdata.clipout
            }
            if (MaterialID) {
              this.$store.dispatch({
                type: TYPES.GET_OBJECT_INFO,
                data: {
                  contentid: MaterialID,
                  pathtype: 'http',
                  type: 32
                }
              }).then(res => {
                if (res.data.ext && res.data.ext.entity) {
                  let entity = res.data.ext.entity
                  let subtype = entity.subtype
                  let targetguid = ''
                  if (subtype === 512) { // 表示空素材
                    if ([1, 2, 32, 64, 128, 4096, 65536, 8192].indexOf(parseInt(entity.item.capturestatus)) > -1) { // 素材未完成状态不填
                      targetguid = ''
                    } else {
                      targetguid = MaterialID
                      registerdata.targetguid = targetguid
                    }
                  }
                }
                if (eventmosid) {
                  if (clipping) {
                    registerdata.iscliping = true
                  }
                  this.$store.dispatch({
                    type: TYPES.FRAGMENT_REGISTER,
                    data: registerdata
                  }).then((result) => {
                    let datas = result
                    if (datas.code !== '0') { // 失败
                      if (datas.code === 'RE00001') {
                        util.Notice.warning('Failed to register because this is an exceptional clip!', '', 3000)
                      } else {
                        util.Notice.warning('register to event fail!', '', 3000)
                      }
                    } else {
                      let newclipid = datas.ext.guid
                      this.$store.dispatch({
                        type: TYPES.REGISTER_TO_EVENT,
                        data: {
                          'eventId': eventId,
                          'objectGuid': newclipid
                        }
                      }).then((result) => {
                        let datas = result
                        datas = JSON.parse(datas)
                        if (datas.Results) {
                          let selectStudioID = this.props.studiodata.filter((item) => {
                            return item.ischeckedStudio
                          })[0].studioid
                          util.Notice.success('register to event success.', '', 3000)
                          this.$store.dispatch({
                            type: TYPES.ADD_TASK,
                            data: {
                              contentid: datas.Results.ClipGuid,
                              messageid: datas.Results.RequestID,
                              type: taskType,
                              name: oldclipName, // objname
                              studioid: selectStudioID
                            }
                          }).then((res) => {
                            if (res.data.IsSuccess) {
                            } else {
                              util.Notice.warning('Add task fail!', '', 3000)
                            }
                          }).catch((res) => {
                            util.Notice.warning('Add task fail!', '', 3000)
                          })
                        } else { // 注册
                          if (datas.ErrDetail) {
                            util.Notice.warning(datas.ErrDetail, '', 3000)
                          } else {
                            util.Notice.warning('register to event fail!', '', 3000)
                          }
                        }
                      }).catch((res) => {
                        util.Notice.warning('register to event fail!', '', 3000)
                      })
                    }
                  }).catch(() => {
                    util.Notice.warning('register to event fail!', '', 3000)
                  })
                } else {
                  // 没有mosid
                  util.Notice.warning('Material mosid does not exist!', '', 3000)
                }
              }).catch(res => {
                console.log('getobjectinfo failed!')
              })
            } else {
              // 无素材id的情况   不需要传targetguid
              if (eventmosid) {
                registerdata.iscliping = clipping
                this.$store.dispatch({
                  type: TYPES.FRAGMENT_REGISTER,
                  data: registerdata
                }).then((result) => {
                  let datas = result
                  if (datas.code !== '0') { // 失败
                    if (datas.code === 'RE00001') {
                      util.Notice.warning('Failed to register because this is an exceptional clip!', '', 3000)
                    } else {
                      util.Notice.warning('register to event fail!', '', 3000)
                    }
                  } else {
                    let newclipid = datas.ext.guid
                    this.$store.dispatch({
                      type: TYPES.REGISTER_TO_EVENT,
                      data: {
                        'eventId': eventId,
                        'objectGuid': newclipid
                      }
                    }).then((result) => {
                      let datas = result
                      datas = JSON.parse(datas)
                      if (datas.Results) {
                        let selectStudioID = this.props.studiodata.filter((item) => {
                          return item.ischeckedStudio
                        })[0].studioid
                        util.Notice.success('register to event success.', '', 3000)
                        this.$store.dispatch({
                          type: TYPES.ADD_TASK,
                          data: {
                            contentid: datas.Results.ClipGuid,
                            messageid: datas.Results.RequestID,
                            type: taskType,
                            name: oldclipName, // objname
                            studioid: selectStudioID
                          }
                        }).then((res) => {
                          if (res.data.IsSuccess) {
                          } else {
                            util.Notice.warning('Add task fail!', '', 3000)
                          }
                        }).catch((res) => {
                          util.Notice.warning('Add task fail!', '', 3000)
                        })
                      } else { // 注册
                        if (datas.ErrDetail) {
                          util.Notice.warning(datas.ErrDetail, '', 3000)
                        } else {
                          util.Notice.warning('register to event fail!', '', 3000)
                        }
                      }
                    }).catch((res) => {
                      util.Notice.warning('register to event fail!', '', 3000)
                    })
                  }
                }).catch(() => {
                  util.Notice.warning('register to event fail!', '', 3000)
                })
              } else {
                // 没有mosid
                util.Notice.warning('Material mosid does not exist!', '', 3000)
              }
            }
          }
        } else { // 没素材id或者未选中event的青睐
          util.Notice.warning('Please select Event!', '', 3000)
          return
        }
      } else { // OA Folder
        if (this.props.registerPath) {
          let registerdata = {
            sourceguid: oldclipGuid, // 素材id
            targetmosid: this.props.oaFolderMosid,
            targetguid: '',
            relativepath: this.props.registerPath,
            isfragment: 0
          }
          if (!isfragment) { // 片段
            registerdata.isfragment = 1
            registerdata.clipin = timeIn
            registerdata.clipout = timeOut
          }
          this.$store.dispatch({
            type: TYPES.REGISTER_TO_OAFOLDER,
            data: registerdata
          }).then((result) => {
            let datas = result
            if (datas.code !== '0') { // 失败
              if (datas.code === 'RE00001') {
                util.Notice.warning('Failed to register because this is an exceptional clip!', '', 3000)
              } else {
                util.Notice.warning('register to oa folder fail!', '', 3000)
              }
            } else {
              let extXml = datas.ext.xmlinfo
              let notiyP = -1
              if (extXml.indexOf('<Start>') >= 0) {
                notiyP = 20 // kafamessage失败
              } else {
                notiyP = 10 // 走MPC失败
              }
              this.$store.dispatch({
                type: TYPES.GET_NOTIFYPLAYOUT,
                data: {
                  xmlproc: datas,
                  notiyP: notiyP
                }
              }).then((re) => {
                let data = re
                if (data.code !== '0') {
                  util.Notice.warning(data.msg, '', 3000)
                } else {
                  if (notiyP === 20) {
                    notiyP = 21
                  } else if (notiyP === 10) {
                    notiyP = 11
                  }
                  if (notiyP === 11 || notiyP === 21 || notiyP === 20) {
                    // 10走MPC失败，11走MPC成功，20走kafamessage失败。21走kafamessage成功.
                    let msgID = extXml.substring(extXml.indexOf('RequestID>') + 10, extXml.indexOf('</RequestID>'))
                    if (notiyP === 21 || notiyP === 20) {
                      msgID = ''
                    }
                    let OaFolderTaskType = 2 // CM用2 premire用12
                    if (this.$store.state.system) { // premire用12(以前都使用的2，现进行区分)
                      OaFolderTaskType = 12 // 2017-12-22将2改为12
                    }
                    this.$store.dispatch({
                      type: TYPES.ADD_TASK,
                      data: {
                        contentid: datas.ext.guid,
                        messageid: msgID,
                        type: OaFolderTaskType, // 2
                        name: oldclipName,
                        studioid: this.props.oaFolderMosid
                      }
                    }).then((res) => {
                      if (res.data.IsSuccess) {
                        util.Notice.success('register to oa folder success.', '', 3000)
                      } else {
                        util.Notice.warning('Add task fail!', '', 3000)
                      }
                    }).catch((res) => {
                      util.Notice.warning('Add task fail!', '', 3000)
                    })
                  } else {
                    util.Notice.warning('register to oa folder fail!', '', 3000)
                  }
                }
              })
            }
          }).catch((res) => {
            util.Notice.warning('register to oa folder fail!', '', 3000)
          })
        } else {
          util.Notice.warning('Please select a path!', '', 3000)
        }
      }
      // 储存数据
      let localJson = {
        Studioid: this.props.selectedStudioid || '',
        FirstPlayDate: this.props.selectTime || '',
        rundownid: this.props.selectRundownid || '',
        StudioMosid: this.props.selectedStudioMosid || '',
        registerViewPath: this.props.registerViewPath || '',
        registerPath: this.props.registerPath || '',
        oaFolderMosid: this.props.oaFolderMosid || ''
      }
      localStorage.setItem('registerdata' + this.$store.state.userInfo.usercode, JSON.stringify(localJson))
      this.props.programInfo.forEach((item) => {
        item.selected = false
      })
      this.resetDate()
    },
    resetDate () {
      this.$store.state.isRegister = false
      this.$store.state.isplayerRegister = false
      this.$store.state.oaFolder[0].children = []
      this.$store.state.oaFolder[0].folders = []
    },
    cancelRegisterWindow () {
      this.currentRegisterView = 'registertoevent_ctrl'
      this.registertypes.forEach((item) => {
        if (item.text === 'Select Event') {
          item.ischecked = true
        } else {
          item.ischecked = false
        }
      })
      //  取消时 获取comfirm的数据
      let playListData = JSON.parse(localStorage.getItem('registerdata' + this.$store.state.userInfo.usercode))
      this.props =
        {
          registerViewPath: playListData.registerViewPath || 'OA Material / ',
          registerPath: playListData.registerPath || '',
          oaFolderMosid: playListData.oaFolderMosid || '',
          studiodata: [],
          rundowntimedata: [],
          timedata: [],
          rundowndata: [],
          programInfo: [],
          selectedStudioid: playListData.Studioid || '',
          selectedStudioMosid: playListData.StudioMosid || '',
          selectTime: playListData.FirstPlayDate || '',
          selectRundownid: playListData.rundownid || '',
          tempStudiodata: [],
          tempTimedata: [],
          tempRundowndata: [],
          tempProgramInfodata: []
        }
    }
  }
}
</script>

<style>
</style>
