//对象实时更新器
let EntityUpdater = (function() {
	//差值方法
    var interpolators = {
        HERMITE: Cesium.HermitePolynomialApproximation,
        LAGRANGE: Cesium.LagrangePolynomialApproximation,
        LINEAR: Cesium.LinearApproximation,
    };
    var EntityUpdater = {
        /**
         * 对象属性更新方法
         * @param{JulianDate} jd 接收数据的时间
         * @param{Entity} entity 需要更新的对象
         * @param{Object} value 源对象对应的数据，实时接口返回的key对应的值
         */
        update:function(jd,entity,value){
        	//不能在定义时设置，因为PositionOrienUpdaters还没加载完成
        	if(!this.updaters){
        		//对象位置和姿态更新的方法，不同对象可以对应不同的方法，不设置的话会调用PositionOrienUpdaters.defaultUpdater的方法（直接更新位置和姿态）
        		this.updaters={
    	            satellite: PositionOrienUpdaters.SampledPositionPropertyUpdate,
    	            launchvehicle: PositionOrienUpdaters.SampledPositionPropertyUpdate,
    	            aircraft: PositionOrienUpdaters.SampledPositionPropertyUpdate,
    	            groundvehicle: PositionOrienUpdaters.SampledPositionPropertyUpdate,
    	            missile: PositionOrienUpdaters.SampledPositionPropertyUpdate,
    	            ship:PositionOrienUpdaters.SampledPositionPropertyUpdate,
    	        };
        	}
        	//更新除了位置和姿态的数据
        	EntityUpdater.commonUpdater(jd,entity,value);
        	
        	//更新位置和姿态，更新方法根据entityType从EntityUpdater.updaters来获取
			var positionOrienUpdater = EntityUpdater.updaters[entity.entityType.toLowerCase()];
			if(!positionOrienUpdater){
				positionOrienUpdater=PositionOrienUpdaters.defaultUpdater;
			}
            console.log("开始调用PositionOrienUpdaters.SampledPositionPropertyUpdate 方法");
			positionOrienUpdater(jd,entity,value);
        },
        /**
         * 其他属性更新方法
         * @param{JulianDate} jd 接收数据的时间
         * @param{Entity} entity 需要更新的对象
         * @param{Object} value 源对象对应的数据，实时接口返回的key对应的值
         */
        commonUpdater: function(jd, entity, value) {
        	//更新颜色
            if (value.label) {
                var label = value.label;
                if (label.fillColor) {
                    entity.label.fillColor = Cesium.Color.unpack(label.fillColor);
                }
            }
            //更新关节动画
            if (value.modelArticulations) {
                console("开始更新关节动画")
                //  如果有关节,则添加到entity里
                var arti = value.modelArticulations;
                //如果对象没有关节动画，则新建动画属性（用于存储所有动画，如果之前用户手动设置其他关节动画，则不新建此属性）
                if (!entity.model.articulations) {
                    entity.model.articulations = new Cesium.PropertyBag();
                }
                for (const key in arti) {
                    var item = arti[key];
                    if (entity.model.articulations.hasProperty(key)) {
                        //             entity.model.articulations.removeProperty(key);
                        var property = entity.model.articulations[key];
                        //如果该动画关节有2个数据，则只保留最后一条数据
                        if(property.times.length>1){
                        	property.removeBefourSamples(property.times[property.times.length-1]);
                        }
                        
                        property.addSamplesPackedArray(item.number, Cesium.JulianDate.fromIso8601(item.epoch));
                    } else {
                        var property = new Cesium.SampledProperty(Number);
                        //默认关节动画为保持方法，一致保持该状态
                        property.forwardExtrapolationType = Cesium.ExtrapolationType.HOLD;
                        property.forwardExtrapolationDuration = Number.MAX_VALUE;
                        
                        //设置插值阶数
                        if (Cesium.defined(item.interpolationDegree)) {
                            property.interpolationDegree = item.interpolationDegree;
                        }
                        //设置插值方法
                        if (Cesium.defined(item.interpolationAlgorithm)) {
                            property.interpolationAlgorithm = interpolators[item.interpolationDegree];
                        }
                        property.addSamplesPackedArray(item.number, Cesium.JulianDate.fromIso8601(item.epoch));

                        entity.model.articulations.addProperty(key, property);
                    }

                }

                console.log(entity.model.articulations);
            }
        },
        /**
         * 新建对象的方法，会根据场景属性里的【实时--对象服务--自动插入对象（noFindCreate）】来调用，默认值会根据场景的全局属性和对象服务属性来确定
         * @param{JulianDate} jd 接收数据的时间
         * @param{String} key 对象的源对象编号,例如：Satellite/earth-leo、Aircraft/plane、GroundVehicle/GV1、LaunchVehicle/CZ4C-ty等
         * @param{Object} value 源对象对应的数据，实时接口返回的key对应的值
         * @param{Object} globalAttribute 全局属性设置信息
         * @returns{Entity} 根据value创建的对象
         */
        createEntity: function(jd, key, value,globalAttribute) {
            var entityType = key.split("/")[0];
            var type = entityTypeUtils.getType(entityType);
            var name = value.name ? value.name : key.substring(key.indexOf("/"));
            //根据场景管理模块获得对象的默认设置
            var data = sceneViewModel.getInitEntityData(entityType, value.centralBody, name);
            delete data.point;
            if (data.parent == "") delete data.parent;
            //设置对象对应的唯一编号
            data.id = key + "_realTime";
            data.centralBody = value.centralBody;
            //实时驱动模式
            data.A805_Properties.propagator = "RealTime";
            data.A805_Properties.realTime = {
                "id": key
            };
            var realTime = CommonUtil.defaultVal(globalAttribute, "DIS.Entity.realTime", {});

            $.extend(true, data.A805_Properties.realTime, realTime);
            //根据类型设置图片和模型
            data.billboard.image = type.icon;
            data.billboard.height = data.billboard.width;
            data.model.gltf = type.model;
            data.label.text = name;

            //设置头部和尾部轨迹时长
            CommonUtil.evalDefVal(data, "path.trailTime", CommonUtil.defaultVal(data, "A805_Properties.realTime.lookBehind", 1800));
            CommonUtil.evalDefVal(data, "path.leadTime", CommonUtil.defaultVal(data, "A805_Properties.realTime.lookAhead", 1800));


            CommonUtil.evalDefVal(data, "path.show", true);

            //根据对象类型的不同，设置相关颜色、坐标系或轨迹是否贴地
            if (type.type == "satellite") {
                CommonUtil.evalDefVal(data, "path.material.solidColor.color.rgbaf", [1, 1, 0, 1]);
                if (data.polyline) CommonUtil.evalDefVal(data, "path.width", 1);
                data.A805_Properties.stepSize = 60;
            } else if (type.type == "launchVehicle") {
                data.A805_Properties.stepSize = 5;
                CommonUtil.evalDefVal(data, "path.material.solidColor.color.rgbaf", [1, 1, 0, 1]);
                if (data.polyline) CommonUtil.evalDefVal(data, "path.width", 1);
                CommonUtil.evalDefVal(data, "path.orbitTracks", [{
                    system: "Fixed",
                    window: 'All',
                    show: true,
                    isCustomColor: false,
                }]);
            } else if (type.type == "missile") {
                data.A805_Properties.stepSize = 5;
                CommonUtil.evalDefVal(data, "path.material.solidColor.color.rgbaf", [1, 1, 0, 1]);
                if (data.polyline) CommonUtil.evalDefVal(data, "path.width", 1);
                CommonUtil.evalDefVal(data, "path.orbitTracks", [{
                    system: "Fixed",
                    window: 'All',
                    show: true,
                    isCustomColor: false,
                }]);
                data.A805_Properties.realTime.lookAheadPropagator = "DeadReckon";
            }else if (type.type == "aircraft" || type.type == "groundVehicle"||type.type =="ship") {
                if (type.type == "groundVehicle"||type.type =="ship") CommonUtil.evalDefVal(data, "path.clampToGround", true);
                if (data.polyline) CommonUtil.evalDefVal(data, "path.width", data.polyline.width);
                if (data.polyline) CommonUtil.evalDefVal(data, "path.material", data.polyline.material);
                data.A805_Properties.realTime.lookAheadPropagator = "DeadReckon";
            }
            console.log(data);
            //根据data配置，创建并返回新建的Entity对象
            return Cesium.CzmlDataSource.processEntityPacket(data);
        }
    };
    return EntityUpdater;
})();