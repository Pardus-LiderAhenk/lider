/**
 * Agent group operations(group of names)
 * create, delete, editing members and move operations for groups.
 * create, delete and move operations for organizational units.
 * Hasan Kara
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
var selectedEntries =[];
var selectedRow= null;
var baseRootDnComputer=null;
var destinationDNToMoveRecord = "";
var selectedEntryUUIDForTreeMove = "";
var treeGridHolderDiv= "treeGridAgentGroupsDiv";
var treeGridId= "";

setPluginPages();
clearAndHide()

$(document).ready(function(){
	/*
	 * create tree select, check and uncheck action functions can be implemented if required
	 * params div, onlyFolder, use Checkbox, select action , check action, uncheck action
	 */
	cretaeAgentGroupTree()
	
	$('#btnCreateNewAgentGroup').on('click', function (event) {
		checkedAgents = [];
		checkedOUList = [];
		$('#selectedAgentCountCreateNewAgentGroup').html(checkedAgents.length);
		getModalContent("modals/groups/computer_groups/creategroup", function content(data){
			$('#genericModalHeader').html("İstemci Grubu Oluştur");
			$('#genericModalBodyRender').html(data);
			
			$('#agentGroupsNewAgentGroupName').val('');
			createAgentsGroupTree('lider/ldap/getComputers','createNewAgentGroupTreeDiv', false, true,
					// row select
					function(row, rootDnComputer,treeGridIdName){
				
					},
					//check action
					function(checkedRows, row){
						rowCheckAndUncheckOperationForCreatingGroup(checkedRows,row);
					},
					//uncheck action
					function(unCheckedRows, row){
						rowCheckAndUncheckOperationForCreatingGroup(unCheckedRows,row);
					}
			);
		});
	});
	$('#editAgentGroupBtn').on('click', function (event) {
		getModalContent("modals/groups/computer_groups/editgroupname", function content(data){
			$('#genericModalHeader').html("Grup Adı Düzenle");
			$('#genericModalBodyRender').html(data);
			$('#groupName').val(selectedName);
			
		});
	});
	$('#moveAgentGroupBtn').on('click', function (event) {
		getModalContent("modals/groups/computer_groups/moveentry", function content(data){
			$('#genericModalHeader').html("Kayıt Taşı");
			$('#genericModalBodyRender').html(data);
			
			createAgentsGroupTree('lider/ldap/agentGroups','moveEntryTreeDiv', true, false,
					// row select
					function(row, rootDnComputer,treeGridIdName){
//						selectedEntryUUIDForTreeMove=selectedRow.distinguishedName;
						destinationDNToMoveRecord = row.distinguishedName;
					},
					//check action
					function(checkedRows, row){
					},
					//uncheck action
					function(unCheckedRows, row){
					}
			);
		//	generateTreeToMoveEntry();
		});
	});
	$('#deleteAgentGroup').on('click', function (event) {
		checkedAgents = [];
		checkedOUList = [];
		getModalContent("modals/groups/computer_groups/deletegroup", function content(data){
			$('#genericModalHeader').html("İstemci Grubunu Sil");
			$('#genericModalBodyRender').html(data);
		});
	});
	$('#addMemberAgentGroupBtn').on('click', function (event) {
		checkedAgents = [];
		checkedOUList = [];
		getModalContent("modals/groups/computer_groups/addmember", function content(data){
			$('#genericModalHeader').html(selectedName+" İstemci Grubuna Üye Ekle");
			$('#genericModalBodyRender').html(data);
			$('#selectedAgentCount').html(checkedAgents.length);
			
			createAgentsGroupTree('lider/ldap/getComputers','addMembersToExistingAgentGroupTreeDiv', false, true,
					// row select
					function(row, rootDnComputer,treeGridIdName){
						treeGridId = treeGridIdName;
						selectedRow=row;
						baseRootDnComputer=rootDnComputer;
					},
					//check action
					function(checkedRows, row){
						rowCheckAndUncheckOperationToAddMembersToExistingGroup(checkedRows);
					},
					//uncheck action
					function(unCheckedRows, row){
						rowCheckAndUncheckOperationToAddMembersToExistingGroup(unCheckedRows);
					}
			);
		});
	});
	// Ou actions START
	$('#btnCreateNewOrganizationalUnit').click(function() {
		getModalContent("modals/groups/computer_groups/createou", function content(data){
			$('#genericModalHeader').html("Yeni Klasör Oluştur");
			$('#genericModalBodyRender').html(data);
		});
		
	});
	$('#btnEditOrganizationalUnitName').click(function() {
		getModalContent("modals/groups/computer_groups/editouname", function content(data){
			$('#genericModalHeader').html("Klasör Adı Düzenle");
			$('#genericModalBodyRender').html(data);
			$('#ouName').val(selectedName);
		});
	});
	$('#btnMoveOuModal').click(function() {
		getModalContent("modals/groups/computer_groups/moveentry", function content(data){
			$('#genericModalHeader').html("Kayıt Taşı");
			$('#genericModalBodyRender').html(data);
			
			createAgentsGroupTree('lider/ldap/agentGroups','moveEntryTreeDiv', true, false,
					// row select
					function(row, rootDnComputer,treeGridIdName){
						destinationDNToMoveRecord = row.distinguishedName;
					},
					//check action
					function(checkedRows, row){
					},
					//uncheck action
					function(unCheckedRows, row){
					}
			);
		});
	});
	$('#btnDeleteOrganizationalUnit').click(function() {
		getModalContent("modals/groups/computer_groups/deleteou", function content(data){
			$('#genericModalHeader').html("Klasörü Sil");
			$('#genericModalBodyRender').html(data);
		});
	});
	// Ou actions END
	// Page buttons actions START
	$('#btn-system').click(function() {
		setPluginPages();
	});
	
	$('#btn-script').click(function() {
		setScriptPluginPage();
	});
	// Page buttons actions END
});

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
	            $('#'+treeGridId).jqxTreeGrid('addRow', data.entryUUID, data, 'last', selectedEntryUUID);
	            $('#'+treeGridId).jqxTreeGrid('expandRow', selectedEntryUUID);
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
	    	$('#'+treeGridId).jqxTreeGrid('deleteRow', selectedEntryUUID);
