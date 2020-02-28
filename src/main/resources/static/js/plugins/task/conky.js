/**
 * conky
 * Shows sent Conky messages in agents
 * Tuncay ÇOLAK
 * tuncay.colak@tubitak.gov.tr
 * 
 * http://www.liderahenk.org/
 * 
 */

if (ref) {
	connection.deleteHandler(ref);
}

scheduledParam = null;
var conkyTempList = [];
var removeConkyMessage = false;
$('#conkyContentTabTask').tab('show');

var ref=connection.addHandler(conkyListener, null, 'message', null, null,  null);
$("#entrySize").html(selectedEntries.length);
var dnlist = []
for (var i = 0; i < selectedEntries.length; i++) {
	dnlist.push(selectedEntries[i].distinguishedName);
}
selectedPluginTask.dnList=dnlist;
selectedPluginTask.entryList=selectedEntries;
selectedPluginTask.dnType="AHENK";

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
	if (scheduledParam != null) {
		message = "Zamanlanmış görev başarı ile gönderildi. Zamanlanmış görev parametreleri:  "+ scheduledParam;
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
				$("#plugin-result").html(message.bold());
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
					$("#plugin-result").html("");
				}
				else {
					$.notify(responseMessage, "error");
					$("#plugin-result").html(("HATA: " + responseMessage).fontcolor("red"));
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

	}
	else{
		$("#conkySelectBox").prop("disabled", false);
		$("#conkyContentTemp").prop("disabled", false);
		$("#conkySettingTemp").prop("disabled", false);
		removeConkyMessage = false;
	}
});

$('#sendTask-'+ selectedPluginTask.page).click(function(e){

	var conkyMessage = $("#conkySettingTemp").val() + "\n" + $("#conkyContentTemp").val();
	selectedPluginTask.parameterMap={
			"conkyMessage": conkyMessage,
			"removeConkyMessage": removeConkyMessage
	};
	selectedPluginTask.cronExpression = scheduledParam;
	selectedPluginTask.commandId = "EXECUTE_CONKY";  		
	var params = JSON.stringify(selectedPluginTask);

//	if selected message/Conky. Default select box "Conky seçiniz... value = NA"
	if ($('#conkySelectBox :selected').val() != "NA" || $('#removeConkyMessageBtn').is(':checked')) {
		var content = "Görev Gönderilecek, emin misiniz?";
		if (scheduledParam != null) {
			content = "Zamanlanmış görev gönderilecek, emin misiniz?";
		}
		$.confirm({
			title: 'Uyarı!',
			content: content,
			theme: 'light',
			buttons: {
				Evet: function () {
					sendConkyTask(params);
					scheduledParam = null;
				},
				Hayır: function () {
				}
			}
		});
	}else {
		$.notify("Lütfen Conky mesajı veya Conky mesajı kaldır seçerek Çalıştır butonuna tıklayınız.", "warn");
	}
});

$('#closePage-'+ selectedPluginTask.page).click(function(e){
	connection.deleteHandler(ref);
	scheduledParam = null;
});