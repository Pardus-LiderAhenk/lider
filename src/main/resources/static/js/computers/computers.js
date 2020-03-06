/**
 * When page loaing getting compters from LDAP and ldap computers tree fill out on the treegrid that used jqxTreeGrid api..
 * also plugin task tables load on start.
 * 
 * M. Edip YILDIZ
 * 
 */

var selectedRow= null;
var baseRootDnComputer=null;
var selectedEntries = []; 
var selectedPluginTask;
var selectedAgentGroupDN = "";
var selectedOUDN = "";
var treeGridHolderDiv= "computerTreeDiv";
var computerTreeCreated=false;

//creating pluginTask Table on the page
//loadPluginTaskTable(false);
connection.addHandler(onPresence2, null, "presence");

//selected row function action behave different when selected tab change.. for this use selectedTab name
var selectedTab="sendTask";

$("#dropdownButton").hide();

function onPresence2(presence)
{
	var ptype = $(presence).attr('type');
	var from = $(presence).attr('from');
	var jid_id = jid_to_id(from);
	var name = jid_to_name(from);
	var source = jid_to_source(from);
	
	
	if (ptype === 'subscribe') {
		$.notify("subscribe","warn");
	} 
	else if (ptype !== 'error') {
		//OFFLine state
		if (ptype === 'unavailable') {
			
			if(computerTreeCreated){
				var row = $('#computerTreeDivGrid').jqxTreeGrid('getRow', name);
				row.online=false;
				$('#computerTreeDivGrid').jqxTreeGrid('updateRow', name , {name:name});
			}
		} else {
			
			if(computerTreeCreated){
				var row = $('#computerTreeDivGrid').jqxTreeGrid('getRow', name);
				row.online=true;
				$('#computerTreeDivGrid').jqxTreeGrid('updateRow', name , {name:name}); 
			}
		}
	}
	return true;
}

setOnlineEntryList();
taskHistory();
selectedEntryDetail();
/*
 * create user tree select, check and uncheck action functions can be implemented if required
 * params div, onlyFolder, use Checkbox, select action , check action, uncheck action
 */
createComputerTree(treeGridHolderDiv, false, false,
		// row select
		function(row, rootDnComputer){
			selectedRow=row;
			baseRootDnComputer=rootDnComputer;
			if(selectedTab=="sendTask"){
				$('.nav-link').each(function(){               
					var $tweet = $(this);                    
					$tweet.removeClass('active');
				});
				$('#tab-new-task').tab('show');
			}
			else if(selectedTab=="showEntryDetail"){
				selectedEntryDetail();
				$('.nav-link').each(function(){               
					var $tweet = $(this);                    
					$tweet.removeClass('active');
				});
				$('#tab-entryinfo').tab('show');
			}
			else if(selectedTab=="taskHistory"){
				
				taskHistory()
				$('.nav-link').each(function(){               
					var $tweet = $(this);                    
					$tweet.removeClass('active');
				});
				$('#tab-task-history-tab').tab('show');
			}
			else if(selectedTab=="onlineAgents"){
				
				
			}
			
			
		},
		//check action
		function(checkedRows, row){
			
		},
		//uncheck action
		function(unCheckedRows, row){
			
		}
);

computerTreeCreated=true;

$('#tab-entry-info').on('click',function() {
	selectedTab="showEntryDetail";
	selectedEntryDetail()
	
});
$('#tab-send-task').on('click',function() {
	selectedTab="sendTask";
});

$('#tab-task-history').on('click',function() {
	selectedTab="taskHistory";
	taskHistory()
});
$('#tab-onlineAgents').on('click',function() {
	selectedTab="onlineAgents";
});

$('#btnAddAgents').click(function() {
	addSelectedEntryToTable(selectedRow,baseRootDnComputer);
	
});

