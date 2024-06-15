// import eMyOrbit from './eMyOrbit'

/*
 * @Author: alan.lau
 * @Date: 2022-06-19 17:42:32
 * @LastEditTime: 2022-06-25 15:33:26
 * @LastEditors: alan.lau
 * @Description:
 * @FilePath: \vue_cesuim_debris\src\js\debris\eMySatellite.js
 * 可以输入预定的版权声明、个性签名、空行等
 */

/**
 * 空间碎片类
 */
class eMySatellite {
    constructor(satrec) {
        this._satrec = satrec
        this._orbit = new eMyOrbit(satrec)
        this._visible = true
    }
    get visible() {
        return this._visible
    }
    set visible(visible) {
        this._visible = visible
    }
    get orbit() {
        return this._orbit
    }
}