/**
 * Packages
 * This task used to install and remove packages from the other package repository
 * Tuncay ÇOLAK
 * tuncay.colak@tubitak.gov.tr
 * 
 * http://www.liderahenk.org/
 * 
 */

if (ref_packages) {
	connection.deleteHandler(ref_packages);
}
var scheduledParamPackages = null;
var scheduledModalPackagesOpened = false;
var packagesData = [];
var packageInfoList = [];
var dnlist=[];
var packagesListTable = [];
var tablePackages = null;
var pluginTask_Packages = null;
var repoAddData = null;
var ref_packages=connection.addHandler(packagesListener, null, 'message', null, null,  null);

$('#sendTaskPackages').hide();
$('#sendTaskCronPackages').hide();
$('#packageBody').html('<tr id="packagesBodyEmptyInfo"><td colspan="6" class="text-center">Paket Bulunamadı. Paket Listele Butonuna Tıklayınız.</td></tr>');
$('#packageType').attr("disabled", true);
$('#repoUrl').attr("disabled", true);
$('#repoComponent').attr("disabled", true);
$("#installRadioBtn").prop("checked", true);

getRepoAddress();

for (var i = 0; i < selectedEntries.length; i++) {
	dnlist.push(selectedEntries[i].distinguishedName);
}

for (var n = 0; n < pluginTaskList.length; n++) {
	var pluginTask=pluginTaskList[n];
	if (pluginTask.page == 'packages') {
		pluginTask_Packages=pluginTask;
	}
}

//get repository address from database
function getRepoAddress() {
	$.ajax({ 
		type: 'GET', 
		url: "/lider/config/configurations",
		dataType: 'json',
		success: function (data) { 
			if(data != null) {
				repoAddData = data;
				$('#repoUrl').val(repoAddData.pardusRepoAddress);
				$('#repoComponent').val(repoAddData.pardusRepoComponent);
			}
		},
		error: function (data, errorThrown) {
			$.notify("Ayarlar getirilirken hata oluştu. Lütfen tekrar deneyiniz.", "error");
		}
	});
}

function editRepoAddress() {
	var repoAddrBtnVal = $("#repoAddrUpdateBtn").val();
	if (repoAddrBtnVal == "edit") {
		$('#packageType').attr("disabled", false);
		$('#repoUrl').attr("disabled", false);
		$('#repoComponent').attr("disabled", false);
		$("#repoAddrUpdateBtn").attr('value', 'save'); //versions older than 1.6
		$("#repoAddrUpdateBtn").html('<i class="fas fa-save"></i>');
		$('#repoAddrUpdateBtn').prop('title', 'Depo Adresini Kaydet');
	} else {
		updatedRepoAddress();
		$('#packageType').attr("disabled", true);
		$('#repoUrl').attr("disabled", true);
		$('#repoComponent').attr("disabled", true);
		$("#repoAddrUpdateBtn").attr('value', 'edit');
		$("#repoAddrUpdateBtn").html('<i class="fas fa-edit"></i>');
		$('#repoAddrUpdateBtn').prop('title', 'Depo Adresini Düzenle');
	}
}

//updated repository address
function updatedRepoAddress() {
	var params = {
			"pardusRepoAddress": $('#repoUrl').val(),
			"pardusRepoComponent": $('#repoComponent').val()
	};
	$.ajax({ 
		type: 'POST', 
		url: "/packages/update/repoAddress",
		dataType: 'json',
		data: params,
		success: function (data) { 
			if(data != null) {
				repoAddData = data;
				$('#repoUrl').val(repoAddData.pardusRepoAddress);
				$('#repoComponent').val(repoAddData.pardusRepoComponent);
				$.notify("Paket Depo Adresi başarıyla güncellendi.", "success");
			} else {
				$.notify("Paket Depo Adresi güncellenirken güncellenirken hata oluştu. Lütfen tekrar deneyiniz.", "error");
			}
		},
		error: function (data, errorThrown) {
			$.notify("Paket Depo Adresi güncellenirken hata oluştu. Lütfen tekrar deneyiniz.", "error");
		}
	});
}
//get packages from package repository
$('#getPackagesListBtn').click(function(e){
	if (tablePackages) {
		packagesListTable = [];
		tablePackages.clear().draw();
		tablePackages.destroy();
		tablePackages = null;
	}
	var params = {
			"type" : $('#packageType').val(),
			"url": $('#repoUrl').val(),
			"component": $('#repoComponent').val(),
	};
	$("#plugin-result-packages").html("Görev gönderildi.. Lütfen bekleyiniz...".bold());
	getPackagesList(params);
});

