/**
 * Task is application-restriction
 * This task get installed applications from agents. This task used to restricted selected applications from agent
 * Tuncay ÇOLAK
 * tuncay.colak@tubitak.gov.tr
 * 
 * http://www.liderahenk.org/
 * 
 */


if (ref_app_restriction) {
	connection.deleteHandler(ref_app_restriction);
}

var scheduledParamAppRestriction = null;
var scheduledModalAppRestrictionOpened = false;
var applicationList = [];
var isExistAppList = [];
var dnlist = [];
var tableApp = null;
var pluginTask_ApplicationRestriction = null;
var ref_app_restriction=connection.addHandler(getApplicationListener, null, 'message', null, null,  null);
$('#sendTaskRestAppBtn').hide();
$('#applicationsBody').html('<tr id="applicationsBodyEmptyInfo"><td colspan="4" class="text-center">Uygulama Bulunamadı.</td></tr>');

if(selectedEntries){
	for (var i = 0; i < selectedEntries.length; i++) {
		dnlist.push(selectedEntries[i].distinguishedName);
	}
}

for (var n = 0; n < pluginTaskList.length; n++) {
	var pluginTask=pluginTaskList[n];
	if (pluginTask.page == 'application-restriction') {
		pluginTask_ApplicationRestriction=pluginTask;
	}
}

function sendApplicationRestrictionTask(params){
	var message = "Görev başarı ile gönderildi.. Lütfen bekleyiniz...";
	if (scheduledParamAppRestriction != null) {
		message = "Zamanlanmış görev başarı ile gönderildi. Zamanlanmış görev parametreleri:  "+ scheduledParamAppRestriction;
	}
	progress("divApplicationRestriction","progressApplicationRestriction",'show');
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
				$("#plugin-result-app-restriction").html(message.bold());
			}   	
		},
		error: function(result) {
			$.notify(result, "error");
		}
	});
}

