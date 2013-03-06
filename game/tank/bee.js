/**
 * @file bee.js
 * @brief js for bee
 * @author yeyongyi lwbing
 * @version 1.0
 * @date 2013-01-05
 * 在写这个的过程中遇到很多问题，对很多问题也一知半解，无法很好将一些设计思想融汇进去，虽然开始的时候拆分过，不过越写就越乱了
 */


//{{{坦克的渲染
/**
 * @brief 坦克的渲染 
 * @brief 这里只是一个坦克的对象 
 *
 * @Param "tank"
 */
KISSY.add("tank", function(S) { 
  var $ = S.all;
  function Tank(box,tank,config){

    this.fixs = S.merge(Tank.defalut,config ||{});			

    var play =''+ 
      '<div id="'+tank.replace("#","")+'" class="tank">'+
        '<span class="tk-blood">'+
          '<span class="J_bloodLess">'+ this.fixs.blood +'</span>/<span class="J_bloodTotle">'+ this.fixs.blood +'</span>'+
        '</span>'+
      '</div>';
    $(box).append(play);

 		this.box = $(box);	
 		this.tank = $(tank);	

    this.init();
  };
	Tank.defalut={
      autoplay  : false, //手动控制
      faceto  : "down", //朝向
      style  : "tk-greed",//默认坦克外观
      width  : 30,//默认坦克宽
      height : 30 ,//默认坦克高
      faceto  : "up",//默认坦克朝向
      x   : 0,//默认坦克位置
      y    : 0 ,
      blood : 1,//血量
      speed : 4,//移动速度 移动一次4 px
      bfrequency: 1000, //射击频率 ms
      stat : {
         "bspeed": 40, //子弹速度 ms
         "bsize" : 10, //子弹大小 px
         "attack": 1 //炮管数 预留
      },
      keycode : {
         "left": 37, //←键
         "right" : 39, //→键
         "fire": 38 //↑键
      }
  };
  S.augment(Tank,S.Event.Target,{
    init : function(){
      var self = this;
      self.setSite(self.fixs.x,self.fixs.y)
      self.tank.addClass(self.fixs.style+"-"+self.fixs.faceto)
    },
    move : function(x,y,cb){
//{{{坦克移动 仅控制外观移动
      var self = this;
      self.setSite(x,y,cb)
//}}}
    },
    setSite : function(x,y,cb){
//{{{写入坐标
      var self = this;
      //self.tank.animate(
      //  {
      //    "left":x,
      //    "top":y
      //  },
      //    {
      //      duration: 0.7,
      //      complete:function(){
      //        if(cb){
      //          cb()
      //        }
      //      }
      //    }
      //);
      self.tank.css("left",x);
      self.tank.css("top",y);
      self.left= x;
      self.top = y;
//}}}
    },
    destory : function(){
//{{{坦克销毁
      var self = this;
      self.tank.addClass("tk-destory"); 
      setTimeout(function(){
        self.tank.remove(); 
      },100)
//}}}
    },
    fire : function(k){
//{{{坦克射击
      var self = this;
      var b_l = self.left + self.fixs.width/2 - self.fixs.stat.bsize/4; //子弹的left值

      //看朝向判断子弹初始值
      if(self.fixs.faceto =="up"){
        var b_t = self.top - self.fixs.stat.bsize; 
      }else if(self.fixs.faceto =="down"){
        var b_t = self.top + self.fixs.height; 
      }

      var bullet = "<div class='bullet' id='J_B"+self.fixs.faceto +"_"+k+"' style='width:"+self.fixs.stat.bsize/2+"px; height:"+self.fixs.stat.bsize+"px; top:"+ b_t +"px; left:"+b_l+"px'></div>";
      self.box.append(bullet);//插入子弹

      var BULLET = $("#J_B"+k),
          i = 0;
      var bullet_obj = {
        b_node : self,
        b_left : b_l,
        b_top : b_t,
        b_size : self.fixs.stat.bsize,
        b_speed : self.fixs.stat.bspeed
      }
      return  bullet_obj;
//}}}
    }
  })
  return Tank;
},{
  attach : false,
  requires : ["sizzle"]
})
//}}}

//{{{场景的渲染
/**
 * @brief 场景的渲染
 *
 * @Param "bee"
 */
