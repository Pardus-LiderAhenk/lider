var users;
var roles;
var rules;
var userTableSelectedTrIndex = "";
var roleTableSelectedTrIndex = "";
var roleTableSelectedRoleName = "";

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
	
	
$(document).ready(function () {
	$(".adSettings").hide();
	$('#labelSelectOneUserGroupAlert').hide();
	$('#operationDropDownDiv').hide();
	$('#olcRulesTableDiv').hide();
	$('#groupMembersHeaderDiv').hide();
	$('#groupMembersDiv').hide();
	$('#saveLDAPServerSettingsBtnDiv').hide();
	$('#saveFileServerSettingsBtnDiv').hide();
	$('#saveXMPPServerSettingsBtnDiv').hide();
	$('#saveEmailSettingsBtnDiv').hide();
	
	$('#cbShowADSettings').change(function() {
        if($(this).is(":checked")) {
        	$(".adSettings").show();
        } else {
        	$(".adSettings").hide();
        }
    });
	tabConsoleSettingsClicked();
	
	$('#fileServerForm').validate({
	    rules: {
	      fileServerAddress: {
	        required: true,
	      },
	      fileServerPort: {
		    required: true,
		  },
		  fileServerUserName: {
		    required: true,
		  },
		  fileServerUserPassword: {
		    required: true,
		  },
		  fileServerAgentFilePath: {
		    required: true,
		  },
	      
	    },
	    messages: {
	      fileServerAddress: {
	        required: "Lütfen dosya sunucu adresi giriniz.",
	      },
	      fileServerPort: {
	        required: "Lütfen sunucu portunu giriniz.",
	      },
	      fileServerUserName: {
	        required: "Lütfen sunucu kullanıcı adını giriniz.",
	      },
	      fileServerUserPassword: {
	        required: "Lütfen sunucu şifresini giriniz.",
	      },
	      fileServerAgentFilePath: {
	        required: "Lütfen ajan dizinini giriniz.",
	      },
	    },
	    errorElement: 'span',
	    errorPlacement: function (error, element) {
	      error.addClass('invalid-feedback');
	      element.closest('.form-error-message').append(error);
	    },
	    highlight: function (element, errorClass, validClass) {
	      $(element).addClass('is-invalid');
	    },
	    unhighlight: function (element, errorClass, validClass) {
	      $(element).removeClass('is-invalid');
	    },
	    submitHandler: function() { 
	    	saveChanges('fileServer');
	    }
	  });
	
	$('#XMPPServerForm').validate({
	    rules: {
	      XMPPServerAddress: {
	        required: true,
	      },
	      XMPPServerPort: {
		    required: true,
		  },
		  XMPPUserName: {
		    required: true,
		  },
		  XMPPUserPassword: {
		    required: true,
		  },
		  XMPPResourceName: {
		    required: true,
		  },
		  
		  XMPPRetryConnectionCount: {
		    required: true,
		  },
		  XMPPPacketReplayTimeout: {
		    required: true,
		  },
		  XMPPPingTimeout: {
		    required: true,
		  },
	      
	    },
	    messages: {
	      XMPPServerAddress: {
	        required: "Lütfen XMPP sunucu adresi giriniz.",
	      },
	      XMPPServerPort: {
	        required: "Lütfen XMPP portunu giriniz.",
	      },
	      XMPPUserName: {
	        required: "Lütfen XMPP kullanıcı adını giriniz.",
	      },
	      XMPPUserPassword: {
	        required: "Lütfen XMPP şifresini giriniz.",
	      },
	      XMPPResourceName: {
	        required: "Lütfen XMPP kaynak adını giriniz.",
	      },
	      
	      XMPPRetryConnectionCount: {
	        required: "Lütfen XMPP tekrar bağlantı sayısını giriniz.",
	      },
	      XMPPPacketReplayTimeout: {
	        required: "Lütfen XMPP tekrarlama zaman aşımını giriniz",
	      },
	      XMPPPingTimeout: {
	        required: "Lütfen XMPP ping zaman aşımını giriniz",
	      },
	    },
	    errorElement: 'span',
	    errorPlacement: function (error, element) {
	      error.addClass('invalid-feedback');
	      element.closest('.form-error-message').append(error);
	    },
	    highlight: function (element, errorClass, validClass) {
	      $(element).addClass('is-invalid');
	    },
	    unhighlight: function (element, errorClass, validClass) {
	      $(element).removeClass('is-invalid');
	    },
	    submitHandler: function() { 
	    	saveChanges('xmpp');
	    }
	  });

	$('#ldapServerForm').validate({
	    rules: {
	      ldapServerAddress: {
	        required: true,
	      },
	      ldapServerPort: {
		    required: true,
		  },
		  ldapRootDN: {
		    required: true,
		  },
		  ldapUserDN: {
		    required: true,
		  },
		  ldapUserPassword: {
		    required: true,
		  },
		  agentDN: {
		    required: true,
		  },
		  peopleDN: {
		    required: true,
		  },
		  groupDN: {
		    required: true,
		  },
		  computerGroupDN: {
	        required: true,
	      },
	      userGroupDN: {
		    required: true,
		  },
		  sudoGroupDN: {
		    required: true,
		  },
		  cbShowADSettings: {
		    required: false,
		  },
		  
		  adIpAddress: {
		    required: "#cbShowADSettings:checked",
		  },
		  adPort: {
		    required: "#cbShowADSettings:checked",
		  },
		  adDomainName: {
		    required: "#cbShowADSettings:checked",
		  },
		  adAdminUserName: {
		    required: "#cbShowADSettings:checked",
		  },
		  adAdminUserFullDN: {
		    required: "#cbShowADSettings:checked",
		  },
		  adAdminPassword: {
		    required: "#cbShowADSettings:checked",
		  },
		  adHostName: {
		    required: "#cbShowADSettings:checked",
		  },

	      
	    },
	    messages: {
	      ldapServerAddress: {
	        required: "Lütfen LDAP sunucu adresi giriniz.",
	      },
	      ldapServerPort: {
	        required: "Lütfen LDAP portunu giriniz.",
	      },
	      ldapRootDN: {
	        required: "Lütfen domain adını giriniz.",
	      },
	      ldapUserDN: {
	        required: "Lütfen LDAP kullanıcı DN'ini giriniz.",
	      },
	      ldapUserPassword: {
	        required: "Lütfen LDAP kullanıcı şifresini giriniz.",
	      },
	      agentDN: {
	        required: "Lütfen LDAP ahenk klasörünü giriniz.",
	      },
	      peopleDN: {
	        required: "Lütfen LDAP kullanıcı klasörünü giriniz",
	      },
	      groupDN: {
	        required: "Lütfen LDAP grup klasörünü giriniz",
	      },
	      computerGroupDN: {
	        required: "Lütfen LDAP ahenk grubu klasörünü giriniz.",
	      },
	      userGroupDN: {
	        required: "Lütfen LDAP kullanıcı grubu klasörünü giriniz",
	      },
	      sudoGroupDN: {
	        required: "Lütfen LDAP yetki(Sudo) grubu klasörünü giriniz",
	      },
	      
	      adIpAddress: {
	        required: "Lütfen sunucu adresi giriniz",
	      },
	      adPort: {
	        required: "Lütfen sunucu portunu giriniz",
	      },
	      adDomainName: {
	        required: "Lütfen domain adınıgiriniz",
	      },
	      adAdminUserName: {
	        required: "Lütfen yönetici adını giriniz",
	      },
	      adAdminUserFullDN: {
	        required: "Lütfen yönetici tam DN'inin giriniz",
	      },
	      adAdminPassword: {
	        required: "Lütfen yönetici şifresini giriniz",
	      },
	      adHostName: {
	        required: "Lütfen host adresini giriniz",
	      },
	    },
	    errorElement: 'span',
	    errorPlacement: function (error, element) {
	      error.addClass('invalid-feedback');
	      element.closest('.form-error-message').append(error);
	    },
	    highlight: function (element, errorClass, validClass) {
	      $(element).addClass('is-invalid');
	    },
	    unhighlight: function (element, errorClass, validClass) {
	      $(element).removeClass('is-invalid');
	    },
	    submitHandler: function() { 
	    	saveChanges('ldap');
	    }
	  });

	$('#emailSettingsForm').validate({
	    rules: {
	      emailHost: {
	        required: true,
	      },
	      emailPort: {
		    required: true,
		  },
		  emailUsername: {
		    required: true,
			email: true
		  },
		  emailPassword: {
		    required: true,
		  }
	    },
	    messages: {
	      emailHost: {
	        required: "Lütfen email sunucu adresini giriniz.",
	      },
	      emailPort: {
	        required: "Lütfen email sunucu portunu giriniz.",
	      },
	      emailUsername: {
	        required: "Lütfen email kullanıcı adını giriniz.",
			email: "Lütfen geçerli bir email adresi giriniz."
	      },
	      emailPassword: {
	        required: "Lütfen email şifresini giriniz.",
	      }
	    },
	    errorElement: 'span',
	    errorPlacement: function (error, element) {
	      error.addClass('invalid-feedback');
	      element.closest('.form-error-message').append(error);
	    },
	    highlight: function (element, errorClass, validClass) {
	      $(element).addClass('is-invalid');
	    },
	    unhighlight: function (element, errorClass, validClass) {
	      $(element).removeClass('is-invalid');
	    },
	    submitHandler: function() {
	    	saveChanges('emailSettings');
	    }
	  });
});

