var users;
var roles;
var rules;
var userTableSelectedTrIndex = "";
var roleTableSelectedTrIndex = "";
var roleTableSelectedRoleName = "";
var configuration;

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
	
	tabLDAPSettingsClicked();
	
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

function tabEmailSettingsClicked() {
	getConfigurationParams();
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
		$('#adUseSSL').val(data.adUseSSL.toString());
		$('#adUseTLS').val(data.adUseTLS.toString());
		$('#adAllowSelfSignedCert').val(data.adAllowSelfSignedCert.toString());
		
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
				    "adHostName": $('#adHostName').val(),
					"adUseSSL": $('#adUseSSL').val(),
					"adUseTLS": $('#adUseTLS').val(),
					"adAllowSelfSignedCert": $('#adAllowSelfSignedCert').val(),
				};
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




