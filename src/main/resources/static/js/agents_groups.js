/**
 * Agent group operations(group of names)
 * create, delete, editing members and move operations for groups.
 * create, delete and move operations for organizational units.
 * Hasan Kara
 * 
 */
var selectedDN = "";
var selectedName = "";
var selectedEntryParentDN = "";
var checkedAgents = [];
var checkedOUList = [];
var rootDNForAgentGroups = "";
var rootEntryUUID = "";
var selectedUUID = "";
var groupMemberDNList = [];
var groupMemberDNListForDelete = [];

var destinationDNToMoveRecord = "";
var selectedEntryUUIDForTreeMove = "";
$(document).ready(function(){
	createMainTree();
});

/*
 * events of dropdown button above main tree
 */
function dropdownButtonClicked(operation) {
	if(operation == "createNewAgentGroup") {
		checkedAgents = [];
		checkedOUList = [];
		$('#selectedAgentCountCreateNewAgentGroup').html(checkedAgents.length);
		getModalContent("modals/groups/agent/creategroup", function content(data){
			$('#genericModalHeader').html("İstemci Grubu Oluştur");
			$('#genericModalBodyRender').html(data);
			createComputersModalForCreatingGroup();
		});
	} else if(operation == "deleteAgentGroup") {
		checkedAgents = [];
		checkedOUList = [];
		getModalContent("modals/groups/agent/deletegroup", function content(data){
			$('#genericModalHeader').html("İstemci Grubunu Sil");
			$('#genericModalBodyRender').html(data);
		});
	} else if(operation == "deleteMembersFromGroup") {
		groupMemberDNListForDelete = [];
		groupMemberDNList = [];
		getModalContent("modals/groups/agent/deletemember", function content(data){
			$('#genericModalLargeHeader').html("Üye Sil");
			$('#genericModalLargeBodyRender').html(data);
			deleteMembersOfGroup();
		});
	} else if(operation == "createNewOrganizationalUnit") {
		getModalContent("modals/groups/agent/createou", function content(data){
			$('#genericModalHeader').html("Yeni Klasör Oluştur");
			$('#genericModalBodyRender').html(data);
		});
	} else if(operation == "deleteOrganizationalUnit") {
		getModalContent("modals/groups/agent/deleteou", function content(data){
			$('#genericModalHeader').html("Klasörü Sil");
			$('#genericModalBodyRender').html(data);
		});
	} else if(operation == "addMembersToAgentGroupModal") {
		checkedAgents = [];
		checkedOUList = [];
		getModalContent("modals/groups/agent/addmember", function content(data){
			$('#genericModalHeader').html("İstemci Grubuna Üye Ekle");
			$('#genericModalBodyRender').html(data);
			$('#selectedAgentCount').html(checkedAgents.length);
			generateTreeToAddMembersToExistingGroup();
		});
	} else if(operation == "moveEntry") {
		getModalContent("modals/groups/agent/moveentry", function content(data){
			$('#genericModalHeader').html("Kayıt Taşı");
			$('#genericModalBodyRender').html(data);
			generateTreeToMoveEntry();
		});
	} else if(operation == "editOrganizationalUnitName") {
		getModalContent("modals/groups/agent/editouname", function content(data){
			$('#genericModalHeader').html("Klasör Adı Düzenle");
			$('#genericModalBodyRender').html(data);
			$('#ouName').val(selectedName);
		});
	} else if(operation == "editGroupName") {
		getModalContent("modals/groups/agent/editgroupname", function content(data){
			$('#genericModalHeader').html("Grup Adı Düzenle");
			$('#genericModalBodyRender').html(data);
			$('#groupName').val(selectedName);
		});
	}
}

/*
 * create computer groups for base agent group page
 */
