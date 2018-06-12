import $ from './jquery-3.2.0.min.js'
import util from './util.js'
export function ModalWindow (options) {
  let layout = `<div  class="h5 window animated2 zoomIn">
                  <div class="window-caption">
                      <span class="window-caption-icon">
                          <span></span>
                      </span>
                      <span class="window-caption-title">
                          <span></span>
                      </span>
                      <span class="btn-close"></span>
                  </div>
                  <div class="window-content" ></div>
              </div>`
  let model = `<div class="windowModalDiv" style="width:100%;height:100%;background-color:#000;position:absolute;top:0;left:0;z-index:10049;opacity:0;"/>`

  let _this = this
  let _options = options || {}
  let _element = $(layout)[0]
  let _captionElement = _element.querySelector('.window-caption')
  let _iconElement = _element.querySelector('.window-caption-icon')
  let _titleElement = _element.querySelector('.window-caption-title')
  let _closeElement = _element.querySelector('.btn-close')
  let _contentElement = _element.querySelector('.window-content')
  let _modalDiv = $(model)[0]
  let _mousedown = false
  let _downposition = [0, 0]
  let _translate = [0, 0]
  let _lastDiff = [0, 0]
  let _oldSelectStartProc = null
  console.log(_mousedown)
  if (_options.content) {
    _contentElement.appendChild(_options.content)
  }

  if (_options.onclick) {
    _modalDiv.addEventListener('click', _options.onclick)
    _element.addEventListener('click', _options.onclick)
  }

  if (_options.hideModal) {
    _modalDiv.style.display = 'none'
  }

  if (_options.closeCss) {
    _closeElement.classList.add(_options.closeCss)
  }

  if (!_options.icon) {
    _iconElement.classList.add('hidden')
  }
  if (_options.iconCss) {
    _iconElement.querySelector('span').classList.add(_options.iconCss)
  }
  if (_options.title) {
    _titleElement.querySelector('span').innerText = _options.title
  }
  if (_options.captionCss) {
    _captionElement.classList.add(_options.captionCss)
  }
  _this.updateContent = function (newContent) {
    _contentElement = ''
    _contentElement = _element.querySelector('.window-content')
    _contentElement.appendChild(newContent)
  }
  let resizeCallback = util.throttle(100, function (e) {
    let w = $(_element).width()
    let h = $(_element).height()
    let bw = $(window).width()
    let bh = $(window).height()

    $(_element).css({
      left: (bw - w) / 2 + 'px',
      top: (bh - h) / 2 + 'px'
    })
    _translate = [0, 0]
    _element.style['transform'] =
      'translate(' + _translate[0] + 'px, ' + _translate[1] + 'px)'
  })
  _this.show = function (title) {
    if (title) {
      _titleElement.querySelector('span').innerText = title
    }
    _this.visible = true
    document.body.appendChild(_element)
    document.body.appendChild(_modalDiv)
    let w = $(_element).width()
    let h = $(_element).height()
    let bw = $(window).width()
    let bh = $(window).height()

    $(_element).css({
      left: (bw - w) / 2 + 'px',
      top: (bh - h) / 2 + 'px'
    })
    _translate = [0, 0]
    _element.style['transform'] =
      'translate(' + _translate[0] + 'px, ' + _translate[1] + 'px)'
    if (_options.onshow) {
      _options.onshow()
    }

    window.addEventListener('resize', resizeCallback)
  }

  _this.hide = function () {
    _this.visible = false
    document.body.removeChild(_element)
    document.body.removeChild(_modalDiv)
    if (_options.onhide) {
      _options.onhide()
    }
    window.removeEventListener('resize', resizeCallback)
    _titleElement.querySelector('span').innerText = _options.title
  }

  _closeElement.addEventListener('click', function (e) {
    e.stopPropagation()
    _this.hide()
  })

  _captionElement.addEventListener('mousedown', onCaptionMouseDown)

  function onSelectStart (e) {
    return false
  }

  function onCaptionMouseDown (e) {
    _mousedown = true
    _downposition = [e.pageX, e.pageY]
    _lastDiff = [0, 0]
    _captionElement.removeEventListener('mousedown', onCaptionMouseDown)
    window.addEventListener('mousemove', onCaptionMouseMove)
    window.addEventListener('mouseup', onCaptionMouseup)
    _oldSelectStartProc = document.onselectstart
    document.onselectstart = onSelectStart
  }

  function onCaptionMouseMove (e) {
    _lastDiff = [e.pageX - _downposition[0], e.pageY - _downposition[1]]

    var offsetX = parseInt(_translate[0] + _lastDiff[0])
    var offsetY = parseInt(_translate[1] + _lastDiff[1])
    var minoffsetX = -_element.offsetLeft
    var maxoffsetX = _element.offsetLeft

    var minoffsetY = -_element.offsetTop
    var maxoffsetY = _element.offsetTop
    if (offsetX > maxoffsetX) {
      offsetX = maxoffsetX
    }
    if (offsetX < minoffsetX) {
      offsetX = minoffsetX
    }
    if (offsetY > maxoffsetY) {
      offsetY = maxoffsetY
    }
    if (offsetY < minoffsetY) {
      offsetY = minoffsetY
    }
    _element.style['transform'] =
      'translate(' + offsetX + 'px, ' + offsetY + 'px)'
  }

  function onCaptionMouseup (e) {
    _mousedown = false
    _translate[0] = _translate[0] + _lastDiff[0]
    _translate[1] = _translate[1] + _lastDiff[1]
    _captionElement.addEventListener('mousedown', onCaptionMouseDown)
    window.removeEventListener('mousemove', onCaptionMouseMove)
    window.removeEventListener('mouseup', onCaptionMouseup)
    document.onselectstart = _oldSelectStartProc
  }
}
