(function(S,$,D,E) {
    /**
     * zmenu组件
     * @return {Function}             组件构造函数
     */
    KISSY.add('zmenu',function(S,_){
        var defaultCfg={
            dataSource:'http://fed.ued.taobao.net/u/zhouyun/demos/zmenu/test.php',//数据源,类型为字符串则为异步获取地址,类型为对象则为同步获取对象
            cache:true,//是否开启缓存
            mouseinDealy:300,//鼠标移入的触发延迟
            mouseoutDealy:100,//鼠标移出的触发延迟
            popupPosition:{//弹出菜单相对于菜单项的定位
                top:0,
                left:0
            },
            zIndex:1000,//弹出菜单的z轴层级
            maxRows:false,//弹出菜单单列最大行数,false就是不限
            onlyOneColOpen:true,//仅菜单单列触发展开
            maxLevel:3//最大弹出层级
        };
        /**
         * zmenu组件构造函数
         * @param {string} klass  菜单列表类名
         * @param {string} tpl    弹出菜单模板
         * @param {object} config 配置项
         */
        function Zmenu(klass,tpl,config){
            if (!(this instanceof arguments.callee)) {
                return new arguments.callee(klass,tpl,config);
            };
            var self=this;
            self.opt = S.merge(defaultCfg, config || {});
            self.klass=klass.replace(".","");//如果用户写了点号,去掉.
            self.tpl=tpl;
            self.opt.cache&&(self.cache={});//如果开启了cache则定义cache属性
            self._init();
        }
        S.augment(Zmenu,S.EventTarget,{
            /**
             * 组件初始化
             */
            _init:function(){
                var self = this;
                self._hoverBind();
                self._bindGetDataEvent(self._renderData);
            },
            /**
             * 绑定hover事件方法
             */
            _hoverBind:function(){
                var self = this;
                //绑定弹出菜单
                $("body").delegate("mouseenter mouseleave","."+self.klass,function(ev){
                    var targetBox=$(ev.currentTarget);    
                    var level=+targetBox.attr("data-level");
                    if(ev.type==="mouseenter"){
                        //如果不是根菜单,则向上传播事件
                        if(level>0){
                            self._hoverPropagate(true,targetBox);
                        }
                    }else{
                        //如果不是根菜单,则向上传播事件
                        if(level>0){
                            self._hoverPropagate(false,targetBox);
                        };

                    }
                });
                
                //绑定菜单项
                $("body").delegate("mouseenter mouseleave", "." + self.klass+ " .J_hoverList",function(ev){
                    var target=$(ev.currentTarget),
                    index=target.attr("data-index"),//菜单项序号
                    parentBox=target.parent("."+self.klass),//菜单项父级菜单
                    level=+parentBox.attr("data-level"),//菜单项所在层级
                    targetBox=$("."+self.klass+"[data-level='"+(level+1)+"']");//菜单项对应的下一级弹出菜单
                    if(ev.type==="mouseenter"){
                        target.addClass("menuItem_hover");
                        //如果不是叶子类目或者已经到了最大展开层数
                        if(target.attr("data-isLeaf")!=="true"&&level<self.opt.maxLevel-1){
                            //如果未配置多列不展开或只有一列  并且 下一级块不存在或者存在但是序号不等于移入项的序号
                            if(((!self.opt.onlyOneColOpen)||parentBox.all(".J_menuList").length===1)&&((targetBox.length===0)||(targetBox.attr("data-parentIndex")!==index))){
                                var catid=target.attr("data-value");
                                S.later(function(){
                                    if(catid&&target.hasClass("menuItem_hover")){
                                        self._fireGetDataEvent(catid,target);
                                    }
                                },self.opt.mouseinDealy);
                                
                            }
                        };
                    }else{
                        target.removeClass("menuItem_hover");
                        self._preRemovePop(target,targetBox);//预移除下一级弹出层
                    }   
                }); 
            },
            /**
             * 弹出层预移除方法
             * @param   {nodeList} target    弹出层对应的菜单项
             * @param   {nodeList} targetBox 弹出层对象
             * @param   {num} level     弹出层层级
             * @return  {undefined}
             * @private
             */
            _preRemovePop:function(target,targetBox){
                var self=this;
                S.later(function(){
                    //如果弹出菜单对应的项没被hover,且不是顶层菜单并且预移除标记为真,则移除该弹出菜单
                    if((!target.hasClass("menuItem_hover"))&&(+targetBox.attr("data-level")!==0)&&(targetBox.attr("data-preleave")!=="false")){
                        self._removePop(targetBox);//移除弹出菜单
                    }
                    
                },self.opt.mouseoutDealy);
            },
            /**
             * 移除弹出菜单
             * @param  {nodeList} targetBox 弹出菜单dom节点
             */
            _removePop:function(targetBox){
                var self=this;
                targetBox.remove();
            },
            /**
             * hover传递的实现
             * @param  {boolean} hover     鼠标进入/离开
             * @param  {nodeList} targetBox 触发的菜单栏
             */
            _hoverPropagate:function(hover,targetBox){
                var self= this,
                level=+targetBox.attr("data-level")-1,
                index=targetBox.attr("data-parentIndex"),
                parentBox=$("."+self.klass+"[data-level='"+level+"']"),
                target=parentBox.all(".J_hoverList[data-index='"+index+"']");
                if(hover){
                    targetBox.attr("data-preleave","false");//预移出标记,改回false
                    target.addClass("menuItem_active");
                }else{
                    targetBox.attr("data-preleave","true");//预移出标记,设为true
                    S.later(function() {
                        if(targetBox.attr("data-preleave")==="true"){//判断预移出标记
                            target.removeClass("menuItem_active");
                        }
                    },self.opt.mouseoutDealy);
                    self._preRemovePop(target,targetBox);//弹出层预移除方法
                };
                //如果还没到根菜单,继续往上冒泡(递归)
                if(level>0){
                    arguments.callee.call(self,hover,parentBox,index);
                }
            },
            /**
             * 触发获取数据事件
             * @param  {string} catid  分类id
             * @param  {nodeList} target 触发的菜单项dom
             * @return {[object]}        [self]
             */
            _fireGetDataEvent:function(catid,target){
                var self=this;
                //如果数据源是对象且能取到对应分类,则同步获取数据
                if(S.isObject(self.opt.dataSource)&&self.opt.dataSource[catid]){//如果数据源是对象且能取到对应分类,则同步获取数据

                    //事件回调函数返回false则停止获取数据.
                    if(self.fire("beforeGetData",{"_type":"synchronous","catid":self.opt.dataSource[catid],"_target":target})===false){
                        return self;
                    }
                    //加下划线的是内部事件
                    self.fire("_beforeGetData",{"_type":"synchronous","catid":self.opt.dataSource[catid],"_target":target});
                }else if(self.cache&&self.cache[catid]){//开启缓存且对应catid已被缓存
                    if(self.fire("beforeGetData",{"_type":"cache","catid":self.cache[catid],"_target":target})===false){
                        return self;
                    }
                    self.fire("_beforeGetData",{"_type":"cache","catid":self.cache[catid],"_target":target});
                }else{//异步获取数据
                    if(self.fire("beforeGetData",{"_type":"asynchronous","catid":catid,"_target":target})===false){
                        return self;
                    }
                    self.fire("_beforeGetData",{"_type":"asynchronous","catid":catid,"_target":target});
                }
            },
            /**
             * 绑定获取数据事件
             * @param  {Function} callback 回调函数
             */
            _bindGetDataEvent:function(callback){
                var self=this;
                self.on("_beforeGetData",function(ev){
                    if(ev._type==="asynchronous"){
                        self._getData(ev.catid,ev._target,callback);
                    }else{
                        callback&&callback.call(self,ev.catid,ev._target);
                    }
                })
            },
            /**
             * 异步获取数据方法
             * @param  {string} catid  分类id
             * @param  {nodeList} target 触发的菜单项dom
             * @param  {Function} callback 回调函数
             * @return {[type]}            [description]
             */
            _getData:function(catid,target,callback){
                var self=this;
                //查询对象
                var data={
                    "catid":catid
                    };
                
                S.io({
                    url:self.opt.dataSource,
                    data:data,
                    dataType: "jsonp",
                    cache:false,
                    success:function(data){
                        //如果返回数据的时候鼠标已经移出target了,...就不渲染了
                        if(target.hasClass("menuItem_hover")){
                            callback&&callback.call(self,data,target);//如果有回调函数,调用
                            self.cache&&(self.cache[catid]=data);//如果开启cache,保存进cache
                        };
                    },
                    error:function(err){
                        S.log(err);
                    }
                });
            },
            /**
             * 渲染弹出层事件
             * @param  {object} data   数据对象
             * @param  {nodeList} target 触发的菜单项dom
             */
            _renderData:function(data,target){
                var self=this,html = "",container = S.all('body');
                if(data.menus&&data.menus.length>0){
                    S.use("template", function(S, Template) {
                        var tpl = S.all(self.tpl).html();
                        var template = Template(tpl);

                        //补完数据对象
                        data.index=target.attr("data-index");
                        data.level=+target.parent("."+self.klass).attr("data-level")+1;
                        data.top=target.offset().top+self.opt.popupPosition.top;//弹出层的上偏移(相对菜单项顶部)
                        data.left=target.offset().left+self.opt.popupPosition.left+target.outerWidth();//弹出层的左偏移(相对菜单项右部)
                        data.zIndex=self.opt.zIndex;
                        data.klass=self.klass;//菜单栏的钩子样式
                        data.maxRows=self.opt.maxRows;//设置最大行数
                        html=template.render(data);//渲染模板
                        container.append(html);//插入容器
                        self.fire("afterPop",{"content":html,"data":data,"_target":target});//触发渲染后事件
                    });
                }
            }
        })
    
        return Zmenu;
    },{attach:false,requires:['sizzle']});

}(KISSY,KISSY.all,KISSY.DOM,KISSY.Event))
