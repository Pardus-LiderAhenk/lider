/**
 * remote-access
 * task that enables connection to x11vnc-server over the web.
 * Tuncay ÇOLAK
 * tuncay.colak@tubitak.gov.tr
 * 
 * http://www.liderahenk.org/
 * 
 */

if (ref_remote_access) {
	connection.deleteHandler(ref_remote_access);
}

$('#btnSendVNCReuqest').hide();
var scheduledParamRemoteAccess = null;
var scheduledModalRemoteAccessOpened = false;
var ref_remote_access = connection.addHandler(remoteAccessListener, null, 'message', null, null,  null);
var dnlist=[];
var pluginTask_RemoteAccess = null;
addOptionsToRemoteAccessSelect();

if(selectedEntries){
	for (var i = 0; i < selectedEntries.length; i++) {
		dnlist.push(selectedEntries[i].distinguishedName);
	}
}
for (var n = 0; n < pluginTaskList.length; n++) {
	var pluginTask=pluginTaskList[n];
	if (pluginTask.page == 'remote-access') {
		pluginTask_RemoteAccess = pluginTask;
	}
}

function addOptionsToRemoteAccessSelect() {
	$('#remoteAccessSelect').append($('<option>', {
		text: "Kullanıcı izni ve bildirim aktif et",
		value : "yes",
	}));

//	$('#remoteAccessSelect').append($('<option>', {
//		text: "Sadece bildirim aktif et",
//		value : "no",
//	}));
	if (systemSettings.allowVNCConnectionWithoutPermission) {
		$('#remoteAccessSelect').append($('<option>', {
			text: "Kullanıcı izni ve bildirim yok",
			value : "without_notify",
		}));
	}
}

function sendTaskRemoteAccess(params) {
	var message = "Görev başarı ile gönderildi.. Lütfen bekleyiniz...";
	if (scheduledParamRemoteAccess != null) {
		message = "Zamanlanmış görev başarı ile gönderildi. Zamanlanmış görev parametreleri:  "+ scheduledParamRemoteAccess;
	}
	if (selectedEntries[0].type == "AHENK" && selectedRow.online == true && scheduledParamRemoteAccess == null) {
		progress("remoteAccessDiv","progressRemoteAccess",'show');
	}
	if (selectedEntries[0].type == "AHENK" && selectedRow.online == false) {
		$.notify("Görev başarı ile gönderildi, istemci çevrimiçi olduğunda uygulanacaktır.", "success");
	}
	if (selectedEntries[0].type == "GROUP") {
		var groupNotify = "Görev istemci grubuna başarı ile gönderildi.";
		if (scheduledParamRemoteAccess != null) {
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
					$("#plugin-result-remote-access").html(message.bold());
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
		
		if(xmppResponse.commandClsId == "SETUP-VNC-SERVER") {
			if (selectedEntries[0].type == "AHENK") {
				progress("remoteAccessDiv","progressRemoteAccess",'hide');
				if (xmppResponse.result.responseCode == "TASK_PROCESSED" || xmppResponse.result.responseCode == "TASK_ERROR") {
					progress("resourceUsageContent","progressDivResourceUsage",'hide');
					if (responseDn == selectedDn) {
						if (xmppResponse.result.responseCode == "TASK_PROCESSED") {
							$("#plugin-result-remote-access").html("");
							$.notify(xmppResponse.result.responseMessage, "success");
							var arrg = JSON.parse(xmppResponse.result.responseDataStr);
							startRemoteAccess(arrg);
						} else {
//							$("#plugin-result-remote-access").html(("HATA: "+ xmppResponse.result.responseMessage).fontcolor("red"));
							$.notify(xmppResponse.result.responseMessage, "error");
						}
					} else {
						$("#plugin-result-remote-access").html("");
					}
				}
			}
		}
	}
	// we must return true to keep the handler alive. returning false would remove it after it finishes.
	return true;
}

function startRemoteAccess(data) {
	var params = {
			"protocol" : "vnc",
			"host" : data.host,
			"port": data.port,
			"password": data.password,
			"username": ""
	};
	
	$.ajax({
		type: 'POST', 
		url: "/sendremote",
		data: params,
		success: function(data) {
			$('#btnSendVNCReuqest').show();
		},
		 error: function (jqXHR, textStatus, errorThrown) {
			 console.log(jqXHR)
			 console.log(textStatus)
			 console.log(errorThrown)
		 }
	});
}

$('#btnSendVNCReuqest').click(function(e){
	$('#btnSendVNCReuqest').hide();
});
$('#sendTaskCronRemoteAccess').click(function(e){
	$('#scheduledTasksModal').modal('toggle');
	scheduledParam = null;
	scheduledModalRemoteAccessOpened = true;
});

$("#scheduledTasksModal").on('hidden.bs.modal', function(){
	if (scheduledModalRemoteAccessOpened) {
		scheduledParamRemoteAccess = scheduledParam;
	}
	scheduledModalRemoteAccessOpened = false;
	defaultScheduleSelection();
});


$('#sendTaskRemoteAccess').click(function(e){
	if (selectedEntries.length == 0 ) {
		$.notify("Lütfen istemci seçiniz.", "error");
		return;
	}
	
	if(pluginTask_RemoteAccess){
		pluginTask_RemoteAccess.dnList=dnlist;
		pluginTask_RemoteAccess.entryList=selectedEntries;
		pluginTask_RemoteAccess.dnType="AHENK";
		pluginTask_RemoteAccess.cronExpression = scheduledParamRemoteAccess;
		pluginTask_RemoteAccess.parameterMap={"permission":$('#remoteAccessSelect :selected').val()};
		pluginTask_RemoteAccess.commandId = "SETUP-VNC-SERVER";
		var params = JSON.stringify(pluginTask_RemoteAccess);
	}
	
	var content = "Görev Gönderilecek, emin misiniz?";
	if (scheduledParamRemoteAccess != null) {
		content = "Zamanlanmış görev gönderilecek, emin misiniz?";
	}
	$.confirm({
		title: 'Uyarı!',
		content: content,
		theme: 'light',
		buttons: {
			Evet: function () {
				sendTaskRemoteAccess(params);
				scheduledParamRemoteAccess = null;
			},
			Hayır: function () {
			}
		}
	});
});