function createMainTree() {
	$("#treeGridAgentGroups").jqxTreeGrid('destroy');
	$("#treeGridAgentGroupsDiv").append('<div id="treeGridAgentGroups"></div> ');
	var html = '<a class="dropdown-item" href="#" data-toggle="modal" data-target="#genericModal"' 
		+ 'onclick="dropdownButtonClicked(\'createNewAgentGroup\')">Yeni İstemci Grubu Oluştur</a>';
	html += '<a class="dropdown-item" href="#" data-toggle="modal" data-target="#genericModal"' 
		+ 'onclick="dropdownButtonClicked(\'createNewOrganizationalUnit\')">Yeni Klasör Oluştur</a>';
	$('#operationDropDown').html(html);
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
			rootDNForAgentGroups = source.localData[0].distinguishedName;
			selectedEntryUUID = source.localData[0].entryUUID;
			rootEntryUUID = source.localData[0].entryUUID;
			var dataAdapter = new $.jqx.dataAdapter(source, {
			});

			var getLocalization = function () {
				var localizationobj = {};
				localizationobj.filterSearchString = "Ara :";
				return localizationobj;
			};

			// create jqxTreeGrid.
			$("#treeGridAgentGroups").jqxTreeGrid({
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
	
					var allrows =$("#treeGridAgentGroups").jqxTreeGrid('getRows');
					if(allrows.length==1){
						var row=allrows[0];
						if(row.childEntries==null){
							$("#treeGridAgentGroups").jqxTreeGrid('addRow', row.entryUUID+"1", {}, 'last', row.entryUUID);
						}
					}
					$("#treeGridAgentGroups").jqxTreeGrid('collapseAll');
					$("#treeGridAgentGroups").jqxTreeGrid('selectRow', selectedEntryUUID);
				},
				columns: [
					{ text: "İstemci Grup Ağacı", align: "center", dataField: "name", width: '100%'}
					]
			});
		}
	});
	
	$('#treeGridAgentGroups').on('rowExpand', function (event) {
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
				$("#treeGridAgentGroups").jqxTreeGrid('deleteRow', childRowname); 
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
						$("#treeGridAgentGroups").jqxTreeGrid('addRow', childRow.entryUUID, childRow, 'last', row.entryUUID);
						if(childRow.hasSubordinates=="TRUE"){
							$("#treeGridAgentGroups").jqxTreeGrid('addRow', childRow.entryUUID+"1" , {}, 'last', childRow.entryUUID); 
						}
						$("#treeGridAgentGroups").jqxTreeGrid('collapseRow', childRow.entryUUID);
					} 
					row.expandedUser = "TRUE";
				},
			    error: function (data, errorThrown) {
			    	$.notify("Grup bilgisi getirilirken hata oluştu.", "error");
			    }
			});  
		}
	}); 
	
	$('#treeGridAgentGroups').on('rowSelect', function (event) {
		var args = event.args;
		var row = args.row;
		var name= row.name;
		
		selectedDN = row.distinguishedName;
		selectedEntryUUID = row.entryUUID;
		selectedName = row.name;

		if(row.parent != null) {
			selectedEntryParentDN = row.parent.distinguishedName;
		}
		var html = '<table class="table table-striped table-bordered " id="attrTable">';
		html += '<thead>';
		html += '<tr>';
		html += '<th style="width: 40%">Öznitelik</th>';
		html += '<th style="width: 60%">Değer</th>';
		html += '</tr>';
		html += '</thead>';
		for (var key in row.attributesMultiValues) {
			if (row.attributesMultiValues.hasOwnProperty(key)  && key != "member") {
				if(row.attributesMultiValues[key].length > 1) {
					for(var i = 0; i< row.attributesMultiValues[key].length; i++) {
						html += '<tr>';
						html += '<td>' + key + '</td>';
						html += '<td>' + row.attributesMultiValues[key][i] + '</td>'; 
						html += '</tr>';
					}
				} else {
					html += '<tr>';
					html += '<td>' + key + '</td>';
					html += '<td>' + row.attributesMultiValues[key] + '</td>';
					html += '</tr>';
				}
			}
		}
	        
		html += '</table>';
		$('#entrInfoTabSelectedDnInfo').html("Seçili Kayıt: "+name);
		$('#memberTabSelectedDNInfo').html("Seçili Kayıt: "+name);
		$('#ldapAttrInfoHolder').html(html);
		
		if(row.type != "ORGANIZATIONAL_UNIT") {
			//enable members tab button
			$('#member-info').removeClass('disabled');
			var members = "";
			//to print members at different tab
			for (var key in row.attributesMultiValues) {
				if (row.attributesMultiValues.hasOwnProperty(key) && key == "member") {
					if(row.attributesMultiValues[key].length > 1) {
						for(var i = 0; i< row.attributesMultiValues[key].length; i++) {
							members += '<tr>';
							members += '<td class="text-center">' + (i + 1) + '</td>';
							members += '<td>' + row.attributesMultiValues[key][i] + '</td>';
							members += '<td class="text-center">' 
								+ '<button onclick="deleteMemberFromTabList(\'' + row.attributesMultiValues[key][i] + '\')"' 
								+ 'class="mr-2 btn-icon btn-icon-only btn btn-outline-danger">' 
								+ '<i class="pe-7s-trash btn-icon-wrapper"> </i></button>' 
								+ '</td>';
							members += '</tr>';
						}
					} else {
						members += '<tr>';
						members += '<td class="text-center">1</td>';
						members += '<td>' + row.attributesMultiValues[key] + '</td>';
						members += '<td class="text-center">' 
							+ '<button onclick="deleteMemberFromTabList(\'' + row.attributesMultiValues[key] + '\')"' 
							+ 'class="mr-2 btn-icon btn-icon-only btn btn-outline-danger">' 
							+ '<i class="pe-7s-trash btn-icon-wrapper"> </i></button>' 
							+ '</td>';
						members += '</tr>';
					}
				}
			}
			$('#bodyMembers').html(members);
		} else {
			//select entry info tab
			$('#member-info').removeClass('active');
			$('#tab-entry-info').tab('show');
			$('#entry-info').addClass('active');
			$('#member-info').addClass('disabled');
		}
		
		var selectedRows = $("#treeGridAgentGroups").jqxTreeGrid('getSelection');
		var selectedRowData=selectedRows[0];

		if(selectedRowData.type == "ORGANIZATIONAL_UNIT"){
			html = '<a class="dropdown-item" href="#" data-toggle="modal" data-target="#genericModal"' 
				+ 'onclick="dropdownButtonClicked(\'createNewAgentGroup\')">Yeni İstemci Grubu Oluştur</a>';
			html += '<a class="dropdown-item" href="#" data-toggle="modal" data-target="#genericModal"' 
				+ 'onclick="dropdownButtonClicked(\'createNewOrganizationalUnit\')">Yeni Klasör Oluştur</a>';
			//if root dn is selected dont allow user to delete it
			if(rootDNForAgentGroups != row.distinguishedName){
				html += '<a class="dropdown-item" href="#" data-toggle="modal" data-target="#genericModal"' 
					+ 'onclick="dropdownButtonClicked(\'editOrganizationalUnitName\')">Klasör Adı Düzenle</a>';
				html += '<a class="dropdown-item" href="#" data-toggle="modal" data-target="#genericModal"' 
					+ 'onclick="dropdownButtonClicked(\'moveEntry\')">Kaydı Taşı</a>';
				html += '<div class="dropdown-divider"></div>';
				html += '<a class="dropdown-item" href="#" data-toggle="modal" data-target="#genericModal"' 
					+ 'onclick="dropdownButtonClicked(\'deleteOrganizationalUnit\')">Klasörü Sil</a>';
			}
			$('#operationDropDown').html(html);
		} else if(selectedRowData.type == "GROUP"){
			html = '<a class="dropdown-item" href="#" data-toggle="modal" data-target="#genericModal"' 
				+ 'onclick="dropdownButtonClicked(\'addMembersToAgentGroupModal\')">İstemci Ekle</a>';
			html += '<a class="dropdown-item" href="#" data-toggle="modal" data-target="#genericModal"' 
				+ 'onclick="dropdownButtonClicked(\'editGroupName\')">Grup Adını Düzenle</a>';
			html += '<a class="dropdown-item" href="#" data-toggle="modal" data-target="#genericModal"' 
				+ 'onclick="dropdownButtonClicked(\'moveEntry\')">Kaydı Taşı</a>';
			html += '<div class="dropdown-divider"></div>';
			html += '<a class="dropdown-item" href="#" data-toggle="modal" data-target="#genericModalLarge"' 
				+ 'onclick="dropdownButtonClicked(\'deleteMembersFromGroup\')">İstemci Sil</a>';
			html += '<a class="dropdown-item" href="#" data-toggle="modal" data-target="#genericModal"' 
				+ 'onclick="dropdownButtonClicked(\'deleteAgentGroup\')">İstemci Grubunu Sil</a>';
			$('#operationDropDown').html(html);
		}
	});
}

