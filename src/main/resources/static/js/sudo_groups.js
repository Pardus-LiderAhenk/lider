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
var checkedUsers = [];
var checkedOUList = [];
var rootDNForSudoGroups = "";
var rootEntryUUID = "";
var selectedUUID = "";
var groupMemberDNList = [];
var groupMemberDNListForDelete = [];
var selectedEntryUUIDForTreeMove = "";

var destinationDNToMoveRecord = "";
var selectedUserCountForCreatingGroup;
var selectedOptionValue = "sudoCommand";
var selectedAttribute = [];
var sudoHostList = [];
var sudoCommandList = [];
var sudoUserList = [];

$(document).ready(function(){
	createMainTree();
});

/*
 * events of dropdown button above main tree
 */
function dropdownButtonClicked(operation) {
	if(operation == "createNewSudoGroup") {
		selectedAttribute = [];
		$('#attributeValue').val("");
		getModalContent("modals/groups/sudo_groups/creategroup", function content(data){
			$('#genericModalLargeHeader').html("Yeni Yetki Grubu Oluştur");
			$('#genericModalLargeBodyRender').html(data);
		});
	} else if(operation == "deleteSudoGroup") {
		getModalContent("modals/groups/sudo_groups/deletegroup", function content(data){
			$('#genericModalHeader').html("Yetki Grubunu Sil");
			$('#genericModalBodyRender').html(data);
		});
	} else if(operation == "editSudoGroup") {
		getModalContent("modals/groups/sudo_groups/editgroup", function content(data){
			$('#genericModalLargeHeader').html("Yetki Grubunu Düzenle");
			$('#genericModalLargeBodyRender').html(data);
			fillAttributeTableForEditingGroup();
		});
	} else if(operation == "createNewOrganizationalUnit") {
		getModalContent("modals/groups/sudo_groups/createou", function content(data){
			$('#genericModalHeader').html("Yeni Klasör Oluştur");
			$('#genericModalBodyRender').html(data);
		});
	} else if(operation == "deleteOrganizationalUnit") {
		getModalContent("modals/groups/sudo_groups/deleteou", function content(data){
			$('#genericModalHeader').html("Klasörü Sil");
			$('#genericModalBodyRender').html(data);
		});
	} else if(operation == "moveEntry") {
		getModalContent("modals/groups/sudo_groups/moveentry", function content(data){
			$('#genericModalHeader').html("Kayıt Taşı");
			$('#genericModalBodyRender').html(data);
			generateTreeToMoveEntry();
		});
	} else if(operation == "editOrganizationalUnit") {
		getModalContent("modals/groups/sudo_groups/editouname", function content(data){
			$('#genericModalHeader').html("Klasör Adı Düzenle");
			$('#genericModalBodyRender').html(data);
			$('#ouName').val(selectedName);
		});
	}
}

/*
 * create computer groups for base sudo group page
 */
