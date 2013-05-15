// getElementsByClassName(string, object)
function getElementsByClassName (sCls, oParent) {
	var aResult = [];
	// 标准浏览器已经支持了getElementsByClassName
	if (document.getElementsByClassName) {
		aResult = document.getElementsByClassName(sCls);
	} else {
		var aNode = [];
		// 正则用于匹配className
		var rCls = new RegExp('(\s|^)' + sCls + '($|\s)');
		// 元素获取范围，document 或是相应对象的子元素
		aNode = (oParent ? oParent : document).getElementsByTagName('*')
		for (var v in aNode) {
			rCls.test(aNode[v].className) ? aResult.push(aNode[v]) : '';
		}		
	}
	return aResult;
}

// addClass(object, string)
function addClass (obj, cls) {
	if (typeof obj !== 'object' && typeof cls !== 'string') return;
	var oCls = obj.className.replace(/(^\s*)|(\s*$)/g, '');
	obj.className = oCls.replace(/\s*/g, '') ? oCls + ' ' + cls : cls;
}

// removeClass(object, string)
function removeClass (obj, cls) {
	// 非字面量正则表达式里元字符需要双重转义
	var rCls = new RegExp('(\\s|^)' + cls + '($|\\s)');
	if (typeof obj !== 'object' && typeof cls !== 'string' && rCls.test(cls)) return;
	var newCls = obj.className.replace(rCls, ' ');
	obj.className = newCls.replace(/(^\s*)|(\s*$)/g, '');
}

// css(object, property) || css(object, property, value)
function css(obj, property, value) {
	// argements[2]为空，则函数作用为获取对应样式值
	// currentStyle与getComputed分别用于区别IE及标准浏览器
	if (!value) {
		return obj.currentStyle ? obj.currentStyle[property] : getComputedStyle(obj, false)[property];
	} else {
		obj.style[property] = value;
	}
}

// innerText(object)
function innerText (obj) {
	if (obj.innerText) {
		return obj.innerText;
	} else {
		// fix firefox
		return obj.textContent;
	};
}

// scrollTop, documentElement->ff, ie body->chrome
function scrollTop () {
	return document.body.scrollTop || document.documentElement.scrollTop;
}

// scrollLeft, The same as scrollTop
function scrollLeft () {
	return document.body.scrollLeft || document.documentElement.scrollLeft;
}

// addEvent(object, 'click', fn), fn里return false可阻止冒泡及默认事件
function addEvent (obj, type, callback) {
	if (obj.attachEvent) {
		// for IE, ie下元素绑定事件后this指向了window，用call改变this指向
		obj.attachEvent('on' + type, function () {
			if (false == callback.call(obj)) {
				event.cancelBubble = true;
				return false;
			}
		});
	} else {
		// for !IE
		obj.addEventListener(type, function (ev) {
			if (false == callback.call(obj)) {
				ev.cancelBubble = true;
				ev.preventDefault();
			}
		}, false);
	}
}

// animate(object, {'width': 900, 'opacity': 70}, fn)
function animate (obj, oConfig, cb) {
	clearInterval(obj.timer);
	obj.timer = setInterval(function () {
		// 假设当前值都等于配置项的值
		var isEnd = true;
		// 分别设置配置项里的值
		for (var property in oConfig) {
			var currentValue = 0;
			// 所需改变的属性的当前值
			if (property == 'opacity') {
				currentValue = Math.round(parseFloat(css(obj, property)) * 100);
			} else {
				currentValue = parseInt(css(obj, property));
			}
			// 缓冲动画的计算
			var speed = (oConfig[property] - currentValue) / 7;
			speed = speed > 0 ? Math.ceil(speed) : Math.floor(speed);
			// 检查动画是否都已经结束
			if (currentValue != oConfig[property]) {
				isEnd = false;
			}
			// 透明度的变化与大小长宽的变化分开处理
			if (property == 'opacity') {
				//fix -> IE || !IE
				obj.style.filter = 'alpha(opacity:' + (currentValue + speed) + ')';
				obj.style.opacity = (currentValue + speed) / 100;
			} else {
				obj.style[property] = currentValue + speed + 'px';
			}
		}
		//  动画结束，执行回调
		if (isEnd) {
			clearInterval(obj.timer);	
			if (cb) cb();
		}
	}, 30);
}

// ajax(url, fn, fn)
function ajax (url, fnSuccess, fnError) {
	// 创建Ajax对象, fix ie6
	if (window.XMLHttpRequest) {
		var oAjax = new XMLHttpRequest();
	} else {
		var oAjax = new ActiveXObject("Microsoft.XMLHTTP");
	}
	// 连接服务器, open(方法 -> GET||POST, 文件 -> 文件名||文件地址, 是否异步)
	oAjax.open('GET', url, true);
	// 发送请求
	oAjax.send();
	// 接收返回的信息
	oAjax.onreadystatechange = function () {
		/*
		 * 	根据readyState判断当前ajax连接的当前进度
		 *	0 -> 还未连接服务器, 
		 *	1 -> 正在发送请求, 
		 *	2 -> 已经发送成功, 
		 *	3 -> 服务器正在解析收到的内容, 
		 *	4 -> 解析完成，可读取数据进行操作
		*/
		if (oAjax.readyState == 4) {
			// 利用HTTP状态码判断是否读取数据成功
			// 读取数据成功返回数据内容，否则返回HTTP状态码
			if (oAjax.status == 200) {
				fnSuccess(oAjax.responseText);
			} else {
				if (fnError) {
					fnError(oAjax.status);
				}
			}
		}
	};
}



