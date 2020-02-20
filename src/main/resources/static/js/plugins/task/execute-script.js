/**
 * execute script
 * This task allows registered scripts to run on the agent
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
var table;
var scriptFileList = [];

var ref=connection.addHandler(executeScriptListener, null, 'message', null, null,  null);
$("#entrySize").html(selectedEntries.length);
var dnlist = []
for (var i = 0; i < selectedEntries.length; i++) {
	dnlist.push(selectedEntries[i].distinguishedName);
}
selectedPluginTask.dnList=dnlist;
selectedPluginTask.entryList=selectedEntries;
selectedPluginTask.dnType="AHENK";

//get script file from liderdb
getScriptFile();

function getScriptFile() {
	$.ajax({
		type: 'POST', 
		url: "/script/list",
		dataType: 'json',
		success: function(data) {
			if(data != null && data.length > 0) {
				scriptFileList = data;
				$.notify("Betikler başarıyla listelendi.", "success");
				for (var i = 0; i < data.length; i++) {
					$('#scriptSelectBox').append($('<option>', {
						id: data[i]["id"],
						text: data[i]["label"]+ "  -  "+ data[i]["scriptType"].toLowerCase(),
						value : data[i]["scriptType"]
					}));
				}
			}else {
				$('#scriptSelectBox').append($('<option>', {
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

$('#scriptSelectBox').change(function(){ 
	var scriptType = $(this).val();
	var scriptFileId = $(this).find('option:selected').attr('id')
	for (var i = 0; i < scriptFileList.length; i++) {
		if (scriptFileId == scriptFileList[i]["id"]) {
			$("#scriptContent").val(scriptFileList[i]["contents"]);
			$("#scriptParameters").val("");
		}else if (scriptType == "NA") {
			$("#scriptContent").val("");
			$("#scriptParameters").val("");
		}
	}
});

function sendExecuteScriptTask(params) {
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

function executeScriptListener(msg) {
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
			if (xmppResponse.commandClsId == "EXECUTE_SCRIPT") {
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

$('#sendTask-'+ selectedPluginTask.page).click(function(e){
	selectedPluginTask.parameterMap={
			"SCRIPT_FILE_ID": $('#scriptSelectBox').find('option:selected').attr('id'),
			"SCRIPT_TYPE": $('#scriptSelectBox :selected').val(),
			"SCRIPT_CONTENTS": $("#scriptContent").val(),
			"SCRIPT_PARAMS": $("#scriptParameters").val()
	};
	selectedPluginTask.cronExpression = scheduledParam;
	selectedPluginTask.commandId = "EXECUTE_SCRIPT";  		
	var params = JSON.stringify(selectedPluginTask);

//	if selected script. Default select box "Betik seçiniz... value = NA"
	if ($('#scriptSelectBox :selected').val() != "NA") {
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
					sendExecuteScriptTask(params);
					scheduledParam = null;
				},
				Hayır: function () {
				}
			}
		});
	}else {
		$.notify("Lütfen betik seçiniz, daha sonra Çalıştır butonuna tıklayınız.", "warn");
	}
});

$('#closePage-'+ selectedPluginTask.page).click(function(e){
	connection.deleteHandler(ref);
	scheduledParam = null;
});