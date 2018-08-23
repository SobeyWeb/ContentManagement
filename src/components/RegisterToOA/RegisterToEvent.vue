<template id="registerEvent">
  <div id="rigisterEventDiv" class="rigisterDiv">
    <div class="parentDiv">
      <table class="parentTable">
        <tbody>
          <tr>
            <td>
              <label class="Studio">Studio</label>
              <select id="ddlStudio" @change="selectStudio($event)">
                <option :key="studio.studioid" v-for="studio in data.studiodata" :studioId="studio.studioid" v-bind:value="studio.name" :selected="studio.ischeckedStudio">{{ studio.name }}</option>
                <!--selected="studio.ischeckedStudio"-->
              </select>
            </td>
            <td>
              <label class="registerDate">Date</label>
              <select id="ddlTime" @change="checkedTime($event)">
                <option :key="timeoption.name" v-for="timeoption in data.timedata" v-bind:value="timeoption.name" :selected="timeoption.selected">{{ timeoption.name }}</option>
                <!-- dateArr   selected="studio.ischeckedStudio"-->
              </select>
            </td>
          </tr>
          <tr>
            <td>
              <label class="registerRundown">Rundown</label>
              <select id="ddlRundown" @change="checkedRundown($event)">
                <option :key="rundownoption.Rundownid" v-for="rundownoption in data.rundowndata" :Rundownid="rundownoption.Rundownid" v-bind:value="rundownoption.name" :selected="rundownoption.selected">{{ rundownoption.name }}</option>
                <!--selected="rundownoption.selected"-->
              </select>
            </td>
          </tr>
        </tbody>
      </table>
      <div id="parentListDiv">
        <vue-nice-scrollbar class="folder_box" :speed="150" style="height: 100%">
          <table id="tblRundownList" cellspacing="0">
            <thead>
              <tr>
                <th class="headerStoryTitle">Story Title</th>
                <th class="headerEventTitle">Event Title</th>
                <th class="headerDuration">Duration</th>
                <th class="headerVersion">Version</th>
                <th class="headerSOM">SOM</th>
                <th class="headerEOM">EOM</th>
                <th class="headerChannel">Channel</th>
                <th class="headerEventStatus">Event Status</th>
                <th clss="hide"></th>
              </tr>
            </thead>
            <tbody>
              <tr class="row" :key="studioinfo.MaterialID" v-bind:class="{selectedRow:studioinfo.selected}" @click="selectRow(studioinfo)" v-for="studioinfo in data.programInfo">
                <td class="storyTitle" :title="studioinfo.storyTitle">{{studioinfo.storyTitle}}</td>
                <td class="storyTitle" :title="studioinfo.eventTitle">{{studioinfo.eventTitle}}</td>
                <td>{{studioinfo.duration}}</td>
                <td>{{studioinfo.version}}</td>
                <td>{{studioinfo.som}}</td>
                <td>{{studioinfo.eom}}</td>
                <td>{{studioinfo.channel}}</td>
                <td>{{studioinfo.eventStatus}}</td>
              </tr>
            </tbody>
          </table>
        </vue-nice-scrollbar>
      </div>
    </div>
  </div>
