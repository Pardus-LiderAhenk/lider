/**
 * RSYSLOG Profile, System Log file configuration and rotation info are defined with this plugin.
 * Tuncay ÇOLAK
 * tuncay.colak@tubitak.gov.tr
 * 
 * http://www.liderahenk.org/
 * 
 */

var rsyslogProfileList = null;
var selectRsyslogProfile = false;
var rsyslogPluginImpl = null;
var selectedRsyslogProfileId = null;
var logItemList = [];

getProfileList();
hideAndShowRsyslogProfileButton();
createManageLogsTable();
showEditableSelect();

for (var i = 0; i < pluginProfileList.length; i++) {
	if(pluginProfileList[i].page == 'rsyslog-profile'){
		rsyslogPluginImpl = pluginProfileList[i].plugin;
	}
}

function showEditableSelect() {
	$('#cmbRecordDescription').editableSelect({
		filter: false,
		effects: 'fade',
//		trigger: 'manual'
	});
}

$('#cmbRecordDescription').on('select.editable-select', function (e, li) {
	if (li) {
		var value = li.val();
		if (value == "0") {
			$("#cmbRecordDescription").prop('readonly', false);
			$('#txtLogFilePath').val("");
		}else {
			$("#cmbRecordDescription").prop("readonly", "readonly");
			if (value == "1") {
				$('#txtLogFilePath').val("-/var/log/syslog");
			} else if (value == "2") {
				$('#txtLogFilePath').val("/var/log/auth.log");
			} else if (value == "3") { 
				$('#txtLogFilePath').val("-/var/log/daemon.log");
			} else if (value == "4") {
				$('#txtLogFilePath').val("/var/log/cron.log");
			} else if (value == "5") {
				$('#txtLogFilePath').val("-/var/log/kern.log");
			} else if (value == "6") {
				$('#txtLogFilePath').val("-/var/log/user.log");
			}
		}
	}
});

//get rsyslog profile list
function getProfileList() {
	var params = {
			"name" : "rsyslog"
	};
	$.ajax({
		type : 'POST',
		url : '/profile/list',
		data: params,
		dataType : 'json',
		success : function(data) {
			rsyslogProfileList = data;
			createRsyslogProfileTable();
		}
	});
}

//created rsyslog profile table
function createRsyslogProfileTable() {
	hideAndShowRsyslogProfileButton();
	defaultRsyslogSetting();
	if ($("#rsyslogProfileBodyEmptyInfo").length > 0) {
		$("#rsyslogProfileBodyEmptyInfo").remove();
	}

	if(rsyslogProfileList != null && rsyslogProfileList.length > 0) {
		var profile = "";
		for (var i = 0; i < rsyslogProfileList.length; i++) {
			var profileId = rsyslogProfileList[i].id;
			var profileName = rsyslogProfileList[i].label;
			var profileDescription = rsyslogProfileList[i].description;
			var profileCreateDate = rsyslogProfileList[i].createDate;
			var profileOfPlugin = rsyslogProfileList[i].plugin.name;
			var profileDeleted = rsyslogProfileList[i].deleted;
			if (profileDeleted == false) {

				profile += "<tr id="+ profileId +">";
				profile += '<td>'+ profileName +'</td>';
				profile += '<td>'+ profileDescription +'</td>';
				profile += '<td>'+ profileCreateDate +'</td>';
				profile += '</tr>';
			}
		}
		$('#rsyslogProfileBody').html(profile);
	} else {
		$('#rsyslogProfileBody').html('<tr id="rsyslogProfileBodyEmptyInfo"><td colspan="100%" class="text-center">Rsyslog ayarı bulunamadı.</td></tr>');
	}
}

$('#rsyslogProfileTable').on('click', 'tbody tr', function(event) {
	if(rsyslogProfileList != null && rsyslogProfileList.length > 0) {
		defaultRsyslogSetting();
		if($(this).hasClass('policysettings')){
			$(this).removeClass('policysettings');
			selectRsyslogProfile = false;
			selectedRsyslogProfileId = null;
			hideAndShowRsyslogProfileButton();
		} else {
			$(this).addClass('policysettings').siblings().removeClass('policysettings');
			selectedRsyslogProfileId = $(this).attr('id');
			selectRsyslogProfile = true;
			hideAndShowRsyslogProfileButton();
			showDetailSelectedRsyslogProfile();
		}
	}
});

