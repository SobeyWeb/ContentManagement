<template>
  <div class="color-selector-container">
    <div class="color-item-box fl" :class="{'color-checked':tempValue.indexOf(c)>-1}" @mousedown.prevent="toggeColor(c)" v-for="c in colors" :key="c">
      <div class="color-item" :style="{'background':c?'rgb(' + (c&0x0000ff) + ',' + ((c&0x00ff00)>>8) + ',' + ((c&0xff0000)>>16) + ')':'transparent'}"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'color_selector',
  props: {
    value: String
  },
  methods: {
    toggeColor (c) {
      let cpValue = this.tempValue.slice()
      if (cpValue.indexOf(c) > -1) {
        cpValue.remove(c)
      } else {
        cpValue.add(c)
      }
      this.$emit('input', cpValue.join('|'))
    }
  },
  computed: {
    tempValue () {
      return this.value.split('|').map(item => parseInt(item))
    }
  },
  data () {
    return {
      colors: [
        6844660,
        6418415,
        10152321,
        13684944,
        6730483,
        15460225,
        15839589,
        15888307,
        11497715,
        22414
      ]
    }
  },
  created () { }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.color-item {
  width: 20px;
  height: 20px;
  cursor: pointer;
  margin: 5px;
}

.color-item-box {
  width: 30px;
  height: 30px;
  margin-left: 5px;
  border: 1px solid transparent;
  border-radius: 4px;
}

.color-item-box:hover {
  border: 1px solid #ab916a;
}

.color-checked {
  border: 1px solid #f5a623;
}
</style>
