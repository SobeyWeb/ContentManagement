<template id="registertoOa_ctrl">
  <div id="registerOAfolderParentDiv">
    <div id="divRegisterWindow" class="windowDiv animated2 zoomIn">
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
          <component :is="currentRegisterView"></component>
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
// :allTimer="allTimer" :allRundownList="allRundownList" :allProgramInfo="allProgramInfo"
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
        // registerViewPath: 'OA Material / ',
        // registerPath: '',
        // oaFolderMosid: '',
        // registerData: [],
        // selectedStudioid: '',
        // selectedStudioMosid: '',
        // selectTime: '',
        // selectRundownid: ''
      }
    }
  },
  created: function () {
    let usercode = util.getCookie('UserCode')
    let playListData = JSON.parse(localStorage.getItem('registerdata' + usercode))
    let registerdata = this.$store.state.registerdata
    registerdata.selectedStudioid = playListData && playListData.Studioid || ''
    registerdata.selectTime = playListData && playListData.FirstPlayDate || ''
    registerdata.selectRundownid = playListData && playListData.rundownid || ''
    registerdata.selectedStudioMosid = playListData && playListData.StudioMosid || ''
    registerdata.registerViewPath = playListData && playListData.registerViewPath || 'OA Material / '
    registerdata.registerPath = playListData && playListData.registerPath || ''
    registerdata.oaFolderMosid = playListData && playListData.oaFolderMosid || ''
    // this.$store.state.registerdata = this.props
    // this.props = registerdata
  },
  mounted: function () { },
  components: {
    'registertoevent_ctrl': RegisterToEvent,
    'registertooafolder_ctrl': RegisterToOAFolder
  },
  watch: {
    countArr: function () {
      // let timeIn = this.$store.state.exportInfo.INPOINT
      // let timeOut = this.$store.state.exportInfo.OUTPOINT
      // let clipping = this.materials.clipping || false
      // let clipstatus = this.materials.capturestatus || 0
      if (this.clipping && this.timeIn === -1 && this.timeOut === -1 && this.clipstatus !== 32) { // 采集中素材整段注册 不显示注册到OA Folder
        this.currentRegisterView = 'registertoevent_ctrl'
      }
    }
  },
  computed: {
    allStudio () {
      return this.$store.state.registerdata.eventData && this.$store.state.registerdata.eventData || []
    },
    checkedStudio () {
      return this.allStudio.find(item => item.selected)
    },
    allTimer () {
      return this.checkedStudio && this.checkedStudio.children || []
    },
    checkedTimer () {
      return this.allTimer.find(item => item.selected)
    },
    allRundownList () {
      return this.checkedTimer && this.checkedTimer.children || []
    },
    checkedRundownList () {
      return this.allRundownList.find(item => item.selected)
    },
    allProgramInfo () {
      return this.checkedRundownList && this.checkedRundownList.children || []
    },
    checkedProgramInfo () {
      return this.allProgramInfo.find(item => item.selected)
    },
    materials () {
      if (this.$store.state.isplayerRegister) {
        return this.$store.state.exportInfo.material
      } else {
        return this.$store.state.selectedMaterials[0]
      }
    },
    timeIn () {
      return this.$store.state.exportInfo.INPOINT
    },
    timeOut () {
      return this.$store.state.exportInfo.OUTPOINT
    },
    clipping () {
      return this.materials && this.materials.clipping || false
    },
    clipstatus () {
      return this.materials && this.materials.capturestatus || 0
    },
    registertypes () {
      if (this.clipping && this.timeIn === -1 && this.timeOut === -1 && this.clipstatus !== 32) { // 采集中素材整段注册 不显示注册到OA Folder
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
    inoutToOa (inoutToOaData) {
      if (inoutToOaData.eventmosid) {
        if (inoutToOaData.clipping) {
          inoutToOaData.registerdata.iscliping = true
        }
        this.$store.dispatch({
          type: TYPES.CAN_TRANSCODING,
          data: {
            EventID: inoutToOaData.eventId,
            RundownID: this.$store.state.selectRundownid
          }
        }).then(res => {
          if (res.data.nRet === 0) { // 允许注册
            this.$store.dispatch({
              type: TYPES.FRAGMENT_REGISTER,
              data: inoutToOaData.registerdata
            }).then((result) => {
              if (result.code !== '0') {
                if (result.code === 'RE00001') {
                  util.Notice.warning('Failed to register because this is an exceptional clip!', '', 3000)
                } else {
                  util.Notice.warning('register to event fail!', '', 3000)
                }
              } else {
                let newclipid = result.ext.guid
                let extXml = result.ext.xmlinfo || ''
                let msgID = (extXml && extXml.substring(extXml.indexOf('RequestID>') + 10, extXml.indexOf('</RequestID>'))) || ''
                this.$store.dispatch({
                  type: TYPES.REGISTER_TO_EVENT,
                  data: {
                    eventId: inoutToOaData.eventId,
                    objectGuid: newclipid
                  }
                }).then((result) => {
                  let datas = result
                  datas = JSON.parse(datas)
                  if (datas.Results) {
                    let selectedStudio = this.checkedStudio
                    let selectStudioID = selectedStudio && selectedStudio.length && selectedStudio[0].studioid || ''
                    util.Notice.success('register to event success.', '', 3000)
                    this.$store.dispatch({
                      type: TYPES.ADD_TASK,
                      data: {
                        contentid: datas.Results.ClipGuid,
                        messageid: datas.Results.RequestID || msgID,
                        type: inoutToOaData.taskType,
                        name: inoutToOaData.oldclipName,
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
                  } else {
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
            util.Notice.warning('register to event fail!', '', 3000)
          }
        }).catch(res => {
          util.Notice.warning('register to event fail!', '', 3000)
        })
      } else {
        // 没有mosid
        util.Notice.warning('Material mosid does not exist!', '', 3000)
      }
    },
    // 注册
    register () {
      let p = this.currentRegisterView
      let taskType = 3 // CM用3 premire用4
      if (this.$store.state.system) { // premire用4(现task修改枚举值后未5)
        taskType = 5 // 2017-12-21将4改为5
      }
      // 默认不是采集中
      let clipping = this.clipping
      let oldclipGuid = this.materials.guid || ''
      let oldclipName = this.materials.name || ''
      if (this.clipstatus === 32) { // 如果是正在trim当成完成的素材注册
        clipping = false
      } // true表示正在采集
      let isfragment = false // 默认不是片段
      if (this.timeIn === -1 && this.timeOut === -1) {
        isfragment = true // 整段
      } else {
      }
      let timeOut = this.timeOut
      if ((this.timeIn === this.timeOut) && (this.timeOut !== -1)) { // 两个值都为-1表示整段注册其余为打点注册
        timeOut = parseInt(this.timeIn) + 1
      }
      if (p === 'registertoevent_ctrl') { // 注册到event
        let selectedStudio = this.checkedStudio
        // let selectTime = this.checkedTimer
        // let selectRundown = this.checkedRundownList
        let checkInfo = this.checkedProgramInfo
        let eventmosid = selectedStudio && selectedStudio.length && selectedStudio[0].studiomosid || ''
        let eventId
        let MaterialID = ''
        if (checkInfo.length > 0) {
          eventId = checkInfo[0].eventId
          MaterialID = checkInfo[0].MaterialID
        }
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
              if (datas.Results) { // CM用3 premire用4
                let selectStudioID = selectedStudio && selectedStudio.length && selectedStudio[0].studioid || ''
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
                    // util.Notice.success('register to event success.', '', 3000)
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
              clipin: this.timeIn,
              clipout: timeOut
            }
            if (isfragment) { // 素材整段注册到event
              delete registerdata.clipin
              delete registerdata.clipout
            }
            let inoutToOaData = {
              eventmosid: eventmosid || '',
              clipping: clipping,
              registerdata: registerdata,
              eventId: eventId,
              taskType: taskType,
              oldclipName: oldclipName
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
                this.inoutToOa(inoutToOaData)
              }).catch(res => {
                if (res.data.code === '404') {
                  this.inoutToOa(inoutToOaData)
                }
                console.log('getobjectinfo failed!')
              })
            } else {
              // 无素材id的情况不需要传targetguid
              this.inoutToOa(inoutToOaData)
            }
          }
        } else { // 没素材id或者未选中event的情况
          util.Notice.warning('Please select Event!', '', 3000)
          return
        }
      } else { // OA Folder
        if (this.$store.state.registerdata.registerPath) {
          let registerdata = {
            sourceguid: oldclipGuid, // 素材id
            targetmosid: this.$store.state.registerdata.oaFolderMosid,
            targetguid: '',
            relativepath: this.$store.state.registerdata.registerPath,
            isfragment: 0
          }
          if (!isfragment) { // 片段
            registerdata.isfragment = 1
            registerdata.clipin = this.timeIn
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
                        type: OaFolderTaskType,
                        name: oldclipName,
                        studioid: this.$store.state.registerdata.oaFolderMosid
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
      let registerData = this.$store.state.registerdata
      let localJson = {
        Studioid: registerData.selectedStudioid || '',
        FirstPlayDate: registerData.selectTime || '',
        rundownid: registerData.selectRundownid || '',
        StudioMosid: registerData.selectedStudioMosid || '',
        registerViewPath: registerData.registerViewPath || '',
        registerPath: registerData.registerPath || '',
        oaFolderMosid: registerData.oaFolderMosid || ''
      }
      localStorage.setItem('registerdata' + this.$store.state.userInfo.usercode, JSON.stringify(localJson))
      this.allProgramInfo.forEach((item) => {
        item.selected = false
      })
      this.resetDate()
    },
    resetDate () {
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
      this.$store.state.registerdata =
        {
          registerViewPath: playListData.registerViewPath || 'OA Material / ',
          registerPath: playListData.registerPath || '',
          oaFolderMosid: playListData.oaFolderMosid || '',
          selectedStudioid: playListData.Studioid || '',
          selectedStudioMosid: playListData.StudioMosid || '',
          selectTime: playListData.FirstPlayDate || '',
          selectRundownid: playListData.rundownid || '',
          eventData: []
        }
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  list-style: none;
}
#registerOAfolderParentDiv {
  width: 565px;
  height: 500px;
  background: rgba(0, 0, 0, 0.5);
  z-index: 110;
}
#divRegisterWindow {
  width: 100%;
  height: 100%;
  position: absolute;
  background-color: #222222;
  border-bottom: 1px solid #101010;
  overflow: hidden;
  color: #fff;
  z-index: 110;
  -webkit-box-shadow: 0 0 10px #101010;
  -moz-box-shadow: 0 0 10px #101010;
  box-shadow: 0 0 10px #101010;
  top: calc(50% - 251px);
  left: calc(50% - 283px);
  font-family: Arial;
  font-size: 12px;
}
.divTitle {
  height: 35px;
  line-height: 27px;
  border-radius: 4px 4px 0 0;
  color: #999999;
  background-color: #222222;
  border-bottom: 1px solid #101010;
  padding: 0 11px;
  cursor: move;
}

.textTitle {
  float: left;
  margin-top: 5px;
  color: #bcbbbb;
  font-weight: bold;
  font-size: 15px;
}

.closeIcon {
  position: absolute;
  right: 0.3em;
  width: 35px;
  margin: 0;
  padding-right: 26px;
  height: 35px;
  font-size: 0em;
  background-color: #222222;
  border: 0;
  border-left: 1px solid #040404;
  outline: none;
}
.parentDiv {
  padding: 0.5em 1.3em;
}
.parentDiv table {
  width: 100%;
}
.parentTable tr {
  height: 35px;
}
#registerNav {
  margin: 0;
  height: 24px;
  padding: 0;
  line-height: 24px;
  width: 100%;
  border: solid #000000;
  border-width: 1px 0px 1px 0px;
}
#registerNav li {
  list-style: none;
  border-right: 1px solid #000000;
  text-align: center;
  /* display: inline-block; */
  float: left;
  font-size: 14px;
  padding: 0 10px;
  cursor: pointer;
}

#registerNav li:first-child {
  padding-left: 22px;
}

#registerNav .selecter {
  color: #f5a623;
}

#registerFolderDiv {
  width: 96%;
  height: 294px;
  border-bottom: 1px solid #000000;
  padding: 0.5em 1em;
}

#registerFolderDiv .registerFolderParth {
  outline: none;
  height: 24px;
  background: #111111;
  border: none;
  resize: none;
  font-family: Arial;
  font-size: 12px;
  color: #ffffff;
  border: 1px solid #b3b3b3;
  width: 446px;
  margin-top: 10px;
  padding-left: 4px;
}

#registerSelectPathDiv {
  padding: 0;
  height: 233px;
  border: 1px solid #b3b3b3;
  margin-top: 15px;
  float: right;
  margin-right: 2px;
  width: 450px;
  overflow: hidden;
  overflow-x: auto;
  overflow-y: auto;
  position: relative;
}
#registerSelectPath {
  overflow: hidden;
}

#registerSelectPath .folder {
  padding-left: 20px;
  background-image: url(../../assets/images/normal_folder.png);
  background-position: left;
  background-repeat: no-repeat;
  margin-right: 20px;
}

