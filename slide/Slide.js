var S = KISSY, D = S.DOM, E = S.Event, $ = S.all;
KISSY.add('train', function (S) {
	var defaultCfg = {
		'defaultDir' : 'left',
		'defaultSpeed' : 20,
		'fastSpeed' : 80,
		'viewWidth' : '990',//总宽度
        'contentEventType' : 'mouseenter',  //滚动区事件类型，默认为mouseenter
        'btnEventType' : 'mouseenter',   //按钮时间类型，默认为mouseenter
        'circular' : true, //是否循环
        'lazyDataType' : true,   //是否懒加载
        'brandContentCls' : 'FBrand-content',
        'bigImgCls': 'imgBig',
        'currentCls' : 'ks-active',
        'contentEventEffect':  'stop', //滚动区事件触发后的回调效果
		'nextTrigger' : '.next',//左侧按钮class
		'prevTrigger' : '.prev'  //右侧按钮class
	};

	function Train(container, config) {
		this.container = S.one(container);
		this.config = S.merge(defaultCfg, config);
		this._init();
	}
	S.augment(Train, S.EventTarget, {
		_init : function () {
			this.brandContent = $('.' + this.config['brandContentCls']);
            this.brandContentClild = this.brandContent.children();
             //大图class
            this.bigImg = $('.' + this.config['bigImgCls']);
            this.bigImgChild = this.bigImg.children();
			this._build();
			this._bind();
		},
		_build : function () {
            //计算宽度
            this.brandItemW = this.brandContentClild.width() * this.brandContentClild.length;
            //clone一份dom结构，以实现循环效果
            $(D.get(this.brandContent).innerHTML).appendTo(this.brandContent);
            //设置宽度，以便一行展示
			D.css(this.brandContent, 'width', this.brandItemW * 2);
			this._move(this.config['defaultDir'], this.config['defaultSpeed']);
            this._event(this.config['defaultDir'], this.config['defaultSpeed']);
		},
        //判断事件类型
        _mouseType : function(e,dir) {
            var me = this;
            if (e.type === this.config['contentEventType']) {
                me._move(dir, me.config['fastSpeed']);
            }else {
                me._move(dir, me.config['defaultSpeed']);
            }
        },
        //左右按钮控制方向和速度，右边的按钮向右，左边的按钮向左。 鼠标enter加速，leave恢复原速。
		_bind : function () {
			var me = this;
            this.container.delegate('mouseenter mouseleave', this.config['nextTrigger'], function (e) {
				me.stop();
                me._mouseType(e, 'right');
			});

            this.container.delegate('mouseenter mouseleave', this.config['prevTrigger'], function (e) {
                me.stop();
                me._mouseType(e, 'left');
			});
		},

        //通过速度和路程算出时间，方向不同计算方法不同
		_time : function(dir,speed){
            var CLeft = D.css(this.brandContent, 'left');
            //当前应该向左滑动的距离
            var currentDistanceL = this.brandItemW + parseInt(CLeft);
            //当前应该向右滑动的距离
            var currentDistanceR = -parseInt(CLeft);
            if(dir === 'left'){
                if(speed === this.config['defaultSpeed']) {
                    return currentDistanceL / this.config['defaultSpeed'];

                }
                else if(speed === this.config['fastSpeed']) {
                    return currentDistanceL / this.config['fastSpeed'];
                }
            }
            else if(dir === 'right'){
                if(speed === this.config['defaultSpeed']){
                    return  currentDistanceR / this.config['defaultSpeed'];
                }
                else if(speed === this.config['fastSpeed']){
                    return  currentDistanceR / this.config['fastSpeed'];
                }
            }
		},
        //控制滚动
		_move : function(dir, speed){
			var me = this;
			var time = this._time(dir,speed);
            //如果宽度小于或等于一屏就不滚动
            if(me.brandItemW >= this.config['viewWidth']){
				if(dir === 'left'){
                    me.brandContent.animate({
						left : -me.brandItemW
					}, {
					duration : time,
					complete : function() {
						D.css(me.brandContent, 'left', 0);
							me._move(dir, speed);
						}
					});
				}else{
                    me.brandContent.animate({
					left : 0
					}, {
					duration : time,
					complete : function() {
						D.css(me.brandContent, 'left', -me.brandItemW);
							me._move(dir, speed);
						}
					});

				}

            }
		},
        //产品图展示
        _ImgBig: function(currentIndex,imgLeft){
            var me = this;
            //对应产品图clone，以便与logo一一对应
            $(D.get(me.bigImg).innerHTML).appendTo(me.bigImg);
            $(me.bigImgChild).css("display","none");
            $(me.bigImgChild).item(currentIndex).css("margin-left",imgLeft);
            $(me.bigImgChild).item(currentIndex).css("display","block");
        },
        _imgrender: function(){
            $(this.bigImgChild).css("margin-left",0);
            $(this.bigImgChild).css("display","none");
        },
        //额外事件添加
		_event: function(dir, speed){
            var me = this;

            $('.FBrand-contentItem').on('mouseenter mouseleave', function(ev){
               var currentObj = ev.target,
                   currentTarget = ev.currentTarget,
                   currentIndex = S.indexOf(D.get(currentTarget), D.query(me.brandContentClild)),
                   currentLeft = $(me.brandContent).css("left"),
                   imgLeft = D.query(me.brandContentClild)[currentIndex].offsetLeft + parseInt(currentLeft);
                if(ev.type === 'mouseenter'){
                   me._callbackStyle(currentIndex, imgLeft);
                }else{
                    //产品图展示状态初始化（没处理好，不应该耦合在这里）
                    me._imgrender();
                    me._move(dir, speed);
                }
                me.fire('callbStyle',{
                    target : currentObj,
                    cTarget : currentTarget,
                    cType : ev.type
                });
            });

        },
        //回调事件
         _callbackStyle: function(currentIndex,imgLeft){
             var me = this;
             if(me.config['contentEventEffect'] ===  'imgBig'){
                 me.stop();
                 me._ImgBig(currentIndex,imgLeft);

             }else if(me.config['contentEventEffect'] ===  'stop'){
                 me.stop();
             }
         },

        stop : function(){
            var me = this;
			me.brandContent.stop();
		}
	});
	return Train;
},{attach:false});

//KISSY.add('imgBig', function (S) {
    /**
     * 鼠标事件--图片浮层
     * @class
     * @constructor
     * @param {Object} container 容器
     * @param {Object} config 配置对象
     * @param {} 参数名 参数描述
     */
  /*  var defaultCfg = {
        'constructor':'',
        '':
    }
    S.extend(ImgBig, Train, {

    });


    S.imgBig = imgBig;
}, { requires:[''] });   */