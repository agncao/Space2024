(function(){
	//获取平台管理对象
	var yyastk = window.getYYASTK();
	var tle=""
	var VModel={
		targeted:{
			html:"",
			value:""
		},
		Start_UTCG:"",
		Stop_UTCG:"",
		TolMaxDistance:5,
		TolCrossDt:{
			use:false,
			value:10
		},
		TolTheta:{
			use:false,
			value:1
		},
		TolDh:{
			use:true,
			value:30
		},
		ImportSat:{
			auto:true,
			value:10
		},
		Access:{
			auto:false,
			showLine:true,
			animateHighlight:true,
			staticHighlight:true,
		},
		selectEntity:function(bt,inputClass){
			CACompute.selectEntity(bt,inputClass);
		},
		compute:function(data, event){
			CACompute.compute(event.currentTarget);
		},
		download:function(data, event){
			CACompute.download(event.currentTarget);
		},
		selectTce:function(data,event){
			CACompute.selectTce(event.currentTarget);
		},
		changeStartTime:function(data,event){
			data.Start_UTCG=$(event.currentTarget).val();
		},
		changeSopTime:function(data,event){
			data.Stop_UTCG=$(event.currentTarget).val();
		}
	};
	var CAEntityTypes=[
		"satellite","missile","launchVehicle"
	];
	var CACompute={
		id:"Plugins_CACompute",
		menu:{
			click:function(element){
				if(!CACompute.isInit){
					CACompute.isInit=true;
					CACompute.init();
				}
				if(!sceneViewModel.dataSource){
    	    		layer.msg("请先新建或打开场景！");
    	  			return ;
    	    	}
				var entity = sceneViewModel.getSelectedEntity();
				if(entity){
					var SGP4 = CommonUtil.defaultVal(entity,"A805_Properties.SGP4",{});
					if(entity&&SGP4.TLE_Line1){
						VModel.targeted.html=entity.name;
						VModel.targeted.value=entity.id;
					}
				}
				
				delete CACompute.result;
				$(".plugins_CACompute_Results").hide();
				const openNewLayerIndex = layer.open({
			      	  type: 1,
			      	  title: "碰撞分析",
			      	  shadeClose: true,
			      	  shade: false,
			      	  area: '990px', // 宽高
			      	  offset: [85+'px', ($(window).width()-995)+'px'],
			      	  success: function(layero, index){
			      		var globalAttribute =CommonUtil.defaultVal(sceneViewModel.dataSource,"globalAttribute",{});
			      		var startTime = CommonUtil.eval("globalAttribute.analysis.startTime");
			      		if(!startTime){
			      			startTime=Cesium.JulianDate.toIso8601(sceneViewModel.dataSource.clock.startTime, 1);
			      		}
			      		VModel.Start_UTCG=startTime;
			      		var stopTime = CommonUtil.eval("globalAttribute.analysis.stopTime");
			      		if(!stopTime){
			      			stopTime=Cesium.JulianDate.toIso8601(sceneViewModel.dataSource.clock.stopTime, 1);
			      		}
			      		VModel.Stop_UTCG=stopTime;
			          },
			          content:$('#plugins_CACompute'),
			          btn: [],
	    	    	  end:function(){
	    	    	  }
			      });
			}
		},
		init:function(){
			Cesium.knockout.track(VModel.targeted);
			Cesium.knockout.track(VModel);
			Cesium.knockout.applyBindings(VModel,$('#plugins_CACompute').get(0));
		},
		selectEntity:function(bt,inputClass){
			var id=$("."+inputClass).attr("value");
			var selectedEntity;
			if(id&&id.indexOf(" ")>0){
				selectedEntity={
					id:id.indexOf(" ")[0]
				}
			}
			EntityParentSelector.show({
				selectedEntity:selectedEntity,
				parentTypes:CAEntityTypes,
//				isParent:false,
    			handler:function(data){
    				VModel.targeted.value=data.id;
    				VModel.targeted.html=data.name;
    				$("."+inputClass).attr("value",data.id);
    				$("."+inputClass).html(data.name);
    			},
    			owner:null
    		});
		},
		checkEntityType:function(entity){
			if(!CAEntityTypes.contains(entity.entityType)){
				layer.msg("对象【"+entity.name+"】不支持此分析功能！");
	  			return false;
			}
			return true;
		},
		compute:function(bt){
			if(CACompute.isStart==true){
	    		layer.msg("正在计算…");
				return ;
			}
			var entity = sceneViewModel.getEntity(VModel.targeted.value);
			if(!entity){
	    		layer.msg("请选择分析对象！");
	  			return ;
			}
			if(!this.checkEntityType(entity)){
	  			return ;
			}
			var serverAPI = getWebApi("CloseApproach");
			if (serverAPI.status == 0) {
				layer.msg(serverAPI.error);
				return false;
			}
			var startTime =Cesium.JulianDate.fromIso8601(VModel.Start_UTCG);
			var stopTime =Cesium.JulianDate.fromIso8601(VModel.Stop_UTCG);
			var days=Cesium.JulianDate.daysDifference(stopTime,startTime);
			if(days<0){
				layer.msg("结束时间不能小于开始时间！");
	  			return ;
			}
			if(days>3){
				var that = this;
				layer.confirm('分析时间大于3天，是否要继续？', {
				  btn: ['确定','取消'] //按钮
				}, function(index){
					layer.close(index);
					that.computeStart_(bt);
				}, function(){
				});
			}else{
				this.computeStart_(bt);
			}
		},
		getServerInfo:function(entity){
			var SGP4 = CommonUtil.defaultVal(entity,"A805_Properties.SGP4",{});
			var serverAPI = getWebApi("CloseApproach");
			var params={
				Start_UTCG:VModel.Start_UTCG,
				Stop_UTCG:VModel.Stop_UTCG,
				TolMaxDistance:parseFloat(VModel.TolMaxDistance),
			};
			var url = serverAPI.url;
			if(SGP4.TLE_Line1){
				params.SAT1={
					SAT_Name:SGP4.CommonName,
					SAT_Number:SGP4.SatelliteNumber,
					TLE_Line1:SGP4.TLE_Line1,
					TLE_Line2:SGP4.TLE_Line2,
				};
			}else{
				url = serverAPI.entityPositionCzmlUrl;
				var centralBody = entity.centralBody;
				var entitydata = yyastk.ProtoTreeData.toCZML(entity);
				var SAT1 = entitydata.position;
				if(!SAT1){
		    		layer.msg("无法获取对象位置信息，不能进行碰撞分析！");
					return;
				}
				SAT1.CentralBody = centralBody;
				params.SAT1=SAT1;
			}
			if(CACompute.CA_Targets){
				params.Targets=CACompute.CA_Targets;
			}
			if(VModel.TolCrossDt.use==true){
				params.TolCrossDt=parseFloat(VModel.TolCrossDt.value);
			}
			if(VModel.TolTheta.use==true){
				params.TolTheta=parseFloat(VModel.TolTheta.value);
			}
			if(VModel.TolDh.use==true){
				params.TolDh=parseFloat(VModel.TolDh.value);
			}
			return {
				url:url,
				params:params
			};
		},
		computeStart_:function(bt){
			var entity = sceneViewModel.getEntity(VModel.targeted.value);
			var serverInfo = this.getServerInfo(entity);
			if(!serverInfo){
				return;
			}
			var SGP4 = CommonUtil.defaultVal(entity,"A805_Properties.SGP4",{});
			$(bt).addClass("draw-bt-a");
			CACompute.isStart = true;
			$(bt).find(".plugins_CACompute_bt").html("计算中…");
			delete CACompute.result;
			$(".plugins_CACompute_Results").hide();
			console.log("WebApi:"+serverInfo.url);
			console.log(serverInfo.params);
			return PromiseUtils.postPromise({
				url: serverInfo.url,
				data: serverInfo.params
			}).then(function (result) {
				CACompute.result = result;
				console.log(result);
				$(".plugins_CACompute_Results_Info").empty();
				$(".plugins_CACompute_Results_List").empty();
				var satName = SGP4.CommonName||entity.name;
				var satNumber = SGP4.SatelliteNumber||"";
				//目标总数
				var TotalNumber = result.TotalNumber;
				//近地点、远地点高度过滤后的总数
				var AfterApoPeriFilterNumber = result.AfterApoPeriFilterNumber;
				//轨道面交点过滤后的总目标数
				var AfterCrossPlaneNumber = result.AfterCrossPlaneNumber;
				var results =result.CA_Results;
				$(".plugins_CACompute_Results_Info").append("分析对象<br>");
				$(".plugins_CACompute_Results_Info").append("编号："+satNumber+"<br>");
				$(".plugins_CACompute_Results_Info").append("名称："+satName+"<br>");
				$(".plugins_CACompute_Results_Info").append("结果信息<br>");
				$(".plugins_CACompute_Results_Info").append("目标总数："+TotalNumber+"个<br>");
				$(".plugins_CACompute_Results_Info").append("近地点、远地点高度过滤后的总数："+AfterApoPeriFilterNumber+"个<br>");
				$(".plugins_CACompute_Results_Info").append("轨道面交点过滤后的总目标数："+AfterCrossPlaneNumber+"个<br>");
				var count = results?results.length:0;
				$(".plugins_CACompute_Results_Info").append("满足条件的总目标数："+count+"个<br>");
				$(".plugins_CACompute_Results").removeClass("hide");
				$(".plugins_CACompute_Results").show();
				var tbody=$('.plugins_CACompute_Results_List');
				var results =result.CA_Results;
				if(results){
					var entityJsonPromises = [];
					var options={
							color:{
								rgbaf:[1,1,1,1]
							}
					};
					for(var i=0;i<results.length;i++){
						var r = results[i];
						var tr =$('<tr></tr>');
						tbody.append(tr);
						tr.append('<td>'+r.SAT2_Number+'</td>');
						var name = r.SAT2_Name?r.SAT2_Name:"";
						tr.append('<td>'+name+'</td>');
						tr.append('<td>'+r.CA_MinRange_Time+'</td>');
						tr.append('<td>'+r.CA_MinRange+'</td>');
						tr.append('<td>'+r.CA_Theta+'</td>');
						tr.append('<td>'+r.CA_DeltaV+'</td>');
						tr.append('<td>'+r.CA_Probability+'</td>');
						if(VModel.ImportSat.auto==true&&i<VModel.ImportSat.value){
							var jsonProm = CACompute.getEntityJson({
//								    "RevolutionNumber": 36739,
								    "Active": false,
//								    "TleEpoch": "2022-08-30T18:26:36.641Z",
								    "SatelliteNumber": r.SAT2_Number,
//								    "OfficialName": "NOAA 1",
								    "TLE_Line1": r.SAT2_TLE_Line1,
								    "TLE_Line2": r.SAT2_TLE_Line2,
								    "Period": 6889.912890496399,
								    "Step": 60,
								    "CommonName": r.SAT2_Name
							}, options);
							entityJsonPromises.push(jsonProm);
						}
					}
					if(VModel.ImportSat.auto==true){
						CACompute.importScene(entityJsonPromises,bt);
					}else{
						CACompute.stop(bt);
					}
				}else{
					CACompute.stop(bt);
				}
				
				if (result.IsSuccess) {
					
				}else{
					yyastk.msgStatusBar.add(Cesium.MsgType.ERROR,"碰撞分析","请求碰撞分析服务："+result.Message);
					layer.alert(result.Message);
				}
			}).catch(function (e) {
				yyastk.msgStatusBar.add(Cesium.MsgType.ERROR,"碰撞分析","请求碰撞分析服务："+(e.message || e));
				layer.alert(e.message || e);
				CACompute.stop(bt);
			});;
		},
		getEntityJson: function (data,options) {
			var serverAPI = getWebApi("ssc", undefined, "Earth");
			if (serverAPI.status == 0) {
				return false;
			}
			var clock = sceneViewModel.dataSource.clock;
			var params = {
				"Start": clock.startTime.toString(),
				"Stop": clock.stopTime.toString(),
				"TLEs": [
					data.TLE_Line1,
					data.TLE_Line2
				],
			};
			return PromiseUtils.postPromise({
				url: serverAPI.sgp4,
				data: params
			}).then(function (sgp4Data) {
				if (sgp4Data.IsSuccess) {
					var position = sgp4Data.Position;
					var cname = data.CommonName?data.CommonName:"卫星";
					var name = cname + "_" + data.SatelliteNumber;
					console.log(name);
					var step = 60;
					if (position.cartesian) {
						step = position.cartesian[4] - position.cartesian[0];
					} else if (position.cartesianVelocity) {
						step = position.cartesianVelocity[7] - position.cartesianVelocity[0];
					}
					data.Step = step;
					var ret = {
						availability: clock.startTime.toString() + "/" + clock.stopTime.toString(),
						centralBody: position.CentralBody,
						entityType: "satellite",
						A805_Properties: {
							propagator: "SGP4",
							startTime: clock.startTime.toString(),
							stopTime: clock.stopTime.toString(),
							SGP4: data,
							Path: {
								OribtTrack: {
									Leading: { type: 'Half' },
									Trailing: { type: 'Half' }
								}
							}
						},
						name: name,
						isSameName: true,
						position: position,
						path: Object.clone(sceneViewModel.globalAttribute.path),
						billboard: Object.clone(sceneViewModel.globalAttribute.billboard),
						label: Object.clone(sceneViewModel.globalAttribute.label),
						model: Object.clone(sceneViewModel.globalAttribute.model)
					};

					ret.billboard.heightReference = "NONE";
					ret.billboard.verticalOrigin = "CENTER";

					ret.label.heightReference = "NONE";
					ret.model.heightReference = "NONE";
					var entityTypeInfo = entityTypeUtils.getTypeInfo("satellite");
					if (entityTypeInfo) {
						ret.billboard.image = entityTypeInfo.icon;
						ret.model.gltf = entityTypeInfo.model;
					}
					ret.label.text = ret.name;
					ret.label.fillColor = options.color;
					if (!ret.path.material) {
						ret.path.material = {};
					}
					if (!ret.path.material.solidColor) {
						ret.path.material.solidColor = {};
					}
					ret.path.leadTime = sgp4Data.Period / 2;
					ret.path.trailTime = sgp4Data.Period / 2;
					ret.path.material.solidColor.color = options.color;
					return Promise.resolve(ret);

				} else {
					layer.msg(sgp4Data.Message);
					return Promise.reject(false);
				}
			});
		},
		importScene:function(entityJsonPromises,bt){
			if (entityJsonPromises.length == 0) {
				CACompute.stop(bt);
				return false;
			}
			Promise.all(entityJsonPromises).then(function (entityJsons) {
				var namesIds = ProtoTreeData.getEntityNamesIds();
				var names = namesIds.names;
				var ids = namesIds.ids;
				for (var i = 0; i < entityJsons.length; i++) {
					var data = entityJsons[i];
					var newName = FileUtils.createUniqueName(data.name, names);
					if(data.name!=newName){
						names.push(newName);
						data.name = newName;
					}
					if (!Cesium.defined(data.id)) {
						var type_ = CommonUtil.upperCaseFirst(data.entityType);
						var id = type_ + "/" + type_;
						var newId = FileUtils.createUniqueName(id, ids);
						ids.push(newId);
						data.id = newId;
					}
				}

				var czml = entityLoad.getEntitiesCzml(entityJsons);
				var promise = ProtoTreeData.dataSource.load(czml);
				promise.then(function (dataSource) {
					var entities = dataSource.entities.values;
					if (entities.length == 0) {
						return;
					}

					var sentity = sceneViewModel.getEntity(VModel.targeted.value);
					for (var i = 0; i < entities.length; i++) {
						var entity = entities[i];
						sceneViewModel.addEntity(entity);
						var controllers = AttitudeUtils.getValidControllers(entity.entityType);
						if(controllers){
							var data={
									A805_Properties:{
										orientation:{
											method:"Standard",
											StkExternal:{isUse:false},
											basic:{
												controller:controllers[0].type
											}
										}
									}
							};
							AttitudeUtils.updateOrientation(entity,data);
						}
					}
					
					if(VModel.Access.auto==true){
						CommonUtil.evalVal(sentity,"A805_Properties.Constrains.Basic.Range.min",0);
						sentity.A805_Properties.Constrains.Basic.Range.minEnable=true;
						sentity.A805_Properties.Constrains.Basic.Range.maxEnable=true;
						sentity.A805_Properties.Constrains.Basic.Range.max=VModel.TolMaxDistance*1000;
						
						var accessPromises = [];
						for (var i = 0; i < entities.length; i++) {
							var entity = entities[i];
							var p=AccessUtils.createAccess(sentity,entity);
							accessPromises.push(p);
						}
						Promise.all(accessPromises).then(function (accesses) {
							for(var i=0;i<accesses.length;i++){
								var accessEntity=accesses[i];
								sceneViewModel.addEntity(accessEntity);
							}
							layer.msg("添加成功！");
							CACompute.stop(bt);
						}).catch(function (e) {
							layer.alert(e.message || e);
							CACompute.stop(bt);
						});
					}else{
						layer.msg("添加成功！");
						CACompute.stop(bt);
					}
					
				}).catch(function (e) {
					layer.alert(e.message || e);
					CACompute.stop(bt);
				});
			}).catch(function (e) {
				layer.msg(e.message || e);
				CACompute.stop(bt);
			});
		},
		stop:function(bt){
			CACompute.isStart = false;
			$(bt).removeClass("draw-bt-a");
			$(bt).find(".plugins_CACompute_bt").html("计算");
		},
		selectTce:function(fileInput){
			FileUtils.readText(fileInput.files[0], function(reader) {
				var CA_TLE=reader.result;
				var CA_TLEs=CA_TLE.split("\n");
				let CA_Targets=[];
				for(var i=0;i<CA_TLEs.length;i+=2){
					var tle1 = CA_TLEs[i];
					var tle2 = CA_TLEs[i+1];
					if(tle1&&tle2&&tle1!=""&&tle2!=""){
						CA_Targets.push({
							TLE_Line1:tle1.replaceAll("\r",""),
							TLE_Line2:tle2.replaceAll("\r",""),
						});
					}
				}
				CACompute.CA_Targets=CA_Targets;
			});
		},
		download:function(){
			if(CACompute.result){
				var result=CACompute.result;
				var entity = sceneViewModel.getEntity(VModel.targeted.value);
				var SGP4 = CommonUtil.defaultVal(entity,"A805_Properties.SGP4",{});
				var sheetObj = [];
				var satName = SGP4.CommonName;
				var satNumber = SGP4.SatelliteNumber;
				//目标总数
				var TotalNumber = result.TotalNumber;
				//近地点、远地点高度过滤后的总数
				var AfterApoPeriFilterNumber = result.AfterApoPeriFilterNumber;
				//轨道面交点过滤后的总目标数
				var AfterCrossPlaneNumber = result.AfterCrossPlaneNumber;
				sheetObj.push(["目标卫星"]);
				sheetObj.push(["编号："+satNumber]);
				sheetObj.push(["名称："+satName]);
				sheetObj.push(["开始时间："+VModel.Start_UTCG]);
				sheetObj.push(["结束时间："+VModel.Stop_UTCG]);
				sheetObj.push(["结果信息"]);
				sheetObj.push(["目标总数："+TotalNumber+"个"]);
				sheetObj.push(["近地点、远地点高度过滤后的总数："+AfterApoPeriFilterNumber+"个"]);
				sheetObj.push(["轨道面交点过滤后的总目标数："+AfterCrossPlaneNumber+"个"]);
				var results =result.CA_Results;
				var count = results?results.length:0;
				sheetObj.push(["满足条件的总目标数："+count+"个"]);
				
				sheetObj.push(["编号","名称","最近距离时刻\n(UTCG)","最近距离\n(km)","赤道面夹角\n(deg)","相对速度\n(km/s)","碰撞概率\n(1为完全碰撞)"]);

				if(results){
					for(var i=0;i<results.length;i++){
						var r = results[i];
						var name = r.SAT2_Name?r.SAT2_Name:"";
						sheetObj.push([r.SAT2_Number,name,r.CA_MinRange_Time,r.CA_MinRange,r.CA_Theta,r.CA_DeltaV,r.CA_Probability]);
					}
				}
				var sheetData={};
				var data = sheetData[satName]=XLSX.utils.aoa_to_sheet(sheetObj);
				var w = 4.1;
				data['!cols']=[];
				data['!cols'].push({ wch: 2*w });
				data['!cols'].push({ wch: 2*w });
				data['!cols'].push({ wch: 6*w });
				data['!cols'].push({ wch: 4*w });
				data['!cols'].push({ wch: 5*w });
				data['!cols'].push({ wch: 4*w });
				data['!cols'].push({ wch: 4*w });
				data["!merges"] = [
					{//合并第一行数据[A1,B1,C1,D1,E1]
		                s: {//s为开始
		                    c: 0,//开始列
		                    r: 0//开始取值范围
		                },
		                e: {//e结束
		                    c: 6,//结束列
		                    r: 0//结束范围
		                }
					},
					{
		                s: {
		                    c: 0,r: 1
		                },
		                e: {
		                    c: 6,r: 1
		                }
					},
					{
		                s: {
		                    c: 0,r: 2
		                },
		                e: {
		                    c: 6,r: 2
		                }
					},
					{
		                s: {
		                    c: 0,r: 3
		                },
		                e: {
		                    c: 6,r: 3
		                }
					},
					{
		                s: {
		                    c: 0,r: 4
		                },
		                e: {
		                    c: 6,r: 4
		                }
					},
					{
		                s: {
		                    c: 0,r: 5
		                },
		                e: {
		                    c: 6,r: 5
		                }
					},
					{
		                s: {
		                    c: 0,r: 6
		                },
		                e: {
		                    c: 6,r: 6
		                }
					},
					{
		                s: {
		                    c: 0,r: 7
		                },
		                e: {
		                    c: 6,r: 7
		                }
					},
					{
		                s: {
		                    c: 0,r: 8
		                },
		                e: {
		                    c: 6,r: 8
		                }
					},
					{
		                s: {
		                    c: 0,r: 9
		                },
		                e: {
		                    c: 6,r: 9
		                }
					},
				];
				var blob = ExcelUtils.sheets2blob(sheetData);
				var name = satName+"("+satNumber+")";
				ExcelUtils.openDownloadDialog(blob,name+".xlsx");
			}else{
				layer.msg("没有分析结果，请先计算！");
			}
		}
	};
	Plugins.add(CACompute);
})();
