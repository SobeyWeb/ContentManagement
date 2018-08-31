import { SortLikeWin, SortLikeWinBy } from './sort.js'
import {
  FileStatus,
  CLIPTYPE,
  VIDEOHS,
  ImageType,
  ETGetVideoStandardPI,
  GetTimeStringByFrameNum,
  GetFrameNumByHundredNS,
  VideoStandardGetHSClass,
  GetClipStatus,
  GetSecondByEachFrame,
  GetMillSecondsByFrameNum,
  ETGetFrameRate
} from '../lib/format.js'
import { frameToTime } from './transform.js'
import state from '../store/state.js'
import store from '../store'
import URLCONFIG from '../config/urlConfig.js'
import PERMISSION from '../dicts/permission.js'
import Vue from 'vue'
import appSetting from '../config/appSetting.js'
import TYPES from '../dicts/mutationTypes'
import {
  getRepository,
  setRepository,
  pureGetRepository
} from '../data/repository'
import { defaultQuery } from '../data/basicData'
import Guid from './Guid'
export function getUrl(url, para, ifNotEnc) {
  if (para) {
    let q = ''
    if (url.indexOf('?') >= 0) {
      q = '&'
    } else {
      q = '?'
    }

    for (let k in para) {
      if (typeof para[k] === 'undefined') {
        continue
      }
      if (q.length > 1) {
        q += '&'
      }
      if (ifNotEnc) {
        q = q + k + '=' + para[k]
      } else {
        q = q + k + '=' + encodeURIComponent(para[k])
      }
    }

    url = url + q
  }
  return url
}
export function getValue() {
  let val
  for (let i = 0, l = arguments.length; i < l; i++) {
    if (arguments[i] !== undefined) {
      val = arguments[i]
      break
    }
  }
  return val
}
export function throttle(delay, action, immediately) {
  let last = 0
  let id = -1
  return function() {
    if (last === 0 && immediately) {
      action.apply(this, arguments)
    }
    clearTimeout(id)
    let curr = +new Date()
    if (curr - last > delay) {
      action.apply(this, arguments)
      last = curr
    } else {
      id = setTimeout(() => action.apply(this, arguments), delay)
    }
  }
}
export function getCookie(name) {
  if (localStorage && localStorage.getItem && localStorage.getItem(name)) {
    return localStorage.getItem(name)
  } else {
    let arr
    let reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)')
    if ((arr = document.cookie.match(reg))) return unescape(arr[2])
    else return null
  }
}
export function setCookie(name, value) {
  if (localStorage && localStorage.setItem) {
    localStorage.setItem(name, value)
  } else {
    var Days = 30
    var exp = new Date()
    exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000)
    document.cookie =
      name + '=' + escape(value) + ';expires=' + exp.toGMTString()
  }
}
export function sortBy(arr, type, symbol, flag) {
  let folderArr
  let otherArr
  if (!flag) {
    let specialArr = arr.filter(
      item =>
        item.type === 'folder' && [292, 293, 294].indexOf(item.subtype) > -1
    )
    if (specialArr.length) {
      specialArr.forEach(item => arr.remove(item))
      return sortBy(specialArr, 'title', false, true).concat(
        sortBy(arr, type, symbol, true)
      )
    }
  }
  if (type === 'title') {
    folderArr = arr.filter(item => {
      if (item.type === 'folder') return item
    })
    otherArr = arr.filter(item => {
      if (item.type !== 'folder') return item
    })
    if (symbol) {
      arr = folderArr.sort(SortLikeWin).concat(otherArr.sort(SortLikeWin))
    } else {
      arr = folderArr
        .sort(SortLikeWin)
        .reverse()
        .concat(otherArr.sort(SortLikeWin).reverse())
    }
    return arr
  } else if (type === 'createTime') {
    folderArr = arr.filter(item => {
      if (item.type === 'folder') return item
    })
    otherArr = arr.filter(item => {
      if (item.type !== 'folder') return item
    })
    if (symbol) {
      arr = folderArr
        .sort((item1, item2) => {
          return item1.createdate - item2.createdate
        })
        .concat(
          otherArr.sort((item1, item2) => {
            return item1.createdate - item2.createdate
          })
        )
    } else {
      arr = folderArr
        .sort((item1, item2) => {
          return item1.createdate - item2.createdate
        })
        .reverse()
        .concat(
          otherArr
            .sort((item1, item2) => {
              return item1.createdate - item2.createdate
            })
            .reverse()
        )
    }
    return arr
  } else if (type === 'type') {
    if (symbol) {
      arr.sort((item1, item2) => {
        return item1.typeIndex - item2.typeIndex
      })
    } else {
      arr
        .sort((item1, item2) => {
          return item1.typeIndex - item2.typeIndex
        })
        .reverse()
    }
    let groupedArr = arr.groupBy('typeIndex')
    let newArr = []
    groupedArr.forEach(item => {
      newArr = newArr.concat(item.sort(SortLikeWin))
    })
    return newArr
  } else {
    let sortFunc = SortLikeWinBy(type)
    folderArr = arr.filter(item => {
      if (item.type === 'folder') return item
    })
    otherArr = arr.filter(item => {
      if (item.type !== 'folder') return item
    })
    if (symbol) {
      arr = folderArr.sort(sortFunc).concat(otherArr.sort(sortFunc))
    } else {
      arr = folderArr
        .sort(sortFunc)
        .reverse()
        .concat(otherArr.sort(sortFunc).reverse())
    }
    return arr
  }
}
export function packegeCustomSearchData(serverCondition) {
  var volidType = {
    Title: {
      length: 255,
      onlyLength: true
    },
    Rights: {
      length: 256,
      onlyLength: true
    },
    Comments: {
      length: 1000,
      onlyLength: true
    },
    'Item Name': {
      length: 50,
      onlyLength: true
    },
    Journalist: {
      length: 50,
      onlyLength: true
    },
    Category: {
      length: 50,
      onlyLength: true
    },
    'Program Name': {
      length: 50,
      onlyLength: true
    },
    'Source Tape Barcode': {
      length: 13,
      onlyLength: true
    },
    'Source Tape Title': {
      length: 50,
      onlyLength: true
    },
    'Backup Tape Title': {
      length: 50,
      onlyLength: true
    },
    'User Media ID': {
      length: 50,
      onlyLength: true
    }
  }
  var volid = key =>
    volidType[key] &&
    (e =>
      volidInput(
        e.target.value,
        volidType[key] && volidType[key].length,
        e.target,
        volidType[key] && volidType[key].onlyLength,
        key
      ))
  var ctrlTable = {
    long: 'rd-number',
    double: 'rd-number',
    string: 'rd-text',
    boolean: 'rd-select',
    Date: 'rd-datepicker',
    DateTime: 'rd-datepicker',
    Time: 'vue-timepicker',
    enum: 'rd-select'
  }

  serverCondition.forEach(item => {
    var ctrl =
      item.ctrl || ctrlTable[item.dataType] || ctrlTable[item.fieldtype]
    item.volid = volid(item.name)
    item.isCustom = item.isCustom === undefined ? true : item.isCustom
    item.key = item.key === void 0 ? item.fieldName : item.key
    item.ctrl = ctrl
    item.height = 30
    item.width = 200
    item.checked = false
    item.visible = item.visible || true
    item.name = item.name || item.alias || item.fieldName
    if (ctrl === 'rd-number') {
      item.isRange = true
      item.value = item.value || undefined
      item.from = item.from || {
        value: '',
        step: 1, // 可选
        // min: item.minLen, // 可选
        // max: item.maxLen,
        type: item.dataType,
        placeholder: ''
      }
      item.from.limit = function(value) {
        if (typeof item.to.value === 'number') {
          if (item.to.value < value) {
            return item.to.value
          }
        }
        return value
      }
      item.to = item.to || {
        value: '',
        step: 1, // 可选
        // min: item.minLen, // 可选
        // max: item.maxLen,
        type: item.dataType,
        placeholder: ''
      }
      item.to.limit = function(value) {
        if (typeof item.from.value === 'number') {
          if (value < item.from.value) {
            return item.from.value
          }
        }
        return value
      }
    } else if (ctrl === 'rd-text') {
      // item.limit = item.limit || {
      // type: 'Length',
      // min: item.minLen,
      // max: item.maxLen
      // }
      item.value = item.value || ''
    } else if (ctrl === 'rd-select') {
      item.value = item.value || []
      item.options = item.options || []
      if (item.dataType === 'boolean') {
        item.multiple = false
        item.value = item.value || {}
        !item.options.length &&
          item.options.push(
            ...[
              {
                selected: true,
                disabled: false,
                value: 'None',
                name: 'None',
                description: void 0
              },
              {
                selected: false,
                disabled: false,
                value: 'Yes',
                name: 'Yes',
                description: 'true'
              },
              {
                selected: false,
                disabled: false,
                value: 'No',
                name: 'No',
                description: '-true'
              }
            ]
          )
      } else {
        item.multiple = true
        !item.options.length &&
          (item.enumContents || item.fixItems).forEach(i => {
            item.options.push({
              selected: false,
              disabled: false,
              value: i.name || i,
              name: i.name || i,
              description: i.name || i
            })
          })
      }
    } else if (ctrl === 'rd-datepicker') {
      item.isRange = true
      item.from = item.from || {}
      item.to = item.to || {}
      item.from.value = item.from.value || ''
      item.from.options = {
        placeHolder: '',
        position: 'bottom',
        autoPosition: true,
        quickClose: true,
        timePicker: item.fieldtype === 'DateTime',
        format:
          item.fieldtype === 'DateTime'
            ? 'YYYY-MM-DD HH:mm:ss'
            : 'YYYY-MM-DD 00:00:00', // YYYY/MM/DD HH:mm:ss
        monthList: [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December'
        ],
        weekList: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        limit: {
          customerLimit(day) {
            if (item.to.value) {
              if (
                Date.parse(day.time._i) >
                Date.parse(item.to.value.split(' ')[0])
              ) {
                return true
              }
            }
            return false
          },
          limit(value) {
            if (item.to.value) {
              if (Date.parse(value) > Date.parse(item.to.value)) {
                return item.to.value
              }
            }
            return value
          }
        }
      }
      item.to.value = item.to.value || ''
      item.to.options = {
        placeHolder: '',
        position: 'bottom',
        autoPosition: true,
        quickClose: true,
        timePicker: item.fieldtype === 'DateTime',
        format:
          item.fieldtype === 'DateTime'
            ? 'YYYY-MM-DD HH:mm:ss'
            : 'YYYY-MM-DD 23:59:59', // YYYY/MM/DD HH:mm:ss
        monthList: [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December'
        ],
        weekList: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        limit: {
          customerLimit(day) {
            if (item.from.value) {
              if (
                Date.parse(day.time._i) <
                Date.parse(item.from.value.split(' ')[0])
              ) {
                return true
              }
            }
            return false
          },
          limit(value) {
            if (item.from.value) {
              if (Date.parse(value) < Date.parse(item.from.value)) {
                return item.from.value
              }
            }
            return value
          }
        }
      }
    } else if (ctrl === 'vue-timepicker') {
      item.isRange = true
      item.from = item.from || {}
      item.to = item.to || {}
      item.from.value = item.from.value || ''
      item.from.limit = function(value) {
        if (item.to.value) {
          if (value > item.to.value) {
            return item.to.value
          }
        }
        return value
      }
      item.from.format = item.to.format = 'HH:mm:ss'
      item.to.value = item.to.value || ''
      item.to.limit = function(value) {
        if (item.from.value) {
          if (value < item.from.value) {
            return item.from.value
          }
        }
        return value
      }
    }
  })
  return serverCondition
}
export function volidInput(value, length, ele, onlyLength, key) {
  var reg = /[*?/\\?<>|:".]/g
  if (value.length > length) {
    Notice.warning(
      (key || 'Name') + ' exceeds the maximum length that system supports',
      '',
      3000
    )
    if (ele) {
      ele.value = ele.value.substring(0, length)
      ele.setSelectionRange(length, length)
    }
    return value.substring(0, length)
  } else if (reg.test(value) && !onlyLength) {
    Notice.warning(
      'illegal characters',
      "Can't contain any of the following characters" + ': * ? / \\ < > | : ".',
      3000
    )
    var index = value.split(reg)[0].length
    if (ele) {
      ele.value = value.replace(reg, '')
      ele.setSelectionRange(index, index)
    }
    return value.replace(reg, '')
  } else {
    return value
  }
}
export function getcurrentDepts(usercode, userArr, deptArr) {
  var user = userArr.filter(item => item.usercode === usercode)[0]
  var result = []

  function getAllFatherDepts(id, depts) {
    var arr = []
    if (!depts && depts.length === 0 && id === -1) {
      return arr
    }
    for (var i = 0, len = depts.length; i < len; i++) {
      if (id === depts[i].dept.deptid) {
        arr.push(depts[i].dept)
        arr = arr.concat(getAllFatherDepts(depts[i].dept.superid, depts))
      }
    }

    return arr
  }
  if (user && user.organizations && user.organizations.length) {
    user.organizations.forEach(item => {
      result = result.concat(getAllFatherDepts(item.id, deptArr))
    })
  }
  return result
}
export function getDptUserTree(deptArr, userArr, dptid) {
  var tree = []

  function arrToTree(arr, userArr, superId, tree, floor) {
    if (!arr.length) {
    } else {
      arr.forEach(function(item, index) {
        if (item.dept.superid === superId) {
          item.dept.childdept = []
          item.dept.userlist = []
          userArr.forEach(function(i) {
            if (
              i.organizations &&
              i.organizations[0] &&
              i.organizations[0].id &&
              i.organizations[0].id === item.dept.deptid
            ) {
              i.floor = floor + 1
              i.checked = false
              item.dept.userlist.push(i)
            }
          })
          item.dept.userlist.sort(SortLikeWinBy('loginname'))
          item.dept.floor = floor
          Vue.set(item.dept, 'open', false) // item.dept.open = false
          tree.push(item.dept)
          arrToTree(
            arr,
            userArr,
            item.dept.deptid,
            item.dept.childdept,
            floor + 1
          )
        }
      })
      tree.sort(SortLikeWinBy('deptname'))
    }
  }
  if (deptArr.length > 0 && userArr.length > 0) {
    arrToTree(deptArr, userArr, dptid, tree, 0)
  }
  return tree
}
var throttleAjaxId = -1
export function throttleAjax(ajaxArr, maxCount, cantCancel) {
  clearInterval(throttleAjaxId)
  return new Promise((resolve, reject) => {
    maxCount = maxCount || 5
    var count = 0
    var promiseArr = []
    var id = setInterval(function() {
      if (count < maxCount && ajaxArr.length > 0) {
        count++
        var action = ajaxArr.shift()
        promiseArr.push(
          action()
            .then(() => count--)
            .catch(() => count--)
        )
      }
      if (!ajaxArr.length) {
        clearInterval(id)
        Promise.all(promiseArr).then(() => resolve())
      }
    }, 100)
    if (!cantCancel) {
      // 部分请求不能中断
      throttleAjaxId = id
    }
  })
}
export function getUserNameByUserCode(usercode) {
  let user = state.userArr.find(item => item.usercode === usercode)
  if (user) {
    return user.nickname || user.loginname.replace(/.*\\(.*)/g, '$1')
  }
  return usercode
}
export function getIconFilename(iconfilename) {
  var _iconfilename = ''
  if (
    iconfilename &&
    iconfilename.startsWith &&
    (iconfilename.startsWith('data:') || iconfilename.startsWith('http'))
  ) {
    return iconfilename
  }
  if (iconfilename) {
    _iconfilename = iconfilename.replace(/\\/g, '/')
    _iconfilename = _iconfilename
      .replace(':', '')
      .split('\\')
      .join('/')
    if (_iconfilename.indexOf('bucket') >= 0) {
      _iconfilename = _iconfilename.substring(
        _iconfilename.indexOf('bucket') + 6
      )
    }

    if (_iconfilename.length === 0) {
      _iconfilename = '/images/nostamp.png'
    } else {
      _iconfilename = URLCONFIG.PREVIEWMARKPATH + _iconfilename // _resourceUrl + _iconfilename
    }
  }
  return _iconfilename
}
export function getMaterialType(material) {
  var ctype = 'other'
  if (material.type === 16) {
    ctype = 'folder'
  } else {
    if (material.type === 32) {
      switch (material.subtype) {
        case 0x01:
        case 0x02:
        case 1024:
        case 512:
        case 2048:
          ctype = 'video'
          break
        case 0x0004:
          ctype = 'audio'
          break
        case 0x002000:
          ctype = 'txtfile'
          break
        case 0x004000:
          ctype = 'word'
          break
        case 0x008000:
          ctype = 'ppt'
          break
        case 0x010000:
          ctype = 'excel'
          break
        case 0x040000:
          ctype = 'pdf'
          break
        case 0x000020:
          ctype = 'image'
          break
        case 0x10000000:
          ctype = 'rar'
          break
        case 0x020000000:
          ctype = 'project'
          break
        case 2147483648:
          ctype = 'aeproject'
          break
      }
    } else if (material.type === 0x40) {
      if (material.subtype === 1) {
        ctype = 'sequence'
      } else if (
        material.subtype === 3 ||
        material.subtype === 2 ||
        material.subtype === 4
      ) {
        ctype = 'h5pgm'
      }
    } else if (material.type === 0x80000) {
      ctype = 'log'
    } else if (material.type === 0 && material.subtype === 0) {
      ctype = 'rar'
    }
  }
  return ctype
}
export function extendData(sdata, node) {
  let clipData = sdata.entity || sdata.etobject
  let _framerate = 25
  let _filestatus = clipData.item && clipData.item.filestatus
  let _ntsctcmode = clipData.item && clipData.item._ntsctcmode
  let _videostandard = clipData.item && clipData.item._videostandard
  let _in = 0
  let _out = 0
  // 创建者
  if (clipData.creator !== undefined || sdata.createUser) {
    node.creatorCode = clipData.creator || sdata.createUser // for权限
    node.creatorName = getUserNameByUserCode(
      clipData.creator || sdata.createUser
    )
  }

  // 修改者
  if (clipData.modifier) {
    node.modifierName = getUserNameByUserCode(clipData.modifier)
  }
  node.archivetarget = 'Online'
  //  Storage Status
  if (clipData.type === 32) {
    node.onlinstatus =
      clipData.archivestatus === undefined
        ? 'Online'
        : clipData.archivestatus === 'online_deleted'
          ? 'Archived'
          : 'Online'
  } else if (clipData.type === 64) {
    node.onlinstatus = 'Online'
    node.archivetarget = 'Online'
  }

  // 素材状态
  if (clipData.item) {
    if (_filestatus & FileStatus.ET_Obj_FS_WA) {
      // WA类型的单独处理
      node.clipStatus =
        clipData.item.capturestatus === undefined
          ? 'Normal'
          : GetClipStatus(clipData.item.capturestatus)
    } else {
      node.clipStatus =
        clipData.item.capturestatus === undefined
          ? ''
          : GetClipStatus(clipData.item.capturestatus)
    }
  }
  // HV
  if (
    clipData.subtype & CLIPTYPE.ET_CLIPTYPE_AV ||
    clipData.subtype & CLIPTYPE.ET_CLIPTYPE_V ||
    clipData.subtype & CLIPTYPE.ET_CLIPTYPE_XDCAM ||
    CLIPTYPE.ET_CLIPTYPE_XDCAM_LIST & clipData.subtype ||
    CLIPTYPE.ET_CLIPTYPE_P2_LIST & clipData.subtype ||
    CLIPTYPE.ET_CLIPTYPE_P2 & clipData.subtype ||
    CLIPTYPE.ET_CLIPTYPE_INFINITY & clipData.subtype ||
    CLIPTYPE.ET_CLIPTYPE_E2 & clipData.subtype ||
    CLIPTYPE.ET_CLIPTYPE_E2_LIST & clipData.subtype
  ) {
    if (
      _filestatus &
      (FileStatus.ET_Obj_FS_HV_ALL | FileStatus.ET_Obj_FS_HV_SEG)
    ) {
      node.hv = '✓'
    }
  }
  // LV
  if (
    clipData.subtype & CLIPTYPE.ET_CLIPTYPE_AV ||
    clipData.subtype & CLIPTYPE.ET_CLIPTYPE_V ||
    clipData.subtype & CLIPTYPE.ET_CLIPTYPE_XDCAM ||
    clipData.subtype & CLIPTYPE.ET_CLIPTYPE_A ||
    CLIPTYPE.ET_CLIPTYPE_XDCAM_LIST & clipData.subtype ||
    CLIPTYPE.ET_CLIPTYPE_P2_LIST & clipData.subtype ||
    CLIPTYPE.ET_CLIPTYPE_P2 & clipData.subtype ||
    CLIPTYPE.ET_CLIPTYPE_INFINITY & clipData.subtype ||
    CLIPTYPE.ET_CLIPTYPE_E2 & clipData.subtype ||
    CLIPTYPE.ET_CLIPTYPE_E2_LIST & clipData.subtype
  ) {
    if (
      _filestatus &
      (FileStatus.ET_Obj_FS_LV_ALL | FileStatus.ET_Obj_FS_LV_SEG)
    ) {
      node.lv = '✓'
    }
  }
  // HA
  if (_filestatus !== undefined) {
    if (
      clipData.subtype & CLIPTYPE.ET_CLIPTYPE_A ||
      clipData.subtype & CLIPTYPE.ET_CLIPTYPE_AV ||
      clipData.subtype & CLIPTYPE.ET_CLIPTYPE_V ||
      clipData.subtype & CLIPTYPE.ET_CLIPTYPE_XDCAM ||
      clipData.subtype & CLIPTYPE.ET_CLIPTYPE_A ||
      CLIPTYPE.ET_CLIPTYPE_XDCAM_LIST & clipData.subtype ||
      CLIPTYPE.ET_CLIPTYPE_P2_LIST & clipData.subtype ||
      CLIPTYPE.ET_CLIPTYPE_P2 & clipData.subtype ||
      CLIPTYPE.ET_CLIPTYPE_INFINITY & clipData.subtype ||
      CLIPTYPE.ET_CLIPTYPE_E2 & clipData.subtype ||
      CLIPTYPE.ET_CLIPTYPE_E2_LIST & clipData.subtype
    ) {
      if (
        _filestatus &
        (FileStatus.ET_Obj_FS_HA_ALL | FileStatus.ET_Obj_FS_HA_SEG)
      ) {
        node.ha = '✓'
      }
    }
  }
  // LA
  if (_filestatus) {
    if (
      clipData.subtype & CLIPTYPE.ET_CLIPTYPE_A ||
      clipData.subtype & CLIPTYPE.ET_CLIPTYPE_AV ||
      clipData.subtype & CLIPTYPE.ET_CLIPTYPE_V ||
      clipData.subtype & CLIPTYPE.ET_CLIPTYPE_XDCAM ||
      CLIPTYPE.ET_CLIPTYPE_XDCAM_LIST & clipData.subtype ||
      CLIPTYPE.ET_CLIPTYPE_P2_LIST & clipData.subtype ||
      CLIPTYPE.ET_CLIPTYPE_P2 & clipData.subtype ||
      CLIPTYPE.ET_CLIPTYPE_INFINITY & clipData.subtype ||
      CLIPTYPE.ET_CLIPTYPE_E2 & clipData.subtype ||
      CLIPTYPE.ET_CLIPTYPE_E2_LIST & clipData.subtype
    ) {
      if (
        _filestatus &
        (FileStatus.ET_Obj_FS_LA_ALL | FileStatus.ET_Obj_FS_LA_SEG)
      ) {
        node.la = '✓'
      }
    }
  }
  // HD\SD
  if (clipData.item && clipData.subtype !== 32) {
    if (clipData.item.videostandard) {
      // if(item.videostandard==VideoStandard.)
      var temphs = VideoStandardGetHSClass(clipData.item.videostandard)
      if (temphs === VIDEOHS.ET_VIDEOHS_SD) {
        node.hsd = 'SD'
      }
      if (
        temphs === VIDEOHS.ET_VIDEOHS_HD720p ||
        temphs === VIDEOHS.ET_VIDEOHS_HD1080i ||
        temphs === VIDEOHS.ET_VIDEOHS_HD1080p ||
        temphs === VIDEOHS.ET_VIDEOHS_HD1440i
      ) {
        node.hsd = 'HD'
      }
    }
  }
  // 16:9
  if (clipData.item) {
    node.img16_9sd =
      clipData.item.imagetype === ImageType.ET_CLIP_IMAGETYPE_16_9SD ? '✓' : ''
    node.imagetype = clipData.item.imagetype
    node.is16_9sd =
      clipData.item.imagetype === ImageType.ET_CLIP_IMAGETYPE_16_9SD
  }
  // to be del
  if (clipData.deleteflag) {
    node.tobedel = clipData.deleteflag === 1 ? '✓' : ''
  }
  node.comments = clipData.note
  node.modificationDate =
    clipData.modifydate && clipData.modifydate.formatDate()
  // node.clipStatus = GetClipStatus(clipData.status);
  node.rights = clipData.rights

  if (node.type === 'image') {
    node.totalDuration = GetTimeStringByFrameNum(
      GetFrameNumByHundredNS(863999600000, _videostandard, _ntsctcmode),
      _ntsctcmode,
      _videostandard,
      _framerate
    )
    node.length = GetTimeStringByFrameNum(
      GetFrameNumByHundredNS(40000000, _videostandard, _ntsctcmode),
      _ntsctcmode,
      _videostandard,
      _framerate
    )
    node.trimin = '00:00:00:00'
    node.trimout = GetTimeStringByFrameNum(
      GetFrameNumByHundredNS(40000000, _videostandard, _ntsctcmode),
      _ntsctcmode,
      _videostandard,
      _framerate
    )
    node.flength = 40000000
    node.ftotalDuration = 863999600000
    node.ftrimin = 0
    node.ftrimout = 40000000
  } else if (node.type === 'video') {
    if (clipData.item.trimin) {
      _in = clipData.item.trimin
    }
    if (clipData.item.trimout) {
      _out = clipData.item.trimout
    }
    node.totalDuration = GetTimeStringByFrameNum(
      GetFrameNumByHundredNS(clipData.item.length, _videostandard, _ntsctcmode),
      _ntsctcmode,
      _videostandard,
      _framerate
    )
    node.length = GetTimeStringByFrameNum(
      GetFrameNumByHundredNS(_out - _in, _videostandard, _ntsctcmode),
      _ntsctcmode,
      _videostandard,
      _framerate
    )
    node.trimin = GetTimeStringByFrameNum(
      GetFrameNumByHundredNS(clipData.item.trimin, _videostandard, _ntsctcmode),
      _ntsctcmode,
      _videostandard,
      _framerate
    )
    node.trimout = GetTimeStringByFrameNum(
      GetFrameNumByHundredNS(
        clipData.item.trimout,
        _videostandard,
        _ntsctcmode
      ),
      _ntsctcmode,
      _videostandard,
      _framerate
    )
    node.ftotalDuration = clipData.item.length
    node.flength = _out - _in
    node.ftrimin = clipData.item.trimin
    node.ftrimout = clipData.item.trimout
  } else if (node.type === 'h5pgm' || node.type === 'sequence') {
    if (clipData.item.trimin) {
      _in = clipData.item.trimin
    }
    if (clipData.item.trimout) {
      _out = clipData.item.trimout
    }
    node.totalDuration = GetTimeStringByFrameNum(
      GetFrameNumByHundredNS(clipData.item.length, _videostandard, _ntsctcmode),
      _ntsctcmode,
      _videostandard,
      _framerate
    )
    node.ftotalDuration = clipData.item.length
    if (_in > 0 && _out > 0) {
      // 入出点都设置了
      node.length = GetTimeStringByFrameNum(
        GetFrameNumByHundredNS(_out - _in, _videostandard, _ntsctcmode),
        _ntsctcmode,
        _videostandard,
        _framerate
      )
      node.trimin = GetTimeStringByFrameNum(
        GetFrameNumByHundredNS(
          clipData.item.trimin,
          _videostandard,
          _ntsctcmode
        ),
        _ntsctcmode,
        _videostandard,
        _framerate
      )
      node.trimout = GetTimeStringByFrameNum(
        GetFrameNumByHundredNS(
          clipData.item.trimout,
          _videostandard,
          _ntsctcmode
        ),
        _ntsctcmode,
        _videostandard,
        _framerate
      )
      node.flength = _out - _in
      node.ftrimin = clipData.item.trimin
      node.ftrimout = clipData.item.trimout
    } else {
      if (node.type === 'sequence') {
        // node.type != 'h5pgm'
        if (_in <= 0 && _out <= 0) {
          // 入出点都没设置
          node.length = '--:--:--'
          node.trimin = '--:--:--'
          node.trimout = '--:--:--'
          node.flength = 0
          node.ftrimin = 0
          node.ftrimout = 0
        } else {
          if (_in > 0) {
            // 只设置了入点
            node.length = '--:--:--'
            node.trimin = GetTimeStringByFrameNum(
              GetFrameNumByHundredNS(
                clipData.item.trimin,
                _videostandard,
                _ntsctcmode
              ),
              _ntsctcmode,
              _videostandard,
              _framerate
            )
            node.trimout = '--:--:--'
            node.flength = 0
            node.ftrimin = clipData.item.trimin
            node.ftrimout = 0
          } else {
            node.length = '--:--:--'
            node.trimin = '--:--:--'
            node.trimout = GetTimeStringByFrameNum(
              GetFrameNumByHundredNS(
                clipData.item.trimout,
                _videostandard,
                _ntsctcmode
              ),
              _ntsctcmode,
              _videostandard,
              _framerate
            )
            node.flength = 0
            node.ftrimin = 0
            node.ftrimout = clipData.item.trimout
          }
        }
      } else {
        if (_in <= 0 && _out <= 0) {
          // 入出点都没设置
          node.length = '00:00:00'
          node.trimin = '00:00:00'
          node.trimout = '00:00:00'
          node.flength = 0
          node.ftrimin = 0
          node.ftrimout = 0
        } else {
          if (_in > 0) {
            // 只设置了入点
            node.length = '00:00:00'
            node.trimin = GetTimeStringByFrameNum(
              GetFrameNumByHundredNS(
                clipData.item.trimin,
                _videostandard,
                _ntsctcmode
              ),
              _ntsctcmode,
              _videostandard,
              _framerate
            )
            node.trimout = '00:00:00'
            node.flength = 0
            node.ftrimin = clipData.item.trimin
            node.ftrimout = 0
          } else {
            node.length = '00:00:00'
            node.trimin = '00:00:00'
            node.trimout = GetTimeStringByFrameNum(
              GetFrameNumByHundredNS(
                clipData.item.trimout,
                _videostandard,
                _ntsctcmode
              ),
              _ntsctcmode,
              _videostandard,
              _framerate
            )
            node.flength = 0
            node.ftrimin = 0
            node.ftrimout = clipData.item.trimout
          }
        }
      }
    }
  }
}
export function parseData(arr, father, option) {
  var newArr = []
  var iconDic = {
    292: 'today_icon',
    293: 'this_week_icon',
    294: 'my_clip_icon',
    '86023a7e3f2646a2bbee8a9fec7e6bcb': 'node_icon'
  }
  if (option === 'marker' || option === 'mark') {
    var marklist = arr
    var framerate = 25.0
    marklist.forEach((item, index) => {
      if (item.color) {
        var RedColor = item.color & 0x0000ff
        var Gcolor = (item.color & 0x00ff00) >> 8
        var Bcolor = (item.color & 0xff0000) >> 16
        item.bgcolor = {
          background: 'rgb(' + RedColor + ',' + Gcolor + ',' + Bcolor + ')'
        }
      } else {
      }
      if (item.type === '4') {
        item.typeName = 'Scene Mark'
        item.flag = 'smarker'
        item.isSMarker = true
        item.inPoint = frameToTime(item.keyframe, framerate)
        item.outPoint = frameToTime(item.endkeyframe, framerate)
        item.name = '4'
        item.color = 'rgb(100,100,100)'
        item.time = item.keyframe / framerate
        item.guid = '' + (new Date().getTime() + index)
        item.text = item.note
        item.intime = item.keyframe / framerate
        item.outtime = item.endkeyframe / framerate
      } else if (item.type === '8') {
        item.typeName = 'Essence Mark'
        item.flag = 'emarker'
        item.pos = frameToTime(item.keyframe, framerate)
        item.name = '5'
        item.color = 'rgb(150,150,100)'
        item.time = item.keyframe / framerate
        item.guid = '' + (new Date().getTime() + index)
        item.text = item.note
      } else if (item.type === '65536') {
        item.typeName = 'Logging Mark'
        item.flag = 'lmarker'
        item.pos = frameToTime(item.keyframe, framerate)
        item.name = '6'
        item.isLMarker = true
        item.color = 'rgb(150,100,150)'
        item.time = item.keyframe / framerate
        item.guid = '' + (new Date().getTime() + index)
        item.text = item.note
        item.creatorName = getUserNameByUserCode(item.creator)
        item.extendinfo = item.extendinfo || []
        item._extendinfo = item.extendinfo.groupBy('itemtype')
        if (!item._extendinfo || item._extendinfo.length < 3) {
          ;[
            {
              itemtype: 0,
              itemname: 'Title',
              itemvalue: []
            },
            {
              itemtype: 1,
              itemname: 'People',
              itemvalue: []
            },
            {
              itemtype: 2,
              itemname: 'Action',
              itemvalue: []
            }
          ].forEach(u => {
            if (!item.extendinfo.some(i => i.itemtype === u.itemtype)) {
              item._extendinfo.push([u])
            }
          })
        }
        item._extendinfo.sort((i1, i2) => {
          return i1[0].itemtype - i2[0].itemtype
        })
      } else if (item.type === '131072') {
        item.typeName = 'Change Mark'
        item.flag = 'cmarker'
        item.pos = frameToTime(item.keyframe, framerate)
        item.name = '7'
        item.color = 'rgb(250,150,200)'
        // item.color = 'rgb(159,0,11)';
        item.bgcolor = {
          background: 'rgb(159,0,11)'
        }
        item.time = item.keyframe / framerate
        item.guid = '' + (new Date().getTime() + index)
        item.text = item.note
      }
      item.name = item.note
      item.iconfilename = getIconFilename(item.iconfilename)
      item.selected = false
      item.type = 'marker'
      item.operations = []
      item.children = []
      item.folders = []
      newArr.push(item)
    })
    return newArr
  } else {
    var floor
    if (father) {
      floor = father.floor + 1
    }
    if (Array.isArray(arr)) {
      arr.forEach(item => {
        var node = {}
        node.updateId = 0 // add for resiponsive
        node.formatDate = item.entity.createdate // item.entity.createdate //.formatDate()
        node.createdate = new Date(item.entity.createdate).getTime() // .match(/\d+/g).join('')
        node.typeid = item.entity.type
        node.mosid = item.entity.mosid
        node.duration = 10
        node.folderpath = item.entity.folderpath || ''
        node.guid = item.entity.guid || 3
        node.id = item.entity.id
        node.name = item.entity.name || item.entity.key
        node.iconfilename = item.entity.iconfilename
          ? item.entity.iconfilename
          : node.iconfilename
        node.previewicon = item.entity.slideiconfilename
          ? item.entity.slideiconfilename
          : node.previewicon
        node.subtype = item.entity.subtype
        node.highgroupstatus = item.entity.highgroupstatus
        node.lowgroupstatus = item.entity.lowgroupstatus
        node.recordingDate =
          item.metadata &&
          item.metadata.original &&
          item.metadata.original.createdate
        if (node.recordingDate) {
          node.recordingDate =
            +new Date(node.recordingDate) > 0 ? node.recordingDate : ''
        }
        node.type = getMaterialType(item.entity)
        if (
          [292, 293, 294].indexOf(node.subtype) > -1 &&
          node.type === 'folder'
        ) {
          // node.guid = 3
        }
        node.icon = iconDic[node.subtype] || iconDic[father && father.guid]
        if (node.type === 'audio') {
          node.type = 'video'
          node.bgtype = 'audio'
          node.isAudio = true
          node.typeIndex = 2
        } else {
          node.bgtype = node.type
          node.isAudio = false
          if (node.type === 'folder') {
            node.path = item.entity.folderpath + '/' + item.entity.name
            node.typeIndex = 0
          } else if (node.type === 'video') {
            node.typeIndex = 1
            node.channel = 2
          } else if (node.type === 'h5pgm' || node.type === 'sequence') {
            node.typeIndex = 11
          } else if (node.type === 'image') {
            node.typeIndex = 3
          } else if (node.type === 'txtfile') {
            node.typeIndex = 4
          } else if (node.type === 'word') {
            node.typeIndex = 5
          } else if (node.type === 'ppt') {
            node.typeIndex = 6
          } else if (node.type === 'excel') {
            node.typeIndex = 7
          } else if (node.type === 'pdf') {
            node.typeIndex = 8
          } else if (node.type === 'project') {
            node.typeIndex = 9
          } else {
            node.typeIndex = 10
          }
        }
        if (node.type === 'video') {
          node.previewType = 'video'
        } else if (
          ['ppt', 'pdf', 'excel', 'word', 'txtfile'].indexOf(node.type) > -1
        ) {
          node.previewType = 'document'
        } else if (node.type === 'image') {
          node.previewType = 'picture'
        } else {
          node.previewType = 'other'
        }
        extendData(item, node)
        try {
          node.capturestatus = item.entity.item.capturestatus
          node.filestatus = item.entity.item.filestatus
          node.planningguid = item.entity.item.planningguid
          if (node.type === 'video') {
            if (item.entity.item) {
              node.duration = (item.entity.item.length / 10000000).fix(7)
              node.videostandard = item.entity.item.videostandard
              node.framerate =
                ETGetFrameRate(item.entity.item.videostandard) || 30
              node.ntsctcmode = item.entity.item.ntsctcmode
              node.dbestreamchannel = item.entity.dbestreamchannel
              if (
                (item.entity.item.filestatus & FileStatus.ET_Obj_FS_HA_ALL) >
                  0 ||
                (item.entity.item.filestatus & FileStatus.ET_Obj_FS_HV_ALL) > 0
              ) {
                node.HQ = true
              } else {
                node.HQ = false
              }
              if (
                (item.entity.item.filestatus & FileStatus.ET_Obj_FS_LV_ALL) >
                  0 ||
                (item.entity.item.filestatus & FileStatus.ET_Obj_FS_LA_ALL) > 0
              ) {
                node.LQ = true
              } else {
                node.LQ = false
              }
              if (node.typeIndex === 1) {
                if (
                  [1, 2, 32, 64, 128, 4096, 65536, 8192].indexOf(
                    parseInt(item.entity.item.capturestatus)
                  ) > -1
                ) {
                  node.clipping = true
                } else {
                  node.clipping = false
                }
                if (item.entity.item.filestatus & FileStatus.ET_Obj_FS_WA) {
                  node.WA = true
                } else {
                  node.WA = false
                }
                if (
                  item.entity.item.dbestreamchannel &&
                  item.entity.item.dbestreamchannel !== 0
                ) {
                  node.DB = true
                } else {
                  node.DB = false
                }
                if (
                  item.entity.item.videostandard &&
                  ETGetVideoStandardPI(item.entity.item.videostandard) === 2
                ) {
                  node.P = true
                  node.I = false
                  node.Ptitle = node.Ititle = ETGetFrameRate(
                    item.entity.item.videostandard
                  )
                } else if (
                  item.entity.item.videostandard &&
                  ETGetVideoStandardPI(item.entity.item.videostandard) === 1
                ) {
                  node.I = true
                  node.P = false
                  node.Ptitle = node.Ititle = ETGetFrameRate(
                    item.entity.item.videostandard
                  )
                }
                if (
                  (item.entity.item.filestatus &
                    (FileStatus.ET_Obj_FS_HA_ALL |
                      FileStatus.ET_Obj_FS_LA_ALL |
                      FileStatus.ET_Obj_FS_HA_SEG |
                      FileStatus.ET_Obj_FS_LA_SEG)) ===
                  0
                ) {
                  node.channel = 1
                }
              }
            }
          }
        } catch (e) {}
        if (floor) {
          node.floor = floor
        }

        node.selected = node.selected || false
        node.selecting = node.selecting || false
        if (father) {
          node.father = father
        }
        node.folders = []
        node.operations = []
        node.properties = []
        node.markers = {
          values: []
        }
        node.LTCItem = []
        node.VITCItem = []
        node.tcUpdate = 0
        node.readonly = getRight(item.entity, node)
        if (father && father.guid === '86023a7e3f2646a2bbee8a9fec7e6bcb') {
          node.readonly = true // 根目录下的文件夹只读
          node.creatorName = ''
          node.formatDate = ''
          node.modifierName = ''
          node.modificationDate = ''
        }
        getContextMenu(item, node)
        restrictContextMenu(item, node)
        node.dragOvering = node.dragOvering || false
        node.open = node.open || false
        node.checked = node.checked || false
        node.renaming = node.renaming || false
        node.uploading = node.uploading || false
        node.readyUpload = node.readyUpload || false
        node.cutting = node.cutting || false
        node.children = []
        newArr.push(node)
      })
      // may sort filter by option
    } else {
      newArr = []
    }
  }
  // add for cctv
  if (appSetting.USEROOTPATH && father.path === appSetting.ROOTPATH) {
    newArr = newArr.filter(
      item =>
        item.name.toLowerCase() === 'public' ||
        item.name.toLowerCase() === 'private'
    )
  }
  return newArr
}
export function getRight(entity, node) {
  var readonly = false
  var privilege = entity.privilege || ''
  var privilegeGroup = entity.privilegeGroup || []
  if (
    state.userInfo.roleType ||
    state.userInfo.usercode === node.creatorCode ||
    node.creatorCode ===
      (state.userInfo.nickname ||
        state.userInfo.loginname.replace(/.*\\(.*)/g, '$1')) ||
    privilege.startsWith('public') ||
    privilege === state.userInfo.privilege ||
    (state.userInfo.depts &&
      state.userInfo.depts.some(
        item => privilegeGroup.indexOf(item.privilege_write_group_code) > -1
      ))
  ) {
    readonly = false
  } else {
    readonly = true
  }
  return readonly
}
export function getContextMenu(sdata, node) {
  var canDel =
    state.userInfo.roleType ||
    ((node.clipStatus === 'Normal' || !node.clipStatus) &&
      node.onlinstatus !== 'Archived')
  // 回收站的素材
  if (node.father.guid === 0) {
    // 文件夹
    node.operations = ['Preview', 'Delete', 'Restore']
    if (node.type !== 'folder') {
      // 素材
      // node.operations.push('Detail View')
    }
    if (state.system) {
      node.operations.push('Detail View')
    }
  } else if (node.guid === '2') {
    // Search Template
    node.operations = ['Rename', 'Delete', 'Show OA File']
  } else if (
    node.subtype === '256' ||
    getAllFather(node).some(item => item.subtype === '256') ||
    node.folderpath.indexOf(appSetting.OAPATH) === 0
  ) {
    // OA Materials and materials in OA Materials
    node.operations = ['Preview', 'Detail View']
    if (node.type === 'folder') {
      node.operations.push('Open', 'Add to Quick Link')
    }
  } else if (
    node.path === appSetting.SNSPUBLISHPATH ||
    getAllFather(node).some(item => item.path === appSetting.SNSPUBLISHPATH) ||
    node.folderpath.indexOf(appSetting.SNSPUBLISHPATH) === 0
  ) {
    node.operations = ['Preview', 'Detail View']
    if (node.type === 'folder') {
      node.operations.push('Open')
    } else {
      if (canDel) {
        node.operations.push('Delete')
      }
      if (
        node.type === 'video' &&
        !node.isAudio &&
        node.clipStatus === 'Normal' &&
        node.onlinstatus === 'Online'
      ) {
        node.operations.push('Publish to SNS')
      } else if (node.type === 'image' && node.onlinstatus === 'Online') {
        node.operations.push('Publish to SNS')
      }
    }
  } else if (node.type === 'folder') {
    // normal folder
    if (
      node.folderpath.split('/').length === (appSetting.USEROOTPATH ? 1 : 2)
    ) {
      // public materials
      node.operations = [
        'Open',
        'Create New',
        'Preview',
        'Detail View',
        'Paste',
        'Upload'
      ]
    } else {
      node.operations = [
        'Open',
        'Create New',
        'Preview',
        'Detail View',
        'Cut',
        'Copy',
        'Paste',
        'Delete',
        'Rename',
        'Upload',
        'Add to Quick Link'
      ]
    }
  } else if (node.type === 'h5pgm' || node.type === 'sequence') {
    // edl
    node.operations = ['Preview', 'Detail View', 'Cut', 'Rename']
    if (canDel) {
      node.operations.push('Delete')
    }
  } else if (node.type === 'video' && !node.isAudio) {
    // video
    node.operations = [
      'Preview',
      'Detail View',
      'Cut',
      'Copy',
      'Rename',
      'Register to OA'
    ]
    if (canDel) {
      node.operations.push('Delete')
    }
    if (node.hsd === 'SD') {
      node.operations.push('16:9')
    }
    if (!node.clipping) {
      // 采集中
      if (
        node.HQ &&
        node.onlinstatus === 'Online' &&
        (state.userInfo.roleType ||
          node.clipStatus === 'Normal' ||
          !node.clipStatus)
      ) {
        node.operations.push('Export')
      }
      node.operations = node.operations.concat([
        'Preview',
        'Detail View',
        'Download'
      ])
      // if (node.onlinstatus == "Online" && (node.clipStatus === 'Normal' || node.clipStatus === 'Create Low')) { //一键发布是打不高质量，正在创建低质量是可以发布的
      //   node.operations.push('Publish to SNS') //, 'Auto Package'
      // }
      if (node.onlinstatus === 'Online' && node.clipStatus === 'Normal') {
        node.operations.push('To Publish Folder') //, 'Auto Package'
      }
    } else {
      // if (node.capturestatus === 2) {
      //   node.operations.remove('Register to OA')
      // }
    }
  } else {
    // other
    node.operations = [
      'Preview',
      'Detail View',
      'Cut',
      'Copy',
      'Rename',
      'Download'
    ]
    if (canDel) {
      node.operations.push('Delete')
    }
    if (node.type === 'image' && node.onlinstatus === 'Online') {
      node.operations.push('To Publish Folder') // 'To Publish Folder' Publish to SNS
    } else if (node.type === 'video') {
      // 音频
      if (
        node.HQ &&
        node.onlinstatus === 'Online' &&
        (state.userInfo.roleType ||
          node.clipStatus === 'Normal' ||
          !node.clipStatus)
      ) {
        node.operations.push('Export')
      }
    }
  }

  if (node.onlinstatus === 'Archived') {
    node.operations.push('Retrieve')
  }

  if (
    node.father.guid === 1 ||
    node.father.guid === 2 ||
    [292, 293, 294].indexOf(node.father.subtype) > -1
  ) {
    node.operations.push('Open Path')
  }

  if (node.readonly) {
    ;['Rename', 'Cut', 'Create New', 'Delete'].forEach(item =>
      node.operations.remove(item)
    ) // RTV dingzhi ['Rename', 'Cut', 'Copy', 'Delete', 'Create New', 'Paste', 'Upload'].forEach(item => node.operations.remove(item))
    if (node.name === 'Public Material' && node.floor === 2) {
      node.operations.push('Create New')
    }
  }
  if ([292, 293, 294].indexOf(node.subtype) > -1) {
    node.operations = ['Open']
  }
  /* if (node.type == 'folder' && node.guid.length > 1 && node.father.guid !== 0) {
    node.operations.unshift('Open')
    } */
}
export function getAllFather(material) {
  var arr = []

  function getFather(material, arr) {
    if (material && material.father) {
      arr.push(material.father)
      getFather(material.father, arr)
    }
  }
  getFather(material, arr)
  return arr
}
export function restrictContextMenu(item, node) {
  if (state.userInfo.roleType) {
  } else {
    // 回收站的素材
    if (node.father.guid === 0) {
      state.userInfo.permission.indexOf(PERMISSION.PURGE_TRASHCAN) === -1 &&
        node.operations.remove('Delete')
    }
    state.userInfo.permission.indexOf(PERMISSION.COPY) === -1 &&
      node.operations.remove('Copy')
    if (node.type === 'folder') {
      state.userInfo.permission.indexOf(PERMISSION.DELETE_FOLDER) === -1 &&
        state.userInfo.permission.indexOf(PERMISSION.DELETE_FOLDER_TREE) ===
          -1 &&
        node.operations.remove('Delete', 'Restore')
      state.userInfo.permission.indexOf(PERMISSION.ADD_FOLDER) === -1 &&
        node.operations.remove('Create New')
      state.userInfo.permission.indexOf(PERMISSION.UPLOAD) === -1 &&
        node.operations.remove('Upload')
    } else if (node.type === 'h5pgm' || node.type === 'sequence') {
      state.userInfo.permission.indexOf(PERMISSION.DELETE_EDL) === -1 &&
        node.operations.remove('Delete', 'Restore')
    } else {
      state.userInfo.permission.indexOf(PERMISSION.EXPORT) === -1 &&
        node.operations.remove('Export')
      state.userInfo.permission.indexOf(PERMISSION.DELETE_OBJ) === -1 &&
        node.operations.remove('Delete', 'Restore')
      state.userInfo.permission.indexOf(PERMISSION.DOWNLOAD) === -1 &&
        node.operations.remove('Download')
    }
  }
}

export function locateFolder(store, folderList, fNode, opt) {
  return new Promise((resolve, reject) => {
    if (folderList.length === 0) {
      if (opt.isCheck) {
        store.state.lastSeletedNode.checked = false
        store.state.lastSeletedNode = fNode
        fNode.checked = true
      } else {
        !opt.isSilent &&
          store.commit({
            type: TYPES.GET_NAVPATH,
            target: fNode,
            data: [],
            linkNode: opt.linkNode
          })
        if (opt.linkNode) {
          opt.linkNode.disabled = false
          opt.linkNode._operations = fNode.operations
          store.commit({
            type: TYPES.GET_NAVPATH,
            target: fNode,
            data: [],
            linkNode: opt.linkNode
          })
          // util.setCookie('link_nodes' + _userToken, JSON.stringify(store.state.linkNodes))
        }
        stopLoading(store)
      }
      resolve(fNode)
    } else {
      var folderName = folderList[0]
      var folder = (
        fNode.searchModel ||
        fNode.folders ||
        fNode.children ||
        getRepository(fNode.guid)
      ).filter(
        item =>
          item.type === 'folder' &&
          (item.name.toLowerCase() === folderName.toLowerCase() ||
            item.path
              .split('/')
              .pop()
              .toLowerCase() === folderName.toLowerCase())
      )[0]
      if (folder) {
        opt.isShowWaiting && startLoading(store)
        store
          .dispatch({
            type:
              folderList.length === 1 && !opt.onlyFolder
                ? opt.alwaysGet
                  ? TYPES.GET_MATERIALS3
                  : TYPES.GET_MATERIALS
                : TYPES.GET_FOLDERS,
            source: folder,
            alwaysGet: opt.alwaysGet
          })
          .then(() => {
            // isShowWaiting&&util.stopLoading(store)
            if (
              folderList.length === 1 &&
              opt.materialGuids &&
              opt.materialGuids.length &&
              getRepository(folder.guid).some(
                item => opt.materialGuids.indexOf(item.guid) > -1
              )
            ) {
              getRepository(folder.guid).forEach(item => {
                if (opt.materialGuids.indexOf(item.guid) > -1) {
                  Vue.nextTick(() => {
                    item.selected = true
                    store.commit({
                      type: TYPES.ADD_SELECTEDITEM,
                      data: item
                    })
                    var children = store.getters.displayMaterials
                    store.commit({
                      type: TYPES.SET_SIGNMATERIAL,
                      data: children.indexOf(item)
                    })
                    opt.isPreview &&
                      store.dispatch({
                        type: TYPES.PROPERTIES,
                        target: store.state.selectedMaterials
                      })
                  })
                }
              })
            }
            !opt.isSilent &&
              store.commit({
                type: TYPES.EXPAND_FOLDER,
                target: folder
              })
            folderList.shift()
            locateFolder(store, folderList, folder, opt)
              .then(res => resolve(res))
              .catch(res => reject(res))
          })
          .catch(res => stopLoading(store))
      } else if (opt.linkNode) {
        opt.linkNode.disabled = true
        // util.setCookie('link_nodes' + _userToken, JSON.stringify(store.state.linkNodes))
        stopLoading(store)
        resolve(fNode)
      } else {
        stopLoading(store)
        reject(fNode)
      }
    }
  })
}
var loadingId = -1
export function startLoading(context) {
  clearTimeout(loadingId)
  loadingId = setTimeout(() => (context.state.loading = true), 300)
}
export function stopLoading(context) {
  clearTimeout(loadingId)
  context.state.loading = false
}

export function getListHeader(left, arr, attr) {
  attr = attr || 'width'
  var l = arr.length
  for (let i = 0; i < l; i++) {
    if (arr[i][attr] > left) {
      return arr[i]
    } else {
      left -= arr[i][attr]
    }
  }
  return arr[l - 1]
}
export function ignoreZHFunc(func, context) {
  return function(a, b, c) {
    if (/^[\u2E80-\u9FFF]+$/g.test(a) || /^[\u2E80-\u9FFF]+$/g.test(b)) {
      console.log(a + b)
    } else {
      func.call(context, a, b, c)
    }
  }
}
export const Notice = {
  success() {
    this.success = ignoreZHFunc(
      window.CM.$Notification.success,
      window.CM.$Notification
    )
    this.success(...arguments)
  },
  warning() {
    this.warning = ignoreZHFunc(
      window.CM.$Notification.warning,
      window.CM.$Notification
    )
    this.warning(...arguments)
  },
  failed() {
    this.failed = ignoreZHFunc(
      window.CM.$Notification.failed,
      window.CM.$Notification
    )
    this.failed(...arguments)
  }
}
export const Model = {
  confirmWithHTML() {
    window.CM.$modal.confirmWithHTML(...arguments)
  },
  confirm() {
    window.CM.$modal.confirm(...arguments)
  }
}
export function getAdvanceSearchCondition(tab, node) {
  var json = {
    conditiongroup: {
      query: [],
      relation: 'AND',
      subgroup: null
    },
    count: true,
    usercode: state.userInfo.usercode,
    resourcename: 'entity',
    sortbys: [
      {
        fieldname: 'name_',
        isdesc: false
      }
    ]
  }
  var type = 0
  var isMarker = false
  switch (tab.name) {
    case 'Clip':
      json.conditiongroup.query.push(...defaultQuery[tab.name])
      json.conditiongroup.query.push(...packageQuery(tab))
      break
    case 'Folder':
      type = 1
      json.conditiongroup.query.push(...packageQuery(tab))
      break
    case 'PGM':
      json.conditiongroup.query.push(...defaultQuery[tab.name])
      json.conditiongroup.query.push(...packageQuery(tab))
      break
    case 'Marker':
      json = {
        iteminfo: [],
        filepath: node.path
      }
      tab.keyValues.forEach(k => {
        if (k.isRange) {
          json[k.key] =
            '[' + (k.from.value || '*') + ' TO ' + (k.to.value || '*') + ']'
        } else if (
          ['LM Title', 'LM Member', 'LM Action'].indexOf(k.name) > -1
        ) {
          ;(k.value || k.checkedValue.length) &&
            json.iteminfo.push({
              itemtype: k.key,
              itemvalue:
                k.checkedValue.map(v => '"' + v.name + '"').join('|') + k.value
            })
        } else if (k.value) {
          json[k.key] = k.value
        }
      })
      if (!json.iteminfo.length) {
        delete json.iteminfo // 避免只搜出来logging marker
      }
      isMarker = true
      break
    default:
  }
  if ([292, 293, 294].indexOf(node.subtype) > -1) {
    delete json.filepath // 特殊节点搜不出marker的问题
    node.subtype && (0, (json.subtype = node.subtype))
  }
  return {
    json: json,
    type: type,
    path: node.path,
    isMarker: isMarker
  }
}
export function packageQuery(tab) {
  var result = []
  tab.keyValues.forEach(item => {
    if (item.isRange) {
      var fv =
        (item.from.value &&
          (item.ctrl === 'vue-timepicker'
            ? '1899-12-31 ' + item.from.value
            : item.from.value)) ||
        (item.from.value === 0 ? 0 : '*')
      var tv =
        (item.to.value &&
          (item.ctrl === 'vue-timepicker'
            ? '1899-12-31 ' + item.to.value
            : item.to.value)) ||
        (item.to.value === 0 ? 0 : '*')
      ;(fv !== '*' || tv !== '*') &&
        result.push({
          key: item.key,
          value: '[' + fv + ' TO ' + tv + ']',
          queryoperation: 'and'
        })
    } else if (item.name === 'Locations') {
      if (item.value.length > 1) {
        if (item.value.length === 3) {
          // 全选
          item.value.forEach(v =>
            result.push({
              key: v.key,
              value: v.val || v.value,
              queryoperation: 'or'
            })
          )
        } else if (item.value.some(v => v.value === 'Online')) {
          // 混合2
          item.value.forEach(v =>
            result.push({
              key: v.key,
              value: v.val || v.value,
              queryoperation: 'or'
            })
          )
        } else {
          // pure 2
          item.value.forEach(v =>
            result.push({
              key: v.key,
              value: v.value,
              queryoperation: 'or'
            })
          )
          result.push({
            key: 'archiveStatus_',
            value: 'online_deleted',
            queryoperation: 'and'
          }) // add to filter online
        }
      } else {
        item.value.forEach(v => {
          result.push({
            key: v.key,
            value: v.val || v.value,
            queryoperation: 'and'
          })
          v.value !== 'Online' &&
            result.push({
              key: 'archiveStatus_',
              value: 'online_deleted',
              queryoperation: 'and'
            })
        })
      }
    } else if (item.ctrl === 'rd-select') {
      if (item.multiple) {
        item.value &&
          item.value.length &&
          result.push({
            key: item.key,
            value: item.value.map(i => i.description).join('|'),
            queryoperation: 'and'
          })
      } else {
        item.value &&
          item.value.description !== undefined &&
          result.push({
            key: item.key,
            value: item.value.description,
            queryoperation: 'and'
          })
      }
    } else {
      item.value &&
        result.push({
          key: item.key,
          value: item.value,
          queryoperation: 'and'
        })
    }
  })
  return result
}
export function enterFullscreen() {
  var el = document.documentElement
  var rfs =
    el.requestFullScreen ||
    el.webkitRequestFullScreen ||
    el.mozRequestFullScreen ||
    el.msRequestFullScreen // 定义不同浏览器的全屏API
  // 执行全屏
  if (typeof rfs !== 'undefined' && rfs) {
    rfs.call(el)
  } else if (typeof window.ActiveXObject !== 'undefined') {
    // var wscript = new ActiveXObject('WScript.Shell')
    // if (wscript != null) {
    //   wscript.SendKeys('{F11}')
    // }
  }
}
export function exitFullscreen() {
  var el = document
  var rfs =
    el.exitFullscreen ||
    el.webkitExitFullscreen ||
    el.mozExitFullscreen ||
    el.msExitFullscreen // 定义不同浏览器的全屏API
  // 执行全屏
  if (typeof rfs !== 'undefined' && rfs) {
    rfs.call(el)
  } else if (typeof window.ActiveXObject !== 'undefined') {
    // var wscript = new ActiveXObject('WScript.Shell')
    // if (wscript != null) {
    //   wscript.SendKeys('{F11}')
    // }
  }
}
export const dispatchUpdate = throttle(300, () => state.updateId++, true) // 避免调用太频繁
export function forceUpdate(guid) {
  try {
    if (guid === store.getters.currentNode.guid) {
      dispatchUpdate()
    }
  } catch (e) {}
}
export function getPadding(width, itemWidth, l) {
  var padding = 7
  var maxCount = Math.floor(width / itemWidth)
  var diff = width % itemWidth
  if (diff < padding * 2 * (maxCount + 1)) {
    maxCount--
    diff += itemWidth
  }
  if (l < maxCount) {
    return padding
  }
  padding = diff / (2 * (maxCount + 1))
  return padding
}
export function getHistories(node, arr) {
  arr.unshift(node)
  if (node.father) {
    getHistories(node.father, arr)
  }
}
export function getFulltextSearchCondtion(cond, node, type) {
  var json = {
    kvs: [],
    usercode: state.userInfo.usercode
  }
  ;([292, 293, 294].indexOf(node.subtype) > -1 &&
    ((json.subtype = node.subtype), 1)) ||
    json.kvs.push({
      key: 'tree_path_',
      value: node.path
    })
  cond.timeFilter.filter(item => item.checked).forEach(item =>
    json.kvs.push({
      key: 'createDate_',
      value:
        '[' +
        new Date(+new Date() - 86400000 * item.key).format('yyyy-MM-dd') +
        ' 00:00:00 TO ' +
        new Date().format('yyyy-MM-dd') +
        ' 23:59:59]'
    })
  )
  cond.typeFilter.filter(item => item.checked).forEach(item =>
    json.kvs.push({
      key: 'type_',
      value: item.key
    })
  )
  if (type) {
    json.searchtext = cond.keywords.trim() || ''
  } else {
    json.condition = {}
    cond.booleanCondition.forEach(
      item => (json.condition[item.key] = item.value.trim())
    )
  }
  return json
}
export function getCanSelectedItems(
  context,
  dragData,
  width,
  height,
  event,
  scrollY,
  isMarkerList
) {
  if (dragData.width < 5 && dragData.height < 5) {
    // 防止误操作
    return
  }
  var children = context.getters.displayMaterials
  var itemWidth = isMarkerList
    ? 462
    : context.state.thumbnailStyle.width * context.state.scaleTime +
      2 * context.state.thumbPadding
  var itemHeight = isMarkerList
    ? 102
    : 14 + context.state.thumbnailStyle.height * context.state.scaleTime + 45
  var length = children.length
  var rowCount = isMarkerList
    ? Math.floor(width / itemWidth)
    : Math.round((width - 2 * context.state.thumbPadding) / itemWidth)
  let x1
  let x2
  let y1
  let y2
  let arr = []
  x1 = Math.max(Math.floor(dragData.left / itemWidth), 0)
  x2 = Math.min(
    Math.floor((dragData.left + dragData.width) / itemWidth),
    rowCount - 1
  )
  y1 = Math.floor(dragData.top / itemHeight)
  y2 = Math.floor((dragData.top + dragData.height) / itemHeight)
  for (var i = y1; i <= y2; i++) {
    for (var j = x1; j <= x2; j++) {
      var idx = i * rowCount + j
      if (idx < length) {
        arr.push(i * rowCount + j)
      }
    }
  }
  if (!(event.ctrlKey || event.shiftKey)) {
    // 是否多选
    context.commit({
      type: TYPES.CLEAR_SELECTEEDITEMS
    })
  }

  arr.forEach(i => {
    children[i].selected = true
    context.commit({
      type: TYPES.ADD_SELECTEDITEM,
      data: children[i]
    })
    context.commit({
      type: TYPES.SET_SIGNMATERIAL,
      data: i
    })
  })
  return arr
}
export function videoShot(video, quality) {
  if (video && video.setAttribute) {
    video.setAttribute('crossOrigin', 'anonymous')
    var canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    var ct = canvas.getContext('2d')
    ct.drawImage(video, 0, 0)
    var icon = canvas.toDataURL('image/jpeg', quality || 0.5)
    canvas = null
    ct = null
    return icon
  }
}
export function convertPath4Mac(path) {
  var domain
  var end

  if (path.indexOf(':') > -1) {
    // disk symbol
    var symbol = path[0]
    end = path.indexOf(':') + 1
    domain = path.substring(0, end)
    return path.replace(domain, '/Volumes/' + symbol).replace(/\\/gm, '/')
  } else {
    // UNC
    path = path.replace('\\\\', '')
    end = path.indexOf('\\')
    domain = path.substring(0, end)
    return path.replace(domain, '/Volumes').replace(/\\/gm, '/')
  }
}
export function updateMarkerList(
  markers,
  framerate,
  ntsctcmode,
  videostandard,
  vtrin,
  totalFrames,
  httpMarkList = {}
) {
  markers.forEach((item, index) => {
    if (item.color) {
      var RedColor = item.color & 0x0000ff
      var Gcolor = (item.color & 0x00ff00) >> 8
      var Bcolor = (item.color & 0xff0000) >> 16
      item.bgcolor = {
        background: 'rgb(' + RedColor + ',' + Gcolor + ',' + Bcolor + ')'
      }
    } else {
    }
    if (item.keyframe === undefined) {
      item.keyframe = item.inpoint
    }
    if (!item.markguid) {
      item.markguid = item.guid_
    }
    var frameSec = GetSecondByEachFrame(videostandard).round(6)
    var intime = GetTimeStringByFrameNum(
      item.keyframe +
        GetFrameNumByHundredNS(vtrin * 10000000, videostandard, ntsctcmode),
      ntsctcmode,
      videostandard
    )
    var outtime = GetTimeStringByFrameNum(
      item.endkeyframe +
        GetFrameNumByHundredNS(vtrin * 10000000, videostandard, ntsctcmode),
      ntsctcmode,
      videostandard
    )
    var inPoint = GetMillSecondsByFrameNum(
      item.keyframe,
      videostandard
    ).roundByFrame(frameSec)
    var outPoint = GetMillSecondsByFrameNum(
      item.endkeyframe,
      videostandard
    ).roundByFrame(frameSec)
    if (item.type === '4' || item.type === 'scenemark') {
      item.typeName = 'Scene Mark'
      item.tag = 'scMarker'
      item.flag = 'smarker'
      item.isSMarker = true
      item.inPoint = intime
      item.outPoint = outtime
      item.type = 4
      item.time = inPoint
      item.guid = '' + (new Date().getTime() + index)
      item.text = item.note
      item.intime = inPoint
      item.outtime = outPoint
    } else if (item.type === '8' || item.type === 'essencemark') {
      item.typeName = 'Essence Mark'
      item.tag = 'esMarker'
      item.flag = 'emarker'
      item.pos = intime
      item.type = 8
      item.time = inPoint
      item.guid = '' + (new Date().getTime() + index)
      item.text = item.note
    } else if (item.type === '65536' || item.type === 'loggingmark') {
      item.correctSF =
        item.keyframe < item.startframe ? item.keyframe : item.startframe
      item.correctEF =
        totalFrames && item.keyframe + item.endkeyframe > totalFrames
          ? Math.max(totalFrames - item.keyframe, 0)
          : item.endkeyframe
      item.typeName = 'Logging Mark'
      item.tag = 'loMarker'
      item.flag = 'lmarker'
      item.pos = intime
      item.type = 65536
      item.isLMarker = true
      item.duration = GetTimeStringByFrameNum(
        !totalFrames ? item.correctSF : item.correctEF + item.correctSF,
        ntsctcmode,
        videostandard
      )
      item.time = inPoint
      item.guid = '' + (new Date().getTime() + index)
      item.text = item.note
      item.creatorName = getUserNameByUserCode(item.creator)
      item.extendinfo = item.extendinfo || []
      item._extendinfo = item.extendinfo.groupBy('itemtype')
      if (!item._extendinfo || item._extendinfo.length < 3) {
        ;[
          {
            itemtype: 0,
            itemname: 'Title',
            itemvalue: []
          },
          {
            itemtype: 1,
            itemname: 'People',
            itemvalue: []
          },
          {
            itemtype: 2,
            itemname: 'Action',
            itemvalue: []
          }
        ].forEach(u => {
          if (!item.extendinfo.some(i => i.itemtype === u.itemtype)) {
            item._extendinfo.push([u])
          }
        })
      }
      item._extendinfo.sort((i1, i2) => {
        return i1[0].itemtype - i2[0].itemtype
      })
    } else if (item.type === '131072' || item.type === 'changemark') {
      item.typeName = 'Change Mark'
      item.flag = 'cmarker'
      item.tag = 'chMarker'
      item.pos = intime
      item.type = 131072
      item.bgcolor = {
        background: 'rgb(159,0,11)'
      }
      item.time = inPoint
      item.guid = '' + (new Date().getTime() + index)
      item.text = item.note
    }
    if (item.iconfilename) {
      var httpItem = httpMarkList[index] || {} // 未查找
      item.icon = getIconFilename(httpItem.iconfilename || item.iconfilename)
    }
    item.operations = ['Marks to Clip']
    item.selected = false
    item.family = 'mark'
  })
  return markers
}
export function getMarkerList(entity, vtrin, httpEntity) {
  var httpMarkList = (httpEntity && httpEntity.item.markpoints) || []
  var marklist = entity.item.markpoints || []
  var framerate = 25.0
  if (marklist && entity.item && entity.item.videostandard !== undefined) {
    var ntsctcmode = entity.item.ntsctcmode || 0
    var videostandard = entity.item.videostandard || 0
    framerate = ETGetFrameRate(videostandard) || 30
    var totalFrames = GetFrameNumByHundredNS(
      Math.round(entity.item.length),
      videostandard,
      ntsctcmode
    )
    marklist = updateMarkerList(
      marklist,
      framerate,
      ntsctcmode,
      videostandard,
      vtrin,
      totalFrames,
      httpMarkList
    )
  }
  return marklist
}
export function isArray(arr) {
  return Object.prototype.toString.call(arr) === '[object Array]'
}
export function updateMaterial(arr, data, store) {
  if (
    store.state.isMarker &&
    data.type.startsWith('METADATA.model_sobey_object_markmeta') &&
    (store.getters.currentNode.guid === 1 ||
      store.getters.currentNode.guid === 2)
  ) {
    // 更新marker搜索结果
    // var item = util.getRepository(store.getters.currentNode.guid).find(i => i.objectguid === data.guid);
    var all = getRepository(store.getters.currentNode.guid).filter(
      i => i.objectguid === data.guid
    )
    all &&
      store
        .dispatch({
          type: TYPES.GET_OBJECT_INFO,
          data: {
            contentid: data.guid,
            type: '32',
            pathtype: 'http'
          }
        })
        .then(res => {
          all.forEach(item => {
            var same = res.data.ext.entity.item.markpoints.find(
              i => i.markguid === item.markguid
            )
            if (same) {
              item = Object.assign(
                item,
                parseData([same], item.father, 'marker')[0]
              )
            } else {
              getRepository(store.getters.currentNode.guid).remove(item)
              forceUpdate(store.getters.currentNode.guid)
            }
          })
        })
    return
  }
  arr.forEach(item => {
    if ((item._guid || item.guid) === data.guid) {
      store
        .dispatch({
          type: TYPES.GET_OBJECT_INFO,
          data: {
            contentid: data.guid,
            type: item.type === 'folder' ? '16' : '32',
            pathtype: 'http'
          }
        })
        .then(res => {
          var iconfilename = item.iconfilename
          var renaming = item.renaming
          var selected = item.selected
          var previewicon = item.previewicon
          var properties = item.properties
          var LTCItem = item.LTCItem
          var VITCItem = item.VITCItem
          var markers = item.markers
          var name = item.name
          var guid = item.guid
          if (
            item.folderpath &&
            item.folderpath !== res.data.ext.entity.folderpath
          ) {
            moveMaterial(
              store.state.nodes,
              {
                folderPath: res.data.ext.entity.folderpath
              },
              item
            )
          }
          item = Object.assign(item, parseData([res.data.ext], item.father)[0])
          if (item._guid) {
            item.guid = guid // 暂时不要更新guid
          }
          if (LTCItem && LTCItem.length) item.LTCItem = LTCItem
          if (VITCItem && VITCItem.length) item.VITCItem = VITCItem
          if (iconfilename && !item.iconfilename) {
            item.iconfilename = iconfilename
          }
          if (previewicon && !item.previewicon) {
            item.previewicon = previewicon
          }
          if (markers && markers.values.length) {
            item.markers = markers
          }
          if (properties && properties.length) {
            item.properties = properties
          } // 后续优化为为所有素材添加properties且自动更新且不用每次重新获取
          // if (store.state.previewOptions.materials.some(i => i.guid === item.guid)) {
          //   property.refresh()
          // }
          item.renaming = renaming
          item.selected = selected
          if (
            name !== item.name &&
            (getRepository(item.guid).length || item.folders.length)
          ) {
            mergeChildrenPath(
              item.hasGetChild ? getRepository(item.guid) : item.folders,
              item.path
            )
          }
          var previewSame = store.state.previewOptions.materials.find(
            i => i.guid === item.guid
          )
          if (previewSame) {
            item.markers = previewSame.markers
            item.properties = previewSame.properties
            item.fileList = previewSame.fileList
            Object.assign(previewSame, item)
          }
        })
    } else if (
      item.type === 'folder' &&
      data.folderPath === item.path &&
      !(
        getRepository(item.guid).some(
          item => (item._guid || item.guid) === data.guid
        ) || item.folders.some(item => (item._guid || item.guid) === data.guid)
      )
    ) {
      // move 适配move只有update的消息
      var node = initData(data, item)
      node.type = data.type.split('.')[0] === 'TREE' ? 'folder' : 'other'
      node.bgtype = node.type
      node.guid = data.guid
      getRepository(item.guid).push(node)
      forceUpdate(item.guid)
      node.type === 'folder' && item.folders.push(node)
      updateMaterial(getRepository(item.guid), data, store)
    }
    if (pureGetRepository(item.guid).length || item.folders.length) {
      updateMaterial(
        item.hasGetChild ? getRepository(item.guid) : item.folders,
        data,
        store
      )
    }
  })
}
export function moveMaterial(arr, data, item) {
  getRepository(item.father.guid).remove(item)
  forceUpdate(item.father.guid)
  item.type === 'folder' && item.father.folders.remove(item)
  getMaterialFoder(arr, data).then(res => {
    item.father = res
    !getRepository(res.guid).some(i => i.guid === item.guid) &&
      getRepository(res.guid).add(item) // 解决从search result cut 时出现两个的问题
    forceUpdate(res.guid)
    item.type === 'folder' &&
      !res.folders.some(i => i.guid === item.guid) &&
      res.folders.add(item)
  })
}
export function getMaterialFoder(arr, data) {
  return new Promise((resolve, reject) => {
    for (let i = 0, l = arr.length; i < l; i++) {
      var item = arr[i]
      if (
        (data.fguid && item.guid === data.fguid) ||
        (data.folderPath && data.folderPath === item.path)
      ) {
        resolve(item)
        break
      } else if (getRepository(item.guid).length || item.folders.length) {
        getMaterialFoder(
          item.hasGetChild ? getRepository(item.guid) : item.folders,
          data
        ).then(res => {
          resolve(res)
        })
      }
    }
  })
}
export function mergeChildrenPath(arr, path) {
  arr.forEach(item => {
    item.folderpath = path
    item.path = path + '/' + item.name
    if (getRepository(item.guid).length || item.folders.length) {
      mergeChildrenPath(
        item.hasGetChild ? getRepository(item.guid) : item.folders,
        item.path
      )
    }
  })
}
export function initData(file, father) {
  var node = {}
  node.operations = []
  node.guid = Guid.NewGuid().ToString('N')
  node.folders = []
  node.file = file
  node.percent = 0
  node.name = file.name
  node.type = 'other'
  node.bgtype = 'uploading'
  node.selected = file.selected || false
  node.father = father
  node.floor = father.floor + 1
  node.open = file.open || false
  node.checked = file.checked || false
  node.selecting = file.selecting || false
  node.renaming = file.renaming || false
  node.uploading = file.uploading || false
  node.readyUpload = file.readyUpload || false
  node.cutting = file.cutting || false
  node.children = file.children || []
  setRepository(node.guid, file.guid)
  node.dragOvering = file.dragOvering || false
  node.readonly = false
  node.iconfilename = undefined
  node.previewicon = undefined
  node.HQ = node.LQ = node.WA = node.DB = node.clipping = node.onlinstatus = undefined
  return node
}
export function sync(promArr) {
  return new Promise((resolve, reject) => {
    var i = 0
    function loop() {
      if (i < promArr.length) {
        var func = promArr[i]
        if (func instanceof Function) {
          func().then(res => {
            i++
            loop()
          }).catch(res => {
            console.log(res)
            i++
            loop()
          })
        } else {
          i++
          loop()
        }
      } else {
        resolve()
      }
    }
    loop()
  })
}
export function mergeHeader(target, source) {
  if (!target || !target.length) {
    return source
  } else {
    var newAddHeaders = source.filter(
      item => !item.id && !target.find(i => i.name === item.name)
    )
    var index = 0
    target.forEach((item, i) => {
      if (!item.id) {
        let same = source.find(i => i.name === item.name)
        item.attr = (same && same.attr) || item.attr
        index = i + 1
      }
    })
    target.splice(index, 0, ...newAddHeaders)
    return target
  }
}
export function getNextItem(node, isdeep) {
  var closedFather = getClosedFather(node)
  if (closedFather) {
    return closedFather
  }
  var father = node.father
  var index
  var folders
  if (node.guid === 1 && node.open && node.searchModel.length) {
    return node.searchModel.sort(SortLikeWin)[0]
  } else if (node.guid === 2) {
    index = father.searchModel.indexOf(node)
    if (index < father.searchModel.length - 1) {
      return father.searchModel.sort(SortLikeWin)[index + 1]
    } else {
      return node
    }
  }

  if (node.open && node.folders.sort(SortLikeWin).length && !isdeep) {
    return sortByTitle(node.folders)[0]
  } else if (node.father) {
    folders = sortByTitle(node.father.folders)
    index = folders.indexOf(node)
    if (index < folders.length - 1) {
      return folders[index + 1]
    } else if (node.father.father) {
      return getNextItem(node.father, true)
    } else {
      return null
    }
  }
}
export function sortByTitle(arr) {
  return sortBy(arr.slice(), 'title', true)
}
export function getClosedFather(node) {
  if (node.father) {
    if (!node.father.open) {
      return node.father
    } else {
      return getClosedFather(node.father)
    }
  } else {
    return null
  }
}

export function getPrevItem(node) {
  var closedFather = getClosedFather(node)
  var index
  if (closedFather) {
    return closedFather
  }
  if (node.father) {
    if (node.guid === 2) {
      index = node.father.searchModel.sort(SortLikeWin).indexOf(node)
      if (index > 0) {
        return node.father.searchModel.sort(SortLikeWin)[index - 1]
      } else {
        return node.father
      }
    }

    var folders = sortByTitle(node.father.folders)
    index = folders.indexOf(node)
    if (index > 0) {
      return getLastItem(folders[index - 1])
    } else {
      return node.father
    }
  } else {
    return null
  }
}
export function getTopFather(node) {
  if (node.father) {
    return getTopFather(node.father)
  } else {
    return node
  }
}
export function getBottomChild(node) {
  var folders = sortByTitle(node.folders)
  if (node.open && folders.length > 0) {
    return getBottomChild(folders[folders.length - 1])
  } else {
    return node
  }
}
export function getLastItem(node) {
  var folders = sortByTitle(node.folders)
  if (node.open && folders.length) {
    return getLastItem(folders[folders.length - 1])
  } else {
    return node
  }
}
export function debounce(delay, action, immediately) {
  var id = -1
  return function() {
    if (immediately && id === -1) {
      action.apply(this, arguments)
    }
    clearTimeout(id)
    id = setTimeout(() => action.apply(this, arguments), delay)
  }
}
export function confirmMessage (title, content) {
  Model.confirm(title, content,
    () => {
    },
    () => {
    },
    {
      large: true,
      cancelButton: {
        show: false,
        type: '',
        text: 'Cancel'
      },
      confirmButton: {
        show: true,
        type: 'primary',
        text: 'Confirm'
      }
    })
}
function getMosid(data, context) {
  if (data.father.mosid) {
    context.state.registerdata.oaFolderMosid = data.father.mosid
  } else {
    getMosid(data.father, context)
  }
}
export function displayRegisterWindow (currentStudioData, context) {
  let registerData = context.state.registerdata
  let studioid = registerData.selectedStudioid
  let timer = registerData.selectTime
  let rundownid = registerData.selectRundownid
  let StudioMosid = registerData.selectedStudioMosid
  // -------------------设置studio数据
  let isContain = false
  let StudioDatas = JSON.stringify(currentStudioData)
  StudioDatas = JSON.parse(StudioDatas)
  StudioDatas.forEach((item) => {
    if (studioid === item.studioid) {
      isContain = true
    }
  })
  let newStudio = []
  let temStudio = []
  context.state.registerdata.registerData.forEach(item => {
    let same = StudioDatas.find(k => item.studioid === k.studioid)
    if (same) {
      item.name = same.name
      item.studiomosid = same.studiomosid
      item.ischeckedStudio = false
      newStudio.push(same)
    } else {
      temStudio.push(item)
    }
  })
  context.state.registerdata.registerData.remove(...temStudio)
  StudioDatas.remove(newStudio)
  StudioDatas.forEach(item => {
    context.state.registerdata.registerData.push(item)
  })
  isContain && context.state.registerdata.registerData.forEach(item => {
    if (studioid && StudioMosid && studioid === item.studioid && StudioMosid === item.studiomosid) {
      item.ischeckedStudio = true
    } else {
      item.ischeckedStudio = false
    }
  })
  let checkedStudio = context.state.registerdata.registerData.filter((item) => item.ischeckedStudio)
  // 获取rundown
  if (studioid && isContain) { // 当前studio存在才打开
    context.dispatch({
      type: TYPES.GET_RUNDOWN_LIST,
      data: studioid
    }).then((result) => {
      if (result && result.length > 0) {
        // ---------------时间
        // let isEqual = false
        let equalRundown = false
        let arr = []
        // var newArr = []
        var rundownData = result.map(item => item.FirstPlayDate) || []
        rundownData.forEach(item => {
          if (arr.indexOf(item) < 0) arr.push(item)
        })
        arr.sort()
        var defaultArr = [{
          name: 'Please select time',
          selected: true,
          children: []
        }]
        if (arr.length > 0) {
          arr.forEach(item => {
            let childrenDate = [{
              studioid: '',
              name: 'Please select rundown list',
              FirstPlayDate: '',
              Rundownid: '',
              selected: true
            }]
            rundownData && rundownData.forEach(i => {
              if (item === i.FirstPlayDate) {
                item.selected = false
                childrenDate.push(item)
              }
              if (i.FirstPlayDate === rundownid) {
                equalRundown = true
                item.selected = true
                childrenDate[0].selected = false
              }
            })
            var obj = {
              name: item,
              selected: false,
              children: childrenDate
            }
            if (timer && timer === item) {
              obj.selected = true
              // isEqual = true
            }
            defaultArr.push(obj)
          })
        }
        checkedStudio && (checkedStudio[0].children = [...defaultArr])
        // 设置event数据
        if (studioid && rundownid && equalRundown) {
          context.dispatch({
            type: TYPES.GET_PROGRAMEINFO_LIST,
            data: {
              studioid: studioid,
              rundownid: rundownid
            }
          }).then((result) => {
            let datas = result
            if (datas.length > 0) {
              let programData = JSON.stringify(datas)
              programData = JSON.parse(programData)
              let timeDate = checkedStudio && checkedStudio[0].children.filter(item => item.selected)[0].children
              let rundownDate = timeDate && timeDate.filter(item => item.selected)[0].children
              rundownDate && (rundownDate = programData)
            }
          }).catch((re) => {
          })
        } else {
          context.state.registerdata.programInfo = []
          context.state.registerdata.tempProgramInfodata = []
        }
      }
    }).catch((res) => {
    })
  }
  if (context.state.registerdata.registerPath) {
    let path = context.state.registerdata.registerViewPath.replace(/ \/ /g, '/')
    if (path.indexOf('OA Material/') >= 0) {
      path = path.replace('OA Material/', '')
    }
    if (path !== 'OA Material / ') {
      locateFolder(context, path.split('/'), context.state.oaFolder[0], {
        onlyFolder: true,
        alwaysGet: true,
        isCheck: true
      }).then((res) => {
      }).catch((res) => {
        if (res) {
          let path = res.path.slice(res.path.indexOf('OA Material'))
          context.state.registerdata.registerViewPath = path.replace(/\//g, ' / ')
          let firstStr = context.state.registerdata.registerPath.split('/').shift()
          context.state.registerdata.registerPath = path.slice(path.indexOf(firstStr))
          res.checked = true
          context.state.registerdata.oaFolderMosid = res.mosid
          if (!context.state.registerdata.oaFolderMosid) {
            getMosid(res, context)
          }
        } else {
          context.state.registerdata.registerViewPath = 'OA Material / '
          context.state.registerdata.registerPath = ''
          context.state.registerdata.oaFolderMosid = ''
        }
      })
    }
  }
}
