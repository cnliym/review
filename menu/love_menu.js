KISSY.add("home/lovemenu", function(S,dbSource,Template) {
	var $ = S.all, D = S.DOM, E = S.Event;
	var timer,
		Brand_Top = $("#J_BrandCatSidebar").offset().top,  
  		Brand_Left = $("#J_BrandCatSidebar").offset().left;
		
	var cfgMenu = {		
		"tmpl":"#J_Tmpl_LoveMenu1",	//模板id
		"parentId":"0",	//父节点id
		"level":1	//第几级菜单		
	};
	
	function LoveMenu(box,config){
		this.box = $(box);	
		this.config = S.merge(cfgMenu, config);	
		
		this.menuId = "menu_" + this.config.level + "_" + this.config.parentId;	//自身的id
		this.isActive = 0; //是否激活
		this.myEle = null;	//自身的DOM节点
		this.menuItems = []; //菜单项有哪些
		this._init();
	}		
  
	S.augment(LoveMenu,{
		 /**
		 * 组件初始化
		 */
		_init:function(){			
			/* 执行步骤
			 * 1.构建自身 ,渲染到页面
			 * 2.加载数据项
			 * 3.创建菜单项	
			 * 4.绑定事件
			 */			
			this._renderHtml();
			this._setActive(0);	//设置激活状态			
			var data = this._loadData(this.config.parentId);
			this.addMenuItem(data);
			this._bindEvent();
		
		},
		/*
		 * 1.构建DOM,渲染到页面
		 */
		_renderHtml:function(){
			var self = this;			
			var tm = S.one(self.config.tmpl);
			if(tm){
				var html = Template(tm.html()).render({
						menuId: self.menuId, 
						parentId: self.config.parentId,
						level:self.config.level
					});
				self.box.append(html);	
				self.myEle = $("#"+ self.menuId);				
			}	
		},	
		/*
		 * 获取数据(此处假设ajax请求在dbSource类中已实现)
		 */
		_loadData:function(proId){
			return dbSource.getChildren(proId);				
		},
		/*
		 * 添加菜单项
		 */
		addMenuItem : function(data){			
			var self = this;						
			if(data.length < 1 ) return;	
			var itemBox = $("#" + self.menuId);
			
			//加载子菜单	
			var sub = self.config.level;
			if(sub > 1){sub = 2;}
					
			//创建菜单项			
			S.each(data,function(v,k){	
				var item = 	new MenuItem(itemBox,{					
					"tmpl":"#J_Tmpl_LoveMenuItem" + sub,						
					"data" : {
						"title": v.name,	//显示的标题
						"value": v.id,		//菜单值  对应id
						"url" : v.url,	//链接	
						"isLeave":v.isLeave //是否是叶子节点
					}
				});	
				self.menuItems.push( item );
			})	
		},		
		/*
		 * 4.绑定事件
		 */
		_bindEvent:function(){
			var self = this;	
			E.on(self.box, 'mouseenter',function(ev){				
				self._setActive(1);				
				
				setTimeout(function(){
					//显示子菜单
					var childMenu = $("#J_BcsMenu" + (self.config.level + 1));
					//self._childShow(childMenu);
					childMenu.show();
					
					//显示子菜单，同时保证自己是打开状态
					self.box.show();
				},300);	
				
				
				/*父高亮*/
				function lightParent(p){				
			  		if(p < 1)	return;	
			  		var lis = $("#J_BcsMenu" + p).all(".last-flag");
			  		lis.addClass("hover");	
			  	}				  			  		
			  	lightParent(self.config.level - 1);		
		
			});
			
			E.on(self.box, 'mouseleave', function(ev){					
				setTimeout(function(){
					var childMenu = $("#J_BcsMenu" + (self.config.level + 1));
						
					//如果子节点是激活状态:自己也是激活状态，不关闭
					if(childMenu.attr("isactive") == "1"){
						self._setActive(1);	
					}else{
						//如果子节点不是激活状态:自己关闭，取消激活						
						self._setActive(0);	
						if(self.config.level < 2){
							//1级菜单，始终显示
							self.box.show();
						
						}else{
							self.box.hide();
						}
						childMenu.hide();
						
						//同時，同时关闭父节点						
						dg(self.config.level - 1);
						function dg(p){							
							if(p < 2) return;
							var pMenu = $("#J_BcsMenu" + p );
							pMenu.hide();	
							
							dg(p-1);
						}						
					}
				},300)				
								
			});
			
		},
		_childShow:function(childMenu){
			if(childMenu.children("ul").length > 0){
				childMenu.show();
			}
		},	
		/*
		 * 设置当前box是否处于激活状态
		 */
		_setActive: function(flag){
			this.isActive = flag;
			this.box.attr("isactive",flag);		
		}
	});
	
	
	var cfgMenuItem = {		
		"tmpl":"#J_Tmpl_LoveMenuItem1",	//子菜单的模板		
		"data" : {
			"title":"test",	//显示的标题
			"value":"4",	//菜单值  对应id
			"url" : "#", //链接
			"isLeave":true //是否是叶子节点
		}
	};
	
	function MenuItem(box, config){
		this.box = $(box);	
		this.config = S.merge(cfgMenuItem, config);				
		this._init();
	}	
	
  	S.augment(MenuItem, {  		
  		_init:function(){
			
			this.myEle = null;
			this.isLoadChild = false;	//是否加载过子节点
			this.menuItemId = "itemId_" + this.config.data.value;
			
			this._renderHtml();		
			this._bindEvent();  			
  				
  		},
		/*
		 * 渲染到页面
		 */
  		_renderHtml : function(){
  			var self = this;	
  					
			var tm = S.one(self.config.tmpl);
			if(tm){
				var html = Template(tm.html()).render({
						menuItemId: self.menuItemId, 
						item: self.config.data
					});
				self.box.append(html);
				self.myEle = $("#" + self.menuItemId);	
			}  			
  		},
		/*
		 * 绑定事件
		 */
  		_bindEvent : function(){
  			var self = this;
  			E.on(self.myEle,'mouseover mouseout', function(ev){
  				var targ = $(ev.currentTarget);
  				if(ev.type == 'mouseover'){
  					
  					// 1.添加hover样式
  					self.box.all(".J_AjaxHover").removeClass("hover");  					 
				    targ.addClass("hover");
				     
				    //2.给最后一项hover打标
				    self.box.parent().all(".J_AjaxHover").removeClass("last-flag");
					targ.addClass("last-flag");				 
				  	
			  	
					 //2.获取当子菜单位置
					 var position = self._getPosition(targ);
					 //console.log("top1:"+position.top);
					//console.log("top1:"+position.left);
					
					// 3.弹出子菜单
					timer = setTimeout(function(){
						self.popMenu(position);
					},300);
  					
  				}else{
  					targ.removeClass("hover");
  					timer && clearTimeout(timer);  					
  				}
  			});
  		}, 
		/*
		 * 弹出子菜单
		 *  @param {object} position 位置
		 */
  		popMenu : function(position){  			
  			var self = this;
  			var val = self.config.data.value,
  				level = parseInt(self.box.attr("data-level")) + 1,
				childBox = $("#J_BcsMenu" + level);  
					
			//是否有子节点
  			if(self.hasChild()){
  				//console.log("level:"+level);
  				//console.log("#menu_" + sub + "_"+ val);
				
				if(childBox.length>0){					
					var sub = level;
					if(sub > 1){
						sub = 2;
					}
					//是否加载过
					if(!self.isLoadChild){
						//如果没有加载过，创建新对象
						var tmpl = "#J_Tmpl_LoveMenu" + sub;
						var m = new LoveMenu(childBox,{
							"tmpl":tmpl,
							"parentId": val,
							"level": level											
						});					
	  					self.isLoadChild = true;  
	  				}	  				
					//如果加载过，直接显示子菜单										
					childBox.all("ul").hide();
					self._setPosition(childBox, position);
  					$("#menu_" + level + "_"+ val).show();
  					
  					//childBox.show(); 	
				}
  			}else{
  				if(childBox.length>0){
  					childBox.hide(); 
  				}
  			}			
  		},
		/**
		 * 是否是叶子节点		
		 * @return {boolen}
		 */
  		hasChild : function(){
  			return !this.config.data.isLeave;
  		},		
		/*
		 * 获取对象的位置	
		 * @param {object} obj 要获取置的对象
		 * @return {object} position 位置
		 */
  		_getPosition:function(obj){  						
			return {
				top:obj.offset().top - Brand_Top - 10,
				left:obj.offset().left - Brand_Left -20
			};
		},
		/*
		 * 设置对像的位置
		 */
		_setPosition:function(obj,pos){		
			//left":pos.left	抱歉，暂时没实现		
			obj.css({"top":pos.top});
		}
  	});
		
  	return LoveMenu;
  	
},{
  attach : false,
  requires:['dbSource','template']
})

