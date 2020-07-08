/*
 * agent.info.js
 * 
 * This js contains pagination of agents, retrieving agents from service and insert in on table,
 * retrieving agent detail, exporting table data to excel file
 * 
 * Hasan Kara
 * hasan.kara@pardus.org.tr
 * 
 * http://www.liderahenk.org/
 */
var totalPageNumber = 0;
var selectedPage = 1;
var selectedPageSize = 10;
var searchText = "";
var agentList = "";
var status = "all";
var checkedAgentIDList = [];
var selectedAgentGroupDN = "";
var selectedOUDN = "";

var registrationStartDate = "";
var registrationEndDate = "";
$(document).ready(function(){
	$("#dropdownButton").hide();
	
	//load table data when page opened
	//1st page and selectedPageSize amount will be retrieved from service
	reloadTable(1, selectedPageSize);
	//set paging according to total page number
	pagination(1, totalPageNumber);
	
	//if pageSize changes load first page with new pageSize amount
	$("#pageSize").change(function(){
		selectedPageSize = $("#pageSize option:selected").val();
		selectedPage = 1;
		if(searchText != "") {
			reloadTable(1, selectedPageSize, $("#searchByAgentProperty option:selected").val(), searchText);
		} else {
			reloadTable(1, selectedPageSize);
		}
	});
	
	$("#selectAll").change(function () {
	    $("input:checkbox").prop('checked', $(this).prop("checked"));
	    checkedAgentListChange();
	});
});

function agentDetailClicked(agentID) {
	//first tab and its content will be opened default
	$('#tab-session-url').removeClass('active');
	$('#tab-detail-url').addClass('active');
	$('#tab-session').removeClass('active');
	$('#tab-detail').addClass('active');
	$("#agentDetailTable").empty();
	var params = {
		    "agentID" : agentID
		};
	$.ajax({ 
	    type: 'POST', 
	    url: 'lider/agent_info/detail',
	    data: params,
	    dataType: 'json',
	    success: function (data) {
	    	if(data.properties.length > 0) {
	        	var year = data.createDate.substring(0,4);
	        	var month = data.createDate.substring(5,7);
	        	var day = data.createDate.substring(8,10);
	        	var time = data.createDate.substring(11,16);
				var createDate = day + '.' + month + '.' + year + ' ' + time;
				
				var modifyDate = "";
				if(data.modifyDate != null) {
		        	year = data.modifyDate.substring(0,4);
		        	month = data.modifyDate.substring(5,7);
		        	day = data.modifyDate.substring(8,10);
		        	time = data.modifyDate.substring(11,16);
					modifyDate = day + '.' + month + '.' + year + ' ' + time;
				}

				var os = "";
				var brand = "";
				var memory = 0;
				var disk = 0;
				var osDistributionVersion = "";
				
				var tableElement = '<tr><th style="width: 30%">ID</th><td style="width: 70%">' + data.id + '</td></tr>';
				tableElement += '<tr><th>Bilgisayar Adı</th><td>' + data.hostname + '</td></tr>';
				tableElement += '<tr><th>JID</th><td>' + data.jid + '</td></tr>';
				tableElement += '<tr><th>DN</th><td>' + data.dn + '</td></tr>';
				tableElement += '<tr><th>IP Adresleri</th><td>' + data.ipAddresses + '</td></tr>'
				tableElement += '<tr><th>MAC Adresleri</th><td>' + data.macAddresses + '</td></tr>';
				tableElement += '<tr><th>Oluşturulma Tarihi</th><td>' + createDate + '</td></tr>';
				tableElement += '<tr><th>Düzenlenme Tarihi</th><td>' + modifyDate + '</td></tr>';
				
				$.each(data.properties, function(index, element) {
					tableElement += '<tr><th>' + element.propertyName + '</th><td>' + element.propertyValue + '</td></tr>';
		        });
				$('#agentDetailTable').append(tableElement);
				
				//append user sessions table
				$("#userSessionsTable").empty();
				tableElement = "";
				if(data.sessions.length > 0) {
					$.each(data.sessions, function(index, element) {
			        	year = element.createDate.substring(0,4);
			        	month = element.createDate.substring(5,7);
			        	day = element.createDate.substring(8,10);
			        	time = element.createDate.substring(11,19);
						createDate = day + '.' + month + '.' + year + ' ' + time;
						
						tableElement += '<tr><td>' + element.username + '</td>';
						tableElement += '<td>' + element.sessionEvent + '</td>';
						tableElement += '<td>' + createDate + '</td></tr>';
			        });
					$('#userSessionsTable').append(tableElement);
					
				}
				else {
					$("#userSessionsTable").empty();
					var trElement = '<tr><td colspan="100%" class="text-center">Sonuç Bulunamadı</td></tr>';
					$('#userSessionsTable').append(trElement);
				}
	    	}
	    	else {
	    		$.notify("Error occured while retrieving agent data.", "error");
	    	}
	    },
	    error: function (data, errorThrown) {
	    	var trElement = '<tr><td colspan="100%" class="text-center">Sonuç Bulunamadı</td></tr>';
	    	$("#userSessionsTable").empty();
	    	$("#agentDetailTable").empty();
			$('#userSessionsTable').append(trElement);
			$('#agentDetailTable').append(trElement);
	    }
	});
}

