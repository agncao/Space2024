// 位置和姿态更新器
let PositionOrienUpdaters = (function() {
	var tempDate = new Cesium.JulianDate();
    var Updaters = {
        /**
         *位置拟合取样更新方法，根据Entity对象的设置来推算位置和姿态，并更新位置和姿态。
         * @param{JulianDate} jd 接收数据的时间
         * @param{Entity} entity 需要更新的对象
         * @param{Object} value 源对象对应的数据，实时接口返回的key对应的值
         */
        SampledPositionPropertyUpdate: function(jd, entity, value) {
            jd = Cesium.JulianDate.clone(jd, new Cesium.JulianDate());

            
            //轨道预估器，默认为TwoBody
            var lookAheadPropagator = CommonUtil.defaultVal(entity, "A805_Properties.realTime.lookAheadPropagator", "TwoBody");

            //预估器阶数
            var interpolationDegree = CommonUtil.defaultVal(entity, "A805_Properties.realTime.interpolationOrder", 1);
            
            //尾迹时长
            var lookBehind = entity.A805_Properties.realTime.lookBehind;
            //预估时长
            var lookAhead = entity.A805_Properties.realTime.lookAhead;
            //无接收数据时超时阈值
            var timeOutGap = entity.A805_Properties.realTime.timeOutGap;
            entity.path.trailTime = lookBehind;
            entity.path.leadTime = lookAhead;

            value.orientationEcf=[0.0, 0.0, 0.0, 1.0];
            
            //更新姿态
            if (value.orientationEcf) {
                console.log("开始更新姿态");
                var q1 = Cesium.Quaternion.unpack(value.orientationEcf);
                if (!entity.orientation) {
                	//对象姿态采样属性
                    let property = new Cesium.SampledProperty(Cesium.Quaternion);
                    //根据预估器类型设置正向外推类型
                    if (lookAheadPropagator == "HoldPosition") {
                    	//保存
                        property.forwardExtrapolationType = Cesium.ExtrapolationType.HOLD;
                    } else {
                    	//外推
                        property.forwardExtrapolationType = Cesium.ExtrapolationType.EXTRAPOLATE;
                    }
                    //为了和位置保持等效时长，外推超时阈值为：预估时长+超时阈值
                    property.forwardExtrapolationDuration = lookAhead+timeOutGap;
                    //添加当前姿态
                    property.addSample(jd, q1);
                    //第一次设置对象的姿态属性
                    entity.orientation = property;
                } else {
                    if (lookAheadPropagator == "HoldPosition") {
                        entity.orientation.forwardExtrapolationType = Cesium.ExtrapolationType.HOLD;
                    } else {
                        entity.orientation.forwardExtrapolationType = Cesium.ExtrapolationType.EXTRAPOLATE;
                    }
                    //为了和位置保持等效时长，外推超时阈值为：预估时长+超时阈值
                    entity.orientation.forwardExtrapolationDuration = lookAhead+timeOutGap;
                    //移除超出尾迹时长限制的姿态
                    entity.orientation.removeBefourSamples(Cesium.JulianDate.addSeconds(jd, -lookBehind, tempDate));
                    //添加当前姿态
                    entity.orientation.addSample(jd, q1);
                }
            }
            //更新位置
            if (value.position && value.velocity) {
                var r1 = Cesium.Cartesian3.unpack(value.position);
                var v1 = Cesium.Cartesian3.unpack(value.velocity);
                r1.velocity = v1;
                jd.position = r1;
                if (!entity.position) {
                	//对象位置采样属性
                    let referenceFrame = value.referenceFrame == 0 ? Cesium.ReferenceFrame.FIXED : Cesium.ReferenceFrame.INERTIAL;
                    let property = new Cesium.SampledPositionProperty(referenceFrame);
                    if (lookAheadPropagator == "HoldPosition") {
                        property.forwardExtrapolationType = Cesium.ExtrapolationType.HOLD;
                    } else {
                        property.forwardExtrapolationType = Cesium.ExtrapolationType.EXTRAPOLATE;
                    }
                    //外推超时阈值
                    property.forwardExtrapolationDuration = timeOutGap;
                    //设置差值方法和阶数
                    property.setInterpolationOptions({
                        interpolationAlgorithm: Cesium.LagrangePolynomialApproximation,
                        interpolationDegree: interpolationDegree
                    });
                    property.addSample(jd, r1);

                    //第一次设置对象的位置属性
                    entity.position = property;
                } else {
                    if (lookAheadPropagator == "HoldPosition") {
                        entity.position.forwardExtrapolationType = Cesium.ExtrapolationType.HOLD;
                    } else {
                        entity.position.forwardExtrapolationType = Cesium.ExtrapolationType.EXTRAPOLATE;
                    }
                    entity.position.forwardExtrapolationDuration = timeOutGap;
                    
                    if (entity.position.interpolationDegree != interpolationDegree) {
                        //更新差值方法和阶数
                        entity.position.setInterpolationOptions({
                            interpolationAlgorithm: Cesium.LagrangePolynomialApproximation,
                            interpolationDegree: interpolationDegree
                        });
                    }
                    //移除超出尾迹时长限制的点
                    entity.position.removeBefourSamples(Cesium.JulianDate.addSeconds(jd, -lookBehind, tempDate));
                    
                    //移除外推的点
                    if (entity.current_realTime) {
                        entity.position.removeAfterSamples(entity.current_realTime);
                    }
                    entity.current_realTime = jd;
                    var times = entity.position.times;
                    var preJd = times[times.length - 1];
                    entity.position.addSample(jd, r1);

                    //根据外推类型获取方法，并计算外推轨迹相关的位置
                    if (DISPropagators[lookAheadPropagator]) {
                        var dt = Cesium.JulianDate.secondsDifference(jd, preJd);
                        var prePos = preJd.position;
                        var ret = DISPropagators[lookAheadPropagator](entity, preJd, prePos,prePos.velocity, jd, r1, v1);
                        if (ret) entity.position.addSamples(ret.times, ret.positions);
                    }
                }
            }
        },
        /**
         * 位置和姿态缺省的更新方法，直接更新
         * @param{JulianDate} jd 接收数据的时间
         * @param{Entity} entity 需要更新的对象
         * @param{Object} value 源对象对应的数据，实时接口返回的key对应的值
         */
        defaultUpdater: function(jd, entity, value) {
            if (value.orientationEcf) {
                entity.orientation = Cesium.Quaternion.unpack(value.orientationEcf);
            }
            if (value.position) {
                let referenceFrame = value.referenceFrame == 0 ? Cesium.ReferenceFrame.FIXED : Cesium.ReferenceFrame.INERTIAL;
                if (!entity.position) {
                    entity.positionCache = Cesium.Cartesian3.unpack(value.position);
                    entity.position = new Cesium.ConstantPositionProperty(entity.positionCache, referenceFrame);
                }
                entity.position.setValue(Cesium.Cartesian3.unpack(value.position, 0, entity.positionCache), referenceFrame);
            }
        }
    };

    return Updaters;
})();