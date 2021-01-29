/**
 * This page notify definition. Get notify templates from database. Save notify and edit, delete registered notifies
 * Tuncay ÇOLAK
 * tuncay.colak@tubitak.gov.tr
 * 
 * http://www.liderahenk.org/
 * 
 */

var table;
var notifyTempList = [];
var nId = null; // selected notify id
var lineLimit = 20;
var charLimit = 1200;
var lineCountStatus = true;

$(document).ready(function(){
	$("#notifyDelBtn").hide();
	$("#notifyCleanBtn").hide();
	$("#notifyContentTemp").val("");
	$("#notifyNameTemp").focus();
	getNotifyTemp();
	$("#notifyDefinitionCharCount").text("0/"+ charLimit);
	$("#notifyDefinitionLineCount").text("0/"+ lineLimit);
});

function getNotifyTemp() {

	$.ajax({
		type: 'POST', 
		url: "/notify/list",
		dataType: 'json',
		success: function(data) {
			if(data != null && data.length > 0) {
				notifyTempList = data;
				createNotifyTable();
			}else {
				createNotifyTable();
			}
		},
		error: function(result) {
			$.notify(result, "error");
		}
	});
}

function createNotifyTable() {

	for (var i = 0; i < notifyTempList.length; i++) {
		var notifyName = notifyTempList[i]['label'];
		var notifyTime = notifyTempList[i]['time'];
		var createDate = notifyTempList[i]['createDate'];
		var modifyDate = notifyTempList[i]['modifyDate'];
		var notifyId = notifyTempList[i]["id"];
		if (modifyDate == null) {
			modifyDate = "";
		}
		if (createDate == null) {
			createDate = "";
		}
		var newRow = $("<tr id="+ notifyId +">");
		var html = '<td>'+ notifyName +'</td>';
		html += '<td>'+ notifyTime +'</td>';
		html += '<td>'+ createDate +'</td>';
		html += '<td>'+ modifyDate +'</td>';
		newRow.append(html);
		$("#notifyTableTemp").append(newRow);
	}

	table = $('#notifyTableTemp').DataTable( {
		"scrollY": "470px",
		"paging": false,
		"scrollCollapse": true,
		"oLanguage": {
			"sSearch": "Mesaj Ara:",
			"sInfo": "Toplam mesaj sayısı: _TOTAL_",
			"sInfoEmpty": "Gösterilen mesaj sayısı: 0",
			"sZeroRecords" : "Mesaj bulunamadı",
			"sInfoFiltered": " - _MAX_ kayıt arasından",
		},
	} );
}

$('#notifyTableTemp tbody').on( 'click', 'tr', function () {
	if (notifyTempList.length > 0) {
		if ( $(this).hasClass('selected') ) {
			$(this).removeClass('selected');
			$("#notifyNameTemp").val("");
			$('#notifyTime').val("");
			$('#notifyContentTemp').val("");
			$("#notifySaveBtn").html("Kaydet");
			$("#notifyDelBtn").hide();
			$("#notifyCleanBtn").hide();
			nId = null;
		}
		else {
			table.$('tr.selected').removeClass('selected');
			$(this).addClass('selected');
			nId = $(this).attr('id');
			$("#notifySaveBtn").html("Güncelle");
			var rowData = table.rows('.selected').data()[0];
			$("#notifyNameTemp").val(rowData[0]);
			$("#notifyDelBtn").show();
			$("#notifyCleanBtn").show();
			$('#notifyTime').val(rowData[1]);
			for (var i = 0; i < notifyTempList.length; i++) {
				if (notifyTempList[i]['id'] == nId) {
					$("#notifyContentTemp").val(notifyTempList[i]['contents']);
				}
			}
		}
		checkCharacterAndLineCount();
	}
} );

