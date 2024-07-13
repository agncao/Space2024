/*
 * @Author: alan.lau
 * @Date: 2022-01-11 21:52:56
 * @LastEditTime: 2022-10-17 13:26:25
 * @LastEditors: alan.lau
 * @Description:
 * @FilePath: \vue_cesuim_debris\src\js\debris\Debris.js
 * 可以输入预定的版权声明、个性签名、空行等
 */

// import satellitejs from '../third/satellite'
// import eMySatellite from './eMySatellite'
/**
 * 空间碎片类（单例）
 */
class Debris {
    constructor(viewer) {
        if (!Debris.instance) {
            Debris.instance = this
            this._viewer = viewer
                // console.log(solarSystem);
            this._pointCollection = solarSystem.addPrimitive(
                new Cesium.PointPrimitiveCollection()
            );
            this._labelCollection = solarSystem.addPrimitive(
                new Cesium.LabelCollection()
            );
            // this._pointCollection = viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection())
            // this._labelCollection = viewer.scene.primitives.add(new Cesium.LabelCollection())

            this._debrisMap = new Map()
            this._orbits = new Set() // 保存要绘制的轨道
        }
        return Debris.instance
    }

    static getInstance(viewer) {
        if (!this.instance) {
            return (this.instance = new Debris(viewer))
        }
        return this.instance
    }

    start(callback) {
        var that = this
            // 获取2个异步结果
            // /plugins/Dem111o/js/satcat.tet
        let urltext = null
        urltext = "/plugins/Dem111o/js/satcat.txt";
        let urljson = null
        urljson = "/plugins/Dem111o/js/ssc.json";
        let xhr = new XMLHttpRequest(),
            okStatus = document.location.protocol === "file:" ? 0 : 200;
        xhr.open('GET', urltext, false);
        xhr.overrideMimeType("text/html;charset=utf-8"); //默认为utf-8
        xhr.send(null);
        // console.log(xhr);
        var catalog = catalogParser(xhr.responseText)
            // console.log(catalog);
        var requests = new XMLHttpRequest();
        requests.open("get", urljson); /*设置请求方法与路径*/
        requests.send(null); /*不发送数据到服务器*/
        requests.onload = function() { /*XHR对象获取到返回信息后执行*/
            if (requests.status == 200) { /*返回状态为200，即为数据获取成功*/
                var json = JSON.parse(requests.responseText);
                // console.log(json);
                // console.log(config);
                if (json.IsSuccess) {
                    json.TLEs.forEach(function(tle, index, arr) {
                        console.log(twoline2satrec);
                        var satrec = twoline2satrec(tle.TLE_Line1, tle.TLE_Line2)
                        let c = catalog[parseInt(satrec.satnum)]

                        satrec.name = c ? c.satname : ''
                        satrec.intldes = c ? c.intldes : ''
                        satrec.owner = c ? c.source : ''
                        satrec.apogee = c ? c.apogee : ''
                        satrec.perigee = c ? c.perigee : ''
                        if (
                            c &&
                            c.payload &&
                            c.ops_status_code && ['+', 'P', 'B', 'S', 'X'].indexOf(c.ops_status_code.toUpperCase()) > -1
                        ) {
                            satrec.type = 'ACTIVE'
                            satrec.color = Cesium.Color.fromCssColorString(config.style.active.billboardSymbolizer.color) //Cesium.Color.GREEN
                            satrec.pixelSize = config.style.active.billboardSymbolizer.pixelSize //5.5
                        } else if (
                            c &&
                            c.payload &&
                            c.ops_status_code && ['+', 'P', 'B', 'S', 'X'].indexOf(c.ops_status_code.toUpperCase()) < 0
                        ) {
                            satrec.type = 'DEAD'
                            satrec.color = Cesium.Color.fromCssColorString(config.style.dead.billboardSymbolizer.color) //Cesium.Color.ORANGE
                            satrec.pixelSize = config.style.dead.billboardSymbolizer.pixelSize //5.5
                        } else if (c && !c.payload && c.satname && c.satname.indexOf(' DEB') > -1) {
                            satrec.type = 'DEBRIS'
                            satrec.color = Cesium.Color.fromCssColorString(config.style.debris.billboardSymbolizer.color) //Cesium.Color.GREY
                            satrec.pixelSize = config.style.debris.billboardSymbolizer.pixelSize //5.5
                        } else if (c && c.satname && (c.satname.indexOf(' R/B') > -1 || c.satname.indexOf(' AKM') > -1)) {
                            satrec.type = 'ROCKET BODY'
                            satrec.color = Cesium.Color.fromCssColorString(config.style.rocket.billboardSymbolizer.color) //'#ff1919'
                            satrec.pixelSize = config.style.rocket.billboardSymbolizer.pixelSize //6.5
                        } else {
                            satrec.type = 'UNKNOWN'
                            satrec.color = Cesium.Color.fromCssColorString(config.style.unknown.billboardSymbolizer.color) //Cesium.Color.WHITE
                            satrec.pixelSize = config.style.unknown.billboardSymbolizer.pixelSize //5.5
                        }
                        // if (process.env.NODE_ENV === 'development') {
                        //   satrec.pixelSize = 25
                        // }

                        satrec.showOrbit = false
                        that._debrisMap.set(satrec.satnum, new eMySatellite(satrec))
                    })
                    callback()
                        // console.log(that);
                        // console.log(init());
                        // console.log(update());
                        // console.log(solarSystem.baseViewer.scene);
                    that.init(solarSystem.baseViewer.scene, Cesium.JulianDate.now())
                    solarSystem.baseViewer.scene.preRender.addEventListener(that.update)

                }
            }
        }
    }

