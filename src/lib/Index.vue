<template>
  <el-card class="box-card">
    <div slot="header" class="heading">系统报表</div>
    <div class="content">
      <el-row :gutter="10">
        <el-col :xs="4" :sm="4" :md="4" :lg="4" :xl="4" style="border: 1px solid #ccc;border-radius: 4px;padding: 10px;">
          <el-tree :data="reports" :props="defaultProps" :default-expand-all="true" @node-click="handleNodeClick"></el-tree>
        </el-col>
        <el-col :xs="20" :sm="20" :md="20" :lg="20" :xl="20" style="position: relative">
          <div class="toolbar" v-show="showToolbar">
            <div class="report-controller">
              <el-form :inline="true">
                <el-form-item>
                  <el-button size="small" @click="refresh">
                    <b class="koc-icon koc-icon-refresh"></b> 刷新</el-button>
                  <el-button size="small" style="margin-left: 0;" @click="print">
                    <b class="koc-icon koc-icon-print"></b> 打印</el-button>
                </el-form-item>
                <el-form-item>
                  <el-button size="small" @click="zoomIn">
                    <b class="koc-icon koc-icon-zoomin"></b> 放大</el-button>
                  <el-button size="small" style="margin-left: 0;" @click="zoomOut">缩小
                    <b class="koc-icon koc-icon-zoomout"></b>
                  </el-button>
                </el-form-item>
                <el-form-item>
                  <el-select v-model="zoom" size="small" style="width: 100px" @change="zoomChange">
                    <el-option v-for="item in ['50%','75%','100%','125%','150%','200%']" :key="item" :label="item" :value="item">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-form>
            </div>
            <div class="report-args">
              <el-form :inline="true">
                <el-form-item label="报表日期" v-show="showReportArgDate">
                  <el-date-picker :value-format="dateTimeFormat" @change="argChange" v-model="reportArg.date" type="date" placeholder="选择日期">
                  </el-date-picker>
                </el-form-item>
                <el-form-item label="报表日期" v-show="showReportArgDateRange">
                  <el-date-picker :value-format="dateTimeFormat" @change="argChange" v-model="reportArg.daterange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期">
                  </el-date-picker>
                </el-form-item>
                <el-form-item label="行政区域" v-show="showReportArgRegions">
                  <el-cascader :options="regions.asTree" v-model="reportArg.regions"></el-cascader>
                </el-form-item>
              </el-form>
            </div>
            <div style="clear: both;"></div>
          </div>
          <iframe id="reportFrame" frameborder=0 scrolling=auto src="" style="width: 100%"></iframe>
          <div v-show="loading" id="loading">
            <i class="el-icon-loading" style="font-size: 50px; margin-top: 250px;"></i>
          </div>
          <component v-show="false" ref="tmp" :is="reportName" :args="reportArg" @loaded="reportLoaded" @loading="reportLoading" />
        </el-col>
      </el-row>
    </div>
  </el-card>
</template>
<script>
import reports from '@/views/Print/Templates'
import { DATE_TIME_FORMAT } from '@/data/dateTimeOption'

