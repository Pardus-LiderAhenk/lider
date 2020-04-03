var users;
var roles;
var menus;
var userTableSelectedTrIndex = "";
var roleTableSelectedTrIndex = "";
var roleTableSelectedRoleName = "";
var selectedDN = "";
var selectedEntryUUID = "";
var selectedName = "";
var userTableSelectedEntryDN = "";
var configuration;

$(document).ready(function () {
	$(".adSettings").hide();
	$('#cbShowADSettings').change(function() {
        if($(this).is(":checked")) {
        	$(".adSettings").show();
        } else {
        	$(".adSettings").hide();
        }
    });
	tabConsoleSettingsClicked();
});

function tabConsoleSettingsClicked() {
	getConsoleUsers();
}

function tabRoleSettingsClicked() {
	getRoles();
}

function tabLDAPSettingsClicked() {
	getConfigurationParams();
}

function tabXMPPSettingsClicked() {
	getConfigurationParams();
}

function tabFileServerSettingsClicked() {
	getConfigurationParams();
}

function tabOtherSettingsClicked() {
	getConfigurationParams();
}

function getConsoleUsers() {
	$.ajax({ 
	    type: 'GET', 
	    url: "/settings/getConsoleUsers",
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
	    url: "/settings/getRoles",
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
			getMenus();
		}
	});
}

function getMenus() {
	$.ajax({ 
	    type: 'GET', 
	    url: "/settings/getMenus",
	    dataType: 'json',
	    success: function (data, textStatus, jqXHR) { 
	    	if(data != null) {
	    		menus = data;
	    	} else {
	    		$.notify("Menü listesi getirilirken hata oluştu. Lütfen tekrar deneyiniz.", "error");
	    	}
	    },
	    error: function (jqXHR, textStatus, errorThrown) {
	    	$.notify("Menü listesi getirilirken hata oluştu. Lütfen tekrar deneyiniz.", "error");
	    },
		complete: function() {
			setRolesTable();
		}
	});
}

