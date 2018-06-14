import TYPES from '../dicts/mutationTypes.js'
import util from '../lib/util.js'
export default {
  [TYPES.SET_USERINFO] (state, payload) {
    state.userInfo = payload.data
  },
  [TYPES.SET_APPDATA] (state, payload) {
    state.listSymbol = util.getValue(payload.data.listSymbol, state.listSymbol)
    state.listOrder = util.getValue(payload.data.listOrder, state.listOrder)
    state.sortType = util.getValue(payload.data.sortType, state.sortType)
    state.typeSymbol = util.getValue(payload.data.typeSymbol, state.typeSymbol)
    state.sortSymbol = util.getValue(payload.data.sortSymbol, state.sortSymbol)
  },
  [TYPES.SET_DVPADDING] (state, payload) {
    let width = document.body.clientWidth
    let height = document.body.clientHeight
    let videoWidth = Math.max(width - 640, 0)
    let videoHeight = (videoWidth * 9) / 16
    state.dvStyle.padding = Math.max((height - 110 - videoHeight) / 2, 0) // 110 is player toolbar height
    state.dvStyle.width = videoWidth
    state.dvStyle.height = videoHeight
  }
}
