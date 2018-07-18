<template>
  <vue-nice-scrollbar style="height:100%;" v-if="options" :speed="150">
    <div class="files_table clearfix">
      <tab-header-ctrl :headers="headers" class="file_header"></tab-header-ctrl>
      <div class="file_row" v-for="(file,i) in values" :key="i" :style="{width: headerWidth+'px'}" :class="{file_row_drak: i%2==1}" :index="i">
        <span @selectstart.stop class="file_col fl" v-for="header in headers" :key="header.attr" :style="{width: header.width+'px'}" :title="file[header.attr]">&nbsp;{{file[header.attr]}}
          <span class="copy_btn" title="Click to Copy" v-if="header.attr==='filename'" @click.stop.prevent="copy(file[header.attr])"></span>
        </span>
      </div>
    </div>
  </vue-nice-scrollbar>
</template>

<script>
import TabHeader from '../../common/TabHeader'
import { Notice } from '../../../lib/util'
export default {
  name: 'file_list_ctrl',
  props: {
    options: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
    }
  },
  components: {
    'tab-header-ctrl': TabHeader
  },
  methods: {
    copy (str) {
      var c = document.querySelector('.copy_input')
      c.value = str
      c.select()
      if (document.execCommand('Copy')) {
        Notice.success('Copy success!', '', 3000)
      } else {
        Notice.warning('Copy failed, please try to use "ctrl + c"!', '', 3000)
      }
    }
  },
  computed: {
    values () {
      return this.options.values
    },
    headers () {
      return this.options.headers
    },
    headerWidth () {
      return this.headers.reduce((item1, item2) => {
        return {
          width: item1.width + item2.width
        }
      }).width
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
