<script src="/plugins/CACompute/js/CACompute.js"></script>

<div id="plugins_CACompute" style="display:none;">
	<table class="table">
		<tr>
			<td style="width: 300px;vertical-align: top;padding-top: 0px;">
				<table class="table">
					<tr>
					<td style="width: 70px;">
					 	分析对象:
					</td>
					<td>
						<label class="labelInput plugins_CACompute_targeted" value="" data-bind="html:targeted.html, valueUpdate: 'input'"></label>
					</td>
					<td style="width: 69px;">
						<input type="button" style="" value="选择…" data-bind="click:function(data, event){$root.selectEntity(event.currentTarget,'plugins_CACompute_targeted');}">
					</td>
				</tr>
				<tr>
					<td colspan="3">
					 	<span class="ctable-title">时间周期</span>
		  				<table class="ctable " >
		  					<tr>
		  						<td>
		  							开始时间:
		  						</td>
								<td>
									<input type="text" data-bind="value:Start_UTCG, valueUpdate: 'input',event:{change:$root.changeStartTime}" timechange="true" dataValue="DDateUTC" onClick="WdatePicker({dateFmt:'yyyy-MM-ddTHH:mm:ss.sZ'})">
		  						</td>
		  					</tr>
		  					<tr>
		  						<td>
		  							结束时间:
		  						</td>
								<td>
									<input type="text" data-bind="value:Stop_UTCG, valueUpdate: 'input',event:{change:$root.changeStopTime}" timechange="true" dataValue="DDateUTC"  onClick="WdatePicker({dateFmt:'yyyy-MM-ddTHH:mm:ss.sZ'})">
		  						</td>
		  					</tr>
		  				</table>
					</td>
				</tr>
				<tr>
					<td colspan="3">
					 	<span class="ctable-title">数据</span>
		  				<table class="ctable " >
		  					<tr>
		  						<td style="width:42px;">
		  							文件:
		  						</td>
								<td>
							        <input type="file" error="保存坐标文件(.tce)失败！" accept=".tce" labelClass="filespan" class="showFileName" placeholder="使用所有在轨目标" data-bind="event:{change:$root.selectTce}">
		  						</td>
		  					</tr>
		  				</table>
					</td>
				</tr>
				<tr>
					<td colspan="3">
					 	<span class="ctable-title">可见约束</span>
		  				<table class="ctable " >
		  					<tr>
		  						<td style="width: 100px;">
		  							最大可见距离:
		  						</td>
								<td>
									<input type="text" data-bind="value:TolMaxDistance, valueUpdate: 'input'" dataValue="DKm">
		  						</td>
		  					</tr>
		  				</table>
					</td>
				</tr>
				<tr>
					<td colspan="3">
					 	<span class="ctable-title">筛选条件</span>
		  				<table class="ctable " >
		  					<thead>
		  						<tr>
		  							<th style="width: 113px;">
		  								条件
		  							</th>
		  							<th style="width: 30px;">
		  								启用
		  							</th>
		  							<th>
		  								值
		  							</th>
		  						</tr>
		  					</thead>
		  					<tbody >
			  					<tr>
			  						<td>
			  							高度误差:
			  						</td>
			  						<td  style="text-align: center;">
			  							<input type="checkbox" data-bind="checked:TolDh.use">
			  						</td>
									<td>
										<input type="text" data-bind="value:TolDh.value, valueUpdate: 'input'" dataValue="DKm">
			  						</td>
			  					</tr>
			  					<tr>
			  						<td>
			  							轨道面夹角阈值:
			  						</td>
			  						<td  style="text-align: center;">
			  							<input type="checkbox" data-bind="checked:TolTheta.use" disabled="disabled">
			  						</td>
									<td>
										<input type="text" data-bind="value:TolTheta.value, valueUpdate: 'input'" dataValue="DDegree" disabled="disabled">
			  						</td>
			  					</tr>
			  					<tr>
			  						<td>
			  							时间误差:
			  						</td>
			  						<td style="text-align: center;">
			  							<input type="checkbox" data-bind="checked:TolCrossDt.use" disabled="disabled">
			  						</td>
									<td>
										<input type="text" data-bind="value:TolCrossDt.value, valueUpdate: 'input'" dataValue="DSecond" disabled="disabled">
			  						</td>
			  					</tr>
		  					</tbody>
		  				</table>
					</td>
				</tr>
				
				<tr>
					<td colspan="3">
					 	<span class="ctable-title">碰撞设置</span>
		  				<table class="ctable " >
		  					<tr>
		  						<td colspan="2">
		  							<input type="checkbox" data-bind="checked:ImportSat.auto">将碰撞卫星导入场景
		  						</td>
		  					</tr>
		  					<tr>
		  						<td colspan="2">
		  							<input type="checkbox" data-bind="checked:Access.auto">创建链路并导入场景
		  						</td>
		  					</tr>
		  					<tr>
		  						<td style="width: 130px;">
		  							导入最大数量:
		  						</td>
								<td>
									<input type="text" data-bind="value:ImportSat.value, valueUpdate: 'input'" >
		  						</td>
		  					</tr>
		  				</table>
					</td>
				</tr>
				<tr>
					<td colspan="3">
					 	<span class="ctable-title">链路图形</span>
		  				<table class="ctable " >
		  					<tr>
		  						<td>
		  							<input type="checkbox" data-bind="checked:Access.showLine" disabled="disabled">显示线
		  						</td>
		  					</tr>
		  					<tr>
		  						<td>
		  							<input type="checkbox" data-bind="checked:Access.animateHighlight" disabled="disabled">动态高亮
		  						</td>
		  					</tr>
		  					<tr>
		  						<td>
		  							<input type="checkbox" data-bind="checked:Access.staticHighlight" disabled="disabled">静态高亮
		  						</td>
		  					</tr>
		  				</table>
					</td>
				</tr>
				<tr >
					<td colspan="3" style="text-align: center;">
					<span class="draw-bt " data-bind="click:$root.compute" ><i class="fa  fa-fw fa-crosshairs "  style="color:#ffa243;font-size: 18px;"></i><span class="plugins_CACompute_bt">计算</span></span>
					</td>
				</tr>
				</table>
			</td>
			<td style="vertical-align: top;">
				<table>
					<tr>
						<td style="text-align: center;font-size: 18px;font-family: 黑体;">分析结果<span class="download" data-bind="click:$root.download"><i class="downloadi"></i>下载</span></td>
					</tr>
					<tr>
						<td >
							<div style="height:calc(100vh - 240px);overflow: auto;border:1px solid #ccc;">
								<div  class="plugins_CACompute_Results hide">
						      			<div style="padding: 5px;" class="plugins_CACompute_Results_Info">
						      			</div>
										<table class="table ctable clist cthead" style="width: calc(100% - 0px) !important;margin: 0px;top:7px;">
							      			<thead>
							      				<tr>
										      		<td style="width: 50px;">
										      		编号
										      		</td>
										      		<td>
										      		名称
										      		</td>
										      		<td style="width: 190px;">
										      		最近距离时刻<br>(UTCG)
										      		</td>
										      		<td style="width: 60px;">
										      		最近距离<br>(km)
										      		</td>
										      		<td style="width: 75px;">
										      		赤道面夹角<br>(deg)
										      		</td>
										      		<td style="width: 70px;">
										      		相对速度<br>(km/s)
										      		</td>
										      		<td style="width:105px;">
										      		碰撞概率<br>
										      		(1为完全碰撞)
										      		</td>
										      	</tr>
							      			</thead>
							      		</table>
						      			<div style="height:calc(100vh - 411px);overflow-x: auto;overflow-y:scroll;border:0px solid #ccc;">
						      			<table class="table ctable clist" >
							      			<thead>
							      				<tr>
										      		<td style="width: 50px;">
										      		编号
										      		</td>
										      		<td>
										      		名称
										      		</td>
										      		<td style="width: 190px;">
										      		最近距离时刻<br>(UTCG)
										      		</td>
										      		<td style="width: 60px;">
										      		最近距离<br>(km)
										      		</td>
										      		<td style="width: 75px;">
										      		赤道面夹角<br>(deg)
										      		</td>
										      		<td style="width: 70px;">
										      		相对速度<br>(km/s)
										      		</td>
										      		<td style="width:100px;">
										      		碰撞概率<br>
										      		(1为完全碰撞)
										      		</td>
										      	</tr>
							      			</thead>
							      			<tbody class="plugins_CACompute_Results_List">
							      			</tbody>
							      		</table>
					      			</div>
				      			</div>
							</div>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
</div>