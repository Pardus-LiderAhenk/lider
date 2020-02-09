/**
 * This page Script defination. Get script files from database. Save script and edit, delete registered scripts
 * Tuncay ÇOLAK
 * tuncay.colak@tubitak.gov.tr
 * 
 * http://www.liderahenk.org/
 * 
 */

var table;
var scriptFileList = [];
$(document).ready(function(){
	getScriptFile()
});

function getScriptFile() {
	$("#scriptContentTemp").val("#!/bin/bash\nset -e");
	$.ajax({
		type: 'POST', 
		url: "/script/list",
		dataType: 'json',
		success: function(data) {
			if(data != null && data.length > 0) {
				scriptFileList = data;
				for (var i = 0; i < data.length; i++) {
					var scriptName = data[i]['label'];
					var scriptType = data[i]['scriptType'];
					var createDate = data[i]['createDate'];
					var modifyDate = data[i]['modifyDate'];
					if (modifyDate == null) {
						modifyDate = "";
					}
					var newRow = $("<tr>");
					var html = '<td>'+ scriptName +'</td>';
					html += '<td>'+ scriptType +'</td>';
					html += '<td>'+ createDate +'</td>';
					html += '<td>'+ modifyDate +'</td>';
					newRow.append(html);
					$("#scriptTableTemp").append(newRow);
				}
				createScriptTable()
				$.notify("Betikler başarıyla listelendi.", "success");
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
		
	}
	else {
		table.$('tr.selected').removeClass('selected');
		$(this).addClass('selected');
		$("#scriptSaveBtn").html("Güncelle");
		var rowData = table.rows('.selected').data()[0];
		$("#scriptNameTemp").val(rowData[0]);
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
		for (var i = 0; i < scriptFileList.length; i++) {
			if (scriptFileList[i]['label'] == rowData[0]) {
				$("#scriptContentTemp").val(scriptFileList[i]['contents']);
			}
		}
	}
} );

$("#scriptType").on("change", function() {
	var scriptType = $(this).val();
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
});

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
//		updated script file
		alert("betik güncellendi")
		// Otherwise, if no rows are selected. Save script file
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
							scriptFileList.push(data);
							
							// the table is refreshed after the script is saved
							table.clear().draw();
							table.destroy();
							for (var i = 0; i < scriptFileList.length; i++) {
								var scriptName = scriptFileList[i]['label'];
								var scriptType = scriptFileList[i]['scriptType'];
								var createDate = scriptFileList[i]['createDate'];
								var modifyDate = scriptFileList[i]['modifyDate'];
								if (modifyDate == null) {
									modifyDate = ""; 
								}
								var newRow = $("<tr>");
								var html = '<td>'+ scriptName +'</td>';
								html += '<td>'+ scriptType +'</td>';
								html += '<td>'+ createDate +'</td>';
								html += '<td>'+ modifyDate +'</td>';
								newRow.append(html);
								$("#scriptTableTemp").append(newRow);
								
								$("#scriptNameTemp").val("");
								$('#scriptType').val("bash").change();
							}
							createScriptTable();
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
			}
		}else {
			$.notify("Betik adı ve içeriği boş bırakılamaz.", "warn");
		}
	}
});

function checkedScriptName(sName) {
	var isExist = false;
	for (var i = 0; i < scriptFileList.length; i++) {
		if (sName == scriptFileList[i]["label"]) {
			isExist = true
		}
	}
	return isExist;
}