/*
 * create, delete operations for Organizational Unit
 */
function btnCreateNewOUClicked() {
	var ouName = $("#ouName").val();
	if(ouName == "") {
		$.notify("Klasör adı giriniz.", "error");
	} else {
		var params = {
			    "parentName" : selectedDN,
			    "ou": ouName,
			    "type": 'ORGANIZATIONAL_UNIT',
			    "distinguishedName": 'ou=' + ouName + ',' + selectedDN,
			    "name": ouName
		};
		$.ajax({ 
		    type: 'POST', 
		    url: '/lider/ldap/addOu',
		    dataType: 'json',
		    data: params,
		    success: function (data) {
	            // add new empty row.
	            $("#treeGridAgentGroups").jqxTreeGrid('addRow', data.entryUUID, data, 'last', selectedEntryUUID);
	            $("#treeGridAgentGroups").jqxTreeGrid('expandRow', selectedEntryUUID);
	            $('#genericModal').trigger('click');
	            $.notify("Klasör oluşturuldu.", "success");
		    },
		    error: function (data, errorThrown) {
		    	$.notify("Klasör oluşturulurken hata oluştu.", "error");
		    }
		});
	}
}

function btnDeleteOUClicked() {
	var params = {
		    "dn": selectedDN,
	};
	$.ajax({ 
	    type: 'POST', 
	    url: '/lider/ldap/deleteEntry',
	    dataType: 'json',
	    data: params,
	    success: function (data) {
	    	$("#treeGridAgentGroups").jqxTreeGrid('deleteRow', selectedEntryUUID);
	    	$("#treeGridAgentGroups").jqxTreeGrid('selectRow', rootEntryUUID);
	    	$('#genericModal').trigger('click');
            $.notify("Klasör silindi.", "success");
	    },
	    error: function (data, errorThrown) {
	    	$.notify("Klasör silinirken hata oluştu.", "error");
	    }
	});
}

/*
 * delete agent group members
 */
function btnDeleteGroupClicked() {
	var params = {
		    "dn": selectedDN,
	};
	$.ajax({ 
	    type: 'POST', 
	    url: '/lider/ldap/deleteEntry',
	    dataType: 'json',
	    data: params,
	    success: function (data) {
	    	$("#treeGridAgentGroups").jqxTreeGrid('deleteRow', selectedEntryUUID);
	    	$("#treeGridAgentGroups").jqxTreeGrid('selectRow', rootEntryUUID);
	    	$('#genericModal').trigger('click');
            $.notify("İstemci Grubu Silindi.", "success");
	    },
	    error: function (data, errorThrown) {
	    	$.notify("Grup silinirken hata oluştu.", "error");
	    }
	});
}

/*
 * create agent group functions
 */
