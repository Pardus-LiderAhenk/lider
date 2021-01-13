/*
 * operation-log-report.js
 * 
 * This js contains pagination of operations logs and insert in on table,
 * exporting table data to excel file
 * 
 * Tuncay ÇOLAK
 * tuncay.colak@tubitak.gov.tr
 * 
 * http://www.liderahenk.org/
 */

var operationType = null;
var logs = [];
var operationTypeList = null;
var pageNumber = 1;
var pageSize = 10;
var totalPages = 0;
var filterStartDate = "";
var filterEndDate = "";
var selectedFilterStartDate = "";
var selectedFilterEndDate = "";
var selectedUserDN = null;
var searchText = null;
var field = null;

//Operation Types
//CREATE(1), READ(2), UPDATE(3), DELETE(4), LOGIN(5), LOGOUT(6), EXECUTE_TASK(7), EXECUTE_POLICY(8), CHANGE_PASSWORD(9), MOVE(10)

$(document).ready(function(){
	$("#btnSelectUserDN").show();
	$.ajax({ 
		type: 'POST', 
		url: 'operation/types',
		dataType: 'json',
		success: function (data) {
			operationTypeList = data;
			if(data.length > 0) {
				$('#selectOperationType').empty().append('<option value="ALL">Hepsi</option>');
				$.each(data, function(index, element) {
					$('#selectOperationType').append($('<option>', {
						value: element,
						text : getOpetarionType(element)
					}));
				});
			}
			else {
				$.notify("Sistem güncesi tipleri getirilirken hata oluştu", "error");
			}
		},
		error: function (data, errorThrown) {
		}, complete: function() {
			getOperationLogs();
			pagination(1, totalPages);
		}
	});

	$('#logFilterParam').change(function(){
		selectedUserDN = null;
		$('#searchTextForLog').val("");
		if($("#logFilterParam option:selected").val() == "userId") {
			$("#btnSelectUserDN").show();
		} else {
			$("#btnSelectUserDN").hide();
		}
	});
});


function getOpetarionType(type) {
	var typeText = type;
	if (type == "CREATE") {
		typeText = "Oluşturma";
	} else if (type == "READ") {
		typeText = "Okuma";
	} else if (type == "UPDATE") {
		typeText = "Güncelleme";
	} else if (type == "DELETE") {
		typeText = "Silme";
	} else if (type == "LOGIN") {
		typeText = "Oturum Açma";
	} else if (type == "LOGOUT") {
		typeText = "Oturum Kapatma";
	} else if (type == "EXECUTE_TASK") {
		typeText = "Görev Çalıştırma";
	} else if (type == "EXECUTE_POLICY") {
		typeText = "Politika Çalıştırma";
	} else if (type == "CHANGE_PASSWORD") {
		typeText = "Parola Değiştir";
	} else if (type == "MOVE") {
		typeText = "Taşı";
	} else if (type == "UNASSIGMENT_POLICY") {
		typeText = "Politika Kaldır";
	}
	return typeText;
}

function exportToExcel () {
	var sheetData = [];

	var wb = XLSX.utils.book_new();
	wb.Props = {
			Title: "Lider Ahenk Operation Logs",
			Subject: "Operation Logs",
			Author: "Lider Ahenk",
			CreatedDate: new Date(2020,12,19)
	};

	wb.SheetNames.push("Operation Logs");
	var wsData = [];
	var header = ['' , 
		'Günce Tipi', 
		'Oluşturulma Tarihi', 
		'Mesaj',
		'Kullanıcı DN', 
		'İP Adresi'];
	//give character number size for column width
	var colLength = [];
	for (var i = 0; i < header.length; i++) {
		colLength[i] = header[i].length + 3;
	}
	wsData[0] = header;
	var logListData = [];
	$.each(logs, function(index, log) {
		var crudType = getOpetarionType(log.crudType);
		logListData = [index+1, 
			crudType, 
			log.createDate, 
			log.logMessage,
			log.userId,
			log.requestIp];

		//if column element character length is bigger than before update it
		for (var i = 0; i < logListData.length; i++) {
			if(logListData[i] != "") {
				if(String(logListData[i]).length > colLength[i]){
					colLength[i] = String(logListData[i]).length + 3;
				}
			}
		}
		wsData.push(logListData);
	});
	//set column widths
	var wscols = [];
	for (let i = 0; i < colLength.length; i++) {
		wscols.push({ wch: colLength[i]});  // wch = character
	}
	var ws = XLSX.utils.aoa_to_sheet(wsData);
	ws['!cols'] = wscols;
	wb.Sheets["Operation Logs"] = ws;
	var wbout = XLSX.write(wb, {bookType:'xlsx',  type: 'binary'});

	var buf = new ArrayBuffer(wbout.length);
	var view = new Uint8Array(buf);
	for (var i=0; i<wbout.length; i++) view[i] = wbout.charCodeAt(i) & 0xFF;
	return buf;
}

function exportButtonClicked() {
	saveAs(new Blob([exportToExcel()],{type:"application/octet-stream"}), 'Operation Logs.xlsx');
}

