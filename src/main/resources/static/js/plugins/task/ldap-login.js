/**
 *  ldap-login
 *  This page authentication to OpenLDAP or Active Directory and cancel authentication from directory manager
 *  Tuncay ÇOLAK
 *  tuncay.colak@tubitak.gov.tr

 *  http://www.liderahenk.org/ 
 */

if (ref_ldap_login) {
	connection.deleteHandler(ref_ldap_login);
}
var scheduledParamLdapLogin = null;
var scheduledModalLdapLoginOpened = false;
var pluginTask_LdapLogin = null;
var dnlist=[];
var directoryData = null; 
var ref_ldap_login=connection.addHandler(ldapLoginListener, null, 'message', null, null,  null);

$("#openLdapInfo").hide();
$("#activeDirectoryInfo").hide();
if(selectedEntries){
	for (var i = 0; i < selectedEntries.length; i++) {
		dnlist.push(selectedEntries[i].distinguishedName);
	}
}
for (var n = 0; n < pluginTaskList.length; n++) {
	var pluginTask=pluginTaskList[n];
	if (pluginTask.page == 'ldap-login') {
		pluginTask_LdapLogin=pluginTask;
	}
}
getDirectoryParams();

function getDirectoryParams() {
	$.ajax({ 
		type: 'GET', 
		url: "ldap_login/configurations",
		dataType: 'json',
		success: function (data) { 
			if(data != null) {
				directoryData = data;
//				setDirectoryParams(data);
			} else {
				$.notify("Ayarlar getirilirken hata oluştu. Lütfen tekrar deneyiniz.", "error");
			}
		},
		error: function (data, errorThrown) {
			$.notify("Ayarlar getirilirken hata oluştu. Lütfen tekrar deneyiniz.", "error");
		}
	});
}

function setDirectoryParams() {
//	OpenLDAP parameters
	$('#openLdapServerAddrInfo').val(directoryData.ldapServer);
	$('#openLdapBaseDnInfo').val(directoryData.ldapRootDn);

//	Active Directory parameters
	$('#adServerAddrInfo').val(directoryData.adIpAddress);
	$('#adDomainNameInfo').val(directoryData.adDomainName);
	$('#adHostnameInfo').val(directoryData.adHostName);
	$('#adUsernameInfo').val(directoryData.adAdminUserName);
//	$('#adUserPasswordInfo').val(directoryData.adAdminPassword);
	$('#adPortInfo').val(directoryData.adPort);
}

function sendLdapLogin(params) {
	var content = "Görev Gönderilecek, emin misiniz?";
	if (scheduledParamLdapLogin != null) {
		content = "Zamanlanmış görev gönderilecek, emin misiniz?";
	}
	$.confirm({
		title: 'Uyarı!',
		content: content,
		theme: 'light',
		buttons: {
			Evet: function () {
				var message = "Görev başarı ile gönderildi.. Lütfen bekleyiniz...";
				if (scheduledParamLdapLogin != null) {
					message = "Zamanlanmış görev başarı ile gönderildi. Zamanlanmış görev parametreleri:  "+ scheduledParamLdapLogin;
				}

				if (selectedEntries[0].type == "AHENK" && selectedRow.online == true && scheduledParamLdapLogin == null) {
					progress("divLdapLogin","progressLdapLogin",'show');
				}
				if (selectedEntries[0].type == "AHENK" && selectedRow.online == false) {
					$.notify("Görev başarı ile gönderildi, istemci çevrimiçi olduğunda uygulanacaktır.", "success");
				}
				if (selectedEntries[0].type == "GROUP") {
					var groupNotify = "Görev istemci grubuna başarı ile gönderildi.";
					if (scheduledParamLdapLogin != null) {
						groupNotify = "Zamanlanmış görev istemci grubuna başarı ile gönderildi.";
					}
					$.notify(groupNotify, "success");
				}

				changeUserDirectoryDomain();

				$.ajax({
					type: "POST",
					url: "/lider/task/execute",
					headers: {
						'Content-Type':'application/json',
					}, 
					data: params,
					contentType: "application/json",
					dataType: "json",
					converters: {
						'text json': true
					}, 
					success: function(result) {
						var res = jQuery.parseJSON(result);
						if(res.status=="OK"){
							if (selectedEntries[0].type == "AHENK" && selectedRow.online == true) {
								$("#plugin-result-ldap-login").html(message.bold());
							}
						}   	
						/* $('#closePage').click(); */
					},
					error: function(result) {
						$.notify(result, "error");
					}
				});
				scheduledParamLdapLogin = null;
			},
			Hayır: function () {
			}
		}
	});
}

function ldapLoginListener(msg) {
	var to = msg.getAttribute('to');
	var from = msg.getAttribute('from');
	var type = msg.getAttribute('type');
	var elems = msg.getElementsByTagName('body');

	if (type == "chat" && elems.length > 0) {
		var body = elems[0];
		var data=Strophe.xmlunescape(Strophe.getText(body));
		var xmppResponse=JSON.parse(data);
		var responseMessage = xmppResponse.result.responseMessage;
		if(xmppResponse.commandClsId == "EXECUTE_LDAP_LOGIN" || xmppResponse.commandClsId == "EXECUTE_AD_LOGIN" || xmppResponse.commandClsId == "EXECUTE_CANCEL_LDAP_LOGIN"){
			if (selectedEntries[0].type == "AHENK") {
				progress("divLdapLogin","progressLdapLogin",'hide');
				if (xmppResponse.result.responseCode != "TASK_ERROR") {
					$("#plugin-result-ldap-login").html("");
					$.notify(responseMessage, "success");
				} else {
//					$("#plugin-result-ldap-login").html(("HATA: " + responseMessage).fontcolor("red"));
					$.notify(responseMessage, "error");
				}
			}
		}						 
	}
	// we must return true to keep the handler alive. returning false would remove it after it finishes.
	return true;
}