//if clicked save and update button 
$('#notifySaveBtn').click(function(e){
	var nTime = $('#notifyTime').val();
	var nContent = $("#notifyContentTemp").val();
	var nName = $("#notifyNameTemp").val();
	var rows = table.$('tr.selected');

	if($.isNumeric(nTime)){
		if(rows.length){
//			updated notify template
			file = {
					label: nName,
					contents: nContent,
					time: nTime,
					id: nId
			};

			if (nContent != "" && nName != "" && nTime != "") {
				if (lineCountStatus == false) {
					$.notify("Mesaj karakter veya satır sayısını aştınız.", "warn");
					return;
				}
				if (checkedUpdatedNotifyName(nName, nId) == false) {
					$.ajax({
						type: 'POST', 
						url: "/notify/update",
						data: JSON.stringify(file),
						dataType: "json",
						contentType: "application/json",
						success: function(data) {
							if (data != null) {
								$.notify("Mesaj başarıyla güncellendi.", "success");
								updateNotifyList(data.id, data.label, data.contents, data.time, data.modifyDate);
								// the table is refreshed after the notify is updated
								table.clear().draw();
								table.destroy();
								createNotifyTable();

								$("#notifyNameTemp").val("");
								$('#notifyTime').val("");
								$("#notifySaveBtn").html("Kaydet");
								$("#notifyContentTemp").val("");
								$("#notifyDelBtn").hide();
								$("#notifyCleanBtn").hide();
								checkCharacterAndLineCount();
							}else {
								$.notify("Mesaj güncellenirken hata oluştu.", "error");
							}
						}
					});
				}else {
					$.notify("Mesaj adı zaten var. Farklı bir mesaj adı giriniz.", "warn");
					$("#notifyNameTemp").focus();
				}
			}else {
				$.notify("Mesaj adı, süresi ve içeriği boş bırakılamaz.", "warn");
			}
			// Otherwise, if no rows are selected. Save notify template
		} else {
			file = {
					label: nName,
					contents: nContent,
					time: nTime
			};

			if (nContent != "" && nName != "" && nTime != "") {
				if (lineCountStatus == false) {
					$.notify("Mesaj karakter veya satır sayısını aştınız.", "warn");
					return;
				}
				if (checkedNotifyName(nName) == false) {
					$.ajax({
						type: 'POST', 
						url: "/notify/add",
						data: JSON.stringify(file),
						dataType: "json",
						contentType: "application/json",
						success: function(data) {
							if (data != null) {
								$.notify("Mesaj başarıyla kaydedildi.", "success");
								notifyTempList.push(data);

								// the table is refreshed after the notify is saved
								table.clear().draw();
								table.destroy();
								createNotifyTable();
								$("#notifyNameTemp").val("");
								$('#notifyTime').val("");
								$("#notifyContentTemp").val("");
								$("#notifySaveBtn").html("Kaydet");
								checkCharacterAndLineCount();
							}else {
								$.notify("Mesaj kaydedilirken hata oluştu.", "error");
							}
						},
						error: function(result) {
							$.notify(result, "error");
						}
					});
				}else {
					$.notify("Mesaj adı aynı olamaz.", "warn");
					$("#notifyNameTemp").focus();
				}
			}else {
				$.notify("Mesaj adı, süresi ve içeriği boş bırakılamaz.", "warn");
			}
		}
	}else {
		$.notify("Mesaj süresi saniye cinsinden girilmelidir.", "warn");
	}
});

//checked notify name for added selected notify
function checkedNotifyName(nName) {
	var isExist = false;
	for (var i = 0; i < notifyTempList.length; i++) {
		if (nName == notifyTempList[i]["label"]) {
			isExist = true;
		}
	}
	return isExist;
}

//checked notify name for updated selected notify
function checkedUpdatedNotifyName(nName, nId) {
	var isExist = false;
	for (var i = 0; i < notifyTempList.length; i++) {
		if (nName == notifyTempList[i]["label"] && nId == notifyTempList[i]["id"]) {
			isExist = false;
		}else if (nName == notifyTempList[i]["label"] && nId != notifyTempList[i]["id"]) {
			isExist = true;
		}
	}
	return isExist;
}

$('#notifyDelBtn').click(function(e){
	var rows = table.$('tr.selected');
	if(rows.length){
		var rowData = table.rows('.selected').data()[0];
		file = {
				id: nId
		};

		$.ajax({
			type: 'POST', 
			url: "/notify/del",
			data: JSON.stringify(file),
			dataType: "json",
			contentType: "application/json",
			success: function(data) {
				if (data != null) {
					$.notify("Mesaj başarıyla silindi.", "success");
					removeNotifyList(data.id);
					// the table is refreshed after the notify is deleted
					table.clear().draw();
					table.destroy();
					$("#notifyNameTemp").val("");
					$('#notifyTime').val("");
					createNotifyTable();
					$("#notifyNameTemp").val("");
					$('#notifyTime').val("");
					$("#notifySaveBtn").html("Kaydet");
					$("#notifyDelBtn").hide();
					$("#notifyCleanBtn").hide();
					$("#notifyContentTemp").val("");
					checkCharacterAndLineCount();
				}else {
					$.notify("Mesaj silinirken hata oluştu.", "error");
				}
			}
		});
	}else {
		$.notify("Lütfen silmek için mesaj seçiniz.", "warn");
	}
});

