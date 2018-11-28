;(function() {
  var count = 0
  var intervalId = setInterval(() => {
    if (window.URL_CONFIG) {
      Object.assign(window.URL_CONFIG, {
        CMAPI: 'http://172.16.168.202:9602/CMAPI',
        CMAPIWIN: 'http://172.16.168.202:9602/CMAPIWIN',
        PROXY: 'http://172.16.168.202:9602',
        CM: 'http://172.16.168.205:9021',
        TMWEB: '',
        HIVE: 'http://172.16.168.202:9602/HIVE',
        FL: 'http://172.16.168.202:9602/FL',
        LOGGINGSERVICE:
          'http://hive.sobey.com:9029/LoggingSysInternal_ObjectsInterface.asmx',
        PREVIEWMARKPATH: '',
        TMSERVICE: 'http://172.16.168.202:9602/TMSERVICE',
        // PLAYOUT: 'http://localhost:3130/PLAYOUT',
        PLAYOUT: 'http://172.16.168.202:9602/PLAYOUT',
        PREVIEWHTTPS: ''
      })
      clearInterval(intervalId)
    } else {
      count++
      if (count > 50) {
        clearInterval(intervalId)
      }
    }
  }, 500)
})()