function setConsoleUsersTable() {
	var trElement = "";
	$.each(users, function(index, element) {
		trElement += '<tr id="user_' + index + '" onclick=showUserDetail("user_' + index + '","' + element.distinguishedName + '")><td>' + (index+1) + '</td>';
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

function btnDeleteUserClicked() {
	if(userTableSelectedEntryDN != null && userTableSelectedEntryDN != "") {
		var params = {
			    "dn": userTableSelectedEntryDN
			};
		$.ajax({ 
		    type: 'POST', 
		    url: "/settings/deleteConsoleUser",
		    dataType: 'json',
		    data: params,
		    success: function (data, textStatus, jqXHR) { 
		    	if(data != null) {
		    		$.notify("Kullanıcının konsol yetkileri başarıyla silindi.", "success");
					users = data;
					userTableSelectedTrIndex = "";
					userTableSelectedEntryDN = "";
					setConsoleUsersTable();
		    	} else {
		    		$.notify("Kullanıcının konsol yetkileri alınırken hata oluştu. Lütfen tekrar deneyiniz.", "error");
		    	}
		    },
		    error: function (jqXHR, textStatus, errorThrown) {
		    	if(jqXHR.status == 401) {
		    		window.location.replace("/logout");
		    	} else {
		    		$.notify("Kullanıcının konsol yetkileri alınırken hata oluştu. Lütfen tekrar deneyiniz.", "error");
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
				trElement += '<td class="text-center">';
				trElement += '<div class="custom-control custom-switch">';
				//if this role is assigned to selected user check this role
				if(element.attributesMultiValues["liderPrivilege"].indexOf(role.name) > -1) {
					trElement += '<input type="checkbox" class="custom-control-input cbUserRole" id="' + role.name + '" checked>';
				} else {
					trElement += '<input type="checkbox" class="custom-control-input cbUserRole" id="' + role.name + '">';
				}
				trElement += '<label class="custom-control-label" for="' + role.name + '"></label>';
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
		$('#genericModalHeader').html("Konsol Kullanıcısı Ekle");
		$('#genericModalBodyRender').html(data);
		generateTreeFroAssigningLiderConsoleUser();
	});
}

/*
 * selecting members for assinging lider console access
 */
function generateTreeFroAssigningLiderConsoleUser(){
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
			 //create user tree grid
			 createTreeToAssignConsoleAccessToUser(source);
		},
	    error: function (data, errorThrown) {
	    	$.notify("Kullanıcılar getirilirken hata oluştu.", "error");
	    }
	});
}

function createTreeToAssignConsoleAccessToUser(source) {
	$("#selectConsoleUserTreeGrid").jqxTreeGrid('destroy');
	$("#selectConsoleUserTreeDiv").append('<div id="selectConsoleUserTreeGrid"></div> ');
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
	$("#selectConsoleUserTreeGrid").jqxTreeGrid(
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
		checkboxes: false,
		selectionMode: "singleRow",
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
			var allrows =$("#selectConsoleUserTreeGrid").jqxTreeGrid('getRows');
			if(allrows.length==1){
				var row=allrows[0];
				if(row.childEntries==null ){
					$("#selectConsoleUserTreeGrid").jqxTreeGrid('addRow', row.entryUUID+"1", {}, 'last', row.entryUUID);
				}
			}
	    	$("#selectConsoleUserTreeGrid").jqxTreeGrid('collapseAll'); 
	    }, 
	    rendered: function () {
	   	},
	   	columns: [{ text: "Kullanıcılar", align: "center", dataField: "name", width: '100%' }]  	
	});

	$('#selectConsoleUserTreeGrid').on('rowExpand', function (event) {
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
				$("#selectConsoleUserTreeGrid").jqxTreeGrid('deleteRow', childRowname); 
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
						$("#selectConsoleUserTreeGrid").jqxTreeGrid('addRow', childRow.entryUUID, childRow, 'last', row.entryUUID);
						if(childRow.hasSubordinates=="TRUE"){
							$("#selectConsoleUserTreeGrid").jqxTreeGrid('addRow', childRow.entryUUID+"1" , {}, 'last', childRow.entryUUID); 
						}
						$("#selectConsoleUserTreeGrid").jqxTreeGrid('collapseRow', childRow.entryUUID);
					}
					row.expandedUser = "TRUE";
				},
			    error: function (data, errorThrown) {
			    	$.notify("Klasör bilgisi getirilirken hata oluştu.", "error");
			    }
			});
    	}
	});
	
	$('#selectConsoleUserTreeGrid').on('rowSelect', function (event) {
		var args = event.args;
		var row = args.row;
		var name= row.name;
		selectedDN = row.distinguishedName;
		selectedEntryUUID = row.entryUUID;
		selectedName = row.name;
		
		if(row.type == "ORGANIZATIONAL_UNIT") {
			$('#btnGiveConsoleAccessToSelectedUser').prop('disabled', true);
			$('#alreadyConsoleUser').html("");
		} else {
			//check if user already has role for console
			var selectedRows = $("#selectConsoleUserTreeGrid").jqxTreeGrid('getSelection');
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
				$('#alreadyConsoleUser').html("<br>Seçili kullanıcının konsol yetkisi bulunmaktadır. Lütfen başka bir kullanıcı seçiniz.");
				$('#btnGiveConsoleAccessToSelectedUser').prop('disabled', true);
			} else {
				$('#alreadyConsoleUser').html("");
				$('#btnGiveConsoleAccessToSelectedUser').prop('disabled', false);
			}
		}
	});
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
		    url: "/settings/editUserRoles",
		    dataType: 'json',
		    data: params,
		    success: function (data) { 
				$.notify("Kullanıcıya konsol erişim yetkisi verildi.", "success");
				//get selected data and update it with new data result from service call
				getConsoleUsers();
				$('#genericModal').trigger('click');
		    },
		    error: function (data, errorThrown) {
		    	$.notify("Kullanıcıya konsol erişim yetkisi verilirken hata oluştu.", "error");
		    }
		});
	} else {
		$.notify("Lütfen bir kullanıcı seçiniz.", "error");
		return;
	}
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
		    url: "/settings/editUserRoles",
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

function getConfigurationParams() {
	$.ajax({ 
	    type: 'GET', 
	    url: "/settings/configurations",
	    dataType: 'json',
	    success: function (data) { 
	    	if(data != null) {
	    		//set ldap configuration
	    		setAttributes(data);
	    		configuration = data;
	    		if((data.adDomainName != null && data.adDomainName != "") &&
	    				(data.adIpAddress != null && data.adIpAddress != "") &&
	    				(data.adAdminUserName != null && data.adAdminUserName != "") &&
	    				(data.adAdminPassword != null && data.adAdminPassword != "") &&
	    				(data.adAdminPassword != null && data.adAdminPassword != "") &&
	    				(data.adPort != null && data.adPort != "")) {
	    				$(".adSettings").show();
	    				$("#checkboxDiv").hide();
	    		} else {
    				$(".adSettings").hide();
    				$("#checkboxDiv").show();
	    		}
	    	} else {
	    		$.notify("Ayarlar getirilirken hata oluştu. Lütfen tekrar deneyiniz.", "error");
	    	}
	    },
	    error: function (data, errorThrown) {
	    	$.notify("Ayarlar getirilirken hata oluştu. Lütfen tekrar deneyiniz.", "error");
	    }
	});
}

