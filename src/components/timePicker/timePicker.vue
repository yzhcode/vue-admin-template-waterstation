<template>
	<div class="time-picker">
		<div class="time-type" v-show="types.item">
			<div class="dropdown">
				<button class="dropdown-toggle" data-toggle="dropdown">
					{{ typeText }}
				</button>
				<div class="dropdown-menu">
					<div :class="['dropdown-item', typeText == item?'active':'']" v-for="(item, key, index) in types.item" :key="key" @click="activeType(key, item)">
						{{ item }}
					</div>
				</div>
			</div>
		</div>
		<template v-if="timesDate[0]">
			<div class="strike"></div>
			<div class="dropdown year">
				<button class="dropdown-toggle year-btn" @click="dropdown('year')" data-toggle="dropdown">
					{{ yearVal }}
				</button>
				<div class="dropdown-menu" v-show="yearShow">
					<div class="tpicker-header">
						<a class="tpicker-cell" @click="switchYear('prev')"><</a>
						<div class="tpicker-cell-dark">{{ yearVal }}</div>
						<a class="tpicker-cell" @click="switchYear('next')">></a>
					</div>
					<div class="tpicker-list">
						<div v-for="(item,index) in [4,3,2,1]" class="tpicker-cell" @click="activeDate('year', yearVal-item)">
							{{ yearVal-item }}
						</div>
						<div class="tpicker-cell active" @click="activeDate('year', yearVal)">
							{{ yearVal }}
						</div>
						<div v-for="(item,index) in 4" class="tpicker-cell" @click="activeDate('year', yearVal+item)">
							{{ yearVal+item }}
						</div>
					</div>
				</div>
			</div>
		</template>
		<template v-if="timesDate[1]">
			<div class="strike">-</div>
			
			<div class="dropdown month"> <!-- v-clickoutside="handleClickOutSideMonth" -->
				<button class="dropdown-toggle month-btn" @click="dropdown('month')" data-toggle="dropdown">
					{{ monthVal }}
				</button>
				<div class="dropdown-menu" v-show="monthShow">
					<div class="tpicker-list">
						<div v-for="(item,index) in 12" :class="['tpicker-cell', (monthVal == two(item) ? ' active' :'')]" @click="activeDate('month', two(item))">{{ two(item) }}</div>
					</div>
				</div>
			</div>
		</template>

		<template v-if="timesDate[2]">
			<div class="strike">-</div>
			
			<div class="dropdown">
				<button class="dropdown-toggle day-btn" @click="dropdown('day')" data-toggle="dropdown">
					{{ dayVal }}
				</button>
				<div class="dropdown-menu day-menu" v-show="dayShow">
					<div class="tpicker-header">
						<div v-for="(item,index) in 7" class="tpicker-cell-dark">{{ weekHead[index] }}</div>
					</div>
					<div class="tpicker-list">
						<div v-for="(item,index) in firstDay" class="tpicker-cell-dark"></div>
						<div v-for="(item,index) in currentDay" :class="['tpicker-cell', (dayVal == two(item) ? ' active' :'')]" @click="activeDate('day', two(item))">{{ two(item) }}</div>
					</div>
				</div>
			</div>
		</template>
	</div>
    
</template>

<script>
//import clickoutside from './clickoutside.js'; //点击空白处指令

