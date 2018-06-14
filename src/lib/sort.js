function CommonCompare (a, b, str1, str2) {
  if (a === b) {
    if (str1 && str2) {
      return (
        (str1.guid !== undefined && str1.guid.localeCompare(str2.guid)) || 0
      )
    } else {
      return 0
    }
  } else if (!a.length || !b.length) {
    return a.localeCompare(b) // a < b ? -1 : 1;
  }
  let reg = new RegExp(
    '[~!@#$%^&*()_+-={}|":?><\\[\\]\\\'~！@#￥%……&*（）——+-={}|“：？》《【】、‘；、。，;\\\\/.,]',
    'g'
  ) /// [^\u2E80-\u9FFF\d+a-zA-Z]/g; //匹配特殊字符
  let lista = a.match(reg)
  let listb = b.match(reg)
  let index
  let prefixa
  let prefixb
  if (!lista || !listb) {
    if (!lista && !listb) {
      return ZHCompare(a, b) // a < b ? -1 : 1;
    } else if (!lista && listb) {
      // a没匹配到特殊字符，b匹配到了
      index = b.indexOf(listb[0])
      prefixa = a.substring(0, index)
      prefixb = b.substring(0, index)
      if (prefixa !== prefixb) {
        return ZHCompare(prefixa, prefixb) // prefixa < prefixb ? -1 : 1;//不考虑数字
      } else {
        // [~,{,},|]比字母大。。。
        return !a[index] ? -1 : 1 // a[index] < b[index] ? -1 : 1; //如果a的index位置为undefined，则返回-1,否则比较abindex位置的值
      }
    } else {
      // b没匹配到特殊字符，a匹配到了
      index = a.indexOf(lista[0])
      prefixa = a.substring(0, index)
      prefixb = b.substring(0, index)
      if (prefixa !== prefixb) {
        return ZHCompare(prefixa, prefixb) // prefixa < prefixb ? -1 : 1;//不考虑数字
      } else {
        return !b[index] ? 1 : -1 // a[index] < b[index] ? -1 : 1; //如果b的index位置为undefined，则返回1,即有特殊字符的a大于没特殊字符且index位置为undefined的b，否则比较a，b，index位置的值
      }
    }
  } else {
    for (
      var i = 0, minLen = Math.min(lista.length, listb.length);
      i < minLen;
      i++
    ) {
      // 字符所在位置序号
      let indexa = a.indexOf(lista[i])
      let indexb = b.indexOf(listb[i])
      // 字符前面的前缀
      let prefixa = a.substring(0, indexa)
      let prefixb = b.substring(0, indexb)
      // 字符的string
      let stra = lista[i]
      let strb = listb[i]
      // 如果字符的序号不等或前缀不等，属于前缀不同的情况，直接比较
      if (indexa !== indexb || prefixa !== prefixb) {
        return ZHCompare(prefixa, prefixb) // prefixa < prefixb ? -1 : 1;//不考虑数字
      } else {
        if (stra === strb) {
          // 如果是最后一个字符，比较字符的后缀
          if (i === minLen - 1) {
            return CommonCompare(
              a.substring(indexa + 1),
              b.substring(indexb + 1)
            )
          } else {
            a = a.substring(indexa + stra.length)
            b = b.substring(indexa + stra.length)
          }
        } else {
          return ZHCompare(stra, strb) // stra < strb ? -1 : 1;
        }
      }
    }
  }
}

function ZHCompare (a, b) {
  if (a === b) {
    return 0
  } else if (!a.length || !b.length) {
    return a.localeCompare(b) // a < b ? -1 : 1;
  }
  let reg = /[\u2E80-\u9FFF]/g // 匹配中文
  let lista = a.match(reg)
  let listb = b.match(reg)
  if (!lista || !listb) {
    return a.localeCompare(b) // a < b ? -1 : 1;
  } else {
    // a b 都包含中文
    for (
      let i = 0, minLen = Math.min(lista.length, listb.length);
      i < minLen;
      i++
    ) {
      // 中文所在位置序号
      let indexa = a.indexOf(lista[i])
      let indexb = b.indexOf(listb[i])
      // 中文前面的前缀
      let prefixa = a.substring(0, indexa)
      let prefixb = b.substring(0, indexb)
      // 中文
      let stra = lista[i]
      let strb = listb[i]

      // 如果中文的序号不等或前缀不等，属于前缀不同的情况，直接比较
      if (indexa !== indexb || prefixa !== prefixb) {
        return prefixa < prefixb ? -1 : 1
      } else {
        // 中文全等
        if (stra === strb) {
          // 如果是最后一个数字，比较数字的后缀
          if (i === minLen - 1) {
            return a.substring(indexa + 1) < b.substring(indexb + 1) ? -1 : 1
          } else {
            // 如果不是最后一个中文，则循环跳转到下一个中文，并去掉前面相同的部分
            a = a.substring(indexa + stra.length)
            b = b.substring(indexa + stra.length)
          }
        } else {
          // 如果中文不等，直接比较中文大小
          return stra.localeCompare(strb)
        }
      }
    }
  }
}

