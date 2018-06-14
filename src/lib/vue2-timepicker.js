(function(global, factory) {
  'use strict'
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory()
    : typeof define === 'function' && define.amd ? define(factory)
      : (global.VueTimepicker = factory())
}(this, function() {
  'use strict'

  function install(Vue) {
    const CONFIG = {
      HOUR_TOKENS: ['HH', 'H', 'hh', 'h', 'kk', 'k'],
      MINUTE_TOKENS: ['mm', 'm'],
      SECOND_TOKENS: ['ss', 's'],
      APM_TOKENS: ['A', 'a']
    }

    var VueTimepicker = Vue.extend({
      name: 'VueTimepicker',

      props: {
        dis: Boolean,
        value: {
          type: Object
        },
        hideClearButton: {
          type: Boolean
        },
        format: {
          type: String
        },
        minuteInterval: {
          type: Number
        },
        secondInterval: {
          type: Number
        }
      },

      data: function() {
        return {
          hours: [],
          minutes: [],
          seconds: [],
          apms: [],
          showDropdown: false,
          muteWatch: false,
          hourType: 'HH',
          minuteType: 'mm',
          secondType: '',
          apmType: '',
          hour: '',
          minute: '',
          second: '',
          apm: '',
          fullValues: undefined
        }
      },

      computed: {
        displayTime: function() {
          let formatString = String((this.format || 'HH:mm'))
          if (this.hour) {
            formatString = formatString.replace(new RegExp(this.hourType, 'g'), this.hour)
          }
          if (this.minute) {
            formatString = formatString.replace(new RegExp(this.minuteType, 'g'), this.minute)
          }
          if (this.second && this.secondType) {
            formatString = formatString.replace(new RegExp(this.secondType, 'g'), this.second)
          }
          if (this.apm && this.apmType) {
            formatString = formatString.replace(new RegExp(this.apmType, 'g'), this.apm)
          }
          return formatString == String((this.format || 'HH:mm')) ? '' : formatString
        },
        showClearBtn: function() {
          if ((this.hour && this.hour !== '') || (this.minute && this.minute !== '')) {
            return true
          }
          return false
        }
      },

      watch: {
        'format': 'renderFormat',
        minuteInterval: function(newInteval) {
          this.renderList('minute', newInteval)
        },
        secondInterval: function(newInteval) {
          this.renderList('second', newInteval)
        },
        showDropdown: function(val) {
          if (!val && this.value.limit) {
            this.value.value = this.value.limit(this.value.value)
          }
        },
        'value.value': 'readValues',
        'displayTime': 'fillValues'
      },

      methods: {
        formatValue: function(type, i) {
          switch (type) {
            case 'H':
            case 'm':
            case 's':
              return String(i)
            case 'HH':
            case 'mm':
            case 'ss':
              return i < 10 ? '0' + String(i) : String(i)
            case 'h':
            case 'k':
              return String(i + 1)
            case 'hh':
            case 'kk':
              return (i + 1) < 10 ? '0' + String(i + 1) : String(i + 1)
            default:
              return ''
          }
        },

        checkAcceptingType: function(validValues, formatString, fallbackValue) {
          if (!validValues || !formatString || !formatString.length) {
            return ''
          }
          for (let i = 0; i < validValues.length; i++) {
            if (formatString.indexOf(validValues[i]) > -1) {
              return validValues[i]
            }
          }
          return fallbackValue || ''
        },

        renderFormat: function(newFormat) {
          newFormat = newFormat || this.format
          if (!newFormat || !newFormat.length) {
            newFormat = 'HH:mm'
          }

          this.hourType = this.checkAcceptingType(CONFIG.HOUR_TOKENS, newFormat, 'HH')
          this.minuteType = this.checkAcceptingType(CONFIG.MINUTE_TOKENS, newFormat, 'mm')
          this.secondType = this.checkAcceptingType(CONFIG.SECOND_TOKENS, newFormat)
          this.apmType = this.checkAcceptingType(CONFIG.APM_TOKENS, newFormat)

          this.renderHoursList()
          this.renderList('minute')

          if (this.secondType) {
            this.renderList('second')
          }

          if (this.apmType) {
            this.renderApmList()
          }

          const self = this
          this.$nextTick(function() {
            self.readValues()
          })
        },

        renderHoursList: function() {
          const hoursCount = (this.hourType === 'h' || this.hourType === 'hh') ? 12 : 24
          this.hours = []
          for (let i = 0; i < hoursCount; i++) {
            this.hours.push(this.formatValue(this.hourType, i))
          }
        },

        renderList: function(listType, interval) {
          if (listType === 'second') {
            interval = interval || this.secondInterval
          } else if (listType === 'minute') {
            interval = interval || this.minuteInterval
          } else {
            return
          }

          if (interval === 0) {
            interval = 60
          } else if (interval > 60) {
            window.console.warn('`' + listType + '-interval` should be less than 60. Current value is', interval)
            interval = 1
          } else if (interval < 1) {
            window.console.warn('`' + listType + '-interval` should be NO less than 1. Current value is', interval)
            interval = 1
          } else if (!interval) {
            interval = 1
          }

          if (listType === 'minute') {
            this.minutes = []
          } else {
            this.seconds = []
          }

          for (let i = 0; i < 60; i += interval) {
            if (listType === 'minute') {
              this.minutes.push(this.formatValue(this.minuteType, i))
            } else {
              this.seconds.push(this.formatValue(this.secondType, i))
            }
          }
        },

        renderApmList: function() {
          this.apms = []
          if (!this.apmType) {
            return
          }
          this.apms = this.apmType === 'A' ? ['AM', 'PM'] : ['am', 'pm']
        },

        readValues: function() {
          if (!this.value || this.muteWatch) {
            return
          }

          const timeValue = this.value || {}

          var self = this
          timeValue.value ? timeValue.value.split(':').forEach(function(val, index) {
            if (index === 0) {
              self.hour = val
            } else if (index === 1) {
              self.minute = val
            } else {
              self.second = val
            }
          }) : this.hour = this.minute = this.second = 0

          this.fillValues()
        },

        fillValues: function() {
          let fullValues = {}

          const baseHour = this.hour
          const baseHourType = this.hourType

          const hourValue = baseHour || baseHour === 0 ? Number(baseHour) : ''
          const baseOnTwelveHours = this.isTwelveHours(baseHourType)
          const apmValue = (baseOnTwelveHours && this.apm) ? String(this.apm).toLowerCase() : false

          CONFIG.HOUR_TOKENS.forEach(function(token) {
            if (token === baseHourType) {
              fullValues[token] = baseHour
              return
            }

            let value
            let apm
            switch (token) {
              case 'H':
              case 'HH':
                if (!String(hourValue).length) {
                  fullValues[token] = ''
                  return
                } else if (baseOnTwelveHours) {
                  if (apmValue === 'pm') {
                    value = hourValue < 12 ? hourValue + 12 : hourValue
                  } else {
                    value = hourValue % 12
                  }
                } else {
                  value = hourValue % 24
                }
                fullValues[token] = (token === 'HH' && value < 10) ? `0${value}` : String(value)
                break
              case 'k':
              case 'kk':
                if (!String(hourValue).length) {
                  fullValues[token] = ''
                  return
                } else if (baseOnTwelveHours) {
                  if (apmValue === 'pm') {
                    value = hourValue < 12 ? hourValue + 12 : hourValue
                  } else {
                    value = hourValue === 12 ? 24 : hourValue
                  }
                } else {
                  value = hourValue === 0 ? 24 : hourValue
                }
                fullValues[token] = (token === 'kk' && value < 10) ? `0${value}` : String(value)
                break
              case 'h':
              case 'hh':
                if (apmValue) {
                  value = hourValue
                  apm = apmValue || 'am'
                } else {
                  if (!String(hourValue).length) {
                    fullValues[token] = ''
                    fullValues.a = ''
                    fullValues.A = ''
                    return
                  } else if (hourValue > 11) {
                    apm = 'pm'
                    value = hourValue === 12 ? 12 : hourValue % 12
                  } else {
                    if (baseOnTwelveHours) {
                      apm = ''
                    } else {
                      apm = 'am'
                    }
                    value = hourValue % 12 === 0 ? 12 : hourValue
                  }
                }
                fullValues[token] = (token === 'hh' && value < 10) ? `0${value}` : String(value)
                fullValues.a = apm
                fullValues.A = apm.toUpperCase()
                break
            }
          })

          if (this.minute || this.minute === 0) {
            const minuteValue = Number(this.minute)
            fullValues.m = String(minuteValue)
            fullValues.mm = minuteValue < 10 ? `0${minuteValue}` : String(minuteValue)
          } else {
            fullValues.m = ''
            fullValues.mm = ''
          }

          if (this.second || this.second === 0) {
            const secondValue = Number(this.second)
            fullValues.s = String(secondValue)
            fullValues.ss = secondValue < 10 ? `0${secondValue}` : String(secondValue)
          } else {
            fullValues.s = ''
            fullValues.ss = ''
          }

          this.fullValues = fullValues
          this.updateTimeValue(fullValues)
          this.$emit('change', {
            data: fullValues
          })
        },

        updateTimeValue: function(fullValues) {
          this.muteWatch = true

          const self = this

          const baseTimeValue = this.value || {}
          let timeValue = {}

          Object.keys(baseTimeValue).forEach(function(key) {
            timeValue[key] = fullValues[key]
          })

          //this.$emit('input', timeValue)

          this.$nextTick(function() {
            self.muteWatch = false
          })
        },

        isTwelveHours: function(token) {
          return token === 'h' || token === 'hh'
        },

        toggleDropdown: function() {
          if (!this.dis) {
            this.showDropdown = !this.showDropdown
            if (this.showDropdown) {
              var date = new Date()
              if (!this.hour) {
                var i = date.getHours()
                this.hour = i < 10 ? `0${i}` : String(i)
              }
              if (!this.minute) {
                var i = date.getMinutes()
                this.minute = i < 10 ? `0${i}` : String(i)
              }
              if (!this.second) {
                var i = date.getSeconds()
                this.second = i < 10 ? `0${i}` : String(i)
              }
            }
            this.value.value = this.displayTime
          } else {
            this.showDropdown = false
          }
        },

        select: function(type, value) {
          if (type === 'hour') {
            this.hour = value
          } else if (type === 'minute') {
            this.minute = value
          } else if (type === 'second') {
            this.second = value
          } else if (type === 'apm') {
            this.apm = value
          }
          this.value.value = this.displayTime
        },

        clearTime: function() {
          this.hour = ''
          this.minute = ''
          this.second = ''
          this.apm = ''
          this.value.value = ''
        }
      },

      mounted: function() {
        this.renderFormat()
        var _this = this
        window.addEventListener('mousedown', function(e) {
          if ($(e.target).parents().is(_this.$el)) {
          } else {
            _this.showDropdown = false
          }
        }, false)
      },

      template: '<span class="time-picker" :class="{time_disabled:dis}">' +
        '<input class="display-time" v-model="displayTime" @click.stop="toggleDropdown" type="text" readonly/>' +
        '<span class="clear-btn" v-if="!hideClearButton" v-show="!showDropdown && showClearBtn&&!dis" @click.stop="clearTime">&times;</span>' +
        //'<div class="time-picker-overlay" v-if="showDropdown" @click.stop="toggleDropdown"></div>' +
        '<div class="dropdown" v-show="showDropdown">' +
        '<div class="select-list">' +
        '<ul class="hours">' +
        '<li class="hint" v-text="hourType"></li>' +
        '<li v-for="hr in hours" v-text="hr" :class="{active: hour === hr}" @click.stop="select(\'hour\', hr)"></li>' +
        '</ul>' +
        '<ul class="minutes">' +
        '<li class="hint" v-text="minuteType"></li>' +
        '<li v-for="m in minutes" v-text="m" :class="{active: minute === m}" @click.stop="select(\'minute\', m)"></li>' +
        '</ul>' +
        '<ul class="seconds" v-if="secondType">' +
        '<li class="hint" v-text="secondType"></li>' +
        '<li v-for="s in seconds" v-text="s" :class="{active: second === s}" @click.stop="select(\'second\', s)"></li>' +
        '</ul>' +
        '<ul class="apms" v-if="apmType">' +
        '<li class="hint" v-text="apmType"></li>' +
        '<li v-for="a in apms" v-text="a" :class="{active: apm === a}" @click.stop="select(\'apm\', a)"></li>' +
        '</ul>' +
        '</div>' +
        '</div>' +
        '</span>'
    })

    Vue.component('vue-timepicker', VueTimepicker)
  }

  if (typeof Vue !== 'undefined') {
    Vue.use(install)
  }

  return install
}))
