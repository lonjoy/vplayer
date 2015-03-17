/**
 * Created by luo on 2015/1/8.
 */

;(function($){

    'use strict';

    //=============================================================================
    // VPlayer 外部依赖

    var $win = $(window),
        $doc = $(document)

    //=============================================================================
    // VPlayer 内部依赖
    
    // 当前平台
    var PF_DESKTOP = 0,
        PF_MOBILE = 1,
        pf = ($.os.ios || $.os.android) ? PF_MOBILE: PF_DESKTOP

    // 用户操作事件
    var UDeskTopEvent = {
        TOUCH_START: 'mousedown',
        TOUCH_MOVE: 'mousemove',
        TOUCH_END: 'mouseup',
        MOUSE_ENTER: 'mouseenter',
        MOUSE_LEAVE: 'mouseleave',
        TAP: 'click'
    },
    UMobileEvent = {
        TOUCH_START: 'touchstart',
        TOUCH_MOVE: 'touchmove',
        TOUCH_END: 'touchend',
        TOUCH_CANCEL: 'touchcancel',
        TAP: 'tap',
        SWIPE: 'swipe',
        SWIPE_LEFT: 'swipeLeft',
        SWIPE_RIGHT: 'swipeRight'
    },
    UEvent = pf ? UMobileEvent: UDeskTopEvent

    // video 默认事件
    var VEEvent = {
        ABORT: 'abort',
        CAN_PLAY: 'canplay',
        CAN_PLAY_THROUGH: 'canplaythrough',
        DURATION_CHANGE: 'durationchange',
        EMPTIED: 'emptied',
        ENDED: 'ended',
        ERROR: 'error',
        LOADED_DATA: 'loadeddata',
        LOADED_METADATA: 'loadedmetadata',
        LOAD_START: 'loadstart',
        PAUSE: 'pause',
        PLAY: 'play',
        PLAYING: 'playing',
        PROGRESS: 'progress',
        RATE_CHANGE: 'ratechange',
        RESIZE: 'resize',
        SEEKED: 'seeked',
        SEEKING: 'seeking',
        STALLED: 'stalled',
        SUSPEND: 'suspend',
        TIME_UPDATE: 'timeupdate',
        VOLUME_CHANGE: 'volumechange',
        WAITING: 'waiting'
    }

    // vplayer自定义事件
    var VEvent = {
        PLAY: 'v:play',
        PAUSE: 'v:pause',
        SEEK: 'v:seek',
        ERROR: 'v:error',
        PROGRESS: 'v:progress',
        RESIZE: 'v:resize',
        LOADING: 'v:loading'
    }

    var CSSEvent  = {
        ANIMATION_START: 'webkitAnimationStart',
        ANIMATION_END: 'webkitAnimationEnd',
        TRANSITION_START: 'webkitTransitionStart',
        TRANSITION_END: 'webkitTransitionEnd'
    }

    // video 默认属性
    var VEProp = {
        AUDIO_TRACKS: 'audioTracks',
        AUTO_PLAY: 'autoplay',
        BUFFERED: 'buffered',
        CONTROLLER: 'controller',
        CONTROLS: 'controls',
        CROSS_ORIGIN: 'crossOrigin',
        CURRENT_SRC: 'currentSrc',
        CURRENT_TIME: 'currentTime',
        DEFAULT_MUTED: 'defaultMuted',
        DEFAULT_PLAYBACK_RATE: 'defaultPlaybackRate',
        DURATION: 'duration',
        ENDED: 'ended',
        ERROR: 'error',
        HEIGHT: 'height',
        LOOP: 'loop',
        MEDIA_GROUP: 'mediaGroup',
        MUTED: 'muted',
        NETWORK_STATE: 'networkState',
        PAUSED: 'paused',
        PLAYBACK_RATE: 'playbackRate',
        PLAYED: 'played',
        POSTER: 'poster',
        PRELOAD: 'preload',
        READY_STATE: 'readyState',
        SEEKABLE: 'seekable',
        SEEKING: 'seeking',
        SRC: 'src',
        TEXT_TRACKS: 'textTracks',
        VIDEO_HEIGHT: 'videoHeight',
        VIDEO_TRACKS: 'videoTracks',
        VIDEO_WIDTH: 'videoWidth',
        VOLUME: 'volume',
        WIDTH: 'width'
    }

    var readyState = {
        HAVE_NOTHING: 0,
        HAVE_METADATA: 1,
        HAVE_CURRENT_DATA: 2,
        HAVE_FUTURE_DATA: 3,
        HAVE_ENOUGH_DATA: 4
    }

    var network = {

    }

    function UI(name, html, css, isVisible) {
        this.name = name
        this.html = html
        this.dom = $(this.html)
        this.css = css
        this.isVisible = isVisible
        this.parent
        this.children = {__length: 0}
        this.veEventHandler
        this.uiEventHandler

        this._init()
    }

    UI.exception = {
        NO_INIT: 'UI缺少init()方法'
    }

    UI.insertType = {
        AFTER: 'after',
        APPEND: 'append',
        BEFORE: 'before'
    }

    UI.prototype = {
        videoWrapOption: {
            uiName: '',
            selector: '.vWrap',
            instertType: UI.insertType.APPEND
        },
        _init: function() {
            // 默认可见性
            this.dom[this.isVisible ? 'show' : 'hide']()

            //
        },
        /**
         * UI实例初始化，在VPlayer实例初始化时被自动调用
         * 要求每个UI实例必须实现此方法
         *
         */
        init: function() {
            throw this.name + UI.exception.NO_INIT
        },
        addStyle: function(rule) {
            var style = document.createElement('style')
            style.innerHTML = rule
            document.getElementsByTagName('style')[0].appendChild(style)
        },
        show: function() {
            this.dom.show()
        },
        hide: function() {
            this.dom.hide()
        },
        /**
         * 添加子UI
         * @param ui          {UI}
         * @param selector    {String}
         * @param instertType {UI.insertType}
         */
        addChild: function(ui, selector, instertType) {
            instertType = instertType || UI.insertType.APPEND

            if (!ui || !(ui instanceof UI)) {
                throw 'UI.prototype.addChild需要UI对象'
            }

            // 默认直接append
            if (!selector) {
                this.dom.append(ui.dom)
            }
            // 有selector则插入指定的dom中
            else {
                this.dom.find(selector)[instertType](ui.dom)
            }

            this.children[ui.name] = ui
            this.children.__length++
            ui.parent = this
        },
        addVideo: function(video) {
            if (!this.videoWrapOption.instertType) {
                this.dom.append(video)
            }
            // 有selector则插入指定的dom中
            else {
                this.dom.find(this.videoWrapOption.selector)[this.videoWrapOption.instertType](video)
            }
        },
        /**
         * UI迭代器
         * @param   fn        {Function} 参数：(ui)
         * @returns returnVal {*}        fn的第一个返回值
         */
        uiIterator: function(fn) {
            var returnVal,
                iter = function(ui) {
                    if (returnVal) {
                        return
                    }

                    if (ui.children.__length > 0) {
                        for(var name in ui.children) {
                            if (ui.children.hasOwnProperty(name)) {
                                if (returnVal) {
                                    break
                                }
                                if (name === '__length') {
                                    continue
                                }

                                iter(ui.children[name])
                            }
                        }
                    }

                    returnVal = returnVal || fn(ui)

                }

            iter(this)
            return returnVal
        },
        /**
         * 获取子UI
         * @param   name  {String} 子ui.name
         * @returns child {UI}     若无则返回null
         */
        getChild: function(name) {
            return this.uiIterator(function(ui) {
                if (ui.name === name) {
                    return ui
                }
            })
        },
        /**
         * 添加video事件处理
         * @param fn {Function} 参数(vPlayer, vPlayer.video, vPlayer.uiVar)
         *
         * ------ fn 参数 -------------------------------
         * @param vPlayer       {VPlayer}
         * @param vPlayer.video {DOM}
         * @param vPlayer.uiVar {Object}
         */
        addVEEventHandler: function(fn) {
            this.veEventHandler = fn
        },
        /**
         * 添加UI交互事件处理
         * @param fn {Function} 参数(vPlayer, vPlayer.skin, vPlayer.video, vPlayer.uiVar)
         *
         * ------ fn 参数 -------------------------------
         * @param vPlayer       {VPlayer}
         * @param vPlayer.skin  {UI}
         * @param vPlayer.video {DOM}
         * @param vPlayer.uiVar {Object}
         *
         */
        addUIEventHandler: function(fn) {
            this.uiEventHandler = fn
        }
    }

    function TimerBiz(name, bizFunc, loopTimes, delay) {
        this.name = name
        this.bizFunc = bizFunc
        this.loopTimes = loopTimes
        this.delay = delay
        this.runTimes = 0
        this.createTime = 0
    }

    TimerBiz.delay = 100
    TimerBiz.timer = 0
    TimerBiz.spendTime = 0
    TimerBiz.queue = []

    TimerBiz.start = function() {
        var timer = TimerBiz.timer
        if (timer) {
            clearTimeout(timer)
        }

        var logic = function() {
            var finishedBizName = []
            TimerBiz.spendTime += TimerBiz.delay

            for (var i = 0; i < TimerBiz.queue.length; i++) {
                var biz = TimerBiz.queue[i],
                    bizSpendTime = biz.createTime + biz.runTimes * biz.delay,
                    deveation = TimerBiz.spendTime % bizSpendTime

                if (bizSpendTime === 0 || deveation === 0 || deveation >= biz.delay) {
                    if (~biz.loopTimes && biz.runTimes >= biz.loopTimes) {
                        finishedBizName.push(biz.name)
                        continue
                    }

                    biz.bizFunc()
                    biz.runTimes++
                }
            }

            TimerBiz.remove(finishedBizName)
            TimerBiz.timer = setTimeout(function() {
                logic()
            }, TimerBiz.delay)
        }

        logic()
    }

    TimerBiz.stop = function() {
        clearTimeout(TimerBiz.timer)
        TimerBiz.timer = 0
        TimerBiz.spendTime = 0
        TimerBiz.queue.length = 0
    }

    TimerBiz.add = function(name, bizFunc, loopTimes, delay) {
        var biz = new TimerBiz(name, bizFunc, loopTimes, delay)
        biz.createTime = TimerBiz.spendTime
        TimerBiz.queue.push(biz)
    }

    TimerBiz.remove = function(name) {
        var biz,
            newQueue = []

        for (var i = 0; i < TimerBiz.queue.length; i++) {
            biz = TimerBiz.queue[i]
            if (name !== biz.name && !~name.indexOf(biz.name)) {
                newQueue.push(biz)
            }
        }

        TimerBiz.queue = newQueue
    }

    //=============================================================================
    // VPlayer

    /**
     *
     * @param dom     容器id
     * @param vURL    视频URL
     * @param options 配置
     * @constructor
     */
    function VPlayer(dom, vURL, options) {
        this.container = $(dom)
        this.vURL = vURL
        this.options = this.defaultOpts
        this.video
        this.skin

        // UI共享变量
        this.uiVar = {}

        // 覆盖默认配置
        for (var p in options) {
            if (options[p] !== undefined) {
                this.options[p] = options[p]
            }
        }

        // 初始化
        this.init()
    }

    VPlayer.exception = {
        ADD_SKIN_ERROR: 'VPlayer.addSkin的参数rootUI必须为UI实例'
    }

    /**
     * 修改默认options
     * @param opts
     */
    VPlayer.defaultOpts = function(opts) {
        if (typeof opts === 'object') {
            for (var key in VPlayer.prototype.defaultOpts) {
                if (opts[key]) {
                    VPlayer.prototype.defaultOpts = opts[key]
                }
            }
        }
    }

    /**
     * 添加皮肤
     * @param skinName  皮肤名称
     * @param rootUI    UI对象
     */
    VPlayer.addSkin = function(rootUI) {
        if (rootUI instanceof UI) {
            VPlayer.prototype.skins[rootUI.name] = rootUI
        }
        else {
            throw VPlayer.exception.ADD_SKIN_ERROR
        }
    }
    
    VPlayer.prototype = {

        //-------------------------------------------------------------------------

        VERSION: '0.1.0',

        //-------------------------------------------------------------------------

        defaultOpts: {
            title: '',                  // 视频标题
            width: '100%',
            height: '100%',
            backgroundColor: '#000',
            autoPlay: false,            // 自动播放，需环境支持
            loop: 1,                    // 播放次数
            skin: 'defaultRoot',        // 皮肤
            displayInline: true,        // 行内播放
            controls: false,            // 系统默认控件
            preload: 'none',            // 预加载
            poster: '',                 // 封面URL
            controlAutoHide: true,      // 是否自动隐藏标题栏、控制条
            controlHideDelay: 7000      // 标题栏、控制条隐藏延迟
            // todo:去黑边
        },

        skins: {},                  // 皮肤组

        init: function() {
            // video标签初始化
            this.videoInit()

            // UI初始化
            this.skinInit()
            this.container.append(this.skin.dom)

            // 事件绑定
            this.eventInit()
        },
        videoInit: function() {
            var video = $('<video>')

            // CSS
            this.video = video
            this.video.width(this.options.width)
            this.video.height(this.options.height)
            this.video.css('background-color', this.options.backgroundColor)

            // Attribute
            var attr = {}
            attr.width = this.options.width
            attr.height = this.options.height
            attr.preload = this.options.preload
            attr.src = this.vURL

            if (this.options.autoPlay) {
                attr.autoplay = ''
            }

            if (this.options.displayInline) {
                attr['webkit-playsinline'] = ''
            }

            if (this.options.controls) {
                attr.controls = ''
            }

            this.video.attr(attr)
        },
        skinInit: function() {
            var self = this

            this.skin = this.skins[this.options.skin]
            this.skin.addVideo(this.video)
            this.skin.uiIterator(function(ui) {
                ui.init(self)
            })
        },
        eventInit: function() {
            var self = this

            this.skin.uiIterator(function(ui) {

                // VEEvent
                if (typeof ui.veEventHandler === 'function') {
                    ui.veEventHandler(self, self.video, self.uiVar)
                }

                // UIEvent
                if (typeof ui.uiEventHandler === 'function') {
                    ui.uiEventHandler(self, self.skin, self.video, self.uiVar)
                }
            })

            // video
            this.video.on(UEvent.TAP, function(e) {
                if (this.paused) {
                    this.play()
                }
            })
        }
    }


    //---------------------------------------------------------------添加默认皮肤


    //---------------------------------------------------------------基本HTML

    var defaultRootUI = new UI('defaultRoot', '\
        <div class="videoBox">\
            <!-- title -->\
            <div class="vWrap">\
                <!-- poster -->\
                <!-- centerIcon -->\
                <!-- video -->\
            </div>\
            <!-- controlBar -->\
        </div>',
        '', true)

    defaultRootUI.toggleSize = function(isInline) {
        var w = $win.width(),
            h = $win.height()

        if (isInline) {
            this.dom.css({
                position: '',
                width: '',
                height: '',
                top: '',
                left: '',
                right: '',
                bottom: ''
            })

            document.webkitCancelFullScreen()
        }
        else {
            this.dom.css({
                position: 'fixed',
                width: '100%',
                height: '100%',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
            })

            this.dom[0].webkitRequestFullScreen()
        }
    }

    // TODO: 这里为什么会报错？
    // defaultRootUI.addUIEventHandler(function(player, skin, video, uiVar) {
    //     var self = this
    // })

    defaultRootUI.init = function(vplayer) {
        // 全屏
        if (typeof this.dom[0].webkitRequestFullScreen === 'undefined') {
            this.dom[0].webkitRequestFullScreen = function() {}
        }

        if (typeof document.webkitCancelFullScreen === 'undefined') {
            document.webkitCancelFullScreen = function() {}
        }

        vplayer.skin.toggleSize(vplayer.options.displayInline)
        this.dom.css('background-color', vplayer.options.backgroundColor)
    }

    //---------------------------------------------------------------标题栏

    var titleUI = new UI('title', '\
        <div class="videotitle" id="videotitle">\
            <h1></h1>\
        </div>',
        '', true)

    titleUI.setTitle = function(text) {
        this.dom.find('h1').text(text)
    }

    titleUI.animateShow = function(uiVar) {
        var hasInit = this.dom.hasClass('titleAnimHide')
        this.dom.removeClass('titleAnimHide')
        if (hasInit) {
            this.dom.addClass('titleAnimShow')
        }

        if (uiVar.titleUITimer) {
            clearTimeout(uiVar.titleUITimer)
            delete uiVar.titleUITimer
        }
    }

    titleUI.animateHide = function(uiVar) {
        if (uiVar.seeking) {
            return
        }

        this.dom.removeClass('titleAnimShow')
        this.dom.addClass('titleAnimHide')
    }

    titleUI.isShow = function() {
        return !this.dom.hasClass('titleAnimHide')
    }

    titleUI.addVEEventHandler(function(player, video, uiVar) {
        var self = this

        // 播放
        video.on(VEEvent.PLAY, function(e) {
            self.animateShow(uiVar)
        })

        // 停止
        video.on(VEEvent.ENDED, function(e) {
            self.animateShow(uiVar)
        })

        // 自动隐藏标题栏
        // 以下情况不会按时收起控制栏
        // video.currentTime === 0
        // video.paused === true
        // title被点击
        // control被点击
        // 拖动进度条
        player.options.controlAutoHide && video.on(VEEvent.TIME_UPDATE, function(e) {
            if (video[0][VEProp.CURRENT_TIME] > 0 && !video[0][VEProp.PAUSED]) {
                if (self.isShow()
                    && !uiVar.titleUITimer
                    && !uiVar.seekTimer
                    && !uiVar.seekTimerByTap) {

                    uiVar.titleUITimer = setTimeout(function() {
                        if (!video[0].paused) {
                            self.animateHide(uiVar)
                        }

                        delete uiVar.titleUITimer
                    }, player.options.controlHideDelay)
                }
            }
        })
    })

    titleUI.addUIEventHandler(function(player, skin, video, uiVar) {
        var self = this

        this.dom.on(UEvent.TAP, function(e) {
            self.animateShow(uiVar)
            skin.getChild('controlBar').animateShow(uiVar)
        })

        video.on(UEvent.TAP, function(e) {
            self.animateShow(uiVar)
        })
    })

    // 标题初始化
    titleUI.init = function(vplayer) {
        this.setTitle(vplayer.options.title)
    }


    //---------------------------------------------------------------封面

    var posterUI = new UI('poster', '<img class="videoImg" src="" style="opacity:1;">', '', true)

    posterUI.setPosterURL = function(url) {
        this.dom.attr('src', url)
    }

    posterUI.addVEEventHandler(function(player, video, uiVar) {
        var self = this

        video.on(VEEvent.TIME_UPDATE, function(e) {
            if (video[0][VEProp.CURRENT_TIME] > 0) {
                self.hide()
            }
        })
    })

    posterUI.addUIEventHandler(function(player, skin, video, uiVar) {
        var self = this

        this.dom.on(UEvent.TAP, function(e) {
            video[0].play()
        })
    })

    posterUI.init = function(vplayer) {
        this.setPosterURL(vplayer.options.poster)
    }


    //---------------------------------------------------------------视频中央的图标

    var centerIcon = new UI('centerIcon', '\
        <span class="btnPlay loadingPercent">\
            <em class="canPlay icon-play"><i></i></em>\
            <em class="rond"><i></i></em>\
            <em class="verror"></em>\
        </span>', '', false)

    centerIcon.status = {
        LOADING: '.rond',
        PAUSE: '.canPlay',
        ERROR: '.verror'
    }

    centerIcon.switchIcon = function(status) {
        this.dom.find('em').hide()
        this.dom.find(status).show()
    }

    centerIcon.addVEEventHandler(function(player, video, uiVar) {
        var self = this

        // 正常播放时隐藏图标
        video.on(VEEvent.TIME_UPDATE, function(e) {
            if (!video[0][VEProp.PAUSED] && video[0][VEProp.CURRENT_TIME] > 0) {
                self.hide()
            }
        })

        // 视频暂停时显示图标
        video.on(VEEvent.PAUSE, function(e) {
            // 因拖动引起的暂停不需要显示暂停ICON
            if (uiVar.seeking && uiVar.seeking.hasPaused) {
                return
            }

            self.switchIcon(centerIcon.status.PAUSE)
            self.show()
        })

        // video play时显示loading
        video.on(VEEvent.PLAY, function(e) {
            var currentTime = video[0][VEProp.CURRENT_TIME],
                buffered = video[0][VEProp.BUFFERED]

            if (currentTime === 0 || !isNaN(video[0][VEProp.DURATION])) {
                var len = buffered.length,
                    start, end

                // play触发后，只有currentTime落在buffered区间内才隐藏ICON
                if (len > 0) {
                    for (var i = 0; i < len; i++) {
                        start = buffered.start(i)
                        end = buffered.end(i)

                        if (start < end && start <= currentTime && end >= currentTime) {
                            self.hide()
                            return
                        }
                    }
                }

                self.switchIcon(centerIcon.status.LOADING)
            }
        })

        // 视频播放卡顿时展示loading
        video.on(VEEvent.STALLED, function(e) {
            if (!video[0][VEProp.PAUSED]) {
                self.switchIcon(centerIcon.status.LOADING)
            }
            self.show()
        })

        // video播放异常时显示错误图标
        video.on(VEEvent.ERROR, function(e) {
            self.switchIcon(centerIcon.status.ERROR)
            self.show()
        })
    })

    centerIcon.addUIEventHandler(function(player, skin, video, uiVar) {
        var self = this

        // 点击play按钮播放视频
        this.dom.on(UEvent.TAP, '.canPlay', function(e) {
            video[0].play()
        })
    })

    centerIcon.init = function(vplayer) {
        this.switchIcon(centerIcon.status.PAUSE)
        this.show()
    }


    //---------------------------------------------------------------控制栏

    var controlBar = new UI('controlBar', '\
        <div class="controllBar">\
            <span class="icon-play"></span>\
            <span class="icon-suoxiao"></span>\
            <!-- progressBar -->\
        </div>', '', true)

    controlBar.status = {       // 控制条播放按钮状态
        PLAY: 'icon-zanting',   // 播放时使用此图标
        PAUSE: 'icon-play'      // 暂停时使用此图标
    }

    controlBar.switchIcon = function(status) {
        this.dom.find('span').eq(0).attr('class', status)
    }

    controlBar.videoSize = {
        inline: 'icon-quanping',
        fullScreen: 'icon-suoxiao'
    }

    controlBar.toggleSize = function(videoSize) {
        this.dom.find('span').eq(1).attr('class', videoSize)
    }

    controlBar.animateShow = function(uiVar) {
        var hasInit = this.dom.hasClass('controlAnimHide')
        this.dom.removeClass('controlAnimHide')
        if (hasInit) {
            this.dom.addClass('controlAnimShow')
        }

        if (uiVar.controlBarTimer) {
            clearTimeout(uiVar.controlBarTimer)
            delete uiVar.controlBarTimer
        }
    }

    controlBar.animateHide = function(uiVar) {
        if (uiVar.seeking) {
            return
        }

        this.dom.removeClass('controlAnimShow')
        this.dom.addClass('controlAnimHide')
    }

    controlBar.isShow = function() {
        return !this.dom.hasClass('controlAnimHide')
    }

    controlBar.addVEEventHandler(function(player, video, uiVar) {
        var self = this

        // 播放
        video.on(VEEvent.PLAY, function(e) {
            self.animateShow(uiVar)
            controlBar.switchIcon(controlBar.status.PLAY)
        })

        // 暂停
        video.on(VEEvent.PAUSE, function(e) {
            controlBar.switchIcon(controlBar.status.PAUSE)
        })

        // 自动显示控制栏
        video.on(VEEvent.ENDED, function(e) {
            self.animateShow(uiVar)
        })

        // 自动隐藏控制栏
        player.options.controlAutoHide && video.on(VEEvent.TIME_UPDATE, function(e) {
            // 以下情况不会按时收起控制栏
            // video.currentTime === 0
            // video.paused === true
            // title被点击
            // control被点击
            // 拖动进度条
            if (video[0][VEProp.CURRENT_TIME] > 0 && !video[0][VEProp.PAUSED]) {
                if (self.isShow()
                    && !uiVar.controlBarTimer
                    && !uiVar.seekTimer
                    && !uiVar.seekTimerByTap) {

                    uiVar.controlBarTimer = setTimeout(function() {
                        if (!video[0].paused) {
                            self.animateHide(uiVar)
                        }

                        delete uiVar.controlBarTimer
                    }, player.options.controlHideDelay)
                }
            }
        })
    })

    controlBar.addUIEventHandler(function(player, skin, video, uiVar) {
        var self = this

        this.dom.on(UEvent.TAP, function(e) {
            self.animateShow(uiVar)
            skin.getChild('title').animateShow(uiVar)
        })

        // 点击video展示控制栏
        video.on(UEvent.TAP, function(e) {
            self.animateShow(uiVar)
        })

        // 点击play icon
        this.dom.on(UEvent.TAP, '.icon-play', function(e) {
            if (!video[0][VEProp.ERROR]) {
                video[0].play()
            }
        })

        // 点击pause icon
        this.dom.on(UEvent.TAP, '.icon-zanting', function(e) {
            if (!video[0][VEProp.ERROR]) {
                video[0].pause()
            }
        })

        // 点击toggle size
        this.dom.on(UEvent.TAP, '.icon-quanping, .icon-suoxiao', function(e) {
            if ($(this).hasClass('icon-quanping')) {
                $(this).removeClass('icon-quanping ').addClass('icon-suoxiao')
                skin.toggleSize(false)
            }
            else {
                $(this).removeClass('icon-suoxiao').addClass('icon-quanping')
                skin.toggleSize(true)
            }
        })
    })

    controlBar.init = function(vplayer) {
        this.switchIcon(this.status.PAUSE)
        this.toggleSize(vplayer.options.displayInline ? this.videoSize.inline : this.videoSize.fullScreen)
    }

    //---------------------------------------------------------------进度条

    var progressBar = new UI('progressBar', '\
        <div class="progress">\
            <span class="hasplaytime"></span>\
            <span class="totaltime"></span>\
            <div class="progressbarbg"></div>\
            <div class="progressbar">\
                <span class="playcircle"></span>\
            </div>\
        </div>', '', true)

    progressBar.formatTime = function(seconds) {
        var duration = parseInt(seconds),
            minutes = parseInt(duration / 60).toString()
        seconds = parseInt(duration % 60).toString()

        if (minutes.length === 1) {
            minutes = '0' + minutes
        }
        if (seconds.length === 1) {
            seconds = '0' + seconds
        }

        return minutes + ':' + seconds
    }

    progressBar.resetWidth = function(controlBar) {
        var minWidth = 240,
            iconWidth = controlBar.dom.find('.icon-play, .icon-zanting').width(),
            controlWidth = controlBar.dom.width()

        controlWidth = controlWidth < minWidth ? minWidth : controlWidth
        this.dom.width(controlWidth - 4 * iconWidth)
    }

    progressBar.setDuration = function(duration) {
        duration = isNaN(duration) ? 0 : duration
        this.dom.find('.totaltime').text(progressBar.formatTime(duration))
    }

    progressBar.setCurrentTime = function(currentTime) {
        this.dom.find('.hasplaytime').text(progressBar.formatTime(currentTime))
    }

    progressBar.setProgress = function(progress) {
        var positionFix = 0.00
        progress = isNaN(progress) ? 0 : parseFloat(progress)
        progress += positionFix
        progress *= 100
        progress = progress + '%'
        this.dom.find('.progressbar').css('width', progress)
    }

    progressBar.setBuffersLoadedRange = function(buffers, duration) {
        if (isNaN(duration)) {
            return
        }

        var len = buffers.length,
            gradientValue = ['-webkit-linear-gradient(0'],
            defaultColor = '#FFF',
            bufferColor = '#AAA',
            start, end

        if (len > 0) {
            for (var i = 0; i < len; i++) {
                start = (buffers.start(i) / duration) * 100 + '%'
                end = (buffers.end(i) / duration) * 100 + '%'

                gradientValue.push(defaultColor + ' ' + start)
                gradientValue.push(bufferColor  + ' ' + start)
                gradientValue.push(bufferColor  + ' ' + end)
                gradientValue.push(defaultColor + ' ' + end)
            }

            gradientValue = gradientValue.join(',') + ')'
        }
        else {
            gradientValue = ''
        }

        this.dom.find('.progressbarbg').css('background-image', gradientValue)
    }

    progressBar.addVEEventHandler(function(player, video, uiVar) {
        var self = this

        video.on(VEEvent.TIME_UPDATE, function(e) {
            var el = video[0],
                currentTime = el[VEProp.CURRENT_TIME],
                duration = el[VEProp.DURATION]

            self.setCurrentTime(currentTime)
            self.setProgress(currentTime / duration)
        })

        video.on(VEEvent.ENDED, function(e) {
            self.setCurrentTime(0)
            self.setProgress(0)
        })

        video.on(VEEvent.DURATION_CHANGE, function(e) {
            self.setDuration(video[0][VEProp.DURATION])
        })

        TimerBiz.add('updateBuffersLoadedRange', function() {
            // 在没有点击、拖动进度条时才自动更新进度
            if (!uiVar.seeking) {
                var el = video[0],
                    duration = el[VEProp.DURATION]
  
                self.setBuffersLoadedRange(video[0][VEProp.BUFFERED], duration)
            }
        }, -1, 100)
    })

    progressBar.addUIEventHandler(function(player, skin, video, uiVar) {
        var self = this

        // 拖动进度条
        this.dom.on(UEvent.TOUCH_MOVE, function(e) {
            e.preventDefault()

            if (video[0][VEProp.READY_STATE] !== readyState.HAVE_NOTHING) {
                if (pf === PF_DESKTOP && !uiVar.seekEnabled) {
                    return
                }

                var clientX = e.clientX || e.targetTouches[0].clientX,
                    x = clientX - (self.dom.offset().left - $('body').scrollLeft()),
                    progress = x / $(this).width()

                if (progress > 1) {
                    progress = 1
                }

                if (progress < 0) {
                    progress = 0
                }

                var currentTime = progress * video[0][VEProp.DURATION]
                self.setProgress(progress)
                self.setCurrentTime(currentTime)
                video[0][VEProp.CURRENT_TIME] = currentTime

                if (uiVar.seeking) {
                    uiVar.seeking.progress = progress
                    uiVar.seeking.currentTime = currentTime
                }
                else {
                    uiVar.seeking = {
                        progress: progress,
                        currentTime: currentTime,

                        // 拖动前是否为暂停状态
                        hasPaused: false
                    }
                }

                // 拖动时暂停视频播放
                // 因拖动进度条而暂停的视频在拖动结束后要继续播放
                // 这种类型的暂停并不显示视频中间的暂停ICON
                if (!video[0][VEProp.PAUSED]) {
                    video[0].pause()
                    uiVar.seeking.hasPaused = true
                }
            }
        })

        // 点击进度条
        this.dom.on(UEvent.TOUCH_START, function(e) {
            if (video[0][VEProp.READY_STATE] !== readyState.HAVE_NOTHING) {
                var clientX = e.clientX || e.targetTouches[0].clientX,
                    x = clientX - (self.dom.offset().left - $('body').scrollLeft()),
                    progress = x / $(this).width()

                if (progress > 1) {
                    progress = 1
                }

                if (progress < 0) {
                    progress = 0
                }

                self.setProgress(progress)
                uiVar.seeking = {
                    progress: progress,
                    currentTime: progress * video[0][VEProp.DURATION]
                }

                if (pf === PF_DESKTOP) {
                    uiVar.seekEnabled = true
                }
            
                video[0][VEProp.CURRENT_TIME] = uiVar.seeking.currentTime
            }
        })

        // 拖动结束
        this.dom.on(UEvent.TOUCH_END, function(e) {
            if (uiVar.seeking) {
                // 拖动结束
                // 点击结束
                self.setProgress(uiVar.seeking.progress)
                video[0][VEProp.CURRENT_TIME] = uiVar.seeking.currentTime
                skin.getChild('title').animateShow(uiVar)
                skin.getChild('controlBar').animateShow(uiVar)

                if (uiVar.seeking.hasPaused) {
                    video[0].play()
                }

                if (pf === PF_DESKTOP) {
                    delete uiVar.seekEnabled
                }

                setTimeout(function() {
                    delete uiVar.seeking
                }, 0)
            }
        })
    })

    progressBar.init = function(vplayer) {
        this.setDuration(0)
        this.setCurrentTime(0)
        this.setProgress(0)
    }

    //---------------------------------------------------------------浮层

    //var tips = new UI('tips', '<div class="tips"></div>', '\
    //    width: 30%;height: 24%; background-color: rgba(33, 33, 33,.8);\
    //    z-index: 4; top: 35%; left: 33%; position: absolute; \
    //    border-radius: 5px; color: #fff; line-height: 100%;'
    //    , false)
    //
    //tips.addUIEventHandler(function(player, skin, video, uiVar) {
    //    var self = this
    //
    //    // 拖动进度条
    //    this.dom.on(UEvent.TOUCH_MOVE, function(e) {
    //
    //    })
    //})
    //
    //tips.init = function(vplayer) {}

    controlBar.addChild(progressBar)
    defaultRootUI.addChild(titleUI, '.vWrap', UI.insertType.BEFORE)
    defaultRootUI.addChild(posterUI, '.vWrap')
    defaultRootUI.addChild(centerIcon, '.vWrap')
    defaultRootUI.addChild(controlBar, '.vWrap', UI.insertType.AFTER)
    defaultRootUI.addStyle('<#=skincss#>')

    VPlayer.addSkin(defaultRootUI)

    //=============================================================================
    // zepto 插件逻辑


    $.fn.VPlayer = function(options) {
        var container = $(this),
            domData

        // 合并data-* 与options参数，options优先
        for (var dataKey in VPlayer.prototype.defaultOpts) {
            if (VPlayer.prototype.defaultOpts.hasOwnProperty(dataKey)) {
                domData = VPlayer.prototype.defaultOpts[dataKey]
                if (domData !== undefined && options[dataKey] === undefined) {
                    options[dataKey] = domData
                }
            }
        }

        setTimeout(function() {
            TimerBiz.start()
        }, 0)

        var vplayers = []

        return new VPlayer(container, options.vURL, options)
    }

})(Zepto)