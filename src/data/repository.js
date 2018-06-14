import treeNode from './treeNode.js'
const repository = {
  '86023a7e3f2646a2bbee8a9fec7e6bcb': [
    {
      name: 'Trashcan',
      selected: false,
      checked: false,
      open: false,
      renaming: false,
      selecting: false,
      previewType: 'other',
      operations: ['Restore All Materials', 'Empty Trash Can'],
      guid: 0,
      father: treeNode.rootNodes[0],
      icon: 'transhcan_icon',
      path: 'global_sobey_defaultclass/MaterialList/Trashcan',
      floor: 2,
      updateId: 0,
      typeid: '16',
      type: 'folder',
      children: [],
      folders: []
    }
  ]
}
function getRepository (key) {
  return repository[key] || ((repository[key] = []), repository[key])
}

function setRepository (key, val) {
  if (Array.isArray(val)) {
    repository[key] = val.groupBy('guid').map(item => item[0]) // distinct
  } else {
    repository[key] = getRepository(val)
  }
}
export { getRepository, setRepository }