function showDetailSelectedRsyslogProfile() {

	for (var i = 0; i < rsyslogProfileList.length; i++) {
		if (selectedRsyslogProfileId == rsyslogProfileList[i].id) {
			$('#rsyslogProfileNameForm').val(rsyslogProfileList[i].label);
			$('#rsyslogProfileDescriptionForm').val(rsyslogProfileList[i].description);

			if (rsyslogProfileList[i].profileData.ADDRESS) {
				$('#lblRemoteServerAddress').val(rsyslogProfileList[i].profileData.ADDRESS);
			}
			if (rsyslogProfileList[i].profileData.PORT) {
				$('#lblLogPort').val(rsyslogProfileList[i].profileData.PORT);
			}
			if (rsyslogProfileList[i].profileData.PROTOCOL) {
				$('#cmbProtocol').val(rsyslogProfileList[i].profileData.PROTOCOL).change();
			}
			if (rsyslogProfileList[i].profileData.rotationInterval) {
				$('#cmbRotationFrequency').val(rsyslogProfileList[i].profileData.rotationInterval);
			}
			if (rsyslogProfileList[i].profileData.keepBacklogs) {
				$('#spinnerLogRotationCount').val(rsyslogProfileList[i].profileData.keepBacklogs);
			}
			if (rsyslogProfileList[i].profileData.maxSize) {
				$('#lblLogFileSize').val(rsyslogProfileList[i].profileData.maxSize);
			}
			$("#btnCheckNewLogFileAfterRotation").prop("checked", rsyslogProfileList[i].profileData.createNewLogFiles);
			$("#btnCheckCompressOldLogFiles").prop("checked", rsyslogProfileList[i].profileData.compressOldLogFiles);
			$("#btnCheckSkipWithoutError").prop("checked", rsyslogProfileList[i].profileData.missingOk);

			if (rsyslogProfileList[i].profileData.items) {
				logItemList = rsyslogProfileList[i].profileData.items;
				createManageLogsTable();
			}
		}
	}
} 

function defaultRsyslogSetting() {
	$('#rsyslogProfileNameForm').val("");
	$('#rsyslogProfileDescriptionForm').val("");
	$('#cmbRotationFrequency').val("DAILY").change();
	$('#spinnerLogRotationCount').val("1");
	$('#lblLogFileSize').val("");
	$("#btnCheckNewLogFileAfterRotation").prop("checked", false);
	$("#btnCheckCompressOldLogFiles").prop("checked", false);
	$("#btnCheckSkipWithoutError").prop("checked", false);
	$('#lblRemoteServerAddress').val("");
	$('#lblLogPort').val("");
	$('#cmbProtocol').val("UDP").change();
	logItemList = [];
	createManageLogsTable();
}

function hideAndShowRsyslogProfileButton() {
	if (selectRsyslogProfile == false) {
		$("#rsyslogProfileDel").hide();
		$("#rsyslogProfileUpdate").hide();
		$("#rsyslogProfileAddToPolicy").hide();
		$("#rsyslogProfileSave").show();
	} else {
		$("#rsyslogProfileDel").show();
		$("#rsyslogProfileUpdate").show();
		$("#rsyslogProfileAddToPolicy").show();
		$("#rsyslogProfileSave").hide();
	}
}

/*
 * MANAGE LOGS LIST -->> START
 */
//add log to manage logs table
$("#btnAddLog").click(function(e){
	if ($('#cmbIsLocal').val() == "NA" ) {
		$.notify("Lütfen yerel kayıt seçiniz.", "warn");
		return;
	}
	if ($('#txtLogFilePath').val() == "" ) {
		$.notify("Lütfen log kayıt yolu giriniz.", "warn");
		return;
	}

	var item = {
			"isLocal": $('#cmbIsLocal').val(),
			"logFilePath": $('#txtLogFilePath').val(),
			"recordDescription": $('#cmbRecordDescription').val(),
			"id": createGuid()
	};
	logItemList.push(item);
	createManageLogsTable();
});