function createComputersModalForCreatingGroup(){
	$('#agentGroupsNewAgentGroupName').val('');
	//if nothing is selected get rootDN of agent groups.
	//so new created groups can be under root agent groups
	
	$.ajax({
		type : 'POST',
		url : 'lider/ldap/getComputers',
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
			           { name: "childEntries", type: "array" }
			      ],
			      hierarchy:
			          {
			              root: "childEntries"
			          },
			      localData: data,
			      id: "entryUUID"
			  };
			 //create computer tree grid
			 createComputerTreeGridForCreatingGroup(source);
		},
	    error: function (data, errorThrown) {
	    	$.notify("İstemci bilgileri getirilirken hata oluştu.", "error");
	    }
	});
}

function createComputerTreeGridForCreatingGroup(source) {
	$("#createNewAgentGroupTreeGridAgent").jqxTreeGrid('destroy');
	$("#createNewAgentGroupTreeDiv").append('<div id="createNewAgentGroupTreeGridAgent"></div> ');
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
	$("#createNewAgentGroupTreeGridAgent").jqxTreeGrid(
	{
		theme :"Orange",
		width: '100%',
		source: dataAdapter,
		altRows: true,
		sortable: true,
		columnsResize: true,
		filterable: true,
		hierarchicalCheckboxes: true,
		pageable: true,
		pagerMode: 'default',
		checkboxes: true,
		filterMode: "simple",
		localization: getLocalization(),
		pageSize: 50,
		pageSizeOptions: ['15', '25', '50'],
		icons: function (rowKey, dataRow) {
		var level = dataRow.level;
		if(dataRow.type == "AHENK"){
			return "img/linux.png";
		}
		else return "img/folder.png";
		},
		ready: function () {
			var allrows =$("#createNewAgentGroupTreeGridAgent").jqxTreeGrid('getRows');
			if(allrows.length==1){
				var row=allrows[0];
				if(row.childEntries==null ){
					$("#createNewAgentGroupTreeGridAgent").jqxTreeGrid('addRow', row.entryUUID+"1", {}, 'last', row.entryUUID);
				}
			}
	    	$("#createNewAgentGroupTreeGridAgent").jqxTreeGrid('collapseAll'); 
	    }, 
	    rendered: function () {
	   	},
	   	columns: [{ text: "Bilgisayarlar", align: "center", dataField: "name", width: '100%' }]  	
	});
	
	$('#createNewAgentGroupTreeGridAgent').on('rowCheck', function (event) {
		rowCheckAndUncheckOperationForCreatingGroup(event);
	});

	$('#createNewAgentGroupTreeGridAgent').on('rowUncheck', function (event) {
		rowCheckAndUncheckOperationForCreatingGroup(event);
	});

	$('#createNewAgentGroupTreeGridAgent').on('rowExpand', function (event) {
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
				$("#createNewAgentGroupTreeGridAgent").jqxTreeGrid('deleteRow', childRowname); 
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
						$("#createNewAgentGroupTreeGridAgent").jqxTreeGrid('addRow', childRow.entryUUID, childRow, 'last', row.entryUUID);
						if(childRow.hasSubordinates=="TRUE"){
							$("#createNewAgentGroupTreeGridAgent").jqxTreeGrid('addRow', childRow.entryUUID+"1" , {}, 'last', childRow.entryUUID); 
						}
						$("#createNewAgentGroupTreeGridAgent").jqxTreeGrid('collapseRow', childRow.entryUUID);
					} 
					row.expandedUser = "TRUE";
				},
			    error: function (data, errorThrown) {
			    	$.notify("Grup bilgisi getirilirken hata oluştu.", "error");
			    }
			});  
		}
	});
}

function rowCheckAndUncheckOperationForCreatingGroup(event) {
    var args = event.args;
    var row = args.row;
    //this control is for dummy content that is added for expanding row if it has child
    if(row.entryUUID != null) {
    	checkedOUList = [];
        checkedAgents = [];
    	var checkedRows = $("#createNewAgentGroupTreeGridAgent").jqxTreeGrid('getCheckedRows');
    	
    	if(checkedRows.length > 0){
    		for(var row in checkedRows) {
    			if(checkedRows[row].type == "AHENK") {
    				checkedAgents.push({
    					distinguishedName: checkedRows[row].distinguishedName, 
    					entryUUID: checkedRows[row].entryUUID, 
    					name: checkedRows[row].name,
    					type: checkedRows[row].type,
    					uid: checkedRows[row].uid
    				});

    			} else if(checkedRows[row].type == "ORGANIZATIONAL_UNIT" && checkedRows[row].expanded == false) {
    				checkedOUList.push({
    					distinguishedName: checkedRows[row].distinguishedName, 
    					entryUUID: checkedRows[row].entryUUID, 
    					name: checkedRows[row].name,
    					type: checkedRows[row].type,
    					uid: checkedRows[row].uid
    				});
    			}
    		}
    		
    		//get agents under checkboxes from service and add them to agent list also
    		if(checkedOUList.length > 0) {
    			$.ajax({
    				url : 'lider/ldap/getAhenks',
    				type : 'POST',
    				data: JSON.stringify(checkedOUList),
    				dataType: "json",
    				contentType: "application/json",
    				success : function(data) {
    					var ahenks = data;
    					$.each(data, function(index, element) {
    						var isExists = false;
    						for(var i = 0; i < checkedAgents.length; i++) {
    							
    							if(element.entryUUID == checkedAgents[i].entryUUID) {
    								isExists = true;
    							}
    						}
    						if(isExists == false) {
    							checkedAgents.push({
    								distinguishedName: element.distinguishedName, 
    								entryUUID: element.entryUUID, 
    								name: element.name,
    								type: element.type,
    								uid: element.uid
    							});
    						}
    					});
    				},
    				error: function (data, errorThrown) {
    			    	$.notify("İstemciler getirilirken hata oluştu.", "error");
    			    },
    				complete: function() {
    					$('#selectedAgentCountCreateNewAgentGroup').html(checkedAgents.length);
    				}
    			});
    		} else {
    			$('#selectedAgentCountCreateNewAgentGroup').html(checkedAgents.length);
    		}
    		
    	} else {
    		$('#selectedAgentCountCreateNewAgentGroup').html(checkedAgents.length);
    	}
    }
}

