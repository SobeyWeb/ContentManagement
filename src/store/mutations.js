import TYPES from '../dicts/mutationTypes.js'
export default {
  [TYPES.SET_USERINFO] (state, payload) {
    state.userInfo = payload.data
  }
}
