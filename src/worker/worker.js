/* eslint-disable */
addEventListener('message', function(evt) {
  if (evt.data.type === 'start') {
    setInterval(function() {
      postMessage({
        type: 'update'
      })
    }, 16)
  } else if (evt.data.type === 'calcTC') {
    var opt = evt.data.option
    var ct = opt.time
    switch (opt.activeIndex) {
      case 0:
        ct = getTimecode(ct - opt.spaceTime, 'LTC', opt)
        break
      case 1:
        ct = getTimecode(ct - opt.spaceTime, 'VITC', opt)
        break
      case 2:
        ct += opt.vtrin
        break
      case 3:
        ct += 0 //不偏移
        break
      default:
    }
    postMessage({
      type: 'timecode',
      value: ct
    })
  }
})
function getTimecode(ct, type, option) {
  var timeCodes = option.tc
  if (!timeCodes || !timeCodes.length) {
    return option.isSkipFrame ? '--:--.--:--' : '--:--:--:--'
  }
  var tstr = '00:00:00:00'
  var curframe = GetFrameNumByHundredNS(
    Math.round(ct * 10000000),
    option.videostandard,
    option.ntsctcmode
  )
  //从大到小排序
  var tc = timeCodes.filter(item => item.offset <= curframe)

  if (tc && tc.length) {
    var bStill = false
    for (var i = 0, l = tc.length; i < l; i++) {
      let item = tc[i]
      if (item.ntc === -2) {
        bStill = true
      } else if (item.ntc === -1) {
        tstr = option.isSkipFrame ? '--:--.--:--' : '--:--:--:--'
        break
      } else {
        let frames = item.ntc + (bStill ? 0 : curframe - item.offset)
        tstr = GetTimeStringByFrameNum(
          frames,
          option.ntsctcmode,
          option.videostandard,
          option.framerate
        )
        break
      }
    }
  } else {
    tstr = option.isSkipFrame ? '--:--.--:--' : '--:--:--:--'
  }
  return tstr
}

var ETVS_Unknown = 0x40000000

var ET_ScanMode_Invalid = 0
var ET_ScanMode_Interlaced = 1 //隔行扫描;同时意为顶场优先
var ET_ScanMode_Progressive = 2 //逐行扫描

//[[ljj@2011-9-15:新增定义：隔行，底场优先。ET_ScanMode_Interlaced意为隔行，顶场优先。
var ET_ScanMode_Interlaced_BottomFirst = 3
//]]
var ET_ScanMode_Max = 4

var ET_VideoStandard_UNKNOW = 0x00000000 //Invalid

var ET_VideoStandard_PAL = 0x00000001 //PAL size:720*576 f/s : 25
var ET_VideoStandard_NTSC_2997 = 0x00000002 //NTSC size:720*486  f/s : 29.97
var ET_VideoStandard_NTSC_30 = 0x00000004 //NTSC size:720*486 f/s : 30
var ET_VideoStandard_SECAM = 0x00000008 //SECAM

var ET_VideoStandard_1920_1080_50i = 0x00000010 //HDTV size:1920*1080 f/s : 25  interlaced
var ET_VideoStandard_1920_1080_5994i = 0x00000020 //HDTV size:1920*1080 f/s : 29.97 interlaced
var ET_VideoStandard_1920_1080_60i = 0x00000040 //HDTV size:1920*1080 f/s : 30 interlaced

var ET_VideoStandard_1920_1080_2398p = 0x00000080 //HDTV size:1920*1080 f/s : 23.98 progressive
var ET_VideoStandard_1920_1080_24p = 0x00000100 //HDTV size:1920*1080 f/s : 24 progressive
var ET_VideoStandard_1920_1080_25p = 0x00000200 //HDTV size:1920*1080 f/s : 25 progressive
var ET_VideoStandard_1920_1080_2997p = 0x00000400 //HDTV size:1920*1080 f/s : 29.97 progressive
var ET_VideoStandard_1920_1080_30p = 0x00000800 //HDTV size:1920*1080 f/s : 30 progressive

var ET_VideoStandard_1280_720_2398p = 0x00001000 //HDTV size:1280*720 f/s : 23.98 progressive
var ET_VideoStandard_1280_720_24p = 0x00002000 //HDTV size:1280*720 f/s : 24 progressive
var ET_VideoStandard_1280_720_50p = 0x00004000 //HDTV size:1280*720 f/s : 50 progressive
var ET_VideoStandard_1280_720_5994p = 0x00008000 //HDTV size:1280*720 f/s : 59.94 progressive

var ET_VideoStandard_1440_1080_50i = 0x00010000 //HD  size:1440*1080 f/s : 25 interlaced
var ET_VideoStandard_1440_1080_5994i = 0x00020000 //HD  size:1440*1080 f/s : 29.97 interlaced
var ET_VideoStandard_1440_1080_60i = 0x00040000 //HD  size:1440*1080 f/s : 30 interlaced

var ET_VideoStandard_PAL_16_9 = 0x00080000 //PAL size:720*576 f/s : 25
var ET_VideoStandard_NTSC_2997_16_9 = 0x00100000 //NTSC size:720*486  f/s : 29.97
var ET_VideoStandard_NTSC_30_16_9 = 0x00200000 //NTSC size:720*486 f/s : 30
var ET_VideoStandard_NTSC_2997_480 = 0x00400000 //NTSC size:720*480  f/s : 29.97  //先留着，防止以后特殊情况再改成480
var ET_VideoStandard_NTSC_30_480 = 0x00800000 //NTSC size:720*480 f/s : 30 //先留着，防止以后特殊情况再改成480
var ET_VIDEOSTANDARD_1280_1080_50i = 0x01000000 //HD  size:1280*1080 f/s : 25 interlaced
var ET_VIDEOSTANDARD_PAL_25P = 0x10001000 //PAL size:720*576 f/s : 25
var ET_VIDEOSTANDARD_PAL_25P_16_9 = 0x10004000
var ET_VIDEOSTANDARD_PAL_50P = 0x10000100 //PAL size:720*576 f/s : 50
var ET_VIDEOSTANDARD_PAL_50P_16_9 = 0x10000400
var ET_VIDEOSTANDARD_1440_1080_50p = 0x10000010 //
var ET_VIDEOSTANDARD_1440_1080_25p = 0x10000040 //
var ET_VIDEOSTANDARD_1920_1080_50p = 0x10000004 //
var ET_VIDEOSTANDARD_1280_720_25p = 0x10000001 //

//新定义的宏【仅供E7使用】
//  var ET_VideoStandard_1280_720_25p       = 0x434120c1; //ljj@2013-11-20: change standard value 0x434120c1 to NS value.符合新定义模式的值，从文件中读取出来可以自然被正确解释。NS的值属于老的定义模式，需要下面的数组进行翻译。
var ET_VideoStandard_4096_2304_25p = 0x43412a01
var ET_VideoStandard_4096_3072_25p = 0x43212a41
//  var ET_VideoStandard_1280_720_2997p     = 0x464120c1;//ljj@2013-11-20: change 0x464120c1 to NS value

//[[ljj@2013-11-20: from NS value.
//var ET_VideoStandard_1280_720_25p     = 0x10000001;       //
//var ET_VideoStandard_1280_720_2997p       = 0x10000002;       //

var ET_VideoStandard_1920_1080_50p = 0x10000004 //
var ET_VideoStandard_1920_1080_5994p = 0x10000008 //

var ET_VideoStandard_1440_1080_50p = 0x10000010 //
var ET_VideoStandard_1440_1080_5994p = 0x10000020 //
var ET_VideoStandard_1440_1080_25p = 0x10000040 //
var ET_VideoStandard_1440_1080_2997p = 0x10000080 //

var ET_VideoStandard_PAL_50P = 0x10000100 //PAL size:720*576 f/s : 25
var ET_VideoStandard_NTSC_5994P = 0x10000200 //NTSC size:720*486  f/s : 29.97
var ET_VideoStandard_PAL_50P_16_9 = 0x10000400
var ET_VideoStandard_NTSC_5994P_16_9 = 0x10000800

var ET_VideoStandard_PAL_25P = 0x10001000 //PAL size:720*576 f/s : 25
var ET_VideoStandard_NTSC_2997P = 0x10002000 //NTSC size:720*486  f/s : 29.97
var ET_VideoStandard_PAL_25P_16_9 = 0x10004000
var ET_VideoStandard_NTSC_2997P_16_9 = 0x10008000
//]]ljj:from NS value end.

//[[ljj@2014-1-7: from NS & nova value.
var ET_VideoStandard_1280_1080_50i = 0x41412081
var ET_VideoStandard_1280_1080_5994i = 0x42412081
var ET_VideoStandard_1280_1080_60i = 0x4a412081

//for 广电
var ET_VideoStandard_1280_720_25p = 0x01000000 //HDTV size:1280*720 f/s : 25 progressive
var ET_VideoStandard_1280_720_2997p = 0x02000000 //HDTV size:1280*720 f/s : 2997 progressive

//for 海外
var ET_VideoStandard_1280_720_25pex = 0x10000001 //
var ET_VideoStandard_1280_720_2997pex = 0x10000002 //

var ETVS_OK = 0x00000000 //OK
var ETVS_VERSION_NG = 0x00000001 //版本号不支持
var ETVS_WIDTH_NG = 0x00000002 //宽度不合标准
var ETVS_HEIGHT_NG = 0x00000004 //高度不合标准
var ETVS_FRAMERATE_NG = 0x00000008 //帧率不合标准
var ETVS_DAR_NG = 0x00000010 //DAR不合标准
var ETVS_VIEW_NG = 0x00000020 //视窗个数不合标准
var ETVS_VESION1_NG = 0x00000040 //老版本的定义不合法
var ETVS_BITCOUNT_NG = 0x00000080 //BitCount不合标准

var ET_AspectRatio_Unknown = 0
var ET_AspectRatio_4_3 = 1 //4:3
var ET_AspectRatio_16_9 = 2 //16:9
var ET_AspectRatio_1_1 = 3 //1:1
var ET_AspectRatio_MAX = 4

var ET_ST_RATE_25 = 50 // PAL field frequency
var ET_ST_FRAME_RATE_25 = 25 // PAL frame  frequency
var ET_ST_SCALE_25 = 1 // PAL scale

var ET_ST_RATE_50 = 100 // PAL field frequency
var ET_ST_FRAME_RATE_50 = 50 // PAL frame  frequency
var ET_ST_SCALE_50 = 1 // PAL scale

var ET_ST_RATE_2997 = 5994 // NTSC field frequency
var ET_ST_FRAME_RATE_2997 = 2997 // NTSC frame  frequency
var ET_ST_SCALE_2997 = 100 // NTSC scale

var ET_ST_RATE_5994 = 11988 // NTSC field  frequency
var ET_ST_FRAME_RATE_5994 = 5994 // NTSC frame  frequency
var ET_ST_SCALE_5994 = 100 // NTSC scale

