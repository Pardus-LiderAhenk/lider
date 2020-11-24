/**
 * eta-notify
 * Shows sent messages in agents for ETA
 * Tuncay ÇOLAK
 * tuncay.colak@tubitak.gov.tr
 * 
 * http://www.liderahenk.org/
 * 
 */

if (ref_eta_notify) {
	connection.deleteHandler(ref_eta_notify);
}
var scheduledParamEtaNotify = null;
var scheduledModalEtaNotifyOpened = false;
var notifyFileList = [];
var dnlist = [];
var pluginTask_EtaNotify = null;
var ref_eta_notify=connection.addHandler(etaNotifyListener, null, 'message', null, null,  null);

if(selectedEntries){
	for (var i = 0; i < selectedEntries.length; i++) {
		dnlist.push(selectedEntries[i].distinguishedName);
	}
}

for (var n = 0; n < pluginTaskList.length; n++) {
	var pluginTask=pluginTaskList[n];
	if (pluginTask.page == 'eta-notify') {
		pluginTask_EtaNotify=pluginTask;
	}
}

//get notify template from liderdb
getNotifyTemp();

function getNotifyTemp() {
	$.ajax({
		type: 'POST', 
		url: "/notify/list",
		dataType: 'json',
		success: function(data) {
			if(data != null && data.length > 0) {
				notifyFileList = data;
//				$.notify("Mesajlar başarıyla listelendi.", "success");
				for (var i = 0; i < data.length; i++) {
					$('#notifySelectBox').append($('<option>', {
						id: data[i]["id"],
						text: data[i]["label"],
						value : data[i]["contents"],
						name: data[i]["time"]
					}));
				}
			}
		},
		error: function(result) {
			$.notify(result, "error");
		}
	});
}

$('#notifySelectBox').change(function(){ 
	var notifySelected = $(this).val();
	var notifyFileId = $(this).find('option:selected').attr('id');
	var notifyFileContent = $(this).find('option:selected').attr('value');
	var notifyFileTime = $(this).find('option:selected').attr('name');

	if (notifySelected != "NA") {
		$("#notifyContent").val(notifyFileContent);
		$("#notifyTime").val(notifyFileTime);
	}else {
		$("#notifyContent").val("");
		$("#notifyTime").val("");
	}
});

function sendNotifyTask(params) {
	var message = "Görev başarı ile gönderildi.. Lütfen bekleyiniz...";
	if (scheduledParamEtaNotify != null) {
		message = "Zamanlanmış görev başarı ile gönderildi. Zamanlanmış görev parametreleri:  "+ scheduledParamEtaNotify;
	}
	if (selectedEntries[0].type == "AHENK" && selectedRow.online == true && scheduledParamEtaNotify == null) {
		progress("divEtaNotify","progressEtaNotify",'show');
	}
	if (selectedEntries[0].type == "AHENK" && selectedRow.online == false) {
		$.notify("Görev başarı ile gönderildi, istemci çevrimiçi olduğunda uygulanacaktır.", "success");
	}
	if (selectedEntries[0].type == "GROUP") {
		var groupNotify = "Görev istemci grubuna başarı ile gönderildi.";
			if (scheduledParamEtaNotify != null) {
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
					$("#plugin-result-eta-notify").html(message.bold());
				}
			}   	
		},
		error: function(result) {
			$.notify(result, "error");
		}
	});
}

function etaNotifyListener(msg) {
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
			progress("divEtaNotify","progressEtaNotify",'hide');
			if (xmppResponse.commandClsId == "ETA_NOTIFY") {
				var arrg = JSON.parse(xmppResponse.result.responseDataStr);
				if (selectedEntries[0].type == "AHENK") {
					if (xmppResponse.result.responseCode == "TASK_PROCESSED") {
						$.notify(responseMessage, "success");
						$("#plugin-result-eta-notify").html("");
					}
					else {
						$.notify(responseMessage, "error");
//						$("#plugin-result-eta-notify").html(("HATA: " + responseMessage).fontcolor("red"));
					}
				}
			}
		}
	}
	// we must return true to keep the handler alive. returning false would remove it after it finishes.
	return true;
}

$('#sendTaskCronEtaNotify').click(function(e){
	$('#scheduledTasksModal').modal('toggle');
	scheduledParam = null;
	scheduledModalEtaNotifyOpened = true;
});

$("#scheduledTasksModal").on('hidden.bs.modal', function(){
	if (scheduledModalEtaNotifyOpened) {
		scheduledParamEtaNotify = scheduledParam;
	}
	scheduledModalEtaNotifyOpened = false;
	defaultScheduleSelection();
});

$('#sendTaskEtaNotify').click(function(e){
	if (selectedEntries.length == 0 ) {
		$.notify("Lütfen istemci seçiniz.", "error");
		return;
	}
	var date = new Date();
	var day = date.getDate();
	var month = date.getMonth() + 1;
	var year = date.getFullYear();

	if (day < 10) {
		day = "0" + day;
	}
	if (month < 10) {
		month = "0" + month;
	}
	var strDate = day + "-" + month + "-" + year;

	var time = new Date();
	var strTime = time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
	if (scheduledParamEtaNotify != null) {
		var sDate = scheduledParamEtaNotify;
		var sNewDate = sDate.split(" ");
		for (var i = 0; i < sNewDate.length; i++) {
			var sDay = sNewDate[2];
			if (sDay < 10) {
				sDay = "0" + sDay;
			}
			var sMonth = sNewDate[3];
			if (sMonth < 10) {
				sMonth = "0" + sMonth;
			}
			var date = new Date();
			var sYear = date.getFullYear();
			if (sNewDate.includes(sNewDate[5])) {
				var sYear = sNewDate[5];
			}

			strTime = sNewDate[1] +":" +sNewDate[0] +":00";
			strDate = sDay + "-" + sMonth + "-" + sYear;
		}
	}
	var sendNotifyTime = strDate + " " + strTime;

	if (pluginTask_EtaNotify) {
		pluginTask_EtaNotify.dnList=dnlist;
		pluginTask_EtaNotify.entryList=selectedEntries;
		pluginTask_EtaNotify.dnType="AHENK";
		pluginTask_EtaNotify.parameterMap={
				"size": $('#notifySize').val(),
				"duration": $('#notifyTime').val(),
				"notify_content": $("#notifySelectBox option:selected").text() + "\n" + $("#notifyContent").val(),
				"send_time": sendNotifyTime
		};
		pluginTask_EtaNotify.cronExpression = scheduledParamEtaNotify;
		pluginTask_EtaNotify.commandId = "ETA_NOTIFY";  		
		var params = JSON.stringify(pluginTask_EtaNotify);
	}

//	if selected message/notify. Default select box "Mesaj seçiniz... value = NA"
	if ($('#notifySelectBox :selected').val() != "NA") {
		var content = "Görev Gönderilecek, emin misiniz?";
		if (scheduledParamEtaNotify != null) {
			content = "Zamanlanmış görev gönderilecek, emin misiniz?";
		}
		$.confirm({
			title: 'Uyarı!',
			content: content,
			theme: 'light',
			buttons: {
				Evet: function () {
					sendNotifyTask(params);
					scheduledParamEtaNotify = null;
				},
				Hayır: function () {
				}
			}
		});
	}else {
		$.notify("Lütfen mesaj seçiniz, daha sonra Çalıştır butonuna tıklayınız.", "warn");
	}
});

