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

if (ref_execute_script) {
	connection.deleteHandler(ref_execute_script);
}
var scheduledParamExeScript = null;
var scheduledModalExeScriptOpened = false;
var dnlist = [];
var pluginTask_ExecuteScript = null;
var ref_execute_script=connection.addHandler(executeScriptListener, null, 'message', null, null,  null);

for (var n = 0; n < pluginTaskList.length; n++) {
	var pluginTask=pluginTaskList[n];
	if (pluginTask.page == 'execute-script') {
		pluginTask_ExecuteScript=pluginTask;
	}
}

if (selectedEntries) {
	for (var i = 0; i < selectedEntries.length; i++) {
		dnlist.push(selectedEntries[i].distinguishedName);
	}
}

//--->> START <<--- Script Temlate Definition
var scriptTable = null;
var scriptTempList = [];
var sId = null; // selected script id

$("#scriptDelBtn").hide();
$("#scriptCleanBtn").hide();
$("#scriptNameTemp").focus();
$("#scriptContentTemp").val("#!/bin/bash\nset -e");
getScriptTemp();

function getScriptTemp() {

	$.ajax({
		type: 'POST', 
		url: "/script/list",
		dataType: 'json',
		success: function(data) {
			if(data != null && data.length > 0) {
				scriptTempList = data;
				createScriptsTable();
			}else {
				createScriptsTable();
			}
		},
		error: function(result) {
			$.notify(result, "error");
		}
	});
}

function createScriptsTable() {
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
		"scrollY": "500px",
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
	var rows = scriptTable.$('tr.selected');
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
	var rows = scriptTable.$('tr.selected');

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
							// the scriptTable is refreshed after the script is updated
							scriptTable.clear().draw();
							scriptTable.destroy();
							createScriptsTable();
//							$("#scriptSaveBtn").html("Kaydet");
							$("#scriptSaveBtn").attr("title","Kaydet");
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

							// the scriptTable is refreshed after the script is saved
							scriptTable.clear().draw();
							scriptTable.destroy();
							createScriptsTable();
							$("#scriptNameTemp").val("");
							$('#scriptType').val("bash").change();
//							$("#scriptSaveBtn").html("Kaydet");
							$("#scriptSaveBtn").attr("title","Kaydet");
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
	var rows = scriptTable.$('tr.selected');
	if(rows.length){
		var rowData = scriptTable.rows('.selected').data()[0];

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
					// the scriptTable is refreshed after the script is deleted
					scriptTable.clear().draw();
					scriptTable.destroy();
					$("#scriptNameTemp").val("");
					$('#scriptType').val("bash").change();
					createScriptsTable();
					$("#scriptNameTemp").val("");
					$('#scriptType').val("bash").change();
//					$("#scriptSaveBtn").html("Kaydet");
					$("#scriptSaveBtn").attr("title","Kaydet");
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
	var rows = scriptTable.$('tr.selected');
	if(rows.length){
		scriptTable.$('tr.selected').removeClass('selected');
		$("#scriptNameTemp").val("");
		$('#scriptType').val("bash").change();
//		$("#scriptSaveBtn").html("Kaydet");
		$("#scriptSaveBtn").attr("title","Kaydet");
	}
	$("#scriptNameTemp").focus();
	$("#scriptDelBtn").hide();
	$("#scriptCleanBtn").hide();
});
//--->> END <<--- Script Temlate Definition

//Execute Script Task
function sendExecuteScriptTask(params) {
	var message = "Görev başarı ile gönderildi.. Lütfen bekleyiniz...";
	if (scheduledParamExeScript != null) {
		message = "Zamanlanmış görev başarı ile gönderildi. Zamanlanmış görev parametreleri:  "+ scheduledParam;
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
				$("#plugin-result-execute-script").html(message.bold());
			}   	
		},
		error: function(result) {
			$.notify(result, "error");
		}
	});
}

function executeScriptListener(msg) {
	var to = msg.getAttribute('to');
	var from = msg.getAttribute('from');
	var type = msg.getAttribute('type');
	var elems = msg.getElementsByTagName('body');

	if (type == "chat" && elems.length > 0) {
		var body = elems[0];
		var data=Strophe.xmlunescape(Strophe.getText(body));
		var xmppResponse=JSON.parse(data);
		var responseMessage = xmppResponse.result.responseMessage;
		if(xmppResponse.result.responseCode == "TASK_PROCESSED" || xmppResponse.result.responseCode == "TASK_ERROR") {
			if (xmppResponse.commandClsId == "EXECUTE_SCRIPT") {
				var arrg = JSON.parse(xmppResponse.result.responseDataStr);
				if (xmppResponse.result.responseCode == "TASK_PROCESSED") {
					$.notify(responseMessage, "success");
					$("#plugin-result-execute-script").html("");
				}
				else {
					$.notify(responseMessage, "error");
					$("#plugin-result-execute-script").html(("HATA: " + responseMessage).fontcolor("red"));
				}
			}
		}
	}
	// we must return true to keep the handler alive. returning false would remove it after it finishes.
	return true;
}

$('#sendTaskCronExecuteScript').click(function(e){
	$('#scheduledTasksModal').modal('toggle');
	scheduledParam = null;
	scheduledModalExeScriptOpened = true;
});

$("#scheduledTasksModal").on('hidden.bs.modal', function(){
	if (scheduledModalExeScriptOpened) {
		scheduledParamExeScript = scheduledParam;
	}
	scheduledModalExeScriptOpened = false;
	defaultScheduleSelection();
});

$('#sendTaskExecuteScript').click(function(e){
	if (selectedEntries.length == 0 ) {
		$.notify("Lütfen istemci seçiniz.", "error");
		return;
	}


	if(pluginTask_ExecuteScript){
		pluginTask_ExecuteScript.dnList=dnlist;
		pluginTask_ExecuteScript.entryList=selectedEntries;
		pluginTask_ExecuteScript.dnType="AHENK";
		pluginTask_ExecuteScript.parameterMap={
				"SCRIPT_FILE_ID": sId,
				"SCRIPT_TYPE": $('#scriptType :selected').val(),
				"SCRIPT_CONTENTS": $("#scriptContentTemp").val(),
				"SCRIPT_PARAMS": $("#scriptParameters").val()
		};
		pluginTask_ExecuteScript.cronExpression = scheduledParamExeScript;
		pluginTask_ExecuteScript.commandId = "EXECUTE_SCRIPT";  		
		var params = JSON.stringify(pluginTask_ExecuteScript);
	}

//	if selected script. Default select box "Betik seçiniz... value = NA"
	if ( $("#scriptContentTemp").val() != "") {
		var content = "Görev Gönderilecek, emin misiniz?";
		if (scheduledParamExeScript != null) {
			content = "Zamanlanmış görev gönderilecek, emin misiniz?";
		}
		$.confirm({
			title: 'Uyarı!',
			content: content,
			theme: 'light',
			buttons: {
				Evet: function () {
					sendExecuteScriptTask(params);
					scheduledParamExeScript = null;
				},
				Hayır: function () {
				}
			}
		});
	}else {
		$.notify("Betik içeriği boş bırakılamaz.", "warn");
	}

});