showAdGroups(selectedRow);
fillUserInfo(selectedRow);
fillUserSessions4Ad(selectedRow);
var groupPanelOpened=false;
var passwordPoliciesGen=null;

$('#btnChangePasswordUserModal').on('click',function(event) {
	getModalContent("modals/ad/adChangePasswordUser", function content(data){
		$('#genericModalHeader').html("Parola Güncelle")
		$('#genericModalBodyRender').html(data);
		
		$('#updateAdUserPasswordBtn').on('click',function(event) {
			var userPassword  =$('#newUserPassword').val()
			var confirmPassword  =$('#newConfirmPassword').val()
			
			var lowerCase = "abcdefghijklmnopqrstuvwxyz";
			var upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
			var digits = "0123456789";
			var splChars = "+=.@*!_";
			
			var ucaseFlag = contains(userPassword, upperCase);
		    var lcaseFlag = contains(userPassword, lowerCase);
		    var digitsFlag = contains(userPassword, digits);
		    var splCharsFlag = contains(userPassword, splChars);
		    if(userPassword!=confirmPassword){
				$.notify("Parolalar uyuşmamaktadır.","warn"  );
				return
			}
		    if(userPassword.length < 8 || !ucaseFlag || !lcaseFlag || !digitsFlag || !splCharsFlag){
		    	$.notify("Parola en az 8 karakter olmalıdır. En az bir büyük harf, küçük harf, sayı ve karakter içermelidir.","warn");
		    	return
		    }
		    updateAdUserPassword(selectedRow.distinguishedName)
		});
	});
});


$('#btnDeleteUserModal').on('click',function(event) {
	
	getModalContent("modals/ad/adDeleteUser", function content(data){
			$('#genericModalHeader').html("Kullanıcı Sil")
			$('#genericModalBodyRender').html(data);
			
			$('#userInfoDelete').html(selectedRow.name);
			
			$('#deleteUserBtn').on('click',function(event) {
				deleteUser(selectedRow)
			});
	});
});

function deleteUser(row) {
	
	var params = {
			"distinguishedName" :	row.distinguishedName
	};
	console.log(params)
    $.ajax({
		type : 'POST',
		url : 'ad/deleteEntry',
		data :params,
		dataType: "json",
		success : function(ldapResult) {
			$.notify("Kullanıcı Başarı ile Silindi.",{className: 'success',position:"right top"}  );
			$('#genericModal').trigger('click');
//			if(ldapResult){
//				$("#treeGridUserHolderDivGrid").jqxTreeGrid('deleteRow', row.entryUUID); 
//			}
			createDmTreeGrid();
		},
	    error: function (data, errorThrown) {
			$.notify("Kullanıcı Silinirken Hata Oluştu.", "error");
		}
	});  
}

function updateAdUserPassword(userId) {
	var params = {
			"distinguishedName" :	userId,
			"userPassword" : $('#newUserPassword').val(),
	};
	$.ajax({
		type : 'POST',
		url : 'ad/updateUserPassword',
		data : params,
		dataType : 'json',
		success : function(ldapResult) {
			$.notify("Kullanıcı Parolası Başarı ile güncellendi.",{className: 'success',position:"right top"}  );
			$('#genericModal').trigger('click');
		},
		error: function (data, errorThrown) {
			$.notify("Kullanıcı Parolası Güncellenirken Hata Oluştu.", "error");
		}
	});  
}

function fillUserSessions4Ad(ldapResult) {
	$.ajax({
		type : 'POST',
		url : 'lider/user/getUserSessions',
		data: 'uid='+ldapResult.attributes.sAMAccountName,
		dataType: "json",
		success : function(sessionList) {
			
			$("#sessionListDiv").html("");
			if(sessionList.length>0){
				var html='<table class="table">';
				html += '<thead>';
				html += '<th style="width: 10%" ></th>';
				html += '<th style="width: 30%" >HOSTNAME</th>';
				html += '<th style="width: 30%" >IP</th>';
				html += '<th style="width: 30%" >DURUM</th>';
				html += '<th style="width: 30%" >TARİH</th>';
				html += '</thead>';
				
				console.log(sessionList)
				for (var m = 0; m < sessionList.length; m++) {
					var row = sessionList[m];
					
					html += '<tr>';
					html += '<td > <img src="img/linux.png" class="avatar" alt="Avatar"> </td>';
			        html += '<td >' + row.agent.hostname + '</td>';
			        html += '<td >' + row.agent.ipAddresses + '</td>';
			        html += '<td >' + row.sessionEvent + '</td>';
			        html += '<td >' + getFormattedDate(row.createDate) + '</td>';
					html += '</tr>';
					
				}
				html += '</table>';
				$("#sessionListDiv").html(html);
			}
			else{
				$("#sessionListDiv").html("<span>Kullanıcı Henüz herhangi bir istemciye login olmamıştır </span>");
			}
			
		},
	    error: function (data, errorThrown) {
		}
	 }); 
}

