/**
 * This page Script definition. Get script templates from database. Save script and edit, delete registered scripts
 * Tuncay ÇOLAK
 * tuncay.colak@tubitak.gov.tr
 * 
 * http://www.liderahenk.org/
 * 
 */

var table;
var scriptTempList = [];
var sId = null; // selected script id

$(document).ready(function(){
	$("#scriptDelBtn").hide();
	$("#scriptCleanBtn").hide();
	$("#scriptNameTemp").focus();
	$("#scriptContentTemp").val("#!/bin/bash\nset -e");
	getScriptTemp()
});

function getScriptTemp() {

	$.ajax({
		type: 'POST', 
		url: "/script/list",
		dataType: 'json',
		success: function(data) {
			if(data != null && data.length > 0) {
				scriptTempList = data;
				createScriptTable();
			}else {
				createScriptTable();
			}
		},
		error: function(result) {
			$.notify(result, "error");
		}
	});
}

function createScriptTable() {
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
		html += '<td>'+ createDate +'</td>';
		html += '<td>'+ modifyDate +'</td>';
		newRow.append(html);
		$("#scriptTableTemp").append(newRow);
	}

	table = $('#scriptTableTemp').DataTable( {
		"scrollY": "450px",
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
		$("#scriptSaveBtn").html("Kaydet");
		$("#scriptDelBtn").hide();
		$("#scriptCleanBtn").hide();
		sId = null;
	}
	else {
		table.$('tr.selected').removeClass('selected');
		$(this).addClass('selected');
		$("#scriptSaveBtn").html("Güncelle");
		var rowData = table.rows('.selected').data()[0];
		sId = $(this).attr('id');
		$("#scriptNameTemp").val(rowData[0]);
		$("#scriptDelBtn").show();
		$("#scriptCleanBtn").show();
		var sType = null;

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
		$('#scriptType').val(sType).change();
		for (var i = 0; i < scriptTempList.length; i++) {
			if (scriptTempList[i]['id'] == sId) {
				$("#scriptContentTemp").val(scriptTempList[i]['contents']);
			}
		}
	}
} );

$("#scriptType").on("change", function() {
	var scriptType = $(this).val();
	var rows = table.$('tr.selected');
	if(! rows.length > 0){
		if (scriptType == "python") {
			$("#scriptContentTemp").val("#!/usr/bin/python3\n# -*- coding: utf-8 -*-");
		}
		else if (scriptType == "bash") {
			$("#scriptContentTemp").val("#!/bin/bash\nset -e");
		}
		else if (scriptType == "perl") {
			$("#scriptContentTemp").val("#!/usr/bin/perl\nuse strict;\nuse warnings;");
		}
		else if (scriptType == "ruby") {
			$("#scriptContentTemp").val("#!/usr/bin/env ruby");
		}
	}
});

//if clicked save and update button 
$('#scriptSaveBtn').click(function(e){
	var sType = null;
	var type = $('#scriptType :selected').val();
	if (type == "bash") {
		sType = 0;
	}
	else if (type == "python") {
		sType = 1;
	}
	else if (type == "perl") {
		sType = 2;
	}
	else if (type == "ruby") {
		sType = 3;
	}
	var sContent = $("#scriptContentTemp").val();
	var sName = $("#scriptNameTemp").val();
	var rows = table.$('tr.selected');

	if(rows.length){
//		updated script template
		file = {
				label: sName,
				contents: sContent,
				scriptType: sType,
				id: sId
		};

		if (sContent != "" && sName != "" && sType != null) {
			if (checkedUpdatedScriptName(sName, sId) == false) {
				$.ajax({
					type: 'POST', 
					url: "/script/update",
					data: JSON.stringify(file),
					dataType: "json",
					contentType: "application/json",
					success: function(data) {
						if (data != null) {
							$.notify("Betik başarıyla güncellendi.", "success");
							updateScriptList(data.id, data.label, data.contents, data.scriptType, data.modifyDate);
							// the table is refreshed after the script is updated
							table.clear().draw();
							table.destroy();
							createScriptTable();

							$("#scriptNameTemp").val("");
							$('#scriptType').val("bash").change();
							$("#scriptSaveBtn").html("Kaydet");
							$("#scriptDelBtn").hide();
							$("#scriptCleanBtn").hide();
						}else {
							$.notify("Betik güncellenirken hata oluştu.", "error");
						}
					}
				});
			}else {
				$.notify("Betik adı zaten var. Farklı bir betik adı giriniz.", "warn");
				$("#scriptNameTemp").focus();
			}
		}else {
			$.notify("Betik adı ve içeriği boş bırakılamaz.", "warn");
		}
		// Otherwise, if no rows are selected. Save script template
	} else {
		file = {
				label: sName,
				contents: sContent,
				scriptType: sType
		};
		if (sContent != "" && sName != "" && sType != null) {
			if (checkedScriptName(sName) == false) {
				$.ajax({
					type: 'POST', 
					url: "/script/add",
					data: JSON.stringify(file),
					dataType: "json",
					contentType: "application/json",
					success: function(data) {
						if (data != null) {
							$.notify("Betik başarıyla kaydedildi.", "success");
							scriptTempList.push(data);

							// the table is refreshed after the script is saved
							table.clear().draw();
							table.destroy();
							createScriptTable();
							$("#scriptNameTemp").val("");
							$('#scriptType').val("bash").change();
							$("#scriptSaveBtn").html("Kaydet");
						}else {
							$.notify("Betik kaydedilirken hata oluştu.", "error");
						}
					},
					error: function(result) {
						$.notify(result, "error");
					}
				});
			}else {
				$.notify("Betik adı aynı olamaz.", "warn");
				$("#scriptNameTemp").focus();
			}
		}else {
			$.notify("Betik adı ve içeriği boş bırakılamaz.", "warn");
		}
	}
});

