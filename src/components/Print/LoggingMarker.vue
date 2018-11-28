<template>
  <div>
    <div>{{material.name}}</div>
    <table border="1" style="margin:20px 0;">
      <tbody>
        <tr>
          <th style="text-align: center;">Timecode-Inpoint</th>
          <th style="text-align: center;">Action(s)</th>
          <th style="text-align: center;">Member(s)</th>
          <th style="text-align: center;">Comments</th>
          <th style="text-align: center;">Colour</th>
        </tr>
        <tr v-for="marker in markers" :key="marker.guid">
          <td style="text-align: center;">{{marker.pos}}</td>
          <td style="text-align: center;">{{marker._extendinfo&&marker._extendinfo[2].map(function(item){return item.itemvalue.filter&&item.itemvalue.filter(function(i){return i.languageid==lmLanguage}).map(function(i){return i.itemvalue}).join('/')||''}).join('/')}}</td>
          <td style="text-align: center;">{{marker._extendinfo&&marker._extendinfo[1].map(function(item){return item.itemvalue.map&&item.itemvalue.map(function(item){return item.itemvalue}).join('/')||''}).join('/')}}</td>
          <td style="text-align: center;">{{marker.note}}</td>
          <td style="text-align: center;">{{marker.color}}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  template: '#logging_marker_template',
  props: {
    material: Object,
    markers: Array
  },
  methods: {
    print () {
      this.$print('A4', {
        REPLACEMENT_CONTENT: this.$el.innerHTML
      })
    }
  },
  computed: {
  },
  data () {
    return {}
  },
  created () { }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