function checkedAgentListChange() {
	checkedAgentIDList = [];
	$('input:checkbox[name=agent]').each(function() {    
	    if($(this).is(':checked')) {
	    	checkedAgentIDList.push($(this).val());
	    }
	});
	if(checkedAgentIDList.length > 0) {
		$("#dropdownButton").show();
	}
	else{
		$("#dropdownButton").hide();
	}
}

function agentChecked() {
	checkedAgentListChange();
}

function dropdownButtonClicked(operation) {
	if(operation == "addToExistingGroup") {
		getModalContent("modals/reports/agentinfo/addtoexistinggroup", function content(data){
			$('#genericModalHeader').html("Seçili İstemcileri Gruba Ekle");
			$('#genericModalBodyRender').html(data);
			generateAddToExistingGroupTreeGrid();
			$("#btnAddToExistingGroup").hide();
			
		});
	} else if(operation == "addToNewGroup") {
		getModalContent("modals/reports/agentinfo/addtonewgroup", function content(data){
			$('#genericModalHeader').html("Seçili İstemcileri Gruba Ekle");
			$('#genericModalBodyRender').html(data);
			generateAddToNewGroupTreeGrid();
			
		});
	}
}

function exportToExcel () {
	var sheetData = [];
	var year;
	var month;
	var day;
	var time;
	var createDate;
	var os;
	var osDistributionVersion;
	var brand;
	var model;
	var memory;
	var disk;
	var phase="-";
	
    var wb = XLSX.utils.book_new();
    wb.Props = {
            Title: "Lider Ahenk Ahent Details",
            Subject: "Agent Details Report",
            Author: "Lider Ahenk",
            CreatedDate: new Date(2017,12,19)
    };
    
    wb.SheetNames.push("Agent Detail");
    var wsData = [];
	var header = ['ID' , 'DN', 'Hostname', 'IP Adresleri', 'MAC Adresleri',
		  'İşletim Sistemi', 'İşletim Sistemi Versiyonu', 'Marka',
		  'Model', 'Bellek(MB)', 'Disk(MB)', 'Faz', 'Oluşturulma Tarihi'];
	//give character number size for column width
	var colLength = [];
	for (var i = 0; i < header.length; i++) {
		colLength[i] = header[i].length;
	}
	wsData[0] = header;
	var agent = [];
	$.each(agentList, function(index, element) {
    	year = element.createDate.substring(0,4);
    	month = element.createDate.substring(5,7);
    	day = element.createDate.substring(8,10);
    	time = element.createDate.substring(11,16);
		createDate = day + '.' + month + '.' + year + ' ' + time;
		phase="-";
		$.each(element.properties, function(index, property) {
			if(property.propertyName == "os.distributionName") {
				os = property.propertyValue;
			} else if(property.propertyName == "os.distributionVersion") {
				osDistributionVersion = property.propertyValue;
			} else if(property.propertyName == "hardware.baseboard.manufacturer") {
				brand = property.propertyValue;
			} else if(property.propertyName == "hardware.systemDefinitions") {
				var result = property.propertyValue;
				result = result.split(",");
				result = result[1].trim();
				result = result.replace(/'/g,"");
				result = result.replace("]","");
				result = result.split(":");
				result = result[1];
				model =  result.trim();
			} else if(property.propertyName == "hardware.memory.total") {
				memory = property.propertyValue;
			} else if(property.propertyName == "hardware.disk.total") {
				disk = property.propertyValue;
			} else if(property.propertyName == "phase") {
				phase = property.propertyValue;
			}
		});
    	agent = [element.id, element.dn, element.hostname, element.ipAddresses, element.macAddresses, os, osDistributionVersion,
    			 brand, model, memory, disk, phase, createDate];
    	
    	//if column element character length is bigger than before update it
    	for (var i = 0; i < agent.length; i++) {
    		if(agent[i] != "") {
        		if(String(agent[i]).length > colLength[i]){
        			colLength[i] = String(agent[i]).length;
        		}
    		}
    	}
    	wsData.push(agent);
    });
	//set column widths
	var wscols = [];
	for (let i = 0; i < colLength.length; i++) {
		wscols.push({ wch: colLength[i]});  // wch = character
		}
	var ws = XLSX.utils.aoa_to_sheet(wsData);
	ws['!cols'] = wscols;
    wb.Sheets["Agent Detail"] = ws;
    var wbout = XLSX.write(wb, {bookType:'xlsx',  type: 'binary'});

    var buf = new ArrayBuffer(wbout.length);
    var view = new Uint8Array(buf);
    for (var i=0; i<wbout.length; i++) view[i] = wbout.charCodeAt(i) & 0xFF;
    return buf;
}

function exportButtonClicked() {
	saveAs(new Blob([exportToExcel()],{type:"application/octet-stream"}), 'Agent Detail.xlsx');
}

function pagingClicked(pNum) {
	//user can not click same page number
	//gets new page from backend, refreshes the table and append new data
	if(pNum != selectedPage) {
		if(searchText != "") {
			reloadTable(pNum, selectedPageSize, $("#searchByAgentProperty option:selected").val(), searchText);
		} else {
			reloadTable(pNum, selectedPageSize);
		}
	}
}

//retrieves agents pageable object from service with given page number and pageSize
function reloadTable(pNumber, pSize, field, text) {
	//start number of agent order in table
	var order = (pNumber-1)*pSize + 1;
	var params = {
		    "pageNumber" : pNumber,
		    "pageSize": pSize,
		    "status" : status
		    
		};

	if (field && text) {
		params['field'] = field;
		params['text'] = text;
	}
	
	if(registrationStartDate != "" && registrationEndDate != "") {
		params['registrationStartDate'] = registrationStartDate;
		params['registrationEndDate'] = registrationEndDate;
	}
	$.ajax({ 
	    type: 'POST',
	    url: 'lider/agent_info/list/',
	    dataType: 'json',
	    data: params,
	    success: function (data) { 
	    	if(data.content.length > 0) {
	    		$("#selectAll").prop("checked", false);
	    		agentList = data.content;
		    	pagination(pNumber,data.totalPages);
		    	selectedPage = pNumber;
		    	$("#agentsTable").empty();
		        $.each(data.content, function(index, element) {
		        	var year = element.createDate.substring(0,4);
		        	var month = element.createDate.substring(5,7);
		        	var day = element.createDate.substring(8,10);
		        	var time = element.createDate.substring(11,16);
					var createDate = day + '.' + month + '.' + year + ' ' + time;
					
					var os = "";
					var brand = "";
					var memory = 0;
					var disk = 0;
					var osDistributionVersion = "";
					var phase = "-";
					$.each(element.properties, function(j, property) {
						if(property.propertyName == "hardware.baseboard.manufacturer") {
							brand = property.propertyValue;
						}
						else if(property.propertyName == "hardware.memory.total") {
							memory = property.propertyValue;
						}
						else if(property.propertyName == "hardware.disk.total") {
							disk = property.propertyValue;
						}
						else if(property.propertyName == "os.distributionName") {
							os = property.propertyValue;
						}
						else if(property.propertyName == "os.distributionVersion") {
							osDistributionVersion = property.propertyValue;
						}
						else if(property.propertyName == "phase") {
							phase = property.propertyValue;
						}
					});
		        	var trElement = '<tr>'
		        				  + '<td><span class="cb-agent-info">'
								  + '<input onclick="agentChecked()" type="checkbox" name="agent" value="' + element.dn +'">'
								  + '<label for="checkbox1"></label>'
								  + '</span>'
								  + '</td>'
		        				  + '<td  class="text-center">' + order + '</td>';
		        	order++;
		        	if(os == "Windows") {
		        		trElement +=  '<td><img src="img/windows.png" class="avatar" alt="Avatar"><span>' + element.hostname + '</span></td>';
		        	}
		        	else {
		        		trElement += '<td><img src="img/pardus.png" class="middle" alt="Avatar"><span >' + element.hostname + '</span></td>';
		        	}
		        	trElement    += '<td>' + element.macAddresses + '</td>'
		        				  + '<td>' + element.ipAddresses + '</td>';
		        	if(element.isOnline == true) {
		        		trElement    += '<td><span class="status text-success">&bull;</span> Açık</td>';
		        	}
		        	else {
		        		trElement    += '<td><span class="status text-danger">&bull;</span> Kapalı</td>';
		        	}
		        	trElement += '<td>' + phase + '</td>'
		        			  + '<td>' + brand + '</td>'
		        			  + '<td>' + os + '</td>'
		        			  + '<td>' + osDistributionVersion + '</td>'
		        			  + '<td>' + createDate + '</td>'
		        			  + '<td class="text-center"><a href="#agentDetailModal" class="edit" data-toggle="modal" onclick="agentDetailClicked(' + element.id + ')" data-id="' + element.id
		        			  + '" data-toggle="modal" data-target="#agentDetailModal">'
		        			  + '<i class="material-icons primary" data-toggle="tooltip" title="Edit">&#xe88f;</i></a></td>'
		        			  + '</tr>';
		        	$('#agentsTable').append(trElement);
		        });
	    	} else {
		    	var trElement = '<tr><td colspan="100%" class="text-center">Sonuç Bulunamadı</td></tr>';
				$("#agentsTable").empty();
				$("#pagingList").empty();
		    	$('#agentsTable').append(trElement);
	    	}
	    },
	    error: function (jqXHR, textStatus, errorThrown) {
	    	$.notify("Seçili istemciler getirilirken hata oluştu.",  "error");
	    	if(jqXHR != null && jqXHR.status == 401) {
	    		$.notify(jqXHR.responseJSON.message,  "error");
	    	}
	    	var trElement = '<tr><td colspan="100%" class="text-center">Sonuç Bulunamadı</td></tr>';
			$("#agentsTable").empty();
			$("#pagingList").empty();
	    	$('#agentsTable').append(trElement);
	    }
	});
}

function search() {
	status = $("#searchByStatus option:selected").val();
	var field = $("#searchByAgentProperty option:selected").val();
	var text = $("#searchText").val();
	searchText = text;
	reloadTable(1, selectedPageSize, field, text);
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
    $('#pagingList').empty()
	if(m != 1){
		for (let i = 0; i < rangeWithDots.length; i++) {
			if(rangeWithDots[i] == c) {
				$('#pagingList').append('<li class="active"><a href="javascript:pagingClicked(' + rangeWithDots[i] + ')">' + rangeWithDots[i] + '</a></li>');
			}
			else {
				if(rangeWithDots[i] == "...") {
					$('#pagingList').append('<li class="disabled"><a href="javascript:pagingClicked(' + rangeWithDots[i] + ')">' + rangeWithDots[i]+ '</a></li>');
				}
				else {
					$('#pagingList').append('<li ><a href="javascript:pagingClicked(' + rangeWithDots[i] + ')">' + rangeWithDots[i]+ '</a></li>');
				}
			}
		}
	}
}

function generateAddToExistingGroupTreeGrid() {
	$("#existingTreeGrid").jqxTreeGrid('destroy');
	$("#existingTreeGridDiv").append('<div id="existingTreeGrid"></div> ');
	
	$.ajax({
		type : 'POST',
		url : 'lider/computer_groups/getGroups',
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
						{ name: "expanded", type: "string" },
						{ name: "expandedUser", type: "string" },
						{ name: "attributes", type: "array" },
						{ name: "attributesMultiValues", type: "array" },
						{ name: "entryUUID", type: "string" },
						{ name: "childEntries", type: "array" }
					],
					hierarchy:
					{
						root: "childEntries",
					},
					localData: data,
					id: "entryUUID"
			};
			selectedEntryUUID = source.localData[0].entryUUID;
			var dataAdapter = new $.jqx.dataAdapter(source, {
			});

			var getLocalization = function () {
				var localizationobj = {};
				localizationobj.filterSearchString = "Ara :";

				return localizationobj;
			}

			// create jqxTreeGrid.
			$("#existingTreeGrid").jqxTreeGrid({
				width: '100%',
				source: dataAdapter,
				altRows: true,
				sortable: true,
				columnsResize: true,
				filterable: true,
				pageable: true,
				pagerMode: 'default',
				filterMode: "simple",
				localization: getLocalization(),
				pageSize: 50,
				selectionMode: "singleRow",
				pageSizeOptions: ['15', '25', '50'],
				icons: function (rowKey, dataRow) {
					var level = dataRow.level;
					if(dataRow.type == "ORGANIZATIONAL_UNIT"){
						return "img/folder.png";
					}
					else return "img/entry_group.gif";
				},
				ready: function () {
	
					var allrows =$("#existingTreeGrid").jqxTreeGrid('getRows');
					if(allrows.length==1){
						var row=allrows[0];
						if(row.childEntries==null){
							$("#existingTreeGrid").jqxTreeGrid('addRow', row.entryUUID+"1", {}, 'last', row.entryUUID);
						}
					}
					$("#existingTreeGrid").jqxTreeGrid('collapseAll');
					$("#existingTreeGrid").jqxTreeGrid('selectRow', selectedEntryUUID);
				},
				columns: [
					{ text: "İstemci Grup Ağacı", align: "center", dataField: "name", width: '100%'}
					]
			});
		}, error: function (jqXHR, textStatus, errorThrown) {
	    	if(jqXHR.status == 401) {
	    		$.notify("Bu işlemi yapmaya yetkiniz bulunmamaktadır.", "error");
	    	} else {
	    		$.notify("Veri getirilirken hata oluştu.", "error");
	    	}
	    	$('#genericModal').trigger('click');
	    }
	});
	
	$('#existingTreeGrid').on('rowExpand', function (event) {
		var args = event.args;
		var row = args.row;

		if(row.expandedUser=="FALSE") {
			var nameList=[];
			for (var m = 0; m < row.records.length; m++) {
				var childRow = row.records[m];
				nameList.push(childRow.uid);      
			}
			for (var k = 0; k < nameList.length; k++) {
				// get a row.
				var childRowname = nameList[k];
				$("#existingTreeGrid").jqxTreeGrid('deleteRow', childRowname); 
			}  
			$.ajax({
				type : 'POST',
				url : 'lider/computer_groups/getOuDetails',
				data : 'uid=' + row.distinguishedName + '&type=' + row.type
				+ '&name=' + row.name + '&parent=' + row.parent,
				dataType : 'text',
				success : function(ldapResult) {
					var childs = jQuery.parseJSON(ldapResult);
					for (var m = 0; m < childs.length; m++) {
						// get a row.
						var childRow = childs[m];
						$("#existingTreeGrid").jqxTreeGrid('addRow', childRow.entryUUID, childRow, 'last', row.entryUUID);
						if(childRow.hasSubordinates=="TRUE"){
							$("#existingTreeGrid").jqxTreeGrid('addRow', childRow.entryUUID+"1" , {}, 'last', childRow.entryUUID); 
						}
						$("#existingTreeGrid").jqxTreeGrid('collapseRow', childRow.entryUUID);
					} 
					row.expandedUser="TRUE"
				}, error: function (jqXHR, textStatus, errorThrown) {
			    	if(jqXHR.status == 401) {
			    		$.notify("Bu işlemi yapmaya yetkiniz bulunmamaktadır.", "error");
			    	} else {
			    		$.notify("Veri getirilirken hata oluştu.", "error");
			    	}
			    	$('#genericModal').trigger('click');
			    }
			});  
		}
	}); 
	
	$('#existingTreeGrid').on('rowSelect', function (event) {
		var args = event.args;
		var row = args.row;
		var name= row.name;
		selectedAgentGroupDN = row.distinguishedName;
		var selectedRows = $("#existingTreeGrid").jqxTreeGrid('getSelection');
		var selectedRowData=selectedRows[0];

		if(selectedRowData.type == "GROUP"){
			$("#btnAddToExistingGroup").show();
		} else {
			$("#btnAddToExistingGroup").hide();
		}
	});
}

