/**
 * Task is get_services and service_list
 * This task get services from agents. This task used to start/stop and auto start selected services from agent
 * Tuncay ÇOLAK
 * tuncay.colak@tubitak.gov.tr
 * 
 * http://www.liderahenk.org/
 * 
 */

if (ref_service_list) {
	connection.deleteHandler(ref_service_list);
}
var serviceRequestParameters = [];
var dnlist = [];
var tableServiceList = null;
var scheduledParamServiceList = null;
var scheduledModalServiceListOpened = false;
var pluginTask_ServiceList = null;
var ref_service_list=connection.addHandler(getServiceListener, null, 'message', null, null,  null);
$('#sendTaskServiceManagement').hide();
$('#serviceListExportPdf').hide();
$('#serviceListBody').html('<tr id="serviceListBodyEmptyInfo"><td colspan="100%" class="text-center">Servis Bulunamadı.</td></tr>');

if(selectedEntries){
	for (var i = 0; i < selectedEntries.length; i++) {
		dnlist.push(selectedEntries[i].distinguishedName);
	}
}

for (var n = 0; n < pluginTaskList.length; n++) {
	var pluginTask=pluginTaskList[n];
	if (pluginTask.page == 'service-list') {
		pluginTask_ServiceList=pluginTask;
	}
}

//get services from agent
$('#sendTaskGetServiceList').click(function(e){
	if (selectedEntries.length == 0 ) {
		$.notify("Lütfen istemci seçiniz.", "error");
		return;
	}
	var content = "Görev Gönderilecek, emin misiniz?";
	if (scheduledParamServiceList != null) {
		content = "Zamanlanmış görev gönderilecek, emin misiniz?";
	}
	$.confirm({
		title: 'Uyarı!',
		content: content,
		theme: 'light',
		buttons: {
			Evet: function () {
				if (tableServiceList) {
					tableServiceList.clear().draw();
					tableServiceList.destroy();
				}
				getServices();
				scheduledParamServiceList = null;
			},
			Hayır: function () {
			}
		}
	});
});

function getServices() {
	if (pluginTask_ServiceList) {
		pluginTask_ServiceList.dnList=dnlist;
		pluginTask_ServiceList.entryList=selectedEntries;
		pluginTask_ServiceList.dnType="AHENK";
		pluginTask_ServiceList.commandId = "GET_SERVICES";
		pluginTask_ServiceList.parameterMap={};
		pluginTask_ServiceList.cronExpression = scheduledParamServiceList;
		var params = JSON.stringify(pluginTask_ServiceList);
		serviceManagementTask(params);
	}
}

function serviceManagementTask(params){
	var message = "Görev başarı ile gönderildi.. Lütfen bekleyiniz...";
	if (scheduledParamServiceList != null) {
		message = "Zamanlanmış görev başarı ile gönderildi. Zamanlanmış görev parametreleri:  "+ scheduledParamServiceList;
	}
	progress("divServiceList","progressServiceList",'show')
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
				$("#plugin-result-service-list").html(message.bold());
			}   	
		},
		error: function(result) {
			$.notify(result, "error");
		}
	});
}

