export function KeyEvent (code, opt = {}) {
  if (!(this instanceof KeyEvent)) {
    return new KeyEvent(code, opt)
  }
  this.keycode = code
  this.ctrlKey = !!opt.ctrlKey
  this.altKey = !!opt.altKey
  this.shiftKey = !!opt.shiftKey
  this.metaKey = !!opt.metaKey
  this.action = opt.action
  return this
}
