/**
 * CONKY PROFILE definition
 * This page Conky profile definition. This page added, updated, deleted and add to policy conky profile
 * Tuncay ÇOLAK
 * tuncay.colak@tubitak.gov.tr
 * 
 * http://www.liderahenk.org/
 * 
 */

var conkyTempList = [];
var conkyProfileList = null;
var selectConky = false;
var selectConkyProfile = false;
var selectedConkyProfileId = null;
var conkyPluginImpl = null;

getConkyTemp();
getConkyProfileList();
hideAndShowConkyProfileButton();
$('#conkyContentTabProfile').tab('show');
$("#conkyContentEditForm").hide();

for (var i = 0; i < pluginProfileList.length; i++) {
	if(pluginProfileList[i].page == 'conky-profile'){
		conkyPluginImpl = pluginProfileList[i].plugin;
	}
}

//get conky profile list
function getConkyProfileList() {
	var params = {
			"name" : "conky"
	};
	$.ajax({
		type : 'POST',
		url : '/profile/list',
		data: params,
		dataType : 'json',
		success : function(data) {
			conkyProfileList = data;
			createConkyProfileTable();
		}
	});
}

function createConkyProfileTable() {
	if ($("#conkyProfileListEmptyInfo").length > 0) {
		$("#conkyProfileListEmptyInfo").remove();
	}

	if(conkyProfileList != null && conkyProfileList.length > 0) {
		var profile = "";
		for (var i = 0; i < conkyProfileList.length; i++) {
			var profileId = conkyProfileList[i].id;
			var profileName = conkyProfileList[i].label;
			var profileDescription = conkyProfileList[i].description;
			var profileCreateDate = conkyProfileList[i].createDate;
			var profileOfPlugin = conkyProfileList[i].plugin.name;
			var profileDeleted = conkyProfileList[i].deleted;
			if (profileDeleted == false) {

				profile += "<tr id="+ profileId +">";
				profile += '<td>'+ profileName +'</td>';
				profile += '<td>'+ profileDescription +'</td>';
				profile += '<td>'+ profileCreateDate +'</td>';
				profile += '</tr>';
			}
		}
		$('#conkyProfileBody').html(profile);
	} else {
		$('#conkyProfileBody').html('<tr id="conkyProfileListEmptyInfo"><td colspan="3" class="text-center">Sistem Gözlemcisi ayarı bulunamadı.</td></tr>');
	}
}

//get conky template from db
function getConkyTemp() {
	$.ajax({
		type: 'POST', 
		url: "/conky/list",
		dataType: 'json',
		success: function(data) {
			if(data != null && data.length > 0) {
				conkyTempList = data;
				for (var i = 0; i < data.length; i++) {
					$('#conkyTempSelectBox').append($('<option>', {
						id: data[i]["id"],
						text: data[i]["label"],
						value : data[i]["contents"],
						name: data[i]["settings"]
					}));
				}
			}else {
				$('#conkyTempSelectBox').append($('<option>', {
					text: "...",
					selected: true
				}));
			}
		},
		error: function(result) {
			$.notify(result, "error");
		}
	});
}

$('#conkyTempSelectBox').change(function(){ 
	var selectedConkyTemp = $(this).val();
	var conkyTempId = $(this).find('option:selected').attr('id');
	var conkyTempContent = $(this).find('option:selected').attr('value');
	var conkyTempSetting = $(this).find('option:selected').attr('name');

	if (selectedConkyTemp != "NA") {
		$("#conkyContentTempProfile").val(conkyTempContent);
		$("#conkySettingsProfile").val(conkyTempSetting);
		$("#conkyContentEditForm").show();
		selectConky = true;
	}else {
		$("#conkyContentTempProfile").val("");
		$("#conkySettingsProfile").val("");
		selectConky = false;
		$("#conkyContentEditForm").hide();
	}
});

$('#conkyProfileTable').on('click', 'tbody tr', function(event) {
	if(conkyProfileList != null && conkyProfileList.length > 0) {
		if($(this).hasClass('policysettings')){
			$(this).removeClass('policysettings');
			selectConkyProfile = false;
			selectedConkyProfileId = null;
			hideAndShowConkyProfileButton();
		} else {
			$(this).addClass('policysettings').siblings().removeClass('policysettings');
			selectedConkyProfileId = $(this).attr('id');
			selectConkyProfile = true;
			hideAndShowConkyProfileButton();
			showDetailSelectedConkyProfile();
		}
	}
});

function showDetailSelectedConkyProfile() {
	if (selectConkyProfile == true) {
		for (var i = 0; i < conkyProfileList.length; i++) {
			if (selectedConkyProfileId == conkyProfileList[i].id) {
				var msg = conkyProfileList[i].profileData.message;
				var lines = msg.split('\n#parser_content_with_settings\n');
				$('#conkyContentTempProfile').val(lines[1]);
				$('#conkySettingsProfile').val(lines[0]);
				$('#conkyProfileNameForm').val(conkyProfileList[i].label);
				$('#conkyProfileDescriptionForm').val(conkyProfileList[i].description);
			}
		}
	}
}

function hideAndShowConkyProfileButton() {
	$("#conkyContentTempProfile").val("");
	$("#conkySettingsProfile").val("");
	$('#conkyTempSelectBox').val("NA").change();
	if (selectConkyProfile == false) {
		$("#conkyProfileDel").hide();
		$("#conkyProfileUpdate").hide();
		$("#conkyProfileAddToPolicy").hide();
		$("#conkyProfileSave").show();
		$('#conkyProfileNameForm').val("");
		$('#conkyProfileDescriptionForm').val("");
		$("#conkyContentEditForm").hide();
	} else {
		$("#conkyProfileDel").show();
		$("#conkyProfileUpdate").show();
		$("#conkyProfileAddToPolicy").show();
		$("#conkyProfileSave").hide();
		$("#conkyContentEditForm").show();
	}
}