function generateAddToNewGroupTreeGrid() {
	$("#newTreeGrid").jqxTreeGrid('destroy');
	$("#newTreeGridDiv").append('<div id="newTreeGrid"></div> ');
	
	$.ajax({
		type : 'POST',
		url : 'lider/computer_groups/getGroups',
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
						{ name: "expanded", type: "string" },
						{ name: "expandedUser", type: "string" },
						{ name: "attributes", type: "array" },
						{ name: "attributesMultiValues", type: "array" },
						{ name: "entryUUID", type: "string" },
						{ name: "childEntries", type: "array" }
					],
					hierarchy:
					{
						root: "childEntries",
					},
					localData: data,
					id: "entryUUID"
			};
			selectedEntryUUID = source.localData[0].entryUUID;
			var dataAdapter = new $.jqx.dataAdapter(source, {
			});
			var getLocalization = function () {
				var localizationobj = {};
				localizationobj.filterSearchString = "Ara :";

				return localizationobj;
			}

			// create jqxTreeGrid.
			$("#newTreeGrid").jqxTreeGrid({
				width: '100%',
				source: dataAdapter,
				altRows: true,
				sortable: true,
				columnsResize: true,
				filterable: true,
				pageable: true,
				pagerMode: 'default',
				filterMode: "simple",
				localization: getLocalization(),
				pageSize: 50,
				selectionMode: "singleRow",
			    pageSizeOptions: ['15', '25', '50'],
			    icons: function (rowKey, dataRow) {
					var level = dataRow.level;
					if(dataRow.type == "ORGANIZATIONAL_UNIT"){
						return "img/folder.png";
					}
					else return "img/entry_group.gif";
				},
				ready: function () {
	
					var allrows =$("#newTreeGrid").jqxTreeGrid('getRows');
					if(allrows.length==1){
						var row=allrows[0];
						if(row.childEntries==null){
							$("#newTreeGrid").jqxTreeGrid('addRow', row.entryUUID+"1", {}, 'last', row.entryUUID);
						}
					}
					$("#newTreeGrid").jqxTreeGrid('collapseAll');
					$("#newTreeGrid").jqxTreeGrid('selectRow', selectedEntryUUID);
				},
				columns: [
					{ text: "İstemci Grup Ağacı", align: "center", dataField: "name", width: '100%'}
					]
			});
		}, error: function (jqXHR, textStatus, errorThrown) {
	    	if(jqXHR.status == 401) {
	    		$.notify("Bu işlemi yapmaya yetkiniz bulunmamaktadır.", "error");
	    	} else {
	    		$.notify("Veri getirilirken hata oluştu.", "error");
	    	}
	    	$('#genericModal').trigger('click');
	    }
	});
	
	$('#newTreeGrid').on('rowExpand', function (event) {
		var args = event.args;
		var row = args.row;

		if(row.expandedUser=="FALSE") {
			var nameList=[];
			for (var m = 0; m < row.records.length; m++) {
				var childRow = row.records[m];
				nameList.push(childRow.uid);      
			}
			for (var k = 0; k < nameList.length; k++) {
				// get a row.
				var childRowname = nameList[k];
				$("#newTreeGrid").jqxTreeGrid('deleteRow', childRowname); 
			}  
			$.ajax({
				type : 'POST',
				url : 'lider/computer/getOuDetails',
				data : 'uid=' + row.distinguishedName + '&type=' + row.type
				+ '&name=' + row.name + '&parent=' + row.parent,
				dataType : 'text',
				success : function(ldapResult) {
					var childs = jQuery.parseJSON(ldapResult);
					for (var m = 0; m < childs.length; m++) {
						// get a row.
						var childRow = childs[m];
						if(childRow.type == "ORGANIZATIONAL_UNIT") {
							$("#newTreeGrid").jqxTreeGrid('addRow', childRow.entryUUID, childRow, 'last', row.entryUUID);
							if(childRow.hasSubordinates=="TRUE"){
								$("#newTreeGrid").jqxTreeGrid('addRow', childRow.entryUUID+"1" , {}, 'last', childRow.entryUUID); 
							}
							$("#newTreeGrid").jqxTreeGrid('collapseRow', childRow.entryUUID);
						}
					} 
					row.expandedUser="TRUE";
				}, error: function (jqXHR, textStatus, errorThrown) {
			    	if(jqXHR.status == 401) {
			    		$.notify("Bu işlemi yapmaya yetkiniz bulunmamaktadır.", "error");
			    	} else {
			    		$.notify("Veri getirilirken hata oluştu.", "error");
			    	}
			    	$('#genericModal').trigger('click');
			    }
			});  
		}
	}); 
	
	$('#newTreeGrid').on('rowSelect', function (event) {
		var args = event.args;
		var row = args.row;
		var name= row.name;
		selectedOUDN = row.distinguishedName;
	});
}

