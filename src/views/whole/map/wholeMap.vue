<template>
    <div class="indexMain">
		<ul :class="['water-total', fScreen?'top-48':'']">
			<li class="water-c-1">
				<label>水站数</label>
				<span>{{ wateraffairs_count }}</span>
			</li>
			<li class="water-c-2">
				<label>报警水站</label>
				<span>{{ wateraffairs_alarm_count }}</span>
			</li>
			<li class="water-c-3">
				<label>待处理工单数</label>
				<span>{{ realtime_alarm_count }}</span>
			</li>
		</ul>
		
		<!-- 地图 -->
        <div id="map"></div>
    </div>
</template>
<script>
	import { circleShow } from '@/assets/js/circleShow.js';

    export default {
        data(){   
            return{
            	userRole                 : this.$store.getters["siteConfig/renderUserRole"],//lly 为了屏蔽 立即处理按钮
				timer                    : '',
				timerFlag                : true,
				baiduMap                 : null,
				lastInfoBox              : null, //最后一个标注信息框
				
				noalarm                  : require('@/assets/img/map/water-noalarm.png'),
				alarm                    : require('@/assets/img/map/water-alarm.png'),
				
				waterIndexData           : [],
				wateraffairs_count       : 0,
				realtime_alarm_count     : 0,
				wateraffairs_alarm_count : 0,
				
				waterPoint               : [],
				circlesPoint             : []
            }
        },
		computed: {
			// 是否全屏
			fScreen: function() {
                return this.$store.getters['siteConfig/renderFullScreen'];
            }
        },
        created(){
			
        },
		mounted(){
			this.createMap();
			this.waterListIndexload();
			this.bindDom();
			
			this.timer = setInterval(()=>{
				!this.timerFlag || this.waterListIndexload()
			}, 60*1000);
			//console.log("this role id sid + "+this.sid);
        },
		beforeDestroy() {
			clearInterval(this.timer);
		},
        methods:{
			bindDom() {
				$('#alarmSetModal').on('show.bs.modal', () => {
					this.alarmSetLoad();
				})
				$('#alarmSetModal').on('hidden.bs.modal', () => {
					//清除上一次配置
					this.alarmSetData = [];
				})
				
				window.onInfoWindowClick = (id, name) => {
					this.processingLine(id, name);
				}
				
				window.processingClick = (id, t) => {
					this.processingAlarm(id, t);
				}
			},
			/* 
			 *创建地图函数
			 */
			waterListIndexload() {
				this.$fetch({
					url: '/Web/WaterAffairs/overall2_index?action=get',
					method: "get"
				}).then(res => {
					let json = res.data,
						data = json.data;

					if(json.result == 'success'){
						this.wateraffairs_count = data.wateraffairs_count;
						this.wateraffairs_alarm_count = data.wateraffairs_alarm_count;
						// this.realtime_alarm_count = data.realtime_alarm_count;  用错字段 lly处理
						this.realtime_alarm_count = data.today_alarm_count;

						this.waterIndexData = data.wateraffairs_list;
						
						//添加标注
						this.createMarker();
					}else{
						this.global_.showToastErrmsg(jsonData.errmsg,"");
					}
				}).catch(error => {

				})
			},
			/* 
			 *点击进入水站管理
			 */
			processingLine(id,name) {
				this.$store.dispatch('siteConfig/invokeFullScreen', false);
				this.$store.dispatch('siteConfig/invokeSiteName', name);
				this.$store.dispatch('siteConfig/invokeSiteOldName', name);
				this.$router.push({name:'entrance',query:{'sid': id.toString()}});
			},
			/*
			 *创建地图函数
			 */
			createMap() {
				this.baiduMap = new BMap.Map("map",{enableMapClick: false, minZoom: 5, maxZoom: 17});    // 创建Map实例
				
				this.baiduMap.centerAndZoom(new BMap.Point(116.404, 39.915), 10);

				// 覆盖区域图层测试
	            this.baiduMap.addTileLayer(new BMap.PanoramaCoverageLayer());
	            var top_left_navigation = new BMap.NavigationControl();  //左上角，添加默认缩放平移控件
                var top_left_control = new BMap.ScaleControl({anchor: BMAP_ANCHOR_TOP_LEFT});// 左上角，添加比例尺
                this.baiduMap.addControl(top_left_control);
                this.baiduMap.addControl(top_left_navigation);

	            var stCtrl = new BMap.PanoramaControl(); //构造全景控件
	            stCtrl.setOffset(new BMap.Size(10, 40));
	            this.baiduMap.addControl(stCtrl);//添加全景控件

				this.baiduMap.addControl(new BMap.MapTypeControl({
		            mapTypes:[
                        BMAP_NORMAL_MAP,
                        BMAP_HYBRID_MAP
                    ]}));	

				//地图自定义样式
				this.styleMapJson();

				this.setMapEvent();//设置地图事件
				
				this.baiduMap.addEventListener("click", (e) => {
					if(!e.overlay){
						if(this.lastInfoBox){
							//关闭水站信息弹出框，定时器执行
							this.timerFlag = true;
							//判断上一个窗体是否存在，若存在则执行close
							this.lastInfoBox.infobox.close();
							//开启信息窗口
							this.lastInfoBox.marker.boxlabel.open(this.lastInfoBox.marker);
						}
					}
				});
				
				//地图缩放结束
				this.baiduMap.addEventListener('zoomend', () => {
					this.circlePoint();
				});
			},
			circlePoint() {
				this.circlesPoint.forEach(dc => {
					dc.remove();
				});
				
				this.circlesPoint = [];
				
				this.waterPoint.forEach(data => {
					let flag = data.today_alarm_count > 0,
						zoom = flag?3:1,
						color = flag?'#F83D3D':'#2582F7';
					//加载告警动画
					//参数：
					//半径、层数、中心点、{填充颜色、初始透明度}
					let circles = new circleShow(this.baiduMap, 80, zoom, data.point, {fillColor: color, fillOpacity: 0.5});
					//参数：每一层播放的间隔时间、每一层扩散至最大所花费的总时间。
					circles.start(1500,3500);
					
					this.circlesPoint.push(circles);
				})
			},
			styleMapJson() {
				let styleJson = [{
					"featureType": "land",
					"elementType": "geometry",
					"stylers": {
						"visibility": "on",
						"color": "#ffffffff"
					}
				}, {
					"featureType": "transportation",
					"elementType": "geometry",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "transportation",
					"elementType": "labels",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "shopping",
					"elementType": "geometry",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "estate",
					"elementType": "geometry",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "entertainment",
					"elementType": "geometry",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "scenicspots",
					"elementType": "geometry",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "scenicspots",
					"elementType": "labels",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "medical",
					"elementType": "geometry",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "medical",
					"elementType": "labels",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "education",
					"elementType": "labels",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "education",
					"elementType": "geometry",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "subwaystation",
					"elementType": "geometry",
					"stylers": {
						"visibility": "off",
						"color": "#ffffff00"
					}
				}, {
					"featureType": "manmade",
					"elementType": "labels",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "manmade",
					"elementType": "geometry",
					"stylers": {
						"visibility": "on",
						"color": "#e5e7eb59"
					}
				}, {
					"featureType": "building",
					"elementType": "geometry",
					"stylers": {
						"visibility": "on"
					}
				}, {
					"featureType": "roadarrow",
					"elementType": "labels.icon",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "subwaylabel",
					"elementType": "labels",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "subwaylabel",
					"elementType": "labels.icon",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "tertiarywaysign",
					"elementType": "labels.icon",
					"stylers": {
						"visibility": "on"
					}
				}, {
					"featureType": "subway",
					"elementType": "geometry",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "vacationway",
					"elementType": "geometry",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "universityway",
					"elementType": "geometry",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "scenicspotsway",
					"elementType": "geometry",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "local",
					"elementType": "geometry",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "fourlevelway",
					"elementType": "geometry",
					"stylers": {
						"visibility": "on"
					}
				}, {
					"featureType": "fourlevelway",
					"elementType": "labels.icon",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "fourlevelway",
					"elementType": "labels",
					"stylers": {
						"visibility": "on"
					}
				}, {
					"featureType": "tertiaryway",
					"elementType": "geometry",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "tertiaryway",
					"elementType": "labels",
					"stylers": {
						"visibility": "on"
					}
				}, {
					"featureType": "arterial",
					"elementType": "geometry",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "arterial",
					"elementType": "labels.icon",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "cityhighway",
					"elementType": "geometry",
					"stylers": {
						"visibility": "on"
					}
				}, {
					"featureType": "airportlabel",
					"elementType": "labels",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "airportlabel",
					"elementType": "labels.icon",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "educationlabel",
					"elementType": "labels",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "educationlabel",
					"elementType": "labels.icon",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "medicallabel",
					"elementType": "labels",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "medicallabel",
					"elementType": "labels.icon",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "entertainmentlabel",
					"elementType": "labels",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "entertainmentlabel",
					"elementType": "labels.icon",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "estatelabel",
					"elementType": "labels",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "estatelabel",
					"elementType": "labels.icon",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "businesstowerlabel",
					"elementType": "labels.icon",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "businesstowerlabel",
					"elementType": "labels",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "restaurantlabel",
					"elementType": "labels.icon",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "restaurantlabel",
					"elementType": "labels",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "hotellabel",
					"elementType": "labels.icon",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "hotellabel",
					"elementType": "labels",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "shoppinglabel",
					"elementType": "labels.icon",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "shoppinglabel",
					"elementType": "labels",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "lifeservicelabel",
					"elementType": "labels.icon",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "lifeservicelabel",
					"elementType": "labels",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "carservicelabel",
					"elementType": "labels",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "carservicelabel",
					"elementType": "labels.icon",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "transportationlabel",
					"elementType": "labels.icon",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "transportationlabel",
					"elementType": "labels",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "financelabel",
					"elementType": "labels",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "financelabel",
					"elementType": "labels.icon",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "continent",
					"elementType": "labels",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "country",
					"elementType": "labels",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "city",
					"elementType": "labels",
					"stylers": {
						"visibility": "on"
					}
				}, {
					"featureType": "governmentlabel",
					"elementType": "labels",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "governmentlabel",
					"elementType": "labels.icon",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "companylabel",
					"elementType": "labels",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "companylabel",
					"elementType": "labels.icon",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "scenicspotslabel",
					"elementType": "labels",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "scenicspotslabel",
					"elementType": "labels.icon",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "poilabel",
					"elementType": "labels",
					"stylers": {
						"visibility": "on"
					}
				}, {
					"featureType": "poilabel",
					"elementType": "labels.icon",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "water",
					"elementType": "geometry",
					"stylers": {
						"visibility": "on",
						"color": "#2582f7ff"
					}
				}, {
					"featureType": "green",
					"elementType": "geometry",
					"stylers": {
						"visibility": "on",
						"color": "#d0fdfaff"
					}
				}, {
					"featureType": "building",
					"elementType": "geometry.fill",
					"stylers": {
						"color": "#e5e7ebff"
					}
				}, {
					"featureType": "building",
					"elementType": "geometry.stroke",
					"stylers": {
						"color": "#ffffff00"
					}
				}, {
					"featureType": "arterial",
					"elementType": "labels",
					"stylers": {
						"visibility": "on"
					}
				}, {
					"featureType": "cityhighway",
					"elementType": "labels",
					"stylers": {
						"visibility": "on"
					}
				}, {
					"featureType": "highway",
					"elementType": "geometry",
					"stylers": {
						"visibility": "on"
					}
				}, {
					"featureType": "highway",
					"elementType": "labels",
					"stylers": {
						"visibility": "on"
					}
				}, {
					"featureType": "road",
					"elementType": "geometry",
					"stylers": {
						"visibility": "on"
					}
				}, {
					"featureType": "provincialway",
					"elementType": "geometry",
					"stylers": {
						"visibility": "on"
					}
				}, {
					"featureType": "provincialway",
					"elementType": "geometry.fill",
					"stylers": {
						"color": "#f3f5f6ff"
					}
				}, {
					"featureType": "provincialway",
					"elementType": "geometry.stroke",
					"stylers": {
						"color": "#d7e0e5ff"
					}
				}, {
					"featureType": "provincialway",
					"elementType": "labels",
					"stylers": {
						"visibility": "on"
					}
				}, {
					"featureType": "provincialway",
					"elementType": "labels.text.stroke",
					"stylers": {
						"color": "#ffffffff"
					}
				}, {
					"featureType": "highway",
					"elementType": "geometry.stroke",
					"stylers": {
						"color": "#d7e0e5ff"
					}
				}, {
					"featureType": "highway",
					"elementType": "geometry.fill",
					"stylers": {
						"color": "#f3f5f6ff"
					}
				}, {
					"featureType": "fourlevelway",
					"elementType": "geometry.stroke",
					"stylers": {
						"color": "#d7e0e5ff"
					}
				}, {
					"featureType": "fourlevelway",
					"elementType": "geometry.fill",
					"stylers": {
						"color": "#f3f5f6ff"
					}
				}, {
					"featureType": "nationalway",
					"elementType": "geometry.fill",
					"stylers": {
						"color": "#f3f5f6ff"
					}
				}, {
					"featureType": "cityhighway",
					"elementType": "geometry.fill",
					"stylers": {
						"color": "#f3f5f6ff"
					}
				}, {
					"featureType": "arterial",
					"elementType": "geometry.fill",
					"stylers": {
						"color": "#f3f5f6ff"
					}
				}, {
					"featureType": "tertiaryway",
					"elementType": "geometry.fill",
					"stylers": {
						"color": "#f3f5f6ff"
					}
				}, {
					"featureType": "local",
					"elementType": "labels",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "local",
					"elementType": "labels.icon",
					"stylers": {
						"visibility": "off"
					}
				}];
				
				this.baiduMap.setMapStyle({styleJson:styleJson});
			},
			/*
			描述：获取随机数
			参数：
			transMin: 最小范围值
			transMax: 最大范围值
			*/
			getRandomNum(Min,Max){  
				var Range = Max - Min;  
				var Rand = Math.random();  
				return(Min + Math.round(Rand * Range));
			},
			/*
			 * 定位当前城市
			 */
			nowCityA() {
				let iLen = this.waterIndexData.length,
					_this = this;
				
				if(iLen){
					//var index = this.getRandomNum(0,iLen-1),
					//	data = this.waterIndexData[index],
					//	point= new BMap.Point(data.longitude,data.latitude);

					//_this.baiduMap.panTo(point);// 初始化地图,设置中心点坐标和地图级别
				}else{
					let geolocation = new BMap.Geolocation();
						
					geolocation.getCurrentPosition(function(r) {
						if(this.getStatus() == BMAP_STATUS_SUCCESS){
							_this.baiduMap.panTo(r.point);
						}
					},{enableHighAccuracy: true});
				}
			},
			/* 
			 *地图事件设置函数
			 */
			setMapEvent() {
				this.baiduMap.enableScrollWheelZoom();//启用地图滚轮放大缩小
			},
			/* 
			 *创建标注
			 */
			createMarker(){
				this.clear();
				this.waterPoint = [];
				
				this.waterIndexData.forEach(data => {
					let point = new BMap.Point(data.longitude, data.latitude), 
						marker = new BMap.Marker(point,
						{
							icon: new BMap.Icon(data.today_alarm_count > 0?this.alarm:this.noalarm,new BMap.Size(24,24))
						}
					);
					
					this.baiduMap.addOverlay(marker);
					
					this.infoBoxLabelCreat(marker, data);
					
					this.waterPoint.push({point: point, today_alarm_count: data.today_alarm_count});

					marker.addEventListener("click", (d) => {
						d.target.boxlabel.close();

						if(this.lastInfoBox){
							//判断上一个窗体是否存在，若存在则执行close
							this.lastInfoBox.infobox.close();
							
							//开启信息窗口
							if(this.lastInfoBox.marker != d.target) {
								this.lastInfoBox.marker.boxlabel.open(this.lastInfoBox.marker);
							}
						}
						
						if(data.today_alarm_count){
							this.infoBoxCreat(false, marker, data);
							// this.alarmTimeload(data.id, marker, data);
						}else{
							this.infoBoxCreat(false, marker, data);
						}
					});
				});

				//地图初始化位置
				this.nowCityA();
				
				this.circlePoint();
			},
			/**
			 *清除地图覆盖物
			 */
            clear () {
                this.baiduMap.clearOverlays();
            },
			/* 
			 *地图弹出框当日报警数据加载
			 */
			alarmTimeload(transId, transmarker, transData) {
				let time = this.global_.dataChartTime();

				this.$fetch({
					url: '/Web/WaterAffairs/alarm_select?action=get',
					method: "get",
					data: {
						type: 'site',
						wateraffairs_id: transId,//查询站点ID，可多选，多个ID之间使用英文逗号分割，查询全部时，填all
						start_date: time.t,//开始日期，2020-04-10
						end_date: time.t,//结束日期，2020-04-10
					}
				}).then(res => {
					let json = res.data,
						data = json.data;

					if(json.result == 'success'){
						this.waterTimeData = data;
						
						this.infoBoxCreat(true, transmarker, transData);
					}else{
						this.$toast(json.errmsg);
					}
				}).catch(error => {
					
				})
			},
			/* 
			 *创建Map弹出框
			 */
			infoBoxCreat(transType, transmarker, transData) {
				//打开水站信息弹出框，定时器不执行，避免刷新数据影响操作和水站信息的查看
				this.timerFlag = false;

				let flag = transType && this.waterTimeData.length,
					cs = flag?'map-box-alarm':'map-box-no';

				let html = 
				'<ul class="map-box '+cs+'">'+
					'<li class="map-par">'+
						'<div id="mediaImg'+transData.id+'" class="map-media"></div>'+
						'<div class="map-type">'+
							'<label>系统工单数</label>'+
							'<span class="water-c-3">'+transData.today_alarm_count+'</span>'+
						'</div>'+
						'<div class="map-type">'+
							'<label>已处理</label>'+
							'<span class="map-c-1">'+transData.today_treated_count+'</span>'+
						'</div>'+
					'</li>'+
					'<li class="map-info">'+
						'<a class="map-name color-primary-hover t-ellipsis curPoint" onclick="onInfoWindowClick('+transData.id+', \''+transData.wateraffairs_name+'\')">'+transData.wateraffairs_name+'</a>'+
						'<div class="map-num t-ellipsis">水站编号: '+transData.num+'</div>'+
						'<div class="map-address">'+transData.address+'</div>';
						if (null != transData.all_contacts && transData.all_contacts.length > 0) {
							for (var i = 0; i < transData.all_contacts.length; i++) {
								let temp = transData.all_contacts[i];
								if (temp.role_type == "1") {//政府用户
                                    html += '<div class="map-phone mt-6">管理员联系方式：</div>';
								} else {
									html += '<div class="map-phone mt-6">技术支持联系方式：</div>';
								}
								html += '<div class="map-phone">联系人  : '+temp.contacts+'</div>';
						        html += '<div class="map-phone t-ellipsis">联系电话 : '+temp.telephone+'</div>';
							}
						}
					html += '</li>';
				
				if(flag){
					html +='<li class="map-alarm">';
					html +=     '<div class="map-alarm-title">';
					html +=         '<label>报警</label>';
					html +=     '</div>';
					this.waterTimeData.forEach((data, index) => {
						html += '<div class="map-a-con clearfix">';
						html += 	'<div class="map-serial">'+(index+1)+'</div>';
						html += 	'<div class="map-inner">';
						html += 		'<div class="map-text">'+data.alarm_reason+'</div>';
						html += 		data.process_time || this.userRole == 2?'':'<button class="map-op-btn" onclick = "processingClick('+data.id+', this)">立即处理</button>';
						html += 	'</div>';
						html += '</div>';
					})
					html +='</li>';
				}
				html += '</ul>';

				let infoBox = new BMapLib.InfoBox(this.baiduMap, html, {
					boxStyle:{
					},
					enableAutoPan: true,
					align: INFOBOX_AT_BOTTOM,
					offset: new BMap.Size(10, 20) //infobox偏移量
				});
				
				this.lastInfoBox = {
					infobox: infoBox,
					marker: transmarker
				};

				//开启信息窗口
				infoBox.open(transmarker);
				//加载街景图片
				this.markerImg(transData);
				// $('.map-alarm').perfectScrollbar();
				$('.map-info').perfectScrollbar();
			},
			/* 
			 *加载街景图片,加载成功后显示
			 */
			markerImg(transData) {
				let img = new Image();
				img.src = 'http://api.map.baidu.com/panorama/v2?ak=lB1HfVat6HtAdojSKV6voE11daAKOQgi&width=240&height=135&location='+transData.longitude+','+transData.latitude+'&fov=180';
				img.onload = (res) => {
					$('#mediaImg'+transData.id).html('<img src="'+img.src+'">');
				}
			},
			/* 
			 *创建Map Label
			 */
			infoBoxLabelCreat(transmarker, transData) {
				let html = '<div class="box-label">'+transData.wateraffairs_name+'</div>';
			
				let boxLabel = new BMapLib.InfoBox(this.baiduMap, html, {
					enableAutoPan: true,
					align: INFOBOX_AT_TOP,
					offset: new BMap.Size(10, 30) //infobox偏移量
				});
				
				transmarker.boxlabel = boxLabel;
				
				//开启信息窗口
				boxLabel.open(transmarker);
			},
			/* 
			 *处理报警
			 */
			processingAlarm(transId, t) {
				this.$fetch({
					url: '/Web/WaterAffairs/alarm_processing?action=post',
					method: "post",
					data: {
						alarm_id: transId //处理的报警消息ID
					}
				}).then(res => {
					let json = res.data,
						data = json.data;

					if(json.result == 'success'){
						t.style="display:none";
						
						this.$toast('处理成功');
					}else{
						this.global_.showToastErrmsg(jsonData.errmsg,"操作失败");
					}
				}).catch(error => {
					
				})
			},
        }
    }
