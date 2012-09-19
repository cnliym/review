KISSY.add('market/scrollFollow', function(S , DOM , Event){

var DOM = S.DOM, Event = S.Event;

  //可配置参数
  
  var cfg = {
    
	//跟随容器
    followEl: '', 
    
	//向上距离
	scroTop: '175',
	
	
	
  };
  
    function AutoFollow(cfg){
  
		var sl=S.one(cfg.followEl);//跟随容器
		
		var offheight=sl.offset()['top'];//当前元素距离浏览器之间的距离
		
		
		S.Event.on(window,'scroll',function(){
		
			var wt=parseInt(DOM.scrollTop(window),10);
			if( wt > offheight ){
			
				if(S.UA.ie==6){
				
					sl.css({"position":"absolute","top":wt+"px"});
					
				}else{
				
					sl.css({"position":"fixed","top":"0"});
				}
				
			}else{
			
				sl.css({"position":"static"});
				
			}
			
		})
		
	}
	
	return AutoFollow;

},{attach:false});



//sl.offset()['top'] - KISSY.DOM.scrollTop()