function getPackagesList(params){
	progress("divPackages","progressPackages",'show');
	$.ajax({
		type: "POST",
		url: "/packages/list",
		data: params,
		dataType: "json",
		success: function(data) {
			packagesData = data;
			progress("divPackages","progressPackages",'hide');
			if (data != null) {
				for (var i = 0; i < data.length; i++) {
					var name = data[i]["packageName"];
					var version =  data[i]["version"];
					var size =  data[i]["size"];
					size = (size / 1048576).toFixed(3) + " MB";
					var description =  data[i]["description"];
					var selectBoxId = name + version;
					selectBoxId = selectBoxId.replace(/[-~&\/\\#,+()$~%.'":*?<>{}]/g, '');

					var cb_row = '<td class="text-center"><span class="cb-package-name">'
						+ '<input type="checkbox" onclick="packageChecked()" name="package_name" id="'+ version +'" value="' + name +'">'
						+ '<label for="checkbox1"></label>'
						+ '</span>'
						+ '</td>';
					var toogle_btn_tag = '<select onchange="selectTagPackage(this)" disabled class="custom-select custom-select-sm selectTag" id="' + selectBoxId + '" title="' + name + '" name="'+ version +'">'
					+ '<option value="NA" selected>İşlem Seç</option>'
					+ '<option value="Install">Yükle</option>'
					+ '<option value="Uninstall">Kaldır</option>'
					+ '</select>';

					packagesListTable.push( [ cb_row, name, version, size, description, toogle_btn_tag] );
				}
				$("#plugin-result-packages").html("");
				createdPackagesTable();
				$('#sendTaskPackages').show();
				$('#sendTaskCronPackages').show();
				$('#packagesHelp').html("Kurmak ya da Kaldırmak istediğiniz paket/leri seçerek Çalıştır butonuna tıklayınız. ")
			}
			else {
				packagesListTable = [];
				$('#packageBody').html('<tr id="packagesBodyEmptyInfo"><td colspan="6" class="text-center">Paket Bulunamadı.</td></tr>');
				$('#packagesHelp').html("Girilen depo adresindeki paketleri listemek için Paketleri Listele butonuna tıklayınız.")
			}
		},
		error: function(data){
			$.notify("Paketler listelenirken hata oluştu", "error");
			$("#plugin-result-packages").html(("Paketler listelenirken hata oluştu").fontcolor("red"));
			progress("divPackages","progressPackages",'hide');
			$('#packagesHelp').html("Girilen depo adresindeki paketleri listemek için Paketleri Listele butonuna tıklayınız.")
			$('#packageBody').html('<tr id="packagesBodyEmptyInfo"><td colspan="6" class="text-center">Paket Bulunamadı.</td></tr>');
		},
	});
}

function createdPackagesTable() {

	if ($("#packagesBodyEmptyInfo").length > 0) {
		$("#packagesBodyEmptyInfo").remove();
	}

	tablePackages = $('#packagesListTableId').DataTable( {
		data:           packagesListTable,
		deferRender:    true,
		paging: true,
		pageLength: 10,
		scrollCollapse: true,
//		pagingType: "simple_numbers",
		"oLanguage": {
			"sLengthMenu": 'Görüntüle <select>'+
			'<option value="10">10</option>'+
			'<option value="20">20</option>'+
			'<option value="30">30</option>'+
			'<option value="40">40</option>'+
			'<option value="50">50</option>'+
//			'<option value="-1">Tümü</option>'+
			'</select> kayıtları',
			"sSearch": "Paket Ara:",
			"sInfo": "Toplam kayıt sayısı: _TOTAL_",
			"sInfoEmpty": "Gösterilen kayıt sayısı: 0",
			"sInfoFiltered": " - _MAX_ kayıt arasından",
//			"sEmptyTable": "Paket bulunamadı",
			"sZeroRecords" : "Paket bulunamadı",
			"oPaginate": {
//				"sPaginationType": "full_numbers",
				"sFirst": "İlk Sayfa", // This is the link to the first page
				"sPrevious": "Önceki", // This is the link to the previous page
				"sNext": "Sonraki", // This is the link to the next page
				"sLast": "Son Sayfa", // This is the link to the last page
			},
		},
	} );

}

function packagesListener(msg) {
	var to = msg.getAttribute('to');
	var from = msg.getAttribute('from');
	var type = msg.getAttribute('type');
	var elems = msg.getElementsByTagName('body');

	if (type == "chat" && elems.length > 0) {
		var body = elems[0];
		var data=Strophe.xmlunescape(Strophe.getText(body));
		var xmppResponse=JSON.parse(data);
//		var arrg = JSON.parse(xmppResponse.result.responseDataStr);
		if(xmppResponse.commandClsId == "PACKAGES"){
			if (selectedEntries[0].type == "AHENK") {
				if(xmppResponse.result.responseCode == "TASK_PROCESSED" || xmppResponse.result.responseCode == "TASK_ERROR") {
					progress("divPackages","progressPackages",'hide');
					if (xmppResponse.result.responseCode == "TASK_PROCESSED") {
						$("#plugin-result-packages").html("");
						$.notify(xmppResponse.result.responseMessage, "success");
					} else {
//						$("#plugin-result-packages").html(("HATA: "+ xmppResponse.result.responseMessage).fontcolor("red"));
						$.notify(xmppResponse.result.responseMessage, "error");
					}
				}
			}
		}
	}
	// we must return true to keep the handler alive. returning false would remove it after it finishes.
	return true;
}

//used to add another package store when click btnAddRepoId
$('#btnAddRepoId').click(function(e){
	var html = '<div class="input-group mb-3" id="descField">';
	html += '<div class="input-group-prepend">';
	html += '<select class="custom-select" id="packageStyleId">';
	html += '<option value="1">deb</option>';
	html += '<option value="2">deb-src</option>';
	html += '</select>';
	html += '</div>';
	html += '<input type="text" id="repoUrlId" class="form-control" placeholder="http://depo.pardus.org.tr/pardus/">';
	html += '<input type="text" id="repoComponentId" class="form-control" placeholder="onyedi main contrib non-free">';
	html += '<button id="removeDesc" type="button" class="btn-shadow btn btn-info remove_field" title="Depo Sil"><i class="fa fa-minus-circle"></i></button>';
	html += '</div>';
	$('#addedRepositoryId').append(html);
});

var wrapper = $(".input_fields_wrap");
$(wrapper).on("click",".remove_field", function(e){ //user click on remove input group
	e.preventDefault(); $(this).parent('div').remove(); x--;
})

function selectTagPackage(sel){
	var tag = sel.value;
	var pName = sel.title;
	var pVersion = sel.name;
	var status = checkPackageListInfo(pName, pVersion, tag);
	var packageInfo = {};
	if (tag == "Install" || tag == "Uninstall") {
		if (status == false) {
			for (var i = 0; i < packagesData.length; i++) {
				if (pName == packagesData[i]["packageName"] && pVersion == packagesData[i]["version"]) {
					packageInfo = {
							"packageName": packagesData[i]["packageName"],
							"version": packagesData[i]["version"],
							"installed": packagesData[i]["installed"],
							"desiredStatus": packagesData[i]["desiredStatus"], //NA and UNINSTALL
							"tag": tag, // i and u(Yükle, Kaldır)
							"installedSize": packagesData[i]["installedSize"],
							"maintainer": packagesData[i]["maintainer"],
							"architecture": packagesData[i]["architecture"],
							"depends": packagesData[i]["depends"],
							"recommends": packagesData[i]["recommends"],
							"breaks": packagesData[i]["breaks"],
							"descriptionMd5": packagesData[i]["descriptionMd5"],
							"homepage": packagesData[i]["homepage"],
							"suggests": packagesData[i]["suggests"],
							"multiArch": packagesData[i]["multiArch"],
							"md5Sum": packagesData[i]["md5Sum"],
							"sha1": packagesData[i]["sha1"],
							"sha256": packagesData[i]["sha256"],
							"replaces": packagesData[i]["replaces"],
							"preDepends": packagesData[i]["preDepends"],
							"provides": packagesData[i]["provides"],
							"description": packagesData[i]["description"],
							"section": packagesData[i]["section"],
							"source": packagesData[i]["source"],
							"conflicts": packagesData[i]["conflicts"],
							"filename": packagesData[i]["filename"],
							"priority": packagesData[i]["priority"],
							"size": packagesData[i]["size"]
					};
					packageInfoList.push(packageInfo);
				}
			}
		}
	}else {
		removePackageList(pName, pVersion);
	}
}

function packageChecked() {
	$('input:checkbox[name=package_name]').each(function() {
		if($(this).is(':checked')){
			pName = $(this).val();
			pVersion = $(this).attr('id');
			var selBoxId = pName + pVersion;
			selBoxId = selBoxId.replace(/[-~&\/\\#,+()$~%.'":*?<>{}]/g, '');
			var selectTag = $("#"+selBoxId).prop('disabled', false);

		}else if(!$(this).is(':checked')){
			pName = $(this).val();
			pVersion = $(this).attr('id');
			var selBoxId = pName + "-" + pVersion;
			selBoxId = selBoxId.replace(/[-~&\/\\#,+()$~%.'":*?<>{}]/g, '');
			$("#"+selBoxId).val("NA").change();
			$("#"+selBoxId).prop('disabled', true);
			removePackageList(pName, pVersion);
		}
	});
}

function checkPackageListInfo(pName, pVersion, tag) {
	var isExists = false;
	if (packageInfoList.length > 0) {
		for (var i = 0; i < packageInfoList.length; i++) {
			if (pName == packageInfoList[i]["packageName"] && pVersion == packageInfoList[i]["version"] && tag == packageInfoList[i]["tag"]) {
				isExists = true;
			} else {
				removePackageList(pName, pVersion);
			}
		}
	}
	return isExists;
}

function removePackageList(pName, pVersion) {
	if (packageInfoList.length > 0) {
		for (var i = 0; i < packageInfoList.length; i++) {
			if (pName == packageInfoList[i]["packageName"] && pVersion == packageInfoList[i]["version"]) {
				var index = packageInfoList.findIndex(function(item, i){
					if (pName == packageInfoList[i]["packageName"] && pVersion == packageInfoList[i]["version"]) {
						return item.packageName === pName;
					}
				});
				if (index > -1) {
					packageInfoList.splice(index, 1);
				}
			}
		}
	}
}

function sendPackagesTask(params) {
	var message = "Görev başarı ile gönderildi.. Lütfen bekleyiniz...";
	if (scheduledParamPackages != null) {
		message = "Zamanlanmış görev başarı ile gönderildi. Zamanlanmış görev parametreleri:  "+ scheduledParamPackages;
	}
	if (selectedEntries[0].type == "AHENK" && selectedRow.online == true && scheduledParamPackages == null) {
		progress("divPackages","progressPackages",'show');
	}
	if (selectedEntries[0].type == "AHENK" && selectedRow.online == false) {
		$.notify("Görev başarı ile gönderildi, istemci çevrimiçi olduğunda uygulanacaktır.", "success");
	}
	if (selectedEntries[0].type == "GROUP") {
		var groupNotify = "Görev istemci grubuna başarı ile gönderildi.";
		if (scheduledParamPackages != null) {
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
					$("#plugin-result-packages").html(message.bold());	
				}
			}   	
		},
		error: function(result) {
			$.notify(result, "error");
		}
	});
}

$('#sendTaskCronPackages').click(function(e){
	$('#scheduledTasksModal').modal('toggle');
	scheduledParam = null;
	scheduledModalPackagesOpened = true;
});

$("#scheduledTasksModal").on('hidden.bs.modal', function(){
	if (scheduledModalPackagesOpened) {
		scheduledParamPackages = scheduledParam;
	}
	scheduledModalPackagesOpened = false;
	defaultScheduleSelection();
});

$('#sendTaskPackages').click(function(e){
	if (selectedEntries.length == 0 ) {
		$.notify("Lütfen istemci seçiniz.", "error");
		return;
	}

	if(pluginTask_Packages){
		if (packageInfoList.length > 0) {
			pluginTask_Packages.commandId = "PACKAGES";
			pluginTask_Packages.parameterMap={"packageInfoList":packageInfoList};
			pluginTask_Packages.entryList=selectedEntries;
			pluginTask_Packages.dnType="AHENK";
			pluginTask_Packages.cronExpression = scheduledParamPackages;
			var params = JSON.stringify(pluginTask_Packages);

			var content = "Görev Gönderilecek, emin misiniz?";
			if (scheduledParamPackages != null) {
				content = "Zamanlanmış görev gönderilecek, emin misiniz?";
			}
			$.confirm({
				title: 'Uyarı!',
				content: content,
				theme: 'light',
				buttons: {
					Evet: function () {
						sendPackagesTask(params);
						scheduledParamPackages = null;
					},
					Hayır: function () {
					}
				}
			});
		} else {
			$.notify("Lütfen yüklemek ve/veya kaldırmak istediğiniz paketi/leri seçerek Çalıştır butonuna tıklayınız.", "warn");
		}
	}
});

