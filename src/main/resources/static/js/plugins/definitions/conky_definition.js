/**
 * This page conky definition. Get conky templates from database. Save conky and edit, delete registered conky
 * Tuncay ÇOLAK
 * tuncay.colak@tubitak.gov.tr
 * 
 * http://www.liderahenk.org/
 * 
 */

var table;
var conkyTempList = [];
var cId = null; // selected conky id

$(document).ready(function(){
	$("#conkyDelBtn").hide();
	$("#conkyCleanBtn").hide();
	$("#conkyContentTemp").val("");
	$("#conkyNameTemp").focus();
	getConkyTemp();
});

function getConkyTemp() {

	$.ajax({
		type: 'POST', 
		url: "/conky/list",
		dataType: 'json',
		success: function(data) {
			if(data != null && data.length > 0) {
				conkyTempList = data;
				createConkyTable();
				$.notify("Conky başarıyla listelendi.", "success");
			}else {
				createConkyTable();
			}
		},
		error: function(result) {
			$.notify(result, "error");
		}
	});
}

function createConkyTable() {

	for (var i = 0; i < conkyTempList.length; i++) {
		var conkyName = conkyTempList[i]['label'];
		var createDate = conkyTempList[i]['createDate'];
		var modifyDate = conkyTempList[i]['modifyDate'];
		var conkyId = conkyTempList[i]["id"];
		if (modifyDate == null) {
			modifyDate = "";
		}
		if (createDate == null) {
			createDate = "";
		}
		var newRow = $("<tr id="+ conkyId +">");
		var html = '<td>'+ conkyName +'</td>';
		html += '<td>'+ createDate +'</td>';
		html += '<td>'+ modifyDate +'</td>';
		newRow.append(html);
		$("#conkyTableTemp").append(newRow);
	}

	table = $('#conkyTableTemp').DataTable( {
		"scrollY": "470px",
		"paging": false,
		"scrollCollapse": true,
		"responsive": true,
		"oLanguage": {
			"sSearch": "Conky Ara:",
			"sInfo": "Toplam Conky sayısı: _TOTAL_",
			"sInfoEmpty": "Gösterilen Conky sayısı: 0",
			"sZeroRecords" : "Conky bulunamadı",
			"sInfoFiltered": " - _MAX_ kayıt arasından",
		},
	} );
}

$('#conkyTableTemp tbody').on( 'click', 'tr', function () {
	if ( $(this).hasClass('selected') ) {
		$(this).removeClass('selected');
		$("#conkyNameTemp").val("");
		$('#conkyContentTemp').val("");
		$("#conkySaveBtn").html("Kaydet");
		$("#conkyDelBtn").hide();
		$("#conkyCleanBtn").hide();
		cId = null;

	}
	else {
		table.$('tr.selected').removeClass('selected');
		$(this).addClass('selected');
		cId = $(this).attr('id');
		$("#conkySaveBtn").html("Güncelle");
		var rowData = table.rows('.selected').data()[0];
		$("#conkyNameTemp").val(rowData[0]);
		$("#conkyDelBtn").show();
		$("#conkyCleanBtn").show();
		for (var i = 0; i < conkyTempList.length; i++) {
			if (conkyTempList[i]['id'] == cId) {
				$("#conkyContentTemp").val(conkyTempList[i]['contents']);
			}
		}
	}
} );

