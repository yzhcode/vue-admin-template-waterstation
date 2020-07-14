<template>
    <div class="videoMonitoringMain">

        <div class="query-block" v-show="showVideos==true">
            <span class="station-btn-capture" @click="history()">抓拍记录</span>
        </div>

        <div class="query-block">
            <ul class="video-table">
                <li v-for="(items, index) in videoList">
                    <video :id="'myVideo_'+index" class="video-js video-item" v-show="showVideos==true">
                        <source :src="'rtmp://61.157.91.160:1935/live/'+items.video_path" type='rtmp/flv'/>
                    </video>
                    <div class="video-name" v-show="showVideos==true">{{videoNameArray}}</div>
                    <div class="station-no-video-title" v-show="showVideos==false">暂无视频，请添加摄像头</div>
                </li>
            </ul>
        </div>

        <el-dialog title="抓拍记录" :visible.sync="videoDialogVisible" width="800px" top="50px">
           <table class="table-fixed">
                <thead>
                    <tr>
                        <th width="10%"></th>
                        <th width="50%">图片</th>
                        <th width="40%">描述</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="catchLogList.length > 0" v-for="(item, index) in catchLogList">
                        <td>{{index+1}}</td>
                        <td> <img :src="item.catch_img" alt="..."></td>
                        <td>{{item.catch_time}}<span class="water-c-2">{{item.catch_desc}}</span></td>
                    </tr>
                </tbody>
            </table>
        </el-dialog>


    </div>
</template>
<script>
    export default {
        data(){
            return{
                myPlayerArray      : [],//视频对象
                videoNameArray     : [],//视频名称
                videoList          : [{"video_path":"123"}],
                showVideos         : true,//是否显示视频
                videoDialogVisible : false,
                catchLogList       : [{catch_time:"04-12 01:12:22",catch_desc:"【有人闯入】",catch_img:require("@/assets/img/catchimg/catch_img_1.png")},
                                      {catch_time:"04-17 12:12:05",catch_desc:"【检测到有人】",catch_img:require("@/assets/img/catchimg/catch_img_2.png")},
                                      {catch_time:"05-08 01:32:42",catch_desc:"【检测到异常情况】",catch_reson:"",catch_img:require("@/assets/img/catchimg/catch_img_3.png")},
                                      {catch_time:"05-15 11:12:21",catch_desc:"【监测到有人移动】",catch_img:require("@/assets/img/catchimg/catch_img_4.png")}],
            }
        },
        components:{
        },
        watch:{
        },
        beforeDestroy(){
            if (this.showVideos) {
                for (var i = 0; i < this.myPlayerArray.length; i++) {
                    var player = this.myPlayerArray[i];
                    player.dispose();
                }
            }
        },//
        mounted(){
            if (this.showVideos) {
                this.$nextTick(()=>{
                    this.videoNameArray = this.getVideWorkPartName();
                    // 初始化视频方法
                    this.initVideo();
                });
            }
        },
        methods:{
            //初始化视频方法
            initVideo() {
                for (var i = 0; i < this.videoList.length; i++) {
                    let _videoID = "myVideo_"+i;
                    let myPlayer = this.$video(_videoID, {
                        language: "zh-CN",
                        bigPlayButton:false,
                        controls: true,
                        muted   : true,
                        autoplay: true,
                        width   : "400px",
                        height  : "300px",
                        controlBar:{
                            'playToggle' : false,
                            'volumePanel' : false,
                            'currentTimeDisplay' : false,
                            'timeDivider' : false,
                            'durationDisplay' : false,
                            'progressControl' : false,
                            'liveDisplay' : false,
                            'seekToLive' : false,
                            'remainingTimeDisplay' : false,
                            'customControlSpacer' : false,
                            'playbackRateMenuButton' : false,
                            'chaptersButton' : false,
                            'descriptionsButton' : false,
                            'subsCapsButton' : false,
                            'audioTrackButton' : false,
                            'pictureInPictureToggle':false,
                            'fullscreenToggle' : true,
                        }
                    });
                    this.myPlayerArray.push(myPlayer);
                }
            },
            getVideWorkPartName(){
                let workPartName = ["水站门口", "沉淀池", "过滤池", "清水池", "仓库", "操作间", "出水口"];
                var partCount = workPartName.length;
                var firstIndex = Math.floor(Math.random() * partCount);//获取 0 到 partCount - 1 的随机整数。
                return workPartName[firstIndex];
            },
            history(){
                this.videoDialogVisible = !this.videoDialogVisible;
            },
        }
    }
</script>

<style lang="less" scope>
.station-no-video-title{
    line-height: 300px;
    font-size: 18px;
    color: #757D88;
    text-align: center;
    box-shadow: 0px 2px 4px 0px rgba(37,130,247,0.2);
    border-radius: 0.571428rem;
}

.station-btn-capture{
    color: #2582F7;
    cursor: pointer;
    line-height: 48px;
    font-size: 18px;
}
.video-table {
    li {
        float: left;
        width: 416px;
        margin-bottom: 16px;
        height: 350px;
    }
}
.video-name{
    text-align: center;
}
.video-item{
    width: 400px;
    height: 300px;
    background: black;
}
</style>