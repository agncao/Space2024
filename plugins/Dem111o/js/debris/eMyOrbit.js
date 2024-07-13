/*
 * @Author: alan.lau
 * @Date: 2022-06-19 17:46:38
 * @LastEditTime: 2022-07-02 20:01:20
 * @LastEditors: alan.lau
 * @Description:
 * @FilePath: \vue_cesuim_debris\src\js\debris\eMyOrbit.js
 * 可以输入预定的版权声明、个性签名、空行等
 */

// import dayjs from 'dayjs'
// import satellitejs from '../third/satellite'

/**
 *空间碎片轨道类
 */
class eMyOrbit {
    constructor(satrec) {
            this._satrec = satrec
            this._primitive = null
            this._visible = true
            this._tick = 0
            this._tock = 0
            this._stop = false
        }
        /**
         * 计算当前时刻，轨道上的点（按resolution取点）
         * @param {JulianDate} ctime2
         * @returns {array} Cartesian3
         */
    generate(ctime2) {
        // 转换JulianDate到JS Date
        let ctime = dayjs(Cesium.JulianDate.toDate(ctime2))
        let leadTime = (this.period * 60) / 2 + 50
        let trailTime = (this.period * 60) / 2 + 50
        let resolution = 120
        let date = ctime.subtract(leadTime, 'second') //开始时间
        const endDate = ctime.add(trailTime, 'second') //结束时间

        let positions = []
            // console.log(satellitejs);
        var gmst = gstime(Cesium.JulianDate.toDate(ctime2))

        while (date.isBefore(endDate)) {
            var positionEci = propagate(this._satrec, date.toDate()).position
            if (Cesium.defined(positionEci)) {
                var positionEcf = eciToEcf(positionEci, gmst)
                if (!isNaN(positionEcf.x)) {
                    var position = new Cesium.Cartesian3(positionEcf.x * 1000, positionEcf.y * 1000, positionEcf.z * 1000)
                    positions.push(position)
                }
            }
            date = date.add(resolution, 'second')
        }
        return positions
    }

    /**
     * 设置可见
     */
    set visible(visible) {
        this._visible = visible
    }

    /**
     * 获取可见性
     */
    get visible() {
        return this._visible
    }

    /**
     *绘制轨道
     * @param {JulianDate} time
     */
    draw(time) {
        if (this._stop)
            return

        if (this._tick === 0) {
            this._tick = time
            this._salt = Math.random() * 10
            this._tock = Cesium.JulianDate.addSeconds(this._tick, this._salt, new Cesium.JulianDate())
            let coors = this.generate(time)
            this._primitive = createPolylinePrimitive('', coors, this._satrec.color, 1, false)
            solarSystem.baseViewer.scene.primitives.add(this._primitive)
        }
        if (this.visible) {
            this._primitive.show = true

            if (Cesium.JulianDate.secondsDifference(this._tock, time) < 5) {
                this.clear()
                this._tick = time
                this._tock = Cesium.JulianDate.addSeconds(this._tick, this._salt, new Cesium.JulianDate())
                    // 创建图元
                let positions = this.generate(time)
                this._primitive = createPolylinePrimitive('', positions, this._satrec.color, 1, false)
                    // 添加面图元到绘制集合
                solarSystem.baseViewer.scene.primitives.add(this._primitive)
            }
        } else {
            this._primitive.show = false
        }
    }

    /**
     * 删除图元
     */
    clear() {
        if (Cesium.defined(this._primitive)) {
            solarSystem.baseViewer.scene.primitives.remove(this._primitive)
        }
    }

    /**
     * 获取轨道周期(单位：分钟)
     * @returns
     */
    get period() {
        return (2 * Math.PI) / this._satrec.no
    }
}

function createPolylineGeometry(cartesians, width) {
    if (cartesians.length < 2) {
        return null
    }
    return new Cesium.PolylineGeometry({
        positions: cartesians,
        width: width,
        vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT
    })
}

/**
 *
 * @param {string} uuid
 * @param {array} cartesians
 * @param {Cesium.Color} color
 * @param {number} width
 * @param {boolean} loop
 * @param {boolean} allowPicking
 * @returns
 */
function createPolylinePrimitive(uuid, cartesians, color, width, allowPicking) {
    width = width == null ? 1 : width
    var geometry = createPolylineGeometry(cartesians, width)
    if (geometry != null) {
        return new Cesium.Primitive({
            allowPicking,
            geometryInstances: new Cesium.GeometryInstance({
                geometry: geometry,
                attributes: {
                    color: Cesium.ColorGeometryInstanceAttribute.fromColor(color)
                },
                id: uuid
            }),
            appearance: new Cesium.PolylineColorAppearance({
                translucent: false
            }),
            asynchronous: false
        })
    }
}