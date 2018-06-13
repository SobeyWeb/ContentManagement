import util from '../lib/util.js'
import APPSETTING from '../config/appSetting.js'
import { getRepository, setRepository } from '../data/repository'

export default {
  isFocusTree (state) {
    return state.focusIndex % 3 === 0
  },
  isFocusML (state) {
    return state.focusIndex % 3 === 1
  },
  isFocusPlayer (state) {
    return state.focusIndex % 3 === 2
  },
  folderTree (state) {
    return state.nodes
  },
  currentNode (state, getters) {
    let cnode
    if (state.navPath.length > 0) {
      cnode = state.navPath[state.navPath.length - 1]
    } else {
      cnode = {
        children: [],
        operations: []
      }
    }
    let index = state.updateId
    console.log(index) // just for reactive
    if (state.listSymbol && !state.listOrder.disabled) {
      setRepository(
        cnode.guid,
        util.sortBy(
          getRepository(cnode.guid),
          state.listOrder.type,
          state.listOrder.symbol
        )
      )
    } else if (state.isMarker) {
      getRepository(cnode.guid).sort((i1, i2) => {
        if (i1.keyframe - i2.keyframe) {
          return i1.keyframe - i2.keyframe
        } else {
          return i1.markguid && i1.markguid.localeCompare(i2.markguid)
        }
      })
    } else {
      if (state.sortType === 'type') {
        setRepository(
          cnode.guid,
          util.sortBy(
            getRepository(cnode.guid),
            state.sortType,
            state.typeSymbol
          )
        )
      } else {
        setRepository(
          cnode.guid,
          util.sortBy(
            getRepository(cnode.guid),
            state.sortType,
            state.sortSymbol
          )
        )
      }
    }
    return cnode
  },
  copingBoard (state, getters) {
    return getters.displayMaterials.filter(item => item.coping)
  },
  searchResult (state) {
    return state.nodes[1]
  },
  orderList (state) {
    return state.nodes[2]
  },
  selectedNode (state, getters) {
    return state.selectedNode || getters.currentNode
  },
  selectedMaterial (state, getters) {
    return getters.displayMaterials[state.signIndex] || null
  },
  displayMaterials (state, getters) {
    let index = state.updateId
    console.log(index)
    // return repository[getters.currentNode.guid].filter(item => 'folder' === item.type || state.archiveFiters[item.onlinstatus])
    return getRepository(getters.currentNode.guid).filter(
      item =>
        (item.type === 'folder' || state.archiveFiters[item.archivetarget]) &&
        ([1, 2].indexOf(getters.currentNode.guid) === -1 ||
          state.showOAMaterials ||
          !item.folderpath ||
          !item.folderpath.startsWith(APPSETTING.OAPATH))
    )
  },
  orderedSelectedMaterials (state, getters) {
    return getters.displayMaterials.filter(item => item.selected)
  },
  selectedMaterialsInfo (state, getters) {
    return state.selectedMaterials.map(item => {
      return {
        name: item.name,
        guid: item.guid,
        type: item.type,
        path: item.path,
        subtype: item.subtype,
        typeid: item.typeid
      }
    })
  },
  thumbnailStyle (state, getters) {
    return {
      margin: '7px ' + state.thumbPadding + 'px',
      width: state.thumbnailStyle.width * state.scaleTime + 'px',
      height: state.thumbnailStyle.height * state.scaleTime + 45 + 'px'
    }
  },
  previewStatus (state, getters) {
    return state.detailviewSymbol || state.previewSymbol
  },
  itemWidth (state, getters) {
    return state.listSymbol
      ? 1
      : state.isMarker
        ? 462
        : state.thumbnailStyle.width * state.scaleTime + 2 * state.thumbPadding
  },
  itemHeight (state, getters) {
    return state.listSymbol
      ? state.system
        ? 40
        : 52
      : state.isMarker
        ? 102
        : 14 + state.thumbnailStyle.height * state.scaleTime + 45
  },
  thumbDisplay (state, getters) {
    let containerUpdate = state.containerUpdate // add for resize  auto update
    console.log(containerUpdate)
    let box = state.materialBox || {}
    let itemHeight = getters.itemHeight
    let length = getters.displayMaterials.length
    if (state.listSymbol) {
      let totalHeight = itemHeight * length
      let screenRows = Math.ceil(box.clientHeight / itemHeight) + 1
      let cellPercent = (itemHeight * 100) / totalHeight
      let index = Math.floor(state.scrollingV / cellPercent)
      let height = index * cellPercent * 0.01 * totalHeight
      return {
        index: index,
        range: screenRows * 1,
        height: height,
        leftHeight: Math.max(
          0,
          totalHeight - height - 1 * screenRows * itemHeight
        ),
        containerHeight: box.clientHeight,
        containerWidth: box.clientWidth,
        totalHeight: totalHeight,
        cellPercent: cellPercent,
        rowCount: 1,
        el: box
      }
    } else {
      let rowCount = state.isMarker
        ? Math.floor(box.clientWidth / getters.itemWidth)
        : Math.round(
          (box.clientWidth - 2 * state.thumbPadding) / getters.itemWidth
        )
      let totalHeight = Math.ceil(length / rowCount) * itemHeight
      let screenRows = Math.ceil(box.clientHeight / itemHeight) + 1
      let cellPercent = (itemHeight * 100) / totalHeight
      let index = Math.floor(state.scrollingV / cellPercent)
      let height = index * cellPercent * 0.01 * totalHeight
      return {
        index: index * rowCount,
        range: rowCount * screenRows * 1,
        height: height,
        leftHeight: Math.max(
          0,
          totalHeight - height - 1 * screenRows * itemHeight
        ),
        containerHeight: box.clientHeight,
        containerWidth: box.clientWidth,
        totalHeight: totalHeight,
        cellPercent: cellPercent,
        rowCount: rowCount,
        el: box
      }
    }
  },
  currentSearchCondition (state, getters) {
    return {
      node: {
        path: state.searchNode.path,
        subtype: state.searchNode.subtype
      },
      headers: state.advanceSearchHeaders,
      timeFilter: state.fulltextSearchCondition.timeFilter,
      typeFilter: state.fulltextSearchCondition.typeFilter,
      keywords: state.fulltextSearchCondition.keywords,
      booleanCondition: state.fulltextSearchCondition.booleanCondition,
      type: state.searchType
    }
  },
  regExp (state, getters) {
    let cond = state.condition.trim()
    if (cond) {
      let regStr = '^'
      let condArr = cond.split('*')
      condArr.forEach((item, index) => {
        if (item !== '' || !index) {
          regStr += item
            .replace(/[\\|&^*+?$[\](){}]/g, '\\$&')
            .replace(/\s+/, '\\s+')
          regStr += '.*'
        }
      })
      return new RegExp(regStr, 'i')
    } else {
      return /.*/
    }
  }
}
