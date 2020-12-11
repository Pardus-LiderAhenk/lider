/**
 * This page updated profile and changed password of the logged console user 
 * Tuncay ÇOLAK 
 * tuncay.colak@tubitak.gov.tr
 * 
 * http://www.liderahenk.org/
 */

var liderConsoleInfo = null;
getLiderConsoleUser();

//Return logged in user information from ldap
function getLiderConsoleUser() {

	var params = {
			"uid" : user_name,
	};

	$.ajax({
		type : 'POST',
		url : 'lider/user/liderConsoleUser',
		data: params,
		dataType: "json",
		success : function(ldapResult) {
			liderConsoleInfo = ldapResult;
			showProfileOfLiderConsoleUser();
			getSessionsOfLiderConsoleUser(ldapResult);
			showGroupsOfLiderConsoleUser(ldapResult);
			showRolesOfLiderConsoleUser(ldapResult);

		},
		error: function (data, errorThrown) {
			$.notify("Kullanıcı Bulunamadı", "warn");
		}
	}); 
}

//show profile of lider console
function showProfileOfLiderConsoleUser() {
	$('#liderConsoleUserUid').val(liderConsoleInfo.attributes.uid)
	$('#liderConsoleUserCn').val(liderConsoleInfo.attributes.cn)
	$('#liderConsoleUserSn').val(liderConsoleInfo.attributes.sn)
	$('#liderConsoleUserPhone').val(liderConsoleInfo.attributes.telephoneNumber)
	$('#liderConsoleUserDn').val(liderConsoleInfo.distinguishedName);
	$('#liderConsoleUserAddress').val(liderConsoleInfo.attributes.homePostalAddress)
	$('#liderConsoleUserEmail').val(liderConsoleInfo.attributes.mail)
	$('#liderConsoleUserCreateDate').val(liderConsoleInfo.createDateStr);
	$('#liderConsoleUserHomeDirectory').val(liderConsoleInfo.attributes.homeDirectory);
}

//show groups of lider console
function showGroupsOfLiderConsoleUser(row){
	var memberHtml='<table class="table table-striped table-bordered " id="attrMemberTable">';
	memberHtml +='<thead> <tr><th> Kullanıcı Grup Adı </th></thead>';
	var isMemberOf = false;
	for (key in row.attributesMultiValues) {
		if (row.attributesMultiValues.hasOwnProperty(key)) {
			if((key == "memberOf")){
				isMemberOf = true;
				for(var i = 0; i< row.attributesMultiValues[key].length; i++) {
					memberHtml += '<tr>';
					memberHtml += '<td>' + row.attributesMultiValues[key][i] + '</td>'; 
					memberHtml += '</tr>';
				}
			}
		} 
	} 
	if (isMemberOf == false) {
		memberHtml += '<tr><td class="text-center">Kullanıcı hiçbir gruba üye değildir.</td></tr>'
	}
	memberHtml +='</table>';
	$('#groupsOfLiderConsoleDiv').html(memberHtml);
}

//show roles of lider console
function showRolesOfLiderConsoleUser(row){
	var params = {
			"searchDn" : "",
			"key" : "sudoUser",
			"value": row.attributes['uid']
	};
	$.ajax({
		type : 'POST',
		url : 'lider/ldap/searchEntry',
		data : params,
		dataType: "json",
		success : function(ldapResult) {
			var html='<table class="table table-striped table-bordered " id="attrRolesTable">';
			html +='<thead> <tr><th>Yetki Grup Adı </th> </tr> </thead>';
			if (ldapResult.length > 0) {
				for (var m = 0; m < ldapResult.length; m++) {
					var row = ldapResult[m];

					html += '<tr>';
					html += '<td title="'+row.cn +'">' + row.distinguishedName + '</td>';
					html += '</tr>';
				}
				html +='</table>';
				$('#rolesOfLiderConsoleDiv').html(html);
			} else {
				html += '<tr><td class="text-center">Kullanıcı hiçbir yetki grubunda üye değildir.</td></tr>'
					$('#rolesOfLiderConsoleDiv').html(html);
			}
		},
		error: function (data, errorThrown) {
			$.notify("Yetki grupları getirilirken hata oluştu.", "error");
		}
	}); 
}

$('#btnUpdateConsoleUserProfile').on('click',function(event) {
	updateProfileOfLiderConsle(liderConsoleInfo.distinguishedName)
});