function showAttributes(row){
	var html = '<table class="table table-striped table-bordered " id="attrTable">';
	html += '<thead>';
	html += '<tr>';
	html += '<th style="width: 40%">Özellik</th>';
	html += '<th style="width: 60%">Değer</th>';
	html += '</tr>';
	html += '</thead>';
    for (key in row.attributesMultiValues) {
        if (row.attributesMultiValues.hasOwnProperty(key)) {
            if( (   key =="homeDirectory") 
            		|| (key =="cn") 
            		|| (key =="uid") 
            		|| (key =="sn") 
            		|| (key =="homePostalAddress") 
            		|| (key =="telephoneNumber") 
            		|| (key =="entryDN") 
            		|| (key =="pwdPolicySubentry") 
            		){
	                	html += '<tr>';
	                	var keyStr="";
	                	if(key =="pwdPolicySubentry"){keyStr="Parola Politikası"}
	                	if(key =="homeDirectory"){keyStr="Ev Dizini"}
	                	if(key =="cn"){keyStr="Kullanıcı Adı"}
	                	if(key =="uid"){keyStr="Kimlik"}
	                	if(key =="sn"){keyStr="Kullanıcı Soyadı"}
	                	if(key =="telephoneNumber"){keyStr="Telefon"}
	                	if(key =="entryDN"){keyStr="Kayıt DN"}
	                	if(key =="homePostalAddress"){keyStr="Adres"}
			            html += '<td>' + keyStr + '</td>';
			            html += '<td>' + row.attributes[key] + '</td>';
			            html += '</tr>';
	                }
        }
    } 
    html += '</table>';
//    $('#selectedDnInfo').html("Seçili Kayıt: "+row.name);
    $('#ldapAttrInfoHolder').html(html);
    
    $('.nav-link').each(function(){               
    	  var $tweet = $(this);                    
    	  $tweet.removeClass('active');
    	});
 
   $('#tab-btn-userInfo').tab('show');
}


function fillUserInfo(ldapResult) {
	console.log(ldapResult)
	$('#userName').html("");
	$('#userAddress').html("");
	$('#userPhone').html("");
	$('#userMail').html("");
	$('#userAd').html("");
	
	$('#userId').html(ldapResult.attributes.sAMAccountName);
	$('#userName').html(ldapResult.cn);
	$('#userAddress').html(ldapResult.attributes.streetAddress);
	$('#userPhone').html(ldapResult.attributes.homePhone);
	$('#userCreateDate').html(ldapResult.createDateStr);
	$('#userMail').html(ldapResult.attributes.mail);
	$('#userHomeDirectory').html(ldapResult.attributesMultiValues.userPrincipalName);
	$('#userDistinguishedName').html(ldapResult.distinguishedName);
	$('#userAd').html(ldapResult.attributes.distinguishedName);
	
	var policy=""
	if(passwordPoliciesGen){
			for (var k = 0; k < passwordPoliciesGen.length; k++) {
		    	  var row = passwordPoliciesGen[k];
		    	  if(row.distinguishedName==ldapResult.attributes.pwdPolicySubentry){
		    		  policy=row
		    	  }
			}
	}
	var html='<table class="table">';
	
	html += '<thead>';
	html += '<tr>';
	if(policy)
	html += '<th colspan= 2>'+policy.name+'</th>';
	else
		html += '<th colspan= 2></th>';
	html += '</tr>';
	html += '</thead>';
    for (key in policy.attributes) {
        if (policy.attributes.hasOwnProperty(key)) {
            
            if( (key =="pwdExpireWarning") 
//            		|| (key =="cn") 
            		|| (key =="pwdFailureCountInterval") 
            		|| (key =="pwdGraceAuthNLimit") 
            		|| (key =="pwdInHistory") 
            		|| (key =="pwdLockout") 
            		|| (key =="pwdLockoutDuration") 
            		|| (key =="pwdMaxAge") 
            		|| (key =="pwdMinAge") 
            		|| (key =="pwdMaxFailure") 
            		|| (key =="pwdMinLength") 
            		|| (key =="pwdMustChange") 
            		|| (key =="pwdSafeModify") 
            		|| (key =="pwdCheckQuality") 
            		){
            	html += '<tr>';
            	
            	var keyStr="";
            	var value="";
            	if(key =="pwdExpireWarning"){keyStr="Parola Geçerlilik Süresi (Sn)"}
            	if(key =="pwdFailureCountInterval"){keyStr="Hatalı Parola Deneme Sayısı"}
            	if(key =="pwdGraceAuthNLimit"){keyStr="Eski Parola Geçerlilik Süresi (sn)"}
            	if(key =="pwdInHistory"){keyStr="Eski Parola Deneme Sayısı"}
            	if(key =="pwdLockout"){keyStr="Hesabı Kilitle"}
            	if(key =="pwdLockoutDuration"){keyStr="Hesap Kilitlenme Süresi(sn)"}
            	if(key =="pwdMaxAge"){keyStr="Parola Geçerlilik Süresi (sn)"}
            	if(key =="pwdMinAge"){keyStr="Parola Değiştirme Süresi (sn)"}
            	if(key =="pwdMaxFailure"){keyStr="Hatalı Giriş Sayısı"}
            	if(key =="pwdMinLength"){keyStr="Parola Uzunluğu"}
            	if(key =="pwdMustChange"){keyStr="Parolayı Değiştirsin"}
            	if(key =="pwdSafeModify"){keyStr="Parola değişikliğini sisteme gönder"}
            	
            	if(key =="pwdCheckQuality"){
            		keyStr="Şifre Kalite Kontrolü"
            		if(policy.attributes[key]==1){
            			value=""
            		}
            	
            	}
	            html += '<td>' + keyStr + '</td>';
	            html += '<td>' + policy.attributes[key] + '</td>';
	            html += '</tr>';
            }
        }
    } 
    html += '</table>';
    $("#userPolicyDetails").html("")
    $("#userPolicyDetails").html(html)
}


