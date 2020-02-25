/**
 * file-management
 * The path returns the contents of the entered file. Edited file content of a new file or from the agent
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

var ref=connection.addHandler(fileManagementListener, null, 'message', null, null,  null);
$("#entrySize").html(selectedEntries.length);
var dnlist = []
for (var i = 0; i < selectedEntries.length; i++) {
	dnlist.push(selectedEntries[i].distinguishedName);
}
selectedPluginTask.dnList=dnlist;
selectedPluginTask.entryList=selectedEntries;
selectedPluginTask.dnType="AHENK";

//get file content from agent
$('#getFileBtn').click(function(e){
	var filePath = $("#filePath").val();
	if (filePath != "") {

		selectedPluginTask.parameterMap={
				"file-path": filePath
		};
		selectedPluginTask.cronExpression = scheduledParam;
		selectedPluginTask.commandId = "GET_FILE_CONTENT";  		
		var params = JSON.stringify(selectedPluginTask);
		sendFileManagementTask(params);
	}else {
		$.notify("Lütfen dosya yolunu giriniz, daha sonra Ara butonuna tıklayınız.", "warn");
	}
});

function sendFileManagementTask(params) {
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
				scheduledParam = null;
			},
			Hayır: function () {
			}
		}
	});
}

function fileManagementListener(msg) {
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
			if (xmppResponse.commandClsId == "GET_FILE_CONTENT") {
				var arrg = JSON.parse(xmppResponse.result.responseDataStr);
				if (xmppResponse.result.responseCode == "TASK_PROCESSED") {
					$.notify(responseMessage, "success");
					$("#plugin-result").html("");
					$("#fileContent").val(arrg.file_content);
				}
				else {
					$.notify(responseMessage, "error");
					$("#plugin-result").html(("HATA: " + responseMessage).fontcolor("red"));
				}
			}else if (xmppResponse.commandClsId == "WRITE_TO_FILE") {
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

//edited file content
$('#sendTask-'+ selectedPluginTask.page).click(function(e){
	var filePath = $("#filePath").val();
	if (filePath != "") {
		selectedPluginTask.parameterMap={
				"file-path": filePath,
				"file-content":$("#fileContent").val()
		};
		selectedPluginTask.cronExpression = scheduledParam;
		selectedPluginTask.commandId = "WRITE_TO_FILE";  		
		var params = JSON.stringify(selectedPluginTask);
		sendFileManagementTask(params);
	}else {
		$.notify("Lütfen dosya yolunu giriniz, daha sonra Çalıştır butonuna tıklayınız.", "warn");
	}
});

$('#closePage-'+ selectedPluginTask.page).click(function(e){
	connection.deleteHandler(ref);
	scheduledParam = null;
});