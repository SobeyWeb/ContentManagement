export function frameToTime(frame, rate) {
  var h, m, s, f
  f = Math.round(frame % rate)
  h = Math.floor(frame / (rate * 60 * 60))
  m = Math.floor(frame / (rate * 60)) % 60
  s = Math.floor(frame / rate) % 60
  return h.fixZero() + ':' + m.fixZero() + ':' + s.fixZero() + '.' + f.fixZero()
}
