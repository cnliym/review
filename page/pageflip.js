KISSY.add("pageflip",function(S){
  var S = KISSY, D = S.DOM, E = S.Event, $ = S.all;
  var BeforPager = "beforPage",AfterPager = "afterPage";
  function pager(container,config){
    this.fixs = S.merge(pager.defalut, config);
    this.box  = $(container);	
    this.init();
  };
  pager.defalut = {
    half     : 4, //页码半径
    total    : 0, //总页数
    current  : 0, //当前的页码
    skin     : "blue" , //皮肤，默认有blue/red/black/gary
    //model  : "easy", //模式暂时没有配置，可以通过修改样式来减少显示
    prefix   : 2, //前缀
    suffix   : 0, //后缀
    callback : function(toindex){ }
  } ;
  S.augment(pager,S.Event.Target,{
    init: function(){
      var self = this;
      //调用页码
      self.renderPager();
      self.bind();
    },
    renderPager:function(toindex) {//输出页码
      var self = this;
      var html = '';
      var current = parseInt(toindex, 10)  || self.fixs.current;//当前页
      var fixs   = self.fixs;
      var total  = fixs.total;//总页数
      var radius = fixs.half;//获取半径
      var skin   = fixs.skin + "-page-skin";//皮肤样式
      var prefix = fixs.prefix;//前缀
      var suffix = fixs.suffix;//后缀
      var cb     = fixs.callback;

      self.fire(BeforPager,{index: current});

      if (current < 0) {
        return;
      }
      // 少于 2 页，不显示分页
      if (total < 2) {
        return;
      }

      //首页

      // 上一页
      if (current > 1) {
        html += '<a class="page-pre J_PageNoBtn" data-page-no="' +(current - 1)+ '" href="#">上一页</a>';
      }
      else{
        html += '<span class="page-pre disabled J_PageNoBtn" data-page-no="' +(current - 1)+ '">上一页</span>';
      }

      // [1, current]
      if (current < prefix + radius ) {
        for (var i = 1; i <= current; ++i) {
          if ( i == current) {
            html += '<span class="page-curr">' +i+ '</span>';
          } else{
            html +=  '<a class="J_PageNoBtn" data-page-no="' + i + '" href="">' +i+ '</a>';
          }
        }
      } else {
        for (var i = 1; i <= prefix; ++i) {
          html +=  '<a class="J_PageNoBtn" data-page-no="' + i + '" href="#">' +i+ '</a>';
        }
        html += '<span class="page-break">...</span>';
        for (var i = current - 2; i <= current; ++i) {
          if ( i == current) {
            html += '<span class="page-curr">' +i+ '</span>';
          } else{
            html +=  '<a class="J_PageNoBtn" data-page-no="' + i + '" href="#">' +i+ '</a>';
          }
        }
      }

      // (current, current + radius]
      for (var i = current + 1, len = Math.min(total, current+radius); i <= len; ++i) {
        html +=  '<a class="J_PageNoBtn" data-page-no="' + i + '" href="#">' +i+ '</a>';
      }

      //(current + radius , totle)
      if (current + radius < total) {
        html += '<span class="page-break">...</span>';
        for (var i = total - suffix +1 ; i <= total; ++i) {
          html +=  '<a class="J_PageNoBtn" data-page-no="' + i + '" href="">' +i+ '</a>';
        }

      }


      // 下一页
      if (current < total) {
        html += '<a class="page-next J_PageNoBtn" data-page-no="' +(current + 1)+ '" href="#">下一页</a>';
      }
      else{
        html += '<span class="page-next J_PageNoBtn disabled" data-page-no="' +(current + 1)+ '">下一页</span>';
      }

      // form 跳转
      if (total > 1) {
        html += '<div class="page-skip">' +
                '<em>共' +total+ '页&nbsp;到第</em>' +
                '<input data-total="' +total+ '" data-original="' +current+ '" class="page-direct J_PageInputText" value="' +current+ '"/>' +
                '<em>页</em>' +
                '<button class="page-sub J_PageInputBtn"/>确定</button>' +
                '</div>';
      } 
      self.box.addClass(skin).html(html)
      if (cb){
        cb(current)
      }
      self.fire(AfterPager,{index: current});
    },
    destory : function(){//销毁页码
      var self = this;
      self.box.detach()
      self.box.removeClass(self.fixs.skin + "-page-skin").empty()
    },
    bind : function(){//绑定点击事件
      var self = this,
      pageLink = function(evt){
        evt.preventDefault;
        var target = evt.target,num;
        //S.log(target.tagName)
        if(target.tagName == "A"){
          var num = $(target).attr("data-page-no");
          self.page(num)
        }
        else if(target.tagName == "BUTTON"){
          var num = self.box.all(".J_PageInputText").val();
          if (num > self.fixs.total){
            num = self.fixs.total;
          }
          else if(num < 1){
            num = 1;
          }
          self.page(num)
        }
        //S.log(num+","+self.fixs.total)
      },
      pageKey = function(evt){
        if (evt.keyCode == 13) {
          var num = self.box.all(".J_PageInputText").val();
          if (num > self.fixs.total){
            num = self.fixs.total;
          }
          else if(num < 1){
            num = 1;
          }
          self.page(num)
        }

      };
      self.box.on("click",pageLink);
      self.box.on("keypress",pageKey);
    },
    page : function(toindex){
      //S.log(toindex)
      var self = this;
      self.renderPager(toindex)
    }
  })
  return pager;
},{
  attach:false,
  requires : ["sizzle"]
});