function btnCreateAgentGroupClicked() {
	if($('#agentGroupsNewAgentGroupName').val() == "") {
		$.notify("Lütfen grup adı giriniz.", "error");
		return;
	} else if(checkedAgents.length == 0) {
		$.notify("Grup oluşturabilmek için en az bir istemci seçmelisiniz.", "error");
		return;
	}
	var selectedRows = $("#createNewAgentGroupTreeGridAgent").jqxTreeGrid('getSelection');
	var selectedDNList = [];
	for (var i = 0; i < checkedAgents.length; i++) {
		selectedDNList.push(checkedAgents[i].distinguishedName);
	}
	var params = {
		    "groupName" : $('#agentGroupsNewAgentGroupName').val(),
		    "checkedList": selectedDNList,
		    "selectedOUDN" : selectedDN
		};
	
	$.ajax({ 
	    type: 'POST', 
	    url: "/lider/ldap/createNewAgentGroup",
	    dataType: 'json',
	    data: params,
	    success: function (data) { 
	    	$.notify("Grup oluşturuldu ve ahenkler bu gruba dahil edildi.", "success");
	    	//after agent group is added get newly addded group detail from service
	    	//add this group to main tree
            $("#treeGridAgentGroups").jqxTreeGrid('addRow', data.entryUUID, data, 'last', selectedEntryUUID);
            $("#treeGridAgentGroups").jqxTreeGrid('expandRow', selectedEntryUUID);
            $('#genericModal').trigger('click');
	    },
	    error: function (data, errorThrown) {
	    	$.notify("Yeni istemci grubu oluştururken hata oluştu.", "error");
	    }
	});
}

/*
 * adding new members to existing group functions
 */
function generateTreeToAddMembersToExistingGroup(){
	$.ajax({
		type : 'POST',
		url : 'lider/ldap/getComputers',
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
			 //create computer tree grid
			 createTreeToAddMembersToExistingGroup(source);
		},
	    error: function (data, errorThrown) {
	    	$.notify("İstemci bilgileri getirilirken hata oluştu.", "error");
	    }
	});
}

function createTreeToAddMembersToExistingGroup(source) {
	$("#addMembersToExistingAgentGroupTreeGrid").jqxTreeGrid('destroy');
	$("#addMembersToExistingAgentGroupTreeDiv").append('<div id="addMembersToExistingAgentGroupTreeGrid"></div> ');
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
	$("#addMembersToExistingAgentGroupTreeGrid").jqxTreeGrid(
	{
		theme :"Orange",
		width: '100%',
		source: dataAdapter,
		altRows: true,
		sortable: true,
		columnsResize: true,
		filterable: true,
		hierarchicalCheckboxes: true,
		pageable: true,
		pagerMode: 'default',
		checkboxes: true,
		filterMode: "simple",
		localization: getLocalization(),
		pageSize: 50,
		pageSizeOptions: ['15', '25', '50'],
		icons: function (rowKey, dataRow) {
		var level = dataRow.level;
		if(dataRow.type == "AHENK"){
			return "img/linux.png";
		}
		else return "img/folder.png";
		},
		ready: function () {
			var allrows =$("#addMembersToExistingAgentGroupTreeGrid").jqxTreeGrid('getRows');
			if(allrows.length==1){
				var row=allrows[0];
				if(row.childEntries==null ){
					$("#addMembersToExistingAgentGroupTreeGrid").jqxTreeGrid('addRow', row.entryUUID+"1", {}, 'last', row.entryUUID);
				}
			}
	    	$("#addMembersToExistingAgentGroupTreeGrid").jqxTreeGrid('collapseAll'); 
	    }, 
	    rendered: function () {
	   	},
	   	columns: [{ text: "Bilgisayarlar", align: "center", dataField: "name", width: '100%' }]  	
	});
	
	$('#addMembersToExistingAgentGroupTreeGrid').on('rowCheck', function (event) {
		rowCheckAndUncheckOperationToAddMembersToExistingGroup(event);
	});

	$('#addMembersToExistingAgentGroupTreeGrid').on('rowUncheck', function (event) {
		rowCheckAndUncheckOperationToAddMembersToExistingGroup(event);
	});

	$('#addMembersToExistingAgentGroupTreeGrid').on('rowExpand', function (event) {
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
				$("#addMembersToExistingAgentGroupTreeGrid").jqxTreeGrid('deleteRow', childRowname); 
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
						$("#addMembersToExistingAgentGroupTreeGrid").jqxTreeGrid('addRow', childRow.entryUUID, childRow, 'last', row.entryUUID);
						//$("#createNewAgentGroupTreeGridAgent").jqxTreeGrid('checkRow', row.name);
						if(childRow.hasSubordinates=="TRUE"){
							$("#addMembersToExistingAgentGroupTreeGrid").jqxTreeGrid('addRow', childRow.entryUUID+"1" , {}, 'last', childRow.entryUUID); 
						}
						$("#addMembersToExistingAgentGroupTreeGrid").jqxTreeGrid('collapseRow', childRow.entryUUID);
					}
					row.expandedUser = "TRUE";
				},
			    error: function (data, errorThrown) {
			    	$.notify("Bilgi getirilirken hata oluştu.", "error");
			    }
			});  
    	}
	});
}

