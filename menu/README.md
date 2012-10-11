##第一期代码review

###题目描述

* 需求：实现全球购的多级异步菜单[example](http://g.taobao.com/brand_detail.htm) 在一级菜单上hover时发异步请求，渲染二级菜单，在二级菜单hover时发异步请求，渲染三级菜单；hover出来的菜单的有最大高度限制，超过则换到第二列；hover出来的菜单如果只有一列，则hover到该菜单上的非叶子条目时，发异步请求，展示其下一级菜单。
* 请写好注释，方便其它同学阅读。尽量考虑代码的可读性，扩展性，可维性等。
* 截图1：![img](http://img04.taobaocdn.com/tps/i4/T159HFXfJsXXcsb_w5-555-315.jpg)
* 截图2：![img](http://img01.taobaocdn.com/tps/i1/T1JV2PXXlfXXcTnGMl-497-117.jpg)
* 注意：只要求实现三级，并且尽量从简，例如不需要分组名（分组名为上图中的红框部分）

参考数据结构：

    {
      success:1,
      menus:[
        {
          title:"海洋生物类",
          link:"http://taobao.com"
          isLeaf:"true"
        },
        {
          title:"蛋白质/氨基酸",
          link:"http://taobao.com"
          isLeaf:"false"
        }
      ]
    }

###实现者
周赟

###review 地址

[demo点我](http://fed.ued.taobao.net/u/zhouyun/demos/zmenu/zmenu.html)

