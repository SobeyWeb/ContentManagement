<template>
  <div class="totalDiskSpace" id="userStorage">
    <div id="userSpace" :class="{space_warning:usageRates>=warningPercent}">
      <div class="totalDiskSpace">
        <div class="userDiskSpace" v-bind:style="{width: usageRates*100+'%'}"></div>
      </div>
      <div class="diskspaceInfo">
        <span class="employ">{{displayStorageUsage}}</span>
        <span class="storagesize">{{displayStorageSize}}</span>
      </div>
    </div>
  </div>
</template>

<script>
import TYPES from '../dicts/mutationTypes.js'
import APPSETTING from '../config/appSetting'
export default {
  name: 'UserSpace',
  data () {
    return {
      warningPercent: 0.9
    }
  },
  created () {
    this.getUserStorage()
    setInterval(this.getUserStorage, APPSETTING.USERSPACEINTERVAL || 60 * 1000)
  },
  computed: {
    sumSpace: {
      get () {
        return this.$store.state.sumSpace
      },
      set (val) {
        this.$store.state.sumSpace = val
      }
    },
    useSpace: {
      get () {
        return this.$store.state.useSpace
      },
      set (val) {
        this.$store.state.useSpace = val
      }
    },
    usageRates () {
      return this.useSpace / this.sumSpace < 0 ? 0 : this.useSpace / this.sumSpace
    },
    displayStorageSize () {
      return '/' + this.sumSpace === -1 ? 'Unlimited' : this.formatStorage(this.sumSpace) // -1 is Unlimited
    },
    displayStorageUsage () {
      return this.formatStorage(this.useSpace)
    }
  },
  methods: {
    formatStorage (v) {
      if (v === 0) return '0 B'
      let k = 1024
      let sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
      let i = Math.floor(Math.log(v) / Math.log(k))
      return (v / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]
    },
    getUserStorage () {
      this.$store.dispatch({
        type: TYPES.GET_USERSPACE
      }).then((re) => {
        let StorageData = re.ext
        this.warningPercent = StorageData.storagewarningpct || 0.9// 预警值
        this.useSpace = StorageData.storageusage
        this.sumSpace = StorageData.storagesize
      })
    }
  }
}
</script>
<style>
.totalDiskSpace {
  border-top: 1px solid #101010;
  position: absolute;
  bottom: 0;
  height: 42px;
}
#userStorage {
  width: 100%;
  height: 60px;
  background-color: #141414;
  margin-bottom: 0px;
  padding-top: 5px;
}

#userStorage .totalDiskSpace {
  width: 80%;
  height: 10px;
  background-color: black;
  position: relative;
  top: 5px;
  /*left: 5%;*/
  margin: 0 auto;
  border-radius: 5px;
}

#userStorage .totalDiskSpace .userDiskSpace {
  height: 10px;
  background-color: #f5a623;
  position: relative;
  border-radius: 5px;
  max-width: 100%;
}

#userStorage .diskspaceInfo {
  position: relative;
  top: 9px;
  /*left: 5%;*/
  font-size: 8px;
  text-align: center;
}

#userStorage .diskspaceInfo .employ {
  color: #ffb400;
}

#userStorage .space_warning .employ {
  color: #ff0000;
}

#userStorage .space_warning .userDiskSpace {
  background-color: #ff0000;
}
</style>