function getServiceListener(msg) {
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
			progress("divServiceList","progressServiceList",'hide')
			if (xmppResponse.commandClsId == "GET_SERVICES") {
				var arrg = JSON.parse(xmppResponse.result.responseDataStr);
				if (xmppResponse.result.responseCode == "TASK_PROCESSED") {
					if(xmppResponse.result.contentType =="TEXT_PLAIN"){
						var params = {
								"id" : xmppResponse.result.id
						};

						$.ajax({
							type: 'POST', 
							url: "/command/commandexecutionresult",
							dataType: 'json',
							data: params,
							success: function(data) {
								if(data != null) {
									if(data.responseDataStr != null) {
										data = data.responseDataStr;
										var arrg = JSON.parse(data);
										var services = arrg["service_list"];
										for (var i = 0; i < services.length; i++) {
											var serviceName = services[i]["serviceName"];
											var serviceStatus = services[i]["serviceStatus"];
											var startAuto = services[i]["startAuto"];

											if (serviceStatus == "ACTIVE") {
												serviceStatus = "AKTİF";
											}else {
												serviceStatus = "PASİF";
											}

											if (startAuto == "ACTIVE") {
												startAuto = "AKTİF";
											}else {
												startAuto = "PASİF";
											}
											var sbSerName = serviceName;

											if (sbSerName.includes("@")) {
												sbSerName = sbSerName.replace("@", "");
											}
											if (sbSerName.includes(".")) {
												sbSerName = sbSerName.replace(".", "");
											}

											var newRow = $("<tr>");
											var html = '<td class="text-center"><span class="cb-package-name">'
												+ '<input type="checkbox" onclick="serviceChecked()" name="service_name" value="' +  serviceName +'">'
												+ '<label for="checkbox1"></label>'
												+ '</span>'
												+ '</td>';
											html += '<td>'+ serviceName +'</td>';
											html += '<td>'+ serviceStatus +'</td>';
											html += '<td><select disabled class="custom-select" id="status_'+ sbSerName +'" name="' +  serviceName +'">'
											+ '<option value="null" selected>İşlem Seç</option>'
											+ '<option value="START">Başlat</option>'
											+ '<option value="STOP">Durdur</option>'
											+ '</select>';
											+ '</td>';
											html += '<td>'+ startAuto +'</td>';
											html += '<td><select disabled class="custom-select" id="auto_start_'+ sbSerName +'" name="' +  serviceName +'">'
											+ '<option value="null" selected>İşlem Seç</option>'
											+ '<option value="START">Aktif</option>'
											+ '<option value="STOP">Pasif</option>'
											+ '</select>'
											+ '</td>';
											newRow.append(html);
											$("#servicesListTableId").append(newRow);
										}
										createServiceListTable();
										$("#plugin-result-service-list").html("");
										$.notify(responseMessage, "success");
										$('#sendTaskServiceManagement').show();
										$('#serviceListExportPdf').show();
										$("#serviceListHelp").html("İşlem yapmak (Başlat/Durdur/Aktif/Pasif) istediğiniz servis/leri seçerek Çalıştır butonuna tıklayınız. Servis listesini PDF olarak dışa aktarmak için PDF'e aktar butonuna tıklayınız.");
									}
								}else {
									createServiceListTable();
								}
							},
							error: function(result) {
								$.notify(result, "error");
								$('#serviceListBody').html('<tr id="serviceListBodyEmptyInfo"><td colspan="100%" class="text-center">Servis Bulunamadı.</td></tr>');
							}
						});
					}
				}
				else {
					$.notify(responseMessage, "error");
					$("#plugin-result-service-list").html(("HATA: " + responseMessage).fontcolor("red"));
				}
			}
			if (xmppResponse.commandClsId == "SERVICE_LIST") {
				if (xmppResponse.result.responseCode == "TASK_PROCESSED") {
					$("#plugin-result-service-list").html("");
					$.notify(responseMessage, "success");
					tableServiceList.clear().draw();
					tableServiceList.destroy();
					getServices();
				}
				if (xmppResponse.result.responseCode == "TASK_ERROR") {
					$.notify(responseMessage, "error");
					$("#plugin-result-service-list").html(("HATA: " + responseMessage).fontcolor("red"));
				}
			}
		}
	}
	// we must return true to keep the handler alive. returning false would remove it after it finishes.
	return true;
}

function createServiceListTable() {
	
	if ($("#serviceListBodyEmptyInfo").length > 0) {
		$("#serviceListBodyEmptyInfo").remove();
	}
	tableServiceList = $('#servicesListTableId').DataTable( {
		"scrollY": "570px",
		"paging": false,
		"scrollCollapse": true,
		"oLanguage": {
			"sLengthMenu": 'Görüntüle <select>'+
			'<option value="20">20</option>'+
			'<option value="30">30</option>'+
			'<option value="40">40</option>'+
			'<option value="50">50</option>'+
			'<option value="-1">Tümü</option>'+
			'</select> kayıtları',
			"sSearch": "Servis Ara:",
			"sInfo": "Toplam Servis sayısı: _TOTAL_",
			"sInfoEmpty": "Gösterilen kayıt sayısı: 0",
			"sZeroRecords" : "Servis bulunamadı",
			"sInfoFiltered": " - _MAX_ kayıt arasından",
		},
	} );
}

