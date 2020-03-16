/**
 * execute script
 * This task allows registered scripts to run on the agent
 * Tuncay ÇOLAK
 * tuncay.colak@tubitak.gov.tr
 * 
 * http://www.liderahenk.org/
 * 
 */

if (ref_execute_script) {
	connection.deleteHandler(ref_execute_script);
}
var scheduledParamExeScript = null;
var scheduledModalExeScriptOpened = false;
var table;
var scriptTempList = [];
var dnlist = [];
var pluginTask_ExecuteScript = null;
var ref_execute_script=connection.addHandler(executeScriptListener, null, 'message', null, null,  null);

for (var n = 0; n < pluginTaskList.length; n++) {
	var pluginTask=pluginTaskList[n];
	if (pluginTask.page == 'execute-script') {
		pluginTask_ExecuteScript=pluginTask;
	}
}

if (selectedEntries) {
	for (var i = 0; i < selectedEntries.length; i++) {
		dnlist.push(selectedEntries[i].distinguishedName);
	}
}

//get script templates from liderdb
getScriptTemp();

function getScriptTemp() {
	$.ajax({
		type: 'POST', 
		url: "/script/list",
		dataType: 'json',
		success: function(data) {
			if(data != null && data.length > 0) {
				scriptTempList = data;
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
	var scriptTempId = $(this).find('option:selected').attr('id')
	for (var i = 0; i < scriptTempList.length; i++) {
		if (scriptTempId == scriptTempList[i]["id"]) {
			$("#scriptContent").val(scriptTempList[i]["contents"]);
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
				$("#plugin-result-execute-script").html(message.bold());
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
					$("#plugin-result-execute-script").html("");
				}
				else {
					$.notify(responseMessage, "error");
					$("#plugin-result-execute-script").html(("HATA: " + responseMessage).fontcolor("red"));
				}
			}
		}
	}
	// we must return true to keep the handler alive. returning false would remove it after it finishes.
	return true;
}

$('#sendTaskCron-execute-script').click(function(e){
	$('#scheduledTasksModal').modal('toggle');
	scheduledParam = null;
	scheduledModalExeScriptOpened = true;
});

$("#scheduledTasksModal").on('hidden.bs.modal', function(){
	if (scheduledModalExeScriptOpened) {
		scheduledParamExeScript = scheduledParam;
	}
	scheduledModalExeScriptOpened = false;
	defaultScheduleSelection();
});


$('#sendTask-execute-script').click(function(e){
	if (selectedEntries.length == 0 ) {
		$.notify("Lütfen istemci seçiniz.", "error");
		return;
	}
	if(pluginTask_ExecuteScript){
		pluginTask_ExecuteScript.dnList=dnlist;
		pluginTask_ExecuteScript.entryList=selectedEntries;
		pluginTask_ExecuteScript.dnType="AHENK";
		pluginTask_ExecuteScript.parameterMap={
				"SCRIPT_FILE_ID": $('#scriptSelectBox').find('option:selected').attr('id'),
				"SCRIPT_TYPE": $('#scriptSelectBox :selected').val(),
				"SCRIPT_CONTENTS": $("#scriptContent").val(),
				"SCRIPT_PARAMS": $("#scriptParameters").val()
		};
		pluginTask_ExecuteScript.cronExpression = scheduledParamExeScript;
		pluginTask_ExecuteScript.commandId = "EXECUTE_SCRIPT";  		
		var params = JSON.stringify(pluginTask_ExecuteScript);
	}

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
					scheduledParamExeScript = null;
				},
				Hayır: function () {
				}
			}
		});
	}else {
		$.notify("Lütfen betik seçiniz, daha sonra Çalıştır butonuna tıklayınız.", "warn");
	}
});