function removeNotifyList(id) {
	var index = notifyTempList.findIndex(function(item, i){
		return item.id === id;
	});
	if (index > -1) {
		notifyTempList.splice(index, 1);
	}
}

//updated notify template list selected notify template
function updateNotifyList(id, notifyName, contents, notifyTime, modifyDate) {
	for (var i = 0; i < notifyTempList.length; i++) {
		if (notifyTempList[i].id === id) {
			notifyTempList[i].label = notifyName;
			notifyTempList[i].time = notifyTime;
			notifyTempList[i].modifyDate = modifyDate;
			notifyTempList[i].contents = contents;
		}
	}
}

$('#notifyCleanBtn').click(function(e){
	var rows = table.$('tr.selected');
	if(rows.length){
		table.$('tr.selected').removeClass('selected');
		$("#notifyNameTemp").val("");
		$('#notifyTime').val("");
		$("#notifyContentTemp").val("");
		$("#notifySaveBtn").html("Kaydet");
		$("#notifyDefinitionCharCount").text("0/"+ charLimit);
		$("#notifyDefinitionLineCount").text("0/"+ lineLimit);
	}
	$("#notifyNameTemp").focus();
	$("#notifyDelBtn").hide();
});

//START -->> check character count and count line of notify definition content
$("#notifyContentTemp").keyup(function(){
	checkCharacterAndLineCount();
});

function checkCharacterAndLineCount() {
	var textAreaTag = document.getElementById("notifyContentTemp");
	var charMaxLength = textAreaTag.attributes.maxLength.value;
	var char = textAreaTag.value.length;
	var lines = textAreaTag.value.split("\n");
	lineControl(lines, char);
}

function lineControl(lines, char) {
	var softLineCount = 0;
	var hardLineCount = 0;
	var textAreaTag = document.getElementById("notifyContentTemp");
	var charMaxLength = textAreaTag.attributes.maxLength.value;
	var charOfLineLimit = charLimit / lineLimit; 

	for (var i = 0; i < lines.length; i++) {
		if (lines[i].length > charOfLineLimit) {
			var quotient = Math.floor(char / charOfLineLimit);
			var remainder = char % charOfLineLimit;
			if (quotient > 0) {
				if (remainder > 0) {
					softLineCount = quotient;
				} else {
					softLineCount = quotient - 1;
				}
			}
		}
	}
	hardLineCount = softLineCount + lines.length;
	if (char == 0) {
		textAreaTag.maxLength = textAreaTag.attributes.maxLength.value;
		charMaxLength = charLimit;
		hardLineCount = 0;
	}
	if (hardLineCount > lineLimit) {
//		$("#notifyDefinitionLineCount").text("Mesaj satır sayısını aştınız.");
		$("#notifyDefinitionLineCount").text(hardLineCount +"/"+ lineLimit);
		document.getElementById("notifyDefinitionLineCount").style.color = 'red';
		lineCountStatus = false;
		if (char > charLimit) {
			textAreaTag.maxLength = charLimit;
			document.getElementById("notifyDefinitionCharCount").style.color = 'red';
		} else {
			textAreaTag.maxLength = char;
			document.getElementById("notifyDefinitionCharCount").style.color = '#5a738e';
		}
	} else {
		textAreaTag.maxLength = charLimit;
		$("#notifyDefinitionLineCount").text(hardLineCount +"/"+ lineLimit);
		document.getElementById("notifyDefinitionLineCount").style.color = '#5a738e';
		document.getElementById("notifyDefinitionCharCount").style.color = '#5a738e';
		lineCountStatus = true;
	}
	$("#notifyDefinitionCharCount").text(char +"/"+charMaxLength);
}
//STOP -->> check character count and count line of notify definition content