export default {
  name: 'frontend-reports',
  title: '报表',
  components: reports,
  computed: {
    regions () {
      return this.$store.getters.regions
    }
  },
  data () {
    return {
      dateTimeFormat: DATE_TIME_FORMAT,
      loading: false,
      showToolbar: false,
      showReportArgDate: false,
      showReportArgDateRange: false,
      showReportArgRegions: false,
      reportName: '',
      currentLayout: '',
      reportArg: {
        date: null,
        regions: ['520000', '520300', '520381'],
        daterange: []
      },
      zoom: '100%',
      minZoom: 50,
      maxZoom: 200,
      reports: [
        {
          label: '监控报表',
          children: [{
            label: '平均房价异常数据分析表',
            template: 'AvgRoomrate',
            layout: 'A4Landscape',
            arg: 'date'
          },
          {
            label: '出租率异常数据分析表',
            template: 'AvgLettingrate',
            layout: 'A4Landscape',
            arg: 'date'
          },
          {
            label: '应收款异常数据分析表',
            template: 'TotalPrice',
            layout: 'A4Landscape',
            arg: 'date'
          },
          {
            label: '停用房间数横向比较表',
            template: 'OsStatusCompare',
            layout: 'A4Landscape',
            arg: 'date'
          },
          {
            label: '维修房间数横向比较表',
            template: 'OooStatusCompare',
            layout: 'A4Landscape',
            arg: 'date'
          },
          {
            label: '客房押金实时分析表',
            template: 'GuestOrderBalance',
            layout: 'A4Landscape',
            arg: 'date'
          }]
        },
        {
          label: '营业收入报表',
          children: [{
            label: '每日营业状况表',
            template: 'DailyOperating',
            layout: 'A4Landscape',
            arg: 'daterange'
          },
          {
            label: '客人消费明细表',
            template: 'ConsumeDetail',
            layout: 'A4Landscape',
            arg: 'daterange'
          },
          {
            label: '客人消费汇总表',
            template: 'ConsumeSumming',
            layout: 'A4Landscape',
            arg: 'daterange'
          },
          {
            label: '营业收入明细表',
            template: 'OperatingDetail',
            layout: 'A4Landscape',
            arg: 'daterange'
          },
          {
            label: '营收同期比较报表',
            template: 'OperatingCompare',
            layout: 'A4Landscape',
            arg: 'daterange'
          },
          {
            label: '营业收入汇总表',
            template: 'OperatingSumming',
            layout: 'A4Landscape',
            arg: 'daterange'
          },
          {
            label: '营业收入比较表',
            template: 'OperatingCompare2',
            layout: 'A4Landscape',
            arg: 'daterange'
          },
          {
            label: '酒店预订房晚统计表',
            template: 'HotelRoomNight',
            layout: 'A4Landscape',
            arg: 'daterange'
          }]
        },
        {
          label: '数据比较分析报表',
          children: [{
            label: '同区域实时房态表',
            template: 'SameLocalRoomType',
            layout: 'A4Landscape'
          }, {
            label: '区域日横向比较表',
            template: 'SameLocalDailyCompare',
            layout: 'A4Landscape'
          },
          {
            label: '区域月横向比较表',
            template: 'SameLocalMonthCompare',
            layout: 'A4Landscape'
          }, {
            label: '区域酒店日营业比较表',
            template: 'SameLocalDailyOperating',
            layout: 'A4Landscape'
          },
          {
            label: '同区域酒店日营业比较表',
            template: 'SameLocalMonthOperating',
            layout: 'A4Landscape'
          }, {
            label: '同区域酒店营业比较表',
            template: 'SameLocalDailyOperating2',
            layout: 'A4Landscape'
          },
          {
            label: '出租率日变化表',
            template: 'SameLocalLettingRate',
            layout: 'A4Landscape'
          }]
        },
        {
          label: '客人报表',
          children: [{
            label: '客人来源统计表',
            template: 'SalesAnalysisSource',
            layout: 'A4Landscape',
            arg: 'daterange'
          }, {
            label: '预订来源统计表',
            template: 'OrderSource',
            layout: 'A4Landscape',
            arg: 'date'
          }, {
            label: '在住客人统计表',
            template: 'CheckinGuest',
            layout: 'A4Landscape'
          }, {
            label: '离店信息表',
            template: 'DepartureGuest',
            layout: 'A4Landscape',
            arg: 'date'
          }, {
            label: '客人年龄统计表',
            template: 'GuestAge',
            layout: 'A4Landscape',
            arg: 'date'
          }, {
            label: '客人籍贯统计表',
            template: 'GuestNation',
            layout: 'A4Landscape',
            arg: 'date'
          }]
        }],
      defaultProps: {
        children: 'children',
        label: 'label'
      }
    }
  },
  mounted () {
    const reportFrame = document.getElementById('reportFrame')
    const deviceHeight = document.documentElement.clientHeight
    document.getElementById('loading').style.height = deviceHeight + 'px'
    reportFrame.style.height = deviceHeight + 'px'
  },
  methods: {
    handleNodeClick (data) {
      if (data.template) {
        this.loading = true
        this.showToolbar = true
        this.showReportArgDate = false
        this.showReportArgDateRange = false
        this.showReportArgRegions = false
        this.reportName = data.template
        if (data.arg === 'date') {
          this.showReportArgDate = true
          this.reportArg.date = this.$moment().toDate()
        } else if (data.arg === 'daterange') {
          this.showReportArgDateRange = true
          this.reportArg.daterange = [this.$moment().subtract(1, 'd').toDate(), this.$moment().toDate()]
        } else {
          this.showReportArgRegions = true
        }
        this.$nextTick(() => {
          this.$refs.tmp.render()
        })
        this.currentLayout = data.layout
      }
    },
    render () {
      let frame = document.getElementById('reportFrame')
      let templateUrl = './print-template/' + this.currentLayout + '.html?slug=' + new Date().getTime()
      let self = this
      frame.onload = () => {
        self.$nextTick(() => {
          let regularExpression = new RegExp('{{REPLACEMENT_CONTENT}}', 'gi')
          let content = frame.contentDocument.documentElement.innerHTML.replace(regularExpression, self.$refs.tmp.$el.innerHTML)
          frame.contentDocument.documentElement.innerHTML = content
        })
        frame.onload = null
      }
      frame.src = templateUrl
    },
    refresh () {
      this.loading = true
      this.$refs.tmp.render()
    },
    print () {
      let frame = document.getElementById('reportFrame')
      frame.contentWindow.print()
    },
    zoomIn () {
      let intZoom = parseInt(this.zoom.replace('%', ''))
      intZoom = intZoom + 10
      if (intZoom > this.maxZoom) {
        intZoom = this.maxZoom
      }
      this.zoom = intZoom + '%'
      let frame = document.getElementById('reportFrame')
      frame.contentDocument.body.style.zoom = this.zoom
    },
    zoomOut () {
      let intZoom = parseInt(this.zoom.replace('%', ''))
      intZoom = intZoom - 10
      if (intZoom < this.minZoom) {
        intZoom = this.minZoom
      }
      this.zoom = intZoom + '%'
      let frame = document.getElementById('reportFrame')
      frame.contentDocument.body.style.zoom = this.zoom
    },
    zoomChange (value) {
      let frame = document.getElementById('reportFrame')
      frame.contentDocument.body.style.zoom = value
    },
    argChange (value) {
      console.log(value)
    },
    reportLoaded () {
      this.loading = false
      this.render()
    },
    reportLoading () {
      this.loading = true
    }
  }
}
</script>

<style lang="scss" scoped>
#loading {
  height: 648px;
  position: absolute;
  width: 100%;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: table-cell;
  text-align: center;
}
.toolbar {
  padding: 5px;
  background: #f1f1f1;
  .el-form-item {
    margin-bottom: 0px;
  }
  .report-controller {
    float: left;
  }
  .report-args {
    float: right;
  }
}
</style>