var ET_ST_RATE_60 = 120 // 30-F field frequency
var ET_ST_FRAME_RATE_60 = 60 // 30-F frame frequency
var ET_ST_SCALE_60 = 1 // 30-F scale

var ET_ST_RATE_30 = 60 // 30-F field frequency
var ET_ST_FRAME_RATE_30 = 30 // 30-F frame frequency
var ET_ST_SCALE_30 = 1 // 30-F scale

var ET_ST_RATE_24 = 48 // 24-F field frequency
var ET_ST_FRAME_RATE_24 = 24 // 24-F field frequency
var ET_ST_SCALE_24 = 1 // 24-F scale

var ET_ST_RATE_2398 = 48000 // 2398-F field frequency
var ET_ST_FRAME_RATE_2398 = 24000 // 2398-F frame frequency
var ET_ST_SCALE_2398 = 1001 // 2398-F scale

//wgf on 2012-01-12
var ET_ST_RATE_22 = 44 // 22-F field frequency
var ET_ST_FRAME_RATE_22 = 22 // 22-F frame frequency
var ET_ST_SCALE_22 = 1 // 22-F scale

var ET_ST_RATE_21 = 42 // 21-F field frequency
var ET_ST_FRAME_RATE_21 = 21 // 21-F frame frequency
var ET_ST_SCALE_21 = 1 // 21-F scale

var ET_ST_RATE_20 = 40 // 20-F field frequency
var ET_ST_FRAME_RATE_20 = 20 // 20-F frame frequency
var ET_ST_SCALE_20 = 1 // 20-F scale

var ET_ST_RATE_19 = 38 // 19-F field frequency
var ET_ST_FRAME_RATE_19 = 19 // 19-F frame frequency
var ET_ST_SCALE_19 = 1 // 19-F scale

var ET_ST_RATE_18 = 36 // 18-F field frequency
var ET_ST_FRAME_RATE_18 = 18 // 18-F frame frequency
var ET_ST_SCALE_18 = 1 // 18-F scale

var ET_ST_RATE_17 = 34 // 17-F field frequency
var ET_ST_FRAME_RATE_17 = 17 // 17-F frame frequency
var ET_ST_SCALE_17 = 1 // 17-F scale

var ET_ST_RATE_16 = 32 // 16-F field frequency
var ET_ST_FRAME_RATE_16 = 16 // 16-F frame frequency
var ET_ST_SCALE_16 = 1 // 16-F scale

var ET_ST_RATE_15 = 30 // 15-F field frequency
var ET_ST_FRAME_RATE_15 = 15 // 15-F frame frequency
var ET_ST_SCALE_15 = 1 // 15-F scale

var FRAMES_SECOND_25 = 25 // 25 Frame: frames per second
var FRAMES_MINUTE_25 = 1500 // 25 Frame: frames per minute
var FRAMES_HOUR_25 = 90000 // 25 Frame: frames per hour

var FRAMES_SECOND_24 = 24 // 24 Frame: frames per second
var FRAMES_MINUTE_24 = 1440 // 24 Frame: frames per minute
var FRAMES_HOUR_24 = 86400 // 24 Frame: frames per hour

var FRAMES_SECOND_NODROP_30 = 30 // 30 NO_DROP Frame: frames per second
var FRAMES_MINUTE_NODROP_30 = 1800 // 30 NO_DROP Frame: frames per minute
var FRAMES_HOUR_NODROP_30 = 108000 // 30 NO_DROP Frame: frames per hour

var FRAMES_MINUTE_30_DROP = 1798 // 30 DROP Frame: frames per minute
var FRAMES_10MINUTES_30_DROP = 17982 // 30 DROP Frame: frames per 10 minutes
var FRAMES_HOUR_30_DROP = 107892 // 30 DROP Frame: frames per hour

var FRAMES_SECOND_50 = 50 // 50 Frame: frames per second
var FRAMES_MINUTE_50 = 3000 // 50 Frame: frames per minute
var FRAMES_HOUR_50 = 180000 // 50 Frame: frames per hour

var ET_VIDEO_HS_UNKNOWN = 0
var ET_VIDEO_HS_SD = 1
var ET_VIDEO_HS_HD720p = 2
var ET_VIDEO_HS_HD1080i = 3
var ET_VIDEO_HS_HD1080p = 4
var ET_VIDEO_HS_HD1440i = 5
var ET_VIDEO_HS_4K = 6

var ET_3D_HS_SD = 7
var ET_3D_HS_HD720p = 8
var ET_3D_HS_HD1080i = 9
var ET_3D_HS_HD1080p = 10
var ET_3D_HS_HD1440i = 11
var ET_3D_HS_4K = 12

var ETVS_VERSION = function(l) {
  return l >> 30
}
var ETVS_FRAMERATE_I = function(l) {
  return (l & 0x3f000000) >> 24
}
var ETVS_DAR_I = function(l) {
  return (l & 0x00e00000) >> 21
}
var ETVS_VIEW_I = function(l) {
  return (l & 0x001f0000) >> 16
}
var ETVS_WIDTH_I = function(l) {
  return (l & 0x0000f800) >> 11
}
var ETVS_HEIGHT_I = function(l) {
  return (l & 0x000007c0) >> 6
}
var ETVS_BITCOUNT_I = function(l) {
  return l & 0x0000003f
}

