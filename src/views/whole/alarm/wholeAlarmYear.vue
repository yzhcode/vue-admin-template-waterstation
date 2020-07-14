<template>
    <div>
		<div class="query-block clearfix">
			<QueryWaterSelect :type="'one'" :waterid.sync="waterId" :waterlineid.sync="waterLineId"/>
			<label class="query-time-title fl">查询日期</label>
			<TimePicker :times.sync="waterTime"/>
			<button class="query-btn ml-3" @click="queryWaterAlarm">查询</button>
		</div>
		<ul class="query-total clearfix">
			<li class="water-c-3">
				<label>报警数</label>
				<span>{{ alarm_count }}</span>
			</li>
			<li class="water-n-1">
				<label>已处理</label>
				<span>{{ alarm_treated_count }}</span>
			</li>
		</ul>
		<div class="query-pie-block" v-show="location_alarm.length">
			<ul class="query-pie clearfix">
				<li v-for="item in location_alarm" @click="alarmInfo(item.items_id, item.work_part_name+item.describe)">
					<div class="pie-item">
						<div class="pie-total">
							<span class="water-c-3">{{ item.alarm_count }}</span><span class="total-p-h">/</span><span class="water-n-1">{{ item.alarm_treated_count }}</span>
						</div>
						<echart :options="global_.initPie(item.alarm_treated_count, item.alarm_count)" :auto-resize="true" autoresize/>
					</div>
					<div class="pie-title">{{ item.work_part_name+item.describe }}</div>
				</li>
			</ul>
		</div>
		<ul class="query-line clearfix">
			<li v-for="item in alarm_trend">
				<div class="line-block">
					<div class="line-inner clearfix">
						<div class="line-title fl">
							{{ item.work_part_name+item.describe }}报警数<span>（次）</span>
						</div>
						<div class="line-leng fr">
							<span class="line-leng-al">报警</span><span class="line-leng-op">已处理</span>
						</div>
					</div>
					<div class="line-item">
						<echart :options="global_.initLine(item.trend_data.time, item.trend_data.alarm_count, item.trend_data.alarm_treated_count, 'year')" :auto-resize="true" autoresize/>
					</div>
				</div>
			</li>
		</ul>

		<!-- 水站报警信息 -->
        <div id="waterAlarmModal" class="modal fade" tabindex="-1" role="dialog">
            <div class="modal-dialog modal-dialog-centered modal-lg-992" role="document">
                <div class="modal-content border-0 modal-c-bor">
                    <div class="modal-header head-title-bg">
                        <h5 class="modal-title">{{ waterHeadTitle }}报警</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body padding-a-24 alarm-tbody">
                        <table class="table-block table-fixed table-radius">
							<thead>
								<tr>
									<th width="15%">时间</th>
									<th width="30%">概述</th>
									<th width="20%">水站</th>
									<th width="10%">水线</th>
									<th width="10%">状态</th>
									<th width="15%">处理员</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="item in waterAlarmData">
									<td>{{ item.alarm_time.slice(5) }}</td>
									<td>{{ item.alarm_reason }}</td>
									<td>{{ item.wateraffairs_name }}</td>
									<td>{{ item.line_num }}</td>
									<td>{{ item.process_time?'已处理':'未处理' }}</td>
									<td>{{ item.processor?item.processor:'-' }}</td>
								</tr>
								<tr v-if="!waterAlarmData.length">
									<td class="t-center" colspan="7">暂无报警</td>
								</tr>
							</tbody>
						</table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    export default {
        data(){
            return{
				alarm_count			: 0,
				alarm_treated_count	: 0,
				location_alarm		: [],
				alarm_trend			: [],
				waterId				: '',
				waterLineId			: '',
				waterTime			: ['2020'],//[this.global_.dataChartTime().t.split('-')[0]],
				waterOldTime		: '',
				waterHeadTitle		: '',
				waterAlarmData		: []
            }
        },
		watch: {
			'$store.state.siteConfig.waterData'(data) {
				if(data.length){
					this.waterId = data[0].id;
				}else{
					this.queryWaterAlarm(); //没有水站加载提示
				}
			},
			'$store.state.siteConfig.waterAffairsLine'(data) {
				if(data.length){
					this.waterLineId = data[0].line_num;
				}

				this.queryWaterAlarm();
			},
			location_alarm () {
				this.$nextTick(() => {
					$('.query-pie-block').perfectScrollbar();
				});
			}
		},
		created() {
        },
		mounted() {
        },
        methods:{
			queryWaterAlarm() {
                try{
					if(!this.waterId){
                        this.$toast("无水站信息");
                        return;
                    }
					
                    if(!this.waterLineId){
                        this.$toast("无水线信息");
                        return;
                    }

                    this.$loading.show("请稍等");

					this.$fetch({
						url: '/Web/Report/alarmdata_byyear?action=get',
						method: "get",
						data: {
							wateraffairs_id: this.waterId, //查询站点ID，查询全部水站时，填all
							select_year: this.waterTime.join('-'), //开始日期，2020-04
							line_num: this.waterLineId, //查询处理线，当wateraffairs_id!=all时生效，查询水站全部处理线是值为all
						}
					}).then(res => {
						let json = res.data,
							data = json.data;

						if(json.result == 'success'){
							this.alarm_count = data.alarm_count;
							this.alarm_treated_count = data.alarm_treated_count;
							this.location_alarm = data.location_alarm;
							this.alarm_trend = data.alarm_trend;
							this.waterOldTime = this.waterTime;
						}else{
							this.$toast(json.errmsg);
						}
					}).finally(() => {
                        this.$loading.hide();
                    });
                }catch(e){
                    console.log("getWaterAffairsList: "+e);
                };
			},
			alarmInfo(id, name) {
                try{
                    this.$loading.show("请稍等");

					this.waterHeadTitle = name;
					$('#waterAlarmModal').modal('show');

					this.$fetch({
						url: '/Web/WaterAffairs/alarm_select?action=get',
						method: "get",
						data: {
							wateraffairs_id: this.waterId, //查询站点ID，查询全部水站时，填all
							start_date: this.waterOldTime.join('-')+'-01'+'-01', //开始日期，2020-04-15
							end_date: this.waterOldTime.join('-')+'-12'+'-31', //结束日期，2020-04-15
							items_id: id //查询报警所属的检测参数ID，可选参数，不传表示查询全部
						}
					}).then(res => {
						let json = res.data,
							data = json.data;

						if(json.result == 'success'){
							this.waterAlarmData = data;

							$('.alarm-tbody').perfectScrollbar();
						}else{
							this.$toast(json.errmsg);
						}
					}).finally(() => {
                        this.$loading.hide();
                    });
                }catch(e){
                    console.log("getWaterAffairsList: "+e);
                };
			},
        }
    }
</script>

<style lang="less" scope>

</style>