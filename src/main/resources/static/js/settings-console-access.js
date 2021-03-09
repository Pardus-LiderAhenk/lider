var users;
var roles;
var rules;
var userTableSelectedTrIndex = "";
var roleTableSelectedTrIndex = "";
var roleTableSelectedRoleName = "";

var selectedRow = [];

var selectedDN = "";
var selectedEntryUUID = "";
var selectedName = "";
var userTableSelectedEntryDN = "";
var configuration;

var rootDNOfUserGroupsTree = "";
var rootEntryUUIDOfUserGroupsTree = "";
var selectedEntryUUIDOfUserGroupsTree = "";
var selectedDNOfUserGroupsTree = "";
var selectedNameOfUserGroupsTree = "";
var selectedEntryParentDNOfUserGroupsTree = "";

//for selected entry info for olc rule
var selectedAccessDN = ""

var savedNewConsoleUser = null;
var selectedGroupdNewConsoleUser = null;

$(document).ready(function () {
	$('#labelSelectOneUserGroupAlert').hide();
	$('#operationDropDownDiv').hide();
	$('#olcRulesTableDiv').hide();
	$('#groupMembersHeaderDiv').hide();
	$('#groupMembersDiv').hide();
	tabConsoleSettingsClicked();
	
	$('#btnGroupTreeRefresh').click(function(){
		createMainTree();
	});
	
});

function tabConsoleSettingsClicked() {
	getConsoleUsers();
}

function tabLDAPAccessRulesClicked() {
	createMainTree();
}


function dropdownButtonClickedSetting(operation) {
	if(operation == "addOLCRulesToComputersTree") {
		getModalContent("modals/settings/select_entry_from_tree_for_olc", function content(data){
			$('#genericModalHeader').html("Erişim Yetkisi Ekleme");
			$('#genericModalBodyRender').html(data);
			$('#olcAccessInfoAlert').html('<b>"' + selectedNameOfUserGroupsTree + '"</b> grubunun tüm üyeleri seçeceğiniz klasör ve bu klasörün altındaki tüm klasör ve kayıtlara erişim sağlayacaktır');
			generateTreeForSelectingOUToAddOLCRule('lider/computer/getComputers', 'lider/computer/getOuDetails', 'Bilgisayarlar');
		});
	} else if(operation == "addOLCRulesToUsersTree") {
		getModalContent("modals/settings/select_entry_from_tree_for_olc", function content(data){
			$('#genericModalHeader').html("Erişim Yetkisi Ekleme");
			$('#genericModalBodyRender').html(data);
			$('#olcAccessInfoAlert').html('<b>"' + selectedNameOfUserGroupsTree + '"</b> grubunun tüm üyeleri seçeceğiniz klasör ve bu klasörün altındaki tüm klasör ve kayıtlara erişim sağlayacaktır');
			generateTreeForSelectingOUToAddOLCRule('lider/user/getUsers', 'lider/user/getOuDetails', 'Kullanıcılar');
		});
	} else if(operation == "addOLCRulesToComputerGroupsTree") {
		getModalContent("modals/settings/select_entry_from_tree_for_olc", function content(data){
			$('#genericModalHeader').html("Erişim Yetkisi Ekleme");
			$('#genericModalBodyRender').html(data);
			$('#olcAccessInfoAlert').html('<b>"' + selectedNameOfUserGroupsTree + '"</b> grubunun tüm üyeleri seçeceğiniz klasör ve bu klasörün altındaki tüm klasör ve kayıtlara erişim sağlayacaktır');
			generateTreeForSelectingOUToAddOLCRule('lider/computer_groups/getGroups', 'lider/computer_groups/getOuDetails', 'İstemci Grupları');
		});
	} else if(operation == "addOLCRulesToUserGroupsTree") {
		getModalContent("modals/settings/select_entry_from_tree_for_olc", function content(data){
			$('#genericModalHeader').html("Erişim Yetkisi Ekleme");
			$('#genericModalBodyRender').html(data);
			$('#olcAccessInfoAlert').html('<b>"' + selectedNameOfUserGroupsTree + '"</b> grubunun tüm üyeleri seçeceğiniz klasör ve bu klasörün altındaki tüm klasör ve kayıtlara erişim sağlayacaktır');
			generateTreeForSelectingOUToAddOLCRule('lider/user_groups/getGroups', 'lider/user_groups/getOuDetails', 'Kullanıcı Grupları');
		});
	} else if(operation == "addOLCRulesToRoleGroupsTree") {
		getModalContent("modals/settings/select_entry_from_tree_for_olc", function content(data){
			$('#genericModalHeader').html("Erişim Yetkisi Ekleme");
			$('#genericModalBodyRender').html(data);
			$('#olcAccessInfoAlert').html('<b>"' + selectedNameOfUserGroupsTree + '"</b> grubunun tüm üyeleri seçeceğiniz klasör ve bu klasörün altındaki tüm klasör ve kayıtlara erişim sağlayacaktır');
			generateTreeForSelectingOUToAddOLCRule('lider/sudo_groups/getGroups', 'lider/sudo_groups/getOuDetails', 'Rol Grupları');
		});
	}
}


