
// input实时监测  小插件
(function ($) {
    $.fn.watch = function (callback) {
        return this.each(function () {
            //缓存以前的值  
            $.data(this, 'originVal', $(this).val());

            //event  
            $(this).on('keyup paste', function () {
                var originVal = $.data(this, 'originVal');
                var currentVal = $(this).val();

                if (originVal !== currentVal) {
                    $.data(this, 'originVal', $(this).val());
                    callback(currentVal);
                }
            });
        });
    }
})(jQuery);
// 判断audio是否加载完成
function loadAudio(src,callback){
	var audio = new Audio(src);
	audio.onloadedmetadata = callback;
}

$(function(){
	// 搜索功能
	$(".search input").watch(function(){
		$.ajax({
			url: './php/music.php',
			type: 'get',
			dataType: 'json',
			// async:false, 
			data: {
				name: $(".search input").val()
			},
			success:function(info){
				$(".search ul").html(" ")
				if(!info.showapi_res_error){
					var maxMUsic = info.showapi_res_body.pagebean.contentlist.length<8?info.showapi_res_body.pagebean.contentlist.length:8
				
					for(var i=0;i<maxMUsic;i++){
						var $li = $("<li></li>").html(info.showapi_res_body.pagebean.contentlist[i].songname+"/"+
							info.showapi_res_body.pagebean.contentlist[i].singername)
						$li.attr("songname",info.showapi_res_body.pagebean.contentlist[i].songname);
						$li.attr("singername",info.showapi_res_body.pagebean.contentlist[i].singername);
						$li.attr("n",i);
						$li.attr("albumpic_big",info.showapi_res_body.pagebean.contentlist[i].albumpic_big);
						$li.attr("albumpic_small",info.showapi_res_body.pagebean.contentlist[i].albumpic_small);
						$li.attr("albumname",info.showapi_res_body.pagebean.contentlist[i].albumname?info.showapi_res_body.pagebean.contentlist[i].albumname:"暂无");
						$li.attr("m4a",info.showapi_res_body.pagebean.contentlist[i].m4a);
						$(".search ul").append($li);
						$li.attr("songid",info.showapi_res_body.pagebean.contentlist[i].songid);
						$(".search ul").append($li);

						searchListN = -1;

					}
									
				}
			}
		})
		
	})

	// 调用播放音乐
	playMusic();	
	// 获取音乐audio

	// 判断搜索框状态
	var wathchFocus = false;
	var searchListN = -1;

	$(".search input").focus(function(){
		wathchFocus = true;
		searchListN = -1;
	})
	$(".search input").blur(function(event) {
		wathchFocus = false;
	});
	// 搜索内容键盘指定功能
	$(document).keydown(function(event){
			
			// 38 up
			if(event.keyCode == 38&&wathchFocus){
				searchListN--;
				if(searchListN <= -1 ){
					searchListN =$(".search ul li").length -1;
				}
				// console.log("up:"+searchListN)
				event.preventDefault();
				
			}
			// 40 down
			if(event.keyCode == 40&&wathchFocus){



				searchListN++;
				if(searchListN ==$(".search ul li").length ){
					searchListN =0;
				}
				// console.log("down:"+searchListN)
				event.preventDefault();				
			}


			$(".search li.active").removeClass('active');
			$(".search ul li").eq(searchListN).addClass("active");
		
	})
	// 搜索内容鼠标指定功能
	$(".search ul").on('mouseover', 'li', function(event) {
		
		searchListN = $(this).index();
		$(".search li.active").removeClass('active');
		$(".search ul li").eq(searchListN).addClass("active");
		

		
	});
	Init();
	function Init(){//初始化设置
		// $("audio")[0].volume = 1;
	}
	// ajax后初始化，指定播放功能
	function ajaxInit(dom,n){
		$("audio").attr("src",dom.attr('m4a'));
		loadingMore(dom);//指定音乐后播放音乐，加载歌词，加载歌曲名歌手歌专辑名图片等
		addMusicList(dom);//添加到tbody 歌曲list里面
		removeSearch();//清楚搜索结果，留下搜索记录
		playerInfo(dom);//更新下方播放器信息
		$(".play").removeClass('icon-bofangqikaishi play').addClass("icon-bofangqitingzhi stop");//设置播放按钮
		nowMusicN = $(".musicList tbody tr").size()-1;//更新当前播放是第几首
		autoMusicNowTime(dom.attr('m4a'));//调用自动更新时间
		loadingLyc(dom.attr('songid'));//调用ajax请求歌曲
	}
	//上下曲切换音乐
	function moveMusic(dom){
		loadingMore(dom)
		playerInfo(dom);//更新下方播放器信息
		$(".play").removeClass('icon-bofangqikaishi play').addClass("icon-bofangqitingzhi stop");//设置播放按钮
		autoMusicNowTime(dom.attr('m4a'))//调用自动更新时间
	}
	// 指定播放音乐,情况搜索框
	function playMusic(dom){
		$(".search ul").on('click','li', function(event) {
			ajaxInit($(this))
		});
		
		$(document).keydown(function(event){

			if(event.keyCode ==13 && wathchFocus){// 回车
				ajaxInit($(".search ul li").eq(searchListN));
				
			}
		})

	}

	// 清空搜索框，留下记录
	function removeSearch(){

		$(".search ul").html("");
		// console.log($(".search input").val())
		$(".search input").attr("placeholder",$(".search input").val());

		$(".search input").val("");

	}
	// 指定音乐后播放音乐，加载歌词，加载歌曲名歌手歌专辑名图片等
	// 
	function loadingMore(dom){
		$(".musicCover img").attr("src",dom.attr('albumpic_big'));
		$(".singName span").html(dom.attr('songname'));
		$(".singerName span").html(dom.attr('singername'));
		$(".albumName span").html(dom.attr('albumname'));
		
	}
	// 更新播放器信息
	function playerInfo(dom){
		$(".songName").html(dom.attr("songname"));
		$(".singer").html(dom.attr("singername"));
		loadAudio(dom.attr("m4a"),function(){
			var allTime = Math.floor($("audio")[0].duration);
			var min = Math.floor(allTime/60);
			var sec = allTime%60>=10?allTime%60:"0"+allTime%60;
			$(".allTime").html(min+":"+sec);
		})

		
	}
	//自动更新播放时间

	function autoMusicNowTime(src){
		loadAudio(src,function(){
			var musicInter = setInterval(function(){
				var nowTime = Math.floor($("audio")[0].currentTime);
				var nowMin = Math.floor(parseInt(nowTime/60));
				var nowSec = nowTime%60>=10?nowTime%60:"0"+nowTime%60;
				$(".nowTime").html(nowMin+":"+nowSec);

				var allTime = Math.floor($("audio")[0].duration);
				var left = nowTime/allTime *500;
				$(".progress .point").css({"left":left})

				if($("audio")[0].currentTime == $("audio")[0].duration){
					clearInterval(musicInter);
					//自动播放下一曲
					autoNext();
				}
				
			},1000)
		})
		
	}
	// 添加音乐到音乐列表
	function addMusicList(dom){
		
		$tr = $("<tr></tr>").html('<td><input type="checkbox"></td>'+
								    '<td>'+($('.musicList tbody tr').size() + 1)+'</td>'+
									'<td>'+dom.attr('songname')+'</td>'+
									'<td>'+dom.attr('singername')+'</td>'+
									'<td>04:20</td>');
		$tr.attr("songname",dom.attr('songname'));
		$tr.attr("singername",dom.attr('singername'));
		$tr.attr("albumpic_big",dom.attr('albumpic_big'));
		$tr.attr("albumpic_small",dom.attr('albumpic_small'));
		$tr.attr("albumname",dom.attr('albumname'));
		$tr.attr("m4a",dom.attr('m4a'));
		$(".musicList tbody").append($tr);
	}
	// 直接加载播放功能
	playMenu();

	var nowMusicN = 0;//当前播放是第几首
	var soundOnoff = false;//默认不关闭
	var prveSoundN = 0;
	// 播放器功能
	function playMenu(){

		$(".musicCtrl").on("click",".play",function(){
			if($(".musicList tbody tr").length){
				$("audio").attr("src",$(".musicList tbody tr").eq(0).attr("src"));
				$("audio")[0].play();
				$(".play").removeClass('icon-bofangqikaishi play').addClass("icon-bofangqitingzhi stop");
			}
			else{
				alert("音乐列表还没有音乐！")
			}
		})

		$(".musicCtrl").on("click",".stop",function(){
			$("audio")[0].pause();
			$(".stop").removeClass('icon-bofangqitingzhi stop').addClass("icon-bofangqikaishi play");
		})

		$(".musicCtrl").on("click",".prev",function(){
			nowMusicN--;
			if(nowMusicN<0){
				nowMusicN = $(".musicList tbody tr").size()-1;
			}
			$("audio").attr("src",$(".musicList tbody tr").eq(nowMusicN).attr("m4a"));
			moveMusic($(".musicList tbody tr").eq(nowMusicN))


		})

		$(".musicCtrl").on("click",".next",function(){
			nowMusicN++;
			if(nowMusicN>$(".musicList tbody tr").size()-1){
				nowMusicN = 0;
			}
			$("audio").attr("src",$(".musicList tbody tr").eq(nowMusicN).attr("m4a"));
			moveMusic($(".musicList tbody tr").eq(nowMusicN))
		})

		$(".musicCtrl").on("click",".sound",function(){//设置音量关闭
			if(!soundOnoff){
				$(".sound").removeClass('icon-jingyin').addClass("icon-jingyin1");
				soundOnoff = true;
				prveSoundN = $(".musicCtrl .soundCtrl .point").css("left");
				$(".musicCtrl .soundCtrl .point").css({"left":0})
				
			}
			else{
				$(".sound").removeClass('icon-jingyin1').addClass("icon-jingyin");
				soundOnoff = false;
				$(".musicCtrl .soundCtrl .point").css({"left":prveSoundN})
			}
			$("audio")[0].muted = soundOnoff;
			
		})

		$(".musicCtrl").on("mousedown",".soundCtrl",function(e){//设置音量大小
			var soundN = Math.floor(e.pageX-$(".soundCtrl").offset().left);
			if(soundN>100){
				soundN =100;
			}
			if(soundN<0){
				soundN = 0;
			}

			$(".musicCtrl .soundCtrl .point").css({"left":soundN});
			$("audio")[0].volume = soundN/100;


			$(document).on("mousemove",function(e){
				soundN = Math.floor(e.pageX-$(".soundCtrl").offset().left);
				if(soundN>100){
					soundN =100;
				}
				if(soundN<0){
					soundN = 0;
				}

				$(".musicCtrl .soundCtrl .point").css({"left":soundN-6});
				$("audio")[0].volume = soundN/100;
				console.log(soundN)
				
			})

			$(document).on('mouseup', '', function(event) {
				$(document).off('mousemove');
			});



		})
		//音乐快进
		$(".musicCtrl").on("mousedown",".progress",function(e){
			$("audio")[0].paused = true;
				
			
			var musicNowTime = e.pageX - $(".progress").offset().left;
			if(musicNowTime>500){
				musicNowTime =500;
			}
			if(musicNowTime<0){
				musicNowTime = 0;
			}
			$(".musicCtrl .progress .point").css({"left":musicNowTime});
			$("audio")[0].currentTime = musicNowTime/500 * $("audio")[0].duration;

			$(document).on("mousemove","",function(e){
				var musicNowTime = e.pageX - $(".progress").offset().left;
				if(musicNowTime>500){
					musicNowTime =500;
				}
				if(musicNowTime<0){
					musicNowTime = 0;
				}
				$(".musicCtrl .progress .point").css({"left":musicNowTime-6});
				$("audio")[0].currentTime = musicNowTime/500 * $("audio")[0].duration;
			})
			$(document).on('mouseup', '', function(event) {
				$(document).off('mousemove');
				$("audio")[0].paused = false;

			});

		})
		
	}
	function autoNext(){//自动播放下一首
		nowMusicN++;
		if(nowMusicN>$(".musicList tbody tr").size()-1){
			nowMusicN = 0;
		}
		$("audio").attr("src",$(".musicList tbody tr").eq(nowMusicN).attr("m4a"));
		moveMusic($(".musicList tbody tr").eq(nowMusicN))

	}
	function loadingLyc(songid){
		$.ajax({
			url: './php/lyric.php',
			type: 'get',
			dataType: 'json',
			data: {
				singid: songid
			},
			success:function(info){
				
				console.log(info.showapi_res_body.lyric)
			}
		})
	}
	
	 
})