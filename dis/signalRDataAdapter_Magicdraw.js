(function() {
	
	let historyViewStr = "";
	//定义RealTime数据接收解析器
    var signalRDataAdapter = {
        //解析器名称，需要保持唯一,避免与其他解析器重复，否则无法使用
    	key:"signalRDataAdapter_Magicdraw",
        //是否和服务器同步时间
        isSynTime: true,
        //系统时间秒数
        sysTime:-1,
        //数据时间
        dataJd:new Cesium.JulianDate(),
        //服务器发送时间间隔，默认为1秒、之后会根据接收数据间隔通过位置姿态更新器更新
        timeStep: 1,
        //创建连接，并监听消息接收
        instance: function(url, rtNetWork) {
            this.rtNetWork = rtNetWork;
            var connection = new signalR.HubConnectionBuilder().withUrl(url).build();
            connection.on("ReceiveMessage", signalRDataAdapter.message);
            connection.start().then(function() {
            	
                console.log("Start");
                signalRDataAdapter.isSynTime = true;
            }).catch(function(err) {
                return console.error(err.toString());
            });
            return connection;
        },
        //消息接收方法
        message: function(msg) {
            try {
            	var sysTime = window.performance.now() / 1000;
                var data = $.parseJSON(msg);
                //解析数据对应的时间
                var time = data.time;
                time = time.replace("UTCG", "");
                var jd = Cesium.JulianDate.fromIso8601(time);
                
                if(signalRDataAdapter.sysTime>0){
                	if(Cesium.JulianDate.lessThan(signalRDataAdapter.dataJd,jd)){
                        //设置两次位置对应的仿真时间间隔
                        signalRDataAdapter.timeStep = Cesium.JulianDate.secondsDifference(jd, signalRDataAdapter.dataJd);
                    	signalRDataAdapter.dataJd = jd;
                        //设置两次位置接收的系统时间间隔
                        signalRDataAdapter.systemTimeStep = sysTime-signalRDataAdapter.sysTime;
                        signalRDataAdapter.sysTime=sysTime;
                	}
                }else{
                	signalRDataAdapter.dataJd = jd;
                	signalRDataAdapter.sysTime=sysTime;
                }
                
                
                //解析Entity对象集，并进行更新
                var entities = data.entities;
                if(entities){
                	for (var key in entities) {
                	 
                        if (entities.hasOwnProperty(key)) {
                        	//根据当前打开的场景通过key（源对象编号）获取场景内对应的Entity对象
                            var entity = signalRDataAdapter.rtNetWork.dataSource.getRealTimeEntity(key);
                            //如果没有，并且场景未设置：自动创建对象，则继续下一个对象更新
                            if (!Cesium.defined(entity) && signalRDataAdapter.rtNetWork.noFindCreate !== true) {
                                continue;
                            }
                            //获取Entity对应的数据
                            var value = entities[key];
                            ///*********************************************************************
                            //***	支持MagicRraw对象。前端修改、补全为 支持原有对象的格式
                            //*******************************************************************/	

                		if(value.hasOwnProperty("CustomProperty") && value.CustomProperty){
                			var magicdrawObj=value.CustomProperty;
                			
                			// 先从协议中获取离地高度
                			let heightOffset = 0.0;
                		      if(magicdrawObj.hasOwnProperty("Lift")){
                		           heightOffset = magicdrawObj.Lift;
                		 	}  
                		 	//计算得到 当前位置的 海拔高度
				       const height_asl = solarSystem.baseViewer.scene.globe.getHeight(Cesium.Cartographic.fromDegrees(magicdrawObj.Lon, magicdrawObj.Lat));
				       if (Cesium.defined(height_asl)) {
				            heightOffset = height_asl + heightOffset;
				        }
                		 	//海拔高度 + 离地高度，获得对象的实际高度
                			const position = Cesium.Cartesian3.fromDegrees(magicdrawObj.Lon, magicdrawObj.Lat,heightOffset);
                			value.position=Cesium.Cartesian3.pack(position,[]);
                			
                			
					//四元数  后台：heading 是 北为 0 ；cesium:东为0，所以增加270转化为cesium的。 
					const hpr = new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(magicdrawObj.Heading+270), Cesium.Math.toRadians(magicdrawObj.Pitch), Cesium.Math.toRadians(magicdrawObj.Roll));
					const orientation = Cesium.Transforms.headingPitchRollQuaternion(
					    position,
					    hpr
					);
					value.orientationEcf=Cesium.Quaternion.pack(orientation,[]);
					//速度   1、km/h -> m/s
					let speed =magicdrawObj.Speed*1000/3600;
					//  可能需要按照heading 换算。 看文档，后续会传这三个参数。
					value.velocity =[speed,0,0];
					// 三个速度值不能为0 ，为0 会报 Cesium  错误 ？？？！！！！ 暂时写死
					value.velocity =[37.872700530644956, -5.571897227305204, 18.346315946525802]
					console.log("magicdraw临时日志--------------------------------------")
                		}
                            ///////////////////////////////////////////////////////////////////////////////////////////////////
                            //end 上一段逻辑
                            ///////////////////////////////////////////////////////////////////////////////////////////////////
                            
                            if (!Cesium.defined(entity)) {

                                //获得场景的全局属性设置
                                var globalAttribute = CommonUtil.defaultVal(signalRDataAdapter, "rtNetWork.dataSource.globalAttribute", {});
                            	//根据数据创建Entity
                                var entityJson = EntityUpdater_Magicdraw.createEntity(jd, key, value,globalAttribute);
                                if (entityJson) {
                                	//将Entity添加至场景内
                                    entity = signalRDataAdapter.rtNetWork.dataSource.entities.add(entityJson);
                                    //为Entity在场景树状结构里添加节点
                                    sceneViewModel.addNode(entity);
                                }
                            }
                            //未找到对象继续下一步
                            if (!Cesium.defined(entity)) {
                                continue;
                            }
                            //设置对象的中心天体
                            if (value.centralBody) entity.centralBody = value.centralBody;
                            
                             //************************************************************
                            //处理 显示隐藏  是否替换新的模型文件
                             //************************************************************
                            if(value.hasOwnProperty("CustomProperty") && value.CustomProperty){
                            	entity.CustomProperty=value.CustomProperty;
                            	let obj = entity.CustomProperty;
                            	//判定显示 隐藏
	                             if(obj.hasOwnProperty("Objdisplay")){
	                             	 if(obj.Objdisplay){
	                             	 	 entity.show = true;
	                             	 }else{
	                             	 	  entity.show = false;
	                             	 }
	                             	 
	                             }
                            	
                        		if(obj.hasOwnProperty("IsDealModelOpt") && obj.IsDealModelOpt){
                        			
                        			if(obj.hasOwnProperty("ModelOpt") ){
                        				let modelurl = obj.ModelOpt;
                        				if(modelurl&&modelurl!=""&&modelurl!=".glb"){
                        					entity.model.uri = modelurl;
                        				}
                        			}
                        			
                        		}
                            	
                            }
                            ///////////////////////////////////////////////////////////////////////////////////////////////////
                            //end 上一段逻辑
                            ///////////////////////////////////////////////////////////////////////////////////////////////////
                            //更新对象
                            EntityUpdater_Magicdraw.update(jd, entity, value);
                        }
                    }
                }
                

                //解析Entity对象集，并进行更新
                var primitives = data.primitives;
                if(primitives){
                	for(var key in primitives){
                    	if (primitives.hasOwnProperty(key)) {
                            //获取Primitive对应的数据
                            var value = primitives[key];
                    		PrimitiveUpdater.update(jd,key,value);
                    	}
                    }
                }
                
                 
                 
                if (signalRDataAdapter.isSynTime) {
                	//更新场景时间
                    Cesium.JulianDate.clone(jd, solarSystem.clock.currentTime);
                    signalRDataAdapter.isSynTime = false;
                }
                //根据实收时间差和数据时间差，调整播放倍数
                var timeStep = signalRDataAdapter.timeStep;
                if (signalRDataAdapter.systemTimeStep) {
                    var multiplier = timeStep / signalRDataAdapter.systemTimeStep;
                    solarSystem.clock.multiplier = multiplier;
                }
                //如果数据时间小于或大于场景时间阈值，则更新场景时间
                var dt = Cesium.JulianDate.secondsDifference(jd, solarSystem.clock.currentTime);
                if (dt < 0 || dt > (signalRDataAdapter.timeStep + 0.03 * signalRDataAdapter.timeStep)) {
//                    console.log("dt: " + dt);
                    Cesium.JulianDate.clone(jd, solarSystem.clock.currentTime);
                }
                // console.log("Received Message: " + msg);
                //************************************************************
                //处理视角
                //*************************************************************
                 var RootCustomProperty = data.RootCustomProperty;
                 if(RootCustomProperty){

                 	 let useStr="";
                 	 if(RootCustomProperty.AngleViewMode ==1 ){//跟随模式
                 	 	 useStr = RootCustomProperty.AngleViewFo;
                 	 }else if(RootCustomProperty.AngleViewMode ==2 ){//自定义
                 	 	 useStr = RootCustomProperty.AngleViewData;
                 	  }else if(RootCustomProperty.AngleViewMode ==3 ){//月球中视角
                 	  	useStr = RootCustomProperty.AngleViewOpt;
                 	}	 	 
                 	  //if( useStr == historyViewStr){
                 	 //	     return;
                 	  //    }else{
                 	 //		historyViewStr = useStr;
             //		}
                 	 
                 	 if(RootCustomProperty.AngleViewMode ==1 ){//跟随模式			
                 	 	let tempArr = useStr.split(",");
                 	 	let trackEntity = signalRDataAdapter.rtNetWork.dataSource.getRealTimeEntity(tempArr[0]);
                 	 	let viewFromValue  = undefined;
                 	 	if(tempArr.length>2){
                 	 	    viewFromValue =offsetFromHeadingPitchRange(Cesium.Math.toRadians(parseFloat(tempArr[2])),Cesium.Math.toRadians(parseFloat(tempArr[3])),parseFloat(tempArr[1]));
                 	 	}
                 	 	
                 	 	if(Cesium.defined(trackEntity)){
                 	 		if(solarSystem.baseViewer.trackedEntity ){
                 	 			if(solarSystem.baseViewer.trackedEntity._id !=trackEntity._id ){
                 	 				SetTrackEntity(trackEntity,viewFromValue);
                 	 			}else{
                 	 				//todo 比较viewFrom
                 	 			}
                 	 		
                 	 		}else{
                 	 			SetTrackEntity(trackEntity,viewFromValue);
                 	 		}
				}
                 	 	
                 	 }else if(RootCustomProperty.AngleViewMode ==2 ){//自定义
                 	 	 
                 	 	 ClearCamera()
                 	 	 let tempArr = useStr.split(",");
                 	 	 const center =  Cesium.Cartesian3.fromDegrees(parseFloat(tempArr[0]), parseFloat(tempArr[1]));
				const heading =   Cesium.Math.toRadians(parseFloat(tempArr[3]));// 水平旋转  -正北方向
				const pitch =  Cesium.Math.toRadians(parseFloat(tempArr[4])); // 上下旋转  --俯视朝向
				const range = parseFloat(tempArr[2]); // 目标点高度
				solarSystem.baseViewer.camera.lookAt(center, new Cesium.HeadingPitchRange(heading, pitch, range));
				solarSystem.baseViewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
                 	 	
                 	 }else if(RootCustomProperty.AngleViewMode ==3 ){//月球中视角

                 	 	SetViewName(useStr);
                 	 	
                 	 }
                 }
                 ///////////////////////////////////////////////////////////////////////////////////////////////////
                //end 上一段逻辑
                ///////////////////////////////////////////////////////////////////////////////////////////////////
                 
            } catch (e) {
                console.log(e);
            }
        },
        destroy: function(nwInstance) {
        	//销毁场景时关闭连接
            if (nwInstance && nwInstance.stop) nwInstance.stop();
            //清除Primitive对象
            PrimitiveUpdater.clear();
        }
    };
    //注册RealTime对象消息接收处理器
    Cesium.DataAdapter.add(signalRDataAdapter);
    //**************************************************************
    ///自己添加的方法
    //********************************************************************
    	//清除状态
    function ClearCamera(){
      solarSystem.baseViewer.globeControllerTb.viewModel.checked=false;
	solarSystem.baseViewer.shouldAnimate=false;
	solarSystem.baseViewer.trackedEntity=undefined;
	var offset = Cesium.Cartesian3.clone(solarSystem.baseViewer.camera.position);
	solarSystem.baseViewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY, offset);
    }
    // 设置 track
    function SetTrackEntity(entity,viewFrom){
	ClearCamera();
	entity.viewFrom  = viewFrom;
	solarSystem.baseViewer.trackedEntity=entity;
    }
    
    function SetViewName(needViewName){
    		if(sceneViewModel.dataSource.storedViews){
			let storedView=null;
			sceneViewModel.dataSource.storedViews.forEach(value=>{
				if(storedView ==null && needViewName == value.name){
					storedView =value;
				}
			})
			if(storedView){
				
				if(Cesium.defined(storedView.transform)){
				ClearCamera();
					setTimeout(function(){
						var transform=Cesium.Matrix4.unpack(storedView.transform);
						var position = storedView.view.destination;
						var offset = new Cesium.Cartesian3(position.x,position.y,position.z);
						solarSystem.baseViewer.camera.lookAtTransform(transform, offset);
					},20);
				}else{
					ClearCamera();
					console.log(storedView);
					solarSystem.baseViewer.camera.setView(storedView.view);
				}
				
			}
		}
    	
    }
    	function offsetFromHeadingPitchRange(heading, pitch, range) {
	  pitch = Cesium.Math.clamp(
	    pitch,
	    -Cesium.Math.PI_OVER_TWO,
	    Cesium.Math.PI_OVER_TWO
	  );
	  heading = Cesium.Math.zeroToTwoPi(heading) - Cesium.Math.PI_OVER_TWO;

	  const pitchQuat = Cesium.Quaternion.fromAxisAngle(
	    Cesium.Cartesian3.UNIT_Y,
	    -pitch,
	    new Cesium.Quaternion()
	  );
	  const headingQuat = Cesium.Quaternion.fromAxisAngle(
	    Cesium.Cartesian3.UNIT_Z,
	    -heading,
	    new Cesium.Quaternion()
	  );
	  const rotQuat = Cesium.Quaternion.multiply(headingQuat, pitchQuat, headingQuat);
	  const rotMatrix = Cesium.Matrix3.fromQuaternion(
	    rotQuat,
	    new Cesium.Matrix3()
	  );

	  const offset = Cesium.Cartesian3.clone(
	    Cesium.Cartesian3.UNIT_X,
	    new Cesium.Cartesian3()
	  );
	  Cesium.Matrix3.multiplyByVector(rotMatrix, offset, offset);
	  Cesium.Cartesian3.negate(offset, offset);
	  Cesium.Cartesian3.multiplyByScalar(offset, range, offset);
	  return offset;
	}
	
	
})();