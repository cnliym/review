/**
 * Created by 刘文炳.
 * Date: 2012-09-06
 * Time: 09:32
 * Desc: 分页
 */
KISSY.add('page',function(S, D, E){
  var $ = S.all;
  function Page(iConter, iCfg){
    var cfg = {
      current: 1, //当前页
      count: 10, //总页数
      size: 5, //显示页码数
      style: "tbpage", //皮肤class
      ajax: {
        enable: false,
        boxId: "",
        url: "",
        dataType: 'jsonp',
        scriptCharset: 'utf-8',
        jsonp: 'callback'
      }
    }
    var sCfg = S.merge(cfg,iCfg);
    //判断配置参数
    if(this._cfgError(sCfg)){
      this._style(sCfg, cfg, iConter);
      this._rePage(sCfg, iConter)
    }
  }
  S.augment(Page,{
    init: function(sCfg, iConter){
      //this._pageCreat(sCfg, iConter);
    },
    //设置皮肤class
    _style: function(sCfg, cfg, iConter){
      if(sCfg.style !== cfg.style){
        $(iConter).addClass(sCfg.style);
      }else{
        $(iConter).addClass(cfg.style);
      }
    },
    //数字转化
    _pageInt: function(num){
      return parseInt(num);
    },
    //渲染pagination
    _pageCreat: function(sCfg, iConter){
      //取显示页码的一半
      var mNum = this._pageInt(sCfg.size / 2); 
      var first = last = 1; //last用来遍历显示页码
      var cont = ""; //容器
      first = sCfg.current - mNum > 0 ? sCfg.current - mNum : 1; //设置显示的第一个页码数
      if (first + sCfg.size > sCfg.count) {
        last = sCfg.count + 1;
        first = last - sCfg.size; //设置显示的第一个页码数
      } else {
        last = first + sCfg.size;
      }
      cont += this._getFirst(sCfg); //添加首页按钮到容器

      //设置上一页按钮
      if (sCfg.current == 1) {
        cont += '<span class="hide">上一页</span>';
      } else {
        cont += '<a href="#' + (sCfg.current - 1) + '" data-page="' + (sCfg.current - 1) + '">上一页</a>';
      }

      //first = first <= 0 ? 1 : first;
      //渲染页码数
      for (first; first < last; first++) {
        if (first == sCfg.current) {
          cont += '<span class="cur" data-page="' + first + '">' + first + '</span>';
        } else {
          cont += '<a href="#" data-page="' + first + '">' + first + '</a>';
        }
      }
      //设置下一页按钮
      if (sCfg.current == sCfg.count) {
        cont += '<span class="hide">下一页</span>';
      } else {
        cont += '<a href="#'+ (this._pageInt(sCfg.current) + 1) +'" data-page="' + (this._pageInt(sCfg.current) + 1) + '">下一页</a>';
      }

      //将尾页、输入跳转加入容器
      cont += this._getLast(sCfg);
      cont += this._getInput(sCfg);

      //渲染到页面
      $(iConter).html(cont);

      var btn = $("button", iConter);
      var item = $("a", iConter);
      var that = this;
      //输入页码跳转提交
      btn.on("click",function(ev){
        var num = $(this).siblings("input").val();
        if(that._isNum(num, sCfg)){
          sCfg.current = num;
          that._rePage(sCfg, iConter);//重新渲染pagination
        }
      })
      //可用页码点击
      item.each(function(v,k){
        v.on("click", function(ev){
          var iPage = $(ev.target).attr("data-page");
          sCfg.current = iPage;
          that._rePage(sCfg, iConter);//重新渲染pagination
          ev.halt();
        })
      })
    },
    //重新渲染
    _rePage: function(sCfg, iConter){
      var sAjax = sCfg.ajax;
      var that = this;
      if(sAjax.enable){
        S.ajax({
          url: sAjax.url.replace("{page}",sCfg.current),
          dataType: sAjax.dataType,
          scriptCharset: sAjax.scriptCharset,
          jsonp: sAjax.jsonp,
          success: function(d){
            //渲染异步数据
            var data = d.spuList.detail[0].name;
            var iBox = S.get("#" + sAjax.boxId);
            $(iBox).html(data); //Template...
            that._pageCreat(sCfg, iConter);
          },
          error: function(){
            console.log("接口数据错误");
          }
        })
      }else{
        this._pageCreat(sCfg, iConter);
      };
    },
    //获取页码首页
    _getFirst: function(sCfg){
      var str;
      if(sCfg.current == 1){
        str = '<span>首页</span>';
      }else{
        str = '<a href="#1" data-page="1">首页</a>';
      }
      return str;
    },
    //获取页码尾页
    _getLast: function(sCfg){
      var str;
      if(sCfg.current == sCfg.count){
        str = '<span>尾页</span>';
      }else{
        str = '<a href="#' + sCfg.count + '" data-page="' + sCfg.count + '">尾页</a>';
      }
      return str;
    },
    //输入跳转部分
    _getInput: function(sCfg){
      var input = '<input type="text" value="' + sCfg.current + '"/>';
      var button = '<button type="button" class="J_submit">确定</button>';
      var str = '<em>共' + sCfg.count + '页 到' + input + '页 ' + button + '</em>';
      return str;
    },
    //跳转输入是否为数字
    _isNum: function(num, sCfg){
      var reg = /^[0-9]{1,8}$/;
      var msg = "请输入正确的数字";
      if ((num < 1) || (num > sCfg.count) || !reg.exec(num) ){
        alert(msg);
        return false;
      }else{
        return true;
      }
    },
    //配置信息判断
    _cfgError: function(sCfg){
      if (sCfg.current < 1 || sCfg.current > sCfg.count || sCfg.size < 2) {
        alert("error");
        return false;
      }else{
        return true;				
      }
    }
  })
  return Page;
},{attach:false, requires:['dom','event'] })
