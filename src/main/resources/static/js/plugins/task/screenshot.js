/**
 * screenshot
 * take screenshot in agent
 * Tuncay ÇOLAK
 * tuncay.colak@tubitak.gov.tr
 * 
 * http://www.liderahenk.org/
 * 
 */

if (ref_screenshot) {
	connection.deleteHandler(ref_screenshot);
}

var scheduledParamScreenshot = null;
var scheduledModalScreenshotOpened = false;
var ref_screenshot = connection.addHandler(remoteAccessListener, null, 'message', null, null,  null);
var dnlist=[];
var pluginTaskScreenshot = null;

if(selectedEntries){
	for (var i = 0; i < selectedEntries.length; i++) {
		dnlist.push(selectedEntries[i].distinguishedName);
	}
}
for (var n = 0; n < pluginTaskList.length; n++) {
	var pluginTask=pluginTaskList[n];
	if (pluginTask.page == 'screenshot') {
		pluginTaskScreenshot = pluginTask;
	}
}

function sendTaskRemoteAccess(params) {
	var message = "Görev başarı ile gönderildi.. Lütfen bekleyiniz...";
	if (scheduledParamScreenshot != null) {
		message = "Zamanlanmış görev başarı ile gönderildi. Zamanlanmış görev parametreleri:  "+ scheduledParamScreenshot;
	}
	
	if (selectedEntries[0].type == "AHENK" && selectedRow.online == true && scheduledParamScreenshot == null) {
		progress("screenshotDiv","progressScreenshot",'show');
	}
	if (selectedEntries[0].type == "AHENK" && selectedRow.online == false) {
		$.notify("Görev başarı ile gönderildi, istemci çevrimiçi olduğunda uygulanacaktır.", "success");
	}
	if (selectedEntries[0].type == "GROUP") {
		var groupNotify = "Görev istemci grubuna başarı ile gönderildi.";
		if (scheduledParamScreenshot != null) {
			groupNotify = "Zamanlanmış görev istemci grubuna başarı ile gönderildi.";
		}
		$.notify(groupNotify, "success");
	}
	
	$.ajax({
		type: "POST",
		url: "/lider/task/execute",
		headers: {
			'Content-Type':'application/json',
		}, 
		data: params,
		contentType: "application/json",
		dataType: "json",
		converters: {
			'text json': true
		}, 
		success: function(result) {
			var res = jQuery.parseJSON(result);
			if(res.status=="OK"){
				if (selectedEntries[0].type == "AHENK" && selectedRow.online == true) {
					$("#plugin-result-screenshot").html(message.bold());	
				}
			}   	
			/* $('#closePage').click(); */
		},
		error: function(result) {
			$.notify(result, "error");
		}
	});
}

function remoteAccessListener(msg) {
	var to = msg.getAttribute('to');
	var from = msg.getAttribute('from');
	var type = msg.getAttribute('type');
	var elems = msg.getElementsByTagName('body');

	if (type == "chat" && elems.length > 0) {
		var body = elems[0];
		var data=Strophe.xmlunescape(Strophe.getText(body));
		var xmppResponse=JSON.parse(data);
		var responseDn = xmppResponse.commandExecution.dn;
		var selectedDn = selectedEntries[0]["attributes"].entryDN;
		if(xmppResponse.commandClsId == "TAKE-SCREENSHOT") {
			if (selectedEntries[0].type == "AHENK") {
				if (xmppResponse.result.responseCode == "TASK_PROCESSED" || xmppResponse.result.responseCode == "TASK_ERROR") {
					progress("screenshotDiv","progressScreenshot",'hide');
					if (responseDn == selectedDn) {
						if (xmppResponse.result.responseCode == "TASK_PROCESSED") {
							if (xmppResponse.result.contentType =="IMAGE_JPEG" || xmppResponse.result.contentType =="IMAGE_PNG") {
								var arrg = JSON.parse(xmppResponse.result.responseDataStr);
								
								var params = {
										"id" : xmppResponse.result.id
								};
								$.ajax({
									type: 'POST', 
									url: "/command/commandexecutionresult",
									dataType: 'json',
									data: params,
									success: function(data) {
										if(data != null) {
											if(data.responseDataStr != null) {
												progress("screenshotDiv","progressScreenshot",'hide');
												$("#plugin-result-screenshot").html("");
												$.notify(xmppResponse.result.responseMessage, "success");
												console.log(data.responseDataStr)
												
												$("#setImage").attr('src', 'data:image/png;base64,' + data.responseDataStr);
											}
										}
									},
									error: function(result) {
										$.notify(result, "error");
										$("#plugin-result-screenshot").html(("HATA: " + responseMessage).fontcolor("red"));
									}
								});
							}
						} else {
							$("#plugin-result-screenshot").html(("HATA: "+ xmppResponse.result.responseMessage).fontcolor("red"));
							$.notify(xmppResponse.result.responseMessage, "error");
						}
					} else {
						$("#plugin-result-screenshot").html("");
					}
				}
			}
		}
	}
	// we must return true to keep the handler alive. returning false would remove it after it finishes.
	return true;
}

