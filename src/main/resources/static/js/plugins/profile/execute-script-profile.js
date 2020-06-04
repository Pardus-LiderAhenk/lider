/**
 * 	SCRIPT PROFILE definition
 * This page Script profile definition. This page added, updated, deleted and add to policy script profile
 * Tuncay ÇOLAK
 * tuncay.colak@tubitak.gov.tr
 * 
 * http://www.liderahenk.org/
 * 
 */

var scriptTempList = [];
var scriptProfileList = null;
var sId = null; // selected script id
var selectScript = false;
var selectScriptProfile = false;
var selectedScriptProfileId = null;
var sciptPluginImpl = null;

getScriptTemp();
getProfileList();
hideAndShowScriptProfileButton();
$("#scriptProfileEditForm").hide();

for (var i = 0; i < pluginProfileList.length; i++) {
	if(pluginProfileList[i].page == 'execute-script-profile'){
		sciptPluginImpl = pluginProfileList[i].plugin;
	}
}

function getScriptTemp() {

	$.ajax({
		type: 'POST', 
		url: "/script/list",
		dataType: 'json',
		success: function(data) {
			if(data != null && data.length > 0) {
				scriptTempList = data;
				createScriptTempTable();
			}else {
				createScriptTempTable();
			}
		},
		error: function(result) {
			$.notify(result, "error");
		}
	});
}

function createScriptTempTable() {
	if(scriptTempList != null && scriptTempList.length > 0) {
		var script = "";
		for (var i = 0; i < scriptTempList.length; i++) {
			var scriptName = scriptTempList[i]['label'];
			var scriptType = scriptTempList[i]['scriptType'];
			var createDate = scriptTempList[i]['createDate'];
			var modifyDate = scriptTempList[i]['modifyDate'];
			var scriptId = scriptTempList[i]["id"];
			var scriptContents = scriptTempList[i]['contents'];

			if (modifyDate == null) {
				modifyDate = "";
			}
			if (createDate == null) {
				createDate = "";
			}
			script += "<tr id="+ scriptId +">";
			script += '<td>'+ scriptName +'</td>';
			script += '<td>'+ scriptType +'</td>';
			script += '</tr>';
		}
		$("#scriptsBody").html(script);
	} else {
		$('#scriptsBody').html('<tr><td colspan="2" class="text-center">Betik bulunamadı.</td></tr>');
	}
}

$('#scriptTableTemp').on('click', 'tbody tr', function(event) {
	if(scriptTempList != null && scriptTempList.length > 0) {
		if($(this).hasClass('policysettings')){
			$(this).removeClass('policysettings');
			$('#scriptProfileType').val("bash").change();
			sId = null;
			selectScript = false;

		} else {
			$(this).addClass('policysettings').siblings().removeClass('policysettings');
			sId = $(this).attr('id');
			$("#scriptProfileEditForm").show();
			selectScript = true;
			for (var i = 0; i < scriptTempList.length; i++) {
				if (scriptTempList[i]['id'] == sId) {
					$('#scriptProfileContent').val(scriptTempList[i].contents);
					$('#scriptProfileType').val(scriptTempList[i].scriptType.toLowerCase()).change();
				}
			}
		}
	}
	showDetailSelectedScriptAndProfile();
});

$('#scriptProfileTable').on('click', 'tbody tr', function(event) {
	if(scriptProfileList != null && scriptProfileList.length > 0) {
		if($(this).hasClass('policysettings')){
			$(this).removeClass('policysettings');
			selectScriptProfile = false;
			selectedScriptProfileId = null;
			hideAndShowScriptProfileButton();
		} else {
			$(this).addClass('policysettings').siblings().removeClass('policysettings');
			selectedScriptProfileId = $(this).attr('id');
			selectScriptProfile = true;
			hideAndShowScriptProfileButton();
		}
		showDetailSelectedScriptAndProfile();
	}
});

