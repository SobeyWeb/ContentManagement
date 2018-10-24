export const defaultFulltextSearchCondtion = {
  keywords: '',
  timeFilter: [{
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
  typeFilter: [{
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
  booleanCondition: [{
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
}
export const defaultAdvanceSearchCondtion = [{
    checked: false,
    dragging: false,
    keyValues: [{
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
        options: [{
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
    keyValues: [{
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
    keyValues: [{
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
    keyValues: [{
        name: 'Comments',
        value: '',
        order: 0,
        isCustom: false,
        ctrl: 'rd-text',
        visible: true,
        key: 'note'
      },
      {
        name: 'Color',
        value: '',
        userdata: null,
        order: 1,
        isCustom: false,
        ctrl: 'color-selector-ctrl',
        visible: true,
        key: 'color'
      },
      {
        name: 'LM Title',
        value: '',
        checkedValue: [],
        order: 2,
        isCustom: false,
        ctrl: 'action-selector-ctrl',
        visible: true,
        key: 0
      },
      {
        name: 'LM Member',
        value: '',
        checkedValue: [],
        order: 3,
        isCustom: false,
        ctrl: 'member-selector-ctrl',
        visible: true,
        key: 1
      },
      {
        name: 'LM Action',
        value: '',
        checkedValue: [],
        order: 4,
        isCustom: false,
        ctrl: 'action-selector-ctrl',
        visible: true,
        key: 2
      },
      {
        name: 'LM Creator',
        value: '',
        userdata: null,
        order: 5,
        isCustom: false,
        ctrl: 'user-selector-ctrl',
        visible: true,
        key: 'creator'
      },
      {
        name: 'Create Date',
        value: '',
        order: 6,
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
]

export const defaultQuery = {
  Clip: [{
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
  PGM: [{
    key: 'type_',
    value: 'biz_sobey_program',
    queryoperation: 'or'
  }]
}

export const emptyMaterial = {
  previewType: 'video',
  markers: {
    values: []
  },
  canPreview: true,
  readonly: true,
  operations: [],
  properties: [{
      name: 'Basic Info',
      order: 0,
      keyValues: [{
          name: 'Title',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-text',
          readonly: false,
          disabled: true,
          keys: ['entity', 'name']
        },
        {
          name: 'Material Type',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ['entity', 'subtype']
        },
        {
          name: 'Rights',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-textarea',
          readonly: false,
          disabled: true,
          keys: ['entity', 'rights']
        },
        {
          name: 'Comments',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-textarea',
          readonly: false,
          disabled: true,
          keys: ['entity', 'note']
        },
        {
          name: 'Address',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ['entity', 'folderpath']
        },
        {
          name: 'Used Space',
          value: '',
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ''
        },
        {
          name: 'Item Name',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-text',
          readonly: false,
          disabled: true,
          keys: ['entity', 'item', 'itemname']
        },
        {
          name: 'Journalist',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-text',
          readonly: false,
          disabled: true,
          keys: ['entity', 'journallist']
        },
        {
          name: 'Category',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-text',
          readonly: false,
          disabled: true,
          keys: ['entity', 'item', 'category']
        },
        {
          name: 'Program Name',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-text',
          readonly: false,
          disabled: true,
          keys: ['entity', 'item', 'programname']
        },
        {
          name: 'Attribute',
          value: {
            text: 'To be Deleted'
          },
          ctrl: 'rd-checkbox',
          readonly: false,
          disabled: false
        }
      ],
      checked: true,
      dragging: false,
      width: 100,
      selected: false
    },
    {
      name: 'Filing',
      order: 1,
      keyValues: [{
          name: 'Input Source',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ['metadata', 'ingesttask', 'name']
        },
        {
          name: 'Video Format',
          value: '',
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ''
        },
        {
          name: 'Audio Format',
          value: '',
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ''
        },
        {
          name: 'Ingest Channel Name',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ['metadata', 'ingesttask', 'channelname']
        },
        {
          name: 'Ingest Device ID',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ['metadata', 'ingesttask', 'deviceid']
        },
        {
          name: 'Quantity of Audio Channels',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ['metadata', 'ingesttask', 'audiochannelcount']
        },
        {
          name: 'SOF(STC)',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ['entity', 'item', 'vtrin']
        },
        {
          name: 'EOF',
          value: '',
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ''
        },
        {
          name: 'Total Duration',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ['entity', 'item', 'length']
        },
        {
          name: 'SOM',
          value: '',
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ''
        },
        {
          name: 'EOM',
          value: '',
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ''
        },
        {
          name: 'Material Duration',
          value: '',
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ''
        },
        {
          name: 'Stream Channel',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ['entity', 'item', 'dbestreamchannel']
        },
        {
          name: 'Source Tape Barcode',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-text',
          readonly: false,
          disabled: true,
          keys: ['metadata', 'ingesttask', 'sourcetapebarcode']
        },
        {
          name: 'Source Tape Title',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-text',
          readonly: false,
          disabled: true,
          keys: ['metadata', 'ingesttask', 'sourcetapeid']
        },
        {
          name: 'Backup Tape Title',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-text',
          readonly: false,
          disabled: true,
          keys: ['metadata', 'ingesttask', 'backtapid']
        }
      ],
      checked: true,
      dragging: false,
      width: 100,
      selected: false
    },
    {
      name: 'Planning',
      keyValues: [{
          name: 'Place',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ['place']
        },
        {
          name: 'Planning Date',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ['planningDate']
        },
        {
          name: 'Director',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ['director']
        },
        {
          name: 'Input by',
          value: '',
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ''
        },
        {
          name: 'Photographer',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ['photoGrapher']
        },
        {
          name: 'Reporter',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ['reporter']
        },
        {
          name: 'Other Engineer',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ['other']
        },
        {
          name: 'Equipment',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ['equipment']
        },
        {
          name: 'Contact Info',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-textarea',
          readonly: true,
          disabled: true,
          keys: ['contactInfo']
        }
      ],
      order: 2,
      checked: true,
      dragging: false,
      width: 100,
      selected: false
    },
    {
      name: 'History',
      order: 3,
      keyValues: [{
          name: 'Modified(Date Time)',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ['entity', 'modifydate']
        },
        {
          name: 'Modified by',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ['entity', 'modifier']
        },
        {
          name: 'Modified on',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ['entity', 'modifyterminal']
        },
        {
          name: 'Creator',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ['entity', 'creator']
        },
        {
          name: 'Create Date',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ['entity', 'createdate']
        },
        {
          name: 'Filling Start(Date)',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ['entity', 'item', 'recorddate']
        },
        {
          name: 'Filling Start(Time)',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ['entity', 'item', 'recorddate']
        },
        {
          name: 'Filling End(Date)',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ['entity', 'item', 'endrecorddate']
        },
        {
          name: 'Filling End(Time)',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ['entity', 'item', 'endrecorddate']
        },
        {
          name: 'Filed by',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ['metadata', 'ingesttask', 'user']
        },
        {
          name: 'Filed from',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ['metadata', 'ingesttask', 'terminal']
        },
        {
          name: 'Edited by',
          value: '',
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ''
        },
        {
          name: 'Edited on',
          value: '',
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ''
        },
        {
          name: 'Sequence Name',
          value: '',
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ''
        }
      ],
      checked: true,
      dragging: false,
      width: 100,
      selected: false
    },
    {
      name: 'Markers',
      keyValues: {
        values: []
      },
      order: 4,
      checked: true,
      dragging: false,
      width: 100,
      selected: false
    },
    {
      name: 'File List',
      keyValues: {
        values: [],
        headers: [{
            name: 'File Name',
            attr: 'filename',
            width: 200,
            dragging: false,
            checked: true,
            resizable: true,
            selected: true
          },
          {
            name: 'Quality',
            attr: 'displayQuality',
            width: 50,
            dragging: false,
            checked: true,
            resizable: true
          },
          {
            name: 'Track',
            attr: 'displayTrack',
            width: 50,
            dragging: false,
            checked: true,
            resizable: true
          },
          {
            name: 'Passage',
            attr: 'displayPassage',
            width: 50,
            dragging: false,
            checked: true,
            resizable: true
          },
          {
            name: 'In',
            attr: 'displayIn',
            width: 100,
            dragging: false,
            checked: true,
            resizable: true
          },
          {
            name: 'Out',
            attr: 'displayOut',
            width: 100,
            dragging: false,
            checked: true,
            resizable: true
          },
          {
            name: 'SOF',
            attr: 'displaySOF',
            width: 100,
            dragging: false,
            checked: true,
            resizable: true
          },
          {
            name: 'EOF',
            attr: 'displayEOF',
            width: 100,
            dragging: false,
            checked: true,
            resizable: true
          }
        ]
      },
      order: 5,
      checked: true,
      dragging: false,
      width: 100,
      selected: false
    },
    {
      name: 'Original Metadata',
      order: 6,
      keyValues: [{
          name: 'User Media ID',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-text',
          readonly: false,
          disabled: true,
          keys: ['metadata', 'original', 'usermediaid']
        },
        {
          name: 'Main Title',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ['metadata', 'original', 'maintitle']
        },
        {
          name: 'Comments',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ['metadata', 'original', 'Comments']
        },
        {
          name: 'Clip Title',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ['metadata', 'original', 'cliptitle']
        },
        {
          name: 'Created by',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ['metadata', 'original', 'creatorname']
        },
        {
          name: 'Recording Time',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ['metadata', 'original', 'createdate']
        },
        {
          name: 'Duration',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ['metadata', 'original', 'duration']
        },
        {
          name: 'STC',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ['metadata', 'original', 'stc']
        },
        {
          name: 'Video Format',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ['metadata', 'original', 'videoformat']
        },
        {
          name: 'Audio Format',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ['metadata', 'original', 'audioformat']
        },
        {
          name: 'Comments',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-textarea',
          readonly: true,
          disabled: true,
          keys: ['metadata', 'original', 'description']
        }
      ],
      checked: true,
      dragging: false,
      width: 100,
      selected: false
    },
    {
      name: 'Original UMID',
      order: 7,
      keyValues: [{
          name: 'Basic UMID',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ['metadata', 'original', 'basicumid']
        },
        {
          name: 'Status',
          value: '',
          limit: {
            type: 'Length'
          },
          ctrl: 'rd-text',
          readonly: true,
          disabled: true,
          keys: ['metadata', 'original', 'status']
        },
        {
          name: 'List',
          value: '',
          ctrl: 'original-list-ctrl',
          readonly: true,
          disabled: true,
          keys: ''
        }
      ],
      checked: true,
      dragging: false,
      width: 100,
      selected: false
    },
    {
      name: 'Rights',
      keyValues: {
        radio: [{
            checked: true,
            value: 'Public',
            disabled: true,
            privilege: 'public'
          },
          {
            checked: false,
            value: 'Private',
            disabled: true,
            privilege: 'private'
          },
          {
            checked: false,
            value: 'Condition',
            disabled: true
          }
        ],
        access: [{
            checked: false,
            value: 'Access',
            disabled: true
          },
          {
            checked: false,
            value: 'Access&Write',
            disabled: true
          }
        ],
        checkbox: {
          checked: false,
          disabled: true,
          text: 'Also apply the setting to all subfoders and files.'
        },
        type: 'video',
        deptTree: [],
        readonly: false
      },
      order: 8,
      checked: true,
      dragging: false,
      width: 100,
      selected: false
    }
  ],
  father: {
    guid: true
  }
}
