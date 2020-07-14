<template>
	<div class="bw-con">
		<div class="bw-main">
			<div class="bw-tip">
				<img src="@/assets/img/login/logo_galaxywind.png">
				<span>提醒您</span>
			</div>
			<div class="bw-des">
				<span>支持 IE10+，请升级您的浏览器</span>
				<span>我们建议您使用以下浏览器的最新版本获得更好体验</span>
				<div class="bw-or row">
					<span class="col-3">
						<i class="iconfont icon-chrome"></i>
						<label>Chrome</label>
					</span>
					<span class="col-3">
						<i class="iconfont icon-firefox"></i>
						<label>Firefox</label>
					</span>
					<span class="col-3">
						<i class="iconfont icon-safari"></i>
						<label>Safari</label>
					</span>
					<span class="col-3">
						<i class="iconfont icon-opera"></i>
						<label>Opera</label>
					</span>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
	export default {
		data(){
			return{
			}
		},
		mounted(){
		},
		methods:{
			
		}
	}
</script>

<style lang="less" scoped>
	.bw-con {
		background: url("~@/assets/img/login/login_form_bg.png");
		background-size:100% 100%;
		height: 100%;
		position: relative;
		color: #fff;
	}
	.bw-main {
		background: rgba(255, 255, 255, 0.1);
		width: 500px;
		height: 300px;
		border-radius: 10px;
		box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
		margin: 0 auto;
		position: absolute;
		left: 0;
		right: 0;
		top: 50%;
		margin-top: -150px;
		text-align: center;
		
		.bw-tip {
			font-size: 1.25rem;
			margin-top: 2.9rem;
			
			img {
				width: 45%;
				height: 36px;
			}
			
			span {
				margin: 0 0 0 1rem;
				position: relative;
				top: 9px;
			}
		}
		
		.bw-des {
			font-size: 0.875rem;
			margin-top: 2rem;
			
			span {
				display: block;
			}
			
			.bw-or {
				width: 80%;
				margin: 1.4rem auto auto;
				
				span {
					float: left;
				}
			
				i {
					font-size: 2.5rem;
				}
				
				label {
					display: block;
				}
			}
		}
	}
</style>