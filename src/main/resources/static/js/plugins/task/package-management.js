/**
 * Task is package-management
 * This task get installed packages from agents. This task used to remove selected packages from agent
 * Tuncay ÇOLAK
 * tuncay.colak@tubitak.gov.tr
 * 
 * http://www.liderahenk.org/
 * 
 */


if (ref_package_management) {
	connection.deleteHandler(ref_package_management);
}

var scheduledParamPackageManagement = null;
var scheduledModalPacManagementOpened = false;
var packageInfoList = [];
var dnlist = [];
var tableInsPackages;
var pluginTask_PackageManagement = null;
$('#sendTaskDeletePackageBtn').hide();

var ref_package_management=connection.addHandler(getPackagesListener, null, 'message', null, null,  null);

if(selectedEntries){
	for (var i = 0; i < selectedEntries.length; i++) {
		dnlist.push(selectedEntries[i].distinguishedName);
	}
}

for (var n = 0; n < pluginTaskList.length; n++) {
	var pluginTask=pluginTaskList[n];
	if (pluginTask.page == 'package-management') {
		pluginTask_PackageManagement=pluginTask;
	}
}

function sendPackageManagementTask(params){
	var message = "Görev başarı ile gönderildi.. Lütfen bekleyiniz...";
	if (scheduledParamPackageManagement != null) {
		message = "Zamanlanmış görev başarı ile gönderildi. Zamanlanmış görev parametreleri:  "+ scheduledParamPackageManagement;
	}
	progress("divPackageManager","progressPackageManager",'show')
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
				$("#plugin-result-package-management").html(message.bold());
			}   	
		},
		error: function(result) {
			$.notify(result, "error");
		}
	});
}

function getPackagesListener(msg) {
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
			progress("divPackageManager","progressPackageManager",'hide')
			if (xmppResponse.commandClsId == "INSTALLED_PACKAGES") {
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
									var packages = data.responseDataStr.split("\n");
									var parser_packages = [];
									for (var i = 0; i < packages.length; i++) {
										parser_packages.push(packages[i].split(","));
									}
									for (var j = 0; j < parser_packages.length; j++) {
										var packageName = parser_packages[j][1];
										var packageVersion = parser_packages[j][2];

										var newRow = $("<tr>");
										var html = '<td class="text-center"><span class="cb-package-name">'
											+ '<input class="text-center" type="checkbox" onclick="onclickPackageChecked(this)" name="packageName" id="'+ packageVersion +'" value="' + packageName +'">'
											+ '<label for="checkbox1"></label>'
											+ '</span>'
											+ '</td>';
										html += '<td>'+ packageName +'</td>';
										html += '<td>'+ packageVersion +'</td>';

										newRow.append(html);
										$("#installedPackagesTable").append(newRow);
									}

									var parser_packages = [];
									createInstalledPackagesTable();
									$("#plugin-result-package-management").html("");
									$.notify(responseMessage, "success");
									$('#packageManagementHelp').html('Silmek istediğiniz paket/leri seçerek Sil butonuna tıklayınız.');
									$('#sendTaskDeletePackageBtn').show();
								}
							}else {
								createInstalledPackagesTable();
							}
						},
						error: function(result) {
							$.notify(result, "error");
							$("#plugin-result-package-management").html(("HATA: " + responseMessage).fontcolor("red"));
						}
					});
				}else if (xmppResponse.result.responseCode == "TASK_ERROR") {
					$.notify(responseMessage, "error");
					$("#plugin-result-package-management").html(("HATA: " + responseMessage).fontcolor("red"));
				}
			}
			if (xmppResponse.commandClsId == "PACKAGE_MANAGEMENT") {
				if (xmppResponse.result.responseCode == "TASK_PROCESSED") {

					$.notify(responseMessage, "success");
					$("#plugin-result-package-management").html("");
//					return send task "INSTALLED_PACKAGES" for updated installed packages list after task uninstalled packages 
					pluginTask_PackageManagement.dnList=dnlist;
					pluginTask_PackageManagement.parameterMap={};
					pluginTask_PackageManagement.entryList=selectedEntries;
					pluginTask_PackageManagement.dnType="AHENK";
					pluginTask_PackageManagement.commandId = "INSTALLED_PACKAGES";
					pluginTask_PackageManagement.cronExpression = null;
					var params = JSON.stringify(pluginTask_PackageManagement);
					tableInsPackages.clear().draw();
					tableInsPackages.destroy();
					sendPackageManagementTask(params);

				}else if (xmppResponse.result.responseCode == "TASK_ERROR") {
					$.notify(responseMessage, "error");
					$("#plugin-result-package-management").html(("HATA: " + responseMessage).fontcolor("red"));
				}
			}
		}
	}
	// we must return true to keep the handler alive. returning false would remove it after it finishes.
	return true;
}

function createInstalledPackagesTable() {
	tableInsPackages = $('#installedPackagesTable').DataTable( {
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
			"sSearch": "Paket Ara:",
			"sInfo": "Toplam paket sayısı: _TOTAL_",
			"sInfoEmpty": "Gösterilen paket sayısı: 0",
			"sZeroRecords" : "Paket bulunamadı",
			"sInfoFiltered": " - _MAX_ paket arasından",
		},
	} );
}