function createMainTree() {
	$("#treeGridSudoGroups").jqxTreeGrid('destroy');
	$("#treeGridSudoGroupsDiv").append('<div id="treeGridSudoGroups"></div> ');
	var html = '<a class="dropdown-item" href="#" data-toggle="modal" data-target="#genericModalLarge"' 
		+ 'onclick="dropdownButtonClicked(\'createNewSudoGroup\')">Yeni Sudo Grubu Oluştur</a>';
	html += '<a class="dropdown-item" href="#" data-toggle="modal" data-target="#genericModal"' 
		+ 'onclick="dropdownButtonClicked(\'createNewOrganizationalUnit\')">Yeni Klasör Oluştur</a>';
	$('#operationDropDown').html(html);
	$.ajax({
		type : 'POST',
		url : 'lider/sudo_groups/getGroups',
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
			rootEntryUUID = source.localData[0].entryUUID;
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
				 height: 590,
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
				url : 'lider/sudo_groups/getOuDetails',
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
		renamedList = renameAndOrderAttributeList(row.attributesMultiValues);
		for (var key in renamedList) {
			if (renamedList.hasOwnProperty(key)  && key != "sudoUser") {
				if(renamedList[key].length > 1) {
					for(var i = 0; i< renamedList[key].length; i++) {
						html += '<tr>';
						html += '<td>' + key + '</td>';
						html += '<td>' + renamedList[key][i] + '</td>'; 
						html += '</tr>';
					}
				} else {
					html += '<tr>';
					html += '<td>' + key + '</td>';
					html += '<td>' + renamedList[key] + '</td>';
					html += '</tr>';
				}
			}
		}

		html += '</table>';
		$('#selectedDnInfo').html("Seçili Kayıt: "+name);
		$('#memberTabSelectedDNInfo').html("Seçili Kayıt: "+name);
		$('#ldapAttrInfoHolder').html(html);
		
		if(row.type != "ORGANIZATIONAL_UNIT") {
			//enable members tab button
			$('#member-info').removeClass('disabled');
			var members = "";
			//to print members at different tab
			for (var key in row.attributesMultiValues) {
				if (row.attributesMultiValues.hasOwnProperty(key) && key == "sudoUser") {
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
				}
			}
			if(members == "") {
				members = '<tr><td colspan="100%" class="text-center">Üye bulunamadı</td></tr>';
			}
			$('#bodyMembers').html(members);
		} else {
			//select entry info tab
			$('#member-info').removeClass('active');
			$('#tab-entry-info').tab('show');
			$('#entry-info').addClass('active');
			$('#member-info').addClass('disabled');
		}
		
		var selectedRows = $("#treeGridSudoGroups").jqxTreeGrid('getSelection');
		var selectedRowData=selectedRows[0];
		if(selectedRowData.type == "ORGANIZATIONAL_UNIT"){
			html = '<a class="dropdown-item" href="#" data-toggle="modal" data-target="#genericModalLarge"' 
				+ 'onclick="dropdownButtonClicked(\'createNewSudoGroup\')">Yeni Yetki Grubu Oluştur</a>';
			html += '<a class="dropdown-item" href="#" data-toggle="modal" data-target="#genericModal"' 
				+ 'onclick="dropdownButtonClicked(\'createNewOrganizationalUnit\')">Yeni Klasör Oluştur</a>';
			//if root dn is selected dont allow user to delete it
			if(rootDNForSudoGroups != row.distinguishedName){
				html += '<a class="dropdown-item" href="#" data-toggle="modal" data-target="#genericModal"' 
					+ 'onclick="dropdownButtonClicked(\'editOrganizationalUnit\')">Klasör Adı Düzenle</a>';
				html += '<a class="dropdown-item" href="#" data-toggle="modal" data-target="#genericModal"' 
					+ 'onclick="dropdownButtonClicked(\'moveEntry\')">Kaydı Taşı</a>';
				html += '<div class="dropdown-divider"></div>';
				html += '<a class="dropdown-item" href="#" data-toggle="modal" data-target="#genericModal"' 
					+ 'onclick="dropdownButtonClicked(\'deleteOrganizationalUnit\')">Klasörü Sil</a>';
			}
			$('#operationDropDown').html(html);
		} else if(selectedRowData.type == "ROLE"){
			html = '<a class="dropdown-item" href="#" data-toggle="modal" data-target="#genericModalLarge"' 
				+ 'onclick="dropdownButtonClicked(\'editSudoGroup\')">Grubu Düzenle</a>';
			html += '<a class="dropdown-item" href="#" data-toggle="modal" data-target="#genericModal"' 
				+ 'onclick="dropdownButtonClicked(\'moveEntry\')">Kaydı Taşı</a>';
			html += '<div class="dropdown-divider"></div>';
			html += '<a class="dropdown-item" href="#" data-toggle="modal" data-target="#genericModal"' 
				+ 'onclick="dropdownButtonClicked(\'deleteSudoGroup\')">Yetki Grubunu Sil</a>';
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
			url: '/lider/sudo_groups/addOu',
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
		url: '/lider/sudo_groups/deleteEntry',
		dataType: 'json',
		data: params,
		success: function (data) {
			$("#treeGridSudoGroups").jqxTreeGrid('deleteRow', selectedEntryUUID);
			$("#treeGridSudoGroups").jqxTreeGrid('selectRow', rootEntryUUID);
			$('#genericModal').trigger('click');
			$.notify("Klasör silindi.", "success");
		},
		error: function (data, errorThrown) {
			$.notify("Klasör silinirken hata oluştu.", "error");
		}
	});
}

/*
 * move sudo group or organizational unit functions
 */
function generateTreeToMoveEntry(){
	$.ajax({
		type : 'POST',
		url : 'lider/sudo_groups/getGroups',
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
	    	$.notify("Rol grup verileri alınırken hata oluştu.", "error");
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
				url : 'lider/sudo_groups/getOuDetails',
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
		    url: '/lider/sudo_groups/move/entry',
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
 * create sudo group functions
 */
function attributeOnChange(selectOption) {
	
	selectedOptionValue = selectOption.value;
	if(selectedOptionValue == "sudoUser") {
		selectedOptionValue = "sudoUser";
		$('#attributeValue').attr("placeholder", "Kullanıcı uid'sini giriniz...");
		var html = '<button onclick="createTreeModalForUserSelection()" href="#" data-toggle="modal" data-target="#userTreeModal"'
		+ 'class="btn-icon btn-icon-only btn btn-info" title="Kullanıcı ağacından ekle">'
		+ '<i class="pe-7s-network btn-icon-wrapper fa-lg"> </i></button>';
		//var html = '<button class="btn btn-warning" onclick="btnAddAttributeClicked()" type="button">Tree</button>';
		html += '<button class="btn btn-primary" onclick="btnAddAttributeClicked()" type="button">Add</button>';
		$('#attributeActionButtons').html(html);
		
	} else if(selectedOptionValue == "sudoCommand") {
		selectedOptionValue = "sudoCommand";
		$('#attributeValue').attr("placeholder", "sudoCommand giriniz...");
		var html = '<button class="btn btn-primary" onclick="btnAddAttributeClicked()" type="button">Ekle</button>';
		$('#attributeActionButtons').html(html);
	} else if(selectedOptionValue == "sudoHost") {
		selectedOptionValue = "sudoHost";
		$('#attributeValue').attr("placeholder", "sudoHost giriniz...");
		var html = '<button class="btn btn-primary" onclick="btnAddAttributeClicked()" type="button">Ekle</button>';
		$('#attributeActionButtons').html(html);
	}
}

function btnAddAttributeClicked() {
	if($('#attributeValue').val() != "") {
		selectedAttribute.push([selectedOptionValue, $('#attributeValue').val() ]);
		$('#attributeValue').val("");
		createAttributeTable();
	} else {
		$.notify("Lütfen özellik değeri giriniz", "error");
	}
}

function removeAttributeFromListClicked(index) {
	selectedAttribute.splice(index,1);
	createAttributeTable();
}

function createAttributeTable() {
	var html = '';
	sudoHostList = [];
	sudoCommandList = [];
	sudoUserList = [];
	for(var i = 0; i< selectedAttribute.length; i++) {
		if(selectedAttribute[i][0] == "sudoUser") {
			sudoUserList.push(selectedAttribute[i][1]);
		} else if(selectedAttribute[i][0] == "sudoCommand") {
			sudoCommandList.push(selectedAttribute[i][1]);
		} else if(selectedAttribute[i][0] == "sudoHost") {
			sudoHostList.push(selectedAttribute[i][1]);
		}
		html += '<tr><td>' + (i+1) + '</td><td>' + selectedAttribute[i][0] + '</td><td>' + selectedAttribute[i][1] + '</td>';
		html += '<td class="text-center">' 
			+ '<button onclick="removeAttributeFromListClicked(\'' + i + '\')"' 
			+ 'class="mr-2 btn-icon btn-icon-only btn btn-outline-danger">' 
			+ '<i class="pe-7s-trash btn-icon-wrapper"> </i></button>' 
			+ '</td></tr>';
	}
	$('#attributeList').html(html);
}

function createTreeModalForUserSelection(){
	checkedUsers = [];
	checkedOUList = [];
	$('#selectedUserCount').html(checkedUsers.length);
	
	//if nothing is selected get rootDN of user groups.
	//so new created groups can be under root user groups
	$.ajax({
		type : 'POST',
		url : 'lider/sudo_groups/getUsers',
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
			      id: "uid"
			  };
			 //create user tree grid
			 createUserTreeGridForCreatingGroup(source);
		},
	    error: function (data, errorThrown) {
	    	$.notify("Kullanıcılar getirilirken hata oluştu.", "error");
	    }
	});
}

function createUserTreeGridForCreatingGroup(source) {
	$("#selectMemberTreeGrid").jqxTreeGrid('destroy');
	$("#selectMemberTreeDiv").append('<div id="selectMemberTreeGrid"></div> ');
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
	$("#selectMemberTreeGrid").jqxTreeGrid(
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
		if(dataRow.type == "USER"){
			return "img/checked-user-32.png";
		}
		else return "img/folder.png";
		},
		ready: function () {
			var allrows =$("#selectMemberTreeGrid").jqxTreeGrid('getRows');
			if(allrows.length==1){
				var row=allrows[0];
				if(row.childEntries==null ){
					$("#selectMemberTreeGrid").jqxTreeGrid('addRow', row.name+"1", {}, 'last', row.uid);
				}
			}
	    	$("#selectMemberTreeGrid").jqxTreeGrid('collapseAll'); 
	    }, 
	    rendered: function () {
	   	},
	   	columns: [{ text: "Bilgisayarlar", align: "center", dataField: "name", width: '100%' }]  	
	});
	
	$('#selectMemberTreeGrid').on('rowCheck', function (event) {
		rowCheckAndUncheckOperationForCreatingGroup(event);
	});

	$('#selectMemberTreeGrid').on('rowUncheck', function (event) {
		rowCheckAndUncheckOperationForCreatingGroup(event);
	});

	$('#selectMemberTreeGrid').on('rowExpand', function (event) {
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
				$("#selectMemberTreeGrid").jqxTreeGrid('deleteRow', childRowname); 
	    	}  
			$.ajax({
				type : 'POST',
				url : 'lider/sudo_groups/getOuDetails',
				data : 'uid=' + row.distinguishedName + '&type=' + row.type
						+ '&name=' + row.name + '&parent=' + row.parent,
				dataType : 'text',
				success : function(ldapResult) {
					var childs = jQuery.parseJSON(ldapResult);
					for (var m = 0; m < childs.length; m++) {
						// get a row.
						var childRow = childs[m];
						$("#selectMemberTreeGrid").jqxTreeGrid('addRow', childRow.uid, childRow, 'last', row.uid);
						//$("#selectMemberTreeGrid").jqxTreeGrid('checkRow', row.name);
						if(childRow.hasSubordinates=="TRUE"){
							$("#selectMemberTreeGrid").jqxTreeGrid('addRow', childRow.uid+"1" , {}, 'last', childRow.uid); 
						}
						$("#selectMemberTreeGrid").jqxTreeGrid('collapseRow', childRow.uid);
					}
					row.expandedUser = "TRUE";
				},
			    error: function (data, errorThrown) {
			    	$.notify("Klasör bilgisi getirilirken hata oluştu.", "error");
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
        checkedUsers = [];
    	var checkedRows = $("#selectMemberTreeGrid").jqxTreeGrid('getCheckedRows');
    	
    	if(checkedRows.length > 0){
    		for(var row in checkedRows) {
    			if(checkedRows[row].type == "USER") {
    				checkedUsers.push({
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
    		//get users under checkboxes from service and add them to user list also
    		if(checkedOUList.length > 0) {
    			$.ajax({
    				url : 'lider/sudo_groups/getUsersUnderOU',
    				type : 'POST',
    				data: JSON.stringify(checkedOUList),
    				dataType: "json",
    				contentType: "application/json",
    				success : function(data) {
    					var ahenks = data;
    					$.each(data, function(index, element) {
    						var isExists = false;
    						for(var i = 0; i < checkedUsers.length; i++) {
    							if(element.entryUUID == checkedUsers[i].entryUUID) {
    								isExists = true;
    							}
    						}
    						if(isExists == false) {
    							checkedUsers.push({
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
    			    	$.notify("Kullanıcıler getirilirken hata oluştu.", "error");
    			    },
    				complete: function() {
    					$('#selectedUserCount').html(checkedUsers.length);
    				}
    			});
    		} else {
    			$('#selectedUserCount').html(checkedUsers.length);
    		}
    		
    	} else {
    		$('#selectedUserCount').html(checkedUsers.length);
    	}

    }
}

function btnCreateSudoGroupClicked() {
	if($('#groupName').val() == "") {
		$.notify("Lütfen grup adı giriniz.", "error");
		return;
	}
	var params = {
			"groupName" : $('#groupName').val(),
			"selectedOUDN" : selectedDN,
		    "sudoUserList" : sudoUserList,
		    "sudoCommandList" : sudoCommandList,
		    "sudoHostList" : sudoHostList
	};
	$.ajax({ 
	    type: 'POST', 
	    url: "/lider/sudo_groups/createSudoGroup",
	    dataType: 'json',
	    data: params,
	    success: function (data) { 
	    	$.notify("Grup oluşturuldu ve özellikler bu gruba dahil eklendi.", "success");
            $("#treeGridSudoGroups").jqxTreeGrid('addRow', data.entryUUID, data, 'last', selectedEntryUUID);
            $("#treeGridSudoGroups").jqxTreeGrid('expandRow', selectedEntryUUID);
            $('#genericModalLarge').trigger('click');
	    },
	    error: function (data, errorThrown) {
	    	$.notify("Yeni sudo grubu oluştururken hata oluştu.", "error");
	    }
	});
}

function btnMembersSelectedFromUserTree() {
	$('#userTreeModal').trigger('click');
	for(var i = 0; i < checkedUsers.length; i++) {
		var isExists = false;
		for(var j = 0; j < selectedAttribute.length; j++) {
			if(checkedUsers[i].distinguishedName == selectedAttribute[j][1]) {
				isExists = true;
			}
		}
		if(isExists == false) {
			selectedAttribute.push(["sudoUser", checkedUsers[i].uid]);
		}
	}
	createAttributeTable();
}

/*
 * delete sudo group
 */
function btnDeleteGroupClicked() {
	var params = {
		    "dn": selectedDN,
	};
	$.ajax({ 
	    type: 'POST', 
	    url: '/lider/sudo_groups/deleteEntry',
	    dataType: 'json',
	    data: params,
	    success: function (data) {
	    	$("#treeGridSudoGroups").jqxTreeGrid('deleteRow', selectedEntryUUID);
	    	$("#treeGridSudoGroups").jqxTreeGrid('selectRow', rootEntryUUID);
	    	$("#genericModal").trigger('click');
            $.notify("Yetki grubu başarıyla silindi.", "success");
	    },
	    error: function (data, errorThrown) {
	    	$.notify("Yetki grubu silinirken hata oluştu.", "error");
	    }
	});
}

/*
 * edit group name and attributes
 */
function fillAttributeTableForEditingGroup() {
	selectedAttribute = [];
	var selectedRows = $("#treeGridSudoGroups").jqxTreeGrid('getSelection');
	var row=selectedRows[0];
	$('#groupName').val(row.name);
	
	for (var key in row.attributesMultiValues) {
		if (row.attributesMultiValues.hasOwnProperty(key)  && key != "member") {
			if(key == "sudoUser") {
				for(var i = 0; i< row.attributesMultiValues[key].length; i++) {
					selectedAttribute.push(["sudoUser", row.attributesMultiValues[key][i] ]);
				}
			} else if(key == "sudoCommand") {
				for(var i = 0; i< row.attributesMultiValues[key].length; i++) {
					selectedAttribute.push(["sudoCommand", row.attributesMultiValues[key][i] ]);
				}
			} else if(key == "sudoHost") {
				for(var i = 0; i< row.attributesMultiValues[key].length; i++) {
					selectedAttribute.push(["sudoHost", row.attributesMultiValues[key][i] ]);
				}
			}
		}
	}
	createAttributeTable();
}

function btnEditSudoGroupClicked() {
	if($('#groupName').val() == "") {
		$.notify("Lütfen grup adı giriniz.", "error");
		return;
	}
	var params = {
			"newName" : "cn=" + $('#groupName').val(),
			"selectedDN" : selectedDN,
		    "sudoUserList" : sudoUserList,
		    "sudoCommandList" : sudoCommandList,
		    "sudoHostList" : sudoHostList
	};

	$.ajax({ 
	    type: 'POST', 
	    url: "/lider/sudo_groups/editSudoGroup",
	    dataType: 'json',
	    data: params,
	    success: function (data) { 
			$.notify("Grup düzenlendi.", "success");
            $('#genericModalLarge').trigger('click');
            createMainTree();
	    },
	    error: function (data, errorThrown) {
	    	$.notify("Yeni sudo grubu oluştururken hata oluştu.", "error");
	    }
	});
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
		    url: '/lider/sudo_groups/rename/entry',
		    dataType: 'json',
		    data: params,
		    success: function (data) {
		    	$.notify("Klasör adı düzenlendi.", "success");
	            $('#genericModal').trigger('click');
	            createMainTree();
		    },
		    error: function (data, errorThrown) {
		    	$.notify("Klasör adı düzenlenirken hata oluştu.", "error");
		    }
		});
	}
}


/*
 * delete group member from tab list
 */
function deleteMemberFromTabList(uid) {
	var params = {
		    "uid": uid,
		    "dn": selectedDN
	};
	$.ajax({
		type : 'POST',
		url  : 'lider/sudo_groups/delete/sudo/user',
		data : params,
		dataType : 'json',
		success : function(data) {
			if(data != null) {
				$.notify("Grup üyeleri başarıyla düzenlendi", "success");
				//get selected data and update it with new data result from service call
				var selectedData= $("#treeGridSudoGroups").jqxTreeGrid('getRow', data.entryUUID);
				selectedData.attributesMultiValues = data.attributesMultiValues;
				$("#treeGridSudoGroups").jqxTreeGrid('updateRow', selectedData.entryUUID, data);
				$("#treeGridSudoGroups").jqxTreeGrid('getRow', data.entryUUID);
				$("#treeGridSudoGroups").jqxTreeGrid('selectRow', data.entryUUID);
			}
		},
	    error: function (data, errorThrown) {
	    	$.notify("Grup üyesi silinirken hata oluştu.", "error");
	    }
	}); 
}