function setAttributes(data) {
	//set LDAP configuration
	$('#ldapServerAddress').val(data.ldapServer);
	$('#ldapServerPort').val(data.ldapPort);
	$('#ldapRootDN').val(data.ldapRootDn);
	$('#ldapUserDN').val(data.ldapUsername);
	$('#ldapUserPassword').val(data.ldapPassword);
	$('#agentDN').val(data.agentLdapBaseDn);
	$('#peopleDN').val(data.userLdapBaseDn);
	$('#groupDN').val(data.groupLdapBaseDn);
	$('#computerGroupDN').val(data.ahenkGroupLdapBaseDn);
	$('#userGroupDN').val(data.userGroupLdapBaseDn);
	$('#sudoGroupDN').val(data.userLdapRolesDn);
	
	//set active directory configuration if exists
	if((data.adDomainName != null && data.adDomainName != "") &&
	    				(data.adIpAddress != null && data.adIpAddress != "") &&
	    				(data.adAdminUserName != null && data.adAdminUserName != "") &&
	    				(data.adAdminPassword != null && data.adAdminPassword != "") &&
	    				(data.adAdminPassword != null && data.adAdminPassword != "") &&
	    				(data.adPort != null && data.adPort != "")) {
		$('#adIpAddress').val(data.adIpAddress);
		$('#adPort').val(data.adPort);
		$('#adDomainName').val(data.adDomainName);
		$('#adAdminUserName').val(data.adAdminUserName);
		$('#adAdminPassword').val(data.adAdminPassword);
		$('#adHostName').val(data.adHostName);
	} 
	
	//set XMPP configuration
	$('#XMPPServerAddress').val(data.xmppHost);
	$('#XMPPServerPort').val(data.xmppPort);
	$('#XMPPUserName').val(data.xmppUsername);
	$('#XMPPUserPassword').val(data.xmppPassword);
	$('#XMPPResourceName').val(data.xmppResource);
	$('#XMPPServiceName').val(data.xmppServiceName);
	$('#XMPPRetryConnectionCount').val(data.xmppMaxRetryConnectionCount);
	$('#XMPPPacketReplayTimeout').val(data.xmppPacketReplayTimeout);
	$('#XMPPPingTimeout').val(data.xmppPingTimeout);
	
	//set file server configuration
	$('#fileTransferType').val(data.fileServerProtocol);
	$('#fileServerAddress').val(data.fileServerHost);
	$('#fileServerPort').val(data.fileServerPort);
	$('#fileServerUserName').val(data.fileServerUsername);
	$('#fileServerUserPassword').val(data.fileServerPassword);
	if(data.disableLocalUser == true) {
		$('#cbDisableLocalUser').prop("checked", true);
	} else {
		$('#cbDisableLocalUser').prop("checked", false);
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

function showRoleDetail(index, roleName) {
	roleTableSelectedRoleName = roleName;
	if(roleName == "ROLE_ADMIN") {
		$('#btnSaveMenuChangeForRole').prop('disabled', true);
		$('#btnDeleteRole').prop('disabled', true);
	} else if(roleName == "ROLE_USER") {
		$('#btnSaveMenuChangeForRole').prop('disabled', false);
		$('#btnDeleteRole').prop('disabled', true);
	}
	else {
		$('#btnDeleteRole').prop('disabled', false);
		$('#btnSaveMenuChangeForRole').prop('disabled', false);
	}
	if(roleTableSelectedTrIndex == "") {
		$('#' + index).css("background-color", "#E0F3FF");
		roleTableSelectedTrIndex = index;
		
	} else if(roleTableSelectedTrIndex != index) {
		$('#' + roleTableSelectedTrIndex).css("background-color", "");
		$('#' + index).css("background-color", "#E0F3FF");
		roleTableSelectedTrIndex = index;
	}

	$('#headerForSelectedRoleMenus').html('Seçili Role Ait Sayfalar (Rol Adı: ' + roleName + ')');
	var listElement = "";
	$.each(menus, function(index, element) {
		if(element.parentMenuPageName == "") {
			listElement += '<li class="mt-2">';
			listElement += '<div class="custom-checkbox custom-control">';
			
			//if role is allowed to see that menu check the item
			var allowed = false;
			$.each(roles, function(j, role) {
				if(role.name == roleTableSelectedRoleName) {
					if(role.menus != null && role.menus.length > 0) {
						$.each(role.menus, function(k, m) {
							if(m.menuPageName == element.menuPageName) {
								allowed = true;
							}
						});
					}
				}
			});
			if(roleName == "ROLE_ADMIN") {
				listElement += '<input type="checkbox" id="' + element.menuPageName + '" class="custom-control-input menu" checked disabled>';
			} else {
				if(allowed == true) {
					listElement += '<input type="checkbox" id="' + element.menuPageName + '" class="custom-control-input menu" checked>';
				} else {
					listElement += '<input type="checkbox" id="' + element.menuPageName + '" class="custom-control-input menu">';
				}
			}
			
			listElement += '<label class="custom-control-label" for="' + element.menuPageName + '">';
			listElement += '<b>' + element.menuName + '</b>';
			listElement += '</label>';
			listElement += '</div>';
			
			//if that menu has children add them as sub list
			var subMenuExists = false;
			$.each(menus, function(j, menu) {
				if(menu.parentMenuPageName == element.menuPageName) {
					if(subMenuExists == false) {
						listElement += '<ul class="menuList">';
						subMenuExists = true;
					}
					listElement += '<li class="mt-1">';
					listElement += '<div class="custom-checkbox custom-control">';
					
					//if role is allowed to see that menu check the item
					allowed = false;
					$.each(roles, function(t, role) {
						if(role.name == roleTableSelectedRoleName) {
							if(role.menus != null && role.menus.length > 0) {
								$.each(role.menus, function(k, m) {
									if(m.menuPageName == menu.menuPageName) {
										allowed = true;
									}
								});
							}
						}
					});
					if(roleName == "ROLE_ADMIN") {
						listElement += '<input type="checkbox" id="' + menu.menuPageName + '" class="custom-control-input menu" checked disabled>';
					} else {
						if(allowed == true) {
							listElement += '<input type="checkbox" id="' + menu.menuPageName + '" class="custom-control-input menu" checked>';
						} else {
							listElement += '<input type="checkbox" id="' + menu.menuPageName + '" class="custom-control-input menu">';
						}
					}
					listElement += '<label class="custom-control-label" for="' + menu.menuPageName + '">';
					listElement += menu.menuName;
					listElement += '</label>';
					listElement += '</div>';
					listElement += '</li>';
				}
			});

			if(subMenuExists == true) {
				listElement += '</ul>';
			}
			listElement += '</li>';
		}
	});
	$('#pageList').html(listElement);
}

function btnAddNewRoleClicked() {
	getModalContent("modals/settings/create_new_role", function content(data){
		$('#genericModalHeader').html("Yeni Rol Ekle");
		$('#genericModalBodyRender').html(data);
	});
}

function btnCreateNewRoleClicked() {
	var params = {
		    "roleName" : $('#newRoleName').val(),
		};
	$.ajax({ 
	    type: 'POST', 
	    url: "/settings/addNewRole",
	    dataType: 'json',
	    data: params,
	    success: function (data) { 
	    	if(data != null) {
	    		$.notify("Yeni rol başarıyla eklendi.", "success");
				roles = data;
				$('#genericModal').trigger('click');
				roleTableSelectedTrIndex = "";
				roleTableSelectedRoleName = "";
	    	} else {
	    		$.notify("Yeni rol eklenirken hata oluştu. Lütfen tekrar deneyiniz.", "error");
	    	}
	    },
	    error: function (data, errorThrown) {
	    	$.notify("Yeni rol eklenirken hata oluştu. Lütfen tekrar deneyiniz.", "error");
	    },
		complete: function() {
			setRolesTable();
		}
	});
}

function btnDeleteRoleClicked() {
	if(roleTableSelectedRoleName == "ROLE_ADMIN") {
		$.notify("ROLE_ADMIN rolü silinemez", "error");
	} else if(roleTableSelectedRoleName == "ROLE_USER") {
		$.notify("ROLE_USER rolü silinemez", "error");
	} else {
		var params = {
			    "roleName" : roleTableSelectedRoleName,
			};
		$.ajax({ 
		    type: 'POST', 
		    url: "/settings/deleteRole",
		    dataType: 'json',
		    data: params,
		    success: function (data) { 
		    	if(data != null) {
		    		$.notify("Rol başarıyla silindi.", "success");
					roles=data;
					roleTableSelectedTrIndex = "";
					roleTableSelectedRoleName = "";
		    	} else {
		    		$.notify("Rol silinirken hata oluştu. Lütfen tekrar deneyiniz.", "error");
		    	}
		    },
		    error: function (data, errorThrown) {
		    	$.notify("Rol silinirken hata oluştu. Lütfen tekrar deneyiniz.", "error");
		    },
			complete: function() {
				setRolesTable();
			}
		});
	}
}

function btnSaveMenuChangeForRoleClicked() {
	if(roleTableSelectedRoleName != "ROLE_ADMIN") {
		var menuPageNames = [];
		var selectedMenus = [];
		var selectedRole;
		$('input.menu:checkbox:checked').each(function () {
			menuPageNames.push($(this).attr("id"));
		});
		$.each(roles, function(index, role) {
			if(role.name == roleTableSelectedRoleName) {
				selectedRole = role;
			}
		});
		$.each(menus, function(index, menu) {
			$.each(menuPageNames, function(j, name) {
				if(menu.menuPageName == name) {
					selectedMenus.push(menu);
				}
			});
		});
		selectedRole.menus = selectedMenus;
		$.ajax({ 
		    type: 'POST', 
		    url: "/settings/saveMenusForRole",
		    data: JSON.stringify(selectedRole),
			dataType: "json",
			contentType: "application/json",
		    success: function (data) { 
		    	if(data != null) {
		    		$.notify("Role ait sayfalar başarıyla düzenlendi.", "success");
					roles=data;
		    	} else {
		    		$.notify("Rol düzenlenirken hata oluştu. Lütfen tekrar deneyiniz.", "error");
		    	}
		    },
		    error: function (data, errorThrown) {
		    	$.notify("Rol düzenlenirken hata oluştu. Lütfen tekrar deneyiniz.", "error");
		    },
			complete: function() {
				setRolesTable();
			}
		});
	} else {
		$.notify("Admin kullanıcısı düzenlenemez", "error");
	}
}

function removeDisableClass(type) {
	if(type == 'ldap') {
		//remove disabled attribute from editableLDAP class
		$('.editableLDAP').prop('disabled', false);
		$('.editableAD').prop('disabled', false);
		//change button name and onClick event to save
		 $("#editLDAPAttributes").html("Değişiklikleri Kaydet");
		 $("#editLDAPAttributes").attr("onclick","saveChanges('ldap')");
	} else if(type == 'xmpp') {
		//remove disabled attribute from editableXMPP class
		$('.editableXMPP').prop('disabled', false);
		//change button name and onClick event to save
		 $("#editXMPPAttributes").html("Değişiklikleri Kaydet");
		 $("#editXMPPAttributes").attr("onclick","saveChanges('xmpp')");
	} else if(type == 'fileServer') {
		//remove disabled attribute from editableFileServer class
		$('.editableFileServer').prop('disabled', false);
		//change button name and onClick event to save
		 $("#editFileServerAttributes").html("Değişiklikleri Kaydet");
		 $("#editFileServerAttributes").attr("onclick","saveChanges('fileServer')");
	}  else if(type == 'otherSettings') {
		//remove disabled attribute from editableFileServer class
		$('.editableOtherSettings').prop('disabled', false);
		//change button name and onClick event to save
		 $("#editOtherSettings").html("Değişiklikleri Kaydet");
		 $("#editOtherSettings").attr("onclick","saveChanges('otherSettings')");
	}
}

function saveChanges(type) {
	if(type == 'ldap') {
		if($('#ldapServerAddress').val() != ""
				&& $('#ldapServerPort').val() != ""
				&& $('#ldapUserDN').val() != ""
				&& $('#ldapUserPassword').val() != "" ) {
			var params = {
				    "ldapServer" : $('#ldapServerAddress').val(),
				    "ldapPort": $('#ldapServerPort').val(),
				    "ldapUsername": $('#ldapUserDN').val(),
				    "ldapPassword": $('#ldapUserPassword').val(),
				    "adIpAddress": $('#adIpAddress').val(),
				    "adPort": $('#adPort').val(),
				    "adDomainName": $('#adDomainName').val(),
				    "adAdminUserName": $('#adAdminUserName').val(),
				    "adAdminPassword": $('#adAdminPassword').val(),
				    "adHostName": $('#adHostName').val()
				};
			$.ajax({ 
			    type: 'POST', 
			    url: "/settings/update/ldap",
			    dataType: 'json',
			    data: params,
			    success: function (data) { 
			    	if(data != null) {
			    		$.notify("LDAP sunucu bilgileri başarıyla güncellendi. Şimdi tekrar giriş yapabilmeniz için giriş ekranına yönlendirileceksiniz.", "success");
			    		//redirect to login
			    		setTimeout( function() 
		   					{
		   						window.location.replace("/logout");
		   					}, 1000);
			    		
			    	} else {
			    		$.notify("LDAP sunucu bilgileri güncellenirken hata oluştu. Lütfen tekrar deneyiniz.", "error");
			    	}
			    },
			    error: function (data, errorThrown) {
			    	$.notify("LDAP sunucu bilgileri güncellenirken hata oluştu. Lütfen tekrar deneyiniz.", "error");
			    }
			});
		} else {
			$.notify("Lütfen boş alanları doldurunuz.", "error");
		}

	} else if(type == 'xmpp') {
		var params = {
				"xmppHost": $('#XMPPServerAddress').val(),
				"xmppPort": $('#XMPPServerPort').val(),
				"xmppUsername": $('#XMPPUserName').val(),
				"xmppPassword": $('#XMPPUserPassword').val(),
				"xmppMaxRetryConnectionCount": $('#XMPPRetryConnectionCount').val(),
				"xmppPacketReplayTimeout": $('#XMPPPacketReplayTimeout').val(),
				"xmppPingTimeout": $('#XMPPPingTimeout').val()
			};
		$.ajax({ 
		    type: 'POST', 
		    url: "/settings/update/xmpp",
		    dataType: 'json',
		    data: params,
		    success: function (data) { 
		    	if(data != null) {
		    		$.notify("XMPP sunucu bilgileri başarıyla güncellendi.", "success");
		    	} else {
		    		$.notify("XMPP sunucu bilgileri güncellenirken hata oluştu. Lütfen tekrar deneyiniz.", "error");
		    	}
		    },
		    error: function (data, errorThrown) {
		    	$.notify("XMPP sunucu bilgileri güncellenirken hata oluştu. Lütfen tekrar deneyiniz.", "error");
		    }
		});
	} else if(type == 'fileServer') {
		var params = {
				"fileTransferType": $('#fileTransferType').val(),
				"fileServerAddress": $('#fileServerAddress').val(),
				"fileServerUsername": $('#fileServerUserName').val(),
				"fileServerPassword": $('#fileServerUserPassword').val(),
				"fileServerPort": $('#fileServerPort').val()
			};
		$.ajax({ 
		    type: 'POST', 
		    url: "/settings/update/fileServer",
		    dataType: 'json',
		    data: params,
		    success: function (data) { 
		    	if(data != null) {
		    		$.notify("Dosya sunucusu bilgileri başarıyla güncellendi.", "success");
		    	} else {
		    		$.notify("Dosya sunucusu bilgileri güncellenirken hata oluştu. Lütfen tekrar deneyiniz.", "error");
		    	}
		    },
		    error: function (data, errorThrown) {
		    	$.notify("Dosya sunucusu bilgileri güncellenirken hata oluştu. Lütfen tekrar deneyiniz.", "error");
		    }
		});
	} else if(type == 'otherSettings') {
		var params = {
				"disableLocalUser": $('#cbDisableLocalUser').is(':checked')
			};
		$.ajax({ 
		    type: 'POST', 
		    url: "/settings/update/otherSettings",
		    dataType: 'json',
		    data: params,
		    success: function (data) { 
		    	if(data != null) {
		    		$.notify("Ayarlar başarıyla güncellendi.", "success");
		    	} else {
		    		$.notify("Ayarlar güncellenirken güncellenirken hata oluştu. Lütfen tekrar deneyiniz.", "error");
		    	}
		    },
		    error: function (data, errorThrown) {
		    	$.notify("Ayarlar güncellenirken hata oluştu. Lütfen tekrar deneyiniz.", "error");
		    }
		});
	}
}