function rowCheckAndUncheckOperationToAddMembersToExistingGroup(event) {
    var args = event.args;
    var row = args.row;
    checkedOUList = [];
    checkedAgents = [];
	var checkedRows = $("#addMembersToExistingAgentGroupTreeGrid").jqxTreeGrid('getCheckedRows');
	if(checkedRows.length > 0){
		
		for(var row in checkedRows) {
			if(checkedRows[row].type == "AHENK") {
				checkedAgents.push({
					distinguishedName: checkedRows[row].distinguishedName, 
					entryUUID: checkedRows[row].entryUUID, 
					name: checkedRows[row].name,
					type: checkedRows[row].type,
					uid: checkedRows[row].uid
				});

			} else if(checkedRows[row].type == "ORGANIZATIONAL_UNIT" && checkedRows[row].expanded == false) {
				checkedOUList.push({
					distinguishedName: checkedRows[row].distinguishedName, 
					entryUUID: checkedRows[row].entryUUID, 
					name: checkedRows[row].name,
					type: checkedRows[row].type,
					uid: checkedRows[row].uid
				});
			}
		}
		
		//get agents under checkboxes from service and add them to agent list also
		if(checkedOUList.length > 0) {
			$.ajax({
				url : 'lider/ldap/getAhenks',
				type : 'POST',
				data: JSON.stringify(checkedOUList),
				dataType: "json",
				contentType: "application/json",
				success : function(data) {
					var ahenks = data;
					$.each(data, function(index, element) {
						var isExists = false;
						for(var i = 0; i < checkedAgents.length; i++) {
							
							if(element.entryUUID == checkedAgents[i].entryUUID) {
								isExists = true;
							}
						}
						if(isExists == false) {
							checkedAgents.push({
								distinguishedName: element.distinguishedName, 
								entryUUID: element.entryUUID, 
								name: element.name,
								type: element.type,
								uid: element.uid
							});
						}
					});
				},
			    error: function (data, errorThrown) {
			    	$.notify("İstemci bilgileri getirilirken hata oluştu.", "error");
			    },
				complete: function() {
					$('#selectedAgentCount').html(checkedAgents.length);
				}
			});
		} else {
			$('#selectedAgentCount').html(checkedAgents.length);
		}
	} else {
		$('#selectedAgentCount').html(checkedAgents.length);
	}
}

function btnAddMemberClicked() {
	if(checkedAgents.length == 0) {
		$.notify("Lütfen en az bir istemci seçiniz.", "error");
		return;
	} else {
		var selectedRows = $("#addMembersToExistingAgentGroupTreeGrid").jqxTreeGrid('getSelection');
		var selectedDNList = [];
		for (var i = 0; i < checkedAgents.length; i++) {
			selectedDNList.push(checkedAgents[i].distinguishedName);
		}
		var params = {
			    "checkedList": selectedDNList,
			    "groupDN" : selectedDN
			};
		
		$.ajax({ 
		    type: 'POST', 
		    url: "/lider/ldap/group/existing",
		    dataType: 'json',
		    data: params,
		    success: function (data) { 
				$.notify("Seçilen istemciler gruba başarıyla eklendi.", "success");
				//get selected data and update it with new data result from service call
				var selectedData = $("#treeGridAgentGroups").jqxTreeGrid('getRow', data.entryUUID);
				selectedData.attributesMultiValues = data.attributesMultiValues;
				$("#treeGridAgentGroups").jqxTreeGrid('updateRow', selectedData.entryUUID, data);
				$("#treeGridAgentGroups").jqxTreeGrid('getRow', data.entryUUID);
				$("#treeGridAgentGroups").jqxTreeGrid('selectRow', data.entryUUID);
				$('#genericModal').trigger('click');
		    },
		    error: function (data, errorThrown) {
		    	$.notify("Üyeler gruba eklenirken hata oluştu.", "error");
		    }
		});
	}

}

/*
 * deleting members from group functions
 */
