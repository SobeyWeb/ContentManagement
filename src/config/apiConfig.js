import URLCONFIG from './urlConfig.js'
import TYPES from '../dicts/mutationTypes.js'
import util from '../lib/util.js'
export default {
  [TYPES.GET_CLIENT_IP] () {
    return URLCONFIG.PROXY + '/ip'
  },
  [TYPES.LOGIN] (isDomain) {
    return isDomain
      ? URLCONFIG.CMAPI + '/CMApi/api/v2/basic/account/login'
      : URLCONFIG.CMAPI + '/CMApi/api/basic/account/login'
  },
  [TYPES.GET_USERINFOBYID] (para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/basic/account/getuserinfobyuserid',
      para
    )
  },
  [TYPES.GET_USERPERMISSION] (para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/basic/account/testfunctionpopedom',
      para
    )
  },
  [TYPES.GET_ALLUSER] (para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/basic/account/getalluser',
      para
    )
  },
  [TYPES.GET_ALLDEPT] (para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/basic/account/getalldeptinfo',
      para
    )
  },
  [TYPES.GET_NASPATH] (para) {
    return util.getUrl(
      URLCONFIG.CMAPI +
        '/CMApi/api/basic/user/getcurrentusercanwritepathbycondition',
      para
    )
  },
  [TYPES.GET_S3PATH] (para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/basic/user/getcurrentuserpath',
      para
    )
  },
  [TYPES.GET_DING] (para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/v1/entity/ding/getdinginfo',
      para
    )
  },
  [TYPES.GET_SEARCH_QUERY] (para) {
    return URLCONFIG.HIVE + '/solar-api/material-list-ext/user/search-templates'
  },
  [TYPES.GET_USERSPACE] (para) {
    console.log(util)
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/basic/account/getuserstoragebyname',
      para
    )
  },
  [TYPES.GETSYSPARAM] (para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/basic/config/getsysparam',
      para
    )
  },
  [TYPES.GET_SNSCONFIG] (para) {
    return util.getUrl(
      URLCONFIG.CMAPI +
        '/CMApi/api/basic/account/getuserextendattributes/' +
        para.userid
    )
  },
  [TYPES.GET_OBJECT_INFO] (para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/v2/entity/object/getobjectinfo' + para.user
    )
  },
  [TYPES.GET_TWITTER_ACOUNTS] (para) {
    return util.getUrl(URLCONFIG.CMAPI + '/CMApi/api/sns/getsnsaccounts')
  },
  [TYPES.PUBLISH_TO_SNS] (para) {
    return util.getUrl(URLCONFIG.CMAPI + '/CMApi/api/sns/publishtosns')
  }
}