$('#sendTaskCronScreenshot').click(function(e){
	$('#scheduledTasksModal').modal('toggle');
	scheduledParam = null;
	scheduledModalScreenshotOpened = true;
});

$("#scheduledTasksModal").on('hidden.bs.modal', function(){
	if (scheduledModalScreenshotOpened) {
		scheduledParamScreenshot = scheduledParam;
	}
	scheduledModalScreenshotOpened = false;
	defaultScheduleSelection();
});


function get_image() {
	
	var params = {
			"id" : 14779
	};
	$.ajax({
		type: 'POST', 
		url: "/command/commandexecutionresult",
		dataType: 'json',
		data: params,
		success: function(data) {
			if(data != null) {
				if(data.responseDataStr != null) {
//					progress("screenshotDiv","progressScreenshot",'hide')
//					$("#plugin-result-screenshot").html("");
//					$.notify(xmppResponse.result.responseMessage, "success");
					console.log(data)
//					createImage(data.responseDataStr);
//					$('#setImage').attr('src','data:image/png;base64,'+data.responseDataStr+'"/>');
					
//					$("#setImage").attr("src", "data:image/png;base64," + data.responseDataStr);
					
//		            $("#setImage").attr('src', 'data:image/png;base64,' + data.responseDataStr);
		            $('#setImage').attr('src','data:image/png;base64,'+data.responseDataStr+'"/>');    


				}
			}
		},
		error: function(result) {
			$.notify(result, "error");
			$("#plugin-result-screenshot").html(("HATA: " + responseMessage).fontcolor("red"));
		}
	});
	
}

$('#sendTaskScreenshot').click(function(e){
	if (selectedEntries.length == 0 ) {
		$.notify("Lütfen istemci seçiniz.", "error");
		return;
	}
//	get_image();
	if(pluginTaskScreenshot){
		pluginTaskScreenshot.dnList=dnlist;
		pluginTaskScreenshot.entryList=selectedEntries;
		pluginTaskScreenshot.dnType="AHENK";
		pluginTaskScreenshot.cronExpression = scheduledParamScreenshot;
		pluginTaskScreenshot.parameterMap={};
		pluginTaskScreenshot.commandId = "TAKE-SCREENSHOT";
		var params = JSON.stringify(pluginTaskScreenshot);
	}
	
	var content = "Görev Gönderilecek, emin misiniz?";
	if (scheduledParamScreenshot != null) {
		content = "Zamanlanmış görev gönderilecek, emin misiniz?";
	}
	$.confirm({
		title: 'Uyarı!',
		content: content,
		theme: 'light',
		buttons: {
			Evet: function () {
				sendTaskRemoteAccess(params);
				scheduledParamScreenshot = null;
			},
			Hayır: function () {
			}
		}
	});
});
