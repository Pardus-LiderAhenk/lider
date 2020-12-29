/**
 * This page updated profile and changed password of the logged console user. Usage lider console history.
 * Tuncay ÇOLAK 
 * tuncay.colak@tubitak.gov.tr
 * 
 * http://www.liderahenk.org/
 */

var liderConsoleInfo = null;
var pageNumber = 1;
var pageSize = 10;
var totalPages = 0;

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
	var lastPwdDate = getFormattedDate(liderConsoleInfo.attributes.pwdChangedTime);
	$('#lasChangedPasswordDate').val(lastPwdDate);
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
	var year = date.slice(0,4);
	var month = date.slice(4,6);
	var day = date.slice(6,8);
	return day + "/" + month + "/" + year; 
}

//show sessions of lider console
function getSessionsOfLiderConsoleUser(ldapResult) {
	var operationType = $("#lcLoginStatus").val();
	var params = {
			"userId" : liderConsoleInfo.distinguishedName,
			"pageSize": pageSize,
			"pageNumber": pageNumber,
			"operationType": operationType,
			"startDate": null,
			"endDate": null
	};
	var num = (pageNumber-1) * pageSize + 1;
	var html = "";
	$.ajax({
		type : 'POST',
		url : 'log/login',
		data: params,
		dataType: "json",
		success : function(data) {
			if(data.content.length > 0) {
				var sessionList = data.content;
				totalPages = data.totalPages;
				userSessionPagination(pageNumber, totalPages);
				if(sessionList.length>0 && sessionList != null){
					for (var m = 0; m < sessionList.length; m++) {
						var row = sessionList[m];
						var operationType = "Oturum Açıldı";
						if (row.crudType == "LOGOUT") {
							operationType = "Oturum Kapatıldı";
						}
						var requestIp = row.requestIp;
						if (row.requestIp == "0:0:0:0:0:0:0:1") {
							requestIp = "localhost";
						}
						html += '<tr>';
						html += '<td > '+ (num) +' </td>';
						html += '<td >' + liderConsoleInfo.uid + '</td>';
//						html += '<td >' + row.userId + '</td>';
						html += '<td >' + row.createDate + '</td>';
						html += '<td >' + requestIp + '</td>';
						html += '<td >' + operationType + '</td>';
						html += '</tr>';
						num++;
					}
				}
			} else{
				if (operationType == "login") {
					html += '<tr><td class="text-center" colspan="5">Kullanıcı henüz oturum açmamıştır</td></tr>'
				} else {
					html += '<tr><td class="text-center" colspan="5">Kullanıcı henüz oturumdan çıkmamıştır</td></tr>'
				}
			}
			$("#liderConsoleSessionListBody").html(html);
		},
		error: function (data, errorThrown) {
		}
	}); 
}

function userSessionPagination(c, m) {
	var current = c,
	last = m,
	delta = 2,
	left = current - delta,
	right = current + delta + 1,
	range = [],
	rangeWithDots = [],
	l;

	for (let i = 1; i <= last; i++) {
		if (i == 1 || i == last || i >= left && i < right) {
			range.push(i);
		}
	}

	for (let i of range) {
		if (l) {
			if (i - l === 2) {
				rangeWithDots.push(l + 1);
			} else if (i - l !== 1) {
				rangeWithDots.push('...');
			}
		}
		rangeWithDots.push(i);
		l = i;
	}
	$('#pagingConsoleUserList').empty();
	if(m != 1){
		for (let i = 0; i < rangeWithDots.length; i++) {
			if(rangeWithDots[i] == c) {
				$('#pagingConsoleUserList').append('<li class="active"><a href="javascript:sessionPagingClicked(' + rangeWithDots[i] + ')">' + rangeWithDots[i] + '</a></li>');
			}
			else {
				if(rangeWithDots[i] == "...") {
					$('#pagingConsoleUserList').append('<li class="disabled"><a href="javascript:sessionPagingClicked(' + rangeWithDots[i] + ')">' + rangeWithDots[i]+ '</a></li>');
				}
				else {
					$('#pagingConsoleUserList').append('<li ><a href="javascript:sessionPagingClicked(' + rangeWithDots[i] + ')">' + rangeWithDots[i]+ '</a></li>');
				}
			}
		}
	}
}

function sessionPagingClicked(pNum) {
	pageNumber = pNum;
	getSessionsOfLiderConsoleUser(liderConsoleInfo);
}

$('#lcPageSize').change(function(){
	pageSize = $('#lcPageSize').val();
	getSessionsOfLiderConsoleUser(liderConsoleInfo);
});

function changeOperationTypeForLogin() {
	pageNumber = 1;
	pageSize = 10;
	totalPages = 0;
	$('#pagingConsoleUserList').empty();
	getSessionsOfLiderConsoleUser(liderConsoleInfo);
}

