import { SortLikeWin, SortLikeWinBy } from './sort.js'
import {
  getclipclassType,
  getChannelType,
  ET_CLIP_CLASS_CC, ET_CLIP_CLASS_KEY, ET_CLIP_CLASS_TC, ET_CLIP_CLASS_G, ET_CLIP_CLASS_CLIP,
  getdbeTrack,
  getDbePassage,
  ET_CLIP_CLASS_V,
  ET_CLIP_DBE_A1,
  ET_CLIP_DBE_A2,
  ET_CLIP_DBE_A3,
  ET_CLIP_DBE_A4,
  ET_CLIP_DBE_A5,
  ET_CLIP_DBE_A6,
  ET_CLIP_DBE_A7,
  ET_CLIP_DBE_A8,
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
import { frameToTime, GetEntityType } from './transform.js'
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
import ltcRepository from '../data/ltcRepository'
import vitcRepository from '../data/vitcRepository'
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
    let Days = 30
    let exp = new Date()
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
  let volidType = {
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
  let volid = key =>
    volidType[key] &&
    (e =>
      volidInput(
        e.target.value,
        volidType[key] && volidType[key].length,
        e.target,
        volidType[key] && volidType[key].onlyLength,
        key
      ))
  let ctrlTable = {
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
    let ctrl =
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
  let reg = /[*?/\\?<>|:".]/g
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
    let index = value.split(reg)[0].length
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
  let user = userArr.filter(item => item.usercode === usercode)[0]
  let result = []

  function getAllFatherDepts(id, depts) {
    let arr = []
    if (!depts && depts.length === 0 && id === -1) {
      return arr
    }
    for (let i = 0, len = depts.length; i < len; i++) {
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
  let tree = []

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
let throttleAjaxId = -1
export function throttleAjax(ajaxArr, maxCount, cantCancel) {
  clearInterval(throttleAjaxId)
  return new Promise((resolve, reject) => {
    maxCount = maxCount || 5
    let count = 0
    let promiseArr = []
    let id = setInterval(function() {
      if (count < maxCount && ajaxArr.length > 0) {
        count++
        let action = ajaxArr.shift()
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
  let _iconfilename = ''
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
  let ctype = 'other'
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
      let temphs = VideoStandardGetHSClass(clipData.item.videostandard)
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
  let newArr = []
  let iconDic = {
    292: 'today_icon',
    293: 'this_week_icon',
    294: 'my_clip_icon',
    '86023a7e3f2646a2bbee8a9fec7e6bcb': 'node_icon'
  }
  if (option === 'marker' || option === 'mark') {
    let marklist = arr
    let framerate = 25.0
    marklist.forEach((item, index) => {
      if (item.color) {
        let RedColor = item.color & 0x0000ff
        let Gcolor = (item.color & 0x00ff00) >> 8
        let Bcolor = (item.color & 0xff0000) >> 16
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
    let floor
    if (father) {
      floor = father.floor + 1
    }
    if (Array.isArray(arr)) {
      arr.forEach(item => {
        let node = {}
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
  let readonly = false
  let privilege = entity.privilege || ''
  let privilegeGroup = entity.privilegeGroup || []
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
  let canDel =
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
  let arr = []

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
      let folderName = folderList[0]
      let folder = (
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
                    let children = store.getters.displayMaterials
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
let loadingId = -1
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
  let l = arr.length
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
  let json = {
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
  let type = 0
  let isMarker = false
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
  let result = []
  tab.keyValues.forEach(item => {
    if (item.isRange) {
      let fv =
        (item.from.value &&
          (item.ctrl === 'vue-timepicker'
            ? '1899-12-31 ' + item.from.value
            : item.from.value)) ||
        (item.from.value === 0 ? 0 : '*')
      let tv =
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
  let el = document.documentElement
  let rfs =
    el.requestFullScreen ||
    el.webkitRequestFullScreen ||
    el.mozRequestFullScreen ||
    el.msRequestFullScreen // 定义不同浏览器的全屏API
  // 执行全屏
  if (typeof rfs !== 'undefined' && rfs) {
    rfs.call(el)
  } else if (typeof window.ActiveXObject !== 'undefined') {
    // let wscript = new ActiveXObject('WScript.Shell')
    // if (wscript != null) {
    //   wscript.SendKeys('{F11}')
    // }
  }
}
export function exitFullscreen() {
  let el = document
  let rfs =
    el.exitFullscreen ||
    el.webkitExitFullscreen ||
    el.mozExitFullscreen ||
    el.msExitFullscreen // 定义不同浏览器的全屏API
  // 执行全屏
  if (typeof rfs !== 'undefined' && rfs) {
    rfs.call(el)
  } else if (typeof window.ActiveXObject !== 'undefined') {
    // let wscript = new ActiveXObject('WScript.Shell')
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
  let padding = 7
  let maxCount = Math.floor(width / itemWidth)
  let diff = width % itemWidth
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
  let json = {
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
  let children = context.getters.displayMaterials
  let itemWidth = isMarkerList
    ? 462
    : context.state.thumbnailStyle.width * context.state.scaleTime +
      2 * context.state.thumbPadding
  let itemHeight = isMarkerList
    ? 102
    : 14 + context.state.thumbnailStyle.height * context.state.scaleTime + 45
  let length = children.length
  let rowCount = isMarkerList
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
  for (let i = y1; i <= y2; i++) {
    for (let j = x1; j <= x2; j++) {
      let idx = i * rowCount + j
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
    let canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    let ct = canvas.getContext('2d')
    ct.drawImage(video, 0, 0)
    let icon = canvas.toDataURL('image/jpeg', quality || 0.5)
    canvas = null
    ct = null
    return icon
  }
}
export function convertPath4Mac(path) {
  let domain
  let end

  if (path.indexOf(':') > -1) {
    // disk symbol
    let symbol = path[0]
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
      let RedColor = item.color & 0x0000ff
      let Gcolor = (item.color & 0x00ff00) >> 8
      let Bcolor = (item.color & 0xff0000) >> 16
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
    let frameSec = GetSecondByEachFrame(videostandard).round(6)
    let intime = GetTimeStringByFrameNum(
      item.keyframe +
        GetFrameNumByHundredNS(vtrin * 10000000, videostandard, ntsctcmode),
      ntsctcmode,
      videostandard
    )
    let outtime = GetTimeStringByFrameNum(
      item.endkeyframe +
        GetFrameNumByHundredNS(vtrin * 10000000, videostandard, ntsctcmode),
      ntsctcmode,
      videostandard
    )
    let inPoint = GetMillSecondsByFrameNum(
      item.keyframe,
      videostandard
    ).roundByFrame(frameSec)
    let outPoint = GetMillSecondsByFrameNum(
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
      let httpItem = httpMarkList[index] || {} // 未查找
      item.icon = getIconFilename(httpItem.iconfilename || item.iconfilename)
    }
    item.operations = ['Marks to Clip']
    item.selected = false
    item.family = 'mark'
  })
  return markers
}
export function getMarkerList(entity, vtrin, httpEntity) {
  let httpMarkList = (httpEntity && httpEntity.item.markpoints) || []
  let marklist = entity.item.markpoints || []
  let framerate = 25.0
  if (marklist && entity.item && entity.item.videostandard !== undefined) {
    let ntsctcmode = entity.item.ntsctcmode || 0
    let videostandard = entity.item.videostandard || 0
    framerate = ETGetFrameRate(videostandard) || 30
    let totalFrames = GetFrameNumByHundredNS(
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
    // let item = util.getRepository(store.getters.currentNode.guid).find(i => i.objectguid === data.guid);
    let all = getRepository(store.getters.currentNode.guid).filter(
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
            let same = res.data.ext.entity.item.markpoints.find(
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
          let iconfilename = item.iconfilename
          let renaming = item.renaming
          let selected = item.selected
          let previewicon = item.previewicon
          let properties = item.properties
          let LTCItem = item.LTCItem
          let VITCItem = item.VITCItem
          let markers = item.markers
          let name = item.name
          let guid = item.guid
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
          let previewSame = store.state.previewOptions.materials.find(
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
      let node = initData(data, item)
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
      let item = arr[i]
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
  let node = {}
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
    let newAddHeaders = source.filter(
      item => !item.id && !target.find(i => i.name === item.name)
    )
    let index = 0
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
  let closedFather = getClosedFather(node)
  if (closedFather) {
    return closedFather
  }
  let father = node.father
  let index
  let folders
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
  let closedFather = getClosedFather(node)
  let index
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

    let folders = sortByTitle(node.father.folders)
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
  let folders = sortByTitle(node.folders)
  if (node.open && folders.length > 0) {
    return getBottomChild(folders[folders.length - 1])
  } else {
    return node
  }
}
export function getLastItem(node) {
  let folders = sortByTitle(node.folders)
  if (node.open && folders.length) {
    return getLastItem(folders[folders.length - 1])
  } else {
    return node
  }
}
export function debounce(delay, action, immediately) {
  let id = -1
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
  registerData.eventData && registerData.eventData.forEach(item => {
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
  context.state.registerdata.eventData.remove(...temStudio)
  StudioDatas.remove(...newStudio)
  StudioDatas.forEach(item => {
    context.state.registerdata.eventData.push(item)
  })
  isContain && context.state.registerdata.eventData.forEach(item => {
    if (studioid && StudioMosid && studioid === item.studioid && StudioMosid === item.studiomosid) {
      item.selected = true
    } else {
      item.selected = false
    }
  })
  let checkedStudio = context.state.registerdata.eventData.filter((item) => item.selected)
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
            result && result.forEach(i => {
              if (item === i.FirstPlayDate) {
                i.selected = false
                childrenDate.push(i)
              }
              if (studioid && rundownid && studioid === i.studioid && rundownid === i.Rundownid) {
                equalRundown = true
                i.selected = true
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
              defaultArr[0].selected = false
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
              let rundownDate = timeDate && timeDate.filter(item => item.selected)
              rundownDate && (rundownDate[0].children = [...programData])
            }
          }).catch((re) => {
          })
        } else {
          // context.state.registerdata.programInfo = []
          // context.state.registerdata.tempProgramInfodata = []
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
export function newFolder(context, node) {
  let folder = initData(
    {
      name: 'NewFolder'
    },
    node
  )
  folder.type = folder.bgtype = 'folder'
  getUnusedName(context, folder, node, '(').then(res => {
    folder.name = res
    folder.path = node.path + '/' + res
    let symbol = Symbol('add folder')
    context.commit({
      type: TYPES.PUSH_EVENT,
      data: {
        type: TYPES.ADD_FOLDER,
        data: folder
      },
      symbol: symbol
    })
    getRepository(node.guid).push(folder)
    forceUpdate(node.guid)
    node.folders.push(folder)
    context.commit({
      type: TYPES.CLEAR_SELECTEEDITEMS
    })
    folder.selected = true
    context.commit({
      type: TYPES.ADD_SELECTEDITEM,
      data: folder
    })
    context.commit({
      type: TYPES.SET_SIGNMATERIAL,
      data: context.getters.displayMaterials.indexOf(folder)
    })
    Vue.nextTick(() => {
      setTimeout(() => (folder.renaming = true), 0)
    })
    context
      .dispatch({
        type: TYPES.ADD_FOLDER,
        source: node,
        data: folder.name
      })
      .then(res => {
        folder._guid = res.data.ext.id
        // 获取信息
        // util.updateMaterial(util.getRepository(node.guid), {
        //   guid: folder.guid
        // }, context)
        context.commit({
          type: TYPES.DELETE_EVENT,
          symbol: symbol
        })
        // util.Notice.success('copy success', 'copy success', 1000)
      })
      .catch(res => {
        context.commit({
          type: TYPES.RECOVERY_EVENT,
          symbol: symbol
        })
        Notice.warning('Create failed', 'Create failed', 1000)
      })
  })
}
export function getUnusedName(context, item, target, template, ignoreName) {
  if (ignoreName) {
    return new Promise((resolve, reject) => {
      resolve(item.name)
    })
  }
  let index = 0
  let t = template || ' Copy('

  function getCanUseName(name, nameArr) {
    if (nameArr.indexOf(name) > -1) {
      index++
      return getCanUseName(item.name + t + index + ')', nameArr)
    } else {
      return name
    }
  }
  return new Promise((resolve, reject) => {
    context
      .dispatch({
        type: TYPES.GET_MATERIALS2,
        source: target
      })
      .then(res => {
        let names = getRepository(target.guid).map(item => item.name)
        resolve(getCanUseName(item.name, names))
      })
      .catch(res => {
        let names = getRepository(target.guid).map(item => item.name)
        resolve(getCanUseName(item.name, names))
      })
  })
}
export function copyObject(context, item, target, ignoreName) {
  item.father = target
  item.folderpath = target.path
  let operations = item.operations
  item.operations = []
  return new Promise((resolve, reject) => {
    getUnusedName(context, item, target, '', ignoreName).then(res => {
      let obj = {}
      getRepository(target.guid).push(item)
      forceUpdate(target.guid)
      if (!ignoreName) {
        item.name = res
        obj.name = res
      }
      obj.id = 0
      obj.folderpath = target.path
      obj.creator = context.state.userInfo.usercode
      obj.type = item.typeid
      obj.subtype = item.subtype
      let type = GetEntityType(obj.type, obj.subtype)
      obj.modifyterminal = context.state.userInfo.ip
      obj.item = {}
      if (item.type === 'video' && item.onlinstatus === 'Archived') {
        item.filestatus &= ~FileStatus.ET_Obj_FS_HV_ALL
        item.filestatus &= ~FileStatus.ET_Obj_FS_HA_ALL
        obj.item.filestatus = item.filestatus
        item.HQ = false
      }
      item.filestatus &= ~FileStatus.ET_Obj_FS_WA // 去掉WA标志
      obj.item.filestatus = item.filestatus
      item.WA = false
      obj.item.videostandard = item.videostandard
      obj.item.capturestatus = item.capturestatus
      obj.item.dbestreamchannel = item.dbestreamchannel
      obj.item.ntsctcmode = item.ntsctcmode
      let json = {
        type: type,
        version: 1,
        object: {
          entity: obj
        }
      }
      context
        .dispatch({
          type: TYPES.COPY_OBJECT,
          source: item,
          target: target,
          data: json
        })
        .then(res => {
          // let oldGuid = item.guid
          item.guid = res.data.ext
          // util.setRepository(item.guid, oldGuid)
          forceUpdate(item.guid)
          item.operations = operations
          resolve(res)
        })
        .catch(res => reject(res))
    })
  })
}
export function copyNode(item) {
  let copiedItem = initData(
    {
      name: item.name
    },
    item.father
  )
  Object.assign(copiedItem, item)
  copiedItem.copying = true // 可能需要给未同步素材添加个状态
  copiedItem.waiting = true
  copiedItem.selected = false
  copiedItem.checked = false
  copiedItem.selecting = false
  copiedItem.__guid = copiedItem.guid
  copiedItem.guid = Guid.NewGuid().ToString('N')
  let arr = getRepository(copiedItem.__guid) // source folder's children
  setRepository(copiedItem.guid, [])
  arr.forEach(i => {
    let m = copyNode(i)
    getRepository(copiedItem.guid).push(m)
    m.type === 'folder' && copiedItem.folders.push(m)
  })
  forceUpdate(copiedItem.guid)
  return copiedItem
}

export function getDownloadUrl(data) {
  let url = []
  let isHigh = true
  if (data.entity.type === 32) {
    if (data.entity.item.clipfile.length === 0) {
      if (data.streammedia && data.streammedia.length) {
        url.push(data.streammedia[0].filepath)
        isHigh = false
      }
    } else {
      data.entity.item.clipfile.forEach(item => {
        if (item.qualitytype === 0 && item.clipclass === 1) {
          url.push(item.filename)
        }
      })
      let hvFiles = data.entity.item.clipfile.filter(
        item => item.qualitytype === 0 && item.clipclass === 1
      )
      let hvLength = hvFiles.reduce(
        (i, j) => {
          return {
            clipin: 0,
            clipout: i.clipout + j.clipout - i.clipin - j.clipin
          }
        },
        {
          clipin: 0,
          clipout: 0
        }
      ).clipout
      if (hvFiles.length && hvLength >= data.entity.item.length) {
        // 判断高质量是否全
      } else {
        url.length = 0
      }
      if (!url.length) {
        data.entity.item.clipfile.forEach(item => {
          if (item.qualitytype === 1 && item.clipclass === 1) {
            url.push(item.filename)
            isHigh = false
          }
        })
        if (!url.length) {
          url.push(data.entity.item.clipfile[0].filename)
          isHigh = !data.entity.item.clipfile[0].qualitytype
        }
      }
    }
  } else {
    url.push(data.entity.item.filename)
  }
  return {
    url: url,
    isHigh: isHigh
  }
}
export function cleanNode(item) {
  item.waiting = false
  getRepository(item.guid) &&
    getRepository(item.guid).forEach(i => {
      cleanNode(i)
    })
}
export function isMpd(src) {
  let index = src.lastIndexOf('?')
  return src && src.substring(0, index === -1 ? void 0 : index).endsWith('.mpd')
}
export function copyFolder(context, item, target, ignoreName) {
  item.father = target
  item.floor = target.floor + 1
  item.folderpath = target.path
  let operations = item.operations
  item.operations = []
  return new Promise((resolve, reject) => {
    context
      .dispatch({
        type: TYPES.GET_MATERIALS2,
        source: item
      })
      .then(res => {
        getUnusedName(context, item, target, '', ignoreName).then(res => {
          getRepository(target.guid).push(item)
          forceUpdate(target.guid)
          target.folders.push(item)
          if (!ignoreName) {
            item.name = res
          }
          item.path = target.path + '/' + item.name
          context
            .dispatch({
              type: TYPES.ADD_FOLDER,
              data: res,
              source: target
            })
            .then(res => {
              resolve(res)
              let oldGuid = item.guid
              item._guid = res.data.ext.id // 解决new folder copy时自动刷新的出现两个bug
              item.guid = res.data.ext.id
              setRepository(item.guid, oldGuid) // guid变更，同步数据
              item.operations = operations
              getRepository(item.guid).forEach(i => {
                if (i.type === 'folder') {
                  copyFolder(context, i, item, true)
                    .then(res => resolve(res))
                    .catch(res => reject(res))
                } else {
                  copyObject(context, i, item, true)
                    .then(res => resolve(res))
                    .catch(res => reject(res))
                }
              })
              setRepository(item.guid, [])
              forceUpdate(item.guid)
            })
            .catch(res => {
              reject(res)
            })
        })
      })
  })
}
export function parseTrashCanData(arr, father) {
  let newArr = []
  let floor
  if (father) {
    floor = father.floor + 1
  }
  if (isArray(arr)) {
    arr.forEach(item => {
      let node = {}
      node.formatDate = item.etobject.createdate
      node.createdate = new Date(item.createDate).getTime()
      node.typeid = item.etobject.type
      if (item.etobject.type && item.etobject.subtype) {
        node.type = getMaterialType(item.etobject)
      } else {
        node.type = item.type
      }

      if (node.type === 'audio') {
        node.type = 'video'
        node.bgtype = 'audio'
        node.isAudio = true
        node.typeIndex = 2
      } else {
        node.bgtype = node.type
        node.isAudio = false
        if (node.type === 'folder') {
          node.path = item.treePath + '/' + item.etobject.name
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
      node.duration = 10
      node.folderpath = item.treePath || ''
      node.guid = item.contentId
      node.id = item.etobject.id
      node.name = item.name
      node.iconfilename = item.keyframe ? item.keyframe : ''
      node.subtype = item.etobject.subtype
      if (item.etobject.creator !== undefined || item.createUser) {
        node.creatorCode = item.etobject.creator || item.createUser // for权限
        node.creatorName = getUserNameByUserCode(
          item.etobject.creator || item.createUser
        )
      }
      try {
        if (node.type === 'video') {
          if (item.etobject.item) {
            node.duration = item.etobject.item.length / 10000000
            node.planningguid = item.etobject.item.planningguid
            node.videostandard = item.etobject.item.videostandard
            node.framerate =
              ETGetFrameRate(item.etobject.item.videostandard) || 30
            node.ntsctcmode = item.etobject.item.ntsctcmode
            node.capturestatus = item.etobject.item.capturestatus
            node.filestatus = item.etobject.item.filestatus
            if (
              (item.etobject.item.filestatus & FileStatus.ET_Obj_FS_HA_ALL) >
                0 ||
              (item.etobject.item.filestatus & FileStatus.ET_Obj_FS_HV_ALL) > 0
            ) {
              node.HQ = true
            } else {
              node.HQ = false
            }
            if (
              (item.etobject.item.filestatus & FileStatus.ET_Obj_FS_LV_ALL) >
                0 ||
              (item.etobject.item.filestatus & FileStatus.ET_Obj_FS_LA_ALL) > 0
            ) {
              node.LQ = true
            } else {
              node.LQ = false
            }
            if (node.typeIndex === 1) {
              if (
                [1, 2, 32, 64, 128, 4096, 65536, 8192].indexOf(
                  parseInt(item.etobject.item.capturestatus)
                ) > -1
              ) {
                node.clipping = true
              } else {
                node.clipping = false
              }
              if (item.etobject.item.filestatus & FileStatus.ET_Obj_FS_WA) {
                node.WA = true
              } else {
                node.WA = false
              }
              if (
                item.etobject.item.dbestreamchannel &&
                item.etobject.item.dbestreamchannel !== 0
              ) {
                node.DB = true
              } else {
                node.DB = false
              }
              if (
                item.etobject.item.videostandard &&
                ETGetVideoStandardPI(item.etobject.item.videostandard) === 2
              ) {
                node.P = true
                node.Ptitle = ETGetFrameRate(item.etobject.item.videostandard)
              } else if (
                item.etobject.item.videostandard &&
                ETGetVideoStandardPI(item.etobject.item.videostandard) === 1
              ) {
                node.I = true
                node.Ititle = ETGetFrameRate(item.etobject.item.videostandard)
              }
              if (
                (item.etobject.item.filestatus &
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
          if (
            !node.isAudio &&
            node.filestatus &
              (FileStatus.ET_Obj_FS_LV_ALL | FileStatus.ET_Obj_FS_LV_SEG) &&
            node.filestatus &
              (FileStatus.ET_Obj_FS_LA_ALL | FileStatus.ET_Obj_FS_LA_SEG)
          ) {
            node.canGenerateProxy = !item.etobject.isseparation
            node.proxyStatus = item.etobject.isseparation ? 'V + A' : 'VA'
          }
        }
      } catch (e) {}
      if (floor) {
        node.floor = floor
      }
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
      getContextMenu(item, node)
      restrictContextMenu(item, node)
      node.selected = node.selected || false
      node.selecting = node.selecting || false
      node.dragOvering = node.dragOvering || false
      node.open = node.open || false
      node.checked = node.checked || false
      node.renaming = node.renaming || false
      node.uploading = node.uploading || false
      node.readyUpload = node.readyUpload || false
      node.cutting = node.cutting || false
      node.readonly = false
      node.children = []
      newArr.push(node)
    })
  } else {
    newArr = []
  }
  return newArr
}
export function getCheckedCode(pg, tree, flag) {
  tree.forEach(item => {
    if (item.checked && item.read && !flag) {
      pg.add(item.read)
    }
    if (item.checked && item.write && flag) {
      pg.add(item.write)
    }
    if (item.children && item.children.length) {
      getCheckedCode(pg, item.children, flag)
    }
  })
}
export function deleteMaterial(arr, data) {
  let flag = false
  let father = arr.length && arr[0].father && arr[0].father.guid
  arr.forEach(item => {
    if (item.guid === data.guid) {
      arr.remove(item)
      flag = true
      return
    }
    if (getRepository(item.guid).length || item.folders.length) {
      deleteMaterial(getRepository(item.guid), data)
      deleteMaterial(item.folders, data)
    }
  })
  flag && forceUpdate(father)
}
export function getRelations(arr) {
  return arr.map(item => {
    let node = {
      relations: [],
      name: item.entity.name,
      guid: item.entity.guid,
      folderpath: item.entity.folderpath,
      type: 'video',
      iconfilename: item.entity.iconfilename
    }
    extendData(item, node)
    return node
  })
}
export function getProperties (resultArr, materials, models, type, context, httpResArr) {
  let resFuncArr = []
  let ctrlTable = {
    'Single Line': 'rd-text',
    'Mutli Text': 'rd-textarea',
    'Multi Line': 'rd-textarea',
    'Check Box': 'rd-checkbox',
    'RadioButton': 'rd-radio',
    'Numeric': 'rd-number',
    'Dropdown': 'rd-select',
    'Date': 'rd-datepicker',
    'Time': 'vue-timepicker',
    'DateTime': 'rd-datepicker',
    'Button': 'rd-button',
    'info': 'original-list-ctrl'
  }
  let typeTable = {
    'video': 'A/V',
    'image': 'Image',
    'txtfile': 'Document',
    'word': 'Document',
    'excel': 'Document',
    'pdf': 'Document',
    'rar': 'Other',
    'project': 'Other',
    'aeproject': 'Other',
    'other': 'Other'
  }
  let volidType = {
    'Title': {
      length: 255,
      onlyLength: false
    },
    'Rights': {
      length: 256,
      onlyLength: true
    },
    'Comments': {
      length: 1000,
      onlyLength: true
    },
    'Item Name': {
      length: 50,
      onlyLength: true
    },
    'Journalist': {
      length: 50,
      onlyLength: true
    },
    'Category': {
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
  let volid = key => e => volidInput(e.target.value, volidType[key] && volidType[key].length, e.target, volidType[key] && volidType[key].onlyLength, key)
  let formatTime = (v, m) => v === undefined && ['image', 'video'].indexOf(m.type) === -1 ? '' : ['video', 'image'].indexOf(m.type) > -1 ? getTimeString(v, m.videostandard, m.ntsctcmode) : '' // util.toSmpteString((v || 0) / 10000, m.videoStandard)
  let formatFrame = (v, m) => v === undefined ? '' : GetTimeStringByFrameNum(v, m.ntsctcmode, m.videostandard)
  let tTable = {
    'default': v => v,
    'Time': {
      t: (v, m, e) => {
        let time = {}
        if (v && v.split(' ').length > 1) {
          time.value = v.split(' ')[1]
        } else {
          time.value = ''
        }
        return time
      },
      dt: (v, m, e) => {
        if (v) {
          return '1899-12-31 ' + v
        } else {
          return undefined
        }
      }
    },
    'Dropdown': {
      t: (v, m, e) => v,
      dt: (v, m, e) => v // (v, m) => e.find(i => i.description == v).name
    },
    'To be Deleted': {
      t: v => !!v,
      dt: v => v ? 1 : 0
    },
    '16:9 SD': {
      t: v => v === ImageType.ET_CLIP_IMAGETYPE_16_9SD,
      dt: v => v ? ImageType.ET_CLIP_IMAGETYPE_16_9SD : ImageType.ET_CLIP_IMAGETYPE_ORIGINAL
    },
    'HDD': {
      t: v => v,
      dt: v => v
    },
    'Archived': {
      t: v => v === 'online_deleted',
      dt: v => v ? 'online_deleted' : ''
    },
    'Address': {
      t: v => v.replace(/^global_sobey_defaultclass\/MaterialList/, 'Network'),
      dt: v => v.replace(/^Network/, 'global_sobey_defaultclass/MaterialList')
    },
    'Material Type': {
      t: (v, m) => m.isAudio ? 'Audio' : typeTable[m.type],
      dt: (v, m) => m.subType
    },
    'Planning Date': {
      t: (v, m) => v && +new Date(v) > 0 ? v : new Date().format('yyyy-MM-dd hh:mm:ss'),
      dt: (v, m) => v
    },
    'Used Space': {
      t: (v, m) => {
        if (v === 0) return '0 B'
        let k = 1024
        let sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        let i = Math.floor(Math.log(v) / Math.log(k))
        return (v / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]
      },
      dt: (v, m) => v
    },
    'Stream Channel': {
      t: (v, m) => {
        if (v & (ET_CLIP_DBE_A1 | ET_CLIP_DBE_A2)) {
          return 'S1/S1'
        } else if (v & (ET_CLIP_DBE_A3 | ET_CLIP_DBE_A4)) {
          return 'S2/S2'
        } else if (v & (ET_CLIP_DBE_A5 | ET_CLIP_DBE_A6)) {
          return 'S3/S3'
        } else if (v & (ET_CLIP_DBE_A7 | ET_CLIP_DBE_A8)) {
          return 'S4/S4'
        } else if (v === undefined) {
          return ''
        } else {
          return 'None'
        }
      },
      dt: (v, m) => v
    },
    'Total Duration': {
      t: formatTime,
      dt: (v, m) => v
    },
    'SOF(STC)': {
      t: formatTime,
      dt: (v, m) => v
    },
    'EOF': {
      t: formatTime,
      dt: (v, m) => v
    },
    'SOM': {
      t: formatTime,
      dt: (v, m) => v
    },
    'EOM': {
      t: formatTime,
      dt: (v, m) => v
    },
    'Material Duration': {
      t: formatTime,
      dt: (v, m) => v
    },
    'Modified by': {
      t: getUserNameByUserCode,
      dt: (v, m) => v
    },
    'Creator': {
      t: getUserNameByUserCode,
      dt: (v, m) => v
    },
    'Duration': {
      t: formatFrame,
      dt: (v, m) => v
    },
    'STC': {
      t: formatFrame,
      dt: (v, m) => v
    }
  }
  function addKeyValue(fileds, tab, material, data) {
    fileds.forEach(f => {
      if (f.visable) {
        let ctrl = ctrlTable[f.displaytype] || ctrlTable['Single Line']
        let readonly = f.readonly
        if (f.key) { // 有key
          let keyArr = f.key.split(',')
          if (keyArr && keyArr.length === 1) {
            let keys = keyArr[0].split('\\')
            let value = data
            keys.forEach(k => {
              if (value) {
                value = value[k]
              } else {
                value = ''
              }
            })
            let t = tTable[f.values || f.displayname] && tTable[f.values || f.displayname].t || tTable.default
            let dt = tTable[f.values || f.displayname] && tTable[f.values || f.displayname].dt || tTable.default
            if (ctrl === ctrlTable['Numeric']) {
              let fieldDetail = f.fielddetail
              let max
              let min
              let type
              if (fieldDetail) {
                max = fieldDetail.maxLen
                min = fieldDetail.minLen
                type = fieldDetail.dataType
              }
              tab.keyValues.push({
                order: f.order,
                name: f.fielddetail && f.fielddetail.alias || f.displayname,
                value: {
                  value: t(value, material),
                  step: 1, // 可选
                  min: min, // 可选
                  max: max,
                  type: type,
                  placeholder: '',
                  disabled: false
                },
                ctrl: ctrl,
                readonly: readonly,
                disabled: false,
                keys: keys,
                t: t,
                dt: dt
              })
            } else if (ctrl === ctrlTable['Single Line'] || ctrl === ctrlTable['Mutli Text']) {
              let fieldDetail = f.fielddetail
              let max
              let min
              if (fieldDetail) {
                max = fieldDetail.maxLen
                min = fieldDetail.minLen
              }
              let multiplable = false
              if (['Rights', 'Comments'].indexOf(f.displayname) > -1 || (f.displayname === 'Title' && material.type !== 'folder')) {
                multiplable = true
              } // 支持应用到所有的素材
              if (f.displayname === 'Recording Time' && readonly && value) { // 纠正Recording time 1899
                value = +new Date(value) > 0 ? value : ''
              }
              tab.keyValues.push({
                order: f.order,
                name: f.fielddetail && f.fielddetail.alias || f.displayname,
                value: t(value, material),
                limit: {
                  type: 'Length',
                  min: min,
                  max: max
                },
                multiplable: multiplable,
                multiOption: {
                  checked: false,
                  disabled: false,
                  text: 'Apply to all'
                },
                ctrl: ctrl,
                volid: volid(f.displayname),
                readonly: readonly,
                disabled: false,
                highLightHtml: material[keys[keys.length - 1] + '_hl'],
                keys: keys,
                t: t,
                dt: dt
              })
            } else if (ctrl === ctrlTable['Check Box']) {
              tab.keyValues.push({
                order: f.order,
                name: f.fielddetail && f.fielddetail.alias || f.displayname,
                value: {
                  checked: value,
                  text: f.values || f.displayname,
                  keys: keys,
                  readonly: readonly,
                  disabled: false,
                  t: t,
                  dt: dt
                },
                ctrl: ctrl,
                readonly: readonly,
                disabled: false,
                keys: keys,
                t: t,
                dt: dt
              })
            } else if (ctrl === ctrlTable['Dropdown']) {
              let items = f.fielddetail && (f.fielddetail.enumContents || f.fielddetail.fixItems) || []
              // dt = tTable['Dropdown'].dt('', material, items)
              let opt = {
                multiple: false,
                value: {},
                options: [],
                order: f.order,
                name: f.fielddetail && f.fielddetail.alias || f.displayname,
                ctrl: ctrl,
                readonly: readonly,
                highLightHtml: material[keys[keys.length - 1] + '_hl'],
                disabled: false,
                keys: keys,
                t: t,
                dt: dt
              }
              items.forEach(i => {
                opt.options.push({
                  selected: value === i.name || false,
                  disabled: false,
                  value: i.name || i,
                  name: i.name || i
                })
              })
              tab.keyValues.push(opt)
            } else if (ctrl === ctrlTable['Date']) {
              let opt = {
                value: value,
                options: {
                  timePicker: f.displaytype === 'DateTime',
                  placeHolder: 'Please select time',
                  position: 'bottom',
                  autoPosition: false,
                  quickClose: true,
                  format: 'YYYY-MM-DD HH:mm:ss', // f.displaytype === 'DateTime' ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD',
                  monthList: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                  weekList: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                },
                order: f.order,
                name: f.fielddetail && f.fielddetail.alias || f.displayname,
                readonly: readonly,
                disabled: false,
                keys: keys,
                ctrl: ctrl,
                t: t,
                dt: dt
              }
              tab.keyValues.push(opt)
            } else if (ctrl === ctrlTable['Time']) {
              t = tTable.Time.t
              dt = tTable.Time.dt
              let opt = {
                value: t(value),
                format: 'HH:mm:ss',
                order: f.order,
                name: f.fielddetail && f.fielddetail.alias || f.displayname,
                readonly: readonly,
                disabled: false,
                keys: keys,
                ctrl: ctrl,
                t: t,
                dt: dt
              }
              tab.keyValues.push(opt)
            }
          } else {
            if (ctrl === ctrlTable['Check Box']) {
              let item = {
                order: f.order,
                name: f.fielddetail && f.fielddetail.alias || f.displayname,
                value: [],
                ctrl: ctrl,
                readonly: readonly,
                disabled: false
              }
              let valueArr = f.values.split('|')
              keyArr.forEach((ka, i) => {
                let keys = ka.split('\\')
                let label = valueArr[i]
                let t = tTable[label].t
                let dt = tTable[label].dt
                let value = data
                keys.forEach(k => {
                  if (value) {
                    value = value[k]
                  } else {
                    value = ''
                  }
                })
                let ro = false
                if (label === '16:9 SD' && value === ImageType.ET_CLIP_IMAGETYPE_16_9HD) {
                  ro = true
                }
                if (label === 'Archived' || (label === '16:9 SD' && (material.type !== 'video' || material.isAudio))) {
                  ro = true
                }
                value = t(value, material)
                // 存在不能勾选编辑的情况
                item.value.push({
                  checked: value,
                  text: label,
                  keys: keys,
                  readonly: ro || readonly,
                  disabled: false,
                  t: t,
                  dt: dt
                })
                if (label === 'Archived' && value) {
                  let archiveTarget = data.entity.item.archiveTarget
                  archiveTarget && archiveTarget.forEach(n => {
                    item.value.push({
                      ctrl: 'rd-tag',
                      text: label,
                      value: n,
                      keys: keys,
                      readonly: true,
                      disabled: true,
                      t: t,
                      dt: dt
                    })
                  })
                }
              })
              tab.keyValues.push(item)
            }
          }
        } else {
          // 特殊处理没有字段的
          let t = tTable[f.displayname] && tTable[f.displayname].t || tTable.default
          let dt = tTable[f.displayname] && tTable[f.displayname].dt || tTable.default
          if (f.displayname === 'Used Space') {
            let kv = {
              order: f.order,
              name: f.fielddetail && f.fielddetail.alias || f.displayname,
              value: '',
              ctrl: ctrl,
              readonly: readonly,
              disabled: false,
              keys: '',
              t: t,
              dt: dt
            }
            context.dispatch({
              type: TYPES.GET_FILESIZE,
              source: material
            }).then(res => {
              kv.value = t(res.data.ext, material)
            })
            tab.keyValues.push(kv)
          } else if (f.displayname === 'Audio Format') {
            let kv = {
              order: f.order,
              name: f.fielddetail && f.fielddetail.alias || f.displayname,
              value: '',
              ctrl: ctrl,
              readonly: readonly,
              disabled: false,
              keys: '',
              t: t,
              dt: dt
            }
            let file
            if (data.entity && data.entity.item && data.entity.item && data.entity.item.clipfile && data.entity.item.clipfile.length) {
              file = data.entity.item.clipfile.find(item => item.qualitytype === 0 && item.clipclass === 2) || data.entity.item.clipfile.find(item => item.qualitytype === 1 && item.clipclass === 2 && item.formatid)
              if (file && file.formatid !== undefined) {
                context.dispatch({
                  type: TYPES.GET_FILEFORMAT,
                  data: {
                    formatid: file.formatid
                  }
                }).then(res => {
                  let json = res.data.ext && res.data.ext.nleformat
                  if (json) {
                    kv.value = t(JSON.parse(json).formatdesc) || ''
                  }
                })
              }
            }

            tab.keyValues.push(kv)
          } else if (f.displayname === 'Video Format') {
            let kv = {
              order: f.order,
              name: f.fielddetail && f.fielddetail.alias || f.displayname,
              value: '',
              ctrl: ctrl,
              readonly: readonly,
              disabled: false,
              keys: '',
              t: t,
              dt: dt
            }
            let file
            if (data.entity && data.entity.item && data.entity.item && data.entity.item.clipfile && data.entity.item.clipfile.length) {
              file = data.entity.item.clipfile.find(item => item.qualitytype === 0 && item.clipclass === 1) || data.entity.item.clipfile.find(item => item.qualitytype === 1 && item.clipclass === 1 && item.formatid)
              if (file && file.formatid !== undefined) {
                context.dispatch({
                  type: TYPES.GET_FILEFORMAT,
                  data: {
                    formatid: file.formatid
                  }
                }).then(res => {
                  let json = res.data.ext && res.data.ext.nleformat
                  if (json) {
                    kv.value = t(JSON.parse(json).formatdesc) || ''
                  }
                })
              } else if (material.type === 'image') {
                let f = data.entity.item.clipfile[0]
                let fileSuffix
                if (f) {
                  fileSuffix = f.filename.substring(f.filename.lastIndexOf('.') + 1).toUpperCase()
                  kv.value = fileSuffix
                }
              }
            }
            tab.keyValues.push(kv)
          } else if (f.displayname === 'SOM') {
            let kv = {
              order: f.order,
              name: f.fielddetail && f.fielddetail.alias || f.displayname,
              value: '',
              ctrl: ctrl,
              readonly: readonly,
              disabled: false,
              keys: '',
              t: t,
              dt: dt
            }
            if (data.entity && data.entity.item && data.entity.item.trimin !== undefined) {
              kv.value = t(data.entity.item.trimin + (data.entity.item.vtrin || 0), material)
            }
            tab.keyValues.push(kv)
          } else if (f.displayname === 'EOM') {
            let kv = {
              order: f.order,
              name: f.fielddetail && f.fielddetail.alias || f.displayname,
              value: '',
              ctrl: ctrl,
              readonly: readonly,
              disabled: false,
              keys: '',
              t: t,
              dt: dt
            }
            if (data.entity && data.entity.item && data.entity.item.trimout !== undefined) {
              kv.value = t(data.entity.item.trimout + (data.entity.item.vtrin || 0), material)
            }
            tab.keyValues.push(kv)
          } else if (f.displayname === 'EOF') {
            let kv = {
              order: f.order,
              name: f.fielddetail && f.fielddetail.alias || f.displayname,
              value: '',
              ctrl: ctrl,
              readonly: readonly,
              disabled: false,
              keys: '',
              t: t,
              dt: dt
            }
            if (data.entity && data.entity.item) {
              kv.value = t((data.entity.item.length || 0) + (data.entity.item.vtrin || 0), material)
            }
            tab.keyValues.push(kv)
          } else if (f.displayname === 'Material Duration') {
            let kv = {
              order: f.order,
              name: f.fielddetail && f.fielddetail.alias || f.displayname,
              value: '',
              ctrl: ctrl,
              readonly: readonly,
              disabled: false,
              keys: '',
              t: t,
              dt: dt
            }
            if (data.entity && data.entity.item && data.entity.item.trimout !== undefined && data.entity.item.trimin !== undefined) {
              kv.value = t(data.entity.item.trimout - data.entity.item.trimin, material)
            }
            tab.keyValues.push(kv)
          } else if (f.displayname === 'Edited by') {
            let kv = {
              order: f.order,
              name: f.fielddetail && f.fielddetail.alias || f.displayname,
              value: '',
              ctrl: ctrl,
              readonly: readonly,
              disabled: false,
              keys: '',
              t: t,
              dt: dt
            }
            tab.keyValues.push(kv)
          } else if (f.displayname === 'Edited on') {
            let kv = {
              order: f.order,
              name: f.fielddetail && f.fielddetail.alias || f.displayname,
              value: '',
              ctrl: ctrl,
              readonly: readonly,
              disabled: false,
              keys: '',
              t: t,
              dt: dt
            }
            tab.keyValues.push(kv)
          } else if (f.displayname === 'Input by') {
            let kv = {
              order: f.order,
              name: f.fielddetail && f.fielddetail.alias || f.displayname,
              value: data.modifyName || data.creatorName || '',
              ctrl: ctrl,
              readonly: readonly,
              disabled: false,
              keys: '',
              t: t,
              dt: dt
            }
            tab.keyValues.push(kv)
          } else if (f.displayname === 'Sequence Name') {
            let kv = {
              order: f.order,
              name: f.fielddetail && f.fielddetail.alias || f.displayname,
              value: '',
              ctrl: ctrl,
              readonly: readonly,
              disabled: false,
              keys: '',
              t: t,
              dt: dt
            }
            tab.keyValues.push(kv)
          } else if (f.displayname === 'List') {
            let value = {
              headers: [
                {
                  name: 'Attribute',
                  attr: 'attribute',
                  width: 200,
                  dragging: false,
                  checked: true,
                  resizable: true
                },
                {
                  name: 'Item',
                  attr: 'item',
                  width: 122,
                  dragging: false,
                  checked: true,
                  resizable: true
                },
                {
                  name: 'Value',
                  attr: 'value',
                  width: 122,
                  dragging: false,
                  checked: true,
                  resizable: true
                }],
              values: []
            }
            if (data.metadata && data.metadata.original && data.metadata.original.orgattribute && data.metadata.original.orgattribute.length) {
              value.values = data.metadata.original.orgattribute
            }
            let kv = {
              order: f.order,
              name: f.fielddetail && f.fielddetail.alias || f.displayname,
              value: value,
              ctrl: ctrl,
              readonly: readonly,
              disabled: false,
              keys: '',
              t: t,
              dt: dt
            }
            tab.keyValues.push(kv)
          }
        }
      }
      tab.keyValues.sort((i1, i2) => i1.order - i2.order) // 按顺序排
    })
  }
  resultArr.forEach(item => {
    let data = item.data.ext
    let entity = item.data.ext.entity
    let httpEntity = httpResArr && httpResArr.find(item => item.data.ext.entity.guid === entity.guid).data.ext.entity
    let material = materials.find(item => item.guid === entity.guid)
    let properties = []
    models.filter(i => i.visable).forEach(m => {
      if (['Planning', 'Marks', 'Rights', 'File List'].indexOf(m.displayName) === -1) {
        let tab = {
          name: m.displayName,
          order: m.order,
          keyValues: [],
          checked: true,
          dragging: false,
          width: 100,
          selected: false
        }
        addKeyValue(m.field, tab, material, data)
        if (m.displayName === 'Original Metadata') {
          let items = ['Original way', 'Odd field first', 'Even field first']
          let value = entity.item.showmode || 0

          let opt = {
            multiple: false,
            value: {},
            options: [],
            order: -1,
            name: 'Field Sequence',
            ctrl: ctrlTable['Dropdown'],
            readonly: !material.I,
            disabled: false,
            keys: ['entity', 'item', 'showmode'],
            t: tTable.default,
            dt: (v, m) => items.indexOf(v)
          }
          items.forEach((i, index) => {
            opt.options.push({
              selected: value === index || false,
              disabled: false,
              value: i,
              name: index
            })
          })
          tab.keyValues.unshift(opt)
        }
        properties.push(tab)
      } else if (['Planning'].indexOf(m.displayName) > -1) {
        let tab = {
          name: m.displayName,
          keyValues: [],
          order: m.order,
          checked: true,
          dragging: false,
          width: 100,
          selected: false
        }
        let planning = {}
        if (entity.item.planningguid) {
          context.dispatch({
            type: TYPES.GET_PLANNING_INFO,
            source: entity.item
          }).then(res => {
            console.log(res)
            planning = res.data.ext || {}
            planning && addKeyValue(m.field, tab, material, planning)
          })
        } else {
          addKeyValue(m.field, tab, material, planning)
        }
        properties.push(tab)
      } else if (['Marks', 'Rights', 'File List'].indexOf(m.displayName) > -1) {
        if (m.displayName === 'Marks') {
          properties.push(getMarkers(entity, material, type, m.order, context, httpEntity))
        } else if (m.displayName === 'File List') {
          properties.push(getFileList(entity, material, type, m.order))
        } else {
          properties.push(getRights(context, material, m.order))
        }
      } else {
        console.log('some tab do not parse')
      }
    })
    if (!models.length) {
      let tab = {
        name: 'Basic Info',
        order: 0,
        keyValues: [],
        checked: true,
        dragging: false,
        width: 100,
        selected: true
      }
      tab.keyValues.push({
        name: 'Title',
        value: material.name,
        ctrl: 'rd-text',
        readonly: true,
        disabled: false,
        keys: []
      })
      properties.push(tab)
    }
    resFuncArr.push(() => {
      delete material.properties
      Vue.set(material, 'properties', properties)
      material.properties.sort((p1, p2) => p1.order - p2.order)
    })
  })
  return resFuncArr
}
export function getTimeString (time, videostandard, ntsctcmode, framerate) {
  let vs = videostandard === undefined ? 1 : videostandard
  let ntsc = ntsctcmode === undefined ? 1 : ntsctcmode
  let tstr = GetTimeStringByFrameNum(GetFrameNumByHundredNS(time, vs, ntsc), ntsc, vs, framerate)
  let hours = tstr.substr(0, 2)
  if (parseInt(hours) > 23) {
    tstr = (parseInt(hours) % 24).fixZero() + tstr.substr(2)
  }
  return tstr
}
export function getMarkers (entity, material, type, order, context, httpEntity) {
  let markers = {
    name: 'Marks',
    keyValues: {},
    order: order,
    checked: true,
    dragging: false,
    width: 100,
    selected: false
  }
  markers.keyValues.values = getMarkerList(entity, material.vtrin, httpEntity).sort((i1, i2) => {
    return i1.keyframe - i2.keyframe
  })
  material.markers = markers.keyValues
  let clipfile = entity.item.clipfile.filter(item => item.clipclass === 1)
  let keyframeArr = []
  let groupname = 'videogroup'
  material.markers.values.filter(item => !item.icon).forEach(item => {
    let fileguid = ''
    let keytime = item.keyframe / material.framerate * 10000000
    for (let i = 0, len = clipfile.length; i < len; i++) {
      if (keytime >= clipfile[i].clipin && keytime <= clipfile[i].clipout) {
        fileguid = clipfile[i].strfileguid
        if (clipfile[i].qualitytype) {
          groupname = 'videogroup_proxy'
        }
        break
      }
    }
    if (fileguid) {
      keyframeArr.push(
        {
          fileGUID: fileguid,
          keyFrameNo: item.keyframe
        }
      )
    }
  })
  keyframeArr.length && context.dispatch({
    type: TYPES.SET_MARKER_STAMP,
    data: {
      guid: material.guid,
      groupname: groupname,
      json: keyframeArr
    }
  }).then(res => {
    console.log(res.data)
  })
  return markers
}
export function getFileList (entity, material, type, order) {
  let fileList = {
    name: 'File List',
    keyValues: {},
    order: order,
    checked: true,
    dragging: false,
    width: 100,
    selected: false
  }
  let videostandard = entity.item.videostandard
  let ntsctcmode = entity.item.ntsctcmode || 0
  let framerate = material.framerate || 30
  let dbestreamchannel = entity.item.dbestreamchannel
  fileList.keyValues.values = entity.item.clipfile
  material.fileList = entity.item.clipfile // add to material for use
  fileList.keyValues.values.forEach(item => {
    // item.filename = item.filename.replace('http:', '').replace(/\//g, '\\')
    item.displayQuality = item.qualitytype ? 'Low' : 'High'
    item.displayTrack = dbestreamchannel && item.clipclass !== ET_CLIP_CLASS_V && (dbestreamchannel & (item.clipclass >> 1)) ? getdbeTrack(item.clipclass) : '' || getclipclassType(item.clipclass)
    item.displayPassage = dbestreamchannel && item.clipclass !== ET_CLIP_CLASS_V && (dbestreamchannel & (item.clipclass >> 1)) ? getDbePassage(item.clipclass) : '' || getChannelType(item.mediachannel)
    item.displayIn = getTimeString(item.clipin, videostandard, ntsctcmode, framerate)
    item.displayOut = getTimeString(item.clipout, videostandard, ntsctcmode, framerate)
    item.displayEOF = getTimeString(item.fileout, videostandard, ntsctcmode, framerate)
    item.displaySOF = getTimeString(item.filein, videostandard, ntsctcmode, framerate)
    if ([ET_CLIP_CLASS_CC, ET_CLIP_CLASS_KEY, ET_CLIP_CLASS_TC, ET_CLIP_CLASS_G, ET_CLIP_CLASS_CLIP].indexOf(item.clipclass) > -1 || material.type === 'image') {
      item.displayQuality = ''
    // item.displayPassage = ''
    }
    if (['video', 'image'].indexOf(material.type) === -1) {
      item.displayQuality = ''
      item.displayTrack = ''
      item.displayPassage = ''
      item.displayIn = ''
      item.displayOut = ''
      item.displayEOF = ''
      item.displaySOF = ''
    }
  })
  fileList.keyValues.headers = [
    {
      name: 'File Name',
      attr: 'filename',
      width: 200,
      dragging: false,
      checked: true,
      resizable: true
    },
    {
      name: 'Quality',
      attr: 'displayQuality',
      width: 50,
      dragging: false,
      checked: true,
      resizable: true
    },
    {
      name: 'Track',
      attr: 'displayTrack',
      width: 50,
      dragging: false,
      checked: true,
      resizable: true
    },
    {
      name: 'Passage',
      attr: 'displayPassage',
      width: 50,
      dragging: false,
      checked: true,
      resizable: true
    },
    {
      name: 'In',
      attr: 'displayIn',
      width: 100,
      dragging: false,
      checked: true,
      resizable: true
    }, {
      name: 'Out',
      attr: 'displayOut',
      width: 100,
      dragging: false,
      checked: true,
      resizable: true
    }, {
      name: 'SOF',
      attr: 'displaySOF',
      width: 100,
      dragging: false,
      checked: true,
      resizable: true
    }, {
      name: 'EOF',
      attr: 'displayEOF',
      width: 100,
      dragging: false,
      checked: true,
      resizable: true
    }
  ]
  return fileList
}
export function getRights (context, material, order) {
  let deptTree1 = getDepTree(context.state.deptArr)
  let deptTree2 = getDepTree(context.state.deptArr)
  let rights = {
    name: 'Rights',
    keyValues: {},
    order: order,
    checked: true,
    dragging: false,
    width: 100,
    selected: false
  }
  context.dispatch({
    type: TYPES.IS_PERMISSION,
    source: material
  }).then(res => {
    let permission = res.data.ext
    let isWrite = false
    if (permission.privilege && permission.privilege.startsWith('public')) {
      rights.keyValues.access.forEach(i => i.disabled = true)
      // rights.keyValues.readonly = false
      rights.keyValues.radio[0].checked = true
    } else if (permission.privilegeUserGroup && permission.privilegeUserGroup.length) {
      permission.privilegeUserGroup.forEach(code => {
        isWrite = checkDepTree(deptTree2, code, true) || isWrite
        checkDepTree(deptTree1, code) // only access
      })
      rights.keyValues.radio[2].checked = true
      if (isWrite) {
        rights.keyValues.access[1].checked = true
      } else {
        rights.keyValues.access[0].checked = true
      }
    // rights.keyValues.access.forEach(item => item.disabled = false)
    } else if (permission.privilege && permission.privilege.startsWith('private')) {
      rights.keyValues.access.forEach(i => i.disabled = true)
      rights.keyValues.radio[1].checked = true
    } else {
      // cannot editing
      rights.keyValues.radio[0].checked = true
    // rights.keyValues.readonly = true
    }
    if (context.state.userInfo.roleType === 1 || state.userInfo.usercode === material.creatorCode || material.creatorCode === (state.userInfo.nickname || state.userInfo.loginname.replace(/.*\\(.*)/g, '$1')) || permission.privilege.startsWith('public') || permission.privilege === state.userInfo.privilege || (isWrite && getcurrentDepts(context.state.userInfo.usercode, context.state.userArr, context.state.deptArr).some(item => permission.privilegeUserGroup.indexOf(item.privilege_write_group_code) > -1))) {
      rights.keyValues.readonly = false
      material.readonly = false
    // if (!context.state.userInfo.roleType) {
    //   // if (material.type === 'folder') {
    //   //   context.state.userInfo.permission.indexOf(PERMISSION.MODIFY_FOLDER) === -1 && (material.readonly = true)
    //   // } else if (material.type === 'h5pgm' || material.type === 'sequence') {
    //   //   context.state.userInfo.permission.indexOf(PERMISSION.MODIFY_EDL) === -1 && (material.readonly = true)
    //   // } else {
    //   //   context.state.userInfo.permission.indexOf(PERMISSION.MODIFY_OBJ) === -1 && (material.readonly = true)
    //   // }
    // }
    } else {
      rights.keyValues.readonly = true
      material.readonly = true
    }
    if (material.father && material.father.guid === '86023a7e3f2646a2bbee8a9fec7e6bcb') { // 根目录下文件夹
      rights.keyValues.readonly = true
      material.readonly = true
    }
  })
  rights.keyValues.radio = [
    {
      checked: false,
      value: 'Public',
      disabled: false,
      privilege: 'public'
    },
    {
      checked: false,
      value: 'Private',
      disabled: false,
      privilege: context.state.userInfo.privilege // 跟ML一致，修改时私有权限为修改者
    },
    {
      checked: false,
      value: 'Condition',
      disabled: false
    }
  ]
  rights.keyValues.access = [
    {
      checked: false,
      value: 'Access',
      disabled: true,
      deptTree: deptTree1
    },
    {
      checked: false,
      value: 'Access&Write',
      disabled: true,
      deptTree: deptTree2
    }
  ]
  rights.keyValues.checkbox = {
    checked: false,
    disabled: false,
    text: 'Also apply the setting to all subfoders and files.'
  }
  rights.keyValues.multiplable = true
  rights.keyValues.multiOption = {
    checked: false,
    disabled: false,
    text: 'Apply to all'
  }
  rights.keyValues.type = material.type
  // rights.keyValues.deptTree = deptTree
  return rights
}
export function getDepTree (depArr) {
  let tree
  let rootDepts = depArr.filter(item => item.dept.superid === -1)
  if (rootDepts.length) {
    tree = []
    rootDepts.forEach(item => {
      let t = {}
      let node = item.dept || item
      t.expand = false
      t.checked = false
      t.title = node.deptname
      t.key = 'root'
      t.children = []
      tree.push(t)
      bl(t.children, node.childdept || [])
    })
  } else {
    tree = [{
      expand: false,
      checked: false,
      title: 'All',
      key: 'root',
      children: []
    }]
    bl(tree[0].children, depArr)
  }
  function bl(children, Arr) {
    Arr.forEach(item => {
      let node = item.dept || item
      let t = {}
      t.expand = false
      t.checked = false
      t.title = node.deptname
      t.key = node.deptid
      t.read = node.privilege_read_group_code
      t.write = node.privilege_write_group_code
      t.children = []
      children.push(t)
      if (node.childdept && node.childdept.length) {
        bl(t.children, node.childdept)
      }
    })
  }
  return tree
}
export function checkDepTree (tree, code, onlyWrite) {
  let isWrite = false
  tree.forEach(item => {
    if (item.read === code && !onlyWrite) {
      item.checked = true
    }
    if (item.write === code) {
      item.checked = true
      isWrite = true
    }
    if (item.children && item.children.length) {
      isWrite = checkDepTree(item.children, code, onlyWrite) || isWrite
      item.children && item.children.every(i => i.checked) && (item.checked = true, 0)
    }
  })
  return isWrite
}
export function getTrashcanPreviewInfo (resultArr, fileListArr, materials, type, context) {
  let source = []

  resultArr.forEach((item, index) => {
    let entity = item.data.ext.resultList
    if (entity && entity.length) {
      entity = entity[0]
      let material = materials.find(item => item.guid === entity.contentId)
      material.canPreview = true
      let o = fileListArr[index].data.ext.entity
      let i = o.item
      Object.assign(i, entity.etobject.item)
      Object.assign(o, entity.etobject)
      o.item = i
      o.guid = material.guid
      o.name = material.name
    }
  })
  source = getPreviewInfo(fileListArr, materials, type, context)
  source.forEach((item, index) => {
    item.operations = ['FullScreen']
  })
  return source
}

export function getPreviewInfo(resultArr, materials, type, context) {
  let source = []
  resultArr.forEach(item => {
    let entity = item.data.ext.entity
    let material = materials.find(item => item.guid === entity.guid)
    let framerate = 30
    if (entity.item && entity.item.videostandard !== undefined) {
      framerate = ETGetFrameRate(entity.item.videostandard) || 30
      material.videostandard = entity.item.videostandard // 同步帧率，采集中素材这个值可能会变
      material.strimin = (entity.item.trimin / 10000000).fix(7)
      material.strimout = (entity.item.trimout / 10000000).fix(7)
    } else {
      material.videostandard = material.videostandard || 32
    }
    material.canPreview = true
    if (material.type === 'video') {
      material.otcIndex = 0
      material.lastOtcIndex = 1
      material.maxLTCOffset = 0
      material.maxVITCOffset = 0
      material.vtrin = (entity.item.vtrin / 10000000).fix(7)
      // if (material.LTCItem && material.LTCItem.length && material.VITCItem && material.VITCItem.length) {
      //   //存在就不更新
      // } else {
      material._LTCItem = []
      material._VITCItem = []
      material.otcfiles = []
      let funcArr = []
      entity.item.clipfile && entity.item.clipfile.filter(item => item.clipclass === 2097152 && item.filename && item.filename.indexOf('.otc')).forEach((item, index) => {
        material.otcfiles.push(item)
        funcArr.push(() => {
          material.otcIndex++
          material.otcfilein = material.otcfilein !== undefined ? material.otcfilein : ((item.filein / 10000000).fix(7) || 0)
          return getTimeCodeInfo(context, material, item, material.otcIndex, entity.item.videostandard, entity.item.ntsctcmode)
        })
      })
      sync(funcArr).then(res => {
        material._LTCItem.sort(function(a, b) {
          return b.offset - a.offset
        })
        material._VITCItem.sort(function(a, b) {
          return b.offset - a.offset
        })
        ltcRepository[material.guid] = material._LTCItem
        material._LTCItem = []
        // material.LTCItem = material._LTCItem
        // material.VITCItem = material._VITCItem
        vitcRepository[material.guid] = material._VITCItem
        material._VITCItem = []
        material.tcUpdate++
      }) // 同步执行
    // }
    }
    let lowBitrateArr = getLowBitrate(entity, framerate)
    if (item.data.ext.streammedia && item.data.ext.streammedia.length) {
      // https中 替换pdf的预览
      item.data.ext.streammedia.filter(i => i.clipclass === 1 || i.clipclass === undefined).forEach(i => {
        let httpspath = i.filename || i.filepath
        source.push({
          src: encodeUrl(httpspath),
          start: (i.filein / 10000000).fix(7) || 0,
          end: (i.fileout / 10000000).fix(7) || ((entity.item.length || 0) / 10000000).fix(7),
          in: (i.clipin / 10000000).fix(7) || 0,
          out: (i.clipout / 10000000).fix(7) || ((entity.item.length || 0) / 10000000).fix(7),
          name: entity.name,
          video: {},
          guid: entity.guid,
          // markers: markerList,
          framerate: framerate,
          videostandard: entity.item.videostandard,
          buffered: 0,
          ntsctcmode: entity.item.ntsctcmode ? entity.item.ntsctcmode : 0
        })
      })
    } else if (lowBitrateArr.length) {
      lowBitrateArr.sort((item1, item2) => item1.in - item2.in)
      source.push(...lowBitrateArr)
    } else {
      source.push({
        src: require('../assets/images/' + (material.type === 'video' ? 'cannotpreview' : material.bgtype) + '.png'),
        name: entity.name,
        text: 'online preview is not supported for this file',
        guid: entity.guid,
        video: {}
      // markers: markerList
      })
      material.canPreview = false
    }
  })
  source.forEach((item, index) => {
    let fileSuffix = item.src.substring(item.src.lastIndexOf('.') + 1, item.src.lastIndexOf('?') > -1 ? item.src.lastIndexOf('?') : undefined).toLowerCase()
    let material = materials.find(i => i.guid === item.guid)
    if (['mp3', 'mp4', 'mpd', 'png'].indexOf(fileSuffix) === -1 && material.type === 'video') {
      material.canPreview = false
      item.src = require('../assets/images/cannotpreview.png')
      item.text = 'online preview is not supported for this file'
    }
    item.index = index
    item.operations = ['Set Frame', 'Save Picture', 'FullScreen']
    if (item.src.startsWith('http://') && document.location.protocol === 'https:') {
      let purename = item.src.substring(item.src.indexOf('http://') + 7)
      purename = purename.substring(purename.indexOf('/'))
      item.src = URLCONFIG.PREVIEWHTTPS + purename
    }
  })
  return source
}
export function getLowBitrate (entity, framerate) {
  let lowBitrateArr = []
  if (entity && entity.item && entity.item.clipfile) {
    entity.item.clipfile.forEach(item => {
      if (item.clipclass === 1 && item.qualitytype === 1) {
        item.filename && lowBitrateArr.push({
          src: encodeUrl(item.filename),
          start: (item.filein / 10000000).fix(7),
          end: (item.fileout / 10000000).fix(7),
          in: (item.clipin / 10000000).fix(7),
          out: (item.clipout / 10000000).fix(7),
          name: entity.name,
          video: {},
          guid: entity.guid,
          framerate: framerate,
          videostandard: entity.item.videostandard,
          buffered: 0,
          ntsctcmode: entity.item.ntsctcmode ? entity.item.ntsctcmode : 0
        })
      }
    })
    let item = entity.item.clipfile.find(item => item.clipclass === 2 && item.qualitytype === 1)
    if (!lowBitrateArr.length && item && entity.subtype === 4) { // 音频
      item.filename && lowBitrateArr.push({
        src: encodeUrl(item.filename),
        start: 0,
        end: item.fileout / 10000000,
        in: item.clipin / 10000000,
        out: item.clipout / 10000000,
        name: entity.name,
        video: {},
        guid: entity.guid,
        framerate: framerate,
        videostandard: entity.item.videostandard,
        buffered: 0,
        ntsctcmode: entity.item.ntsctcmode ? entity.item.ntsctcmode : 0
      })
    }
    item = entity.item.clipfile[0]
    if (!lowBitrateArr.length && item && entity.subtype === 32) { // 图片
      item.filename && lowBitrateArr.push({
        src: encodeUrl(item.filename),
        start: 0,
        end: item.fileout / 10000000,
        in: item.clipin / 10000000,
        out: item.clipout / 10000000,
        name: entity.name,
        video: {},
        guid: entity.guid,
        framerate: framerate,
        buffered: 0
      })
    }
  }
  return lowBitrateArr
}
export function encodeUrl (str) {
  return getIconFilename(str)
}
export function getTimeCodeInfo (context, material, clipfile, otcIndex, videoStandard, NtscTcMode) {
  return new Promise((resolve, reject) => {
    let url = clipfile.filename
    let fileinFrame = parseInt(GetFrameNumByHundredNS(parseInt(clipfile.filein), videoStandard, NtscTcMode))
    let clipinFrame = parseInt(GetFrameNumByHundredNS(parseInt(clipfile.clipin), videoStandard, NtscTcMode))
    let clipoutFrame = parseInt(GetFrameNumByHundredNS(parseInt(clipfile.clipout), videoStandard, NtscTcMode))
    context.dispatch({
      type: TYPES.GET_TIMECODE_INFO,
      data: {
        url: decodeURIComponent(url)
      }
    }).then(res => {
      let data = JSON.parse(res.R)
      if (data.status !== 1) {
        let _OTCFileRoot = data.OTCFileRoot
        if (_OTCFileRoot) {
          if (_OTCFileRoot.LTC && _OTCFileRoot.LTC[0] && _OTCFileRoot.LTC[0].LTCItem) {
            // LTC
            let arrLTCData = _OTCFileRoot.LTC[0].LTCItem
            let bFirst = true
            let tcCount = 0
            for (let k = 0, l = arrLTCData.length; k < l; ++k) {
              if (arrLTCData[k].offset < fileinFrame) continue
              if (bFirst && arrLTCData[k].offset > fileinFrame) {
                let tc = {
                  offset: clipinFrame,
                  ntc: -1
                }
                let bStill = false
                for (let j = k - 1; j >= 0; --j) {
                  if (arrLTCData[j].ntc === -2) {
                    bStill = true
                  } else if (arrLTCData[j].ntc === -1) {
                    tc.ntc = -1
                    break
                  } else {
                    tc.ntc = arrLTCData[j].ntc + (bStill ? 0 : fileinFrame - arrLTCData[j].offset)
                    break
                  }
                }
                material._LTCItem.push(tc)
                tcCount++
              }
              let tc = {
                offset: arrLTCData[k].offset - fileinFrame + clipinFrame,
                ntc: arrLTCData[k].ntc
              }
              material._LTCItem.push(tc)
              tcCount++
              bFirst = false
            }
            let LTCCount = arrLTCData.length
            if (bFirst && LTCCount > 0 && tcCount <= 0) {
              let tc = {
                offset: clipinFrame,
                ntc: -1
              }
              let bStill = false
              for (let j = LTCCount - 1; j >= 0; --j) {
                if (arrLTCData[j].ntc === -2) {
                  bStill = true
                } else if (arrLTCData[j].ntc === -1) {
                  tc.ntc = -1
                  break
                } else {
                  tc.ntc = arrLTCData[j].ntc + (bStill ? 0 : fileinFrame - arrLTCData[j].offset)
                  break
                }
              }
              material._LTCItem.push(tc)
              if (arrLTCData[LTCCount - 1].ntc === -2) {
                tc = {
                  offset: arrLTCData[LTCCount - 1].offset + clipinFrame,
                  ntc: arrLTCData[LTCCount - 1].ntc
                }
                material._LTCItem.push(tc)
              }
            }
            if (material._LTCItem.length > 0) {
              if (otcIndex === material.otcfiles.length || material.otcfiles[otcIndex].clipin > clipfile.clipout) {
                let tc = {
                  offset: clipoutFrame,
                  ntc: -1
                }
                material._LTCItem.push(tc)
              }
            }
          }
          if (_OTCFileRoot.VITC && _OTCFileRoot.VITC[0] && _OTCFileRoot.VITC[0].VITCItem) {
            let arrVITCData = _OTCFileRoot.VITC[0].VITCItem
            let bFirst = true
            let tcCount = 0
            for (let k = 0, l = arrVITCData.length; k < l; ++k) {
              if (arrVITCData[k].offset < fileinFrame) continue
              if (bFirst && arrVITCData[k].offset > fileinFrame) {
                let tc = {
                  offset: clipinFrame,
                  ntc: -1
                }
                let bStill = false
                for (let j = k - 1; j >= 0; --j) {
                  if (arrVITCData[j].ntc === -2) {
                    bStill = true
                  } else if (arrVITCData[j].ntc === -1) {
                    tc.ntc = -1
                    break
                  } else {
                    tc.ntc = arrVITCData[j].ntc + (bStill ? 0 : fileinFrame - arrVITCData[j].offset)
                    break
                  }
                }
                material._VITCItem.push(tc)
                tcCount++
              }
              let tc = {
                offset: arrVITCData[k].offset - fileinFrame + clipinFrame,
                ntc: arrVITCData[k].ntc
              }
              material._VITCItem.push(tc)
              bFirst = false
              tcCount++
            }
            let VITCCount = arrVITCData.length
            if (bFirst && VITCCount > 0 && tcCount <= 0) {
              let tc = {
                offset: clipinFrame,
                ntc: -1
              }
              let bStill = false
              for (let j = VITCCount - 1; j >= 0; --j) {
                if (arrVITCData[j].ntc === -2) {
                  bStill = true
                } else if (arrVITCData[j].ntc === -1) {
                  tc.ntc = -1
                  break
                } else {
                  tc.ntc = arrVITCData[j].ntc + (bStill ? 0 : fileinFrame - arrVITCData[j].offset)
                  break
                }
              }
              material._VITCItem.push(tc)
              if (arrVITCData[VITCCount - 1].ntc === -2) {
                tc = {
                  offset: clipinFrame + 1,
                  ntc: arrVITCData[VITCCount - 1].ntc
                }
                material._VITCItem.push(tc)
              }
            }
            if (material._VITCItem.length > 0) {
              if (otcIndex === material.otcfiles.length || material.otcfiles[otcIndex].clipin > clipfile.clipout) {
                let tc = {
                  offset: clipoutFrame,
                  ntc: -1
                }
                material._VITCItem.push(tc)
              }
            }
          }
          resolve()
        }
      }
    }).catch(res => {
      console.log(res)
      reject(res)
    })
  })
}
