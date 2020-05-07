/**
 * 	EXECUTE SCRIPT definition and task module
 * This page Script definition. Get script templates from database. Save script and edit, delete registered scripts
 * This task allows registered scripts to run on the agent
 * Tuncay ÇOLAK
 * tuncay.colak@tubitak.gov.tr
 * 
 * http://www.liderahenk.org/
 * 
 */

var dnlist = [];
var scriptTable = null;
var scriptProfileTable = null;
var scriptTempList = [];
var profileList = null;
var sId = null; // selected script id
var selectedScriptContent = null;
var selectedScriptType = null;
var selectedScriptParams = null;
var selectScript = false;
var selectProfile = false;
var selectedScriptProfileId = null;

$("#scriptDelBtn").hide();
$("#scriptCleanBtn").hide();
$("#scriptNameTemp").focus();
$("#scriptContentTemp").val("#!/bin/bash\nset -e");

getScriptTemp();
getProfileList();
hideAndShowProfileButton();

function hideAndShowProfileButton() {
	if (selectProfile == false) {
		$("#scriptProfileDel").hide();
		$("#scriptProfileUpdate").hide();
		$("#scriptProfileAddToPolicy").hide();
		$("#scriptProfileSave").show();
	} else {
		$("#scriptProfileDel").show();
		$("#scriptProfileUpdate").show();
		$("#scriptProfileAddToPolicy").show();
		$("#scriptProfileSave").hide();
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
				createScriptscriptTable();
			}else {
				createScriptscriptTable();
			}
		},
		error: function(result) {
			$.notify(result, "error");
		}
	});
}

function createScriptscriptTable() {
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
//		html += '<td>'+ createDate +'</td>';
//		html += '<td>'+ modifyDate +'</td>';
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
		$("#scriptNameTemp").val("");
		$('#scriptType').val("bash").change();
//		$("#scriptSaveBtn").html("Kaydet");
		$("#scriptSaveBtn").attr("title","Kaydet");
		$("#scriptDelBtn").hide();
		$("#scriptCleanBtn").hide();
		sId = null;
		selectedScriptContent = null;
		selectedScriptType = null;
		selectedScriptParams = null;
		selectScript = false;
	}
	else {
		scriptTable.$('tr.selected').removeClass('selected');
		$(this).addClass('selected');
		$("#scriptSaveBtn").attr("title","Güncelle");
		var rowData = scriptTable.rows('.selected').data()[0];
		sId = $(this).attr('id');
		$("#scriptNameTemp").val(rowData[0]);
		$("#scriptDelBtn").show();
		$("#scriptCleanBtn").show();
		var sType = null;
		selectScript = true;

		if (rowData[1] == "BASH" || rowData[1] == "Bash" || rowData[1] == "bash") {
			sType = "bash";
			selectedScriptType = "BASH";
		}
		else if (rowData[1] == "PYTHON" || rowData[1] == "Python" || rowData[1] == "python") {
			sType = "python";
			selectedScriptType = "PYTHON"
		}
		else if (rowData[1] == "PERL" || rowData[1] == "Perl" || rowData[1] == "perl") {
			sType = "perl";
			selectedScriptType = "PERL";
		}
		else if (rowData[1] == "RUBY" || rowData[1] == "Ruby" || rowData[1] == "ruby") {
			sType = "ruby";
			selectedScriptType = "RUBY";
		}
		$('#scriptType').val(sType).change();
		for (var i = 0; i < scriptTempList.length; i++) {
			if (scriptTempList[i]['id'] == sId) {
				$("#scriptContentTemp").val(scriptTempList[i]['contents']);
				selectedScriptContent = scriptTempList[i]['contents'];
			}
		}
	}
} );


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
			if(data != null && data.length > 0) {
				profileList = data;
				createScriptProfileTable();
			} else {
				createScriptProfileTable();
			}
		}
	});
}