// find index by id in conky profile list
function findIndexInConkyProfileList(id) {
	var index = -1;
	for (var i = 0; i < conkyProfileList.length; i++) { 
		if (conkyProfileList[i]["id"] == id) {
			index = i;
		}
	}
	return index;
}

// checked profile name by label
function checkedProfileName(label) {
	var isExist = false;
	for (var i = 0; i < conkyProfileList.length; i++) {
		if (label == conkyProfileList[i].label) {
			isExist = true;
		}
	}
	return isExist;
}

//added select profile to general profile table profileListTable
$("#conkyProfileAddToPolicy").click(function(e){
	for (var i = 0; i < conkyProfileList.length; i++) {
		if (selectedConkyProfileId == conkyProfileList[i].id) {
			addProfileToPolicy(conkyProfileList[i]);
		}
	}
});

//save conky profile
$("#conkyProfileSave").click(function(e){
	var label = $('#conkyProfileNameForm').val();
	var description = $('#conkyProfileDescriptionForm').val();
	if (selectConky == true) {
		var message = $("#conkySettingsProfile").val() + "\n#parser_content_with_settings\n" + $("#conkyContentTempProfile").val();
		var profileData = {
				"message": message
		};

		if (label != "") {
			if (checkedProfileName(label) == false) {
				var params = {
						"label": label,
						"description": description,
						"profileData": profileData,
						"plugin": conkyPluginImpl
				};

				$.ajax({
					type : 'POST',
					url : '/profile/add',
					data: JSON.stringify(params),
					dataType : 'json',
					contentType: "application/json",
					success : function(data) {
						if(data != null) {
							$.notify("Sistem Gözlemcisi ayarı başarıyla kaydedildi.", "success");
							conkyProfileList.push(data);
							createConkyProfileTable();
							$('#conkyProfileNameForm').val("");
							$('#conkyProfileDescriptionForm').val("");
							selectConkyProfile = false;
							hideAndShowConkyProfileButton();
						} 
					},
					error: function (data, errorThrown) {
						$.notify("Sistem Gözlemcisi ayarı kaydedilirken hata oluştu. ", "error");
					},
				});
			} else {
				$.notify("Ayar adı aynı olamaz.", "warn");
			}
		} else {
			$.notify("Lütfen ayar adı giriniz.", "warn");
		}
	} else {
		$.notify("Lütfen Gözlemci Şablonu seçiniz.", "warn");
	}
});

//delete selected conky profile
$("#conkyProfileDel").click(function(e){
	if (selectConkyProfile == true) {
		var params = {
				"id": selectedConkyProfileId,
		};

		$.ajax({
			type : 'POST',
			url : '/profile/del',
			data: JSON.stringify(params),
			dataType : 'json',
			contentType: "application/json",
			success : function(data) {
				if(data != null) {
					$.notify("Sistem Gözlemcisi ayarı başarıyla silindi.", "success");
					var index = findIndexInConkyProfileList(selectedConkyProfileId);
					if (index > -1) {
						conkyProfileList.splice(index, 1);
					}
					selectedConkyProfileId = null;
					createConkyProfileTable();
					selectConkyProfile = false;
					hideAndShowConkyProfileButton();
				} 
			},
			error: function (data, errorThrown) {
				$.notify("Sistem Gözlemcisi ayarı silinirken hata oluştu.", "error");
			},
		});
	} else {
		$.notify("Lütfen silmek için ayar seçiniz.", "warn");
	}
});

//updated select profile
$("#conkyProfileUpdate").click(function(e){

	var label = $('#conkyProfileNameForm').val();
	var description = $('#conkyProfileDescriptionForm').val();

	var existLabel = null;
	for (var i = 0; i < conkyProfileList.length; i++) {
		if (selectedConkyProfileId == conkyProfileList[i].id) {
			existLabel = conkyProfileList[i].label;
		}
	}
	var message = $("#conkySettingsProfile").val() + "\n#parser_content_with_settings\n" + $("#conkyContentTempProfile").val();
	var profileData = {
			"message": message
	};

	if (label != "") {
		if (label != existLabel) {
			if (checkedProfileName(label) == true) {
				$.notify("Ayar adı aynı olamaz.", "warn");
				return
			}
		}

		var params = {
				"id": selectedConkyProfileId,
				"label": label,
				"description": description,
				"profileData": profileData,
		};
		$.ajax({
			type : 'POST',
			url : '/profile/update',
			data: JSON.stringify(params),
			dataType : 'json',
			contentType: "application/json",
			success : function(data) {
				if(data != null) {
					$.notify("Sistem Gözlemcisi ayarı başarıyla güncellendi.", "success");
					var index = findIndexInConkyProfileList(selectedConkyProfileId);
					if (index > -1) {
						conkyProfileList.splice(index, 1);
					}
					conkyProfileList.push(data);
					selectedConkyProfileId = null;
					createConkyProfileTable();
					selectConkyProfile = false;
					hideAndShowConkyProfileButton();
				} 
			},
			error: function (data, errorThrown) {
				$.notify("Sistem Gözlemcisi ayarı güncellenirken hata oluştu.", "error");
			},
		});
	} else {
		$.notify("Lütfen ayar adı giriniz.", "warn");
	}
});
