KISSY.add('sroll', function(S,Roll) {
	D = S.DOM, E = S.Event;
	function Sroll(container,config) {
		var defaultCfg = {
		'dir' : 'bottom',//方向
		'time' : 1,//动画执行时间
//本想把动画间隔时间开放出来，但为了避免动画间隔时间比动画执行时间短，所以根据动画执行时间算出动画间隔时间。
		'Easing' : 'easeOutStrong',
		'currentIndex':0,//当前项
		'stop': false//控制车子的开和停
	}
		if(!(this instanceof Sroll)) {
			return new Sroll();
		}
		this.container = S.one(container);
		this.config = S.merge(defaultCfg, config);
		this.currentIndex = this.config['currentIndex'];
		this.count = D.children(this.container).length;
		this.rolls = this._getRolls();

		this._init();
	}


	S.augment(Sroll, {
		_init : function() {
			this._move();
			// this._autoPlay();
			// this.stop();
		},
		_getRolls : function() {		
			var rolls = [];
			for(var i = 0; i < this.count; i++) {
				var node = D.children(this.container)[i];
				rolls.push(new Roll(node,this.config));
			}
			return rolls;
		},
		_getIndex:function(){
			//如果先判断，那么如果当前项从最后一个开始就会出问题，当前项还是为零
			if(this.currentIndex < this.count - 1){
				this.currentIndex++;
			}else{
				this.currentIndex = 0;
			}
			return this.currentIndex;
		},
		_move : function() {
			var me = this;
			var Index = me.currentIndex;
			//经由_getIndex到_move时i已加加到1，所以这里给i重新初始化。
			me.rolls[Index].run();
			var Index = me._getIndex();
			// console.log(Index);
			var setTime = me.config['time'] * 1000 + 1000;
			me.timer = setTimeout(function(){
//初始的开始Index不需要计算，是配置项，就是那后的Index会加1。
				me._move();
			},setTime)
		},
		stop : function() {
			this.config['stop'] == true && clearInterval(this.timer);		
		}
	})
	return Sroll;
}, {
	attach : false,
	requires : ["roll","sizzle"]
})

KISSY.add('roll', function(S) {
	D = S.DOM, E = S.Event;
	var defaultCfg = {
		'dir' : 'bottom',
		'time' : 1,
		'Easing' : 'easeOutStrong'
	}
	var me = this;
	function Roll(node,config) {
		if(!(this instanceof Roll)) {
			return new Roll();
		}
		this.box = S.one(node);
		this.config = S.merge(defaultCfg, config);
		this.init();
	}

	S.augment(Roll, {
		init : function() {
			this.scroll = this.box.children();//ul
			this.scrollItem = this.scroll.children();//li
			this.scrollTop = this.scrollItem.height();//单个高度
			this.scrollLeft = this.scrollItem.width();//单个宽度
			this.scrollTops = this.scrollTop*this.scrollItem.length;//总高度
			this.scrollLefts = this.scrollLeft*this.scrollItem.length;//总宽度
			this._build();
			this.onhover();
		},
		_build : function() {
			S.all(D.get(this.scroll).innerHTML).appendTo(this.scroll);
			if(this.config['dir']== 'bottom'){
				D.css(this.scroll, 'top', -this.scrollTops);
			}else if(this.config['dir'] == 'top'){
				D.css(this.scroll, 'top', 0);
			}else if(this.config['dir'] == 'left'){
				D.css(this.scroll,'width',this.scrollLefts*2);
				D.css(this.scroll, 'left', 0);
			}else if(this.config['dir'] == 'right'){
				D.css(this.scroll,'width',this.scrollLefts*2);
				D.css(this.scroll, 'left', -this.scrollLefts);
			}


		},
		run : function() {
			var me = this;
			var crollTop = parseInt(D.css(this.scroll, 'top'));
			var crollLeft = parseInt(D.css(this.scroll, 'left'));
			if(this.config['dir']== 'bottom'){
				var endTop = crollTop + this.scrollTop;
			}else if(this.config['dir']== 'top'){
				var endTop = crollTop - this.scrollTop;
			}else if(this.config['dir']== 'left'){
				var endLeft = crollLeft - this.scrollLeft;
			}else if(this.config['dir']== 'right'){
				var endLeft = crollLeft + this.scrollLeft;
			}

			D.attr(this.scroll,'ifhover') == 0 && this.scroll.animate({
				top : endTop,
				left : endLeft
			}, {
				duration : me.config['time'],
				easing : me.config['Easing'],
				complete : function() {
					if(me.config['dir']== 'bottom'){
						endTop >= 0 && D.css(me.scroll, 'top', -me.scrollTops);
					}else if(me.config['dir'] == 'top')
					{
						endTop <= -me.scrollTops && D.css(me.scroll, 'top', 0);
					}else if(me.config['dir'] == 'left')
					{
						endLeft <= -me.scrollLefts && D.css(me.scroll, 'left', 0);
					}else if(me.config['dir'] == 'right')
					{
						endLeft >= 0 && D.css(me.scroll, 'left', -me.scrollLefts);
					}
				}
			})
		},
		onhover : function(){
			var me = this;
			E.on(me.scrollItem,'mouseenter mouseleave',function(ev){
				if(ev.type == 'mouseenter'){
					D.attr(me.scroll,'ifhover',1);
				}else{
					D.attr(me.scroll,'ifhover',0);
				}
			})
		}
	})
	return Roll;
}, {
	attach : false
})