function getApplicationListener(msg) {
	var to = msg.getAttribute('to');
	var from = msg.getAttribute('from');
	var type = msg.getAttribute('type');
	var elems = msg.getElementsByTagName('body');

	if (type == "chat" && elems.length > 0) {
		var body = elems[0];
		var data=Strophe.xmlunescape(Strophe.getText(body));
		var xmppResponse=JSON.parse(data);
		var responseMessage = xmppResponse.result.responseMessage;
		var responseDn = xmppResponse.commandExecution.dn;
		var selectedDn = selectedEntries[0]["attributes"].entryDN;
		if(xmppResponse.result.responseCode == "TASK_PROCESSED" || xmppResponse.result.responseCode == "TASK_ERROR") {
			if (responseDn == selectedDn) {
				if (xmppResponse.commandClsId == "INSTALLED_APPLICATIONS") {
					if (xmppResponse.result.responseCode == "TASK_PROCESSED" && xmppResponse.result.contentType =="TEXT_PLAIN") {
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
										progress("divApplicationRestriction","progressApplicationRestriction",'hide');
										var applications = data.responseDataStr.split("\n");
										var parser_applications = [];
										for (var i = 0; i < applications.length; i++) {
											parser_applications.push(applications[i].split(","));
										}
										for (var j = 0; j < parser_applications.length; j++) {

											var app_name = parser_applications[j][1];
											var username = parser_applications[j][2];
											var restriction = parser_applications[j][3];

											var htmlCb = '<td class="text-center"><span class="cb-package-name">'
												+ '<input class="text-center" onclick="applicationChecked(this)" type="checkbox" name="rest_app_name" id="'+ app_name +'" value="' + app_name +'">'
												+ '<label for="checkbox1"></label>'
												+ '</span>'
												+ '</td>';

											if (restriction == 1) {
												restriction = "Evet";
												htmlCb = '<td class="text-center"><span class="cb-package-name">'
													+ '<input class="text-center" type="checkbox" onclick="applicationChecked(this)" name="rest_app_name" checked id="'+ app_name +'" value="' + app_name +'">'
													+ '<label for="checkbox1"></label>'
													+ '</span>'
													+ '</td>';
												isExistAppList.push(app_name);

												applicationInfo = {
														"app_name": app_name,
														"username": "ogrenci",
														"restriction": true
												};
												applicationList.push(applicationInfo);

											}else {
												restriction = "Hayır";
											}
											if (username == null) {
												username = "-";
											}

											var newRow = $("<tr>");
											var html = htmlCb;
											html += '<td>'+ app_name +'</td>';
											html += '<td>'+ restriction +'</td>';
											html += '<td>'+ username +'</td>';
											newRow.append(html);
											$("#applicationsTable").append(newRow);
										}
										var parser_applications = [];
										createApplicationTable();
										$("#plugin-result-app-restriction").html("");
										$.notify(responseMessage, "success");
										$('#sendTaskRestAppBtn').show();
										$('#app-restriction-info').html('Sınırlı Erişim Modunda çalışan uygulamalar seçili olarak listelenmektedir. Sınırlı Erişim Modunu iptal etmek için seçili olanları kaldırarak Çalıştır butonuna tıklayınız. Sınırlı Erişim Modunda çalıştırmak istediğiniz uygulama/ları seçerek Çalıştır butonuna tıklayınız.');
									}
								}else {
									createApplicationTable();
								}
							},
							error: function(result) {
								progress("divApplicationRestriction","progressApplicationRestriction",'hide');
								$.notify(result, "error");
								$("#plugin-result-app-restriction").html(("HATA: " + responseMessage).fontcolor("red"));
								$('#applicationsBody').html('<tr id="applicationsBodyEmptyInfo"><td colspan="4" class="text-center">Uygulama Bulunamadı.</td></tr>');
							}
						});
					}else if (xmppResponse.result.responseCode == "TASK_ERROR") {
						$.notify(responseMessage, "error");
						$("#plugin-result-app-restriction").html(("HATA: " + responseMessage).fontcolor("red"));
					}
				}
				if (xmppResponse.commandClsId == "APPLICATION_RESTRICTION") {
					if (xmppResponse.result.responseCode == "TASK_PROCESSED") {
						progress("divApplicationRestriction","progressApplicationRestriction",'hide');
						$.notify(responseMessage, "success");
						$("#plugin-result-app-restriction").html("");
						if (tableApp) {
							tableApp.clear().draw();
							tableApp.destroy();
						}
//						return send task "INSTALLED_APPLICATIONS" for updated installed applications list after task restricted applications 
						pluginTask_ApplicationRestriction.dnList=dnlist;
						pluginTask_ApplicationRestriction.parameterMap={};
						pluginTask_ApplicationRestriction.entryList=selectedEntries;
						pluginTask_ApplicationRestriction.dnType="AHENK";
						pluginTask_ApplicationRestriction.commandId = "INSTALLED_APPLICATIONS";
						pluginTask_ApplicationRestriction.cronExpression = scheduledParamAppRestriction;
						var params = JSON.stringify(pluginTask_ApplicationRestriction);
						sendApplicationRestrictionTask(params);
						applicationList = [];
						isExistAppList = [];

					}else if (xmppResponse.result.responseCode == "TASK_ERROR") {
						$.notify(responseMessage, "error");
						$("#plugin-result-app-restriction").html(("HATA: " + responseMessage).fontcolor("red"));
					}
				}
			} else {
				$("#plugin-result-app-restriction").html("");
				progress("divApplicationRestriction","progressApplicationRestriction",'hide');
			}
		}
	}
	// we must return true to keep the handler alive. returning false would remove it after it finishes.
	return true;
}

function createApplicationTable() {

	if ($("#applicationsBodyEmptyInfo").length > 0) {
		$("#applicationsBodyEmptyInfo").remove();
	}
	tableApp = $('#applicationsTable').DataTable( {
		"scrollY": "500px",
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
			"sSearch": "Uygulama Ara:",
			"sInfo": "Toplam uygulama sayısı: _TOTAL_",
			"sInfoEmpty": "Uygulama sayısı: 0",
			"sZeroRecords" : "Uygulama bulunamadı",
			"sInfoFiltered": " - _MAX_ uygulama arasından",
		},
	} );
}

$('#sendTaskCronAppRestriction').click(function(e){
	$('#scheduledTasksModal').modal('toggle');
	scheduledParam = null;
	scheduledModalAppRestrictionOpened = true;
});

