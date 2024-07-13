
(function(){
	function getDisPropertiesFromCzml(){
		let properties =sceneViewModel.dataSource.properties;
		if(properties){
			return properties;
		}else{
			sceneViewModel.dataSource.properties={};
			return sceneViewModel.dataSource.properties;
		}
	}
	var SubClass={
		//插件唯一编号
		id:"Plugins_Moveline",
		firstLoad:true,
		currentScenName:"",
		currentWindowIndex:0,
		//对应下拉框。默认为1 并且 1 不允许删除
		currentMovelineIndex:"1",

		menu:
		{
			
			//点击菜单后触发的事件
			click:function(element){
				let scenName = sceneViewModel.sceneName();
				if(scenName===""){
					layer.alert('需要打开场景才能使用该插件！');
					return ;
				}
				if(MyTimeLine.isUsing){
					MyTimeLine.close();
				}else{

					let properties =getDisPropertiesFromCzml()

					
                    if(!properties.hasOwnProperty("movetimelinedata")){
						properties["movetimelinedata"]={};
						properties["movetimelinedata"]["1"] = {stepdata:[],viewdata:[]};
					}else{
						if(properties["movetimelinedata"].hasOwnProperty("stepdata")){
							delete properties["movetimelinedata"].stepdata;
						}
						if(properties["movetimelinedata"].hasOwnProperty("viewdata")){
							delete properties["movetimelinedata"].viewdata;
						}
						if(!properties["movetimelinedata"].hasOwnProperty("1")){
							properties["movetimelinedata"]["1"] = {stepdata:[],viewdata:[]};
						}
					}
					let 	parentDom= document.body;
					MyTimeLine.init(solarSystem.baseViewer,parentDom);
                    //默认为 1.读取 默认的配置
					SubClass.currentMovelineIndex="1";
					SubClass.LoadFromCzml();
					
					
					SubClass.currentScenName ="scenName";
					console.log(properties)

					
					

				}

				SubClass.LoadSelectOfMyTimeLine();
				console.log(solarSystem.baseViewer.flyTo);
				console.log(sceneViewModel);
				if(SubClass.firstLoad){
					console.log("第一次加载插件js，注册监听 场景 名称 变化");
					sceneViewModel['sceneName'].subscribe((value) => {
						MyTimeLine.close();


					  });
					SubClass.firstLoad=false;

					$("#Plugins_Moveline_Div_AddStep_value").append("<option value=1>1秒</option>");
					$("#Plugins_Moveline_Div_AddStep_value").append("<option value=3>3秒</option>");
					$("#Plugins_Moveline_Div_AddStep_value").append("<option value=5>5秒</option>");
					$("#Plugins_Moveline_Div_AddStep_value").append("<option value=10>10秒</option>");
					$("#Plugins_Moveline_Div_AddStep_value").append("<option value=30>30秒</option>");
					$("#Plugins_Moveline_Div_AddStep_value").append("<option value=60>1分钟</option>");
					$("#Plugins_Moveline_Div_AddStep_value").append("<option value=180>3分钟</option>");
					$("#Plugins_Moveline_Div_AddStep_value").append("<option value=300>5分钟</option>");
					$("#Plugins_Moveline_Div_AddStep_value").append("<option value=600>10分钟</option>");
					$("#Plugins_Moveline_Div_AddStep_value").append("<option value=1800>30分钟</option>");
					$("#Plugins_Moveline_Div_AddStep_value").append("<option value=3600>1小时</option>");
					$("#Plugins_Moveline_Div_AddStep_value").append("<option value=7200>2小时</option>");
					$("#Plugins_Moveline_Div_AddStep_value").append("<option value=14400>4小时</option>");
					$("#Plugins_Moveline_Div_AddStep_value").append("<option value=21600>6小时</option>");
					$("#Plugins_Moveline_Div_AddStep_value").append("<option value=43200>12小时</option>");
				}
			}
		},
		LoadSelectOfMyTimeLine:function(){
			let properties =getDisPropertiesFromCzml();
			let keyArr = Object.keys(properties["movetimelinedata"]);
			//alert(keyArr)
			MyTimeLine.refreshSelect(keyArr);
		},
		LoadFromCzml:function(){
			MyTimeLine.ClearData();

			let viewNameArrOfScen =[];
			if(sceneViewModel.dataSource.storedViews){
				sceneViewModel.dataSource.storedViews.forEach(value=>{
					viewNameArrOfScen.push(value.name)
				})
			}

			let properties =getDisPropertiesFromCzml()
			MyTimeLine.addDataToPluginFromScen(properties["movetimelinedata"][SubClass.currentMovelineIndex],viewNameArrOfScen);
			
			console.log(properties)
		},
		AddSelect:function(selectVal){
			//alert('添加：'+selectVal)
			let properties =getDisPropertiesFromCzml();
			properties["movetimelinedata"][selectVal] = {stepdata:[],viewdata:[]};
		},
		DeleteSelect:function(selectVal){
			//alert('删除：'+selectVal)
			let properties =getDisPropertiesFromCzml();
			if(properties["movetimelinedata"].hasOwnProperty(selectVal)){
				//debugger
				let temp =properties["movetimelinedata"];
				delete temp[selectVal];
				
			}
			
		},
		ChangeToSelect:function(selectVal){
			SubClass.currentMovelineIndex = selectVal+"";
			//layer.alert('改变,加载：'+selectVal);
			SubClass.LoadFromCzml();
		},
		writeToScen:function(){
			let properties =getDisPropertiesFromCzml()
			properties["movetimelinedata"][SubClass.currentMovelineIndex]={stepdata:[],viewdata:[]};
			for (let key in MyTimeLine.StepData) {
				let value ={
					timestr: key,
					step: MyTimeLine.StepData[key].step
				}
				properties["movetimelinedata"][SubClass.currentMovelineIndex].stepdata.push(value);
			}
			for (let key in MyTimeLine.ViewData) {
				let value ={
					timestr: key,
					view: MyTimeLine.ViewData[key].view,
					isFlyto : MyTimeLine.ViewData[key].isFlyto
				}
				properties["movetimelinedata"][SubClass.currentMovelineIndex].viewdata.push(value);
			}
		},
		openAddStepWindow(Iso8601Str){
			SubClass.currentWindowIndex = layer.open({
				type: 1,
				title: "添加一个步长点",
				shadeClose: true,
				shade: 0.6,
				area: '400px', // 宽高
				offset: ['300px', '600px'],
				success: function(layero, index) {
				},
				content: $('#Plugins_Moveline_Div_AddStep'),
				btn: [],
				end: function() {
					
				}
			});
			
			$("#Plugins_Moveline_Div_AddStep_time").val(Iso8601Str)
			$("#Plugins_Moveline_Div_AddStep_value").val(1)
		},
		openUpdateStepWindow(Iso8601Str,value){
			SubClass.currentWindowIndex = layer.open({
				type: 1,
				title: "更新该时间的步长",
				shadeClose: true,
				shade: 0.6,
				area: '400px', // 宽高
				offset: ['300px', '600px'],
				success: function(layero, index) {
				},
				content: $('#Plugins_Moveline_Div_AddStep'),
				btn: [],
				end: function() {
					
				}
			});
			
			$("#Plugins_Moveline_Div_AddStep_time").val(Iso8601Str)
			$("#Plugins_Moveline_Div_AddStep_value").val(value)
		},
		AddStep:function(){
			let timeStrvalue = $("#Plugins_Moveline_Div_AddStep_time").val();
			let value =$("#Plugins_Moveline_Div_AddStep_value").val();
			
			MyTimeLine.addToStepDate({
				timestr: timeStrvalue,
				step: value
			});
			SubClass.writeToScen();
			layer.close(SubClass.currentWindowIndex)
		},
		DeleteStep:function(){
			let timeStrvalue = $("#Plugins_Moveline_Div_AddStep_time").val();
			MyTimeLine.deleteStepDate(timeStrvalue)

			SubClass.writeToScen();
			layer.close(SubClass.currentWindowIndex)
		},

		openAddViewWindow(Iso8601Str){
			SubClass.currentWindowIndex = layer.open({
				type: 1,
				title: "添加一个视角点",
				shadeClose: true,
				shade: 0.6,
				area: '400px', // 宽高
				offset: ['300px', '600px'],
				success: function(layero, index) {
				},
				content: $('#Plugins_Moveline_Div_AddView'),
				btn: [],
				end: function() {
					
				}
			});
			
			SubClass._LoadSelectOfViewName();

			$("#Plugins_Moveline_Div_AddView_time").val(Iso8601Str)
			$("#Plugins_Moveline_Div_AddView_IsFlyto").prop("checked",false);
		},
		_LoadSelectOfViewName : function(){
			let viewNameArrOfScen =[];
			if(sceneViewModel.dataSource.storedViews){
				sceneViewModel.dataSource.storedViews.forEach(value=>{
					viewNameArrOfScen.push(value.name)
				})
			}
			$("#Plugins_Moveline_Div_AddView_value").get(0).options.length=0;
			viewNameArrOfScen.forEach(value=>{
				$("#Plugins_Moveline_Div_AddView_value").append(`<option value='${value}'>${value}</option>`);
			});
		},
		openUpdateViewWindow(Iso8601Str,value,isFlytoVal){
			SubClass.currentWindowIndex = layer.open({
				type: 1,
				title: "更新视角",
				shadeClose: true,
				shade: 0.6,
				area: '400px', // 宽高
				offset: ['300px', '600px'],
				success: function(layero, index) {
				},
				content: $('#Plugins_Moveline_Div_AddView'),
				btn: [],
				end: function() {
					
				}
			});
			SubClass._LoadSelectOfViewName();
			$("#Plugins_Moveline_Div_AddView_time").val(Iso8601Str)
			$("#Plugins_Moveline_Div_AddView_value").val(value)
			$("#Plugins_Moveline_Div_AddView_IsFlyto").prop("checked",isFlytoVal);
		},
		AddView:function(){
			let timeStrvalue = $("#Plugins_Moveline_Div_AddView_time").val();
			let value =$("#Plugins_Moveline_Div_AddView_value").val();
			let isFlyto =$("#Plugins_Moveline_Div_AddView_IsFlyto").is(':checked');
			debugger
			if(value){
				MyTimeLine.addToViewDate({
					timestr: timeStrvalue,
					view: value,
					isFlyto : isFlyto
				});
				SubClass.writeToScen();
			}else{
				layer.alert('没有获得视角值,请创建视角，重新打开插件！'+value);
			}
			
			layer.close(SubClass.currentWindowIndex)
		},
		DeleteView:function(){
			let timeStrvalue = $("#Plugins_Moveline_Div_AddView_time").val();
			MyTimeLine.deleteViewDate(timeStrvalue)

			SubClass.writeToScen();
			layer.close(SubClass.currentWindowIndex)
		},

    }
	Plugins.add(SubClass);
})();
