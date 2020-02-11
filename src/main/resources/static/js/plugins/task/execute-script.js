/**
 * Task is execute script
 * This task allows registered scripts to run on the agent
 * Tuncay ÇOLAK
 * tuncay.colak@tubitak.gov.tr
 * 
 * http://www.liderahenk.org/
 * 
 */

var table;
var scriptFileList = [];

if (ref) {
	connection.deleteHandler(ref);
}
var ref=connection.addHandler(executeScriptListener, null, 'message', null, null,  null);
$("#entrySize").html(selectedEntries.length);
var dnlist = []
for (var i = 0; i < selectedEntries.length; i++) {
	dnlist.push(selectedEntries[i].distinguishedName);
}
selectedPluginTask.dnList=dnlist;
selectedPluginTask.entryList=selectedEntries;
selectedPluginTask.dnType="AHENK";

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
		}else if (scriptType == 0) {
			$("#scriptContent").val("");
			$("#scriptParameters").val("");
		}
	}
});

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
	selectedPluginTask.commandId = "EXECUTE_SCRIPT";  		
	selectedPluginTask.parameterMap={
			"SCRIPT_FILE_ID": $('#scriptSelectBox').find('option:selected').attr('id'),
			"SCRIPT_TYPE": $('#scriptSelectBox :selected').val(),
			"SCRIPT_CONTENTS": $("#scriptContent").val(),
			"SCRIPT_PARAMS": $("#scriptParameters").val(),
	};
	var params = JSON.stringify(selectedPluginTask);

//	if selected script. Default select box "Betik seçiniz... value = 0"
	if ($('#scriptSelectBox :selected').val() != 0) {
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
				console.log("rest response")
				console.log(res)
				if(res.status=="OK"){		    		
					$("#plugin-result").html("Görev başarı ile gönderildi.. Lütfen bekleyiniz...");
				}   	
			},
			error: function(result) {
				$.notify(result, "error");
			}
		});
	}else {
		$.notify("Lütfen betik seçiniz, daha sonra Çalıştır butonuna tıklayınız.", "warn");
	}
});

$('#sendTaskCron-'+ selectedPluginTask.page).click(function(e){
//	if selected script. Default select box "Betik seçiniz... value = 0"
	if ($('#scriptSelectBox :selected').val() != 0) {
		alert("Zamanlı Çalıştır");
	}
	else {
		$.notify("Lütfen betik seçiniz, daha sonra Zamanlı Çalıştır butonuna tıklayınız..", "warn");
	}
});

$('#closePage-'+ selectedPluginTask.page).click(function(e){
	connection.deleteHandler(ref);	
});