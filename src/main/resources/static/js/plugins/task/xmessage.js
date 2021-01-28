/**
 * xmessage
 * Shows sent messages in agents
 * Tuncay ÇOLAK
 * tuncay.colak@tubitak.gov.tr
 * 
 * http://www.liderahenk.org/
 * 
 */

if (ref_xmessage) {
	connection.deleteHandler(ref_xmessage);
}
var scheduledParamXmessage = null;
var scheduledModalXmessageOpened = false;
var dnlist = [];
var pluginTask_Xmessage = null;
var ref_xmessage=connection.addHandler(xmessageListener, null, 'message', null, null,  null);

if(selectedEntries){
	for (var i = 0; i < selectedEntries.length; i++) {
		dnlist.push(selectedEntries[i].distinguishedName);
	}
}

for (var n = 0; n < pluginTaskList.length; n++) {
	var pluginTask=pluginTaskList[n];
	if (pluginTask.page == 'xmessage') {
		pluginTask_Xmessage=pluginTask;
	}
}

function sendXmessageTask(params) {
	var message = "Görev başarı ile gönderildi.. Lütfen bekleyiniz...";
	if (scheduledParamXmessage != null) {
		message = "Zamanlanmış görev başarı ile gönderildi. Zamanlanmış görev parametreleri:  "+ scheduledParamXmessage;
	}
	if (selectedEntries[0].type == "AHENK" && selectedRow.online == true && scheduledParamXmessage == null) {
		progress("divXMessage","progressXMessage",'show');
	}
	if (selectedEntries[0].type == "AHENK" && selectedRow.online == false) {
		$.notify("Görev başarı ile gönderildi, istemci çevrimiçi olduğunda uygulanacaktır.", "success");
	}
	if (selectedEntries[0].type == "GROUP") {
		var groupNotify = "Görev istemci grubuna başarı ile gönderildi.";
		if (scheduledParamXmessage != null) {
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
					$("#plugin-result-xmessage").html(message.bold());	
				}
			}   	
		},
		error: function(result) {
			$.notify(result, "error");
		}
	});
}

function xmessageListener(msg) {
	var to = msg.getAttribute('to');
	var from = msg.getAttribute('from');
	var type = msg.getAttribute('type');
	var elems = msg.getElementsByTagName('body');

	if (type == "chat" && elems.length > 0) {
		var body = elems[0];
		var data=Strophe.xmlunescape(Strophe.getText(body));
		var xmppResponse=JSON.parse(data);
		var responseMessage = xmppResponse.result.responseMessage;
		if(xmppResponse.result.responseCode == "TASK_PROCESSED" || xmppResponse.result.responseCode == "TASK_ERROR") {
			if (selectedEntries[0].type == "AHENK") {
				progress("divXMessage","progressXMessage",'hide');
				if (xmppResponse.commandClsId == "EXECUTE_XMESSAGE") {
					var arrg = JSON.parse(xmppResponse.result.responseDataStr);
					if (xmppResponse.result.responseCode == "TASK_PROCESSED") {
						$.notify(responseMessage, "success");
						$("#plugin-result-xmessage").html("");
					}
					else {
						$.notify(responseMessage, "error");
//						$("#plugin-result-xmessage").html(("HATA: " + responseMessage).fontcolor("red"));
					}
				}
			}
		}
	}
	// we must return true to keep the handler alive. returning false would remove it after it finishes.
	return true;
}

$('#sendTaskCronXmessage').click(function(e){
	$('#scheduledTasksModal').modal('toggle');
	scheduledParam = null;
	scheduledModalXmessageOpened = true;
});

$("#scheduledTasksModal").on('hidden.bs.modal', function(){
	if (scheduledModalXmessageOpened) {
		scheduledParamXmessage = scheduledParam;
	}
	scheduledModalXmessageOpened = false;
	defaultScheduleSelection();
});

$('#sendTaskXmessage').click(function(e){
	if (selectedEntries.length == 0 ) {
		$.notify("Lütfen istemci seçiniz.", "error");
		return;
	}
	var message = $('#xmessageContent').val();
	if (message.includes("'")) {
		message = message.replaceAll("'", "'\\''");
	}
	if (message.includes('"')) {
		message = message.replaceAll('"', '"\\""');
	}
	if (pluginTask_Xmessage) {
		pluginTask_Xmessage.dnList=dnlist;
		pluginTask_Xmessage.entryList=selectedEntries;
		pluginTask_Xmessage.dnType="AHENK";
		pluginTask_Xmessage.parameterMap={"message": message};
		pluginTask_Xmessage.cronExpression = scheduledParamXmessage;
		pluginTask_Xmessage.commandId = "EXECUTE_XMESSAGE";  		
		var params = JSON.stringify(pluginTask_Xmessage);
	}

//	if selected message/notify. Default select box "Mesaj seçiniz... value = NA"
	if (message != "") {
		var content = "Görev Gönderilecek, emin misiniz?";
		if (scheduledParamXmessage != null) {
			content = "Zamanlanmış görev gönderilecek, emin misiniz?";
		}
		$.confirm({
			title: 'Uyarı!',
			content: content,
			theme: 'light',
			buttons: {
				Evet: function () {
					sendXmessageTask(params);
					scheduledParamXmessage = null;
				},
				Hayır: function () {
				}
			}
		});
	}else {
		$.notify("Mesaj içeriği boş bırakılamaz.", "warn");
	}
});

