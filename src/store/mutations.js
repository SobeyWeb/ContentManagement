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
  }
}
