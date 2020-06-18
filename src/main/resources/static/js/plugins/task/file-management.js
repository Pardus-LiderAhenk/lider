/**
 * file-management
 * The path returns the contents of the entered file. Edited file content of a new file or from the agent
 * Tuncay ÇOLAK
 * tuncay.colak@tubitak.gov.tr
 * 
 * http://www.liderahenk.org/
 * 
 */

if (ref_file_management) {
	connection.deleteHandler(ref_file_management);
}
var scheduledParamFileMan = null;
var scheduledModalFileManOpened = false;
var pluginTask_FileManagement = null;
var dnlist = [];
var ref_file_management=connection.addHandler(fileManagementListener, null, 'message', null, null,  null);

for (var n = 0; n < pluginTaskList.length; n++) {
	var pluginTask=pluginTaskList[n];
	if(pluginTask.page == 'file-management')
	{
		pluginTask_FileManagement = pluginTask;
	}
}

if (selectedEntries) {
	for (var i = 0; i < selectedEntries.length; i++) {
		dnlist.push(selectedEntries[i].distinguishedName);
	}
}

//get file content from agent
$('#getFileBtn').click(function(e){
	if (selectedEntries.length == 0 ) {
		$.notify("Lütfen istemci seçiniz.", "error");
		return;
	}
	var filePath = $("#filePath").val();
	if (filePath != "") {

		if (pluginTask_FileManagement) {
			pluginTask_FileManagement.parameterMap={
					"file-path": filePath
			};
			pluginTask_FileManagement.dnList=dnlist;
			pluginTask_FileManagement.entryList=selectedEntries;
			pluginTask_FileManagement.dnType="AHENK";
			pluginTask_FileManagement.cronExpression = scheduledParamFileMan;
			pluginTask_FileManagement.commandId = "GET_FILE_CONTENT";  		
			var params = JSON.stringify(pluginTask_FileManagement);
		}
		sendFileManagementTask(params);
	}else {
		$.notify("Lütfen dosya yolunu giriniz, daha sonra Dosya Ara butonuna tıklayınız.", "warn");
	}
});

function sendFileManagementTask(params) {
	var content = "Görev Gönderilecek, emin misiniz?";
	if (scheduledParamFileMan != null) {
		content = "Zamanlanmış görev gönderilecek, emin misiniz?";
	}
	$.confirm({
		title: 'Uyarı!',
		content: content,
		theme: 'light',
		buttons: {
			Evet: function () {
				progress("fileManagementContent","waitFileManagement",'show')
				var message = "Görev başarı ile gönderildi.. Lütfen bekleyiniz...";
				if (scheduledParamFileMan != null) {
					message = "Zamanlanmış görev başarı ile gönderildi. Zamanlanmış görev parametreleri:  "+ scheduledParamFileMan;
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
							$("#plugin-result-file-management").html(message.bold());
						}   	
					},
					error: function(result) {
						$.notify(result, "error");
					}
				});
				scheduledParamFileMan = null;
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
			progress("fileManagementContent","waitFileManagement",'hide')
			if (xmppResponse.commandClsId == "GET_FILE_CONTENT") {
				var arrg = JSON.parse(xmppResponse.result.responseDataStr);
				if (xmppResponse.result.responseCode == "TASK_PROCESSED") {
					$.notify(responseMessage, "success");
					$("#plugin-result-file-management").html("");
					$("#fileContent").val(arrg.file_content);
				}
				else {
					$.notify(responseMessage, "error");
					$("#plugin-result-file-management").html(("HATA: " + responseMessage).fontcolor("red"));
				}
			}else if (xmppResponse.commandClsId == "WRITE_TO_FILE") {
				if (xmppResponse.result.responseCode == "TASK_PROCESSED") {
					$.notify(responseMessage, "success");
					$("#plugin-result-file-management").html("");
				}
				else {
					$.notify(responseMessage, "error");
					$("#plugin-result-file-management").html(("HATA: " + responseMessage).fontcolor("red"));
				}
			}
		}
	}
	// we must return true to keep the handler alive. returning false would remove it after it finishes.
	return true;
}

$('#sendTaskCronFileManagement').click(function(e){
	$('#scheduledTasksModal').modal('toggle');
	scheduledParam = null;
	scheduledModalFileManOpened = true;
});

$("#scheduledTasksModal").on('hidden.bs.modal', function(){
	if (scheduledModalFileManOpened) {
		scheduledParamFileMan = scheduledParam;
	}
	scheduledModalFileManOpened = false;
	defaultScheduleSelection();
});

//edited file content
$('#sendTaskFileManagement').click(function(e){
	if (selectedEntries.length == 0 ) {
		$.notify("Lütfen istemci seçiniz.", "error");
		return;
	}
	var filePath = $("#filePath").val();
	var fileContent = $("#fileContent").val();
	var fileContentSize = (fileContent.length / 1024).toFixed(2);
	
	if(fileContent ==""){
		$.notify("Dosya içeriği boş bırakılamaz ", "warn");
		return;
	}
	
	if (filePath != "") {
		if (fileContentSize <= 5) {

			if (pluginTask_FileManagement) {
				pluginTask_FileManagement.dnList=dnlist;
				pluginTask_FileManagement.entryList=selectedEntries;
				pluginTask_FileManagement.dnType="AHENK";
				pluginTask_FileManagement.parameterMap={
						"file-path": filePath,
						"file-content":$("#fileContent").val()
				};
				pluginTask_FileManagement.cronExpression = scheduledParamFileMan;
				pluginTask_FileManagement.commandId = "WRITE_TO_FILE";  		
				var params = JSON.stringify(pluginTask_FileManagement);
			}
			sendFileManagementTask(params);
		} else {
			$.notify("Dosya boyutu çok fazla. Dosya boyutu 5K 'dan fazla olamaz. ", "warn");
		}
	}else {
		$.notify("Lütfen dosya yolunu giriniz, daha sonra Kaydet butonuna tıklayınız.", "warn");
	}
});
