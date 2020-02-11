/**
 * When page loading getting users groups from LDAP.
 * M. Edip YILDIZ
 * 
 */

var rootDNForUsersGroup = "";
var selectedEntryUUID = "";
var selectedDN = "";


$(document).ready(function(){
	createMainTree();
});

/*
 * events of dropdown button above main tree
 */
function dropdownButtonClicked(operation) {
	if(operation == "createNewUserGroup") {
		checkedUsers = [];
		checkedOUList = [];
		$('#selectedUserCountCreateNewUserGroup').html(checkedUsers.length);
		getModalContent("modals/groups/user/creategroup", function content(data){
			$('#genericModalHeader').html("Kullanıcı Grubu Oluştur");
			$('#genericModalBodyRender').html(data);
			createUsersModalForCreatingGroup();
		});
	} else if(operation == "deleteUserGroup") {
		checkedUsers = [];
		checkedOUList = [];
		$('#selectedUserCountCreateNewUserGroup').html(checkedUsers.length);
		getModalContent("modals/groups/user/deletegroup", function content(data){
			$('#genericModalHeader').html("Kullanıcı Grubunu Sil");
			$('#genericModalBodyRender').html(data);
		});
	} else if(operation == "deleteMembersFromGroup") {
		groupMemberDNListForDelete = [];
		groupMemberDNList = [];
		getModalContent("modals/groups/user/deletemember", function content(data){
			$('#genericModalLargeHeader').html("Üye Sil");
			$('#genericModalLargeBodyRender').html(data);
			deleteMembersOfGroup();
		});
	} else if(operation == "createNewOrganizationalUnit") {
		getModalContent("modals/groups/user/createou", function content(data){
			$('#genericModalHeader').html("Yeni Organizasyon Birimi Oluştur");
			$('#genericModalBodyRender').html(data);
		});
	} else if(operation == "deleteOrganizationalUnit") {
		getModalContent("modals/groups/user/deleteou", function content(data){
			$('#genericModalHeader').html("Organizasyon Birimini Sil");
			$('#genericModalBodyRender').html(data);
		});
	} else if(operation == "addMembersToUserGroupModal") {
		checkedUsers = [];
		checkedOUList = [];
		getModalContent("modals/groups/user/addmember", function content(data){
			$('#genericModalHeader').html("Kullanıcı Grubuna Üye Ekle");
			$('#genericModalBodyRender').html(data);
			$('#selectedUserCount').html(checkedUsers.length);
			generateTreeToAddMembersToExistingGroup();
		});
	} else if(operation == "moveEntry") {
		getModalContent("modals/groups/user/moveentry", function content(data){
			$('#genericModalHeader').html("Kayıt Taşı");
			$('#genericModalBodyRender').html(data);
			generateTreeToMoveEntry();
		});
	}
}

/*
 * create user groups for base user group page
 */
