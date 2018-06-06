import URL_CONFIG from './urlConfig.js'
import TYPES from '../dicts/mutationTypes.js'
import util from '../lib/util.js'
export default {
  [TYPES.GET_CLIENT_IP] () {
    return URL_CONFIG.PROXY + '/ip'
  },
  [TYPES.LOGIN] (isDomain) {
    return isDomain
      ? URL_CONFIG.CMAPI + '/CMApi/api/v2/basic/account/login'
      : URL_CONFIG.CMAPI + '/CMApi/api/basic/account/login'
  },
  [TYPES.GET_USERINFOBYID] (para) {
    return util.getUrl(
      URL_CONFIG.CMAPI + '/CMApi/api/basic/account/getuserinfobyuserid',
      para
    )
  },
  [TYPES.GET_USERPERMISSION] (para) {
    console.log(util)
    return util.getUrl(
      URL_CONFIG.CMAPI + '/CMApi/api/basic/account/testfunctionpopedom',
      para
    )
  }
}