//function to create a GUID
function createGuid() {
	var char = (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
	var guid = (char + char + char + "4" + char.substr(0,3) + char + char + char + char).toLowerCase();
	return guid;
}

//created manage logs table
function createManageLogsTable() {

	if ($("#manageLogsTableBodyEmptyInfo").length > 0) {
		$("#manageLogsTableBodyEmptyInfo").remove();
	}
	if(logItemList != null && logItemList.length > 0) {
		var html = "";
		for (var i = 0; i < logItemList.length; i++) {
			var isLocal = logItemList[i].isLocal;
			var recordDescription = logItemList[i].recordDescription;
			var logFilePath = logItemList[i].logFilePath;
			var id = logItemList[i].id;
			var isLocalValue = "Evet";
			if (isLocal == "NO") {
				isLocalValue = "Hayır";
			}

			html += '<tr>';
			html += '<td>'+ isLocalValue +'</td>';
			html += '<td>'+ recordDescription +'</td>';
			html += '<td>'+ logFilePath +'</td>';
			html += '<td class="text-center"><button type="button" id='+ id +' onclick="deleteLogFromManageLogTable(this)" title="Kaldır" class="btn btn-sm btn-outline-danger"><i class="pe-7s-trash btn-icon-wrapper"></i></button></td>';
			html += '</tr>';
		}
		$('#manageLogsTableBody').html(html);
	} else {
		$('#manageLogsTableBody').html('<tr id="manageLogsTableBodyEmptyInfo"><td colspan="100%" class="text-center">Yönetilecek log bulunamadı</td></tr>');
	}
}

//delete log from manage logs table
function deleteLogFromManageLogTable(select) {
	var i = select.parentNode.parentNode.rowIndex;
	document.getElementById("manageLogsTable").deleteRow(i);
	var index = -1;
	for (var i = 0; i < logItemList.length; i++) {
		if (logItemList[i].id == select.id) {
			index = i;
			if (index > -1) {
				logItemList.splice(index, 1);
			}
		}
	}
	if(logItemList == null || logItemList.length == 0) {
		$('#manageLogsTableBody').html('<tr id="manageLogsTableBodyEmptyInfo"><td colspan="100%" class="text-center">Yönetilecek log bulunamadı</td></tr>');
	}
}

/*
 * MANAGE LOGS LIST -->> STOP
 */

function getRsyslogProfileData() {
	var profileData = {};

	if ($('#spinnerLogRotationCount').val() == "") {
		$.notify("Tutulacak eski log alanı boş bırakılamaz.", "warn");
		return;
	}

	if ($('#lblRemoteServerAddress').val() == "" || $('#lblLogPort').val() == "") {
		$.notify("Adres ve port bilgisi boş bırakılamaz.", "warn");
		return;
	}

	profileData.ADDRESS = $('#lblRemoteServerAddress').val();
	profileData.PORT = $('#lblLogPort').val();
	profileData.PROTOCOL = $('#cmbProtocol').val();
	profileData.rotationInterval = $('#cmbRotationFrequency').val();
	profileData.keepBacklogs = parseInt($('#spinnerLogRotationCount').val(), 10);
	profileData.maxSize = $('#lblLogFileSize').val();
	$("#btnCheckNewLogFileAfterRotation").is(':checked') ? profileData.createNewLogFiles = true : profileData.createNewLogFiles = false;
	$("#btnCheckCompressOldLogFiles").is(':checked') ? profileData.compressOldLogFiles = true : profileData.compressOldLogFiles = false;
	$("#btnCheckSkipWithoutError").is(':checked') ? profileData.missingOk = true : profileData.missingOk = false;

	if (logItemList.length > 0) {
		var logList = [];
		var tableId = document.getElementById('manageLogsTable');
		var tBody = tableId.getElementsByTagName('tbody')[0];
		var tableRow = tBody.getElementsByTagName('tr');
		for (var i = 0; i < tableRow.length; i++){
			var tableCell = tableRow[i].getElementsByTagName('td');
			var isLocal = "YES"; 
			if (tableCell[0].innerHTML != "Evet") {
				isLocal = "NO";
			}
			var log = {
					"isLocal": isLocal,
					"recordDescription": tableCell[1].innerHTML,
					"logFilePath": tableCell[2].innerHTML,
			};
			logList.push(log);
		}
		profileData.items = logList;
	}
	return profileData;
}

//save Rsyslog profile
$("#rsyslogProfileSave").click(function(e){
	var label = $('#rsyslogProfileNameForm').val();
	var description = $('#rsyslogProfileDescriptionForm').val();

	if (label != "") {
		if (Object.keys(getRsyslogProfileData()) == 0) {
			$.notify("En az bir adet konfigürasyon eklenmelidir.", "warn");
			return;
		}
		if (checkedRsyslogProfileName(label) == false) {
			var params = {
					"label": label,
					"description": description,
					"profileData": getRsyslogProfileData(),
					"plugin": rsyslogPluginImpl
			};
			$.ajax({
				type : 'POST',
				url : '/profile/add',
				data: JSON.stringify(params),
				dataType : 'json',
				contentType: "application/json",
				success : function(data) {
					if(data != null) {
						$.notify("Rsyslog ayarı başarıyla kaydedildi.", "success");
						rsyslogProfileList.push(data);
						createRsyslogProfileTable();
					} 
				},
				error: function (data, errorThrown) {
					$.notify("Rsyslog ayarı kaydedilirken hata oluştu. ", "error");
				},
			});
		} else {
			$.notify("Ayar adı aynı olamaz.", "warn");
		}
	} else {
		$.notify("Lütfen ayar adı giriniz.", "warn");
	}
});

//delete selected rsyslog profile
$("#rsyslogProfileDel").click(function(e){
	if (selectRsyslogProfile == true) {
		var params = {
				"id": selectedRsyslogProfileId,
		};

		$.ajax({
			type : 'POST',
			url : '/profile/del',
			data: JSON.stringify(params),
			dataType : 'json',
			contentType: "application/json",
			success : function(data) {
				if(data != null) {
					$.notify("Rsyslog ayarı başarıyla silindi.", "success");
					var index = findIndexRsyslogProfile(selectedRsyslogProfileId);
					if (index > -1) {
						rsyslogProfileList.splice(index, 1);
					}
					selectedRsyslogProfileId = null;
					selectRsyslogProfile = false;
					createRsyslogProfileTable();
				} 
			},
			error: function (data, errorThrown) {
				$.notify("Rsyslog ayarı silinirken hata oluştu.", "error");
			},
		});
	} else {
		$.notify("Lütfen silmek için ayar seçiniz.", "warn");
	}
});

function findIndexRsyslogProfile(id) {
	var index = -1;
	for (var i = 0; i < rsyslogProfileList.length; i++) { 
		if (rsyslogProfileList[i]["id"] == id) {
			index = i;
		}
	}
	return index;
}

function checkedRsyslogProfileName(label) {
	var isExist = false;
	for (var i = 0; i < rsyslogProfileList.length; i++) {
		if (label == rsyslogProfileList[i].label) {
			isExist = true;
		}
	}
	return isExist;
}

//added select profile to general profile table profileListTable
$("#rsyslogProfileAddToPolicy").click(function(e){
	for (var i = 0; i < rsyslogProfileList.length; i++) {
		if (selectedRsyslogProfileId == rsyslogProfileList[i].id) {
			addProfileToPolicy(rsyslogProfileList[i]);
		}
	}
});

//updated select profile
$("#rsyslogProfileUpdate").click(function(e){

	var label = $('#rsyslogProfileNameForm').val();
	var description = $('#rsyslogProfileDescriptionForm').val();

	var existLabel = null;
	for (var i = 0; i < rsyslogProfileList.length; i++) {
		if (selectedRsyslogProfileId == rsyslogProfileList[i].id) {
			existLabel = rsyslogProfileList[i].label;
		}
	}

	if (label != "") {
		if (label != existLabel) {
			if (checkedRsyslogProfileName(label) == true) {
				$.notify("Ayar adı aynı olamaz.", "warn");
				return
			}
		}

		if (Object.keys(getRsyslogProfileData()) == 0) {
			$.notify("En az bir adet konfigürasyon eklenmelidir.", "warn");
			return;
		}

		var params = {
				"id": selectedRsyslogProfileId,
				"label": label,
				"description": description,
				"profileData": getRsyslogProfileData(),
		};
		$.ajax({
			type : 'POST',
			url : '/profile/update',
			data: JSON.stringify(params),
			dataType : 'json',
			contentType: "application/json",
			success : function(data) {
				if(data != null) {
					$.notify("Rsyslog ayarı başarıyla güncellendi.", "success");
					var index = findIndexRsyslogProfile(selectedRsyslogProfileId);
					if (index > -1) {
						rsyslogProfileList.splice(index, 1);
					}
					rsyslogProfileList.push(data);
					selectedRsyslogProfileId = null;
					selectRsyslogProfile = false;
					createRsyslogProfileTable();
				}
			},
			error: function (data, errorThrown) {
				$.notify("Rsyslog ayarı güncellenirken hata oluştu.", "error");
			},
		});
	} else {
		$.notify("Lütfen ayar adı giriniz.", "warn");
	}
});
