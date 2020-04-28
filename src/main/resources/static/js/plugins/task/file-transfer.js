/**
 * file-transfer
 * File transfer to agents
 * Tuncay ÇOLAK
 * tuncay.colak@tubitak.gov.tr
 * 
 * http://www.liderahenk.org/
 * 
 */

if (ref_file_transfer) {
	connection.deleteHandler(ref_file_transfer);
}
var scheduledParamFileTransfer = null;
var scheduledModalFileTransferOpened = false;
var dnlist = [];
var pluginTask_FileTransfer = null;
var fileName = null;
var encodedFile = null;
var ref_file_transfer = connection.addHandler(fileTransferListener, null, 'message', null, null,  null);

if(selectedEntries){
	for (var i = 0; i < selectedEntries.length; i++) {
		dnlist.push(selectedEntries[i].distinguishedName);
	}
}

for (var n = 0; n < pluginTaskList.length; n++) {
	var pluginTask=pluginTaskList[n];
	if (pluginTask.page == 'file-transfer') {
		pluginTask_FileTransfer = pluginTask;
	}
}

setUserPermisson(true);
setGroupPermisson(true);
setOtherPermisson(true);

function sendFileTransferTask(params) {
	var message = "Görev başarı ile gönderildi.. Lütfen bekleyiniz...";
	if (scheduledParamFileTransfer != null) {
		message = "Zamanlanmış görev başarı ile gönderildi. Zamanlanmış görev parametreleri:  "+ scheduledParamFileTransfer;
	}

	$.ajax({
		type: "POST",
		url: "/file_transfer/task/execute",
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
				$("#plugin-result-file-transfer").html(message.bold());
			}   	
		},
		error: function(result) {
			$.notify(result, "error");
		}
	});
}

function fileTransferListener(msg) {
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
			if (xmppResponse.commandClsId == "MULTIPLE-FILE-TRANSFER") {
				var arrg = JSON.parse(xmppResponse.result.responseDataStr);
				if (xmppResponse.result.responseCode == "TASK_PROCESSED") {
					$.notify(responseMessage, "success");
					$("#plugin-result-file-transfer").html("");
				}
				else {
					$.notify(responseMessage, "error");
					$("#plugin-result-file-transfer").html(("HATA: " + responseMessage).fontcolor("red"));
				}
			}
		}
	}
	// we must return true to keep the handler alive. returning false would remove it after it finishes.
	return true;
}

function setUserPermisson(disabled) {
	$('.user-file-permissions').prop('disabled', disabled);
	if (disabled == true) {
		$('.user-file-permissions').prop('checked', false);
		$('#userOwnerOfFile').val("");
	}
}

function setGroupPermisson(disabled) {
	$('.group-file-permissions').prop('disabled', disabled);
	if (disabled == true) {
		$('.group-file-permissions').prop('checked', false);
		$('#groupOwnerOfFile').val("");
	}
}

function setOtherPermisson(disabled) {
	$('.other-file-permissions').prop('disabled', disabled);
	if (disabled == true) {
		$('.other-file-permissions').prop('checked', false);
	}
}

$("#userPermissionCb").on('change', function() {
	if ($(this).is(':checked')) {
		setUserPermisson(false);
	} else {
		setUserPermisson(true);
	}
});

$("#groupPermissionCb").on('change', function() {
	if ($(this).is(':checked')) {
		setGroupPermisson(false);
	} else {
		setGroupPermisson(true);
	}
});

$("#otherPermissionCb").on('change', function() {
	if ($(this).is(':checked')) {
		setOtherPermisson(false);
	} else {
		setOtherPermisson(true);
	}
});

$('#sendTaskCronFileTransfer').click(function(e){
	$('#scheduledTasksModal').modal('toggle');
	scheduledParam = null;
	scheduledModalFileTransferOpened = true;
});

$("#scheduledTasksModal").on('hidden.bs.modal', function(){
	if (scheduledModalFileTransferOpened) {
		scheduledParamFileTransfer = scheduledParam;
	}
	scheduledModalFileTransferOpened = false;
	defaultScheduleSelection();
});

$("#selectedFileTransfer").on('change', function() {
	var fileSize = ($(this)[0].files[0].size / 1048576).toFixed(2);
	if (fileSize <= 20) {
		fileName = $(this).val().split("\\").pop();
		$(this).siblings(".custom-file-label").addClass("selected").html(fileName);

		var reader = new FileReader();
		var selectedFile = this.files[0];
		reader.onload = function () {
			var comma = this.result.indexOf(',');
			encodedFile = this.result.substr(comma + 1);
		}
		reader.readAsDataURL(selectedFile);
	} else {
		$.notify("Dosya boyutu 20 MB'tan fazla olamaz.", "warn");
	}
});

$('#sendTaskFileTransfer').click(function(e){
	if (selectedEntries.length == 0 ) {
		$.notify("Lütfen istemci seçiniz.", "error");
		return;
	}
	var parameterMap = {};
	if ($('#userPermissionCb').is(':checked')) {
		parameterMap.editUserPermissions = true;
		parameterMap.readUser = $('#userReadPerCb').is(":checked");
		parameterMap.writeUser = $('#userWritePerCb').is(":checked");
		parameterMap.executeUser = $('#userExecutePerCb').is(":checked");
		parameterMap.ownerUser = $('#userOwnerOfFile').val();
	}

	if ($('#groupPermissionCb').is(':checked')) {
		parameterMap.editGroupPermissions = true;
		parameterMap.readGroup = $('#groupReadPerCb').is(":checked");
		parameterMap.writeGroup = $('#groupWritePerCb').is(":checked");
		parameterMap.executeGroup = $('#groupExecutePerCb').is(":checked");
		parameterMap.ownerGroup = $('#groupOwnerOfFile').val();
	}

	if ($('#otherPermissionCb').is(':checked')) {
		parameterMap.editOtherPermissions = true;
		parameterMap.readOther = $('#otherReadPerCb').is(":checked");
		parameterMap.writeOther = $('#otherWritePerCb').is(":checked");
		parameterMap.executeOther = $('#otherExecutePerCb').is(":checked");
	}

	var localPath = $('#remotePath').val();
	if (!localPath.endsWith("/")) {
		localPath = localPath + "/";
	}

	parameterMap.fileName = fileName;
	parameterMap.localPath = localPath;
	parameterMap.encodedFile = encodedFile;

	if (pluginTask_FileTransfer) {
		pluginTask_FileTransfer.dnList=dnlist;
		pluginTask_FileTransfer.entryList=selectedEntries;
		pluginTask_FileTransfer.dnType="AHENK";
		pluginTask_FileTransfer.parameterMap = parameterMap;
		pluginTask_FileTransfer.cronExpression = scheduledParamFileTransfer;
		pluginTask_FileTransfer.commandId = "MULTIPLE-FILE-TRANSFER";  		
		var params = JSON.stringify(pluginTask_FileTransfer);
	}

	if (fileName != null && remotePath != "") {
		var content = "Görev Gönderilecek, emin misiniz?";
		if (scheduledParamFileTransfer != null) {
			content = "Zamanlanmış görev gönderilecek, emin misiniz?";
		}
		$.confirm({
			title: 'Uyarı!',
			content: content,
			theme: 'light',
			buttons: {
				Evet: function () {
					sendFileTransferTask(params);
					scheduledParamFileTransfer = null;
				},
				Hayır: function () {
				}
			}
		});
	}else {
		$.notify("Lütfen dosya seçiniz ve hedef dizin belirtiniz.", "warn");
	}
});