$('#addOnlyOnlineAgents').click(function() {
	var selection =$('#computerTreeDivGrid').jqxTreeGrid('getSelection');
	
	if(selection && selection.length>0){
		var checkedEntryArray=[]

		for (var i = 0; i < selection.length; i++) {
			// get a row.
			var rowData = selection[i];
			
			checkedEntryArray.push(
			{
				distinguishedName :rowData.distinguishedName, 
				entryUUID: rowData.entryUUID, 
				name: rowData.name,
				type: rowData.type,
				uid: rowData.uid
			});
		}
		$.ajax({
			url : 'lider/ldap/getOnlineAhenks',
			type : 'POST',
			data: JSON.stringify(checkedEntryArray),
			dataType: "json",
			contentType: "application/json",
			success : function(data) {
				var ahenks = data;
				selectedEntries=[]
				if(ahenks.length==0)
					$.notify("Online istemci bulunmamaktadır.", "warn");
				else
					$.notify(ahenks.length+ " adet online istemci eklendi.", "success");
				for (var i = 0; i < ahenks.length; i++) {
					// get a row.
					var rowData = ahenks[i];
					if(rowData.type=="AHENK"){
						var indexx=$.grep(selectedEntries, function(item){
							return item.entryUUID == rowData.entryUUID;
						}).length

						if(indexx ==0 ){
							selectedEntries.push(rowData);
						}
					}
				}
				showSelectedEntries();
			}
		});
	}
	else{
		$.notify("Lütfen Arama Dizini Seçiniz", "warn");
	}
});

function loadPluginTaskTable(isMulti) {
	$.ajax({
		type : 'POST',
		url : 'getPluginTaskList',
		dataType : 'json',
		success : function(data) {
			var pluginTaskList = data;

			var html = '<table class="table table-striped table-bordered " id="pluginListTable">';
			html += '<thead>';
			html += '<tr>';
			html += '<th style="width: 40%">Görev Adı</th>';
//			html += '<th style="width: 25%" >Açıklama</th>';
			html += '<th style="width: 10%"></th>';
			html += '</tr>';
			html += '</thead>';
			
		    for (var i = 0; i < pluginTaskList.length ; i++) {
		    	
		    	var entry=pluginTaskList[i];
		    	if(isMulti==entry.isMulti){

		        	html += '<tr>';
		            html += '<td title="'+entry.description +'">' + entry.name + '</td>';
//		            html += '<td>' + entry.description + '</td>';
		            html += '<td>  <button class="btn btn-xs btn-default sendTaskButton" type="button" id="sendTaskButtonId" title="Görev Gönder" data-toggle="modal" data-target="#pluginHtmlPageLargeModal" data-id="' + entry.id + '" data-page="'
		            + entry.page +'" data-name="'+ entry.name +'" data-description="'+ entry.description+'" > <i class="fa fa-tasks fa-w-20"> </i> </button>  </td>';
		            html += '</tr>';
		    	}
		    	else if(isMulti== false){
		    		html += '<tr>';
		    		html += '<td title="'+entry.description +'">' + entry.name + '</td>';
//		            html += '<td>' + entry.description + '</td>';
		            html += '<td>  <button class="btn btn-xs btn-default sendTaskButton" type="button" id="sendTaskButtonId" title="Görev Gönder" data-toggle="modal" data-target="#pluginHtmlPageLargeModal" data-id="' + entry.id + '" data-page="'
		            + entry.page +'" data-name="'+ entry.name +'" data-description="'+ entry.description+'" > <i class="fa fa-tasks fa-w-20"> </i> </button>  </td>';		 
		            html += '</tr>';
		    	}	    	
		    }
		    html += '</table>';
		    
		    $('#pluginListTableDiv').html(html);	
		    
		    $('.sendTaskButton').click(function() {
		    	
				if(selectedEntries.length ==0){
					 $.notify("Lütfen Görev Gönderilecek İstemci Seçiniz.","warn");
					 $(this).removeAttr("data-target");
					 $(this).removeAttr("data-toggle");
				}
				else{
						$(".sendTaskButton").attr("data-target", "#pluginHtmlPageLargeModal");
						$(".runButtonLargeModalCls").attr("id", "runButtonLargeModalId"); //default send task button id for plugin page X large modal
						$(".runButtonNormalModalCls").attr("id", "runButtonNormalModalId"); //default send task button id for plugin page normal modal
						var pageModalLabel = "#pluginHtmlPageModalLabel";
						var pageModalRender = "#pluginPageRender";
						
						var page = $(this).data('page');
						var name = $(this).data('name');
						var description = $(this).data('description');
						var id = $(this).data('id');
						
						if (page == "manage-root" || page == "end-sessions" || page == "package-management") {
							pageModalLabel = "#pluginHtmlPageModalLabel2";
							pageModalRender = "#pluginPageRender2";
							$(".sendTaskButton").attr("data-target", "#pluginHtmlPageNormalModal");
						}
								
						$.ajax({
							type : 'POST',
							url : 'getPluginTaskHtmlPage',
							data : 'id=' + id + '&name=' + name
									+ '&page=' + page + '&description=' + description,
							dataType : 'text',
							success : function(data) {
								
								for (var m = 0; m < pluginTaskList.length; m++) {
								 	// get a row.
						          	var pluginT = pluginTaskList[m];
						          
							          if(page==pluginT.page){
							        	  selectedPluginTask=pluginT;
							          }
								}
								$(pageModalLabel).html(name);
								$(pageModalRender).html(data);

							}
						});				
					}
			});
		}
	});
}