var ETVS_SET_VERSION = function(l, r) {
  return (r |= l << 30)
}
var ETVS_SET_FRAMERATE = function(l, r) {
  return (r |= l << 24)
}
var ETVS_SET_DAR = function(l, r) {
  return (r |= l << 21)
}
var ETVS_SET_VIEW = function(l, r) {
  return (r |= l << 16)
}
var ETVS_SET_WIDTH = function(l, r) {
  return (r |= l << 11)
}
var ETVS_SET_HEIGHT = function(l, r) {
  return (r |= l << 6)
}
var ETVS_SET_BITCOUNT = function(l, r) {
  return (r |= l)
}
var G_EXST_VIDEOSTANDARD_ARRAY = [
  {
    tpVideoStand: ET_VideoStandard_UNKNOW,
    tpVideoStandardInfo: {
      nVersion: 0,
      tpAspect: {
        nWidth: 0,
        nHeight: 0
      },
      tpFrameRate: {
        eScanMode: ET_ScanMode_Interlaced,
        nTimeRate: 0,
        nTimeScale: 1
      },
      eAspectRatio: ET_AspectRatio_Unknown,
      eView: 0,
      eBitCount: 0
    }
  },
  {
    tpVideoStand: ET_VideoStandard_PAL,
    tpVideoStandardInfo: {
      nVersion: 0,
      tpAspect: {
        nWidth: 720,
        nHeight: 576
      },
      tpFrameRate: {
        eScanMode: ET_ScanMode_Interlaced,
        nTimeRate: ET_ST_FRAME_RATE_25,
        nTimeScale: ET_ST_SCALE_25
      },
      eAspectRatio: ET_AspectRatio_4_3,
      eView: 1,
      eBitCount: 8
    }
  },
  {
    tpVideoStand: ET_VideoStandard_NTSC_2997,
    tpVideoStandardInfo: {
      nVersion: 0,
      tpAspect: {
        nWidth: 720,
        nHeight: 486
      },
      tpFrameRate: {
        eScanMode: ET_ScanMode_Interlaced,
        nTimeRate: ET_ST_FRAME_RATE_2997,
        nTimeScale: ET_ST_SCALE_2997
      },
      eAspectRatio: ET_AspectRatio_4_3,
      eView: 1,
      eBitCount: 8
    }
  },
  {
    tpVideoStand: ET_VideoStandard_NTSC_30,
    tpVideoStandardInfo: {
      nVersion: 0,
      tpAspect: {
        nWidth: 720,
        nHeight: 486
      },
      tpFrameRate: {
        eScanMode: ET_ScanMode_Interlaced,
        nTimeRate: ET_ST_FRAME_RATE_30,
        nTimeScale: ET_ST_SCALE_30
      },
      eAspectRatio: ET_AspectRatio_4_3,
      eView: 1,
      eBitCount: 8
    }
  },
  {
    tpVideoStand: ET_VideoStandard_1920_1080_50i,
    tpVideoStandardInfo: {
      nVersion: 0,
      tpAspect: {
        nWidth: 1920,
        nHeight: 1080
      },
      tpFrameRate: {
        eScanMode: ET_ScanMode_Interlaced,
        nTimeRate: ET_ST_FRAME_RATE_25,
        nTimeScale: ET_ST_SCALE_25
      },
      eAspectRatio: ET_AspectRatio_16_9,
      eView: 1,
      eBitCount: 8
    }
  },
  {
    tpVideoStand: ET_VideoStandard_1920_1080_5994i,
    tpVideoStandardInfo: {
      nVersion: 0,
      tpAspect: {
        nWidth: 1920,
        nHeight: 1080
      },
      tpFrameRate: {
        eScanMode: ET_ScanMode_Interlaced,
        nTimeRate: ET_ST_FRAME_RATE_2997,
        nTimeScale: ET_ST_SCALE_2997
      },
      eAspectRatio: ET_AspectRatio_16_9,
      eView: 1,
      eBitCount: 8
    }
  },
  {
    tpVideoStand: ET_VideoStandard_1920_1080_60i,
    tpVideoStandardInfo: {
      nVersion: 0,
      tpAspect: {
        nWidth: 1920,
        nHeight: 1080
      },
      tpFrameRate: {
        eScanMode: ET_ScanMode_Interlaced,
        nTimeRate: ET_ST_FRAME_RATE_30,
        nTimeScale: ET_ST_SCALE_30
      },
      eAspectRatio: ET_AspectRatio_16_9,
      eView: 1,
      eBitCount: 8
    }
  },
  {
    tpVideoStand: ET_VideoStandard_1920_1080_2398p,
    tpVideoStandardInfo: {
      nVersion: 0,
      tpAspect: {
        nWidth: 1920,
        nHeight: 1080
      },
      tpFrameRate: {
        eScanMode: ET_ScanMode_Progressive,
        nTimeRate: ET_ST_FRAME_RATE_2398,
        nTimeScale: ET_ST_SCALE_2398
      },
      eAspectRatio: ET_AspectRatio_16_9,
      eView: 1,
      eBitCount: 8
    }
  },
  {
    tpVideoStand: ET_VideoStandard_1920_1080_24p,
    tpVideoStandardInfo: {
      nVersion: 0,
      tpAspect: {
        nWidth: 1920,
        nHeight: 1080
      },
      tpFrameRate: {
        eScanMode: ET_ScanMode_Progressive,
        nTimeRate: ET_ST_FRAME_RATE_24,
        nTimeScale: ET_ST_SCALE_24
      },
      eAspectRatio: ET_AspectRatio_16_9,
      eView: 1,
      eBitCount: 8
    }
  },
  {
    tpVideoStand: ET_VideoStandard_1920_1080_25p,
    tpVideoStandardInfo: {
      nVersion: 0,
      tpAspect: {
        nWidth: 1920,
        nHeight: 1080
      },
      tpFrameRate: {
        eScanMode: ET_ScanMode_Progressive,
        nTimeRate: ET_ST_FRAME_RATE_25,
        nTimeScale: ET_ST_SCALE_25
      },
      eAspectRatio: ET_AspectRatio_16_9,
      eView: 1,
      eBitCount: 8
    }
  },
  {
    tpVideoStand: ET_VideoStandard_1920_1080_2997p,
    tpVideoStandardInfo: {
      nVersion: 0,
      tpAspect: {
        nWidth: 1920,
        nHeight: 1080
      },
      tpFrameRate: {
        eScanMode: ET_ScanMode_Progressive,
        nTimeRate: ET_ST_FRAME_RATE_2997,
        nTimeScale: ET_ST_SCALE_2997
      },
      eAspectRatio: ET_AspectRatio_16_9,
      eView: 1,
      eBitCount: 8
    }
  },
  {
    tpVideoStand: ET_VideoStandard_1920_1080_30p,
    tpVideoStandardInfo: {
      nVersion: 0,
      tpAspect: {
        nWidth: 1920,
        nHeight: 1080
      },
      tpFrameRate: {
        eScanMode: ET_ScanMode_Progressive,
        nTimeRate: ET_ST_FRAME_RATE_30,
        nTimeScale: ET_ST_SCALE_30
      },
      eAspectRatio: ET_AspectRatio_16_9,
      eView: 1,
      eBitCount: 8
    }
  },
  {
    tpVideoStand: ET_VideoStandard_1280_720_2398p,
    tpVideoStandardInfo: {
      nVersion: 0,
      tpAspect: {
        nWidth: 1280,
        nHeight: 720
      },
      tpFrameRate: {
        eScanMode: ET_ScanMode_Progressive,
        nTimeRate: ET_ST_FRAME_RATE_2398,
        nTimeScale: ET_ST_SCALE_2398
      },
      eAspectRatio: ET_AspectRatio_16_9,
      eView: 1,
      eBitCount: 8
    }
  },
  {
    tpVideoStand: ET_VideoStandard_1280_720_24p,
    tpVideoStandardInfo: {
      nVersion: 0,
      tpAspect: {
        nWidth: 1280,
        nHeight: 720
      },
      tpFrameRate: {
        eScanMode: ET_ScanMode_Progressive,
        nTimeRate: ET_ST_FRAME_RATE_24,
        nTimeScale: ET_ST_SCALE_24
      },
      eAspectRatio: ET_AspectRatio_16_9,
      eView: 1,
      eBitCount: 8
    }
  },
  {
    tpVideoStand: ET_VideoStandard_1280_720_50p,
    tpVideoStandardInfo: {
      nVersion: 0,
      tpAspect: {
        nWidth: 1280,
        nHeight: 720
      },
      tpFrameRate: {
        eScanMode: ET_ScanMode_Progressive,
        nTimeRate: ET_ST_FRAME_RATE_50,
        nTimeScale: ET_ST_SCALE_50
      },
      eAspectRatio: ET_AspectRatio_16_9,
      eView: 1,
      eBitCount: 8
    }
  },
  {
    tpVideoStand: ET_VideoStandard_1280_720_5994p,
    tpVideoStandardInfo: {
      nVersion: 0,
      tpAspect: {
        nWidth: 1280,
        nHeight: 720
      },
      tpFrameRate: {
        eScanMode: ET_ScanMode_Progressive,
        nTimeRate: ET_ST_FRAME_RATE_5994,
        nTimeScale: ET_ST_SCALE_5994
      },
      eAspectRatio: ET_AspectRatio_16_9,
      eView: 1,
      eBitCount: 8
    }
  },
  {
    tpVideoStand: ET_VideoStandard_1440_1080_50i,
    tpVideoStandardInfo: {
      nVersion: 0,
      tpAspect: {
        nWidth: 1440,
        nHeight: 1080
      },
      tpFrameRate: {
        eScanMode: ET_ScanMode_Interlaced,
        nTimeRate: ET_ST_FRAME_RATE_25,
        nTimeScale: ET_ST_SCALE_25
      },
      eAspectRatio: ET_AspectRatio_16_9,
      eView: 1,
      eBitCount: 8
    }
  },
  {
    tpVideoStand: ET_VideoStandard_1440_1080_5994i,
    tpVideoStandardInfo: {
      nVersion: 0,
      tpAspect: {
        nWidth: 1440,
        nHeight: 1080
      },
      tpFrameRate: {
        eScanMode: ET_ScanMode_Interlaced,
        nTimeRate: ET_ST_FRAME_RATE_2997,
        nTimeScale: ET_ST_SCALE_2997
      },
      eAspectRatio: ET_AspectRatio_16_9,
      eView: 1,
      eBitCount: 8
    }
  },
  {
    tpVideoStand: ET_VideoStandard_1440_1080_60i,
    tpVideoStandardInfo: {
      nVersion: 0,
      tpAspect: {
        nWidth: 1440,
        nHeight: 1080
      },
      tpFrameRate: {
        eScanMode: ET_ScanMode_Interlaced,
        nTimeRate: ET_ST_FRAME_RATE_30,
        nTimeScale: ET_ST_SCALE_30
      },
      eAspectRatio: ET_AspectRatio_16_9,
      eView: 1,
      eBitCount: 8
    }
  },
  {
    tpVideoStand: ET_VideoStandard_PAL_16_9,
    tpVideoStandardInfo: {
      nVersion: 0,
      tpAspect: {
        nWidth: 720,
        nHeight: 576
      },
      tpFrameRate: {
        eScanMode: ET_ScanMode_Interlaced,
        nTimeRate: ET_ST_FRAME_RATE_25,
        nTimeScale: ET_ST_SCALE_25
      },
      eAspectRatio: ET_AspectRatio_16_9,
      eView: 1,
      eBitCount: 8
    }
  },
  {
    tpVideoStand: ET_VideoStandard_NTSC_2997_16_9,
    tpVideoStandardInfo: {
      nVersion: 0,
      tpAspect: {
        nWidth: 720,
        nHeight: 486
      },
      tpFrameRate: {
        eScanMode: ET_ScanMode_Interlaced,
        nTimeRate: ET_ST_FRAME_RATE_2997,
        nTimeScale: ET_ST_SCALE_2997
      },
      eAspectRatio: ET_AspectRatio_16_9,
      eView: 1,
      eBitCount: 8
    }
  },
  {
    tpVideoStand: ET_VideoStandard_NTSC_30_16_9,
    tpVideoStandardInfo: {
      nVersion: 0,
      tpAspect: {
        nWidth: 720,
        nHeight: 486
      },
      tpFrameRate: {
        eScanMode: ET_ScanMode_Interlaced,
        nTimeRate: ET_ST_FRAME_RATE_30,
        nTimeScale: ET_ST_SCALE_30
      },
      eAspectRatio: ET_AspectRatio_16_9,
      eView: 1,
      eBitCount: 8
    }
  },
  {
    tpVideoStand: ET_VideoStandard_NTSC_2997_480,
    tpVideoStandardInfo: {
      nVersion: 0,
      tpAspect: {
        nWidth: 720,
        nHeight: 480
      },
      tpFrameRate: {
        eScanMode: ET_ScanMode_Interlaced,
        nTimeRate: ET_ST_FRAME_RATE_2997,
        nTimeScale: ET_ST_SCALE_2997
      },
      eAspectRatio: ET_AspectRatio_4_3,
      eView: 1,
      eBitCount: 8
    }
  },
  {
    tpVideoStand: ET_VideoStandard_NTSC_30_480,
    tpVideoStandardInfo: {
      nVersion: 0,
      tpAspect: {
        nWidth: 720,
        nHeight: 480
      },
      tpFrameRate: {
        eScanMode: ET_ScanMode_Interlaced,
        nTimeRate: ET_ST_FRAME_RATE_30,
        nTimeScale: ET_ST_SCALE_30
      },
      eAspectRatio: ET_AspectRatio_4_3,
      eView: 1,
      eBitCount: 8
    }
  },
  {
    tpVideoStand: ET_VideoStandard_1280_720_25p,
    tpVideoStandardInfo: {
      nVersion: 0,
      tpAspect: {
        nWidth: 1280,
        nHeight: 720
      },
      tpFrameRate: {
        eScanMode: ET_ScanMode_Progressive,
        nTimeRate: ET_ST_FRAME_RATE_25,
        nTimeScale: ET_ST_SCALE_25
      },
      eAspectRatio: ET_AspectRatio_16_9,
      eView: 1,
      eBitCount: 8
    }
  },
  {
    tpVideoStand: ET_VideoStandard_1280_720_2997p,
    tpVideoStandardInfo: {
      nVersion: 0,
      tpAspect: {
        nWidth: 1280,
        nHeight: 720
      },
      tpFrameRate: {
        eScanMode: ET_ScanMode_Progressive,
        nTimeRate: ET_ST_FRAME_RATE_2997,
        nTimeScale: ET_ST_SCALE_2997
      },
      eAspectRatio: ET_AspectRatio_16_9,
      eView: 1,
      eBitCount: 8
    }
  },
  {
    tpVideoStand: ET_VideoStandard_1280_720_25pex,
    tpVideoStandardInfo: {
      nVersion: 0,
      tpAspect: {
        nWidth: 1280,
        nHeight: 720
      },
      tpFrameRate: {
        eScanMode: ET_ScanMode_Progressive,
        nTimeRate: ET_ST_FRAME_RATE_25,
        nTimeScale: ET_ST_SCALE_25
      },
      eAspectRatio: ET_AspectRatio_16_9,
      eView: 1,
      eBitCount: 8
    }
  },
  {
    tpVideoStand: ET_VideoStandard_1280_720_2997pex,
    tpVideoStandardInfo: {
      nVersion: 0,
      tpAspect: {
        nWidth: 1280,
        nHeight: 720
      },
      tpFrameRate: {
        eScanMode: ET_ScanMode_Progressive,
        nTimeRate: ET_ST_FRAME_RATE_2997,
        nTimeScale: ET_ST_SCALE_2997
      },
      eAspectRatio: ET_AspectRatio_16_9,
      eView: 1,
      eBitCount: 8
    }
  },
  {
    tpVideoStand: ET_VideoStandard_4096_2304_25p,
    tpVideoStandardInfo: {
      nVersion: 0,
      tpAspect: {
        nWidth: 4096,
        nHeight: 2304
      },
      tpFrameRate: {
        eScanMode: ET_ScanMode_Progressive,
        nTimeRate: ET_ST_FRAME_RATE_25,
        nTimeScale: ET_ST_SCALE_25
      },
      eAspectRatio: ET_AspectRatio_16_9,
      eView: 1,
      eBitCount: 8
    }
  },
  {
    tpVideoStand: ET_VideoStandard_4096_3072_25p,
    tpVideoStandardInfo: {
      nVersion: 0,
      tpAspect: {
        nWidth: 4096,
        nHeight: 3072
      },
      tpFrameRate: {
        eScanMode: ET_ScanMode_Progressive,
        nTimeRate: ET_ST_FRAME_RATE_25,
        nTimeScale: ET_ST_SCALE_25
      },
      eAspectRatio: ET_AspectRatio_4_3,
      eView: 1,
      eBitCount: 8
    }
  },
  {
    tpVideoStand: ET_VideoStandard_1280_1080_50i,
    tpVideoStandardInfo: {
      nVersion: 0,
      tpAspect: {
        nWidth: 1280,
        nHeight: 1080
      },
      tpFrameRate: {
        eScanMode: ET_ScanMode_Interlaced,
        nTimeRate: ET_ST_FRAME_RATE_25,
        nTimeScale: ET_ST_SCALE_25
      },
      eAspectRatio: ET_AspectRatio_16_9,
      eView: 1,
      eBitCount: 8
    }
  },
  {
    tpVideoStand: ET_VideoStandard_1280_1080_5994i,
    tpVideoStandardInfo: {
      nVersion: 0,
      tpAspect: {
        nWidth: 1280,
        nHeight: 1080
      },
      tpFrameRate: {
        eScanMode: ET_ScanMode_Interlaced,
        nTimeRate: ET_ST_FRAME_RATE_2997,
        nTimeScale: ET_ST_SCALE_2997
      },
      eAspectRatio: ET_AspectRatio_16_9,
      eView: 1,
      eBitCount: 8
    }
  },
  {
    tpVideoStand: ET_VideoStandard_1280_1080_60i,
    tpVideoStandardInfo: {
      nVersion: 0,
      tpAspect: {
        nWidth: 1280,
        nHeight: 1080
      },
      tpFrameRate: {
        eScanMode: ET_ScanMode_Interlaced,
        nTimeRate: ET_ST_FRAME_RATE_30,
        nTimeScale: ET_ST_SCALE_30
      },
      eAspectRatio: ET_AspectRatio_16_9,
      eView: 1,
      eBitCount: 8
    }
  },
  {
    tpVideoStand: ET_VideoStandard_1920_1080_50p,
    tpVideoStandardInfo: {
      nVersion: 0,
      tpAspect: {
        nWidth: 1920,
        nHeight: 1080
      },
      tpFrameRate: {
        eScanMode: ET_ScanMode_Progressive,
        nTimeRate: ET_ST_FRAME_RATE_50,
        nTimeScale: ET_ST_SCALE_50
      },
      eAspectRatio: ET_AspectRatio_16_9,
      eView: 1,
      eBitCount: 8
    }
  },
  {
    tpVideoStand: ET_VideoStandard_1920_1080_5994p,
    tpVideoStandardInfo: {
      nVersion: 0,
      tpAspect: {
        nWidth: 1920,
        nHeight: 1080
      },
      tpFrameRate: {
        eScanMode: ET_ScanMode_Progressive,
        nTimeRate: ET_ST_FRAME_RATE_5994,
        nTimeScale: ET_ST_SCALE_5994
      },
      eAspectRatio: ET_AspectRatio_16_9,
      eView: 1,
      eBitCount: 8
    }
  },
  {
    tpVideoStand: ET_VideoStandard_1440_1080_50p,
    tpVideoStandardInfo: {
      nVersion: 0,
      tpAspect: {
        nWidth: 1440,
        nHeight: 1080
      },
      tpFrameRate: {
        eScanMode: ET_ScanMode_Progressive,
        nTimeRate: ET_ST_FRAME_RATE_50,
        nTimeScale: ET_ST_SCALE_50
      },
      eAspectRatio: ET_AspectRatio_16_9,
      eView: 1,
      eBitCount: 8
    }
  },
  {
    tpVideoStand: ET_VideoStandard_1440_1080_5994p,
    tpVideoStandardInfo: {
      nVersion: 0,
      tpAspect: {
        nWidth: 1440,
        nHeight: 1080
      },
      tpFrameRate: {
        eScanMode: ET_ScanMode_Progressive,
        nTimeRate: ET_ST_FRAME_RATE_5994,
        nTimeScale: ET_ST_SCALE_5994
      },
      eAspectRatio: ET_AspectRatio_16_9,
      eView: 1,
      eBitCount: 8
    }
  },
  {
    tpVideoStand: ET_VideoStandard_1440_1080_25p,
    tpVideoStandardInfo: {
      nVersion: 0,
      tpAspect: {
        nWidth: 1440,
        nHeight: 1080
      },
      tpFrameRate: {
        eScanMode: ET_ScanMode_Progressive,
        nTimeRate: ET_ST_FRAME_RATE_25,
        nTimeScale: ET_ST_SCALE_25
      },
      eAspectRatio: ET_AspectRatio_16_9,
      eView: 1,
      eBitCount: 8
    }
  },
  {
    tpVideoStand: ET_VideoStandard_1440_1080_2997p,
    tpVideoStandardInfo: {
      nVersion: 0,
      tpAspect: {
        nWidth: 1440,
        nHeight: 1080
      },
      tpFrameRate: {
        eScanMode: ET_ScanMode_Progressive,
        nTimeRate: ET_ST_FRAME_RATE_2997,
        nTimeScale: ET_ST_SCALE_2997
      },
      eAspectRatio: ET_AspectRatio_16_9,
      eView: 1,
      eBitCount: 8
    }
  },
  {
    tpVideoStand: ET_VideoStandard_PAL_50P,
    tpVideoStandardInfo: {
      nVersion: 0,
      tpAspect: {
        nWidth: 720,
        nHeight: 576
      },
      tpFrameRate: {
        eScanMode: ET_ScanMode_Progressive,
        nTimeRate: ET_ST_FRAME_RATE_50,
        nTimeScale: ET_ST_SCALE_50
      },
      eAspectRatio: ET_AspectRatio_4_3,
      eView: 1,
      eBitCount: 8
    }
  },
  {
    tpVideoStand: ET_VideoStandard_NTSC_5994P,
    tpVideoStandardInfo: {
      nVersion: 0,
      tpAspect: {
        nWidth: 720,
        nHeight: 486
      },
      tpFrameRate: {
        eScanMode: ET_ScanMode_Progressive,
        nTimeRate: ET_ST_FRAME_RATE_5994,
        nTimeScale: ET_ST_SCALE_5994
      },
      eAspectRatio: ET_AspectRatio_4_3,
      eView: 1,
      eBitCount: 8
    }
  },
  {
    tpVideoStand: ET_VideoStandard_PAL_50P_16_9,
    tpVideoStandardInfo: {
      nVersion: 0,
      tpAspect: {
        nWidth: 720,
        nHeight: 576
      },
      tpFrameRate: {
        eScanMode: ET_ScanMode_Progressive,
        nTimeRate: ET_ST_FRAME_RATE_50,
        nTimeScale: ET_ST_SCALE_50
      },
      eAspectRatio: ET_AspectRatio_16_9,
      eView: 1,
      eBitCount: 8
    }
  },
  {
    tpVideoStand: ET_VideoStandard_NTSC_5994P_16_9,
    tpVideoStandardInfo: {
      nVersion: 0,
      tpAspect: {
        nWidth: 720,
        nHeight: 486
      },
      tpFrameRate: {
        eScanMode: ET_ScanMode_Progressive,
        nTimeRate: ET_ST_FRAME_RATE_5994,
        nTimeScale: ET_ST_SCALE_5994
      },
      eAspectRatio: ET_AspectRatio_16_9,
      eView: 1,
      eBitCount: 8
    }
  },
  {
    tpVideoStand: ET_VideoStandard_PAL_25P,
    tpVideoStandardInfo: {
      nVersion: 0,
      tpAspect: {
        nWidth: 720,
        nHeight: 576
      },
      tpFrameRate: {
        eScanMode: ET_ScanMode_Progressive,
        nTimeRate: ET_ST_FRAME_RATE_25,
        nTimeScale: ET_ST_SCALE_25
      },
      eAspectRatio: ET_AspectRatio_4_3,
      eView: 1,
      eBitCount: 8
    }
  },
  {
    tpVideoStand: ET_VideoStandard_NTSC_2997P,
    tpVideoStandardInfo: {
      nVersion: 0,
      tpAspect: {
        nWidth: 720,
        nHeight: 486
      },
      tpFrameRate: {
        eScanMode: ET_ScanMode_Progressive,
        nTimeRate: ET_ST_FRAME_RATE_2997,
        nTimeScale: ET_ST_SCALE_2997
      },
      eAspectRatio: ET_AspectRatio_4_3,
      eView: 1,
      eBitCount: 8
    }
  },
  {
    tpVideoStand: ET_VideoStandard_PAL_25P_16_9,
    tpVideoStandardInfo: {
      nVersion: 0,
      tpAspect: {
        nWidth: 720,
        nHeight: 576
      },
      tpFrameRate: {
        eScanMode: ET_ScanMode_Progressive,
        nTimeRate: ET_ST_FRAME_RATE_25,
        nTimeScale: ET_ST_SCALE_25
      },
      eAspectRatio: ET_AspectRatio_16_9,
      eView: 1,
      eBitCount: 8
    }
  },
  {
    tpVideoStand: ET_VideoStandard_NTSC_2997P_16_9,
    tpVideoStandardInfo: {
      nVersion: 0,
      tpAspect: {
        nWidth: 720,
        nHeight: 486
      },
      tpFrameRate: {
        eScanMode: ET_ScanMode_Progressive,
        nTimeRate: ET_ST_FRAME_RATE_2997,
        nTimeScale: ET_ST_SCALE_2997
      },
      eAspectRatio: ET_AspectRatio_16_9,
      eView: 1,
      eBitCount: 8
    }
  }
]

