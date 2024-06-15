
/*
 * @Descripttion: 
 * @version: 
 * @Author: alan.lau
 * @Date: 2022-11-08 15:19:54
 * @LastEditors: alan.lau
 * @LastEditTime: 2022-11-08 15:20:12
 */
class eMyTool {
    constructor(callback) {
        console.log("eMyTool");
        this._callback = callback
        this._position = null
        this._mapWnd = undefined
    }
    mouseMove(movement, positionCartesian3) { }
    leftUp(movement, positionCartesian3) { }
    leftDown(movement, positionCartesian3) {

        // 处理相同的点
        if (this._position === null || !Cesium.Cartesian2.equals(movement.position, this._position)) {
            this._position = movement.position.clone()
            return true
        }
        return false
    }
    leftClick(movement) { }

    rightUp(movement) { }
    rightDown(movement) { }
    rightClick(movement) { }

    leftDoubleClick(movement) { }
    draw() { }
    done(data) {
        if (this._callback) this._callback(data)
    }
    setMapWnd(mapWnd) {
        this._mapWnd = mapWnd
    }
}
export default eMyTool;
