<template id="registerEvent">
  <div id="rigisterEventDiv" class="rigisterDiv">
    <div class="parentDiv">
      <table class="parentTable">
        <tbody>
          <tr>
            <td>
              <label class="Studio">Studio</label>
              <select id="ddlStudio" @change="selectStudio($event)">
                <option :key="studio.studioid" v-for="studio in allStudio" :studioId="studio.studioid" v-bind:value="studio.name" :selected="studio.selected">{{ studio.name }}</option>
                <!--selected="studio.selected"-->
              </select>
            </td>
            <td>
              <label class="registerDate">Date</label>
              <select id="ddlTime" @change="checkedTime($event)">
                <option :key="timeoption.name" v-for="timeoption in allTimer" v-bind:value="timeoption.name" :selected="timeoption.selected">{{ timeoption.name }}</option>
                <!-- dateArr   selected="studio.selected"-->
              </select>
            </td>
          </tr>
          <tr>
            <td>
              <label class="registerRundown">Rundown</label>
              <select id="ddlRundown" @change="checkedRundown($event)">
                <option :key="rundownoption.Rundownid" v-for="rundownoption in allRundownList" :Rundownid="rundownoption.Rundownid" v-bind:value="rundownoption.name" :selected="rundownoption.selected">{{ rundownoption.name }}</option>
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
              <tr class="row" :key="studioinfo.MaterialID" :class="{selectedRow:studioinfo.selected}" @click="selectRow(studioinfo)" v-for="studioinfo in allProgramInfo">
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
  created: function () {
  },
  methods: {
    selectStudio (event) {
      var studioId = event.target.selectedOptions[0].getAttribute('studioId')
      this.allStudio.forEach((item) => {
        if (item.name === event.target.value && item.studioid === parseInt(studioId)) {
          item.selected = true
        } else {
          item.selected = false
        }
      })
      if (event.target.value !== 'Please select studio') {
        var checkedStudio = this.allStudio.filter(item => item.name === event.target.value)[0]
        var studioid = (checkedStudio && checkedStudio.studioid) || ''
        this.$store.state.registerdata.selectedStudioid = (checkedStudio && checkedStudio.studioid) || ''
        this.$store.state.registerdata.selectedStudioMosid = (checkedStudio && checkedStudio.studiomosid) || ''
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
                    selected: true,
                    children: []
                  }]
                  result.forEach(i => {
                    if (i.FirstPlayDate && item === i.FirstPlayDate) {
                      i.selected = false
                      childrenDate.push(i)
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
              checkedStudio && (checkedStudio.children = [...defaultArr])
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
      // let timeData = this.allTimer && this.allTimer.filter(item => item.selected)[0].children
      this.allTimer && this.allTimer.forEach((item, index) => {
        if (item.name === currentTime && event.target.selectedIndex === index) {
          item.selected = true
        } else {
          item.selected = false
        }
      })
      // this.data.selectTime = currentTime
      this.$store.state.registerdata.selectTime = currentTime
    },
    checkedRundown () {
      let currentRundown = event.target.value
      let studioID = ''
      let rundowID = ''
      let SelectRundownid = event.target.selectedOptions[0].getAttribute('Rundownid')
      // let timeDate = this.data.registerData.filter(item => item.selected)[0].children
      // let rundownDate = timeDate && timeDate.filter(item => item.selected)[0].children
      this.allRundownList && this.allRundownList.forEach(function (item) {
        if (currentRundown === item.name && SelectRundownid === item.Rundownid) {
          studioID = item.studioid
          rundowID = item.Rundownid
          item.selected = true
        } else {
          item.selected = false
        }
      })
      // this.data.selectedStudioid = studioID
      this.$store.state.registerdata.selectRundownid = rundowID
      let curRundown = this.allRundownList && this.allRundownList.filter(item => item.selected)[0]
      if (studioID && rundowID) {
        this.$store.dispatch({
          type: TYPES.GET_PROGRAMEINFO_LIST,
          data: {
            studioid: studioID,
            rundownid: rundowID
          }
        }).then((result) => {
          if (result.length > 0) {
            if (rundowID === this.$store.state.registerdata.selectRundownid) {
              curRundown.children = result
            }
          }
        }).catch((re) => {
          util.Notice.warning('Program list can not be found', '', 3000)
        })
      }
    },
    selectRow (studioinfo) {
      // let timeDate = this.data.registerData.filter(item => item.selected)[0].children
      // let rundownDate = timeDate && timeDate.filter(item => item.selected)[0].children
      // let programInfo = rundownDate && rundownDate.filter(item => item.selected)[0].children
      this.allProgramInfo.forEach(function (item) {
        item.selected = false
      })
      studioinfo.selected = true
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
      return this.allStudio.find(item => item.selected) && this.allStudio.find(item => item.selected).children || []
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
    }
  },
  components: {}
}
</script>

<style>
</style>
