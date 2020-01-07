/**
 * When page loaing getting compters from LDAP and ldap computers tree fill out on the treegrid that used jqxTreeGrid api..
 * also plugin task tables load on start.
 * 
 * M. Edip YILDIZ
 * 
 */

connection.addHandler(onPresence2, null, "presence");

var selectedEntries = []; 
var selectedPluginTask;

//creating pluginTask Table on the page

loadPluginTaskTable(false);

var html = '<table class="table table-striped table-bordered " id="rosterListTable">';
for (var i = 0; i < rosterList.length ; i++) {
	var roster=rosterList[i];
	html += '<tr>';
	html += '<td>' + roster.item_name + '</td>';
	html += '</tr>';
}
html += '</table>';
$('#rosterListHolder').html(html);


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

$(document).ready(function(){
	$("#createAgentGroup").hide();
	$("#newGroupInput").hide();
	$.ajax({
		type : 'POST',
		url : 'lider/ldap/getComputers',
		dataType : 'json',
		success : function(data) {
			loadComputersTree(data)
		},
		error: function (data, errorThrown) {
			console.log(data);
		}
	});

	$('#selectedEntryListModal').on('show.bs.modal', function(event) {
		showSelectedEntries();
	});
	$('#textTaskSearch').keyup(function() {
		var txt=$('#textTaskSearch').val();
		$("#pluginListTable > tbody > tr").filter(function() {
			$(this).toggle($(this).text().indexOf(txt) > -1)
		});
	});
});

function showSelectedEntries() {
	var html = '<div><button id="createAgentGroup" data-toggle="modal" onclick="createAgentGroupClicked()" data-target="#createAgentGroupModal" type="button" class="btn btn-info pull-right btn-group" title="İstemcileri Ekle" ><i class="material-icons">add</i> <span>Seçili İstemcilerden Grup Oluştur</span> </button><br></div>';
	html += '<table class="table table-striped table-bordered " id="selectedEntry4TaskTables">';
	html += '<tr>';
	html += '<th style="width: 5%"></th>';
	html += '<th style="width: 30%">Bilgisayar Adı</th>';
	html += '<th style="width: 50%">DN</th>';
	html += '<th style="width: 15%"></th>';
	html += '</tr>';

	for (var i = 0; i < selectedEntries.length; i++) {
		html += '<tr>';
		html += '<td>' + (i+1) + '</td>';
		html += '<td>' + selectedEntries[i].name + '</td>';
		html += '<td>' + selectedEntries[i].distinguishedName + '</td>';
		html += '<td class="text-center">';
		html += '<button class="btn btn-danger removeEntry" type="button" id="' +selectedEntries[i]+ '" data-id="'+ selectedEntries[i]+'" title="Kaldir">Kaldır</button>';
		html += '</td>';
		html += '</tr>';
	}
	html += '</table>';

	$('#selectedEntriesHolder').html(html);

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
		if(selectedEntries.length>1){
			loadPluginTaskTable(true);
		}
		else{
			loadPluginTaskTable(false);
		}
	});
}

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
			html += '<th style="width: 25%" >Açıklama</th>';
			html += '<th style="width: 10%"></th>';
			html += '</tr>';
			html += '</thead>';
			
		    for (var i = 0; i < pluginTaskList.length ; i++) {
		    	
		    	var entry=pluginTaskList[i];
		    	if(isMulti==entry.isMulti){

		        	html += '<tr>';
		            html += '<td>' + entry.name + '</td>';
		            html += '<td>' + entry.description + '</td>';
		            html += '<td>  <button class="btn btn-xs btn-default sendTaskButton" type="button" id="sendTaskButtonId" title="Görev Gönder" data-toggle="modal" data-target="#pluginHtmlPageLargeModal" data-id="' + entry.id + '" data-page="'
		            + entry.page +'" data-name="'+ entry.name +'" data-description="'+ entry.description+'" > <i class="fa fa-tasks fa-w-20"> </i> </button>  </td>';
		            html += '</tr>';
		    	}
		    	else if(isMulti== false){
		    		html += '<tr>';
		            html += '<td>' + entry.name + '</td>';
		            html += '<td>' + entry.description + '</td>';
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
					 $('#pluginHtmlPageLargeModalLabel').html("Lütfen Görev Gönderilecek İstemci Seçiniz.");
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
						
						if (page == "manage-root" || page == "end-session") {
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
			var row = $("#treegrid").jqxTreeGrid('getRow', name);
			row.online=false;
			$("#treegrid").jqxTreeGrid('updateRow', name , {name:name}); 

		} else {
			var row = $("#treegrid").jqxTreeGrid('getRow', name);
			row.online=true;
			$("#treegrid").jqxTreeGrid('updateRow', name , {name:name}); 
		}
	}
	return true;
}

