let PrimitiveUpdater=(function(){
	//Primitive更新对象
	var PrimitiveUpdater={
			caches:{},
			update:function(jd,key,primitiveCollectionData){
				//从缓存里取PrimitiveCollection
				var pCollection = PrimitiveUpdater.caches[key];
				if(!pCollection){
					//未找到，创建后放入缓存
					pCollection=PrimitiveUpdater.caches[key] = solarSystem.addPrimitive(
	    		    	    new Cesium.PointPrimitiveCollection()
	    		    	  );
				}
				//移除所有点
				pCollection.removeAll();
				var name = primitiveCollectionData.name;
				var color = primitiveCollectionData.color;
				color = Cesium.Color.fromCssColorString(color);
				var size = primitiveCollectionData.size;
				var centralBody = primitiveCollectionData.centralBody;
				
				var primitiveDatas = primitiveCollectionData.primitiveDatas
				
				for(var i=0;i<primitiveDatas.length;i++){
					var pdata = primitiveDatas[i];
					var position = Cesium.Cartesian3.unpack(pdata.position);
					pCollection.add({
					  id:pdata.name,
		    	      pixelSize: size,
		    	      color: color,
		    	      outlineWidth: 0,
		    	      position: position,
		    	    });
				}
			},
			//清除所有对象，当关闭RealTime时
			clear:function(){
				for(var key in PrimitiveUpdater.caches){
					var pCollection = PrimitiveUpdater.caches[key];
					solarSystem.removePrimitive(pCollection);
					delete PrimitiveUpdater.caches[key];
				}
			}
	};
	return PrimitiveUpdater;
})();