</template>
<script>
import * as util from '../../lib/util.js'
import TYPES from '../../dicts/mutationTypes.js'
export default {
  name: 'registertoevent',
  props: {
    data: Object
  },
  methods: {
    selectStudio (event) {
      var studioId = event.target.selectedOptions[0].getAttribute('studioId')
      this.data.studiodata.forEach((item) => {
        if (item.name === event.target.value && item.studioid === studioId) {
          item.ischeckedStudio = true
        } else {
          item.ischeckedStudio = false
        }
      })
      if (event.target.value !== 'Please select studio') {
        this.data.rundowntimedata = []
        this.data.rundowndata = []
        this.data.programInfo = []
        var checkedStudio = this.data.studiodata.filter(function (item) {
          return item.name === event.target.value
        })
        var mosid = checkedStudio[0].studiomosid
        var studioid = checkedStudio[0].studioid
        this.data.selectedStudioid = studioid
        this.data.selectedStudioMosid = mosid
        if (studioid) {
          this.$store.dispatch({
            type: TYPES.GET_RUNDOWN_LIST,
            data: studioid
          }).then((result) => {
            var datas = result
            if (datas && datas.length > 0) {
              this.data.rundowntimedata = datas
              var arr = []
              var newArr = []
              datas.map(item => item.FirstPlayDate).forEach(item => {
                if (arr.indexOf(item) < 0) arr.push(item)
              })
              arr.sort()
              this.data.tempTimedata = arr
              this.data.tempRundowndata = []
              this.data.tempProgramInfodata = []
              var defaultArr = [{
                name: 'Please select time',
                selected: true
              }]
              if (arr.length > 0) {
                arr.forEach(item => {
                  var obj = {
                    name: item,
                    selected: false
                  }
                  newArr.push(obj)
                })
              }
              this.data.timedata = [...defaultArr, ...newArr]
            }
          }).catch((re) => {
            util.Notice.warning('Rundown list can not be found', '', 3000)
          })
        }
      } else {
        this.data.rundowntimedata = []
        this.data.rundowndata = []
        this.data.programInfo = []
        this.data.timedata = []
        this.data.tempTimedata = []
        this.data.tempRundowndata = []
        this.data.tempProgramInfodata = []
      }
    },
    checkedTime (event) {
      this.data.rundowndata = []
      this.data.programInfo = []
      var currentTime = event.target.value
      this.data.timedata.forEach((item, index) => {
        if (item.name === currentTime && event.target.selectedIndex === index) {
          item.selected = true
        } else {
          item.selected = false
        }
      })

      this.data.selectTime = currentTime
      var Arr = []
      this.data.rundowntimedata.forEach((item) => {
        if (currentTime === item.FirstPlayDate) {
          Arr.push(item)
        }
      })
      this.data.tempRundowndata = Arr
      this.data.tempProgramInfodata = []
      var defaultDate = [{
        studioid: '',
        name: 'Please select rundown list',
        FirstPlayDate: '',
        Rundownid: '',
        selected: true
      }]
      Arr.forEach((item) => {
        item.selected = false
      })
      if (Arr && Arr.length > 0) {
        this.data.rundowndata = [...defaultDate, ...Arr]
      } else {
        this.data.rundowndata = []
      }
    },
    checkedRundown () {
      this.data.programInfo = []
      this.data.tempProgramInfodata = []
      var currentRundown = event.target.value
      var studioID = ''
      var rundowID = ''
      var SelectRundownid = event.target.selectedOptions[0].getAttribute('Rundownid')
      this.data.rundowntimedata.forEach(function (item) {
        if (currentRundown === item.name && SelectRundownid === item.Rundownid) {
          studioID = item.studioid
          rundowID = item.Rundownid
        }
      })
      this.data.rundowndata.forEach((item) => {
        if (item.name === currentRundown && SelectRundownid === item.Rundownid) {
          item.selected = true
        } else {
          item.selected = false
        }
      })
      this.data.selectedStudioid = studioID
      this.data.selectRundownid = rundowID
      var tempProgramInfo = []
      if (studioID && rundowID) {
        this.$store.dispatch({
          type: TYPES.GET_PROGRAMEINFO_LIST,
          data: {
            studioid: studioID,
            rundownid: rundowID
          }
        }).then((result) => {
          var datas = result
          if (datas.length > 0) {
            tempProgramInfo = datas
            var strData = JSON.stringify(tempProgramInfo)
            if (rundowID === this.data.selectRundownid) {
              this.data.programInfo = []
              this.data.tempProgramInfodata = JSON.parse(strData)
              this.data.programInfo = JSON.parse(strData)
            } else {
            }
          }
        }).catch((re) => {
          util.Notice.warning('Program list can not be found', '', 3000)
        })
      }
    },
    selectRow (studioinfo) {
      this.data.programInfo.forEach(function (item) {
        item.selected = false
      })
      studioinfo.selected = true
    }
  },
  computed: {},
  components: {}
}
</script>

<style scoped>
</style>
