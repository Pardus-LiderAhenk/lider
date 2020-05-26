/**
 * USB Profile, Device Mamagement and Created white or black list
 * Tuncay ÇOLAK
 * tuncay.colak@tubitak.gov.tr
 * 
 * http://www.liderahenk.org/
 * 
 */

var usbProfileList = null;
var selectUsbProfile = false;
var usbPluginImpl = null;
var selectedUsbProfileId = null;
var usbItemList = [];

getProfileList();
hideAndShowUsbProfileButton();
createWhiteBlackListTable();

for (var i = 0; i < pluginProfileList.length; i++) {
	if(pluginProfileList[i].page == 'usb-profile'){
		usbPluginImpl = pluginProfileList[i].plugin;
	}
}

//get usb profile list
function getProfileList() {
	var params = {
			"name" : "usb"
	};
	$.ajax({
		type : 'POST',
		url : '/profile/list',
		data: params,
		dataType : 'json',
		success : function(data) {
			usbProfileList = data;
			createUsbProfileTable();
		}
	});
}

$('#usbProfileTable').on('click', 'tbody tr', function(event) {
	if(usbProfileList != null && usbProfileList.length > 0) {
		defaultUsbSetting();
		if($(this).hasClass('policysettings')){
			$(this).removeClass('policysettings');
			selectUsbProfile = false;
			selectedUsbProfileId = null;
			hideAndShowUsbProfileButton();
		} else {
			$(this).addClass('policysettings').siblings().removeClass('policysettings');
			selectedUsbProfileId = $(this).attr('id');
			selectUsbProfile = true;
			hideAndShowUsbProfileButton();
			showDetailSelectedUsbProfile();
		}
	}
});

function showDetailSelectedUsbProfile() {
	for (var i = 0; i < usbProfileList.length; i++) {
		if (selectedUsbProfileId == usbProfileList[i].id) {
			$('#usbProfileNameForm').val(usbProfileList[i].label);
			$('#usbProfileDescriptionForm').val(usbProfileList[i].description);
			if (usbProfileList[i].profileData.storage) {
				$('#usbSelectBox').val(usbProfileList[i].profileData.storage).change();
			}
			if (usbProfileList[i].profileData.printer) {
				$('#printerManageCb').val(usbProfileList[i].profileData.printer).change();
			}
			if (usbProfileList[i].profileData.webcam) {
				$('#webCamManageCb').val(usbProfileList[i].profileData.webcam).change();
			}
			if (usbProfileList[i].profileData.mouseKeyboard) {
				$('#mouseKeyboardManageCb').val(usbProfileList[i].profileData.mouseKeyboard).change();
			}
			if (usbProfileList[i].profileData.type) {
				if (usbProfileList[i].profileData.type == "whitelist") {
					$("#whiteListBtn").prop("checked", true);
				} else {
					$("#blackListBtn").prop("checked", true);
				}
			}
			if (usbProfileList[i].profileData.items) {
				usbItemList = usbProfileList[i].profileData.items;
				createWhiteBlackListTable();
			}
		}
	}
} 

function defaultUsbSetting() {
	$('#usbProfileNameForm').val("");
	$('#usbProfileDescriptionForm').val("");
	$('#usbVendor').val("");
	$('#usbSerialNumber').val("");
	$('#usbModel').val("");
	$('#usbSelectBox').val("NA").change();
	$('#printerManageCb').val("NA").change();
	$('#webCamManageCb').val("NA").change();
	$('#mouseKeyboardManageCb').val("NA").change();
	$("#whiteListBtn").prop("checked", true);
	usbItemList = [];
	createWhiteBlackListTable();
}

function hideAndShowUsbProfileButton() {
	if (selectUsbProfile == false) {
		$("#usbProfileDel").hide();
		$("#usbProfileUpdate").hide();
		$("#usbProfileAddToPolicy").hide();
		$("#usbProfileSave").show();
	} else {
		$("#usbProfileDel").show();
		$("#usbProfileUpdate").show();
		$("#usbProfileAddToPolicy").show();
		$("#usbProfileSave").hide();
	}
}