//if clicked save and update button 
$('#conkySaveBtn').click(function(e){
	var content = $("#conkyContentTemp").val();
	var name = $("#conkyNameTemp").val();
	var rows = table.$('tr.selected');

	if(rows.length){
//		updated conky template
		file = {
				label: name,
				contents: content,
				id: cId
		};

		if (content != "" && name != "") {
			if (checkedUpdatedConkyName(name, cId) == false) {
				$.ajax({
					type: 'POST', 
					url: "/conky/update",
					data: JSON.stringify(file),
					dataType: "json",
					contentType: "application/json",
					success: function(data) {
						if (data != null) {
							$.notify("Conky başarıyla güncellendi.", "success");
							updateConkyList(data.id, data.label, data.contents, data.modifyDate);
							// the table is refreshed after the conky is updated
							table.clear().draw();
							table.destroy();
							createConkyTable();

							$("#conkyNameTemp").val("");
							$("#conkySaveBtn").html("Kaydet");
							$("#conkyContentTemp").val("");
							$("#conkyDelBtn").hide();
							$("#conkyCleanBtn").hide();
						}else {
							$.notify("Conky güncellenirken hata oluştu.", "error");
						}
					}
				});
			}else {
				$.notify("Conky adı zaten var. Farklı bir Conky adı giriniz.", "warn");
				$("#conkyNameTemp").focus();
			}
		}
		// Otherwise, if no rows are selected. Save conky template
	} else {
		file = {
				label: name,
				contents: content,
		};

		if (content != "" && name != "") {
			if (checkedConkyName(name) == false) {
				$.ajax({
					type: 'POST', 
					url: "/conky/add",
					data: JSON.stringify(file),
					dataType: "json",
					contentType: "application/json",
					success: function(data) {
						if (data != null) {
							$.notify("Conky başarıyla kaydedildi.", "success");
							conkyTempList.push(data);

							// the table is refreshed after the conky is saved
							table.clear().draw();
							table.destroy();
							createConkyTable();
							$("#conkyNameTemp").val("");
							$("#conkyContentTemp").val("");
							$("#conkySaveBtn").html("Kaydet");
							$("#conkyCleanBtn").hide();
						}else {
							$.notify("Conky kaydedilirken hata oluştu.", "error");
						}
					},
					error: function(result) {
						$.notify(result, "error");
					}
				});
			}else {
				$.notify("Conky adı aynı olamaz.", "warn");
				$("#conkyNameTemp").focus();
			}
		}else {
			$.notify("Conky adı ve içeriği boş bırakılamaz.", "warn");
		}
	}
});

//checked conky name for added selected conky
function checkedConkyName(name) {
	var isExist = false;
	for (var i = 0; i < conkyTempList.length; i++) {
		if (name == conkyTempList[i]["label"]) {
			isExist = true;
		}
	}
	return isExist;
}

//checked conky name for updated selected conky
function checkedUpdatedConkyName(name, cId) {
	var isExist = false;
	for (var i = 0; i < conkyTempList.length; i++) {
		if (name == conkyTempList[i]["label"] && cId == conkyTempList[i]["id"]) {
			isExist = false;
		}else if (name == conkyTempList[i]["label"] && cId != conkyTempList[i]["id"]) {
			isExist = true;
		}
	}
	return isExist;
}

$('#conkyDelBtn').click(function(e){
	var rows = table.$('tr.selected');
	if(rows.length){
		var rowData = table.rows('.selected').data()[0];
		file = {
				id: cId
		};

		$.ajax({
			type: 'POST', 
			url: "/conky/del",
			data: JSON.stringify(file),
			dataType: "json",
			contentType: "application/json",
			success: function(data) {
				if (data != null) {
					$.notify("Conky başarıyla silindi.", "success");
					removeConkyList(data.id);
					// the table is refreshed after the conky is deleted
					table.clear().draw();
					table.destroy();
					$("#conkyNameTemp").val("");
					createConkyTable();
					$("#conkyNameTemp").val("");
					$("#conkySaveBtn").html("Kaydet");
					$("#conkyDelBtn").hide();
					$("#conkyCleanBtn").hide();
					$("#conkyContentTemp").val("");
				}else {
					$.notify("Conky silinirken hata oluştu.", "error");
				}
			}
		});
	}else {
		$.notify("Lütfen silmek için Conky seçiniz.", "warn");
	}
});

function removeConkyList(id) {
	var index = conkyTempList.findIndex(function(item, i){
		return item.id === id;
	});
	if (index > -1) {
		conkyTempList.splice(index, 1);
	}
}

//updated conky template list selected conky template
function updateConkyList(id, conkyName, contents, modifyDate) {
	for (var i = 0; i < conkyTempList.length; i++) {
		if (conkyTempList[i].id === id) {
			conkyTempList[i].label = conkyName;
			conkyTempList[i].modifyDate = modifyDate;
			conkyTempList[i].contents = contents;
		}
	}
}

$('#conkyCleanBtn').click(function(e){
	var rows = table.$('tr.selected');
	if(rows.length){
		table.$('tr.selected').removeClass('selected');
		$("#conkyNameTemp").val("");
		$("#conkyContentTemp").val("");
		$("#conkySaveBtn").html("Kaydet");
	}
	$("#conkyNameTemp").focus();
	$("#conkyDelBtn").hide();
});