//checked script name for added selected script
function checkedScriptName(sName) {
	var isExist = false;
	for (var i = 0; i < scriptTempList.length; i++) {
		if (sName == scriptTempList[i]["label"]) {
			isExist = true;
		}
	}
	return isExist;
}

//checked script name for updated selected script
function checkedUpdatedScriptName(sName, sId) {
	var isExist = false;
	for (var i = 0; i < scriptTempList.length; i++) {
		if (sName == scriptTempList[i]["label"] && sId == scriptTempList[i]["id"]) {
			isExist = false;
		}else if (sName == scriptTempList[i]["label"] && sId != scriptTempList[i]["id"]) {
			isExist = true;
		}
	}
	return isExist;
}

$('#scriptDelBtn').click(function(e){
	var rows = table.$('tr.selected');
	if(rows.length){
		var rowData = table.rows('.selected').data()[0];

		file = {
				id: sId
		};

		$.ajax({
			type: 'POST', 
			url: "/script/del",
			data: JSON.stringify(file),
			dataType: "json",
			contentType: "application/json",
			success: function(data) {
				if (data != null) {
					$.notify("Betik başarıyla silindi.", "success");
					removeScriptList(data.id);
					// the table is refreshed after the script is deleted
					table.clear().draw();
					table.destroy();
					$("#scriptNameTemp").val("");
					$('#scriptType').val("bash").change();
					createScriptTable();
					$("#scriptNameTemp").val("");
					$('#scriptType').val("bash").change();
					$("#scriptSaveBtn").html("Kaydet");
					$("#scriptDelBtn").hide();
					$("#scriptCleanBtn").hide();
				}else {
					$.notify("Betik silinirken hata oluştu.", "error");
				}
			}
		});
	}else {
		$.notify("Lütfen silmek için betik seçiniz.", "warn");
	}
});

function removeScriptList(id) {
	var index = scriptTempList.findIndex(function(item, i){
		return item.id === id;
	});
	if (index > -1) {
		scriptTempList.splice(index, 1);
	}
}

//updated script template list selected script template
function updateScriptList(id, scriptName, contents, scriptType, modifyDate) {
	for (var i = 0; i < scriptTempList.length; i++) {
		if (scriptTempList[i].id === id) {
			scriptTempList[i].label = scriptName;
			scriptTempList[i].scriptType = scriptType;
			scriptTempList[i].modifyDate = modifyDate;
			scriptTempList[i].contents = contents;
		}
	}
}

$('#scriptCleanBtn').click(function(e){
	var rows = table.$('tr.selected');
	if(rows.length){
		table.$('tr.selected').removeClass('selected');
		$("#scriptNameTemp").val("");
		$('#scriptType').val("bash").change();
		$("#scriptSaveBtn").html("Kaydet");
	}
	$("#scriptNameTemp").focus();
	$("#scriptDelBtn").hide();
});

