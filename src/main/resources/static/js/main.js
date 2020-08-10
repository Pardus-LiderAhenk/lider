var selectedEntries = []; // make a global to make for different selected  entries
$(document).ready(function(){
	$("#subentryDiv").hide();
	//page menu action.. getting inner html page content and render.. 
	$('.dizin').on('click', function(e) {
		$('#mainArea').empty();
		var page = $(this).data("page");
		$.ajax({
			type : 'POST',
			url : 'lider/pages/getInnerHtmlPage',
			data : 'innerPage=' + page,
			dataType : 'text',
			success : function(data) {
				if(page == "logout"){
					$('#mainHtmlContent').html(data);
				}
				else{
					$('#mainArea').html(data);
					if(page != "agent_info") {
						// to remove apply and clear button of datetimepicker
						$('.daterangepicker.ltr.show-calendar.opensright').remove();
					}
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				if(jqXHR.status == 401) {
					window.location.replace("/");
				}
			}
		});
	
	});
	$('#clearLogBtn').on('click', function(e) {	
		$('#logger').html("")
	});
});

function changeLanguage(language) {
	var params = {
		    "langa1799b6ac27611eab3de0242ac130004": language
	};
	$.ajax({
		type : 'POST',
		url : 'changeLanguage',
		data : params,
		dataType: 'json',
		success : function(data) {
		},
		error : function(data, errorThrown) {
			$.notify("Dil değiştirilirken hata oluştu. Lütfen tekrar deneyiniz.", "error");
		},
		complete: function() {
			location.reload();
		}
	});
}