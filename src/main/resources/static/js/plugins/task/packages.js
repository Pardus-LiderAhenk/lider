/**
 * Task is manage-root task
 * This task changes the client's root password.
 * Tuncay ÇOLAK
 * tuncay.colak@tubitak.gov.tr
 * 
 * http://www.liderahenk.org/
 * 
 */

if (ref) {
	connection.deleteHandler(ref);
}

var ref=connection.addHandler(packagesListener, null, 'message', null, null,  null);

$("#entrySize").html(selectedEntries.length);		
var dnlist=[]
for (var i = 0; i < selectedEntries.length; i++) {
	dnlist.push(selectedEntries[i].distinguishedName);
}
selectedPluginTask.dnList=dnlist;
selectedPluginTask.parameterMap={};
selectedPluginTask.entryList=selectedEntries;
selectedPluginTask.dnType="AHENK";
console.log(selectedPluginTask);

var packages_data = [];
var packageInfoList = [];

$("#installRadioBtn").prop("checked", true);
$('#getPackagesListBtn').click(function(e){	
	var params = {
			"type" : $('#packageType').val(),
			"url": $('#repoUrl').val(),
			"component": $('#repoComponent').val(),
	};
	$("#plugin-result").html("Görev gönderildi.. Lütfen bekleyiniz...");
	getPackagesList(params);
});

