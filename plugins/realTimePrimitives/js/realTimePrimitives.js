(function () {
	Cesium.Math.setRandomNumberSeed(2.5);
	function getRandomNumberInRange(minValue, maxValue) {
		return (
			minValue + Cesium.Math.nextRandomNumber() * (maxValue - minValue)
		);
	}
	// randomly generate clouds in a certain area
	function createRandomClouds(clouds,
		numClouds,
		startLong,
		stopLong,
		startLat,
		stopLat,
		minHeight,
		maxHeight
	) {
		const rangeLong = stopLong - startLong;
		const rangeLat = stopLat - startLat;
		for (let i = 0; i < numClouds; i++) {
			const long = startLong + getRandomNumberInRange(0, rangeLong);
			const lat = startLat + getRandomNumberInRange(0, rangeLat);
			height = getRandomNumberInRange(minHeight, maxHeight);
			scaleX = getRandomNumberInRange(1000, 10000);
			scaleY = scaleX / 2.0 - getRandomNumberInRange(0, scaleX / 4.0);
			slice = getRandomNumberInRange(0.3, 0.7);
			depth = getRandomNumberInRange(5, 20);
			aspectRatio = getRandomNumberInRange(1.5, 2.1);
			cloudHeight = getRandomNumberInRange(5, 20);
			clouds.add({
				position: Cesium.Cartesian3.fromDegrees(long, lat, height),
				scale: new Cesium.Cartesian2(scaleX, scaleY),
				maximumSize: new Cesium.Cartesian3(
					aspectRatio * cloudHeight,
					cloudHeight,
					depth
				),
				slice: slice,
			});
		}
	}
	function bLon(f, b1, b2) {
		var v1 = f(b1[0], b2[2]);
		var v2 = f(b2[0], b2[2]);
		return f(v1, v2);
	};

	function bLat(f, b1, b2) {
		var v1 = f(b1[1], b2[3]);
		var v2 = f(b2[1], b2[3]);
		return f(v1, v2);
	};
	const tempMat3 = new Cesium.Matrix3();
	const tempQuaternion = new Cesium.Quaternion();
	let speedVector = new Cesium.Cartesian3();
	let tempPosition = new Cesium.Cartesian3();
	const tempCarto = new Cesium.Cartographic();
	function updateModelView(modelMatrix, speed, timeStep, isGround) {
		speedVector = Cesium.Cartesian3.multiplyByScalar(
			Cesium.Cartesian3.UNIT_Z,
			speed / 1000 * timeStep,
			speedVector
		);
		const position = Cesium.Matrix4.multiplyByPoint(
			modelMatrix,
			speedVector,
			tempPosition
		);
		if (isGround == true) {
			var ellipsoid = solarSystem.baseViewer.scene.globe.ellipsoid;
			Cesium.Cartographic.fromCartesian(position, ellipsoid, tempCarto);
			tempCarto.height = 10;
			Cesium.Cartographic.toCartesian(tempCarto, ellipsoid, position);
		}
		modelMatrix[12] = position.x;
		modelMatrix[13] = position.y;
		modelMatrix[14] = position.z;
	}
	function getPositionHeight(position) {
		var ellipsoid = solarSystem.baseViewer.scene.globe.ellipsoid;
		Cesium.Cartographic.fromCartesian(position, ellipsoid, tempCarto);
		return tempCarto.height;
	}
	const minHeight = 8000, maxHeight = 20000;
	const aircraftBounds = [115, 21, 120, 25];
	const aircraftModels = [
		"飞机",
		"飞机01-1",
		//		"飞机02-1",
		//		"战机01",
		//		"战机03",
		//		"战机04",
		//		"战机05",
		//		"战机11",
		//		"战机14",
		//		"战机15",
		//		"战机16",
	];
	const shipBounds = [116, 20, 119, 23];
	const shipModels = [
		//		"船",
		"船-1",
		//		"货轮03",
		//		"轮船02",
		//		"游艇03",
		//		"游艇58"
	];
	//	const allBounds =aircraftBounds;
	const allBounds = [
		bLon(Math.min, aircraftBounds, shipBounds),
		bLat(Math.min, aircraftBounds, shipBounds),
		bLon(Math.max, aircraftBounds, shipBounds),
		bLat(Math.max, aircraftBounds, shipBounds),
	];
	const clondsCount = 200, aircraftCount = 2000, shipCount = 500, accessCount = 3;

	const fixedFrameTransform = Cesium.Transforms.localFrameToFixedFrameGenerator(
		"east",
		"up"
	);
	function WarEntity(options) {
		this.id = options.id;
		this.info = options.info;
		this.speed = options.info.type == "飞机" ? 100 : 80;
		this.modelIndex = options.modelIndex;
		this.modelInstance = options.modelInstance;
		this.label = options.label;
		this.targets = options.targets;
		this.canPicked = true;
		this.isShowing = true;
		this.isPlanetary = true;
		this.isAvailable = function (time) {
			return this.isShowing;
		}
		this.getBoundingSphere = function (time, result) {
			if (!result) {
				result = new Cesium.BoundingSphere(this.label.position, 1000);
			} else {
				result.center = this.label.position;
				result.radius = 1000;
			}
		}
		var that = this;
		this.positionProperty = {
			getValue: function () {
				return that.label.position;
			}
		};
	}
	Object.defineProperties(WarEntity.prototype, {
		position: {
			get: function () {
				return this.positionProperty;
			}
		}
	});
	function randomInt(max){
		return Math.floor(Math.random() * max);
	}
	function createRectangularSensor(center, sensorRadius) {
		hpRoll.pitch = 0;
		const rectangularSensor = new Cesium.RectangularSensor();
		const showLateralSurfaces = true;
		const showEllipsoidHorizonSurfaces = false;
		const showDomeSurfaces = true;
		const showEllipsoidSurfaces = false;
		const portion = Cesium.SensorVolumePortionToDisplay.COMPLETE;

		const modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(
			center,
			hpRoll
		);

		rectangularSensor.modelMatrix = modelMatrix;
		rectangularSensor.radius = sensorRadius;
		rectangularSensor.xHalfAngle = Cesium.Math.toRadians(90.0);
		rectangularSensor.yHalfAngle = Cesium.Math.toRadians(90.0);
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

		rectangularSensor.ellipsoidHorizonSurfaceMaterial = Cesium.Material.fromType(
			"Grid"
		);
		rectangularSensor.ellipsoidHorizonSurfaceMaterial.uniforms.color = new Cesium.Color(
			0.4,
			1.0,
			0.0,
			1.0
		);
		rectangularSensor.ellipsoidHorizonSurfaceMaterial.uniforms.cellAlpha = 0.5;
		rectangularSensor.ellipsoidHorizonSurfaceMaterial.uniforms.lineCount = {
			x: 12,
			y: 10,
		};
		rectangularSensor.showEllipsoidHorizonSurfaces = showEllipsoidHorizonSurfaces;

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

		rectangularSensor.ellipsoidSurfaceMaterial = Cesium.Material.fromType(
			"Color"
		);
		rectangularSensor.ellipsoidSurfaceMaterial.uniforms.color = new Cesium.Color(
			1.0,
			0.0,
			1.0,
			0.5
		);
		rectangularSensor.showEllipsoidSurfaces = showEllipsoidSurfaces;

		//	  rectangularSensor.environmentConstraint = true;
		//	  rectangularSensor.showViewshed = true;

		rectangularSensor.showIntersection = false;
		//	  rectangularSensor.showThroughEllipsoid = true;
		return rectangularSensor;
	}
	var positionScratch = new Cesium.Cartesian3();
	const hpRoll = new Cesium.HeadingPitchRoll();
	const modelScale = 10;
	var WarEntityUtils = {
		ModelCollectionMap: {},
		warEntities: [],
		warEntityHashMap: {},
		init: function () {
			if (!this.isInit) {
				this.isInit = true;
			}
			if (WarEntityUtils.PolylinePrimitives) {
				WarEntityUtils.PolylinePrimitives.removeAll();
			} else {
				WarEntityUtils.PolylinePrimitives = solarSystem.addPrimitive(
					new Cesium.PolylineCollection()
				);
			}

			if (WarEntityUtils.LabelPrimitives) {
				WarEntityUtils.LabelPrimitives.removeAll();
			} else {
				WarEntityUtils.LabelPrimitives = solarSystem.addPrimitive(
					new Cesium.LabelCollection()
				);
			}

			if (WarEntityUtils.Primitives) {
				WarEntityUtils.Primitives.removeAll();
			} else {
				WarEntityUtils.Primitives = solarSystem.addPrimitive(
					new Cesium.PrimitiveCollection()
				);
			}
			if (WarEntityUtils.LinePrimitives) {
				WarEntityUtils.LinePrimitives.removeAll();
			} else {
				WarEntityUtils.LinePrimitives = solarSystem.addPrimitive(
					new Cesium.PolylineCollection()
				);
			}
			if (WarEntityUtils.clouds) {
				WarEntityUtils.clouds.removeAll();
				createRandomClouds(WarEntityUtils.clouds, clondsCount, allBounds[0], allBounds[2], allBounds[1], allBounds[3], minHeight, maxHeight);
			} else {
				const clouds = new Cesium.CloudCollection();
				createRandomClouds(clouds, clondsCount, allBounds[0], allBounds[2], allBounds[1], allBounds[3], minHeight, maxHeight);
				WarEntityUtils.clouds = solarSystem.addPrimitive(clouds);
			}
		},
		/**
		 * 添加对象
		 * @params [options.type] 类型：船、飞机
		 * @params [options.name] 名称
		 * @params [options.pitch] 方向弧度
		 * @params [options.position] 位置
		 * @returns {WarEntity}
		 */
		add: function (options) {
			var id = options.id;
			var position = options.position;
			var ellipsoid = solarSystem.baseViewer.scene.globe.ellipsoid;
			hpRoll.pitch = options.pitch;
			var type = options.type;
			var url = "plugins/realTimePrimitives/models/" + options.type + "/" + options.name + ".gltf";
			var key = options.type+"_"+options.name;
			var modelCollection = this.ModelCollectionMap[key];
			if (!modelCollection) {
				modelCollection = this.ModelCollectionMap[key] = new Cesium.ModelInstanceCollection({
					url: url,
					instances: [],
					// debugShowBoundingVolume: true,
				});
				WarEntityUtils.Primitives.add(modelCollection);
			}
			var heightReference = type == "飞机" ? Cesium.HeightReference.NONE : Cesium.HeightReference.CLAMP_TO_GROUND;
			var modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(
				position,
				hpRoll,
				ellipsoid,
				fixedFrameTransform
			);
			Cesium.Matrix4.multiplyByUniformScale(
				modelMatrix,
				type == "飞机" ? modelScale * 10 : modelScale,
				modelMatrix
			);
			var modelInstance = {
				modelMatrix: modelMatrix,
				//					heightReference: heightReference,
			};
			modelCollection.instances.push(modelInstance);

			var e = new WarEntity({
				id: id,
				info: options,
				modelIndex: modelCollection.instances.length - 1,
				modelInstance: modelInstance,
				targets: options.targets,
			});
			var label = WarEntityUtils.LabelPrimitives.add({
				id: e,
				show: true,
				position: position,
				text: options.name,
				font: '20px sans-serif',
				fillColor: Cesium.Color.RED,
				outlineColor: Cesium.Color.BLACK,
				outlineWidth: 0.0,
				//				showBackground: false,
				//				backgroundColor: new Cesium.Color(0.165, 0.165, 0.165, 0.8),
				//				backgroundPadding: new Cesium.Cartesian2(7, 5),
				style: Cesium.LabelStyle.FILL,
				pixelOffset: new Cesium.Cartesian2(0, -30),
				eyeOffset: Cesium.Cartesian3.ZERO,
				horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
				verticalOrigin: Cesium.VerticalOrigin.BASELINE,
				scale: 1.0,
				translucencyByDistance: new Cesium.NearFarScalar(1000, 0, 100000, 1),
				pixelOffsetScaleByDistance: new Cesium.NearFarScalar(0, 0.8, 100000, 1),
				//				heightReference: heightReference,
				scaleByDistance: new Cesium.NearFarScalar(1000, 0, 100000, 1),
				distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 100000.0)
			});
			e.label = label;
			if (options.targets) {
				e.targetLines = [];
				for (var i = 0; i < options.targets.length; i++) {
					var target = options.targets[i];
					var l = WarEntityUtils.LinePrimitives.add({
						positions: [],
						material: Cesium.Material.fromType(
							Cesium.Material.PolylineFlowType,
							{
								color: new Cesium.Color(0.0, 1.0, 0.0, 0.7),
								percent: 0.1,
								gradient: 0.2,
								speed: randomInt(5.0)+1
							}
						),
						width: 2.0,
					});
					e.targetLines.push({
						target:target,
						line:l
					});
				}
			}
			var sensorType = options.sensorType;
			if (sensorType) {
				var height = getPositionHeight(position);
				if (sensorType == "Rectangular") {
					var sensor = WarEntityUtils.Primitives.add(new Cesium.RectangularSensor({
						modelMatrix: Cesium.Transforms.northEastDownToFixedFrame(position),
						radius: height,
						xHalfAngle: Cesium.Math.toRadians(15.0),
						yHalfAngle: Cesium.Math.toRadians(15.0),
						lateralSurfaceMaterial: Cesium.Material.fromType(Cesium.Material.RadarWaveType, { color: new Cesium.Color(1.0, 1.0, 0.0, 0.5) }),
						domeSurfaceMaterial: Cesium.Material.fromType(Cesium.Material.ColorType, { color: new Cesium.Color(1.0, 1.0, 0.0, 0.5) })
					}));
					sensor.pulseLength = height / 10;
					sensor.showIntersection = false;
					e.sensor = sensor;
				} else {
					var rectangularSensor = createRectangularSensor(position, 10000);
					WarEntityUtils.Primitives.add(rectangularSensor);
					e.sensor = rectangularSensor;
				}
			}
			this.warEntities.push(e);
			this.warEntityHashMap[id] = e;
			return e;
		},
		refresh: function () {
			for (var key in WarEntityUtils.ModelCollectionMap) {
				var modelCollection = WarEntityUtils.ModelCollectionMap[key];
				modelCollection.refresh();
			}
		},
		updatePosition: function (timeStep) {
			var ellipsoid = solarSystem.baseViewer.scene.globe.ellipsoid;
			for (var i = 0; i < this.warEntities.length; i++) {
				var we = this.warEntities[i];
				var modelMatrix = we.modelInstance.modelMatrix;
				updateModelView(we.modelInstance.modelMatrix, we.speed, timeStep, we.info.type == "船");
				we.label.position = Cesium.Matrix4.getTranslation(modelMatrix, positionScratch);
				if (we.sensor) {
					if (we.info.type == "飞机") {
						var height = getPositionHeight(positionScratch);
						we.sensor.radius = height;
						we.sensor.pulseLength = height / 10;
						we.sensor.modelMatrix = Cesium.Transforms.northEastDownToFixedFrame(positionScratch, ellipsoid, we.sensor.modelMatrix);
					} else {
						hpRoll.pitch = 0;
						we.sensor.modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(
							positionScratch,
							hpRoll,
							ellipsoid,
							Cesium.Transforms.eastNorthUpToFixedFrame,
							we.sensor.modelMatrix
						);
					}
				}
			}
			for (var i = 0; i < this.warEntities.length; i++) {
				var we = this.warEntities[i];
				if(we.targetLines){
					for (var k = 0; k < we.targetLines.length; k++) {
						var tl = we.targetLines[k];
						var line = tl.line;
						var target = tl.target;
						var tewe=this.warEntityHashMap[target];
						line.positions = [we.label.position,tewe.label.position];
					}
				}
			}
			WarEntityUtils.refresh();
		},
		addUpdate: function () {
			this.listenerRemoveFunc = solarSystem.topViewer.scene.postUpdate.addEventListener(function (scene, time) {
				if (!WarEntityUtils.prevTime) {
					WarEntityUtils.prevTime = Cesium.JulianDate.clone(time);
				}
				var d = Cesium.JulianDate.secondsDifference(time, WarEntityUtils.prevTime);
				if (Math.abs(d) > 0.05) {
					Cesium.JulianDate.clone(time, WarEntityUtils.prevTime);
					WarEntityUtils.updatePosition(d);
				}
			});
		},
		clear: function () {
			if (this.listenerRemoveFunc) {
				this.listenerRemoveFunc();
				this.listenerRemoveFunc = undefined;
			}
			if (this.PolylinePrimitives) {
				this.PolylinePrimitives.removeAll();
			}
			if (this.LabelPrimitives) {
				this.LabelPrimitives.removeAll();
			}
			if (this.LinePrimitives) {
				this.LinePrimitives.removeAll();
			}
			if (this.Primitives) {
				this.Primitives.removeAll();
				for (var key in this.ModelCollectionMap) {
					delete this.ModelCollectionMap[key];
				}
				this.warEntities.length = 0;
				this.warEntityHashMap = {};
			}
			if (this.clouds) {
				this.clouds.removeAll();
			}
			solarSystem.requestRender();
		}
	};
	var Demo = {
		//插件唯一编号,需要和json里的id保持一致
		id: "Plugins_realTimePrimitives",
		menu: {
			//点击菜单后触发的事件
			click: function (element) {
				const openNewLayerIndex = layer.open({
					type: 1,
					title: "大量对象显示",
					shadeClose: true,
					shade: false,
					area: '340px', // 宽高
					offset: ['140px', ($(window).width() - 450) + 'px'],
					success: function (layero, index) {
					},
					content: $('#plugins_realTimePrimitives'),
					btn: [],
					end: function () {
						//关闭窗口时删除所有添加的对象
						WarEntityUtils.clear();
					}
				});
			}
		},
		start: function () {
			solarSystem.baseViewer.camera.flyTo({
				destination: Cesium.Rectangle.fromDegrees(
					allBounds[0],
					allBounds[1],
					allBounds[2],
					allBounds[3],
				),

			});
			WarEntityUtils.clear();
			WarEntityUtils.init();
			this.createAircraft();
			this.createShip();
			WarEntityUtils.refresh();
			WarEntityUtils.addUpdate();
			solarSystem.baseViewer.clockViewModel.shouldAnimate = true;
			//			solarSystem.requestRender();
		},
		clear: function () {
			WarEntityUtils.clear();
		},
		createAircraft: function () {
			const startLong = aircraftBounds[0];
			const stopLong = aircraftBounds[2];
			const startLat = aircraftBounds[1];
			const stopLat = aircraftBounds[3];
			const rangeLong = stopLong - startLong;
			const rangeLat = stopLat - startLat;
			let id = 1;
			for (let i = 0; i < aircraftCount; i++) {
				const rangeLong = stopLong - startLong;
				const rangeLat = stopLat - startLat;
				const long = startLong + getRandomNumberInRange(0, rangeLong);
				const lat = startLat + getRandomNumberInRange(0, rangeLat);
				const height = getRandomNumberInRange(minHeight, maxHeight);
				var position = Cesium.Cartesian3.fromDegrees(long, lat, height);
				const modelIndex = randomInt(aircraftModels.length);
				let sensorType;
				let targets;
				if (i % (aircraftCount / 50) == 0) {
					if (i % (aircraftCount / 10) == 0) {
						sensorType = "Rectangular";
						
						var count=randomInt(accessCount);
						if(count>0){
							targets = [];
							for (let k = 0; k < count; k++) {
								const targetIndex = randomInt(shipCount);
								targets.push("ship" + targetIndex);
							}
						}
					} else {
						//						sensorType="Conic";
					}
				}
				WarEntityUtils.add({
					id: "aircraft" + id,
					position: position,
					pitch: getRandomNumberInRange(0, Math.PI * 2),
					type: "飞机",
					name: aircraftModels[modelIndex],
					sensorType: sensorType,
					targets: targets
				});
				id++;
			}
		},
		createShip: function () {
			const instancesMap = {};
			const startLong = shipBounds[0];
			const stopLong = shipBounds[2];
			const startLat = shipBounds[1];
			const stopLat = shipBounds[3];
			const rangeLong = stopLong - startLong;
			const rangeLat = stopLat - startLat;
			let id = 1;
			for (let i = 0; i < shipCount; i++) {
				const rangeLong = stopLong - startLong;
				const rangeLat = stopLat - startLat;
				const long = startLong + getRandomNumberInRange(0, rangeLong);
				const lat = startLat + getRandomNumberInRange(0, rangeLat);
				const height = 10;
				var position = Cesium.Cartesian3.fromDegrees(long, lat, height);
				const modelIndex =randomInt(shipModels.length);
				let sensorType;
				if (i % (aircraftCount / 50) == 0) {
					if (i % (aircraftCount / 10) == 0) {
						//						sensorType="Rectangular";
					} else {
						sensorType = "Conic";
					}
				}
				WarEntityUtils.add({
					id: "ship" + id,
					position: position,
					pitch: getRandomNumberInRange(0, Math.PI * 2),
					type: "船",
					name: shipModels[modelIndex],
					sensorType: sensorType,
				});
				id++;
			}
		}
	};
	//把插件对象添加到插件管理器
	Plugins.add(Demo);
})();
