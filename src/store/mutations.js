import TYPES from '../dicts/mutationTypes.js'
import * as util from '../lib/util.js'
import { getRepository, setRepository } from '../data/repository.js'
import $ from 'jquery'
export default {
  [TYPES.SET_USERINFO](state, payload) {
    state.userInfo = payload.data
    util.setCookie('userInfo', JSON.stringify(state.userInfo))
  },
  [TYPES.SET_APPDATA](state, payload) {
    state.listSymbol = util.getValue(payload.data.listSymbol, state.listSymbol)
    state.listOrder = util.getValue(payload.data.listOrder, state.listOrder)
    state.sortType = util.getValue(payload.data.sortType, state.sortType)
    state.TYPESymbol = util.getValue(payload.data.TYPESymbol, state.TYPESymbol)
    state.sortSymbol = util.getValue(payload.data.sortSymbol, state.sortSymbol)
  },
  [TYPES.SET_DVPADDING](state, payload) {
    let width = document.body.clientWidth
    let height = document.body.clientHeight
    let videoWidth = Math.max(width - 640, 0)
    let videoHeight = (videoWidth * 9) / 16
    state.dvStyle.padding = Math.max((height - 110 - videoHeight) / 2, 0) // 110 is player toolbar height
    state.dvStyle.width = videoWidth
    state.dvStyle.height = videoHeight
  },
  [TYPES.SET_MENUSTATUS](state, payload) {
    state.menuStatus = payload.data.status
    if (payload.data.event) {
      state.mousePosition.x = payload.data.event.clientX
      state.mousePosition.y = payload.data.event.clientY
    }
  },
  [TYPES.EXPAND_FOLDER](state, payload) {
    payload.target.open = true
  },
  [TYPES.CLOSE_FOLDER](state, payload) {
    payload.target.open = false
  },
  [TYPES.TOGGLE_FOLDER](state, payload) {
    payload.target.open = !payload.target.open
  },
  [TYPES.SET_MATERIALS](state, payload) {
    var arr = []
    for (let i of Object.getOwnPropertySymbols(state.eventArray)) {
      if (
        state.eventArray[i] &&
        [TYPES.RESTORE, TYPES.DELETE, TYPES.RECYCLE].indexOf(
          state.eventArray[i].type
        ) > -1
      ) {
        arr.push(...state.eventArray[i].target.map(item => item.guid))
      }
    } // 处理正在删除的素材，如果处于任务列表之中就不加载
    if (arr.length) {
      payload.data = payload.data.filter(item => arr.indexOf(item.guid) === -1)
    }
    var uploadingMaterials = getRepository(payload.target.guid).filter(
      item => item.uploading || !item.guid || item.waiting
    )
    var unSameFolders = payload.target.folders.filter(
      item => item.open || item.folders.length
    ) // 展开了或者有子目录的folders
    if (unSameFolders.length) {
      payload.data.forEach(item => {
        var same = unSameFolders.find(i => i.guid === item.guid)
        if (same) {
          item.open = same.open
          item.folders = same.folders
          unSameFolders.remove(same)
          // util.setRepository(item.guid, same.guid)
          // Object.assign(item, same)
        }
      })
    }
    setRepository(
      payload.target.guid,
      payload.data.filter(item => item.typeid !== '32' || item.subtype !== 256)
    ) // 过滤nova生成的素材
    getRepository(payload.target.guid).push(...uploadingMaterials)
    util.forceUpdate(payload.target.guid)
    // payload.target.children = payload.data
    // payload.target.children.push(...uploadingMaterials)
    // 更新folder
    payload.target.folders = getRepository(payload.target.guid).filter(
      item => item.type === 'folder'
    )
    payload.target.hasGetChild = true
    payload.target.hasGetFolder = true
  },
  [TYPES.SET_FOLDERS](state, payload) {
    var arr = []
    for (let i of Object.getOwnPropertySymbols(state.eventArray)) {
      if (
        state.eventArray[i] &&
        [TYPES.RESTORE, TYPES.DELETE, TYPES.RECYCLE].indexOf(
          state.eventArray[i].type
        ) > -1
      ) {
        arr.push(...state.eventArray[i].target.map(item => item.guid))
      }
    } // 处理正在删除的素材，如果处于任务列表之中就不加载
    if (arr.length) {
      payload.data = payload.data.filter(item => arr.indexOf(item.guid) === -1)
    }
    var uploadingMaterials = getRepository(payload.target.guid).filter(
      item => item.type === 'folder' && (!item.guid || item.waiting)
    )
    payload.target.folders = payload.data
    payload.target.folders.push(...uploadingMaterials)
    payload.target.hasGetFolder = true
  },
  [TYPES.GET_NAVPATH](state, payload) {
    state.signIndex = 0
    state.selectedMaterials.forEach(item => {
      item.selected = false
      item.selecting = false
    })
    state.selectedMaterials = []
    if (state.navPath.length) {
      state.navPath[state.navPath.length - 1].selected = false
      state.navPath[state.navPath.length - 1].checked = false
    }

    if (state.selectedNode) {
      state.lastSeletedNode.selected = false
      state.lastSeletedNode.checked = false
    }
    if (state.selectedNode) {
      state.selectedNode.checked = false
      state.selectedNode.selected = false
    }
    if (payload.linkNode) {
      payload.linkNode.checked = true
      state.selectedNode = payload.linkNode
    } else {
      payload.target.checked = true
      state.selectedNode = payload.target
    }
    state.navPath.length = 0
    util.getHistories(payload.target, state.navPath)
    var currentNode = state.navPath[state.navPath.length - 1]
    var width = $('#resourceList').width()
    var len = getRepository(currentNode.guid).length
    state.thumbPadding = util.getPadding(
      width,
      state.thumbnailStyle.width * state.scaleTime,
      len
    )
    state.isMarker = false
    var lastVisit = util.getCookie('last_visit' + state.userInfo.usercode)
    if (lastVisit) {
      lastVisit = JSON.parse(lastVisit)
    } else {
      lastVisit = {}
    }

    util.setCookie(
      'last_visit' + state.userInfo.usercode,
      JSON.stringify({
        path: currentNode.path,
        guid: currentNode.guid,
        condition: currentNode.condition,
        templateId: currentNode.templateId,
        listSymbol: state.listSymbol,
        listOrder: lastVisit.listOrder || state.listOrder,
        sortType: lastVisit.sortType || state.sortType,
        TYPESymbol: lastVisit.TYPESymbol || state.TYPESymbol,
        sortSymbol: lastVisit.sortSymbol || state.sortSymbol,
        selectedMaterial: state.selectedMaterials.map(item => item.guid)
      })
    )
    if ([1, 2, -1, 0].indexOf(currentNode.guid) > -1) {
      if (len && getRepository(currentNode.guid)[0].type === 'marker') {
        state.isMarker = true
      }
      $('.advance_search')
        .attr('disabled', 'disabled')
        .css('background-color', '#3e3e3e')
        .addClass('transparentHover')
    } else {
      $('.advance_search')
        .removeAttr('disabled')
        .css('background-color', '#292929')
        .removeClass('transparentHover')
    }
  },
  [TYPES.GET_NAVPATH](state, payload) {
    state.signIndex = 0
    state.selectedMaterials.forEach(item => {
      item.selected = false
      item.selecting = false
    })
    state.selectedMaterials = []
    if (state.navPath.length) {
      state.navPath[state.navPath.length - 1].selected = false
      state.navPath[state.navPath.length - 1].checked = false
    }

    if (state.selectedNode) {
      state.lastSeletedNode.selected = false
      state.lastSeletedNode.checked = false
    }
    if (state.selectedNode) {
      state.selectedNode.checked = false
      state.selectedNode.selected = false
    }
    if (payload.linkNode) {
      payload.linkNode.checked = true
      state.selectedNode = payload.linkNode
    } else {
      payload.target.checked = true
      state.selectedNode = payload.target
    }
    state.navPath.length = 0
    util.getHistories(payload.target, state.navPath)
    var currentNode = state.navPath[state.navPath.length - 1]
    var width = $('#resourceList').width()
    var len = getRepository(currentNode.guid).length
    /* if (currentNode.guid !== 1 && currentNode.guid !== 2) {
      if (currentNode.guid === -1) {
        len = currentNode.favorites.length
      } else {
        len = currentNode.children.length
      }
    } else {
      len = currentNode.searchResult.length
    } */
    state.thumbPadding = util.getPadding(
      width,
      state.thumbnailStyle.width * state.scaleTime,
      len
    )
    state.isMarker = false
    var lastVisit = util.getCookie('last_visit' + state.userInfo.usercode)
    if (lastVisit) {
      lastVisit = JSON.parse(lastVisit)
    } else {
      lastVisit = {}
    }

    util.setCookie(
      'last_visit' + state.userInfo.usercode,
      JSON.stringify({
        path: currentNode.path,
        guid: currentNode.guid,
        condition: currentNode.condition,
        templateId: currentNode.templateId,
        listSymbol: state.listSymbol,
        listOrder: lastVisit.listOrder || state.listOrder,
        sortType: lastVisit.sortType || state.sortType,
        TYPESymbol: lastVisit.TYPESymbol || state.TYPESymbol,
        sortSymbol: lastVisit.sortSymbol || state.sortSymbol,
        selectedMaterial: state.selectedMaterials.map(item => item.guid)
      })
    )
    if ([1, 2, -1, 0].indexOf(currentNode.guid) > -1) {
      if (len && getRepository(currentNode.guid)[0].type === 'marker') {
        state.isMarker = true
      }
      $('.advance_search')
        .attr('disabled', 'disabled')
        .css('background-color', '#3e3e3e')
        .addClass('transparentHover')
    } else {
      $('.advance_search')
        .removeAttr('disabled')
        .css('background-color', '#292929')
        .removeClass('transparentHover')
    }
  },
  [TYPES.GET_SEARCHMODEL](state, payload) {
    var newArr = []
    payload.data.forEach(item => {
      item.guid = 2
      // item.searchResult = []
      item.children = []
      item.folders = []
      item.floor = payload.target.floor + 1
      item.father = payload.target
      item.type = 'folder'
      item.selected = false
      item.checked = false
      item.selecting = false
      item.cutting = false
      item.operations = ['Rename', 'Delete', 'Show OA File']
      item.path = payload.target.path + '/' + item.name
      item.icon = 'searchresult_template_icon'
      newArr.push(item)
    })
    payload.target.searchModel = newArr
  },
  [TYPES.SET_ALWAYSGET](state, payload) {
    state.alwaysGet = payload.data
  },
  [TYPES.SET_ORDERTYPE](state, payload) {
    if (
      ['totalDuration', 'length', 'trimin', 'trimout'].indexOf(
        payload.data.type
      ) > -1
    ) {
      payload.data.type = 'f' + payload.data.type
    }
    state.listOrder = payload.data
    var lastVisit = util.getCookie('last_visit' + state.userInfo.usercode)
    if (lastVisit) {
      lastVisit = JSON.parse(lastVisit)
      lastVisit.listOrder = state.listOrder
      util.setCookie(
        'last_visit' + state.userInfo.usercode,
        JSON.stringify(lastVisit)
      )
    }
  },
  [TYPES.SET_HEADERFILTER](state, payload) {
    state.headers.forEach((item, index) => {
      if (payload.data.indexOf(index) > -1) {
        item.checked = true
      } else {
        item.checked = false
      }
    })
    util.setCookie(
      'item_headers' + state.userInfo.usercode,
      JSON.stringify(state.headers)
    )
  },
  [TYPES.SWAP_HEADERITEMS](state, payload) {
    state.headers.remove(payload.data.item)
    state.headers.splice(payload.data.index, 0, payload.data.item)
  },
  [TYPES.SET_HEADERS](state, payload) {
    state.headers = util.mergeHeader(payload.data, state.headers)
  },
  [TYPES.SET_SVMARKERS](state, payload) {
    state.svMarkerList = payload.data
  },
  [TYPES.SET_THUMBPADDING](state, payload) {
    setTimeout(() => {
      var width = $('#resourceList').width()
      var currentNode = state.navPath[state.navPath.length - 1]
      var len = getRepository(currentNode.guid).length
      state.thumbPadding = util.getPadding(
        width,
        state.thumbnailStyle.width * state.scaleTime,
        len
      )
    }, 300)
  },
  [TYPES.SET_DVPADDING](state, payload) {
    var width = document.body.clientWidth
    var height = document.body.clientHeight
    var videoWidth = Math.max(width - 640, 0)
    var videoHeight = (videoWidth * 9) / 16
    state.dvStyle.padding = Math.max((height - 110 - videoHeight) / 2, 0)
    state.dvStyle.width = videoWidth
    state.dvStyle.height = videoHeight
  },
  [TYPES.NEXT_ITEM](state, payload) {
    var node = util.getNextItem(payload.source)
    if (state.selectedNode) {
      state.selectedNode.checked = false
    } else {
      state.navPath[state.navPath.length - 1].checked = false
    }
    if (node) {
      state.selectedNode = node
    } else {
      var index = state.nodes.indexOf(util.getTopFather(state.selectedNode))
      state.selectedNode =
        state.nodes[Math.min(index + 1, state.nodes.length - 1)]
    }

    /* else if (payload.source.guid === 1 && state.nodes.length > 2) {
      state.selectedNode = state.nodes[2]
    } else if (payload.source.guid !== -1) {
      state.selectedNode = state.nodes[1]
    } */
    if (state.selectedNode) {
      state.selectedNode.checked = true
    }
  },
  [TYPES.PREV_ITEM](state, payload) {
    var node = util.getPrevItem(payload.source)
    if (state.selectedNode) {
      state.selectedNode.checked = false
    } else {
      state.navPath[state.navPath.length - 1].checked = false
    }
    if (node) {
      state.selectedNode = node
    } else {
      var index = state.nodes.indexOf(util.getTopFather(state.selectedNode))
      if (index > 0) {
        state.selectedNode = util.getBottomChild(state.nodes[index - 1])
      } else {
        state.selectedNode = state.nodes[0]
      }
    }
    /* else if (payload.source.guid === -1) {
     state.selectedNode = util.getLastItem(state.nodes[1])
    } else if (payload.source.guid === 1) {
     state.selectedNode = util.getLastItem(state.nodes[0])
    } */
    if (state.selectedNode) {
      state.selectedNode.checked = true
    }
  },
  [TYPES.SET_MENUSTATUS](state, payload) {
    state.menuStatus = payload.data.status
    if (payload.data.event) {
      state.mousePosition.x = payload.data.event.clientX
      state.mousePosition.y = payload.data.event.clientY
    }
  },
  [TYPES.PUSH_EVENT](state, payload) {
    state.eventArray[payload.symbol] = payload.data
    payload.data.time = new Date().format('yyyy-MM-dd hh:mm:ss')
    payload.data.status = 'Excuting'
    payload.data.name = util.getValue(
      payload.data.data && payload.data.data.name,
      payload.data.data && payload.data.data.map
        ? payload.data.data.map(item => item.name).join(',')
        : util.getValue(
          payload.data.target && payload.data.target.name,
          payload.data.target &&
              payload.data.target.map &&
              payload.data.target.map(item => item.name).join(',')
        )
    )
    payload.data.checkbox = {
      disabled: false,
      checked: false,
      text: ''
    }
    state.excutingTask.push(payload.data)
  },
  [TYPES.DELETE_EVENT](state, payload) {
    var data = state.eventArray[payload.symbol]
    data.status = 'Complete'
    state.excutingTask.remove(data)
    state.complateTask.push(data)
    delete state.eventArray[payload.symbol]
  },
  [TYPES.RECOVERY_EVENT](state, payload) {
    var event = state.eventArray[payload.symbol]
    switch (event.type) {
      case TYPES.RENAME:
        event.target.name = event.oldValue
        event.target.path = event.target.folderpath + '/' + event.oldValue
        break
      case TYPES.UPLOAD_FILES:
        getRepository(event.target.father.guid).remove(event.target)
        util.forceUpdate(event.target.father.guid)
        break
      case TYPES.RECYCLE:
        event.target.forEach(item => {
          getRepository(event.from.guid).push(item)
          util.forceUpdate(event.from.guid)
          item.type === 'folder' && event.from.folders.push(item)
        })
        break
      case TYPES.DELETE:
        event.target.forEach(item => {
          getRepository(event.from.guid).push(item)
          util.forceUpdate(event.from.guid)
          item.type === 'folder' && event.from.folders.push(item)
        })
        break
      case TYPES.RESTORE:
        event.target.forEach(item => {
          getRepository(event.from.guid).push(item)
          util.forceUpdate(event.from.guid)
          item.type === 'folder' && event.from.folders.push(item)
        })
        break
      case TYPES.MOVE_OBJECTS:
        event.data.forEach(item => {
          getRepository(event.to.guid).remove(item)
          util.forceUpdate(event.to.guid)
          item.type === 'folder' && event.to.folders.remove(item)
          getRepository(event.from.guid).push(item)
          util.forceUpdate(event.from.guid)
          item.type === 'folder' &&
            (event.from.folders.push(item),
            (item.path = event.from.path + '/' + item.name))
          item.father = event.from
          item.waiting = false
          item.folderpath = event.from.path
        })
        break
      case TYPES.COPY_OBJECTS:
        event.data.forEach(item => {
          getRepository(event.to.guid).remove(item)
          util.forceUpdate(event.to.guid)
          item.type === 'folder' && event.to.folders.remove(item)
        })
        break
      default:
    }
    event.status = 'Failed'
    state.excutingTask.remove(event)
    state.complateTask.push(event)
    delete state.eventArray[payload.symbol]
  },
  [TYPES.ADD_SELECTEDMARKER](state, payload) {
    state.selectedMaterials.forEach(item => {
      item.selected = false
      if (item.selecting !== undefined) item.selecting = false
    })
    state.selectedMaterials = []
    if (state.selectedMarkers.indexOf(payload.data) < 0) {
      state.selectedMarkers.push(payload.data)
    }

    state.markSelectionChangeFunc()
  },
  [TYPES.CLEAR_SELECTEEDMARKERS](state, payload) {
    state.selectedMarkers.forEach(item => {
      item.selected = false
      if (item.selecting !== undefined) item.selecting = false
    })
    state.selectedMarkers = []
  },
  [TYPES.REMOVE_SELECTEDMARKER](state, payload) {
    state.selectedMarkers.remove(payload.data)

    state.markSelectionChangeFunc()
  },
  [TYPES.ADD_SELECTEDITEM](state, payload) {
    state.isFocusTree = false
    // clear selected markers
    state.selectedMarkers.forEach(item => {
      item.selected = false
      if (item.selecting !== undefined) item.selecting = false
    })
    state.selectedMarkers = []
    if (state.selectedMaterials.indexOf(payload.data) < 0) {
      state.lastRemoveMaterial = null
      state.selectedMaterials.push(payload.data)
    }
    state.materialSelectionChangeFunc()
    // var lastVisit = util.getCookie('last_visit' + _userCode)
    // if (lastVisit) {
    //   lastVisit = JSON.parse(lastVisit)
    //   lastVisit.selectedMaterial = state.selectedMaterials.map(item => item.guid)
    //   util.setCookie('last_visit' + state.userInfo.usercode, JSON.stringify(lastVisit))
    // }
  },
  [TYPES.CLEAR_SELECTEEDITEMS](state, payload) {
    state.selectedMaterials.forEach(item => {
      item.selected = false
      if (item.selecting !== undefined) item.selecting = false
    })
    state.selectedMaterials = []
  },
  [TYPES.REMOVE_SELECTEDITEM](state, payload) {
    state.selectedMaterials.remove(payload.data)
    state.lastRemoveMaterial = payload.data
    state.materialSelectionChangeFunc()

    var lastVisit = util.getCookie('last_visit' + state.userInfo.usercode)
    if (lastVisit) {
      lastVisit = JSON.parse(lastVisit)
      lastVisit.selectedMaterial = state.selectedMaterials.map(
        item => item.guid
      )
      util.setCookie(
        'last_visit' + state.userInfo.usercode,
        JSON.stringify(lastVisit)
      )
    }
  },
  [TYPES.SET_SIGNMATERIAL](state, payload) {
    state.signIndex = payload.data
  },
  [TYPES.SET_SIGNMARKER](state, payload) {
    state.signMarkerIndex = payload.data
  },
  [TYPES.ADD_CLIPBOARD](state, payload) {
    if (state.clipBoard.indexOf(payload.data) < 0) {
      state.clipBoard.push(payload.data)
    }
  },
  [TYPES.CLEAR_CLIPBOARD](state, payload) {
    state.clipBoard.forEach(item => {
      item.cutting = false
    })
    state.clipBoard = []
  },
  [TYPES.SET_CLIPBOARDSTATUS](state, payload) {
    state.clipBoardSymbol = payload.data
  },
  [TYPES.SET_CUSTOM_HEADERS](state, payload) {
    let customkeys = JSON.parse(JSON.stringify(payload.data))
    let tempArr = []
    let tempHeader = []
    state.headers.forEach((item, index) => {
      var same = item.id && customkeys.find(k => item.id === k.id)
      if (same) {
        item.name = same.alias || ''
        item.attr = same.fieldName || ''
        tempArr.push(same)
      } else if (item.id) {
        tempHeader.push(item)
      }
      if (index === state.headers.length - 1) {
        state.headers.remove(...tempHeader)
        customkeys.remove(...tempArr)
        customkeys.forEach(item => {
          let obj = {
            name: item.alias || '',
            attr: item.fieldName || '',
            width: item.dataType === 'date' ? 130 : 100,
            dragging: false,
            checked: true,
            id: item.id
          }
          state.headers.push(obj)
        })
      }
    })
    util.setCookie(
      'item_headers' + state.userInfo.usercode,
      JSON.stringify(state.headers)
    )
  }
}
