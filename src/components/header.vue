<template>
    <header :class="['head-all', fScreen?'head-2':'head-1']" v-show="headerShowFlag">
        <nav class="navbar navbar-default navbar-fixed-top navbar-expand">
            <img src="@/assets/img/header/logo.png">
            <QueryWaterSelect class="header_water_select title-large" v-show="userRole==3 && waterStationNum > 1" :type="'one'" :waterid.sync="waterId"></QueryWaterSelect>
            <li class="title-small navbar-title nav-item dropdown">
                <span class="title-weight font-s-20">{{siteName}}</span>
            </li>
            <div id="collapseUser" class="collapse navbar-collapse in">
                <li class="title-large nav-item dropdown">
                    <span class="title-weight font-s-20">{{siteName}}</span>
                </li>
                <ul class="nav navbar-nav" v-if="userName && !fScreen">
                    <li class="title-large nav-item dropdown title-large">
                       <i class="iconfont icon-user mr-2"></i>{{ userName }}
                    </li>
                    <li class="nav-item dropdown curPoint" @click="fullScreen()" v-show="toName">
                        <i class="iconfont icon-full-screen">{{" "}}全屏</i>
                    </li>
                    <li class="nav-item dropdown curPoint"  v-show="siteName!='智慧水务管理平台' && userRole == '2'">
                        <router-link :to="{name: 'index'}">
                            <img class="mb-1" src="@/assets/img/header/home.png"/>
                            <span class="text-color">返回总站</span>
                        </router-link>
                    </li>
                    <li class="nav-item dropdown curPoint" @click="loginOut()">
                        <i class="iconfont icon-exit">退出</i>
                    </li>
                </ul>
                <ul class="nav navbar-nav ml-15" v-if="userName && fScreen">
                    <li class="nav-item dropdown full-screen-shrink curPoint" @click="shrink()" :class="[fScreen?'f-s-ty':'']" v-show="toName">
                        <i class="iconfont icon-shrink"></i>
                        <div class="title-small text-color ml-1 font-s-18">退出全屏</div>
                    </li>
                </ul>
            </div>
            <div class="title-small">
                <div class="navbar-toggle curPoint font-s-18" data-toggle="collapse" data-target="#collapseUser">
                    <i class="font-s-18 iconfont icon-user"></i>{{ userName }}
                </div>
            </div>
        </nav>
    </header>
</template>
<script>
    export default {
        // inject : ['reload'],
        data(){
            return{
                headerShowFlag       : false,
                waterId              : "",
            }
        },
        props: {
        },
        watch:{
            $route(to,from){
                if(to.name=="login"){
                    this.headerShowFlag = false;
                }else{
                    this.headerShowFlag = true;
                }
            },
            waterId(newVal,oldVal){
                this.handleSelect();
            }
        },
        computed: {
            userRole(){
                return this.$store.getters["siteConfig/renderUserRole"];//账号角色
            },
            /**
             * [站点名称]
             * @return {[type]} [description]
             */
            siteName(){
                return this.$store.getters['siteConfig/renderSiteName'];
            },
            /**
             * [登陆用户名]
             * @return {[type]} [description]
             */
            userName(){
                return this.$store.getters['siteConfig/renderUserName'];
            },
            // 是否全屏
            fScreen() {
                return this.$store.getters['siteConfig/renderFullScreen'];
            },
            // 当前路由地址
            toName: function() {
                let tn = this.$store.getters['siteConfig/renderToName'],
                    flag = (tn == 'wholeMap' || tn == 'index')?true:false;

                if(!flag){
                    this.shrink();
                }

                return flag;
            },
            //当前水站数量
            waterStationNum(){
                let waterStation = this.$store.getters['siteConfig/renderWaterData'];
                return waterStation.length;
            }
        },
        mounted(){
        },
        methods:{
            loginOut() {
                try{
                    this.$fetch({
                        url     : "/Web/WaterAffairs/login_out?action=delete",
                        method  : "get"
                    }).then( result => {
                        let json = result.data;
                        if(json.result=="success"){
                            this.global_.removeLoginInfo();
                            this.$router.replace({name:"login"});
                        }
                    }).finally(() => {
                        this.$loading.hide();
                    });
                }catch(e){
                    this.global_.showToastErrmsg("退出登陆 请求失败");
                    console.log("getAreaList: "+e);
                };
            },
            fullScreen() {
                this.$store.dispatch('siteConfig/invokeFullScreen', true);
            },
            shrink() {
                this.$store.dispatch('siteConfig/invokeFullScreen', false);
            },
            handleSelect() {
                if (this.userRole==3 && this.waterStationNum > 1 && this.waterId > 0) {
                    let tn = this.$store.getters['siteConfig/renderToName'];
                    this.$router.replace({name:tn,query:{'sid': this.waterId}});
                    // this.reload();
                }
            },
        },
    }
</script>

<style scoped lang="less">
    .head-1 {
        background: #fff;
        box-shadow:0px 2px 4px 0px rgba(37,130,247,0.2);
    }
    .head-2 {
        background: linear-gradient(180deg,rgba(255,255,255,1) 0%,rgba(255,255,255,0) 100%);
    }
    .head-all{
        width: 100%;
        position: fixed;
        z-index: 3;
        transition: all 0.2s;
    }
    .loginOut{
        cursor: pointer;
    }
    .navbar{
        height: 5.714286rem;
        padding: 1.428571rem;
    }
    .navbar-logo{
        width: 220px;
        line-height: 0;
        color: #21252B;
        font-size: 1.428571rem;
        font-weight: bolder;
        img{
            width: 100%;
        }
    }
    .title-weight{
        font-weight: bolder;
    }
    .text-color{
        color: #21252B;
    }

    .full-screen-shrink {
        transition: all 0.3s;
        transform: translateY(-100px);
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;

        i {
            font-size: 1.3rem;
        }
    }

    .f-s-ty {
        transform: translateY(0);
    }

    .navbar-nav{
        >li{
            position: relative;
            line-height: 54px;
            font-size: 16px;
            padding: 0 15px;
            margin-left: 2px;

			i {
				font-size: 1.2rem;
			}
        }
    }

    .mb-10{
        margin-bottom: 7px;
    }
    .header_water_select{
        margin-left:65px;
    }

    .navbar-toggle {
      text-align: center;
      background-color: #fff;
    }
    .navbar-toggle span {
      display: block;
      width: 20px;
      margin: 6px 0;
      border-bottom: 2px solid #6c757d;
    }

    .navbar-collapse{
        height: auto;
        right: 0;
        position:fixed;
    }

    .navbar-title {
        margin:0 auto;
    }

    @media screen and (min-width:768px) {
        .title-small {
            display: none;
        }
        .title-large {
            display: block ;
        }
        .full-screen-shrink {
            right: 14px;
            width: 48px;
            height: 48px;
            background: rgba(0,0,0,0.4);
            border-radius: 24px;
            i {
                color: #fff;
            }
        }
    }

    @media screen and (max-width: 767px) {
        .title-small {
            display: block;
        }
        .title-large {
            display: none;
        }
        .navbar-collapse {
            top: 5.714286rem;
            width: 12.714286rem;
            background-color:#EEEEEE;
        }
        .navbar-collapse li {
            width: 100%;
            text-align: left;
        }
        .collapse:not(.show) {
            display: none !important;
        }
        .full-screen-shrink {
            i {
                color: #6c757d;
            }
        }
    }

</style>