var ET_EXSIT_VIDEOSTANDARD_NUM = G_EXST_VIDEOSTANDARD_ARRAY.length

var G_ET_FRAMERATE_ARRAY = [
  {
    eScanMode: ET_ScanMode_Interlaced,
    nTimeRate: 0,
    nTimeScale: 1
  },
  {
    eScanMode: ET_ScanMode_Interlaced,
    nTimeRate: ET_ST_FRAME_RATE_25,
    nTimeScale: ET_ST_SCALE_25
  },
  {
    eScanMode: ET_ScanMode_Interlaced,
    nTimeRate: ET_ST_FRAME_RATE_2997,
    nTimeScale: ET_ST_SCALE_2997
  },
  {
    eScanMode: ET_ScanMode_Progressive,
    nTimeRate: ET_ST_FRAME_RATE_25,
    nTimeScale: ET_ST_SCALE_25
  },
  {
    eScanMode: ET_ScanMode_Progressive,
    nTimeRate: ET_ST_FRAME_RATE_2398,
    nTimeScale: ET_ST_SCALE_2398
  },
  {
    eScanMode: ET_ScanMode_Progressive,
    nTimeRate: ET_ST_FRAME_RATE_24,
    nTimeScale: ET_ST_SCALE_24
  },
  {
    eScanMode: ET_ScanMode_Progressive,
    nTimeRate: ET_ST_FRAME_RATE_2997,
    nTimeScale: ET_ST_SCALE_2997
  },
  {
    eScanMode: ET_ScanMode_Progressive,
    nTimeRate: ET_ST_FRAME_RATE_30,
    nTimeScale: ET_ST_SCALE_30
  },
  {
    eScanMode: ET_ScanMode_Progressive,
    nTimeRate: ET_ST_FRAME_RATE_50,
    nTimeScale: ET_ST_SCALE_50
  },
  {
    eScanMode: ET_ScanMode_Progressive,
    nTimeRate: ET_ST_FRAME_RATE_5994,
    nTimeScale: ET_ST_SCALE_5994
  },
  {
    eScanMode: ET_ScanMode_Interlaced,
    nTimeRate: ET_ST_FRAME_RATE_30,
    nTimeScale: ET_ST_SCALE_30
  },
  {
    eScanMode: ET_ScanMode_Progressive,
    nTimeRate: ET_ST_FRAME_RATE_60,
    nTimeScale: ET_ST_SCALE_60
  },
  {
    eScanMode: ET_ScanMode_Interlaced_BottomFirst,
    nTimeRate: ET_ST_FRAME_RATE_25,
    nTimeScale: ET_ST_SCALE_25
  },
  {
    eScanMode: ET_ScanMode_Interlaced_BottomFirst,
    nTimeRate: ET_ST_FRAME_RATE_2997,
    nTimeScale: ET_ST_SCALE_2997
  },
  {
    eScanMode: ET_ScanMode_Interlaced_BottomFirst,
    nTimeRate: ET_ST_FRAME_RATE_30,
    nTimeScale: ET_ST_SCALE_30
  },
  {
    eScanMode: ET_ScanMode_Progressive,
    nTimeRate: ET_ST_FRAME_RATE_22,
    nTimeScale: ET_ST_SCALE_22
  },
  {
    eScanMode: ET_ScanMode_Progressive,
    nTimeRate: ET_ST_FRAME_RATE_21,
    nTimeScale: ET_ST_SCALE_21
  },
  {
    eScanMode: ET_ScanMode_Progressive,
    nTimeRate: ET_ST_FRAME_RATE_20,
    nTimeScale: ET_ST_SCALE_20
  },
  {
    eScanMode: ET_ScanMode_Progressive,
    nTimeRate: ET_ST_FRAME_RATE_19,
    nTimeScale: ET_ST_SCALE_19
  },
  {
    eScanMode: ET_ScanMode_Progressive,
    nTimeRate: ET_ST_FRAME_RATE_18,
    nTimeScale: ET_ST_SCALE_18
  },
  {
    eScanMode: ET_ScanMode_Progressive,
    nTimeRate: ET_ST_FRAME_RATE_17,
    nTimeScale: ET_ST_SCALE_17
  },
  {
    eScanMode: ET_ScanMode_Progressive,
    nTimeRate: ET_ST_FRAME_RATE_16,
    nTimeScale: ET_ST_SCALE_16
  },
  {
    eScanMode: ET_ScanMode_Progressive,
    nTimeRate: ET_ST_FRAME_RATE_15,
    nTimeScale: ET_ST_SCALE_15
  }
]
var ET_FRAMERATE_NUM = G_ET_FRAMERATE_ARRAY.length

