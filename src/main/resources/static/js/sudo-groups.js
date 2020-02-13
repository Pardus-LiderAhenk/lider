/**
 * Sudo group operations(group of names)
 * create, delete, editing members and move operations for groups.
 * create, delete and move operations for organizational units.
 * Hasan Kara
 * 
 */

var selectedDN = "";
var selectedName = "";
var selectedEntryParentDN = "";
var checkedMembers = [];
var checkedOUList = [];
var rootDNForSudoGroups = "";
var selectedUUID = "";
var groupMemberDNList = [];
var groupMemberDNListForDelete = [];

var destinationDNToMoveRecord = "";

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
		getModalContent("modals/groups/sudo/deletegroup", function content(data){
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
		getModalContent("modals/groups/sudo/deleteou", function content(data){
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
	} else if(operation == "editOrganizationalUnit") {
		getModalContent("modals/groups/agent/editouname", function content(data){
			$('#genericModalHeader').html("Klasörü Düzenle");
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

/*
 * create computer groups for base sudo group page
 */
function createMainTree() {
	$("#treeGridSudoGroups").jqxTreeGrid('destroy');
	$("#treeGridSudoGroupsDiv").append('<div id="treeGridSudoGroups"></div> ');
	var html = '<a class="dropdown-item" href="#" data-toggle="modal" data-target="#genericModal"' 
		+ 'onclick="dropdownButtonClicked(\'createNewSudoGroup\')">Yeni Sudo Grubu Oluştur</a>';
	html += '<a class="dropdown-item" href="#" data-toggle="modal" data-target="#genericModal"' 
		+ 'onclick="dropdownButtonClicked(\'createNewOrganizationalUnit\')">Yeni Klasör Oluştur</a>';
	$('#operationDropDown').html(html);
	$.ajax({
		type : 'POST',
		url : 'lider/ldap/getSudoGroups',
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
			rootDNForSudoGroups = source.localData[0].distinguishedName;
			selectedEntryUUID = source.localData[0].entryUUID;
			var dataAdapter = new $.jqx.dataAdapter(source, {
			});

			var getLocalization = function () {
				var localizationobj = {};
				localizationobj.filterSearchString = "Ara :";
				return localizationobj;
			};

			// create jqxTreeGrid.
			$("#treeGridSudoGroups").jqxTreeGrid({
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

					var allrows =$("#treeGridSudoGroups").jqxTreeGrid('getRows');
					if(allrows.length==1){
						var row=allrows[0];
						if(row.childEntries==null){
							$("#treeGridSudoGroups").jqxTreeGrid('addRow', row.entryUUID+"1", {}, 'last', row.entryUUID);
						}
					}
					$("#treeGridSudoGroups").jqxTreeGrid('collapseAll');
					$("#treeGridSudoGroups").jqxTreeGrid('selectRow', selectedEntryUUID);
				},
				columns: [
					{ text: "Yetki Grup Ağacı", align: "center", dataField: "name", width: '100%'}
					]
			});
		}
	});

	$('#treeGridSudoGroups').on('rowExpand', function (event) {
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
				$("#treeGridSudoGroups").jqxTreeGrid('deleteRow', childRowname); 
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
						$("#treeGridSudoGroups").jqxTreeGrid('addRow', childRow.entryUUID, childRow, 'last', row.entryUUID);
						if(childRow.hasSubordinates=="TRUE"){
							$("#treeGridSudoGroups").jqxTreeGrid('addRow', childRow.entryUUID+"1" , {}, 'last', childRow.entryUUID); 
						}
						$("#treeGridSudoGroups").jqxTreeGrid('collapseRow', childRow.entryUUID);
					} 
					row.expandedUser = "TRUE";
				},
				error: function (data, errorThrown) {
					$.notify("Grup bilgisi getirilirken hata oluştu.", "error");
				}
			});  
		}
	}); 

	$('#treeGridSudoGroups').on('rowSelect', function (event) {
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

		//to print members at the end of table
		for (var key in row.attributesMultiValues) {
			if (row.attributesMultiValues.hasOwnProperty(key) && key == "member") {
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
		$('#selectedDnInfo').html("Seçili Kayıt: "+name);
		$('#ldapAttrInfoHolder').html(html);

		var selectedRows = $("#treeGridSudoGroups").jqxTreeGrid('getSelection');
		var selectedRowData=selectedRows[0];

		if(selectedRowData.type == "ORGANIZATIONAL_UNIT"){
			html = '<a class="dropdown-item" href="#" data-toggle="modal" data-target="#genericModal"' 
				+ 'onclick="dropdownButtonClicked(\'createNewSudoGroup\')">Yeni Yetki Grubu Oluştur</a>';
			html += '<a class="dropdown-item" href="#" data-toggle="modal" data-target="#genericModal"' 
				+ 'onclick="dropdownButtonClicked(\'createNewOrganizationalUnit\')">Yeni Klasör Oluştur</a>';
			//if root dn is selected dont allow user to delete it
			if(rootDNForSudoGroups != row.distinguishedName){
				html += '<a class="dropdown-item" href="#" data-toggle="modal" data-target="#genericModal"' 
					+ 'onclick="dropdownButtonClicked(\'editOrganizationalUnit\')">Klasörü Düzenle</a>';
				html += '<a class="dropdown-item" href="#" data-toggle="modal" data-target="#genericModal"' 
					+ 'onclick="dropdownButtonClicked(\'moveEntry\')">Kaydı Taşı</a>';
				html += '<div class="dropdown-divider"></div>';
				html += '<a class="dropdown-item" href="#" data-toggle="modal" data-target="#genericModal"' 
					+ 'onclick="dropdownButtonClicked(\'deleteOrganizationalUnit\')">Klasörü Sil</a>';
			}
			$('#operationDropDown').html(html);
		} else if(selectedRowData.type == "GROUP"){
			html = '<a class="dropdown-item" href="#" data-toggle="modal" data-target="#genericModal"' 
				+ 'onclick="dropdownButtonClicked(\'addMembersToSudoGroupModal\')">Üye Ekle</a>';
			html += '<a class="dropdown-item" href="#" data-toggle="modal" data-target="#genericModal"' 
				+ 'onclick="dropdownButtonClicked(\'editGroupName\')">Grup Adını Düzenle</a>';
			html += '<a class="dropdown-item" href="#" data-toggle="modal" data-target="#genericModal"' 
				+ 'onclick="dropdownButtonClicked(\'moveEntry\')">Kaydı Taşı</a>';
			html += '<div class="dropdown-divider"></div>';
			html += '<a class="dropdown-item" href="#" data-toggle="modal" data-target="#genericModalLarge"'
				+ 'onclick="dropdownButtonClicked(\'deleteMembersFromGroup\')">İstemci Sil</a>';
			html += '<a class="dropdown-item" href="#" data-toggle="modal" data-target="#genericModal"' 
				+ 'onclick="dropdownButtonClicked(\'deleteSudoGroup\')">İstemci Grubunu Sil</a>';
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
				$("#treeGridSudoGroups").jqxTreeGrid('addRow', data.entryUUID, data, 'last', selectedEntryUUID);
				$("#treeGridSudoGroups").jqxTreeGrid('expandRow', selectedEntryUUID);
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
			$("#treeGridSudoGroups").jqxTreeGrid('deleteRow', selectedEntryUUID);
			$('#genericModal').trigger('click');
			$.notify("Klasör silindi.", "success");
		},
		error: function (data, errorThrown) {
			$.notify("Klasör silinirken hata oluştu.", "error");
		}
	});
}