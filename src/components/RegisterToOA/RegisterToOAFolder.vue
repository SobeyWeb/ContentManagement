<template id="regiterOaFolder">
  <div id="registerFolderDiv" class="rigisterDiv">
    <span class="folderParthText">Folder</span>
    <input type="text" class="registerFolderParth" v-model="data.registerViewPath" readonly="readonly">
    <ul id="registerSelectPathDiv">
      <vue-nice-scrollbar class="folder_box" :speed="150" style="height: 100%;">
        <div id="registerSelectPath" class="treeview">
          <tree-ctrl2 :key="node.path" :data="node" v-for="node in nodes" :callback="callback"></tree-ctrl2>
        </div>
      </vue-nice-scrollbar>
    </ul>
  </div>
</template>
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
        <li v-for="registertype in registertypes" @click="changeregistertype(registertype)" class="registerLi" :class="{selecter:registertype.ischecked}">{{registertype.text}}</li>
        <!--  <li class="registerLi">Select Event</li>
                   <li class="registerLi selecter">Select Folder</li> -->
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

</script>

<style>
</style>