function showDetailSelectedScriptAndProfile() {
	if (selectScript == false && selectScriptProfile == true) {
		for (var i = 0; i < scriptProfileList.length; i++) {
			if (selectedScriptProfileId == scriptProfileList[i].id) {
				$('#scriptProfileContent').val(scriptProfileList[i].profileData.SCRIPT_CONTENTS);
				var existType = scriptProfileList[i].profileData.SCRIPT_TYPE;
				if (existType == "BASH") {
					$('#scriptProfileType').val("bash").change();
				} else if (existType == "PYTHON") {
					$('#scriptProfileType').val("python").change();
				} else if (existType == "RUBY") {
					$('#scriptProfileType').val("ruby").change();
				} else if (existType == "PERL") {
					$('#scriptProfileType').val("perl").change();
				}
				$('#scriptProfileParameters').val(scriptProfileList[i].profileData.SCRIPT_PARAMS);
				$('#scriptProfileNameForm').val(scriptProfileList[i].label);
				$('#scriptProfileDescriptionForm').val(scriptProfileList[i].description);
			}
		}
	} else if (selectScript == false && selectScriptProfile == false) {
		$("#scriptProfileEditForm").hide();
	}
}

function hideAndShowScriptProfileButton() {
	if (selectScriptProfile == false) {
		$("#scriptProfileDel").hide();
		$("#scriptProfileUpdate").hide();
		$("#scriptProfileAddToPolicy").hide();
		$("#scriptProfileSave").show();
		$('#scriptProfileContent').val("");
		$('#scriptProfileParameters').val("");
		$('#scriptProfileType').val("bash").change();
		$('#scriptProfileNameForm').val("");
		$('#scriptProfileDescriptionForm').val("");
	} else {
		$("#scriptProfileDel").show();
		$("#scriptProfileUpdate").show();
		$("#scriptProfileAddToPolicy").show();
		$("#scriptProfileSave").hide();
		$("#scriptProfileEditForm").show();
	}
}

//get script profile list
function getProfileList() {

	var params = {
			"name" : "script"
	};
	$.ajax({
		type : 'POST',
		url : '/profile/list',
		data: params,
		dataType : 'json',
		success : function(data) {
			scriptProfileList = data;
			createScriptProfileTable();
		}
	});
}

function createScriptProfileTable() {
	if ($("#scriptProfileListEmptyInfo").length > 0) {
		$("#scriptProfileListEmptyInfo").remove();
	}

	if(selectScript == true){
		$('#scriptTableTemp tr').removeClass('policysettings');
		$("#scriptProfileEditForm").hide();
		selectScript = false;
	}
	$("#scriptProfileEditForm").hide();

	if(scriptProfileList != null && scriptProfileList.length > 0) {
		var profile = "";
		for (var i = 0; i < scriptProfileList.length; i++) {
			var profileId = scriptProfileList[i].id;
			var profileName = scriptProfileList[i].label;
			var profileDescription = scriptProfileList[i].description;
			var profileCreateDate = scriptProfileList[i].createDate;
			var profileOfPlugin = scriptProfileList[i].plugin.name;
			var profileDeleted = scriptProfileList[i].deleted;
			if (profileDeleted == false) {

				profile += "<tr id="+ profileId +">";
				profile += '<td>'+ profileName +'</td>';
				profile += '<td>'+ profileDescription +'</td>';
				profile += '<td>'+ profileCreateDate +'</td>';
				profile += '</tr>';
			}
		}
		$('#scriptProfileBody').html(profile);
	} else {
		$('#scriptProfileBody').html('<tr id="scriptProfileListEmptyInfo"><td colspan="3" class="text-center">Betik ayarı bulunamadı.</td></tr>');
	}
}