export function SortLikeWinBy (attr) {
  return function (str1, str2) {
    try {
      if (str1[attr] === undefined) str1[attr] = ''
      if (str2[attr] === undefined) str2[attr] = ''
      let a = ('' + str1[attr]).toUpperCase()
      let b = ('' + str2[attr]).toUpperCase()
      let reg = /[0-9]+/g
      let lista = a.match(reg)
      let listb = b.match(reg)
      if (!lista || !listb) {
        return CommonCompare(a, b, str1, str2)
      }
      for (
        let i = 0, minLen = Math.min(lista.length, listb.length);
        i < minLen;
        i++
      ) {
        // 数字所在位置序号
        let indexa = a.indexOf(lista[i])
        let indexb = b.indexOf(listb[i])
        // 数字前面的前缀
        let prefixa = a.substring(0, indexa)
        let prefixb = b.substring(0, indexb)
        // 数字的string
        let stra = lista[i]
        let strb = listb[i]
        // 数字的值
        let numa = parseInt(stra)
        let numb = parseInt(strb)
        // 如果数字的序号不等或前缀不等，属于前缀不同的情况，直接比较
        if (indexa !== indexb || prefixa !== prefixb) {
          return CommonCompare(a, b)
        } else {
          // 数字的string全等
          if (stra === strb) {
            // 如果是最后一个数字，比较数字的后缀
            if (i === minLen - 1) {
              return CommonCompare(
                a.substring(indexa + 1),
                b.substring(indexb + 1),
                str1,
                str2
              )
            } else {
              // 如果不是最后一个数字，则循环跳转到下一个数字，并去掉前面相同的部分
              a = a.substring(indexa + stra.length)
              b = b.substring(indexa + stra.length)
            }
          } else if (numa === numb) {
            // 如果数字的string不全等，但值相等
            // 直接比较数字前缀0的个数，多的更小
            return strb.lastIndexOf(numb + '') - stra.lastIndexOf(numa + '')
          } else {
            // 如果数字不等，直接比较数字大小
            return numa - numb
          }
        }
      }
    } catch (e) {
      return -1
    }
  }
}

export function SortLikeWin (str1, str2) {
  try {
    if (str1.name === undefined) str1.name = ''
    if (str2.name === undefined) str2.name = ''
    let a = str1.name.toUpperCase()
    let b = str2.name.toUpperCase()
    let reg = /[0-9]+/g
    let lista = a.match(reg)
    let listb = b.match(reg)
    if (!lista || !listb) {
      return CommonCompare(a, b, str1, str2)
    }
    for (
      let i = 0, minLen = Math.min(lista.length, listb.length);
      i < minLen;
      i++
    ) {
      // 数字所在位置序号
      let indexa = a.indexOf(lista[i])
      let indexb = b.indexOf(listb[i])
      // 数字前面的前缀
      let prefixa = a.substring(0, indexa)
      let prefixb = b.substring(0, indexb)
      // 数字的string
      let stra = lista[i]
      let strb = listb[i]
      // 数字的值
      let numa = parseInt(stra)
      let numb = parseInt(strb)
      // 如果数字的序号不等或前缀不等，属于前缀不同的情况，直接比较
      if (indexa !== indexb || prefixa !== prefixb) {
        return CommonCompare(a, b)
      } else {
        // 数字的string全等
        if (stra === strb) {
          // 如果是最后一个数字，比较数字的后缀
          if (i === minLen - 1) {
            return CommonCompare(
              a.substring(indexa + 1),
              b.substring(indexb + 1),
              str1,
              str2
            )
          } else {
            // 如果不是最后一个数字，则循环跳转到下一个数字，并去掉前面相同的部分
            a = a.substring(indexa + stra.length)
            b = b.substring(indexa + stra.length)
          }
        } else if (numa === numb) {
          // 如果数字的string不全等，但值相等
          // 直接比较数字前缀0的个数，多的更小
          return strb.lastIndexOf(numb + '') - stra.lastIndexOf(numa + '')
        } else {
          // 如果数字不等，直接比较数字大小
          return numa - numb
        }
      }
    }
  } catch (e) {
    return -1
  }
}
