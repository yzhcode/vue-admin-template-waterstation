<template>
    <div class="CardSimple" >
        <div class="simple_water_card_item">
                <div class="water-n-1"> 
                    <label>{{title}}</label>
                    <p :title="content=='--'? tips :content">{{content}}</p>
                </div>
            </div>
    </div>
</template>
<script>
export default {
    name: "CardSimple",
    data(){
        return{
        }
    },
    props: {
        title: { // 日期类型
            type: String,
            default: () => {
                return ""
            }
        },
        content:{
            type:String,
            default:() => {
                return '--'
            }
        },
        tips:{
            type:String,
            default:() => {
                return '暂无数据，请添加传感器'
            }
        },
    },
}
</script>

<style scoped>
.simple_water_card_item{
    min-width: 250px;
    min-height: 3.0rem;
    position: center;
    margin: 12px;
    display: flex;
    flex-direction: row;
    padding: 1.071429rem;
    box-shadow: 0px 4px 12px 0px rgba(37,130,247,0.4);
    border-radius: 8px;  
    overflow: hidden;
}
.simple_water_card_item div {
    margin: 0 auto;
    align-items: center;
}
.simple_water_card_item div label{
    text-align: center;
    font-size: 1.428571rem;
}
.simple_water_card_item div p{
    text-align: center;
    font-size: 3.428571rem;
    font-weight: bolder;
}
</style>