function logsPagingClicked(pNum) {
	pageNumber = pNum;
	getOperationLogs();
}

$('#logPageSize').change(function(){
	if (pageNumber != 1) {
		pageNumber = 1;
	}
	$('#pagingLogList').empty()
	pageSize = $('#logPageSize').val();
	getOperationLogs();
});

//get operation logs function
function getOperationLogs() {
	progress("LogsReportBodyDiv","progressLogsReport",'show');

	var params = {
			"pageNumber": pageNumber,
			"pageSize": pageSize,
			"operationType": $('#selectOperationType').val(),
			'field': field,
			'searchText': searchText
	};

	if(selectedFilterStartDate != "" && selectedFilterEndDate != "" && $('#date_filter').val() != "") {
		params['startDate'] = selectedFilterStartDate;
		params['endDate'] = selectedFilterEndDate;
	}

	var num = (pageNumber-1) * pageSize + 1;
	var html = "";
	$.ajax({ 
		type: 'POST',
		url: 'operation/logs',
		dataType: 'json',
		data: params,
		success: function (data) {
			if(data.content.length > 0) {
				logs = data.content;
				totalPages = data.totalPages;
				pagination(pageNumber, totalPages);
				if(logs.length>0 && logs != null){
					for (var m = 0; m < logs.length; m++) {
						var row = logs[m];
						var requestIp = row.requestIp;
//						if (row.requestIp == "0:0:0:0:0:0:0:1") {
//						requestIp = "localhost";
//						}
						var typeText = getOpetarionType(row.crudType);
						html += '<tr>';
						html += '<td class="text-center"> '+ (num) +' </td>';
						html += '<td >' + typeText + '</td>';
						html += '<td >' + row.createDate + '</td>';
						html += '<td >' + row.logMessage + '</td>';
						html += '<td >' + row.userId + '</td>';
						html += '<td >' + requestIp + '</td>';
//						html += '<td >' + row.taskId + '</td>';
//						html += '<td >' + row.policyId + '</td>';
//						html += '<td >' + row.profileId + '</td>';
						html += '</tr>';
						num++;
					}
				}
			} else{
				html += '<tr><td class="text-center" colspan="100%">Sonuç Bulunamadı</td></tr>'
					$('#pagingLogList').empty();
			}
			$("#operationLogsTable").html(html);
		},
		complete: function() {
			progress("LogsReportBodyDiv","progressLogsReport",'hide');
		}
	});
}

function logSearch() {
	searchText = null;
	field = null;
	operationType = $("#selectoperationType option:selected").val();
	searchText = $('#searchTextForLog').val();
	field = $("#logFilterParam option:selected").val();

	if(filterStartDate != "")
		selectedFilterStartDate = filterStartDate;
	if(filterEndDate != "")
		selectedFilterEndDate = filterEndDate;

	pageNumber = 1;
	pageSize = $('#logPageSize').val();
	getOperationLogs();
}

//sets paging div according to total page number
function pagination(c, m) {
	var current = c,
	last = m,
	delta = 2,
	left = current - delta,
	right = current + delta + 1,
	range = [],
	rangeWithDots = [],
	l;

	for (let i = 1; i <= last; i++) {
		if (i == 1 || i == last || i >= left && i < right) {
			range.push(i);
		}
	}

	for (let i of range) {
		if (l) {
			if (i - l === 2) {
				rangeWithDots.push(l + 1);
			} else if (i - l !== 1) {
				rangeWithDots.push('...');
			}
		}
		rangeWithDots.push(i);
		l = i;
	}
	$('#pagingLogList').empty()
	if(m != 1){
		for (let i = 0; i < rangeWithDots.length; i++) {
			if(rangeWithDots[i] == c) {
				$('#pagingLogList').append('<li class="active"><a href="javascript:logsPagingClicked(' + rangeWithDots[i] + ')">' + rangeWithDots[i] + '</a></li>');
			}
			else {
				if(rangeWithDots[i] == "...") {
					$('#pagingLogList').append('<li class="disabled"><a href="javascript:logsPagingClicked(' + rangeWithDots[i] + ')">' + rangeWithDots[i]+ '</a></li>');
				}
				else {
					$('#pagingLogList').append('<li ><a href="javascript:logsPagingClicked(' + rangeWithDots[i] + ')">' + rangeWithDots[i]+ '</a></li>');
				}
			}
		}
	}
}

//open generic modal for userDN
function btnSelectUserDNFromTreeClicked() {
	getModalContent("modals/reports/operation_logs/select_user", function content(data){
		$('#genericModalHeader').html("Aramak için bir kullanıcı seçiniz");
		$('#genericModalBodyRender').html(data);
		generateTreeForUserSelection();
	});
}

