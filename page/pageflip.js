KISSY.add("pageflip", function(S){
  var D = S.DOM, E = S.Event, $ = S.all;
  //���������¼�������fireʱ�ã���ҳǰ�ͷ�ҳ��
  var BeforPager = "beforPage",AfterPager = "afterPage";

 	function Pager(container,config){
    this.fixs = S.merge(Pager.defalut,config);			
 		this.box = $(container);	
 		this.init();
 	}
  //��Ĭ�������ó�������������ÿ�ζ�Ҫȥ��Ⱦ��ҳ��
	Pager.defalut={
      half     : 4, //ҳ��뾶
      total    : 0, //��ҳ��
      current  : 0, //��ǰ��ҳ��
      skin     : "blue" , //Ƥ����Ĭ����blue/red/black/gary
      //model  : "easy", //ģʽ��ʱû�����ã�����ͨ���޸���ʽ��������ʾ
      prefix   : 2, //ǰ׺
      suffix   : 0, //��׺
      callback : function(toindex){ }
	};
 	S.augment(Pager,S.Event.Target,{
 		init: function(){
      var self = this;
      //����ҳ��
 			self.renderPager();
 			self._bindfn();
 		},
    _bindfn : function(){//�󶨵���¼�
      var self = this,
          pageLink = function(evt){
            evt.preventDefault;
            var target = evt.target,num;
            //S.log(target.tagName)
            if(target.tagName == "A"){
              var num = $(target).attr("data-page-no");
              self.pageTo(num)
            }
            else if(target.tagName == "BUTTON"){
              var num = self.box.all(".J_PageInputText").val();
              if (num > self.fixs.total){
                num = self.fixs.total;
              }
              else if(num < 1){
                num = 1;
              }
              self.pageTo(num)
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
                self.pageTo(num)
            }

          };
      self.box.on("click",pageLink);
      self.box.on("keypress",pageKey);
    },
    renderPager:function(toindex,totle) {//���ҳ��
      var self     = this;
      var html     = '';
      var current  = parseInt(toindex, 10)  || self.fixs.current;//��ǰҳ
      var total    = parseInt(totle, 10)  || self.fixs.total;//��ҳ��
      var radius   = self.fixs.half;//��ȡ�뾶
      var skin     = self.fixs.skin + "-page-skin";//Ƥ����ʽ
      var prefix   = self.fixs.prefix;//ǰ׺
      var suffix   = self.fixs.suffix;//��׺
      var cb       = self.fixs.callback;
      self.current = current;
      self.totle   = total;

      self.fire(BeforPager,{index: current});

      if (current < 0) {
          return;
      }
      // ���� 2 ҳ������ʾ��ҳ
      if (total < 2) {
          return;
      }

      
      // ��һҳ
      if (current > 1) {
          html += '<a class="page-pre J_PageNoBtn" data-page-no="' +(current - 1)+ '" href="#">��һҳ</a>';
      }
      else{
          html += '<span class="page-pre disabled J_PageNoBtn" data-page-no="' +(current - 1)+ '">��һҳ</span>';
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


      // ��һҳ
      if (current < total) {
          html += '<a class="page-next J_PageNoBtn" data-page-no="' +(current + 1)+ '" href="#">��һҳ</a>';
      }
      else{
          html += '<span class="page-next J_PageNoBtn disabled" data-page-no="' +(current + 1)+ '">��һҳ</span>';
      }

      // form ��ת
      if (total > 1) {
          html += '<div class="page-skip">' +
              '<em>��' +total+ 'ҳ&nbsp;����</em>' +
              '<input data-total="' +total+ '" data-original="' +current+ '" class="page-direct J_PageInputText" value="' +current+ '"/>' +
              '<em>ҳ</em>' +
              '<button class="page-sub J_PageInputBtn"/>ȷ��</button>' +
              '</div>';
      } 
      self.box.addClass(skin).html(html)
      if (cb){
        cb(current)
      }
      self.fire(AfterPager,{index: current});
    },
    destory : function(){//����ҳ��
      var self = this;
      self.box.detach()
      self.box.removeClass(self.fixs.skin + "-page-skin").empty()
    },
    pageTo : function(toindex){
      //S.log(toindex)
      var self = this;
      self.renderPager(toindex)
    },
    pageNext : function(){
      var self = this;
      //S.log(self)
      var p_n = self.current +1;
      var p_t = self.totle;
      if(p_t < p_n){
        S.log("�Ѿ����һҳ��")
        p_n = p_t
      }
      self.renderPager(p_n);
    },
    pagePrev : function(){
      var self = this;
      var p_n = self.current -1;
      if( 1 > p_n){
        S.log("�Ѿ���һҳ��")
        p_n = 1
      }
      self.renderPager(p_n);
    },
    getTotle : function(){
      var self = this;
      var p_t = self.totle;
      return p_t;
    },
    getIndex : function(){
      var self = this;
      var p_n = self.current;
      return p_n;
    }
 	})
 	return Pager;
},{
  attach:false,
  requires : ["sizzle"]
});
