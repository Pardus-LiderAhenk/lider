/*
 * executed-task-report.js
 * 
 * This js contains pagination of executed tasks, retrieving commands from service and insert in on table,
 * exporting table data to excel file
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
var commandList = "";
var pluginList;
var taskCommand = "";

var filterStartDate = "";
var filterEndDate = "";
var selectedFilterStartDate = "";
var selectedFilterEndDate = "";

var selectedRowForSearchDN;

$(document).ready(function(){
	$("#dropdownButton").hide();
	$.ajax({ 
	    type: 'POST', 
	    url: 'lider/executedTaskReport/plugins',
	    dataType: 'json',
	    success: function (data) {
			pluginList = data;
	    	if(data.length > 0) {
			$('#selectTaskCommand').empty().append('<option value="">Hepsi</option>');
			$.each(data, function(index, element) {
				$('#selectTaskCommand').append($('<option>', { 
				    value: element.commandId,
				    text : element.name 
				}));
	        });

	    	}
	    	else {
	    		$.notify("Error occured while retrieving executed tasks data.", "error");
	    	}
	    },
	    error: function (data, errorThrown) {
	    }, complete: function() {
			//load table data when page opened
			//1st page and selectedPageSize amount will be retrieved from service
			reloadTable(1, selectedPageSize);
			//set paging according to total page number
			pagination(1, totalPageNumber);
		}
	});

	
	//if pageSize changes load first page with new pageSize amount
	$("#pageSize").change(function(){
		selectedPageSize = $("#pageSize option:selected").val();
		selectedPage = 1;
		reloadTable(1, selectedPageSize);
	});
});

function commandDetailClicked(commandID, pluginTaskName) {
	$('#taskSentAgentList').empty();
	//fillAttributeTableForEditingGroup();
	var selectedCommand;
	$.each(commandList, function(i, command) {
		if(command.id == commandID) {
			selectedCommand = command;
		}
	});
	if(selectedCommand != null) {
		var trElement = '';
		$.each(selectedCommand.commandExecutions, function(i, commandExecution) {
			trElement += '<tr><td>' + (i+1) + '</td>';
			trElement += '<td>' + commandExecution.uid + '</td>';
			trElement += '<td>' + commandExecution.createDate + '</td>';
			if(commandExecution.commandExecutionResults != null && commandExecution.commandExecutionResults.length > 0) {
				trElement += '<td>' + commandExecution.commandExecutionResults[0].createDate + '</td>';
				if(commandExecution.commandExecutionResults[0].responseCode == "TASK_PROCESSED") {
					trElement += '<td class="text-center"><div class="badge p-1 m-0 badge-success">Başarılı</div></td>';
				} else {
					trElement += '<td class="text-center"><div class="badge p-1 m-0 badge-danger">Hata</div></td>';
				}
				trElement += '<td class="text-center"><a href="#" class="edit" data-toggle="modal" data-target="#executedTaskDetail"' 
						  + 'onclick="commandExecutionResultClicked(' + selectedCommand.id + ',' + commandExecution.id + ',\'' + pluginTaskName + '\')">'
	        			  + '<i class="fa fa-info-circle fa-lg" aria-hidden="true"></i>'
	        			  + '</td>';
			} else {
				trElement += '<td class="text-center">-</td>';
				trElement += '<td class="text-center"><div class="badge p-1 m-0 badge-warning">Gönderildi</div></td>';
				trElement += '<td class="text-center">-</td>';
			}
		});
		$('#taskSentAgentList').append(trElement);
	}
}

function commandExecutionResultClicked(commandID, commandExecutionID, pluginTaskName) {
	$('#executedTaskDetailTable').empty();
	var parameterMap = null;
	var selectedCommand;
	var selectedCommandExecution;
	var selectedCommandExecutionResult;

	$.each(commandList, function(index, command) {
		if (command.id == commandID) {
			parameterMap = command.task.parameterMap;
			selectedCommand = command;
			$.each(command.commandExecutions, function(j, commandExecution) {
				if(commandExecution.id == commandExecutionID) {
					selectedCommandExecution = commandExecution;
					if(commandExecution.commandExecutionResults != null && commandExecution.commandExecutionResults.length > 0) {
						selectedCommandExecutionResult = commandExecution.commandExecutionResults[0];
					}
				}
			});
		}
	});

	if(selectedCommand != null) {
		if(selectedCommandExecutionResult.responseDataStr != null) {
			var tableContent = '<tr><th style="width: 35%">Görev Adı</th><td style="width: 65%">' + pluginTaskName + '</td></tr>';
			if(selectedCommandExecutionResult.responseCode == "TASK_PROCESSED" || selectedCommandExecutionResult.responseCode == "TASK_ERROR") {
				if(selectedCommandExecutionResult.responseCode == "TASK_PROCESSED") {
					tableContent += '<tr><th>Çalıştırma Sonucu</th><td>' + 'Başarılı' + '</td></tr>';
				} else if(selectedCommandExecutionResult.responseCode == "TASK_ERROR") {
					tableContent += '<tr><th>Çalıştırma Sonucu</th><td>' + 'Hata Oluştu' + '</td></tr>';
				}

				tableContent += '<tr><th>Oluşturulma Tarihi</th><td>' + selectedCommand.createDate + '</td></tr>';
				tableContent += '<tr><th>Çalıştırılma Tarihi</th><td>' + selectedCommandExecutionResult.createDate + '</td></tr>';
				if(parameterMap != null) {
					tableContent += '<tr><th colspan="100%"><h6>Gönderilen Görev Parametreleri</h6></th></tr>';
					Object.keys(parameterMap).forEach(function(key){
						if (key == "password" || key == "RootPassword" || key == "admin-password" || key == "admin_password") {
							parameterMap[key] = parameterMap[key].replace(parameterMap[key], "*****");
						}
						tableContent += '<tr><th>' + key + '</th><td>' + parameterMap[key] + '</td></tr>';
					});
				}
				if(selectedCommandExecutionResult.responseDataStr != null 
					&& selectedCommandExecutionResult.responseDataStr != "" 
					&& selectedCommandExecutionResult.responseDataStr != "?") {
					tableContent += '<tr><th colspan="100%"><h6>Görev Çalıştırılması Sonucunda Kaydedilen Veriler</h6></th></tr>';
					$.each(jQuery.parseJSON( selectedCommandExecutionResult.responseDataStr ), function(key, value){
						tableContent += '<tr><th>' + key + '</th><td>' + value + '</td></tr>';
					});
				}
			} else {
				tableContent += '<tr><th>Çalıştırma Sonucu</th><td>' + 'Gönderildi' + '</td></tr>';
				tableContent += '<tr><th>Oluşturulma Tarihi</th><td>' + selectedCommand.createDate + '</td></tr>';
				tableContent += '<tr><th>Çalıştırılma Tarihi</th><td>' + '-' + '</td></tr>';
				tableContent += '<tr><th>Görev İçeriği</th><td>' + '-' + '</td></tr>';
			}
			tableContent += '<tr><th>Ahenkten Gelen Mesaj</th><td>' + selectedCommandExecutionResult.responseMessage + '</td></tr>';
			$("#executedTaskDetailTable").empty();
			$('#executedTaskDetailTable').append(tableContent);
		}
	}
}


function exportToExcel () {
	var sheetData = [];
	
    var wb = XLSX.utils.book_new();
    wb.Props = {
            Title: "Lider Ahenk Executed Tasks",
            Subject: "Executed Tasks",
            Author: "Lider Ahenk",
			CreatedDate: new Date(2020,12,19)
    };
    
    wb.SheetNames.push("Executed Tasks");
    var wsData = [];
	var header = ['' , 
				'Eklenti', 
				'Görev', 
				'Oluşturulma Tarihi', 
				'Gönderen',
	  			'Toplam', 
				'Başarılı', 
				'Gönderildi',
	  			'Hata', 
				'Zamanlı Çalıştırılan'];
	//give character number size for column width
	var colLength = [];
	for (var i = 0; i < header.length; i++) {
		colLength[i] = header[i].length + 3;
	}
	wsData[0] = header;
	var commandListData = [];
	$.each(commandList, function(index, command) {
		var pluginName = "";
		var pluginTaskName = "";
		var successfullTaskCount = 0;
		var failedTaskCount = 0;
		
		$.each(command.commandExecutions, function(k, commandExecutions) {
			if(commandExecutions.commandExecutionResults != null && commandExecutions.commandExecutionResults.length != 0) {
				if(commandExecutions.commandExecutionResults[0].responseCode == "TASK_PROCESSED") {
					successfullTaskCount++;
				}
				if(commandExecutions.commandExecutionResults[0].responseCode == "TASK_ERROR") {
					failedTaskCount++
				}
			}
		});
		$.each(pluginList, function(j, item) {
			if(command.task.commandClsId == item.commandId) {
				pluginTaskName = item.name;
				pluginName = item.plugin.description;
			}
		});
    	commandListData = [index+1, 
							pluginName, 
							pluginTaskName, 
							command.createDate, 
							command.commandOwnerUid, 
							command.uidList.length,
				 			successfullTaskCount, 
							command.uidList.length - successfullTaskCount - failedTaskCount, 
							failedTaskCount, 
							command.task.cronExpression == null ? 'Hayır' : 'Evet'];
    	
    	//if column element character length is bigger than before update it
    	for (var i = 0; i < commandListData.length; i++) {
    		if(commandListData[i] != "") {
        		if(String(commandListData[i]).length > colLength[i]){
        			colLength[i] = String(commandListData[i]).length + 3;
        		}
    		}
    	}
    	wsData.push(commandListData);
    });
	//set column widths
	var wscols = [];
	for (let i = 0; i < colLength.length; i++) {
		wscols.push({ wch: colLength[i]});  // wch = character
	}
	var ws = XLSX.utils.aoa_to_sheet(wsData);
	ws['!cols'] = wscols;
    wb.Sheets["Executed Tasks"] = ws;
    var wbout = XLSX.write(wb, {bookType:'xlsx',  type: 'binary'});

    var buf = new ArrayBuffer(wbout.length);
    var view = new Uint8Array(buf);
    for (var i=0; i<wbout.length; i++) view[i] = wbout.charCodeAt(i) & 0xFF;
    return buf;
}

function exportButtonClicked() {
	saveAs(new Blob([exportToExcel()],{type:"application/octet-stream"}), 'Executed Tasks.xlsx');
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
function reloadTable(pNumber, pSize, taskCommand) {
	progress("executedTaskReportBodyDiv","progressExecutedTaskReport",'show');
	//start number of agent order in table
	var order = (pNumber-1)*pSize + 1;
	var params = {
	    "pageNumber" : pNumber,
	    "pageSize": pSize,
	    "taskCommand" : taskCommand
	};

	if(selectedFilterStartDate != "" && selectedFilterEndDate != "" && $('#date_filter').val() != "") {
		params['startDate'] = selectedFilterStartDate;
		params['endDate'] = selectedFilterEndDate;
	}
	$.ajax({ 
	    type: 'POST',
	    url: 'lider/executedTaskReport/list/',
	    dataType: 'json',
	    data: params,
	    success: function (data) { 
	    	if(data.content.length > 0) {
	    		commandList = data.content;
		    	pagination(pNumber,data.totalPages);
		    	selectedPage = pNumber;
		    	$("#commandTableBody").empty();
		        $.each(data.content, function(index, command) {
					var trElement = "<tr>";
					var pluginName = "";
					var pluginTaskName = "";
					var successfullTaskCount = 0;
					var failedTaskCount = 0;
					
					$.each(command.commandExecutions, function(k, commandExecutions) {
						if(commandExecutions.commandExecutionResults != null && commandExecutions.commandExecutionResults.length != 0) {
							if(commandExecutions.commandExecutionResults[0].responseCode == "TASK_PROCESSED") {
								successfullTaskCount++;
							}
							if(commandExecutions.commandExecutionResults[0].responseCode == "TASK_ERROR") {
								failedTaskCount++
							}
						}
					});
					$.each(pluginList, function(j, item) {
						if(command.task.commandClsId == item.commandId) {
							pluginTaskName = item.name;
							pluginName = item.plugin.description;
						}
					});

					trElement += '<td class="text-center">' + (order + index) + '</td>'
					trElement += '<td>' + pluginName + '</td>';
					trElement += '<td>' + pluginTaskName + '</td>';
					trElement += '<td>' + command.createDate + '</td>';
					trElement += '<td>' + command.commandOwnerUid + '</td>';
					trElement += '<td class="text-center">' + command.uidList.length + '</td>';
					trElement += '<td class="text-center">' + successfullTaskCount + '</td>';
					trElement += '<td class="text-center">' + (command.uidList.length - successfullTaskCount - failedTaskCount) + '</td>';
					trElement += '<td class="text-center">' + failedTaskCount + '</td>';
					if(command.task.cronExpression != null) {
						trElement +='<td class="text-center">Evet</td>';
					} else {
						trElement +='<td class="text-center">Hayır</td>';
					}
					
		        	trElement += '<td class="text-center"><a href="#taskExecutedAgentModal" class="edit" data-toggle="modal" '
							  + 'onclick="commandDetailClicked(' + command.id + ',\'' + pluginTaskName + '\')" data-id="' + command.id
		        			  + '" data-toggle="modal" data-target="#taskExecutedAgentModal">'
		        			  + '<i class="fa fa-info-circle fa-lg" aria-hidden="true"></i>'
		        			  + '</tr>';
		        	$('#commandTableBody').append(trElement);
				
		        });
	    	} else {
		    	var trElement = '<tr><td colspan="100%" class="text-center">Sonuç Bulunamadı</td></tr>';
				$("#commandTableBody").empty();
				$("#pagingList").empty();
		    	$('#commandTableBody').append(trElement);
	    	}
	    },
	    error: function (jqXHR, textStatus, errorThrown) {
	    	$.notify("Seçili istemciler getirilirken hata oluştu.",  "error");
	    	if(jqXHR != null && jqXHR.status == 401) {
	    		$.notify(jqXHR.responseJSON.message,  "error");
	    	}
	    	var trElement = '<tr><td colspan="100%" class="text-center">Sonuç Bulunamadı</td></tr>';
			$("#commandTableBody").empty();
			$("#pagingList").empty();
	    	$('#commandTableBody').append(trElement);
	    }, complete: function() {
			progress("executedTaskReportBodyDiv","progressExecutedTaskReport",'hide');
		}



	});
}

function search() {
	taskCommand = $("#selectTaskCommand option:selected").val();
	if(filterStartDate != "")
		selectedFilterStartDate = filterStartDate;
	if(filterEndDate != "")
		selectedFilterEndDate = filterEndDate;
	
	reloadTable(1, selectedPageSize, taskCommand);
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