    init(scene, time) {
        var date = Cesium.JulianDate.toDate(time)

        for (var [key, value] of this._debrisMap) {
            const sat = value._satrec
            var positionEci = propagate(sat, date).position
                //  如果数据异常则直接下一个
            if (!Cesium.defined(positionEci)) {
                value.pointPrimitive = this._pointCollection.add({
                    id: sat.satnum,
                    position: new Cesium.Cartesian3(0, 0, 0),
                    color: Cesium.Color.BLACK,
                    pixelSize: 4
                })
                value.labelPrimitive = this._labelCollection.add({
                    id: sat.satnum,
                    position: new Cesium.Cartesian3(0, 0, 0),
                    text: sat.satnum,
                    font: `12pt monospace`,
                    verticalOrigin: Cesium.VerticalOrigin.CENTER,
                    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                    fillColor: Cesium.Color.fromCssColorString('#ffffff'),
                    pixelOffset: new Cesium.Cartesian2(0, 20),
                    eyeOffset: new Cesium.Cartesian3(0, 0, -100000),
                    show: false
                })
                continue
            }
            var gmst = gstime(date)
            var positionEcf = eciToEcf(positionEci, gmst)
                // console.log(positionEcf);
            value.pointPrimitive = this._pointCollection.add({
                position: new Cesium.Cartesian3(positionEcf.x * 1000, positionEcf.y * 1000, positionEcf.z * 1000),
                id: sat.satnum,
                color: sat.color,
                outlineColor: Cesium.Color.BLACK.withAlpha(0.3),
                outlineWidth: 1,
                pixelSize: sat.pixelSize,
                scaleByDistance: new Cesium.NearFarScalar(1, 1.4, 5e7, 0.4),
                translucencyByDistance: new Cesium.NearFarScalar(1, 1, 5e7, 0.78)
            })

            value.labelPrimitive = this._labelCollection.add({
                id: sat.satnum,
                position: new Cesium.Cartesian3(positionEcf.x * 1000, positionEcf.y * 1000, positionEcf.z * 1000),
                text: `${sat.name},${sat.owner},${sat.type}`,
                font: `${config.style.label.textSymbolizer.fontsize}pt monospace`,
                verticalOrigin: Cesium.VerticalOrigin.CENTER,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                fillColor: Cesium.Color.fromCssColorString(config.style.label.textSymbolizer.color),
                pixelOffset: new Cesium.Cartesian2(0, 20),
                eyeOffset: new Cesium.Cartesian3(0, 0, -100000),
                scaleByDistance: new Cesium.NearFarScalar(1, 1.4, 5e7, 0.4),
                translucencyByDistance: new Cesium.NearFarScalar(1, 1, 5e7, 0.78),
                show: false
            })
        }
    }

