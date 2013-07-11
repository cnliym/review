/**
 * User: wb-zhouxiaohuan
 * Date: 13-7-11
 * Time: 下午1:44
 */

KISSY.add("imgmove",function(S){
    function run(container,config){
        var defalutCfg = {
            "spacing": 50,      //设置移动对象超出父容器多少间距才开始注册移动事件
            "iscenter": true    //初始化是否居中—— true/false
        };
        var cfg = S.merge(defalutCfg,config);
        S.all(container).each(function(item){
            new imgmove(S.one(item),cfg);
        })
    }
    function imgmove(item,config){
        this.cfg = config;
        this.ctn = item;                    //容器
        this.div = this.ctn.children();     //移动对象
        this.init();
    };
    S.augment(imgmove,{
        init: function(){           //初始
            var me = this;

            //父容器宽高度
            me.ctnH = me.ctn.height();  
            me.ctnW = me.ctn.width();   

            //移动对象的宽高
            me.divH = me.div.height(); 
            me.divW = me.div.width();

            //移动对象默认top、left值  
            me.top = 0;                           
            me.left = 0;

            me.initCenter();
            me.bind();
        },
        initCenter: function(){
            var me = this;
            if(!me.divH && !me.divW ){
                //加载完获取高度、宽度
                me.div.on('load',function(){
                    me.divH = me.div.height();
                    me.divW = me.div.width();
                    me.divcenter();
                })

            }else{
                me.divcenter();
            }
        },
        initMoveX:function(pagenum){
            var me = this;
            if(me.w > me.cfg.spacing){
                me.moveX(pagenum);
            }
        },
        initMoveY:function(pagenum){
            var me = this;
            if(me.h > me.cfg.spacing){
                me.moveY(pagenum);
            }
        },
        divcenter:function(){
            var me = this;

            //重新获取父容器与移动对象的差值
            me.h = me.divH - me.ctnH;     
            me.w = me.divW - me.ctnW;    

            //居中
            if(me.cfg.iscenter == true){
                me.top = -me.h / 2;
                me.left = -me.w / 2;
                me.div.css({
                    "margin-top": me.top + "px",
                    "margin-left": me.left + "px"
                });
            }
        },
        moveX: function(pagenum){
            var me = this, x, newnum, n = 1;
            var wgap = me.divW / me.ctnW;
            if(wgap >= 1){
                n = wgap;
            }

            //新位置
            x = pagenum - me.oldX || 0;
            newnum = me.left - x * n;
            if(newnum >= -me.w && newnum <= 0){
                me.left = newnum;
            }

            me.div.css({
                "margin-left": me.left + "px"
            });

            //更新值
            me.oldX = pagenum;
        },
        moveY: function(pagenum){
            var me = this, y, newnum, n = 1;
            var hgap = me.divH / me.ctnH;
            if( hgap >= 1){
                n = hgap;
            }

            //新位置
            y = pagenum - me.oldY || 0;
            newnum = me.top - y * n;
            if(newnum >= -me.h && newnum <= 0){
                me.top = newnum;
            }

            me.div.css({
                "margin-top": me.top + "px"
            });

            //更新值
            me.oldY = pagenum;
        },
        bind: function(){
            var me = this;
            me.ctn.on('mouseover',function(ev){
                me.oldY = ev.pageY;
                me.oldX = ev.pageX;
            });
            me.ctn.on('mousemove',function(ev){
                var pageY = ev.pageY, pageX = ev.pageX;
                me.initMoveX(pageX);
                me.initMoveY(pageY)
            });
        }

    })
    return run;
},{attach:false})