KISSY.add("bee", function(S,_,Tank) { 
  var $ = S.all;
  function Bee(container,config){
    this.fixs = S.merge(Bee.defalut,config ||{});			
 		this.box = $(container);	
    this.init();
  };
	Bee.defalut={
      lev    : 1, //默认等级1
      scene    : 1	//默认第一关
  };
  S.augment(Bee,S.Event.Target,{
    init : function(){
      var self = this;
      //保存场景的基础数据到对象中,脱离dom
      self.isKeyBind = false;
      self.width = parseInt(self.box.width()),
      self.height = parseInt(self.box.height())
    },
    addPlayer1 : function(tkName,tkConfig){
//{{{创建玩家1
      var self = this;
      self.isover = false;
      var tk1 = new Tank(self.box,tkName,tkConfig);
      //S.log(tk1)
      self.play1 = tk1;
      self.control(tk1)
//}}}
    },
    addPlayer2 : function(tkName,config){
//{{{创建玩家2
      var self = this;
      self.isover = false;
      if(typeof(config) == "number"){
        var tkConfig = self.AiLev(config)
        //记录当前等级
        self.nowLev = config;
      }else{
        var tkConfig = config
        //记录当前等级
        self.nowLev = 0;
      } 

      var tk2 = new Tank(self.box,tkName,tkConfig);
      self.play2 = tk2;
      if(tk2.fixs.autoplay){
        self.AiPlayer(tk2);
      }else{
        self.control(tk2)
      }
//}}}
    },
    AiLev : function(lv){
//{{{ai的等级系统
        var aiBase = {
          autoplay  : true, //是否为AI
          faceto  : "down", //手动控制
          width  : 30,//默认坦克宽
          height : 30 ,//默认坦克高
          x   : 135,//默认坦克位置
          y    : 0 //self.height - 30
        };
        var aiLev = {
          1 : {
                 style  : "tk-greed",//默认坦克外观
                 blood : 5,//血量
                 speed : 3,//移动速度 移动一次4 px
                 bfrequency: 1000, //射击频率 ms
                 stat : {
                    "bspeed": 60, //子弹速度 ms
                    "bsize" : 8 //子弹大小 px
                 }
          },
          2 : {
                 style  : "tk-red",//默认坦克外观
                 blood : 10,//血量
                 speed : 4,//移动速度 移动一次4 px
                 bfrequency: 900, //射击频率 ms
                 stat : {
                    "bspeed": 50, //子弹速度 ms
                    "bsize" : 10 //子弹大小 px
                 }
          },
          3 : {
                 style  : "tk-yellow",//默认坦克外观
                 blood : 15,//血量
                 speed : 5,//移动速度 移动一次4 px
                 bfrequency: 800, //射击频率 ms
                 stat : {
                    "bspeed": 40, //子弹速度 ms
                    "bsize" : 10 //子弹大小 px
                 }
          },
          4 : {
                 style  : "tk-gray",//默认坦克外观
                 blood : 18,//血量
                 speed : 7,//移动速度 移动一次4 px
                 bfrequency: 400, //射击频率 ms
                 stat : {
                    "bspeed": 40, //子弹速度 ms
                    "bsize" : 14 //子弹大小 px
                 }
          }
        }
        var aiLevMes = S.merge(aiBase,aiLev[lv] ||{});			
        return aiLevMes;
//}}}
    },
    AiPlayer : function(tk){
//{{{坦克的智能
      var self = this;
      var box_w = self.width,
          tk_w = tk.fixs.width,
          tk_y = tk.top,
          tk_speed = tk.fixs.speed,
          count = 0;

      var EnemyMove = function(){
        var lorr = parseInt(Math.random()*2); 
        var step = parseInt(Math.random()* 6 +6 );//随机移动几次，每次移动2px 
        var i = 0;
        var EnemyMoveOnce = function(){
          window.AiMove = setTimeout(function(){
            if(lorr =="0"){
              var tk_x = tk.left - 2;
              if(tk_x>0){ 
                tk.move(tk_x,tk_y);
              }
            }else{
              var tk_x = tk.left + 2;
              if((tk_x + tk_w) < box_w){ 
                tk.move(tk_x,tk_y);
              }
            }
  
            if(i!=step){
              i+=1;
              EnemyMoveOnce();
            }else{
              EnemyMove();
            }
          },300)
        }
        EnemyMoveOnce();
      }
      EnemyMove();

      //随机开火
      var EnemyFire = function(){
        var time = Math.random()*(3000-tk.fixs.bfrequency+1)+tk.fixs.bfrequency; 
        window.AiFire = setTimeout(function(){
          var buttle = tk.fire(count);
          self.bulletMove(count,buttle,tk);
          count +=1;
          EnemyFire();
        },time)
      }
      EnemyFire();
//}}}
    },
    GameOver : function(tk){
//{{{游戏结束
        var self = this,
        tips;
        if(!self.isover){
          if(tk.fixs.faceto =="up"){
            self.play1.destory();
            self.play1 = "";
            $("body").detach("keydown")

            var tips = ""+
              "<div class='tk-result'>you lost"+
                "<p><a href='#' class='J_playAgain' data-lev='"+self.nowLev+"'>再来一次</a></p>"+
              "</div>";
          }else{
            self.play2.destory();
            self.play2 = "";

            var tips = ""+
              "<div class='tk-result'>you win"+
                "<p><a href='#' class='J_playNext' data-lev='"+self.nowLev+"'>下一关</a></p>"+
              "</div>";
          }
          //停止ai的动作
          if(AiFire){
            clearTimeout(AiFire)
          }
          if(AiMove){
            clearTimeout(AiMove)
          }
          self.box.append(tips);
          self.isover = true;
        }
//}}}
    },
    GameReset : function(config){
//{{{重新开始游戏
      var self = this;
      $(".tk-result").remove();
      self.addPlayer1("#tank1",config);
      self.AiPlayer(self.play2)
      //坦克2,4级坦克
//}}}
    },
    control : function(tk){
//{{{控制器
      var self = this;
      var box_w = self.width,
          tk_w = tk.fixs.width,
          tk_y = tk.top,
          tk_speed = tk.fixs.speed,
          canFire = true,
          count = 0;
      var key_l = tk.fixs.keycode.left,
          key_r = tk.fixs.keycode.right,
          key_f = tk.fixs.keycode.fire

      $("body").on("keydown",function(evt){
        switch(evt.keyCode){
          case key_l:
            evt.halt();
            var tk_x = tk.left -tk_speed;
            if(tk_x>=0){ 
              tk.move(tk_x,tk_y);
              return false;
            }
            break
          case  key_r:
            evt.halt();
            var tk_x = tk.left + tk_speed;
            if((tk_x + tk_w) <= box_w){ 
              tk.move(tk_x,tk_y);
              return false;
            }
            break
          case key_f:
            evt.halt();
            if(canFire){
              canFire = false;
              S.log("fk:!!!")
              S.log(tk)
              var buttle = tk.fire(count);
              self.bulletMove(count,buttle,tk);
              count +=1;
              setTimeout(function(){
                canFire = true;
              },tk.fixs.bfrequency)
            }
            return false;
            break
        }
      })
//}}}
    },
    bulletMove : function(k,buttle,tk) {
//{{{子弹飞
      var self = this;
      var BULLET = $("#J_B"+tk.fixs.faceto+"_"+k),
          i = 0;
      //设置子弹移动
      var bulletFly = setInterval(function(){
        var top = buttle.b_top;
        if(top <0 || top > self.height){//超出场景
          S.log("清除子弹")
          //清除子弹移动，释放内存
          window.clearInterval(bulletFly);
          //移除子弹，释放内存
          BULLET.remove();
        }else{
          if(tk.fixs.faceto == "up"){
            var g_t = buttle.b_top - buttle.b_size; 
            var enemy_arr = self.play2;
          }else if(tk.fixs.faceto == "down"){
            var g_t = buttle.b_top + buttle.b_size; 
            var enemy_arr = self.play1;
          }

          /**
           * @brief 在这里需要检测子弹是否打中物体了
           *
           * @Param checkHit 返回值 true/false
           * @Param "self.play2"
           */
          if(self.checkHit(buttle,enemy_arr,tk)){//打中了
            S.log(enemy_arr.tank["0"].className +"被打中了")
            //清除这颗子弹
            window.clearInterval(bulletFly);
            self.HitExplode(BULLET,enemy_arr)
          }else{
            //设置子弹位置
            BULLET.css("top",g_t);
            buttle.b_top = g_t;
          }

        }
      },buttle.b_speed)
//}}}
    },
    checkHit : function(buttle,collision,tk){
//{{{子弹检测碰撞
      var self = this;
      if(collision ==""){
        return false;
      }
      var b_size = buttle.b_size/4;
      if(tk.fixs.faceto =="up"){//朝上打的子弹
        var d_top = collision.top + collision.fixs.height;
        if(buttle.b_top >= d_top){//肯定没打中
          return false;
        }else{
          if(buttle.b_left > (collision.left-buttle.b_size/4)  &&  buttle.b_left< (collision.left + collision.fixs.width + buttle.b_size/4) ){//打中
            return true;
          }else{//没打中
            return false;
          }
        }
      }else if (tk.fixs.faceto =="down"){//朝下打的子弹
        var d_top = collision.top;
        if((buttle.b_top+buttle.b_size) < d_top){//肯定没打中
          return false;
        }else{
          if(buttle.b_left > (collision.left-buttle.b_size/4)  &&  buttle.b_left< (collision.left + collision.fixs.width + buttle.b_size/4) ){
            return true;
          }else{
            return false;
          }
        }

      }
//}}}
    },
    HitExplode : function(BULLET,enemy_arr){
//{{{打中效果
      var self = this;
      BULLET.addClass("bulletExplode");
      setTimeout(function(){
        BULLET.remove();
      },70)

      if(enemy_arr.fixs.blood  ==1){ //没血结束了
        self.GameOver(enemy_arr)
      }else{ //血量减1
        enemy_arr.fixs.blood = enemy_arr.fixs.blood - 1;
        $(enemy_arr.tank["0"]).all(".J_bloodLess").html(enemy_arr.fixs.blood);
      }
//}}}
    }
    

  })
  return Bee;
},{
  attach : false,
  requires : ["sizzle","tank"]
})
//}}}

