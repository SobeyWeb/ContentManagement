/* eslint-disable no-extend-native */
Array.prototype.remove = function(item) {
  var args = arguments
  ;[].forEach.call(args, item => {
    var idx = this.indexOf(item)
    if (idx > -1) {
      this.splice(idx, 1)
    }
  })
}
Array.prototype.add = function() {
  var args = arguments
  ;[].forEach.call(args, item => {
    var idx = this.indexOf(item)
    if (idx === -1) {
      this.push(item)
    }
  })
}

Array.prototype.find = function(condition, attr) {
  if (typeof condition === 'function') {
    return this.filter(condition)[0]
  } else if (attr !== undefined) {
    return this.filter(item => item[attr] === condition)[0]
  } else {
    return this.filter(item => item === condition)[0]
  }
}
Array.prototype.findAll = function(condition, attr) {
  if (typeof condition === 'function') {
    return this.filter(condition)[0]
  } else if (attr !== undefined) {
    return this.filter(item => item[attr] === condition)[0]
  } else {
    return this.filter(item => item === condition)[0]
  }
}
Array.prototype.unique = function() {
  let n = {}
  let r = []
  for (var i = 0; i < this.length; i++) {
    if (!n[this[i]]) {
      n[this[i]] = true
      r.push(this[i])
    }
  }
  return r
}
Array.prototype.groupBy = function(attr) {
  var newArrObj = {}
  this.forEach(item => {
    var objAttr = attr + '_' + item[attr]
    if (newArrObj[objAttr]) {
      newArrObj[objAttr].push(item)
    } else {
      newArrObj[objAttr] = []
      newArrObj[objAttr].push(item)
    }
  })
  var newArr = []
  for (let i in newArrObj) {
    newArr.push(newArrObj[i])
  }
  return newArr
}
Array.prototype.group = function(condition) {
  var newArrObj = {}
  this.forEach(item => {
    var objAttr = condition(item)
    if (newArrObj[objAttr]) {
      newArrObj[objAttr].push(item)
    } else {
      newArrObj[objAttr] = []
      newArrObj[objAttr].push(item)
    }
  })
  var newArr = []
  for (let i in newArrObj) {
    newArr.push(newArrObj[i])
  }
  return newArr
}
Date.prototype.format = function(format) {
  var o = {
    'M+': this.getMonth() + 1, // month
    'd+': this.getDate(), // day
    'h+': this.getHours(), // hour
    'm+': this.getMinutes(), // minute
    's+': this.getSeconds(), // second
    'q+': Math.floor((this.getMonth() + 3) / 3), // quarter
    S: this.getMilliseconds() // millisecond
  }
  if (/(y+)/.test(format)) {
    format = format.replace(
      RegExp.$1,
      (this.getFullYear() + '').substr(4 - RegExp.$1.length)
    )
  }
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(format)) {
      format = format.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
      )
    }
  }
  return format
}
String.prototype.formatDate = function() {
  if (/:/g.test(this)) return this.replace('/["\']/g', '')
  var sec = this.match(/\d+/g)
  var dt = new Date()
  dt.setTime(sec)
  return (
    dt.getFullYear() +
    '-' +
    (dt.getMonth() + 1).fixZero() +
    '-' +
    dt.getDate().fixZero() +
    ' ' +
    dt.getHours().fixZero() +
    ':' +
    dt.getMinutes().fixZero() +
    ':' +
    dt.getSeconds().fixZero()
  )
}
Number.prototype.fixZero = function() {
  if (this < 10) {
    return '0' + this
  }
  return this
}
Number.prototype.floorByFrame = function(f, frame) {
  return (
    (f &&
      (
        Math.floor(this / 600) * 600 +
        Math.floor(((this % 600).round(6) / f).round(6)) * f
      ).round(6)) ||
    this
  ) //
  // return f && (Math.floor(this * frame) / frame).round(4) || this
}
Number.prototype.roundByFrame = function(f, frame) {
  return (
    (f &&
      (
        Math.floor(this / 600) * 600 +
        Math.round(((this % 600).round(6) / f).round(6)) * f
      ).round(6)) ||
    this
  ) //
  // return f && (Math.floor(this * frame) / frame).round(4) || this
}
String.prototype.fixZero = function() {
  if (/^\d{1}$/.test(this)) {
    return '0' + this
  } else if (!this.length) {
    return '00'
  }
  return this.toString()
}
Number.prototype.fix = function(num) {
  return num ? Math.floor(this * Math.pow(10, num)) / Math.pow(10, num) : this
}
Number.prototype.round = function(num) {
  return num ? Math.round(this * Math.pow(10, num)) / Math.pow(10, num) : this
}
Promise.prototype.silentCatch = function(callback) {
  return this.catch(reason =>
    this.constructor.resolve(callback(reason)).then(() => {
      throw reason
    })
  )
} // for premiere plugin