</script>

<style lang="less" scoped>
	.indexMain, #map {
		position: relative;
		width: 100%;
		height: 100%;
	}
	.no-data {
		text-align: center;
		width: 100%;
		color: #757D88;
	}
	/* 
	 *头部
	 */
	.head-index {
		position: absolute;
		top: 0;
		z-index: 1;
		width: 100%;
		height:80px;
		background:linear-gradient(180deg,rgba(255,255,255,1) 0%,rgba(255,255,255,0) 100%);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.navbar-brand {
		margin-left: 48px;
	}
	.full-screen-shrink {
		width: 48px;
		height: 48px;
		background: #000;
		border-radius: 24px;
		opacity: 0.4;
		margin-right: 24px;
	}
	/* 
	 *汇总数据
	 */
	.water-total {
		transition: all 0.3s;
		position: absolute;
		top: 24px;
		z-index: 2;
		left: 0;
		right: 0;
		margin: 0 auto;
		text-align: center;
		width: 480px;
		height: 141px;
		background: #fff;
		box-shadow: 0px 4px 8px 0px rgba(37,130,247,0.2);
		border-radius: 8px;
		display: flex;
		justify-content: center;
		
		&.top-48{
			top: 48px;
		}
		
		li {
			float: left;
			width: 112px;
			height: 141px;
			margin-left: 40px;
			
			&:first-child {
				margin: 0;
			}
			
			>label {
				display: block;
				height:24px;
				font-size: 18px;
				margin-bottom: 16px;
				margin-top: 24px;
			}
			
			>span {
				font-size: 48px;
				line-height: 53px;
				text-shadow:0px 8px 42px rgba(255,255,255,1);
			}
		}
	}
	.alarm_style{
		font-size:18px;
		text-color:#ff0;
	}
</style>