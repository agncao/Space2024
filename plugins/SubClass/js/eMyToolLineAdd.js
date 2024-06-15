import eMyTool from "./eMyTool.js";
/*
 * @Descripttion: 
 * @version: 
 * @Author: alan.lau
 * @Date: 2022-11-08 15:21:18
 * @LastEditors: alan.lau
 * @LastEditTime: 2022-11-08 15:29:02
 */
// import eMyTool from './eMyTool'
class eMyToolLineAdd extends eMyTool {
    constructor(callback) {
        super(callback)
        console.log("eMyToolLineAdd");
        this._type = 'Line'
        this._primitive = null
        this._positions = [] // 临时点(cartesian坐标)
        this._points = [] // cartesian坐标
        this._coordinates = [] // 插值后的点(绘制的时候使用的cartesian坐标)
        this._fixPointCount = 2 // 当前图形的关键点

    }
}
export default eMyToolLineAdd;