function executedTaskDetailClicked(executionDate, pluginName, commandExecutionResultID) {

	var params = {
		    "id" : commandExecutionResultID
	};
	$.ajax({ 
	    type: 'POST', 
	    url: "/command/commandexecutionresult",
	    dataType: 'json',
	    data: params,
	    success: function (data) { 
	    	if(data != null) {
	    		if(data.responseDataStr != null) {
    				var tableContent = '<tr><th style="width: 35%">Görev Adı</th><td style="width: 65%">' + pluginName + '</td></tr>';
	    			if(data.responseCode == "TASK_PROCESSED" || data.responseCode == "TASK_ERROR") {
	    				if(data.responseCode == "TASK_PROCESSED") {
		    				tableContent += '<tr><th>Çalıştırma Sonucu</th><td>' + 'Başarılı' + '</td></tr>';
		    			} else if(data.responseCode == "TASK_ERROR") {
		    				tableContent += '<tr><th>Çalıştırma Sonucu</th><td>' + 'Hata Oluştu' + '</td></tr>';
		    			}
	    				
	    				var rawEndDate = data.createDate;
			        	var year = rawEndDate.substring(0,4);
			        	var month = rawEndDate.substring(5,7);
			        	var day = rawEndDate.substring(8,10);
			        	var time = rawEndDate.substring(11,19);
						executionTime = day + '.' + month + '.' + year + ' ' + time;
						tableContent += '<tr><th>Oluşturulma Tarihi</th><td>' + executionDate + '</td></tr>';
						tableContent += '<tr><th>Çalıştırılma Tarihi</th><td>' + executionTime + '</td></tr>';
						if(data.responseDataStr != null && data.responseDataStr != "" && data.responseDataStr != "?") {
							tableContent += '<tr><th colspan="100%"><h6>Görev Çalıştırılması Sonucunda Kaydedilen Veriler</h6></th></tr>';
							$.each(jQuery.parseJSON( data.responseDataStr ), function(key, value){
							    tableContent += '<tr><th>' + key + '</th><td>' + value + '</td></tr>';
							});
						}
	    			} else {
	    				tableContent += '<tr><th>Çalıştırma Sonucu</th><td>' + 'Gönderildi' + '</td></tr>';
	    				tableContent += '<tr><th>Oluşturulma Tarihi</th><td>' + executionDate + '</td></tr>';
	    				tableContent += '<tr><th>Çalıştırılma Tarihi</th><td>' + '-' + '</td></tr>';
	    			}
	    			tableContent += '<tr><th>Ahenkten Gelen Mesaj</th><td>' + data.responseMessage + '</td></tr>';
	    			
					$("#executedTaskDetailTable").empty();
			    	$('#executedTaskDetailTable').append(tableContent);
	    		}
	    	} else {
	    		$.notify("No results found.", "error");
	    	}
	    },
		error: function (data, errorThrown) {
			$.notify("Something went wrong.", "error");
		}
	});
}

function dropdownButtonClicked(operation) {
		if(operation == "addToExistingGroup") {
			getModalContent("modals/computer/addtoexistinggroup", function content(data){
				$('#genericModalHeader').html("Seçili İstemcileri Gruba Ekle");
				$('#genericModalBodyRender').html(data);
				generateAddToExistingGroupTreeGrid();
				$("#addToExistingGroupButtonDiv").hide();
					
				});
		} else if(operation == "addToNewGroup") {
			getModalContent("modals/computer/addtonewgroup", function content(data){
				$('#genericModalHeader').html("Seçili İstemcileri Gruba Ekle");
				$('#genericModalBodyRender').html(data);
				generateAddToNewGroupTreeGrid();
				
			});
		}
}

