import appSetting from '../config/appSetting.js'
let rootPath = 'global_sobey_defaultclass'

export default {
  quickLinks: [
    {
      name: 'Quick Links',
      selected: false,
      checked: false,
      open: true,
      renaming: false,
      selecting: false,
      operations: [],
      guid: -2,
      floor: 1,
      type: 'folder',
      children: [],
      folders: []
    }
  ],
  rootNodes: [
    {
      name: 'Network',
      selected: false,
      checked: false,
      open: false,
      renaming: false,
      selecting: false,
      operations: [],
      guid: '86023a7e3f2646a2bbee8a9fec7e6bcb',
      path: appSetting.USEROOTPATH ? rootPath : rootPath + '/MaterialList',
      folderpath: rootPath,
      floor: 1,
      updateId: 0,
      icon: 'network_icon',
      typeid: '16',
      type: 'folder',
      children: [],
      folders: []
    },
    {
      name: 'Search Result',
      selected: false,
      checked: false,
      open: false,
      selecting: false,
      previewType: 'other',
      operations: [],
      guid: 1,
      icon: 'searchresult_icon',
      path: rootPath + '/Search Result',
      folderpath: rootPath,
      floor: 1,
      updateId: 0,
      typeid: '16',
      type: 'folder',
      children: [],
      searchModel: [],
      folders: [],
      condition: null,
      bakCondition: null
    }
  ],
  pureRootNodes: [
    {
      name: 'Network',
      selected: false,
      checked: false,
      open: false,
      renaming: false,
      selecting: false,
      operations: [],
      guid: '5',
      path: appSetting.USEROOTPATH ? rootPath : rootPath + '/MaterialList',
      floor: 1,
      icon: 'network_icon',
      type: 'folder',
      children: [],
      folders: []
    }
  ],
  oaNodes: [
    {
      name: 'OA Material',
      selected: false,
      checked: false,
      open: false,
      renaming: false,
      selecting: false,
      operations: [],
      guid: '4',
      path: appSetting.OAPATH,
      floor: 1,
      type: 'folder',
      children: [],
      folders: []
    }
  ]
}