export default{
    data(){
		return {
			date: new Date(),
			weekHead: ['日', '一',  '二',  '三',  '四',  '五',  '六'],
			yearShow: false,
			monthShow: false,
			dayShow: false,
			yearVal: '年',
			monthVal: '月',
			dayVal: '日',

			timesDate: '',
			typeText: '',
			
			firstDay: '',
			currentDay: '',
		}
    },
	directives: {
		//clickoutside
	},
    props: {
		times: { // 日期类型
			type: Array,
			default: () => {
				return [this.date.getFullYear(), this.two(this.date.getMonth()+1), this.two(this.date.getDate())]
			}
		},
		types: {
			type: Object,
			default() {
				return {
					item: '', //{year: '年', month: '月', day: '日'}
					active: ''
				}
			}
		}
    },
	created() {
		this.initTime();
	},
	mounted(){
	},
    computed: {
    },
    methods: {
		/* 
		 *初始化日期到当前日期
		 */
		initTime() {
			if(this.types.item) {
				this.typeText = this.types.item[this.types.active];
			}
			
			this.timesDate = this.times;

			this.yearVal = this.times[0]?parseInt(this.times[0]):'';
			this.monthVal = this.times[1]?this.two(this.times[1]):'';
			this.dayVal = this.times[2]?this.two(this.times[2]):'';

			//格式化天数选择数据
			this.dayInit();
		},
		/* 
		 *补0
		 */
		two(val) {
			return val.toString().replace(/^(\d)$/, '0$1');
		},
		/* 
		 *点击年选择框以外区域隐藏
		 *
		handleClickOutSideYear(e) {
			this.yearShow = false;
		},
		/* 
		 *点击月选择框以外区域隐藏
		 *
		handleClickOutSideMonth(e) {
			this.monthShow = false;
		},
		/* 
		 *点击天选择框以外区域隐藏
		 *
		handleClickOutSideDay(e) {
			this.dayShow = false;
		},
		/* 
		 *点击显示日期选择框
		 */
		dropdown(type) {
			switch(type) {
				case 'year':
					this.yearShow = true;
				break;
				case 'month':
					this.monthShow = true;
				break;
				case 'day':
					this.dayShow = true;
				break;
			}
		},
		/* 
		 *点击显示日期选择框
		 */
		activeDate(type, val) {
			switch(type) {
				case 'year':
					this.yearVal = val;
					break;
				case 'month':
					this.monthVal = val;
					break;
				case 'day':
					this.dayVal = val;
					break;	
			}

			let dt = [];
			
			switch(this.types.active) {
				case 'year':
					dt = [this.yearVal];
				break;
				case 'month':
					
					dt = [this.yearVal, this.monthVal];
				break;
				case 'day':
					this.dayVal = this.dayVal || '01';
					
					this.dayInit();
					
					dt = [this.yearVal, this.monthVal, this.dayVal];
				break;
			}
			
			this.timesDate = dt;

			this.$emit('update:times', dt);
		},
		/* 
		 *切换年
		 */
		switchYear(type) {
			let years = this.yearVal - (type == 'prev'?9:-9);
			
			if(years < 1970){
				return false;
			}

			this.yearVal = years;
		},
		getDateLength : function(year,month){
            //获取某一月有多少天, month为实际月份，一月即为1
            return new Date(year,month,0).getDate();
        },
        getFirstDay : function(year,month){
            //获取某一月第一天是周几,month为实际月份，一月即为1,返回0即为周日
            return new Date(year,month-1,0).getDay();
        },
		/* 
		 *天数据
		 */
		dayInit() {
			if (!this.dayVal) {
				return false;
			}
			let year = this.yearVal,
				month = parseInt(this.monthVal);
			
			this.firstDay = this.getFirstDay(year, month)+1;
			this.currentDay = this.getDateLength(year,month);

			if(parseInt(this.dayVal) > this.currentDay) {
				this.activeDate('day', '01');
			}
		},
		/* 
		 *点击日期类型选择框
		 */
		activeType(type, val) {
			this.typeText = val;
			this.types.active = type;
			this.monthVal = this.monthVal || this.two(this.date.getMonth()+1);

			let dt = [];
			
			switch(type) {
				case 'year':
					dt = [this.yearVal];
				break;
				case 'month':
					
					dt = [this.yearVal, this.monthVal];
				break;
				case 'day':
					this.dayVal = this.dayVal || '01';
					
					this.dayInit();
					
					dt = [this.yearVal, this.monthVal, this.dayVal];
				break;
			}
			
			this.timesDate = dt;

			this.$emit('update:times', dt);
			this.$emit('update:types', this.types);
		},
    },
	watch: {
		
	}
  }
</script>

<style lang="less" scoped>
	.time-picker {
		//.dropdown-menu {
		//	display: block;
		//}
		.dropdown, .strike {
			float: left;
		}
		
		.dropdown-toggle {
			width: 56px;
			height: 48px;
			background: #FFF;
			border-radius:4px;
			color: #757D88;
			border: 0;
			text-align: left;
			padding: 0 0 0 10px;
			outline: 0;
			
			&:after {
				border-top-width: 7px;
				border-right-width: 4px;
				border-left-width: 4px;
				position: absolute;
				right: 16px;
				top: 50%;
				margin-top: -2px;
				color: #C2C9D7;
			}
		}
		.year-btn {
			width:70px;

		}
		
		.strike {
			width: 7px;
			text-align: center;
			height: 48px;
			color: #757D88;
			line-height: 48px;
			margin: 0 4px;
		}

		.tpicker-header {
			text-align: center;
			padding-bottom: 5px;
			position: relative;
			border-bottom: 1px solid #F3F5F9;
			
			&:after {
				display: block;
				clear: both;
				content: "";
			}

			.year-value {
				cursor: default;
			}
			
			.year-value {
				&:hover {
					background-color: transparent;
				}
			}
		}
		
		.dropdown-menu {
			min-width: 140px;
			padding: 10px;
			border: 0;
			box-shadow:0px 2px 4px 0px rgba(37,130,247,0.2);
			border-radius:8px;
		}
		
		.day-menu {
			min-width: 300px;
		}
		
		.tpicker-cell {
			cursor: pointer;
			float: left;
			width: 40px;
			height: 32px;
			line-height: 32px;
			text-align: center;
			color: #757D88;
			
			&:hover {
				background: #2582F7;
				color: #fff;
			}
		}
		.tpicker-cell-dark {
			float: left;
			width: 40px;
			height: 32px;
			line-height: 32px;
		}
		
		.active {
			background-color: #2582F7;
			color: #fff !important;
		}
	}
	
	.time-type {
		.dropdown-menu {
			min-width: 96px;
		}
		
		.dropdown-item {
			cursor: pointer;
		}
	}
</style>