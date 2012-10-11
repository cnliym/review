KISSY.add("home/lovemenu", function(S,dbSource,Template) {
	var $ = S.all, D = S.DOM, E = S.Event;
	var timer,
		Brand_Top = $("#J_BrandCatSidebar").offset().top,  
  		Brand_Left = $("#J_BrandCatSidebar").offset().left;
		
	var cfgMenu = {		
		"tmpl":"#J_Tmpl_LoveMenu1",	//ģ��id
		"parentId":"0",	//���ڵ�id
		"level":1	//�ڼ����˵�		
	};
	
	function LoveMenu(box,config){
		this.box = $(box);	
		this.config = S.merge(cfgMenu, config);	
		
		this.menuId = "menu_" + this.config.level + "_" + this.config.parentId;	//�����id
		this.isActive = 0; //�Ƿ񼤻�
		this.myEle = null;	//�����DOM�ڵ�
		this.menuItems = []; //�˵�������Щ
		this._init();
	}		
  
	S.augment(LoveMenu,{
		 /**
		 * �����ʼ��
		 */
		_init:function(){			
			/* ִ�в���
			 * 1.�������� ,��Ⱦ��ҳ��
			 * 2.����������
			 * 3.�����˵���	
			 * 4.���¼�
			 */			
			this._renderHtml();
			this._setActive(0);	//���ü���״̬			
			var data = this._loadData(this.config.parentId);
			this.addMenuItem(data);
			this._bindEvent();
		
		},
		/*
		 * 1.����DOM,��Ⱦ��ҳ��
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
		 * ��ȡ����(�˴�����ajax������dbSource������ʵ��)
		 */
		_loadData:function(proId){
			return dbSource.getChildren(proId);				
		},
		/*
		 * ��Ӳ˵���
		 */
		addMenuItem : function(data){			
			var self = this;						
			if(data.length < 1 ) return;	
			var itemBox = $("#" + self.menuId);
			
			//�����Ӳ˵�	
			var sub = self.config.level;
			if(sub > 1){sub = 2;}
					
			//�����˵���			
			S.each(data,function(v,k){	
				var item = 	new MenuItem(itemBox,{					
					"tmpl":"#J_Tmpl_LoveMenuItem" + sub,						
					"data" : {
						"title": v.name,	//��ʾ�ı���
						"value": v.id,		//�˵�ֵ  ��Ӧid
						"url" : v.url,	//����	
						"isLeave":v.isLeave //�Ƿ���Ҷ�ӽڵ�
					}
				});	
				self.menuItems.push( item );
			})	
		},		
		/*
		 * 4.���¼�
		 */
		_bindEvent:function(){
			var self = this;	
			E.on(self.box, 'mouseenter',function(ev){				
				self._setActive(1);				
				
				setTimeout(function(){
					//��ʾ�Ӳ˵�
					var childMenu = $("#J_BcsMenu" + (self.config.level + 1));
					//self._childShow(childMenu);
					childMenu.show();
					
					//��ʾ�Ӳ˵���ͬʱ��֤�Լ��Ǵ�״̬
					self.box.show();
				},300);	
				
				
				/*������*/
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
						
					//����ӽڵ��Ǽ���״̬:�Լ�Ҳ�Ǽ���״̬�����ر�
					if(childMenu.attr("isactive") == "1"){
						self._setActive(1);	
					}else{
						//����ӽڵ㲻�Ǽ���״̬:�Լ��رգ�ȡ������						
						self._setActive(0);	
						if(self.config.level < 2){
							//1���˵���ʼ����ʾ
							self.box.show();
						
						}else{
							self.box.hide();
						}
						childMenu.hide();
						
						//ͬ�r��ͬʱ�رո��ڵ�						
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
		 * ���õ�ǰbox�Ƿ��ڼ���״̬
		 */
		_setActive: function(flag){
			this.isActive = flag;
			this.box.attr("isactive",flag);		
		}
	});
	
	
	var cfgMenuItem = {		
		"tmpl":"#J_Tmpl_LoveMenuItem1",	//�Ӳ˵���ģ��		
		"data" : {
			"title":"test",	//��ʾ�ı���
			"value":"4",	//�˵�ֵ  ��Ӧid
			"url" : "#", //����
			"isLeave":true //�Ƿ���Ҷ�ӽڵ�
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
			this.isLoadChild = false;	//�Ƿ���ع��ӽڵ�
			this.menuItemId = "itemId_" + this.config.data.value;
			
			this._renderHtml();		
			this._bindEvent();  			
  				
  		},
		/*
		 * ��Ⱦ��ҳ��
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
		 * ���¼�
		 */
  		_bindEvent : function(){
  			var self = this;
  			E.on(self.myEle,'mouseover mouseout', function(ev){
  				var targ = $(ev.currentTarget);
  				if(ev.type == 'mouseover'){
  					
  					// 1.���hover��ʽ
  					self.box.all(".J_AjaxHover").removeClass("hover");  					 
				    targ.addClass("hover");
				     
				    //2.�����һ��hover���
				    self.box.parent().all(".J_AjaxHover").removeClass("last-flag");
					targ.addClass("last-flag");				 
				  	
			  	
					 //2.��ȡ���Ӳ˵�λ��
					 var position = self._getPosition(targ);
					 //console.log("top1:"+position.top);
					//console.log("top1:"+position.left);
					
					// 3.�����Ӳ˵�
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
		 * �����Ӳ˵�
		 *  @param {object} position λ��
		 */
  		popMenu : function(position){  			
  			var self = this;
  			var val = self.config.data.value,
  				level = parseInt(self.box.attr("data-level")) + 1,
				childBox = $("#J_BcsMenu" + level);  
					
			//�Ƿ����ӽڵ�
  			if(self.hasChild()){
  				//console.log("level:"+level);
  				//console.log("#menu_" + sub + "_"+ val);
				
				if(childBox.length>0){					
					var sub = level;
					if(sub > 1){
						sub = 2;
					}
					//�Ƿ���ع�
					if(!self.isLoadChild){
						//���û�м��ع��������¶���
						var tmpl = "#J_Tmpl_LoveMenu" + sub;
						var m = new LoveMenu(childBox,{
							"tmpl":tmpl,
							"parentId": val,
							"level": level											
						});					
	  					self.isLoadChild = true;  
	  				}	  				
					//������ع���ֱ����ʾ�Ӳ˵�										
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
		 * �Ƿ���Ҷ�ӽڵ�		
		 * @return {boolen}
		 */
  		hasChild : function(){
  			return !this.config.data.isLeave;
  		},		
		/*
		 * ��ȡ�����λ��	
		 * @param {object} obj Ҫ��ȡ�õĶ���
		 * @return {object} position λ��
		 */
  		_getPosition:function(obj){  						
			return {
				top:obj.offset().top - Brand_Top - 10,
				left:obj.offset().left - Brand_Left -20
			};
		},
		/*
		 * ���ö����λ��
		 */
		_setPosition:function(obj,pos){		
			//left":pos.left	��Ǹ����ʱûʵ��		
			obj.css({"top":pos.top});
		}
  	});
		
  	return LoveMenu;
  	
},{
  attach : false,
  requires:['dbSource','template']
})

