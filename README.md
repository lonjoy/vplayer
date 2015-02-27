# vplayer
移动端HTML5视频播放器

usage
--------
1. 页面中引入Zepto.js以及vplayer.min.js;
2. $(selector).VPlayer(opts);
3. opts对象请参考src/demo.html;
4. 默认的opts：
    
    {
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
    }

demo
--------
demoURL:[http://roryluo.info/h5/demo.html](http://roryluo.info/h5/demo.html)