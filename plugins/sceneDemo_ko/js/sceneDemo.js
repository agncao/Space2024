(function() {
	//获取平台管理对象
	var yyastk = window.getYYASTK();
	//获取当前场景管理对象
	var currentScenario=yyastk.CurrentScenario;
	var content=`
		<div class="demo">
		    <button  data-bind="click:createScene">新建场景</button>
		    <button  data-bind="click:rename" >重命名场景</button>
		    <button  data-bind="click:addPointEntity" >添加点对象</button>
		    <button  data-bind="click:addSatelliteEntity" >添加卫星对象</button>
		    <button  data-bind="click:clearEntities" >移除所有对象</button>
		    <button  data-bind="click:clear" >移除场景</button>
		</div>
	`;
    var Demo = {
        //插件唯一编号,需要和json里的id保持一致
        id: "Plugins_sceneDemo_ko",
        menu: {
            //点击菜单后触发的事件
            click: function(element) {
                const openNewLayerIndex = layer.open({
                    type: 1,
                    title: "场景接口示例",
                    shadeClose: true,
                    shade: false,
                    area: '340px', // 宽高
                    offset: ['140px', ($(window).width() - 450) + 'px'],
                    success: function(layero, index) {
                    	//绑定界面和ViewModel，方便界面调用方法和绑定显示内容
                        Cesium.knockout.applyBindings(Demo, $(layero)[0]);
                    },
                    content: content,//动态设置面板内容
                    btn: [],
                    end: function() {
                    	//关闭窗口时删除所有添加的对象
                    	Demo.clear();
                    }
                });
            }
        },
        //新建场景
        createScene:function(){
        	currentScenario.createScene({
        		name:"新建场景测试",
        		centralBody:"Moon",
        		startTime:"2021-05-01T00:00:00Z",
        		endTime:"2021-05-02T00:00:00Z",
        		description:"测试"
        	});
        	//yyastk.msgStatusBar为平台对象固有消息对象，使用其add方法添加各种消息，方便在界面查看消息，点击底部消息图标可以打开消息界面
        	yyastk.msgStatusBar.add(Cesium.MsgType.INFO,"插件_场景API","新建场景成功！");
        },
        //场景重命名
        rename:function(){
        	currentScenario.rename("新建场景测试111");
        	yyastk.msgStatusBar.add(Cesium.MsgType.WARN,"插件_场景API","重命名成功！");
        },
        //在当前场景内添加点对象,其中new Cesium.Entity参数和原生Cesium参数一致
        addPointEntity: function() {
        	
        	yyastk.msgStatusBar.add(Cesium.MsgType.ERROR,"插件_场景API","错误提示！");
            if (this.entity) {
            	//删除Entity对象
            	currentScenario.removeEntity(this.entity);
                this.entity = undefined;
            }
        	//向当前场景里添加对象,
            /**
             * entityType类型如下:
             *  "place":地点
				"target":"目标点
				"facility":地面站
				"aircraft":飞机
				"missile":导弹
				"satellite":卫星
				"sensor":传感器
				"groundVehicle":地面车
				"ship":船
				"launchVehicle":火箭
				"lineTarget":线目标
				"areaTarget":区域目标
				"chain":链路
             */
            this.entity = new Cesium.Entity({
            	entityType:"place",
            	name:"点",
                position: Cesium.Cartesian3.fromDegrees(115.59777, 30.03883),
                point: {
                    pixelSize: 5,
                    color: Cesium.Color.RED,
                    outlineColor: Cesium.Color.WHITE,
                    outlineWidth: 2
                },
                label: {
                    text: "测试",
                    font: "24px Helvetica",
                    fillColor: Cesium.Color.SKYBLUE,
                    outlineColor: Cesium.Color.BLACK,
                    outlineWidth: 2,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    pixelOffset: new Cesium.Cartesian2(0, -30)
                }
            });
            
            //添加后返回场景树里的对象节点（添加对象是调用了方法：dataSource.entities.add(entity)）
            var entityNode = currentScenario.addEntity(this.entity);
        },
        //添加卫星
        addSatelliteEntity: function() {
        	var params={
			  "Start": "2021-05-01T00:00:00.000Z",
			  "Stop": "2021-05-02T12:00:00.000Z",
			  "SatelliteNumber": "25730",
			  "TLEs": [
			    "1 25730U 99025A   21120.62396556  .00000659  00000-0  35583-3 0  9997",
			    "2 25730  99.0559 142.6068 0014039 175.9692 333.4962 14.16181681132327"
			  ]
			};
        	var data = $.toJSON(params);
        	console.log(data);
        	$.ajax({
                type: "POST",
                url: "http://astrox.cn:8765/Propagator/sgp4",
                dataType: "json",
                data: data,
                contentType: "application/json",
                success: function (sgp4Data) {
                	if (sgp4Data.IsSuccess) {
    					var position = sgp4Data.Position;
    					
    					//根据Entity类型获取对应的图标和模型配置，其他yyastk.entityTypeUtils为对象类型公共处理方法。
    					var entityType = "satellite";
    					var typeInfo = yyastk.entityTypeUtils.getType(entityType);
    					
    					//向当前场景里添加对象,其中entityType、centralBody、A805_Properties为平台所需扩展的必要属性
    		            var entity = new Cesium.Entity({
    		            	entityType:entityType,//对象类型
    		            	centralBody:position.CentralBody,//对象所属中心天体
    		            	A805_Properties:{
    		            		propagator:"StkExternal"//对象位置数据来源，指定为stk文件
    		            	},
    		            	name:"卫星",
    		                label: {
    		                    text: "卫星",
    		                    font: "24px Helvetica",
    		                    fillColor: Cesium.Color.SKYBLUE,
    		                    outlineColor: Cesium.Color.BLACK,
    		                    outlineWidth: 2,
    		                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    		                    pixelOffset: new Cesium.Cartesian2(0, -30)
    		                },
    		            	billboard: {
		            	      image: typeInfo.icon,//对象类型对应的图标
		            	      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
		            	      verticalOrigin: Cesium.VerticalOrigin.CENTER,
		            	      width: 30,
		            	      height: 30,
		            	    },
		            	    model: {
		            	        uri: typeInfo.model,//对象类型对应的模型
		            	    },
    		            	path:{
    		            	  show:true,
		            	      width: 2,
		            	      leadTime: 6000,
		            	      trailTime: 6000,
    		            	}
    		            });
    		            //根据位置JSON对象设置entity的position对象（类型是PositionProperty）
    		            Cesium.CzmlDataSource.processPositionProperty(entity,"position",position);
    		            //添加后返回场景树里的对象节点
    		            var entityNode = currentScenario.addEntity(entity);
                	}
                },
                error: function (xhr, textStatus, errorThrown) {
                    /*错误信息处理*/
                }
            });
        	
        },
        //清除当前场景内所有对象
        clearEntities:function(){
        	currentScenario.clearEntities();
        },
        //移除当前场景
        clear: function() {
        	currentScenario.clearScene();
        }
    };
    //监测Demo中的属性
    Cesium.knockout.track(Demo);
    //把插件对象添加到插件管理器
    Plugins.add(Demo);
})();
