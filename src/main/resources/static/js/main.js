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
				if(page=="logout"){
					$('#mainHtmlContent').html(data);
				}
				else{
					$('#mainArea').html(data);
				}
			},
			error : function(data, errorThrown) {
				console.log(data);
			}
		});
	
	});
	$('#clearLogBtn').on('click', function(e) {	
		
		$('#logger').html("")
	});
});