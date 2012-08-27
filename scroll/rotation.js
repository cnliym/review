/**
 * Created by 周小欢.
 * Date: 2012-08-27
 * Time: 11:28
 * Desc: 滚动
 */
KISSY.add("rotation",function(S){
 	function R(container,config){
		var defalutCfg={
			rollitem: '.J_item',	//动画容器
			rollrun: '.J_run',		//内容容器
			mousemark: 'on',		//鼠标在上的标记
			effect: 'bottom',		//动画效果(bottom\top\left\right)
			easing:'easeNone',		//平滑函数
			palyspeed: 1,			//动画速度
			Interval: 2				//间隔时间
		};
		this.cfg = S.merge(defalutCfg,config);			
 		this.ctn = S.one(container);					//最外层容器
 		this.rollitem = this.ctn.all(this.cfg.rollitem);	//动画父容器
 		this.rollrun = this.rollitem.all(this.cfg.rollrun);		//动画容器
 		this.viewsize = this.rollitem.width();			//得到宽度
 		this.init();
 	};
 	S.augment(R,S.Event.Target,{
 		init: function(){			//初始
 			var that=this;
 			that.initanim()		//动画参数
 			that.mouse();		//鼠标事件
 			that.run();			//执行动画
 		},
 		initanim: function(){	//动画配置
 			var that=this;
 			that.BR = function(dir,zhi){	//下右方向动画的公用初始化
	 			var that=this;		
				for (var i = that.rollitem.length - 1; i >= 0; i--) {
					var item=that.rollitem.item(i).one(that.cfg.rollrun);
					item.children().item(item.children().length-1).prependTo(item); //最后一项移到前面
					if(item.children().length !== 1){
						item.css(dir,zhi);	
					}
				};
	 		}
	 		that.LR = function(){ //初始化左、右方向动画的初始化宽度
	 			var that=this;	
	 			for (var i = that.rollitem.length - 1; i >= 0; i--) {
					var item=that.rollitem.item(i).one(that.cfg.rollrun);
					wid=parseInt(that.viewsize) * item.children().length + 'px';
					item.css('width', wid);  
				};
 			}
 			switch (that.cfg.effect) {   //初始化配置
	       		case 'top':
	       			that.topanim();
	       			break
				case 'bottom':
					that.btmanim();
					break
				case 'right':
					that.ritanim();
					break
				case 'left':
					that.lftanim();
	       			break
	       	}
 		},
 		mouse: function(){		//鼠标事件
 			var that= this;
 			that.rollitem.on('mouseover',function(){
 				S.one(this).addClass(that.cfg.mousemark);		//打标
 			})
 			that.rollitem.on('mouseout',function(){
 				S.one(this).removeClass(that.cfg.mousemark);	//移除标记
 			})
 		},
 		topanim: function(){
 			var that=this;
 			that.rollrun.css('width',that.viewsize + 'px');		//初始化宽度
   			that.animdir = {top : '-' + that.viewsize + 'px'};
   			that.animCBk = function(item){		//动画回调配置
   				item.css('top','0px');
				item.children().item(0).appendTo(item);    //第一项移到最后
   			}
 		},
 		btmanim: function(){
 			var that=this;
 			var _top='top',
				_zhi='-' + that.viewsize + 'px';
			that.rollrun.css('width',that.viewsize + 'px')  //初始化宽度
			that.BR(_top, _zhi);
			that.animdir ={top : 0};
			that.animCBk = function(item){ //动画回调配置
   				item.children().item(item.children().length-1).prependTo(item);   //最后一项移到前面
				item.css('top','-' + that.viewsize + 'px');
   			}
 		},
 		lftanim: function(){
 			var that=this;
 			that.LR();
			that.animdir = {left : '-' + that.viewsize + 'px'};
			that.animCBk = function(item){   //动画回调配置
				item.css('left','0px');			
				item.children().item(0).appendTo(item);		 //第一项移到最后
			}
	    },
 		ritanim: function(){
 			var that=this;
 			var _lft='left',
				_zhi='-' + that.viewsize + 'px';
			that.LR();
			that.BR(_lft,_zhi);
			that.animdir = {left : 0};
			that.animCBk = function(item){   //动画回调配置
   				item.children().item(item.children().length-1).prependTo(item);  //最后一项移到最前
				item.css('left','-' + that.viewsize + 'px');
   			}
 		},
 		anim: function(i){ 			//动画配置
 			var that=this,
 				item=that.rollitem.item(i).all(that.cfg.rollrun),
	 			animCfg = {     //动画参数配置
		            duration: that.cfg.palyspeed,
		            easing: that.cfg.easing,
		            complete: function(){				//动画回调
		            	that.animCBk(item);				
		            	that.fire("afrotation",{index:i});	//动画之后回调伪事件
		            }
	        	};
	        that.fire("bfrotation",{index:i});		//动画之前回调伪事件
			item.animate(that.animdir,animCfg);
 		},
 		run: function(){			//执行动画
 			var that=this,
 				i=0;
			setInterval(function(){
				var item=that.rollitem.item(i);
				if(item.one(that.cfg.rollrun).children().length >1){ //内容只有一项的时候不执行动画
					if (!item.hasClass(that.cfg.mousemark)){	
					//鼠标在上不执行动画
						that.anim(i);
					}
				}
				i++;
				i= (i>=that.rollitem.length) ? 0 : i;
			},that.cfg.Interval*1000)
 		}
 	})
 	return R;
},{attach:false});

KISSY.use('rotation',function(S, Rotation){
	new Rotation('.J_rollbox',{
		easing: 'bounceOut'
	})
})
