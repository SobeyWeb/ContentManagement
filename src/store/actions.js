/* eslint-disable camelcase */
import TYPES from '../dicts/mutationTypes.js'
import API_CONFIG from '../config/apiConfig.js'
import URLCONFIG from '../config/urlConfig.js'
import NODETYPES from '../dicts/guidMaps.js'
import axios from 'axios'
import * as util from '../lib/util.js'
import {
  getEnumKeyByValue,
  FilterGroupTypeOperator,
  ConditionType,
  StoryTypeEnum,
  strDateTime1,
  EventStatusType,
  SetStudioSystemStandard,
  getTimeStringByFrameNum2,
  GetStudioSystemStandard
} from '../dicts/StudioFormat.js'
import {
  getRepository,
  setRepository
} from '../data/repository.js'
import appSetting from '../config/appSetting.js'
import Vue from 'vue'
import {
  emptyMaterial
} from '../data/basicData'
import Guid from '../lib/Guid'
import {
  ET_VideoStandardIsHD,
  getclipclassType
} from '../lib/format'
import {
  GetEntityType,
  ClipSubType,
  ObjectType
} from '../lib/transform'
import PERMISSION from '../dicts/permission'
import $ from 'jquery'
let md5 = require('../lib/md5.min.js').md5

export default {
  [TYPES.GET_GENERATION](context, payload) {
    let url = API_CONFIG[TYPES.GET_GENERATION]({
      pathtype: 'http'
    })
    var body = {
      start: {
        guid: payload.source.guid
      },
      dept: payload.dept,
      maxdept: 1
    }
    return new Promise((resolve, reject) => {
      axios.post(url, body).then(res => {
        if (res.data.code === '0') {
          resolve(res)
        } else {
          reject(res)
        }
      }).catch(res => {
        reject(res)
      })
    })
  },
  [TYPES.DISPATCH_ONE_GENERATION](context, payload) {
    var material = payload.target[0]
    context.state.relations = []
    context.state.dept = 'to'
    context.dispatch(TYPES.GET_GENERATION, {
      source: material,
      dept: 'to'
    }).then(res => {
      context.state.relations = util.getRelations(res.data.ext.map(item => item.entityinfo))
    }).catch(res => {
      util.Notice.failed('Query relations failed!', '', 3000)
    })
    context.state.relationsWindow.show('Next One Generation')
  },
  [TYPES.DISPATCH_PREVIOUS_ONE_GENERATION](context, payload) {
    context.state.dept = 'from'
    var material = payload.target[0]
    context.state.relations = []
    context.dispatch(TYPES.GET_GENERATION, {
      source: material,
      dept: 'from'
    }).then(res => {
      context.state.relations = util.getRelations(res.data.ext.map(item => item.entityinfo))
    }).catch(res => {
      util.Notice.failed('Query relations failed!', '', 3000)
    })
    context.state.relationsWindow.show('Previous One Generation')
  },
  // 获取用户参数
  [TYPES.GET_USERPARAM](context, payload) {
    let url = API_CONFIG[TYPES.GET_USERPARAM]({
      usertoken: context.state.userInfo.usertoken
    })
    return new Promise((resolve, reject) => {
      axios.post(url, {
        loginname: context.state.userInfo.loginname,
        system: payload.data.system,
        tool: 'DEFAULT',
        paramname: payload.data.paramname,
        paramvalue: null
      }).then(res => { //
        if (res.data.code === '0') {
          resolve(res)
        } else {
          reject(res)
        }
      })
    })
  },
  [TYPES.UPLOAD_FILES](context, payload) {
    var URL1 = URLCONFIG.CM + '/Handler/WebLargeFileUploadService.aspx'

    var files = payload.data.files
    console.log(files)

    var father = payload.source || context.getters.currentNode
    var nasPath = context.state.uploadPath + 'cmupload' + '/' + new Date().format('yyyy-MM-dd')

    var uploadPath
    if (/\\\\.*?\\/.test(nasPath)) { // 匹配unc路径
      uploadPath = (appSetting.uploadPath + nasPath.split(/\\\\.*?\\/)[1]).replace(/\\/g, '/')
    } else {
      util.Notice.warning('There is not enough user space to upload', '', 3000)
      return
    }
    if (context.state.sumSpace !== -1 && [].reduce.call(files, (i1, i2) => {
        return {
          size: i1.size + i2.size
        }
      }).size > (context.state.sumSpace - context.state.useSpace)) {
      util.Notice.warning('There is not enough user space to upload', '', 3000)
      return
    }
    uploadFolders(files, father)

    function uploadFolders(files, father) {
      upload([].filter.call(files, item => !item.children), father);
      [].forEach.call(files, item => {
        if (item.children) {
          uploadFolders(item.children, father)
        }
      })
    }

    function upload(files, father) {
      [].filter.call(files, i => i.size).forEach(item => {
        var material = util.initData(item, father)
        if (/image/.test(item.type)) {
          material.type = 'image'
          material.iconfilename = URL.createObjectURL(item)
        } else if (/video/.test(item.type)) {
          material.type = 'video'
          var video = document.createElement('video')
          video.setAttribute('src', URL.createObjectURL(item))
          video.playbackRate = 0
          video.mute = true
          video.crossOrigin = 'anonymous'
          video.currentTime = 0
          video.oncanplay = function () {
            video.play()
          }
          video.onplaying = function () {
            var canvas = document.createElement('canvas')
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            var ct = canvas.getContext('2d')
            ct.drawImage(video, 0, 0)
            var icon = canvas.toDataURL('image/jpeg', 0.5)
            material.iconfilename = icon
            video.onplaying = null
            video.pause()
            video = null
            canvas = null
            ct = null
          }
        } else {
          material.type = 'other'
        }
        var index = 0
        var symbol = Symbol('upload')
        context.commit({
          type: TYPES.PUSH_EVENT,
          data: {
            type: TYPES.UPLOAD_FILES,
            target: material
          },
          symbol: symbol
        })
        var fileSuffix = material.name.substring(material.name.lastIndexOf('.'), material.name.lastIndexOf('?') > -1 ? material.name.lastIndexOf('?') : undefined)
        var name = Guid.NewGuid().ToString('N') + (fileSuffix === material.name ? '' : fileSuffix) // + material.name
        var osspath = context.state.s3Path.replace('?', '/cmupload/' + new Date().format('yyyy-MM-dd') + '/' + name + '?') || null
        util.cellUpload(URL1, uploadPath, material.file, name, osspath, (data) => {
          index++
          material.percent = Math.round(index / data.total * 100, 2)
          if (index === data.total) {
            // 此处可优化为发起拼接，防止多节点的情况下不拼接
            $.ajax({
              type: 'post',
              url: URLCONFIG.CM + '/Handler/MaterialList.ashx',
              data: {
                OperationType: 'CombineFiles',
                usertoken: context.userInfo.usercode,
                name: data.name,
                total: data.total,
                path: uploadPath,
                temp: appSetting.TEMPPATH,
                osspath: osspath
              },
              dataType: 'json',
              async: true,
              complete: function () {
                save()
              },
              success: function (data) {
                if (data.R) {
                  // resolve(data)
                }
              }
            })
            var retryTimes = 0
            var filePath = ''
            if (osspath) {
              filePath = osspath
            } else {
              filePath = (nasPath + '\\' + data.name).replace(/\//g, '\\')
            }
            material.name = material.name.substring(0, material.name.lastIndexOf('.') === -1 ? undefined : material.name.lastIndexOf('.')) // qu houzui
            let save = () => {
              retryTimes++
              context.dispatch({
                type: TYPES.SAVE_OBJECTINFO,
                data: {
                  name: material.name,
                  folderPath: father.path,
                  filePath: filePath,
                  fileType: material.file.type
                },
                source: material
              }).then((res) => {
                material.guid = res.data.ext.contentid
                material.uploading = false
                // 获取信息
                util.updateMaterial(getRepository(father.guid), {
                  guid: material.guid
                }, context)
                // 删除事件
                context.commit({
                  type: TYPES.DELETE_EVENT,
                  symbol: symbol
                })
              }).catch((res) => {
                // 提示上传失败 是否删除material？ 或者支持重新上传或者入库 暂时只支持单个素材上传的重试
                if (retryTimes < 1) { // 先自己重试3次
                  save()
                } else {
                  util.Model.confirm(material.name + ' save object failed，try again?', '', save,
                    () => {
                      context.commit({
                        type: TYPES.RECOVERY_EVENT,
                        symbol: symbol
                      })
                    }, {
                      large: true, // Boolean
                      cancelButton: {
                        show: true, // Boolean
                        type: '', // String 请参考 Button
                        text: 'Cancel' // String
                      },
                      confirmButton: {
                        show: true,
                        type: 'primary',
                        text: 'Confirm'
                      }
                    })
                }
              })
            }
          }
          // 更新进度
          // 此处应push event  失败再回退，成功则更新material
          // 入库
        }, () => {
          // 上传失败
          util.Notice.failed('Failed to upload clip', '', 3000)
          context.commit({
            type: TYPES.RECOVERY_EVENT,
            symbol: symbol
          })
        })
        material.uploading = true
        getRepository(father.guid).push(material)
        util.forceUpdate(father.guid)
      })
    }
  },
  [TYPES.GET_SEARCHMODEL](context, payload) {
    return context
      .dispatch({
        type: TYPES.GET_SEARCH_QUERY
      })
      .then(res => {
        let temp = res.find(
          item =>
          item.templateName === 'default' + context.state.userInfo.usercode
        )
        if (temp) {
          res.remove(temp)
        }
        res.forEach(item => {
          item.condition.headers.forEach(item => {
            util.packegeCustomSearchData(item.keyValues)
          })
          item.name = item.templateName
          item.bakCondition = JSON.parse(JSON.stringify(item.condition))
        })
        context.commit({
          type: TYPES.GET_SEARCHMODEL,
          target: payload.source,
          data: res
        })
      })
  },
  [TYPES.GET_SEARCHRESULT](context, payload) {
    let condition = payload.condition || payload.source.condition
    let json
    if (!condition) {
      return
    }
    if (!payload.condition) {
      payload.source.bakCondition = JSON.parse(
        JSON.stringify(payload.source.condition)
      ) //  重置搜索条件
    }
    if (condition.type === 1) {
      let tab = condition.headers.find(item => item.selected)
      let data = util.getAdvanceSearchCondition(tab, condition.node)
      context
        .dispatch({
          type: TYPES.ADVANCE_SEARCH_MATERIALS,
          data: data,
          source: payload.source,
          showWaiting: true
        })
        .then(res => {
          context.commit({
            type: TYPES.SET_MATERIALS,
            target: payload.source,
            data: res
          })
          context.commit({
            type: TYPES.GET_NAVPATH,
            target: payload.source,
            data: []
          })
        })
    } else if (condition.type === 2) {
      json = util.getFulltextSearchCondtion(condition, condition.node, true)
      context
        .dispatch({
          type: TYPES.FULLTEXT_SEARCH_MATERIALS,
          data: {
            json: json
          },
          source: payload.source,
          showWaiting: true
        })
        .then(res => {
          context.commit({
            type: TYPES.SET_MATERIALS,
            target: payload.source,
            data: res
          })
          context.commit({
            type: TYPES.GET_NAVPATH,
            target: payload.source,
            data: []
          })
        })
    } else {
      json = util.getFulltextSearchCondtion(condition, condition.node, false)
      context
        .dispatch({
          type: TYPES.FULLTEXT_SEARCH_MATERIALS,
          data: {
            json: json
          },
          source: payload.source,
          showWaiting: true
        })
        .then(res => {
          context.commit({
            type: TYPES.SET_MATERIALS,
            target: payload.source,
            data: res
          })
          context.commit({
            type: TYPES.GET_NAVPATH,
            target: payload.source,
            data: []
          })
        })
    }
  },
  [TYPES.REFRESH_MATERIAL](context, payload) {
    payload.source = payload.source || context.getters.currentNode
    if (payload.source.guid === 1 || payload.source.guid === 2) {
      return new Promise((resolve, reject) => {
        context
          .dispatch({
            type: TYPES.GET_SEARCHRESULT,
            source: payload.source
          })
          .then(() => {
            resolve()
          })
      })
    } else if (payload.source.guid === -1) {
      return new Promise((resolve, reject) => {
        context
          .dispatch({
            type: TYPES.GET_FAVORITERESULT,
            source: payload.source
          })
          .then(() => {
            resolve()
          })
      })
    } else if (payload.source.guid === 0) {
      return new Promise((resolve, reject) => {
        context
          .dispatch({
            type: TYPES.GET_TRASHCAN_OBJECTS,
            source: payload.source,
            option: {
              hideLoading: payload.option && payload.option.hideLoading
            }
          })
          .then(() => {
            resolve()
          })
      })
    } else {
      return context.dispatch({
        type: TYPES.GET_MATERIALS3,
        source: payload.source,
        alwaysGet: payload.alwaysGet
      })
    }
  },
  [TYPES.UPDATE_MATERIALS](context, payload) {
    let tarr = payload.data.type.split('.')
    if (
      context.state.previewOptions.materials.some(
        i => i.guid === payload.data.guid
      )
    ) {
      context.state.refreshFunc()
    }
    let ding = context.state.linkNodes[0].folders.find(
      i => i.guid === payload.data.guid
    )
    if (ding) {
      context
        .dispatch({
          type: TYPES.GET_DING
        })
        .then(res => {
          let same = res.data.ext.find(i => i.entity.guid === payload.data.guid)
          if (same) {
            ding.name = same.entity.name
            ding.path = same.entity.folderpath + '/' + same.entity.name
          } else {
            context.state.linkNodes[0].folders.remove(ding)
          }
        })
    }

    if (
      context.getters.currentNode.guid === 0 && ['RECYCLED', 'DELETE', 'RECOVERED'].indexOf(tarr[2]) > -1
    ) {
      context.dispatch({
        type: TYPES.REFRESH_MATERIAL,
        source: context.getters.currentNode,
        option: {
          hideLoading: true
        }
      })
    }
    if (tarr[0] === 'TREE' || tarr[0] === 'RESOURCE') {
      if (tarr[2] === 'UPDATE') {
        util.updateMaterial(context.state.nodes, payload.data, context)
        util.updateMaterial(context.state.publicPath, payload.data, context) //  更新save clip 的tree
      } else if (tarr[2] === 'CREATE' || tarr[2] === 'RECOVERED') {
        util.getMaterialFoder(context.state.nodes, payload.data).then(res => {
          if (
            getRepository(res.guid)
            .some(item => (item._guid || item.guid) === payload.data.guid)
          ) {
            util.updateMaterial(
              getRepository(res.guid),
              payload.data,
              context
            )
          } else {
            let node = util.initData(payload.data, res)
            node.type = tarr[0] === 'TREE' ? 'folder' : 'other'
            node.bgtype = node.type
            node.guid = payload.data.guid
            getRepository(res.guid).push(node)
            util.forceUpdate(res.guid)
            node.type === 'folder' && res.folders.push(node)
            util.updateMaterial(
              getRepository(res.guid),
              payload.data,
              context
            )
          }
        })
        //  更新save clip 的tree
        util
          .getMaterialFoder(context.state.publicPath, payload.data)
          .then(res => {
            if (
              res.folders.some(
                item => (item._guid || item.guid) === payload.data.guid
              )
            ) {
              util.updateMaterial(res.folders, payload.data, context)
            } else if (tarr[0] === 'TREE') {
              let node = util.initData(payload.data, res)
              node.type = 'folder'
              node.bgtype = node.type
              node.guid = payload.data.guid
              res.folders.push(node)
              util.updateMaterial(res.folders, payload.data, context)
            }
          })
      } else if (tarr[2] === 'RECYCLED') {
        util.deleteMaterial(context.state.nodes, payload.data)
        util.deleteMaterial(context.state.publicPath, payload.data)
      }
    } else if (tarr[0] !== 'FILEITEM') {
      util.updateMaterial(context.state.nodes, payload.data, context)
      util.updateMaterial(context.state.publicPath, payload.data, context) //  更新save clip 的tree
    }
  },
  //  重命名
  [TYPES.RENAME](context, payload) {
    let url
    if (payload.source.type === 'folder') {
      url = API_CONFIG[TYPES.RENAME]({
          usertoken: context.state.userInfo.usertoken,
          srcpath: payload.source.path,
          name: payload.data
        },
        'folder'
      )
    } else {
      url = API_CONFIG[TYPES.RENAME]({
          usertoken: context.state.userInfo.usertoken,
          contentid: payload.source.guid,
          newobjectname: payload.data
        },
        'object'
      )
    }
    let material = payload.source
    return new Promise((resolve, reject) => {
      axios.get(url).then(res => {
        if (res.data.code === '0') {
          if (
            getRepository(payload.source.guid).length ||
            payload.source.folders.length
          ) {
            //  merge children path
            util.mergeChildrenPath(
              payload.source.hasGetChild ?
              getRepository(payload.source.guid) :
              payload.source.folders,
              payload.source.path
            )
          }
          let json = {
            object: {
              entity: /* object.entity */ {
                guid: material.guid,
                type: material.typeid,
                subtype: material.subtype,
                folderpath: material.folderpath,
                modifier: context.state.userInfo.usercode,
                modifyterminal: context.state.userInfo.ip,
                modifydate: new Date().format('yyyy-MM-dd hh:mm:ss')
              }
            },
            version: 1,
            type: GetEntityType(material.typeid, material.subtype)
          }
          //  修改元数据
          context.dispatch({
            type: TYPES.SAVE_OBJECT_INFO,
            data: json
          })
          resolve(res)
        } else {
          reject(res)
        }
      })
    })
  },
  // 保存SEARCHRESULT搜索模板
  [TYPES.DISPATCH_SAVE_SEARCHRESULT](context, payload) {
    if (payload.target && payload.target.length && payload.target[0].guid === 2) {
      // modify
      context.state.currentTemplate = payload.target[0]
      context.state.saveSearchResultWindow.show('Modify Search Result')
      context.state.saveSearchName = context.state.currentTemplate.name
    } else {
      // 保存
      context.state.currentTemplate = null
      context.state.saveSearchName = 'Search Result 1'
      for (let i = 1; i < 6; i++) {
        if (context.getters.searchResult.searchModel.some(item => item.name === context.state.saveSearchName)) {
          context.state.saveSearchName = 'Search Result ' + (i + 1)
        } else {
          break
        }
      }
      context.dispatch({
        type: TYPES.GET_SEARCH_QUERY
      }).then((res) => {
        var temp = res.find(item => item.templateName === ('default' + context.state.userInfo.usercode))
        if (temp) {
          res.remove(temp)
        }
        if (res.length >= 5) {
          util.Notice.warning('The maximum number of templates is 5', '', 3000)
        } else {
          context.state.saveSearchResultWindow.show('Save Search Result')
        }
      }).catch(() => {})
    }
  },
  //  触发Rename
  [TYPES.DISPATCH_ADD_FOLDER](context, payload) {
    let node
    if (payload.target && payload.target.length) {
      if (payload.target[0].selecting) {
        //  左侧树
        node = payload.target[0]
        context
          .dispatch({
            type: TYPES.GET_MATERIALS,
            source: node
          })
          .then(() => {
            context.commit({
              type: TYPES.GET_NAVPATH,
              target: node,
              data: []
            })
            util.newFolder(context, node)
          })
      } else {
        return false
      }
    } else {
      node = context.getters.currentNode
      util.newFolder(context, node)
    }
  },
  //  新建文件夹
  [TYPES.ADD_FOLDER](context, payload) {
    let url = API_CONFIG[TYPES.ADD_FOLDER]({
      usertoken: context.state.userInfo.usertoken,
      parentpath: payload.source.path,
      name: payload.data
    })
    return new Promise((resolve, reject) => {
      axios.get(url).then(res => {
        if (res.data.code === '0') {
          resolve(res)
        } else {
          reject(res)
        }
      })
    })
  },
  //  删除素材到回收站
  [TYPES.RECYCLE](context, payload) {
    let url = API_CONFIG[TYPES.RECYCLE]({
      usertoken: context.state.userInfo.usertoken
    })
    let promiseArr = []
    let oldlength = payload.target.length
    if (
      !context.state.userInfo.roleType &&
      context.state.userInfo.permission.indexOf(
        PERMISSION.DELETE_FOLDER_TREE
      ) === -1
    ) {
      let folderArr = payload.target.filter(item => item.type === 'folder')
      folderArr.forEach(item => {
        promiseArr.push(
          context
          .dispatch({
            type: TYPES.GET_MATERIALS_BY_PAGE,
            source: item,
            page: 1,
            size: 1
          })
          .then(res => {
            res.data.ext.length && payload.target.remove(item)
            context.state.userInfo.permission.indexOf(
              PERMISSION.DELETE_FOLDER
            ) === -1 && payload.target.remove(item)
          })
        )
      })
    }
    let contentids = []
    Promise.all(promiseArr).then(() => {
      oldlength !== payload.target.length &&
        util.Notice.warning('Some Folders can not be recycle', '', 3000)
      if (payload.target && payload.target.length) {
        payload.target.forEach(item => {
          contentids.push(item.guid)
          getRepository(item.father.guid).remove(item)
          item.type === 'folder' && item.father.folders.remove(item)
        })
        util.forceUpdate(payload.target[0].father.guid)
        if (payload.target[0].father.guid === 0) {
          return context.dispatch({
            type: TYPES.DELETE,
            target: payload.target
          })
        } else if (
          payload.target[0].father.guid === 1 &&
          (contentids[0] + '').length < 32
        ) {
          return context
            .dispatch({
              type: TYPES.DELETE_SEARCH_QUERY,
              data: {
                templateID: payload.target[0].templateId
              }
            })
            .then(res => {
              payload.target[0].father.searchModel.remove(payload.target[0])
            })
            .catch(res => {
              util.Notice.failed('Failed to delete search template', '', 3000)
            })
        } else {
          let body = contentids.join(',')
          //  body  contentid Arr
          let symbol = Symbol('recycle')
          context.commit({
            type: TYPES.PUSH_EVENT,
            data: {
              type: TYPES.RECYCLE,
              from: payload.target[0].father,
              target: payload.target
            },
            symbol: symbol
          })
          return new Promise((resolve, reject) => {
            axios.post(url, JSON.stringify(body)).then(res => {
              if (res.data.code === '0') {
                if (
                  payload.target.some(
                    item => item === context.getters.currentNode
                  )
                ) {
                  let path
                  if (appSetting.USEROOTPATH) {
                    path = context.getters.currentNode.father.path.split('/')
                  } else {
                    path = context.getters.currentNode.father.path
                      .split('/')
                      .slice(1)
                  }
                  util.locateFolder(
                    context,
                    path, {
                      children: context.getters.folderTree
                    }, {
                      isShowWaiting: true
                    }
                  )
                }
                context.commit({
                  type: TYPES.DELETE_EVENT,
                  symbol: symbol
                })
                //  util.Notice.success('recycle to trash success!', '', 3000)
                resolve(res)
              } else {
                context.commit({
                  type: TYPES.RECOVERY_EVENT,
                  symbol: symbol
                })
                util.Notice.warning('Faild to delete clip', '', 3000)
                reject(res)
              }
            })
          })
        }
      }
    })
  },
  //  彻底删除素材
  [TYPES.DELETE](context, payload) {
    let url = API_CONFIG[TYPES.DELETE]({
      usertoken: context.state.userInfo.usertoken
    })
    let contentids = []
    payload.target.forEach(item => {
      contentids.push(item.guid)
      getRepository(item.father.guid).remove(item)
      item.type === 'folder' && item.father.folders.remove(item)
    })
    util.forceUpdate(payload.target[0] && payload.target[0].father.guid)
    let body = contentids.join(',')
    //  body  contentid Arr
    let symbol = Symbol('delete')
    context.commit({
      type: TYPES.PUSH_EVENT,
      data: {
        type: TYPES.DELETE,
        from: payload.target[0].father,
        target: payload.target
      },
      symbol: symbol
    })
    //  body  contentid Arr
    return new Promise((resolve, reject) => {
      axios.post(url, JSON.stringify(body)).then(res => {
        if (res.data.code === '0') {
          context.commit({
            type: TYPES.DELETE_EVENT,
            symbol: symbol
          })
          resolve(res)
        } else {
          context.commit({
            type: TYPES.RECOVERY_EVENT,
            symbol: symbol
          })
          reject(res)
        }
      })
    })
  },
  [TYPES.RESTORE_ALL](context, payload) {
    let arrs = []
    getRepository(context.getters.currentNode.guid)
      .forEach(item => arrs.push(item))
    return context.dispatch({
      type: TYPES.RESTORE,
      target: arrs
    })
  },
  //  从回收站还原素材
  [TYPES.RESTORE](context, payload) {
    let url = API_CONFIG[TYPES.RESTORE]({
      usertoken: context.state.userInfo.usertoken
    })
    let contentids = []
    payload.target.forEach(item => {
      contentids.push(item.guid)
      getRepository(item.father.guid).remove(item)
      item.type === 'folder' && item.father.folders.remove(item)
    })
    util.forceUpdate(payload.target[0] && payload.target[0].father.guid)
    if (contentids.length) {
      let father = payload.target[0].father
      let body = contentids.join(',')
      //  body  contentid Arr
      let symbol = Symbol('restore')
      context.commit({
        type: TYPES.PUSH_EVENT,
        data: {
          type: TYPES.RESTORE,
          from: father,
          target: payload.target
        },
        symbol: symbol
      })
      //  body  contentid Arr
      return new Promise((resolve, reject) => {
        axios.post(url, JSON.stringify(body)).then(res => {
          if (res.data.code === '0') {
            context.commit({
              type: TYPES.DELETE_EVENT,
              symbol: symbol
            })
            resolve(res)
          } else {
            context.commit({
              type: TYPES.RECOVERY_EVENT,
              symbol: symbol
            })
            reject(res)
          }
        })
      })
    }
  },
  // 剪贴
  [TYPES.CUT](context, payload) {
    // push to clipbord
    context.state.selectedMaterials.forEach(item => {
      if (item.operations.indexOf('Cut') === -1) {
        util.Notice.warning(item.name + ' can not be cutted', '', 3000)
        return false
      }
    })
    let materials = context.state.selectedMaterials.filter(
      item => item.operations.indexOf('Cut') > -1
    )
    context.commit({
      type: TYPES.CLEAR_CLIPBOARD
    })
    context.commit({
      type: TYPES.SET_CLIPBOARDSTATUS,
      data: true
    })
    materials.forEach(item => {
      item.cutting = true
      context.commit({
        type: TYPES.ADD_CLIPBOARD,
        data: item
      })
    })
  },
  // 复制
  [TYPES.COPY](context, payload) {
    // push to clipbord
    context.state.selectedMaterials.forEach(item => {
      if (item.operations.indexOf('Copy') === -1) {
        util.Notice.warning(item.name + ' can not be copied', '', 3000)
        return false
      }
    })
    let materials = context.state.selectedMaterials.filter(
      item => item.operations.indexOf('Copy') > -1
    )
    context.commit({
      type: TYPES.CLEAR_CLIPBOARD
    })
    context.commit({
      type: TYPES.SET_CLIPBOARDSTATUS,
      data: false
    })
    materials.forEach(item => {
      item.copping = true
      context.commit({
        type: TYPES.ADD_CLIPBOARD,
        data: item
      })
    })
  },
  [TYPES.MOVE_MATERIALS](context, payload) {
    let arr = payload.data
    let target = payload.target

    // 此处直接移动元素  pushevent
    // event Arr push
    let symbolArr = []
    arr.group(item => item.father.guid).forEach(item => {
      let symbol = Symbol('move')
      context.commit({
        type: TYPES.PUSH_EVENT,
        data: {
          type: TYPES.MOVE_OBJECTS,
          from: item[0].father,
          to: target,
          data: item
        },
        symbol: symbol
      })
      symbolArr.push(symbol)
    })

    arr.forEach(item => {
      let oldFatherGuid = item.father.guid
      getRepository(item.father.guid).remove(item)
      item.type === 'folder' && item.father.folders.remove(item)
      item.father = target
      if (item.type === 'folder') {
        item.floor = target.floor + 1
        item.path = target.path + '/' + item.name
        target.folders.push(item)
        // 暂时不处理子目录，此处应该对齐所有子目录，还原应再次还原
      }
      item.waiting = true // 等待更新
      item.folderpath = target.path
      getRepository(target.guid).push(item)
      util.forceUpdate(oldFatherGuid)
    })
    util.forceUpdate(target.guid)
    let arrs = []
    arr.forEach(item => {
      arrs.push(item.guid)
    })
    context
      .dispatch({
        type: TYPES.MOVE_OBJECTS,
        data: {
          path: target.path,
          contentids: arrs.join(',')
        }
      })
      .then(res => {
        // 删除事件
        arr.forEach(item => {
          util.cleanNode(item)
        })
        symbolArr.forEach(item => {
          context.commit({
            type: TYPES.DELETE_EVENT,
            symbol: item
          })
        })
        //  util.Notice.success(res.data.msg, '', 3000)
      })
      .catch(res => {
        // 还原事件

        symbolArr.forEach(item => {
          context.commit({
            type: TYPES.RECOVERY_EVENT,
            symbol: item
          })
        })
        if (res.data.code === 'B1249') {
          let msg = res.data.msg
          let failedArr = arr
            .filter(item => msg.includes(item.guid))
            .map(item => item.name)
          util.Notice.failed(
            'The folder with same name has been alreay existed',
            failedArr.join(','),
            3000
          )
        } else {
          util.Notice.failed('Failed to move object', '', 3000)
        }
      })
  },
  [TYPES.COPY_MATERIALS](context, payload) {
    let arr = payload.data
    let target = payload.target
    let copiedArr = []
    arr.forEach(item => copiedArr.push(util.copyNode(item)))
    // event Arr push
    let symbol = Symbol('copy')
    context.commit({
      type: TYPES.PUSH_EVENT,
      data: {
        type: TYPES.COPY_OBJECTS,
        to: target,
        data: copiedArr
      },
      symbol: symbol
    })
    context
      .dispatch({
        type: TYPES.COPY_OBJECTS,
        data: {
          target: target,
          materials: copiedArr
        }
      })
      .then(res => {
        // 删除事件
        copiedArr.forEach(item => {
          util.cleanNode(item)
        })
        context.commit({
          type: TYPES.DELETE_EVENT,
          symbol: symbol
        })
        // if (util.isArray(res)) {
        //   res.forEach(item => util.Notice.success('copy success', 'copy success', 3000))
        // } else {
        //   util.Notice.success('copy success', 'copy success', 3000)
        // }
      })
      .catch(res => {
        // 还原事件
        context.commit({
          type: TYPES.RECOVERY_EVENT,
          symbol: symbol
        })
        if (util.isArray(res)) {
          // res.forEach(item => util.Notice.warning('copy failed', 'copy failed', 3000))
        } else {
          // util.Notice.warning('copy failed', 'copy failed', 3000)
        }
        util.Notice.failed('Failed to copy object', '', 3000)
      })
  },
  // 粘贴
  [TYPES.PASTE](context, payload) {
    // paste
    let target =
      payload.target && payload.target.length ?
      payload.target[0] :
      context.getters.currentNode
    if (target.operations.indexOf('Paste') === -1) {
      util.Notice.warning('Can not be pasted in ' + target.name, '', 3000)
      return
    }
    let arr = context.state.clipBoard
    let canPasteArr
    if (context.state.clipBoardSymbol) {
      // 粘贴
      if (arr.length) {
        if (
          arr.every(
            item =>
            util.getAllFather(target).indexOf(item) > -1 ||
            item.guid === target.guid
          )
        ) {
          util.Notice.warning('Can not be pasted in this folder', '', 3000)
        } else if (
          arr.some(
            item =>
            util.getAllFather(target).indexOf(item) > -1 ||
            item.guid === target.guid
          )
        ) {
          canPasteArr = arr.filter(
            item =>
            util.getAllFather(target).indexOf(item) === -1 ||
            item.guid !== target.guid
          )
          util.Model.confirm(
            'Move',
            'Some materials can not be moved, are you sure to move other ' +
            canPasteArr.length +
            ' Materials',
            () => {
              context.dispatch({
                type: TYPES.MOVE_MATERIALS,
                data: canPasteArr,
                target: target
              })
              context.commit({
                type: TYPES.CLEAR_CLIPBOARD
              })
            },
            () => {}, {
              large: true, //  Boolean
              cancelButton: {
                show: true, //  Boolean
                type: '', //  String 请参考 Button
                text: 'Cancel' //  String
              },
              confirmButton: {
                show: true,
                type: 'primary',
                text: 'Confirm'
              }
            }
          )
        } else {
          context.dispatch({
            type: TYPES.MOVE_MATERIALS,
            data: arr,
            target: target
          })
          context.commit({
            type: TYPES.CLEAR_CLIPBOARD
          })
        }
      }
    } else {
      if (
        arr.every(
          item =>
          util.getAllFather(target).indexOf(item) > -1 ||
          item.guid === target.guid
        )
      ) {
        // notice can not paste same folder
        util.Notice.warning('Can not be pasted in this folder', '', 3000)
      } else if (
        arr.some(
          item =>
          util.getAllFather(target).indexOf(item) > -1 ||
          item.guid === target.guid
        )
      ) {
        canPasteArr = arr.filter(
          item =>
          util.getAllFather(target).indexOf(item) === -1 ||
          item.guid !== target.guid
        )
        util.Model.confirm(
          'Move',
          'Some materials can not be copied, are you sure to copy other ' +
          canPasteArr.length +
          ' Materials',
          () => {
            context.dispatch({
              type: TYPES.COPY_MATERIALS,
              data: canPasteArr,
              target: target
            })
          },
          () => {}, {
            large: true, //  Boolean
            cancelButton: {
              show: true, //  Boolean
              type: '', //  String 请参考 Button
              text: 'Cancel' //  String
            },
            confirmButton: {
              show: true,
              type: 'primary',
              text: 'Confirm'
            }
          }
        )
      } else {
        // 复制
        context.dispatch({
          type: TYPES.COPY_MATERIALS,
          data: arr,
          target: target
        })
      }
    }
  },
  // 粘贴
  [TYPES.DOWNLOAD](context, payload) {
    // push to clipbord
    if (payload.target && payload.target.length) {
      payload.target.forEach(item => {
        context
          .dispatch({
            type: TYPES.GET_OBJECT_INFO,
            data: {
              contentid: item.guid,
              pathtype: 'http',
              type: item.typeid
            }
          })
          .then(res => {
            let obj = util.getDownloadUrl(res.data.ext)
            if (obj.isHigh) {
              download()
            } else {
              util.Model.confirm(
                'Download',
                'The hi-res part of "' +
                item.name +
                '" is not available, Do you want to download low-res or proxy?',
                download,
                () => {}, {
                  large: true, //  Boolean
                  cancelButton: {
                    show: true, //  Boolean
                    type: '', //  String 请参考 Button
                    text: 'Cancel' //  String
                  },
                  confirmButton: {
                    show: true,
                    type: 'primary',
                    text: 'Confirm'
                  }
                }
              )
            }

            function download() {
              obj.url.forEach((u, idx) => {
                let ele = document.createElement('a')
                // 对文件名编码
                let pos = u.lastIndexOf('/')
                u =
                  u.substring(0, pos + 1) +
                  encodeURIComponent(decodeURIComponent(u.substring(pos + 1)))
                ele.setAttribute(
                  'href',
                  util.getUrl(u, {
                    download: 1
                  })
                )
                ele.setAttribute('download', item.name)
                ele.setAttribute('target', '_blank')
                document.body.appendChild(ele)
                ele.click()
                document.body.removeChild(ele)
              })
            }
          })
      })
    }
  },
  // 获取导出站点列表
  [TYPES.GET_EXPORTSITES](context, payload) {
    // push to clipbord
    let url = API_CONFIG[TYPES.GET_EXPORTSITES]({
      usertoken: context.state.userInfo.usertoken
    })
    let condition = ''
    if (
      payload.data.depts &&
      !(context.state.userInfo.roleType || context.state.userInfo.opType)
    ) {
      condition =
        ' AND SITEID IN(SELECT SITEID FROM ET_COMMONGWSITE_DATA WHERE (USERID=' +
        payload.data.id +
        ' AND USERTYPE=1) OR (USERID IN (' +
        payload.data.depts +
        ') AND USERTYPE=2))'
    }

    let body =
      '"SELECT DISTINCT * FROM ET_COMMONGWSITE WHERE SITETYPE=1 ' +
      condition +
      '"'
    return new Promise((resolve, reject) => {
      axios.post(url, body).then(res => {
        if (res.data.code === '0') {
          resolve(res)
        } else {
          reject(res)
        }
      })
    })
  },
  // 获取导出站点列表
  [TYPES.GET_FILTER_SETTING](context, payload) {
    // push to clipbord
    let url = API_CONFIG[TYPES.GET_FILTER_SETTING]({
      usertoken: context.state.userInfo.usertoken
    })
    let body = `"SELECT PARAVALUE FROM ET_USERENVIRONMENT  WHERE USERID = ${
      context.state.userInfo.userid
    } AND PARATYPE = '54'"`
    return new Promise((resolve, reject) => {
      axios.post(url, body).then(res => {
        if (res.data.code === '0' && res.data.ext && res.data.ext.length) {
          resolve(res.data.ext[0].PARAVALUE === '1')
        } else {
          reject(res)
        }
      })
    })
  },
  // 获取导出站点列表
  [TYPES.SET_FILTER_SETTING](context, payload) {
    let url = API_CONFIG[TYPES.SET_FILTER_SETTING]({
      usertoken: context.state.userInfo.usertoken
    })
    let body = `"REPLACE ET_USERENVIRONMENT(USERID, PARATYPE, PARAVALUE) VALUES(${
      context.state.userInfo.userid
    }, '54', ${payload.data})"`
    return new Promise((resolve, reject) => {
      axios.post(url, body).then(res => {
        if (res.data.code === '0') {
          resolve(res)
        } else {
          reject(res)
        }
      })
    })
  },
  [TYPES.SAVE_TASK](context, payload) {
    let url = API_CONFIG[TYPES.SAVE_TASK]({
      usertoken: context.state.userInfo.usertoken
    })
    let body = {
      clipname: payload.data.clipname,
      receivedtime: new Date().format('yyyy-MM-dd hh:mm:ss'),
      siteid: payload.data.siteid,
      clipguid: payload.data.clipguid,
      comment: payload.data.comment,
      taskname: payload.data.taskname,
      tasktype: 9,
      taskstatus: 9,
      submitterid: context.state.userInfo.userid,
      hotfolder: payload.data.hotfolder,
      logicpath: payload.data.logicpath,
      taskcondition: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><COMMONGWDATA><CONDITION><INPOINT>' +
        (payload.data.trimin || -1) +
        '</INPOINT><OUTPOINT>' +
        (payload.data.trimout || -1) +
        '</OUTPOINT><CLIPCHANNEL>' +
        payload.data.channel +
        '</CLIPCHANNEL><EXPAND/></CONDITION></COMMONGWDATA>'
    }

    return new Promise((resolve, reject) => {
      axios.put(url, body).then(res => {
        if (res.data.code === '0') {
          // 入taskmonitor
          context.dispatch({
            type: TYPES.ADD_TASK,
            data: {
              contentid: payload.data.clipguid,
              type: 6,
              name: payload.data.clipname,
              items: [{
                Name: 'TaskID',
                Val: res.data.ext
              }]
            }
          })
          resolve(res)
        } else {
          reject(res)
        }
      })
    })
  },
  // 导出到三方站点
  [TYPES.EXPORT](context, payload) {
    let promiseArr = []
    if (payload.target && payload.target.length) {
      context.state.exportMaterials = payload.target
      payload.target.forEach(item => {
        promiseArr.push(
          context
          .dispatch({
            type: TYPES.GET_OBJECT_INFO,
            data: {
              contentid: item.guid,
              pathtype: 'http',
              type: item.typeid
            }
          })
          .then(res => {
            let json = res.data.ext
            if (
              json.entity.item.clipfile &&
              json.entity.item.clipfile.length > 0
            ) {
              let channel = 0
              let channel4Audio = 0
              json.entity.item.clipfile.forEach(i => {
                if (i.mediachannel !== undefined && i.mediachannel !== null) {
                  if (i.clipclass !== 1) {
                    channel4Audio |= i.mediachannel
                  }
                  channel |= i.mediachannel
                }
              })
              let hvFiles = json.entity.item.clipfile.filter(
                item => item.qualitytype === 0 && item.clipclass === 1
              )
              let hvLength = hvFiles.reduce(
                (i, j) => {
                  return {
                    clipin: 0,
                    clipout: i.clipout + j.clipout - i.clipin - j.clipin
                  }
                }, {
                  clipin: 0,
                  clipout: 0
                }
              ).clipout
              let haFiles = json.entity.item.clipfile.filter(
                item =>
                item.qualitytype === 0 &&
                getclipclassType(item.clipclass).startsWith('Audio')
              )
              if (
                (hvFiles.length && hvLength >= json.entity.item.length) ||
                item.subtype === 4
              ) {
                //  subtype 4 只需要有音频高质量
                item.hvFlag = true
              } else {
                item.hvFlag = false
              }
              if (haFiles.length || item.subtype === 2) {
                //  subtype 2 只需要有视频高质量
                item.haFlag = true
              } else {
                item.haFlag = false
              }
              item.CHANNEL = channel
              item.CHANNEL4AUDIO = channel4Audio
            }
          })
        )
      })
      Promise.all(promiseArr).then(res => {
        if (
          context.state.exportInfo.TRIMIN === -1 &&
          !payload.target.every(item => item.hvFlag && item.haFlag)
        ) {
          // 非高质量音视频全
          util.Notice.warning(
            payload.target
            .filter(item => !item.hvFlag || !item.haFlag)
            .map(item => item.name)
            .join(',') + ' Can not export',
            '',
            3000
          )
        } else {
          let depts = util
            .getcurrentDepts(
              context.state.userInfo.usercode,
              context.state.userArr,
              context.state.deptArr
            )
            .map(item => item.deptid)
            .join(',')
          let id = context.state.userInfo.userid & 0x00ffffff
          context
            .dispatch({
              type: TYPES.GET_EXPORTSITES,
              data: {
                id: id,
                depts: depts
              }
            })
            .then(res => {
              context.state.siteList = res.data.ext || []
              context.state.siteList.forEach(item => (item.checked = false))
              context.state.exportInfo = Object.assign(
                context.state.exportInfo, {
                  isUseDefault: true,
                  taskName: '',
                  comments: ''
                }
              )
              context.state.exportWindow.show()
            })
        }
      })
    }
  },
  // 16:9
  [TYPES.SD169](context, payload) {
    // push to clipbord

    if (payload.target && payload.target.length) {
      let imageType = 2
      if (payload.target.every(item => item.img16_9sd)) {
        imageType = 0
      }
      payload.target.forEach(item => {
        if (item.imagetype !== imageType) {
          context
            .dispatch({
              type: TYPES.GET_OBJECT_INFO,
              data: {
                contentid: item.guid,
                pathtype: 'unc',
                type: item.typeid
              }
            })
            .then(res => {
              let obj = res.data.ext.entity.item
              obj.imagetype = imageType
              let data = {
                object: {
                  entity: /* object.entity */ {
                    guid: item.guid,
                    type: item.typeid,
                    subtype: item.subtype,
                    folderpath: item.folderpath,
                    modifier: context.state.userInfo.usercode,
                    modifyterminal: context.state.userInfo.ip,
                    modifydate: new Date().format('yyyy-MM-dd hh:mm:ss'),
                    item: obj
                    // 修改者待补全
                  }
                },
                version: 1,
                type: GetEntityType(item.typeid, item.subtype)
              }
              context
                .dispatch({
                  type: TYPES.SAVE_OBJECT_INFO,
                  data: data
                })
                .then(res => {
                  util.Notice.success(
                    item.name +
                    ' switch to ' +
                    (imageType ? '16:9' : '4:3') +
                    ' successfully',
                    '',
                    3000
                  )
                })
                .catch(res => {
                  util.Notice.warning(
                    item.name +
                    ' failed to switch to ' +
                    (imageType ? '16:9' : '4:3'),
                    '',
                    3000
                  )
                })
            })
        }
      })
    }
  },
  // 入库
  [TYPES.SAVE_OBJECTINFO](context, payload) {
    return new Promise((resolve, reject) => {
      let filepath = payload.data.filePath
      let fileType = payload.data.fileType
      let logicPath = payload.data.folderPath
      let name = payload.data.name

      let type = 'biz_sobey_video'
      let subType = ClipSubType.ET_CLIPTYPE_UNKNOW
      let cliptype = ObjectType.ET_ObjType_Clip
      let fileSuffix = filepath
        .substring(
          filepath.lastIndexOf('.') + 1,
          filepath.lastIndexOf('?') > -1 ? filepath.lastIndexOf('?') : undefined
        )
        .toLowerCase()

      if (fileType.indexOf('image') > -1) {
        type = 'biz_sobey_picture'
        subType = ClipSubType.ET_CLIPTYPE_IMAGE
      } else if (
        [
          'bmp',
          'dip',
          'jpg',
          'jpeg',
          'jpe',
          'jfif',
          'jif',
          'tif',
          'tiff',
          'png',
          'tga',
          'psd'
        ].indexOf(fileSuffix) > -1
      ) {
        type = 'biz_sobey_picture'
        subType = ClipSubType.ET_CLIPTYPE_IMAGE
      } else if (fileType.indexOf('video') > -1) {
        type = 'biz_sobey_video'
        subType = ClipSubType.ET_CLIPTYPE_AV
      } else if (
        [
          'avi',
          'mxf',
          'mov',
          'mp4',
          'mpg',
          'rmvb',
          '3g2',
          'm2p',
          'vob',
          'f4v',
          'mkv',
          'flv',
          'm2v',
          'ps',
          'ts',
          'es',
          'rm',
          'gxf',
          'mts',
          'm2ts',
          'm2t'
        ].indexOf(fileSuffix) > -1
      ) {
        type = 'biz_sobey_video'
        subType = ClipSubType.ET_CLIPTYPE_AV
      } else if (fileType.indexOf('audio') > -1) {
        type = 'biz_sobey_audio'
        subType = ClipSubType.ET_CLIPTYPE_A
      } else if (['aif', 'aiff', 'mid'].indexOf(fileSuffix) > -1) {
        type = 'biz_sobey_audio'
        subType = ClipSubType.ET_CLIPTYPE_A
      } else if (fileType.indexOf('pdf') > -1) {
        // pdf
        type = 'biz_sobey_document'
        subType = ClipSubType.ET_CLIPTYPE_PDF
      } else if (['doc', 'docx'].indexOf(fileSuffix) > -1) {
        subType = ClipSubType.ET_CLIPTYPE_WORD
        type = 'biz_sobey_document'
      } else if (['xls', 'xlsx'].indexOf(fileSuffix) > -1) {
        subType = ClipSubType.ET_CLIPTYPE_EXCEL
        type = 'biz_sobey_document'
      } else if (['ppt', 'pptx'].indexOf(fileSuffix) > -1) {
        subType = ClipSubType.ET_CLIPTYPE_PPT
        type = 'biz_sobey_document'
      } else if (['pdf'].indexOf(fileSuffix) > -1) {
        subType = ClipSubType.ET_CLIPTYPE_PDF
        type = 'biz_sobey_document'
      } else if (['txt'].indexOf(fileSuffix) > -1) {
        subType = ClipSubType.ET_CLIPTYPE_TXT
        type = 'biz_sobey_document'
      } else if (fileType.indexOf('officedocument') > -1) {
        // office
        type = 'biz_sobey_document'
        if (['doc', 'docx'].indexOf(fileSuffix) > -1) {
          subType = ClipSubType.ET_CLIPTYPE_WORD
        } else if (['xls', 'xlsx'].indexOf(fileSuffix) > -1) {
          subType = ClipSubType.ET_CLIPTYPE_EXCEL
        } else if (['ppt', 'pptx'].indexOf(fileSuffix) > -1) {
          subType = ClipSubType.ET_CLIPTYPE_PPT
        } else if (['pdf'].indexOf(fileSuffix) > -1) {
          subType = ClipSubType.ET_CLIPTYPE_PDF
        }
      } else if (
        ['zip', 'rar', '7z', 'cab', 'tar', 'dmg', 'ace', 'lzh'].indexOf(
          fileSuffix
        ) > -1
      ) {
        subType = ClipSubType.ET_CLIPTYPE_ZIP
        type = 'biz_sobey_other'
      } else if (fileSuffix === 'prproj') {
        type = 'biz_sobey_other'
        subType = ClipSubType.ET_CLIPTYPE_PREMIERE
      } else if (fileSuffix === 'aep') {
        type = 'biz_sobey_other'
        subType = ClipSubType.ET_CLIPTYPE_AE
      } else {
        type = 'biz_sobey_other'
        subType = ClipSubType.ET_CLIPTYPE_OTHER
      }
      // else if (fileSuffix === "csv")// TODO
      // {
      //     subType = ClipSubType.ET_CLIPTYPE_WORD
      //     type = "biz_sobey_document"
      // }
      // else if (fileSuffix === "rtf")// TODO
      // {
      //     subType = ClipSubType.ET_CLIPTYPE_WORD
      //     type = "biz_sobey_document"
      // }

      let json = {
        type: type,
        version: 1,
        object: {
          entity: {
            folderpath: logicPath,
            guid: Guid.NewGuid().ToString('N'),
            modifyterminal: context.state.userInfo.ip,
            name: name,
            status: 0,
            subtype: subType,
            type: cliptype,
            usedflag: 0
          }
        }
      }
      if (payload.source) {
        payload.source.type = util.getMaterialType(json.object.entity)
      }
      if (subType === ClipSubType.ET_CLIPTYPE_IMAGE) {
        json.object.entity.item = {
          capturestatus: 0,
          videostandard: 16,
          trimin: 0,
          trimout: 40000000,
          length: 863999600000,
          clipfile: [{
            qualitytype: 0,
            filestatus: 0,
            clipclass: 1,
            filename: filepath,
            mediachannel: 1
          }]
        }
      } else {
        json.object.entity.item = {
          capturestatus: 0,
          clipfile: [{
            qualitytype: 0,
            filestatus: 0,
            clipclass: 1,
            filename: filepath,
            mediachannel: 1
          }]
        }
      }
      if (type === 'biz_sobey_audio' || type === 'biz_sobey_video') {
        context
          .dispatch({
            type: TYPES.GET_IMPORT_INFO,
            data: json
          })
          .then(res => {
            let resJson = res.data.ext
            if (
              resJson &&
              resJson.object &&
              resJson.object.entity &&
              resJson.object.entity.item
            ) {
              let videostandard = resJson.object.entity.item.videostandard
              if (!ET_VideoStandardIsHD(videostandard)) {
                resJson.object.entity.item.imagetype = 0
              } else {
                resJson.object.entity.item.imagetype = 4
              }
              context
                .dispatch({
                  type: TYPES.SAVE_OBJECT_INFO,
                  data: resJson
                })
                .then(res => {
                  // 获取低质量  入taskmonitor  更新素材
                  context
                    .dispatch({
                      type: TYPES.GENERATING_LOW_BITRATE,
                      data: res.data.ext.contentid
                    })
                    .then(res => {
                      // util.Notice.success(res.data.msg, '', 3000)
                    })
                    .catch(res => {
                      util.Notice.warning(
                        'Failed to generate Low-Res file',
                        '',
                        3000
                      )
                    })
                  // 入taskmonitor
                  context.dispatch({
                    type: TYPES.ADD_TASK,
                    data: {
                      contentid: res.data.ext.contentid,
                      messageid: res.data.ext.messageid,
                      type: 1,
                      name: name
                    }
                  })
                  resolve(res)
                  // util.Notice.success(res.data.msg, '', 3000)
                })
                .catch(res => {
                  reject(res)
                  util.Notice.failed('Analyzing file failed', '', 3000)
                })
            }
          })
          .catch(res => {
            reject(res)
            util.Notice.failed('Importing metadata failed', '', 3000)
          })
      } else {
        context
          .dispatch({
            type: TYPES.SAVE_OBJECT_INFO,
            data: json
          })
          .then(res => {
            // 入taskmonitor
            context.dispatch({
              type: TYPES.ADD_TASK,
              data: {
                contentid: res.data.ext.contentid,
                messageid: res.data.ext.messageid,
                type: 1,
                name: name
              }
            })
            resolve(res)
            // util.Notice.success(res.data.msg, '', 3000)
          })
          .catch(res => {
            reject(res)
            util.Notice.failed('Importing metadata failed', '', 3000)
          })
      }
    })
  },
  [TYPES.GET_IMPORT_INFO](context, payload) {
    let url = API_CONFIG[TYPES.GET_IMPORT_INFO]({
      usertoken: context.state.userInfo.usertoken
    })
    let body = payload.data
    // body  contentid Arr
    return new Promise((resolve, reject) => {
      axios.post(url, body).then(res => {
        if (res.data.code === '0') {
          resolve(res)
        } else {
          reject(res)
        }
      })
    })
  },
  [TYPES.GENERATING_LOW_BITRATE](context, payload) {
    let url = API_CONFIG[TYPES.GENERATING_LOW_BITRATE]({
      usertoken: context.state.userInfo.usertoken
    })
    // body  contentid Arr
    return new Promise((resolve, reject) => {
      axios.get(url).then(res => {
        if (res.data.code === '0') {
          resolve(res)
        } else {
          reject(res)
        }
      })
    })
  },
  [TYPES.ADD_TASK](context, payload) {
    let url = API_CONFIG[TYPES.ADD_TASK]({
      usertoken: context.state.userInfo.usertoken
    })
    let body = {
      TaskRquest: {
        TaskGuid: Guid.NewGuid().ToString('N'),
        RefTaskGuid: payload.data.contentid,
        StudioID: payload.data.studioid || null,
        MessageID: payload.data.messageid || null,
        TaskName: payload.data.name,
        TaskType: payload.data.type,
        CreateTime: new Date().format('yyyy-MM-dd hh:mm:ss'),
        CreateUserCode: context.state.userInfo.usercode,
        CreateUserName: context.state.userInfo.username,
        AttributeItems: payload.data.items || null
      },
      RequestID: '00000000-0000-0000-0000-000000000000',
      IsMultiple: false,
      IsCompleted: true,
      CommandName: 'TaskMonitorPlugin.AddTaskRequest'
    }

    // body  contentid Arr
    return new Promise((resolve, reject) => {
      axios.post(url, body).then(res => {
        if (res.data.IsSuccess) {
          resolve(res)
        } else {
          reject(res)
        }
      })
    })
  },
  [TYPES.MULTI_SELECTITEMS](context, payload) {
    let material
    let start = Math.max(Math.min(context.state.signIndex, payload.data), 0)
    let end = Math.min(
      Math.max(context.state.signIndex, payload.data),
      context.getters.displayMaterials.length - 1
    )
    context.state.isFocusTree = false // 切换焦点
    if (context.state.signIndex === start || !context.state.signIndex) {
      for (let i = start; i <= end; i++) {
        material = context.getters.displayMaterials[i]
        material.selected = true
        context.commit({
          type: TYPES.ADD_SELECTEDITEM,
          data: material
        })
      }
    } else {
      for (let i = end; i >= start; i--) {
        material = context.getters.displayMaterials[i]
        material.selected = true
        context.commit({
          type: TYPES.ADD_SELECTEDITEM,
          data: material
        })
      }
    }
  },
  [TYPES.MULTI_SELECTMARKERS](context, payload) {
    let start = Math.max(
      Math.min(context.state.signMarkerIndex, payload.data),
      0
    )
    let markers = payload.markers
    let end = Math.min(
      Math.max(context.state.signMarkerIndex, payload.data),
      markers.length - 1
    )
    for (let i = start; i <= end; i++) {
      let material = markers[i]
      material.selected = true
      context.commit({
        type: TYPES.ADD_SELECTEDMARKER,
        data: material
      })
    }
  },
  [TYPES.MOVE_OBJECTS](context, payload) {
    let url = API_CONFIG[TYPES.MOVE_OBJECTS]({
      usertoken: context.state.userInfo.usertoken,
      desfolderpath: payload.data.path
    })
    // body  contentid Arr
    return new Promise((resolve, reject) => {
      axios.post(url, JSON.stringify(payload.data.contentids)).then(res => {
        if (res.data.code === '0') {
          resolve(res)
        } else {
          reject(res)
        }
      })
    })
  },
  [TYPES.COPY_OBJECTS](context, payload) {
    let promiseArr = []
    let materials = payload.data.materials
    let target = payload.data.target

    context.commit({
      type: TYPES.CLEAR_SELECTEEDITEMS
    })
    materials.forEach(item => {
      // 选中复制后的素材
      item.selected = true
      context.commit({
        type: TYPES.ADD_SELECTEDITEM,
        data: item
      })
      let children = context.getters.displayMaterials
      context.commit({
        type: TYPES.SET_SIGNMATERIAL,
        data: children.indexOf(item)
      })

      if (item.type !== 'folder') {
        promiseArr.push(() => util.copyObject(context, item, target))
      } else {
        promiseArr.push(() => util.copyFolder(context, item, target))
      }
    })
    return new Promise((resolve, reject) => {
      util
        .throttleAjax(promiseArr, false, true)
        .then(res => {
          resolve(res)
        })
        .catch(res => {
          reject(res)
        })
    })
  },
  [TYPES.SAVE_OBJECT_INFO](context, payload) {
    let url = API_CONFIG[TYPES.SAVE_OBJECT_INFO]({
      usertoken: context.state.userInfo.usertoken
    })
    let body = payload.data

    // body  contentid Arr
    return new Promise((resolve, reject) => {
      axios.post(url, body).then(res => {
        if (res.data.code === '0') {
          resolve(res)
        } else {
          reject(res)
        }
      })
    })
  },
  [TYPES.GET_TRASHCAN_OBJECTS](context, payload) {
    let hideLoading = payload.option && payload.option.hideLoading;
    !hideLoading && util.startLoading(context)
    let resultArr = []
    let promiseArr = []
    return new Promise((resolve, reject) => {
      context
        .dispatch({
          type: TYPES.GET_TRASHCAN_OBJECTS_BY_PAGE,
          name: payload.name,
          page: 1,
          size: 500
        })
        .then(res => {
          resultArr = resultArr.concat(
            util.parseTrashCanData(res.data.ext.resultList, payload.source)
          )
          let totalPage = res.data.totalPage
          for (let i = 2; i <= totalPage; i++) {
            promiseArr.push(() =>
              context
              .dispatch({
                type: TYPES.GET_TRASHCAN_OBJECTS_BY_PAGE,
                page: i,
                size: 500
              })
              .then(res => {
                resultArr = resultArr.concat(
                  util.parseTrashCanData(
                    res.data.ext.resultList,
                    payload.source
                  )
                )
              })
            )
          }
          util
            .throttleAjax(promiseArr)
            .then(res => {
              util.stopLoading(context)
              context.commit({
                type: TYPES.SET_MATERIALS,
                target: payload.source,
                data: resultArr
              })
              resolve(resultArr)
            })
            .catch(res => {
              util.stopLoading(context)
              util.Notice.failed('Failed to get obejcts', '', 3000)
              reject(res)
            })
        })
        .catch(res => {
          util.stopLoading(context)
          util.Notice.failed('Failed to get obejcts', '', 3000)
          reject(res)
        })
    })
  },
  [TYPES.GET_TRASHCAN_OBJECTS_BY_PAGE](context, payload) {
    let url = API_CONFIG[TYPES.GET_TRASHCAN_OBJECTS_BY_PAGE]({
      usertoken: context.state.userInfo.usertoken,
      pathtype: 'http'
    })
    let body = {
      name: '',
      orderBy: '',
      page: payload.page,
      size: payload.size,
      sort: ''
    }
    return new Promise((resolve, reject) => {
      axios
        .post(url, body)
        .then(res => {
          if (res.data.code === '0') {
            resolve(res)
          } else if (res.data.code === 'CNR0001') {
            res.data.ext = []
            resolve(res)
          } else {
            reject(res)
          }
        })
        .catch(res => reject(res))
    })
  },
  [TYPES.CLEAR_TRASHCAN_OBJECTS](context, payload) {
    let url = API_CONFIG[TYPES.CLEAR_TRASHCAN_OBJECTS]({
      usertoken: context.state.userInfo.usertoken
    })
    let target = payload.target.length ?
      payload.target[0] :
      context.getters.currentNode
    // body  contentid Arr
    let symbol = Symbol('clear trashcan')
    context.commit({
      type: TYPES.PUSH_EVENT,
      data: {
        type: TYPES.DELETE,
        from: target,
        target: getRepository(target.guid)
      },
      symbol: symbol
    })
    setRepository(target.guid, [])
    util.forceUpdate(target.guid)
    return new Promise((resolve, reject) => {
      axios.post(url, null).then(res => {
        if (res.data.code === '0') {
          context.commit({
            type: TYPES.DELETE_EVENT,
            symbol: symbol
          })
          resolve(res)
        } else {
          context.commit({
            type: TYPES.DELETE_EVENT,
            symbol: symbol
          })
          reject(res)
        }
      })
    })
  },
  [TYPES.OPEN_FOLDER](context, payload) {
    if (payload.target && payload.target.length) {
      if (payload.target[0].operations.indexOf('Open') === -1) {
        util.Notice.warning('Can not open ' + payload.target[0].name, '', 3000)
        return false
      }
    }
    if (appSetting.USEROOTPATH) {
      util.locateFolder(
        context,
        payload.target[0].path.split('/'), {
          children: context.getters.folderTree
        }, {
          isShowWaiting: true,
          linkNode: payload.target[0].isDing ? payload.target[0] : null,
          isSilent: payload.target[0].isDing
        }
      )
    } else {
      util.locateFolder(
        context,
        payload.target[0].path.split('/').slice(1), {
          children: context.getters.folderTree
        }, {
          isShowWaiting: true,
          linkNode: payload.target[0].isDing ? payload.target[0] : null,
          isSilent: payload.target[0].isDing
        }
      )
    }
  },
  [TYPES.SET_SORTTYPE](context, payload) {
    context.state.listOrder.disabled = true
    switch (payload.data.name) {
      case 'Title' + '  ↑':
        context.state.sortType = 'title'
        context.state.sortSymbol = true
        break
      case 'Title' + '  ↓':
        context.state.sortType = 'title'
        context.state.sortSymbol = false
        break
      case 'Create Time' + '  ↑':
        context.state.sortType = 'createTime'
        context.state.sortSymbol = true
        break
      case 'Create Time' + '  ↓':
        context.state.sortType = 'createTime'
        context.state.sortSymbol = false
        break
      case 'Type':
        context.state.sortType = 'type'
        context.state.TYPESymbol = !context.state.TYPESymbol
        break
      default:
        context.state.markerOrder.type = payload.data.name
    }
    let lastVisit = util.getCookie(
      'last_visit' + context.state.userInfo.usercode
    )
    if (lastVisit) {
      lastVisit = JSON.parse(lastVisit)
      lastVisit.sortType = context.state.sortType
      lastVisit.TYPESymbol = context.state.TYPESymbol
      lastVisit.sortSymbol = context.state.sortSymbol
      lastVisit.markerOrder = context.state.markerOrder
      util.setCookie(
        'last_visit' + context.state.userInfo.usercode,
        JSON.stringify(lastVisit)
      )
    }
    context.commit({
      type: TYPES.SET_SIGNMATERIAL,
      data: 0
    })
  },
  [TYPES.SELECT_MATERIAL](context, payload) {
    let index = payload.data < 0 ? 0 : payload.data
    let children = context.getters.displayMaterials

    index = index < children.length - 1 ? index : children.length - 1

    if (index > -1 && index < children.length) {
      context.commit({
        type: TYPES.CLEAR_SELECTEEDITEMS
      })
      children[index].selected = true
      context.commit({
        type: TYPES.ADD_SELECTEDITEM,
        data: children[index]
      })
      context.commit({
        type: TYPES.SET_SIGNMATERIAL,
        data: index
      })
    }
  },
  [TYPES.DISPATCH_UPLOAD](context, payload) {
    if (payload.target && payload.target.length) {
      let material = payload.target[0]
      if (appSetting.USEROOTPATH) {
        util.locateFolder(
          context,
          material.path.split('/'), {
            children: context.getters.folderTree
          }, {
            isShowWaiting: true
          }
        )
      } else {
        util.locateFolder(
          context,
          material.path.split('/').slice(1), {
            children: context.getters.folderTree
          }, {
            isShowWaiting: true
          }
        )
      }
    }
    $('.upload_input').click()
  },
  [TYPES.DETAIL_VIEW](context, payload) {
    context
      .dispatch({
        type: TYPES.OPEN_PLAYER,
        target: payload.target,
        data: {
          isDV: true,
          previewSymbol: true
        }
      })
      .then(res => {
        res && res.forEach && res.forEach(f => f()) // 执行设置properties
      })
      .catch(res => {
        console.log(res)
        util.Notice.warning('Can not preiew', '', 3000)
      })
  },
  [TYPES.SET_ARCHIVETYPE](context, payload) {
    switch (payload.data.name) {
      case 'Online':
        if (payload.data.checked) {
          context.state.archiveFiters.Online = true
        } else {
          context.state.archiveFiters.Online = false
        }
        break
      case 'HDD':
        if (payload.data.checked) {
          context.state.archiveFiters.HDD = true
        } else {
          context.state.archiveFiters.HDD = false
        }
        break
      case 'ODA':
        if (payload.data.checked) {
          context.state.archiveFiters.ODA = true
        } else {
          context.state.archiveFiters.ODA = false
        }
        break
        //  case 'Archive':
        //    if (payload.data.checked) {
        //      context.state.archiveFiters.Archived = true
        //    } else {
        //      context.state.archiveFiters.Archived = false
        //    }
        //    break
        // default:
    }
    if (context.state.archiveFiters.ODA || context.state.archiveFiters.HDD) {
      context.state.archiveFiters.double = true
    } else {
      context.state.archiveFiters.double = false
    }
    util.setCookie(
      'archive_filters' + context.state.userInfo.usercode,
      JSON.stringify(context.state.archiveFiters)
    )
  },
  [TYPES.SET_STAMPBYFRAME](context, payload) {
    let url = API_CONFIG[TYPES.SET_STAMPBYFRAME]({
      contentid: payload.data.guid,
      usertoken: context.state.userInfo.usertoken,
      groupname: payload.data.groupname || 'videogroup'
    })
    return new Promise((resolve, reject) => {
      axios.post(url, payload.data.json).then(res => {
        if (res.data.code === '0') {
          // util.Notice.success('Set stamp success', '', 3000)
          resolve(res)
        } else {
          util.Notice.warning('Failed to set stamp', '', 3000)
          reject(res)
        }
      })
    })
  },
  [TYPES.RETRIEVE](context, payload) {
    if (payload.target && payload.target.length) {
      context
        .dispatch({
          type: TYPES.GET_BAR_CODE,
          data: payload.target
        })
        .then(res => {
          let barcodeContent =
            '<div class="clearfix barcode-list">' +
            res
            .map(
              item =>
              item ? '<div class="barcode-item fl">' + item + '</div>' : ''
            )
            .join('') +
            '</div>'
          util.Model.confirmWithHTML(
            'Retrieve',
            '<div>Selected material(s) is ready to be retrieved, please put below cartridge into the ODA Library to start auto-retrieving.</div>' +
            barcodeContent,
            () => {},
            () => {}, {
              large: true, //  Boolean
              confirmButton: {
                show: true,
                type: 'primary',
                text: 'OK'
              },
              cancelButton: {
                show: false, //  Boolean
                type: '', //  String 请参考 Button
                text: 'Cancel' //  String
              }
            }
          )
        })
        .catch(res => console.log(res))
      payload.target.forEach(item => {
        let url = API_CONFIG[TYPES.RETRIEVE]({
          contentId: item.guid,
          usertoken: context.state.userInfo.usertoken
        })
        axios.get(url).then(res => {
          if (res.data.code === '0') {
            util.updateMaterial(
              getRepository(item.father.guid), {
                guid: item.guid
              },
              context
            ) // 现在要10s左右后才更新到元数据，此处待完善
            util.Notice.success(item.name + ' retrieved successfully', '', 3000)
          } else {
            util.Notice.failed('Retrieving ' + item.name + ' failed', '', 3000)
          }
        })
      })
    }
  },
  [TYPES.PART_RETRIEVE](context, payload) {
    let url = API_CONFIG[TYPES.PART_RETRIEVE]({
      contentid: payload.data.contentid,
      usertoken: context.state.userInfo.usertoken,
      targetpath: payload.data.targetpath || '',
      trimin: payload.data.trimin,
      trimout: payload.data.trimout,
      newcontentid: payload.data.newcontentid
    })
    let guid = payload.data.newcontentid

    return new Promise((resolve, reject) => {
      context
        .dispatch({
          type: TYPES.GET_BAR_CODE,
          data: [{
            guid: payload.data.contentid,
            type: 'video' //  for filegroupname
          }]
        })
        .then(res => {
          let barcodeContent =
            '<div class="clearfix barcode-list">' +
            res
            .map(
              item =>
              item ? '<div class="barcode-item fl">' + item + '</div>' : ''
            )
            .join('') +
            '</div>'
          util.Model.confirmWithHTML(
            'Retrieve',
            '<div>Selected material(s) is ready to be retrieved, please put below cartridge into the ODA Library to start auto-retrieving.</div>' +
            barcodeContent,
            () => {},
            () => {}, {
              large: true, //  Boolean
              confirmButton: {
                show: true,
                type: 'primary',
                text: 'OK'
              },
              cancelButton: {
                show: false, //  Boolean
                type: '', //  String 请参考 Button
                text: 'Cancel' //  String
              }
            }
          )
        })
        .catch(res => console.log(res))
      axios.get(url).then(res => {
        if (res.data.code === '0') {
          util.Notice.success('Retrieve successfully', '', 3000)
          resolve(res)
        } else {
          let msg = 'Failed to retrieve'
          if (res.data.code === 'B1221') {
            msg = 'There is not enough space to retrieve the clip!'
          }
          util.Notice.warning(msg, '', 3000)
          url = API_CONFIG[TYPES.RECYCLE]({
            usertoken: context.state.userInfo.usertoken
          })
          let arr = [guid]
          return new Promise((resolve, reject) => {
            axios.post(url, JSON.stringify(arr)).then(res => {
              if (res.data.code === '0') {
                resolve(res)
              } else {
                reject(res)
              }
            })
          })
        }
      })
    })
  },
  [TYPES.UPDATE_MARKERPOINTS](context, payload) {
    let url = API_CONFIG[TYPES.UPDATE_MARKERPOINTS]({
      contentid: payload.data.guid,
      usertoken: context.state.userInfo.usertoken
    })
    return new Promise((resolve, reject) => {
      axios.post(url, payload.data.json).then(res => {
        if (res.data.code === '0') {
          // util.Notice.success('update markerpoints success', '', 3000)
          resolve(res)
        } else {
          util.Notice.failed('Failed to update marker', '', 3000)
          reject(res)
        }
      })
    })
  },
  [TYPES.DELETE_MARKERPOINTS](context, payload) {
    let url = API_CONFIG[TYPES.DELETE_MARKERPOINTS]({
      contentid: payload.data.guid,
      usertoken: context.state.userInfo.usertoken
    })
    return new Promise((resolve, reject) => {
      axios.delete(url, JSON.stringify(payload.data.json)).then(res => {
        if (res.data.code === '0') {
          // util.Notice.success('delete markerpoints success', '', 3000)
          resolve(res)
        } else {
          util.Notice.failed('Failed to delete marker', '', 3000)
          reject(res)
        }
      })
    })
  },
  [TYPES.GET_FILESIZE](context, payload) {
    let material = payload.source
    let url
    if (material.type === 'folder') {
      url = API_CONFIG[TYPES.GET_FILESIZE]({
          contentid: material.guid,
          usertoken: context.state.userInfo.usertoken
        },
        'folder'
      )
    } else {
      url = API_CONFIG[TYPES.GET_FILESIZE]({
          clipguid: material.guid,
          usertoken: context.state.userInfo.usertoken
        },
        'object'
      )
    }
    return new Promise((resolve, reject) => {
      axios.get(url).then(res => {
        if (res.data.code === '0') {
          resolve(res)
          // util.Notice.success('get file size success', '', 3000)
        } else {
          reject(res)
          util.Notice.failed('Failed to get file size', '', 3000)
        }
      })
    })
  },
  [TYPES.IS_PERMISSION](context, payload) {
    let url = API_CONFIG[TYPES.IS_PERMISSION]({
      contentid: payload.source.guid,
      usertoken: context.state.userInfo.usertoken
    })
    return new Promise((resolve, reject) => {
      axios.get(url).then(res => {
        if (res.data.code === '0') {
          resolve(res)
          // util.Notice.success('get permission success', '', 3000)
        } else {
          reject(res)
          util.Notice.failed('Failed to get content permission', '', 3000)
        }
      })
    })
  },
  [TYPES.GET_PLANNING_INFO](context, payload) {
    let url = API_CONFIG[TYPES.GET_PLANNING_INFO]({
      GUID: payload.source.planningguid,
      usertoken: context.state.userInfo.usertoken
    })
    return new Promise((resolve, reject) => {
      axios.get(url).then(res => {
        if (res.data.code === '0') {
          resolve(res)
          // util.Notice.success('get planning success', '', 3000)
        } else {
          reject(res)
          util.Notice.failed('Failed to get planning info', '', 3000)
        }
      })
    })
  },
  [TYPES.GET_FILEFORMAT](context, payload) {
    let url = API_CONFIG[TYPES.GET_FILEFORMAT]({
      lformatid: payload.data.formatid,
      usertoken: context.state.userInfo.usertoken
    })
    return new Promise((resolve, reject) => {
      axios.get(url).then(res => {
        if (res.data.code === '0') {
          resolve(res)
          // util.Notice.success('get planning success', '', 3000)
        } else {
          reject(res)
          util.Notice.failed('Failed to get file format', '', 3000)
        }
      })
    })
  },
  [TYPES.LOCK_OBEJCTS](context, payload) {
    let url = API_CONFIG[TYPES.LOCK_OBEJCTS]({
      isLock: payload.data.isLock,
      usertoken: context.state.userInfo.usertoken
    })
    let promiseArr = []
    payload.source.forEach(item => {
      let body = {
        objguid: item.guid,
        locktype: item.type === 'h5pgm' || item.type === 'sequence' ? '4000' : '4010', // payload.data.locktype || '4010',
        loginid: context.state.userInfo.logininfoid,
        usercode: context.state.userInfo.usercode,
        lockip: context.state.userInfo.ip,
        hivelockguid: ''
      }
      promiseArr.push(
        new Promise((resolve, reject) => {
          axios.post(url, body).then(res => {
            if (res.data.code === '0') {
              resolve(res)
              // util.Notice.success('get planning success', '', 3000)
            } else {
              reject(res)
              util.Notice.failed('This object has been occupied', '', 3000)
            }
          })
        })
      )
    })

    return Promise.all(promiseArr)
  },
  [TYPES.SET_PERMISSION](context, payload) {
    return new Promise((resolve, reject) => {
      let rights = payload.source.properties.find(
        item => item.name === 'Rights'
      ).keyValues
      let p = ''
      let pg = []
      let url = API_CONFIG[TYPES.SET_PERMISSION]({
          type: payload.source.type === 'folder' ? 2 : 1,
          usertoken: context.state.userInfo.usertoken
        },
        rights.checkbox.checked
      )
      if (rights.radio[2].checked) {
        p =
          context.state.userInfo.privilege ||
          'private_' + context.state.userInfo.usercode // payload.source.creatorCode
        util.getCheckedCode(pg, rights.access[0].deptTree, false)
        util.getCheckedCode(pg, rights.access[1].deptTree, true)
        if (!pg.length) {
          reject(pg)
          // p = rights.radio[1].privilege
        }
      } else {
        p =
          rights.radio.find(i => i.checked).privilege ||
          'private_' + context.state.userInfo.usercode // payload.source.creatorCode 跟ML一致，修改为私有时，权限为修改者
      }
      let body = {
        privilege: p,
        privilegestr: pg.join(','),
        contentId: payload.source.guid
      }
      axios.post(url, body).then(res => {
        if (res.data.code === '0') {
          resolve(res)
        } else {
          reject(res)
        }
      })
    })
  },
  [TYPES.SET_MARKER_STAMP](context, payload) {
    let url = API_CONFIG[TYPES.SET_MARKER_STAMP]({
      contentid: payload.data.guid,
      usertoken: context.state.userInfo.usertoken,
      groupname: payload.data.groupname || 'videogroup'
    })
    return new Promise((resolve, reject) => {
      axios.post(url, payload.data.json).then(res => {
        if (res.data.code === '0') {
          resolve(res)
        } else {
          reject(res)
        }
      })
    })
  },
  [TYPES.GET_TRASHCAN_OBJECT_INFO](context, payload) {
    let url = API_CONFIG[TYPES.GET_TRASHCAN_OBJECT_INFO]({
      contentid: payload.data.contentid,
      usertoken: context.state.userInfo.usertoken,
      pathtype: payload.data.pathtype || 'http'
    })
    return new Promise((resolve, reject) => {
      axios.get(url).then(res => {
        if (res.data.code === '0') {
          resolve(res)
        } else {
          reject(res)
        }
      })
    })
  },
  [TYPES.COPY_OBJECT](context, payload) {
    let url = API_CONFIG[TYPES.COPY_OBJECT]({
      contentid: payload.source.__guid || payload.source.guid,
      usertoken: context.state.userInfo.usertoken,
      desfolderpath: payload.target.path
    })
    return new Promise((resolve, reject) => {
      axios.post(url, payload.data).then(res => {
        if (res.data.code === '0') {
          resolve(res)
        } else {
          reject(res)
        }
      })
    })
  },
  [TYPES.OPEN_PATH](context, payload) {
    if (payload.target && payload.target.length) {
      context.state.previewSymbol = true
      Vue.nextTick(() => {
        let pathList
        let material = payload.target[0]
        if (appSetting.USEROOTPATH) {
          pathList = material.folderpath.split('/')
        } else {
          pathList = material.folderpath.split('/').slice(1)
        }
        util.locateFolder(
          context,
          pathList, {
            children: context.getters.folderTree
          }, {
            materialGuids: [material.guid],
            isPreview: true,
            isShowWaiting: true
          }
        )
      })
    }
  },
  [TYPES.GET_TIMECODE_INFO](context, payload) {
    let URL = URLCONFIG.CM + '/Handler/MaterialList.ashx'
    return new Promise((resolve, reject) => {
      $.ajax({
        type: 'post',
        url: URL,
        data: {
          OperationType: 'GetTimeCodeInfo',
          usertoken: context.state.userInfo.usertoken,
          url: btoa(payload.data.url)
        },
        dataType: 'json',
        async: true,
        complete: function () {},
        success: function (data) {
          if (data.R) {
            resolve(data)
          }
        }
      })
    })
  },
  [TYPES.MARKER_EXPORT](context, payload) {
    if (appSetting.USEROOTPATH) {
      util.locateFolder(
        context,
        context.state.exportInfo.material.folderpath.split('/'), {
          children: context.state.publicPath
        }, {
          onlyFolder: true,
          alwaysGet: true,
          isCheck: true
        }
      )
    } else {
      util.locateFolder(
        context,
        context.state.exportInfo.material.folderpath.split('/').slice(1), {
          children: context.state.publicPath
        }, {
          onlyFolder: true,
          alwaysGet: true,
          isCheck: true
        }
      )
    }
    context.state.exportInfo.isSaveFrame = false
    context.state.exportInfo.isMarks2Clip = true
    context.state.saveClipWindow.show('Marks to Clip')
    // context.state.markerExportWindow.show()
  },
  [TYPES.DISPATCH_SAVE_FRAME_AS_CLIP](context, payload) {
    if (appSetting.USEROOTPATH) {
      util.locateFolder(
        context,
        context.state.exportInfo.material.folderpath.split('/'), {
          children: context.state.publicPath
        }, {
          onlyFolder: true,
          alwaysGet: true,
          isCheck: true
        }
      )
    } else {
      util.locateFolder(
        context,
        context.state.exportInfo.material.folderpath.split('/').slice(1), {
          children: context.state.publicPath
        }, {
          onlyFolder: true,
          alwaysGet: true,
          isCheck: true
        }
      )
    }
    context.state.exportInfo.isSaveFrame = true
    context.state.exportInfo.isMarks2Clip = false
    context.state.exportInfo.isRetrieve = false
    context.state.saveClipWindow.show('Save Picture')
  },
  [TYPES.SAVE_AS_NEW_CLIP](context, payload) {
    if (appSetting.USEROOTPATH) {
      util.locateFolder(
        context,
        context.state.exportInfo.material.folderpath.split('/'), {
          children: context.state.publicPath
        }, {
          onlyFolder: true,
          alwaysGet: true,
          isCheck: true
        }
      )
    } else {
      util.locateFolder(
        context,
        context.state.exportInfo.material.folderpath.split('/').slice(1), {
          children: context.state.publicPath
        }, {
          onlyFolder: true,
          alwaysGet: true,
          isCheck: true
        }
      )
    }
    context.state.exportInfo.isSaveFrame = false
    context.state.exportInfo.isMarks2Clip = false
    context.state.exportInfo.isRetrieve = false
    context.state.saveClipWindow.show('Save As')
  },
  [TYPES.DISPATCH_RETRIEVE](context, payload) {
    if (appSetting.USEROOTPATH) {
      util.locateFolder(
        context,
        context.state.exportInfo.material.folderpath.split('/'), {
          children: context.state.publicPath
        }, {
          onlyFolder: true,
          alwaysGet: true,
          isCheck: true
        }
      )
    } else {
      util.locateFolder(
        context,
        context.state.exportInfo.material.folderpath.split('/').slice(1), {
          children: context.state.publicPath
        }, {
          onlyFolder: true,
          alwaysGet: true,
          isCheck: true
        }
      )
    }
    context.state.exportInfo.isSaveFrame = false
    context.state.exportInfo.isMarks2Clip = false
    context.state.exportInfo.isRetrieve = true
    context.state.saveClipWindow.show('Retrieve')
  },
  [TYPES.MARKERS_TO_CLIP](context, payload) {
    let url = API_CONFIG[TYPES.MARKERS_TO_CLIP]({})
    return payload.data.isLive ?
      context.dispatch({
        type: TYPES.LIVE_TRIM,
        data: payload.data
      }) :
      new Promise((resolve, reject) => {
        axios.post(url, payload.data).then(res => {
          if (res.data.code === '0') {
            resolve(res)
          } else {
            reject(res)
          }
        })
      })
  },
  [TYPES.SAVE_AS_NEWCLIP](context, payload) {
    let url = API_CONFIG[TYPES.SAVE_AS_NEWCLIP]({
      trimin: payload.data.nanoSecIn,
      trimout: payload.data.nanoSecOut // 这个接口要传百纳秒
    })
    return payload.data.isLive ?
      context.dispatch({
        type: TYPES.LIVE_TRIM,
        data: payload.data
      }) :
      new Promise((resolve, reject) => {
        axios.post(url, payload.data).then(res => {
          if (res.data.code === '0') {
            resolve(res)
          } else {
            reject(res)
          }
        })
      })
  },
  [TYPES.GET_ICONSOURCE](context, payload) {
    let url = API_CONFIG[TYPES.GET_ICONSOURCE]({
      pathtype: 'http'
    })
    return new Promise((resolve, reject) => {
      axios.post(url, JSON.stringify(payload.data)).then(res => {
        if (res.data.code === '0') {
          resolve(res)
        } else {
          reject(res)
        }
      })
    })
  },
  [TYPES.GET_MARK_ICONSOURCE](context, payload) {
    let url = API_CONFIG[TYPES.GET_MARK_ICONSOURCE]({
      pathtype: 'http'
    })
    return new Promise((resolve, reject) => {
      axios.post(url, payload.data).then(res => {
        if (res.data.code === '0') {
          resolve(res)
        } else {
          reject(res)
        }
      })
    })
  },
  [TYPES.TRIM_SEND_TO_MPC](context, payload) {
    let url = API_CONFIG[TYPES.TRIM_SEND_TO_MPC]({
      contentid: payload.data.contentid
    })
    return new Promise((resolve, reject) => {
      axios.post(url, {}).then(res => {
        if (res.data.code === '0') {
          resolve(res)
        } else {
          reject(res)
        }
      })
    })
  },
  [TYPES.LIVE_TRIM](context, payload) {
    let url = API_CONFIG[TYPES.LIVE_TRIM]({
      trimin: payload.data.trimin,
      trimout: payload.data.trimout
    })
    return new Promise((resolve, reject) => {
      axios.post(url, payload.data).then(res => {
        if (res.data.code === '0') {
          resolve(res)
        } else {
          reject(res)
        }
      })
    })
  },
  [TYPES.GET_TRASHCAN_FILELIST](context, payload) {
    let url = API_CONFIG[TYPES.GET_TRASHCAN_FILELIST]({
      contentid: payload.data.contentid,
      usertoken: context.state.userInfo.usertoken,
      pathtype: payload.data.pathtype || 'http'
    })
    return new Promise((resolve, reject) => {
      axios.get(url).then(res => {
        if (res.data.code === '0' && res.data.ext) {
          resolve(res)
        } else {
          reject(res)
        }
      })
    })
  },
  [TYPES.GET_TASK](context, payload) {
    let url = API_CONFIG[TYPES.GET_TASK]({
      usertoken: context.state.userInfo.usertoken
    })
    let body = {
      taskGuid: '',
      taskType: payload.data.taskType || 0,
      status: payload.data.status || -1,
      dtStart: payload.data.startTime || 0,
      dtEndTime: payload.data.endTime || 0,
      PageIndex: payload.data.pageIndex || 1,
      PageSize: payload.data.pageSize || 10,
      orderField: 0, // 列表名排序
      orderType: 0, // 排序类型
      userCode: btoa(context.state.userinfo.usercode),
      keyWords: payload.data.keywords || '',
      RequestID: '00000000-0000-0000-0000-000000000000',
      IsMultiple: false,
      IsCompleted: true,
      CommandName: 'TaskMonitorPlugin.GetTaskRequest'
    }

    // body  contentid Arr
    return new Promise((resolve, reject) => {
      axios.post(url, body).then(res => {
        if (res.data.IsSuccess) {
          resolve(res)
        } else {
          reject(res)
        }
      })
    })
  },
  [TYPES.DELETE_TASK](context, payload) {
    let url = API_CONFIG[TYPES.GET_TASK]({
      usertoken: context.state.userInfo.usertoken
    })
    let body = {
      taskGuidList: payload.data.taskGuidArr,
      taskGuid: '',
      IsMultiple: false,
      IsCompleted: true,
      CommandName: 'TaskMonitorPlugin.DeleteTaskRequest'
    }

    // body  contentid Arr
    return new Promise((resolve, reject) => {
      axios.post(url, body).then(res => {
        if (res.data.IsSuccess) {
          resolve(res)
        } else {
          reject(res)
        }
      })
    })
  },
  // always get new
  [TYPES.ADVANCE_SEARCH_MATERIALS](context, payload) {
    payload.showWaiting && util.startLoading(context)
    let resultArr = []
    let promiseArr = []
    payload.data.json.page = 1
    payload.data.json.size = 500
    return new Promise((resolve, reject) => {
      context
        .dispatch({
          type: TYPES.ADVANCE_SEARCH_MATERIALS_BY_PAGE,
          data: payload.data
        })
        .then(res => {
          resultArr = resultArr.concat(
            util.parseData(
              res.data.ext,
              payload.source,
              payload.data.isMarker ? 'mark' : ''
            )
          )
          let totalPage = res.data.totalPage
          for (let i = 2; i <= totalPage; i++) {
            let json = JSON.parse(JSON.stringify(payload.data))
            json.json.page = i
            promiseArr.push(() =>
              context
              .dispatch({
                type: TYPES.ADVANCE_SEARCH_MATERIALS_BY_PAGE,
                data: json
              })
              .then(res => {
                resultArr = resultArr.concat(
                  util.parseData(
                    res.data.ext,
                    payload.source,
                    payload.data.isMarker ? 'mark' : ''
                  )
                )
              })
            )
          }
          util
            .throttleAjax(promiseArr)
            .then(res => {
              util.stopLoading(context)
              resolve(resultArr)
            })
            .catch(res => {
              util.stopLoading(context)
              util.Notice.failed('Failed to get obejcts', '', 3000)
              reject(res)
            })
        })
        .catch(res => {
          util.stopLoading(context)
          // util.Notice.failed('Failed to get obejcts', '', 3000)
          resolve([])
        })
    })
  },
  [TYPES.ADVANCE_SEARCH_MATERIALS_BY_PAGE](context, payload) {
    let url = API_CONFIG[TYPES.ADVANCE_SEARCH_MATERIALS_BY_PAGE](
      payload.data.isMarker, {
        usertoken: context.state.userInfo.usertoken,
        pathtype: 'http'
      }, {
        usertoken: context.state.userInfo.usertoken,
        path: [292, 293, 294].indexOf(payload.data.json.subtype) > -1 ?
          '' : payload.data.path,
        type: payload.data.type,
        pathtype: 'http'
      }
    )

    context.getters.searchResult.operations.add(
      'Save Search Result',
      'Show OA File'
    )
    return new Promise((resolve, reject) => {
      axios
        .post(url, payload.data.json, false, {
          IsHighLight: true
        })
        .then(res => {
          if (res.data.code === '0') {
            resolve(res)
          } else {
            reject(res)
          }
        })
        .catch(res => {
          reject(res)
        })
    })
  },
  [TYPES.SET_SEARCH_QUERY](context, payload) {
    // 保存
    let url = API_CONFIG[TYPES.SET_SEARCH_QUERY]({
      maximum: 6
    })
    return new Promise((resolve, reject) => {
      axios.post(url, payload.data.json).then(res => {
        if (res.data && !res.data.code) {
          resolve(res.data)
        } else {
          reject(res)
        }
      })
    })
  },
  [TYPES.GET_SEARCH_QUERY](context, payload) {
    // 保存
    let url = API_CONFIG[TYPES.SET_SEARCH_QUERY]({})
    return new Promise((resolve, reject) => {
      axios.get(url).then(res => {
        if (res.data && !res.data.code) {
          resolve(res.data)
        } else {
          resolve([])
        }
      })
    })
  },
  [TYPES.MODIFY_SEARCH_QUERY](context, payload) {
    // 保存
    if (!payload.data.templateID) {
      return context.dispatch({
        type: TYPES.SET_SEARCH_QUERY,
        data: payload.data
      })
    }
    let url = API_CONFIG[TYPES.MODIFY_SEARCH_QUERY](payload.data.templateID)
    return new Promise((resolve, reject) => {
      axios.put(url, payload.data.json).then(res => {
        if (res.data && !res.data.code) {
          resolve(res.data)
        } else {
          reject(res)
        }
      })
    })
  },
  [TYPES.DELETE_SEARCH_QUERY](context, payload) {
    // 保存
    let url = API_CONFIG[TYPES.MODIFY_SEARCH_QUERY](payload.data.templateID)
    return axios.delete(url)
  },
  [TYPES.GET_CUSTOM_SEARCH_CONDTION](context, payload) {
    // 保存
    let url = API_CONFIG[TYPES.GET_CUSTOM_SEARCH_CONDTION]({})
    return new Promise((resolve, reject) => {
      axios.get(url).then(res => {
        if (res.data.code === '0') {
          resolve(res)
        } else {
          res.data.ext = []
          resolve(res)
        }
      })
    })
  },
  // always get new
  [TYPES.FULLTEXT_SEARCH_MATERIALS](context, payload) {
    if (payload.data.json.isTrashCan) {
      context.getters.searchResult.operations.add('Save Search Result')
      return context.dispatch({
        type: TYPES.GET_TRASHCAN_OBJECTS,
        name: payload.data.json.name,
        source: context.state.trashcan
      })
    } else {
      context.getters.searchResult.operations.add('Save Search Result', 'Show OA File')
      payload.showWaiting && util.startLoading(context)
      let resultArr = []
      let promiseArr = []
      payload.data.json.page = 1
      payload.data.json.size = 500
      return new Promise((resolve, reject) => {
        context
          .dispatch({
            type: TYPES.FULLTEXT_SEARCH_MATERIALS_BY_PAGE,
            data: payload.data
          })
          .then(res => {
            resultArr = resultArr.concat(
              util.parseData(res.data.ext, payload.source)
            )
            let totalPage = res.data.totalPage
            for (let i = 2; i <= totalPage; i++) {
              let json = JSON.parse(JSON.stringify(payload.data))
              json.json.page = i
              promiseArr.push(() =>
                context
                .dispatch({
                  type: TYPES.FULLTEXT_SEARCH_MATERIALS_BY_PAGE,
                  data: json
                })
                .then(res => {
                  resultArr = resultArr.concat(
                    util.parseData(res.data.ext, payload.source)
                  )
                })
              )
            }
            util
              .throttleAjax(promiseArr)
              .then(res => {
                util.stopLoading(context)
                resolve(resultArr)
              })
              .catch(res => {
                util.stopLoading(context)
                util.Notice.failed('Failed to get obejcts', '', 3000)
                reject(res)
              })
          })
          .catch(res => {
            util.stopLoading(context)
            // util.Notice.failed('Failed to get obejcts', '', 3000)
            resolve([])
          })
      })
    }
  },
  [TYPES.FULLTEXT_SEARCH_MATERIALS_BY_PAGE](context, payload) {
    let url = API_CONFIG[TYPES.FULLTEXT_SEARCH_MATERIALS_BY_PAGE]({
      usertoken: context.state.userInfo.usertoken,
      pathtype: 'http'
    })
    return new Promise((resolve, reject) => {
      axios
        .post(url, payload.data.json, false, {
          IsHighLight: true
        })
        .then(res => {
          if (res.data.code === '0') {
            resolve(res)
          } else {
            reject(res)
          }
        })
        .catch(res => {
          reject(res)
        })
    })
  },
  [TYPES.SAVE_FRAME_AS_CLIP](context, payload) {
    let url = API_CONFIG[TYPES.SAVE_FRAME_AS_CLIP]({
      usertoken: context.state.userInfo.usertoken,
      filename: payload.data.filename,
      iconno: payload.data.iconno,
      extendname: payload.data.extendname,
      fileformatid: payload.data.fileformatid
    })
    return new Promise((resolve, reject) => {
      axios
        .post(url, payload.data.json)
        .then(res => {
          if (res.data.code === '0') {
            resolve(res)
          } else {
            reject(res)
          }
        })
        .catch(res => {
          reject(res)
        })
    })
  },
  [TYPES.DISPATCH_SAVE_PICTURE](context, payload) {
    context.state.player && context.state.player.$refs.player.saveFrame()
  },
  [TYPES.DISPATCH_SET_FRAME](context, payload) {
    context.state.player && context.state.player.$refs.player.setStamp()
  },
  [TYPES.DISPATCH_FULLSCREEN](context, payload) {
    context.state.player && context.state.player.$refs.player.enterFullscreen()
  },
  [TYPES.DISPATCH_EXIT_FULLSCREEN](context, payload) {
    context.state.player && context.state.player.$refs.player.exitFullscreen()
  },
  [TYPES.GET_DING](context, payload) {
    let url = API_CONFIG[TYPES.GET_DING]({
      usercode: context.state.userInfo.usercode
    })
    return new Promise((resolve, reject) => {
      axios
        .get(url)
        .then(res => {
          if (res.data.code === '0') {
            resolve(res)
          } else {
            reject(res)
          }
        })
        .catch(res => {
          reject(res)
        })
    })
  },
  [TYPES.SET_DING](context, payload) {
    let url = API_CONFIG[TYPES.SET_DING]({
      usercode: context.state.userInfo.usercode,
      contentid: payload.source.guid
    })
    return new Promise((resolve, reject) => {
      axios
        .post(url)
        .then(res => {
          if (res.data.code === '0') {
            resolve(res)
          } else {
            reject(res)
          }
        })
        .catch(res => {
          reject(res)
        })
    })
  },
  [TYPES.DELETE_DING](context, payload) {
    let url = API_CONFIG[TYPES.DELETE_DING]({
      usercode: context.state.userInfo.usercode,
      contentid: payload.source.guid
    })
    return new Promise((resolve, reject) => {
      axios
        .delete(url)
        .then(res => {
          if (res.data.code === '0') {
            resolve(res)
          } else {
            reject(res)
          }
        })
        .catch(res => {
          reject(res)
        })
    })
  },
  [TYPES.GET_DING_COUNT](context, payload) {
    let url = API_CONFIG[TYPES.GET_DING_COUNT]({
      usercode: context.state.userInfo.usercode
    })
    return new Promise((resolve, reject) => {
      axios
        .get(url)
        .then(res => {
          if (res.data.code === '0') {
            resolve(res)
          } else {
            reject(res)
          }
        })
        .catch(res => {
          reject(res)
        })
    })
  },
  [TYPES.DISPATCH_SET_DING](context, payload) {
    let linkRoot = context.state.linkNodes[0]
    context
      .dispatch({
        type: TYPES.GET_DING_COUNT
      })
      .then(res => {
        let count = res.data.ext
        if (count + payload.target.length > 20) {
          util.Notice.warning(
            'The maximum number of quick links is 20',
            '',
            3000
          )
        } else {
          payload.target.forEach(item => {
            context
              .dispatch({
                type: TYPES.SET_DING,
                source: item
              })
              .then(res => {
                let copiedItem = util.initData({
                    name: item.name
                  },
                  linkRoot
                )
                Object.assign(copiedItem, item)
                copiedItem.father = {}
                copiedItem.selected = false
                copiedItem.checked = false
                copiedItem.selecting = false
                copiedItem.isDing = true
                copiedItem.operations = ['Open', 'Remove']
                linkRoot.folders.push(copiedItem)
              })
          })
        }
      })
  },
  [TYPES.DISPATCH_DELETE_DING](context, payload) {
    let linkRoot = context.state.linkNodes[0]
    payload.target.forEach(item => {
      context
        .dispatch({
          type: TYPES.DELETE_DING,
          source: item
        })
        .then(res => {
          linkRoot.folders.remove(item)
        })
    })
  },
  [TYPES.SET_OA_FILTER](context, payload) {
    context.state.showOAMaterials = payload.data.checked
    context.dispatch({
      type: TYPES.SET_FILTER_SETTING,
      data: context.state.showOAMaterials ? '1' : '0'
    })
  },
  [TYPES.GET_BAR_CODE](context, payload) {
    let url = API_CONFIG[TYPES.GET_BAR_CODE]({})
    let groupDic = {
      video: 'videogroup',
      image: 'picturegroup',
      txtfile: 'documentgroup',
      word: 'documentgroup',
      excel: 'documentgroup',
      pdf: 'documentgroup',
      rar: 'othersgroup',
      project: 'othersgroup',
      aeproject: 'othersgroup',
      other: 'othersgroup'
    }
    return new Promise((resolve, reject) => {
      axios
        .post(
          url,
          payload.data.map(item => {
            let groupname = 'videogroup'
            if (item.isAudio) {
              groupname = 'audiogroup'
            } else {
              groupname = groupDic[item.type]
            }
            return {
              contentId: item.guid,
              fileGroupName: groupname
            }
          })
        )
        .then(res => {
          if (
            res.data.code === '0' &&
            res.data.ext.some(item =>
              item.TapeList.some(i => i.TapeStatus !== 1)
            )
          ) {
            let list = res.data.ext.map(item => item.TapeList)
            let barcodeArr = Array.prototype.concat
              .apply([], list)
              .filter(i => i.TapeStatus !== 1)
              .groupBy('Barcode')
              .map(i => i[0].Barcode)
            resolve(barcodeArr)
          } else {
            reject(res)
          }
        })
        .catch(res => {
          reject(res)
        })
    })
  },
  [TYPES.GET_ORDER_LIST](context, payload) {
    return Promise.resolve()
  },
  [TYPES.GENERATE_PROXY](context, payload) {
    let url = API_CONFIG[TYPES.GENERATE_PROXY]({})
    let replyUrl = API_CONFIG[TYPES.GET_TASK]()
    return new Promise((resolve, reject) => {
      axios
        .post(
          url,
          JSON.stringify(payload.source.map(item => item.guid).join(',')),
          false, {
            username: context.state.userInfo.username,
            usercode: context.state.userInfo.usercode,
            'reply-to': replyUrl
          }
        )
        .then(res => {
          if (res.data.code === '0') {
            resolve(res)
          } else {
            reject(res)
          }
        })
        .catch(res => {
          reject(res)
        })
    })
  },
  [TYPES.DISPATCH_GENERATE_PROXY](context, payload) {
    if (payload.target.length > 5000) {
      util.Notice.warning(
        'The task number exceeds the restriction of 5000!',
        '',
        3000
      )
    } else {
      context
        .dispatch({
          type: TYPES.GENERATE_PROXY,
          source: payload.target
        })
        .then(res => {
          util.Notice.success('Generate proxy success!', '', 3000)
        })
        .catch(res => util.Notice.failed('Generate proxy failed!', '', 3000))
    }
  },
  [TYPES.ADD_GENERATION](context, payload) {
    let url = API_CONFIG[TYPES.ADD_GENERATION]({})
    let body = {
      contentid: payload.source.guid,
      sourcetype: payload.source.type,
      type: 'ClipToClip',
      relations: [{
        contentid: payload.target.guid,
        type: payload.target.type
      }]
    }
    return new Promise((resolve, reject) => {
      axios
        .post(url, body)
        .then(res => {
          if (res.data.code === '0') {
            resolve(res)
          } else {
            reject(res)
          }
        })
        .catch(res => {
          reject(res)
        })
    })
  },
  [TYPES.GET_GENERATION](context, payload) {
    let url = API_CONFIG[TYPES.GET_GENERATION]({
      pathtype: 'http'
    })
    let body = {
      start: {
        guid: payload.source.guid
      },
      maxdept: 1
    }
    return new Promise((resolve, reject) => {
      axios
        .post(url, body)
        .then(res => {
          if (res.data.code === '0') {
            resolve(res)
          } else {
            reject(res)
          }
        })
        .catch(res => {
          reject(res)
        })
    })
  },
  [TYPES.DISPATCH_ONE_GENERATION](context, payload) {
    let material = payload.target[0]
    context.state.relations = []
    context
      .dispatch(TYPES.GET_GENERATION, {
        source: material
      })
      .then(res => {
        context.state.relations = util.getRelations(
          res.data.ext.map(item => item.entityinfo)
        )
      })
      .catch(res => {
        util.Notice.failed('Query relations failed!', '', 3000)
      })
    context.state.relationsWindow.show()
  },
  [TYPES.GET_CUSTOM_METADATA](context, payload) {
    let url = API_CONFIG[TYPES.GET_CUSTOM_METADATA]({
      ObjType: payload.data.type,
      usertoken: context.state.userInfo.usercode
    })
    return new Promise((resolve, reject) => {
      axios.get(url).then(res => {
        if (res.data.code === '0') {
          resolve(res)
        } else {
          reject(res)
          util.Notice.failed(
            'Failed to get the squence of customized metadata',
            '',
            3000
          )
        }
      })
    })
  },
  [TYPES.GET_PLAYER_INFO](context, payload) {
    let promiseArr = []
    let propPromiseArr = []
    let type = 'video'
    let opt = {
      loop: false,
      clipping: false,
      isLive: false,
      mpdSource: {
        src: '',
        video: {}
      },
      materials: [emptyMaterial],
      source: [],
      lock: false
    }

    if (payload.target && payload.target.length) {
      if (payload.target[0].guid === 0 || payload.target[0].guid === 1) {
        opt.materials = payload.target
        opt.type = type
        context.state.previewOptions = opt
        util.getProperties(
          [{
            data: {
              ext: {
                entity: {
                  guid: payload.target[0].guid
                }
              }
            }
          }],
          payload.target,
          [],
          type,
          context
        )
      } else if (payload.target[0].father.guid === 0) {
        //  回收站素材
        type = payload.target[0].previewType
        if (
          type === 'video' &&
          !payload.target.every(
            item =>
            item.framerate === payload.target[0].framerate &&
            item.isAudio === payload.target[0].isAudio &&
            item.previewType === 'video'
          )
        ) {
          util.Notice.warning('Can not preiew', '', 3000)
        } else if (payload.target.every(item => item.previewType === 'other')) {
          util.Notice.warning('Can not preiew', '', 3000)
        } else {
          payload.data &&
            payload.data.previewSymbol &&
            (0, (context.state.previewSymbol = payload.data.previewSymbol))
          payload.data &&
            payload.data.isDV &&
            (1, (context.state.detailviewSymbol = payload.data.isDV))
          Vue.nextTick(() => {
            context.commit({
              type: TYPES.SET_THUMBPADDING
            })
          })
          context.commit({
            type: TYPES.SET_DVPADDING
          })
          context.state.isFocusTree = false
          context.state.isFocusPlayer = true
          payload.target.forEach(item => {
            promiseArr.push(
              context.dispatch({
                type: TYPES.GET_TRASHCAN_OBJECT_INFO,
                data: {
                  contentid: item.guid,
                  pathtype: 'http',
                  type: item.typeid
                }
              })
            )
            propPromiseArr.push(
              context.dispatch({
                type: TYPES.GET_TRASHCAN_FILELIST,
                data: {
                  contentid: item.guid,
                  pathtype: 'http',
                  type: item.typeid
                }
              })
            )
          })
        }

        return new Promise((resolve, reject) => {
          Promise.all(promiseArr)
            .then(res => {
              //  opt.source = []
              opt.materials = payload.target.slice()
              opt.type = type
              Promise.all(propPromiseArr)
                .then(r => {
                  opt.source = util.getTrashcanPreviewInfo(
                    res,
                    r,
                    payload.target,
                    type,
                    context
                  )
                  if (payload.target.some(item => item.clipping)) {
                    opt.clipping = true
                  } else {
                    opt.clipping = false
                  }
                  let time =
                    payload.data &&
                    payload.data.isRefresh &&
                    context.state.player.$refs.player.currentTime
                  let isClippingComplete =
                    payload.data.isRefresh &&
                    util.isMpd(context.state.previewOptions.source[0].src) &&
                    !util.isMpd(opt.source[0].src)
                  if (util.isMpd(opt.source[0].src)) {
                    opt.isLive = true
                  } else {
                    if (isClippingComplete) {
                      opt.isLive = true
                    } else {
                      opt.isLive = false
                    }
                  }
                  time &&
                    Vue.nextTick(() =>
                      setTimeout(
                        () =>
                        (context.state.player.$refs.player.currentTime = time),
                        0
                      )
                    )
                  //  if (time) {
                  //    context.state.previewOptions.initTime = time
                  //  }
                  if (!payload.data || !payload.data.isRefresh) {
                    context.state.playerHistory.push(Object.assign({}, opt))
                  }
                  if (!isClippingComplete) {
                    context.state.previewOptions = opt
                  }
                  resolve()
                })
                .catch(res => {
                  reject(res)
                })
            })
            .catch(res => {
              reject(res)
            })
        })
      } else {
        type = payload.target.some(item => item.previewType === 'video') ?
          'video' :
          payload.target[0].previewType
        if (
          type === 'video' &&
          !payload.target.every(
            item =>
            item.framerate === payload.target[0].framerate &&
            item.isAudio === payload.target[0].isAudio &&
            item.previewType === 'video'
          )
        ) {
          util.Notice.warning('Can not preiew', '', 3000)
          context.state.previewOptions = opt
          return
        } else if (
          type === 'video' &&
          payload.target.length > 1 &&
          payload.target.some(item => item.clipping)
        ) {
          util.Notice.warning(
            'Ingesting material does not support combination previews',
            '',
            3000
          )
          context.state.previewOptions = opt
          return
        } else {
          payload.data &&
            payload.data.previewSymbol &&
            (0, (context.state.previewSymbol = payload.data.previewSymbol))
          payload.data &&
            payload.data.isDV &&
            (1, (context.state.detailviewSymbol = payload.data.isDV))
          Vue.nextTick(() => {
            context.commit({
              type: TYPES.SET_THUMBPADDING
            })
          })
          context.commit({
            type: TYPES.SET_DVPADDING
          })
          context.state.isFocusTree = false
          context.state.isFocusPlayer = true
          payload.target.forEach(item => {
            promiseArr.push(
              context.dispatch({
                type: TYPES.GET_OBJECT_INFO,
                data: {
                  contentid: item.guid,
                  pathtype: 'http',
                  type: item.typeid
                }
              })
            )
            propPromiseArr.push(
              context.dispatch({
                type: TYPES.GET_OBJECT_INFO,
                data: {
                  contentid: item.guid,
                  pathtype: 'unc',
                  type: item.typeid
                }
              })
            )
          })
        }

        return new Promise((resolve, reject) => {
          Promise.all(promiseArr)
            .then(res1 => {
              //  context.state.previewOptions.source = []
              opt.materials = payload.target.slice()
              opt.type = type
                //  unc
                !payload.data.onlyPlayer &&
                Promise.all(propPromiseArr)
                .then(res => {
                  let typeArr = payload.target.groupBy('subtype')
                  let result = []
                  let pArr = []
                  typeArr.forEach(i => {
                    let entities = []
                    i.forEach(j =>
                      entities.push(
                        res.find(k => k.data.ext.entity.guid === j.guid)
                      )
                    )
                    pArr.push(
                      context
                      .dispatch({
                        type: TYPES.GET_CUSTOM_METADATA,
                        data: {
                          type: GetEntityType(i[0].typeid, i[0].subtype)
                        }
                      })
                      .then(r => {
                        let models = r.data.ext
                        result.push(
                          ...util.getProperties(
                            entities,
                            i,
                            models,
                            type,
                            context,
                            res1
                          )
                        )
                      })
                      .catch(res => {
                        reject(res)
                      })
                    )
                  })
                  Promise.all(pArr).then(res => resolve(result))
                })
                .catch(res => {
                  reject(res)
                })
              let time =
                payload.data &&
                payload.data.isRefresh &&
                context.state.player.$refs.player.currentTime
              opt.source = util.getPreviewInfo(
                res1,
                payload.target,
                type,
                context
              )
              let isClippingComplete =
                payload.data.isRefresh &&
                util.isMpd(context.state.previewOptions.source[0].src) &&
                !util.isMpd(opt.source[0].src)
              if (util.isMpd(opt.source[0].src)) {
                opt.isLive = true
              } else {
                if (isClippingComplete) {
                  opt.isLive = true
                } else {
                  opt.isLive = false
                }
              }
              time &&
                Vue.nextTick(() =>
                  setTimeout(
                    () =>
                    (context.state.player.$refs.player.currentTime = time),
                    0
                  )
                )
              //  if (time) {
              //    context.state.previewOptions.initTime = time
              //  }
              if (!payload.data || !payload.data.isRefresh) {
                context.state.playerHistory.push(Object.assign({}, opt))
              }
              if (payload.target.some(item => item.clipping)) {
                opt.clipping = true
              } else {
                opt.clipping = false
              }
              if (!isClippingComplete) {
                context.state.previewOptions = opt
              }
            })
            .catch(res => {
              reject(res)
            })
        })
      }
    }
  },
  [TYPES.OPEN_PLAYER](context, payload) {
    if (!payload.data || !payload.data.isRefresh) {
      context.state.player && context.state.player.dispose()
      context.state.property && context.state.property.dispose()
    }
    if (!payload.target.length) {
      return context.dispatch({
        type: TYPES.GET_PLAYER_INFO,
        target: [context.getters.currentNode],
        data: payload.data
      })
    } else {
      return context.dispatch({
        type: TYPES.GET_PLAYER_INFO,
        target: payload.target,
        data: payload.data
      })
    }
  },
  [TYPES.PROPERTIES](context, payload) {
    context
      .dispatch({
        type: TYPES.OPEN_PLAYER,
        target: payload.target,
        data: {
          previewSymbol: true
        }
      })
      .then(res => {
        res && res.forEach && res.forEach(f => f()) //  执行设置properties
      })
      .catch(res => {
        console.log(res)
        util.Notice.warning('Can not preiew', '', 3000)
      })
    //   }
  },
  [TYPES.DETAIL_VIEW](context, payload) {
    context
      .dispatch({
        type: TYPES.OPEN_PLAYER,
        target: payload.target,
        data: {
          isDV: true,
          previewSymbol: true
        }
      })
      .then(res => {
        res && res.forEach && res.forEach(f => f()) //  执行设置properties
      })
      .catch(res => util.Notice.warning('Can not preiew', '', 3000))
  },
  //  触发Rename
  [TYPES.DISPATCH_RENAME](context, payload) {
    let node = context.state.selectedMaterials[0]
    if (node.operations.indexOf('Rename') === -1) {
      util.Notice.warning(
        'This material is not allowed to be renamed',
        '',
        3000
      )
      return
    }
    if (node.guid === 2) {
      context.dispatch({
        type: TYPES.DISPATCH_SAVE_SEARCHRESULT,
        target: [node]
      })
    } else if ([1, 2].indexOf(node.father.guid) > -1) {
      node.renaming = true
      context.commit({
        type: TYPES.GET_NAVPATH,
        target: node.father,
        data: []
      })
      context.commit({
        type: TYPES.CLEAR_SELECTEEDITEMS
      })
      node.selected = true
      context.commit({
        type: TYPES.ADD_SELECTEDITEM,
        data: node
      })
      context.commit({
        type: TYPES.SET_SIGNMATERIAL,
        data: context.getters.displayMaterials.indexOf(node)
      })
    } else {
      if (node.father !== context.getters.currentNode) {
        let path
        if (appSetting.USEROOTPATH) {
          path = node.father.path.split('/')
        } else {
          path = node.father.path.split('/').slice(1)
        }
        util
          .locateFolder(
            context,
            path, {
              children: context.getters.folderTree
            }, {
              isShowWaiting: true
            }
          )
          .then(res => {
            let newNode = getRepository(node.father.guid).find(
              item => item.guid === node.guid
            )
            newNode.renaming = true
            context.commit({
              type: TYPES.GET_NAVPATH,
              target: node.father,
              data: []
            })
            context.commit({
              type: TYPES.CLEAR_SELECTEEDITEMS
            })
            newNode.selected = true
            context.commit({
              type: TYPES.ADD_SELECTEDITEM,
              data: newNode
            })
            context.commit({
              type: TYPES.SET_SIGNMATERIAL,
              data: context.getters.displayMaterials.indexOf(newNode)
            })
          })
      } else {
        let newNode = getRepository(node.father.guid).find(
          item => item.guid === node.guid
        )
        newNode.renaming = true
        context.commit({
          type: TYPES.CLEAR_SELECTEEDITEMS
        })
        newNode.selected = true
        context.commit({
          type: TYPES.ADD_SELECTEDITEM,
          data: newNode
        })
        context.commit({
          type: TYPES.SET_SIGNMATERIAL,
          data: context.getters.displayMaterials.indexOf(newNode)
        })
      }
    }
  },
  //  触发Rename
  [TYPES.DISPATCH_ADD_FOLDER](context, payload) {
    let node
    if (payload.target && payload.target.length) {
      if (payload.target[0].selecting) {
        //  左侧树
        node = payload.target[0]
        context
          .dispatch({
            type: TYPES.GET_MATERIALS,
            source: node
          })
          .then(() => {
            context.commit({
              type: TYPES.GET_NAVPATH,
              target: node,
              data: []
            })
            util.newFolder(context, node)
          })
      } else {}
    } else {
      node = context.getters.currentNode
      util.newFolder(context, node)
    }
  },
  [TYPES.MULTI_SELECTITEMS](context, payload) {
    let start = Math.max(Math.min(context.state.signIndex, payload.data), 0)
    let end = Math.min(
      Math.max(context.state.signIndex, payload.data),
      context.getters.displayMaterials.length - 1
    )
    context.state.isFocusTree = false //  切换焦点
    if (context.state.signIndex === start || !context.state.signIndex) {
      for (let i = start; i <= end; i++) {
        let material = context.getters.displayMaterials[i]
        material.selected = true
        context.commit({
          type: TYPES.ADD_SELECTEDITEM,
          data: material
        })
      }
    } else {
      for (let i = end; i >= start; i--) {
        let material = context.getters.displayMaterials[i]
        material.selected = true
        context.commit({
          type: TYPES.ADD_SELECTEDITEM,
          data: material
        })
      }
    }
  },
  [TYPES.REFRESH_MATERIAL](context, payload) {
    payload.source = payload.source || context.getters.currentNode
    if (payload.source.guid === 1 || payload.source.guid === 2) {
      return new Promise((resolve, reject) => {
        context
          .dispatch({
            type: TYPES.GET_SEARCHRESULT,
            source: payload.source
          })
          .then(() => {
            resolve()
          })
      })
    } else if (payload.source.guid === -1) {
      return new Promise((resolve, reject) => {
        context
          .dispatch({
            type: TYPES.GET_FAVORITERESULT,
            source: payload.source
          })
          .then(() => {
            resolve()
          })
      })
    } else if (payload.source.guid === 0) {
      return new Promise((resolve, reject) => {
        context
          .dispatch({
            type: TYPES.GET_TRASHCAN_OBJECTS,
            source: payload.source,
            option: {
              hideLoading: payload.option && payload.option.hideLoading
            }
          })
          .then(() => {
            resolve()
          })
      })
    } else {
      return context.dispatch({
        type: TYPES.GET_MATERIALS3,
        source: payload.source,
        alwaysGet: payload.alwaysGet
      })
    }
  },
  //  Intercept request
  [TYPES.INTERCEPT_AXIOS](context, payload) {
    axios.interceptors.request.use(
      config => {
        Object.assign(config.headers.common, {
          'sobeyhive-http-system': context.state.system || 'WEBCM',
          'sobeyhive-http-site': context.state.userInfo.sitecode || 'S1',
          'sobeyhive-http-token': context.state.userInfo.usertoken,
          'sobeyhive-http-tool': context.state.system || 'WEBCM'
        })
        return config
      },
      error => {
        return Promise.reject(error)
      }
    )

    axios.interceptors.response.use(
      response => {
        return response
      },
      error => {
        return Promise.reject(error)
      }
    )
  },
  //  get client ip for login
  [TYPES.GET_CLIENT_IP](context, payload) {
    return axios.get(API_CONFIG[TYPES.GET_CLIENT_IP]())
  },
  //  login
  [TYPES.LOGIN](context, payload) {
    return new Promise((resolve, reject) => {
      let url = API_CONFIG[TYPES.LOGIN](payload.data.isDomain)
      axios
        .post(url, {
          LOGINNAME: payload.data.username,
          LOGINPWD: payload.data.isDomain ?
            payload.data.password : md5(payload.data.password),
          LOGINSUBSYSTEM: context.state.system,
          LOGINIP: payload.data.ip
        })
        .then(res => {
          if (res.data.code === '0') {
            resolve(res.data)
          } else {
            let msg = ''
            let code = res.data.code
            if (['10002', '10010', '103', '200', '201', '902'].includes(code)) {
              msg = 'Invalid Username or Password'
            } else if (['10004', '903'].includes(code)) {
              msg = 'Current account disabled!'
            } else if (['10007', '901'].includes(code)) {
              msg = res.data.msg
            } else if (['10006', '500'].includes(code)) {
              msg = 'Login call failed! Check database connection'
            } else {
              msg = 'Login failed!'
            }
            reject(new Error(msg))
          }
        })
        .catch(res => {
          reject(new Error('Login error!'))
        })
    })
  },
  //  get user info
  [TYPES.GET_USERINFOBYID](context, payload) {
    let url = API_CONFIG[TYPES.GET_USERINFOBYID]({
      userid: context.state.userInfo.userid,
      usertoken: context.state.userInfo.userid
    })
    return new Promise((resolve, reject) => {
      axios.get(url).then(res => {
        if (res.data.code === '0') {
          resolve(res.data)
        } else {
          reject(res.data)
        }
      })
    })
  },
  //  get function user info
  [TYPES.GET_CURRENTUSERINFO](context, payload) {
    let url = API_CONFIG[TYPES.GET_CURRENTUSERINFO]({
      usertoken: context.state.userInfo.userid
    })
    return new Promise((resolve, reject) => {
      axios.get(url).then(res => {
        if (res.data.code === '0') {
          resolve(res.data)
        } else {
          reject(res.data)
        }
      })
    })
  },
  //  get user permission
  [TYPES.GET_USERPERMISSION](context, payload) {
    let url = API_CONFIG[TYPES.GET_USERPERMISSION]({
      usertoken: context.state.userInfo.usertoken
    })
    return new Promise((resolve, reject) => {
      axios
        .post(url, [{
          system: payload.data.system,
          tool: 'DEFAULT',
          popedomname: payload.data.popedomname
        }])
        .then(res => {
          if (res.data.code === '0') {
            resolve(res.data)
          } else {
            reject(res.data)
          }
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  //  node click
  [TYPES.NODE_CLICK](context, payload) {
    let node = payload.data.target
    switch (node.guid) {
      case NODETYPES.SEARCH_RESULT:
        context.commit({
          type: TYPES.GET_NAVPATH,
          target: node,
          data: []
        })
        break
      case NODETYPES.SEARCH_TEMPLATE:
        context
          .dispatch({
            type: TYPES.GET_SEARCHRESULT,
            source: node
          })
          .then(() => {
            context.commit({
              type: TYPES.GET_NAVPATH,
              target: node,
              data: []
            })
          })
        break
      case NODETYPES.FAVORITE:
        context
          .dispatch({
            type: TYPES.GET_FAVORITERESULT,
            source: node
          })
          .then(() => {
            context.commit({
              type: TYPES.GET_NAVPATH,
              target: node,
              data: []
            })
          })
        break
      case NODETYPES.TRASHCAN:
        context
          .dispatch({
            type: TYPES.GET_TRASHCAN_OBJECTS,
            source: node
          })
          .then(() => {
            context.commit({
              type: TYPES.GET_NAVPATH,
              target: node,
              data: []
            })
          })
        break
      default:
        context
          .dispatch({
            type: TYPES.GET_MATERIALS,
            source: node
          })
          .then(() => {
            context.commit({
              type: TYPES.GET_NAVPATH,
              target: node,
              data: []
            })
          })
    }
  },
  //  delete materialas
  [TYPES.DELETE_MATERIALS](context, payload) {
    let arr = payload.target.slice()
    if (arr.every(item => item.operations.indexOf('Delete') > -1)) {
      util.Model.confirm(
        'Delete',
        'Are you sure to delete ' + arr.length + ' Materials',
        () => {
          context.dispatch({
            type: TYPES.RECYCLE,
            target: arr
          })
        },
        () => {}, {
          large: true,
          cancelButton: {
            show: true,
            type: '',
            text: 'Cancel'
          },
          confirmButton: {
            show: true,
            type: 'primary',
            text: 'Confirm'
          }
        }
      )
    } else if (arr.every(item => item.operations.indexOf('Delete') === -1)) {
      util.Notice.warning('Selected materials can not be deleted', '', 3000)
    } else {
      arr = arr.filter(item => item.operations.indexOf('Delete') > -1)
      util.Model.confirm(
        'Delete',
        'Some materials can not be deleted, are you sure to delete other ' +
        arr.length +
        ' Materials',
        () => {
          context.dispatch({
            type: TYPES.RECYCLE,
            target: arr
          })
        },
        () => {}, {
          large: true,
          cancelButton: {
            show: true,
            type: '',
            text: 'Cancel'
          },
          confirmButton: {
            show: true,
            type: 'primary',
            text: 'Confirm'
          }
        }
      )
    }
  },
  //  get user tree
  [TYPES.GET_USERTREE](context, payload) {
    return new Promise((resolve, reject) => {
      Promise.all([
          context.dispatch({
            type: TYPES.GET_ALLUSER
          }),
          context.dispatch({
            type: TYPES.GET_ALLDEPT
          })
        ])
        .then(res => {
          let deptArr = res[1].data.ext
          let userArr = res[0].data.ext
          context.state.userInfo.depts = util.getcurrentDepts(
            context.state.userInfo.usercode,
            userArr,
            deptArr
          )
          let curUser = userArr.find(
            item => item.usercode === context.state.userInfo.usercode
          )
          if (curUser) {
            context.state.userInfo.nickname =
              curUser.nickname || curUser.loginname.replace(/.*\\(.*)/g, '$1')
          }
          context.state.userDept = util.getDptUserTree(
            deptArr,
            userArr,
            payload.data
          )
          resolve(res)
        })
        .catch(res => {
          reject(res)
        })
    })
  },
  //  get all user
  [TYPES.GET_ALLDEPT](context, payload) {
    let url = API_CONFIG[TYPES.GET_ALLDEPT]({
      usertoken: context.state.userInfo.usertoken
    })
    return new Promise((resolve, reject) => {
      axios.get(url).then(res => {
        if (res.data.code === '0') {
          context.state.deptArr = res.data.ext
          resolve(res)
        } else {
          reject(res)
        }
      })
    })
  },
  [TYPES.GET_ALLUSER](context, payload) {
    let url = API_CONFIG[TYPES.GET_ALLUSER]({
      usertoken: context.state.userInfo.usertoken
    })
    return new Promise((resolve, reject) => {
      axios.get(url).then(res => {
        if (res.data.code === '0') {
          context.state.userArr = res.data.ext
          resolve(res)
        } else {
          reject(res)
        }
      })
    })
  },
  [TYPES.GET_S3PATH](context, payload) {
    let url = API_CONFIG[TYPES.GET_S3PATH]({
      storagetype: 'oss',
      storagemark: 'bucket-z'
    })
    return new Promise((resolve, reject) => {
      axios.get(url).then(res => {
        if (res.data.code === '0') {
          if (res.data.ext.oss) {
            context.state.s3Path = res.data.ext.oss[0].path
          }
          resolve(res)
        } else {
          reject(res)
        }
      })
    })
  },
  [TYPES.GET_NASPATH](context, payload) {
    let url = API_CONFIG[TYPES.GET_NASPATH]({
      storagetype: 'nas',
      storagemark: 'bucket-z'
    })
    return new Promise((resolve, reject) => {
      axios.get(url).then(res => {
        if (res.data.code === '0') {
          context.state.uploadPath = res.data.ext.path
          resolve(res)
        } else {
          reject(res)
        }
      })
    })
  },
  [TYPES.GET_DING](context, payload) {
    let url = API_CONFIG[TYPES.GET_DING]({
      usercode: context.state.userInfo.usercode
    })
    return new Promise((resolve, reject) => {
      axios
        .get(url)
        .then(res => {
          if (res.data.code === '0') {
            resolve(res)
          } else {
            reject(res)
          }
        })
        .catch(res => {
          reject(res)
        })
    })
  },
  [TYPES.GET_SEARCH_QUERY](context, payload) {
    let url = API_CONFIG[TYPES.GET_SEARCH_QUERY]()
    return new Promise((resolve, reject) => {
      axios.get(url).then(res => {
        if (res.data && !res.data.code) {
          resolve(res.data)
        } else {
          resolve([])
        }
      })
    })
  },
  //  获取member根节点
  [TYPES.GET_ACTIONLIST_INFO](context, payload) {
    let url = API_CONFIG[TYPES.GET_ACTIONLIST_INFO]()
    return new Promise((resolve, reject) => {
      axios
        .post(url, {
          url: URLCONFIG.CM + '/Handler/MaterialList.ashx',
          body: {
            OperationType: 'GetLoggingAction',
            parentID: 10,
            server: URLCONFIG.LOGGINGSERVICE
          },
          type: 'post'
        })
        .then(res => {
          if (res.data && !res.data.code) {
            resolve(res.data.R)
          } else {
            resolve([])
          }
        })
    })
  },
  [TYPES.GET_MEMBERLIST_INFO](context, payload) {
    let url = API_CONFIG[TYPES.GET_MEMBERLIST_INFO]()
    return new Promise((resolve, reject) => {
      axios
        .post(url, {
          url: URLCONFIG.CM + '/Handler/MaterialList.ashx',
          body: {
            OperationType: 'GetLoggingMemberchildrn',
            parentID: 11,
            server: URLCONFIG.LOGGINGSERVICE
          },
          type: 'post'
        })
        .then(res => {
          if (res.data && !res.data.code) {
            resolve(res.data.R)
          } else {
            resolve([])
          }
        })
    })
  },
  [TYPES.GET_MATERIALS_BY_PAGE]({
      state: {
        userInfo
      }
    },
    payload
  ) {
    let url = API_CONFIG[TYPES.GET_MATERIALS_BY_PAGE]({
      siteCode: userInfo.sitecode,
      usertoken: userInfo.usertoken,
      pathtype: 'http',
      path: payload.source.path,
      subtype: payload.source.subtype,
      page: payload.page,
      size: payload.size
    })
    return new Promise((resolve, reject) => {
      axios
        .get(url)
        .then(res => {
          if (res.data) {
            resolve(res)
          } else {
            reject(res)
          }
        })
        .catch(res => {
          reject(res)
        })
    })
  },
  [TYPES.GET_MATERIALS](context, payload) {
    if (
      getRepository(payload.source.guid).length > 0 &&
      !context.state.alwaysGet &&
      payload.source.hasGetChild
    ) {
      return new Promise((resolve, reject) => {
        resolve()
      })
    } else {
      return context.dispatch({
        type: TYPES.GET_MATERIALS3,
        source: payload.source,
        cantCancel: true,
        showWaiting: true
      })
    }
  },
  [TYPES.GET_MATERIALS2](context, payload) {
    if (getRepository(payload.source.guid).length > 0) {
      return new Promise((resolve, reject) => {
        resolve()
      })
    } else {
      return context.dispatch({
        type: TYPES.GET_MATERIALS3,
        source: payload.source,
        cantCancel: true
      })
    }
  },
  //  always get new
  [TYPES.GET_MATERIALS3](context, payload) {
    payload.showWaiting && util.startLoading(context)
    let resultArr = []
    let promiseArr = []
    return new Promise((resolve, reject) => {
      context
        .dispatch({
          type: TYPES.GET_MATERIALS_BY_PAGE,
          source: payload.source,
          page: 1,
          size: 500
        })
        .then(res => {
          resultArr = resultArr.concat(
            util.parseData(res.data.ext, payload.source)
          )
          let totalPage = res.data.totalPage
          for (let i = 2; i <= totalPage; i++) {
            promiseArr.push(() =>
              context
              .dispatch({
                type: TYPES.GET_MATERIALS_BY_PAGE,
                source: payload.source,
                page: i,
                size: 500
              })
              .then(res => {
                resultArr = resultArr.concat(
                  util.parseData(res.data.ext, payload.source)
                )
              })
            )
          }
          util
            .throttleAjax(promiseArr, false, payload.cantCancel)
            .then(res => {
              util.stopLoading(context)
              context.commit({
                type: TYPES.SET_MATERIALS,
                target: payload.source,
                data: resultArr
              })
              resolve()
            })
            .catch(res => {
              util.stopLoading(context)
              util.Notice.failed('Failed to get obejcts', '', 3000)
              reject(res)
            })
        })
        .catch(res => {
          util.stopLoading(context)
          util.Notice.failed('Failed to get obejcts', '', 3000)
          reject(res)
        })
    })
  },
  [TYPES.TOGGLE_FOLDER](context, payload) {
    if (payload.source.guid === 1) {
      context
        .dispatch({
          type: TYPES.GET_SEARCHMODEL,
          source: payload.source
        })
        .then(() => {
          context.commit({
            type: TYPES.TOGGLE_FOLDER,
            target: payload.source
          })
        })
    } else if (payload.source.guid === 2) {} else if (payload.source.guid === -1) {} else {
      context
        .dispatch({
          type: TYPES.GET_FOLDERS,
          source: payload.source
        })
        .then(() => {
          context.commit({
            type: TYPES.TOGGLE_FOLDER,
            target: payload.source
          })
        })
    }
  },
  [TYPES.EXPAND_FOLDER](context, payload) {
    if (payload.source.guid === 1) {
      context
        .dispatch({
          type: TYPES.GET_SEARCHMODEL,
          source: payload.source
        })
        .then(() => {
          context.commit({
            type: TYPES.EXPAND_FOLDER,
            target: payload.source
          })
        })
    } else {
      context
        .dispatch({
          type: TYPES.GET_FOLDERS,
          source: payload.source,
          alwaysGet: payload.alwaysGet
        })
        .then(() => {
          context.commit({
            type: TYPES.EXPAND_FOLDER,
            target: payload.source
          })
        })
    }
  },
  [TYPES.GET_FOLDERS](context, payload) {
    if (
      payload.source.folders.length > 0 &&
      !context.state.alwaysGet &&
      payload.source.hasGetFolder &&
      !payload.alwaysGet
    ) {
      return new Promise((resolve, reject) => {
        resolve()
      })
    } else {
      let url = API_CONFIG[TYPES.GET_FOLDERS]({
        usertoken: context.state.userInfo.usertoken,
        pathtype: 'http',
        path: payload.source.path,
        subtype: payload.source.subtype
      })
      return new Promise((resolve, reject) => {
        axios.get(url).then(res => {
          if (res.data) {
            context.commit({
              type: TYPES.SET_FOLDERS,
              target: payload.source,
              data: util.parseData(res.data.ext, payload.source)
            })
            resolve(res)
          } else {
            util.Notice.failed('Failed to get sub-folders', '', 3000)
            reject(res)
          }
        })
      })
    }
  },
  [TYPES.GET_USERSPACE](context, payload) {
    let url = API_CONFIG[TYPES.GET_USERSPACE]({
      usertoken: context.state.userInfo.usertoken,
      loginName: context.state.userInfo.loginname
    })
    return new Promise((resolve, reject) => {
      axios.get(url).then(res => {
        if (res.data.code === '0') {
          resolve(res.data)
        } else {
          resolve(res)
        }
      })
    })
  },
  [TYPES.GETSYSPARAM](context, payload) {
    let url = API_CONFIG[TYPES.GETSYSPARAM]({
      usertoken: context.state.userInfo.usertoken,
      poolownertype: 'user',
      storagetype: 'oss'
    })
    return new Promise((resolve, reject) => {
      axios.post(url, payload.target).then(res => {
        if (res.data.code === '0') {
          resolve(res.data.ext)
        } else {
          resolve(res)
        }
      })
    })
  },
  [TYPES.GET_SNSCONFIG](context, payload) {
    let url = API_CONFIG[TYPES.GET_SNSCONFIG]({
      userid: context.state.userInfo.userid
    })
    return new Promise((resolve, reject) => {
      axios.get(url).then(res => {
        if (res.data.code === '0') {
          let resDate = res.data.ext
          let datas = []
          if (resDate && resDate.length > 0) {
            resDate.forEach(function (item) {
              if (item.attributeKey) {
                datas.push(item.attributeKey)
              }
            })
          }
          resolve(datas)
        } else {
          resolve(res)
        }
      })
    })
  },
  [TYPES.GET_OBJECT_INFO](context, payload) {
    let url = API_CONFIG[TYPES.GET_OBJECT_INFO]({
      usertoken: context.state.userInfo.usertoken,
      contentid: payload.data.contentid,
      pathtype: payload.data.pathtype || 'http',
      objecttype: payload.data.type,
      siteCode: context.state.userInfo.sitecode
    })
    return new Promise((resolve, reject) => {
      axios.get(url).then(res => {
        if (res.data.code === '0' && res.data.ext) {
          resolve(res)
        } else {
          resolve(res)
        }
      })
    })
  },
  [TYPES.OPEN_PUBLISHTOSNS](context, payload) {
    if (payload.target && payload.target.length) {
      //  if (context.state.userInfo.isPublishToSNS) { // 具有发布权限
      //  } else { // 没有发布权限
      //    util.Notice.warning("您没有发布权限！", '', 3000)
      //    return
      //  }
      //  显示发布窗口
      context.state.publishWindow.show()
    }
  },
  [TYPES.GET_TWITTER_ACOUNTS](context, payload) {
    let url = API_CONFIG[TYPES.GET_TWITTER_ACOUNTS]({})
    return new Promise((resolve, reject) => {
      axios.get(url).then(res => {
        if (res.data.code === '0' && res.data.ext) {
          resolve(res.data.ext)
        } else {
          resolve(res)
        }
      })
    })
  },
  [TYPES.PUBLISH_TO_SNS](context, payload) {
    let url = API_CONFIG[TYPES.PUBLISH_TO_SNS]({})
    let data = payload.data
    data.usercode = context.state.userInfo.usercode
    data.username = context.state.userInfo.username
    data.replyto = URLCONFIG.TMSERVICE + '/sobey/plat/cmd'
    data = JSON.stringify(data)
    return new Promise((resolve, reject) => {
      axios.post(url, data).then(res => {
        if (res.data.code === '0') {
          resolve(res)
        } else {
          resolve(res)
        }
      })
    })
  },
  [TYPES.REGISTER_OA](context, payload) {
    if (payload.target && payload.target.length) {
      let data = payload.target[0]
      context.state.registerMaterial = data
      let clipName = data.name
      let clipping = data.clipping
      let clipstatus = data.capturestatus
      let wainText = ''
      let timeIn = context.state.exportInfo.INPOINT
      let timeOut = context.state.exportInfo.OUTPOINT
      let registerLength = 0
      let msger = msger =>
        util.confirmMessage(
          'Register to OA',
          msger || clipName + ' does not support registration to OA'
        )
      if (timeIn === -1 && timeOut === -1) {
        registerLength = 6
      } else {
        registerLength = parseInt(timeOut - timeIn) / 10000000
      }
      //  trimmer中素材1.3.1暂不支持注册到播出
      if (clipstatus === 32 || data.clipStatus === 'Create Low') {
        wainText = "This material can't register to playout!"
        msger(wainText)
        return
      }
      if (registerLength < 5) {
        wainText =
          "Please make sure the material's duration is greater than 5 seconds!"
        msger(wainText)
      }
      context
        .dispatch({
          type: TYPES.EXPAND_FOLDER,
          source: context.state.oaFolder[0],
          alwaysGet: true
        })
        .then(result => {})
      // 先获取studio 若获取不到就不显示窗口
      Promise.all([
          context.dispatch({
            type: TYPES.GET_STUDIO,
            data: {}
          }),
          context.dispatch({
            type: TYPES.GET_OBJECT_INFO,
            data: {
              contentid: payload.target[0].guid,
              pathtype: 'unc',
              type: payload.target[0].typeid
            }
          })
        ])
        .then(res => {
          let studioArr = res[0]
          let objInfo = res[1].data.ext
          if (studioArr && studioArr.length > 0) {
            let currentStudioData = studioArr
            let datajson = objInfo
            let highgroupstatus = datajson.entity.highgroupstatus || null
            let lowgroupstatus = datajson.entity.lowgroupstatus || null
            if (clipping && clipstatus !== 32) {
              // 表示正在采集且不是trim中的素材
              // 判断采集中的素材是否能注册
              let capturestatus = datajson.entity.item.capturestatus // 如果为2表示循环采集中不能注册
              let clipfileArr = datajson.entity.item.clipfile
              if (capturestatus === 2) {
                // 表示循环采集中不能注册
                // IsOnlyTransNot = false
                wainText =
                  'Failed to register as this is an loop ingesting clip!'
                msger(wainText)
              } else {
                if (clipfileArr.length > 0) {
                  // 文件列表存在
                  let highFilname = ''
                  let fileLength = 0
                  let Clipisregister = true
                  let highgroup = 0
                  // 判断是否有高质量切是否能注册
                  for (let j = 0; j < clipfileArr.length; j++) {
                    if (
                      clipfileArr[j].qualitytype === 0 &&
                      clipfileArr[j].clipclass === 1
                    ) {
                      // 视频高质量第一段
                      if (highgroup === 0) {
                        if (clipfileArr[j].filename) {
                          highFilname = clipfileArr[j].filename
                        }
                        if (clipfileArr[j].length) {
                          fileLength = clipfileArr[j].length
                        }
                      } else {
                        if (fileLength === 0 && clipfileArr[j].clipin > 0) {
                          // 高质量第一段长度为0，第二段入点大于0
                          Clipisregister = false
                          break
                        }
                      }
                      highgroup++
                    }
                  }
                  if (!Clipisregister) {
                    // 如果素材为不合法
                    wainText =
                      'Failed to register because this is an exceptional clip!'
                    msger(wainText)
                    return
                  }
                  if (highgroup > 0) {
                    // 表示有高质量
                    if (highFilname) {
                      if (timeIn === -1 && timeOut === -1) {
                        // 采集中素材整段注册 调用播出的接口判断高质量第一段能不能注册
                        let highFileLength = 0
                        if (fileLength > 0) {
                          // 如果入出点都等于0，表示第一段未封口，允许注册
                          highFileLength = parseInt(fileLength) / 10000000 // 百纳秒转秒--去掉Math.round()
                          if (highFileLength < 5) {
                            wainText =
                              "Please make sure the material's duration is greater than 5 seconds!"
                            msger(wainText)
                            return
                          }
                        }
                        context
                          .dispatch({
                            type: TYPES.ISONLY_TRANSNOTCODES,
                            data: {
                              FileName: highFilname
                            }
                          })
                          .then(result => {
                            let datas = result
                            if (datas.Result) {
                              context.state.RegisterWindow.show()
                              util.displayRegisterWindow(currentStudioData, context)
                            } else {
                              wainText = 'The Format is not support to on-air.' // The High-Res file of clip '" + clipName + "' doesn't not meet the criteria of
                              msger(wainText)
                            }
                          })
                          .catch(res => {
                            wainText = 'The Format is not support to on-air.'
                            msger(wainText)
                          })
                      } else {
                        context.state.RegisterWindow.show()
                        util.displayRegisterWindow(currentStudioData, context)
                      }
                    } else {
                      wainText = 'The Format is not support to on-air.'
                      msger(wainText)
                    }
                  } else {
                    // 没有高质量不能注册
                    wainText =
                      'This ingesting clip doesn\'t have High-Res files, It is failed to operate!'
                    msger(wainText)
                  }
                } else {
                  // 没有文件列表不能注册
                  wainText =
                    'The ingesting clip has no clip file! It is failed to operate!'
                  msger(wainText)
                }
              }
            } else {
              // 已经完成
              let clipFileLength = datajson.entity.item.length
              clipFileLength = parseInt(clipFileLength) / 10000000 // 百纳秒转秒--去掉Math.round()
              if (clipFileLength < 5) {
                wainText =
                  'Please make sure the material\'s duration is greater than 5 seconds!'
                msger(wainText)
                return
              }
              // IsOnlyTransNot = true
              if (
                (highgroupstatus === 'online_deleted' ||
                  highgroupstatus === null) &&
                (lowgroupstatus === 'online_deleted' || lowgroupstatus === null)
              ) {
                // 高低质量都没有   online_deleted表示删除了   ready表示存在
                // isHlflag = true
                wainText =
                  'Both hi-res and low-res of "' +
                  clipName +
                  '" is not available. Fail to continue'
                msger(wainText)
              } else if (
                (highgroupstatus === 'online_deleted' ||
                  highgroupstatus === null) &&
                (lowgroupstatus === 'ready' || lowgroupstatus === 'archived')
              ) {
                // 只有低质量
                // alertflag = true
                util.Model.confirm(
                  'Register to OA',
                  'The hi-res part of "' +
                  clipName +
                  '" is not available.Do you want to continue?',
                  () => {
                    context.state.RegisterWindow.show()
                    util.displayRegisterWindow(currentStudioData, context)
                  },
                  () => {}, {
                    large: true,
                    cancelButton: {
                      show: true,
                      type: '',
                      text: 'Cancel'
                    },
                    confirmButton: {
                      show: true,
                      type: 'primary',
                      text: 'Confirm'
                    }
                  }
                )
              } else {
                context.state.RegisterWindow.show()
                util.displayRegisterWindow(currentStudioData, context)
              }
            }
          } else {
            // 未获取到studio的情况
            util.Notice.warning('Studio list can not be found', '', 3000)
          }
        })
        .catch(res => {
          let msg = ''
          if (res.data && res.data.code) {
            // 表示获取元数据失败
            msg = 'Get object info fail!'
          } else {
            try {
              msg = res.data.E
            } catch (e) {
              msg = res.E
            }
            if (/^[\u2E80-\u9FFF]+$/g.test(msg)) {
              msg = 'Studio list can not be found'
            }
          }
          util.Notice.warning(msg, '', 3000)
        })
    }
  },
  [TYPES.GET_STUDIO](context, payload) {
    let data = {
      FilterGroup: {
        ObjType: 'AttributeConditionType',
        Items: [{
          Attribute: {
            Name: 'StudioName',
            Value: Guid.NewGuid().ToString('N')
          },
          Condition: ConditionType.NOT_EQUALS
        }],
        Operator: FilterGroupTypeOperator.AND
      }
    }
    let URL = API_CONFIG[TYPES.GET_STUDIO]({})
    return new Promise((resolve, reject) => {
      axios.post(URL, data).then(res => {
        if (
          res.data.Results &&
          res.data.Results.length > 0 &&
          !res.data.Errors
        ) {
          let studios = res.data.Results
          let studioArr = []
          if (studios && studios.length > 0) {
            let defultJson = {
              name: 'Please select studio',
              studioid: '',
              studiomosid: '',
              children: [],
              selected: false
            }
            studioArr.push(defultJson)
            studios.forEach(item => {
              SetStudioSystemStandard(item.StudioID, item.SystemStandard)
              let json = {
                name: item.Name,
                studioid: item.StudioID,
                studiomosid: item.StudioMosID,
                children: [],
                selected: false
              }
              studioArr.push(json)
            })
          }
          resolve(studioArr)
        } else {
          if (res.data.Errors) {
            reject(res.data.Errors)
          } else {
            res.data.E = 'Studio list can not be found'
            reject(res.data)
          }
        }
      })
    })
  },
  [TYPES.GET_RUNDOWN_LIST](context, payload) {
    let StudioID = payload.data
    let data = {
      StudioID: payload.data,
      FilterGroup: {
        ObjType: 'AttributeConditionType',
        Items: [{
            Attribute: {
              Name: 'RundownName',
              Value: Guid.NewGuid().ToString('N')
            },
            Condition: ConditionType.NOT_EQUALS
          },
          {
            Attribute: {
              Name: 'PlaylistType',
              Value: '0'
            },
            Condition: ConditionType.EQUALS
          }
        ],
        Operator: FilterGroupTypeOperator.AND
      }
    }
    let URL = API_CONFIG[TYPES.GET_RUNDOWN_LIST]({})
    return new Promise((resolve, reject) => {
      axios.post(URL, data).then(res => {
        if (
          res.data.Results &&
          res.data.Results.length > 0 &&
          !res.data.Errors
        ) {
          let rundownArr = []
          let rundownlist = res.data.Results
          rundownlist.forEach(item => {
            item.FirstPlayDate = item.FirstPlayDate.slice(
              0,
              item.FirstPlayDate.indexOf('T')
            )
            if (!strDateTime1(item.FirstPlayDate)) {
              item.FirstPlayDate = ''
            }
            //  item.FirstPlayDate = new Date(item.FirstPlayDate).format('yyyy-MM-dd')
            if (item.FirstPlayDate) {
              let json = {
                studioid: StudioID,
                name: item.Name,
                FirstPlayDate: item.FirstPlayDate,
                Rundownid: item.RundownID,
                selected: false,
                children: []
              }
              rundownArr.push(json)
            }
          })
          resolve(rundownArr)
        } else {
          resolve(res.data.Errors)
        }
      })
    })
  },
  [TYPES.GET_EVENTS](context, payload) {
    let URL = API_CONFIG[TYPES.GET_EVENTS]({})
    let data = {
      StoryID: payload.data.storyID
    }
    return new Promise((resolve, reject) => {
      axios.post(URL, data).then(res => {
        if (
          res.data.Results &&
          res.data.Results.length > 0 &&
          !res.data.Errors
        ) {
          resolve(res.data.Results)
        } else {
          resolve(null)
        }
      })
    })
  },
  [TYPES.GET_PROGRAMEINFO_LIST](context, payload) {
    let studioid = payload.data.studioid
    let data = {
      RundownID: payload.data.rundownid,
      FilterGroup: {
        ObjType: 'AttributeConditionType',
        Items: [{
          Attribute: {
            Name: 'StoryName',
            Value: Guid.NewGuid().ToString('N')
          },
          Condition: ConditionType.NOT_EQUALS
        }],
        Operator: FilterGroupTypeOperator.AND
      }
    }
    let URL = API_CONFIG[TYPES.GET_PROGRAMEINFO_LIST]({})
    return new Promise((resolve, reject) => {
      axios.post(URL, data).then(res => {
        if (
          res.data.Results &&
          res.data.Results.length > 0 &&
          !res.data.Errors
        ) {
          let Resulteventlist = res.data.Results
          let eventlist = []
          let programeinfo = []
          let Standard = null
          if (!res.data.Errors) {
            Standard = GetStudioSystemStandard(studioid)
          }
          eventlist = Resulteventlist.filter(item => {
            return item.Type === StoryTypeEnum.Main
          })
          let promiseArr = []
          eventlist.forEach(item => {
            promiseArr.push(() =>
              context
              .dispatch({
                type: TYPES.GET_EVENTS,
                data: {
                  storyID: item.StoryID
                }
              })
              .then(res => {
                let json = {
                  StoryID: item.StoryID,
                  Name: item.Name,
                  Comment: item.Comment,
                  CreateDate: item.CreateDate,
                  RundownID: item.RundownID,
                  RundownName: item.RundownName,
                  Type: item.Type,
                  Events: res
                }
                programeinfo.push(json)
                // resolve(programeinfo)
              })
              .catch(res => {})
            )
          })
          util.sync(promiseArr).then(res => {
            let newProgramArr = []
            let cdata = programeinfo
            let ndf = Standard || 0
            if (cdata.length > 0) {
              cdata.forEach(function (i, d) {
                if (cdata[d].Events) {
                  i.Events.forEach(function (p, j) {
                    let Duration =
                      i.Events[j].Type === 2 ?
                      '' :
                      getTimeStringByFrameNum2(
                        i.Events[j].Duration,
                        ndf
                      ).substr(0, 8)
                    let Version =
                      i.Events[j].Type === 2 ? '' : i.Events[j].Version
                    let SOM =
                      i.Events[j].Type === 2 ?
                      '' :
                      getTimeStringByFrameNum2(
                        i.Events[j].InPoint,
                        ndf
                      ).substr(0, 8)
                    let EOM =
                      i.Events[j].Type === 2 ?
                      '' :
                      getTimeStringByFrameNum2(
                        i.Events[j].OutPoint,
                        ndf
                      ).substr(0, 8)
                    let eventStatus = getEnumKeyByValue(
                      i.Events[j].Status,
                      EventStatusType
                    )
                    if (i.Events[j].Type !== 0 && i.Events[j].Type !== 2) {
                      let infoJson = {
                        storyTitle: i.Name,
                        eventTitle: i.Events[j].Name,
                        duration: Duration,
                        version: Version,
                        som: SOM,
                        eom: EOM,
                        channel: i.Events[j].Channel,
                        eventStatus: eventStatus,
                        eventId: i.Events[j].EventID,
                        MaterialID: i.Events[j].MaterialID,
                        selected: false
                      }
                      newProgramArr.push(infoJson)
                    }
                  })
                }
              })
            }
            resolve(newProgramArr)
          })
        } else {
          resolve(res.data.Errors)
        }
      })
    })
  },
  [TYPES.GET_NOTIFYPLAYOUT](context, payload) {
    let URL = API_CONFIG[TYPES.GET_NOTIFYPLAYOUT]({
      usertoken: context.state.userInfo.usertoken
    })
    let data = JSON.stringify(payload.data.xmlproc)
    return new Promise((resolve, reject) => {
      axios.post(URL, data).then(res => {
        if (res.data.code === '0') {
          resolve(res.data)
        } else {
          resolve(res.data)
        }
      })
    })
  },
  [TYPES.REGISTER_TO_EVENT](context, payload) {
    let URL = API_CONFIG[TYPES.REGISTER_TO_EVENT]({})
    let data = {
      eventId: payload.data.eventId,
      objectGuid: payload.data.objectGuid,
      token: context.state.userInfo.usertoken
    }
    return new Promise((resolve, reject) => {
      axios
        .post(URL, data)
        .then(res => {
          let result
          if (res.data.Results) {
            result = JSON.stringify(res.data)
            resolve(result)
          } else {
            if (res.data.Errors) {
              result = JSON.stringify(res.data.Errors)
            } else {
              result = JSON.stringify(res.data)
            }
          }
          resolve(result)
        })
        .catch(res => {
          if (typeof res === 'object') {
            res = 'register to event fail!'
          }
          let result = {
            ErrDetail: res
          }
          result = JSON.stringify(result)
          resolve(result)
        })
    })
  },
  [TYPES.ISONLY_TRANSNOTCODES](context, payload) {
    let data = {
      FileName: payload.data.FileName
    }
    let URL = API_CONFIG[TYPES.ISONLY_TRANSNOTCODES]({})
    return new Promise((resolve, reject) => {
      axios.post(URL, data).then(res => {
        if (res.data) {
          resolve(res.data)
        } else {
          resolve(res.data)
        }
      })
    })
  },
  [TYPES.CAN_TRANSCODING](context, payload) {
    var data = {
      EventID: payload.data.EventID,
      RundownID: payload.data.RundownID
    }
    let URL = API_CONFIG[TYPES.CAN_TRANSCODING]({})
    return new Promise((resolve, reject) => {
      axios.post(URL, data).then(res => {
        if (res.data.nRet === 0) {
          resolve(res)
        } else {
          resolve(res)
        }
      }).catch(res => {
        reject(res)
      })
    })
  },
  [TYPES.REGISTER_TO_OAFOLDER](context, payload) {
    payload.data.relativepath = payload.data.relativepath && encodeURIComponent(payload.data.relativepath)
    let para = {
      usertoken: context.state.userInfo.usertoken || '',
      sourceguid: payload.data.sourceguid,
      targetmosid: payload.data.targetmosid,
      targetguid: payload.data.targetguid,
      relativepath: payload.data.relativepath,
      broadnotify: '0',
      mpcnotify: '0',
      siteCode: context.state.userInfo.sitecode || ''
    }
    if (payload.data.isfragment) {
      para.clipin = payload.data.clipin
      para.clipout = payload.data.clipout
    }
    // let url = API_CONFIG[TYPES.REGISTER_TO_OAFOLDER](para)
    let url = API_CONFIG[TYPES.FRAGMENT_REGISTER](para)
    return new Promise((resolve, reject) => {
      axios.get(url).then(res => {
        if (res.data) {
          resolve(res.data)
        } else {
          resolve(res)
        }
      })
    })
  },
  [TYPES.FRAGMENT_REGISTER](context, payload) {
    var iscliping = false
    var mpcnotify = '1'
    if (payload.data.iscliping) {
      iscliping = true
      mpcnotify = '0' // 采集完成的传1，采集中的传0
    }
    payload.data.relativepath = payload.data.relativepath && encodeURIComponent(payload.data.relativepath)
    let para = {
      usertoken: context.state.userInfo.usertoken || '',
      sourceguid: payload.data.sourceguid,
      targetmosid: payload.data.targetmosid,
      targetguid: payload.data.targetguid,
      clipin: payload.data.clipin,
      clipout: payload.data.clipout,
      relativepath: payload.data.relativepath,
      broadnotify: '0',
      mpcnotify: mpcnotify,
      siteCode: context.state.userInfo.sitecode || ''
    }
    let URL = API_CONFIG[TYPES.FRAGMENT_REGISTER](para)
    return new Promise((resolve, reject) => {
      axios.get(URL).then(res => { //
        if (res.data) {
          if (iscliping) { // 采集中的自己发消息----CMAPI不支持采集中的帮转发
            if (res.data.code !== '0') {
              if (res.data.code === 'RE00001') {
                util.Notice.warning('Failed to register because this is an exceptional clip!', '', 3000)
              } else {
                util.Notice.warning('register to event fail!', '', 3000)
              }
            } else {
              var extXml = res.data.ext.xmlinfo
              var clipGuid = res.data.ext.guid
              var notiyP = -1
              if (extXml.indexOf('<Start>') >= 0) {
                notiyP = 20 // kafamessage失败
              } else {
                notiyP = 10 // 走MPC失败
              }
              context.dispatch({
                type: TYPES.GET_NOTIFYPLAYOUT,
                data: {
                  xmlproc: res.data,
                  notiyP: notiyP
                }
              }).then((re) => {
                var data = re
                if (data.code === '0') {
                  data.ext = {
                    guid: clipGuid
                  }
                  resolve(data)
                } else {
                  util.Notice.warning('register to event fail!', '', 3000)
                }
              }).catch((re) => {
                util.Notice.warning('register to event fail!', '', 3000)
              })
            }
          } else {
            resolve(res.data)
          }
        } else {
          resolve(res)
        }
      })
    })
  },
  [TYPES.PRE_SNSPUBLISH](context, payload) { // sns预发布
    let currentData = context.state.selectedMaterials[0]
    let para = {
      usertoken: context.state.userInfo.usertoken || '',
      contentid: currentData.guid || ''
    }
    let URL = API_CONFIG[TYPES.PRE_SNSPUBLISH](para)
    if (currentData.type === 'image') {
      var target = {
        path: appSetting.PRESNSPUBLISHPATH,
        children: []
      }
      util.copyObject(context, util.copyNode(currentData), target, true).then((re) => {
        util.Notice.success('Send clip to Publish folder successfully', '', 3000)
      }).catch((res) => {
        util.Notice.failed('Failed to send clip to Publish folder', '', 3000)
      })
    } else {
      return new Promise((resolve, reject) => {
        axios.get(URL).then(res => {
          if (res.data.code === '0') {
            util.Notice.success('Send clip to Publish folder successfully', '', 3000)
          } else {
            util.Notice.failed('Failed to send clip to Publish folder', '', 3000)
          }
        }).catch(res => {
          util.Notice.failed('Failed to send clip to Publish folder', '', 3000)
        })
      })
    }
  }
}