function changeUserDirectoryDomain() {

	var userDirectoryDomain = $('#ldapLoginSb').val();
	if (userDirectoryDomain == "AD") {
		userDirectoryDomain = "AD";
	} else if (userDirectoryDomain == "OpenLDAP") {
		userDirectoryDomain = "LDAP";
	} else {
		userDirectoryDomain = null;
	}
	params = {
			"agentJid": selectedEntries[0]['attributes'].uid,
			"userDirectoryDomain": userDirectoryDomain
	};
	$.ajax({
		type: 'POST', 
		url: "ldap_login/update_directory_domain",
		data: params,
		dataType: "json",
		success: function(data) {
			if(data != null) {
			} else {
				$.notify("Kullanıcı domaini değiştirilirken hata oluştu. İstemci bulunamadı.", "error");
			}
		},
		error: function (data, errorThrown) {
			$.notify("Kullanıcı domaini değiştirilirken hata oluştu.", "error");
		}
	});
}

$('#ldapLoginCancelCb').click(function(e){
	if($(this).is(':checked')){
		$("#openLdapInfo").hide();
		$("#activeDirectoryInfo").hide();
		$("#ldapLoginSb").prop("disabled", true);
		$('#ldapLoginSb').val('NA');
	}
	else{
		$("#ldapLoginSb").prop("disabled", false);
	}
});

$('#ldapLoginSb').change(function(){
	var directoryType = $(this).val();
	if (directoryType == "NA") {
		$("#openLdapInfo").hide();
		$("#activeDirectoryInfo").hide();

	}else if (directoryType == "OpenLDAP") {
		$("#openLdapInfo").show();
		$("#activeDirectoryInfo").hide();
		setDirectoryParams();
	}else {
		$("#openLdapInfo").hide();
		$("#activeDirectoryInfo").show();
		setDirectoryParams();
	}
});

$('#sendTaskCronLdapLogin').click(function(e){
	$('#scheduledTasksModal').modal('toggle');
	scheduledParam = null;
	scheduledModalLdapLoginOpened = true;
});

$("#scheduledTasksModal").on('hidden.bs.modal', function(){
	if (scheduledModalLdapLoginOpened) {
		scheduledParamLdapLogin = scheduledParam;
	}
	scheduledModalLdapLoginOpened = false;
	defaultScheduleSelection();
});

$('#sendTaskLdapLogin').click(function(e){
	if (selectedEntries.length == 0 ) {
		$.notify("Lütfen istemci seçiniz.", "error");
		return;
	}

	if ($('#ldapLoginSb :selected').val() != "NA" || $('#ldapLoginCancelCb').is(':checked')){
		if ($('#ldapLoginSb :selected').val() == "OpenLDAP"){
			var adminPwd = null;
			var adminDn = null;

//			if selected entries type is AHENK
			if (selectedEntries[0].type == "AHENK") {
				adminDn = selectedEntries[0]["attributes"].entryDN;
				if (selectedEntries[0]["attributes"].userPassword) {
					adminPwd = selectedEntries[0]["attributes"].userPassword;
				}
			}

			pluginTask_LdapLogin.parameterMap={
					"server-address": directoryData.ldapServer,
					"dn": directoryData.ldapRootDn,
					"admin-dn": adminDn,
					"admin-password": adminPwd,
					"disableLocalUser": directoryData.disableLocalUser

			};
			pluginTask_LdapLogin.commandId = "EXECUTE_LDAP_LOGIN";
		}
//		domain_name, host_name, ip_address, password, ad_username)
		if ($('#ldapLoginSb :selected').val() == "AD"){
			pluginTask_LdapLogin.parameterMap={
					"domain_name": directoryData.adDomainName,
					"hostname": directoryData.adHostName,
					"ip_address": directoryData.adIpAddress,
					"ad_username": directoryData.adAdminUserName,
					"admin_password": directoryData.adAdminPassword,
					"ad_port": directoryData.adPort,
					"disableLocalUser": directoryData.disableLocalUser
			};
			pluginTask_LdapLogin.commandId = "EXECUTE_AD_LOGIN";
		}
		if ($('#ldapLoginCancelCb').is(':checked')) {
			pluginTask_LdapLogin.parameterMap={
					"set-previous-settings": "execute_cancel_ldap_login"
			};
			pluginTask_LdapLogin.commandId = "EXECUTE_CANCEL_LDAP_LOGIN";
		}

		if(pluginTask_LdapLogin){
			pluginTask_LdapLogin.dnList=dnlist;
			pluginTask_LdapLogin.entryList=selectedEntries;
			pluginTask_LdapLogin.dnType="AHENK";
			pluginTask_LdapLogin.cronExpression = scheduledParamLdapLogin;
			var params = JSON.stringify(pluginTask_LdapLogin);
		}
		sendLdapLogin(params);
	}else {
		$.notify("Lütfen kaynak dizin(OpenLDAP / Active Directory) seçiniz veya Oturum açma ayarlarını iptal seçeneğine tıklayınız.", "warn");
	}
});