function getPackagesList(params){
	$.ajax({
		type: "POST",
		url: "/packages/list",
		data: params,
		dataType: "json",
		success: function(data) {
			packages_data = data;
			var packages_list_table = [];
			if (data != null) {
				for (var i = 0; i < data.length; i++) {
					var name = data[i]["packageName"];
					var version =  data[i]["version"];
					var size =  data[i]["size"];
					size = (size / 1048576).toFixed(3) + " MB";
					var description =  data[i]["description"];
					var cb_row = '<td class="text-center"><span class="cb-package-name">'
						+ '<input type="checkbox" onclick="packageChecked()" name="package_name" id="'+ version +'" value="' + name +'">'
						+ '<label for="checkbox1"></label>'
						+ '</span>'
						+ '</td>';
					var toogle_btn_tag = '<select onchange="selectTagPackage(this)" disabled class="custom-select selectTag" id="' + name +'" name="'+ version +'">'
					+ '<option selected>İşlem Seç</option>'
					+ '<option value="Install">Yükle</option>'
					+ '<option value="Uninstall">Kaldır</option>'
					+ '</select>';

					packages_list_table.push( [ cb_row, name, version, size, description, toogle_btn_tag] );
				}
			}
			else {
				packages_list_table.push( [ null, null, null, null, null, null] );
			}
			$("#plugin-result").html("");
			var table = $('#packagesListTableId').DataTable( {
				data:           packages_list_table,
				deferRender:    true,
				paging: true,
				pageLength: 10,
				scrollCollapse: true,
				"oLanguage": {
					"sLengthMenu": 'Görüntüle <select>'+
					'<option value="10">10</option>'+
					'<option value="20">20</option>'+
					'<option value="30">30</option>'+
					'<option value="40">40</option>'+
					'<option value="50">50</option>'+
					'<option value="-1">Tümü</option>'+
					'</select> kayıtları',
					"sSearch": "Paket Ara:",
					"sInfo": "Toplam kayıt sayısı: _TOTAL_",
					"sInfoEmpty": "Gösterilen kayıt sayısı: 0",
					"sInfoFiltered": " - _MAX_ kayıt arasından",
//					"sEmptyTable": "Paket bulunamadı",
					"sZeroRecords" : "Paket bulunamadı",
					"oPaginate": {
						"sFirst": "İlk Sayfa", // This is the link to the first page
						"sPrevious": "Önceki", // This is the link to the previous page
						"sNext": "Sonraki", // This is the link to the next page
						"sLast": "Son Sayfa", // This is the link to the last page
					},
				},
			} );
		},
		error: function(data){
			$.notify("Paketler listelenirken hata oluştu", "error");
			$("#plugin-result").html("Paketler listelenirken hata oluştu");
		},
	});
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
			if (xmppResponse.result.responseCode != "TASK_ERROR") {
				$("#plugin-result").html("");
				$.notify(xmppResponse.result.responseMessage, "success");
			} else {
				$("#plugin-result").html(("HATA: "+ xmppResponse.result.responseMessage).fontcolor("red"));
				$.notify(xmppResponse.result.responseMessage, "error");
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
	var pName = sel.id;
	var pVersion = sel.name;
	var status = checkPackageListInfo(pName, pVersion, tag);
	var packageInfo = {};
	if (tag == "Install" || tag == "Uninstall") {
		if (status == false) {
			for (var i = 0; i < packages_data.length; i++) {
				if (pName == packages_data[i]["packageName"] && pVersion == packages_data[i]["version"]) {
					packageInfo = {
							"packageName": packages_data[i]["packageName"],
							"version": packages_data[i]["version"],
							"installed": packages_data[i]["installed"],
							"desiredStatus": packages_data[i]["desiredStatus"], //NA and UNINSTALL
							"tag": tag, // i and u(Yükle, Kaldır)
							"installedSize": packages_data[i]["installedSize"],
							"maintainer": packages_data[i]["maintainer"],
							"architecture": packages_data[i]["architecture"],
							"depends": packages_data[i]["depends"],
							"recommends": packages_data[i]["recommends"],
							"breaks": packages_data[i]["breaks"],
							"descriptionMd5": packages_data[i]["descriptionMd5"],
							"homepage": packages_data[i]["homepage"],
							"suggests": packages_data[i]["suggests"],
							"multiArch": packages_data[i]["multiArch"],
							"md5Sum": packages_data[i]["md5Sum"],
							"sha1": packages_data[i]["sha1"],
							"sha256": packages_data[i]["sha256"],
							"replaces": packages_data[i]["replaces"],
							"preDepends": packages_data[i]["preDepends"],
							"provides": packages_data[i]["provides"],
							"description": packages_data[i]["description"],
							"section": packages_data[i]["section"],
							"source": packages_data[i]["source"],
							"conflicts": packages_data[i]["conflicts"],
							"filename": packages_data[i]["filename"],
							"priority": packages_data[i]["priority"],
							"size": packages_data[i]["size"]
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
			var selectTag = $("#"+pName).prop('disabled', false);

		}else if(!$(this).is(':checked')){
			pName = $(this).val();
			pVersion = $(this).attr('id');
			$("#"+pName).prop('disabled', true);
			var status = checkPackageListInfo(pName, pVersion, null);
			if (status == true) {
				removePackageList(pName, pVersion);
			}
		}
	});
}

function checkPackageListInfo(pName, pVersion, tag) {
	var isExists = false;
	if (packageInfoList.length > 0) {
		for (var i = 0; i < packageInfoList.length; i++) {
			if (pName == packageInfoList[i]["packageName"] && pVersion == packageInfoList[i]["version"]) {
				if (tag == packageInfoList[i]["tag"] || tag == null ) {
					isExists = true;
				}else {
					removePackageList(pName, pVersion);
					isExists = false;
				}
			}
		}
	}
	return isExists;
}

function removePackageList(pName, pVersion) {
	var index = packageInfoList.findIndex(function(item, i){
		return item.packageName === pName;
	});
	if (index > -1) {
		packageInfoList.splice(index, 1);
	}
}

$('#sendTask-'+ selectedPluginTask.page).click(function(e){
	if (packageInfoList.length > 0) {
		selectedPluginTask.commandId = "PACKAGES";
		selectedPluginTask.parameterMap={"packageInfoList":packageInfoList};
		var params = JSON.stringify(selectedPluginTask);

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
				if(res.status=="OK"){		    		
					$("#plugin-result").html("Görev başarı ile gönderildi.. Lütfen bekleyiniz...");
				}   	
			},
			error: function(result) {
				$.notify(result, "error");
			}
		});
	}
	else {
		$.notify("Lütfen yüklemek ve/veya kaldırmak istediğiniz paketi/leri seçerek Çalıştır butonuna tıklayınız.", "warn");
	}
});

//scheduled task to be added 
$('#sendTaskCron-'+ selectedPluginTask.page).click(function(e){
	alert("Zamanlı Çalıştır")
});

$('#closePage-'+ selectedPluginTask.page).click(function(e){
	connection.deleteHandler(ref);	
});

