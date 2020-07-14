<template>
    <div>
		<div class="query-block clearfix">
			<QueryWaterSelect :type="'single'" :waterid.sync="waterId" :waterlineid.sync="waterLineId"/>
			<label class="query-time-title fl">查询日期</label>
			<TimePicker :times.sync="waterTime"/>
			<button class="query-btn ml-3" @click="queryWaterStatistics">查询</button>
		</div>
		<div class="margin-t-24 title color2">统计报表</div>
		<ul class="query-line margin-t-24 clearfix">
			<li v-for="item in statisticsData">
				<div class="line-block">
					<div class="line-inner clearfix">
						<div class="line-title fl">
							{{ item.work_part_name+item.describe }}<span>{{ global_.unitShow(item.unit) }}</span>
						</div>
						<div class="line-leng fr">
							<span class="line-leng-al al-1">峰值</span><span class="line-leng-op op-1">谷值</span>
						</div>
					</div>
					<div class="line-item">
						<echart :options="global_.initLine(item.trend_data.time, item.trend_data.max, item.trend_data.min, 'statistics')" :auto-resize="true" autoresize/>
					</div>
				</div>
			</li>
		</ul>
		<div class="margin-t-24 title color2">开关记录</div>
		<ul class="query-line clearfix">
			<li v-for="item in statisticsHisData">
				<div class="line-block">
					<div class="table-inner clearfix">
						<div class="line-title fl">
							{{ item.work_part_name+item.describe }}<span>{{ global_.unitShow(item.unit) }}</span>
						</div>
					</div>
					<div class="line-item table-item">
						<table class="table-block table-fixed table-radius">
							<thead>
								<tr>
									<th width="40%">水站名</th>
									<th width="15%">状态</th>
									<th width="45%">时间</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="itemHis in item.history_list">
									<td>{{ itemHis.wateraffairs_name }}</td>
									<td>{{ itemHis.desc }}</td>
									<td>{{ itemHis.push_time }}</td>
								</tr>
								<tr class="text-center" v-if="!item.history_list.length">
									<td colspan="3">暂无数据</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</li>
		</ul>
	</div>
</template>
<script>
    export default {
        data(){
            return{
				statisticsData: [],
				statisticsHisData: [],
				waterId: this.$route.query.sid,
				waterLineId: '',
				waterTime: ['2020', '05'],//this.global_.dataChartTime().t.split('-').slice(0,-1),
            }
        },
		watch: {
			'$store.state.siteConfig.waterAffairsLine'(data) {
				if(data.length){
					this.waterLineId = data[0].line_num;
				}

				this.queryWaterStatistics();
			},
			statisticsHisData() {
				this.$nextTick(function(){
					/*现在数据已经渲染完毕*/
					$('.table-item').perfectScrollbar();
				})
			}
		},
		created() {
        },
        methods:{
			queryWaterStatistics() {
				if(!this.waterLineId){
					this.$toast("无水线信息");
					return;
				}

				this.$loading.show("请稍等");
				
				this.$fetch({
					url: '/Web/Report/rundata_bymonth?action=get',
					method: "get",
					data: {
						wateraffairs_id: this.waterId, //查询站点ID，查询全部水站时，填all
						select_month: this.waterTime.join('-'), //开始日期，2020-04-15
						line_num: this.waterLineId, //查询处理线，当wateraffairs_id!=all时生效，查询水站全部处理线是值为all
					}
				}).then(res => {
					let json = res.data,
						data = json.data;

					if(json.result == 'success'){
						this.statisticsData = data.show_data;
						this.statisticsHisData = data.config_data;
					}else{
						this.$toast(json.errmsg);
					}
				}).finally(() => {
					this.$loading.hide();
				});
			}
        }
    }
</script>

<style lang="less" scope>
	
</style>