function showAdGroups(row){
	var memberHtml='<table class="table table-striped table-bordered " id="attrMemberTable">';
	memberHtml +='<thead> <tr><th style="width: 80%" > Kullanıcı Grup Adı </th> </tr> </thead>';
	console.log(row)
	var isGroupExist=false;
	for (key in row.attributesMultiValues) {
		if (row.attributesMultiValues.hasOwnProperty(key)) {
			if((key == "memberOf")){
				
				if(row.attributesMultiValues[key].length > 1) {
					isGroupExist=true;
					for(var i = 0; i< row.attributesMultiValues[key].length; i++) {
						memberHtml += '<tr>';
						memberHtml += '<td>' + row.attributesMultiValues[key][i] + '</td>'; 
//						memberHtml += '<td> <button class="btn btn-info deleteMember" data-user='+row.name +' data-value='+row.attributesMultiValues[key][i]+' >  <i class="fas fa-minus"></i>  </button></td>'; 
						memberHtml += '</tr>';
					}
				} else {
					isGroupExist=true;
					memberHtml += '<tr>';
					memberHtml += '<td>' + row.attributesMultiValues[key] + '</td>';
//					memberHtml += '<td> <button class="btn btn-info deleteMember" data-user='+row.name +' data-value='+row.attributesMultiValues[key][i]+' > <i class="fas fa-minus"></i>  </button></td>'; 
					memberHtml += '</tr>';
				}
			}
		}
	} 
	memberHtml +='</table>';
	
	$('#groupsDiv').html(memberHtml);
	
	if(isGroupExist && groupPanelOpened == false){
		$('#sudoGroupCollapseLink').click();
		groupPanelOpened=true;
	}else {
		$('#sudoGroupCollapseLink').click();
		groupPanelOpened=false;
	}
	
	$('.nav-link').each(function(){               
		var $tweet = $(this);                    
		$tweet.removeClass('active');
	});
	
	$('#tab-btn-userGroups').tab('show');
	
	$('.deleteMember').on('click',function() {
		var dn = $(this).data('user');
		var value = $(this).data('value');
		
		var params = {
				"dn" : dn,
				"attribute" : "memberOf",
				"value": value
		};
		$.ajax({
			type : 'POST',
			url : 'lider/user/removeAttributeWithValue',
			data : params,
			dataType: "json",
			success : function(ldapResult) {
				
				var html='<table class="table table-striped table-bordered " id="attrRolesTable">';
				html +='<thead> <tr><th>Yetki Grup Adı </th> </tr> </thead>';
				
				for (var m = 0; m < ldapResult.length; m++) {
					var row = ldapResult[m];
					
					html += '<tr>';
		            html += '<td title="'+row.description +'">' + row.name + '</td>';
		            html += '</tr>';
				}
				
				html +='</table>';
				
				$('#rolesDiv').html(html);
				
				$('.nav-link').each(function(){               
					var $tweet = $(this);                    
					$tweet.removeClass('active');
				});
				
				$('#tab-btn-userRoles').tab('show');
			},
		    error: function (data, errorThrown) {
				$.notify("Hata Oluştu.", "error");
			}
		 }); 
		
	});
}

function getFormattedDate(date) {
	var h= date.split('T');
	var hours=h[1].split(':')
	var d = date.slice(0, 10).split('-');  
	return d[1] +'/'+ d[2] +'/'+ d[0] + ' '+(hours[0])+":"+hours[1]; // 10/30/2010
}