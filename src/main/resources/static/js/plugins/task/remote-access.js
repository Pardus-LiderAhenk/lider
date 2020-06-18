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

function sendTaskRemoteAccess(params) {
	var message = "Görev başarı ile gönderildi.. Lütfen bekleyiniz...";
	if (scheduledParamRemoteAccess != null) {
		message = "Zamanlanmış görev başarı ile gönderildi. Zamanlanmış görev parametreleri:  "+ scheduledParamRemoteAccess;
	}
	progress("remoteAccessDiv","progressRemoteAccess",'show')
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
				$("#plugin-result-remote-access").html(message.bold());
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
		
		if(xmppResponse.commandClsId == "SETUP-VNC-SERVER") {
			progress("remoteAccessDiv","progressRemoteAccess",'hide')
			if (xmppResponse.result.responseCode == "TASK_PROCESSED" || xmppResponse.result.responseCode == "TASK_ERROR") {
				if (xmppResponse.result.responseCode == "TASK_PROCESSED") {
					$("#plugin-result-remote-access").html("");
					progress("resourceUsageContent","progressDivResourceUsage",'hide')
					$.notify(xmppResponse.result.responseMessage, "success");
					var arrg = JSON.parse(xmppResponse.result.responseDataStr);
					startRemoteAccess(arrg);
				} else {
					$("#plugin-result-remote-access").html(("HATA: "+ xmppResponse.result.responseMessage).fontcolor("red"));
					$.notify(xmppResponse.result.responseMessage, "error");
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
			console.log(data)
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
				console.log(params)
				sendTaskRemoteAccess(params);
				scheduledParamRemoteAccess = null;
			},
			Hayır: function () {
			}
		}
	});
});