function createScriptProfileTable() {

	for (var i = 0; i < profileList.length; i++) {
		var profileId = profileList[i].id;
		var profileName = profileList[i].label;
		var profileDescription = profileList[i].description;
		var profileCreateDate = profileList[i].createDate;
		var profileOfPlugin = profileList[i].plugin.name;
		var profileDeleted = profileList[i].deleted;
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
			"sSearch": "Profil Ara:",
			"sInfo": "Toplam profil sayısı: _TOTAL_",
			"sInfoEmpty": "Gösterilen profil sayısı: 0",
			"sZeroRecords" : "Profil bulunamadı",
			"sInfoFiltered": " - _MAX_ kayıt arasından",
		},
	} );
}

//save script profile
$("#scriptProfileSave").click(function(e){
	var label = $('#scriptProfileNameForm').val();
	var description = $('#scriptProfileDescriptionForm').val();
	if (selectScript == true) {
		var profileData = {
				"SCRIPT_TYPE": selectedScriptType,
				"SCRIPT_CONTENTS": selectedScriptContent,
				"SCRIPT_PARAMS": selectedScriptParams
		};

		if (label != "") {
			if (checkedProfileName(label) == false) {
				var params = {
						"label": label,
						"description": description,
						"profileData": profileData,
						"pluginName": "script",
				};

				$.ajax({
					type : 'POST',
					url : '/profile/add',
					data: JSON.stringify(params),
					dataType : 'json',
					contentType: "application/json",
					success : function(data) {
						if(data != null) {
							$.notify("Betik profili başarıyla kaydedildi.", "success");
							profileList.push(data);
							scriptProfileTable.clear().draw();
							scriptProfileTable.destroy();
							createScriptProfileTable();
							$('#scriptProfileNameForm').val("");
							$('#scriptProfileDescriptionForm').val("");
						} 
					},
					error: function (data, errorThrown) {
						$.notify("Profil kaydedilirken hata oluştu. ", "error");
					},
				});
			} else {
				$.notify("Profil adı aynı olamaz.", "warn");
			}
		} else {
			$.notify("Profil adı boş bırakılamaz.", "warn");
		}
	} else {
		$.notify("Lütfen Betik Listesinden betik seçiniz.", "warn");
	}
});

$('#scriptProfileTable tbody').on( 'click', 'tr', function () {
	if ( $(this).hasClass('selected') ) {
		$(this).removeClass('selected');
		selectProfile = false;
		selectedScriptProfileId = null;
		hideAndShowProfileButton();
	}
	else {
		scriptProfileTable.$('tr.selected').removeClass('selected');
		$(this).addClass('selected');
		selectedScriptProfileId = $(this).attr('id');
		selectProfile = true;
		hideAndShowProfileButton();
	}
});

//delete selected script profile
$("#scriptProfileDel").click(function(e){
	if (selectProfile == true) {
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
					$.notify("Betik profili başarıyla silindi.", "success");
					removeScriptProfile(data.id);
					selectedScriptProfileId = null;
					scriptProfileTable.clear().draw();
					scriptProfileTable.destroy();
					createScriptProfileTable();
					selectProfile = false;
					hideAndShowProfileButton();
				} 
			},
			error: function (data, errorThrown) {
				$.notify("Profil silinirken hata oluştu.", "error");
			},
		});
	} else {
		$.notify("Lütfen silmek için profil seçiniz.", "warn");
	}
});

function removeScriptProfile(id) {
	var index = profileList.findIndex(function(item, i){
		return item.id === id;
	});
	if (index > -1) {
		profileList.splice(index, 1);
	}
}

function checkedProfileName(label) {
	var isExist = false;
	for (var i = 0; i < profileList.length; i++) {
		if (label == profileList[i].label) {
			isExist = true;
		}
	}
	return isExist;
}