function tabConsoleSettingsClicked() {
	getConsoleUsers();
}

function tabLDAPSettingsClicked() {
	getConfigurationParams();
}

function tabLDAPAccessRulesClicked() {
	createMainTree();
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

function tabEmailSettingsClicked() {
	getConfigurationParams();
}

function dropdownButtonClicked(operation) {
	if(operation == "addOLCRulesToComputersTree") {
		getModalContent("modals/settings/select_entry_from_tree_for_olc", function content(data){
			$('#genericModalHeader').html("Erişim Yetkisi Ekleme");
			$('#genericModalBodyRender').html(data);
			$('#olcAccessInfoAlert').html('<b>"' + selectedDNOfUserGroupsTree + '"</b> grubunun tüm üyeleri seçeceğiniz klasör ve bu klasörün altındaki tüm klasör ve kayıtlara erişim sağlayacaktır');
			generateTreeForSelectingOUToAddOLCRule('lider/computer/getComputers', 'lider/computer/getOuDetails', 'Bilgisayarlar');
		});
	} else if(operation == "addOLCRulesToUsersTree") {
		getModalContent("modals/settings/select_entry_from_tree_for_olc", function content(data){
			$('#genericModalHeader').html("Erişim Yetkisi Ekleme");
			$('#genericModalBodyRender').html(data);
			$('#olcAccessInfoAlert').html('<b>"' + selectedDNOfUserGroupsTree + '"</b> grubunun tüm üyeleri seçeceğiniz klasör ve bu klasörün altındaki tüm klasör ve kayıtlara erişim sağlayacaktır');
			generateTreeForSelectingOUToAddOLCRule('lider/user/getUsers', 'lider/user/getOuDetails', 'Kullanıcılar');
		});
	} else if(operation == "addOLCRulesToComputerGroupsTree") {
		getModalContent("modals/settings/select_entry_from_tree_for_olc", function content(data){
			$('#genericModalHeader').html("Erişim Yetkisi Ekleme");
			$('#genericModalBodyRender').html(data);
			$('#olcAccessInfoAlert').html('<b>"' + selectedDNOfUserGroupsTree + '"</b> grubunun tüm üyeleri seçeceğiniz klasör ve bu klasörün altındaki tüm klasör ve kayıtlara erişim sağlayacaktır');
			generateTreeForSelectingOUToAddOLCRule('lider/computer_groups/getGroups', 'lider/computer_groups/getOuDetails', 'İstemci Grupları');
		});
	} else if(operation == "addOLCRulesToUserGroupsTree") {
		getModalContent("modals/settings/select_entry_from_tree_for_olc", function content(data){
			$('#genericModalHeader').html("Erişim Yetkisi Ekleme");
			$('#genericModalBodyRender').html(data);
			$('#olcAccessInfoAlert').html('<b>"' + selectedDNOfUserGroupsTree + '"</b> grubunun tüm üyeleri seçeceğiniz klasör ve bu klasörün altındaki tüm klasör ve kayıtlara erişim sağlayacaktır');
			generateTreeForSelectingOUToAddOLCRule('lider/user_groups/getGroups', 'lider/user_groups/getOuDetails', 'Kullanıcı Grupları');
		});
	} else if(operation == "addOLCRulesToRoleGroupsTree") {
		getModalContent("modals/settings/select_entry_from_tree_for_olc", function content(data){
			$('#genericModalHeader').html("Erişim Yetkisi Ekleme");
			$('#genericModalBodyRender').html(data);
			$('#olcAccessInfoAlert').html('<b>"' + selectedDNOfUserGroupsTree + '"</b> grubunun tüm üyeleri seçeceğiniz klasör ve bu klasörün altındaki tüm klasör ve kayıtlara erişim sağlayacaktır');
			generateTreeForSelectingOUToAddOLCRule('lider/sudo_groups/getGroups', 'lider/sudo_groups/getOuDetails', 'Rol Grupları');
		});
	}
}


/*
 * create user groups tree to assign LDAP OLC access rules.
 */
function createMainTree() {
	$("#treeGridUserGroups").jqxTreeGrid('destroy');
	$("#treeGridUserGroupsDiv").append('<div id="treeGridUserGroups"></div> ');
	$.ajax({
		type : 'GET',
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
			rootDNOfUserGroupsTree = source.localData[0].distinguishedName;
			selectedEntryUUIDOfUserGroupsTree = source.localData[0].entryUUID;
			rootEntryUUIDOfUserGroupsTree = source.localData[0].entryUUID;
			var dataAdapter = new $.jqx.dataAdapter(source, {
			});

			var getLocalization = function () {
				var localizationobj = {};
				localizationobj.filterSearchString = "Ara :";
				return localizationobj;
			};

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
					$("#treeGridUserGroups").jqxTreeGrid('selectRow', selectedEntryUUIDOfUserGroupsTree);
				},
				columns: [
					{ text: "Kullanıcı Grup Ağacı", align: "center", dataField: "name", width: '100%'}
					]
			});
		},
	    error: function (data, errorThrown) {
	    	$.notify("Grup bilgileri getirilirken hata oluştu.", "error");
	    }
	});
	
	$('#treeGridUserGroups').on('rowExpand', function (event) {
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
				$("#treeGridUserGroups").jqxTreeGrid('deleteRow', childRowname); 
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
						$("#treeGridUserGroups").jqxTreeGrid('addRow', childRow.entryUUID, childRow, 'last', row.entryUUID);
						if(childRow.hasSubordinates=="TRUE"){
							$("#treeGridUserGroups").jqxTreeGrid('addRow', childRow.entryUUID+"1" , {}, 'last', childRow.entryUUID); 
						}
						$("#treeGridUserGroups").jqxTreeGrid('collapseRow', childRow.entryUUID);
					} 
					row.expandedUser = "TRUE";
				},
			    error: function (data, errorThrown) {
			    	$.notify("Grup bilgileri getirilirken hata oluştu.", "error");
			    }
			});  
		}
	}); 
	
	$('#treeGridUserGroups').on('rowSelect', function (event) {
		var args = event.args;
		var row = args.row;
		var name= row.name;
		selectedDNOfUserGroupsTree = row.distinguishedName;
		selectedEntryUUIDOfUserGroupsTree = row.entryUUID;
		selectedNameOfUserGroupsTree = row.name;
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

	});
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
			    			trElement += '<td class="text-center">';
			    			trElement += '<button onclick="deleteOLCAccessRule(\'' + index + '\')" ' +
			    					'class="btn-icon btn-icon-only btn btn-outline-danger"><i class="pe-7s-trash btn-icon-wrapper"> </i></button>';
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
				if(element.attributesMultiValues["liderPrivilege"].indexOf(role.value) > -1) {
					trElement += '<input type="checkbox" class="custom-control-input cbUserRole" id="' + role.value + '" checked>';
				} else {
					trElement += '<input type="checkbox" class="custom-control-input cbUserRole" id="' + role.value + '">';
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
		$('#genericModalHeader').html("Konsol Kullanıcısı Ekle");
		$('#genericModalBodyRender').html(data);
		generateTreeForAssigningLiderConsoleUser();
	});
}