function onclickPackageChecked(select) {
	var selPackageName = select.value;
	var selPackageVersion = select.id;
	var packageInfo = {};
	if(select.checked) {
		if (selPackageName.includes('ahenk')) {
			$.notify(selPackageName +" paketi silinemez.", "error");
		}else {
			packageInfo = {
					"packageName": selPackageName,
					"version": selPackageVersion,
					"installed": true,
					"desiredStatus": "UNINSTALL", //NA and UNINSTALL
					"tag": "u", // i and u
					"installedSize": null,
					"maintainer": null,
					"architecture": null,
					"depends": null,
					"recommends": null,
					"breaks": null,
					"descriptionMd5": null,
					"homepage": null,
					"suggests": null,
					"multiArch": null,
					"md5Sum": null,
					"sha1": null,
					"sha256": null,
					"replaces": null,
					"preDepends": null,
					"provides": null,
					"description": null,
					"section": null,
					"source": null,
					"conflicts": null,
					"filename": null,
					"priority": null,
					"size": null
			};
			if (checkPackagesList(selPackageName) == false) {
				packageInfoList.push(packageInfo);
			}
		}
	}else {
		if (checkPackagesList(selPackageName) == true) {
			removePackageFromList(selPackageName);
		}
	}
}

function checkPackagesList(packageName) {
	var isExists = false;
	if (packageInfoList.length > 0) {
		for (var i = 0; i < packageInfoList.length; i++) {
			if (packageName == packageInfoList[i]["packageName"]) {
				isExists = true;
			}
		}
	}
	return isExists;
}

function removePackageFromList(packageName) {
	var index = packageInfoList.findIndex(function(item, i){
		return item.packageName === packageName;
	});
	if (index > -1) {
		packageInfoList.splice(index, 1);
	}
}

$('#sendTaskCronPackageManagement').click(function(e){
	$('#scheduledTasksModal').modal('toggle');
	scheduledParam = null;
	scheduledModalPacManagementOpened = true;
});

$("#scheduledTasksModal").on('hidden.bs.modal', function(){
	if (scheduledModalPacManagementOpened) {
		scheduledParamPackageManagement = scheduledParam;
	}
	scheduledModalPacManagementOpened = false;
	defaultScheduleSelection();
});

//get installed packages from agent when clicked packages list button. This action default parameterMap is null. CommandID is INSTALLED_PACKAGES
$('#sendTaskGetPackagesBtn').click(function(e){
	if (selectedEntries.length == 0 ) {
		$.notify("Lütfen istemci seçiniz.", "error");
		return;
	}

	if(pluginTask_PackageManagement){
		pluginTask_PackageManagement.dnList=dnlist;
		pluginTask_PackageManagement.parameterMap={};
		pluginTask_PackageManagement.entryList=selectedEntries;
		pluginTask_PackageManagement.dnType="AHENK";
		pluginTask_PackageManagement.commandId = "INSTALLED_PACKAGES";
		pluginTask_PackageManagement.cronExpression = scheduledParamPackageManagement;
		var params = JSON.stringify(pluginTask_PackageManagement);
	}

	var content = "Görev Gönderilecek, emin misiniz?";
	if (scheduledParamPackageManagement != null) {
		content = "Zamanlanmış görev gönderilecek, emin misiniz?";
	}
	$.confirm({
		title: 'Uyarı!',
		content: content,
		theme: 'light',
		buttons: {
			Evet: function () {
				if (tableInsPackages) {
					tableInsPackages.clear().draw();
					tableInsPackages.destroy();
				}
				sendPackageManagementTask(params);
				packageInfoList = [];
				scheduledParamPackageManagement = null;
			},
			Hayır: function () {
			}
		}
	});

});

//delete selected packages when clicked detete button
$('#sendTaskDeletePackageBtn').click(function(e){
	if (selectedEntries.length == 0 ) {
		$.notify("Lütfen istemci seçiniz.", "error");
		return;
	}

	if(pluginTask_PackageManagement){
		pluginTask_PackageManagement.dnList=dnlist;
		pluginTask_PackageManagement.entryList=selectedEntries;
		pluginTask_PackageManagement.dnType="AHENK";
		pluginTask_PackageManagement.commandId = "PACKAGE_MANAGEMENT";
		pluginTask_PackageManagement.parameterMap={"packageInfoList":packageInfoList};
		pluginTask_PackageManagement.cronExpression = scheduledParamPackageManagement;
		var params = JSON.stringify(pluginTask_PackageManagement);
	}

//	if($('input:checkbox[name=packageName]').is(':checked')) {
	if (packageInfoList.length > 0) {
		var content = "Görev Gönderilecek, emin misiniz?";
		if (scheduledParamPackageManagement != null) {
			content = "Zamanlanmış görev gönderilecek, emin misiniz?";
		}
		$.confirm({
			title: 'Uyarı!',
			content: content,
			theme: 'light',
			buttons: {
				Evet: function () {
					sendPackageManagementTask(params);
					packageInfoList = [];
					scheduledParamPackageManagement = null;
				},
				Hayır: function () {
				}
			}
		});
	}
	else {
		$.notify("Lütfen silmek istediğiniz paketi/leri seçerek Sil butonuna tıklayınız.", "warn");
	}
});