#registerSelectPathDiv .treebglayer {
  width: 100%;
  /*background-color: #f5a623;*/
  height: 25px;
  position: absolute;
  float: left;
  z-index: 0;
  left: 0px;
  margin-top: -20px;
}
#registerSelectPath .treehoverlayer {
  background-color: #5b5a5a;
}

#registerSelectPath .treeselectedlayer {
  background-color: #f5a623;
}
.parentDiv select {
  width: 200px;
  background: #111111;
  color: #ffffff;
  border: solid 1px #585858;
  outline: none;
  margin-left: 5px;
}

.parentTable tr td:first-child label {
  display: inline-block;
  width: 65px;
  text-align: right;
}

.parentTable tr td:nth-child(2) {
  text-align: right;
}

#parentListDiv {
  overflow: hidden;
  overflow-x: auto;
  overflow-y: auto;
  height: 223px;
  border: solid #000000;
  border-width: 1px 1px 1px 1px;
  width: 100%;
}

#tblRundownList th {
  height: 24px;
  background: #2c2c2c;
  border-right: 1px solid #1d1d1d;
  font-weight: 500;
  vertical-align: middle;
}

#tblRundownList tbody td {
  height: 24px;
}

#tblRundownList th:last-child {
  border: none;
}

#tblRundownList td {
  text-align: center;
  vertical-align: middle;
}

