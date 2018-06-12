export default {
  defaultFulltextSearchCondtion: {
    keywords: '',
    timeFilter: [
      {
        name: 'One Day',
        checked: false,
        key: 0
      },
      {
        name: 'One Week',
        checked: false,
        key: 6
      },
      {
        name: 'One Month',
        checked: false,
        key: 30
      },
      {
        name: 'One Year',
        checked: false,
        key: 365
      }
    ],
    typeFilter: [
      {
        name: 'Folder',
        checked: false,
        key: 'folder'
      },
      {
        name: 'A/V',
        checked: false,
        key: 'biz_sobey_video'
      },
      {
        name: 'PGM',
        checked: false,
        key: 'biz_sobey_program'
      },
      {
        name: 'Audio',
        checked: false,
        key: 'biz_sobey_audio'
      },
      {
        name: 'Document',
        checked: false,
        key: 'biz_sobey_document'
      },
      {
        name: 'Picture',
        checked: false,
        key: 'biz_sobey_picture'
      },
      {
        name: 'Other',
        checked: false,
        key: 'biz_sobey_other'
      }
    ],
    booleanCondition: [
      {
        name: 'Include These',
        key: 'include',
        value: ''
      },
      {
        name: 'This Exact Words',
        key: 'exacts',
        value: ''
      },
      {
        name: 'Any of This',
        key: 'anys',
        value: ''
      },
      {
        name: 'None of This',
        key: 'notstr',
        value: ''
      }
    ]
  },
  defaultAdvanceSearchCondtion: [
    {
      checked: false,
      dragging: false,
      keyValues: [
        {
          name: 'Title',
          value: '',
          order: 0,
          isCustom: false,
          ctrl: 'rd-text',
          visible: true,
          key: 'name_'
        },
        {
          name: 'Comments',
          value: '',
          order: 1,
          isCustom: false,
          ctrl: 'rd-text',
          visible: true,
          key: 'note'
        },
        {
          name: 'Creator',
          value: '',
          order: 2,
          isCustom: false,
          userdata: null,
          ctrl: 'user-selector-ctrl',
          visible: true,
          key: 'createUser_'
        },
        {
          name: 'Create Date',
          value: '',
          order: 3,
          isCustom: false,
          ctrl: 'rd-datepicker',
          visible: true,
          isRange: true,
          key: 'createDate_',
          from: {
            value: ''
          },
          to: {
            value: ''
          }
        },
        {
          name: 'Modified By',
          value: '',
          order: 4,
          userdata: null,
          isCustom: false,
          ctrl: 'user-selector-ctrl',
          visible: true,
          key: 'lastUpdateUser_'
        },
        {
          name: 'Modified Date',
          value: '',
          order: 5,
          isCustom: false,
          ctrl: 'rd-datepicker',
          visible: true,
          isRange: true,
          key: 'lastUpdateDate_',
          from: {
            value: ''
          },
          to: {
            value: ''
          }
        },
        {
          name: 'Right',
          value: '',
          order: 6,
          isCustom: false,
          ctrl: 'rd-text',
          visible: true,
          key: 'rights'
        },
        {
          name: 'Journalist',
          value: '',
          order: 7,
          isCustom: false,
          ctrl: 'rd-text',
          visible: true,
          key: 'journallist'
        },
        {
          name: 'Item Name',
          value: '',
          order: 8,
          isCustom: false,
          ctrl: 'rd-text',
          visible: true,
          key: 'itemname'
        },
        {
          name: 'Category',
          value: '',
          order: 9,
          isCustom: false,
          ctrl: 'rd-text',
          visible: true,
          key: 'category'
        },
        {
          name: 'Program Name',
          value: '',
          order: 10,
          isCustom: false,
          ctrl: 'rd-text',
          visible: true,
          key: 'programname'
        },
        {
          name: 'Locations',
          options: [
            {
              value: 'Online',
              key: 'archiveStatus_',
              val: 'ready',
              selected: false
            },
            {
              value: 'HDD',
              key: 'archiveTarget_',
              selected: false
            },
            {
              value: 'ODA',
              key: 'archiveTarget_',
              selected: false
            }
          ],
          multiple: true,
          value: [],
          order: 11,
          isCustom: false,
          ctrl: 'rd-select',
          visible: true
        }
      ],
      hideKeyValues: [],
      selected: false,
      order: 0,
      name: 'Clip',
      width: 100
    },
    {
      checked: false,
      dragging: false,
      keyValues: [
        {
          name: 'Name',
          value: '',
          order: 0,
          isCustom: false,
          ctrl: 'rd-text',
          visible: true,
          key: 'name_'
        },
        {
          name: 'Comments',
          value: '',
          order: 1,
          isCustom: false,
          ctrl: 'rd-text',
          visible: true,
          key: 'note'
        }
      ],
      hideKeyValues: [],
      selected: false,
      order: 1,
      name: 'Folder',
      width: 100
    },
    {
      checked: false,
      dragging: false,
      keyValues: [
        {
          name: 'Title',
          value: '',
          order: 0,
          isCustom: false,
          ctrl: 'rd-text',
          visible: true,
          key: 'name_'
        },
        {
          name: 'Right',
          value: '',
          order: 1,
          isCustom: false,
          ctrl: 'rd-text',
          visible: true,
          key: 'rights'
        },
        {
          name: 'Comments',
          value: '',
          order: 2,
          isCustom: false,
          ctrl: 'rd-text',
          visible: true,
          key: 'note'
        },
        {
          name: 'Creator',
          value: '',
          order: 3,
          isCustom: false,
          userdata: null,
          ctrl: 'user-selector-ctrl',
          visible: true,
          key: 'createUser_'
        },
        {
          name: 'Create Date',
          value: '',
          order: 4,
          isCustom: false,
          ctrl: 'rd-datepicker',
          visible: true,
          isRange: true,
          key: 'createDate_',
          from: {
            value: ''
          },
          to: {
            value: ''
          }
        }
      ],
      hideKeyValues: [],
      selected: false,
      order: 2,
      name: 'PGM',
      width: 100
    },
    {
      checked: false,
      dragging: false,
      keyValues: [
        {
          name: 'Comments',
          value: '',
          order: 0,
          isCustom: false,
          ctrl: 'rd-text',
          visible: true,
          key: 'note'
        },
        {
          name: 'LM Title',
          value: '',
          checkedValue: [],
          order: 1,
          isCustom: false,
          ctrl: 'action-selector-ctrl',
          visible: true,
          key: 0
        },
        {
          name: 'LM Member',
          value: '',
          checkedValue: [],
          order: 2,
          isCustom: false,
          ctrl: 'member-selector-ctrl',
          visible: true,
          key: 1
        },
        {
          name: 'LM Action',
          value: '',
          checkedValue: [],
          order: 3,
          isCustom: false,
          ctrl: 'action-selector-ctrl',
          visible: true,
          key: 2
        },
        {
          name: 'LM Creator',
          value: '',
          userdata: null,
          order: 4,
          isCustom: false,
          ctrl: 'user-selector-ctrl',
          visible: true,
          key: 'creator'
        },
        {
          name: 'Create Date',
          value: '',
          order: 5,
          isCustom: false,
          ctrl: 'rd-datepicker',
          visible: true,
          isRange: true,
          key: 'createdate',
          from: {
            value: ''
          },
          to: {
            value: ''
          }
        }
      ],
      hideKeyValues: [],
      selected: false,
      order: 3,
      name: 'Marker',
      width: 100
    }
  ],
  defaultQuery: {
    Clip: [
      {
        key: 'type_',
        value: 'biz_sobey_video',
        queryoperation: 'or'
      },
      {
        key: 'type_',
        value: 'biz_sobey_audio',
        queryoperation: 'or'
      },
      {
        key: 'type_',
        value: 'biz_sobey_picture',
        queryoperation: 'or'
      },
      {
        key: 'type_',
        value: 'biz_sobey_document',
        queryoperation: 'or'
      },
      {
        key: 'type_',
        value: 'biz_sobey_other',
        queryoperation: 'or'
      }
    ],
    PGM: [
      {
        key: 'type_',
        value: 'biz_sobey_program',
        queryoperation: 'or'
      }
    ]
  }
}