function createMainTree() {
	$("#treeGridUserGroups").jqxTreeGrid('destroy');
	$("#treeGridUserGroupsDiv").append('<div id="treeGridUserGroups"></div> ');
	var html = '<a class="dropdown-item" href="#" data-toggle="modal" data-target="#genericModal"' 
		+ 'onclick="dropdownButtonClicked(\'createNewUserGroup\')">Yeni Kullanıcı Grubu Oluştur</a>';
	html += '<a class="dropdown-item" href="#" data-toggle="modal" data-target="#genericModal"' 
		+ 'onclick="dropdownButtonClicked(\'createNewOrganizationalUnit\')">Yeni Organizasyon Birimi Oluştur</a>';
	$('#operationDropDown').html(html);
	$.ajax({
		type : 'POST',
		url : 'lider/ldap/userGroups',
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
			rootDNForUsersGroup = source.localData[0].distinguishedName;
			selectedEntryUUID = source.localData[0].entryUUID;
			var dataAdapter = new $.jqx.dataAdapter(source, {
			});

			var getLocalization = function () {
				var localizationobj = {};
				localizationobj.filterSearchString = "Ara :";
				return localizationobj;
			}

			// create jqxTreeGrid.
			$("#treeGridUserGroups").jqxTreeGrid({
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
	
					var allrows =$("#treeGridUserGroups").jqxTreeGrid('getRows');
					if(allrows.length==1){
						var row=allrows[0];
						if(row.childEntries==null){
							$("#treeGridUserGroups").jqxTreeGrid('addRow', row.entryUUID+"1", {}, 'last', row.entryUUID);
						}
					}
					$("#treeGridUserGroups").jqxTreeGrid('collapseAll');
					$("#treeGridUserGroups").jqxTreeGrid('selectRow', selectedEntryUUID);
				},
				columns: [
					{ text: "Kullanıcı Grup Ağacı", align: "center", dataField: "name", width: '100%'}
					]
			});
		}
	});
	
	$('#treeGridUserGroups').on('rowExpand', function (event) {
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
				$("#treeGridUserGroups").jqxTreeGrid('deleteRow', childRowname); 
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
						$("#treeGridUserGroups").jqxTreeGrid('addRow', childRow.entryUUID, childRow, 'last', row.entryUUID);
						if(childRow.hasSubordinates=="TRUE"){
							$("#treeGridUserGroups").jqxTreeGrid('addRow', childRow.entryUUID+"1" , {}, 'last', childRow.entryUUID); 
						}
						$("#treeGridUserGroups").jqxTreeGrid('collapseRow', childRow.entryUUID);
					} 
					row.expandedUser="TRUE"
				},
			    error: function (data, errorThrown) {
			    	$.notify("Grup bilgisi getirilirken hata oluştu.", "error");
			    }
			});  
		}
	}); 
	
	$('#treeGridUserGroups').on('rowSelect', function (event) {
		var args = event.args;
		var row = args.row;
		var name= row.name;
		selectedDN = row.distinguishedName;
		selectedEntryUUID = row.entryUUID;
		
		var html = '<table class="table table-striped table-bordered " id="attrTable">';
		html += '<thead>';
		html += '<tr>';
		html += '<th style="width: 40%">Öznitelik</th>';
		html += '<th style="width: 60%">Değer</th>';
		html += '</tr>';
		html += '</thead>';
		for (key in row.attributesMultiValues) {
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
		for (key in row.attributesMultiValues) {
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
		
		var selectedRows = $("#treeGridUserGroups").jqxTreeGrid('getSelection');
		var selectedRowData=selectedRows[0];

		if(selectedRowData.type == "ORGANIZATIONAL_UNIT"){
			html = '<a class="dropdown-item" href="#" data-toggle="modal" data-target="#genericModal"' 
				+ 'onclick="dropdownButtonClicked(\'createNewUserGroup\')">Yeni Kullanıcı Grubu Oluştur</a>';
			html += '<a class="dropdown-item" href="#" data-toggle="modal" data-target="#genericModal"' 
				+ 'onclick="dropdownButtonClicked(\'createNewOrganizationalUnit\')">Yeni Organizasyon Birimi Oluştur</a>';
			//if root dn is selected dont allow user to delete it
			if(rootDNForUsersGroup != row.distinguishedName){
				html += '<a class="dropdown-item" href="#" data-toggle="modal" data-target="#genericModal"' 
					+ 'onclick="dropdownButtonClicked(\'moveEntry\')">Kaydı Taşı</a>';
				html += '<div class="dropdown-divider"></div>';
				html += '<a class="dropdown-item" href="#" data-toggle="modal" data-target="#genericModal"' 
					+ 'onclick="dropdownButtonClicked(\'deleteOrganizationalUnit\')">Organizasyon Birimini Sil</a>';
			}
			$('#operationDropDown').html(html);
		} else if(selectedRowData.type == "GROUP"){
			html = '<a class="dropdown-item" href="#" data-toggle="modal" data-target="#genericModal"' 
				+ 'onclick="dropdownButtonClicked(\'addMembersToUserGroupModal\')">Kullanıcı Ekle</a>';
			html += '<a class="dropdown-item" href="#" data-toggle="modal" data-target="#genericModal"' 
				+ 'onclick="dropdownButtonClicked(\'moveEntry\')">Kaydı Taşı</a>';
			html += '<div class="dropdown-divider"></div>';
			html += '<a class="dropdown-item" href="#" data-toggle="modal" data-target="#genericModalLarge"' 
				+ 'onclick="dropdownButtonClicked(\'deleteMembersFromGroup\')">Kullanıcı Sil</a>';
			html += '<a class="dropdown-item" href="#" data-toggle="modal" data-target="#genericModal"' 
				+ 'onclick="dropdownButtonClicked(\'deleteUserGroup\')">Kullanıcı Grubunu Sil</a>';
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
		$.notify("Organizasyon birimi adı giriniz.", "error");
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
	            $("#treeGridUserGroups").jqxTreeGrid('addRow', data.entryUUID, data, 'last', selectedEntryUUID);
	            $("#treeGridUserGroups").jqxTreeGrid('expandRow', selectedEntryUUID);
	            $('#genericModal').trigger('click');
	            $.notify("Organizasyon Birimi Oluşturuldu.", "success");
		    },
		    error: function (data, errorThrown) {
		    	$.notify("Organizasyon birimi oluşturulurken hata oluştu.", "error");
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
	    	$("#treeGridUserGroups").jqxTreeGrid('deleteRow', selectedEntryUUID);
	    	$('#genericModal').trigger('click');
            $.notify("Organizasyon birimi başarıyla silindi.", "success");
	    },
	    error: function (data, errorThrown) {
	    	$.notify("Organizasyon birimi silinirken hata oluştu.", "error");
	    }
	});
}

/*
 * create user group functions
 */
function createUsersModalForCreatingGroup(){
	$('#userGroupsNewUserGroupName').val('');
	//if nothing is selected get rootDN of user groups.
	//so new created groups can be under root user groups
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
			           { name: "childEntries", type: "array" }
			      ],
			      hierarchy:
			          {
			              root: "childEntries"
			          },
			      localData: data,
			      id: "name"
			  };
			 //create user tree grid
			 createUserTreeGridForCreatingGroup(source);
		}
	});
}

