import TYPES from '../dicts/mutationTypes.js'
import API_CONFIG from '../config/apiConfig.js'
import NODETYPES from '../dicts/guidMaps.js'
import axios from 'axios'
import util from '../lib/util.js'
let md5 = require('../lib/md5.min.js').md5
export default {
  // Intercept request
  [TYPES.INTERCEPT_AXIOS] (context, payload) {
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
  // get client ip for login
  [TYPES.GET_CLIENT_IP] (context, payload) {
    return axios.get(API_CONFIG[TYPES.GET_CLIENT_IP]())
  },
  // login
  [TYPES.LOGIN] (context, payload) {
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
  // get user info
  [TYPES.GET_USERINFOBYID] (context, payload) {
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
  // get user permission
  [TYPES.GET_USERPERMISSION] (context, payload) {
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
  // node click
  [TYPES.NODE_CLICK] (context, payload) {
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
<<<<<<< HEAD
  [TYPES.GET_USERSPACE] (context, payload) {
    let url = API_CONFIG[TYPES.GET_USERSPACE]({
      usertoken: context.state.userInfo.usertoken,
      loginName: context.state.userInfo.loginname
=======
  // delete materialas
  [TYPES.DELETE_MATERIALS] (context, payload) {
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
  // get user tree
  [TYPES.GET_USERTREE] (context, payload) {
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
          var deptArr = res[1].data.ext
          var userArr = res[0].data.ext
          context.state.userInfo.depts = util.getcurrentDepts(
            context.state.userInfo.usercode,
            userArr,
            deptArr
          )
          var curUser = userArr.find(
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
  // get all user
  [TYPES.GET_ALLDEPT] (context, payload) {
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
  [TYPES.GET_ALLUSER] (context, payload) {
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
  [TYPES.GET_S3PATH] (context, payload) {
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
  [TYPES.GET_NASPATH] (context, payload) {
    let url = API_CONFIG[TYPES.GET_NASPATH]({
      storagetype: 'nas',
      storagemark: 'bucket-z'
>>>>>>> 4c6ada69c48f80ac8698697aa933560093c0381b
    })
    return new Promise((resolve, reject) => {
      axios.get(url).then(res => {
        if (res.data.code === '0') {
<<<<<<< HEAD
          resolve(res.data)
        } else {
          reject(res.data)
=======
          context.state.uploadPath = res.data.ext.path
          resolve(res)
        } else {
          reject(res)
        }
      })
    })
  },
  [TYPES.GET_DING] (context, payload) {
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
  [TYPES.GET_SEARCH_QUERY] (context, payload) {
    let url = API_CONFIG[TYPES.GET_SEARCH_QUERY]()
    return new Promise((resolve, reject) => {
      axios.get(url).then(res => {
        if (res.data && !res.data.code) {
          resolve(res.data)
        } else {
          resolve([])
>>>>>>> 4c6ada69c48f80ac8698697aa933560093c0381b
        }
      })
    })
  }
}
