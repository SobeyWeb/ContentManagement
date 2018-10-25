import {
  throttle,
  debounce,
  getCookie
} from '../lib/util'
import treeNode from '../data/treeNode'
import {
  emptyMaterial
} from '../data/basicData'
import EVENT from '../dicts/eventTypes'

export default {
  trashcan: treeNode.trashcan,
  operatingFilterData: {
    visible: false,
    header: {
      width: 0
    },
    position: {
      x: 0,
      y: 0
    }
  },
  filterHeaders: [],
  lastCheckedHeaderName: '',
  system: 'WEBCM',
  player: null,
  property: null,
  Errors: [],
  showOAMaterials: true,
  showSearch: false,
  condition: '',
  updateId: 0,
  containerUpdate: 0,
  rowCount: 0,
  scrollingV: 0,
  playerHistory: [],
  ws_materials: [],
  refreshFunc: throttle(
    3000,
    function () {
      this.property.refresh()
    },
    true
  ),
  materialSelectionChangeFunc: debounce(
    300,
    function () {
      window.$app.emit(
        EVENT.MATERIAL_SELECTED,
        this.selectedMaterials.map(item => {
          return {
            name: item.name,
            guid: item.guid,
            type: item.type,
            path: item.path,
            subtype: item.subtype,
            typeid: item.typeid,
            objectguid: item.objectguid,
            markguid: item.markguid,
            marktype: item.flag
          }
        })
      )
    },
    false
  ),
  markSelectionChangeFunc: debounce(
    300,
    function () {
      window.$app.emit(
        EVENT.MARKER_SELECTED,
        this.selectedMarkers.map(item => {
          return {
            objectguid: item.objectguid,
            type: item.flag,
            markguid: item.markguid,
            marktype: item.flag
          }
        })
      )
    },
    false
  ),
  lmLanguage: 1,
  defaultLanguage: 1,
  thumbnailStyle: {
    width: 130,
    height: 73
  },
  loading: false,
  scaleTime: 1,
  linkNodes: treeNode.quickLinks,
  tempSearchModel: null,
  dragOverCount: 0, // for auto scroll
  currentSearchModel: null,
  lastSeletedNode: {},
  isMarker: false,
  previewDragSymbol: false,
  saveNewData: {
    trimin: '',
    trimout: '',
    material: {}
  },
  useSpace: 0, // 使用空间
  sumSpace: 10, // 总空间
  fullscreenSymbol: false,
  listSymbol: false, //
  previewMaterials: [],
  s3Path: '',
  uploadPath: '',
  siteList: [],
  archiveFiters: {
    // Archived: true,
    double: true,
    HDD: true,
    ODA: true,
    Online: true,
    [undefined]: true,
    '': true
  },
  isAdvanceConfig: false,
  isModifyCondtion: false,
  isSearched: false,
  bakAdvanceSearchHeaders: null,
  isRemember: {
    checked: true,
    text: 'Remember'
  },
  templateID: '',
  templateCondition: {},
  searchNode: {},
  searchType: 1,
  fulltextSearchCondition: {},
  advanceSearchHeaders: [],
  advanceSearchWindow: null,
  playerWindow: {},
  previewOptions: {
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
  },
  exportWindow: {},
  markerExportWindow: null,
  dept: 'to',
  relations: [],
  relationsWindow: null,
  exportInfo: {
    isSaveFrame: false,
    isUseDefault: true,
    taskName: '',
    material: {},
    note: '',
    comments: '',
    isTrim: false,
    isLive: false,
    TRIMIN: -1,
    INPOINT: -1,
    OUTPOINT: -1,
    TRIMOUT: -1,
    title: '',
    path: '',
    IsSendMPCFlow: 0
  },
  exportMaterials: [],
  snsviewPath: '',
  snsiconfilename: '',
  configSNSid: [],
  isFocusTree: true,
  isFocusPlayer: false,
  // isRegister: false,
  registerdata: {
    registerViewPath: 'OA Material / ',
    registerPath: '',
    oaFolderMosid: '',
    eventData: [],
    selectedStudioid: '',
    selectedStudioMosid: '',
    selectTime: '',
    selectRundownid: ''
  },
  // isplayerRegister: false,
  registerMaterial: {},
  // highFileLength: 0,
  ispublish: false,
  publishWindow: {},
  RegisterWundow: {},
  SNSPublishQuality: 'high',
  materialSpace: 0,
  isSaveAs: false,
  saveSearchResultWindow: null,
  saveSearchName: '',
  userDept: [],
  userArr: [],
  deptArr: [],
  dragSymbol: false,
  dragDirection: false,
  navPath: [],
  nodes: treeNode.rootNodes,
  oaFolder: treeNode.oaNodes,
  publicPath: treeNode.pureRootNodes,
  lastRemoveMaterial: null,
  selectedMaterials: [],
  selectedMarkers: [],
  signIndex: 0,
  sortType: 'title',
  sortSymbol: true,
  typeSymbol: false,
  mousePosition: {
    x: 0,
    y: 0
  },
  menuStatus: false,
  advanceSearchStatus: false,
  dragData: {
    left: 0,
    top: 0,
    width: 0,
    height: 0
  },
  clipBoard: [],
  clipBoardSymbol: true, // true 为剪贴， false为复制
  userInfo: getCookie('userInfo') ? JSON.parse(getCookie('userInfo')) : {},
  previewSymbol: false,
  detailviewSymbol: false,
  dvStyle: {
    width: undefined,
    height: undefined,
    padding: undefined
  },
  resourceBlockStatus: true,
  alwaysGet: false,
  thumbPadding: 7,
  saveFolder: {},
  listOrder: {
    type: 'title',
    symbol: true,
    disabled: true
  },
  markerOrder: {
    type: 'LM Title',
    symbol: true,
    disabled: false
  },
  selectedNode: null,
  eventArray: {},
  excutingTask: [],
  complateTask: [],
  hightLight: [{
      name: 'Title',
      attr: 'name'
    },
    {
      name: 'Comments',
      attr: 'note'
    },
    {
      name: 'Rights',
      attr: 'rights'
    }
  ],
  customKeys: [],
  headers: [{
      name: 'Tittle',
      attr: 'name',
      width: 200,
      dragging: false,
      checked: true
    },
    {
      name: 'Creator',
      attr: 'creatorName',
      width: 100,
      dragging: false,
      checked: true
    },
    {
      name: 'Creation Date',
      attr: 'formatDate',
      width: 130,
      dragging: false,
      checked: true
    },
    {
      name: 'Modified By',
      attr: 'modifierName',
      width: 100,
      dragging: false,
      checked: true
    },
    {
      name: 'Modification Date',
      attr: 'modificationDate',
      width: 130,
      dragging: false,
      checked: true
    },
    {
      name: 'Clip Status',
      attr: 'clipStatus',
      width: 100,
      dragging: false,
      checked: true
    },
    {
      name: 'Storage Status',
      attr: 'onlinstatus',
      width: 100,
      dragging: false,
      checked: true
    },
    {
      name: 'HV',
      attr: 'hv',
      width: 50,
      dragging: false,
      checked: true
    },
    {
      name: 'LV',
      attr: 'lv',
      width: 50,
      dragging: false,
      checked: true
    },
    {
      name: 'HA',
      attr: 'ha',
      width: 50,
      dragging: false,
      checked: true
    },
    {
      name: 'LA',
      attr: 'la',
      width: 50,
      dragging: false,
      checked: true
    },
    {
      name: 'Total Duration',
      attr: 'totalDuration',
      width: 100,
      dragging: false,
      checked: true
    },
    {
      name: 'Material Duration',
      attr: 'length',
      width: 100,
      dragging: false,
      checked: true
    },
    {
      name: 'In Point',
      attr: 'trimin',
      width: 100,
      dragging: false,
      checked: true
    },
    {
      name: 'Out Point',
      attr: 'trimout',
      width: 100,
      dragging: false,
      checked: true
    },
    {
      name: '16:9 SD',
      attr: 'img16_9sd',
      width: 80,
      dragging: false,
      checked: true
    },
    {
      name: 'Rights',
      attr: 'rights',
      width: 150,
      dragging: false,
      checked: true
    },
    {
      name: 'Comments',
      attr: 'note',
      width: 200,
      dragging: false,
      checked: true
    },
    {
      name: 'To be Deleted',
      attr: 'tobedel',
      width: 110,
      dragging: false,
      checked: true
    },
    {
      name: 'HD/SD',
      attr: 'hsd',
      width: 70,
      dragging: false,
      checked: true
    },
    {
      name: 'Recording Date',
      attr: 'recordingDate',
      width: 130,
      dragging: false,
      checked: true
    },
    {
      name: 'Proxy Status',
      attr: 'proxyStatus',
      width: 130,
      dragging: false,
      checked: true
    }
  ]
}
