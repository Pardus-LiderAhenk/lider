/**
 *  device-management
 *  This page usb, mouse, keyboard, printer and webcam devices management. 
 *  Tuncay ÇOLAK
 *  tuncay.colak@tubitak.gov.tr

 *  http://www.liderahenk.org/ 
 */

if (ref_usb_management) {
	connection.deleteHandler(ref_usb_management);
}

var scheduledParamUsbManagement = null;
var scheduledModalUsbManageOpened = false;
var pluginTask_UsbManagement = null;
var dnlist=[];
var parameterMap = {};
var ref_usb_management=connection.addHandler(usbManagementListener, null, 'message', null, null,  null);

if(selectedEntries){
	for (var i = 0; i < selectedEntries.length; i++) {
		dnlist.push(selectedEntries[i].distinguishedName);
	}
}
for (var n = 0; n < pluginTaskList.length; n++) {
	var pluginTask=pluginTaskList[n];
	if (pluginTask.page == 'usb-management') {
		pluginTask_UsbManagement=pluginTask;
	}
}

function sendUsbManagement(params) {
	var content = "Görev Gönderilecek, emin misiniz?";
	if (scheduledParamUsbManagement != null) {
		content = "Zamanlanmış görev gönderilecek, emin misiniz?";
	}
	$.confirm({
		title: 'Uyarı!',
		content: content,
		theme: 'light',
		buttons: {
			Evet: function () {
				var message = "Görev başarı ile gönderildi.. Lütfen bekleyiniz...";
				if (scheduledParamUsbManagement != null) {
					message = "Zamanlanmış görev başarı ile gönderildi. Zamanlanmış görev parametreleri:  "+ scheduledParamUsbManagement;
				}
				if (selectedEntries[0].type == "AHENK" && selectedRow.online == true && scheduledParamUsbManagement == null) {
					progress("divUsbManagement","progressUsbManagement",'show');
				}
				if (selectedEntries[0].type == "AHENK" && selectedRow.online == false) {
					$.notify("Görev başarı ile gönderildi, istemci çevrimiçi olduğunda uygulanacaktır.", "success");
				}
				if (selectedEntries[0].type == "GROUP") {
					var groupNotify = "Görev istemci grubuna başarı ile gönderildi.";
					if (scheduledParamUsbManagement != null) {
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
								$("#plugin-result-usb-management").html(message.bold());	
							}
						}   	
						/* $('#closePage').click(); */
					},
					error: function(result) {
						$.notify(result, "error");
					}
				});
				scheduledParamUsbManagement = null;
			},
			Hayır: function () {
			}
		}
	});
}

function usbManagementListener(msg) {
	var to = msg.getAttribute('to');
	var from = msg.getAttribute('from');
	var type = msg.getAttribute('type');
	var elems = msg.getElementsByTagName('body');

	if (type == "chat" && elems.length > 0) {
		var body = elems[0];
		var data=Strophe.xmlunescape(Strophe.getText(body));
		var xmppResponse=JSON.parse(data);
		if(xmppResponse.commandClsId == "MANAGE-USB"){
			if (selectedEntries[0].type == "AHENK") {
				progress("divUsbManagement","progressUsbManagement",'hide');
				var parameterMap = {};
				if (xmppResponse.result.responseCode != "TASK_ERROR") {
					$("#plugin-result-usb-management").html("");
					$.notify(xmppResponse.result.responseMessage, "success");
				} else {
//					$("#plugin-result-usb-management").html(xmppResponse.result.responseMessage);
					$.notify(xmppResponse.result.responseMessage, "error");
				}
			}
		}						 
	}
	// we must return true to keep the handler alive. returning false would remove it after it finishes.
	return true;
}

$('#usbManageCb').click(function(e){
	if($(this).is(':checked')){
		$("#usbSelectBox").prop("disabled", false);
	}
	else{
		$("#usbSelectBox").prop("disabled", true);
	}
});

$('#printerManageCb').click(function(e){
	if($(this).is(':checked')){
		$("#printerSelectBox").prop("disabled", false);
	}
	else{
		$("#printerSelectBox").prop("disabled", true);
	}
});

$('#webCamManageCb').click(function(e){
	if($(this).is(':checked')){
		$("#webCamSelectBox").prop("disabled", false);
	}
	else{
		$("#webCamSelectBox").prop("disabled", true);
	}
});

$('#mouseKeyboardManageCb').click(function(e){
	if($(this).is(':checked')){
		$("#mouseKeyboardSelectBox").prop("disabled", false);
	}
	else{
		$("#mouseKeyboardSelectBox").prop("disabled", true);
	}
});

$('#sendTaskCronUsbManagement').click(function(e){
	$('#scheduledTasksModal').modal('toggle');
	scheduledParam = null;
	scheduledModalUsbManageOpened = true;
});

$("#scheduledTasksModal").on('hidden.bs.modal', function(){
	if (scheduledModalUsbManageOpened) {
		scheduledParamUsbManagement = scheduledParam;
	}
	scheduledModalUsbManageOpened = false;
	defaultScheduleSelection();
});

$('#sendTaskUsbManagement').click(function(e){
	if (selectedEntries.length == 0 ) {
		$.notify("Lütfen istemci seçiniz.", "error");
		return;
	}

	if($('#usbManageCb').is(':checked')){
		parameterMap.storage = $('#usbSelectBox').val();
	}
	if($('#webCamManageCb').is(':checked')){
		parameterMap.webcam = $('#webCamSelectBox').val();
	}
	if($('#printerManageCb').is(':checked')){
		parameterMap.printer = $('#printerSelectBox').val();
	}
	if($('#mouseKeyboardManageCb').is(':checked')){
		parameterMap.mouseKeyboard = $('#mouseKeyboardSelectBox').val();
	}

	if (Object.keys(parameterMap) != 0) {
		if(pluginTask_UsbManagement){
			pluginTask_UsbManagement.parameterMap = parameterMap;
			pluginTask_UsbManagement.dnList=dnlist;
			pluginTask_UsbManagement.entryList=selectedEntries;
			pluginTask_UsbManagement.dnType="AHENK";
			pluginTask_UsbManagement.cronExpression = scheduledParamUsbManagement;
			pluginTask_UsbManagement.commandId = "MANAGE-USB";
			var params = JSON.stringify(pluginTask_UsbManagement);
		}

		sendUsbManagement(params);
	} else {
		$.notify("Lütfen izinlerini düzenlemek istediğiniz aygıt/ları seçiniz.", "warn");
	}
});