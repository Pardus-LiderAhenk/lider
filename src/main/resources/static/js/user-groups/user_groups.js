/**
 * User group operations(group of names)
 * create, delete, editing members and move operations for groups.
 * create, delete and move operations for organizational units.
 * Hasan Kara
 * 
 */

var selectedRow=[]
var selectedRowForMove=[]
var selectedRowForMoveOld=[]

var rootDNForUsersGroup = "";
var rootEntryUUID = "";
var selectedEntryUUID = "";
var selectedDN = "";
var selectedName = "";
var checkedUsers = [];
var checkedOUList = [];
var groupMemberDNList = [];
var	groupMemberDNListForDelete = [];
var destinationDNToMoveRecord = "";
var selectedEntryParentDN = "";
var treeSelectedRow=null
var treeGridId= "";
var selectedPolicyRow = false;
var selectedPolicyRowId = null;
var policyOfSelectedGroup = null;

var selectedEntryUUIDForTreeMove = "";
var policyList=[]
clearAndHide();
getActivePolicies();
$('#policyApplyBtn').hide();

$(document).ready(function(){
	createUserGroupsTree();
	
	$('#btnTreeRefresh').on('click',function(event) {
		createUserGroupsTree();
	});
	
	 
	 /**
	  * organizational unit operations START
	  */
	 $('#btnCreateNewUserGroupBaseDn').on('click', function (event) {
		 openCreateUserGroupModal()
	 });
	 
	 $('#btnCreateNewUserGroup').on('click', function (event) {
		 openCreateUserGroupModal()
	 });
	 
	 $('#btnCreateNewOuBaseDn').on('click', function (event) {
		 
		 getModalContent("modals/groups/user_groups/createou", function content(data){
				$('#genericModalHeader').html("Yeni Klasör Oluştur");
				$('#genericModalBodyRender').html(data);
			});
	
	 });
	 
	 $('#btnCreateNewOu').on('click', function (event) {
		 
		 getModalContent("modals/groups/user_groups/createou", function content(data){
			 $('#genericModalHeader').html("Yeni Klasör Oluştur");
			 $('#genericModalBodyRender').html(data);
		 });
		 
	 });
	 
	 $('#btnRenameOu').on('click', function (event) {
		 getModalContent("modals/groups/user_groups/editouname", function content(data){
				$('#genericModalHeader').html("Klasörü Adı Düzenle");
				$('#genericModalBodyRender').html(data);
				$('#ouName').val(selectedName);
			});
		 
	 });

	 $('#btnMoveOu').on('click', function (event) {
		 selectedRowForMoveOld=selectedRow;
		 treeHolderDivOld=treeHolderDivGlob;
		 getModalContent("modals/groups/user_groups/moveentry", function content(data){
				$('#genericModalHeader').html("Kayıt Taşı");
				$('#genericModalBodyRender').html(data);
				createUserGroupTree('lider/user_groups/getGroups','moveEntryTreeDiv', true, false,
						// row select
						function(row, rootDnComputer,treeGridIdName){
							destinationDNToMoveRecordGlob = row.distinguishedName;
							selectedRowForMove=row;
						},
						//check action
						function(checkedRows, row){
						},
						//uncheck action
						function(unCheckedRows, row){
						},
						// post tree created
						function(rootComputer , treeGridId){
							$('#'+ treeGridId).jqxTreeGrid('selectRow', rootComputer);
							$('#'+ treeGridId).jqxTreeGrid('expandRow', rootComputer);
						},
						// create pop up menu 
						false
				);
				//generateTreeToMoveEntry();
			
		 });
	 });

	 $('#btnDeleteOu').on('click', function (event) {
		 getModalContent("modals/groups/user_groups/deleteou", function content(data){
				$('#genericModalHeader').html("Klasörü Sil");
				$('#genericModalBodyRender').html(data);
			});
		 
	 });
	 
	 /**
	  * organizational unit operations END
	  */

	 /**
	  * user Groups operations START
	  */
	 $('#addMemberUserGroupBtn').on('click', function (event) {
			checkedUsers = [];
			checkedOUList = [];
			
			
			getModalContent("modals/groups/user_groups/addmember", function content(data){
				$('#genericModalHeader').html("Kullanıcı Grubuna Üye Ekle");
				$('#genericModalBodyRender').html(data);
				$('#selectedUserCount').html(checkedUsers.length);
				createUserTree('addMembersToExistingUserGroupTreeDiv', false, true,
						// row select
						function(row, rootDnComputer,treeGridIdName){
						},
						//check action
						function(checkedRows, row){
							rowCheckAndUncheckOperationToAddMembersToExistingGroup(checkedRows, row);
						},
						//uncheck action
						function(unCheckedRows, row){
							rowCheckAndUncheckOperationToAddMembersToExistingGroup(unCheckedRows, row);
						},
						//post tree render  action
						function(rootDNUser , treeGridId){
							
						},
						false
				);
				//generateTreeToAddMembersToExistingGroup();
			});
		});
		$('#editUserGroupBtn').on('click', function (event) {
			getModalContent("modals/groups/user_groups/editgroupname", function content(data){
				$('#genericModalHeader').html("Grup Adı Düzenle");
				$('#genericModalBodyRender').html(data);
				$('#groupName').val(selectedName);
			});
		});

		$('#moveUserGroupBtn').on('click', function (event) {
			selectedRowForMoveOld=selectedRow;
			treeHolderDivOld=treeHolderDivGlob;
			getModalContent("modals/groups/user_groups/moveentry", function content(data){
				$('#genericModalHeader').html("Kayıt Taşı");
				$('#genericModalBodyRender').html(data);
				createUserGroupTree('lider/user_groups/getGroups','moveEntryTreeDiv', true, false,
						// row select
						function(row, rootDnComputer,treeGridIdName){
							destinationDNToMoveRecordGlob = row.distinguishedName;
							selectedRowForMove=row;
						},
						//check action
						function(checkedRows, row){
						},
						//uncheck action
						function(unCheckedRows, row){
						},
						// post tree created
						function(rootComputer , treeGridId){
							$('#'+ treeGridId).jqxTreeGrid('selectRow', rootComputer);
							$('#'+ treeGridId).jqxTreeGrid('expandRow', rootComputer);
						},
						// create pop up menu 
						false
				);

				//generateTreeToMoveEntry();
			});
		});
		
		$('#deleteUserGroupBtn').on('click', function (event) {
			checkedUsers = [];
			checkedOUList = [];
			getModalContent("modals/groups/user_groups/deletegroup", function content(data){
				$('#genericModalHeader').html("Kullanıcı Grubunu Sil");
				$('#genericModalBodyRender').html(data);
			});
		});

		 /**
		  *  user Groups operations END
		  */
	
});