function deleteMembersOfGroup(){
	$('#deleteMembersFromGroupTable').html('<tr><td colspan="100%" class="text-center">İşlemi tamamlamanız için en az bir istemci bulunmalıdır.</td></tr>');
	$('#selectedGroupDN').text(selectedDN);
	var params = {
		    "dn" : selectedDN
	};
	$.ajax({
		type : 'POST',
		url  : 'lider/ldap/group/members',
		data : params,
		dataType : 'json',
		success : function(data) {
			if(data.length > 0) {
				var html = "";
				$.each(data, function(index, element) {
					groupMemberDNList.push(element.distinguishedName);
					html += '<tr><th scope="row"  class="text-center">' + (index+1) + '</th>';
					html += '<td>' + element.distinguishedName + '</td>';
					html += '<td class="text-center">' 
						+ '<button onclick="removeAgentFromMemberList(\'' + element.distinguishedName + '\')"' 
						+ 'class="mr-2 btn-icon btn-icon-only btn btn-outline-danger">' 
						+ '<i class="pe-7s-trash btn-icon-wrapper"> </i></button>' 
						+ '</td></tr>';
				});
				$('#deleteMembersFromGroupTable').html(html);
			}
		},
	    error: function (data, errorThrown) {
	    	$.notify("Seçili grubun üyeleri getirilirken hata oluştu.", "error");
	    }
	}); 
}

function removeAgentFromMemberList(dn) {
	if(groupMemberDNList.length > 1) {
		var html = "";
		for(var i = 0; i < groupMemberDNList.length; i++) {
			if(groupMemberDNList[i] == dn) {
				groupMemberDNListForDelete.push(dn);
				groupMemberDNList.splice(i,1);
			}
		}
		for(var i = 0; i < groupMemberDNList.length; i++) {
			html += '<tr><th scope="row"  class="text-center">' + (i+1) + '</th>';
			html += '<td>' + groupMemberDNList[i] + '</td>';
			html += '<td class="text-center">' 
				+ '<button onclick="removeAgentFromMemberList(\'' + groupMemberDNList[i] + '\')"' 
				+ 'class="mr-2 btn-icon btn-icon-only btn btn-outline-danger">' 
				+ '<i class="pe-7s-trash btn-icon-wrapper"> </i></button>' 
				+ '</td></tr>';
		}
		$('#deleteMembersFromGroupTable').html(html);
	} else {
		$.notify("Grup en az bir üye bulundurmalıdır. Son üye silinemez", "error");
	}
}

function btnDeleteMembersClicked() {
	if(groupMemberDNList.length >= 1) {
		var params = {
			    "dnList" : groupMemberDNListForDelete,
			    "dn": selectedDN
		};
		$.ajax({
			type : 'POST',
			url  : 'lider/ldap/delete/group/members',
			data : params,
			dataType : 'json',
			success : function(data) {
				
				if(data != null) {
					$.notify("Grup üyeleri başarıyla düzenlendi", "success");
					//get selected data and update it with new data result from service call
					var selectedData= $("#treeGridAgentGroups").jqxTreeGrid('getRow', data.entryUUID);
					selectedData.attributesMultiValues = data.attributesMultiValues;
					$("#treeGridAgentGroups").jqxTreeGrid('updateRow', selectedData.entryUUID, data);
					$("#treeGridAgentGroups").jqxTreeGrid('getRow', data.entryUUID);
					$("#treeGridAgentGroups").jqxTreeGrid('selectRow', data.entryUUID);
					$('#genericModalLarge').trigger('click');
				}
			},
		    error: function (data, errorThrown) {
		    	$.notify("Grup üyeleri silinirken hata oluştu.", "error");
		    }
		}); 
	} else {
		$.notify("Grup en az bir üye bulundurmalıdır. Son üye silinemez", "error");
	}
}

/*
 * move agent group or organizational unit functions
 */
function generateTreeToMoveEntry(){
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
			 selectedEntryUUIDForTreeMove = source.localData[0].entryUUID;
			 destinationDNToMoveRecord = source.localData[0].distinguishedName;
			 //create computer tree grid
			 createTreeToMoveEntry(source);
		},
	    error: function (data, errorThrown) {
	    	$.notify("İstemci grup verileri alınırken hata oluştu.", "error");
	    }
	});
}

function createTreeToMoveEntry(source) {
	$("#moveEntryTreeGrid").jqxTreeGrid('destroy');
	$("#moveEntryTreeDiv").append('<div id="moveEntryTreeGrid"></div> ');
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
	$("#moveEntryTreeGrid").jqxTreeGrid(
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
		selectionMode: "singleRow",
		filterMode: "simple",
		localization: getLocalization(),
		pageSize: 50,
		pageSizeOptions: ['15', '25', '50'],
		icons: function (rowKey, dataRow) {
		var level = dataRow.level;
		if(dataRow.type == "AHENK"){
			return "img/linux.png";
		}
		else return "img/folder.png";
		},
		ready: function () {
			var allrows =$("#moveEntryTreeGrid").jqxTreeGrid('getRows');
			if(allrows.length==1){
				var row=allrows[0];
				if(row.childEntries==null ){
					$("#moveEntryTreeGrid").jqxTreeGrid('addRow', row.entryUUID+"1", {}, 'last', row.entryUUID);
				}
			}
	    	$("#moveEntryTreeGrid").jqxTreeGrid('collapseAll');
	    	$("#moveEntryTreeGrid").jqxTreeGrid('selectRow', selectedEntryUUIDForTreeMove);
	    }, 
	    rendered: function () {
	   	},
	   	columns: [{ text: "Bilgisayarlar", align: "center", dataField: "name", width: '100%' }]  	
	});
	$('#moveEntryTreeGrid').on('rowExpand', function (event) {
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
				$("#moveEntryTreeGrid").jqxTreeGrid('deleteRow', childRowname); 
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
							$("#moveEntryTreeGrid").jqxTreeGrid('addRow', childRow.entryUUID, childRow, 'last', row.entryUUID);
							//$("#createNewAgentGroupTreeGridAgent").jqxTreeGrid('checkRow', row.name);
							if(childRow.hasSubordinates=="TRUE"){
								$("#moveEntryTreeGrid").jqxTreeGrid('addRow', childRow.entryUUID+"1" , {}, 'last', childRow.entryUUID); 
							}
							$("#moveEntryTreeGrid").jqxTreeGrid('collapseRow', childRow.entryUUID);
						}

					}
					row.expandedUser = "TRUE";
				},
			    error: function (data, errorThrown) {
			    	$.notify("Grup bilgisi getirilirken hata oluştu.", "error");
			    }
			});  
    	}
	});
	$('#moveEntryTreeGrid').on('rowSelect', function (event) {
		var args = event.args;
		var row = args.row;
		var name= row.name;
		destinationDNToMoveRecord = row.distinguishedName;
	});
}