$("#scheduledTasksModal").on('hidden.bs.modal', function(){
	if (scheduledModalAppRestrictionOpened) {
		scheduledParamAppRestriction = scheduledParam;
	}
	scheduledModalAppRestrictionOpened = false;
	defaultScheduleSelection();
});

//get installed packages from agent when clicked packages list button. This action default parameterMap is null. CommandID is INSTALLED_APPLICATIONS
$('#sendTaskGetAppBtn').click(function(e){
	if (selectedEntries.length == 0 ) {
		$.notify("Lütfen istemci seçiniz.", "error");
		return;
	}

	if(pluginTask_ApplicationRestriction){
		pluginTask_ApplicationRestriction.dnList=dnlist;
		pluginTask_ApplicationRestriction.parameterMap={};
		pluginTask_ApplicationRestriction.entryList=selectedEntries;
		pluginTask_ApplicationRestriction.dnType="AHENK";
		pluginTask_ApplicationRestriction.commandId = "INSTALLED_APPLICATIONS";
		pluginTask_ApplicationRestriction.cronExpression = scheduledParamAppRestriction;
		var params = JSON.stringify(pluginTask_ApplicationRestriction);
	}

	var content = "Görev Gönderilecek, emin misiniz?";
	if (scheduledParamAppRestriction != null) {
		content = "Zamanlanmış görev gönderilecek, emin misiniz?";
	}
	$.confirm({
		title: 'Uyarı!',
		content: content,
		theme: 'light',
		buttons: {
			Evet: function () {

				if (tableApp) {
					tableApp.clear().draw();
					tableApp.destroy();
				}

				sendApplicationRestrictionTask(params);
				applicationList = [];
				isExistAppList = [];
				scheduledParamAppRestriction = null;
			},
			Hayır: function () {
			}
		}
	});
});

function applicationChecked(select) {
	var selAppName = select.value;
	var applicationInfo = {};
	if(select.checked) {
		applicationInfo = {
				"app_name": selAppName,
				"username": "ogrenci",
				"restriction": true
		};

		if (checkAppList(selAppName) == false) {
			applicationList.push(applicationInfo);
		}
	}else {
		if (checkAppList(selAppName) == true) {
			removeAppList(selAppName);
		}
	}
}

function checkAppList(appName) {
	var isExists = false;
	if (applicationList.length > 0) {
		for (var i = 0; i < applicationList.length; i++) {
			if (appName == applicationList[i]["app_name"]) {
				isExists = true;
			}
		}
	}
	return isExists;
}

function removeAppList(appName) {
	var index = applicationList.findIndex(function(item, i){
		return item.app_name === appName;
	});
	if (index > -1) {
		applicationList.splice(index, 1);
	}
}

//restricted selected applications when clicked run button
$('#sendTaskRestAppBtn').click(function(e){
	if (selectedEntries.length == 0 ) {
		$.notify("Lütfen istemci seçiniz.", "error");
		return;
	}

	if(pluginTask_ApplicationRestriction){
		pluginTask_ApplicationRestriction.dnList=dnlist;
		pluginTask_ApplicationRestriction.entryList=selectedEntries;
		pluginTask_ApplicationRestriction.dnType="AHENK";
	}
	pluginTask_ApplicationRestriction.commandId = "APPLICATION_RESTRICTION";
	pluginTask_ApplicationRestriction.parameterMap={"applicationList":applicationList, "isExistAppList":isExistAppList};
	pluginTask_ApplicationRestriction.cronExpression = scheduledParamAppRestriction;
	var params = JSON.stringify(pluginTask_ApplicationRestriction);

	var content = "Görev Gönderilecek, emin misiniz?";
	if (scheduledParamAppRestriction != null) {
		content = "Zamanlanmış görev gönderilecek, emin misiniz?";
	}
	$.confirm({
		title: 'Uyarı!',
		content: content,
		theme: 'light',
		buttons: {
			Evet: function () {
				sendApplicationRestrictionTask(params);
				applicationList = [];
				isExistAppList = [];
				scheduledParamAppRestriction = null;
			},
			Hayır: function () {
			}
		}
	});
});

