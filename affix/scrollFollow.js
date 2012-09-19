KISSY.add('scrollFollow',function(S){
	var D = S.DOM; var E = S.Event; 
	/*默认配置*/
	var defalut ={
		followEl: '',    //元素选择器
		distance: '',    //距离(居上或居下)
		direction: 'top' //方向:top、bottom
	};
	function ScrollFollow(el,config){//ScrollFollow构造函数
		this.fixs = S.merge(defalut, config) //合并属性后的新对象.
		this.followEl = el;
		this.init();
	}

	S.augment(ScrollFollow, {
		init: function(){//初始化对象
			this.followEl = S.one(this.followEl);
			if (!this.followEl) return;    
			if (!this.top) this.top = this.followEl.offset().top;
			this.cssPosition = this.followEl.css('position');      
			this.cssWidth = this.followEl.css('width');
			this._bind();    
		},
		_bind: function(){   //绑定事件   
			E.on(window, "scroll", function(){        
				this.resetPosition(); 
			}, this);    
		},
		resetPosition: function(){  
			var winTop = parseInt(D.scrollTop(window), 10);  //网页卷进去的高度    
			var followEl = this.followEl; //当前的选择器   
			var top = this.top;//当前的高度
			var distance = parseInt(this.fixs.distance, 10);
			var direction = this.fixs.direction;
			var viewheight = parseInt(S.DOM.viewportHeight(),10);//可视区域高度
			var height = followEl.height();//元素自身的高度
			switch (direction){
				case 'top':
					if (top-winTop < distance){        
						this.fixtop(winTop);      
					} else if(top-winTop > distance) {  
						this.clearcss();
					};
					break;
				case 'bottom':
					if (top<winTop+viewheight-distance-height){        
						this.fixbom(winTop);      
					} else if(top-winTop > distance) {  
						this.clearcss();
					};
					break;
			}	
		},
		clearcss: function(){//清楚样式
			var followEl = this.followEl; 
			followEl.css({
				position: this.cssPosition,
				top:'',
				width: '',
				bottom:''
			})
		},
		fixtop: function(winTop){//设置top方向的属性     
			var followEl = this.followEl;
			var distance=parseInt(this.fixs.distance, 10); 
			if (6 === S.UA.ie ){
					followEl.css({
					position: 'absolute',
					top: winTop+distance,
					marginTop: '0',        
					width: this.cssWidth        
					});      
				} else{        
					followEl.css({ 
					position: 'fixed',          
					top: distance, 
					marginTop: '0', 
					width: this.cssWidth        
					});      
				}    
		},
		fixbom: function(winTop){   //设置bottom方向的属性    
			var followEl = this.followEl;
			var distance=parseInt(this.fixs.distance, 10); 
			var viewheight = parseInt(S.DOM.viewportHeight(),10);
			var height = parseInt(followEl.height(),10);
			if (6 === S.UA.ie ){
					followEl.css({
					position: 'absolute',
					marginTop: '0', 
					top: winTop+(viewheight-height-distance),       
					width: this.cssWidth        
					});      
				} else{        
					followEl.css({ 
					position: 'fixed',          
					marginTop:'0', 
					width: this.cssWidth,
					bottom: distance    
					});      
				}    
		}
	});
	return ScrollFollow;
	
},{
	attach: false
});
KISSY.use('scrollFollow',function(S,AutoFollow){
	var scrol1=new AutoFollow('#J_marryfloor',{
		distance: '50px'
	});
	var scrol2=new AutoFollow('#J_marryfloor2',{
		distance: '0px'
	});
	var scrol3=new AutoFollow('#J_pic',{
		distance: '20px',
		direction: 'bottom'
	});

})