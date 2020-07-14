<template>
    <div class="page-whole-mang">
    	<el-button type="primary" class="mb-15" @click="openModal()" v-show="userRole=='1'">添加水站</el-button>
    	<p class="emptyItem" v-show="curPageList.length == 0">{{empty_notice}}</p>
    	<el-table v-show="curPageList.length > 0" :data="curPageList" border stripe :header-cell-style="{color:'#FFF',backgroundColor:'#2582F7'}">
	       <el-table-column
	           type="index"
	           min-width="5%"
	           align="center"
	           :index="indexMethod"
	        >
	       </el-table-column>

	       <el-table-column
	            label="水站名"
	            min-width="15%">
	            <template slot-scope="scope">
	                <a v-if="userRole=='2'" class="a-btn color-primary-hover" @click="processingLine(scope.row.id, scope.row.wateraffairs_name)">{{ scope.row.wateraffairs_name | nullValueFormat}}</a>
	                <a v-else >{{ scope.row.wateraffairs_name | nullValueFormat}}</a>
	            </template>
	       </el-table-column>

	       <el-table-column
		        label="编号"
		        min-width="5%"
		        prop="num">
	       </el-table-column>

			<el-table-column
				v-if="userRole=='1'"
		        label="政府区域"
		        min-width="15%">
		        <template slot-scope="scope">
	                {{ getAreaName(scope.row.region_id,areaList) | nullValueFormat}}
	            </template>
	       </el-table-column>

	       <el-table-column
	       		v-if="userRole=='1'"
		        label="华晨区域"
		        min-width="15%">
		        <template slot-scope="scope">
	                {{ getAreaName(scope.row.region_id2,hcareaList) | nullValueFormat}}
	            </template>
	       </el-table-column>

	       <el-table-column
		        label="地址"
		        min-width="15%">
		        <template slot-scope="scope">
	                {{ scope.row.address | nullValueFormat}}
	            </template>
	       </el-table-column>

	       <el-table-column
	            label="联系人"
	            min-width="10%">
	            <template slot-scope="scope">
	            	<a v-if="scope.row.all_contacts.length == 0">-</a>
	            	<div v-else v-for="(item, indexs) in scope.row.all_contacts">
	            		<li :class="indexs!=0?'mt-15':''">{{item.contacts | nullValueFormat}}</li>
	            		<span v-if="indexs!=scope.row.all_contacts.length-1&&scope.row.all_contacts.length>1" class="lineSpan"></span>
	            	</div>
	            </template>
	       </el-table-column>

	       <el-table-column
	            label="联系电话"
	            min-width="10%">
	            <template slot-scope="scope">
	            	<a v-if="scope.row.all_contacts.length == 0">-</a>
	            	<div v-else v-for="(item, indexs) in scope.row.all_contacts">
	            		<li :class="indexs!=0?'mt-15':''">{{item.telephone | nullValueFormat}}</li>
	            		<span v-if="indexs!=scope.row.all_contacts.length-1&&scope.row.all_contacts.length>1" class="lineSpan"></span>
	            	</div>
	            </template>
	       </el-table-column>

	       <el-table-column
	            label="用户类型"
	            min-width="10%">
	            <template slot-scope="scope">
	            	<a v-if="scope.row.all_contacts.length == 0">-</a>
	            	<div v-else v-for="(item, indexs) in scope.row.all_contacts">
	            		<li :class="indexs!=0?'mt-15':''">{{global_.getRoleType(item.role_type) | nullValueFormat}}</li>
	            		<span v-if="indexs!=scope.row.all_contacts.length-1&&scope.row.all_contacts.length>1" class="lineSpan"></span>
	            	</div>
	            </template>
	       </el-table-column>

	       <el-table-column
	       		v-if="userRole=='1'"
	            label="操作"
	            min-width="10%">
	            <template slot-scope="scope">
	            	<span class="curPoint color-primary mr-15" @click="openModal(scope.row)">编辑</span>
	            	<span class="curPoint color-primary mr-15" @click="openConfigDialog(scope.row)">水厂配置</span>
	            </template>
	       </el-table-column>
        </el-table>

        <el-pagination v-show="waterData.length > 0"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :total="waterData.length"
            layout="total, prev, pager, next">
        </el-pagination>

        <el-dialog :title="configTitle" :visible.sync="dialogConfigVisible" width="480px">
            <el-form ref="form" label-width="125px">
                <el-form-item label="产水量：">
                    <el-input style="width:100px" type="text" onkeypress="return (/[\d]/.test(String.fromCharCode(event.keyCode)))" maxlength='5' v-model.trim="water_production"></el-input> 吨/小时
                </el-form-item>
                <el-form-item label="加药量：">
                    <el-input style="width:100px" type="text" onkeypress="return (/[\d]/.test(String.fromCharCode(event.keyCode)))" maxlength='5'v-model.trim="drug_dose"></el-input> 毫升/次
                </el-form-item>
                <el-form-item label="消毒泵药量：">
                    <el-input style="width:100px" type="text" onkeypress="return (/[\d]/.test(String.fromCharCode(event.keyCode)))" maxlength='5'v-model.trim="disinfect_pump_drug"></el-input> 毫升/次
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="configWaterSave">确定</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>


		<!-- 编辑站点 -->
        <div id="wholeModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle">
            <div class="modal-dialog modal-dialog-centered modal-lg-720" role="document">
                <div class="modal-content border-0 modal-c-bor">
                    <div class="modal-header">
                        <h5 class="modal-title">{{ addWhole }}水站</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                    	<el-form ref="form" label-width="100px">
			                <el-form-item label="水站名称" required>
			                  <el-input type="text" v-model.trim="wateraffairs_name" maxlength="20"></el-input>
			                </el-form-item>
			                <el-form-item label="水站编号" required>
			                  <el-input type="text" v-model.trim="num" maxlength="10"></el-input>
			                </el-form-item>
			                <el-form-item label="所属政府区域">
			                    <el-select v-model="region_id" clearable :disabled="isEditRegion">
			                        <el-option v-for="(item,index) in areaList" :label="item.region" :value="item.id" :key="item.id"></el-option>
			                    </el-select>
			                </el-form-item>
			                <el-form-item label="所属华晨区域">
			                    <el-select v-model="hcregion_id" clearable :disabled="isEditHcRegion">
			                        <el-option v-for="(item,index) in hcareaList" :label="item.region" :value="item.id" :key="item.id"></el-option>
			                    </el-select>
			                </el-form-item>
			            </el-form>
						<div class="map-address-des">
							地址：在地图上选择具体位置
						</div>
						<div class="map-address-pointer">
							<div class="search-box clearfix">
								<div class="search-box-container">
									<div class="search-box-content clearfix">
										<input id="suggestId" class="search-box-content-common" type="text" v-model.trim="suggest" placeholder="请搜索水站地点" @keyup.enter="searchPlace()">
										<button class="iconfont icon-search" @click="searchPlace()"></button>
									</div>
									<div class="suggest-wrap" v-show="localFlag">
										<div class="suggest-scroll">
											<ul>
												<li class="suggest-item" v-for="item in localData" @click="createMarker(item)">
													<i class="default">{{ item.title }}</i>
													<em>{{ item.address }}</em>
												</li>
											</ul>
										</div>
									</div>
								</div>
							</div>

							<div id="mapAddress" class="map-address-con"></div>
						</div>
                    </div>
					<div class="modal-footer-btn" @click="siteConfigSave()">确定</div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    export default {
        data(){
            return{
            	dialogConfigVisible  	: false,
            	configTitle			 	: "",
            	water_production		: 0,
            	drug_dose				: 0,
            	disinfect_pump_drug		: 0,
            	userRole                : this.$store.getters["siteConfig/renderUserRole"],//账号角色
				itemsOnPage: 10, //分页基数
                currentPage: 1, //当前页
				baiduMap: null,
				local: null,
				localFlag: false,
				localSearchFlag: true,
				localData: [],
				waterData: [],
				curPageList          : [],

				areaList          	: [],
				hcareaList          : [],
				region_id			: "",
				isEditRegion		: false,
				hcregion_id			: "",
				isEditHcRegion		: false,

				addWhole: '添加',
				wateraffairsId: 0,
				wateraffairs_name: '',
				num: '',
				// contacts: '',
				// telephone: '',
				suggest                 : '',
				suggestPoi              : '',
				marker                  : require('@/assets/img/map/marker.png'),
				empty_notice         	: '加载中...',
            }
        },
        components:{
        },
        filters:{
            /**
             * [数据回显格式化]
             * @param  {[type]} transValue [description]
             * @return {[type]}            [description]
             */
            nullValueFormat(transValue){
                return transValue ? transValue : "-";
            },
        },
        created() {
        	if(this.userRole == "1"){
        		this.getAreaList();
        	}
			this.waterListload();
        },
        mounted() {
			this.bindDom();
			this.createMap();
			//显示加载提示
			this.$loading.show();
        },
        methods:{
        	indexMethod(index){
        		return (this.currentPage-1)*this.itemsOnPage+index+1;
        	},
        	handleSizeChange(val) {
                this.itemsOnPage = val;
                this.getData();
            },
            handleCurrentChange(val) {
                this.currentPage = val;
                this.getData();
            },
            getData() {
            	let tmpSliceNumber = (this.currentPage-1)*this.itemsOnPage;
                this.curPageList = this.waterData.slice(tmpSliceNumber,(tmpSliceNumber+this.itemsOnPage));
            },
			/*
			 *创建地图函数
			 */
			bindDom() {
				//点击隐藏搜索列表
				$('body').click((e) => {
					this.localFlag = false;
				});

				//隐藏添加弹出框
				$('#wholeModal').on('hidden.bs.modal', () => {
					this.baiduMap.clearOverlays(); //清除地图上所有覆盖物
				}).on('shown.bs.modal', () => {
					if(this.localSearchFlag) {
						this.baiduMap.setCenter('中国');
						this.baiduMap.setZoom(5);
					}else{
						this.createMarker({
							point: new BMap.Point( this.suggestPoi.lng, this.suggestPoi.lat),
							address: this.suggest
						});
					}
				})
			},
			/**
             * [获取admin账号的区域列表]
             * @return {[type]} [description]
             */
            getAreaList(){
                try{
                    this.$fetch({
                        url: '/Web/Manage/region_list?action=get',
                        method: "get"
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                            for(var i = 0;i < jsonData.data.length;i++){
                            	if(jsonData.data[i].type == "1"){
                            		this.areaList.push(jsonData.data[i]);
                            	}else if(jsonData.data[i].type == "2"){
                            		this.hcareaList.push(jsonData.data[i]);
                            	}
                            }
                        }else{
                            this.global_.showToastErrmsg(jsonData.errmsg);
                        }
                    }).finally(() => {
                        this.$loading.hide();
                    });
                }catch(e){
                    this.global_.showToastErrmsg();
                    console.log("getAreaList: "+e);
                };
            },
			/*
			 *加载水站列表
			 */
			waterListload() {
				try{
					this.$fetch({
						url: '/Web/WaterAffairs/all_water_station?action=get',
						method: "get"
					}).then(res => {
						let jsonData = res.data,
							data = jsonData.data;

						if(jsonData.result == 'success'){
							this.waterData = jsonData.data;
							this.getData();
							if (this.curPageList.length == 0) {
								if(this.role_type == "1"){
	                            	this.empty_notice = '暂无数据，请添加水站';
	                        	}else{
	                        		this.empty_notice = '暂无数据';
	                        	}
	                        }
						}else{
							this.global_.showToastErrmsg(jsonData.errmsg);
						}
					}).finally(()=>{
						this.$loading.hide();
					});
				}catch(e){
					this.global_.showToastErrmsg();
                    console.log("getAreaList: "+e);
                };
			},
			/*
			 *点击进入水站管理
			 */
			processingLine(id,name) {
				this.$store.dispatch('siteConfig/invokeFullScreen', false);
				this.$store.dispatch('siteConfig/invokeSiteOldName', name);
				this.$store.dispatch('siteConfig/invokeSiteName', name);
				this.$router.push({name:'entrance',query:{'sid': id}});
			},
			/*
			 *数据是否为空，为空先生中划线
			 */
			emptyStrike(val) {
				return val?val:'-';
			},
            getAreaName(id,array){
                for(var i = 0;i < array.length;i++){
                    if(array[i].id == id){
                        return array[i].region;
                    }
                }
            },
			/*
			 *启用禁用值验证
			 */
			wholeEnabled(status, val) {
				if(status != val) {
					this.wholeEnabledSave(val);
				}
			},
			/*
			 *启用禁用水站
			 */
			wholeEnabledSave(val) {

			},
			/*
			查询水厂配置
			 */
			openConfigDialog(data){
				this.wateraffairsId 		= data.id;
            	this.configTitle			= data.wateraffairs_name;
            	this.drug_dose				= 0;
            	this.water_production		= 0;
            	this.disinfect_pump_drug				= 0;
            	try{
                    this.$fetch({
                        url: '/Web/Additional/get_site_config?action=get',
                        method: "get",
                        data:{
                        	wateraffairs_id		:this.wateraffairsId,
                        }
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                        	if(jsonData.data.water_production){
	                            this.water_production		= jsonData.data.water_production;
	            			}
	            			if(jsonData.data.drug_dose){
	            				this.drug_dose				= jsonData.data.drug_dose;
	            			}
	            			if(jsonData.data.disinfect_pump_drug){
	            				this.disinfect_pump_drug	= jsonData.data.disinfect_pump_drug;
	            			}
                        }
                        if(parseInt(this.water_production) < 0){
                            this.water_production		= 0;
                        }
                        if(parseInt(this.drug_dose) < 0){
            				this.drug_dose				= 0;
                        }
                        if(parseInt(this.disinfect_pump_drug) < 0){
            				this.disinfect_pump_drug				= 0;
                        }
                    }).finally(() => {
                    	this.dialogConfigVisible 	= true;
                        this.$loading.hide();
                    });
                }catch(e){
                    this.global_.showToastErrmsg();
                    console.log("getAreaList: "+e);
                };
			},
			configWaterSave(){
				try{
                    this.$fetch({
                        url: '/Web/Additional/set_site_config?action=get',
                        method: "get",
                        data:{
                        	wateraffairs_id		: this.wateraffairsId,
                            water_production	: this.water_production,
                            drug_dose			: this.drug_dose,
                            disinfect_pump_drug : this.disinfect_pump_drug,
                        }
                    }).then(res => {
                        let jsonData = res.data;
                        if(jsonData.result == "success"){
                            this.$toast("配置成功");
                            this.dialogConfigVisible = false;
                        }else{
                            this.global_.showToastErrmsg(jsonData.errmsg,"");
                        }
                    }).finally(() => {
                        this.$loading.hide();
                    });
                }catch(e){
                    this.global_.showToastErrmsg("配置失败");
                    console.log("plcexport: "+e);
                };
			},
			/*
			 *打开添加弹出框
			 */
			openModal(data) {
				if(data){
					this.localSearchFlag = false;
					this.addWhole = '编辑';

					this.wateraffairs_name = data.wateraffairs_name;
					this.num = data.num;
					// this.contacts = data.contacts;
					// this.telephone = data.telephone;

					this.suggest = data.address;
					this.suggestPoi = {
						lng: data.longitude,
						lat: data.latitude
					};

					this.wateraffairsId = data.id;
					this.region_id = data.region_id == 0 ? "" : data.region_id;
					this.hcregion_id = data.region_id2 == 0 ? "" : data.region_id2;
					this.isEditRegion = this.region_id != "";
					this.isEditHcRegion  = this.hcregion_id != "";
				}else{
					this.localSearchFlag = true;
					this.addWhole = '添加';

					this.wateraffairs_name = '';
					this.num = '';
					// this.contacts = '';
					// this.telephone = '';

					this.suggest = '';
					this.suggestPoi = {
						lng: '',
						lat: ''
					};

					this.wateraffairsId = 0;
					this.region_id = "";
					this.hcregion_id = "";
					this.isEditRegion = false;
					this.isEditHcRegion = false;
				}

				$('#wholeModal').modal('show');
			},
			/*
			 *创建地图函数
			 */
			createMap() {
				this.baiduMap = new BMap.Map("mapAddress",{enableMapClick: false, minZoom: 5});    // 创建Map实例

				this.nowCityA();

				this.baiduMap.addEventListener('load', () => { //地图加载完成
					this.setMapEvent();//设置地图事件

					this.createSearch();
				});
			},
			/*
			 *地图事件设置函数
			 */
			setMapEvent() {
				this.baiduMap.enableScrollWheelZoom();//启用地图滚轮放大缩小
			},
			/*
			 * 定位当前城市
			 */
			nowCityA() {
				this.baiduMap.centerAndZoom('中国', 5);// 初始化地图,设置中心点坐标和地图级别
			},
			/*
			 *创建搜索事件
			 */
			createSearch() {
				this.local = new BMap.LocalSearch(this.baiduMap,
					{
						onSearchComplete: (results) => {
							let ary = [];

							for (var i = 0; i < results.getCurrentNumPois(); i ++){
								ary.push(results.getPoi(i));
							}

							this.localData = ary;

							if(!ary.length){
								this.global_.showToastErrmsg('未找到相关地址');

								return;
							}else{
								this.localFlag = true;
							}
						}
					}
				);
			},
			/*
			 *搜索
			 */
			searchPlace() {
				if(!this.suggest){
					this.localFlag = false;

					return;
				}

				this.local.search(this.suggest);
			},
			/*
			 *创建定位
			 */
			createMarker(local){
				let point = local.point,
					marker = new BMap.Marker(point, {
						icon: new BMap.Icon(this.marker, new BMap.Size(32,32))
					}); // 创建标注

				this.baiduMap.clearOverlays(); //清除地图上所有覆盖物

				this.suggest = local.address;
				this.suggestPoi = point;

				this.baiduMap.addOverlay(marker);
				this.baiduMap.centerAndZoom(point, 19);

				marker.enableDragging();
				marker.addEventListener('dragend', (e) => {
					let gc = new BMap.Geocoder(),
						pointNew = e.point;

					gc.getLocation(pointNew, (rs) => {
						this.suggest = rs.address;
						this.suggestPoi = pointNew;
					});
				});
			},
			/*
			 *编辑站点添加保存验证
			 */
			siteConfigCheck() {
				if(!this.wateraffairs_name) {
					this.global_.showToastErrmsg('请输入水站名称');

					return false;
				}

				if(!this.num) {
					this.global_.showToastErrmsg('请输入水站编号');

					return false;
				}

				// if(!this.contacts) {
				// 	this.$toast('请输入联系人');

				// 	return false;
				// }

				// if(!this.telephone) {
				// 	this.$toast('请输入电话');

				// 	return false;
				// }
				// if(!/^[0-9\-]+$/.test(this.telephone)){
				// 	this.$toast('电话有误，只支持数字和中划线');
				// 	return false;
				// }

				if(!this.suggest) {
					this.global_.showToastErrmsg('请选择地址');

					return false;
				}

				return true;
			},
			/*
			 *编辑站点添加保存
			 */
			siteConfigSave() {
				if(!this.siteConfigCheck()) {
					return false;
				}

				let _this = this;

				this.$fetch({
					url: '/Web/WaterAffairs/water_station_change?action=post',
					method: "post",
					data: {
						id 					: this.wateraffairsId,
						wateraffairs_name	: this.wateraffairs_name,
						num 				: this.num,
						// contacts 			: this.contacts,
						// telephone 			: this.telephone,
						address 			: this.suggest,
						longitude 			: this.suggestPoi.lng,
						latitude 			: this.suggestPoi.lat,
						region_id 			: this.region_id,
						region_id2 			: this.hcregion_id,

					}
				}).then(res => {
					let json = res.data,
						data = json.data;

					$('#wholeModal').modal('hide');

					if(json.result == 'success'){
						this.waterListload();
						this.global_.showToastErrmsg("保存成功");
					}else{
                        this.global_.showToastErrmsg(jsonData.errmsg,"保存失败");
					}
				}).catch(error => {
					this.global_.showToastErrmsg("保存失败");
                    console.log("siteConfigSave: "+e);
				})
			},
        }
    }