function generateAddToExistingGroupTreeGrid() {
	$("#existingTreeGrid").jqxTreeGrid('destroy');
	$("#existingTreeGridDiv").append('<div id="existingTreeGrid"></div> ');
	
	$.ajax({
		type : 'POST',
		url : 'lider/ldap/agentGroups',
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
				url : 'lider/ldap/getOuDetails',
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
			$("#addToExistingGroupButtonDiv").show();
		} else {
			$("#addToExistingGroupButtonDiv").hide();
		}
	});
}

function generateAddToNewGroupTreeGrid() {
	$("#newTreeGrid").jqxTreeGrid('destroy');
	$("#newTreeGridDiv").append('<div id="newTreeGrid"></div> ');
	
	$.ajax({
		type : 'POST',
		url : 'lider/ldap/agentGroups',
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
				url : 'lider/ldap/getOuDetails',
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
	var selectedAgentDN = [];
	for(var i = 0; i < selectedEntries.length; i++) {
		selectedAgentDN.push(selectedEntries[i].distinguishedName);
	}
	var selected = $("#selectGroupDN").children("option:selected").val();
	if(selectedAgentDN.length > 0) {
		var params = {
			    "groupDN" : selectedAgentGroupDN,
			    "checkedList": selectedAgentDN
			};
		$.ajax({ 
		    type: 'POST', 
		    url: "/lider/ldap/group/existing",
		    dataType: 'json',
		    data: params,
		    success: function (data) { 
		    	$.notify("Seçili istemciler gruba başarıyla eklendi", "success");
		    	$('#genericModal').trigger('click');
		    },
		    error: function (data, errorThrown) {
		    	$.notify("Seçili istemciler gruba eklenirken hata oluştu.", "error");
		    }
		});
	}
}

function btnAddToNewGroupClicked() {
	var groupName = $('input[name=newAgentGroupName]').val();
	if(groupName != "") {
		var selectedAgentDN = [];
		for(var i = 0; i < selectedEntries.length; i++) {
			selectedAgentDN.push(selectedEntries[i].distinguishedName);
		}
		var params = {
			    "selectedOUDN" : selectedOUDN,
			    "groupName": $('input[name=newAgentGroupName]').val(),
			    "checkedList": selectedAgentDN
			};
		
		$.ajax({ 
		    type: 'POST', 
		    url: "/lider/ldap/createNewAgentGroup",
		    dataType: 'json',
		    data: params,
		    success: function (data) { 
		    	$.notify("Yeni grup oluşturuldu ve istemciler gruba eklendi.", "success");
		    	$('#genericModal').trigger('click');
		    },
		    error: function (data, errorThrown) {
		    	$.notify("Yeni grup oluşturulurken hata oluştu." + $('input[name=newAgentGroupName]').val() + " oluşturulamadı.", "error");
		    }
		});
	} else {
		$.notify("Lütfen grup adı giriniz.", "error");
	}

}
function rbGroupsChange(status) {
	if(status == "existingGroup") {
		$("#newGroupInput").hide();
		$("#existingGroupInput").show();
		$("#submitGroup").attr("onclick","addAgentsToExistingGroup()");
		$('#submitGroup').text('İstemcileri Seçili Gruba Ekle');
	} else {
		$("#existingGroupInput").hide();
		$("#newGroupInput").show();
		$("#submitGroup").attr("onclick","addNewGroup()");
		$('#submitGroup').text('Yeni Grup Oluştur');
	}
}

function createAgentGroupClicked () {
	if(selectedEntries.length > 0) {
		$.ajax({ 
			type: 'GET', 
			url: '/lider/ldap/agentGroups',
			dataType: 'json',
			success: function (data) { 
				//choose existing radio button when modal is reopened
				$("#rbExistingGroup").prop("checked", true);
				$("#rbNewGroup").prop("checked", false);
				$('#groupName').val('');
				$("#newGroupInput").hide();
				$("#existingGroupInput").show();
				$("#submitGroup").attr("onclick","addAgentsToExistingGroup()");
				$('#submitGroup').text('İstemcileri Seçili Gruba Ekle');

				if(data.length > 0) {
					var options = $("#selectGroupDN");
					options.empty();
					$.each(data, function(index, element) {
						if(element.childEntries.length > 0) {
							$('#selectGroupDN').append('<option value="">Grup Seç</option>');
							$.each(element.childEntries, function(j, child) {
								options.append(new Option(child.name, child.distinguishedName));
							});
						}
					});
				}
			},
			error: function (data, errorThrown) {
				$.notify("Something went wrong.", "error");
			}
		});
	}
	else {
		$.notify("Lütfen en az bir istemci seçiniz.", "error");
	}
}

function addAgentsToExistingGroup() {
	var selectedAgentDN = [];
	for(var i = 0; i < selectedEntries.length; i++) {
		selectedAgentDN.push(selectedEntries[i].distinguishedName);
	}
	var selected = $("#selectGroupDN").children("option:selected").val();
	if(selected != "") {
		var params = {
				"groupDN" : $("#selectGroupDN").children("option:selected").val(),
				"checkedList": selectedAgentDN
		};
		$.ajax({ 
			type: 'POST', 
			url: "/lider/ldap/group/existing",
			dataType: 'json',
			data: params,
			success: function (data) { 
				$.notify("Selected gents are added to group successfully.", "success");
			},
			error: function (data, errorThrown) {
				$.notify("Something went wrong.", "error");
			}
		});
	}
}

function addNewGroup() {
	var selectedAgentDN = [];
	for(var i = 0; i < selectedEntries.length; i++) {
		selectedAgentDN.push(selectedEntries[i].distinguishedName);
	}
	var params = {
			"groupName" : $('input[name=groupName]').val(),
			"checkedList": selectedAgentDN
	};
	$.ajax({ 
		type: 'POST', 
		url: "/lider/ldap/createNewAgentGroup",
		dataType: 'json',
		data: params,
		success: function (data) { 
			$.notify("Group is created and agents are added to group successfully.", "success");
		},
		error: function (data, errorThrown) {
			$.notify("Error occured while adding new group. Group Name " + $('input[name=groupName]').val() + " could not be added.", "error");
		}
	});
}

function addSelectedEntryToTable(row,rootDnComputer){
	if(row.type=="AHENK"){
		
		var indexx=$.grep(selectedEntries, function(item){
			return item.entryUUID == row.entryUUID;
		}).length

		data={}
		data.type=row.type;
		data.entryUUID=row.entryUUID;
		data.name=row.name;
		data.online=row.online;
		data.uid=row.uid;
		data.distinguishedName=row.distinguishedName;
		data.cn=row.cn;
		data.attributes=row.attributes;
		
		if(indexx == 0 ){
			selectedEntries.push(data);
		}
		showSelectedEntries();
		
	}
	
	else if(row.type == "ORGANIZATIONAL_UNIT" && row.entryUUID != rootDnComputer){
		var selectedEntryArray=[]
		selectedEntryArray.push({
				distinguishedName :row.distinguishedName, 
				entryUUID: row.entryUUID, 
				name: row.name,
				type: row.type,
				uid: row.uid
		});
		
		$.ajax({
			url : 'lider/ldap/getAhenks',
			type : 'POST',
			data: JSON.stringify(selectedEntryArray),
			dataType: "json",
			contentType: "application/json",
			success : function(data) {
				var ahenks = data;
				
				for (var i = 0; i < ahenks.length; i++) {
					// get a row.
					var rowData = ahenks[i];
					if(rowData.type=="AHENK"){
						var indexx=$.grep(selectedEntries, function(item){
							return item.entryUUID == rowData.entryUUID;
						}).length

						if(indexx ==0 ){
							selectedEntries.push(rowData);
						}
					}
				}
				showSelectedEntries();
			}
		});
	}
}

function showSelectedEntries() {
	//var html = '<div><button id="createAgentGroup" data-toggle="modal" onclick="createAgentGroupClicked()" data-target="#createAgentGroupModal" type="button" class="btn btn-info pull-right btn-group" title="İstemcileri Ekle" ><i class="material-icons">add</i> <span>Seçili İstemcilerden Grup Oluştur</span> </button><br></div>';
	var html = '<table class="table table-striped table-bordered " id="selectedEntry4TaskTables">';
	html += '<tr>';
	html += '<th style="width: 5%"></th>';
	html += '<th style="width: 30%">Bilgisayar Adı</th>';
	html += '<th style="width: 15%"> <button id="btnRemoveAllAgents" class="btn btn-link btn-sm"> Tümünü Kaldır </button> </th>';
	html += '</tr>';
	
	if(selectedEntries.length == 0) {
		html += '<tr><td colspan="3" class="text-center">İşlem yapabilmek için en az bir istemci bulunmalıdır.</td></tr>';
		$("#dropdownButton").hide();
	} else {
		$("#dropdownButton").show();
	}
	
	for (var i = 0; i < selectedEntries.length; i++) {
		
		var onlyParentName="";
		var dn=selectedEntries[i].distinguishedName;
		var dnArr= dn.split(",");
		dnArr.forEach(function(entry) {
		    if(entry.startsWith("ou")){
		    	var onName=entry.split("=");
		    	onlyParentName +=onName[1]
		    	onlyParentName +=","
		    }
		});
		html += '<tr>';
		html += '<td>' + (i+1) + '</td>';
		if(selectedEntries[i].online)
		{
			html += '<td class="entryDetail " style="" title="'+selectedEntries[i].distinguishedName +'" > <font color="green"> * ' + selectedEntries[i].name +' </font>'  ;
		}
		else{
			html += '<td class="entryDetail" title="'+selectedEntries[i].distinguishedName +'" > ' + selectedEntries[i].name   ;
		}
		
//		html += '<div style = "display:none; background-color: black; color: yellow; " class=" card popup" style=" height: 100px;">   '+ selectedEntries[i].distinguishedName  + '</div> </td>';
		html += '<td class="text-center">';
		html += '<button class="btn btn-link btn-sm removeEntry" type="button" id="' +selectedEntries[i]+ '" data-id="'+ selectedEntries[i]+'" title="Kaldir"> Kaldır </button>';
		html += '</td>';
		html += '</tr>';
	}
	html += '</table>';

	$('.pizzaname').hide();
	$('#selectedAgentTable').html(html);

	if(selectedEntries.length>1){
		loadPluginTaskTable(true);
	}
	else{
		loadPluginTaskTable(false);
	}

	$('.removeEntry').on('click', function(e) {
		var uid = $(this).data("id");
		selectedEntries.splice($.inArray(uid, selectedEntries), 1);
		showSelectedEntries();
		$('#selectedEntrySize').html(selectedEntries.length);
		if(selectedEntries.length > 1){
			loadPluginTaskTable(true);
		}
		else{
			loadPluginTaskTable(false);
		}
	});
	$('#btnRemoveAllAgents').on('click', function(e) {
		selectedEntries=[];
		showSelectedEntries();
	});
	
	$('.entryDetail').hover(function() {
	    $(this).find('.popup').show();
	  }, function() {
	    $(this).find('.popup').hide();
	  });
}

function setOnlineEntryList() {
	var html = '<table class="table table-striped table-bordered " id="onlineEntryListTable">';
	html += '<thead>';
	html += '<tr>';
	html += '<th>JID</th>';
	html += '<th>Kaynak</th>';
	html += '</tr>';
	html += '</thead>';

	for (var i = 0; i < onlineEntryList.length ; i++) {
		var entry=onlineEntryList[i];
		html += '<tr>';
		html += '<td>' + entry.jid + '</td>';
		html += '<td>' + entry.source + '</td>';
		html += '</tr>';
	}
	html += '</table>';

	$('#onlineEntryListHolder').html(html);
}

function taskHistory() {
		if(selectedRow==null){
	    	var trElement = '<tr><td colspan="100%" class="text-center">Görev tarihçesini görüntelemek için sadece bir adet istemci seçiniz.</td></tr>';
	    	$("#taskHistoryTable").empty();
	    	$('#taskHistoryTable').append(trElement);
	    	$('#selectedAgentInfoSection').hide();
		}
		else {
//			var selectedRowData=checkedRows[checkedRows.length-1];
			$('#selectedAgentInfoSection').show();
			$("#selectedAgentDN").text(selectedRow.distinguishedName);
			var params = {
			    "dn" : selectedRow.distinguishedName
			};
			$.ajax({ 
			    type: 'POST', 
			    url: "/command",
			    dataType: 'json',
			    data: params,
			    success: function (data) { 
			    	if(data.length > 0) {
			    		var trElement = "";
			    		$.each(data, function(index, command) {
			    			var executionResult = "";
			    			var executionTime = "-";
				        	trElement += '<tr>';
				        	trElement += '<td>' + command.task.plugin.name + '</td>';
			    			if(command.commandExecutions[0].commandExecutionResults.length > 0) {
			    				executionResult = command.commandExecutions[0].commandExecutionResults[0].responseCode;
			    				var rawEndDate = command.commandExecutions[0].commandExecutionResults[0].createDate;
					        	var year = rawEndDate.substring(0,4);
					        	var month = rawEndDate.substring(5,7);
					        	var day = rawEndDate.substring(8,10);
					        	var time = rawEndDate.substring(11,19);
								executionTime = day + '.' + month + '.' + year + ' ' + time;

				    			if(executionResult == "TASK_PROCESSED") {
				    				trElement += '<td>' + '<div class="badge badge-success">Başarılı</div>' + '</td>';
				    			} else {
				    				trElement += '<td>' + '<div class="badge badge-danger">Hata oluştu</div>' + '</td>';
				    			}
			    			} else {
			    				trElement += '<td>' + '<div class="badge badge-info">Gönderildi</div>' + '</td>';
			    			}
			    			
			    			trElement += '<td>' + command.commandOwnerUid  + '</td>';
			    			
				        	var year = command.commandExecutions[0].createDate.substring(0,4);
				        	var month = command.commandExecutions[0].createDate.substring(5,7);
				        	var day = command.commandExecutions[0].createDate.substring(8,10);
				        	var time = command.commandExecutions[0].createDate.substring(11,19);
							var createDate = day + '.' + month + '.' + year + ' ' + time;
							
			    			trElement += '<td>' + createDate + '</td>';
			    			trElement += '<td>' + executionTime + '</td>';
			    			if(executionResult == "TASK_PROCESSED" || executionResult == "TASK_ERROR") {
				    			trElement += '<td><a href="#executedTaskDetail" class="view text-center" '
			    					  + 'onclick="executedTaskDetailClicked('
			    					  + '\'' + createDate + '\', '
			    					  + '\'' + command.task.plugin.name + '\', '
			    					  + '\'' + command.commandExecutions[0].commandExecutionResults[0].id + '\')" data-id="' 
			    					  + command.commandExecutions[0].commandExecutionResults[0].id
			    					  + '" data-toggle="modal" data-target="#executedTaskDetail">'
			    					  + '<i class="pe-7s-info"></i>'
			    					  + '</a></td></tr>';
			    			} else {
				    			trElement += '<td></td></tr>';
			    			}
			    		});
			    		$("#taskHistoryTable").empty();
			    		$('#taskHistoryTable').append(trElement);
			    	} else {
						$("#taskHistoryTable").empty();
				    	var trElement = '<tr><td colspan="100%" class="text-center">Bu ahenk üzerinde henüz bir görev çalıştırılmamıştır.</td></tr>';
				    	$('#taskHistoryTable').append(trElement);
			    	}
			    },
			    error: function (data, errorThrown) {
			    	$.notify("Something went wrong.", "error");
			    }
			});
		}
}

function selectedEntryDetail() {
	
	if(selectedRow!=null){
		$("#selectedDnInfo").html(selectedRow.distinguishedName)
		
		var html = '<table class="table table-striped table-bordered " id="attrTable">';
		html += '<thead>';
		html += '<tr>';
		html += '<th style="width: 40%"></th>';
		html += '<th style="width: 60%"></th>';
		html += '</tr>';
		html += '</thead>';

		for (key in selectedRow.attributes) {
			if (selectedRow.attributes.hasOwnProperty(key)) {
				html += '<tr>';
				html += '<td>' + key + '</td>';
				html += '<td>' + selectedRow.attributes[key] + '</td>';
				html += '</tr>';
			}
		}
		html += '</table>';

		$('#ldapAttrInfoHolder').html(html);
		$('.nav-link').each(function(){               
			var $tweet = $(this);                    
			$tweet.removeClass('active');
		});
		$('#tab-entryinfo').tab('show');
	}
}