function loadComputersTree(data){
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
				{ name: "attributes", type: "array" },
				{ name: "entryUUID", type: "string" },
				{ name: "childEntries", type: "array" }
				],
				hierarchy:
				{
					root: "childEntries"
				},
				localData: data,
				id: "name"
	};

	var cellclass = function (row, columnfield, value,rowData) {

		//if((value.indexOf("online") != -1) || (rowData.online) ){
		if(rowData.online){
			return 'green';
		}
		else{
			return 'white';
		}
//		if (rowData.online) {
//		return 'green';
//		}
//		else if (!rowData.online) {
//		return 'white';
//		}
	};

	var dataAdapter = new $.jqx.dataAdapter(source, {
		loadComplete: function () {
		}
	});

	var getLocalization = function () {
		var localizationobj = {};
		localizationobj.filterSearchString = "Ara :";
		return localizationobj;
	}

	// create jqxTreeGrid.
	$("#treegrid").jqxTreeGrid(
			{
				width: '100%',
				source: dataAdapter,
				altRows: true,
				sortable: true,
				theme :"Orange",
				columnsResize: true,
				filterable: true,
				hierarchicalCheckboxes: true,
				pageable: true,
				pagerMode: 'default',
				checkboxes: true,
				filterMode: "simple",
				localization: getLocalization(),
				pageSize: 30,
				pageSizeOptions: ['15', '25', '50'],
				icons: function (rowKey, dataRow) {
					var level = dataRow.level;
					if(dataRow.type == "AHENK"){
						return "img/linux.png";
					}
					else return "img/entry_org.gif";
				},
				ready: function () {

					var allrows =$("#treegrid").jqxTreeGrid('getRows');
					if(allrows.length==1){
						var row=allrows[0];
						if(row.childEntries==null && row.name=="Ahenkler"){

							$("#treegrid").jqxTreeGrid('addRow', row.name+"1", {}, 'last', row.name);
						}
					}
					$("#treegrid").jqxTreeGrid('collapseAll');
				},
				rendering: function()
				{
					/* // destroys all buttons.
               if ($(".editButtons").length > 0) {
                   $(".editButtons").jqxButton('destroy');
               } */

				},

				rendered: function () {

				},

				columns: [
					{ text: "Bilgisayarlar", align: "center", dataField: "name", cellclassname: cellclass ,width: '100%'}

					]
			});

	$('#treegrid').on('rowExpand', function (event) {
		var args = event.args;
		var row = args.row;

		if(row.expandedUser=="FALSE") {
			var nameList=[];
			for (var m = 0; m < row.records.length; m++) {
				var childRow = row.records[m];
				nameList.push(childRow.name);      
			}
			for (var k = 0; k < nameList.length; k++) {
				// get a row.
				var childRowname = nameList[k];
				$("#treegrid").jqxTreeGrid('deleteRow', childRowname); 
			}  
			$.ajax({
				type : 'POST',
				url : 'lider/ldap/getOuDetails',
				data : 'uid=' + row.distinguishedName + '&type=' + row.type
				+ '&name=' + row.name + '&parent=' + row.parent,
				dataType : 'text',
				success : function(ldapResult) {
					var childs = jQuery.parseJSON(ldapResult);
					var onlineCount=0;
					for (var m = 0; m < childs.length; m++) {
						// get a row.
						var childRow = childs[m];
						if(childRow.online){
							onlineCount++;
						}
						$("#treegrid").jqxTreeGrid('addRow', childRow.name, childRow, 'last', row.name);
						if(childRow.hasSubordinates=="TRUE"){
							$("#treegrid").jqxTreeGrid('addRow', childRow.name+"1" , {}, 'last', childRow.name); 
						}
						$("#treegrid").jqxTreeGrid('collapseRow', childRow.name);
					} 
					row.expandedUser="TRUE"
						if(onlineCount == 0){
							newName=row.ou+" ("+childs.length+")";
						}
						else{
							newName=row.ou+" ("+childs.length+"-"+onlineCount +")";
						}
					$("#treegrid").jqxTreeGrid('updateRow',row.name, {name:newName });
				}
			});  
		}
	}); 

	// adding tree selected computers to box
	$('#addSelectedEntry2Box').on('click',function() {
		var checkedRows = $("#treegrid").jqxTreeGrid('getCheckedRows');
		var checkedEntryArray=[]
		for (var i = 0; i < checkedRows.length; i++) {
			// get a row.
			var rowData = checkedRows[i];
			checkedEntryArray.push({
				distinguishedName :rowData.distinguishedName, 
				entryUUID: rowData.entryUUID, 
				name: rowData.name,
				type: rowData.type,
				uid: rowData.uid
			});
		}

		$.ajax({
			url : 'lider/ldap/getAhenks',
			type : 'POST',
			data: JSON.stringify(checkedEntryArray),
			dataType: "json",
			contentType: "application/json",
			success : function(data) {
				var ahenks = data;
				console.log("gelen ahenkler")
				console.log(ahenks)
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
				$('#selectedEntrySize').html(selectedEntries.length);
				if(selectedEntries.length>1){
					loadPluginTaskTable(true);
				}
				else{
					loadPluginTaskTable(false);
				}
			}
		});
	});
	$('#addOnlyOnlineAhenk').on('click',function() {

		var checkedRows = $("#treegrid").jqxTreeGrid('getCheckedRows');
		console.log(checkedRows)
		var checkedEntryArray=[]

		for (var i = 0; i < checkedRows.length; i++) {
			// get a row.
			var rowData = checkedRows[i];
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
				$('#selectedEntrySize').html(selectedEntries.length);
				if(selectedEntries.length>1){
					loadPluginTaskTable(true);
				}
				else{
					loadPluginTaskTable(false);
				}
			}
		});
	});

	$('#tab-task-history').on('click',function() {
		var checkedRows = $("#treegrid").jqxTreeGrid('getCheckedRows');
		if(checkedRows.length==0){
			$("#taskHistoryTable").empty();
	    	var trElement = '<tr><td colspan="100%" class="text-center">Görev tarihçesini görüntelemek için sadece bir adet istemci seçiniz.</td></tr>';
	    	$('#taskHistoryTable').append(trElement);
			//alert("zero");
		}
		else {
			var selectedRowData=checkedRows[checkedRows.length-1]
			//alert(selectedRowData.uid)
			//alert(selectedRowData.distinguishedName)
			var params = {
			    "dn" : selectedRowData.distinguishedName
			};
			$.ajax({ 
			    type: 'POST', 
			    url: "/command",
			    dataType: 'json',
			    data: params,
			    success: function (data) { 
			    	$.notify("Selected agents are added to group successfully.", "success");
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
			    			trElement += '<td><a href="#executedTaskDetail" class="view text-center" '
			    					  + 'onclick="executedTaskDetailClicked(' 
			    					  + command.commandExecutions[0].id + ')" data-id="' + command.commandExecutions[0].id
			    					  + '" data-toggle="modal" data-target="#executedTaskDetail">'
			    					  + '<i class="pe-7s-info"></i>'
			    					  + '</a></td></tr>';
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
	});
	
	$('#treegrid').on('rowDoubleClick', function (event) {
		var args = event.args;
		var row = args.row;
		var name= row.name;
		var row = $("#treegrid").jqxTreeGrid('getRow', name);

		var html = '<table class="table table-striped table-bordered " id="attrTable">';
		html += '<thead>';
		html += '<tr>';
		html += '<th style="width: 40%"></th>';
		html += '<th style="width: 60%"></th>';
		html += '</tr>';
		html += '</thead>';

		for (key in row.attributes) {
			if (row.attributes.hasOwnProperty(key)) {
				console.log(key + " = " + row.attributes[key]);

				html += '<tr>';
				html += '<td>' + key + '</td>';
				html += '<td>' + row.attributes[key] + '</td>';
				html += '</tr>';
			}
		}

		html += '</table>';

		$('#selectedDnInfo').html("Seçili Kayıt: "+name);
		$('#ldapAttrInfoHolder').html(html);

		$('.nav-link').each(function(){               
			var $tweet = $(this);                    
			$tweet.removeClass('active');
		});
		$('#tab-c-4-info').addClass('nav-link active');
		$('#tab-c-4-info').click();

	});
	$('#treegrid').on('rowClick', function (event) {
		//alert("dsad");
	});
	$("#treegrid").on('change', function (event) {
		alert("aaaabbb");
	});
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
		$.notify("Please select at lease one agent.", "error");
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
		url: "/lider/ldap/group/new",
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