//	    	$('#'+treeGridId).jqxTreeGrid('selectRow', rootEntryUUID);
	    	$('#genericModal').trigger('click');
            $.notify("Klasör silindi.", "success");
            clearAndHide();
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
	    	$('#'+treeGridId).jqxTreeGrid('deleteRow', selectedEntryUUID);
//	    	$('#'+treeGridId).jqxTreeGrid('selectRow', rootEntryUUID);
	    	$('#genericModal').trigger('click');
            $.notify("İstemci Grubu Silindi.", "success");
            
            clearAndHide();
	    },
	    error: function (data, errorThrown) {
	    	$.notify("Grup silinirken hata oluştu.", "error");
	    }
	});
}
function rowCheckAndUncheckOperationForCreatingGroup(checkedRows,row) {
    //this control is for dummy content that is added for expanding row if it has child
    if(row.entryUUID != null) {
    	checkedOUList = [];
        checkedAgents = [];
//    	var checkedRows = $("#createNewAgentGroupTreeGridAgent").jqxTreeGrid('getCheckedRows');
    	if(checkedRows.length > 0){
    		for (var k = 0; k < checkedRows.length; k++) {
    			var rowCheck = checkedRows[k]
    			if(rowCheck.type == "AHENK") {
    				checkedAgents.push({
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
	    	//after agent group is added get newly addded group detail from servic add this group to main tree
            $('#genericModal').trigger('click');
            cretaeAgentGroupTree()
	    },
	    error: function (data, errorThrown) {
	    	$.notify("Yeni istemci grubu oluştururken hata oluştu.", "error");
	    }
	});
}

function rowCheckAndUncheckOperationToAddMembersToExistingGroup(checkedRows) {
    checkedOUList = [];
    checkedAgents = [];
	if(checkedRows.length > 0){
		for (var k = 0; k < checkedRows.length; k++) {
			var rowCheck = checkedRows[k]
			if(rowCheck.type == "AHENK") {
				checkedAgents.push({
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
		    url: "/lider/computer_groups/group/existing",
		    dataType: 'json',
		    data: params,
		    success: function (data) { 
				$.notify("Seçilen istemciler gruba başarıyla eklendi.", "success");
				//get selected data and update it with new data result from service call
				console.log(data)
				var selectedData=selectedRow;
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
					var selectedData=selectedRow;
					
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
	            
	            if(selectedRow){
	            	$('#genericModal').trigger('click');
	            	cretaeAgentGroupTree();
	        		clearAndHide();
				}
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
	            cretaeAgentGroupTree()
	            clearAndHide();
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
	            cretaeAgentGroupTree()
	           
	            clearAndHide();
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
	var selectedRowData=selectedRow;
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
					$.notify("Seçili Grup Üyesi Başarı ile Kaldırıldı.", "success");
					//get selected data and update it with new data result from service call
					var selectedData=selectedRow;
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

function createMembersList(row) {
	selectedDN = row.distinguishedName;
	selectedEntryUUID = row.entryUUID;
	selectedName = row.name;
	data={}
	data.type=row.type;
	data.entryUUID=row.entryUUID;
	data.name=row.name;
	data.online=row.online;
	data.uid=row.uid;
	data.distinguishedName=row.distinguishedName;
	data.cn=row.cn;
	data.attributesMultiValues=row.attributesMultiValues;
	/**
	 * selected entries should be one element 
	 */
	selectedEntries=[]
	selectedEntries.push(data);
	
	if(row.type == "GROUP") {
		if(row.parent != null) {
			selectedEntryParentDN = row.parent.distinguishedName;
		}
			var members = "";
			//to print members at different tab
			for (var key in row.attributesMultiValues) {
				if (row.attributesMultiValues.hasOwnProperty(key) && key == "member") {
					if(row.attributesMultiValues[key].length > 1) {
						for(var i = 0; i< row.attributesMultiValues[key].length; i++) {
							members += '<tr>';
							members += '<td class="text-center">' + (i + 1) + '</td>';
							members += '<td> <img id="agent_image" alt="" src="img/linux.png"  width="16px;" height="16px;"> ' + row.attributesMultiValues[key][i] + '</td>';
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
			$('#ouOperations').hide();
			showAgentButtons()
	} else {
		clearAndHide();
		$('#ouOperations').show();
	}
}
function setPluginPages() {
	$("#systemPage").show();
	$("#scriptManagementPage").hide();
	$.ajax({
		type : 'POST',
		url : 'getPluginTaskList',
		dataType : 'json',
		success : function(data) {
			pluginTaskList = data;

			for (var i = 0; i < pluginTaskList.length; i++) {
				var pluginTask = pluginTaskList[i];
				
				if(pluginTask.page == 'manage-root'){
					$.ajax({
						type : 'POST',
						url : 'getPluginTaskHtmlPage',
						data : 'id=' + pluginTask.id + '&name=' + pluginTask.name	+ '&page=' + pluginTask.page + '&description=' + pluginTask.description,
						dataType : 'text',
						success : function(res1) {
							$('#manage-root').html(res1);
						}
					});
				}
				if(pluginTask.page == 'end-sessions'){
					$.ajax({
						type : 'POST',
						url : 'getPluginTaskHtmlPage',
						data : 'id=' + pluginTask.id + '&name=' + pluginTask.name	+ '&page=' + pluginTask.page + '&description=' + pluginTask.description,
						dataType : 'text',
						success : function(res1) {
							$('#end-sessions').html(res1);
						}
					});
				}
				if(pluginTask.page == 'conky'){
					$.ajax({
						type : 'POST',
						url : 'getPluginTaskHtmlPage',
						data : 'id=' + pluginTask.id + '&name=' + pluginTask.name	+ '&page=' + pluginTask.page + '&description=' + pluginTask.description,
						dataType : 'text',
						success : function(res1) {
							$('#conky').html(res1);
						}
					});
				}
				if(pluginTask.page == 'eta-notify'){
					$.ajax({
						type : 'POST',
						url : 'getPluginTaskHtmlPage',
						data : 'id=' + pluginTask.id + '&name=' + pluginTask.name	+ '&page=' + pluginTask.page + '&description=' + pluginTask.description,
						dataType : 'text',
						success : function(res1) {
							$('#eta-notify').html(res1);
						}
					});
				}
				if(pluginTask.page == 'ldap-login'){
					$.ajax({
						type : 'POST',
						url : 'getPluginTaskHtmlPage',
						data : 'id=' + pluginTask.id + '&name=' + pluginTask.name	+ '&page=' + pluginTask.page + '&description=' + pluginTask.description,
						dataType : 'text',
						success : function(res1) {
							$('#ldap-login').html(res1);
						}
					});
				}
				if(pluginTask.page == 'xmessage'){
					$.ajax({
						type : 'POST',
						url : 'getPluginTaskHtmlPage',
						data : 'id=' + pluginTask.id + '&name=' + pluginTask.name	+ '&page=' + pluginTask.page + '&description=' + pluginTask.description,
						dataType : 'text',
						success : function(res1) {
							$('#xmessage').html(res1);
						}
					});
				}
			}
		}
	});
}
function setScriptPluginPage() {
	$("#systemPage").hide();
	$("#scriptManagementPage").show();
	for (var i = 0; i < pluginTaskList.length; i++) {
		var pluginTask = pluginTaskList[i];
		if(pluginTask.page == 'execute-script'){
			$.ajax({
				type : 'POST',
				url : 'getPluginTaskHtmlPage',
				data : 'id=' + pluginTask.id + '&name=' + pluginTask.name	+ '&page=' + pluginTask.page + '&description=' + pluginTask.description,
				dataType : 'text',
				success : function(res2) {
					$('#execute-script').html(res2);
				}
			});
		}
	}
}
function cretaeAgentGroupTree() {
	$('#treeGridAgentGroupsDiv').html("");
	var treeGridHolderDiv= "treeGridAgentGroupsDiv";
	createAgentsGroupTree('lider/computer_groups/getGroups',treeGridHolderDiv, false, false,
			// row select
			function(row, rootDnComputer,treeGridIdName){
				treeGridId = treeGridIdName;
				selectedRow=row;
				baseRootDnComputer=rootDnComputer;
				$('#agentGroupName').html(row.name);
				$('#selectedAgentGroupInfo').html(row.distinguishedName);
				createMembersList(selectedRow)
			},
			//check action
			function(checkedRows, row){
			},
			//uncheck action
			function(unCheckedRows, row){
			}
	);
}
function clearAndHide() {
	$('#selectedAgentGroupInfo').html("Lütfen İstemci Grubu Seçiniz");
	$('#bodyMembers').html('<tr><td colspan="100%" class="text-center">Lütfen İstemci Grubu Seçiniz.</td></tr>');
	$('#agentGroupButtonActions').hide()
}
function showAgentButtons() {
	$('#agentGroupButtonActions').show()
}
	
