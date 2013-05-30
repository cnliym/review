var S = KISSY, D = S.DOM, E = S.Event, $ = S.all;
KISSY.add('train', function (S) {
	var defaultCfg = {
		'defaultDir' : 'left',
		'defaultSpeed' : 20,
		'fastSpeed' : 80,
		'viewWidth' : '990',//�ܿ��
        'contentEventType' : 'mouseenter',  //�������¼����ͣ�Ĭ��Ϊmouseenter
        'btnEventType' : 'mouseenter',   //��ťʱ�����ͣ�Ĭ��Ϊmouseenter
        'circular' : true, //�Ƿ�ѭ��
        'lazyDataType' : true,   //�Ƿ�������
        'brandContentCls' : 'FBrand-content',
        'bigImgCls': 'imgBig',
        'currentCls' : 'ks-active',
        'contentEventEffect':  'stop', //�������¼�������Ļص�Ч��
		'nextTrigger' : '.next',//��ఴťclass
		'prevTrigger' : '.prev'  //�Ҳఴťclass
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
             //��ͼclass
            this.bigImg = $('.' + this.config['bigImgCls']);
            this.bigImgChild = this.bigImg.children();
			this._build();
			this._bind();
		},
		_build : function () {
            //������
            this.brandItemW = this.brandContentClild.width() * this.brandContentClild.length;
            //cloneһ��dom�ṹ����ʵ��ѭ��Ч��
            $(D.get(this.brandContent).innerHTML).appendTo(this.brandContent);
            //���ÿ�ȣ��Ա�һ��չʾ
			D.css(this.brandContent, 'width', this.brandItemW * 2);
			this._move(this.config['defaultDir'], this.config['defaultSpeed']);
            this._event(this.config['defaultDir'], this.config['defaultSpeed']);
		},
        //�ж��¼�����
        _mouseType : function(e,dir) {
            var me = this;
            if (e.type === this.config['contentEventType']) {
                me._move(dir, me.config['fastSpeed']);
            }else {
                me._move(dir, me.config['defaultSpeed']);
            }
        },
        //���Ұ�ť���Ʒ�����ٶȣ��ұߵİ�ť���ң���ߵİ�ť���� ���enter���٣�leave�ָ�ԭ�١�
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

        //ͨ���ٶȺ�·�����ʱ�䣬����ͬ���㷽����ͬ
		_time : function(dir,speed){
            var CLeft = D.css(this.brandContent, 'left');
            //��ǰӦ�����󻬶��ľ���
            var currentDistanceL = this.brandItemW + parseInt(CLeft);
            //��ǰӦ�����һ����ľ���
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
        //���ƹ���
		_move : function(dir, speed){
			var me = this;
			var time = this._time(dir,speed);
            //������С�ڻ����һ���Ͳ�����
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
        //��Ʒͼչʾ
        _ImgBig: function(currentIndex,imgLeft){
            var me = this;
            //��Ӧ��Ʒͼclone���Ա���logoһһ��Ӧ
            $(D.get(me.bigImg).innerHTML).appendTo(me.bigImg);
            $(me.bigImgChild).css("display","none");
            $(me.bigImgChild).item(currentIndex).css("margin-left",imgLeft);
            $(me.bigImgChild).item(currentIndex).css("display","block");
        },
        _imgrender: function(){
            $(this.bigImgChild).css("margin-left",0);
            $(this.bigImgChild).css("display","none");
        },
        //�����¼����
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
                    //��Ʒͼչʾ״̬��ʼ����û����ã���Ӧ����������
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
        //�ص��¼�
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
     * ����¼�--ͼƬ����
     * @class
     * @constructor
     * @param {Object} container ����
     * @param {Object} config ���ö���
     * @param {} ������ ��������
     */
  /*  var defaultCfg = {
        'constructor':'',
        '':
    }
    S.extend(ImgBig, Train, {

    });


    S.imgBig = imgBig;
}, { requires:[''] });   */