    //  每时刻，由所有卫星数据allSateRec，更新pointCollection中所有数据
    update(scene, time) {
        // console.log(scene, time);
        Debris.getInstance().icrf(scene, time)
        Debris.getInstance().updateOrbits(scene, time)
        Debris.getInstance().updateSatellites(scene, time)
    }

    /**
     * 根据当前场景时间实时计算视角
     * @param {Scene} scene 场景
     * @param {JulianDate} time 当前时间
     */
    icrf(scene, time) {
        if (scene.mode === Cesium.SceneMode.SCENE3D) {
            var icrfToFixed = Cesium.Transforms.computeIcrfToFixedMatrix(time)
            if (Cesium.defined(icrfToFixed)) {
                var transform = Cesium.Matrix4.fromRotationTranslation(icrfToFixed)
                var offset = Cesium.Cartesian3.clone(scene.camera.position)
                scene.camera.lookAtTransform(transform, offset)
            }
        }
    }

    /**
     * 根据satnum获取碎片对象
     * @param {string} satnum
     * @returns eMySatellite对象
     */
    getDebris(satnum) {
        return this._debrisMap.get(satnum)
    }

    /**
     * 判断轨道集合中是否已经存在satnum
     * @param {string} satnum
     * @returns boolean
     */
    hasOrbit(satnum) {
        return this._orbits.has(satnum)
    }

    /**
     * 添加需要显示轨道的satnum
     * @param {string} satnum
     */
    addOrbit(satnum) {
        this._orbits.add(satnum)
        this._debrisMap.get(satnum).labelPrimitive.show = true
    }

    /**
     * 添加需要隐藏的轨道的satnum
     * @param {string} satnum
     */
    removeOrbit(satnum) {
        this.getDebris(satnum)._orbit.clear()
        this.getDebris(satnum)._orbit._tick = 0
        this.getDebris(satnum)._orbit.visible = true
        this._orbits.delete(satnum)
        this._debrisMap.get(satnum).labelPrimitive.show = false
    }

    clear() {
        // console.log(solarSystem);
        // console.log(vueThis);
        vueThis.tableData = []
        vueThis.tableData2 = []
        if (Debris.getInstance()._pointCollection) {
            solarSystem.removePrimitive(Debris.getInstance()._pointCollection);
            // Debris.getInstance()._pointCollection = undefined;
            Debris.getInstance()._pointCollection = solarSystem.addPrimitive(
                new Cesium.PointPrimitiveCollection()
            );
            console.log('aaaaaaaaaaaa');
        }
        if (Debris.getInstance()._labelCollection) {
            solarSystem.removePrimitive(Debris.getInstance()._labelCollection);
            // Debris.getInstance()._labelCollection = undefined;

            Debris.getInstance()._labelCollection = solarSystem.addPrimitive(
                new Cesium.LabelCollection()
            );
        }

        Debris.getInstance()._orbits.forEach(t => {
            Debris.getInstance().getDebris(t)._stop = true
            Debris.getInstance().getDebris(t)._orbit.clear()
        });
        Debris.getInstance()._debrisMap.clear();
        Debris.getInstance()._orbits.clear()
    }

    /**
     * 更新轨道
     * @param {*} scene
     * @param {*} time
     */
    updateOrbits(scene, time) {
        for (const satnum of Debris.getInstance()._orbits) {
            Debris.getInstance().getDebris(satnum)._orbit.draw(time)
        }
    }

