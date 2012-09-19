##第三期代码review

###题目描述

* 一个自动跟随组件，参考[affix](http://twitter.github.com/bootstrap/javascript.html#affix)。
* 任意一个元素，固定在某个位置，当滚动到浏览器会遮挡元素时，元素跟随视窗顶部移动，
  一直保持在可见视窗中。
  
### 要求

* 组件库中已经有[scrollfollow](http://wiki.ued.taobao.net/doku.php?id=team:vertical-guide:common-mods:scrollfollow)，
  可以在这个基础上改，但要求能够替代原来的组件, 或者重新自己实现。
* 从一下几点细节考虑：
  * 顶部位置控制，顶部可以自由配置偏移距离，比如bootstrap的实现。
  * 底部位置限制，当滚动到某个位置，设置为底部，不再更随，上下都需要控制。
  * 或者其他。

###实现者

* 李照
  * code [scrollFollow.js](https://github.com/vmarket/review/blob/master/scroll/scrollFollow.js)
  * demo [scrollFollow](http://fed.ued.taobao.net/u/zhouyun/demos/ScrollFollow.html)
* xxx
  * code [rotation.js](https://github.com/vmarket/review/blob/master/scroll/rotation.js)
  * demo [rotation](http://fed.ued.taobao.net/u/zhouxiaohuan/Assignments/evenroll/Scroll.html)
