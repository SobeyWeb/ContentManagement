import { SortLikeWin, SortLikeWinBy } from './sort.js'
export default {
  getUrl (url, para, ifNotEnc) {
    if (para) {
      let q = ''
      if (url.indexOf('?') >= 0) {
        q = '&'
      } else {
        q = '?'
      }

      for (let k in para) {
        if (typeof para[k] === 'undefined') {
          continue
        }
        if (q.length > 1) {
          q += '&'
        }
        if (ifNotEnc) {
          q = q + k + '=' + para[k]
        } else {
          q = q + k + '=' + encodeURIComponent(para[k])
        }
      }

      url = url + q
    }
    return url
  },
  getValue () {
    let val
    for (let i = 0, l = arguments.length; i < l; i++) {
      if (arguments[i] !== undefined) {
        val = arguments[i]
        break
      }
    }
    return val
  },
  throttle (delay, action, immediately) {
    let last = 0
    let id = -1
    return function () {
      if (last === 0 && immediately) {
        action.apply(this, arguments)
      }
      clearTimeout(id)
      let curr = +new Date()
      if (curr - last > delay) {
        action.apply(this, arguments)
        last = curr
      } else {
        id = setTimeout(() => action.apply(this, arguments), delay)
      }
    }
  },
  getCookie (name) {
    if (localStorage && localStorage.getItem && localStorage.getItem(name)) {
      return localStorage.getItem(name)
    } else {
      let arr
      let reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)')
      if ((arr = document.cookie.match(reg))) return unescape(arr[2])
      else return null
    }
  },
  sortBy (arr, type, symbol, flag) {
    let folderArr
    let otherArr
    if (!flag) {
      let specialArr = arr.filter(
        item =>
          item.type === 'folder' && [292, 293, 294].indexOf(item.subtype) > -1
      )
      if (specialArr.length) {
        specialArr.forEach(item => arr.remove(item))
        return this.sortBy(specialArr, 'title', false, true).concat(
          this.sortBy(arr, type, symbol, true)
        )
      }
    }
    if (type === 'title') {
      folderArr = arr.filter(item => {
        if (item.type === 'folder') return item
      })
      otherArr = arr.filter(item => {
        if (item.type !== 'folder') return item
      })
      if (symbol) {
        arr = folderArr.sort(SortLikeWin).concat(otherArr.sort(SortLikeWin))
      } else {
        arr = folderArr
          .sort(SortLikeWin)
          .reverse()
          .concat(otherArr.sort(SortLikeWin).reverse())
      }
      return arr
    } else if (type === 'createTime') {
      folderArr = arr.filter(item => {
        if (item.type === 'folder') return item
      })
      otherArr = arr.filter(item => {
        if (item.type !== 'folder') return item
      })
      if (symbol) {
        arr = folderArr
          .sort((item1, item2) => {
            return item1.createdate - item2.createdate
          })
          .concat(
            otherArr.sort((item1, item2) => {
              return item1.createdate - item2.createdate
            })
          )
      } else {
        arr = folderArr
          .sort((item1, item2) => {
            return item1.createdate - item2.createdate
          })
          .reverse()
          .concat(
            otherArr
              .sort((item1, item2) => {
                return item1.createdate - item2.createdate
              })
              .reverse()
          )
      }
      return arr
    } else if (type === 'type') {
      if (symbol) {
        arr.sort((item1, item2) => {
          return item1.typeIndex - item2.typeIndex
        })
      } else {
        arr
          .sort((item1, item2) => {
            return item1.typeIndex - item2.typeIndex
          })
          .reverse()
      }
      let groupedArr = arr.groupBy('typeIndex')
      let newArr = []
      groupedArr.forEach(item => {
        newArr = newArr.concat(item.sort(SortLikeWin))
      })
      return newArr
    } else {
      let sortFunc = SortLikeWinBy(type)
      folderArr = arr.filter(item => {
        if (item.type === 'folder') return item
      })
      otherArr = arr.filter(item => {
        if (item.type !== 'folder') return item
      })
      if (symbol) {
        arr = folderArr.sort(sortFunc).concat(otherArr.sort(sortFunc))
      } else {
        arr = folderArr
          .sort(sortFunc)
          .reverse()
          .concat(otherArr.sort(sortFunc).reverse())
      }
      return arr
    }
  }
}
