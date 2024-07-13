(function(){

	var p1=new Cesium.Cartographic(),p2=new Cesium.Cartographic();
	var VModel={
		maxAspect:10,
		speed:20,
		positions:[],
		delPos:function(index){
			VModel.positions.removeAt(index);
			solarSystem.removeEntity(routing.pointEntities[index]);
			routing.pointEntities.removeAt(index);
		},
		clickPoint:function(data, event){
			routing.clickPoint(event.currentTarget);
		},
		clearPoints:function(){
			sceneViewModel.drawTool.clear(true);
			VModel.positions=[];
			routing.clearEntities();
		},
		compute:function(data, event){
			routing.compute(event.currentTarget);
		},
		addToScene:function(data, event){
			routing.addToScene(event.currentTarget);
		},
		selectPositions:function(data,event){
			var fileInput =event.currentTarget;
			FileUtils.readText(fileInput.files[0], function(reader) {
				var data=reader.result;
				var data=data.split("\n");
				if(data.length>0){
    				sceneViewModel.drawTool.clear(true);
					VModel.positions=[];
					routing.clearEntities();
					var headers = data[0].split(",");
					var fieldIndexs =CSVUtils.getFieldIndexs(headers,{
						lon:{
							defaultIndex:0,
							keys:['经度',"longitude","lon"]
						},
						lat:{
							defaultIndex:1,
							keys:['纬度',"latitude","lat"]
						}
					});
					for(var i=1;i<data.length;i++){
						var ps = data[i].split(",");
						var ret=CSVUtils.toJson(fieldIndexs,ps);
						routing.addPoint(parseFloat(ret.lon),parseFloat(ret.lat));
					}
				}else{
		    		layer.msg("没有读取到位置数据，请检查文件，确保文件编码为utf-8！");
				}
				
			});
		}
	};
	
	var routing={
		//插件唯一编号
		id:"Plugins_routing",
		entities:[],
		pointEntities:[],
		menu:{
			//点击菜单后触发的事件
			click:function(element){
				if(!routing.isInit){
					routing.isInit=true;
					Cesium.knockout.track(VModel);
					Cesium.knockout.applyBindings(VModel,$('#plugins_routing').get(0));
				}
				const openNewLayerIndex = layer.open({
			      	  type: 1,
			      	  title: "路径分析",
			      	  shadeClose: true,
			      	  shade: false,
			      	  area: '340px', // 宽高
			      	  offset: ['140px', ($(window).width()-450)+'px'],
			      	  success: function(layero, index){
			          },
			          content:$('#plugins_routing'),
			          btn: [],
	    	    	  end:function(){
	    	    		layer.close(routing.chartLayer);
	    				routing.stop(routing.bt);
	    				routing.clearEntities();
	    				sceneViewModel.drawTool.clear(true);
	    				sceneViewModel.drawTool.stop();
	    	    	  }
			      });
				VModel.positions=[];
			}
		},
		clearEntities:function(){
			if(currentEnitiy!=null){
  				solarSystem.removeEntity(currentEnitiy);
			}
  			for(var i=0;i<routing.pointEntities.length;i++){
  				solarSystem.removeEntity(routing.pointEntities[i]);
  			}
  			routing.pointEntities.clear();
  			
  			for(var i=0;i<routing.entities.length;i++){
  				solarSystem.removeEntity(routing.entities[i]);
  			}
  			routing.entities.clear();
		},
		addPoint:function(longitude, latitude){
    		var ellipsoid = getSceneEllipsoid();
			var pos = Cesium.Cartesian3.fromDegrees(longitude, latitude, 0, ellipsoid, worldPosition);
			var entity = solarSystem.addEntity({
	        	position: pos,
	        	billboard : {
	                image : ctx +'/resources/moon/images/mapIcons/green_flag.png',
	                scale:0.5,
	                verticalOrigin:Cesium.VerticalOrigin.BOTTOM,
	                heightReference:Cesium.HeightReference.CLAMP_TO_GROUND,
	                color:Cesium.Color.LIME 
	            }
	        });
			routing.pointEntities.push(entity);
			VModel.positions.push({
				lon:longitude,
				lat:latitude
			});
		},
		clickPoint:function(input){
			if($(input).hasClass("draw-bt-a")){
				sceneViewModel.drawTool.clear(true);
				sceneViewModel.drawTool.stop();
				$(input).removeClass("draw-bt-a");
				return ;
			}
			$(input).addClass("draw-bt-a");
	    	sceneViewModel.drawTool.draw("point",function(ps){
				if(ps.length<1){
					return;
				}
				var pos = Cesium.Cartographic.fromCartesian(ps[0]);
				routing.addPoint(Cesium.Math.toDegrees(pos.longitude),Cesium.Math.toDegrees(pos.latitude));
				sceneViewModel.drawTool.clear(true);
			},function(){
				sceneViewModel.drawTool.clear(true);
			});
		},
		compute:function(bt){
			routing.bt = bt;
			if(routing.isStart==true){
	    		layer.msg("正在计算…");
				return ;
			}
			var positions = VModel.positions;
			if(!positions||positions.length<2){
	    		layer.msg("请添加位置，至少需要2个点！");
	  			return ;
			}
			var serverAPI = getWebApi("routing");
			if (serverAPI.status == 0) {
				layer.msg(serverAPI.error);
				return false;
			}
			this.computeStart_(bt);
		},
		computeStart_:function(bt){
			for(var i=0;i<routing.entities.length;i++){
				solarSystem.removeEntity(routing.entities[i]);
			}
			routing.entities.clear();
			//调用WebAPI配置服务内容
			var serverAPI = getWebApi("routing");
			$(bt).addClass("draw-bt-a");
			routing.isStart = true;
			$(bt).find(".plugins_routing_bt").html("计算中…");
			var starttime = new Date().format("yyyyMMddhhmmss",false);
			var maxAspect =VModel.maxAspect;
			var speed = parseFloat(VModel.speed)*1000;
			var positions = VModel.positions;
			var promises = [];
			for(var i=0;i<positions.length-1;i++){
				var p1 = positions[i];
				var p2 = positions[i+1];
				var params="?lon1="+p1.lon+"&lat1="+p1.lat+"&lon2="+p2.lon+"&lat2="+p2.lat+"&maxGradient="+maxAspect+"&speed="+speed+"&starttime="+starttime;
				console.log(params);
				var posmise=PromiseUtils.getPromise(serverAPI.url+params);
				promises.push(posmise);
			}
			var chartDivId = "routingAnalyser_chart";
	    	if(this.myChart==null){
	    		this.chartContent = $("<div></div>");
	    		this.chartContent.width($(window).width()-224);
	    		this.chartContent.height($(window).height()*0.3);
	    		this.chartDiv = $("<div style='width:100%;height:100%;'></div>");
	    		this.chartDiv.width($(window).width()-224);
	    		this.chartDiv.height($(window).height()*0.3);
	    		this.chartContent.append(this.chartDiv);
	    		this.chartDiv.attr("id",chartDivId);
	    		this.synStatusDiv = $('<div style="position: absolute;top: 22%;left: calc(50% - 80px);font-size: 30px;color: #57ff43;"><i class="fas fa-spinner fa-pulse" style=""></i>正在分析…<span style="color:#efff00;font-size: 25px;"></span></div>');
	    		this.chartContent.append(this.synStatusDiv);
	    		this.chartContent.hide();
	    		$(document.body).append(this.chartContent);
	    		this.synStatusDivSpan = this.synStatusDiv.find("span");
	    		this.myChart = echarts.init(document.getElementById(chartDivId), "dark");
	    		
	    	}
	    	this.chartDiv.hide();
	    	this.synStatusDiv.show();
	    	var top = $(window).height()*0.7-93;
	    	var left=220;
	    	this.chartLayer = layer.open({
			  id:"layer_"+chartDivId,
			  type: 1,
			  offset: [top+'px', left+'px'],
			  area:($(window).width()-220)+"px",
			  title:"路径分析结果",
			  skin: 'layui-layer-dark', //样式类名
			  zIndex:39999999,
			  anim: 0,
			  shade:0,
			  shadeClose: false, //开启遮罩关闭
			  content: this.chartContent,
			  cancel: function(index, layero){
				  routing.chartContent.hide();
				  return true;
			  },
			  resizing: function(layero){
				  routing.chartContent.width(layero.width());
				  routing.chartContent.height(layero.height()-25);
				  routing.chartDiv.width(routing.chartContent.width());
				  routing.chartDiv.height(routing.chartContent.height());
				  routing.myChart.resize();
			  }  
			});
	    	routing.chartContent.show();
			Promise.all(promises).then(function (rets) {
				console.log(rets);
				var data={
						paths:[],
						dem:[],
						aspect:[],
						slope:[],
						times:[]
				};
				for(var i=0;i<rets.length;i++){
					var ret = rets[i];
					if(ret.status==true){
						var paths=ret.result.paths;
						for(var k=0;k<paths.length;k++){
							var p = paths[k];
							var geom = p.geometry;
							data.paths = data.paths.concat(geomToArray(geom));
							data.dem= data.dem.concat(p.dem);
							data.aspect= data.aspect.concat(p.aspect);
							data.slope= data.slope.concat(p.slope);
							data.times= data.times.concat(p.usedtime);
						}
					}
				}
				if(data.paths.length==0){
		    		layer.msg("没有可用路径……");
				}
				routing.resultData = data;
				var entity = solarSystem.addEntity({
					polyline: {
						positions: Cesium.Cartesian3.fromDegreesArray(data.paths),
						clampToGround: true,
						material: new Cesium.ColorMaterialProperty(Cesium.Color.LIME),
						heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
						width: 2
					}
				});
                solarSystem.requestRender();
				routing.entities.push(entity);

				routing.synStatusDiv.hide();
				routing.chartDiv.show();
				routing.setEchartsData(data);
				routing.stop(bt);
			}).catch(function (e) {
				layer.alert(e.message || e);
				routing.stop(bt);
			});
		},
		stop:function(bt){
			routing.isStart = false;
			$(bt).removeClass("draw-bt-a");
			$(bt).find(".plugins_routing_bt").html("分析");
		},
		setEchartsData:function (data) {
			if (null != data && null != data.times) {
	            var chartData = {
	            		 title: {
	            		        text: '路径分析统计图',
	            		        left: 'center',
	            		        align: 'right'
	            		},
	                    grid: {
	                    	left: 10,
	                        right: 10,
	                        bottom: 50,
	                        containLabel: !0
	                    },
	                    toolbox: {
	                        show: true,
	                        feature: {
	                            dataZoom: {
	                                yAxisIndex: 'none'
	                            },
	                            dataView: {
	                            	show: true, readOnly: false,
	                                optionToContent: function (opt) {
	                                	var ret='<textarea style="width: 100%; height: 100%; font-family: monospace; font-size: 14px; line-height: 1.6rem; color: rgb(0, 0, 0); border-color: rgb(51, 51, 51); background-color: rgb(255, 255, 255);">';
	                                    var space = "    ";
	                                    var axisData = opt.xAxis[0].data;//x轴作为条件，y轴需改成yAxis[0].data;
	                                    var series = opt.series;
	                                    var tdHeads = '时间';
	                                    tdHeads += space+'经度(度)';
	                                    tdHeads += space+'纬度(度)';
	                                    series.forEach(function (item) {
	                                    	if(item.name=="海拔"){
		                                        tdHeads += space+item.name+'(米)';
	                                    	}
	                                    	tdHeads += space+item.name+'(度)';
	                                    });
	                                    tdHeads += space+'方位角(度)';
	                                    ret += tdHeads+'\n';
	                                    var tdBodys = '';
	                                    var position="";
	                                    for (var i = 0, l = axisData.length; i < l; i++) {

	        	                            var lon = data.paths[i*2].toFixed(6);
	        	                            var lat = data.paths[i*2+1].toFixed(6);
	                                    	position+=space+lon;
	                                    	position+=space+lat;
	                                        for (var j = 0; j < series.length; j++) {
	                                            if(typeof(series[j].data[i]) == 'object'){
	                                                tdBodys += space+series[j].data[i].value.toFixed(6);
	                                            }else{
	                                                tdBodys += space+series[j].data[i].toFixed(6);
	                                            }
	                                        }
                                            tdBodys += space+data.aspect[i].toFixed(6);
	                                        ret += ''+axisData[i].toDate("yyyyMMddhhmmss").format("yyyy年MM月dd日 hh:mm:ss")+position+space+ tdBodys +'\n';
	                                        tdBodys = '';
	                                        position="";
	                                    }
	                                    ret+='</textarea>';
	                                    return ret;
	                                }
	                            },
	                            restore: {},
	                            saveAsImage: {}
	                        }
	                    },
	                    dataZoom: [
	                        {
	                            type: 'inside',
	                            start: 0,
	                            end: 100
	                        },
	                        {
	                            start: 0,
	                            end: 100,
	                            dataBackground:{
	                                lineStyle:{color:"#f00"},
	                                areaStyle:{color:'#ccc'}
	                            }
	                        }
	                    ],
	                    tooltip: {
	                        trigger: "axis",
	                        axisPointer: {
	                            type: 'cross',
	                            label: {
	                                backgroundColor: '#505765'
	                            }
	                        },
	                        formatter: function (e) {
	                            if (0 == e.length) return "";
	                            showCurrentPos(e[0].dataIndex);
	                            var lon = data.paths[e[0].dataIndex*2];
	                            var lat = data.paths[e[0].dataIndex*2+1];
	                            var info ="信息<br />";
	                            info += "经度:&nbsp;" + lon.toFixed(6)+"度<br />";
	                            info += "纬度:&nbsp;"+lat.toFixed(6)+"度<br />";
	                            if(e[0].seriesName=="坡度值"){
	                            	info+=e[0].seriesName + ":&nbsp;<label style='color:" + e[0].color + ";'>" + e[0].value.toFixed(6) + "度</label><br/>";
	                            }else{
	                            	info+=e[0].seriesName + ":&nbsp;<label style='color:" + e[0].color + ";'>" 
	                                + e[0].value.toFixed(3) + "米</label><br />";
	                            }
	                            
	                            if(e.length>1){
	                            	info+=e[1].seriesName + ":&nbsp;<label style='color:" + e[1].color + ";'>" + e[1].value.toFixed(6) + "度</label>";
	                            }
	                            return "<div class='chart-tip'>"+info+"</div>";
	                        }
	                    },
	                    legend: {
	                        data: ['海拔', '坡度值'],
	                        left: 10
	                    },
	                    xAxis: [{
	                        name: "时间",
	                        type: "category",
	                        show:false,
	                        axisLabel: {
	                            show: !1
	                        },
	                        data: data.times
	                    }],
	                    yAxis: [
	                    	{
	                            name: '海拔(米)',
	                            type: 'value',
	                            scale: true,
	                            formatter: "{value} 米"
	                        }
	                        ,{
	                            name: '坡度值(度)',
	                            type: 'value',
	                            formatter: "{value} 度"
	                        }
	                        ],
	                        visualMap: {
	                            seriesIndex:1,
	                            show:false,
	                            pieces: [{
	                                lte: 5,
	                                color: '#00f'
	                            }, {
	                                gt: 5,
	                                lte: 10,
	                                color: '#ffff00'
	                            }, {
	                                gt: 10,
	                                lte: 20,
	                                color: '#FFA500'
	                            }, {
	                                gt: 20,
	                                color: '#f00'
	                            }],
	                            outOfRange: {
	                                color: '#f00'
	                            }
	                        },
	                    series: [{
	                        name: "海拔",
	                        type: "line",
	                        smooth: !0,
	                        symbol: "none",
	                        lineStyle: {
	                            color: "rgb(250, 0, 0)"
		                    },
		                    itemStyle: {
		                        color: "rgb(250, 0, 0)"
		                    },
	                        data: data.dem
	                    }
	                    ,{
	                        name: "坡度值",
	                        type: "line",
	                        smooth: !0,
	                        symbol: "none",
	                        yAxisIndex: 1,
	                        areaStyle: {},
	                        lineStyle: {
	                            color: "rgb(0, 250, 0)"
		                    },
		                    itemStyle: {
		                        color: "rgb(0, 250, 0)"
		                    },
	                        data:data.slope
	                    }
	                    ]
	                };
	            this.myChart.setOption(chartData)
	        }
	    },
	    addToScene:function(){
	    	var key ="groundVehicle";
	    	var centralBody = "Moon";
			var typeInfo = entityTypeUtils.getTypeInfo(key);
			var url = "/resources/icons/"+key+".png";
	    	var data = {
					A805_Properties:{
						Position:{
							heightAboveGround:0,
						}
					},
					isSameName:true,
					name:typeInfo.name,
					entityType:typeInfo.type,
					description:""
			};
			AttitudeUtils.updateAttitudeOptions(data.entityType);
			ProtoTreeData.updateEntityName(data);
			$.extend(data,sceneViewModel.globalAttribute);
			if(data.billboard){
				data.billboard.image = url;
			}
			if(typeInfo.model){
				if(!data.model){
					data.model={};
				}
				data.model.gltf =typeInfo.model;
				data.model.articulations={};
			}
			data.centralBody = centralBody;
			data = entityTypeUtils.getDefaultData(data,sceneViewModel.dataSource);
			if(Cesium.defined(typeInfo.heightReference)){
				data.heightReference = typeInfo.heightReference;
			}
			delete data.path;
			delete data.agi_vector;
			delete data.access;
			console.log(data);

			ProtoTreeData.updateIsSameName(data);
			data.position={};
			var cartographicDegrees = [];
			var paths=routing.resultData.paths;
			var dem=routing.resultData.dem;
			var speed = parseFloat(VModel.speed)/3600;
			var index=0;
			var time=0;
			for(var i=0;i<paths.length;i+=2){
				var lon = paths[i];
				var lat = paths[i+1];
				var height = dem[index];
				p1=Cesium.Cartographic.fromDegrees(lon, lat, height, p1);
				if(i>1){
					var lon1 = paths[i-2];
					var lat1 = paths[i-1];
					var height1 = dem[index-1];
					p2=Cesium.Cartographic.fromDegrees(lon1, lat1, height1, p2);
					time=time+ProtoTreeData.computeTime(centralBody,speed,p2,p1);
				}
				index++;
				cartographicDegrees.push(time,lon,lat,height);
			}
			data.position.cartographicDegrees=cartographicDegrees;
			ProtoTreeData.addEntity(data);
	    }
	};
	function geomToArray(geom){
		geom = $.parseJSON(geom);
		var ret = [];
		for(var i=0;i<geom.coordinates.length;i++){
			ret.push(geom.coordinates[i][0],geom.coordinates[i][1]);
		}
		return ret;
	}

	var currentEnitiy = null;
    var worldPosition = new Cesium.Cartesian3();

    function showCurrentPos(index){
    	
    	if(routing.resultData&&index<routing.resultData.paths.length/2){
    		var longitude = routing.resultData.paths[index*2];
    		var latitude = routing.resultData.paths[index*2+1];
    		var ellipsoid = getSceneEllipsoid();
    		Cesium.Cartesian3.fromDegrees(longitude, latitude, 0, ellipsoid, worldPosition);
    		if(currentEnitiy==null){
    			currentEnitiy = solarSystem.addEntity({
    		        position:worldPosition,
    		        point: {
    		            color:Cesium.Color.RED,
    		            pixelSize: 10,
    		            outlineColor : Cesium.Color.WHITE,
    		            outlineWidth :2,
    		            heightReference:Cesium.HeightReference.CLAMP_TO_GROUND
    		        }
    		    });
    		}
    		currentEnitiy.position.setValue(worldPosition);
            solarSystem.requestRender();
    	}
    }

	//经纬度保留两位小数
    function strFormat(str) {
        var strString = str.toString();
        var strs = strString.slice(0, strString.indexOf(".")+3);
        return strs;
    }
	Plugins.add(routing);
})();
