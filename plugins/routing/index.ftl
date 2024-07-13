<script src="/plugins/routing/js/routing.js"></script>
<style>
.chart-tip{
	padding:5px;
	background-color: black;
}
</style>
<div id="plugins_routing" style="display:none;">
	<table class="table">
		<tr>
			<td style="width: 70px;">
			 	最大坡度:
			</td>
			<td>
				<input type="text"  data-bind="value:maxAspect, valueUpdate: 'input'" dataValue="DDegree">
			</td>
			<td style="width: 70px;">
			 	平均速度:
			</td>
			<td>
				<input type="text"  data-bind="value:speed, valueUpdate: 'input'" dataValue="DKm">
			</td>
		</tr>
		<tr>
			<td >
			 	位置文件:
			</td>
			<td colspan="3">
	        	<input type="file" error="保存坐标文件(.csv)失败！" accept=".csv" labelClass="filespan" class="showFileName" data-bind="event:{change:$root.selectPositions}">
			</td>
		</tr>
		<tr>
			<td  colspan="4">
				<span class="draw-bt " data-bind="click:$root.clickPoint" ><i class="fa  fa-fw fa-crosshairs "  style="color:#ffa243;font-size: 18px;"></i><span>添加位置</span></span> <span class="draw-bt " data-bind="click:$root.clearPoints" ><i class="iconfont icon-clear1 pointer"  style="color:#f00;font-size: 18px;"></i><span>清空位置</span></span>
			</td>
		</tr>
		<tr>
			<td colspan="4">
				<div style="height:230px;overflow: auto;border:1px solid #ccc;">
					<div  class="plugins_routing_position">
							<table class="table ctable clist cthead" style="width: calc(100% - 0px) !important;margin: 0px;">
				      			<thead>
				      				<tr>
							      		<td style="width: 50px;">
							      		序号
							      		</td>
							      		<td>
							      		经度
							      		</td>
							      		<td>
							      		纬度
							      		</td>
							      		<td style="width:40px;">
							      		操作
							      		</td>
							      	</tr>
				      			</thead>
				      		</table>
			      			<div style="height:229px;overflow-x: auto;overflow-y:scroll;border:0px solid #ccc;">
			      			<table class="table ctable clist" >
				      			<thead>
				      				<tr>
							      		<td style="width: 50px;">
							      		序号
							      		</td>
							      		<td>
							      		经度
							      		</td>
							      		<td>
							      		纬度
							      		</td>
							      		<td style="width:35px;">
							      		操作
							      		</td>
							      	</tr>
				      			</thead>
				      			<tbody class="plugins_routing_position_List" data-bind="foreach: { data: positions, as: 'pos' }">
				      				<tr>
							      		<td style="width: 50px;" data-bind="html:$index()+1">
							      		
							      		</td>
							      		<td  data-bind="html:pos.lon.toFixed(6)">
							      		
							      		</td>
							      		<td  data-bind="html:pos.lat.toFixed(6)">
							      		</td>
							      		<td style="text-align: center;">
							      		<i class="fa  fa-fw fa-times pointer" data-bind="click:function(data,event){$root.delPos($index());}"  style="color:#ff0000;font-size: 18px;"></i>
							      		</td>
							      	</tr>
				      			</tbody>
				      		</table>
		      			</div>
	      			</div>
				</div>
			</td>
		</tr>
		<tr >
			<td colspan="4" style="text-align: center;padding:0px;">
			<span class="draw-bt " style="margin: 0px;" data-bind="click:$root.compute" ><i class="fa  fa-fw fa-crosshairs "  style="color:#ffa243;font-size: 18px;"></i><span class="plugins_routing_bt">计算</span></span>
			<span class="draw-bt " style="margin: 0px;padding: 0px 3px 5px 2px;position: relative;top: -1px;" data-bind="click:$root.addToScene" ><img src="/resources/icons/entityTypes/groundVehicle.png" style="width:20px;"><span >添加至场景</span></span>
			</td>
		</tr>
	</table>
</div>