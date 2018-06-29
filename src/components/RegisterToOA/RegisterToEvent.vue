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
        <vue-nice-scrollbar class="folder_box" :speed="150" style="height: 100%;">
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

</script>

<style>
</style>
