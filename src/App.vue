<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  border: 0;
  outline: 0;
  font-size: 100%;
  vertical-align: inherit;
  list-style: none;
  text-decoration: none;
}
#app {
  position: absolute;
  background: #222;
  left: 0;
  top: 0;
  right: 0;
  height: 100%;
}
</style>