//created usb profile table
function createUsbProfileTable() {
	hideAndShowUsbProfileButton();
	defaultUsbSetting();
	if ($("#usbProfleListEmptyInfo").length > 0) {
		$("#usbProfleListEmptyInfo").remove();
	}

	if(usbProfileList != null && usbProfileList.length > 0) {
		var profile = "";
		for (var i = 0; i < usbProfileList.length; i++) {
			var profileId = usbProfileList[i].id;
			var profileName = usbProfileList[i].label;
			var profileDescription = usbProfileList[i].description;
			var profileCreateDate = usbProfileList[i].createDate;
			var profileOfPlugin = usbProfileList[i].plugin.name;
			var profileDeleted = usbProfileList[i].deleted;
			if (profileDeleted == false) {

				profile += "<tr id="+ profileId +">";
				profile += '<td>'+ profileName +'</td>';
				profile += '<td>'+ profileDescription +'</td>';
				profile += '<td>'+ profileCreateDate +'</td>';
				profile += '</tr>';
			}
		}
		$('#usbProfileBody').html(profile);
	} else {
		$('#usbProfileBody').html('<tr id="usbProfleListEmptyInfo"><td colspan="3" class="text-center">USB ayarı bulunamadı.</td></tr>');
	}
}

/*
 * WHITE OR BLACK LIST -->> START
 */
//add usb to white or black list table
$("#usbAdd").click(function(e){
	var usb = [];
	if ($('#usbVendor').val() != "" || $('#usbModel').val() != "" || $('#usbSerialNumber').val() != "") {
		var usbId = Math.random().toString(36).substring(7);
		var item = {
				"vendor": $('#usbVendor').val(),
				"serialNumber": $('#usbSerialNumber').val(),
				"model": $('#usbModel').val(),
				"id": usbId
		};

		usbItemList.push(item);
		createWhiteBlackListTable();
		$('#usbVendor').val("");
		$('#usbSerialNumber').val("");
		$('#usbModel').val("");
	} else {
		$.notify("Üretici firma, model ya da seri numarası özelliklerinden az bir tanesi girilmelidir.", "warn");
	}
});

//created white or black list table
function createWhiteBlackListTable() {

	if ($("#whiteBlackListBodyEmptyInfo").length > 0) {
		$("#whiteBlackListBodyEmptyInfo").remove();
	}
	if(usbItemList != null && usbItemList.length > 0) {
		var html = "";
		for (var i = 0; i < usbItemList.length; i++) {
			var model = usbItemList[i].model;
			var serialNumber = usbItemList[i].serialNumber;
			var vendor = usbItemList[i].vendor;
			var id = usbItemList[i].id;

			html += '<tr>';
			html += '<td>'+ vendor +'</td>';
			html += '<td>'+ model +'</td>';
			html += '<td>'+ serialNumber +'</td>';
			html += '<td class="text-center"><button type="button" id='+ id +' onclick="deleteUsbFromWhiteBlackList(this)" title="Kaldır" class="btn btn-sm btn-outline-danger"><i class="pe-7s-trash btn-icon-wrapper"></i></button></td>';
			html += '</tr>';
		}
		$('#whiteBlackListBody').html(html);
	} else {
		$('#whiteBlackListBody').html('<tr id="whiteBlackListBodyEmptyInfo"><td colspan="4" class="text-center">Beyaz/Kara Liste bulunamadı</td></tr>');
	}
}

//delete usb from white or black list table
function deleteUsbFromWhiteBlackList(select) {
	var i = select.parentNode.parentNode.rowIndex;
	document.getElementById("whiteBlackListTable").deleteRow(i);
	var index = -1;
	for (var i = 0; i < usbItemList.length; i++) {
		if (usbItemList[i].id == select.id) {
			index = i;
			if (index > -1) {
				usbItemList.splice(index, 1);
			}
		}
	}
	if(usbItemList == null || usbItemList.length == 0) {
		$('#whiteBlackListBody').html('<tr id="whiteBlackListBodyEmptyInfo"><td colspan="4" class="text-center">Beyaz/Kara Liste bulunamadı</td></tr>');
	}
}

/*
 * WHITE OR BLACK LIST -->> STOP
 */

function getProfileData() {
	var profileData = {};

	if ($('#usbSelectBox').val() != "NA") {
		profileData.storage = $('#usbSelectBox').val();
	}
	if ($('#printerManageCb').val() != "NA") {
		profileData.printer = $('#printerManageCb').val();
	}
	if ($('#webCamManageCb').val() != "NA") {
		profileData.webcam = $('#webCamManageCb').val();
	}
	if ($('#mouseKeyboardManageCb').val() != "NA") {
		profileData.mouseKeyboard = $('#mouseKeyboardManageCb').val();
	}

	if (usbItemList.length > 0) {
		profileData.type = $("input[type='radio'][name='whiteListBtn']:checked").val();
		var usbList = [];

		for (var i = 0; i < usbItemList.length; i++) {
			var usb = {
					"vendor": usbItemList[i].vendor,
					"serialNumber": usbItemList[i].serialNumber,
					"model": usbItemList[i].model,
			};
			usbList.push(usb);
		}
		profileData.items = usbList;
	}
	return profileData;
}