//updated profile of lider console
function updateProfileOfLiderConsle(dn) {

	if ($('#liderConsoleUserCn').val() == "") {
		$.notify("Kullanıcı adı boş bırakılamaz","warn");
		return;
	}
	if ($('#liderConsoleUserSn').val() == "") {
		$.notify("Kullanıcı soyadı boş bırakılamaz","warn");
		return;
	}

	var params = {
			"distinguishedName" :	dn,
			"uid" : $('#liderConsoleUserUid').val(),
			"cn": $('#liderConsoleUserCn').val(),
			"sn": $('#liderConsoleUserSn').val(), 
			"mail": $('#liderConsoleUserEmail').val(), 
			"telephoneNumber": $('#liderConsoleUserPhone').val(),
			"homePostalAddress": $('#liderConsoleUserAddress').val()
	};
	$.ajax({
		type : 'POST',
		url : 'lider/user/editUser',
		data : params,
		dataType : 'json',
		success : function(data) {
			$.notify("Kullanıcı bilgileri başarı ile güncellendi.",{className: 'success',position:"right top"}  );
			liderConsoleInfo = data;
			showProfileOfLiderConsoleUser();
		},
		error: function (data, errorThrown) {
			$.notify("Kullanıcı bilgileri güncellenirken hata oluştu.", "error");
		}
	});  
}

$('#btnUpdateConsoleUserPassword').on('click',function(event) {
	updatePasswordOfLiderConsole(liderConsoleInfo.distinguishedName)
});

//updated password of lider console
function updatePasswordOfLiderConsole(dn) {
	var userPassword  =$('#newConsoleUserPassword').val();
	var confirmPassword  =$('#newConsoleUserConfirmPassword').val();
	var oldPassword  =$('#oldConsoleUserPassword').val();

	if (oldPassword == "") {
		$.notify("Lütfen eski parolayı giriniz.","warn");
		return;
	}
	if (oldPassword != liderConsoleInfo.userPassword) {
		$.notify("Eski parola yanlış girilmiştir.","warn");
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
	if(userPassword != confirmPassword){
		$.notify("Parolalar uyuşmamaktadır.","warn");
		return;
	}
	if(userPassword.length < 6 || !ucaseFlag || !lcaseFlag || !digitsFlag){
		$.notify("Parola en az 6 karakter olmalıdır. En az bir büyük harf, küçük harf ve sayı içermelidir.","warn");
		return;
	}

	var params = {
			"distinguishedName" : dn,
			"userPassword" : userPassword,
	};
	$.ajax({
		type : 'POST',
		url : 'lider/user/updateLiderConsoelUserPassword',
		data : params,
		dataType : 'json',
		success : function(ldapResult) {
			$.notify("Kullanıcı parolası başarı ile güncellendi.",{className: 'success',position:"right top"}  );
			setTimeout( function() 
					{
				window.location.replace("/logout");
					}, 1000);
		},
		error: function (data, errorThrown) {
			$.notify("Kullanıcı parolası güncellenirken hata oluştu.", "error");
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

function getFormattedDate(date) {
	var h= date.split('T');
	var hours=h[1].split(':')
	var d = date.slice(0, 10).split('-');  
	return d[1] +'/'+ d[2] +'/'+ d[0] + ' '+(hours[0])+":"+hours[1]; // 10/30/2010
}

//show sessions of lider console
function getSessionsOfLiderConsoleUser(ldapResult) {
	$.ajax({
		type : 'POST',
		url : 'lider/user/getUserSessions',
		data: 'uid='+ldapResult.attributes.uid,
		dataType: "json",
		success : function(sessionList) {
			var html='<table class="table table-striped table-bordered">';
			html += '<thead>';
			html += '<th style="width: 10%" ></th>';
			html += '<th style="width: 30%" >BİLGİSAYAR ADI</th>';
			html += '<th style="width: 30%" >IP</th>';
			html += '<th style="width: 30%" >DURUM</th>';
			html += '<th style="width: 30%" >TARİH</th>';
			html += '</thead>';

			$("#sessionListDiv").html("");
			if(sessionList.length>0){
				for (var m = 0; m < sessionList.length; m++) {
					var row = sessionList[m];

					var sessionEvent = "Oturum Açıldı";
					if (row.sessionEvent == "LOGOUT") {
						sessionEvent = "Oturum Kapatıldı";
					}
					html += '<tr>';
					html += '<td > <img src="img/linux.png" class="avatar" alt="Avatar"> </td>';
					html += '<td >' + row.agent.hostname + '</td>';
					html += '<td >' + row.agent.ipAddresses + '</td>';
					html += '<td >' + sessionEvent + '</td>';
					html += '<td >' + getFormattedDate(row.createDate) + '</td>';
					html += '</tr>';
				}
				html += '</table>';
			} else{
				html += '<tr><td class="text-center" colspan="5">Kullanıcı henüz herhangi bir istemcide oturum açmamıştır</td></tr>'
			}
			$("#liderConsoleSessionListDiv").html(html);
		},
		error: function (data, errorThrown) {
		}
	}); 
}