</script>

<style lang="less" scope>
	.modal-lg-720 {
		max-width: 51.428571rem;
	}
	.btn-primary {
		background: #2582F7;
	}
	.btn {
		width: 208px;
		height: 48px;
		box-shadow: 0px 4px 12px 0px rgba(37,130,247,0.2);
		border-radius: 8px;
		font-size: 16px;
		color: #fff;
	}
	.tablerow {
		height: 48px;
		text-align: center;
	}
	.m-t-8 {
		margin-top: 0.571428rem;
	}
	.m-t-16 {
		margin-top: 1.142857rem;
	}
	.m-l-8 {
		margin-left: 0.571428rem;
	}
	.m-l-16 {
		margin-left: 1.142857rem;
	}
	/*
	 *添加水站
	 */
	.form-block {
		.form-group {
			margin-bottom: 0;
		}
		label {
			height: 19px;
			margin-bottom: 0.857142rem;
		}
		input {
			width: 100%;
			float: left;
		}
	}
	.site-input1 {
		width: 240px;
	}
	.site-input2 {
		width: 120px;
	}
	.map-address-des {
		color: #757D88;
		margin: 1.714285rem 0;
	}
	.map-address-pointer {
		width: 45.714285rem;
		height: 28.571428rem;
		background: #F3F5F9;
		border-radius: 4px;
		overflow: hidden;
		position: relative;
	}
	.map-address-con {
		width: 45.714285rem;
		height: 28.571428rem;
	}
	/*
	 *搜索框
	 */
	.search-box {
		position: absolute;
		left: 15px;
		top: 20px;
		pointer-events: none;
		border-radius: 2px;
		z-index: 1;
	}

	.search-box-container {
		position: relative;
		z-index: 2;
		pointer-events: auto;
		width: 354px;
		float: left;
	}

	.search-box-content {
		background: #fff;
		position: relative;
		padding: 0 0 0 16px;
		box-shadow:0px 2px 4px 0px rgba(37,130,247,0.2);
		border-radius:4px;
		overflow: hidden;

		button {
			float: left;
			color: #fff;
			margin-left: 16px;
			background: #2582F7;
			border: 0;
			width: 48px;
			height: 48px;
		}

		.search-box-content-common {
			float: left;
			width: 274px;
			height: 48px;
			border: 0;
			line-height: 46px;
			color: #464d57;
			position: relative;
		}
	}
	.suggest-wrap {
		position: absolute;
		top: 48px;
		background-color: #fff;
		border-top: 1px solid #E4E6E7;
		box-shadow: 1px 2px 2px rgba(0,0,0,.15);
		border-radius: 0 0 2px 2px;

		i {
			padding-left: 39px;
			font-style: normal;
			color: #666;
			position: relative;
			z-index: 1;
			padding-top: 1px;
		}

		em {
			margin-left: 10px;
			margin-right: 20px;
			font-style: normal;
			color: #999;
		}

		.suggest-item{
			display: block;
			height: 32px;
			line-height: 32px;
			padding-right: 10px;
			text-decoration: none;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			cursor: pointer;

			&:hover {
				background-color: #2582F7;

				i, em {
					color: #fff;
				}
			}
		}
	}
	.suggest-scroll {
		width: 305px;
		height: 278px;
		overflow-y: auto;
		overflow-x: hidden;
	}
	.lineSpan{
		background-color: #EBEEF5;
		height: 1px;
		width: 100%;
		margin-top:7.5px;
		margin-left:-10px;
		position: absolute;
	}
</style>