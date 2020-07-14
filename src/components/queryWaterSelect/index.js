import queryWaterSelect from './queryWaterSelect.vue'
// 这里是重点
const QueryWaterSelect = {
    install(Vue) {
        Vue.component('QueryWaterSelect',queryWaterSelect)
    }
}

// 导出组件
export default QueryWaterSelect