//added select profile to general profile table profileListTable
$("#scriptProfileAddToPolicy").click(function(e){
	for (var i = 0; i < profileList.length; i++) {
		if (selectedScriptProfileId == profileList[i].id) {
			addProfileToPolicy(profileList[i]);
		}
	}
});





























//
//
//
//
//
//$("#scriptType").on("change", function() {
//	var scriptType = $(this).val();
//	var rows = scriptTable.$('tr.selected');
//	if(! rows.length > 0){
//		if (scriptType == "python") {
//			$("#scriptContentTemp").val("#!/usr/bin/python3\n# -*- coding: utf-8 -*-");
//		}
//		else if (scriptType == "bash") {
//			$("#scriptContentTemp").val("#!/bin/bash\nset -e");
//		}
//		else if (scriptType == "perl") {
//			$("#scriptContentTemp").val("#!/usr/bin/perl\nuse strict;\nuse warnings;");
//		}
//		else if (scriptType == "ruby") {
//			$("#scriptContentTemp").val("#!/usr/bin/env ruby");
//		}
//	}
//});
//
////if clicked save and update button 
//$('#scriptSaveBtn').click(function(e){
//	var sType = null;
//	var type = $('#scriptType :selected').val();
//	if (type == "bash") {
//		sType = 0;
//	}
//	else if (type == "python") {
//		sType = 1;
//	}
//	else if (type == "perl") {
//		sType = 2;
//	}
//	else if (type == "ruby") {
//		sType = 3;
//	}
//	var sContent = $("#scriptContentTemp").val();
//	var sName = $("#scriptNameTemp").val();
//	var rows = scriptTable.$('tr.selected');
//
//	if(rows.length){
////		updated script template
//		file = {
//				label: sName,
//				contents: sContent,
//				scriptType: sType,
//				id: sId
//		};
//
//		if (sContent != "" && sName != "" && sType != null) {
//			if (checkedUpdatedScriptName(sName, sId) == false) {
//				$.ajax({
//					type: 'POST', 
//					url: "/script/update",
//					data: JSON.stringify(file),
//					dataType: "json",
//					contentType: "application/json",
//					success: function(data) {
//						if (data != null) {
//							$.notify("Betik başarıyla güncellendi.", "success");
//							updateScriptList(data.id, data.label, data.contents, data.scriptType, data.modifyDate);
//							// the scriptTable is refreshed after the script is updated
//							scriptTable.clear().draw();
//							scriptTable.destroy();
//							createScriptscriptTable();
////							$("#scriptSaveBtn").html("Kaydet");
//							$("#scriptSaveBtn").attr("title","Kaydet");
//						}else {
//							$.notify("Betik güncellenirken hata oluştu.", "error");
//						}
//					}
//				});
//			}else {
//				$.notify("Betik adı zaten var. Farklı bir betik adı giriniz.", "warn");
//				$("#scriptNameTemp").focus();
//			}
//		}else {
//			$.notify("Betik adı ve içeriği boş bırakılamaz.", "warn");
//		}
//		// Otherwise, if no rows are selected. Save script template
//	} else {
//		file = {
//				label: sName,
//				contents: sContent,
//				scriptType: sType
//		};
//		if (sContent != "" && sName != "" && sType != null) {
//			if (checkedScriptName(sName) == false) {
//				$.ajax({
//					type: 'POST', 
//					url: "/script/add",
//					data: JSON.stringify(file),
//					dataType: "json",
//					contentType: "application/json",
//					success: function(data) {
//						if (data != null) {
//							$.notify("Betik başarıyla kaydedildi.", "success");
//							scriptTempList.push(data);
//
//							// the scriptTable is refreshed after the script is saved
//							scriptTable.clear().draw();
//							scriptTable.destroy();
//							createScriptscriptTable();
//							$("#scriptNameTemp").val("");
//							$('#scriptType').val("bash").change();
////							$("#scriptSaveBtn").html("Kaydet");
//							$("#scriptSaveBtn").attr("title","Kaydet");
//						}else {
//							$.notify("Betik kaydedilirken hata oluştu.", "error");
//						}
//					},
//					error: function(result) {
//						$.notify(result, "error");
//					}
//				});
//			}else {
//				$.notify("Betik adı aynı olamaz.", "warn");
//				$("#scriptNameTemp").focus();
//			}
//		}else {
//			$.notify("Betik adı ve içeriği boş bırakılamaz.", "warn");
//		}
//	}
//});
//
////checked script name for added selected script
//function checkedScriptName(sName) {
//	var isExist = false;
//	for (var i = 0; i < scriptTempList.length; i++) {
//		if (sName == scriptTempList[i]["label"]) {
//			isExist = true;
//		}
//	}
//	return isExist;
//}
//
////checked script name for updated selected script
//function checkedUpdatedScriptName(sName, sId) {
//	var isExist = false;
//	for (var i = 0; i < scriptTempList.length; i++) {
//		if (sName == scriptTempList[i]["label"] && sId == scriptTempList[i]["id"]) {
//			isExist = false;
//		}else if (sName == scriptTempList[i]["label"] && sId != scriptTempList[i]["id"]) {
//			isExist = true;
//		}
//	}
//	return isExist;
//}
//
//$('#scriptDelBtn').click(function(e){
//	var rows = scriptTable.$('tr.selected');
//	if(rows.length){
//		var rowData = scriptTable.rows('.selected').data()[0];
//
//		file = {
//				id: sId
//		};
//
//		$.ajax({
//			type: 'POST', 
//			url: "/script/del",
//			data: JSON.stringify(file),
//			dataType: "json",
//			contentType: "application/json",
//			success: function(data) {
//				if (data != null) {
//					$.notify("Betik başarıyla silindi.", "success");
//					removeScriptList(data.id);
//					// the scriptTable is refreshed after the script is deleted
//					scriptTable.clear().draw();
//					scriptTable.destroy();
//					$("#scriptNameTemp").val("");
//					$('#scriptType').val("bash").change();
//					createScriptscriptTable();
//					$("#scriptNameTemp").val("");
//					$('#scriptType').val("bash").change();
////					$("#scriptSaveBtn").html("Kaydet");
//					$("#scriptSaveBtn").attr("title","Kaydet");
//					$("#scriptDelBtn").hide();
//					$("#scriptCleanBtn").hide();
//				}else {
//					$.notify("Betik silinirken hata oluştu.", "error");
//				}
//			}
//		});
//	}else {
//		$.notify("Lütfen silmek için betik seçiniz.", "warn");
//	}
//});
//
//function removeScriptList(id) {
//	var index = scriptTempList.findIndex(function(item, i){
//		return item.id === id;
//	});
//	if (index > -1) {
//		scriptTempList.splice(index, 1);
//	}
//}
//
////updated script template list selected script template
//function updateScriptList(id, scriptName, contents, scriptType, modifyDate) {
//	for (var i = 0; i < scriptTempList.length; i++) {
//		if (scriptTempList[i].id === id) {
//			scriptTempList[i].label = scriptName;
//			scriptTempList[i].scriptType = scriptType;
//			scriptTempList[i].modifyDate = modifyDate;
//			scriptTempList[i].contents = contents;
//		}
//	}
//}
//
//$('#scriptCleanBtn').click(function(e){
//	var rows = scriptTable.$('tr.selected');
//	if(rows.length){
//		scriptTable.$('tr.selected').removeClass('selected');
//		$("#scriptNameTemp").val("");
//		$('#scriptType').val("bash").change();
////		$("#scriptSaveBtn").html("Kaydet");
//		$("#scriptSaveBtn").attr("title","Kaydet");
//	}
//	$("#scriptNameTemp").focus();
//	$("#scriptDelBtn").hide();
//	$("#scriptCleanBtn").hide();
//});
////--->> END <<--- Script Temlate Definition
//
