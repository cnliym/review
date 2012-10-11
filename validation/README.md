##第五期代码review

###题目描述

* 实现一个简易的表单校验框架
* 支持输入时校验和表单提交前校验
* 校验出错时，在相应位置提示错误信息
* 支持required、maxLength、minLength、maxValue、minValue、number、email、url、mask（正则）等以及自定义custom和异步ajax形式
* ![img](http://img04.taobaocdn.com/tps/i4/T1q0TTXjhmXXaSjvIu-638-535.jpg)

校验规则类似：
```
    {
		"username":{ //username位表单项ID
			"required":{
				"value":true,
				"message":"用户名不能为空"
			},
			"minLength":{
				"value":"6",
				"message":"用户名不能少于6个字"
			}
		},
		"age":{
			"number":{
				"value":true,
				"message":"年龄只能是数字"
			},
			"minValue":{
				"value":18,
				"message":"未满18岁禁止入内"
			}
		},
		"vip":{
			"ajax":{
				"value":"http://www.taobao.com/api",
				"message":"对不起您的级别太低"
			}
		},
		"index":{
			"mask":{
				"value":/http:.*/,
				"message":"不符合规则"
			}
		},
		"ooxx":{
			"custom":{
				"value":function(value){
					if(value === "ooxx"){
						return false; //校验失败
					}
				},
				"message":"小子你太邪恶了"
			}
		}
    }
```

###实现者

待定

###review 地址

demo1点我

demo2点我

