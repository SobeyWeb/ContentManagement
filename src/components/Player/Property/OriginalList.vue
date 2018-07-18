<template>
  <vue-nice-scrollbar style="height: calc(100% - 75px);position:absolute;width: 448.5px;top: 75px;" v-if="options" :speed="150">
    <div class="files_table clearfix">
      <tab-header-ctrl :headers="headers" class="file_header"></tab-header-ctrl>
      <div class="file_row" v-for="(item,i) in values" :key="i" :style="{width: headerWidth+'px'}" :class="{file_row_drak: i%2==1}" :index="i">
        <div class="file_col fl" v-for="header in headers" :key="header.attr" :style="{width: header.width+'px'}">&nbsp;{{item[header.attr]}}</div>
      </div>
    </div>
  </vue-nice-scrollbar>
</template>

<script>
import TabHeader from '../../common/TabHeader'
export default {
  name: 'original_list_ctrl',
  props: {
    options: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
    }
  },
  components: {
    'tab-header-ctrl': TabHeader
  },
  computed: {
    values() {
      return this.options.values
    },
    headers() {
      return this.options.headers
    },
    headerWidth() {
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