/*
 * create user groups tree to assign LDAP OLC access rules.
 */
function createMainTree() {
	
	$("#treeGridUserGroupsDiv").html("");
	
	var treeGridHolderDiv= "treeGridUserGroupsDiv";
	
	createUserGroupTree('lider/user_groups/getGroups',treeGridHolderDiv, false, false,
			// row select
			function(row, rootDnComputer,treeGridIdName){
					selectedDNOfUserGroupsTree = row.distinguishedName;
					selectedEntryUUIDOfUserGroupsTree = row.entryUUID;
					selectedNameOfUserGroupsTree = row.name;
					selectedRow=row;
					baseRootDnComputer=rootDnComputer;
					selectedDN = row.distinguishedName;
					selectedEntryUUID = row.entryUUID;
					selectedName = row.name;
					
					if(row.parent != null) {
						selectedEntryParentDNOfUserGroupsTree = row.parent.distinguishedName;
					}
					
					if(row.type == "GROUP") {
						$('#labelSelectOneUserGroupAlert').hide();
						$('#operationDropDownDiv').show();
						$('#olcRulesTableDiv').show();
						$('#groupMembersHeaderDiv').show();
						$('#groupMembersDiv').show();
						var members = "";
						//to print members at different tab
						for (var key in row.attributesMultiValues) {
							if (row.attributesMultiValues.hasOwnProperty(key) && key == "member") {
								if(row.attributesMultiValues[key].length > 1) {
									for(var i = 0; i< row.attributesMultiValues[key].length; i++) {
										members += '<tr>';
										members += '<td class="text-center">' + (i + 1) + '</td>';
										members += '<td>' + row.attributesMultiValues[key][i] + '</td>';
										members += '</tr>';
									}
								} else {
									members += '<tr>';
									members += '<td class="text-center">1</td>';
									members += '<td>' + row.attributesMultiValues[key] + '</td>';
									members += '</tr>';
								}
							}
						}
						$('#bodyMembers').html(members);
						getLDAPAccessRules();
					} else {
						$('#labelSelectOneUserGroupAlert').show();
						$('#operationDropDownDiv').hide();
						$('#olcRulesTableDiv').hide();
						$('#groupMembersHeaderDiv').hide();
						$('#groupMembersDiv').hide();
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

function getLDAPAccessRules() {
	if(selectedDNOfUserGroupsTree != "") {
		var params = {
			    "dn": selectedDNOfUserGroupsTree
			};
		$.ajax({ 
		    type: 'POST', 
		    url: "/lider/settings/getOLCAccessRules",
		    dataType: 'json',
		    data: params,
		    success: function (data) { 
		    	if(data != null) {
		    		if(data.length > 0) {
		    			rules = data;
			    		var trElement = "";
			    		$.each(data, function(index, element) {
			    			trElement += '<tr><td>' + (index + 1) + '</td>';
			    			trElement += '<td>' + element.accessDN + '</td>';
			    			if(element.accessType == 'read') {
			    				trElement += '<td class="text-center">' + 'Okuma' + '</td>';
			    			}
			    			if(element.accessType == 'write') {
			    				trElement += '<td class="text-center">' + 'Okuma ve Yazma' + '</td>';
			    			}
			    			trElement += '<td class="text-center p-0 m-0">';
			    			trElement += '<button onclick="deleteOLCAccessRule(\'' + index + '\')" ' +
			    					'class="btn-icon btn-icon-only btn btn-outline-danger btn-sm p-o m-0"><i class="pe-7s-trash btn-icon-wrapper"> </i></button>';
			    			trElement += '</td></tr>';
			    		});
			    		$('#olcRulesTable').html(trElement);
		    		} else {
		    			$('#olcRulesTable').html('<td colspan="100%" class="text-center p-3">Sonuç Bulunamadı</td>');
		    			rules = null;
		    		}
		    	} else {
		    		$('#olcRulesTable').html('<td colspan="100%" class="text-center p-3">Sonuç Bulunamadı</td>');
		    		rules = null;
		    	}
		    },
		    error: function (data, errorThrown) {
		    	$('#olcRulesTable').html('<td colspan="100%" class="text-center p-3">Sonuç Bulunamadı</td>');
		    	$.notify("Grup LDAP Erişim yetkileri getirilirken hata oluştu. Lütfen tekrar deneyiniz.", "error");
		    	rules = null;
		    },
			complete: function() {
			}
		});
	}
}
function getLDAPAccessRulesForNewConsoleUser(dn) {
	if(dn != "") {
		var params = {
				"dn": dn
		};
		$.ajax({ 
			type: 'POST', 
			url: "/lider/settings/getOLCAccessRules",
			dataType: 'json',
			data: params,
			success: function (data) { 
				if(data != null) {
					if(data.length > 0) {
						rules = data;
						var trElement = "";
						$.each(data, function(index, element) {
							trElement += '<tr><td>' + (index + 1) + '</td>';
							trElement += '<td>' + element.accessDN + '</td>';
							if(element.accessType == 'read') {
								trElement += '<td class="text-center">' + 'Okuma' + '</td>';
							}
							if(element.accessType == 'write') {
								trElement += '<td class="text-center">' + 'Okuma ve Yazma' + '</td>';
							}
//							trElement += '<td class="text-center p-0 m-0">';
//							trElement += '<button onclick="deleteOLCAccessRule(\'' + index + '\')" ' +
//							'class="btn-icon btn-icon-only btn btn-outline-danger btn-sm p-o m-0"><i class="pe-7s-trash btn-icon-wrapper"> </i></button>';
//							trElement += '</td>';
							trElement += '</tr>';
						});
						$('#olcRulesTableForNewConsoleUser').html(trElement);
					} else {
						$('#olcRulesTableForNewConsoleUser').html('<td colspan="100%" class="text-center p-3">Sonuç Bulunamadı</td>');
						rules = null;
					}
				} else {
					$('#olcRulesTableForNewConsoleUser').html('<td colspan="100%" class="text-center p-3">Sonuç Bulunamadı</td>');
					rules = null;
				}
			},
			error: function (data, errorThrown) {
				$('#olcRulesTableForNewConsoleUser').html('<td colspan="100%" class="text-center p-3">Sonuç Bulunamadı</td>');
				$.notify("Grup LDAP Erişim yetkileri getirilirken hata oluştu. Lütfen tekrar deneyiniz.", "error");
				rules = null;
			},
			complete: function() {
			}
		});
	}
}

function deleteOLCAccessRule(index) {
	if(index != null && index != "") {

		$.ajax({ 
		    type: 'POST', 
		    url: "/lider/settings/deleteOLCAccessRule",
		    data: JSON.stringify(rules[index]),
			dataType: "json",
			contentType: "application/json",
		    success: function (data, textStatus, jqXHR) { 
		    	if(data != null) {
		    		$.notify("Kullanıcı grubunun erişim yetkisi başarıyla silindi.", "success");
		    		getLDAPAccessRules();
		    	} else {
		    		$.notify("Kullanıcı grubunun erişim yetkisi silinirken hata oluştu. ", "error");
		    	}
		    },
		    error: function (jqXHR, textStatus, errorThrown) {
		    	$.notify("Kullanıcı grubunun erişim yetkisi silinirken hata oluştu. Lütfen tekrar deneyiniz.", "error");
		    },
			complete: function() {
			}
		});
	}
}

function btnSaveOLCRuleClicked() {
	var params = {
			"type" : 'computers',
		    "groupDN" : selectedDNOfUserGroupsTree,
		    "olcAccessDN": selectedAccessDN,
		    "accessType": $("input[name='accessType']:checked").val()
	};
	$.ajax({ 
	    type: 'POST', 
	    url: '/lider/settings/addOLCAccessRule',
	    dataType: 'json',
	    data: params,
	    success: function (data) {
	    	if(data != null && data == true) {
	    		getLDAPAccessRules();
	    		$.notify("Erişim yetkisi başarıyla eklendi.", "success");
	    	} else {
	    		$.notify("Erişim yetkisi eklenirken hata oluştu.\n" +
	    				"Eklediğiniz kural daha önce eklenen bir kural tarafından kapsanıyor olabilir.", "error");
	    	}
	    	$('#genericModal').trigger('click');
	    },
	    error: function (data, errorThrown) {
	    	$.notify("Erişim yetkisi eklenirken hata oluştu.", "error");
	    	$('#olcRulesTable').html('<td colspan="100%" class="text-center p-3">Sonuç Bulunamadı</td>');
	    }
	});
}

function getConsoleUsers() {
	$.ajax({ 
	    type: 'GET', 
	    url: "/lider/settings/getConsoleUsers",
	    dataType: 'json',
	    success: function (data) { 
	    	if(data != null) {
	    		users = data;
	    	} else {
	    		$.notify("Ayarlar getirilirken hata oluştu. Lütfen tekrar deneyiniz.", "error");
	    	}
	    },
	    error: function (data, errorThrown) {
	    	$.notify("Ayarlar getirilirken hata oluştu. Lütfen tekrar deneyiniz.", "error");
	    },
		complete: function() {
			getRoles();
		}
	});
}

function getRoles() {
	$.ajax({ 
	    type: 'GET', 
	    url: "/lider/settings/getRoles",
	    dataType: 'json',
	    success: function (data, textStatus, jqXHR) { 
	    	if(data != null) {
	    		roles = data;
	    	} else {
	    		$.notify("Roller getirilirken hata oluştu. Lütfen tekrar deneyiniz.", "error");
	    	}
	    },
	    error: function (jqXHR, textStatus, errorThrown) {
	    	$.notify("Roller getirilirken hata oluştu. Lütfen tekrar deneyiniz.", "error");
	    },
		complete: function() {
			setConsoleUsersTable();
		}
	});
}

function setConsoleUsersTable() {
	if(users != null && users.length > 0) {
		var trElement = "";
		$.each(users, function(index, element) {
			trElement += '<tr id="user_' + index + '" onclick="showUserDetail(\'user_' + index + '\',\'' + element.distinguishedName + '\')"><td>' + (index+1) + '</td>';
			trElement += "<td>" + element.uid + "</td>";
			trElement += "<td>" + element.distinguishedName + "</td>";
			trElement += '</tr>';
		});
		$('#existingUsers').html(trElement);
		if(userTableSelectedEntryDN != "") {
			$('#' + userTableSelectedTrIndex).css("background-color", "#E0F3FF");
			showUserDetail(userTableSelectedTrIndex, userTableSelectedEntryDN);
		} else {
			$('#user_0').css("background-color", "#E0F3FF");
			showUserDetail("user_0", users[0].distinguishedName);
		}
	}
}

function btnDeleteUserClicked() {
	if(userTableSelectedEntryDN != null && userTableSelectedEntryDN != "") {
		var params = {
			    "dn": userTableSelectedEntryDN
			};
		$.ajax({ 
		    type: 'POST', 
		    url: "/lider/settings/deleteConsoleUser",
		    dataType: 'json',
		    data: params,
		    success: function (data, textStatus, jqXHR) { 
		    	if(data != null) {
		    		$.notify("Kullanıcının arayüz yetkileri başarıyla silindi.", "success");
					users = data;
					userTableSelectedTrIndex = "";
					userTableSelectedEntryDN = "";
					setConsoleUsersTable();
		    	} else {
		    		$.notify("Kullanıcının arayüz yetkileri alınırken hata oluştu. Lütfen tekrar deneyiniz.", "error");
		    	}
		    },
		    error: function (jqXHR, textStatus, errorThrown) {
		    	if(jqXHR.status == 401) {
		    		window.location.replace("/logout");
		    	} else {
		    		$.notify("Kullanıcının arayüz yetkileri alınırken hata oluştu. Lütfen tekrar deneyiniz.", "error");
		    	}
		    },
			complete: function() {
			}
		});
	}
}

function showUserDetail(index, dn) {
	userTableSelectedEntryDN = dn;
	if(userTableSelectedTrIndex == "") {
		$('#' + index).css("background-color", "#E0F3FF");
		userTableSelectedTrIndex = index;
		
	} else if(userTableSelectedTrIndex != index) {
		$('#' + userTableSelectedTrIndex).css("background-color", "");
		$('#' + index).css("background-color", "#E0F3FF");
		userTableSelectedTrIndex = index;
	}

	$('#headerForSelectedUserRoles').html('Seçili Kullanıcı Rolleri (Kayıt DN: ' + dn + ')');
	var trElement = "";
	$.each(users, function(index, element) {
		var counter = 1;
		if(element.distinguishedName == dn) {
			$.each(roles, function(j, role) {
				trElement += '<tr>';
				trElement += '<td>' + (j+1) + '</td>';
				trElement += '<td>' + role.name + '</td>';
				trElement += '<td class="text-center p-0 m-0">';
				trElement += '<div class="custom-control custom-switch">';
				//if this role is assigned to selected user check this role
				if(element.attributesMultiValues["liderPrivilege"].indexOf(role.value) > -1) {
					trElement += '<input type="checkbox" class="custom-control-input p-0 m-0 cbUserRole" id="' + role.value + '" checked>';
				} else {
					trElement += '<input type="checkbox" class="custom-control-input p-0 m-0 cbUserRole" id="' + role.value + '">';
				}
				trElement += '<label class="custom-control-label" for="' + role.value + '"></label>';
				trElement += '</div>';
	    		trElement += '</td>';
	    		trElement += '</tr>';
			});
		}
	});
	$('#userRoles').html(trElement);
}

function btnAddNewConsoleUserClicked() {
	getModalContent("modals/settings/select_console_user", function content(data){
		$('#genericModalLargeHeader').html("Arayüz Kullanıcısı Ekle");
		$('#genericModalLargeBodyRender').html(data);
		generateTreeForAssigningLiderConsoleUser();
		generateTreeForAssigningDirectoryAccess();
		$('#contentForNewConsoleUser').hide();
		$('#btnAddToGroupSelectedUser').hide();
		
		savedNewConsoleUser = null;
		selectedGroupdNewConsoleUser = null;
		
		$('.existConsoleUserTab').click(function() {
			generateTreeForAssigningLiderConsoleUser();
		});
		
		$('.accessDirectoryTab').click(function() {
			 openAccessDirectoryTab();
		});
		
		$('#btnAddToGroupSelectedUser').click(function() {
			if(selectedGroupdNewConsoleUser==null){
				$.notify("Lütfen Grup Seçiniz",{className: 'success',position:"right top"}  );
				return;
			}
			var parentDn=selectedGroupdNewConsoleUser.distinguishedName; 
			var params = {
					"distinguishedName": savedNewConsoleUser.distinguishedName,
					"parentName": parentDn
			};
			$.ajax({
				type : 'POST',
				url : 'lider/settings/addMemberToGroup',
				data : params,
				dataType : 'json',
				success : function(data) {
					$.notify("Kullanıcı gruba eklendi.",{className: 'success',position:"right top"}  );
					$('#genericModalLarge').trigger('click');
				},
				error: function (data, errorThrown) {
					$.notify("Üye Eklenirken Hata Oluştu.", "error");
				}
			}); 
		});
		
	});
}

function openAccessDirectoryTab() {
	generateTreeForAssigningDirectoryAccess();
	if(savedNewConsoleUser!=null){
		$('#labelSelectOneUserGroupAlertForConsoleUser').html(savedNewConsoleUser.name+ " kullanıcısina ait dizin erişimleri için lütfen dizin ağacından grup seçiniz.");
		$('#contentForNewConsoleUser').show();
		$('#btnAddToGroupSelectedUser').show();
	}
	else{
		$('#labelSelectOneUserGroupAlertForConsoleUser').html("Lütfen Kullanıcı Seçiniz.");
		$('#contentForNewConsoleUser').hide();
		$('#btnAddToGroupSelectedUser').hide();
	}
}
/*
 * create user tree select, check and uncheck action functions can be implemented if required
 * params div, onlyFolder, use Checkbox, select action , check action, uncheck action
 */
function generateTreeForAssigningLiderConsoleUser() {
	$('#selectConsoleUserTreeDiv').html("")
	createUserTree('selectConsoleUserTreeDiv', false, false,
			// row select
			function(row, rootDnUser){
				selectedDN = row.distinguishedName;
				selectedEntryUUID = row.entryUUID;
				selectedName = row.name;
				
				if(row.type == "ORGANIZATIONAL_UNIT") {
					$('#addConsoleUserBtn').prop('disabled', false);
					$('#btnGiveConsoleAccessToSelectedUser').prop('disabled', true);
					$('#alreadyConsoleUser').html("");
					$('#selectedDnForNewUser').html(selectedDN);
				}
				else if(row.type == "USER"){
					savedNewConsoleUser=row;
				
					//check if user already has role for console
					var selectedRows = $("#selectConsoleUserTreeDivGrid").jqxTreeGrid('getSelection');
					var selectedRowData=selectedRows[0];
					var isUserAlreadyConsoleUser = false;
					if(selectedRowData.priviliges != null) {
						for(var i = 0; i< selectedRowData.priviliges.length; i++) {
							if(selectedRowData.priviliges[i] == "ROLE_USER") {
								isUserAlreadyConsoleUser = true;
							}
						}
					}
					if(isUserAlreadyConsoleUser) {
						$('#alreadyConsoleUser').html("<br>Kullanıcının Arayüz yetkisi bulunmaktadır.");
						$('#btnGiveConsoleAccessToSelectedUser').prop('disabled', true);
					} else {
						$('#alreadyConsoleUser').html("");
						$('#btnGiveConsoleAccessToSelectedUser').prop('disabled', false);
					}
					
					$('#addConsoleUserBtn').prop('disabled', true);
				}
			},
			//check action
			function(checkedRows, row){
				
			},
			//uncheck action
			function(unCheckedRows, row){
				
			},
			// post tree created
			function(root , treeGridId){
				$('#'+ treeGridId).jqxTreeGrid('selectRow', root);
				$('#'+ treeGridId).jqxTreeGrid('expandRow', root);
			},
			false
	);
}
function generateTreeForAssigningDirectoryAccess() {
	$('#treeGridUserGroupsDivForNewConsoleUser').html("");
	var treeGridHolderDiv= "treeGridUserGroupsDivForNewConsoleUser";
	createUserGroupTree('lider/user_groups/getGroups',treeGridHolderDiv, false, false,
			// row select
			function(row, rootDnComputer,treeGridIdName){
					
					if(row.type == "GROUP") {
						$('#groupMembersDivForNewConsoleUser').show();
						var members = "";
						//to print members at different tab
						for (var key in row.attributesMultiValues) {
							if (row.attributesMultiValues.hasOwnProperty(key) && key == "member") {
								if(row.attributesMultiValues[key].length > 1) {
									for(var i = 0; i< row.attributesMultiValues[key].length; i++) {
										members += '<tr>';
										members += '<td class="text-center">' + (i + 1) + '</td>';
										members += '<td>' + row.attributesMultiValues[key][i] + '</td>';
										members += '</tr>';
									}
								} else {
									members += '<tr>';
									members += '<td class="text-center">1</td>';
									members += '<td>' + row.attributesMultiValues[key] + '</td>';
									members += '</tr>';
								}
							}
						}
						$('#bodyMembersForNewConsoleUser').html(members);
						getLDAPAccessRulesForNewConsoleUser(row.distinguishedName);
						
						selectedGroupdNewConsoleUser=row;
						
					} else {
						selectedGroupdNewConsoleUser=null;
						$('#bodyMembersForNewConsoleUser').html("");
						$('#olcRulesTableForNewConsoleUser').html("");
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
			false
	);
}

function btnGiveConsoleAccessToSelectedUserClicked() {
	if(selectedDN != "") {
		var roles = [];
		roles.push("ROLE_USER");
		var params = {
				"dn": selectedDN,
				"roles": roles
		};
		$.ajax({ 
			type: 'POST', 
			url: "/lider/settings/editUserRoles",
			dataType: 'json',
			data: params,
			success: function (data) { 
				$.notify("Kullanıcıya arayüz erişim yetkisi verildi.", "success");
				//get selected data and update it with new data result from service call
				getConsoleUsers();
//				$('#genericModalLarge').trigger('click');
				$(".accessDirectoryTab").click();
			},
			error: function (data, errorThrown) {
				$.notify("Kullanıcıya arayüz erişim yetkisi verilirken hata oluştu.", "error");
			}
		});
	} else {
		$.notify("Lütfen bir kullanıcı seçiniz.", "error");
		return;
	}
}

function btnDeleteConsoleUserClicked() {
	var user = [];
	
	user.push({
			distinguishedName :selectedDN, 
			type: 'USER',
		});
    $.ajax({
		type : 'POST',
		url : 'lider/user/deleteUser',
		data : JSON.stringify(user),
		dataType: "json",
		contentType: "application/json",
		success : function(ldapResult) {
			$.notify("Kullanıcı Başarı ile Silindi.",{className: 'success',position:"right top"}  );
			generateTreeForAssigningLiderConsoleUser();
		},
	    error: function (data, errorThrown) {
			$.notify("Kullanıcı Silinirken Hata Oluştu.", "error");
		}
	});  
}

function btnGiveConsoleAccessToNewUserClicked() {
	var uid=$('#uid').val();
	var cn=$('#cn').val();
	var sn=$('#sn').val();
	var mail=$('#mail').val();
	var homePostalAddress=$('#homePostalAddress').val();
	var telephoneNumber=$('#telephoneNumber').val();
	var userPassword=$('#userPassword').val();
	var confirm_password=$('#confirm_password').val();
	
	if(uid=='' || cn=='' || sn=='' || mail=='' || homePostalAddress==''	|| telephoneNumber=='' || userPassword=='' || confirm_password==''	)
	{
		$.notify("Lütfen Zorunlu alnları Doldurunuz!","warn");
		return;
	}
	var lowerCase = "abcdefghijklmnopqrstuvwxyz";
	var upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var digits = "0123456789";
	var splChars = "+=.@*!_";
	
	var ucaseFlag = contains(userPassword, upperCase);
    var lcaseFlag = contains(userPassword, lowerCase);
    var digitsFlag = contains(userPassword, digits);
    var splCharsFlag = contains(userPassword, "*");
    if (splCharsFlag) {
    	$.notify("Parola * içermemelidir.","warn");
		return;
	}
    if(userPassword.length < 6 || !ucaseFlag || !lcaseFlag || !digitsFlag){
    	$.notify("Parola en az 6 karakter olmalıdır. En az bir büyük harf, küçük harf ve sayı içermelidir.","warn");
    	return;
    }
    if(userPassword!=confirm_password){
		$.notify("Parolalar Uyuşmamaktadır.",{className: 'warn',position:"right top"}  );
		return;
	}
    var params = {
    		"parentName" :selectedDN,
			"uid" : uid,
			"cn": cn,
			"sn": sn,
			"userPassword": userPassword,
			"telephoneNumber": telephoneNumber,
			"homePostalAddress": homePostalAddress,
			"mail": mail
	};
    $.ajax({
		type : 'POST',
		url : 'lider/user/addUser',
		data : params,
		dataType : 'json',
		success : function(data) {
			$.notify("Kullanıcı Başarı ile eklendi.",{className: 'success',position:"right top"}  );
			selectedDN=data.distinguishedName;
			savedNewConsoleUser=data;
			btnGiveConsoleAccessToSelectedUserClicked();
			$(".accessDirectoryTab").click();
		},
	    error: function (data, errorThrown) {
			$.notify("Dizine erişiminiz bulunmamaktadır. Lütfen Dizin Erişiminizi Kontrol Ediniz.", "error");
		}
	});  
}

function btnEditUserRolesClicked() {
	var checkedUserRoles = [];
	$('input.cbUserRole:checkbox:checked').each(function () {
		checkedUserRoles.push($(this).attr("id"));
	});
	if(checkedUserRoles != null && checkedUserRoles.length > 0) {
		var params = {
			    "dn" : userTableSelectedEntryDN,
			    "roles": checkedUserRoles
		};
		
		$.ajax({ 
		    type: 'POST', 
		    url: "/lider/settings/editUserRoles",
		    dataType: 'json',
		    data: params,
		    success: function (data, textStatus, jqXHR) { 
		    	if(data != null) {
		    		$.notify("Kullanıcı rolleri başarıyla düzenlendi.", "success");
					users = data;
		    	} else {
		    		$.notify("Kullanıcı rolleri düzenlenirken hata oluştu. Lütfen tekrar deneyiniz.", "error");
		    	}
		    },
		    error: function (jqXHR, textStatus, errorThrown) {
		    	//if user has changed his roles.
		    	//user has is automtically logged out
		    	if(jqXHR.status == 401) {
		    		window.location.replace("/logout");
		    	} else {
		    		$.notify("Kullanıcının konsol rolleri düzenlenirken hata oluştu. Lütfen tekrar deneyiniz.", "error");
		    	}
		    },
			complete: function() {
				setConsoleUsersTable();
			}
		});
	} else {
		//all roles are unchecked so delete delete users all role
		//delete users lider console access
		btnDeleteUserClicked();
	}
}


function setRolesTable() {
	var trElement = "";
	$.each(roles, function(index, element) {
		trElement += '<tr id="role_' + index + '" onclick=showRoleDetail("role_' + index + '","' + element.name + '")><td>' + (index+1) + '</td>';
		trElement += "<td>" + element.name + "</td>";
		trElement += "<td>" + element.createDate + "</td>";
		trElement += '</tr>';
	});
	$('#existingRoles').html(trElement);
	if(roleTableSelectedRoleName != "") {
		$('#' + roleTableSelectedTrIndex).css("background-color", "#E0F3FF");
		showRoleDetail(roleTableSelectedTrIndex, roleTableSelectedRoleName);
	} else {
		$('#role_0').css("background-color", "#E0F3FF");
		showRoleDetail("role_0", roles[0].name);
	}
}

/*
 * create computer tree for selecting ou to add s new OLC Access Rule for selected entry
 */
function generateTreeForSelectingOUToAddOLCRule(treeHeadURL, treeExpandURL, treeHeaderName) {
	var treeHolderDiv='olcTreeDiv';
	var treeGridId=treeHolderDiv+"Grid";
	
	createOlcRuleSearch(treeHolderDiv,treeGridId,false);
	
	var rootEntryUUID;
	$.ajax({
		type : 'POST',
		url : treeHeadURL,
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
			 selectedAccessDN = source.localData[0].distinguishedName;
			 rootEntryUUID = source.localData[0].entryUUID;
			//create computer tree grid
			 
//			$("#olcTreeGrid").jqxTreeGrid('destroy');
//			$("#olcTreeDiv").append('<div id="olcTreeGrid"></div> ');
			
			$('#'+treeHolderDiv).append('<div id="'+treeGridId+'"></div> ')
			
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
			$('#'+treeGridId).jqxTreeGrid(
			{
				width: '100%',
				 height: 590,
				 source: dataAdapter,
//				 theme : 'fresh',
//			     altRows: true,
			     sortable: true,
			     columnsResize: true,
		         filterable: false,
			     hierarchicalCheckboxes: false,
			     pageable: true,
		         pagerMode: 'default',
			     checkboxes: false,
			     filterMode: "simple",
			     selectionMode: "singleRow",
			     localization: getLocalization(),
			     pageSize: 500,
			     pagerMode: "default",
			     pageSizeOptions: ['15', '50', '500'],
				icons: function (rowKey, dataRow) {
				var level = dataRow.level;
				if(dataRow.type == "AHENK"){
					return "img/linux.png";
				} else if(dataRow.type == "GROUP"){
					return "img/entry_group.gif";
				}
				else return "img/folder.png";
				},
				ready: function () {
					var allrows = $('#'+treeGridId).jqxTreeGrid('getRows');
					if(allrows.length==1){
						var row=allrows[0];
						if(row.childEntries==null ){
							 $('#'+treeGridId).jqxTreeGrid('addRow', row.entryUUID+"1", {}, 'last', row.entryUUID);
						}
					}
					 $('#'+treeGridId).jqxTreeGrid('collapseAll'); 
					 $('#'+treeGridId).jqxTreeGrid('selectRow', rootEntryUUID);
			    }, 
			    rendered: function () {
			   	},
			   	columns: [{ text: treeHeaderName, align: "center", dataField: "name", width: '100%' }]  	
			});
			
			 $('#'+treeGridId).on('rowSelect', function (event) {
				var args = event.args;
				var row = args.row;
				var name= row.name;
				selectedAccessDN = row.distinguishedName;
			});

			 $('#'+treeGridId).on('rowExpand', function (event) {
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
						 $('#'+treeGridId).jqxTreeGrid('deleteRow', childRowname); 
					}  
					$.ajax({
						type : 'POST',
						url : treeExpandURL,
						data : 'uid=' + row.distinguishedName + '&type=' + row.type
						+ '&name=' + row.name + '&parent=' + row.parent,
						dataType : 'text',
						success : function(ldapResult) {
							var childs = jQuery.parseJSON(ldapResult);
							for (var m = 0; m < childs.length; m++) {
								// get a row.
								var childRow = childs[m];
								if(childRow.type == "ORGANIZATIONAL_UNIT") {
									 $('#'+treeGridId).jqxTreeGrid('addRow', childRow.entryUUID, childRow, 'last', row.entryUUID);
									if(childRow.hasSubordinates=="TRUE"){
										 $('#'+treeGridId).jqxTreeGrid('addRow', childRow.entryUUID+"1" , {}, 'last', childRow.entryUUID); 
									}
									 $('#'+treeGridId).jqxTreeGrid('collapseRow', childRow.entryUUID);
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
		},
		error: function (data, errorThrown) {
			$.notify("Bilgiler getirilirken hata oluştu.", "error");
		}
	});
}

function createOlcRuleSearch(treeHolderDiv,treeGridId, showOnlyFolder) {
	var srcInputId= treeHolderDiv+"srcInput";
	var srcBtnId= treeHolderDiv+"srcBtn";
	var srcSelectId= treeHolderDiv+"srcSelect";
	var searchHtml=	 '<div class="input-group"> '+
			'    <div class="input-group-prepend">  '+
			'       <select class="form-control " style="font-family: cursive; font-size: 12px;" id="'+srcSelectId+'" > ';
	       
		   if(showOnlyFolder==false){
				searchHtml +='<option  value="uid"> ID </option> '+
						'<option selected value="cn"> Ad </option> '+ 
						'<option value="ou"> Klasör </option>';
			}
			else if(showOnlyFolder==true){
				searchHtml +='<option selected value="ou"> Klasör </option> ';
						}
			searchHtml +='</select> '+
			'    </div> '+ 
			'    <input placeholder="" id='+srcInputId+' type="text" class="form-control"> '+ 
			'    <div class="input-group-append"> '+ 
			'        <button class="btn btn-info" id="'+srcBtnId+'" > Ara </button> '+ 
			'    </div> '+ 
			' </div>  ';
		
	$('#'+treeHolderDiv).append(searchHtml)
	
	$('#'+srcBtnId).on('click', function (event) {
		var selection =$('#'+treeGridId).jqxTreeGrid('getSelection');
		
		if(selection && selection.length>0){
			var key=$('#'+srcSelectId).val()
			var value=$('#'+srcInputId).val()
			if(key == -1)
				{return}
			if(value==""){
				$.notify("Lütfen aranacak değer giriniz", "warn");
				return
			}
			var params = {
					"searchDn" : selection[0].distinguishedName,
					"key" : key,
					"value": value
			};
			$.ajax({
				type : 'POST',
				url : 'lider/ldap/searchEntry',
				data : params,
				dataType: "json",
				success : function(ldapResult) {
					if(ldapResult.length==0){
						$.notify("Sonuç Bulunamadı", "warn");
						return;
					}
					$('#'+treeGridId).jqxTreeGrid('deleteRow', "Results")
					$('#'+treeGridId).jqxTreeGrid('addRow', "Results", { name: "Arama Sonuçları" }, 'last')
					for (var i = 0; i < ldapResult.length; i++) {
				    	 var entry = ldapResult[i];
				    	 $('#'+treeGridId).jqxTreeGrid('addRow' , entry.name , entry , 'last' ,'Results');
					}
					$('#'+treeGridId).jqxTreeGrid('collapseAll');
					$('#'+treeGridId).jqxTreeGrid('expandRow', "Results");
				},
			    error: function (data, errorThrown) {
					$.notify("Hata Oluştu.", "error");
				}
			 }); 
		}
		else{
			$.notify("Lütfen Arama Dizini Seçiniz", "warn");
		}
	});
}

function contains(rootPassword, allowedChars) {
    for (i = 0; i < rootPassword.length; i++) {
            var char = rootPassword.charAt(i);
             if (allowedChars.indexOf(char) >= 0){
            	 return true;
             }
         }
     return false;
}

function showNewPassword() {
	if ($('#userPassword').attr('type') == "text") {
		$("#userPassword").attr("type","password");
		$("#newConsoleUserPasswordShowBtn").html('<i class="fas fa-eye-slash"></i>');
	} else {
		$("#userPassword").attr("type","text");
		$("#newConsoleUserPasswordShowBtn").html('<i class="fas fa-eye"></i>');
	}
}

function showNewConfirmPassword() {
	if ($('#confirm_password').attr('type') == "text") {
		$("#confirm_password").attr("type","password");
		$("#newConsoleUserConfirmPasswordShowBtn").html('<i class="fas fa-eye-slash"></i>');
	} else {
		$("#confirm_password").attr("type","text");
		$("#newConsoleUserConfirmPasswordShowBtn").html('<i class="fas fa-eye"></i>');
	}
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
				createMainTree();
				
			},
			error: function (data, errorThrown) {
				$.notify("Grup adı düzenlenirken hata oluştu.", "error");
			}
		});
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
			url: '/lider/user_groups/rename/entry',
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
				createMainTree();
				$.notify("Klasör oluşturuldu.", "success");
			},
			error: function (data, errorThrown) {
				$.notify("Klasör oluşturulurken hata oluştu.", "error");
			}
		});
	}
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