//save USB profile
$("#usbProfileSave").click(function(e){
	var label = $('#usbProfileNameForm').val();
	var description = $('#usbProfileDescriptionForm').val();

	if (label != "") {
		if (Object.keys(getProfileData()) == 0) {
			$.notify("En az bir adet konfigürasyon eklenmelidir.", "warn");
			return;
		}
		if (checkedProfileName(label) == false) {
			var params = {
					"label": label,
					"description": description,
					"profileData": getProfileData(),
					"plugin": usbPluginImpl
			};
			$.ajax({
				type : 'POST',
				url : '/profile/add',
				data: JSON.stringify(params),
				dataType : 'json',
				contentType: "application/json",
				success : function(data) {
					if(data != null) {
						$.notify("USB ayarı başarıyla kaydedildi.", "success");
						usbProfileList.push(data);
						createUsbProfileTable();
					} 
				},
				error: function (data, errorThrown) {
					$.notify("USB ayarı kaydedilirken hata oluştu. ", "error");
				},
			});
		} else {
			$.notify("Ayar adı aynı olamaz.", "warn");
		}
	} else {
		$.notify("Lütfen ayar adı giriniz.", "warn");
	}
});

//delete selected login manager profile
$("#usbProfileDel").click(function(e){
	if (selectUsbProfile == true) {
		var params = {
				"id": selectedUsbProfileId,
		};

		$.ajax({
			type : 'POST',
			url : '/profile/del',
			data: JSON.stringify(params),
			dataType : 'json',
			contentType: "application/json",
			success : function(data) {
				if(data != null) {
					$.notify("USB ayarı başarıyla silindi.", "success");
					var index = findIndexIndexUsbProfile(selectedUsbProfileId);
					if (index > -1) {
						usbProfileList.splice(index, 1);
					}
					selectedUsbProfileId = null;
					selectUsbProfile = false;
					createUsbProfileTable();
				} 
			},
			error: function (data, errorThrown) {
				$.notify("USB ayarı silinirken hata oluştu.", "error");
			},
		});
	} else {
		$.notify("Lütfen silmek için ayar seçiniz.", "warn");
	}
});

function findIndexUsbProfile(id) {
	var index = -1;
	for (var i = 0; i < usbProfileList.length; i++) { 
		if (usbProfileList[i]["id"] == id) {
			index = i;
		}
	}
	return index;
}

function checkedProfileName(label) {
	var isExist = false;
	for (var i = 0; i < usbProfileList.length; i++) {
		if (label == usbProfileList[i].label) {
			isExist = true;
		}
	}
	return isExist;
}

//added select profile to general profile table profileListTable
$("#usbProfileAddToPolicy").click(function(e){
	for (var i = 0; i < usbProfileList.length; i++) {
		if (selectedUsbProfileId == usbProfileList[i].id) {
			addProfileToPolicy(usbProfileList[i]);
		}
	}
});

//updated select profile
$("#usbProfileUpdate").click(function(e){

	var label = $('#usbProfileNameForm').val();
	var description = $('#usbProfileDescriptionForm').val();

	var existLabel = null;
	for (var i = 0; i < usbProfileList.length; i++) {
		if (selectedUsbProfileId == usbProfileList[i].id) {
			existLabel = usbProfileList[i].label;
		}
	}

	if (label != "") {
		if (label != existLabel) {
			if (checkedProfileName(label) == true) {
				$.notify("Ayar adı aynı olamaz.", "warn");
				return
			}
		}

		if (Object.keys(getProfileData()) == 0) {
			$.notify("En az bir adet konfigürasyon eklenmelidir.", "warn");
			return;
		}

		var params = {
				"id": selectedUsbProfileId,
				"label": label,
				"description": description,
				"profileData": getProfileData(),
		};
		$.ajax({
			type : 'POST',
			url : '/profile/update',
			data: JSON.stringify(params),
			dataType : 'json',
			contentType: "application/json",
			success : function(data) {
				if(data != null) {
					$.notify("USB ayarı başarıyla güncellendi.", "success");
					var index = findIndexUsbProfile(selectedUsbProfileId);
					if (index > -1) {
						usbProfileList.splice(index, 1);
					}
					usbProfileList.push(data);
					selectedUsbProfileId = null;
					selectUsbProfile = false;
					createUsbProfileTable();
				} 
			},
			error: function (data, errorThrown) {
				$.notify("USB ayarı güncellenirken hata oluştu.", "error");
			},
		});
	} else {
		$.notify("Lütfen ayar adı giriniz.", "warn");
	}
});