var G_WIDTH_ARRAY = [
  0,
  720,
  1920,
  1440,
  1280,
  4096,
  960,
  640,
  320,
  360,
  180,
  240,
  480,
  160,
  800,
  1024,
  1366,
  2048,
  3840
]
var ET_WIDTH_NUM = G_WIDTH_ARRAY.length

var G_HEIGHT_ARRAY = [
  0,
  576,
  1080,
  720,
  480,
  486,
  960,
  2664,
  2304,
  3072,
  240,
  360,
  288,
  608,
  320,
  304,
  600,
  768,
  1536,
  400,
  640,
  2160
]

var ET_HEIGHT_NUM = G_HEIGHT_ARRAY.length

var G_VIEW_ARRAY = [0, 1, 2, 4, 8, 16, 32]

var ET_VIEW_NUM = G_VIEW_ARRAY.length

var G_BITCOUNT_ARRAY = [0, 8, 10, 12, 16]
var ET_BITCOUNT_NUM = G_BITCOUNT_ARRAY.length
//为了与之前的制式进行兼容，将使用新规则拼出来的制式，转成之前的制式值
function ET_GetOldStandard(dwStandard) {
  if (ETVS_VERSION(dwStandard) == 0)
    //已经是老制式，直接返回
    return dwStandard

  var dwOldStadnard = ET_VideoStandard_UNKNOW
  switch (dwStandard) {
    case 0x40000000:
      dwOldStadnard = ET_VideoStandard_UNKNOW
      break
    case 0x41210841:
      dwOldStadnard = ET_VideoStandard_PAL
      break
    case 0x41411081:
      dwOldStadnard = ET_VideoStandard_1920_1080_50i
      break
    case 0x41411881:
      dwOldStadnard = ET_VideoStandard_1440_1080_50i
      break
    case 0x41410841:
      dwOldStadnard = ET_VideoStandard_PAL_16_9
      break
    case 0x43411081:
      dwOldStadnard = ET_VideoStandard_1920_1080_25p
      break
    case 0x434120c1:
      dwOldStadnard = ET_VideoStandard_1280_720_25p
      break
    case 0x43412a01:
      dwOldStadnard = ET_VideoStandard_4096_2304_25p
      break
    case 0x43212a41:
      dwOldStadnard = ET_VideoStandard_4096_3072_25p
      break
    case 0x42210941:
      dwOldStadnard = ET_VideoStandard_NTSC_2997
      break
    case 0x42411081:
      dwOldStadnard = ET_VideoStandard_1920_1080_5994i
      break
    case 0x42411881:
      dwOldStadnard = ET_VideoStandard_1440_1080_5994i
      break
    case 0x42410941:
      dwOldStadnard = ET_VideoStandard_NTSC_2997_16_9
      break
    case 0x42210901:
      dwOldStadnard = ET_VideoStandard_NTSC_2997_480
      break
    case 0x4a210941:
      dwOldStadnard = ET_VideoStandard_NTSC_30
      break
    case 0x4a411081:
      dwOldStadnard = ET_VideoStandard_1920_1080_60i
      break
    case 0x4a411881:
      dwOldStadnard = ET_VideoStandard_1440_1080_60i
      break
    case 0x4a410941:
      dwOldStadnard = ET_VideoStandard_NTSC_30_16_9
      break
    case 0x4a210901:
      dwOldStadnard = ET_VideoStandard_NTSC_30_480
      break
    case 0x484120c1:
      dwOldStadnard = ET_VideoStandard_1280_720_50p
      break
    case 0x45411081:
      dwOldStadnard = ET_VideoStandard_1920_1080_24p
      break
    case 0x454120c1:
      dwOldStadnard = ET_VideoStandard_1280_720_24p
      break
    case 0x44411081:
      dwOldStadnard = ET_VideoStandard_1920_1080_2398p
      break
    case 0x444120c1:
      dwOldStadnard = ET_VideoStandard_1280_720_2398p
      break
    case 0x46411081:
      dwOldStadnard = ET_VideoStandard_1920_1080_2997p
      break
    case 0x464120c1:
      dwOldStadnard = ET_VideoStandard_1280_720_2997p
      break
    case 0x47411081:
      dwOldStadnard = ET_VideoStandard_1920_1080_30p
      break
    case 0x494120c1:
      dwOldStadnard = ET_VideoStandard_1280_720_5994p
      break
    case 0x48411081:
      dwOldStadnard = ET_VideoStandard_1920_1080_50p
      break
    case 0x49411081:
      dwOldStadnard = ET_VideoStandard_1920_1080_5994p
      break
    case 0x48411881:
      dwOldStadnard = ET_VideoStandard_1440_1080_50p
      break
    case 0x43411881:
      dwOldStadnard = ET_VideoStandard_1440_1080_25p
      break
    case 0x46411881:
      dwOldStadnard = ET_VideoStandard_1440_1080_2997p
      break
    case 0x48210841:
      dwOldStadnard = ET_VideoStandard_PAL_50P
      break
    case 0x49210941:
      dwOldStadnard = ET_VideoStandard_NTSC_5994P
      break
    case 0x48410841:
      dwOldStadnard = ET_VideoStandard_PAL_50P_16_9
      break
    case 0x49410941:
      dwOldStadnard = ET_VideoStandard_NTSC_5994P_16_9
      break
    case 0x43210841:
      dwOldStadnard = ET_VideoStandard_PAL_25P
      break
    case 0x46210941:
      dwOldStadnard = ET_VideoStandard_NTSC_2997P
      break
    case 0x43410841:
      dwOldStadnard = ET_VideoStandard_PAL_25P_16_9
      break
    case 0x46410941:
      dwOldStadnard = ET_VideoStandard_NTSC_2997P_16_9
      break
    case 0x41412081:
      dwOldStadnard = ET_VideoStandard_1280_1080_50i
      break
    case 0x42412081:
      dwOldStadnard = ET_VideoStandard_1280_1080_5994i
      break
    case 0x4a412081:
      dwOldStadnard = ET_VideoStandard_1280_1080_60i
      break

    default:
      dwOldStadnard = dwStandard
      break
  }

  return dwOldStadnard
}
function ETGetVideoFrameRate(dwStandard) {
  var pExsitVS = ETGetExsitVideoStandard(dwStandard)
  var tpFrameRate
  if (null != pExsitVS) {
    return (tpFrameRate = pExsitVS.tpVideoStandardInfo.tpFrameRate)
    //return pExsitVS.tpVideoStand == ET_VideoStandard_UNKNOW ? ETVS_VESION1_NG : ETVS_OK;
  }

  //var vRet = ETVS_FRAMERATE_NG;
  var iIndex = ETVS_FRAMERATE_I(dwStandard)

  if (iIndex > 0 && iIndex < ET_FRAMERATE_NUM) {
    tpFrameRate = G_ET_FRAMERATE_ARRAY[iIndex]
    //vRet = ETVS_OK;
  } else {
    tpFrameRate = G_ET_FRAMERATE_ARRAY[0]
  }
  return tpFrameRate
  //return vRet;
}
var FrameRateEnum = {
  FR_25: 1,
  FR_2997: 2,
  FR_50: 3,
  FR_5997: 4,
  FR_5994: 5,
  FR_30: 6
}
function GetFrameRateByVideoStandard(videostandard) {
  var _frameRate = ETGetVideoFrameRate(videostandard).nTimeRate
  var frameRate = FrameRateEnum.FR_25
  if (_frameRate == 25) {
    frameRate = FrameRateEnum.FR_25
  } else if (_frameRate == 2997) {
    frameRate = FrameRateEnum.FR_2997
  } else if (_frameRate == 50) {
    frameRate = FrameRateEnum.FR_50
  } else if (_frameRate == 5994) {
    frameRate = FrameRateEnum.FR_5994
  } else if (_frameRate == 30) {
    frameRate = FrameRateEnum.FR_30
  }
  return frameRate
}