/*
 * create user group functions
 */
function createUsersModalForCreatingGroup(){
	$('#userGroupsNewUserGroupName').val('');
	//if nothing is selected get rootDN of user groups.
	//so new created groups can be under root user groups
	$.ajax({
		type : 'POST',
		url : 'lider/user_groups/getUsers',
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
		},
		error: function (data, errorThrown) {
			$.notify("Kullanıcılar getirilirken hata oluştu.", "error");
		}
	});
}

function rowCheckAndUncheckOperationForCreatingUserGroup(checkedRows,row) {
	if(row.entryUUID != null) {
		checkedOUList = [];
		checkedUsers = [];
		if(checkedRows.length > 0){
			for (var k = 0; k < checkedRows.length; k++) {
				var rowCheck = checkedRows[k]
				if(rowCheck.type == "USER") {
					checkedUsers.push({
						distinguishedName: rowCheck.distinguishedName, 
						entryUUID: rowCheck.entryUUID, 
						name: rowCheck.name,
						type: rowCheck.type,
						uid: rowCheck.uid
					});
				} 

				if(rowCheck.type == "ORGANIZATIONAL_UNIT" && rowCheck.expandedUser == "FALSE") {
					checkedOUList.push({
						distinguishedName: rowCheck.distinguishedName, 
						entryUUID: rowCheck.entryUUID, 
						name: rowCheck.name,
						type: rowCheck.type,
						uid: rowCheck.uid
					});
				}
			}
			if(checkedOUList.length > 0) {
				$.ajax({
					url : 'lider/user_groups/getUsersUnderOU',
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
	var selectedRows = $("#createNewUserGroupTreeDivGrid").jqxTreeGrid('getSelection');
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
		url: "/lider/user_groups/createNewGroup",
		dataType: 'json',
		data: params,
		success: function (data) { 
			$.notify("Grup oluşturuldu ve kullanıcılar bu gruba dahil edildi.", "success");
			//after user group is added get newly added group detail from service
			//add this group to main tree
			$('#'+treeGridId).jqxTreeGrid('addRow', data.entryUUID, data, 'last', selectedEntryUUID);
			$('#'+treeGridId).jqxTreeGrid('expandRow', selectedEntryUUID);
			$('#genericModal').trigger('click');
		},
		error: function (data, errorThrown) {
			$.notify("Yeni kullanıcı grubu oluştururken hata oluştu.", "error");
		}
	});
}

function rowCheckAndUncheckOperationToAddMembersToExistingGroup(checkedRows,row) {
	if(row.entryUUID != null) {
		checkedOUList = [];
		checkedUsers = [];
		if(checkedRows.length > 0){
			for (var k = 0; k < checkedRows.length; k++) {
				var rowCheck = checkedRows[k]
				if(rowCheck.type == "USER") {
					checkedUsers.push({
						distinguishedName: rowCheck.distinguishedName, 
						entryUUID: rowCheck.entryUUID, 
						name: rowCheck.name,
						type: rowCheck.type,
						uid: rowCheck.uid
					});
				} 

				if(rowCheck.type == "ORGANIZATIONAL_UNIT" && rowCheck.expandedUser == "FALSE") {
					checkedOUList.push({
						distinguishedName: rowCheck.distinguishedName, 
						entryUUID: rowCheck.entryUUID, 
						name: rowCheck.name,
						type: rowCheck.type,
						uid: rowCheck.uid
					});
				}
			}
			//get users under checkboxes from service and add them to user list also
			if(checkedOUList.length > 0) {
				$.ajax({
					url : 'lider/user_groups/getUsersUnderOU',
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
						$.notify("Kullanıcı bilgileri getirilirken hata oluştu.", "error");
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

function btnAddMemberUserGroupsClicked() {
	if(checkedUsers.length == 0) {
		$.notify("Lütfen en az bir kullanıcı seçiniz.", "error");
		return;
	} 
	else {
		var selectedDNList = [];
		for (var i = 0; i < checkedUsers.length; i++) {
			selectedDNList.push(checkedUsers[i].distinguishedName);
		}
		var params = {
				"checkedList": selectedDNList,
				"groupDN" : selectedDN
		};
		$.ajax({ 
			type: 'POST', 
			url: "/lider/user_groups/group/existing",
			dataType: 'json',
			data: params,
			success: function (data) { 
				$.notify("Seçilen kullanıcıler gruba başarıyla eklendi.", "success");
				//get selected data and update it with new data result from service call
				var selectedData = $('#'+treeGridId).jqxTreeGrid('getRow', data.entryUUID);
				selectedData.attributesMultiValues = data.attributesMultiValues;
				$('#'+treeGridId).jqxTreeGrid('updateRow', selectedData.entryUUID, data);
				$('#'+treeGridId).jqxTreeGrid('getRow', data.entryUUID);
				$('#'+treeGridId).jqxTreeGrid('selectRow', data.entryUUID);
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
	$('#deleteMembersFromGroupTable').html('<tr><td colspan="100%" class="text-center">İşlemi tamamlamanız için en az bir kullanıcı bulunmalıdır.</td></tr>');
	$('#selectedGroupDN').text(selectedDN);
	var params = {
			"dn" : selectedDN
	};
	$.ajax({
		type : 'POST',
		url  : 'lider/user_groups/group/members',
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
						+ '<button onclick="removeUserFromMemberList(\'' + element.distinguishedName + '\')"' 
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

function removeUserFromMemberList(dn) {
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
				+ '<button onclick="removeUserFromMemberList(\'' + groupMemberDNList[i] + '\')"' 
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
			url  : 'lider/user_groups/delete/group/members',
			data : params,
			dataType : 'json',
			success : function(data) {
				if(data != null) {
					$.notify("Grup üyeleri başarıyla düzenlendi", "success");
					//get selected data and update it with new data result from service call
					var selectedData= $('#'+treeGridId).jqxTreeGrid('getRow', data.entryUUID);
					selectedData.attributesMultiValues = data.attributesMultiValues;
					$('#'+treeGridId).jqxTreeGrid('updateRow', selectedData.entryUUID, data);
					$('#'+treeGridId).jqxTreeGrid('getRow', data.entryUUID);
					$('#'+treeGridId).jqxTreeGrid('selectRow', data.entryUUID);
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
 * move user group or organizational unit functions
 */
function generateTreeToMoveEntry(){
	$.ajax({
		type : 'POST',
		url : 'lider/user_groups/getGroups',
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
			$.notify("İstemci grubu bilgileri alınırken hata oluştu.", "error");
		}
	});
}

function createTreeToMoveEntry(source) {
	$("#moveEntryTreeGrid").jqxTreeGrid('destroy');
	$("#moveEntryTreeDiv").append('<div id="moveEntryTreeGrid"></div> ')
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
				url : 'lider/user_groups/getOuDetails',
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
					$.notify("Klasör bilgileri getirilirken hata oluştu.", "error");
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
			url: '/lider/user_groups/rename/entry',
			dataType: 'json',
			data: params,
			success: function (data) {
				$.notify("Klasör adı düzenlendi.", "success");
				$('#genericModal').trigger('click');
				createUserGroupsTree()
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
function deleteMemberFromTabList(dn) {
	var selectedRowData=treeSelectedRow;
	var dnListToDelete = [];
	dnListToDelete.push(dn);
	if(selectedRowData.attributesMultiValues['member'].length > 1) {
		var params = {
				"dnList": dnListToDelete,
				"dn": selectedDN
		};
		$.ajax({
			type : 'POST',
			url  : 'lider/user_groups/delete/group/members',
			data : params,
			dataType : 'json',
			success : function(data) {

				if(data != null) {
					$.notify("Grup üyeleri başarıyla düzenlendi", "success");
					//get selected data and update it with new data result from service call
					var selectedData= $('#'+treeGridId).jqxTreeGrid('getRow', data.entryUUID);
					selectedData.attributesMultiValues = data.attributesMultiValues;
					$('#'+treeGridId).jqxTreeGrid('updateRow', selectedData.entryUUID, data);
					$('#'+treeGridId).jqxTreeGrid('getRow', data.entryUUID);
					$('#'+treeGridId).jqxTreeGrid('selectRow', data.entryUUID);
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

var treeCreated=false;
function createUserGroupsTree() {
	$('#treeGridUserGroupsDiv').html("");
	var treeGridHolderDiv= "treeGridUserGroupsDiv";
	createUserGroupTree('lider/user_groups/getGroups',treeGridHolderDiv, false, false,
			// row select
			function(row, rootDnComputer,treeGridIdName){
				treeGridId = treeGridIdName;
				treeSelectedRow=row;
				selectedRow=row
				baseRootDnComputer=rootDnComputer;
				selectedDN = row.distinguishedName;
				selectedEntryUUID = row.entryUUID;
				selectedName = row.name;
				if(row.parent != null) {
					selectedEntryParentDN = row.parent.distinguishedName;
				}
				createMemberList(row);
				if(row.type=='GROUP'){
					getPolicyListForSelectedGroup(row);
				}
			},
			//check action
			function(checkedRows, row){
			},
			//uncheck action
			function(unCheckedRows, row){
			},
			// post tree created
			function(rootComputer , treeGridId){
				$('#'+ treeGridId).jqxTreeGrid('selectRow', rootComputer);
				$('#'+ treeGridId).jqxTreeGrid('expandRow', rootComputer);
			},
			// create pop up menu 
			true
	);
}

function createMemberList(row) {
	$('#userGroupName').html(row.name);
	$('#selectedAgentGroupInfo').html(row.distinguishedName);
	$('#selectedDnInfo').html("Seçili Kayıt: "+name);
	$('#memberTabSelectedDNInfo').html("Seçili Kayıt: "+name);

	if(row.type == "GROUP") {
		var members = "";
		//to print members at different tab
		for (var key in row.attributesMultiValues) {
			if (row.attributesMultiValues.hasOwnProperty(key) && key == "member") {
				if(row.attributesMultiValues[key].length > 1) {
					for(var i = 0; i< row.attributesMultiValues[key].length; i++) {
						members += '<tr>';
						members += '<td>' + (i + 1) + '</td>';
						members += '<td>' + row.attributesMultiValues[key][i] + '</td>';
						members += '<td class="text-center p-0 m-0">' 
							+ '<button onclick="deleteMemberFromTabList(\'' + row.attributesMultiValues[key][i] + '\')"' 
							+ 'class="btn-icon btn-icon-only btn btn-outline-danger btn-sm">' 
							+ '<i class="pe-7s-trash btn-icon-wrapper"> </i></button>' 
							+ '</td>';
						members += '</tr>';
					}
				} else {
					members += '<tr>';
					members += '<td>1</td>';
					members += '<td>' + row.attributesMultiValues[key] + '</td>';
					members += '<td class="text-center p-0 m-0">' 
						+ '<button onclick="deleteMemberFromTabList(\'' + row.attributesMultiValues[key] + '\')"' 
						+ 'class="btn-icon btn-icon-only btn btn-outline-danger btn-sm">' 
						+ '<i class="pe-7s-trash btn-icon-wrapper"> </i></button>' 
						+ '</td>';
					members += '</tr>';
				}
			}
		}
		$('#bodyMembers').html(members);
		showUserButtons();
	} else {
		var html =""

			html += '<a class="dropdown-item" href="#" data-toggle="modal" data-target="#genericModal"' 
				+ 'onclick="dropdownButtonClicked(\'createNewOrganizationalUnit\')">Yeni Klasör Oluştur</a>';
		//if root dn is selected dont allow user to delete it

		if(baseRootDnComputer != row.entryUUID){
			html += '<a class="dropdown-item" href="#" data-toggle="modal" data-target="#genericModal"' 
				+ 'onclick="dropdownButtonClicked(\'editOrganizationalUnitName\')">Klasör Adı Düzenle</a>';
			html += '<a class="dropdown-item" href="#" data-toggle="modal" data-target="#genericModal"' 
				+ 'onclick="dropdownButtonClicked(\'moveEntry\')">Kaydı Taşı</a>';
			html += '<div class="dropdown-divider"></div>';
			html += '<a class="dropdown-item" href="#" data-toggle="modal" data-target="#genericModal"' 
				+ 'onclick="dropdownButtonClicked(\'deleteOrganizationalUnit\')">Klasörü Sil</a>';
		}
		$('#operationDropDown').html(html);
		clearAndHide()
	}
}

function clearAndHide() {
	$('#userGroupName').html("Lütfen Kullanıcı Grubu Seçiniz");
	$('#bodyMembers').html('<tr><td colspan="3" class="text-center">Lütfen Kullanıcı Grubu Seçiniz.</td></tr>');
	$('#bodyExecutedPolicies').html('<tr id="bodyExecutedPoliciesRow"><td colspan="5" class="text-center">Lütfen Kullanıcı Grubu Seçiniz.</td></tr>');
	$('#userGroupButtonActions').hide()
	$('#ouOperations').show();
	policyOfSelectedGroup = null;
}
function showUserButtons() {
	$('#userGroupButtonActions').show()
	$('#ouOperations').hide();
}

//<--- START policy apply ---->>

function getActivePolicies() {
	$.ajax({
		type : 'POST',
		url : '/policy/list',
		dataType : 'json',
		success : function(data) {
			policyList = data
			if (data != null && data.length > 0) {
				if ($("#bodyPolicyRow").length > 0) {
					$("#bodyPolicyRow").remove();
				}
				var html = "";
				var number = 0;
				for (var i = 0; i < data.length; i++) {
					var policyId = data[i].id;
					var policyName = data[i].label;
					var policyDescription = data[i].description;
					var policyStatus = "Aktif";
					var createDate = data[i].createDate;
					if (data[i].deleted == false && data[i].active == true) {
						number = number + 1;
						html += '<tr id='+ policyId +'>';
						html += '<td>' + number + '</td>';
						html += '<td>' + policyName + '</td>';
						html += '<td>' + createDate + '</td>';
						html += '<td>' + policyDescription + '</td>';
						html += '</tr>';
					}
				}
			}
			$("#bodyPolicies").append(html);
		}
	});
}

$('#activePolicyTable').on('click', 'tbody tr', function(event) {
	if (policyList != null && policyList.length) {
		if($(this).hasClass('selectpolicytable')){
			$(this).removeClass('selectpolicytable');
			isPolicySelected = false;
			selectedPolicyRowId = null;
			$('#policyApplyBtn').hide();
		} else {
			$(this).addClass('selectpolicytable').siblings().removeClass('selectpolicytable');
			selectedPolicyRowId = $(this).attr('id');
			isPolicySelected = true;
			$('#policyApplyBtn').show();
		}
	}
});

$("#policyApplyBtn").click(function(e){
	if (treeSelectedRow.type != "GROUP" ) {
		$.notify("Lütfen kullanıcı grubu seçiniz.", "warn");
		return;
	}
	if (isPolicySelected) {
		var selectedPolicy = null;
		for (var i = 0; i < policyList.length; i++) {
			if(policyList[i].id==selectedPolicyRowId){
				selectedPolicy = policyList[i];
			}
		}
		var params ={
				"id" : selectedPolicy.id,
				"dnType" : treeSelectedRow.type,
				"dnList" : [selectedDN],
		}
		var paramsJson = JSON.stringify(params);
		if (isExistPolicyOfSelectedGroup(selectedPolicy.id) == false) {
			$.ajax({
				type: "POST",
				url: "/policy/execute",
				headers: {
					'Content-Type':'application/json',
				}, 
				data: paramsJson,
				contentType: "application/json",
				dataType: "json",
				converters: {
					'text json': true
				},
				success: function(result) {
					var res = jQuery.parseJSON(result);
					$.notify("Politika başarıyla uygulandı.", "success");
					getPolicyListForSelectedGroup(treeSelectedRow);
				},
				error: function(result) {
					$.notify(result, "error");
				}
			});
		} else {
			$.notify("Politika zaten uygulanmış", "warn");
		}
	} else {
		$.notify("Lütfen politika seçiniz.", "warn");
	}
});

//getting all policy history for selected group
function getPolicyListForSelectedGroup(selectedGroup) {
	var params ={
			"distinguishedName" : selectedGroup.distinguishedName,
	}
	var paramsJson = JSON.stringify(params);
	$.ajax({
		type: "POST",
		url: "/policy/getPoliciesForGroup",
		headers: {
			'Content-Type':'application/json',
		}, 
		data: paramsJson,
		contentType: "application/json",
		dataType: "json",
		converters: {
			'text json': true
		},
		success: function(result) {
			var data = jQuery.parseJSON(result);
			if (data != null && data.length > 0) {
				policyOfSelectedGroup = data;
				var number = 0;
				var html = "";
				for (var i = 0; i < data.length; i++) {
					number = number + 1
					var commandId = data[i].commandImpl.id;
					html += '<tr id="'+ data[i].policyImpl.id +'">';
					html += '<td>'+ number +' </td>';
					html += '<td>'+ data[i].policyImpl.label +'</td>';
					html += '<td>'+ data[i].commandExecutionImpl.createDate +'</td>';
					html += '<td>'+ data[i].policyImpl.policyVersion +'</td>';
					html += '<td class="text-center">' 
						+ '<button onclick="unassignmentUserPolicy(\'' + commandId + '\')"' 
						+ 'class="mr-2 btn-icon btn-icon-only btn btn-outline-danger" title="Kaldır">' 
						+ '<i class="fas fa-times"></i></button>' 
						+ '</td>';
					html += '</tr>'
				}
				$("#bodyExecutedPolicies").html(html);
			} else {
				if (treeSelectedRow.type == "GROUP" ) {
					$('#bodyExecutedPolicies').html('<tr id="bodyExecutedPoliciesRow"><td colspan="5" class="text-center">Atanmış Politika Bulunamadı.</td></tr>');
					policyOfSelectedGroup = null;
				}
			}
		},
		error: function(result) {
			$.notify(result, "error");
		}
	});
}

function unassignmentUserPolicy(commandId) {

	params = {
			"id": commandId
	}

	$.confirm({
		title: 'Uyarı!',
		content: 'Politikayı kullanıcı grubundan kaldırmak istiyor musunuz?',
		theme: 'light',
		buttons: {
			Evet: function () {
				$.ajax({
					type: "POST",
					url: "/policy/unassignment",
					headers: {
						'Content-Type':'application/json',
					}, 
					data: JSON.stringify(params),
					contentType: "application/json",
					dataType: "json",
					converters: {
						'text json': true
					},
					success: function(data) {
						if (data != null && data.length > 0) {
							$.notify("Politika başarıyla kaldırıldı.", "success");
							getPolicyListForSelectedGroup(treeSelectedRow);
						} else {
							$.notify("Politika kaldırılırken hata oluştu.", "error");
						}
					}
				});
			},
			Hayır: function () {
			}
		}
	});
}

function isExistPolicyOfSelectedGroup(id) {
	var isExist = false;
	if (policyOfSelectedGroup != null) {
		for (var i = 0; i < policyOfSelectedGroup.length; i++) {
			if (id == policyOfSelectedGroup[i].policyImpl.id) {
				isExist = true;
			}
		}
	}
	return isExist;
}

/*
 * this function triggered by delete button on DeleteGroupModal
 */
function btnDeleteGroupClicked() {
	var params = {
			"dn": selectedRow.distinguishedName,
	};
	$.ajax({ 
		type: 'POST', 
		url: '/lider/user_groups/deleteEntry',
		dataType: 'json',
		data: params,
		success: function (data) {
			$('#'+treeGridId).jqxTreeGrid('deleteRow', selectedRow.entryUUID);
			$('#'+treeGridId).jqxTreeGrid('selectRow', rootComputer);
			$.notify("Kullanıcı grubu başarıyla silindi.", "success");
//			clearAndHide();
		},
		error : function(jqXHR, textStatus, errorThrown) {
			if(jqXHR != null && jqXHR.responseJSON != null && jqXHR.responseJSON[0] != null && jqXHR.responseJSON[0] != "")
				$.notify("Kullanıcı grubu silinirken hata oluştu: " + jqXHR.responseJSON[0], "error");
			else
				$.notify("Kullanıcı grubu silinirken hata oluştu.", "error");
		},
		complete : function() {
			$("#genericModal").trigger('click');
			$("#genericModalLarge").trigger('click');
		}
	});
}


function btnDeleteOUClicked() {
	var params = {
			"dn": selectedRow.distinguishedName,
	};
	$.ajax({ 
		type: 'POST', 
		url: '/lider/user_groups/deleteEntry',
		dataType: 'json',
		data: params,
		success: function (data) {
			$('#'+treeGridId).jqxTreeGrid('deleteRow', selectedRow.entryUUID);
			$('#'+treeGridId).jqxTreeGrid('selectRow', rootComputer);
			$('#genericModal').trigger('click');
			$.notify("Klasör başarıyla silindi.", "success");
		},
		error: function (data, errorThrown) {
			$.notify("Klasör silinirken hata oluştu.", "error");
		}
	});
}

/*
 * this function triggered by edit button on EditGroupModal
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
				"oldDN" : selectedRow.distinguishedName,
				"newName": "cn=" + newOuName
		};
		$.ajax({
			type: 'POST', 
			url: '/lider/user_groups/rename/entry',
			dataType: 'json',
			data: params,
			success: function (data) {
				$.notify("Grup adı düzenlendi.", "success");
				$('#genericModal').trigger('click');
				$('#'+ treeHolderDivGlob).html("");
				createUserGroupTree(searchPathGlob,treeHolderDivGlob,showOnlyFolderGlob,useCheckBoxGlob, rowSelectActionGlob, rowCheckActionGlob, rowUncheckActionGlob, postTreeCreatedActionGlob);
//				clearAndHide()
			},
			error: function (data, errorThrown) {
				$.notify("Grup adı düzenlenirken hata oluştu.", "error");
			}
		});
	}
}

function btnMoveEntryClicked() {
	if(selectedRowForMoveOld.distinguishedName == destinationDNToMoveRecordGlob) {
		$.notify("Kayıt kendi altına taşınamaz.", "error");
	}
	else if(selectedRowForMoveOld.parent.distinguishedName != destinationDNToMoveRecordGlob) {
		var params = {
				"sourceDN" : selectedRowForMoveOld.distinguishedName,
				"destinationDN": destinationDNToMoveRecordGlob
		};
		$.ajax({ 
			type: 'POST', 
			url: '/lider/user_groups/move/entry',
			dataType: 'json',
			data: params,
			success: function (data) {
				$.notify("Seçili Grup başarı ile taşındı.", "success");
				$('#genericModal').trigger('click');
//				clearAndHide();
				createUserGroupsTree();
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
 * create, delete operations for Organizational Unit
 */
function btnCreateNewOUClicked() {
	var ouName = $("#ouName").val();
	if(ouName == "") {
		$.notify("Klasör adı giriniz.", "error");
	} else {
		var params = {
				"parentName" : selectedRow.distinguishedName,
				"ou": ouName,
				"type": 'ORGANIZATIONAL_UNIT',
				"distinguishedName": 'ou=' + ouName + ',' + selectedRow.distinguishedName,
				"name": ouName
		};
		$.ajax({ 
			type: 'POST', 
			url: '/lider/user_groups/addOu',
			dataType: 'json',
			data: params,
			success: function (data) {
				// add new empty row.
//				$('#'+treeGridId).jqxTreeGrid('addRow', data.entryUUID, data, 'first', selectedEntryUUID);
//				$('#'+treeGridId).jqxTreeGrid('expandRow', selectedEntryUUID);
//				$('#'+treeGridId).jqxTreeGrid('selectRow', data.entryUUID);
//				createUserGroupTree(searchPathGlob,treeHolderDivGlob,showOnlyFolderGlob,useCheckBoxGlob, rowSelectActionGlob, rowCheckActionGlob, rowUncheckActionGlob, postTreeCreatedActionGlob);
				$('#genericModal').trigger('click');
				createUserGroupsTree();
				$.notify("Klasör oluşturuldu.", "success");
			},
			error: function (data, errorThrown) {
				$.notify("Klasör oluşturulurken hata oluştu.", "error");
			}
		});
	}
}

function openCreateUserGroupModal() {
	 checkedUsers = [];
	 checkedOUList = [];
	 if(selectedRow.distinguishedName == ""){
		 $.notify("Lütfen klasör seçiniz", "error");
	 }
	 else
	 {
		 $('#selectedUserCountCreateNewUserGroup').html(checkedUsers.length);
		 getModalContent("modals/groups/user_groups/creategroup", function content(data){
			 $('#genericModalHeader').html("Kullanıcı Grubu Oluştur");
			 $('#genericModalBodyRender').html(data);
			 
			 $('#userGroupsNewUserGroupName').val('');
			 
			 createUserTree('createNewUserGroupTreeDiv', false, true,
					 // row select
					 function(row, rootDnComputer,treeGridIdName){
			 },
			 //check action
			 function(checkedRows, row){
				 rowCheckAndUncheckOperationForCreatingUserGroup(checkedRows, row);
			 },
			 //uncheck action
			 function(unCheckedRows, row){
				 rowCheckAndUncheckOperationForCreatingUserGroup(unCheckedRows, row);
			 },
			 // post tree created
			 function(root , treeGridId){
				 $('#'+ treeGridId).jqxTreeGrid('selectRow', root);
				 $('#'+ treeGridId).jqxTreeGrid('expandRow', root);
			 },
			 false
			 );
		 });
	 }
}


