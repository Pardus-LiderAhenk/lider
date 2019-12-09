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
$(document).ready(function(){
	//load table data when page opened
	//1st page and selectedPageSize amount will be retrieved from service
	reloadTable(1, selectedPageSize);
	//set paging according to total page number
	pagination(1, totalPageNumber);
	
	//if pageSize changes load first page with new pageSize amount
	$("#pageSize").change(function(){
		selectedPageSize = $("#pageSize option:selected").val();
		selectedPage = 1;
		reloadTable(1, selectedPageSize);
	});
});

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
	var phase=1;
	
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

function agentDetail(agentID) {
	$("#agentDetailTable").empty();
	$.ajax({ 
	    type: 'GET', 
	    url: 'agents/' + agentID, 
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
				$('#agentDetailModal').modal('show'); 
	    	}
	    	else {
	    		alert("Error while retrieving agent data.");
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

//retrieves agents pageable object from service with given page number and pageSize
function reloadTable(pNumber, pSize, field, text) {
	var urlString = "";
	if (field && text) {
		urlString = 'agents/' + pNumber +'/' + pSize + '/' + field + '/' + text
	} else {
		urlString = 'agents/' + pNumber +'/' + pSize
	}
	$.ajax({ 
	    type: 'GET', 
	    url: urlString,
	    dataType: 'json',
	    success: function (data) { 
	    	if(data.content.length > 0) {
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
					});
		        	var trElement = '<tr>'
		        				  + '<td  class="text-center">' + element.id + '</td>';
		        	if(os == "Windows") {
		        		trElement +=  '<td><a href="#"><img  src="img/windows.png" class="avatar" alt="Avatar"><span>' + element.hostname + '</span></a></td>';
		        	}
		        	else {
		        		trElement += '<td><a href="#"><img  src="img/pardus.png" class="avatar" alt="Avatar"><span>' + element.hostname + '</span></a></td>';
		        	}
		        	trElement    += '<td>' + element.macAddresses + '</td>'
		        				  + '<td>' + element.ipAddresses + '</td>';
		        	if(element.isOnline == true) {
		        		trElement    += '<td><span class="status text-success">&bull;</span> Açık</td>';
		        	}
		        	else {
		        		trElement    += '<td><span class="status text-danger">&bull;</span> Kapalı</td>';
		        	}
		        	trElement     += '<td>' + brand + '</td>'
		        				  + '<td>' + os + '</td>'
		        				  + '<td>' + osDistributionVersion + '</td>'
		        				  + '<td>' + createDate + '</td>'
		        				  + '<td><a href="javascript:agentDetail(' + element.id + ')"" class="view" title="Detayları Görüntüle" data-toggle="tooltip"><i class="ion-ios-information-outline"></i></a></td>'
		        				  + '</tr>';
		        	$('#agentsTable').append(trElement);
		        });
	    	}
	    },
	    error: function (data, errorThrown) {
	    	var trElement = '<tr><td colspan="100%" class="text-center">Sonuç Bulunamadı</td></tr>';
				$("#agentsTable").empty();
				$("#pagingList").empty();
	    	$('#agentsTable').append(trElement);
	    }
	});
}

function search() {
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