function btnAddToExistingGroupClicked() {
	var selected = $("#selectGroupDN").children("option:selected").val();
	if(selected != "") {
		var params = {
			    "groupDN" : selectedAgentGroupDN,
			    "checkedList": checkedAgentIDList
			};
		$.ajax({ 
		    type: 'POST', 
		    url: "/lider/computer_groups/group/existing",
		    dataType: 'json',
		    data: params,
		    success: function (data) { 
		    	$.notify("Seçili istemciler gruba başarıyla eklendi", "success");
		    	$('#genericModal').trigger('click');
		    }, error: function (jqXHR, textStatus, errorThrown) {
		    	if(jqXHR.status == 401) {
		    		$.notify("Bu işlemi yapmaya yetkiniz bulunmamaktadır.", "error");
		    	} else {
		    		$.notify("Seçili istemciler gruba eklenirken hata oluştu.", "error");
		    	}
		    	$('#genericModal').trigger('click');
		    }
		});
	}
}

function btnAddToNewGroupClicked() {
	var groupName = $('input[name=newAgentGroupName]').val();
	if(groupName != "") {
		var params = {
			    "selectedOUDN" : selectedOUDN,
			    "groupName": $('input[name=newAgentGroupName]').val(),
			    "checkedList": checkedAgentIDList
			};
		
		$.ajax({ 
		    type: 'POST', 
		    url: "/lider/computer/createNewAgentGroup",
		    dataType: 'json',
		    data: params,
		    success: function (data) { 
		    	$.notify("Yeni grup oluşturuldu ve istemciler gruba eklendi.", "success");
		    	$('#genericModal').trigger('click');
		    },
		    error: function (jqXHR, textStatus, errorThrown) {
		    	if(jqXHR.status == 401) {
		    		$.notify("Bu işlemi yapmaya yetkiniz bulunmamaktadır.", "error");
		    	} else {
		    		$.notify("Yeni grup oluşturulurken hata oluştu." + $('input[name=newAgentGroupName]').val() + " oluşturulamadı.", "error");
		    	}
		    	$('#genericModal').trigger('click');
		    }
		});
	} else {
		$.notify("Lütfen grup adı giriniz.", "error");
	}
}