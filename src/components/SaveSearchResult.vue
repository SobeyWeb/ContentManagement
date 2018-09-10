<template>
  <div class="save-search-container">
    <div class="input-container">
      <span>Title</span>
      <input type="text" v-focus :val="searchResultName" v-model="searchResultName" maxlength="200" @keyup="volidInput" id="templateName">
    </div>
    <div class="save_clip_bottom fr">
      <rd-button type="" @click="saveSearchResult">Confirm</rd-button>
      <rd-button type="" @click="cancel">Cancel</rd-button>
    </div>
  </div>
</template>

<script>
import * as util from '../lib/util.js'
import TYPES from '../dicts/mutationTypes.js'
export default {
  data: function () {
    return {
      searchName: ''
    }
  },
  created: function () {
    this.searchName = this.$store.state.saveSearchName
  },
  computed: {
    searchResultName: {
      get () {
        if (this.searchName) {
          return this.searchName
        } else {
          return ''
        }
      },
      set (value) {
        this.searchName = value
      }
    },
    currentTemplate () {
      return this.$store.state.currentTemplate
    }
  },
  components: {
  },
  methods: {
    cancel () {
      this.$store.state.saveSearchResultWindow.hide()
    },
    volidInput (event) {
      var maxLength = event.target.attributes.maxlength.nodeValue
      this.searchName = util.volidInput(event.target.value, maxLength) // event.target.value = util.volidInput(event.target.value, 200);
    },
    saveSearchResult () {
      var searchname = this.searchName.trim()
      if (!searchname) {
        util.Notice.warning('Name cannot be empty!', '', 3000)
        return
      }
      var searchChildren = this.$store.getters.searchResult.searchModel
      if (searchChildren.some(item => item.name === searchname && (!this.$store.state.currentTemplate || this.$store.state.currentTemplate.templateId !== item.templateId))) {
        util.Notice.warning('A template with the same name, please re-entere!', '', 3000)
        return
      }
      if (this.$store.state.currentTemplate) {
        this.$store.dispatch({
          type: TYPES.MODIFY_SEARCH_QUERY,
          data: {
            templateID: this.$store.state.currentTemplate.templateId,
            json: {
              templateName: searchname,
              condition: this.$store.state.currentTemplate.bakCondition
            }
          }
        }).then(res => {
          this.$store.state.currentTemplate.name = searchname
          this.$store.state.currentTemplate.path = this.$store.state.currentTemplate.father.path + '/' + searchname
          this.$store.state.currentTemplate.condition = JSON.parse(JSON.stringify(this.$store.state.currentTemplate.bakCondition))
        }).catch(res => {
          util.Notice.failed('Failed to modify search template', '', 3000)
        })
      } else {
        this.$store.dispatch({
          type: TYPES.SET_SEARCH_QUERY,
          data: {
            json: {
              templateName: searchname,
              condition: this.$store.getters.searchResult.bakCondition
            }
          }
        }).then(res => {
          this.$store.dispatch({
            type: TYPES.GET_SEARCHMODEL,
            source: this.$store.getters.searchResult
          }).then(() => {
          })
        }).catch(res => {
          util.Notice.failed('Failed to save search template', '', 3000)
        })
      }
      this.cancel()
    }
  }
}

</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style scoped>
.save-search-container {
  width: 300px;
  overflow: hidden;
}
.input-container {
  height: 38px;
  padding: 10px;
}
span {
  color: #ffffff;
  margin-right: 5px;
  font-size: 14px;
  vertical-align: -6px;
}

input[type='text'] {
  width: 236px;
  height: 26px;
  border: none;
  background: #111111;
  padding-left: 4px;
  color: #ffffff;
  margin-top: 10px;
  outline: none;
  font-family: Arial;
}
.save_clip_bottom {
  margin: 10px;
}
</style>
