<template>
  <div class="property_table">
    <div class="property_row" v-for="data in options" :key="data.name">
      <span class="prop_span" :title="data.name">{{data.name}}</span>
      <div class="prop_div">
        <component v-if="!data.isRange" :is="data.ctrl" :cascader="data" :checkbox="data||data.value" :textfield="data" :limit="data.limit" :select="data" :radio="data.value" :number="data.value" :date="data" :options="data.value" v-model="data.value" :format="data.format" :dis="data.disabled"></component>
        <div v-else style="line-height: 32px;position: relative;">
          <!--span class="from_span">From</span-->
          <div class="from_container fl">
            <component :is="data.ctrl" :value="data.from" :number="data.from" :date="data.from" :format="data.from.format"></component>
          </div>
          <!--span class="from_span">To</span-->
          <span class="split_span">-</span>
          <div class="from_container fr">
            <component :is="data.ctrl" :value="data.to" :number="data.to" :date="data.to" :format="data.to.format"></component>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import UserSelector from './UserSelector'
import MemberSelector from './MemberSelector'
import ActionSelector from './ActionSelector'
import ColorSelector from './ColorSelector'

export default {
  name: 'basic_search_page_ctrl',
  props: {
    options: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      bak: []
    }
  },
  components: {
    'user-selector-ctrl': UserSelector,
    'member-selector-ctrl': MemberSelector,
    'action-selector-ctrl': ActionSelector,
    'color-selector-ctrl': ColorSelector
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