    /**
     * 更新卫星
     * @param {*} scene
     * @param {*} time
     */
    updateSatellites(scene, time) {
        var date = Cesium.JulianDate.toDate(time)
            // console.log(Debris.getInstance()._debrisMap.size);
        for (var [key, value] of Debris.getInstance()._debrisMap) {
            // console.log(value);
            const sat = value._satrec
            if (value.visible) {
                //  获取当前时刻的位置、速度(默认地心惯性系，单位:km)
                var positionEci = propagate(sat, date).position
                    // console.log(positionEci)
                if (Cesium.defined(positionEci)) {
                    var gmst = gstime(date)
                    var positionEcf = eciToEcf(positionEci, gmst)
                    if (!isNaN(positionEcf.x)) {
                        var position = new Cesium.Cartesian3(positionEcf.x * 1000, positionEcf.y * 1000, positionEcf.z * 1000)
                            // console.log(position);
                            // value.pointPrimitive.position = position
                            // value.labelPrimitive.position = position
                        if (value.pointPrimitive) {
                            value.pointPrimitive.position = position
                        }
                        if (value.labelPrimitive) {
                            value.labelPrimitive.position = position
                        }
                    }
                }
            }
            if (typeof(value.pointPrimitive) === 'undefined') return
            value.pointPrimitive.show = value.visible
                // value.labelPrimitive.show = value.visible
        }
    }
}
const _satobjTransform = {
    intldes: [0, 11],
    norad_cat_id: [13, 18],
    multipleNames: [19, 20, (e) => 'M' === e],
    payload: [20, 21, (e) => '*' === e],
    ops_status_code: [21, 22],
    satname: [23, 47],
    source: [49, 54],
    launch: [56, 66, (e) => new Date(e)],
    site: [68, 73],
    decay: [75, 85, (e) => new Date(e)],
    period: [87, 94, (e) => parseFloat(e)],
    inclination: [96, 101, (e) => parseFloat(e)],
    apogee: [103, 109, (e) => parseFloat(e)],
    perigee: [111, 117, (e) => parseFloat(e)],
    rcs: [119, 127, (e) => parseFloat(e)],
    orbital_status_code: [129, 132],
    orbital_status_code_text: [
        129,
        132,
        function(e) {
            return ({
                NCE: 'No Current Elements',
                NIE: 'No Initial Elements',
                NEA: 'No Elements Available',
                DOC: 'Permanently Docked',
                ISS: 'Docked to International Space Station'
            }[e] || null)
        }
    ],
    orbit_center: [
        129,
        132,
        function(e) {
            if (e.length && parseInt(e.split('').pop())) {
                e = {
                    AS: 'Asteroid',
                    EA: 'Earth (default if blank)',
                    EL: 'Earth Lagrange',
                    EM: 'Earth-Moon Barycenter',
                    JU: 'Jupiter',
                    MA: 'Mars',
                    ME: 'Mercury',
                    MO: 'Moon (Earth)',
                    NE: 'Neptune',
                    PL: 'Pluto',
                    SA: 'Saturn',
                    SS: 'Solar System Escape',
                    SU: 'Sun',
                    UR: 'Uranus',
                    VE: 'Venus'
                }[e.slice(0, 2)]
            } else e = 'Earth'
            return e
        }
    ],
    orbit_type: [129, 132, (e) => parseInt(e.split('').pop()) || null]
}

function catalogParser(e) {
    // console.log(e);
    let t = {}
    e.split('\n').map(function(e) {
        let r = {}
        for (let t in _satobjTransform) {
            let i = e.substring(_satobjTransform[t][0], _satobjTransform[t][1]).trim()
            r[t] = _satobjTransform[t][2] ? _satobjTransform[t][2](i) : i
        }
        return (r.norad_cat_id = parseInt(r.norad_cat_id)), (t[r.norad_cat_id.toString()] = r), null
    })
    return t
}