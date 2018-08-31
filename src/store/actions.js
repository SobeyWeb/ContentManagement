import TYPES from '../dicts/mutationTypes.js'
import API_CONFIG from '../config/apiConfig.js'
import URLCONFIG from '../config/urlConfig.js'
import NODETYPES from '../dicts/guidMaps.js'
import axios from 'axios'
import * as util from '../lib/util.js'
import { getRepository } from '../data/repository.js'
import Guid from '../lib/Guid.js'
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
let md5 = require('../lib/md5.min.js').md5

export default {
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
          LOGINPWD: payload.data.isDomain
            ? payload.data.password
            : md5(payload.data.password),
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
  //  get user permission
  [TYPES.GET_USERPERMISSION](context, payload) {
    let url = API_CONFIG[TYPES.GET_USERPERMISSION]({
      usertoken: context.state.userInfo.usertoken
    })
    return new Promise((resolve, reject) => {
      axios
        .post(url, [
          {
            system: payload.data.system,
            tool: 'DEFAULT',
            popedomname: payload.data.popedomname
          }
        ])
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
        () => {},
        {
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
        () => {},
        {
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
  [TYPES.GET_MATERIALS_BY_PAGE](
    {
      state: { userInfo }
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
    } else if (payload.source.guid === 2) {
    } else if (payload.source.guid === -1) {
    } else {
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
            resDate.forEach(function(item) {
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
      context.state.publishWindow.show()
      context
        .dispatch({
          type: TYPES.GET_OBJECT_INFO,
          data: {
            contentid: payload.target[0].guid,
            pathtype: 'http',
            type: payload.target[0].typeid
          }
        })
        .then(result => {
          let datajson = result.data.ext
          let clipsize = 0
          if (datajson.entity.subtype === 32) {
            //  图片
            if (datajson.streammedia && datajson.streammedia.length > 0) {
              context.state.snsviewPath =
                datajson.streammedia[0].filepath ||
                datajson.streammedia[0].filename
            } else {
              context.state.snsviewPath = datajson.entity.iconfilename || ''
            }
            clipsize = datajson.entity.item.clipfile[0].filesize
            context.state.materialSpace = clipsize
          } else {
            if (datajson.entity.item.markpoints.length > 0) {
              context.state.snsiconfilename =
                datajson.entity.item.markpoints[0].iconfilename
            } else {
              context.state.snsiconfilename = ''
            }

            if (datajson.streammedia && datajson.streammedia.length > 0) {
              context.state.snsviewPath =
                datajson.streammedia[0].filepath ||
                datajson.streammedia[0].filename
            } else {
              let pathData =
                datajson.entity.item &&
                datajson.entity.item.clipfile &&
                datajson.entity.item.clipfile.filter(
                  item => item.qualitytype === 1 && item.clipclass === 1
                )
              pathData = pathData && pathData.length && pathData[0].filename
              context.state.snsviewPath = pathData || ''
            }
            let highsize = 0
            let lowsize = 0
            datajson.entity.item.clipfile.forEach(function(item) {
              if (item.qualitytype === 0 && item.clipclass === 1) {
                highsize = item.filesize
              }
              if (item.qualitytype === 1 && item.clipclass === 1) {
                lowsize = item.filesize
              }
            })
            if (context.state.SNSPublishQuality === 'high') {
              //  如果是发高质量
              if (highsize === 0) {
                //  没有高质量用低质量
                highsize = lowsize
              }
              clipsize = highsize
            } else {
              clipsize = lowsize
            }
            context.state.materialSpace = clipsize
          }
        })
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
            let highgroupstatus = datajson.entity.highgroupstatus || ''
            let lowgroupstatus = datajson.entity.lowgroupstatus || ''
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
                              this.$store.state.RegisterWundow.show()
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
                        this.$store.state.RegisterWundow.show()
                        util.displayRegisterWindow(currentStudioData)
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
                  highgroupstatus == null) &&
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
                    this.$store.state.RegisterWundow.show()
                    util.displayRegisterWindow(currentStudioData)
                  },
                  () => {},
                  {
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
                this.$store.state.RegisterWundow.show()
                util.displayRegisterWindow(currentStudioData)
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
        Items: [
          {
            Attribute: {
              Name: 'StudioName',
              Value: Guid.NewGuid().ToString('N')
            },
            Condition: ConditionType.NOT_EQUALS
          }
        ],
        Operator: FilterGroupTypeOperator.AND
      }
    }
    let URL = API_CONFIG[TYPES.GET_STUDIO]({})
    return new Promise((resolve, reject) => {
      axios.post(URL, JSON.stringify(data)).then(res => {
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
              children: []
            }
            studioArr.push(defultJson)
            studios.forEach(item => {
              SetStudioSystemStandard(item.StudioID, item.SystemStandard)
              let json = {
                name: item.Name,
                studioid: item.StudioID,
                studiomosid: item.StudioMosID,
                children: []
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
        Items: [
          {
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
      axios.post(URL, JSON.stringify(data)).then(res => {
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
                Rundownid: item.RundownID
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
    let data = { StoryID: payload.data.storyID }
    return new Promise((resolve, reject) => {
      axios.post(URL, JSON.stringify(data)).then(res => {
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
        Items: [
          {
            Attribute: {
              Name: 'StoryName',
              Value: Guid.NewGuid().ToString('N')
            },
            Condition: ConditionType.NOT_EQUALS
          }
        ],
        Operator: FilterGroupTypeOperator.AND
      }
    }
    let URL = API_CONFIG[TYPES.GET_PROGRAMEINFO_LIST]({})
    return new Promise((resolve, reject) => {
      axios.post(URL, JSON.stringify(data)).then(res => {
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
                  resolve(programeinfo)
                })
                .catch(res => {})
            )
          })
          util.sync(promiseArr).then(res => {
            let newProgramArr = []
            let cdata = programeinfo
            let ndf = Standard || 0
            if (cdata.length > 0) {
              cdata.forEach(function(i, d) {
                if (cdata[d].Events) {
                  i.Events.forEach(function(p, j) {
                    let Duration =
                      i.Events[j].Type === 2
                        ? ''
                        : getTimeStringByFrameNum2(
                          i.Events[j].Duration,
                          ndf
                        ).substr(0, 8)
                    let Version =
                      i.Events[j].Type === 2 ? '' : i.Events[j].Version
                    let SOM =
                      i.Events[j].Type === 2
                        ? ''
                        : getTimeStringByFrameNum2(
                          i.Events[j].InPoint,
                          ndf
                        ).substr(0, 8)
                    let EOM =
                      i.Events[j].Type === 2
                        ? ''
                        : getTimeStringByFrameNum2(
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
        .post(URL, JSON.stringify(data))
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
      axios.post(URL, JSON.stringify(data)).then(res => {
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
      axios.post(URL, JSON.stringify(data)).then(res => {
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
    let url = API_CONFIG[TYPES.REGISTER_TO_OAFOLDER](para)
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
  }
}
