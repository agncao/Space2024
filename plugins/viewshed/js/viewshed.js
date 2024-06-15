(function(){
	var headingPitchRoll;
	var tempCart3=new Cesium.Cartesian3();
	var tempghc=new Cesium.Cartographic();
	function createRectangularSensor(options) {
        var rectangularSensor = new Cesium.RectangularSensor({ 
        	ellipsoid: solarSystem.topViewer.scene.globe.ellipsoid ,
        	scene:solarSystem.topViewer.scene,
//        	classificationType:Cesium.ClassificationType.TERRAIN
        });

        var showLateralSurfaces = SensorModel.showLateralSurfaces;
        var showEllipsoidHorizonSurfaces = SensorModel.showEllipsoidHorizonSurfaces;
        var showDomeSurfaces = SensorModel.showDomeSurfaces;
        var showEllipsoidSurfaces = SensorModel.showEllipsoidSurfaces;
        var portion = Cesium.SensorVolumePortionToDisplay.COMPLETE;
        
        if(headingPitchRoll){
			headingPitchRoll.heading=Cesium.Math.toRadians(SensorModel.heading);
			headingPitchRoll.pitch=Cesium.Math.toRadians(SensorModel.pitch);
			headingPitchRoll.roll=Cesium.Math.toRadians(SensorModel.roll);
        }else{
        	headingPitchRoll = new Cesium.HeadingPitchRoll(
	          Cesium.Math.toRadians(SensorModel.heading),
	          Cesium.Math.toRadians(SensorModel.pitch),
	          Cesium.Math.toRadians(SensorModel.roll)
	        );
        }
        
        rectangularSensor.modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(
          options.center,
          headingPitchRoll,
          solarSystem.topViewer.scene.globe.ellipsoid,
          undefined,
          rectangularSensor.modelMatrix
        );

        rectangularSensor.radius = options.radius;
        rectangularSensor.xHalfAngle = Cesium.Math.toRadians(SensorModel.xHalfAngle);
        rectangularSensor.yHalfAngle = Cesium.Math.toRadians(SensorModel.yHalfAngle);
        rectangularSensor.portionToDisplay = portion;

        rectangularSensor.lateralSurfaceMaterial = Cesium.Material.fromType(
          "Grid"
        );
        rectangularSensor.lateralSurfaceMaterial.uniforms.color = new Cesium.Color(
          0.0,
          1.0,
          1.0,
          1.0
        );
        rectangularSensor.lateralSurfaceMaterial.uniforms.cellAlpha = 0.5;
        rectangularSensor.lateralSurfaceMaterial.uniforms.lineCount = {
          x: 12,
          y: 10,
        };
        rectangularSensor.showLateralSurfaces = showLateralSurfaces;

//        rectangularSensor.ellipsoidHorizonSurfaceMaterial = Cesium.Material.fromType(
//          "Grid"
//        );
//        rectangularSensor.ellipsoidHorizonSurfaceMaterial.uniforms.color = new Cesium.Color(
//          0.4,
//          1.0,
//          0.0,
//          1.0
//        );
//        rectangularSensor.ellipsoidHorizonSurfaceMaterial.uniforms.cellAlpha = 0.5;
//        rectangularSensor.ellipsoidHorizonSurfaceMaterial.uniforms.lineCount = {
//          x: 12,
//          y: 12,
//        };
//        rectangularSensor.showEllipsoidHorizonSurfaces = showEllipsoidHorizonSurfaces;

        rectangularSensor.domeSurfaceMaterial = Cesium.Material.fromType(
          "Grid"
        );
        rectangularSensor.domeSurfaceMaterial.uniforms.color = new Cesium.Color(
          1.0,
          1.0,
          0.0,
          1.0
        );
        rectangularSensor.domeSurfaceMaterial.uniforms.cellAlpha = 0.5;
        rectangularSensor.domeSurfaceMaterial.uniforms.lineCount = {
          x: 12,
          y: 12,
        };
        rectangularSensor.showDomeSurfaces = showDomeSurfaces;

//        rectangularSensor.ellipsoidSurfaceMaterial = Cesium.Material.fromType(
//          "Color"
//        );
//        rectangularSensor.ellipsoidSurfaceMaterial.uniforms.color = new Cesium.Color(
//          1.0,
//          0.0,
//          1.0,
//          0.5
//        );
        var environmentOcclusionMaterial = Cesium.Material.fromType("Grid");
        environmentOcclusionMaterial.uniforms.color = new Cesium.Color(
          1.0,
          0.0,
          0.0,
          1.0
        );
        environmentOcclusionMaterial.uniforms.cellAlpha = 0.5;
        environmentOcclusionMaterial.uniforms.lineCount = { x: 12, y: 10 };
        rectangularSensor.environmentOcclusionMaterial=environmentOcclusionMaterial;
        rectangularSensor.environmentIntersectionWidth=1.0;
        rectangularSensor.environmentIntersectionColor= new Cesium.Color(1.0, 0.0, 1.0, 0.5);
        rectangularSensor.intersectionWidth=0;
        rectangularSensor.showEllipsoidSurfaces = showEllipsoidSurfaces;

        rectangularSensor.environmentConstraint =SensorModel.environmentConstraint;
        rectangularSensor.showViewshed = SensorModel.showViewshed;
//        rectangularSensor.showIntersection = false;
        rectangularSensor.showThroughEllipsoid = !SensorModel.showThroughEllipsoid;
        rectangularSensor.showEnvironmentOcclusion=SensorModel.showEnvironmentOcclusion;

        return rectangularSensor;
      }

	var SensorModel={
		height:2,
		radius:10,
		xHalfAngle:25,
		yHalfAngle:45,
		heading:0,
		pitch:-90,
		roll:0,
		showLateralSurfaces:true,
		showEllipsoidHorizonSurfaces:false,
		showDomeSurfaces:true,
		showEllipsoidSurfaces:true,
		environmentConstraint:true,
		showEnvironmentOcclusion:false,
		showThroughEllipsoid:true,
		showViewshed:true,
		clickPoint:function(data, event){
			viewshed.clickPoint(event.currentTarget);
		}
	};
	var viewshed={
		id:"Plugins_viewshed",
		menu:{
			click:function(element){
				if(!viewshed.isInit){
					viewshed.isInit=true;
					viewshed.init();
				}
				const openNewLayerIndex = layer.open({
			      	  type: 1,
			      	  title: "可视域分析",
			      	  shadeClose: true,
			      	  shade: false,
			      	  area: '326px', // 宽高
			      	  offset: [($(window).height()/3)+'px', ($(window).width()-450)+'px'],
			      	  success: function(layero, index){
			          },
			          content:$('#plugins_viewshed'),
			          btn: [],
	    	    	  end:function(){
	    				sceneViewModel.drawTool.clear(true);
	    				sceneViewModel.drawTool.stop();
	    				if(viewshed.sensor){
	    					solarSystem.baseViewer.scene.primitives.remove(viewshed.sensor);
	    				}
	    	    	  }
			      });
			}
		},
		init:function(){
			Cesium.knockout.track(SensorModel);
			Cesium.knockout.applyBindings(SensorModel,$('#plugins_viewshed').get(0));
			Cesium.knockout.getObservable(SensorModel, "radius").subscribe(function(value) {
				var radius = DKm.toValue(value);
				if(viewshed.sensor){
					viewshed.sensor.radius=radius;
	                solarSystem.requestRender();
				}
			});
			Cesium.knockout.getObservable(SensorModel, "height").subscribe(function(value) {
				SensorModel.height = DMeter.toValue(value);
				if(viewshed.sensor){
					var cart = Cesium.Matrix4.getTranslation(viewshed.sensor.modelMatrix,tempCart3);
					var pos = Cesium.Cartographic.fromCartesian(cart,viewshed.sensor._scene.globe.ellipsoid,tempghc);
					var height = viewshed.sensor._scene.globe.getHeight(pos);
					  if(Cesium.defined(height)){
						  pos.height=height+SensorModel.height;
						  var center = viewshed.sensor._scene.globe.ellipsoid.cartographicToCartesian(pos, tempCart3);
						  viewshed.sensor.modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(
					          center,
					          headingPitchRoll,
					          viewshed.sensor._scene.globe.ellipsoid,
					          undefined,
					          viewshed.sensor.modelMatrix
					        );
			                solarSystem.requestRender();
					  }
				}
			});
			Cesium.knockout.getObservable(SensorModel, "showLateralSurfaces").subscribe(function(value) {
				if(viewshed.sensor){
					viewshed.sensor.showLateralSurfaces=value;
	                solarSystem.requestRender();
				}
			});
			Cesium.knockout.getObservable(SensorModel, "showDomeSurfaces").subscribe(function(value) {
				if(viewshed.sensor){
					viewshed.sensor.showDomeSurfaces=value;
	                solarSystem.requestRender();
				}
			});
			Cesium.knockout.getObservable(SensorModel, "environmentConstraint").subscribe(function(value) {
				if(viewshed.sensor){
					viewshed.sensor.environmentConstraint=value;
	                solarSystem.requestRender();
				}
			});
			Cesium.knockout.getObservable(SensorModel, "showEnvironmentOcclusion").subscribe(function(value) {
				if(viewshed.sensor){
					viewshed.sensor.showEnvironmentOcclusion=SensorModel.showEnvironmentOcclusion;
	                solarSystem.requestRender();
				}
			});
			Cesium.knockout.getObservable(SensorModel, "showThroughEllipsoid").subscribe(function(value) {
				if(viewshed.sensor){
					viewshed.sensor.showThroughEllipsoid=!SensorModel.showThroughEllipsoid;
	                solarSystem.requestRender();
				}
			});
			
			Cesium.knockout.getObservable(SensorModel, "xHalfAngle").subscribe(function(value) {
				if(viewshed.sensor){
					viewshed.sensor.xHalfAngle = Cesium.Math.toRadians(parseFloat(value));
	                solarSystem.requestRender();
				}
			});
			Cesium.knockout.getObservable(SensorModel, "yHalfAngle").subscribe(function(value) {
				if(viewshed.sensor){
					viewshed.sensor.yHalfAngle = Cesium.Math.toRadians(parseFloat(value));
	                solarSystem.requestRender();
				}
			});
			Cesium.knockout.getObservable(SensorModel, "heading").subscribe(function(value) {
				if(viewshed.sensor){
					headingPitchRoll.heading=Cesium.Math.toRadians(SensorModel.heading);
//					headingPitchRoll.pitch=Cesium.Math.toRadians(SensorModel.pitch);
//					headingPitchRoll.roll=Cesium.Math.toRadians(SensorModel.roll);
					var center = Cesium.Matrix4.getTranslation(viewshed.sensor.modelMatrix,tempCart3);
					viewshed.sensor.modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(
			          center,
			          headingPitchRoll,
			          viewshed.sensor._scene.globe.ellipsoid,
			          undefined,
			          viewshed.sensor.modelMatrix
			        );
	                solarSystem.requestRender();
				}
			});
			setTimeout(function(){
				if(viewshed.sensor){
					var center = Cesium.Matrix4.getTranslation(viewshed.sensor.modelMatrix,tempCart3);
					var pos = Cesium.Cartographic.fromCartesian(center,viewshed.sensor._scene.globe.ellipsoid,tempghc);
					var height = viewshed.sensor._scene.globe.getHeight(pos);
					if(Cesium.defined(height)){
					  pos.height=height+SensorModel.height;
					  var center = solarSystem.topViewer.scene.globe.ellipsoid.cartographicToCartesian(pos, tempCart3);
					  viewshed.sensor.modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(
				          center,
				          headingPitchRoll,
				          viewshed.sensor._scene.globe.ellipsoid,
				          undefined,
				          viewshed.sensor.modelMatrix
				      );
		              solarSystem.requestRender();
					}
				}
			},1000);
		},
		setSensor:function(center){
			if(this.sensor){
				this.sensor._scene.primitives.remove(this.sensor);
			}
			this.sensor = createRectangularSensor({
				center:center,
				radius:DKm.toValue(SensorModel.radius)
			});
			
	        solarSystem.topViewer.scene.primitives.add(this.sensor);
	        solarSystem.requestRender();
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
				var height = solarSystem.topViewer.scene.globe.getHeight(pos);
				  if(Cesium.defined(height)){
					  pos.height=height+SensorModel.height;
					  var center = solarSystem.topViewer.scene.globe.ellipsoid.cartographicToCartesian(pos, tempCart3);
					  viewshed.setSensor(center);
				  }
			},function(){
				sceneViewModel.drawTool.clear(true);
			});
		}
	};
	Plugins.add(viewshed);
})();
