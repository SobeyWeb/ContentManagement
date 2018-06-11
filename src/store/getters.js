export default {
  isFocusTree (state) {
    return state.focusIndex % 3 === 0
  },
  isFocusML (state) {
    return state.focusIndex % 3 === 1
  },
  isFocusPlayer (state) {
    return state.focusIndex % 3 === 2
  }
}
