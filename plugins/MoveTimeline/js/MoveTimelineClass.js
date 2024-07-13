(function () {

	let Class = {
		newTimeline: null,
		_stepDiv: null,
		_viewDiv: null,
		_ID: "myTimelineContainer",
		_SELECTID: "myTimelineContainerSelect",
		_BOTTOM: '26px',//控件距离底部的距离
		_LEFTWIDTH: '150',
		isUsing: false,
		currentViewNameAndFlyto: "",//保存 当前使用的viewName。 触发到这个值，校验是否正在执行过 viewname。 
		currentFlytoFun: null,//flyto 函数。 因为这类视角，每一帧都需要触发执行
		close: function () {
			let containerDom = document.getElementById(Class._ID);
			if (containerDom) {
				containerDom.style.bottom = "-150px";
			}
			this.isUsing = false;
		},
		changeSelect: function () {
			let selectDom = document.getElementById(this._SELECTID);
			let index = selectDom.selectedIndex;
			let val = selectDom.options[index].value;


			Plugins.values['Plugins_Moveline'].ChangeToSelect(val + "");

		},
		//每次打开时调用，会从 cazm 读取，显示
		refreshSelect: function (valArr) {
			let selectDom = document.getElementById(this._SELECTID);
			selectDom.innerHTML = "";
			for (let index = 0; index < valArr.length; index++) {
				let val = valArr[index];
				selectDom.options.add(new Option('Movie ' + val, val + ""));
			}
			Class.currentViewNameAndFlyto = "";
		},
		//内部调用添加select
		addSelect: function () {

			let selectDom = document.getElementById(this._SELECTID);
			let val = 0;
			for (let index = 0; index < selectDom.length; index++) {
				val = selectDom.options[index].value;
			}
			let valInt = parseInt(val);

			if (++valInt > 5) {
				layer.alert("最多创建5个方案！");
				return;
			}
			let newVal = valInt + "";
			selectDom.options.add(new Option('Movie ' + newVal, newVal + ""));
			selectDom.value = newVal;


			Plugins.values['Plugins_Moveline'].AddSelect(newVal + "");

			this.changeSelect();
		},
		deleteSelect: function () {
			let selectDom = document.getElementById(this._SELECTID);
			let index = selectDom.selectedIndex;
			let val = selectDom.options[index].value;
			if (val === "1") {
				layer.alert("不能删除Move 1");
				return;
			}

			Plugins.values['Plugins_Moveline'].DeleteSelect(val + "");

			for (let index = 0; index < selectDom.length; index++) {
				if (val === selectDom.options[index].value) {
					selectDom.options.remove(index);
				}
			}

			this.changeSelect();
		},
		initLeft: function () {

			let leftleftOfDiv = 40;
			let leftWidthOfDiv = this._LEFTWIDTH - leftleftOfDiv;
			const leftdiv = document.createElement("div");

			leftdiv.style.position = "absolute";
			leftdiv.style.top = "0px";
			leftdiv.style.left = leftleftOfDiv + "px";
			leftdiv.style.width = leftWidthOfDiv + "px";
			leftdiv.style.height = "100px";
			leftdiv.style.background = "rgba(53, 53, 53, 0.9)";
			leftdiv.style.borderTop = "solid 1px #888";
			leftdiv.style.borderLeft = "solid 10px #888";
			leftdiv.style.borderRight = "solid 1px #888";
			document.getElementById(Class._ID).appendChild(leftdiv);

			let firstDiv = document.createElement("div");
			firstDiv.style.position = "absolute";
			firstDiv.style.top = "0px";
			firstDiv.style.left = "0px";
			firstDiv.style.width = leftWidthOfDiv + "px";
			firstDiv.style.height = "24px";
			firstDiv.style.borderBottom = "solid 1px #888";
			firstDiv.style.textAlign = "center";
			firstDiv.innerHTML = "<button name='+' style='height:fit-content'>+</button>&nbsp;&nbsp;&nbsp;<button name='-' style='height:fit-content'>-</button>";
			leftdiv.appendChild(firstDiv);

			firstDiv.addEventListener('click', e => {
				let dom = e.target;
				if (dom.name) {

					if (dom.name === "+") {
						this.addSelect();
					} else {

						this.deleteSelect();
					}
				}
			});

			firstDiv = document.createElement("div");
			firstDiv.style.position = "absolute";
			firstDiv.style.top = "26px";
			firstDiv.style.left = "0px";
			firstDiv.style.width = leftWidthOfDiv + "px";
			firstDiv.style.height = "19px";
			firstDiv.style.borderBottom = "solid 1px #888";
			firstDiv.style.textAlign = "center";
			firstDiv.innerHTML = "<select id='" + this._SELECTID + "'><option value='1'>Movie 1</option></select>";
			leftdiv.appendChild(firstDiv);

			document.getElementById(this._SELECTID).addEventListener('change', e => {
				this.changeSelect();
			});

			firstDiv = document.createElement("div");
			firstDiv.style.position = "absolute";
			firstDiv.style.top = "47px";
			firstDiv.style.left = "0px";
			firstDiv.style.width = leftWidthOfDiv + "px";
			firstDiv.style.height = "19px";
			firstDiv.style.borderBottom = "solid 1px #888";
			firstDiv.style.textAlign = "center";
			firstDiv.textContent = "动画步长";
			leftdiv.appendChild(firstDiv);

			firstDiv = document.createElement("div");
			firstDiv.style.position = "absolute";
			firstDiv.style.top = "67px";
			firstDiv.style.left = "0px";
			firstDiv.style.width = leftWidthOfDiv + "px";
			firstDiv.style.height = "19px";
			firstDiv.style.borderBottom = "solid 1px #888";
			firstDiv.style.textAlign = "center";
			firstDiv.textContent = "视角设置";
			leftdiv.appendChild(firstDiv);


		},
		init: function (cesiumViewer, parentDom) {
			Class.currentViewNameAndFlyto = "";
			let containerDom = document.getElementById(Class._ID);
			if (containerDom) {
				this.isUsing = true;
				containerDom.style.bottom = this._BOTTOM;
				this.newTimeline.zoomTo(cesiumViewer._timeline._startJulian, cesiumViewer._timeline._endJulian);

				return;
			}
			//构建新的 TimelineContainer. 暂时写死 位置和高度。
			const myTimelineContainer = document.createElement("div");
			myTimelineContainer.id = Class._ID;
			myTimelineContainer.className = "cesium-viewer-timelineContainer";
			parentDom.appendChild(myTimelineContainer);
			myTimelineContainer.style.zIndex = 19990000;
			myTimelineContainer.style.bottom = this._BOTTOM;
			myTimelineContainer.style.left = "0px";
			myTimelineContainer.style.right = "0px";
			myTimelineContainer.style.height = "87px";
			myTimelineContainer.style.paddingLeft = this._LEFTWIDTH + "px";

			this.initLeft();


			//构建 新的 timeline 对象 到地图中。
			this.newTimeline = new Cesium.Timeline(myTimelineContainer, cesiumViewer._timeline._clock);
			this.newTimeline.addEventListener("settime", e => {
				const clock = e.clock;
				clock.currentTime = e.timeJulian;
				//clock.shouldAnimate = false;

			}, false);

			cesiumViewer._timeline._clock.onTick.addEventListener(this._CheckNeedChange, this);

			//遮挡住原有控件，隐藏时候，能保留原有控件状态。 所以该控件状态 会 复制 到 原有控件的状态。
			this.newTimeline._topDiv.addEventListener('setzoom', (e) => {
				cesiumViewer._timeline.zoomTo(e.startJulian, e.endJulian);
			});


			//构建 两个轨道 div，
			let myMainDiv = this.newTimeline._topDiv;

			myMainDiv.childNodes[0].style.width = "100%";
			//设置背景，stepDiv的margin使用这个颜色
			myMainDiv.style.background = "rgba(53, 53, 53, 0.8)";
			myMainDiv.style.left = "0px";
			myMainDiv.style.width = "100%";
			const timeBarEle = this.newTimeline._timeBarEle;
			// 下边框 对称好看
			timeBarEle.style.borderBottom = "solid 1px #888";

			this.newTimeline._needleEle.style.cursor = "pointer";
			this.newTimeline._needleEle.style.border = "2px solid red";
			this.newTimeline._needleEle.style.marginLeft = "-1px";
			const stepdiv = document.createElement("div");
			this._stepDiv = stepdiv;
			stepdiv.className = "stepdiv";
			stepdiv.style.position = "relative";
			stepdiv.style.width = "100%";
			stepdiv.style.height = "20px";
			stepdiv.style.background = "rgba(53, 53, 53, 0.8)";
			stepdiv.style.borderTop = "solid 1px #888";
			stepdiv.style.marginTop = "20px";



			const viewdiv = document.createElement("div");
			this._viewDiv = viewdiv;
			viewdiv.className = "viewdiv";
			viewdiv.style.position = "relative";
			viewdiv.style.width = "100%";
			viewdiv.style.height = "20px";
			viewdiv.style.background = "rgba(53, 53, 53, 0.8)";
			viewdiv.style.borderTop = "solid 1px #888";

			myMainDiv.insertBefore(stepdiv, this.newTimeline._trackContainer);
			myMainDiv.insertBefore(viewdiv, this.newTimeline._trackContainer);

			// //点击红色的线  并确定，是 步长轨 还是 视角轨

			// myMainDiv.addEventListener('click', e => {
			// 	let dom = e.target;
			// 	if (dom._type) {
			// 		if(dom._type=== "step"){
			// 			let value = this.StepData[dom._timeStr].step
			// 			Plugins.values['Plugins_Moveline'].openUpdateStepWindow(dom._timeStr,value);
			// 		}else{
			// 			let value = this.ViewData[dom._timeStr].view
			// 			let isFlytoVal = this.ViewData[dom._timeStr].isFlyto ? true:false;
			// 			Plugins.values['Plugins_Moveline'].openUpdateViewWindow(dom._timeStr,value,isFlytoVal);
			// 		}
			// 	}
			// });

			//点击红色的线  并确定，是 步长轨 还是 视角轨

			this.newTimeline._needleEle.addEventListener('click', e => {
				let Iso8601Str = Cesium.JulianDate.toIso8601(this.newTimeline._scrubJulian, "YYYY-MM-DDThh:mm:ssZ");
				Iso8601Str = Iso8601Str.replace(".", "");
				if (e.pageY < ($(this._stepDiv).offset().top + 20)) {
					Plugins.values['Plugins_Moveline'].openAddStepWindow(Iso8601Str);
				} else {
					Plugins.values['Plugins_Moveline'].openAddViewWindow(Iso8601Str);
				}
			});


			myMainDiv.addEventListener('setzoom', (e) => {
				this._redraw();
			});


			this.isUsing = true;
		},
		_redraw: function () {//私有方法  重新绘制 两类点
			this._unRegeditDrag();
			this._stepDiv.innerHTML = "";
			this._viewDiv.innerHTML = "";
			for (let key in this.StepData) {
				if (true) {
					this._drawPoint(key, true, this.StepData[key].step);
				}
			}
			for (let key in this.ViewData) {
				if (true) {
					this._drawPoint(key, false, this.ViewData[key].view);
				}
			}
			this._regeditDrag();
			Class.currentViewNameAndFlyto = "";
		},
		_regeditDrag: function () {
			let element;
			let start_pageX = -1;
			let start_domX = -1;
			let dragging = false;
			$('.timelinepoint').mousedown(function (e) {
				element = $(this);
				start_pageX = e.pageX;
				start_domX = parseInt(element[0].style.left.replace("px", ""));
				dragging = true;

				console.log(start_pageX)
				console.log(element.offset().left)
				console.log(start_domX)
			});
			$(document).mouseup(function (e) {

				if (dragging) {
					let domOfClick = element[0];
					if (start_pageX == e.pageX) {//点击
						if (domOfClick._type) {
							if (domOfClick._type === "step") {
								let value = Class.StepData[domOfClick._timeStr].step
								Plugins.values['Plugins_Moveline'].openUpdateStepWindow(domOfClick._timeStr, value);
							} else {
								let value = Class.ViewData[domOfClick._timeStr].view
								let isFlytoVal = Class.ViewData[domOfClick._timeStr].isFlyto ? true : false;
								Plugins.values['Plugins_Moveline'].openUpdateViewWindow(domOfClick._timeStr, value, isFlytoVal);
							}
						}
					} else {//产生移动操作了
						let current_domX = parseInt(element[0].style.left.replace("px", ""));
						console.log("当前dom left:" + current_domX);
						if (domOfClick._type) {
							let newtimeStr = Class._getTimeStrFromLeft(current_domX);
							let oldtimeStr = domOfClick._timeStr;

							console.log("当前dom 老时间:" + oldtimeStr);
							console.log("当前dom   时间:" + newtimeStr);
							if (domOfClick._type === "step") {

								Class.addToStepDate({
									timestr: newtimeStr,
									step: Class.StepData[oldtimeStr].step
								});
								Class.deleteStepDate(oldtimeStr);
							} else {
								Class.addToViewDate({
									timestr: newtimeStr,
									view: Class.ViewData[oldtimeStr].view,
									isFlyto: Class.ViewData[oldtimeStr].isFlyto
								});
								Class.deleteViewDate(oldtimeStr);
							}
							Plugins.values['Plugins_Moveline'].writeToScen();
						}

					}

				}
				start_pageX = -1;
				start_domX = -1;
				dragging = false;
			});
			$(document).mousemove(function (e) {
				if (dragging) {
					let domLeft = start_domX + e.pageX - start_pageX;
					if (domLeft < 1) {
						domLeft = 1;
					}
					element[0].style.left = domLeft + "px";
					element[0].previousElementSibling.style.left = (domLeft - 1) + "px";
				}

			});
		},
		_unRegeditDrag: function () {
			$('.timelinepoint').off();
		},
		_getTimeStrFromLeft: function (_left) {//通过 left 获得时间 字符串
			let seconds = (parseFloat(_left) + 2) * this.newTimeline._timeBarSecondsSpan / this.newTimeline._topDiv.clientWidth

			let ret = Cesium.JulianDate.addSeconds(this.newTimeline._startJulian, seconds, Cesium.JulianDate.now())
			return Cesium.JulianDate.toIso8601(ret, 0);
		},
		_getLeftFromTime: function (_time) {//获得参数时间，在 具体 div 中left的值
			const seconds = Cesium.JulianDate.secondsDifference(
				_time,
				this.newTimeline._startJulian
			);
			const xPos = Math.round(
				(seconds * this.newTimeline._topDiv.clientWidth) / this.newTimeline._timeBarSecondsSpan
			);
			return xPos;
		},
		_drawPoint: function (timeStr, isStep, value) {//私有方法，绘制单个点
			let xPos = Class._getLeftFromTime(Cesium.JulianDate.fromIso8601(timeStr));
			const temp = document.createElement("div");
			temp._timeStr = timeStr;
			temp.style.position = "absolute";
			//temp.style.width = "6px";
			//temp.style.height = "6px";
			temp.style.cursor = "pointer";
			temp.style.left = (xPos - 2) + "px";
			temp.className = "timelinepoint";
			//:hover
			const tempTxt = document.createElement("div");

			tempTxt.style.position = "absolute";
			tempTxt.textContent = "视角1";
			tempTxt.style.left = (xPos - 3) + "px";
			tempTxt.style.paddingLeft = "8px";
			tempTxt.style.height = "20px";
			tempTxt.style.background = "rgba(53, 53, 53, 0.8)";


			let txtTime = timeStr.replace("T", " ").replace("Z", " UTC");
			if (isStep) {
				tempTxt.textContent = value + "秒";
				tempTxt.title = txtTime + " : " + value + "秒";
				temp.title = txtTime + " : " + value + "秒";

				temp._type = "step";
				temp.style.background = "red";

				this._stepDiv.appendChild(tempTxt);
				this._stepDiv.appendChild(temp);
			} else {
				tempTxt.textContent = value;
				tempTxt.title = txtTime + " : " + value;
				temp.title = txtTime + " : " + value;

				temp._type = "view";
				temp.style.background = "yellow";
				this._viewDiv.appendChild(tempTxt);
				this._viewDiv.appendChild(temp);
			}


		},

		_CheckNeedChange: function () {
			if (!this.isUsing) { return };
			this._CheckNeedStepChange();
			this._CheckNeedViewChange();
		},
		_CheckNeedStepChange: function () {

			let currentTime = this.newTimeline._clock.currentTime;
			let stepKeys = Object.keys(this.StepData);
			let useStepKey = "-1";
			let stepKeysLength = stepKeys.length;
			for (let i = 0; i < stepKeysLength; i++) {
				let firstTime = Cesium.JulianDate.fromIso8601(stepKeys[0]);
				let endTime = Cesium.JulianDate.fromIso8601(stepKeys[stepKeysLength - 1]);
				if (Cesium.JulianDate.compare(currentTime, firstTime) < 0) {
					useStepKey = "-1";
					break;
				}
				if (Cesium.JulianDate.compare(currentTime, endTime) >= 0) {
					useStepKey = stepKeys[stepKeysLength - 1];
					break;
				}

				let keyTime = Cesium.JulianDate.fromIso8601(stepKeys[i]);
				if (i > 0 && Cesium.JulianDate.compare(currentTime, keyTime) < 0) {
					useStepKey = stepKeys[i - 1];
					break;
				} else {
					useStepKey = "-1";
				}
			}
			if (useStepKey !== "-1") {
				this.newTimeline._clock.multiplier = parseInt(this.StepData[useStepKey].step);
			}

		},
		_CheckNeedViewChange: function () {

			let currentTime = this.newTimeline._clock.currentTime;
			let viewKeys = Object.keys(this.ViewData);
			//当前视角的时间 key
			let useViewKey = "-1";
			//下一个视角的时间  key
			let nextViewKey = "-1";
			let viewKeysLength = viewKeys.length;
			//轮询查看视角是否合适
			for (let i = 0; i < viewKeysLength; i++) {
				let firstTime = Cesium.JulianDate.fromIso8601(viewKeys[0]);
				let endTime = Cesium.JulianDate.fromIso8601(viewKeys[viewKeysLength - 1]);
				if (Cesium.JulianDate.compare(currentTime, firstTime) < 0) {//当前时间小于第一个视角时间
					useViewKey = "-1";
					nextViewKey = "-1";
					break;
				}
				if (Cesium.JulianDate.compare(currentTime, endTime) >= 0) {//如果大于最后一个视角， 执行最后一个视角
					useViewKey = viewKeys[viewKeysLength - 1];
					nextViewKey = "-1";
					break;
				}

				let keyTime = Cesium.JulianDate.fromIso8601(viewKeys[i]);
				if (i > 0 && Cesium.JulianDate.compare(currentTime, keyTime) < 0) {//如果夹在中间。 分别获得前后一个
					useViewKey = viewKeys[i - 1];
					nextViewKey = viewKeys[i];
					break;
				} else {
					useViewKey = "-1";

					nextViewKey = "-1";
				}
			}
			if (useViewKey !== "-1") {

				let needViewName = this.ViewData[useViewKey].view
				let nextViewName = nextViewKey == "-1" ? "-1" : this.ViewData[nextViewKey].view
				let currentIsFlyto = this.ViewData[useViewKey].isFlyto;
				let temp_currentViewNameAndFlyto = useViewKey + needViewName + currentIsFlyto;
				if (temp_currentViewNameAndFlyto != Class.currentViewNameAndFlyto) {
					//如果切换了，设置这个值为空
					Class.currentFlytoFun = null;

					if (sceneViewModel.dataSource.storedViews) {
						let storedView = null;
						let storedViewOfNext = null;
						sceneViewModel.dataSource.storedViews.forEach(value => {
							if (storedView == null && needViewName == value.name) {
								storedView = value;
								Class.currentViewNameAndFlyto = temp_currentViewNameAndFlyto;
							}
							if (storedViewOfNext == null && nextViewName == value.name) {
								storedViewOfNext = value;
							}
						})

						if (storedView) {
							//1、普通视角 flyto配置了 && 有下一视角 && 下一视角同一中心天体  && 没 storedView.transform  && 没 storedViewOfNext.transform && 两个视角 不同
							if (currentIsFlyto && storedViewOfNext && needViewName != nextViewName && storedViewOfNext.centralBody == storedView.centralBody && !Cesium.defined(storedView.transform) && !Cesium.defined(storedViewOfNext.transform)) {//存在 下一个视角
								if (getViewerCentralBody(solarSystem.baseViewer) != storedView.centralBody) {
									solarSystem.setCentralBody(solarSystem.baseViewer.key, storedView.centralBody, 0);
								}
								console.log(`执行 flyto 第一次，从 ${needViewName} 到 ${nextViewName}`);
								this._ClearCamera();

								solarSystem.baseViewer.camera.setView(storedView.view);

								//计算更新对象
								let firstViewTime = Cesium.JulianDate.fromIso8601(useViewKey);
								let nextViewTime = Cesium.JulianDate.fromIso8601(nextViewKey);
								let diffSecondsOfFirstToNext = Cesium.JulianDate.secondsDifference(nextViewTime, firstViewTime);


								Class.currentFlytoFun = {};
								const newOptions = {
									destination: undefined,
									heading: undefined,
									pitch: undefined,
									roll: undefined,
									duration: undefined,
									complete: undefined,
									cancel: undefined,
									endTransform: undefined,
									maximumHeight: undefined,
									easingFunction: undefined,
								};
								newOptions.destination = storedViewOfNext.view.destination;
								newOptions.heading = storedViewOfNext.view.orientation.heading;
								newOptions.pitch = storedViewOfNext.view.orientation.pitch;
								newOptions.roll = storedViewOfNext.view.orientation.roll;
								newOptions.duration = diffSecondsOfFirstToNext;

								Class.currentFlytoFun.tweenFun = Cesium.CameraFlightPath.createTween(solarSystem.baseViewer.scene, newOptions);
								Class.currentFlytoFun.diffSecondsOfFirstToNext = diffSecondsOfFirstToNext;
								Class.currentFlytoFun.firstViewTime = firstViewTime;
								Class.currentFlytoFun.aleadyDealTime = 0;
							}
							// track 视角 flyto
							else if (currentIsFlyto && storedViewOfNext && needViewName != nextViewName && storedViewOfNext.centralBody == storedView.centralBody && Cesium.defined(storedView.transform) && Cesium.defined(storedViewOfNext.transform)) {

								// 校验 trackedId 实体还存在。
								if (storedView.trackedEntityId && storedViewOfNext.trackedEntityId && Cesium.defined(sceneViewModel.dataSource.entities.getById(storedView.trackedEntityId)) && Cesium.defined(sceneViewModel.dataSource.entities.getById(storedViewOfNext.trackedEntityId))) {

									console.log(`执行 flyto 第一次，从 ${needViewName} 到 ${nextViewName}`);



									//把状态保存起来， 连续飞行时使用
									Class.currentFlytoFun = {};
									let firstViewTime = Cesium.JulianDate.fromIso8601(useViewKey);
									let nextViewTime = Cesium.JulianDate.fromIso8601(nextViewKey);
									let diffSecondsOfFirstToNext = Cesium.JulianDate.secondsDifference(nextViewTime, firstViewTime);

									Class.currentFlytoFun.diffSecondsOfFirstToNext = diffSecondsOfFirstToNext;
									Class.currentFlytoFun.firstViewTime = firstViewTime;
									Class.currentFlytoFun.aleadyDealTime = 0;

									Class.currentFlytoFun.trackedEntityId = storedView.trackedEntityId;
									Class.currentFlytoFun.storedView = storedView;
									Class.currentFlytoFun.storedViewOfNext = storedViewOfNext;
									///////////////////////////////////////////////////////////////////////////////////



									//1、获得卫星 当前位置，并转化为 东北天 矩阵，作为 lookAtTransform 的第一个参数备用，后面还需转换。
									var entity = sceneViewModel.dataSource.entities.getById(storedView.trackedEntityId);
									let transform = Cesium.Transforms.eastNorthUpToFixedFrame(entity.position.getValue(currentTime));

									//2、获取卫星当前姿势。 当前的姿势，  保存视角时的姿势。
									console.log("当前姿态：");
									let HPROfCurrent = this._GetHpr(entity, currentTime);
									console.log("保存视角姿态：");
									let HPROfView = this._GetHpr(entity, Cesium.JulianDate.fromIso8601(storedView.currentDate));
									//获取卫星 姿势 结束
									///////////////////////////////////////////////////////
									//3、把前面transform进行三次旋转。 因为后面使用的 offset 是， 视角保存的。 
									transform = Cesium.Matrix4.multiplyByMatrix3(transform, Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(HPROfView.heading - HPROfCurrent.heading + 45)), new Cesium.Matrix4());
									transform = Cesium.Matrix4.multiplyByMatrix3(transform, Cesium.Matrix3.fromRotationY(Cesium.Math.toRadians(HPROfView.pitch - HPROfCurrent.pitch)), new Cesium.Matrix4());
									transform = Cesium.Matrix4.multiplyByMatrix3(transform, Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(HPROfView.roll - HPROfCurrent.roll)), new Cesium.Matrix4());

									/////////////////////////////////////////////////////////////////////
									// 获得 VVLH 坐标系
									let currentPosition = entity.position.getValue(currentTime)
									let deltaTimePosition = entity.position.getValue(Cesium.JulianDate.addSeconds(currentTime, 0.001, new Cesium.JulianDate()))
									let AB = Cesium.Cartesian3.subtract(deltaTimePosition, currentPosition, new Cesium.Cartesian3());
									let AB_normal = Cesium.Cartesian3.normalize(AB, new Cesium.Cartesian3());
									// 计算模型坐标系的旋转矩阵
									let temp_m3 = Cesium.Transforms.rotationMatrixFromPositionVelocity(currentPosition, AB_normal, Cesium.Ellipsoid.WGS84);
									// 模型坐标系到地固坐标系旋转平移矩阵
									transform = Cesium.Matrix4.fromRotationTranslation(temp_m3, currentPosition);

									/////////////////////////////////////////
									//4、获得 offset参数。  按照两个视角间隔，根据当前时间 求 插值。
									var destinationOfCurrent = Class.currentFlytoFun.storedView.view.destination;
									var destinationOfNext = Class.currentFlytoFun.storedViewOfNext.view.destination;
									// 第一个视角位置的 本体 坐标
									var offset = new Cesium.Cartesian3(destinationOfCurrent.x, destinationOfCurrent.y, destinationOfCurrent.z);
									// 第二个视角位置的 本体 坐标
									var offsetOfNext = new Cesium.Cartesian3(destinationOfNext.x, destinationOfNext.y, destinationOfNext.z);
									// 当前时间 到 第一个时间间隔。  在总间隔 之间，求 相对本体坐标。
									let diffSecondsOfCurrentToFirst = Cesium.JulianDate.secondsDifference(currentTime, Class.currentFlytoFun.firstViewTime);
									let newOffset = Cesium.Cartesian3.lerp(offset, offsetOfNext, diffSecondsOfCurrentToFirst / Class.currentFlytoFun.diffSecondsOfFirstToNext, new Cesium.Cartesian3());

									console.log("验证算法");
									console.log(offset);
									console.log(newOffset);
									this._ClearCamera();
									//debugger
									//5、设置 卫星 观测 lookAtTransform
									if (getViewerCentralBody(solarSystem.baseViewer) != storedView.centralBody) {
										solarSystem.setCentralBody(solarSystem.baseViewer.key, storedView.centralBody, 0);
									}
									solarSystem.baseViewer.camera.lookAtTransform(transform, newOffset);
									solarSystem.baseViewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);


									//Class.currentViewNameAndFlyto="";

								} else {
									this._DealViewNameNoNeedFlyto(storedView);
								}
							} else {
								this._DealViewNameNoNeedFlyto(storedView);
							}

						}
					}
				} else {//该视角执行过，但是 有 flyto 痕迹，继续执行 update
					if (Class.currentFlytoFun) {
						let currentTime = this.newTimeline._clock.currentTime;

						let diffSecondsOfCurrentToFirst = Cesium.JulianDate.secondsDifference(currentTime, Class.currentFlytoFun.firstViewTime);

						if (Class.currentFlytoFun.tweenFun) {
							if (Class.currentFlytoFun.aleadyDealTime != diffSecondsOfCurrentToFirst && Class.currentFlytoFun.tweenFun) {
								Class.currentFlytoFun.aleadyDealTime = diffSecondsOfCurrentToFirst;
								try {
									Class.currentFlytoFun.tweenFun.update({ time: diffSecondsOfCurrentToFirst });
								}
								catch (exception) {
									console.warn(exception);
									Class.currentFlytoFun.tweenFun = null;
								}
								finally {

								}


								solarSystem.baseViewer.scene.screenSpaceCameraController.enableInputs = true;
							}
						} else {

							if (Class.currentFlytoFun.aleadyDealTime != diffSecondsOfCurrentToFirst) {
								Class.currentFlytoFun.aleadyDealTime = diffSecondsOfCurrentToFirst;
								console.log(`连续执行，从 ${needViewName} 到 ${nextViewName}`);
								try {
									var entity = sceneViewModel.dataSource.entities.getById(Class.currentFlytoFun.trackedEntityId);

									//获得卫星 当前位置，并转化为 东北天 矩阵，作为 lookAtTransform 的第一个参数。
									let transform = Cesium.Transforms.eastNorthUpToFixedFrame(entity.position.getValue(this.newTimeline._clock.currentTime));

									//获取卫星当前姿势
									console.log("当前姿态：");
									let HPROfCurrent = this._GetHpr(entity, this.newTimeline._clock.currentTime);
									console.log("保存视角姿态：");
									let HPROfView = this._GetHpr(entity, Cesium.JulianDate.fromIso8601(Class.currentFlytoFun.storedView.currentDate));
									//获取卫星 姿势 结束

									transform = Cesium.Matrix4.multiplyByMatrix3(transform, Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(HPROfView.heading - HPROfCurrent.heading + 45)), new Cesium.Matrix4());
									transform = Cesium.Matrix4.multiplyByMatrix3(transform, Cesium.Matrix3.fromRotationY(Cesium.Math.toRadians(HPROfView.pitch - HPROfCurrent.pitch)), new Cesium.Matrix4());
									transform = Cesium.Matrix4.multiplyByMatrix3(transform, Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(HPROfView.roll - HPROfCurrent.roll)), new Cesium.Matrix4());

									/////////////////////////////////////////////////////////////////////
									// 获得 VVLH 坐标系
									let currentPosition = entity.position.getValue(currentTime)
									let deltaTimePosition = entity.position.getValue(Cesium.JulianDate.addSeconds(currentTime, 0.001, new Cesium.JulianDate()))
									let AB = Cesium.Cartesian3.subtract(deltaTimePosition, currentPosition, new Cesium.Cartesian3());
									let AB_normal = Cesium.Cartesian3.normalize(AB, new Cesium.Cartesian3());
									// 计算模型坐标系的旋转矩阵
									let temp_m3 = Cesium.Transforms.rotationMatrixFromPositionVelocity(currentPosition, AB_normal, Cesium.Ellipsoid.WGS84);
									// 模型坐标系到地固坐标系旋转平移矩阵
									transform = Cesium.Matrix4.fromRotationTranslation(temp_m3, currentPosition);

									/////////////////////////////////////////

									var position = Class.currentFlytoFun.storedView.view.destination;
									var positionOfNext = Class.currentFlytoFun.storedViewOfNext.view.destination;
									// 第一个视角位置的 本体 坐标
									var offset = new Cesium.Cartesian3(position.x, position.y, position.z);
									// 第二个视角位置的 本体 坐标
									var offsetOfNext = new Cesium.Cartesian3(positionOfNext.x, positionOfNext.y, positionOfNext.z);
									// 当前时间 到 第一个时间间隔。  在总间隔 之间，求 相对本体坐标。
									let newOffset = Cesium.Cartesian3.lerp(offset, offsetOfNext, diffSecondsOfCurrentToFirst / Class.currentFlytoFun.diffSecondsOfFirstToNext, new Cesium.Cartesian3());
									this._ClearCamera();
									// 设置 卫星 观测 lookAtTransform
									if (getViewerCentralBody(solarSystem.baseViewer) != Class.currentFlytoFun.storedView.centralBody) {
										solarSystem.setCentralBody(solarSystem.baseViewer.key, Class.currentFlytoFun.storedView.centralBody, 0);
									}


									solarSystem.baseViewer.camera.lookAtTransform(transform, newOffset);
									solarSystem.baseViewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
								}
								catch (exception) {
									console.warn(exception);

								}
								finally {

								}

								solarSystem.baseViewer.scene.screenSpaceCameraController.enableInputs = true;
							}
						}


					}
				}

			} else {//如果没达到条件，例如 拖动到 最前面。  设置为空，保证下一次移动到 还会执行
				Class.currentViewNameAndFlyto = "";
			}

		},
		//参数 为 月球中的定义
		//非flyto到下个视角的 执行视角操作
		_DealViewNameNoNeedFlyto: function (storedView) {
			if (getViewerCentralBody(solarSystem.baseViewer) != storedView.centralBody) {
				solarSystem.setCentralBody(solarSystem.baseViewer.key, storedView.centralBody, 0);
			}


			if (Cesium.defined(storedView.transform)) {

				if (storedView.trackedEntityId) {
					var entity = sceneViewModel.dataSource.entities.getById(storedView.trackedEntityId);
					if (Cesium.defined(entity)) {
						solarSystem.baseViewer.trackedEntity = entity;
					}
				}
				setTimeout(function () {
					var transform = Cesium.Matrix4.unpack(storedView.transform);

					var position = storedView.view.destination;
					var offset = new Cesium.Cartesian3(position.x, position.y, position.z);
					solarSystem.baseViewer.camera.lookAtTransform(transform, offset);
					if (storedView.trackedEntityId) {
						var entity = sceneViewModel.dataSource.entities.getById(storedView.trackedEntityId);
						if (Cesium.defined(entity)) {
							solarSystem.baseViewer.trackedEntity = entity;
						}
					}
				}, 20);
			} else {
				this._ClearCamera();
				//solarSystem.baseViewer.camera.flyTo(storedView.view);
				solarSystem.baseViewer.camera.setView(storedView.view);
			}

			console.log(storedView);
		},
		_GetHpr: function (entity, juluTime) {
			//获得卫星 当前位置，并转化为 东北天 矩阵，作为 lookAtTransform 的第一个参数。
			let pvalue = entity.position.getValue(juluTime);


			//获取卫星当前姿势
			let orientationValuemtx4OfCurrent = entity.orientation.getValue(juluTime);

			let mtx4OfCurrent = Cesium.Matrix4.fromRotationTranslation(Cesium.Matrix3.fromQuaternion(orientationValuemtx4OfCurrent, new Cesium.Matrix3()), pvalue, new Cesium.Matrix4());
			let hprOfCurrent = Cesium.Transforms.fixedFrameToHeadingPitchRoll(mtx4OfCurrent, Cesium.Ellipsoid.WGS84, Cesium.Transforms.eastNorthUpToFixedFrame, new Cesium.HeadingPitchRoll());
			console.log('heading : ' + Cesium.Math.toDegrees(hprOfCurrent.heading));
			console.log('pitch : ' + Cesium.Math.toDegrees(hprOfCurrent.pitch));
			console.log('roll : ' + Cesium.Math.toDegrees(hprOfCurrent.roll));
			return { heading: Cesium.Math.toDegrees(hprOfCurrent.heading), pitch: Cesium.Math.toDegrees(hprOfCurrent.pitch), roll: Cesium.Math.toDegrees(hprOfCurrent.roll) }
			//获取卫星 姿势 结束
			///////////////////////////////////////////////////////
		},
		_ClearCamera: function () {

			solarSystem.baseViewer.trackedEntity = undefined;
			var offset = Cesium.Cartesian3.clone(solarSystem.baseViewer.camera.position);
			solarSystem.baseViewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY, offset);
		},
		//存储 步长 数据
		StepData: {

		},
		ViewData: {

		},
		addDataToPluginFromScen: function (data, viewNameArrOfScen) {//从场景中都数据加载到控件

			this.ClearData();

			for (let index = 0; index < data.stepdata.length; index++) {
				const elem = data.stepdata[index];
				this.addToStepDate(elem);
			}

			for (let index = 0; index < data.viewdata.length; index++) {
				const elem = data.viewdata[index];
				if (viewNameArrOfScen.includes(elem.view)) {
					this.addToViewDate(elem);
				}

			}
		},
		deleteStepDate: function (key) {
			if (this.StepData.hasOwnProperty(key)) {
				delete this.StepData[key]
			}
			this._redraw();
			let newObj = {};
			Object.keys(this.StepData).sort().map(key => {
				newObj[key] = this.StepData[key];
			});
			this.StepData = newObj;
		},
		addToStepDate: function (obj) {
			this.StepData[obj.timestr] = {
				timestr: obj.timestr,
				step: obj.step
			};
			this._redraw();
			let newObj = {};
			Object.keys(this.StepData).sort().map(key => {
				newObj[key] = this.StepData[key];
			});
			this.StepData = newObj;
		},
		deleteViewDate: function (key) {
			if (this.ViewData.hasOwnProperty(key)) {
				delete this.ViewData[key]
			}
			this._redraw();
			let newObj = {};
			Object.keys(this.ViewData).sort().map(key => {
				newObj[key] = this.ViewData[key];
			});
			this.ViewData = newObj;
		},
		addToViewDate: function (obj) {
			this.ViewData[obj.timestr] = {
				timestr: obj.timestr,
				view: obj.view,
				isFlyto: obj.isFlyto ? true : false
			};
			this._redraw();
			let newObj = {};
			Object.keys(this.ViewData).sort().map(key => {
				newObj[key] = this.ViewData[key];
			});
			this.ViewData = newObj;
		},
		ClearData: function () {//初始化场景时调用
			this.StepData = {};
			this.ViewData = {};
			this._redraw();
		}
	};

	window.MyTimeLine = Class;
})();