/*
 * selecting members for assinging lider console access
 */
function generateTreeForAssigningLiderConsoleUser(){
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
				url : 'lider/user/getOuDetails',
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
		    url: "/lider/settings/editUserRoles",
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

function getConfigurationParams() {
	$.ajax({ 
	    type: 'GET', 
	    url: "/lider/settings/configurations",
	    dataType: 'json',
	    success: function (data) { 
	    	if(data != null) {
	    		//set ldap configuration
	    		setAttributes(data);
	    		configuration = data;
	    		if((data.adDomainName != null && data.adDomainName != "") &&
	    				(data.adIpAddress != null && data.adIpAddress != "") &&
	    				(data.adAdminUserName != null && data.adAdminUserName != "") &&
	    				(data.adAdminUserFullDN != null && data.adAdminUserFullDN != "") &&
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
	    				(data.adAdminUserFullDN != null && data.adAdminUserFullDN != "") &&
	    				(data.adAdminPassword != null && data.adAdminPassword != "") &&
	    				(data.adPort != null && data.adPort != "")) {
		$('#adIpAddress').val(data.adIpAddress);
		$('#adPort').val(data.adPort);
		$('#adDomainName').val(data.adDomainName);
		$('#adAdminUserName').val(data.adAdminUserName);
		$('#adAdminUserFullDN').val(data.adAdminUserFullDN);
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
	$('#fileServerAgentFilePath').val(data.fileServerAgentFilePath);
	
	if(data.disableLocalUser == true) {
		$('#cbDisableLocalUser').prop("checked", true);
	} else {
		$('#cbDisableLocalUser').prop("checked", false);
	}
	
	if(data.domainType == null) {
		$("#domainTypeLDAP").prop("checked", true);
	} else {
		if(data.domainType == "LDAP") {
			$("#domainTypeLDAP").prop("checked", true);
		} else if(data.domainType == "ACTIVE_DIRECTORY") {
			$("#domainTypeAD").prop("checked", true);
		} else if(data.domainType == "NONE") {
			$("#domainTypeNone").prop("checked", true);
		} else {
			$("#domainTypeLDAP").prop("checked", true);
		}
	}
	
	$('#ahenkRepoAddress').val(data.ahenkRepoAddress);
	$('#ahenkRepoKeyAddress').val(data.ahenkRepoKeyAddress);
	
	$('#emailHost').val(data.mailHost);
	$('#emailPort').val(data.mailSmtpPort);
	$('#emailUsername').val(data.mailAddress);
	$('#emailPassword').val(data.mailPassword);
	if(data.mailSmtpAuth != null) {
		$('#smtpAuth').val(data.mailSmtpAuth.toString());
	}
	if(data.mailSmtpStartTlsEnable != null) {
		$('#tlsEnabled').val(data.mailSmtpStartTlsEnable.toString());
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

function removeDisableClass(type) {
	if(type == 'ldap') {
		//remove disabled attribute from editableLDAP class
		$('.editableLDAP').prop('disabled', false);
		$('.editableAD').prop('disabled', false);
		//change button name and onClick event to save
		 $("#editLDAPAttributes").html("Değişiklikleri Kaydet");
		 $("#editLDAPAttributes").attr("onclick","saveChanges('ldap')");
		 
		$('#editLDAPServerSettingsBtnDiv').hide();
		$('#saveLDAPServerSettingsBtnDiv').show();
	} else if(type == 'xmpp') {
		//remove disabled attribute from editableXMPP class
		$('.editableXMPP').prop('disabled', false);
		//change button name and onClick event to save
		$('#editXMPPServerSettingsBtnDiv').hide();
		$('#saveXMPPServerSettingsBtnDiv').show();
	} else if(type == 'fileServer') {
		//remove disabled attribute from editableFileServer class
		$('.editableFileServer').prop('disabled', false);
		//change button name and onClick event to save
		$('#editFileServerSettingsBtnDiv').hide();
		$('#saveFileServerSettingsBtnDiv').show();
	}  else if(type == 'otherSettings') {
		//remove disabled attribute from otherSettings class
		$('.editableOtherSettings').prop('disabled', false);
		//change button name and onClick event to save
		 $("#editOtherSettings").html("Değişiklikleri Kaydet");
		 $("#editOtherSettings").attr("onclick","saveChanges('otherSettings')");
	} else if(type == 'emailSettings') {
		//remove disabled attribute from editableEmailSettings class
		$('.editableEmailSettings').prop('disabled', false);
		//change button name and onClick event to save
		$('#editEmailSettingsBtnDiv').hide();
		$('#saveEmailSettingsBtnDiv').show();
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
				    "adAdminUserFullDN": $('#adAdminUserFullDN').val(),
				    "adAdminPassword": $('#adAdminPassword').val(),
				    "adHostName": $('#adHostName').val()
				};
			console.log(params);
			$.ajax({ 
			    type: 'POST', 
			    url: "/lider/settings/update/ldap",
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
		    url: "/lider/settings/update/xmpp",
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
				"fileServerAgentFilePath": $('#fileServerAgentFilePath').val(),
				"fileServerPort": $('#fileServerPort').val()
			};
		$.ajax({ 
		    type: 'POST', 
		    url: "/lider/settings/update/fileServer",
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
	} else if(type == 'emailSettings') {
		var params = {
				"emailHost": $('#emailHost').val(),
				"emailPort": $('#emailPort').val(),
				"emailUsername": $('#emailUsername').val(),
				"emailPassword": $('#emailPassword').val(),
				"smtpAuth": $('#smtpAuth').val(),
				"tlsEnabled": $('#tlsEnabled').val(),
			};
		$.ajax({ 
		    type: 'POST', 
		    url: "/lider/settings/update/emailSettings",
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
	} else if(type == 'otherSettings') {
		var params = {
				"disableLocalUser": $('#cbDisableLocalUser').is(':checked'),
				"domainType": $("input[name='domainType']:checked").val(),
				"ahenkRepoAddress": $('#ahenkRepoAddress').val(),
				"ahenkRepoKeyAddress": $('#ahenkRepoKeyAddress').val()
			};
		$.ajax({ 
		    type: 'POST', 
		    url: "/lider/settings/update/otherSettings",
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

/*
 * create computer tree for selecting ou to add s new OLC Access Rule for selected entry
 */
function generateTreeForSelectingOUToAddOLCRule(treeHeadURL, treeExpandURL, treeHeaderName) {
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
			$("#olcTreeGrid").jqxTreeGrid('destroy');
			$("#olcTreeDiv").append('<div id="olcTreeGrid"></div> ');
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
			$("#olcTreeGrid").jqxTreeGrid(
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
				filterMode: "simple",
				selectionMode: "singleRow",
				localization: getLocalization(),
				pageSize: 50,
				pageSizeOptions: ['15', '25', '50'],
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
					var allrows =$("#olcTreeGrid").jqxTreeGrid('getRows');
					if(allrows.length==1){
						var row=allrows[0];
						if(row.childEntries==null ){
							$("#olcTreeGrid").jqxTreeGrid('addRow', row.entryUUID+"1", {}, 'last', row.entryUUID);
						}
					}
			    	$("#olcTreeGrid").jqxTreeGrid('collapseAll'); 
			    	$("#olcTreeGrid").jqxTreeGrid('selectRow', rootEntryUUID);
			    }, 
			    rendered: function () {
			   	},
			   	columns: [{ text: treeHeaderName, align: "center", dataField: "name", width: '100%' }]  	
			});
			
			$('#olcTreeGrid').on('rowSelect', function (event) {
				var args = event.args;
				var row = args.row;
				var name= row.name;
				selectedAccessDN = row.distinguishedName;
			});

			$('#olcTreeGrid').on('rowExpand', function (event) {
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
						$("#olcTreeGrid").jqxTreeGrid('deleteRow', childRowname); 
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
									$("#olcTreeGrid").jqxTreeGrid('addRow', childRow.entryUUID, childRow, 'last', row.entryUUID);
									if(childRow.hasSubordinates=="TRUE"){
										$("#olcTreeGrid").jqxTreeGrid('addRow', childRow.entryUUID+"1" , {}, 'last', childRow.entryUUID); 
									}
									$("#olcTreeGrid").jqxTreeGrid('collapseRow', childRow.entryUUID);
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