#tblRundownList {
  width: 756px;
}

#divRegisterWindow .footer {
  float: right;
  margin-top: 10px;
  margin-bottom: 10px;
}
#divRegisterWindow .cmfooter {
  margin-right: 172px;
}
.footer input[type='button'] {
  width: 84px;
  height: 30px;
  padding: 0;
  border: 0;
  font-size: 14px;
  color: White;
  outline: none;
  border: 1px solid #101010;
  background-color: #292929;
  cursor: pointer;
}
.footer input[type='button']:hover {
  border: 1px solid #f5a623;
}
.footer input[type='button']:active {
  color: #262626;
  background-color: #f5a623;
}
#divRegisterWindow .parentDiv .premireSave {
  margin-right: 25px;
}
#divRegisterWindow .cmSave {
  margin-right: 65px;
}
#tblRundownList tr:nth-child(odd) {
  background-color: #1f1f1f;
}
#tblRundownList tr:nth-child(even) {
  background-color: #222222;
}
tr.row {
  cursor: pointer;
}
#tblRundownList tr.row:hover {
  background-color: #5c5c5c;
}
#tblRundownList tr.row.selectedRow {
  background-color: #5c5c5c;
}
.hide {
  display: none;
}
.folderParthText {
  margin-left: 25px;
  margin-right: 25px;
}
#selectParentDiv div:first-child {
  display: block;
}
#divRegisterWindow .PortionTitle {
  margin: 0;
  margin-left: 12px;
  margin-top: 10px;
  font-size: 14px;
}
#divRegisterWindow .selectPortion {
  margin-top: 8px;
  margin-left: 25px;
}
#divRegisterWindow .selectPortion input[type='radio'] {
  margin-top: 3px;
  vertical-align: -2px;
}
#divRegisterWindow .TargetTitle {
  margin: 0;
  border-top: 1px solid #000000;
  line-height: 24px;
  padding-left: 12px;
  margin-top: 6px;
}
/*文件路径*/
#divRegisterWindow #registerSelectPathDiv .top_hitarea {
  margin-top: 4px;
  background: url('../../assets/images/arrow_down.png');
  cursor: pointer;
  position: relative;
  z-index: 2;
}
#divRegisterWindow #registerSelectPathDiv li {
  list-style: none;
}
#divRegisterWindow #registerSelectPathDiv #MaterialIcon {
  width: 20px;
  height: 17px;
  display: inline-block;
  background: url('../../assets/images/normal_folder.png') no-repeat left;
  vertical-align: -2px;
  position: relative;
  z-index: 2;
}
#divRegisterWindow #registerSelectPathDiv .oaMaterial_Directory {
  position: relative;
  z-index: 2;
}
#divRegisterWindow .selectPortion .Laser {
  display: none;
}
.storyTitle {
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