//save script profile
$("#scriptProfileSave").click(function(e){
	var label = $('#scriptProfileNameForm').val();
	var description = $('#scriptProfileDescriptionForm').val();
	if (selectScript == true) {
		var profileData = {
				"SCRIPT_TYPE": $('#scriptProfileType :selected').val().toUpperCase(),
				"SCRIPT_CONTENTS": $("#scriptProfileContent").val(),
				"SCRIPT_PARAMS": $("#scriptProfileParameters").val()
		};

		if (label != "") {
			if (checkedProfileName(label) == false) {
				var params = {
						"label": label,
						"description": description,
						"profileData": profileData,
						"plugin": sciptPluginImpl
				};

				$.ajax({
					type : 'POST',
					url : '/profile/add',
					data: JSON.stringify(params),
					dataType : 'json',
					contentType: "application/json",
					success : function(data) {
						if(data != null) {
							$.notify("Betik ayarı başarıyla kaydedildi.", "success");
							scriptProfileList.push(data);
							createScriptProfileTable();
							$('#scriptProfileNameForm').val("");
							$('#scriptProfileDescriptionForm').val("");
						} 
					},
					error: function (data, errorThrown) {
						$.notify("Betik ayarı kaydedilirken hata oluştu. ", "error");
					},
				});
			} else {
				$.notify("Ayar adı aynı olamaz.", "warn");
			}
		} else {
			$.notify("Lütfen ayar adı giriniz.", "warn");
		}
	} else {
		$.notify("Lütfen Betik Listesinden betik seçiniz.", "warn");
	}
});

//delete selected script profile
$("#scriptProfileDel").click(function(e){
	if (selectScriptProfile == true) {
		var params = {
				"id": selectedScriptProfileId,
		};

		$.ajax({
			type : 'POST',
			url : '/profile/del',
			data: JSON.stringify(params),
			dataType : 'json',
			contentType: "application/json",
			success : function(data) {
				if(data != null) {
					$.notify("Betik ayarı başarıyla silindi.", "success");
					var index = findIndexInScriptProfileList(selectedScriptProfileId);
					if (index > -1) {
						scriptProfileList.splice(index, 1);
					}
					selectedScriptProfileId = null;
					createScriptProfileTable();
					selectScriptProfile = false;
					hideAndShowScriptProfileButton();
				} 
			},
			error: function (data, errorThrown) {
				$.notify("Betik ayarı silinirken hata oluştu.", "error");
			},
		});
	} else {
		$.notify("Lütfen silmek için ayar seçiniz.", "warn");
	}
});

function findIndexInScriptProfileList(id) {
	var index = -1;
	for (var i = 0; i < scriptProfileList.length; i++) { 
		if (scriptProfileList[i]["id"] == id) {
			index = i;
		}
	}
	return index;
}

function checkedProfileName(label) {
	var isExist = false;
	for (var i = 0; i < scriptProfileList.length; i++) {
		if (label == scriptProfileList[i].label) {
			isExist = true;
		}
	}
	return isExist;
}

//added select profile to general profile table profileListTable
$("#scriptProfileAddToPolicy").click(function(e){
	for (var i = 0; i < scriptProfileList.length; i++) {
		if (selectedScriptProfileId == scriptProfileList[i].id) {
			addProfileToPolicy(scriptProfileList[i]);
		}
	}
});

//updated select profile
$("#scriptProfileUpdate").click(function(e){

	var label = $('#scriptProfileNameForm').val();
	var description = $('#scriptProfileDescriptionForm').val();

	var existLabel = null;
	for (var i = 0; i < scriptProfileList.length; i++) {
		if (selectedScriptProfileId == scriptProfileList[i].id) {
			existLabel = scriptProfileList[i].label;
		}
	}
	var profileData = {
			"SCRIPT_TYPE": $('#scriptProfileType :selected').val().toUpperCase(),
			"SCRIPT_CONTENTS": $("#scriptProfileContent").val(),
			"SCRIPT_PARAMS": $("#scriptProfileParameters").val()
	};

	if (label != "") {
		if (label != existLabel) {
			if (checkedProfileName(label) == true) {
				$.notify("Ayar adı aynı olamaz.", "warn");
				return
			}
		}

		var params = {
				"id": selectedScriptProfileId,
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
					$.notify("Betik ayarı başarıyla güncellendi.", "success");
					var index = findIndexInScriptProfileList(selectedScriptProfileId);
					if (index > -1) {
						scriptProfileList.splice(index, 1);
					}
					scriptProfileList.push(data);
					selectedScriptProfileId = null;
					createScriptProfileTable();
					selectScriptProfile = false;
					hideAndShowScriptProfileButton();
				} 
			},
			error: function (data, errorThrown) {
				$.notify("Betik ayarı güncellenirken hata oluştu.", "error");
			},
		});
	} else {
		$.notify("Lütfen ayar adı giriniz.", "warn");
	}
});
