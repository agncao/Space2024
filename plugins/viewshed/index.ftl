<script src="/plugins/viewshed/js/viewshed.js"></script>

<div id="plugins_viewshed" style="display:none;">
	<table class="table">
		<tr>
			<td style="width: 70px;">
			 	高度:
			</td>
			<td>
				<input type="text"  data-bind="value:height, valueUpdate: 'input'" dataValue="DMeter">
			</td>
		</tr>
		
		<tr>
			<td >
			 	半径:
			</td>
			<td>
				<input type="range" min="0" max="500" step="0.1" data-bind="value:radius, valueUpdate: 'input'" dataValue="DKm" inputWidth="80">
			</td>
		</tr>
		<tr>
			<td >
			 	X方向半角:
			</td>
			<td>
				<input type="range" min="1" max="90" step="1" value="25" data-bind="value:xHalfAngle, valueUpdate: 'input'" dataValue="DDegree" inputWidth="80">
			</td>
		</tr>
		<tr>
			<td >
			 	Y方向半角:
			</td>
			<td>
				<input type="range" min="1" max="90" step="1" value="45" data-bind="value:yHalfAngle, valueUpdate: 'input'" dataValue="DDegree" inputWidth="80">
			</td>
		</tr>
		
		<tr>
			<td >
			 	方向:
			</td>
			<td>
				<input type="range" min="0" max="360" step="1" value="0"  data-bind="value:heading, valueUpdate: 'input'" dataValue="DDegree" inputWidth="80">
			</td>
		</tr>
		
		<tr>
			<td colspan="2">
				<table>
					<tr>
						<td>
							<input type="checkbox" data-bind="checked:showLateralSurfaces">显示侧面
						</td>
						<td>
							<input type="checkbox" data-bind="checked:showDomeSurfaces">显示圆顶
						</td>
					</tr>
					<tr>
						<td>
							<input type="checkbox" data-bind="checked:environmentConstraint">环境约束
						</td>
						<td>
							<input type="checkbox" data-bind="checked:showEnvironmentOcclusion">显示环境遮挡
						</td>
					</tr>
					<tr>
						<td>
							<input type="checkbox" data-bind="checked:showThroughEllipsoid">地形遮挡
						</td>
						<td>
						</td>
					</tr>
				</table>
				
			</td>
		</tr>
		<tr>
			<td colspan="2">
			<span class="draw-bt " data-bind="click:$root.clickPoint" ><i class="fa  fa-fw fa-crosshairs "  style="color:#ffa243;font-size: 18px;"></i><span>选择位置</span></span>
			</td>
		</tr>
	</table>
</div>