function serviceChecked() {
	$('input:checkbox[name=service_name]').each(function() {
		if($(this).is(':checked')){
			sName = $(this).val();
			var sbSerName = sName;

			if (sbSerName.includes("@")) {
				sbSerName = sbSerName.replace("@", "");
			}
			if (sbSerName.includes(".")) {
				sbSerName = sbSerName.replace(".", "");
			}
			if (sName != "ahenk.service") {
				$("#status_"+sbSerName).prop('disabled', false);
				$("#auto_start_"+sbSerName).prop('disabled', false);
			}

		}else if(!$(this).is(':checked')){
			sName = $(this).val();
			var sbSerName = sName;

			if (sbSerName.includes("@")) {
				sbSerName = sbSerName.replace("@", "");
			}
			if (sbSerName.includes(".")) {
				sbSerName = sbSerName.replace(".", "");
			}
			$("#status_"+sbSerName).prop('disabled', true);
			$("#auto_start_"+sbSerName).prop('disabled', true);
		}
	});
}

$('#serviceListExportPdf').click(function(e){
	if (tableServiceList) {
		alert("export pdf");
	}

});

$('#sendTaskCronServiceManagement').click(function(e){
	$('#scheduledTasksModal').modal('toggle');
	scheduledParam = null;
	scheduledModalServiceListOpened = true;
});

$("#scheduledTasksModal").on('hidden.bs.modal', function(){
	if (scheduledModalServiceListOpened) {
		scheduledParamServiceList = scheduledParam;
	}
	scheduledModalServiceListOpened = false;
	defaultScheduleSelection();
});

//service management task
$('#sendTaskServiceManagement').click(function(e){
	if (selectedEntries.length == 0 ) {
		$.notify("Lütfen istemci seçiniz.", "error");
		return;
	}
	if($('input:checkbox[name=service_name]').is(':checked')) {
		var ServiceListItem = [];
		$('input:checkbox[name=service_name]').each(function() {
			var serviceName = $(this).val();
			var pVersion = $(this).attr('id');
			var sbSerName = serviceName;
			if (sbSerName.includes("@")) {
				sbSerName = sbSerName.replace("@", "");
			}
			if (sbSerName.includes(".")) {
				sbSerName = sbSerName.replace(".", "");
			}

			if($(this).is(':checked')) {
				serviceStatus = $("#status_"+ sbSerName +" option:selected").val();
				startAuto = $("#auto_start_"+ sbSerName +" option:selected").val();
				ServiceListItem = {
						"serviceName": serviceName,
						"serviceStatus": serviceStatus,
						"startAuto": startAuto,
						"desiredServciceStatus": null,
						"desiredAutoStart": null,
						"agentDn": null,
						"createDate": null,
						"deleted": false,
						"id": null,
						"isServiceMonitoring": false,
						"modifyDate": null,
						"updated": false
				};
				serviceRequestParameters.push(ServiceListItem);
			}
		});

		if (pluginTask_ServiceList) {
			pluginTask_ServiceList.commandId = "SERVICE_LIST";
			pluginTask_ServiceList.entryList=selectedEntries;
			pluginTask_ServiceList.dnList=dnlist;
			pluginTask_ServiceList.parameterMap={"serviceRequestParameters":serviceRequestParameters};
			pluginTask_ServiceList.dnType="AHENK";
			pluginTask_ServiceList.cronExpression = scheduledParamServiceList;
			var params = JSON.stringify(pluginTask_ServiceList);
		}

		var content = "Görev Gönderilecek, emin misiniz?";
		if (scheduledParamServiceList != null) {
			content = "Zamanlanmış görev gönderilecek, emin misiniz?";
		}
		$.confirm({
			title: 'Uyarı!',
			content: content,
			theme: 'light',
			buttons: {
				Evet: function () {
					serviceManagementTask(params);
					scheduledParamServiceList = null;
				},
				Hayır: function () {
				}
			}
		});
	}
	else {
		$.notify("Lütfen işlem yapmak (Başlat/Durdur/Aktif/Pasif) istediğiniz servis/leri seçerek Çalıştır butonuna tıklayınız.", "warn");
	}
});