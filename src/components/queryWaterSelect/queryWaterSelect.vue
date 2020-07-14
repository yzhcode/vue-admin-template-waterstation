<template>
	<div class="query-water-select" v-show="type !='single' ">
		<el-select v-model="value" placeholder="请选择" @change="selectedWater" style="margin-top: 4px; max-width: 200px">
		    <el-option
		      v-for="item in waterData"
		      :key="item.id"
		      :label="item.wateraffairs_name"
		      :value="item.id">
		    </el-option>
	  	</el-select>
	</div>
</template>

<script>
export default{
    data(){
		return {
			value:'',
			waterLineData: [],
			waterData: []
		}
    },
    props: {
		type: {
			type: String,
			default: 'all'
		},
		waterid: {
			type: String,
			default: 'all'
		},
		waterlineid: {
			type: String,
			default: ''
		}
    },
	computed: {
	},
	//监听执行
	watch: {
		'$store.state.siteConfig.waterData'(dataNew) {
			let all = this.type == 'all'?[{id: 'all', wateraffairs_name: '全部水站'}]:[],
				data = [
					...all,
					...dataNew
				];
			this.waterData = data;
			this.value = this.waterData[0].id;
			if(this.type == 'one' && data.length) {
				this.$emit('update:waterid', data[0].id);

				this.global_.getWaterAffairsLine(data[0].id);
			}
		},
		'$store.state.siteConfig.waterAffairsLine'(data) {
			this.waterLineData = data;
			if(data.length) {
				this.optionLineText = '水线'+data[0].line_num;
				this.$emit('update:waterlineid', data[0].line_num);
			}
		},
	},
	created(){
		//单站不加载水站列表
		if(this.type == 'single') {
			this.global_.getWaterAffairsLine(this.waterid);
		}else{
			this.global_.waterListload();
		}
	},
    methods: {
		/*
		 *选择水站
		 */
		selectedWater(waterId) {
			this.$emit('update:waterid', waterId);
		},
    }
  }
</script>

<style lang="less" scoped>
	.query-water-select {
		float: left;
	}
</style>