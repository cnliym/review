//事件中心
KISSY.add('eventCenter',function(S){
	return S.mix({},S.EventTarget);
},{attach:false,requires:[]});

(function(S,D,$,E){

	//掉落的砖块对象模块
	S.add('tetris/drop',function(S,EventCenter){
		/**
		 * 掉落的砖块对象
		 * @param {Tetris} tetris Drop作用于哪个Tetris
		 * @param {Object} config 配值参数
		 */
		function Drop(tetris,config){
		    if (!(this instanceof arguments.callee)) {
		        return new arguments.callee(config);
		    };
			this.distributed=config.distributed;
			this.cls=config.cls;
			this.turn=config.turn;
			this.tetris=tetris;
		}
		S.augment(Drop,{
			/**
			 * 砖块初始化
			 * @param {Array} grid 传入参数，表示Drop在哪个网格上走
			 * @param {Number} row 砖块轴心在网格上的横坐标
			 * @param {Number} col 砖块轴心在网格上的纵坐标	
			 */
			init:function(grid,row,col){
				var self = this;
				self.position=[];
				S.each(self.distributed,function(o,i){
					var postion=[o[0]+row,o[1]+col];
					self.position.push(postion);
				});
				self.axis=[row,col];
				self.render(self.position,grid);
			},
			/**
			 * 砖块移动
			 * @param {String} direct 移动方向		
			 */
			move:function(direct){
				var self = this;
				var prePosition=[],preAxis=[];

				switch(direct){
					case "left":								
						S.each(self.position,function(o,i){
							var p=[];
							p[0]=o[0];
							p[1]=o[1]-1;
							prePosition.push(p);
						});
						preAxis[0]=self.axis[0];
						preAxis[1]=self.axis[1]-1;
						break;
					case "right":								
						S.each(self.position,function(o,i){
							var p=[];
							p[0]=o[0];
							p[1]=o[1]+1;
							prePosition.push(p);
						});
						preAxis[0]=self.axis[0];
						preAxis[1]=self.axis[1]+1;
						break;
					case "top":								
						S.each(self.position,function(o,i){
							var p=[];
							p[0]=o[0]-1;
							p[1]=o[1];
							prePosition.push(p);
						});
						preAxis[0]=self.axis[0]-1;
						preAxis[1]=self.axis[1];
						break;
					default:								
						S.each(self.position,function(o,i){
							var p=[];
							p[0]=o[0]+1;
							p[1]=o[1];
							prePosition.push(p);
						});
						preAxis[0]=self.axis[0]+1;
						preAxis[1]=self.axis[1];
						break;
				}

				var isMove = self.tetris.checkMove(prePosition) ;
				if(isMove){
					self.clear(self.position);
					self.position=prePosition;
					self.axis=preAxis;
					self.render(self.position);
				}else{
					if(!direct||direct==="bottom"){
						self.tetris.processFirm(self['position']);
					}
				}
			},
			clear:function(position){
				var self = this;
				position=position||self.position;
				S.each(position,function(o,i){
					if(self.tetris.checkBlock(o[0],o[1])&&o[0]>=0){
						self.tetris.grid[o[0]][o[1]].changeCls("");
					}
				})
			},
			/**
			 * 渲染砖块到格子上
			 */
			render:function(position,grid){
				var self = this;
				position=position||self.position;
				grid=grid||self.tetris.grid;
				S.each(position,function(o,i){
					if(self.tetris.checkBlock(o[0],o[1])&&o[0]>=0){
						grid[o[0]][o[1]].changeCls(self.cls);
					}
				})
			},
			/**
			 * 砖块旋转			
			 */
			rotate:function(){
				var self = this;
				self.turnDirect=self.turnDirect||"right";
				if(self.turn==0){
					return;
				}else if(self.turn==2){
					self._rotate(self.turnDirect);
					self.turnDirect=self.turnDirect==="right"?"left":"right";
				}else{
					self._rotate("right");
				}
			},
			_rotate:function(direct){
				var self = this;
				var position=self.position;
				var prePosition=[];
				var axis=self.axis;
				if(direct==="right"){
					S.each(self.position,function(o,i){
						var p=[];
						p[0]=axis[0]+(axis[1]-o[1]);
						p[1]=axis[1]-(axis[0]-o[0]);
						prePosition.push(p);
					});
				}else{
					S.each(self.position,function(o,i){
						var p=[];
						p[0]=axis[0]-(axis[1]-o[1]);
						p[1]=axis[1]+(axis[0]-o[0]);
						prePosition.push(p);
					});
				}
				var isMove = self.tetris.checkMove(prePosition) ;				   
				if(isMove){
					self.clear(self.position)
					self.position=prePosition;
					self.render(self.position);
				}
			}
		})
	
		return Drop;
	},{attach:false,requires:['eventCenter']});

	
	S.add('tetris/block',function(S,EventCenter){
		/**
		 * 格子对象
		 * @param {Number} row 行坐标		
		 * @param {Number} col 列坐标	
		 */
		function Block(row,col){
		    if (!(this instanceof arguments.callee)) {
		        return new arguments.callee(row,col);
		    };
			this.init(row,col);
		}
		S.augment(Block,{
			init:function(row,col){
				var self = this;
				self.row=row;
				self.col=col;
				self.isFirm=false;
				self.cls="";
				self._render();
			},
			_render:function(){
				var self = this;
				self.Node=$(D.create("<span>\u56E7</span>"));
			},
			changeCls:function(cls){
				var self = this;
				self.Node.replaceClass(self.cls,cls);
				self.cls=cls
			},
			reset:function(){
				var self = this;
				self.changeCls("");
				self.firm=false;
			}
		})
	
		return Block;
	},{attach:false,requires:['eventCenter']});

	//俄罗斯方块类模块
	S.add('tetris',function(S,EventCenter,Block,Drop,database){
		var defaultCfg={
			row:20,	//主游戏区的行数
			col:10, //主游戏区的列数
			viewGrid:{
				row:4,	//预览的行数
				col:4 	//预览的列数
			},
			infoBox:".gameinfo",	
			msgBox:".msgbox",		
			keyboardCfg:{
				morph:38,	//键盘配置--旋转
				down: 40,	//键盘配置--向下走
				right: 39,	//键盘配置--向右走
				left: 37,	//键盘配置--向左走
				drop: 32 	//键盘配置--加速向下
			},
			attack:false
		};
		/**
		 * 游戏对象
		 * @param {String} el 容器
		 * @param {Object} config 配置	
		 */
		function Tetris(el,config){
		    if (!(this instanceof arguments.callee)) {
		        return new arguments.callee(el,config);
		    };
			this.init(el,config);
		}
		S.augment(Tetris,{
			init:function(el,config){
				var self = this;
				self.opt = S.merge(defaultCfg, config || {});
				self.el=$(el);
				self.gameinfo = S.one(self.opt.infoBox)
				self.viewGridEl=self.gameinfo.one(".next");
				self.msgbox =  S.one(self.opt.msgBox)
				self.grid=[];
				self.viewGrid=[];
				self.drop={};
				self.viewDrop={};
				self.preAddLine=0;
				self.statsVal={
					"score": 0,
					"line" : 0,
					"level": 1
				}
				self.Xscore = self.gameinfo.one('.J_score');
				self.Xline  = self.gameinfo.one('.J_line');
				self.Xlevel = self.gameinfo.one('.J_level');

				self._createGrid(self.el,self.opt.row,self.opt.col,self.grid);
				self._createGrid(self.viewGridEl,self.opt.viewGrid['row'],self.opt.viewGrid['col'],self.viewGrid);
				self._bindEvent();
			},
			/**
			 * 创建格子表		
			 */
			_createGrid:function(el,row,col,grid){
				var self = this;
				var i=0;
				el.empty();
				for(;i<row;i++){
					grid[i]=[];
					var j=0;
					for(;j<col;j++){
						grid[i][j]=new Block(i,j);
						grid[i][j].Node.appendTo(el);
					}
				}
			},
			/**
			 * 绑定事件		
			 */
			_bindEvent:function(){
				var self = this;
				//进攻事件
				EventCenter.on("tetris/attack",function(ev){
					if(ev.attacker!==self&&self.run){
						self.addLine(ev.power);
						self.msgfn("\u654C\u519B\u6765\u88AD\uFF01");
					}else{
						self.msgfn("\u8FDB\u653B\uFF01")
					}
				});

				//游戏结束
				EventCenter.on("tetris/gameover",function(ev){
					if(ev.tetris!==self){
						self.msgbox.html('WIN').removeClass('hidenone');
						self.end();
						return false;
					}
					return true;
				})
			},
			changeLevel:function(level){
				var self=this;
				self.level=level;
				self._autoFall();
			},
			/**
			 * 显示提示信息
			 */
			msgfn:function(msg){
				var self = this;
				clearTimeout(self.msgtime)
				self.msgbox.html(msg).removeClass("hidenone");
				self.msgtime = setTimeout(function(){
					self.msgbox.html("").addClass("hidenone");
				}, 800);
			},
			/**
			 * 出现下一个砖块
			 */
			next:function(){
				var self = this;
				self.drop = self.viewDrop;				
				self.drop.init(self.grid,0,5);				
				self._autoFall();
				self.resetViewGrid();
				self.viewDrop = self.creatDrop(self.viewGrid,1,2);
			},
			/**
			 * 游戏开始
			 */
			start:function(level){
				var self = this;
				self.drop=self.creatDrop(self.grid,0,5);
				self.viewDrop=self.creatDrop(self.viewGrid,1,2);
				self.keyboard(self.opt.keyboardCfg);
				self.started=true;
				self.run=true;
				self.level=level||self.level||1;
				self._autoFall();
				self.gameinfo.one('.J_keyboardbox').addClass('hidenone');
				self.gameinfo.one('.J_nextbox').removeClass('hidenone');
			},
			/**
			 * 游戏结束
			 */
			end:function(){
				var self = this;
				self.run=false;
				clearInterval(self.timer);
				clearInterval(self.mprphtime);
				clearTimeout(self.msgtime);
				self.detachKeyboard();
			},
			/**
			 * 重置背景格子
			 */
			reset:function(){
				var self = this;
				var i=0,row=self.opt.row,col=self.opt.col;
				for(;i<row;i++){
					var j=0;
					for(;j<col;j++){
						self.grid[i][j].reset();
					}
				}
				self.statsVal={
					"score": 0,
					"line" : 0,
					"level": 1
				}
				self.Xscore.html(self.statsVal.score);
				self.Xline.html(self.statsVal.line);
				self.Xlevel.html(self.statsVal.level);
				self.msgbox.html("").addClass("hidenone");
				var pause = S.one('.J_pause');
				var continuance = S.one('.J_continuance');
				pause.removeClass("hidenone");
				continuance.addClass("hidenone");

			},
			/**
			 * 重置"预览图"背景格子
			 */
			resetViewGrid:function(){
				var self = this;
				var i=0,row=self.opt.viewGrid['row'],col=self.opt.viewGrid['col'];
				for(;i<row;i++){
					var j=0;
					for(;j<col;j++){
						self.viewGrid[i][j].reset();
					}
				}
			},
			/**
			 * 游戏暂停
			 */
			pause:function(){
				var self = this;
				if(!self.run){
					self.run=true;
					self._autoFall();
				}else{
					self.run=false;
					clearInterval(self.timer);
					clearInterval(self.mprphtime);
					clearTimeout(self.msgtime);
				}
			},
			/**
			 * 砖块自动下落
			 */
			_autoFall:function(){
				var self=this,time;
				clearInterval(self.timer);
				S.use("database",function(S,database){
					time=database['level'][self.level];
					self.timer=setInterval(function(){
						self.drop.move("bottom");
					},time)
				})
			},
			/**
			 * 创建砖块
			 */
			creatDrop:function(grid,row,col){
				var self=this,drop;
				var rand=parseInt(database['shape'].length*Math.random());
				drop=new Drop(self,database['shape'][rand]);
				drop.init(grid,row,col);
				return drop;
			},
			/*
			 * 固定砖块处理
			 */
			processFirm:function(position){
				var self=this;
				position=position||self.drop.position;
				if(self.firmDrop(position)!==false){
					var rows = self.removeLine();
					if(rows > 0){
						self.stats(rows);
					}
					self.attack(rows);
					self.next();
				}else{
					self.gameover();
				}

				//清落下
				clearInterval(self.mprphtime);

			},
			/**
			 * 结果:计算分数，计算消除的行数，计算等级
			 */
			stats: function(row){
				var self = this, isScore = 0;
				var row = Number(row);
				var oldscore = Number(self.statsVal.score),
					oldline  = Number(self.statsVal.line),
					oldlevel = Number(self.statsVal.level);

				self.statsVal.score = (row * row) + oldscore;
				self.statsVal.line = row + oldline;
				self.Xscore.html(self.statsVal.score);
				self.Xline.html(self.statsVal.line);

				if(self.statsVal.score >= oldlevel * 50  && oldlevel < database['level'].maxlevel){
					self.statsVal.level = 1 + oldlevel;
					self.Xlevel.html(self.statsVal.level);
					self.msgfn("LEVEL UP");
					self.changeLevel(self.statsVal.level);
				}
			},
			/**
			 * 触发“突袭”事件
			 */
			attack:function(rows){
				var self = this;
				if(self.opt.attack){
					if(rows>=2){
						EventCenter.fire("tetris/attack",{"attacker":self,"power":rows-1});
					}
				}
			},
			/**
			 * 绑定键盘事件
			 */
			keyboard: function(config){
				var self=this;
				var operate = config;
				var keyDirect="",fire=false;
				//直接落下
				function mprphfn(){
					clearInterval(self.mprphtime);
					self.mprphtime = setInterval(function(){
						self.drop.move();
					},15)
				};
				//连续移动
				function continuousMove(direct){
					if(direct!==keyDirect){
						keyDirect=direct;
						fire=false;
						clearInterval(self.continuousMove);
						self.continuousMove = setInterval(function(){
							self.drop.move(direct);
							fire=true;
						},100)
					}
				}
				//停止移动
				function stopMove(direct){
					if(!fire){
						self.drop.move(direct);
					}
					keyDirect="";
					clearInterval(self.continuousMove);
				}

				self.keydownBind=function(ev){
					if(self.run){
						switch(ev.keyCode){
							case operate.drop:								
								mprphfn();
								ev.preventDefault();
								break;
							case operate.morph:								
								self.drop.rotate();
								ev.preventDefault();
								break;
							case operate.left:								
								continuousMove('left');
								ev.preventDefault();
								break;
							case operate.right:								
								continuousMove('right');
								ev.preventDefault();
								break;
							case operate.down:								
								continuousMove('down');
								ev.preventDefault();
								break;
						}
					}
				};
				self.keyupBind=function(ev){
					if(self.run){
						switch(ev.keyCode){
							case operate.left:								
								stopMove('left');
								ev.preventDefault();
								break;
							case operate.right:								
								stopMove('right');
								ev.preventDefault();
								break;
							case operate.down:								
								stopMove('down');
								ev.preventDefault();
								break;
						}
					}
				};

				S.one('body').on('keydown',self.keydownBind);
				S.one('body').on('keyup',self.keyupBind);
			},
			/**
			 * 解雇键盘事件
			 */
			detachKeyboard:function(){
				var self=this;
				S.one('body').detach('keydown',self.keydownBind);
				S.one('body').detach('keydown',self.keyupBind);
			},
			/**
			 * 检测下个位置是否可以移动
			 */
			checkMove:function(position){
				var self = this, flag = true;
				S.each(position,function(v,k){
					flag=self.checkBlock(v[0],v[1])===false?false:flag;
				})	
				return flag;
			},
			/**
			 * 检测是否碰撞
			 */
			checkBlock:function(row,col){
				var self = this;
				//检测边界
				if( row >= self.opt.row ||col < 0 || col >= self.opt.col){
					return false;
				}					
				else if(self.grid[row]&&self.grid[row][col].firm){	
					//检测是否有固定的格子							
					return false;
				}else{
					return true;
				}

			},
			/**
			 * 固定砖块
			 */	
			firmDrop : function(position){
				var self = this;
				position=position||self.drop.position;
				var overflow=false;
				S.each(position,function(v,k){
					if(self.firmBlock(v[0],v[1])===false){
						overflow=true;
					}
				});	
				return !overflow;
			},
			/**
			 * 固定砖块中的格子
			 */	
			firmBlock : function(row,col){
				var self = this;
				if(self.grid[row]){
					self.grid[row][col].firm = true;		
					// self.grid[row][col].changeCls("black");
					return true;
				}else{
					return false;
				}
			},
			/*
			 * 游戏结束
			 */
			gameover:function(){
				var self = this;
				if(EventCenter.fire("tetris/gameover",{"tetris":self})){
					self.msgbox.html('GAMEOVER').removeClass('hidenone');
				}else{
					self.msgbox.html('LOSE').removeClass('hidenone');
				}
				self.end();
			},
			/**
			 * 消除满行
			 */
			removeLine : function(){
				var self = this;			
				var arr = [], x = 0, removeLineNum = 0;
				var row = self.opt.row, col = self.opt.col;
				for(var i = row -1; i >= 0;i--){
					arr[x] = [];
					var firmNum = 0, y = 0;					
					for(var j = 0; j < col; j++){
						if(self.grid[i][j].firm ){
							firmNum ++;
							arr[x][y] = {firm:true, cls:self.grid[i][j].cls};
						}else{							
							arr[x][y] = {firm:false, cls:""};
						}
						y++;
					}					
					if(firmNum == self.opt.col){
						//如果是满行，满行数+1, x不加1,抛弃这一行	
						removeLineNum++;
					}else{
						//如果不满行,复制下一行
						x++;
					}			
				}		
				if(removeLineNum >0){
					x = 0;
					for(var i = row -1; i >= 0; i--){	
						var y = 0;							
						for(var j = 0; j < col; j++){
							self.grid[i][j].changeCls("");
							//如果这一格存在，并且有色
							if(arr[x] && arr[x][y] && arr[x][y].firm){		
								//console.log("x"+x,"y"+y);
								self.grid[i][j].changeCls(arr[x][y].cls);
								self.firmBlock(i,j)
								
							}else{
								self.grid[i][j].firm = false;
							}		
							y++;			
						}	
						x++;				
					}	
				}	
				
				return removeLineNum;				
			},
			/**
			 * 增加“突袭”行
			 */
			addLine:function(num){
				var self = this;
				num=num||self.preAddLine;
				if (num<=0){
					return;
				}		
				var arr = [], x = 0;
				var row = self.opt.row, col = self.opt.col;
				for(var j = 0; j <num;j++){
					var arr2=[];
					for(var ii=0;ii<col;ii++){
						arr2.push(ii);
					}
					var arr3=ArrRandom(arr2);
					var rand1=arr3[0],rand2=arr3[1],rand3=arr3[2];
					S.log(rand1+","+rand2+","+rand3)
					arr[x]=[];
					var y = 0;					
					for(var k = 0; k < col; k++){
						var rand=parseInt(database['shape'].length*Math.random());
						if((y!=rand1)&&(y!=rand2)&&(y!=rand3)){
							arr[x][y] = {firm:true, cls:database['shape'][rand]['cls']};
						}else{
							arr[x][y] = {firm:false, cls:""};
						}
						y++;
					}
					x++;
				};
				for(var i = row -1; i >= 0;i--){
					arr[x] = [];
					var y = 0;					
					for(var j = 0; j < col; j++){
						arr[x][y] = {firm:self.grid[i][j].firm, cls:self.grid[i][j].cls};
						y++;
					}
					x++;
				};
				x = 0;
				for(var i = row -1; i >= 0; i--){	
					var y = 0;							
					for(var j = 0; j < col; j++){
						// self.grid[i][j].changeCls("");
						//如果这一格存在
						if(arr[x] && arr[x][y]){		
							
							self.grid[i][j].firm = arr[x][y].firm;
							self.grid[i][j].changeCls(arr[x][y].cls);
						}	
						y++;			
					}	
					x++;				
				}	

				var prePosition=[];
				S.each(self.drop.position,function(o,i){
					var p=[];
					p[0]=o[0]-num;
					p[1]=o[1];
					prePosition.push(p);
				});
				self.drop.position=prePosition
				self.drop.axis[0]=self.drop.axis[0]-num;
				self.drop.axis[1]=self.drop.axis[1];


				function ArrRandom(arr){
				    var temp=[];
				    var i=0;
				    var len=arr.length;
				    for(i;i<len;i++){
				        temp.push(arr.splice(parseInt(arr.length * Math.random()),1)[0]);
				    }
				    return temp;
				}
			}
		})
	
		return Tetris;
	},{attach:false,requires:['eventCenter','tetris/block','tetris/drop',"database"]});
	
	S.add('gameControl',function(S,EventCenter,Tetris){
		var defaultCfg={
			start:".J_play",
			pause:".J_pause",
			continuance:".J_continuance"
		};
		/**
		 * 游戏控制对象
		 */
		function GameControl(tetris,config){
		    if (!(this instanceof arguments.callee)) {
		        return new arguments.callee(tetris,config);
		    };
			this.init(tetris,config);
		}
		S.augment(GameControl,{
			init:function(tetris,config){
				var self = this;
				self.opt = S.merge(defaultCfg, config || {});
				self.startKey=$(self.opt.start);
				self.pauseKey=$(self.opt.pause);
				self.continueKey=$(self.opt.continuance);
				self.bindTetris(tetris);
			},
			bindTetris:function(tetris){
				var self = this;
				//游戏开始
				self.startKey.on('click',function(ev){
					self.msg=false;
					if(S.isArray(tetris)){
						S.each(tetris,function(t,i){
							self._startTetris(t);
						});
					}else{
						self._startTetris(tetris);
					}
					
				})
				
				//暂停
				self.pauseKey.on('click',function(ev){
					if(S.isArray(tetris)){
						S.each(tetris,function(t,i){
							self._pauseTetris(t);
						});
					}else{
						self._pauseTetris(tetris);
					}
					
				})

				//继续
				self.continueKey.on('click',function(ev){
					if(S.isArray(tetris)){
						S.each(tetris,function(t,i){
							self._continueTetris(t);
						});
					}else{
						self._continueTetris(tetris);
					}
					
				})

			},
			_startTetris:function(tetris){
				var self = this;
				if(!tetris.started){
					tetris.start(tetris.statsVal["level"]);
				}else{
					self.msg=self.msg || window.confirm("\u786E\u5B9A\u5F00\u59CB\u65B0\u6E38\u620F\u5417\uFF1F");
					if (!self.msg){ 
						return false;
					}else{
						tetris.end();
						tetris.reset();
						tetris.resetViewGrid();
						tetris.start(tetris.statsVal["level"]);
					}
				}
			},
			_pauseTetris:function(tetris){
				var self = this;
				if(tetris.run){
					tetris.pause();
					self.pauseKey.addClass('hidenone');
					self.continueKey.removeClass('hidenone');
					tetris.msgbox.html("\u6682\u505C\u4E2D...").removeClass("hidenone");
				}
			},
			_continueTetris:function(tetris){
				var self = this;
				tetris.pause();
				self.continueKey.addClass('hidenone');
				self.pauseKey.removeClass('hidenone');
				tetris.msgbox.html("").addClass("hidenone");
			}
		})
	
		return GameControl;
	},{attach:false,requires:['eventCenter',"tetris"]});

	//数据库
	S.add('database',function(S){
		return {
			shape:[
				{
					"distributed":[[0,0],[0,-1],[1,-1],[1,0]],
					"cls":"brown",
					"turn": 0
				},
				{
					"distributed":[[0,0],[0,-1],[-1,0],[1,0]],
					"cls":"red",
					"turn": 4
				},
				{
					"distributed":[[0,0],[-1,0],[1,0],[2,0]],
					"cls":"blue",
					"turn": 2
				},
				{
					"distributed":[[0,0],[-1,0],[-1,-1],[1,0]],
					"cls":"yellow",
					"turn": 4
				},
				{
					"distributed":[[0,0],[1,-1],[-1,0],[1,0]],
					"cls":"green",
					"turn": 4
				},
				{
					"distributed":[[0,0],[0,-1],[-1,-1],[1,0]],
					"cls":"purple",
					"turn": 2
				},
				{
					"distributed":[[0,0],[0,-1],[-1,0],[1,-1]],
					"cls":"orange",
					"turn": 2
				}
			],
			level:{
				"1":600,
				"2":300,
				"3":150,
				"4":75,
				"maxlevel": 4
			}
		}
	})

	

}(KISSY,KISSY.DOM,KISSY.all,KISSY.Event))
