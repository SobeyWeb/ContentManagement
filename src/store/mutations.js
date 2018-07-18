import TYPES from '../dicts/mutationTypes.js'
import * as util from '../lib/util.js'
import { getRepository, setRepository } from '../data/repository.js'
import $ from 'jquery'
export default {
  [TYPES.SET_USERINFO](state, payload) {
    state.userInfo = payload.data
  },
  [TYPES.SET_APPDATA](state, payload) {
    state.listSymbol = util.getValue(payload.data.listSymbol, state.listSymbol)
    state.listOrder = util.getValue(payload.data.listOrder, state.listOrder)
    state.sortType = util.getValue(payload.data.sortType, state.sortType)
    state.typeSymbol = util.getValue(payload.data.typeSymbol, state.typeSymbol)
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
        typeSymbol: lastVisit.typeSymbol || state.typeSymbol,
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
  }
}
