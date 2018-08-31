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
      this.data.registerData.forEach((item) => {
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
        var studioid = (checkedStudio && checkedStudio[0].studioid) || ''
        this.data.selectedStudioid = (checkedStudio && checkedStudio[0].studioid) || ''
        this.data.selectedStudioMosid = studioid
        if (studioid) {
          this.$store.dispatch({
            type: TYPES.GET_RUNDOWN_LIST,
            data: studioid
          }).then((result) => {
            if (result && result.length > 0) {
              // this.data.rundowntimedata = datas
              var arr = []
              // var newArr = []
              var rundownData = result.map(item => item.FirstPlayDate) || []
              rundownData.forEach(item => {
                if (arr.indexOf(item) < 0) arr.push(item)
              })
              arr.sort()
              var defaultArr = [{
                name: 'Please select time',
                selected: true,
                children: []
              }]
              if (arr.length > 0) {
                arr.forEach(item => {
                  let childrenDate = [{
                    studioid: '',
                    name: 'Please select rundown list',
                    FirstPlayDate: '',
                    Rundownid: '',
                    selected: true
                  }]
                  rundownData && rundownData.forEach(i => {
                    if (item === i.FirstPlayDate) {
                      item.selected = false
                      childrenDate.push(item)
                    }
                  })
                  var obj = {
                    name: item,
                    selected: false,
                    children: childrenDate
                  }
                  defaultArr.push(obj)
                })
              }
              checkedStudio && (checkedStudio[0].children = [...defaultArr])
            }
          }).catch((re) => {
            util.Notice.warning('Rundown list can not be found', '', 3000)
          })
        }
      } else {
      }
    },
    checkedTime (event) {
      var currentTime = event.target.value
      let timeData = this.data.registerData && this.data.registerData.filter(item => item.selected)[0].children
      timeData && timeData.forEach((item, index) => {
        if (item.name === currentTime && event.target.selectedIndex === index) {
          item.selected = true
        } else {
          item.selected = false
        }
      })
      this.data.selectTime = currentTime
    },
    checkedRundown () {
      let currentRundown = event.target.value
      let studioID = ''
      let rundowID = ''
      let SelectRundownid = event.target.selectedOptions[0].getAttribute('Rundownid')
      let timeDate = this.data.registerData.filter(item => item.ischeckedStudio)[0].children
      let rundownDate = timeDate && timeDate.filter(item => item.selected)[0].children
      rundownDate && rundownDate.forEach(function (item) {
        if (currentRundown === item.name && SelectRundownid === item.Rundownid) {
          studioID = item.studioid
          rundowID = item.Rundownid
          item.selected = true
        } else {
          item.selected = false
        }
      })
      this.data.selectedStudioid = studioID
      this.data.selectRundownid = rundowID
      let curRundown = rundownDate && rundownDate.filter(item => item.selected)[0]
      if (studioID && rundowID) {
        this.$store.dispatch({
          type: TYPES.GET_PROGRAMEINFO_LIST,
          data: {
            studioid: studioID,
            rundownid: rundowID
          }
        }).then((result) => {
          if (result.length > 0) {
            if (rundowID === this.data.selectRundownid) {
              curRundown.children = result
            }
          }
        }).catch((re) => {
          util.Notice.warning('Program list can not be found', '', 3000)
        })
      }
    },
    selectRow (studioinfo) {
      let timeDate = this.data.registerData.filter(item => item.selected)[0].children
      let rundownDate = timeDate && timeDate.filter(item => item.selected)[0].children
      let programInfo = rundownDate && rundownDate.filter(item => item.selected)[0].children
      programInfo.forEach(function (item) {
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
