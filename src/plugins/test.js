// <srcitp src="http://cm.com/app.js"></script>
const cm = window.$app

let yourConfig = {
  system: 'Premiere-Plugin',
  apiUrl: 'your server url',
  maxConcurrencyRequest: 5
}
cm.setConfig(yourConfig)

let config = cm.getConfig({
  keys: ['system', 'apiUrl', 'maxConcurrencyRequest']
})
Object.assign(yourConfig, config)

let path = cm.getCurrentPath()
// do something with path
console.log(path)

// use cm's service
cm.getMaterialInfo({
  contentId: 'id',
  type: 'type'
})
  .then(result => console.log(result))
  .catch(err => console.error(err))
