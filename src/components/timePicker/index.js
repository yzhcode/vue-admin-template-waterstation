import timePicker from './timePicker.vue'
// 这里是重点
const TimePicker = {
    install(Vue) {
        Vue.component('TimePicker',timePicker)
    }
}

// 导出组件
export default TimePicker