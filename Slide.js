KISSY.add('scroller', function (S,Switchable,Anim) {
  var DOM=S.DOM,Event=S.Event,$= S.all;
    var cfg = {
        distance:50,//滚动值
        Containers:'scroll-pn',//switchable容器
		prevTrgger:'G-scroll-prev',//上一个
		nextTrgger:'G-scroll-next'//下一个
    }

	function Scro(config){
        this.config = S.merge(cfg,config);
        this.init();
	}
    S.augment(Scro,{
        init:function(){
            this._width= DOM.viewportWidth();

            this.container=$('.'+this.config['Containers']);
            this.prev=$('.'+this.config['prevTrgger']);
            this.next=$('.'+this.config['nextTrgger']);
            this.distance=this.config['distance'];
			
            this.sbg=$(".pxs",".pxs_bg");

            this.bg1 = $(".pxs_con1");
            this.bg2=$(".pxs_con2");
            this.bg3=$(".pxs_con3");

            this.initBg(this.bg1);//克隆背景
            this.initBg(this.bg2);
            this.initBg(this.bg3);

            this.initSwitch();//轮播的switchable
            this.bindEvent();//绑定事件 
        },
        initBg:function(con){
            var pic = con.one('.pic');
            var aClone= pic.clone();
            $(con).append(aClone);

            var w = pic.width();
            con.width(w*2);
            con.css("left",-w);
        },
        initSwitch:function(){
            var self = this;
            var F=new Switchable.Carousel(self.container,{
                activeIndex:0,
                effect: "scrollx",
                circular : true,
                viewSize: [850],
                steps: 1,
                prevBtnCls: "tiny-prev",
                nextBtnCls: "tiny-next",
                autoplay: false,
                easing : 'easeNone',
                duration:3
            });
        },
        bindEvent:function(){
            var self = this;			
            Event.delegate(document,'click','.G-scroll-prev',function(){
                S.each(self.sbg,function(item, i){
					
                    var leftnum = parseInt(DOM.css(item,"left"));

                    var w=parseInt(DOM.css(item,'width'))/2;
                    
                    if(leftnum <-w){
                        DOM.css(item,'left', -w+ self.distance);
                        leftnum  =  -w;
                    }

                    var toLeft = leftnum + self.distance+ 200*i;

                    var an=new Anim(item,{
                        left: toLeft+"px"
                    }, 4,"easeNone");
                    an.run();					
                });
            });
                Event.delegate(document,'click','.G-scroll-next',function(){
				
                    S.each(self.sbg,function(item, i){
                        var leftnum = parseInt(DOM.css(item,"left"));
                        var w=parseInt(DOM.css(item,'width'))/2;
                        if(leftnum < w){
                            DOM.css(item,'left', -w);
                            leftnum  =  -w;
                        }
                        var toLeft = leftnum - self.distance- 200*i;
                        var an=new Anim(item,{
                            left: toLeft+"px"
                        }, 4,"easeNone");
                        an.run();
						
                    });					
                });
        }
    });
	return Scro;
}, {attach: false, requires: ['switchable','anim']});
