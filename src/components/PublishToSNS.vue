  <template>
  <div id="snsParentDiv">
    <div id="publishToSnsWindow" class="windowDiv animated2 zoomIn">
      <div id="publishToSnsDiv" class="ToSNSDiv ui-dialog-content ui-widget-content">
        <div id="SNSheader">
          <div id="leftSnsAcounts">
            <h3>Select Accounts
              <span class="checkAcountNum">item</span>
              <span id="checSnsAcountkNum" class="checkAcountNum">{{checkSnsAcountNum}}</span>
            </h3>
            <ul id="SnsAcounts">
              <li :key="snsitem.acount" v-for="snsitem in snsitems" v-bind:class="{checkcurrentAcount:snsitem.checkAcount}" @click="transformAcount(snsitem,$event)">
                <input type="checkbox" :checked="snsitem.checked" class="checkSNSAcount" @click="snsitem.checked = !snsitem.checked" v-bind:class="{checkedSNSAcount:snsitem.checked}" />
                <span class="AcountIcon" :class="snsitem.acountType"></span>
                <div class="snsacountname" :class="{isclipSpace:snsfolder}">
                  <div style=''>
                    <label :title="snsitem.acount">{{ snsitem.acount }}</label>
                  </div>
                  <div v-if="snsfolder">
                    <span class="acountState">
                      <span class="defautSpace" :class="{spaceWarning: snsitem.spaceWarning}">{{clipSpace}}</span>
                      <span class="maxWarning">/{{snsitem.maxSpace}}</span>
                    </span>
                  </div>
                </div>
              </li>
            </ul>
          </div>
          <div id="rightContent">
            <div id="clipSnsPreview">
              <div id="previewDiv">
                <video id="previwVdeo" @ended="ceaseMedia" style="width:410px;height:230px;margin-top:10px;" v-if="viewType === 1" :src="clipParth"></video>
                <span class="snsPlay" v-bind:class="{snspaused:ispaused}" @click="playAndPause" v-if="viewType === 1"></span>
                <img v-else-if="viewType === 2" :src="clipParth">
                <span v-else class="previeText">There is no proxy for online preview!</span>
              </div>
              <span :class="{barbarismText:!(currenText.maxLength - currenText.length)}">{{currenText.length}}&nbsp;&nbsp;/&nbsp;</span>
              <span class="descriptionText" :class="{barbarismText:!(currenText.maxLength - currenText.length)}">{{currenText.maxLength}}</span>
            </div>
            <textarea v-if="!isyoutube" v-model="textArae.comments" @keyup="volidInput($event,'Comments')" v-bind:maxlength="textArae.maxLength" @focus="focus" @input="changeText($event)" checkchar="true" snstextArea="true"></textarea>
            <div v-else class="youtubeInfo">
              <div class="inputDiv">
                <div class="publishUrlDiv">
                  <label>Title:</label>
                  <input type="text" v-model="textArae.title" @keyup="volidInput($event,'Title')" class="publishUrl" @focus="focus" @input="changeText($event)" v-bind:maxlength="100">
                </div>
                <div class="publishUrlDiv">
                  <label>Description:</label>
                  <textarea v-model="textArae.comments" class="publishUrl" @keyup="volidInput($event,'Description')" v-bind:maxlength="textArae.maxLength" @input="changeText($event)" @focus="focus"></textarea>
                </div>
                <div class="publishUrlDiv">
                  <label>Tag:</label>
                  <input type="text" v-model="textArae.tag" class="publishUrl" @keyup="volidInput($event,'Tag')" v-bind:maxlength="500" @focus="focus" @input="changeText($event,'tag')">
                </div>
              </div>
              <table class="youtubeDescription">
                <tbody>
                  <tr>
                    <td>
                      <rd-select :select="textArae.playlist"></rd-select>
                      <label class="Studio">Playlist:</label>
                    </td>
                    <td>
                      <rd-select :select="textArae.license"></rd-select>
                      <label class="Studio">License:</label>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <rd-select :select="textArae.privacy"></rd-select>
                      <label class="Studio">Privacy:</label>
                    </td>
                    <td>
                      <rd-select :select="textArae.category"></rd-select>
                      <label class="Studio">Category:</label>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div id="clipFacebookOpration" v-show="sen">
              <div class="publishOptions">
                <div class="sensnstype">
                  <rd-radio-group :radios="textArae.requestType" @change="changerequestType(textArae)"></rd-radio-group>
                </div>
                <div class="timerDiv" v-show="then">
                  <rd-datepicker :date="textArae.requestDate" :options="textArae.requestDate.options" class="publishDate"></rd-datepicker>
                </div>
              </div>
              <div class="publishUrlDiv">
                <label>Article URL</label>
                <input type="text" v-model="textArae.urlText" class="publishUrl" @blur="invalidUrl()" :disabled="!ispublishHeadline">
              </div>
              <div class="publishUrlDiv headline" v-show="isPublishNow">
                <label class="headlineTitle">Headline</label>
                <input type="text" v-model="textArae.headline" class="publishUrl" :disabled="textArae.urlText.length <= 0 || !ispublishHeadline">
                <!-- 后期将填上:disabled="textArae.urlText.length <= 0"  TV2lorry:disabled="textArae.urlText.length <= 0||viewType == 2"-->
              </div>
            </div>
          </div>
        </div>
        <div id="">
          <div class="buttons2">
            <input class="btnSave" id="SNSPublistBtn" @click="PublishToSns" type="button" value="Publish" title="Publish" :disabled="!selectAcountList.length" />
            <input class="btnCancel" id="SNSCancelBtn" @click="cancelsnsWindow" type="button" value="Cancel" title="Cancel" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TYPES from '../dicts/mutationTypes.js'
