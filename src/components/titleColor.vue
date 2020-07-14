<template>
    <div class="titleColor" >
        <div>
            <div class="colorline" v-bind:style="styleObject"></div>
            <div class="spantitle" >{{title}}</div>
        </div>
    </div>
</template>
<script>
    export default {
        name: "titleColor",
        data(){
            return{
                styleObject: {
                    background: this.color,
                }
            }
        },
        props: {
            color: {
                type: String
            },
            title: {
                type: String
            },
        },
    }
</script>

<style scoped>
    .titleColor{
        height: 24px;
        overflow: hidden;
    }
    .colorline {
        float: left;
        background-color: '#2582F7';
        margin-top: 10px;
        margin-bottom: 10px;
        width: 16px;
        height: 4px;
    }
    .spantitle {
        font-size: 14px;
        color: #757D88;
        margin-left: 24px;
        height: 100%;
        min-width: 50px;
        max-width: 140px;
    }
</style>