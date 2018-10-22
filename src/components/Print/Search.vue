<template>
  <div>
    <div>
    <div v-if="searchType===1">
          <div>
            <span class="header-label">Search Type:</span>
            <span class="header-value">{{advanceHeader.name}}</span>
          </div>
          <div>
            <div v-for="value in curKeyValues" :key="value.name">
              <span class="header-label">{{value.name}}:</span>
              <span class="header-value">{{value.value}}</span>
            </div>
          </div>
        </div>
        <div v-else>
          <div v-if="searchType===2">
            <span  class="header-label">Keywords:</span>
            <span class="header-value">{{currentNode.bakCondition.keywords}}</span>
          </div>
          <div>
            <div  class="header-label">Time:</div>
            <div>
              <span class="header-value" :key="time.name" v-for="time in currentNode.bakCondition&&currentNode.bakCondition.timeFilter.filter(function(i){return i.checked})||[]">{{time.name}}</span>
            </div>
          </div>
          <div>
            <div  class="header-label">Content:</div>
            <div :style="{left: condtionLeft, paddingRight:condtionLeft}">
              <span class="header-value" :key="type.name"  v-for="type in  currentNode.bakCondition&&currentNode.bakCondition.typeFilter.filter(function(i){return i.checked})||[]">{{type.name}}</span>
            </div>
          </div>
          <div :key="c.name" v-for="c in currentNode.bakCondition&&currentNode.bakCondition.booleanCondition||[]" v-if="searchType===3&&c.value">
            <span  class="header-label">{{c.name}}</span>
            <span class="header-value">{{c.value}}</span>
          </div>
        </div>
      </div>
  <table border="1" style="margin:20px 0;">
    <tbody>
      <tr>
        <th style="text-align: center;">No</th>
        <th style="text-align: center;">Title</th>
        <th style="text-align: center;">Comments</th>
        <th style="text-align: center;">Rights</th>
        <th style="text-align: center;">Total Duration</th>
        <th style="text-align: center;">Delete Protection</th>
        <th style="text-align: center;">To be Deleted</th>
        <th style="text-align: center;">To to Archieved</th>
        <th style="text-align: center;">Archieved</th>
      </tr>
      <tr>
        <td colspan="9">{{currentNode.bakCondition?currentNode.bakCondition.node.path.replace(/^global_sobey_defaultclass\/MaterialList/, 'Network'):''}}</td>
      </tr>
      <tr v-for="(material, index) in materials" :key="material.guid">
        <td style="text-align: center;">{{index}}</td>
        <td style="text-align: center;">{{material.name}}</td>
        <td style="text-align: center;">{{material.note}}</td>
        <td style="text-align: center;">{{material.rights}}</td>
        <td style="text-align: center;">{{material.totalDuration}}</td>
        <td style="text-align: center;"></td>
        <td style="text-align: center;">{{material.tobedel}}</td>
        <td style="text-align: center;"></td>
        <td style="text-align: center;">{{material.storageStatus}}</td>
      </tr>
    </tbody>
  </table>
</div>
</template>

<script>
export default {
  name: 'SearchPrint',
  props: {

  },
  computed: {
    curKeyValues() {
      var c = []
      this.advanceHeader && this.advanceHeader.keyValues.forEach(item => {
        if (item.isRange) {
          var fv = item.from.value || (item.from.value === 0 ? 0 : '*')
          var tv = item.to.value || (item.to.value === 0 ? 0 : '*');
          (fv !== '*' || tv !== '*') && c.push({
            name: item.name,
            value: fv + ' TO ' + tv
          })
        } else if (item.ctrl === 'rd-select') {
          if (item.multiple) {
            item.value && item.value.length && c.push({
              name: item.name,
              value: item.value.map(i => i.value).join('|')
            })
          } else {
            item.value && item.value.value && c.push({
              name: item.name,
              value: item.value.value
            })
          }
        } else {
          item.value && c.push({
            name: item.name,
            value: item.username || item.value
          })
          item.checkedValue && item.checkedValue.length && c.push({
            name: item.name,
            value: item.checkedValue.map(i => i.name).join('|')
          })
        }
      })
      return c
    },
    currentNode() {
      return this.$store.getters.currentNode
    },
    advanceCondition() {
      var c = []
      this.advanceHeader && this.advanceHeader.keyValues.forEach(item => {
        if (item.isRange) {
          var fv = item.from.value || (item.from.value === 0 ? 0 : '*')
          var tv = item.to.value || (item.to.value === 0 ? 0 : '*');
          (fv !== '*' || tv !== '*') && c.push(fv + ' TO ' + tv)
        } else if (item.ctrl === 'rd-select') {
          if (item.multiple) {
            item.value && item.value.length && c.push(item.value.map(i => i.value).join('|'))
          } else {
            item.value && item.value.value && c.push(item.value.value)
          }
        } else {
          item.value && c.push(item.username || item.value)
          item.checkedValue && item.checkedValue.length && c.push(item.checkedValue.map(i => i.name).join('|'))
        }
      })
      return c.join(',')
    },
    advanceHeader() {
      return this.currentNode.bakCondition.headers && this.currentNode.bakCondition.headers.filter(item => item.selected)[0]
    },
    condtionLeft() {
      return this.searchType === 3 ? '126px' : '90px'
    },
    searchType() {
      return this.currentNode.bakCondition && this.currentNode.bakCondition.type
    },
    fulltext() {
      return this.$store.state.fulltextSearchCondition
    },
    materials() {
      return this.$store.getters.displayMaterials
    }
  },
  data() {
    return {
    }
  },
  created() {}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
