/**
 * Copyright ued.taobao.com All rights reserved.
 * @author <a href="mailto:zhanye.xyf@taobao.com">zhanye</a>
 * time  2012.10.16
 * des  表单验证
 * */
KISSY.add('myValidation',function(S){
  var E = S.Event,
      D = S.DOM,
      defaultCfg = {
        //验证方式 支持blur 或者valuechange
        validType:'blur',
        //提交验证
        submitValidate:true,
        //需要验证的元素的id的前缀
        prefix:'auth'
      };

  /**
   * 基类 提供一些基本的方法
   * @constructor
   */
  function Component(){
     Component.superclass.constructor.call(this);
  }

  S.augment(Component,{
    /**
     * 转化为JSON对象
     * @param {Object} str
     * @return {Object}
     */
    toJSON:function(str){
      try{
        eval("var result=" + str);
      }catch(e) {
        //return {};
        S.log(e);
      }
      return result;
    },
    /**
     * 转化为Booleen对象
     * @param v
     * @return {Booleen}
     */
    toBooleen:function(v){
      return v ? true : false;
    }
  });

  S.extend(Component,S.Base);

  /**
   * myValidation
   * 表单验证构造函数
   * @class myValidation
   * @constructor
   * @param {NodeList,String,HTMLelement} form 要校验的表单
   * @param {Object} cfg 可选参数
   */
  function myValidation(form,cfg){
    var self = this;
    if(!(self instanceof arguments.callee)){
      return new arguments.callee(form);
    }
    arguments.callee.superclass.constructor.call(self);
    self.form = (form instanceof S.NodeList) ? form : S.one(form);
    self.validNodes = self.form.all('[data-valid]');
    self.cfg = S.merge(defaultCfg,cfg);
    self.validAllPass = false;
    self.validAllArr = [];
    self.init();
  }

  //继承于KISSY.Base
  S.extend(myValidation, Component);

  myValidation.ATTRS={
  
  };

  S.augment(myValidation,{
    init:function(){
      this.renderNodes();
      this.bindEvent();
    },

    //遍历所有表单验证元素，并实例化
    renderNodes:function(){
      var self = this;
      self.validNodes.each(function(v,k){
        var v = S.one(v),
            oRule = self.toJSON(v.attr('data-valid'));
        //如果规则对象存在
        if(oRule){
          self.validAllArr.push(new ValidItem(v,oRule,self.cfg));
        }
      });
    },
    /**
     * 验证整个表单 返回成功失败
     * return {Booleen}
     */
    checkValid:function(){
      var self = this,
          len = self.validAllArr.length,
          i = 0,
          hasAsync = false,
          asyncNodes = [];
      //遍历所有验证节点，进行验证
      S.each(self.validAllArr,function(item){
        item.dealNodeRule();
        if(item.get('validState').validPass){
          i ++;
        }
      });

      //返回总体验证成功或失败
      self.validAllPass = (i == len);
      return self.validAllPass;

    },
    //事件绑定
    bindEvent:function(){
      var self = this;
      if(self.cfg.submitValidate){
        E.on(self.form,'submit',function(e){
          if(!self.checkValid()){
            S.log('表单验证不通过');
            e.halt();
          }
          else{
            S.log('表单验证通过');
          }
        });
      }
    }
  });

  /**
   * ValidItem
   * 表单验证构造函数单项
   * @class ValidItem
   * @constructor
   * @param {NodeList,String,HTMLelement} node 要校验的表单项
   * @param {Object} oRule 校验规则
   * @param {Object} cfg 可选参数
   */
  function ValidItem(node,oRule,cfg){
    var self = this;
    if(!(self instanceof arguments.callee)){
      return new arguments.callee(form);
    }
    arguments.callee.superclass.constructor.call(self);
    self.node = (node instanceof S.NodeList) ? node : S.one(node);
    //该元素的内容是否发生改变;
    self.isValChanged = false;
    //该元素是否有异步的规则需要验证
    //self.isAsync = false;
    self.oRule = oRule;
    //计时器
    self.timer = false;
    self.cfg = cfg;
    self.init();
  }

  //继承于KISSY.Base
  S.extend(ValidItem, Component);

  ValidItem.ATTRS={
    validState:{
      value:{
        msg:'',
        validPass:''
      }
    }
  };

  S.augment(ValidItem,{
    init:function(){
      this.renderHtml();
      this.bindEvent();
    },
    //渲染html：写入id，插入提醒信息的html
    renderHtml:function(){
      var self = this;
      self.msgNode = S.one(self.msgHtml);
      self.msgNode.insertAfter(self.node);

      //写入id属性
      if(!self.node.attr('id')){
        self.node.attr('id', self.cfg.prefix + S.guid());
      }
    },
    //展示或者隐藏验证信息
    showMsg:function(){
      var self = this,
          validState = self.get('validState'),
          msgNode = self.msgNode,
          msg = validState.msg,
          validPass = validState.validPass;

      //验证通过
      if(validPass){
        msgNode.one('.estate').removeClass('error').addClass('ok');
        msgNode.one('.label').text('ok');
      }
      //验证不通过
      else{
        msgNode.one('.label').text(msg);
        msgNode.one('.estate').removeClass('ok').addClass('error');
      }
      msgNode.show();
    },
    //处理需要验证的节点的规则 ,返回自身
    dealNodeRule:function(){
      var self = this;
      //如果该元素最近一次验证通过,并且内容没有发生过改变,则不再重复验证
      if(self.get('validState').validPass && !self.isValChanged){
        S.log('已经通过验证，不再重复验证');
        return self;
      }
      var node = self.node,
          oRule = self.oRule,
          val = node.val(),
          //验证单个规则通过与否
          validPass = true;

      //如果是空对象，则表示是必填字段
      if(S.isEmptyObject(oRule)){
        msg = '此为必填项';
        validPass = self.toBooleen(val);
        self.set('validState',{msg:msg,validPass:validPass});
        return self;
      }
      else{
        //必填项
        if(oRule['required']){
          msg = '此为必填项';
          validPass = self.toBooleen(val);
          self.set('validState',{msg:msg,validPass:validPass});
          //如果该项验证不通过，则返回，下面的N项都不用再验证
          if(!validPass){
            return self;
          }
        }
        //最小长度
        if(oRule['minLength']){
          var len = parseInt(oRule['minLength'][0],10);
          msg = oRule['minLength'][1] || '最少' + len + '个字符';
          validPass = (val.length >= len || val == '');
          self.set('validState',{msg:msg,validPass:validPass});
          //如果该项验证不通过，则返回，下面的N项都不用再验证
          if(!validPass){
            return self;
          }
        }
        //最大长度
        if(oRule['maxLength']){
          var len = parseInt(oRule['maxLength'][0],10);
          msg = oRule['maxLength'][1] || '最多' + len + '个字符';
          validPass = (val.length <= len);
          self.set('validState',{msg:msg,validPass:validPass});
          //如果该项验证不通过，则返回，下面的N项都不用再验证
          if(!validPass){
            return self;
          }
        }
        //最大数值
        if(oRule['maxValue']){
          var maxValue = parseInt(oRule['maxValue'][0],10);
          msg = oRule['maxValue'][1] || '最大数值为' + maxValue;
          validPass = (maxValue >= parseInt(val));
          self.set('validState',{msg:msg,validPass:validPass});
          //如果该项验证不通过，则返回，下面的N项都不用再验证
          if(!validPass){
            return self;
          }
        }
        //最小数值
        if(oRule['minValue']){
          var minValue = parseInt(oRule['minValue'][0],10);
          msg = oRule['minValue'][1] || '最小数值为' + minValue;
          validPass = (minValue <= parseInt(val));
          self.set('validState',{msg:msg,validPass:validPass});
          //如果该项验证不通过，则返回，下面的N项都不用再验证
          if(!validPass){
            return self;
          }
        }
        //数字
        if(oRule['number']){
          msg = oRule['number'][0] || '只能是数字';
          validPass = /^[0-9]*$/.test(val);
          self.set('validState',{msg:msg,validPass:validPass});
          //如果该项验证不通过，则返回，下面的N项都不用再验证
          if(!validPass){
            return self;
          }
        }
        //email
        if(oRule['email']){
          msg = oRule['email'][0] || '只能是email';
          validPass = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(val);
          self.set('validState',{msg:msg,validPass:validPass});
          //如果该项验证不通过，则返回，下面的N项都不用再验证
          if(!validPass){
            return self;
          }
        }
        //正则
        if(oRule['regex']){
          msg = oRule['regex'][1] || '正则表达式';
          validPass = oRule['regex'][0].test(val);
          self.set('validState',{msg:msg,validPass:validPass});
          //如果该项验证不通过，则返回，下面的N项都不用再验证
          if(!validPass){
            return self;
          }
        }
        //异步
        if(oRule['async']){
          validPass = false;
          //self.isAsync = true;
          S.log('有异步');
          var asyncRuleObj = oRule['async'],
              data = {};
          data[asyncRuleObj.dataName] = val;
          msg = 'loading';
          self.set('validState',{msg:msg,validPass:validPass});
          S.io({
            url:asyncRuleObj.url,
            data:data,
            dataType:asyncRuleObj.dataType || 'json',
            cache:false,
            type:asyncRuleObj.type,
            success:function(json){
              S.log(json);
              validPass = json.status;
              msg = json.msg || 'default msg';
              self.set('validState',{msg:msg,validPass:validPass});
            },
            error:function(){
              S.log('通信出错');
            }
          });
        }
      }

      self.set('validState',{msg:msg,validPass:validPass});
      return self;
    },
    //提示信息html
    msgHtml:'<div class="valid-under" style="display:none;"><p class="estate"><span class="label"></span></p></div>',
    //事件绑定
    bindEvent:function(){
      var self = this,
          node = self.node,
          validType = self.cfg.validType;
      //发生valuechange的时候，可能已经不通过验证，要改变self.isValChanged
      E.on(node,'valuechange',function(e){
        self.isValChanged = true;
      });
      if(validType == 'valuechange' || validType == 'blur'){
        E.on(node,validType,function(e){
          self.dealNodeRule();
        });
      }
      self.on('afterValidStateChange',function(e){
        S.log('validState has changed');
        self.isValChanged = false;
        self.showMsg();
      });
    }
  });

  return myValidation;
},{requires:['sizzle']});