function createUserTreeGridForCreatingGroup(source) {
	$("#createNewUserGroupTreeGrid").jqxTreeGrid('destroy');
	$("#createNewUserGroupTreeDiv").append('<div id="createNewUserGroupTreeGrid"></div> ');
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
	$("#createNewUserGroupTreeGrid").jqxTreeGrid(
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
			return "img/entry_group.gif";
		}
		else return "img/folder.png";
		},
		ready: function () {
			var allrows =$("#createNewUserGroupTreeGrid").jqxTreeGrid('getRows');
			if(allrows.length==1){
				var row=allrows[0];
				if(row.childEntries==null ){
					$("#createNewUserGroupTreeGrid").jqxTreeGrid('addRow', row.name+"1", {}, 'last', row.name);
				}
			}
	    	$("#createNewUserGroupTreeGrid").jqxTreeGrid('collapseAll'); 
	    }, 
	    rendered: function () {
	   	},
	   	columns: [{ text: "Bilgisayarlar", align: "center", dataField: "name", width: '100%' }]  	
	});
	
	$('#createNewUserGroupTreeGrid').on('rowCheck', function (event) {
		rowCheckAndUncheckOperationForCreatingGroup(event);
	});

	$('#createNewUserGroupTreeGrid').on('rowUncheck', function (event) {
		rowCheckAndUncheckOperationForCreatingGroup(event);
	});

	$('#createNewUserGroupTreeGrid').on('rowExpand', function (event) {
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
				$("#createNewUserGroupTreeGrid").jqxTreeGrid('deleteRow', childRowname); 
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
						$("#createNewUserGroupTreeGrid").jqxTreeGrid('addRow', childRow.name, childRow, 'last', row.name);
						//$("#createNewUserGroupTreeGrid").jqxTreeGrid('checkRow', row.name);
						if(childRow.hasSubordinates=="TRUE"){
							$("#createNewUserGroupTreeGrid").jqxTreeGrid('addRow', childRow.name+"1" , {}, 'last', childRow.name); 
						}
						$("#createNewUserGroupTreeGrid").jqxTreeGrid('collapseRow', childRow.name);
					}
					row.expandedUser="TRUE";
				},
			    error: function (data, errorThrown) {
			    	$.notify("Bilgi getirilirken hata oluştu.", "error");
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
    	var checkedRows = $("#createNewUserGroupTreeGrid").jqxTreeGrid('getCheckedRows');
    	
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
    				url : 'lider/user/getUsersUnderOU',
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
    					$('#selectedUserCountCreateNewUserGroup').html(checkedUsers.length);
    				}
    			});
    		} else {
    			$('#selectedUserCountCreateNewUserGroup').html(checkedUsers.length);
    		}
    		
    	} else {
    		$('#selectedUserCountCreateNewUserGroup').html(checkedUsers.length);
    	}
    }

}

function btnCreateUserGroupClicked() {
	if($('#userGroupsNewUserGroupName').val() == "") {
		$.notify("Lütfen grup adı giriniz.", "error");
		return;
	} else if(checkedUsers.length == 0) {
		$.notify("Grup oluşturabilmek için en az bir kullanıcı seçmelisiniz.", "error");
		return;
	}
	var selectedRows = $("#createNewUserGroupTreeGrid").jqxTreeGrid('getSelection');
	var selectedDNList = [];
	for (var i = 0; i < checkedUsers.length; i++) {
		selectedDNList.push(checkedUsers[i].distinguishedName);
	}
	var params = {
		    "groupName" : $('#userGroupsNewUserGroupName').val(),
		    "checkedList": selectedDNList,
		    "selectedOUDN" : selectedDN
		};
	
	$.ajax({ 
	    type: 'POST', 
	    url: "/lider/user/createNewGroup",
	    dataType: 'json',
	    data: params,
	    success: function (data) { 
	    	$.notify("Grup oluşturuldu ve kullanıcılar bu gruba dahil edildi.", "success");
	    	//after user group is added get newly added group detail from service
	    	//add this group to main tree
            $("#treeGridUserGroups").jqxTreeGrid('addRow', data.entryUUID, data, 'last', selectedEntryUUID);
            $("#treeGridUserGroups").jqxTreeGrid('expandRow', selectedEntryUUID);
            $('#genericModal').trigger('click');
	    },
	    error: function (data, errorThrown) {
	    	$.notify("Yeni kullanıcı grubu oluştururken hata oluştu.", "error");
	    }
	});
}