<template>
  <div class=local_search_container @contextmenu.prevent.stop>
    <input v-model="condition" class="local_search_input rd-textfield-input" @keydown.tab.prevent type="text" @keyup="change" @keydown.esc.prevent.stop="close" @keydown.up.left.prevent.stop="last" @keydown.down.right.prevent.stop="next" style="width:200px;" />
    <span class="total_bar">{{total}}</span>
    <span class="search_icon last" @mousedown.stop.prevent="last"></span>
    <span class="search_icon next" @mousedown.stop.prevent="next"></span>
  </div>
</template>

<script>
export default {
  props: {
    data: Array,
    callback: Function
  },
  data () {
    return {
      index: -1
    }
  },
  computed: {
    condition: {
      get () {
        return this.$store.state.condition
      },
      set (val) {
        this.$store.state.condition = val
      }
    },
    regExp () {
      return this.$store.getters.regExp
    },
    matchData () {
      return this.data.filter(item => this.regExp.test(item.name))
    },
    total () {
      return this.condition && this.matchData.length && this.matchData.length > this.index ? ((this.index + 1) + ' - ' + this.matchData.length) : ''
    }
  },
  methods: {
    close () {
      this.$emit('close')
    },
    change () {
      this.index = 0
      this.callback(this.matchData[0])
    },
    next () {
      this.index = this.index > this.matchData.length - 2 ? 0 : this.index + 1
      this.callback(this.matchData[this.index])
    },
    last () {
      this.index = this.index > 0 ? this.index - 1 : this.matchData.length - 1
      this.callback(this.matchData[this.index])
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