function btnMoveEntryClicked() {
	if(selectedDN == destinationDNToMoveRecord) {
		$.notify("Kayıt kendi altına taşınamaz.", "error");
	}
	else if(selectedEntryParentDN != destinationDNToMoveRecord) {
		var params = {
			    "sourceDN" : selectedDN,
			    "destinationDN": destinationDNToMoveRecord
		};
		$.ajax({ 
		    type: 'POST', 
		    url: '/lider/ldap/move/entry',
		    dataType: 'json',
		    data: params,
		    success: function (data) {
	            $.notify("Kayıt taşındı.", "success");
	            $('#genericModal').trigger('click');
	            createMainTree();
	            
		    },
		    error: function (data, errorThrown) {
		    	$.notify("Kayıt taşınırken hata oluştu.", "error");
		    }
		});
	} else {
		$.notify("Kayıt aynı yere taşınamaz.", "error");
	}
}

/*
 * edit organizational unit name
 */
function btnEditOUNameClicked() {
	var newOuName = $("#ouName").val();
	if(newOuName == "") {
		$.notify("Klasör adı giriniz.", "error");
	} else {
		if(newOuName == selectedName) {
			$('#genericModal').trigger('click');
			return;
		} 
		var params = {
				"oldDN" : selectedDN,
				"newName": "ou=" + newOuName
		};
		$.ajax({
		    type: 'POST', 
		    url: '/lider/ldap/rename/entry',
		    dataType: 'json',
		    data: params,
		    success: function (data) {
		    	$.notify("Grup adı düzenlendi.", "success");
	            $('#genericModal').trigger('click');
	            createMainTree();
		    },
		    error: function (data, errorThrown) {
		    	$.notify("Grup adı düzenlenirken hata oluştu.", "error");
		    }
		});
	}
}

/*
 * edit group name
 */
function btnEditGroupNameClicked() {
	var newOuName = $("#groupName").val();
	if(newOuName == "") {
		$.notify("Grup adı giriniz.", "error");
	} else {
		if(newOuName == selectedName) {
			$('#genericModal').trigger('click');
			return;
		} 
		var params = {
				"oldDN" : selectedDN,
				"newName": "cn=" + newOuName
		};
		$.ajax({
		    type: 'POST', 
		    url: '/lider/ldap/rename/entry',
		    dataType: 'json',
		    data: params,
		    success: function (data) {
		    	$.notify("Grup adı düzenlendi.", "success");
	            $('#genericModal').trigger('click');
	            createMainTree();
		    },
		    error: function (data, errorThrown) {
		    	$.notify("Grup adı düzenlenirken hata oluştu.", "error");
		    }
		});
	}
}

/*
 * delete group member from tab list
 */
function deleteMemberFromTabList(dn) {
	var selectedRows = $("#treeGridAgentGroups").jqxTreeGrid('getSelection');
	var selectedRowData=selectedRows[0];
	var dnListToDelete = [];
	dnListToDelete.push(dn);
	if(selectedRowData.attributesMultiValues['member'].length > 1) {
		var params = {
			    "dnList": dnListToDelete,
			    "dn": selectedDN
		};
		$.ajax({
			type : 'POST',
			url  : 'lider/ldap/delete/group/members',
			data : params,
			dataType : 'json',
			success : function(data) {
				
				if(data != null) {
					$.notify("Grup üyeleri başarıyla düzenlendi", "success");
					//get selected data and update it with new data result from service call
					var selectedData= $("#treeGridAgentGroups").jqxTreeGrid('getRow', data.entryUUID);
					selectedData.attributesMultiValues = data.attributesMultiValues;
					$("#treeGridAgentGroups").jqxTreeGrid('updateRow', selectedData.entryUUID, data);
					$("#treeGridAgentGroups").jqxTreeGrid('getRow', data.entryUUID);
					$("#treeGridAgentGroups").jqxTreeGrid('selectRow', data.entryUUID);
				}
			},
		    error: function (data, errorThrown) {
		    	$.notify("Grup üyesi silinirken hata oluştu.", "error");
		    }
		}); 
	} else {
		$.notify("Grup en az bir üye bulundurmalıdır. Son üye silinemez", "error");
	}
}
