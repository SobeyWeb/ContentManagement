/* eslint-disable */
import * as util from './util.js'
import $ from 'jquery'
;(function(modules) {
  // webpackBootstrap
  /******/ // The module cache
  /******/
  var installedModules = {} /******/ // The require function
  /******/
  /******/ function __webpack_require__(moduleId) {
    /******/
    /******/ // Check if module is in cache
    /******/
    if (installedModules[moduleId])
      /******/
      return installedModules[moduleId].exports /******/ // Create a new module (and put it into the cache)
    /******/
    /******/ var module = (installedModules[moduleId] = {
      /******/
      exports: {},
      /******/
      id: moduleId,
      /******/
      loaded: false
      /******/
    }) /******/ // Execute the module function
    /******/
    /******/ modules[moduleId].call(
      module.exports,
      module,
      module.exports,
      __webpack_require__
    ) /******/ // Flag the module as loaded
    /******/
    /******/ module.loaded = true /******/ // Return the exports of the module
    /******/
    /******/ return module.exports
    /******/
  } /******/ // expose the modules object (__webpack_modules__)
  /******/
  /******/
  /******/ __webpack_require__.m = modules /******/ // expose the module cache
  /******/
  /******/ __webpack_require__.c = installedModules /******/ // __webpack_public_path__
  /******/
  /******/ __webpack_require__.p = '/dist/' /******/ // Load entry module and return exports
  /******/
  /******/ return __webpack_require__(0)
  /******/
})(
  /************************************************************************/
  /******/
  [
    /* 0 */
    /***/
    function(module, exports, __webpack_require__) {
      const vueNiceScrollbar = __webpack_require__(1)
      window.vueNiceScrollbar = vueNiceScrollbar
      exports.vueNiceScrollbar = vueNiceScrollbar
      /***/
    },
    /* 1 */
    /***/
    function(module, exports, __webpack_require__) {
      var __vue_script__, __vue_template__
      var __vue_styles__ = {}
      __vue_script__ = __webpack_require__(2)
      if (
        __vue_script__ &&
        __vue_script__.__esModule &&
        Object.keys(__vue_script__).length > 1
      ) {
        console.warn(
          '[vue-loader] src\\components\\vue-nice-scrollbar.vue: named exports in *.vue files are ignored.'
        )
      }
      __vue_template__ = __webpack_require__(13)
      module.exports = __vue_script__ || {}
      if (module.exports.__esModule) module.exports = module.exports.default
      var __vue_options__ =
        typeof module.exports === 'function'
          ? module.exports.options || (module.exports.options = {})
          : module.exports
      if (__vue_template__) {
        __vue_options__.template = __vue_template__
      }
      if (!__vue_options__.computed) __vue_options__.computed = {}
      Object.keys(__vue_styles__).forEach(function(key) {
        var module = __vue_styles__[key]
        __vue_options__.computed[key] = function() {
          return module
        }
      })

      /***/
    },
    /* 2 */
    /***/
    function(module, exports, __webpack_require__) {
      'use strict'

      Object.defineProperty(exports, '__esModule', {
        value: true
      })

      var _verticalScrollbar = __webpack_require__(3)

      var _verticalScrollbar2 = _interopRequireDefault(_verticalScrollbar)

      var _horizontalScrollbar = __webpack_require__(6)

      var _horizontalScrollbar2 = _interopRequireDefault(_horizontalScrollbar)

      function _interopRequireDefault(obj) {
        return obj && obj.__esModule
          ? obj
          : {
              default: obj
            }
      }

      // <template>
      //     <div class="nice-bar" v-bind:class="[ theme==='dark' ? 'theme-dark' : 'theme-light', classes ? ' ' + classes : '']" ref="scrollContainer">
      //         <div ref="scrollContent" v-bind:style="{ 'margin-top': top * -1 + 'px', 'margin-left': left * -1 + 'px' }" @wheel="scroll"
      //             @touchstart="startDrag" @touchmove="onDrag" @touchend="stopDrag">
      //             <slot></slot>
      //         </div>
      //         <vertical-scrollbar v-if="ready" v-bind:content="{ height: scrollContentHeight }" v-bind:container="{ height: scrollContainerHeight }"
      //                             v-bind:scrolling="{ v: vMovement }" v-bind:dragging-from-parent="dragging" v-bind:on-change-position="handleChangePosition"
      //                             v-bind:show="show" v-on:vertical="moveTheScrollbar">
      //         </vertical-scrollbar>
      //         <horizontal-scrollbar v-if="ready" v-bind:content="{ width: scrollContentWidth }" v-bind:container="{ width: scrollContainerWidth }"
      //                             v-bind:scrolling="{ h: hMovement }" v-bind:dragging-from-parent="dragging" v-bind:on-change-position="handleChangePosition"
      //                             v-bind:show="show" v-on:horizontal="moveTheScrollbar">
      //         </horizontal-scrollbar>
      //     </div>
      // </template>
      //
      // <script>
      __webpack_require__(9)

      exports.default = {
        name: 'vue-nice-scrollbar',
        props: {
          classes: {
            type: String,
            default: ''
          },
          theme: {
            type: String,
            default: 'light'
          },
          speed: {
            type: Number,
            default: 53
          }
        },

        data: function data() {
          return {
            ready: false,
            scrollContainerHeight: null,
            scrollContainerWidth: null,
            scrollContentHeight: null,
            scrollContentWidth: null,
            show: false,
            dragging: false,
            scrollY: null,
            scrollX: null,
            top: 0,
            left: 0,
            vMovement: 0,
            hMovement: 0,
            start: {
              y: 0,
              x: 0
            },
            headerEl: null,
            headerContentEl: 0
          }
        },
        computed: {
          _top() {
            return Math.max(
              0,
              Math.min(
                this.top,
                this.scrollContentHeight - this.scrollContainerHeight
              )
            )
          },
          materials() {
            return this.$store.getters.displayMaterials
          },
          lastSeletedNode() {
            return this.$store.state.lastSeletedNode
          },
          _left() {
            var left = Math.max(
              0,
              Math.min(
                this.left,
                this.scrollContentWidth - this.scrollContainerWidth
              )
            )
            if (
              this.headerEl &&
              this.scrollContentWidth === this.headerContentEl.clientWidth
            ) {
              this.headerEl.scrollLeft = left
            }
            return left
          }
        },
        components: {
          verticalScrollbar: _verticalScrollbar2.default,
          horizontalScrollbar: _horizontalScrollbar2.default
        },
        watch: {
          materials: function(val) {
            if (this.$el === this.$store.getters.thumbDisplay.el) {
              this.calculateSize()
            }
          },
          scrollContentHeight: function(newVal, oldVal) {
            if (this.$el === this.$store.getters.thumbDisplay.el) {
              this.$nextTick(() => {
                var thumbDisplay = this.$store.getters.thumbDisplay
                this.normalizeVertical(
                  (thumbDisplay.height / thumbDisplay.totalHeight) *
                    thumbDisplay.totalHeight
                ) // 纠正Y  margin
                this.normalizeHorizontal(0)
                this.hMovement = 0
              })
            }
          },
          lastSeletedNode: function(val) {
            if (
              document.getElementById('save_clip_folder_box') &&
              document.getElementById('save_clip_folder_box') === this.$el
            ) {
              if (!$('.save_clip_path_container .folder_selected')[0]) {
                this.normalizeVertical(0)
                Vue.nextTick(() => {
                  this.calculateSize()
                  var top = $(
                    '.save_clip_path_container .folder_selected'
                  ).position().top
                  this.normalizeVertical(top)
                })
              }
            }
          },
          'lastSeletedNode.path': function(val) {
            if (
              document.getElementById('save_clip_folder_box') &&
              document.getElementById('save_clip_folder_box') === this.$el
            ) {
              if ($('.save_clip_path_container .folder_selected')[0]) {
                Vue.nextTick(() => {
                  var top = $(
                    '.save_clip_path_container .folder_selected'
                  ).position().top
                  if (top < -30 || top > 170) {
                    this.normalizeVertical(0)
                    Vue.nextTick(() => {
                      this.calculateSize()
                      top = $(
                        '.save_clip_path_container .folder_selected'
                      ).position().top
                      this.normalizeVertical(top)
                    })
                  }
                })
              }
            }
          }
        },
        methods: {
          calculateSize: function calculateSize() {
            var $scrollContent = this.$refs.scrollContent
            var $scrollContainer = this.$refs.scrollContainer
            try {
              var scrollContainerStyle = window.getComputedStyle(
                $scrollContainer,
                null
              )
              this.scrollContentHeight = $scrollContent.children[0].clientHeight
              this.scrollContentWidth = $scrollContent.children[0].clientWidth

              this.scrollContainerHeight = $scrollContainer.clientHeight
              this.scrollContainerWidth = $scrollContainer.clientWidth

              this.ready = true
            } catch (e) {
              console.log('scrollbar error')
            }
          },
          showSlider: function showSlider() {
            this.show = true
          },
          hideSlider: function hideSlider() {
            if (!this.dragging) this.show = false
          },
          scroll: function scroll(e) {
            //e.preventDefault();
            if (
              this.$store.state.menuStatus &&
              (this.scrollContainerHeight === folder_box.clientHeight ||
                this.$el === this.$store.getters.thumbDisplay.el)
            )
              return

            var num = this.speed

            var shifted = e.shiftKey

            this.scrollY = e.deltaY > 0 ? num : -num
            this.scrollX = e.deltaX > 0 ? num : -num

            if (shifted && e.deltaX == 0)
              this.scrollX = e.deltaY > 0 ? num : -num

            var nextY = this.top + this.scrollY
            var nextX = this.left + this.scrollX

            var canScrollY =
              this.scrollContentHeight > this.scrollContainerHeight
            var canScrollX = this.scrollContentWidth > this.scrollContainerWidth

            if (canScrollY && !shifted) {
              this.normalizeVertical(nextY)
              this.moveTheScrollbar()
            }

            if (shifted && canScrollX) {
              this.normalizeHorizontal(nextX)
              this.moveTheScrollbar()
            }
          },
          normalizeVertical: function normalizeVertical(nextY) {
            var lowerEnd = this.scrollContentHeight - this.scrollContainerHeight

            if (nextY > lowerEnd) nextY = Math.max(0, lowerEnd)
            else if (nextY < 0) nextY = 0

            this.top = nextY
            this.vMovement = (this.top / this.scrollContentHeight) * 100
          },
          normalizeHorizontal: function normalizeHorizontal(nextX) {
            var rightEnd = this.scrollContentWidth - this.scrollContainerWidth

            if (nextX > rightEnd) nextX = Math.max(0, rightEnd)
            else if (nextX < 0) nextX = 0

            this.left = nextX
            this.hMovement = (this.left / this.scrollContentWidth) * 100
          },
          moveTheScrollbar: function moveTheScrollbar() {
            this.vMovement = (this.top / this.scrollContentHeight) * 100
            this.hMovement = (this.left / this.scrollContentWidth) * 100
          },
          startDrag: function startDrag(e) {
            e.preventDefault()
            //e.stopPropagation();

            e = e.changedTouches ? e.changedTouches[0] : e

            this.dragging = true
            this.show = true
            this.start.y = e.pageY
            this.start.x = e.pageX
          },
          onDrag: function onDrag(e) {
            if (this.dragging) {
              e.preventDefault()
              e = e.changedTouches ? e.changedTouches[0] : e

              var yMovement = this.start.y - e.pageY
              var xMovement = this.start.x - e.pageX

              this.start.y = e.pageY
              this.start.x = e.pageX

              var nextY = this.top + yMovement
              var nextX = this.left + xMovement

              this.normalizeVertical(nextY)
              this.normalizeHorizontal(nextX)

              this.moveTheScrollbar()
            }
          },
          stopDrag: function stopDrag(e) {
            this.dragging = false
            this.show = false
          },
          handleChangePosition: function handleChangePosition(
            vScrollbar,
            orientation
          ) {
            var next =
              (vScrollbar / 100) *
              (orientation == 'vertical'
                ? this.scrollContentHeight
                : this.scrollContentWidth)
            if (orientation == 'vertical') this.normalizeVertical(next)
            if (orientation == 'horizontal') this.normalizeHorizontal(next)
            this.moveTheScrollbar()
          }
        },

        mounted: function mounted() {
          this.calculateSize()
          this.headerEl = document.querySelector('.list_headers_box')
          this.headerContentEl = document.querySelector(
            '.list_header_container'
          )
          window.addEventListener('resize', this.calculateSize)

          if (this.ready) {
            this.$refs.scrollContainer.addEventListener(
              'mouseenter',
              this.showSlider
            )
            this.$refs.scrollContainer.addEventListener(
              'mouseleave',
              this.hideSlider
            )
          }
        },
        beforeDestroy: function beforeDestroy() {
          window.removeEventListener('resize', this.calculateSize)
          this.$refs.scrollContainer.removeEventListener(
            'mouseenter',
            this.showSlider
          )
          this.$refs.scrollContainer.removeEventListener(
            'mouseleave',
            this.hideSlider
          )
        }
      }
      // </script>
      /* generated by vue-loader */

      /***/
    },
    /* 3 */
    /***/
    function(module, exports, __webpack_require__) {
      var __vue_script__, __vue_template__
      var __vue_styles__ = {}
      __vue_script__ = __webpack_require__(4)
      if (
        __vue_script__ &&
        __vue_script__.__esModule &&
        Object.keys(__vue_script__).length > 1
      ) {
        console.warn(
          '[vue-loader] src\\components\\vertical-scrollbar.vue: named exports in *.vue files are ignored.'
        )
      }
      __vue_template__ = __webpack_require__(5)
      module.exports = __vue_script__ || {}
      if (module.exports.__esModule) module.exports = module.exports.default
      var __vue_options__ =
        typeof module.exports === 'function'
          ? module.exports.options || (module.exports.options = {})
          : module.exports
      if (__vue_template__) {
        __vue_options__.template = __vue_template__
      }
      if (!__vue_options__.computed) __vue_options__.computed = {}
      Object.keys(__vue_styles__).forEach(function(key) {
        var module = __vue_styles__[key]
        __vue_options__.computed[key] = function() {
          return module
        }
      })

      /***/
    },
    /* 4 */
    /***/
    function(module, exports) {
      'use strict'

      Object.defineProperty(exports, '__esModule', {
        value: true
      })
      // <template>
      //     <div class="nice-bar-rail-y" v-if="height < 100" @click="jump" ref="scrollRail">
      //         <div class="nice-bar-slider-y" v-bind:style="{ height: height + '%', top: scrolling.v + '%' }" v-bind:class="{ 'fade-in': show, 'fade-out': !show }"
      //              ref="scrollSlider" @touchstart="startDrag" @mousedown="startDrag">
      //         </div>
      //     </div>
      // </template>
      //
      // <script>
      exports.default = {
        name: 'vertical-scrollbar',
        props: {
          content: {
            type: Object,
            default: 0
          },
          container: {
            type: Object,
            default: 0
          },
          scrolling: {
            type: Object,
            default: {
              v: 0,
              h: 0
            }
          },
          show: {
            type: Boolean,
            default: false
          },
          draggingFromParent: {
            type: Boolean,
            default: false
          },
          onChangePosition: {
            type: Function,
            default: function _default() {}
          }
        },

        data: function data() {
          return {
            height: 0,
            dragging: false,
            start: 0
          }
        },

        watch: {
          content: {
            handler: function(val, old) {
              if (val.height != old.height) this.calculateSize()
            },
            deep: true
          },
          container: {
            handler: function(val, old) {
              if (val.height != old.height) this.calculateSize()
            },
            deep: true
          },
          resizeID: {
            handler: function(val, old) {
              if (
                val !== old &&
                this.$parent.$el === this.$store.getters.thumbDisplay.el
              ) {
                //改为配置
                this.parentCalc()
                this.$store.state.scrollingV = 0
                this.onChangePosition(0, 'vertical')
              }
            },
            deep: false
          },
          itemWidth: {
            handler: function(val, old) {
              if (
                val !== old &&
                this.$parent.$el === this.$store.getters.thumbDisplay.el
              ) {
                //改为配置
                this.parentCalc()
                this.$store.state.scrollingV = 0
                this.onChangePosition(0, 'vertical')
              }
            },
            deep: false
          },
          'scrolling.v': {
            handler: util.throttle(
              30,
              function(val, old) {
                if (
                  val != old &&
                  this.$parent.$el === this.$store.getters.thumbDisplay.el
                ) {
                  //改为配置
                  this.$store.state.scrollingV = val
                }
              },
              true
            ),
            deep: false
          },
          currentNode: {
            handler: function(val, old) {
              if (
                val != old &&
                this.$parent.$el === this.$store.getters.thumbDisplay.el
              ) {
                this.onChangePosition(0, 'vertical')
              }
              if (
                val != old &&
                this.container.height == folder_box.clientHeight
              ) {
                this.$nextTick(() => {
                  this.parentCalc()
                  var top = $('.folder_selected').position().top
                  var offsetTop = $('.folder_selected').offset().top
                  if (offsetTop > this.container.height + 20) {
                    this.onChangePosition(
                      ((top - (this.container.height - 60)) /
                        this.content.height) *
                        100,
                      'vertical'
                    )
                  } else if (offsetTop < 62) {
                    this.onChangePosition(
                      Math.max(0, ((top - 30) / this.content.height) * 100),
                      'vertical'
                    )
                  }
                })
              }
            },
            deep: false
          },
          selectedMaterials: {
            handler: function(val, old) {
              if (
                val.length &&
                this.$parent.$el === this.$store.getters.thumbDisplay.el
              ) {
                //Vue.nextTick(() => {
                this.parentCalc()
                var item, itemHeight, top, offsetTop
                var condtionHeight =
                  $('.condition_display_container').height() || 0
                if (this.$store.state.dragSymbol) {
                  //框��?
                  if (!this.$store.state.dragDirection) {
                    // up
                    item = val[0]
                    if (!item.guid) {
                      return
                    }
                    itemHeight =
                      item.type === 'marker'
                        ? 102
                        : this.$store.getters.itemHeight
                    top = $('[data-id="' + item.guid + '"]').position().top
                    offsetTop = $('[data-id="' + item.guid + '"]').offset().top
                  } else {
                    //down
                    item = val[val.length - 1]
                    itemHeight =
                      item.type === 'marker'
                        ? 102
                        : 14 +
                          this.$store.state.thumbnailStyle.height *
                            this.$store.state.scaleTime +
                          45
                    top = $('[data-id="' + item.guid + '"]').position().top
                    offsetTop = $('[data-id="' + item.guid + '"]').offset().top
                  }
                  if (top === 0) {
                    this.onChangePosition(0, 'vertical')
                  } else if (top + itemHeight == this.content.height) {
                    this.onChangePosition(100, 'vertical')
                  } else if (offsetTop < 113 + condtionHeight && top > 0) {
                    this.onChangePosition(
                      Math.max(
                        0,
                        ((top - itemHeight) / this.content.height) * 100
                      ),
                      'vertical'
                    )
                  } else if (offsetTop > this.container.height - 83) {
                    this.onChangePosition(
                      ((top - (this.container.height - 93 - itemHeight)) /
                        this.content.height) *
                        100,
                      'vertical'
                    )
                  }
                } else {
                  //快捷键选择
                  if (!this.lastRemoveMaterial) {
                    item = val[val.length - 1]
                    this.scrollTo(item, item.type === 'marker')
                  } else {
                    item = this.lastRemoveMaterial
                    this.scrollTo(item, item.type === 'marker')
                  }
                }
                //})
              }
            },
            deep: false
          },
          dragOverCount: function() {
            this.$nextTick(() => {
              this.parentCalc()
              if (this.container.height == folder_box.clientHeight) {
                var top = $('.folder_hover').position().top
                var offsetTop = $('.folder_hover').offset().top
                if (offsetTop > this.container.height) {
                  this.onChangePosition(
                    ((top - (this.container.height - 80)) /
                      this.content.height) *
                      100,
                    'vertical'
                  )
                } else if (offsetTop < 80) {
                  this.onChangePosition(
                    Math.max(0, ((top - 30) / this.content.height) * 100),
                    'vertical'
                  )
                }
              }
            })
          }
        },

        computed: {
          resizeID() {
            return this.$store.state.containerUpdate
          },
          dragOverCount() {
            return this.$store.state.dragOverCount
          },
          currentNode() {
            return this.$store.state.selectedNode
          },
          materials() {
            return this.$store.getters.displayMaterials
          },
          selectedMaterials() {
            return this.$store.state.selectedMaterials
          },
          lastRemoveMaterial() {
            return this.$store.state.lastRemoveMaterial
          },
          itemWidth() {
            return this.$store.getters.itemWidth
          }
        },

        methods: {
          scrollTo(item, isMarker) {
            if (item.guid === void 0) {
              this.onChangePosition(100, 'vertical')
              return
            }
            var top
            var offsetTop
            var condtionHeight = $('.condition_display_container').height() || 0
            var info = this.$store.getters.thumbDisplay
            var width = info.containerWidth
            var itemHeight = isMarker ? 102 : this.$store.getters.itemHeight
            var itemWidth = isMarker ? 462 : this.$store.getters.itemWidth
            var index = this.materials.indexOf(item)
            if (index === -1) {
              return //选中左侧树
            }
            var rowCount = isMarker
              ? Math.floor(width / itemWidth)
              : Math.round(
                  (width - 2 * this.$store.state.thumbPadding) / itemWidth
                )
            if (index <= info.index || index >= info.index + info.range) {
              this.onChangePosition(
                Math.floor(index / info.rowCount - 1) * info.cellPercent,
                'vertical'
              )
            } else {
              top = $('[data-id="' + item.guid + '"]').position().top
              offsetTop = $('[data-id="' + item.guid + '"]').offset().top
              if (top === 0) {
                this.onChangePosition(0, 'vertical')
              } else if (top + itemHeight == this.content.height) {
                this.onChangePosition(100, 'vertical')
              } else if (offsetTop < 113 + condtionHeight && top > 0) {
                this.onChangePosition(
                  Math.max(0, ((top - itemHeight) / this.content.height) * 100),
                  'vertical'
                )
              } else if (
                offsetTop >
                this.container.height - itemHeight + 52 + condtionHeight
              ) {
                this.onChangePosition(
                  ((top - (this.container.height - 52 - itemHeight)) /
                    this.content.height) *
                    100,
                  'vertical'
                )
              }
            }
          },
          calculateSize: function calculateSize() {
            this.height = (this.container.height / this.content.height) * 100
            if (this.height + this.scrolling.v > 100) {
              this.onChangePosition(100 - this.height, 'vertical')
            }
            if (this.height > 100) {
              this.onChangePosition(0, 'vertical')
              this.onChangePosition(0, 'horizontal')
            }
          },
          startDrag: function startDrag(e) {
            e.preventDefault()
            //e.stopPropagation();

            e = e.changedTouches ? e.changedTouches[0] : e

            this.dragging = true
            this.start = e.pageY
          },
          onDrag: function onDrag(e) {
            this.parentCalc()
            // this.calculateSize();
            if (this.dragging) {
              e.preventDefault()
              e.stopPropagation()

              e = e.changedTouches ? e.changedTouches[0] : e

              var yMovement = e.pageY - this.start
              var yMovementPercentage =
                (yMovement / this.container.height) * 100

              this.start = e.pageY

              var next = this.scrolling.v + yMovementPercentage

              this.$parent.dragging = true

              this.onChangePosition(next, 'vertical')

              this.normalize()
            }
          },
          stopDrag: function stopDrag(e) {
            this.dragging = false
            this.$parent.dragging = false
          },
          normalize: function normalize() {
            this.$emit('vertical')
          },
          jump: function jump(e) {
            var isRail = e.target === this.$refs.scrollRail
            if (isRail) {
              var position = this.$refs.scrollSlider.getBoundingClientRect()
              var yMovement = e.pageY - position.top

              var centerize = this.height / 2
              var yMovementPercentage =
                (yMovement / this.container.height) * 100 - centerize

              this.start = e.pageY

              var next = this.scrolling.v + yMovementPercentage

              this.onChangePosition(next, 'vertical')
              this.normalize()
            }
          }
        },

        mounted: function mounted() {
          this.calculateSize()
          this.parentCalc = util.throttle(500, this.$parent.calculateSize, true)
          var _this = this
          var delayCalc = function() {
            setTimeout(_this.parentCalc, 0)
          }
          document.addEventListener('mousemove', this.onDrag)
          document.addEventListener('keydown', delayCalc)
          document.addEventListener('touchmove', this.onDrag)
          document.addEventListener('mouseup', this.stopDrag)
          document.addEventListener('touchend', this.stopDrag)
        },
        beforeDestroy: function beforeDestroy() {
          document.removeEventListener('mousemove', this.onDrag)
          document.removeEventListener('touchmove', this.onDrag)
          document.removeEventListener('mouseup', this.stopDrag)
          document.removeEventListener('touchend', this.stopDrag)
        }
      }
      // </script>
      /* generated by vue-loader */

      /***/
    },
    /* 5 */
    /***/
    function(module, exports) {
      module.exports =
        '\n<div class="nice-bar-rail-y" v-show="height<100" @click="jump" ref="scrollRail">\n    <div class="nice-bar-slider-y" v-bind:style="{ height: height + \'%\', top: scrolling.v + \'%\' }" v-bind:class="{ \'fade-in\': show, \'fade-out\': !show }"\n         ref="scrollSlider" @touchstart="startDrag" @mousedown="startDrag">\n    </div>\n</div>\n'

      /***/
    },
    /* 6 */
    /***/
    function(module, exports, __webpack_require__) {
      var __vue_script__, __vue_template__
      var __vue_styles__ = {}
      __vue_script__ = __webpack_require__(7)
      if (
        __vue_script__ &&
        __vue_script__.__esModule &&
        Object.keys(__vue_script__).length > 1
      ) {
        console.warn(
          '[vue-loader] src\\components\\horizontal-scrollbar.vue: named exports in *.vue files are ignored.'
        )
      }
      __vue_template__ = __webpack_require__(8)
      module.exports = __vue_script__ || {}
      if (module.exports.__esModule) module.exports = module.exports.default
      var __vue_options__ =
        typeof module.exports === 'function'
          ? module.exports.options || (module.exports.options = {})
          : module.exports
      if (__vue_template__) {
        __vue_options__.template = __vue_template__
      }
      if (!__vue_options__.computed) __vue_options__.computed = {}
      Object.keys(__vue_styles__).forEach(function(key) {
        var module = __vue_styles__[key]
        __vue_options__.computed[key] = function() {
          return module
        }
      })

      /***/
    },
    /* 7 */
    /***/
    function(module, exports) {
      'use strict'

      Object.defineProperty(exports, '__esModule', {
        value: true
      })
      // <template>
      //     <div>
      //         <div class="nice-bar-rail-x" v-if="width < 100" @click="jump" ref="scrollRailX"></div>
      //         <div class="nice-bar-slider-x" v-bind:style="{ 'width': width + '%', left: scrolling.h + '%' }" v-bind:class="{ 'fade-in': show, 'fade-out': !show }"
      //              ref="scrollSliderX" @touchstart="startDrag" @mousedown="startDrag">
      //         </div>
      //     </div>
      // </template>
      //
      // <script>
      exports.default = {
        name: 'horizontal-scrollbar',
        props: {
          content: {
            type: Object,
            default: 0
          },
          container: {
            type: Object,
            default: 0
          },
          show: {
            type: Boolean,
            default: false
          },
          scrolling: {
            type: Object,
            default: {
              v: 0,
              h: 0
            }
          },
          draggingFromParent: {
            type: Boolean,
            default: false
          },
          onChangePosition: {
            type: Function,
            default: function _default() {}
          }
        },
        data: function data() {
          return {
            width: 0,
            dragging: false,
            start: 0
          }
        },

        watch: {
          content: {
            handler: function(val, old) {
              if (val.width != old.width) this.calculateSize()
            },
            deep: true
          },
          container: {
            handler: function(val, old) {
              if (val.width != old.width) this.calculateSize()
            },
            deep: true
          }
        },

        methods: {
          startDrag: function startDrag(e) {
            e.preventDefault()
            //e.stopPropagation();

            e = e.changedTouches ? e.changedTouches[0] : e

            this.dragging = true
            this.start = e.pageX
          },
          onDrag: function onDrag(e) {
            this.parentCalc()
            if (this.dragging) {
              e.preventDefault()
              e.stopPropagation()

              e = e.changedTouches ? e.changedTouches[0] : e

              var xMovement = e.pageX - this.start
              var xMovementPercentage = (xMovement / this.container.width) * 100

              this.start = e.pageX

              var next = this.scrolling.h + xMovementPercentage

              this.$parent.dragging = true

              this.onChangePosition(next, 'horizontal')

              this.normalize()
            }
          },
          stopDrag: function stopDrag(e) {
            this.dragging = false

            this.$parent.dragging = false
          },
          jump: function jump(e) {
            var isRailX = e.target === this.$refs.scrollRailX
            if (isRailX) {
              var position = this.$refs.scrollSliderX.getBoundingClientRect()

              // Calculate the horizontal Movement
              var xMovement = e.pageX - position.left

              var centerize = this.width / 2
              var xMovementPercentage =
                (xMovement / this.container.width) * 100 - centerize

              this.start = e.pageX

              var next = this.scrolling.h + xMovementPercentage

              this.onChangePosition(next, 'horizontal')
              this.normalize()
            }
          },
          normalize: function normalize() {
            this.$emit('horizontal')
          },
          calculateSize: function calculateSize() {
            this.width = (this.container.width / this.content.width) * 100
            if (this.width + this.scrolling.h > 100) {
              this.onChangePosition(100 - this.width, 'horizontal')
            }
            if (this.width > 100) {
              this.onChangePosition(0, 'horizontal')
            }
          }
        },

        mounted: function mounted() {
          this.calculateSize()
          this.parentCalc = util.throttle(500, this.$parent.calculateSize, true)
          var _this = this
          var delayCalc = function() {
            setTimeout(_this.parentCalc, 300)
          }
          document.addEventListener('keydown', delayCalc)
          document.addEventListener('mousemove', this.onDrag)
          document.addEventListener('touchmove', this.onDrag)
          document.addEventListener('mouseup', this.stopDrag)
          document.addEventListener('touchend', this.stopDrag)
        },
        beforeDestroy: function beforeDestroy() {
          document.removeEventListener('mousemove', this.onDrag)
          document.removeEventListener('touchmove', this.onDrag)
          document.removeEventListener('mouseup', this.stopDrag)
          document.removeEventListener('touchend', this.stopDrag)
        }
      }
      // </script>
      /* generated by vue-loader */

      /***/
    },
    /* 8 */
    /***/
    function(module, exports) {
      module.exports =
        '\n<div  v-show="width < 100" >\n    <div class="nice-bar-rail-x" @click="jump" ref="scrollRailX"></div>\n    <div class="nice-bar-slider-x" v-bind:style="{ \'width\': width + \'%\', left: scrolling.h + \'%\' }" v-bind:class="{ \'fade-in\': show, \'fade-out\': !show }"\n         ref="scrollSliderX" @touchstart="startDrag" @mousedown="startDrag">\n    </div>\n</div>\n'

      /***/
    },
    /* 9 */
    /***/
    function(module, exports, __webpack_require__) {
      // style-loader: Adds some css to the DOM by adding a <style> tag

      // load the styles
      var content = __webpack_require__(10)
      if (typeof content === 'string') content = [[module.id, content, '']]
      // add the styles to the DOM
      var update = __webpack_require__(12)(content, {})
      if (content.locals) module.exports = content.locals
      // Hot Module Replacement
      if (false) {
        // When the styles change, update the <style> tags
        if (!content.locals) {
          module.hot.accept(
            '!!./../../node_modules/css-loader/index.js!./../../node_modules/less-loader/index.js!./vue-nice-scrollbar.less',
            function() {
              var newContent = require('!!./../../node_modules/css-loader/index.js!./../../node_modules/less-loader/index.js!./vue-nice-scrollbar.less')
              if (typeof newContent === 'string')
                newContent = [[module.id, newContent, '']]
              update(newContent)
            }
          )
        }
        // When the module is disposed, remove the <style> tags
        module.hot.dispose(function() {
          update()
        })
      }

      /***/
    },
    /* 10 */
    /***/
    function(module, exports, __webpack_require__) {
      exports = module.exports = __webpack_require__(11)()
      // imports

      // module
      exports.push([
        module.id,
        '@keyframes fadeIn {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n@keyframes fadeOut {\n  from {\n    opacity: 1;\n  }\n  to {\n    opacity: 0;\n  }\n}\n.nice-bar {\n  overflow: hidden;\n  position: relative;\n  margin: 0 auto;\n}\n.nice-bar-rail-y {\n  position: absolute;\n  top: 0;\n  right: 0;\n  width: 10px;\n  height: 100%;\n  z-index: 1;\n}\n.nice-bar-rail-x {\n  position: absolute;\n  bottom: 0;\n  left: 0;\n  height: 10px;\n  width: 100%;\n  z-index: 1;\n}\n.nice-bar-slider-y {\n  position: absolute;\n  top: 0;\n  right: 0;\n  width: 10px;\n  z-index: 2;\n  opacity: 1;\n  animation-duration: 1s;\n  animation-fill-mode: both;\n}\n.nice-bar-slider-y.fade-in {\n  animation-name: fadeIn;\n  opacity: 1;\n}\n.nice-bar-slider-y.fade-out {\n  animation-name: fadeOut;\n opacity: 0;\n}\n.nice-bar-slider-x {\n  position: absolute;\n  bottom: 0;\n  left: 0;\n  height: 10px;\n  z-index: 2;\n  opacity: 0;\n  animation-duration: 1s;\n  animation-fill-mode: both;\n}\n.nice-bar-slider-x.fade-in {\n  animation-name: fadeIn;\n   opacity: 1;\n}\n.nice-bar-slider-x.fade-out {\n  animation-name: fadeOut;\n   opacity: 0;\n}\n.theme-light .nice-bar-slider-y {\n  background: rgba(103, 104, 106, 0.6);border-radius: 3px;\n}\n.theme-light .nice-bar-slider-x {\n  background: rgba(103, 104, 106, 0.6);border-radius: 3px;\n}\n.theme-dark .nice-bar-slider-y {\n  background: #222;\n}\n.theme-dark .nice-bar-slider-x {\n  background: #222;\n}\n',
        ''
      ])

      // exports

      /***/
    },
    /* 11 */
    /***/
    function(module, exports) {
      /*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
      // css base code, injected by the css-loader
      module.exports = function() {
        var list = []

        // return the list of modules as css string
        list.toString = function toString() {
          var result = []
          for (var i = 0; i < this.length; i++) {
            var item = this[i]
            if (item[2]) {
              result.push('@media ' + item[2] + '{' + item[1] + '}')
            } else {
              result.push(item[1])
            }
          }
          return result.join('')
        }

        // import a list of modules into the list
        list.i = function(modules, mediaQuery) {
          if (typeof modules === 'string') modules = [[null, modules, '']]
          var alreadyImportedModules = {}
          for (var i = 0; i < this.length; i++) {
            var id = this[i][0]
            if (typeof id === 'number') alreadyImportedModules[id] = true
          }
          for (i = 0; i < modules.length; i++) {
            var item = modules[i]
            // skip already imported module
            // this implementation is not 100% perfect for weird media query combinations
            //  when a module is imported multiple times with different media queries.
            //  I hope this will never occur (Hey this way we have smaller bundles)
            if (
              typeof item[0] !== 'number' ||
              !alreadyImportedModules[item[0]]
            ) {
              if (mediaQuery && !item[2]) {
                item[2] = mediaQuery
              } else if (mediaQuery) {
                item[2] = '(' + item[2] + ') and (' + mediaQuery + ')'
              }
              list.push(item)
            }
          }
        }
        return list
      }

      /***/
    },
    /* 12 */
    /***/
    function(module, exports, __webpack_require__) {
      /*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
      var stylesInDom = {},
        memoize = function(fn) {
          var memo
          return function() {
            if (typeof memo === 'undefined') memo = fn.apply(this, arguments)
            return memo
          }
        },
        isOldIE = memoize(function() {
          return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase())
        }),
        getHeadElement = memoize(function() {
          return document.head || document.getElementsByTagName('head')[0]
        }),
        singletonElement = null,
        singletonCounter = 0,
        styleElementsInsertedAtTop = []

      module.exports = function(list, options) {
        if (false) {
          if (typeof document !== 'object')
            throw new Error(
              'The style-loader cannot be used in a non-browser environment'
            )
        }

        options = options || {}
        // Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
        // tags it will allow on a page
        if (typeof options.singleton === 'undefined')
          options.singleton = isOldIE()

        // By default, add <style> tags to the bottom of <head>.
        if (typeof options.insertAt === 'undefined') options.insertAt = 'bottom'

        var styles = listToStyles(list)
        addStylesToDom(styles, options)

        return function update(newList) {
          var mayRemove = []
          for (var i = 0; i < styles.length; i++) {
            var item = styles[i]
            var domStyle = stylesInDom[item.id]
            domStyle.refs--
            mayRemove.push(domStyle)
          }
          if (newList) {
            var newStyles = listToStyles(newList)
            addStylesToDom(newStyles, options)
          }
          for (var i = 0; i < mayRemove.length; i++) {
            var domStyle = mayRemove[i]
            if (domStyle.refs === 0) {
              for (var j = 0; j < domStyle.parts.length; j++)
                domStyle.parts[j]()
              delete stylesInDom[domStyle.id]
            }
          }
        }
      }

      function addStylesToDom(styles, options) {
        for (var i = 0; i < styles.length; i++) {
          var item = styles[i]
          var domStyle = stylesInDom[item.id]
          if (domStyle) {
            domStyle.refs++
            for (var j = 0; j < domStyle.parts.length; j++) {
              domStyle.parts[j](item.parts[j])
            }
            for (; j < item.parts.length; j++) {
              domStyle.parts.push(addStyle(item.parts[j], options))
            }
          } else {
            var parts = []
            for (var j = 0; j < item.parts.length; j++) {
              parts.push(addStyle(item.parts[j], options))
            }
            stylesInDom[item.id] = {
              id: item.id,
              refs: 1,
              parts: parts
            }
          }
        }
      }

      function listToStyles(list) {
        var styles = []
        var newStyles = {}
        for (var i = 0; i < list.length; i++) {
          var item = list[i]
          var id = item[0]
          var css = item[1]
          var media = item[2]
          var sourceMap = item[3]
          var part = {
            css: css,
            media: media,
            sourceMap: sourceMap
          }
          if (!newStyles[id])
            styles.push(
              (newStyles[id] = {
                id: id,
                parts: [part]
              })
            )
          else newStyles[id].parts.push(part)
        }
        return styles
      }

      function insertStyleElement(options, styleElement) {
        var head = getHeadElement()
        var lastStyleElementInsertedAtTop =
          styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1]
        if (options.insertAt === 'top') {
          if (!lastStyleElementInsertedAtTop) {
            head.insertBefore(styleElement, head.firstChild)
          } else if (lastStyleElementInsertedAtTop.nextSibling) {
            head.insertBefore(
              styleElement,
              lastStyleElementInsertedAtTop.nextSibling
            )
          } else {
            head.appendChild(styleElement)
          }
          styleElementsInsertedAtTop.push(styleElement)
        } else if (options.insertAt === 'bottom') {
          head.appendChild(styleElement)
        } else {
          throw new Error(
            "Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'."
          )
        }
      }

      function removeStyleElement(styleElement) {
        styleElement.parentNode.removeChild(styleElement)
        var idx = styleElementsInsertedAtTop.indexOf(styleElement)
        if (idx >= 0) {
          styleElementsInsertedAtTop.splice(idx, 1)
        }
      }

      function createStyleElement(options) {
        var styleElement = document.createElement('style')
        styleElement.type = 'text/css'
        insertStyleElement(options, styleElement)
        return styleElement
      }

      function createLinkElement(options) {
        var linkElement = document.createElement('link')
        linkElement.rel = 'stylesheet'
        insertStyleElement(options, linkElement)
        return linkElement
      }

      function addStyle(obj, options) {
        var styleElement, update, remove

        if (options.singleton) {
          var styleIndex = singletonCounter++
          styleElement =
            singletonElement || (singletonElement = createStyleElement(options))
          update = applyToSingletonTag.bind(
            null,
            styleElement,
            styleIndex,
            false
          )
          remove = applyToSingletonTag.bind(
            null,
            styleElement,
            styleIndex,
            true
          )
        } else if (
          obj.sourceMap &&
          typeof URL === 'function' &&
          typeof URL.createObjectURL === 'function' &&
          typeof URL.revokeObjectURL === 'function' &&
          typeof Blob === 'function' &&
          typeof btoa === 'function'
        ) {
          styleElement = createLinkElement(options)
          update = updateLink.bind(null, styleElement)
          remove = function() {
            removeStyleElement(styleElement)
            if (styleElement.href) URL.revokeObjectURL(styleElement.href)
          }
        } else {
          styleElement = createStyleElement(options)
          update = applyToTag.bind(null, styleElement)
          remove = function() {
            removeStyleElement(styleElement)
          }
        }

        update(obj)

        return function updateStyle(newObj) {
          if (newObj) {
            if (
              newObj.css === obj.css &&
              newObj.media === obj.media &&
              newObj.sourceMap === obj.sourceMap
            )
              return
            update((obj = newObj))
          } else {
            remove()
          }
        }
      }

      var replaceText = (function() {
        var textStore = []

        return function(index, replacement) {
          textStore[index] = replacement
          return textStore.filter(Boolean).join('\n')
        }
      })()

      function applyToSingletonTag(styleElement, index, remove, obj) {
        var css = remove ? '' : obj.css

        if (styleElement.styleSheet) {
          styleElement.styleSheet.cssText = replaceText(index, css)
        } else {
          var cssNode = document.createTextNode(css)
          var childNodes = styleElement.childNodes
          if (childNodes[index]) styleElement.removeChild(childNodes[index])
          if (childNodes.length) {
            styleElement.insertBefore(cssNode, childNodes[index])
          } else {
            styleElement.appendChild(cssNode)
          }
        }
      }

      function applyToTag(styleElement, obj) {
        var css = obj.css
        var media = obj.media

        if (media) {
          styleElement.setAttribute('media', media)
        }

        if (styleElement.styleSheet) {
          styleElement.styleSheet.cssText = css
        } else {
          while (styleElement.firstChild) {
            styleElement.removeChild(styleElement.firstChild)
          }
          styleElement.appendChild(document.createTextNode(css))
        }
      }

      function updateLink(linkElement, obj) {
        var css = obj.css
        var sourceMap = obj.sourceMap

        if (sourceMap) {
          // http://stackoverflow.com/a/26603875
          css +=
            '\n/*# sourceMappingURL=data:application/json;base64,' +
            btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) +
            ' */'
        }

        var blob = new Blob([css], {
          type: 'text/css'
        })

        var oldSrc = linkElement.href

        linkElement.href = URL.createObjectURL(blob)

        if (oldSrc) URL.revokeObjectURL(oldSrc)
      }

      /***/
    },
    /* 13 */
    /***/
    function(module, exports) {
      module.exports =
        '\n<div class="nice-bar" v-bind:class="[ theme===\'dark\' ? \'theme-dark\' : \'theme-light\', classes ? \' \' + classes : \'\']" ref="scrollContainer">\n    <div ref="scrollContent" v-bind:style="{ \'margin-top\': _top * -1 + \'px\', \'margin-left\': _left * -1 + \'px\' }" @wheel.prevent="scroll"\n        @touchstart="startDrag" @touchmove="onDrag" @touchend="stopDrag">\n        <slot></slot>\n    </div>\n    <vertical-scrollbar v-show="ready" v-bind:content="{ height: scrollContentHeight }" v-bind:container="{ height: scrollContainerHeight }"\n                        v-bind:scrolling="{ v: vMovement }" v-bind:dragging-from-parent="dragging" v-bind:on-change-position="handleChangePosition"\n                        v-bind:show="show" v-on:vertical="moveTheScrollbar">\n    </vertical-scrollbar>\n    <horizontal-scrollbar v-show="ready" v-bind:content="{ width: scrollContentWidth }" v-bind:container="{ width: scrollContainerWidth }"\n                        v-bind:scrolling="{ h: hMovement }" v-bind:dragging-from-parent="dragging" v-bind:on-change-position="handleChangePosition"\n                        v-bind:show="show" v-on:horizontal="moveTheScrollbar">\n    </horizontal-scrollbar>\n</div>\n'

      /***/
    }
    /******/
  ]
)
export default window.vueNiceScrollbar
//# sourceMappingURL=build.js.map
