//轨迹预估器
let DISPropagators = (function() {

    var Propagators = {
        /**
         * 二体轨道预估器
         * 
         * @param {Entity} entity Entity对象
         * @param {JulianDate} jd1 第1个点的时间
         * @param {Cartesian3} r1 第1个点的位置(m)
         * @param {Cartesian3} v1 第1个点的速度(m/s)
         * @param {JulianDate} jd2 第2个点的时间
         * @param {Cartesian3} v2 第2个点的位置(m)
         * @param {Cartesian3} v2 第2个点的速度(m/s)
         * @returns {times: JulianDate[], positions:Cartesian3[]} 返回
         *          时间数组，位置数组(m)
         */
        TwoBody: function(entity, jd1, r1,v1, jd2, r2, v2) {
            //对象所属中心天体
            var cbName = entity.centralBody;
            //数据间隔
            var stepDtSec = CommonUtil.defaultVal(entity, "A805_Properties.realTime.timeStep", 60);
            //预估时长
            var dTsec = CommonUtil.defaultVal(entity, "A805_Properties.realTime.lookAhead", 1800);
            if (entity.position.referenceFrame == Cesium.ReferenceFrame.INERTIAL) {

                /**
                    * 已知惯性系的位置、速度，采用TwoBodyPropagator递推之后一系列时间点的位置、速度
                    * 目前仅使用与椭圆轨道，以及Earth,Moon
                    * 
                    * @param {Juliandate}
                    *            轨道历元时刻
                    * @param {Cartesian3}
                    *            r_eci 中心天体Inertial系的位置(m)
                    * @param {Cartesian3}
                    *            v_eci 中心天体Inertial系的速度(m/s)
                    * @param {string}
                    *            cbName 中心天体名称(Earth,Moon)
                    * @param {Number}
                    *            stepDtSec 递推步长(s)
                    * @param {Number}
                    *            dTsec 总时长(s)
                    * @returns {times: JulianDate[], positions:Cartesian3[]} 返回
                    *          时间数组，位置数组(m)
                    */
                return Cesium.RealTime.TwoBodyPropagatorByInertial(jd2, r2, v2, cbName, stepDtSec, dTsec);
            }
            /**
             * 已知Fixed系的两个点位置，采用TwoBodyPropagator递推之后一系列时间点的Fixed系位置(不包含jd2)
             * 由r1_fixed和r2_fixed两个点转换到惯性系下，利用差分法计算速度
             * 二体轨道计算一系列位置后，再转换到Fixed系下的一系列点 目前仅适用于Earth,Moon
             * 
             * @param {Cartesian3}
             *            cbName 中心天体名称(Earth,Moon)
             * @param {Cartesian3}
             *            r1_fixed 第1个点的位置(Fixed系)(m)
             * @param {Cartesian3}
             *            r2_fixed 第2个点的位置(Fixed系)(m)
             * @param {JulianDate}
             *            jd1 第1个点历元
             * @param {JulianDate}
             *            jd2 第2个点历元
             * @param {Number}
             *            stepDtSec 递推步长(s)
             * @param {Number}
             *            dTsec 总时长(s)
             * @returns {times: JulianDate[], positions:Cartesian3[]} 返回
             *          时间数组，Fixed系位置数组(m)
             */
            return Cesium.RealTime.TwoBodyPropagatorByFixed(cbName, r1, r2, jd1, jd2, stepDtSec, dTsec);
        },
        /**
         * DeadReckon位置预估器
         * 
         * @param {Entity} entity Entity对象
         * @param {JulianDate} jd1 第1个点的时间
         * @param {Cartesian3} r1 第1个点的位置(m)
         * @param {Cartesian3} v1 第1个点的速度(m/s)
         * @param {JulianDate} jd2 第2个点的时间
         * @param {Cartesian3} v2 第2个点的位置(m)
         * @param {Cartesian3} v2 第2个点的速度(m/s)
         * @returns {times: JulianDate[], positions:Cartesian3[]} 返回
         *          时间数组，位置数组(m)
         */
        DeadReckon: function(entity, jd1, r1,v1, jd2, r2, v2) {
            //数据间隔
            var stepDtSec = CommonUtil.defaultVal(entity, "A805_Properties.realTime.timeStep", 60);
            //预估时长
            var dTsec = CommonUtil.defaultVal(entity, "A805_Properties.realTime.lookAhead", 1800);
            var posotion=entity.position;
            var forwardExtrapolationDuration=entity.position.forwardExtrapolationDuration;
            entity.position.forwardExtrapolationDuration=dTsec;
            var count = dTsec/stepDtSec;
            var times =[];
            var positions =[];
            for(var i=0;i<count;i++){
            	var nextT = Cesium.JulianDate.addSeconds(jd2, i * stepDtSec, new Cesium.JulianDate());
            	
            	var position = entity.position.getValue(nextT);
            	if(position){
            		times.push(nextT);
            		positions.push(position);
            	}
            }
            var nextT = Cesium.JulianDate.addSeconds(jd2,dTsec, new Cesium.JulianDate());
            if(times.length>0&&Cesium.JulianDate.lessThan(times[times.length-1],nextT)){
            	var position = entity.position.getValue(nextT);
            	if(position){
            		times.push(nextT);
            		positions.push(position);
            	}
            }
            entity.position.forwardExtrapolationDuration=forwardExtrapolationDuration;
            return {
                times:times,
                positions: positions
            };
        }
    };
    return Propagators;
})();