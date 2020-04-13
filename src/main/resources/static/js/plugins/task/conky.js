/**
 * conky
 * Shows sent Conky messages in agents
 * Tuncay ÇOLAK
 * tuncay.colak@tubitak.gov.tr
 * 
 * http://www.liderahenk.org/
 * 
 */

if (ref_conky) {
	connection.deleteHandler(ref_conky);
}

var scheduledParamConky = null;
var scheduledModalConkyOpened = false;
var conkyTempList = [];
var removeConkyMessage = false;
var pluginTask_Conky = null;
var dnlist = [];
var ref_conky = connection.addHandler(conkyListener, null, 'message', null, null,  null);
$('#conkyContentTabTask').tab('show');

if(selectedEntries){
	for (var i = 0; i < selectedEntries.length; i++) {
		dnlist.push(selectedEntries[i].distinguishedName);
	}
}

for (var n = 0; n < pluginTaskList.length; n++) {
	var pluginTask=pluginTaskList[n];
	if (pluginTask.page == 'conky') {
		pluginTask_Conky=pluginTask;
	}
}

//get Conky template from liderdb
getConkyTemp();

function getConkyTemp() {
	$.ajax({
		type: 'POST', 
		url: "/conky/list",
		dataType: 'json',
		success: function(data) {
			if(data != null && data.length > 0) {
				conkyTempList = data;
				for (var i = 0; i < data.length; i++) {
					$('#conkySelectBox').append($('<option>', {
						id: data[i]["id"],
						text: data[i]["label"],
						value : data[i]["contents"],
						name: data[i]["settings"]
					}));
				}
			}else {
				$('#conkySelectBox').append($('<option>', {
					text: "...",
					selected: true
				}));
			}
		},
		error: function(result) {
			$.notify(result, "error");
		}
	});
}

$('#conkySelectBox').change(function(){ 
	var conkySelected = $(this).val();
	var conkyTempId = $(this).find('option:selected').attr('id');
	var conkyTempContent = $(this).find('option:selected').attr('value');
	var conkyTempSetting = $(this).find('option:selected').attr('name');

	if (conkySelected != "NA") {
		$("#conkyContentTemp").val(conkyTempContent);
		$("#conkySettingTemp").val(conkyTempSetting);
	}else {
		$("#conkyContentTemp").val("");
		$("#conkySettingTemp").val("");
	}
});

function sendConkyTask(params) {
	var message = "Görev başarı ile gönderildi.. Lütfen bekleyiniz...";
	if (scheduledParamConky != null) {
		message = "Zamanlanmış görev başarı ile gönderildi. Zamanlanmış görev parametreleri:  "+ scheduledParamConky;
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
				$("#plugin-result-conky").html(message.bold());
			}   	
		},
		error: function(result) {
			$.notify(result, "error");
		}
	});
}

function conkyListener(msg) {
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
			if (xmppResponse.commandClsId == "EXECUTE_CONKY") {
				var arrg = JSON.parse(xmppResponse.result.responseDataStr);
				if (xmppResponse.result.responseCode == "TASK_PROCESSED") {
					$.notify(responseMessage, "success");
					$("#plugin-result-conky").html("");
				}
				else {
					$.notify(responseMessage, "error");
					$("#plugin-result-conky").html(("HATA: " + responseMessage).fontcolor("red"));
				}
			}
		}
	}
	// we must return true to keep the handler alive. returning false would remove it after it finishes.
	return true;
}

$('#removeConkyMessageBtn').click(function(e){
	if($(this).is(':checked')){
		$("#conkySelectBox").prop("disabled", true);
		$("#conkyContentTemp").prop("disabled", true);
		$("#conkySettingTemp").prop("disabled", true);
		$("#conkyContentTemp").val("");
		$("#conkySettingTemp").val("");
		$('#conkySelectBox').val('NA');
		removeConkyMessage = true;
		$("#sendTaskConky").html('<i class="fas fa-times"></i>');
		$('#sendTaskConky').prop('title', 'Mesaj Kaldır');
	}
	else{
		$("#conkySelectBox").prop("disabled", false);
		$("#conkyContentTemp").prop("disabled", false);
		$("#conkySettingTemp").prop("disabled", false);
		removeConkyMessage = false;
		$("#sendTaskConky").html('<i class="fas fa-share-square"></i>');
		$('#sendTaskConky').prop('title', 'Mesaj Gönder');
	}
});

$('#sendTaskCronConky').click(function(e){
	$('#scheduledTasksModal').modal('toggle');
	scheduledParam = null;
	scheduledModalConkyOpened = true;
});

$("#scheduledTasksModal").on('hidden.bs.modal', function(){
	if (scheduledModalConkyOpened) {
		scheduledParamConky = scheduledParam;
	}
	scheduledModalConkyOpened = false;
	defaultScheduleSelection();
});

$('#sendTaskConky').click(function(e){
	if (selectedEntries.length == 0 ) {
		$.notify("Lütfen istemci seçiniz.", "error");
		return;
	}
	var conkyMessage = $("#conkySettingTemp").val() + "\n" + $("#conkyContentTemp").val();

	if (pluginTask_Conky) {
		pluginTask_Conky.dnList=dnlist;
		pluginTask_Conky.entryList=selectedEntries;
		pluginTask_Conky.dnType="AHENK";
		pluginTask_Conky.parameterMap={
				"conkyMessage": conkyMessage,
				"removeConkyMessage": removeConkyMessage
		};
		pluginTask_Conky.cronExpression = scheduledParamConky;
		pluginTask_Conky.commandId = "EXECUTE_CONKY";  		
		var params = JSON.stringify(pluginTask_Conky);
	}
	
//	if selected message/Conky. Default select box "Conky seçiniz... value = NA"
	if ($('#conkySelectBox :selected').val() != "NA" || $('#removeConkyMessageBtn').is(':checked')) {
		var content = "Görev Gönderilecek, emin misiniz?";
		if (scheduledParamConky != null) {
			content = "Zamanlanmış görev gönderilecek, emin misiniz?";
		}
		$.confirm({
			title: 'Uyarı!',
			content: content,
			theme: 'light',
			buttons: {
				Evet: function () {
					sendConkyTask(params);
					scheduledParamConky = null;
				},
				Hayır: function () {
				}
			}
		});
	}else {
		$.notify("Lütfen Conky mesajı seçerek Mesaj Gönder butonuna tıklayınız.", "warn");
	}
});
