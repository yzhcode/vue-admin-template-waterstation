<template>
	<div>
		<div :class="[{ footer: pageStyle },'copyright-box clearfix']">
			<p>
				<span>深圳市银河风云网络系统股份有限公司</span>&nbsp;&nbsp;
				<span class="links" @click="showAuthorityWebsite();">官方网站</span>&nbsp;|
				<span class="links" data-toggle="modal" data-target="#galaxywindWeixin">官方微信</span>
			</p>
			<p>Copyright {{ copyrightTime }} Galaxywind. All Rights Reserved 京ICP备15036193号-1</p>
		</div>

		<!-- Modal -->
		<div class="modal fade" id="galaxywindWeixin" tabindex="-1" role="dialog">
			<div class="modal-dialog modal-sm modal-dialog-centered" role="document">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title">官方微信</h5>
						<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
					</div>
					<div class="modal-body">
						<img src='@/assets/img/login/galaxywindWeixinIco.jpg'/><p class='tc'>扫一扫上面的二维码，加官方微信</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
	export default {
		data(){
			return{
				copyrightTime: new Date().getFullYear()
			}
		},
		props: {
			page: {// 数据总条数
				type: String,
				default: 'login'
			}
		},
		computed: {
			pageStyle() {
				return this.page == 'login'? false :true;
			}
		},
		mounted:function(){
		},
		methods:{
			showAuthorityWebsite(){
				window.open("http://www.galaxywind.com","_blank");
			}
		},
		watch:{
		}
	}
</script>

<style scoped>
	.footer{
		position: relative;
	}
	.modal-body {
		padding: 10px;
	}
	.modal-dialog {
		color: #666;
	}
	.modal-header {
		height: 40px;
		padding-top: 3px;
		border-color: #ccc;
		padding: 3px 15px;
	}
	.modal-header h5 {
		font-size: 22px;
	}
	.modal-dialog img {
		width: 100%;
		display: block;
	}
	.modal-content {
		background-color: #fff;
	}
	.close {
		margin: 0;
		outline: 0;
		line-height: 33px;
		padding: 0;
		font-size: 20px;
	}
</style>