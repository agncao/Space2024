(function() {
	var content=`
		<div class="demo">
			<input type="text" data-bind="value:queryName" placeholder='方案名称……'>
		    <button  data-bind="click:getFiles">查询</button>
		    <button  data-bind="click:uploadFile" >上传</button>
		    <button  data-bind="click:delFile" >删除</button>
		    <table style="table-layout: fixed;">
				<thead>
					<tr>
						<th style="width: 40px;">选择</th>
						<th style="width: 160px;">文件名</th>
						<th style="width: 150px;">时间</th>
						<th style="width: 250px;">访问路径</th>
					</tr>
				</thead>
				<tbody data-bind="foreach: { data: files, as: 'file' }">
					<tr>
						<td >
							<input type="radio" name="file" data-bind="value:file.name,checked:$root.selectedFileName">
						</td>
						<td data-bind="text:file.name"></td>
						<td data-bind="text:new Date(file.time).format('yyyy-MM-dd hh:mm:ss')"></td>
						<td data-bind="text:file.path"></td>
					</tr>
		    </table>
		</div>
	`;
	var viewModel = {
			//插件编号，用于后台存放到指定插件文件夹下
			pluginId:"PluginsFilesTest",
			//上传文件的文件夹名称
			fileFolderName:"data",
			//查询的名称
			queryName:'',
			//文件列表
			files:[],
			selectedFileName:"",
			getFiles:function(){
            	$.get('/m/pluginFile/getFiles?pluginId='+this.pluginId+'&folder='+this.fileFolderName+'&name='+this.queryName,function(ret) {
            		if(ret.messageType=="SUCCESS"){
						if(ret.result.length>0){
							viewModel.selectedFileName = ret.result[0].name;
						}else{
							viewModel.selectedFileName = "";
						}
            			viewModel.files = ret.result;
            		} else {
						layer.msg(ret.content);
					}
            	});
			},
			uploadFile:function(){
				var data = {
					name:"方案"+new Date().getTime()+".json",
					pluginId:this.pluginId,
					folder:this.fileFolderName,
					content:JSON.stringify({name:"方案"+new Date().getTime()}),
				};
				const that = this;
				$.post(ctx + '/m/pluginFile/uploadFile',data, function(ret) {
            		if (ret.messageType === 'SUCCESS') {
						layer.msg("上传成功！文件路径："+ret.result);
						that.getFiles();
					} else {
						layer.msg(ret.content);
					}
            	});
			},
			delFile:function(){
				if(this.selectedFileName==""){
					layer.msg("请选择一个方案！");
					return;
				}
				const that = this;
				$.get('/m/pluginFile/delFile?pluginId='+this.pluginId+'&folder='+this.fileFolderName+'&name='+this.selectedFileName+".json",function(ret) {
					if(ret.messageType=="SUCCESS"){
						layer.msg("删除成功！");
						that.getFiles();
					}else {
						layer.msg(ret.content);
					}
				});
			}
	};
    //监测viewModel中的属性
    Cesium.knockout.track(viewModel);
    var Demo = {
        //插件唯一编号,需要和json里的id保持一致
        id: "Plugins_PluginsFilesTest",
        menu: {
            //点击菜单后触发的事件
            click: function(element) {
                const openNewLayerIndex = layer.open({
                    type: 1,
                    title: "插件文件接口示例",
                    shadeClose: true,
                    shade: false,
                    area: ['700px',"500px"], // 宽高
                    offset: ['140px', ($(window).width() - 700) + 'px'],
                    success: function(layero, index) {
                    	//绑定界面和ViewModel，方便界面调用方法和绑定显示内容
                        Cesium.knockout.applyBindings(viewModel, $(layero)[0]);
                    },
                    content: content,//动态设置面板内容
                    btn: [],
                    end: function() {
                    	//关闭窗口时删除所有添加的对象
                    	Demo.clear();
                    }
                });
            }
        }
    };
    //把插件对象添加到插件管理器
    Plugins.add(Demo);
})();