import APPSETTING from '../config/appSetting'
import * as util from '../lib/util.js'
let defaultRequestType = [{
  checked: true,
  value: 'Publish Now'
}, {
  checked: false,
  value: 'Draft'
}, {
  checked: false,
  value: 'Schedule'
}]
export default {
  name: 'publishToSNS',
  data () {
    return {
      textArae: {
        pageid: '',
        acount: '',
        maxLength: '65535',
        acountType: '',
        title: '',
        comments: '',
        tag: '',
        urlText: '',
        headline: '',
        timeWarning: false,
        spaceWarning: false,
        maxSpace: '1G',
        requestType: defaultRequestType,
        requestDate: {
          value: '',
          options: {
            format: 'YYYY-MM-DD HH:mm:ss', // YYYY/MM/DD HH:mm:ss
            monthList: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            weekList: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            placeHolder: 'Please select time',
            position: 'top',
            autoPosition: false,
            timePicker: true,
            limit: {
              customerLimit (day) {
                if (Date.parse(day.time._i) >= Date.parse(new Date().format('yyyy-MM-dd'))) {
                  return false
                }
                return true
              }
            }
          }
        },
        checkAcount: false,
        checked: false,
        playlist: [],
        license: [],
        privacy: [],
        category: []
      },
      then: false,
      sen: false,
      isPublishNow: true,
      isyoutube: false,
      checkSnsAcountNum: '0',
      textarea: '',
      ispaused: false,
      countArr: [],
      // taskname: '',
      tempAcountArr: [],
      tempTextArae: {},
      currenText: {
        length: 0,
        maxLength: 65535
      }
    }
  },
  created () { },
  mounted () {
  },
  watch: {
    snsitems: function () {
      if (this.snsitems && this.snsitems.length > 0) {
        this.snsitems[0].checkAcount = true
        this.textArae = this.snsitems[0]
      }
    },
    textArae: function () {
      this.currenText.length = this.textArae.comments.length
      this.currenText.maxLength = this.textArae.maxLength
      if (this.textArae.acountType === 'youtube') {
        this.isyoutube = true
      } else {
        this.isyoutube = false
      }
      if (this.textArae.acountType === 'facebook') {
        this.sen = true
      } else {
        this.sen = false
      }
    }
  },
  computed: {
    taskname () {
      return this.$store.getters.selectedMaterial && this.$store.getters.selectedMaterial.name || ''
    },
    selectedMaterials () {
      return this.$store.state.selectedMaterials
    },
    materialSpace () {
      return this.$store.state.materialSpace
    },
    viewType () {
      return this.selectedMaterials.length && this.selectedMaterials[0].type === 'video' ? 1 : 2
    },
    clipParth () {
      return this.$store.state.snsviewPath
    },
    snsiconfilename () {
      return this.$store.state.snsiconfilename
    },
    currrentid () {
      return (this.selectedMaterials && this.selectedMaterials[0].guid) || ''
    },
    curentName () {
      return (this.selectedMaterials && this.selectedMaterials[0].name) || ''
    },
    snsitems: {
      get () {
        if (this.$store.state.configSNSid) {
          let configAcount = this.$store.state.configSNSid
          let tempArr = this.countArr.filter(item => configAcount.some(i => i === item.snsid))
          return tempArr
        } else {
          return []
        }
      },
      set (val) {
        this.$store.state.configSNSid = val
      }
    },
    clipSpace () {
      return this.formatStorage(this.materialSpace)
    },
    snsfolder () {
      if (this.$store.getters.currentNode.path === APPSETTING.PRESNSPUBLISHPATH || this.selectedMaterials[0].folderpath === APPSETTING.PRESNSPUBLISHPATH) {
        return true
      } else {
        return false
      }
    },
    ispublishHeadline () {
      return APPSETTING.PUBLISHHEADLINE
    },
    selectAcountList () {
      return this.snsitems.length && this.snsitems.filter(item => item.checked) || []
    }
  },
  methods: {
    getTimeWarning (timelimit) {
      if (this.viewType === 2) { // 图片不限制长度
        return false
      } else {
        return this.selectedMaterials && this.selectedMaterials[0].ftotalDuration / 10000000 > timelimit
      }
    },
    getSpaceWarning (apptype, filesizelimit) {
      let flag = false
      let currentSpace = parseFloat(this.materialSpace / (1024 * 1024))
      if (apptype === 2) { // facebook
        if (currentSpace > 1024 || currentSpace > filesizelimit) {
          flag = true
        }
      } else if (apptype === 3) { // youtube
        if (currentSpace > 20480 || currentSpace > filesizelimit) {
          flag = true
        }
      } else { // twitter
        if ((this.viewType === 2 && currentSpace > 5) || (currentSpace > 512 && this.viewType === 1) || currentSpace > filesizelimit) {
          flag = true
        }
      }
      return flag
    },
    volidInput (event, key) {
      let snsKey = key.toLowerCase()
      snsKey === 'description' && (snsKey = 'comments')
      this.textArae[snsKey] = util.volidInput(event.target.value, event.target.maxLength, event.target, false, key)
      this.currenText.length = event.target.value.length
    },
    focus (event) {
      this.currenText.length = event.target.value.length
      this.currenText.maxLength = event.target.maxLength
    },
    changeText (event, key) {
      this.currenText.length = event.target.value.length
      if (key && key === 'tag' && event.target.value.indexOf(',') > -1) {
        var newArr = event.target.value.split(',')
        if (newArr.length && newArr.length === 6) {
          event.target.value = event.target._value
          newArr = event.target.value.split(',')
          util.Notice.warning('The maximum number supported is 5!', '', 3000)
        }
        newArr.length && newArr.forEach((item, index) => {
          if (item.length > 100) {
            newArr[index] = item.slice(0, 100)
            util.Notice.warning('Tag exceeds the maximum length that system supports', '', 3000)
          }
        })
        event.target.value = newArr.join(',')
        this.textArae[key] = event.target.value
        this.currenText.length = event.target.value.length
      }
    },
    getDropdata (data) {
      var newArr = []
      try {
        data = JSON.parse(data)
      } catch (e) {
        data = []
      }
      data.length && data.forEach((item, index) => {
        let json = {
          id: index,
          value: item.name,
          description: item.id,
          type: 'info',
          disabled: false,
          selected: !index
        }
        newArr.push(json)
      })
      return newArr
    },
    NumDescSort (property) {
      return function (a, b) {
        var value1 = a[property]
        var value2 = b[property]
        return value1 - value2
      }
    },
    formatStorage (v) {
      if (v === 0) return '0 B'
      let k = 1024
      let sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
      let i = Math.floor(Math.log(v) / Math.log(k))
      return (v / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]
    },
    getStorageByMB (v) {
      if (v === 0) return '0 MB'
      let k = 1024
      let sizes = ['MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
      let i = Math.floor(Math.log(v) / Math.log(k))
      return (v / Math.pow(k, i)).toFixed(2) + '' + sizes[i]
    },
    getMaxSpace (apptype, filesizelimit) {
      return this.getStorageByMB(filesizelimit)
    },
    resetData () {
      // this.$store.state.ispublish = false
      // this.$store.state.publishWindow.hide()
      this.checkSnsAcountNum = 0
      this.snsitems = []
      this.countArr = []
      this.countArr = JSON.parse(JSON.stringify(this.tempAcountArr))
      this.textArae = JSON.parse(JSON.stringify(this.tempTextArae))
      if (this.textArae.requestDate.value) {
        this.textArae.requestDate.value = ''
      }
      this.currenText = {
        length: 0,
        maxLength: 65535
      }
      this.then = false
      this.sen = false
      this.isyoutube = false
      this.isPublishNow = true
    },
    cancelsnsWindow () {
      // this.resetData()
      this.$store.state.publishWindow.hide()
    },
    playAndPause () { // 播放暂停
      let myVideo = document.getElementById('previwVdeo')
      if (myVideo.paused) {
        myVideo.play()
        this.ispaused = true
      } else {
        myVideo.pause()
        this.ispaused = false
      }
    },
    ceaseMedia () {
      this.ispaused = false
    },
    invalidUrl: function () {
      let reg = /^((https|http|ftp|rtsp|mms):\/\/)?[A-Za-z0-9]+\.[A-Za-z0-9]+[/=?%-&_~`@[]':+!]*([^<>""])*$/
      let NewVal = event.target.value
      if (NewVal && !reg.test(NewVal)) {
        event.target.value = ''
        this.textArae.urlText = ''
        if (this.textArae.headline && this.textArae.headline.length > 0) {
          this.textArae.headline = ''
        }
        util.Notice.warning('illegal characters', 'Your URL is not property formatted.', 3000)
      } else if (!NewVal) {
        if (this.textArae.headline && this.textArae.headline.length > 0) {
          this.textArae.headline = ''
        }
      }
    },
    changerequestType: function (textArae) {
      let requestType = textArae.requestType.find(item => item.checked).value
      if (requestType === 'Publish Now') {
        this.isPublishNow = true
      } else {
        //  this.isPublishNow = false // ---------------------------1.4暂时先支持每个都显示
      }
      if (requestType === 'Schedule') {
        this.then = true
      } else {
        this.then = false
        this.textArae.requestDate.value = ''
      }
    },
    transformAcount: function (item, event) {
      this.checkSnsAcountNum = this.snsitems.filter(function (item) {
        return item.checked
      }).length.toString()
      this.snsitems.forEach(function (item) {
        item.checkAcount = false
      })
      item.checkAcount = true
      this.textArae = item
      let requestType = ''
      if (this.textArae.requestType && this.textArae.requestType.length > 0) {
        requestType = this.textArae.requestType.find(item => item.checked).value
      }

      if (item.acountType === 'facebook') {
        if (requestType === 'Schedule') {
          this.then = true
        } else {
          this.then = false
        }
        if (requestType === 'Publish Now') {
          this.isPublishNow = true
        } else {
          //  this.isPublishNow = false;//---------------------------1.4暂时先支持每个都显示
        }
        this.isyoutube = false
      } else if (item.acountType === 'youtube') {
        this.isyoutube = true
      } else {
        this.isyoutube = false
      }
    },
    getSendAcounts (comments) {
      let sendAcounts = []
      sendAcounts = this.snsitems.filter(item => comments.some(i => i.snsid === item.pageid || i.snsid === item.snsid)).map(p => p.acount)
      return sendAcounts
    },
    getPublishType (AcountType, RequestType) {
      let Result = {
        senType: 'SendSNS',
        publishtype: '0'
      }
      if (AcountType === 'twitter' || AcountType === 'youtube') {
        Result.publishtype = '0'
        Result.senType = AcountType === 'twitter' ? 'SendSNS' : 'SendYoutube'
      } else {
        Result.publishtype = RequestType === 'Schedule' ? '1' : (RequestType === 'Publish Now' ? '0' : '2')
        Result.senType = RequestType === 'Schedule' ? 'Schedule' : (RequestType === 'Publish Now' ? 'SendImmediately' : 'FacebookSaveAsDraft')
      }
      return Result
    },
    PublishToSns: function () {
      let snsAcountInfoList = this.snsitems.filter(function (item) {
        return item.checked
      })
      if (snsAcountInfoList.length > 0) { // 选择了发布账号
        let errorAcount = snsAcountInfoList.filter(item => item.timeWarning || item.spaceWarning)
        let errorAcountName = []
        errorAcount.length && errorAcount.forEach(item => {
          errorAcountName.push(item.acount)
        })
        errorAcountName.length && util.Notice.warning('The duration or file size of the clip exceeds the ' + errorAcountName.join(',') + ' account limitation!', '', 3000)
        snsAcountInfoList = snsAcountInfoList.filter(item => !item.timeWarning && !item.spaceWarning)
        let sendsnsComments = []
        let clipSubtype = this.viewType
        let AccountType = {
          'twitter': '0',
          'facebook': '1',
          'youtube': '2'
        }
        let inconformitySnsAcount = []
        snsAcountInfoList.forEach((item) => {
          let RequestType = item.requestType.length > 0 ? item.requestType.find(item => item.checked).value : ''
          let publishTypeJson = this.getPublishType(item.acountType, RequestType)
          let comments = {
            'senType': publishTypeJson.senType,
            'snsid': item.acountType === 'facebook' ? item.pageid : item.snsid,
            'AcountName': item.acount,
            'Comment': item.comments,
            'accounttype': AccountType[item.acountType], // 账号类型（0：twitter，1：facebook，2：youtube）
            'publishtype': publishTypeJson.publishtype // 发送类型（0：立即发布（twitter也是立即发布），1：定时发布，2：保存到草稿箱）
          }
          if (item.acountType === 'youtube') {
            comments.title = item.title || ''
            comments.youtubeparameter = {
              channelid: item.pageid,
              playlistid: item.playlist.value && item.playlist.value.description || '',
              license: item.license.value && item.license.value.description || '',
              privacy: item.privacy.value && item.privacy.value.description || '',
              categoryid: item.category.value && item.category.value.description || '',
              tags: item.tag && item.tag.split(',').filter(item => item) || null
            }
          }
          if (RequestType) {
            if (RequestType === 'Schedule') { // 定时发送
              if (item.requestDate !== '') {
                // 判断时间是否在当前时间后十分钟
                let PublishDate = item.requestDate.value.replace(/-/g, '/')
                let oldTime = Date.parse(PublishDate)
                let date = Date.parse(new Date())
                let DifferDate = oldTime - date
                DifferDate = parseInt(DifferDate / (60 * 1000))
                if (DifferDate > 12) { // 比当前时间大12分钟
                  comments.link = item.urlText
                  comments.schduleDate = new Date(Date.parse(item.requestDate.value) + (new Date().getTimezoneOffset() * 60 * 1000)).format('yyyy-MM-dd hh:mm:ss')
                } else {
                  inconformitySnsAcount.push(item.acount) // 时间不合格的发送账号
                }
              } else {
                inconformitySnsAcount.push(item.acount) // 时间不合格的发送账号
              }
            } else {
              if (RequestType === 'Publish Now') { // 立即发送
                comments.link = item.urlText
                comments.adsattachments = item.urlText ? {
                  'videocover': '',
                  'headline': item.headline,
                  'description': item.comments,
                  'call2action': {
                    'type': 'LEARN_MORE',
                    'link': item.urlText
                  }
                } : null
              } else { // 保存到草稿箱
                comments.link = item.urlText
              }
            }
          }
          sendsnsComments.push(comments)
        })
        if (inconformitySnsAcount && inconformitySnsAcount.length > 0) {
          util.Notice.warning('The ' + inconformitySnsAcount.join(',') + 'Send time not qualified!', '', 3000)
        }
        if (sendsnsComments.length > 0) {
          if (((this.materialSpace <= 1024 && this.materialSpace > 512) || (this.materialSpace <= 512 && clipSubtype === 2 && this.materialSpace > 5)) && this.snsfolder) {
            let twitterComment = sendsnsComments.filter((item) => {
              return item.senType === 'SendSNS'
            })
            sendsnsComments = sendsnsComments.filter((item) => {
              return item.senType !== 'SendSNS'
            })
            if (twitterComment && twitterComment.length > 0) {
              let aounts = this.getSendAcounts(twitterComment)
              util.Notice.warning(aounts.join(',') + ' Failed to add the publish task(s)!', '', 3000)
            }
          }
          sendsnsComments.forEach(function (i, v) {
            if (i.senType === 'SendImmediately' && i.adsattachments) {
              if (clipSubtype === 1) {
                clipSubtype = 3
              } else if (clipSubtype === 2) {
                clipSubtype = 4
              }
            }
            delete i.senType
          })
          let isSendMPC = this.snsfolder || false // 如果当前素材是在SNSfolder目录 表示已经预发布过（已经转码）
          // clipSubtype 3表示带广告的视屏  4表示带广告的图片
          let publishData = {
            'taskname': this.curentName,
            'isprepublish': isSendMPC, // isSendMPC, // 是否需要转码 true表示不需要转码
            'contentid': this.currrentid,
            'contenttype': parseInt(clipSubtype),
            'PageParameter': sendsnsComments
          }
          this.$store.dispatch({
            type: TYPES.PUBLISH_TO_SNS,
            data: publishData
          }).then((result) => {
            if (result.data.code === '0') {
              let resAcountinfo = result.data.ext
              let successAcount = resAcountinfo.filter(item => {
                return item.code === '0'
              })
              let errorAcount = resAcountinfo.filter(item => {
                return item.code === '1'
              })
              if (successAcount && successAcount.length > 0) {
                let successCountName = this.getSendAcounts(successAcount)
                util.Notice.success('The ' + successCountName.join(',') + ' publish task(s) is added successfully!', '', 3000)
              }
              if (errorAcount && errorAcount.length > 0) {
                errorAcount.forEach((item) => {
                  let comment = []
                  comment.push(item)
                  let countName = this.getSendAcounts(comment)
                  util.Notice.warning(countName + ' publishing failed, ' + item.msg, '', 3000)
                })
              }
            } else {
              let resAcountinfo = result.data.ext
              resAcountinfo.forEach((item) => {
                let comment = []
                comment.push(item)
                let countName = this.getSendAcounts(comment)
                util.Notice.warning(countName + ' publishing failed, ' + item.msg, '', 3000)
              })
            }
          }).catch(() => {

          })
          // this.resetData()
          this.$store.state.publishWindow.hide()
        }
      } else { // 未选择发布账号
        util.Notice.warning('Please choose the accounts to publish the clip!', '', 3000)
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
#snsParentDiv {
  width: 830px;
  height: 563px;
  font-family: 'proximanova', 'pro_text', 'micorsoft yahei', 'sans-serif';
  font-weight: lighter;
  z-index: 999;
}
#publishToSnsWindow {
  background: #222222;
  padding: 0;
  border-bottom: 1px solid #101010;
  color: #fff;
  z-index: 99999;
  -webkit-box-shadow: 0 0 10px #101010;
  -moz-box-shadow: 0 0 10px #101010;
  box-shadow: 0 0 10px #101010;
  font-family: 'proximanova', 'pro_text', 'micorsoft yahei', 'sans-serif';
  font-weight: lighter;
  font-size: 14px;
  width: 100%;
  height: 100%;
}
/**/
.ToSNSDiv table td {
  padding: 3px;
}
.ToSNSDiv .AccountDiv {
  overflow: hidden;
  margin-top: 10px;
  background: #333333;
  padding: 8px 4px;
}

#SNSheader #leftSnsAcounts h3 {
  padding-left: 1em;
  height: 36px;
  background: #444243;
  line-height: 36px;
}

#SNSheader #leftSnsAcounts h3 .checkAcountNum {
  float: right;
  margin-right: 5px;
}
.ToSNSDiv .AccountDiv ul {
  width: 200px;
  height: 89px;
  overflow-y: auto;
}

.ToSNSDiv .AccountDiv img,
.ToSNSDiv .AccountDiv ul,
.ToSNSDiv .AccountDiv textarea {
  float: left;
  display: inline-block;
}

.ToSNSDiv textarea,
.ToSNSDiv input[type='text'] {
  resize: none;
  color: #ffffff;
  font-family: Arial;
  outline: none;
  border: none;
  padding: 4px;
}

.ToSNSDiv textarea {
  height: 81px;
  background: #1a1a1a;
  width: calc(100% - 25px);
  margin-left: 9px;
}

.descriptionText {
  margin-right: 10px;
  line-height: 20px;
}
.barbarismText {
  color: red;
}
.ToSNSDiv textarea:focus {
  outline: 1px solid #f5a623;
  background: #000000;
}

.ToSNSDiv textarea.failVerify {
  outline: 1px solid red;
}

.ToSNSDiv #leftSnsAcounts ul {
  /*margin: 0 10px;*/
  overflow-y: auto;
  height: 496px;
  width: 100%;
}

.ToSNSDiv #leftSnsAcounts ul li {
  border-bottom: 1px solid #484a4b;
  height: 40px;
  /*margin-right: 5px;*/
  padding: 0 1em;
  /*line-height: 40px;*/
  position: relative;
}
.ToSNSDiv #leftSnsAcounts ul li label {
  display: inline-block;
  vertical-align: middle;
  width: 152px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ToSNSDiv #leftSnsAcounts ul .checkcurrentAcount {
  background-color: #2a2a2a;
}

.ToSNSDiv #leftSnsAcounts ul li .AcountIcon {
  width: 24px;
  height: 24px;
  display: inline-block;
  vertical-align: middle;
  margin: 0 5px;
  margin-top: 8px;
}
.ToSNSDiv #leftSnsAcounts ul li .facebook {
  background: url('../assets/images/facebookIcon.png') no-repeat center;
}
.ToSNSDiv #leftSnsAcounts ul li .twitter {
  background: url('../assets/images/twitterIcon.png') no-repeat center;
}
.ToSNSDiv #leftSnsAcounts ul li .youtube {
  background: url('../assets/images/youtube.png') no-repeat center;
}

.ToSNSDiv #leftSnsAcounts ul .acountState {
  display: inline-block;
  height: 15px;
  position: absolute;
  line-height: 16px;
  text-align: left;
}
.ToSNSDiv #leftSnsAcounts ul li .spaceWarning {
  color: red;
}
.ToSNSDiv #leftSnsAcounts ul li .maxWarning {
  color: #bbb;
}
#SnsAcounts .snsacountname {
  float: right;
  margin-top: 13px;
}
#SnsAcounts .isclipSpace {
  margin-top: 6px;
}
.ToSNSDiv #leftSnsAcounts ul li .checkSNSAcount {
  cursor: pointer;
  -webkit-appearance: none;
  vertical-align: middle;
  display: inline-block;
  width: 14px;
  height: 14px;
  background: url('../assets/images/snscheckbox_nor.png') no-repeat center;
  cursor: pointer;
  margin-top: 9px;
}

.ToSNSDiv #leftSnsAcounts ul li .checkSNSAcount.over {
  background: red;
}

.ToSNSDiv #leftSnsAcounts ul li .checkSNSAcount.checkedSNSAcount {
  background: url('../assets/images/snscheckbox_check.png') center center
    no-repeat;
}

.ToSNSDiv .AccountDiv ul li span {
  vertical-align: -4px;
  color: #b5b7b8;
  margin-left: 10px;
  display: inline-block;
  width: 170px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.ToSNSDiv .publishUrlDiv {
  margin: 6px 0 7px;
  vertical-align: middle;
}
#leftSnsAcounts,
#rightContent {
  float: left;
  height: 532px;
}

#leftSnsAcounts {
  width: 240px;
  background: #373737;
  /*padding: 0 1em;*/
}

#rightContent {
  width: calc(100% - 240px);
}

#clipSnsPreview {
  text-align: right;
}

#previewDiv {
  text-align: center;
  background-color: #161616;
  width: calc(100% - 18px);
  height: 250px;
  margin-left: 10px;
  margin-bottom: 10px;
  line-height: 250px;
  position: relative;
}

#clipSnsPreview #previewDiv .snsPlay {
  display: inline-block;
  width: 101px;
  height: 101px;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  margin: auto;
  background: url('../assets/images/sns_play.png') no-repeat center;
  display: none;
}

#clipSnsPreview #previewDiv .snsPlay:hover {
  display: block;
}

#clipSnsPreview #previewDiv .snspaused {
  background: url('../assets/images/sns_pause.png') no-repeat center;
}

#clipSnsPreview #previewDiv #previwVdeo:hover + .snsPlay {
  display: block;
}

#clipSnsPreview #previewDiv .previeText {
  text-align: center;
  color: #fdbc21;
  font-size: 2em;
}

#clipSnsPreview #previewDiv img {
  max-height: 250px;
  max-width: 570px;
  vertical-align: middle;
}

#clipFacebookOpration {
  margin-left: 14px;
}
#SnsComments {
  width: 560px;
  height: 70px;
  margin-right: 5px;
}
.ToSNSDiv .publishUrlDiv .publishUrl:focus {
  outline: 1px solid #f5a623;
  background: #000000;
}

.ToSNSDiv .publishOptions .sensnstype {
  width: calc(100% - 198px);
}
.ToSNSDiv .publishOptions .sensnstype,
.ToSNSDiv .publishOptions .timerDiv {
  float: left;
  line-height: 33px;
}
.ToSNSDiv .publishOptions .sensnstype .rd-radio {
  width: 27%;
  line-height: 42px;
}
.ToSNSDiv .publishOptions .sensnstype .rd-radio:nth-child(2) {
  width: 18%;
  margin: 0 30px;
}
.ToSNSDiv .publishOptions .sensnstype .rd-radio-inner {
  top: -1px;
}
.ToSNSDiv .publishUrlDiv .headlineTitle {
  margin-right: 12px;
}
.ToSNSDiv .publishUrlDiv .publishUrl {
  background: #1a1a1a;
  height: 20px;
  margin-left: 21px;
  width: calc(100% - 107px);
}

.ToSNSDiv .publishOptions select {
  margin-left: 5px;
  width: 190px;
  background: #101010;
  color: #ffffff;
  outline: none;
  border: none;
  border-left: 1px solid #505050;
  border-right: 1px solid #505050;
  height: 25px;
  margin-right: 20px;
}

.ToSNSDiv .publishOptions .publishDate {
  outline: none;
  border: 1px solid #505050;
  background: #101010;
  color: #ffffff;
  width: 144px;
  cursor: pointer;
  z-index: 2;
  height: 25px;
  border-radius: 0;
  line-height: 25px;
}
.publishOptions {
  height: 40px;
}
.publishOptions .timerDiv {
  position: relative;
}

.publishOptions .timerDiv .timeIcon {
  position: absolute;
  width: 0;
  height: 0;
  top: 10px;
  border: 5px solid transparent;
  border-top: 5px solid #ffffff;
  cursor: pointer;
  right: 9px;
  z-index: 2;
}
.publishOptions .timerDiv .rd-datepicker-clear {
  top: -3px;
}

.buttons2 {
  overflow: hidden;
  width: 226px;
  margin: 0 auto;
  margin-top: 10px;
}

.buttons2 input[type='button'] {
  /*margin-left: 5px;*/
  width: 88px;
  height: 26px;
  padding: 0;
  font-size: 12px;
  color: White;
  outline: none;
  float: left;
  background: #1b1b1d;
  border: 1px solid #101010;
  box-shadow: 0 0 2px #101010;
  cursor: pointer;
}
.buttons2 input[type='button'][disabled='disabled'] {
  color: rgb(207, 210, 212);
  cursor: not-allowed;
  background: rgb(128, 128, 128);
  border-color: rgb(16, 16, 16);
}

.buttons2 input[type='button']:hover,
.buttonBtn input[type='reset']:hover {
  border: 1px solid #f5a623;
}

.buttons2 input[type='button']:active,
.buttonBtn input[type='reset']:active {
  background: #f5a623;
}

.buttons2 #SNSPublistBtn {
  margin-right: 50px;
}
#publishToSnsDiv .rd-datepicker-container {
  padding: 0 0.5rem 0 2px;
}
#publishToSnsDiv .youtubeInfo {
  margin: 0 8px 0 14px;
}
#publishToSnsDiv .youtubeInfo .inputDiv {
  text-align: right;
}
#publishToSnsDiv .youtubeInfo .inputDiv textarea {
  height: 50px;
}
#publishToSnsDiv .youtubeInfo .youtubeDescription {
  width: 100%;
}
#publishToSnsDiv .youtubeInfo .youtubeDescription td {
  width: 284px;
  padding: 3px 0;
}
#publishToSnsDiv .youtubeInfo .youtubeDescription label {
  line-height: 30px;
  float: right;
}
#publishToSnsDiv .youtubeInfo .youtubeDescription .rd-select-container {
  width: 185px;
  float: right;
  border-radius: 0;
  padding: 0px 1rem 0 0.2rem;
  background: #1a1a1a;
  margin-left: 24px;
}
</style>
