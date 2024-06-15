import * as PlotUtils from './utils.js';
import eMyToolLineAdd from './eMyToolLineAdd.js';
(function(){
	var SubClass={
		//插件唯一编号
		id:"Plugins_SubClass",
		menu:
		{
			//点击菜单后触发的事件
			click:function(element){
				var tool =new eMyToolLineAdd();
				alert("创建子类成功："+tool);
				debugger;
				PlotUtils.alertMsg("测试导入方法成功！");
			}
		}
    }
	Plugins.add(SubClass);
})();