function GetTimeStringByFrameNum(
  lFrameNum,
  lNtscTcMode,
  videoStandard,
  framerate
) {
  if (lFrameNum == undefined || lNtscTcMode == undefined) return '00:00:00:00'
  if (lFrameNum < 0) lFrameNum = 0
  videoStandard = ET_GetOldStandard(videoStandard)
  var frm = 0,
    sec = 0,
    min = 0,
    hour = 0
  var df = false
  if (lNtscTcMode == 0) {
    df = true
  }
  if (GetFrameRateByVideoStandard(videoStandard) == FrameRateEnum.FR_50) {
    var frm720p = lFrameNum % (25 * 2)
    frm = parseInt(frm720p / 2)
    var sec_total = (lFrameNum - frm720p) / (25 * 2)
    sec = sec_total % 60
    var min_total = (sec_total - sec) / 60
    min = min_total % 60
    hour = (min_total - min) / 60

    df = false //P制都是非丢帧的
  } else if (
    GetFrameRateByVideoStandard(videoStandard) == FrameRateEnum.FR_5994
  ) {
    if (lNtscTcMode == 0) {
      var freeFrame = lFrameNum % (107892 * 2)
      hour = parseInt(lFrameNum / (107892 * 2))
      var tenMin = parseInt(freeFrame / (17982 * 2))
      freeFrame = freeFrame % (17982 * 2)
      var nMin = parseInt((freeFrame - 4) / (1798 * 2))
      min = nMin + tenMin * 10
      freeFrame = freeFrame - nMin * (1798 * 2)

      sec = parseInt(freeFrame / (30 * 2))
      //frm = freeFrame % (30*2);
      var frm720p = freeFrame % (30 * 2)
      frm = parseInt(frm720p / 2)

      df = true
    } else {
      var frm720p = lFrameNum % (30 * 2)
      frm = parseInt(frm720p / 2)
      var sec_total = (lFrameNum - frm720p) / (30 * 2)
      sec = sec_total % 60
      var min_total = (sec_total - sec) / 60
      min = min_total % 60
      hour = (min_total - min) / 60
    }
  } else if (
    GetFrameRateByVideoStandard(videoStandard) == FrameRateEnum.FR_25
  ) {
    frm = lFrameNum % 25
    var sec_total = (lFrameNum - frm) / 25
    sec = sec_total % 60
    var min_total = (sec_total - sec) / 60
    min = min_total % 60
    hour = (min_total - min) / 60

    df = false //P制都是非丢帧的
  } else if (
    GetFrameRateByVideoStandard(videoStandard) == FrameRateEnum.FR_2997 ||
    GetFrameRateByVideoStandard(videoStandard) == FrameRateEnum.FR_30
  ) {
    if (lNtscTcMode == 0) {
      var freeFrame = lFrameNum % 107892
      hour = parseInt(lFrameNum / 107892)
      var tenMin = parseInt(freeFrame / 17982)
      freeFrame = freeFrame % 17982
      var nMin = parseInt((freeFrame - 2) / 1798)
      min = nMin + tenMin * 10
      freeFrame = freeFrame - nMin * 1798

      sec = parseInt(freeFrame / 30)
      frm = freeFrame % 30
      df = true
    } else {
      frm = lFrameNum % 30
      var sec_total = (lFrameNum - frm) / 30
      sec = sec_total % 60
      var min_total = (sec_total - sec) / 60
      min = min_total % 60
      hour = (min_total - min) / 60
    }
  } else {
    //默认按照25帧率算

    frm = lFrameNum % 25
    var sec_total = (lFrameNum - frm) / 25
    sec = sec_total % 60
    var min_total = (sec_total - sec) / 60
    min = min_total % 60
    hour = (min_total - min) / 60

    df = false //P制都是非丢帧的
  }

  return (
    (hour < 10 ? '0' + hour : hour) +
    ':' +
    (min < 10 ? '0' + min : min) +
    (df ? '.' : ':') +
    (sec < 10 ? '0' + sec : sec) +
    ':' +
    (frm < 10 ? '0' + frm : frm)
  )
}
function ETVS_VERSION(l) {
  return l >> 30
}
function ETGetExsitVideoStandard(dwStandard) {
  var G_EXST_VIDEOSTANDARD_ARRAY = [
    {
      tpVideoStand: ET_VideoStandard_UNKNOW,
      tpVideoStandardInfo: {
        nVersion: 0,
        tpAspect: {
          nWidth: 0,
          nHeight: 0
        },
        tpFrameRate: {
          eScanMode: ET_ScanMode_Interlaced,
          nTimeRate: 0,
          nTimeScale: 1
        },
        eAspectRatio: ET_AspectRatio_Unknown,
        eView: 0,
        eBitCount: 0
      }
    },
    {
      tpVideoStand: ET_VideoStandard_PAL,
      tpVideoStandardInfo: {
        nVersion: 0,
        tpAspect: {
          nWidth: 720,
          nHeight: 576
        },
        tpFrameRate: {
          eScanMode: ET_ScanMode_Interlaced,
          nTimeRate: ET_ST_FRAME_RATE_25,
          nTimeScale: ET_ST_SCALE_25
        },
        eAspectRatio: ET_AspectRatio_4_3,
        eView: 1,
        eBitCount: 8
      }
    },
    {
      tpVideoStand: ET_VideoStandard_NTSC_2997,
      tpVideoStandardInfo: {
        nVersion: 0,
        tpAspect: {
          nWidth: 720,
          nHeight: 486
        },
        tpFrameRate: {
          eScanMode: ET_ScanMode_Interlaced,
          nTimeRate: ET_ST_FRAME_RATE_2997,
          nTimeScale: ET_ST_SCALE_2997
        },
        eAspectRatio: ET_AspectRatio_4_3,
        eView: 1,
        eBitCount: 8
      }
    },
    {
      tpVideoStand: ET_VideoStandard_NTSC_30,
      tpVideoStandardInfo: {
        nVersion: 0,
        tpAspect: {
          nWidth: 720,
          nHeight: 486
        },
        tpFrameRate: {
          eScanMode: ET_ScanMode_Interlaced,
          nTimeRate: ET_ST_FRAME_RATE_30,
          nTimeScale: ET_ST_SCALE_30
        },
        eAspectRatio: ET_AspectRatio_4_3,
        eView: 1,
        eBitCount: 8
      }
    },
    {
      tpVideoStand: ET_VideoStandard_1920_1080_50i,
      tpVideoStandardInfo: {
        nVersion: 0,
        tpAspect: {
          nWidth: 1920,
          nHeight: 1080
        },
        tpFrameRate: {
          eScanMode: ET_ScanMode_Interlaced,
          nTimeRate: ET_ST_FRAME_RATE_25,
          nTimeScale: ET_ST_SCALE_25
        },
        eAspectRatio: ET_AspectRatio_16_9,
        eView: 1,
        eBitCount: 8
      }
    },
    {
      tpVideoStand: ET_VideoStandard_1920_1080_5994i,
      tpVideoStandardInfo: {
        nVersion: 0,
        tpAspect: {
          nWidth: 1920,
          nHeight: 1080
        },
        tpFrameRate: {
          eScanMode: ET_ScanMode_Interlaced,
          nTimeRate: ET_ST_FRAME_RATE_2997,
          nTimeScale: ET_ST_SCALE_2997
        },
        eAspectRatio: ET_AspectRatio_16_9,
        eView: 1,
        eBitCount: 8
      }
    },
    {
      tpVideoStand: ET_VideoStandard_1920_1080_60i,
      tpVideoStandardInfo: {
        nVersion: 0,
        tpAspect: {
          nWidth: 1920,
          nHeight: 1080
        },
        tpFrameRate: {
          eScanMode: ET_ScanMode_Interlaced,
          nTimeRate: ET_ST_FRAME_RATE_30,
          nTimeScale: ET_ST_SCALE_30
        },
        eAspectRatio: ET_AspectRatio_16_9,
        eView: 1,
        eBitCount: 8
      }
    },
    {
      tpVideoStand: ET_VideoStandard_1920_1080_2398p,
      tpVideoStandardInfo: {
        nVersion: 0,
        tpAspect: {
          nWidth: 1920,
          nHeight: 1080
        },
        tpFrameRate: {
          eScanMode: ET_ScanMode_Progressive,
          nTimeRate: ET_ST_FRAME_RATE_2398,
          nTimeScale: ET_ST_SCALE_2398
        },
        eAspectRatio: ET_AspectRatio_16_9,
        eView: 1,
        eBitCount: 8
      }
    },
    {
      tpVideoStand: ET_VideoStandard_1920_1080_24p,
      tpVideoStandardInfo: {
        nVersion: 0,
        tpAspect: {
          nWidth: 1920,
          nHeight: 1080
        },
        tpFrameRate: {
          eScanMode: ET_ScanMode_Progressive,
          nTimeRate: ET_ST_FRAME_RATE_24,
          nTimeScale: ET_ST_SCALE_24
        },
        eAspectRatio: ET_AspectRatio_16_9,
        eView: 1,
        eBitCount: 8
      }
    },
    {
      tpVideoStand: ET_VideoStandard_1920_1080_25p,
      tpVideoStandardInfo: {
        nVersion: 0,
        tpAspect: {
          nWidth: 1920,
          nHeight: 1080
        },
        tpFrameRate: {
          eScanMode: ET_ScanMode_Progressive,
          nTimeRate: ET_ST_FRAME_RATE_25,
          nTimeScale: ET_ST_SCALE_25
        },
        eAspectRatio: ET_AspectRatio_16_9,
        eView: 1,
        eBitCount: 8
      }
    },
    {
      tpVideoStand: ET_VideoStandard_1920_1080_2997p,
      tpVideoStandardInfo: {
        nVersion: 0,
        tpAspect: {
          nWidth: 1920,
          nHeight: 1080
        },
        tpFrameRate: {
          eScanMode: ET_ScanMode_Progressive,
          nTimeRate: ET_ST_FRAME_RATE_2997,
          nTimeScale: ET_ST_SCALE_2997
        },
        eAspectRatio: ET_AspectRatio_16_9,
        eView: 1,
        eBitCount: 8
      }
    },
    {
      tpVideoStand: ET_VideoStandard_1920_1080_30p,
      tpVideoStandardInfo: {
        nVersion: 0,
        tpAspect: {
          nWidth: 1920,
          nHeight: 1080
        },
        tpFrameRate: {
          eScanMode: ET_ScanMode_Progressive,
          nTimeRate: ET_ST_FRAME_RATE_30,
          nTimeScale: ET_ST_SCALE_30
        },
        eAspectRatio: ET_AspectRatio_16_9,
        eView: 1,
        eBitCount: 8
      }
    },
    {
      tpVideoStand: ET_VideoStandard_1280_720_2398p,
      tpVideoStandardInfo: {
        nVersion: 0,
        tpAspect: {
          nWidth: 1280,
          nHeight: 720
        },
        tpFrameRate: {
          eScanMode: ET_ScanMode_Progressive,
          nTimeRate: ET_ST_FRAME_RATE_2398,
          nTimeScale: ET_ST_SCALE_2398
        },
        eAspectRatio: ET_AspectRatio_16_9,
        eView: 1,
        eBitCount: 8
      }
    },
    {
      tpVideoStand: ET_VideoStandard_1280_720_24p,
      tpVideoStandardInfo: {
        nVersion: 0,
        tpAspect: {
          nWidth: 1280,
          nHeight: 720
        },
        tpFrameRate: {
          eScanMode: ET_ScanMode_Progressive,
          nTimeRate: ET_ST_FRAME_RATE_24,
          nTimeScale: ET_ST_SCALE_24
        },
        eAspectRatio: ET_AspectRatio_16_9,
        eView: 1,
        eBitCount: 8
      }
    },
    {
      tpVideoStand: ET_VideoStandard_1280_720_50p,
      tpVideoStandardInfo: {
        nVersion: 0,
        tpAspect: {
          nWidth: 1280,
          nHeight: 720
        },
        tpFrameRate: {
          eScanMode: ET_ScanMode_Progressive,
          nTimeRate: ET_ST_FRAME_RATE_50,
          nTimeScale: ET_ST_SCALE_50
        },
        eAspectRatio: ET_AspectRatio_16_9,
        eView: 1,
        eBitCount: 8
      }
    },
    {
      tpVideoStand: ET_VideoStandard_1280_720_5994p,
      tpVideoStandardInfo: {
        nVersion: 0,
        tpAspect: {
          nWidth: 1280,
          nHeight: 720
        },
        tpFrameRate: {
          eScanMode: ET_ScanMode_Progressive,
          nTimeRate: ET_ST_FRAME_RATE_5994,
          nTimeScale: ET_ST_SCALE_5994
        },
        eAspectRatio: ET_AspectRatio_16_9,
        eView: 1,
        eBitCount: 8
      }
    },
    {
      tpVideoStand: ET_VideoStandard_1440_1080_50i,
      tpVideoStandardInfo: {
        nVersion: 0,
        tpAspect: {
          nWidth: 1440,
          nHeight: 1080
        },
        tpFrameRate: {
          eScanMode: ET_ScanMode_Interlaced,
          nTimeRate: ET_ST_FRAME_RATE_25,
          nTimeScale: ET_ST_SCALE_25
        },
        eAspectRatio: ET_AspectRatio_16_9,
        eView: 1,
        eBitCount: 8
      }
    },
    {
      tpVideoStand: ET_VideoStandard_1440_1080_5994i,
      tpVideoStandardInfo: {
        nVersion: 0,
        tpAspect: {
          nWidth: 1440,
          nHeight: 1080
        },
        tpFrameRate: {
          eScanMode: ET_ScanMode_Interlaced,
          nTimeRate: ET_ST_FRAME_RATE_2997,
          nTimeScale: ET_ST_SCALE_2997
        },
        eAspectRatio: ET_AspectRatio_16_9,
        eView: 1,
        eBitCount: 8
      }
    },
    {
      tpVideoStand: ET_VideoStandard_1440_1080_60i,
      tpVideoStandardInfo: {
        nVersion: 0,
        tpAspect: {
          nWidth: 1440,
          nHeight: 1080
        },
        tpFrameRate: {
          eScanMode: ET_ScanMode_Interlaced,
          nTimeRate: ET_ST_FRAME_RATE_30,
          nTimeScale: ET_ST_SCALE_30
        },
        eAspectRatio: ET_AspectRatio_16_9,
        eView: 1,
        eBitCount: 8
      }
    },
    {
      tpVideoStand: ET_VideoStandard_PAL_16_9,
      tpVideoStandardInfo: {
        nVersion: 0,
        tpAspect: {
          nWidth: 720,
          nHeight: 576
        },
        tpFrameRate: {
          eScanMode: ET_ScanMode_Interlaced,
          nTimeRate: ET_ST_FRAME_RATE_25,
          nTimeScale: ET_ST_SCALE_25
        },
        eAspectRatio: ET_AspectRatio_16_9,
        eView: 1,
        eBitCount: 8
      }
    },
    {
      tpVideoStand: ET_VideoStandard_NTSC_2997_16_9,
      tpVideoStandardInfo: {
        nVersion: 0,
        tpAspect: {
          nWidth: 720,
          nHeight: 486
        },
        tpFrameRate: {
          eScanMode: ET_ScanMode_Interlaced,
          nTimeRate: ET_ST_FRAME_RATE_2997,
          nTimeScale: ET_ST_SCALE_2997
        },
        eAspectRatio: ET_AspectRatio_16_9,
        eView: 1,
        eBitCount: 8
      }
    },
    {
      tpVideoStand: ET_VideoStandard_NTSC_30_16_9,
      tpVideoStandardInfo: {
        nVersion: 0,
        tpAspect: {
          nWidth: 720,
          nHeight: 486
        },
        tpFrameRate: {
          eScanMode: ET_ScanMode_Interlaced,
          nTimeRate: ET_ST_FRAME_RATE_30,
          nTimeScale: ET_ST_SCALE_30
        },
        eAspectRatio: ET_AspectRatio_16_9,
        eView: 1,
        eBitCount: 8
      }
    },
    {
      tpVideoStand: ET_VideoStandard_NTSC_2997_480,
      tpVideoStandardInfo: {
        nVersion: 0,
        tpAspect: {
          nWidth: 720,
          nHeight: 480
        },
        tpFrameRate: {
          eScanMode: ET_ScanMode_Interlaced,
          nTimeRate: ET_ST_FRAME_RATE_2997,
          nTimeScale: ET_ST_SCALE_2997
        },
        eAspectRatio: ET_AspectRatio_4_3,
        eView: 1,
        eBitCount: 8
      }
    },
    {
      tpVideoStand: ET_VideoStandard_NTSC_30_480,
      tpVideoStandardInfo: {
        nVersion: 0,
        tpAspect: {
          nWidth: 720,
          nHeight: 480
        },
        tpFrameRate: {
          eScanMode: ET_ScanMode_Interlaced,
          nTimeRate: ET_ST_FRAME_RATE_30,
          nTimeScale: ET_ST_SCALE_30
        },
        eAspectRatio: ET_AspectRatio_4_3,
        eView: 1,
        eBitCount: 8
      }
    },
    {
      tpVideoStand: ET_VideoStandard_1280_720_25p,
      tpVideoStandardInfo: {
        nVersion: 0,
        tpAspect: {
          nWidth: 1280,
          nHeight: 720
        },
        tpFrameRate: {
          eScanMode: ET_ScanMode_Progressive,
          nTimeRate: ET_ST_FRAME_RATE_25,
          nTimeScale: ET_ST_SCALE_25
        },
        eAspectRatio: ET_AspectRatio_16_9,
        eView: 1,
        eBitCount: 8
      }
    },
    {
      tpVideoStand: ET_VideoStandard_1280_720_2997p,
      tpVideoStandardInfo: {
        nVersion: 0,
        tpAspect: {
          nWidth: 1280,
          nHeight: 720
        },
        tpFrameRate: {
          eScanMode: ET_ScanMode_Progressive,
          nTimeRate: ET_ST_FRAME_RATE_2997,
          nTimeScale: ET_ST_SCALE_2997
        },
        eAspectRatio: ET_AspectRatio_16_9,
        eView: 1,
        eBitCount: 8
      }
    },
    {
      tpVideoStand: ET_VideoStandard_1280_720_25pex,
      tpVideoStandardInfo: {
        nVersion: 0,
        tpAspect: {
          nWidth: 1280,
          nHeight: 720
        },
        tpFrameRate: {
          eScanMode: ET_ScanMode_Progressive,
          nTimeRate: ET_ST_FRAME_RATE_25,
          nTimeScale: ET_ST_SCALE_25
        },
        eAspectRatio: ET_AspectRatio_16_9,
        eView: 1,
        eBitCount: 8
      }
    },
    {
      tpVideoStand: ET_VideoStandard_1280_720_2997pex,
      tpVideoStandardInfo: {
        nVersion: 0,
        tpAspect: {
          nWidth: 1280,
          nHeight: 720
        },
        tpFrameRate: {
          eScanMode: ET_ScanMode_Progressive,
          nTimeRate: ET_ST_FRAME_RATE_2997,
          nTimeScale: ET_ST_SCALE_2997
        },
        eAspectRatio: ET_AspectRatio_16_9,
        eView: 1,
        eBitCount: 8
      }
    },
    {
      tpVideoStand: ET_VideoStandard_4096_2304_25p,
      tpVideoStandardInfo: {
        nVersion: 0,
        tpAspect: {
          nWidth: 4096,
          nHeight: 2304
        },
        tpFrameRate: {
          eScanMode: ET_ScanMode_Progressive,
          nTimeRate: ET_ST_FRAME_RATE_25,
          nTimeScale: ET_ST_SCALE_25
        },
        eAspectRatio: ET_AspectRatio_16_9,
        eView: 1,
        eBitCount: 8
      }
    },
    {
      tpVideoStand: ET_VideoStandard_4096_3072_25p,
      tpVideoStandardInfo: {
        nVersion: 0,
        tpAspect: {
          nWidth: 4096,
          nHeight: 3072
        },
        tpFrameRate: {
          eScanMode: ET_ScanMode_Progressive,
          nTimeRate: ET_ST_FRAME_RATE_25,
          nTimeScale: ET_ST_SCALE_25
        },
        eAspectRatio: ET_AspectRatio_4_3,
        eView: 1,
        eBitCount: 8
      }
    },
    {
      tpVideoStand: ET_VideoStandard_1280_1080_50i,
      tpVideoStandardInfo: {
        nVersion: 0,
        tpAspect: {
          nWidth: 1280,
          nHeight: 1080
        },
        tpFrameRate: {
          eScanMode: ET_ScanMode_Interlaced,
          nTimeRate: ET_ST_FRAME_RATE_25,
          nTimeScale: ET_ST_SCALE_25
        },
        eAspectRatio: ET_AspectRatio_16_9,
        eView: 1,
        eBitCount: 8
      }
    },
    {
      tpVideoStand: ET_VideoStandard_1280_1080_5994i,
      tpVideoStandardInfo: {
        nVersion: 0,
        tpAspect: {
          nWidth: 1280,
          nHeight: 1080
        },
        tpFrameRate: {
          eScanMode: ET_ScanMode_Interlaced,
          nTimeRate: ET_ST_FRAME_RATE_2997,
          nTimeScale: ET_ST_SCALE_2997
        },
        eAspectRatio: ET_AspectRatio_16_9,
        eView: 1,
        eBitCount: 8
      }
    },
    {
      tpVideoStand: ET_VideoStandard_1280_1080_60i,
      tpVideoStandardInfo: {
        nVersion: 0,
        tpAspect: {
          nWidth: 1280,
          nHeight: 1080
        },
        tpFrameRate: {
          eScanMode: ET_ScanMode_Interlaced,
          nTimeRate: ET_ST_FRAME_RATE_30,
          nTimeScale: ET_ST_SCALE_30
        },
        eAspectRatio: ET_AspectRatio_16_9,
        eView: 1,
        eBitCount: 8
      }
    },
    {
      tpVideoStand: ET_VideoStandard_1920_1080_50p,
      tpVideoStandardInfo: {
        nVersion: 0,
        tpAspect: {
          nWidth: 1920,
          nHeight: 1080
        },
        tpFrameRate: {
          eScanMode: ET_ScanMode_Progressive,
          nTimeRate: ET_ST_FRAME_RATE_50,
          nTimeScale: ET_ST_SCALE_50
        },
        eAspectRatio: ET_AspectRatio_16_9,
        eView: 1,
        eBitCount: 8
      }
    },
    {
      tpVideoStand: ET_VideoStandard_1920_1080_5994p,
      tpVideoStandardInfo: {
        nVersion: 0,
        tpAspect: {
          nWidth: 1920,
          nHeight: 1080
        },
        tpFrameRate: {
          eScanMode: ET_ScanMode_Progressive,
          nTimeRate: ET_ST_FRAME_RATE_5994,
          nTimeScale: ET_ST_SCALE_5994
        },
        eAspectRatio: ET_AspectRatio_16_9,
        eView: 1,
        eBitCount: 8
      }
    },
    {
      tpVideoStand: ET_VideoStandard_1440_1080_50p,
      tpVideoStandardInfo: {
        nVersion: 0,
        tpAspect: {
          nWidth: 1440,
          nHeight: 1080
        },
        tpFrameRate: {
          eScanMode: ET_ScanMode_Progressive,
          nTimeRate: ET_ST_FRAME_RATE_50,
          nTimeScale: ET_ST_SCALE_50
        },
        eAspectRatio: ET_AspectRatio_16_9,
        eView: 1,
        eBitCount: 8
      }
    },
    {
      tpVideoStand: ET_VideoStandard_1440_1080_5994p,
      tpVideoStandardInfo: {
        nVersion: 0,
        tpAspect: {
          nWidth: 1440,
          nHeight: 1080
        },
        tpFrameRate: {
          eScanMode: ET_ScanMode_Progressive,
          nTimeRate: ET_ST_FRAME_RATE_5994,
          nTimeScale: ET_ST_SCALE_5994
        },
        eAspectRatio: ET_AspectRatio_16_9,
        eView: 1,
        eBitCount: 8
      }
    },
    {
      tpVideoStand: ET_VideoStandard_1440_1080_25p,
      tpVideoStandardInfo: {
        nVersion: 0,
        tpAspect: {
          nWidth: 1440,
          nHeight: 1080
        },
        tpFrameRate: {
          eScanMode: ET_ScanMode_Progressive,
          nTimeRate: ET_ST_FRAME_RATE_25,
          nTimeScale: ET_ST_SCALE_25
        },
        eAspectRatio: ET_AspectRatio_16_9,
        eView: 1,
        eBitCount: 8
      }
    },
    {
      tpVideoStand: ET_VideoStandard_1440_1080_2997p,
      tpVideoStandardInfo: {
        nVersion: 0,
        tpAspect: {
          nWidth: 1440,
          nHeight: 1080
        },
        tpFrameRate: {
          eScanMode: ET_ScanMode_Progressive,
          nTimeRate: ET_ST_FRAME_RATE_2997,
          nTimeScale: ET_ST_SCALE_2997
        },
        eAspectRatio: ET_AspectRatio_16_9,
        eView: 1,
        eBitCount: 8
      }
    },
    {
      tpVideoStand: ET_VideoStandard_PAL_50P,
      tpVideoStandardInfo: {
        nVersion: 0,
        tpAspect: {
          nWidth: 720,
          nHeight: 576
        },
        tpFrameRate: {
          eScanMode: ET_ScanMode_Progressive,
          nTimeRate: ET_ST_FRAME_RATE_50,
          nTimeScale: ET_ST_SCALE_50
        },
        eAspectRatio: ET_AspectRatio_4_3,
        eView: 1,
        eBitCount: 8
      }
    },
    {
      tpVideoStand: ET_VideoStandard_NTSC_5994P,
      tpVideoStandardInfo: {
        nVersion: 0,
        tpAspect: {
          nWidth: 720,
          nHeight: 486
        },
        tpFrameRate: {
          eScanMode: ET_ScanMode_Progressive,
          nTimeRate: ET_ST_FRAME_RATE_5994,
          nTimeScale: ET_ST_SCALE_5994
        },
        eAspectRatio: ET_AspectRatio_4_3,
        eView: 1,
        eBitCount: 8
      }
    },
    {
      tpVideoStand: ET_VideoStandard_PAL_50P_16_9,
      tpVideoStandardInfo: {
        nVersion: 0,
        tpAspect: {
          nWidth: 720,
          nHeight: 576
        },
        tpFrameRate: {
          eScanMode: ET_ScanMode_Progressive,
          nTimeRate: ET_ST_FRAME_RATE_50,
          nTimeScale: ET_ST_SCALE_50
        },
        eAspectRatio: ET_AspectRatio_16_9,
        eView: 1,
        eBitCount: 8
      }
    },
    {
      tpVideoStand: ET_VideoStandard_NTSC_5994P_16_9,
      tpVideoStandardInfo: {
        nVersion: 0,
        tpAspect: {
          nWidth: 720,
          nHeight: 486
        },
        tpFrameRate: {
          eScanMode: ET_ScanMode_Progressive,
          nTimeRate: ET_ST_FRAME_RATE_5994,
          nTimeScale: ET_ST_SCALE_5994
        },
        eAspectRatio: ET_AspectRatio_16_9,
        eView: 1,
        eBitCount: 8
      }
    },
    {
      tpVideoStand: ET_VideoStandard_PAL_25P,
      tpVideoStandardInfo: {
        nVersion: 0,
        tpAspect: {
          nWidth: 720,
          nHeight: 576
        },
        tpFrameRate: {
          eScanMode: ET_ScanMode_Progressive,
          nTimeRate: ET_ST_FRAME_RATE_25,
          nTimeScale: ET_ST_SCALE_25
        },
        eAspectRatio: ET_AspectRatio_4_3,
        eView: 1,
        eBitCount: 8
      }
    },
    {
      tpVideoStand: ET_VideoStandard_NTSC_2997P,
      tpVideoStandardInfo: {
        nVersion: 0,
        tpAspect: {
          nWidth: 720,
          nHeight: 486
        },
        tpFrameRate: {
          eScanMode: ET_ScanMode_Progressive,
          nTimeRate: ET_ST_FRAME_RATE_2997,
          nTimeScale: ET_ST_SCALE_2997
        },
        eAspectRatio: ET_AspectRatio_4_3,
        eView: 1,
        eBitCount: 8
      }
    },
    {
      tpVideoStand: ET_VideoStandard_PAL_25P_16_9,
      tpVideoStandardInfo: {
        nVersion: 0,
        tpAspect: {
          nWidth: 720,
          nHeight: 576
        },
        tpFrameRate: {
          eScanMode: ET_ScanMode_Progressive,
          nTimeRate: ET_ST_FRAME_RATE_25,
          nTimeScale: ET_ST_SCALE_25
        },
        eAspectRatio: ET_AspectRatio_16_9,
        eView: 1,
        eBitCount: 8
      }
    },
    {
      tpVideoStand: ET_VideoStandard_NTSC_2997P_16_9,
      tpVideoStandardInfo: {
        nVersion: 0,
        tpAspect: {
          nWidth: 720,
          nHeight: 486
        },
        tpFrameRate: {
          eScanMode: ET_ScanMode_Progressive,
          nTimeRate: ET_ST_FRAME_RATE_2997,
          nTimeScale: ET_ST_SCALE_2997
        },
        eAspectRatio: ET_AspectRatio_16_9,
        eView: 1,
        eBitCount: 8
      }
    }
  ]
  var iExsitVSCount = G_EXST_VIDEOSTANDARD_ARRAY.length

  for (var i = 0; i < iExsitVSCount; i++) {
    if (G_EXST_VIDEOSTANDARD_ARRAY[i].tpVideoStand == dwStandard) {
      //return (ETExsitVideoStandard*)G_EXST_VIDEOSTANDARD_ARRAY+i;
      return G_EXST_VIDEOSTANDARD_ARRAY[i]
    }
  }
  return null
}

function GetFrameNumByHundredNS(hundredNanoSeconds, videoStandard, ntscTcMode) {
  if (isNaN(hundredNanoSeconds)) {
    hundredNanoSeconds = 0
  }
  videoStandard = ET_GetOldStandard(videoStandard)
  //百纳秒转帧
  var seconds = (hundredNanoSeconds / Math.pow(10, 9)) * 100
  var _frame

  if (GetFrameRateByVideoStandard(videoStandard) == FrameRateEnum.FR_50) {
    _frame = seconds * 50
  } else if (
    GetFrameRateByVideoStandard(videoStandard) == FrameRateEnum.FR_5994
  ) {
    _frame = (seconds * 60000) / 1001
  } else if (
    GetFrameRateByVideoStandard(videoStandard) == FrameRateEnum.FR_25
  ) {
    _frame = seconds * 25
  } else if (
    GetFrameRateByVideoStandard(videoStandard) == FrameRateEnum.FR_2997
  ) {
    _frame = (seconds * 30000) / 1001
  } else if (
    GetFrameRateByVideoStandard(videoStandard) == FrameRateEnum.FR_30
  ) {
    _frame = seconds * 30
  }
  _frame = _frame.toFixed(0)
  return parseInt(_frame)
}
