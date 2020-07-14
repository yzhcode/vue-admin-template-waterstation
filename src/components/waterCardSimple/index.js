import SimpleWaterCard from './simpleWaterCard.vue'
// 这里是重点
const CardSimple = {
    install(Vue) {
        Vue.component('CardSimple',SimpleWaterCard)
    }
}

// 导出组件
export default CardSimple