function generateTreeForUserSelection(){
	$.ajax({
		type : 'POST',
		url : 'lider/user/getUsers',
		dataType : 'json',
		success : function(data) {
			var source =
			{
					dataType: "json",
					dataFields: [
						{ name: "name", type: "string" },
						{ name: "online", type: "string" },
						{ name: "uid", type: "string" },
						{ name: "type", type: "string" },
						{ name: "cn", type: "string" },
						{ name: "ou", type: "string" },
						{ name: "parent", type: "string" },
						{ name: "distinguishedName", type: "string" },
						{ name: "hasSubordinates", type: "string" },
						{ name: "expandedUser", type: "string" },
						{ name: "entryUUID", type: "string" },
						{ name: "attributes", type: "array" },
						{ name: "attributesMultiValues", type: "array" },
						{ name: "childEntries", type: "array" }
						],
						hierarchy:
						{
							root: "childEntries"
						},
						localData: data,
						id: "entryUUID"
			};
			//create user tree grid
			selectUserForFilter(source);
		},
		error: function (data, errorThrown) {
			$.notify("Kullanıcılar getirilirken hata oluştu.", "error");
		}
	});
}

function selectUserForFilter(source) {
	$("#selectUserDNTreeGrid").jqxTreeGrid('destroy');
	$("#selectUserDNTreeDiv").append('<div id="selectUserDNTreeGrid"></div> ');
	var dataAdapter = new $.jqx.dataAdapter(source, {
		loadComplete: function () {
		}
	});

	var getLocalization = function () {
		var localizationobj = {};
		localizationobj.filterSearchString = "Ara :";
		return localizationobj;
	};
	// create jqxTreeGrid.
	$("#selectUserDNTreeGrid").jqxTreeGrid(
			{
				width: '100%',
				source: dataAdapter,
				altRows: true,
				sortable: true,
				columnsResize: true,
				filterable: true,
				hierarchicalCheckboxes: true,
				pageable: true,
				pagerMode: 'default',
				checkboxes: false,
				selectionMode: "singleRow",
				filterMode: "simple",
				localization: getLocalization(),
				pageSize: 50,
				pageSizeOptions: ['15', '25', '50'],
				icons: function (rowKey, dataRow) {
					var level = dataRow.level;
					if(dataRow.type == "USER"){
						return "img/checked-user-32.png";
					}
					else return "img/folder.png";
				},
				ready: function () {
					var allrows =$("#selectUserDNTreeGrid").jqxTreeGrid('getRows');
					if(allrows.length==1){
						var row=allrows[0];
						if(row.childEntries==null ){
							$("#selectUserDNTreeGrid").jqxTreeGrid('addRow', row.entryUUID+"1", {}, 'last', row.entryUUID);
						}
					}
					$("#selectUserDNTreeGrid").jqxTreeGrid('collapseAll'); 
				}, 
				rendered: function () {
				},
				columns: [{ text: "Kullanıcılar", align: "center", dataField: "name", width: '100%' }]  	
			});

	$('#selectUserDNTreeGrid').on('rowExpand', function (event) {
		var args = event.args;
		var row = args.row;
		if(row.expandedUser == "FALSE") {
			var nameList=[];
			for (var m = 0; m < row.records.length; m++) {
				var childRow = row.records[m];
				nameList.push(childRow.uid);      
			}

			for (var k = 0; k < nameList.length; k++) {
				// get a row.
				var childRowname = nameList[k];
				$("#selectUserDNTreeGrid").jqxTreeGrid('deleteRow', childRowname); 
			}  
			$.ajax({
				type : 'POST',
				url : 'lider/user/getOuDetails',
				data : 'uid=' + row.distinguishedName + '&type=' + row.type
				+ '&name=' + row.name + '&parent=' + row.parent,
				dataType : 'text',
				success : function(ldapResult) {
					var childs = jQuery.parseJSON(ldapResult);
					for (var m = 0; m < childs.length; m++) {
						// get a row.
						var childRow = childs[m];
						$("#selectUserDNTreeGrid").jqxTreeGrid('addRow', childRow.entryUUID, childRow, 'last', row.entryUUID);
						if(childRow.hasSubordinates=="TRUE"){
							$("#selectUserDNTreeGrid").jqxTreeGrid('addRow', childRow.entryUUID+"1" , {}, 'last', childRow.entryUUID); 
						}
						$("#selectUserDNTreeGrid").jqxTreeGrid('collapseRow', childRow.entryUUID);
					}
					row.expandedUser = "TRUE";
				},
				error: function (data, errorThrown) {
					$.notify("Klasör bilgisi getirilirken hata oluştu.", "error");
				}
			});
		}
	});

	$('#selectUserDNTreeGrid').on('rowSelect', function (event) {
		var args = event.args;
		var row = args.row;
		selectedUserDN = row.distinguishedName;

		if(row.type == "ORGANIZATIONAL_UNIT") {
			$('#btnSelectedUserForLog').prop('disabled', true);
		} else {
			//check if user already has role for console
			var selectedRows = $("#selectUserDNTreeGrid").jqxTreeGrid('getSelection');
			$('#btnSelectedUserForLog').prop('disabled', false);
		}
	});
}

function btnUseForLogSelectedUserDNClicked() {
	$('#searchTextForLog').val(selectedUserDN);
	$('#genericModal').trigger('click');
}

