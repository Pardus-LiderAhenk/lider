/**
 * This page notify definition. Get notify files from database. Save notify and edit, delete registered notifys
 * Tuncay ÇOLAK
 * tuncay.colak@tubitak.gov.tr
 * 
 * http://www.liderahenk.org/
 * 
 */

var table;
var notifyFileList = [];
var nId = null; // selected notify id

$(document).ready(function(){
	$("#notifyDelBtn").hide();
	$("#notifyContentTemp").val("");
	getNotifyFile();
});

function getNotifyFile() {

	$.ajax({
		type: 'POST', 
		url: "/notify/list",
		dataType: 'json',
		success: function(data) {
			if(data != null && data.length > 0) {
				notifyFileList = data;
				createNotifyTable();
				$.notify("Mesajlar başarıyla listelendi.", "success");
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

	for (var i = 0; i < notifyFileList.length; i++) {
		var notifyName = notifyFileList[i]['label'];
		var notifyTime = notifyFileList[i]['time'];
		var createDate = notifyFileList[i]['createDate'];
		var modifyDate = notifyFileList[i]['modifyDate'];
		var notifyId = notifyFileList[i]["id"];
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
	if ( $(this).hasClass('selected') ) {
		$(this).removeClass('selected');
		$("#notifyNameTemp").val("");
		$('#notifyTime').val("");
		$('#notifyContentTemp').val("");
		$("#notifySaveBtn").html("Kaydet");
		$("#notifyDelBtn").hide();
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
		$('#notifyTime').val(rowData[1]);
		for (var i = 0; i < notifyFileList.length; i++) {
			if (notifyFileList[i]['id'] == nId) {
				$("#notifyContentTemp").val(notifyFileList[i]['contents']);
			}
		}
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
//			updated notify file
			file = {
					label: nName,
					contents: nContent,
					time: nTime,
					id: nId
			};

			if (nContent != "" && nName != "" && nTime != "") {
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
							}else {
								$.notify("Mesaj güncellenirken hata oluştu.", "error");
							}
						}
					});
				}else {
					$.notify("Mesaj adı zaten var. Farklı bir mesaj adı giriniz.", "warn");
					$("#notifyNameTemp").focus();
				}
			}
			// Otherwise, if no rows are selected. Save notify file
		} else {
			file = {
					label: nName,
					contents: nContent,
					time: nTime
			};

			if (nContent != "" && nName != "" && nTime != "") {
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
								notifyFileList.push(data);

								// the table is refreshed after the notify is saved
								table.clear().draw();
								table.destroy();
								createNotifyTable();
								$("#notifyNameTemp").val("");
								$('#notifyTime').val("");
								$("#notifyContentTemp").val("");
								$("#notifySaveBtn").html("Kaydet");
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
	for (var i = 0; i < notifyFileList.length; i++) {
		if (nName == notifyFileList[i]["label"]) {
			isExist = true;
		}
	}
	return isExist;
}

//checked notify name for updated selected notify
function checkedUpdatedNotifyName(nName, nId) {
	var isExist = false;
	for (var i = 0; i < notifyFileList.length; i++) {
		if (nName == notifyFileList[i]["label"] && nId == notifyFileList[i]["id"]) {
			isExist = false;
		}else if (nName == notifyFileList[i]["label"] && nId != notifyFileList[i]["id"]) {
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
					$("#notifyContentTemp").val("");
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
	var index = notifyFileList.findIndex(function(item, i){
		return item.id === id;
	});
	if (index > -1) {
		notifyFileList.splice(index, 1);
	}
}

//updated notify file list selected notify file
function updateNotifyList(id, notifyName, contents, notifyTime, modifyDate) {
	for (var i = 0; i < notifyFileList.length; i++) {
		if (notifyFileList[i].id === id) {
			notifyFileList[i].label = notifyName;
			notifyFileList[i].time = notifyTime;
			notifyFileList[i].modifyDate = modifyDate;
			notifyFileList[i].contents = contents;
		}
	}
}

$('#notifyAddBtn').click(function(e){
	var rows = table.$('tr.selected');
	if(rows.length){
		table.$('tr.selected').removeClass('selected');
		$("#notifyNameTemp").val("");
		$('#notifyTime').val("");
		$("#notifyContentTemp").val("");
		$("#notifySaveBtn").html("Kaydet");
	}
	$("#notifyNameTemp").focus();
	$("#notifyDelBtn").hide();
});
