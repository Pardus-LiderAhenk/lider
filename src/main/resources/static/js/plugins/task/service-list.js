/**
 * Task is get_services and service_list
 * This task get services from agents. This task used to start/stop and auto start selected services from agent
 * Tuncay ÇOLAK
 * tuncay.colak@tubitak.gov.tr
 * 
 * http://www.liderahenk.org/
 * 
 */


if (ref) {
	connection.deleteHandler(ref);
}
var ref=connection.addHandler(getServiceListener, null, 'message', null, null,  null);
$("#entrySize").html(selectedEntries.length);

var serviceRequestParameters = [];
var dnlist = []
var table;

for (var i = 0; i < selectedEntries.length; i++) {
	dnlist.push(selectedEntries[i].distinguishedName);
}
selectedPluginTask.dnList=dnlist;
selectedPluginTask.entryList=selectedEntries;
selectedPluginTask.dnType="AHENK";

getServices();

function getServices() {
	selectedPluginTask.commandId = "GET_SERVICES";
	selectedPluginTask.parameterMap={};
	var params = JSON.stringify(selectedPluginTask);
	serviceManagementTask(params);
}

function serviceManagementTask(params){

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
}

function getServiceListener(msg) {
	var num;
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
										createTable();
										$("#plugin-result").html("");
										$.notify(responseMessage, "success");
										$("#serviceList-info").html("<small style='color:red;'>İşlem yapmak (Başlat/Durdur/Aktif/Pasif) istediğiniz servis/leri seçerek Çalıştır ya da Zamanlı Çalıştır butonuna tıklayınız.</small>");
									}
								}else {
									createTable();
								}
							},
							error: function(result) {
								$.notify(result, "error");
							}
						});
					}
				}
				else {
					$.notify(responseMessage, "error");
					$("#plugin-result").html(("HATA: " + responseMessage).fontcolor("red"));
				}
			}
			if (xmppResponse.commandClsId == "SERVICE_LIST") {
				if (xmppResponse.result.responseCode == "TASK_PROCESSED") {
					$("#plugin-result").html("");
					$.notify(responseMessage, "success");
					table.clear().draw();
					table.destroy();
					getServices();
				}
				if (xmppResponse.result.responseCode == "TASK_ERROR") {
					$.notify(responseMessage, "error");
					$("#plugin-result").html(("HATA: " + responseMessage).fontcolor("red"));
				}
			}
		}
	}
	// we must return true to keep the handler alive. returning false would remove it after it finishes.
	return true;
}


function createTable() {
	table = $('#servicesListTableId').DataTable( {
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

$('#serviceExportPdf').click(function(e){
	alert("export pdf");
});


$('#sendTask-'+ selectedPluginTask.page).click(function(e){
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
		selectedPluginTask.commandId = "SERVICE_LIST";
		selectedPluginTask.parameterMap={"serviceRequestParameters":serviceRequestParameters};
		var params = JSON.stringify(selectedPluginTask);
		serviceManagementTask(params);
	}
	else {
		$.notify("Lütfen işlem yapmak (Başlat/Durdur/Aktif/Pasif) istediğiniz servis/leri seçerek Çalıştır ya da Zamanlı Çalıştır butonuna tıklayınız.", "warn");
	}
});

$('#sendTaskCron-'+ selectedPluginTask.page).click(function(e){
	if ($('input:checkbox[name=service_name]').is(':checked')) {
		alert("Zamanlı Çalıştır");
	}
	else {
		$.notify("Lütfen işlem yapmak (Başlat/Durdur/Aktif/Pasif) istediğiniz servis/leri seçerek Çalıştır ya da Zamanlı Çalıştır butonuna tıklayınız.", "warn");
	}
});

$('#closePage-'+ selectedPluginTask.page).click(function(e){
	connection.deleteHandler(ref);	
});