/**
 * 	SCRIPT PROFILE definition
 * This page Script profile definition. This page added, updated, deleted and add to policy script profile
 * Tuncay ÇOLAK
 * tuncay.colak@tubitak.gov.tr
 * 
 * http://www.liderahenk.org/
 * 
 */

var scriptTable = null;
var scriptProfileTable = null;
var scriptTempList = [];
var scriptProfileList = null;
var sId = null; // selected script id
var selectScript = false;
var selectScriptProfile = false;
var selectedScriptProfileId = null;
var pluginImpl = null;

getScriptTemp();
getProfileList();
hideAndShowScriptProfileButton();
$("#scriptProfileEditForm").hide();

for (var i = 0; i < pluginProfileList.length; i++) {
	if(pluginProfileList[i].page == 'execute-script-profile'){
		pluginImpl = pluginProfileList[i].plugin;
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
		var newRow = $("<tr id="+ scriptId +">");
		var html = '<td>'+ scriptName +'</td>';
		html += '<td>'+ scriptType +'</td>';
		newRow.append(html);
		$("#scriptTableTemp").append(newRow);
	}

	scriptTable = $('#scriptTableTemp').DataTable( {
		"scrollY": "200px",
		"scrollX": false,
		"paging": false,
		"scrollCollapse": true,
		"oLanguage": {
			"sSearch": "Betik Ara:",
			"sInfo": "Toplam Betik sayısı: _TOTAL_",
			"sInfoEmpty": "Gösterilen betik sayısı: 0",
			"sZeroRecords" : "Betik bulunamadı",
			"sInfoFiltered": " - _MAX_ kayıt arasından",
		},
	} );
}

$('#scriptTableTemp tbody').on( 'click', 'tr', function () {
	if ( $(this).hasClass('selected') ) {
		$(this).removeClass('selected');
		$('#scriptProfileType').val("bash").change();
		sId = null;
		selectScript = false;
	}
	else {
		scriptTable.$('tr.selected').removeClass('selected');
		$(this).addClass('selected');
		var rowData = scriptTable.rows('.selected').data()[0];
		sId = $(this).attr('id');
		$("#scriptProfileEditForm").show();
		var sType = null;
		selectScript = true;

		if (rowData[1] == "BASH" || rowData[1] == "Bash" || rowData[1] == "bash") {
			sType = "bash";
		}
		else if (rowData[1] == "PYTHON" || rowData[1] == "Python" || rowData[1] == "python") {
			sType = "python";
		}
		else if (rowData[1] == "PERL" || rowData[1] == "Perl" || rowData[1] == "perl") {
			sType = "perl";
		}
		else if (rowData[1] == "RUBY" || rowData[1] == "Ruby" || rowData[1] == "ruby") {
			sType = "ruby";
		}
		$('#scriptProfileType').val(sType).change();
		for (var i = 0; i < scriptTempList.length; i++) {
			if (scriptTempList[i]['id'] == sId) {
				$('#scriptProfileContent').val(scriptTempList[i]['contents']);
			}
		}
	}
	showDetailSelectedScriptAndProfile();
} );

$('#scriptProfileTable tbody').on( 'click', 'tr', function () {
	if (scriptProfileTable) {
		if ( $(this).hasClass('selected') ) {
			$(this).removeClass('selected');
			selectScriptProfile = false;
			selectedScriptProfileId = null;
			hideAndShowScriptProfileButton();
		}
		else {
			scriptProfileTable.$('tr.selected').removeClass('selected');
			$(this).addClass('selected');
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
	if ($("#scriptProfleListEmptyInfo").length > 0) {
		$("#scriptProfleListEmptyInfo").remove();
	}

	if (scriptTable) {
		scriptTable.$('tr.selected').removeClass('selected');
		$("#scriptProfileEditForm").hide();
		selectScript = false;
	}

	if (scriptProfileTable) {
		scriptProfileTable.clear();
		scriptProfileTable.destroy();
		scriptProfileTable = null;
	}
	if(scriptProfileList != null && scriptProfileList.length > 0) {
		for (var i = 0; i < scriptProfileList.length; i++) {
			var profileId = scriptProfileList[i].id;
			var profileName = scriptProfileList[i].label;
			var profileDescription = scriptProfileList[i].description;
			var profileCreateDate = scriptProfileList[i].createDate;
			var profileOfPlugin = scriptProfileList[i].plugin.name;
			var profileDeleted = scriptProfileList[i].deleted;
			if (profileDeleted == false) {
				var year = profileCreateDate.substring(0,4);
				var month = profileCreateDate.substring(5,7);
				var day = profileCreateDate.substring(8,10);
				var time = profileCreateDate.substring(11,16);
				var createDate = day + '.' + month + '.' + year + ' ' + time;

				var newRow = $("<tr id="+ profileId +">");
				var html = '<td>'+ profileName +'</td>';
				html += '<td>'+ profileDescription +'</td>';
				html += '<td>'+ profileCreateDate +'</td>';
				newRow.append(html);
				$('#scriptProfileTable').append(newRow);
			}
		}
		scriptProfileTable = $('#scriptProfileTable').DataTable( {
			"scrollY": "200px",
			"scrollX": false,
			"paging": false,
			"scrollCollapse": true,
			"oLanguage": {
				"sSearch": "Ara:",
				"sInfo": "Toplam ayar sayısı: _TOTAL_",
				"sInfoEmpty": "Gösterilen ayar sayısı: 0",
				"sZeroRecords" : "Ayar bulunamadı",
				"sInfoFiltered": " - _MAX_ kayıt arasından",
			},
		} );
	} else {
		$('#scriptProfileBody').html('<tr id="scriptProfleListEmptyInfo"><td colspan="3" class="text-center">Betik ayarı bulunamadı.</td></tr>');
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
						"plugin": pluginImpl
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
