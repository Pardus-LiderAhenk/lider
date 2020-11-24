/**
 * end-sessions
 * this task terminates open user sessions on clients and shutdown and restart clients
 * Tuncay ÇOLAK
 * tuncay.colak@tubitak.gov.tr
 * 
 * http://www.liderahenk.org/
 * 
 */

if (ref_end_sessions) {
	connection.deleteHandler(ref_end_sessions);
}

var scheduledParamEndSessions = null;
var scheduledModalEndSessionsOpened = false;
var ref_end_sessions = connection.addHandler(endSessionsListener, null, 'message', null, null,  null);
var dnlist=[];
var pluginTask_EndSessions = null;

if(selectedEntries){
	for (var i = 0; i < selectedEntries.length; i++) {
		dnlist.push(selectedEntries[i].distinguishedName);
	}
}
for (var n = 0; n < pluginTaskList.length; n++) {
	var pluginTask=pluginTaskList[n];
	if (pluginTask.page == 'end-sessions') {
		pluginTask_EndSessions = pluginTask;
	}
}

function sendTaskEndSession(commandId) {
	if(pluginTask_EndSessions){
		pluginTask_EndSessions.dnList=dnlist;
		pluginTask_EndSessions.entryList=selectedEntries;
		pluginTask_EndSessions.dnType="AHENK";
		pluginTask_EndSessions.cronExpression = scheduledParamEndSessions;
		pluginTask_EndSessions.parameterMap={};
		pluginTask_EndSessions.commandId = commandId;
		var params = JSON.stringify(pluginTask_EndSessions);
	}

	var content = "Görev Gönderilecek, emin misiniz?";
	if (scheduledParamEndSessions != null) {
		content = "Zamanlanmış görev gönderilecek, emin misiniz?";
	}
	$.confirm({
		title: 'Uyarı!',
		content: content,
		theme: 'light',
		buttons: {
			Evet: function () {
				
				var message = "Görev başarı ile gönderildi.. Lütfen bekleyiniz...";
				if (scheduledParamEndSessions != null) {
					message = "Zamanlanmış görev başarı ile gönderildi. Zamanlanmış görev parametreleri:  "+ scheduledParamEndSessions;
				}
				if (selectedEntries[0].type == "AHENK" && selectedRow.online == true && scheduledParamEndSessions == null) {
					progress("endSessionsContent","progressDivEndSessions",'show');
				}
				if (selectedEntries[0].type == "AHENK" && selectedRow.online == false) {
					$.notify("Görev başarı ile gönderildi, istemci çevrimiçi olduğunda uygulanacaktır.", "success");
				}
				if (selectedEntries[0].type == "GROUP") {
					var groupNotify = "Görev istemci grubuna başarı ile gönderildi.";
					if (scheduledParamEndSessions != null) {
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
								$("#plugin-result-end-sessions").html(message.bold());
							}
						}   	
						/* $('#closePage').click(); */
					},
					error: function(result) {
						$.notify(result, "error");
					}
				});
				scheduledParamEndSessions = null;
			},
			Hayır: function () {
			}
		}
	});
}

function endSessionsListener(msg) {
	var to = msg.getAttribute('to');
	var from = msg.getAttribute('from');
	var type = msg.getAttribute('type');
	var elems = msg.getElementsByTagName('body');

	if (type == "chat" && elems.length > 0) {
		var body = elems[0];
		var data=Strophe.xmlunescape(Strophe.getText(body));
		var xmppResponse=JSON.parse(data);
		var responseMessage = xmppResponse.result.responseMessage;
		if(xmppResponse.commandClsId == "MANAGE" || xmppResponse.commandClsId == "MACHINE_SHUTDOWN" || xmppResponse.commandClsId == "MACHINE_RESTART") {
			if (xmppResponse.result.responseCode == "TASK_PROCESSED" || xmppResponse.result.responseCode == "TASK_ERROR") {
				if (selectedEntries[0].type == "AHENK") {
					if (xmppResponse.result.responseCode == "TASK_PROCESSED") {
						$("#plugin-result-end-sessions").html("");
						progress("endSessionsContent","progressDivEndSessions",'hide');
						$.notify(responseMessage, "success");
					} else {
//						$("#plugin-result-end-sessions").html(("HATA: "+ xmppResponse.result.responseMessage).fontcolor("red"));
						$.notify(responseMessage, "error");
					}
				}
			}
		}
	}
//	we must return true to keep the handler alive. returning false would remove it after it finishes.
	return true;
}

$('#sendTaskCronEndSessions').click(function(e){
	$('#scheduledTasksModal').modal('toggle');
	scheduledParam = null;
	scheduledModalEndSessionsOpened = true;
});

$("#scheduledTasksModal").on('hidden.bs.modal', function(){
	if (scheduledModalEndSessionsOpened) {
		scheduledParamEndSessions = scheduledParam;
	}
	scheduledModalEndSessionsOpened = false;
	defaultScheduleSelection();
});

//logout user on agent
$('#sendTaskEndSessions').click(function(e){
	if (selectedEntries.length == 0 ) {
		$.notify("Lütfen istemci seçiniz.", "error");
		return;
	}
	sendTaskEndSession("MANAGE");
});

//Shutdown agent
$('#sendTaskShutdown').click(function(e){
	if (selectedEntries.length == 0 ) {
		$.notify("Lütfen istemci seçiniz.", "error");
		return;
	}
	sendTaskEndSession("MACHINE_SHUTDOWN");
});

//restart agent
$('#sendTaskRestart').click(function(e){
	if (selectedEntries.length == 0 ) {
		$.notify("Lütfen istemci seçiniz.", "error");
		return;
	}
	sendTaskEndSession("MACHINE_RESTART");
});
