/**
 * When page loading getting users from LDAP and ldap users tree fill out on the treegrid that used jqxTreeGrid api..
 * M. Edip YILDIZ
 */

$(document).ready(function(){
	//create user tree check and uncheck action function
	createUserTree("treeGridUserHolderDiv", false, true,
			//check action
			function(checkedRows, row){ 
				if(checkedRows.length==0){
					hideButtons()
				  }
			      if(checkedRows.length>0  ){
			    	  var userList=[]
			    	  for (var m = 0; m < checkedRows.length; m++) {
				    	  var row = checkedRows[m];
				    	  if(row.type == "USER"){
				    		  userList.push(row)
				    	  }
					  }
			    	  if(userList.length ==1){
			    		  showButtons()
			    	  }
			    	  else{
			    		  hideButtons()
			    	  }
			      }
			      else{
			    	  hideButtons()
			      }
							
			},
			//uncheck action
			function(checkedRows, row){ 
				  if(checkedRows.length>0  ){
			    	  var userList=[]
			    	  for (var m = 0; m < checkedRows.length; m++) {
				    	  var row = checkedRows[m];
				    	  if(row.type == "USER"){
				    		  userList.push(row)
				    	  }
					  }
			    	  if(userList.length ==1){
			    		  showButtons()
			    	  }
			    	  else{
			    		  hideButtons()
			    	  }
			      }
				  else{
					  hideButtons()
				  }
			}
	);
	/**
	 * when user selected show  only related actions
	 */
	hideButtons()
	
	$('#btnOpenAddUserModal').on('click',function(event) {
		getModalContent("modals/user/addUserModal", function content(data){
				$('#genericModalLargeHeader').html("Kullanıcı Ekle")
				$('#genericModalLargeBodyRender').html(data);
				
				$('#ouName').val("")
				$('#uid').val("")
				$('#cn').val("")
				$('#sn').val("")
				$('#userPassword').val("")
				$('#confirm_password').val("")
				$('#addUserBtn').removeClass('disabled');
				
				createUserTree("treeGridAddUserHolderDiv", true, false);
				
				$('#addUserBtn').on('click',function(event) {
					addUser()
				});
			} 
		);
	});
	
	$('#btnOpenEditUserModal').on('click',function(event) {
		getModalContent("modals//user/editUserModal", function content(data){
				$('#genericModalHeader').html("Kullanıcı Düzenle")
				$('#genericModalBodyRender').html(data);
				var entry;
				var checkedRows = $("#treeGridUser").jqxTreeGrid('getCheckedRows');
				for (var k = 0; k < checkedRows.length; k++) { 
					var row= checkedRows[k];
					if(row.type=="USER"){
						entry=row;
					}
				}
				console.log(entry)
				$('#uidEdit').val(entry.attributes.uid)
				$('#cnEdit').val(entry.name)
				$('#snEdit').val(entry.sn)
				$('#telephoneNumberEdit').val(entry.attributes.telephoneNumber)
				$('#homePostalAddressEdit').val(entry.attributes.homePostalAddress)
				$('#userPasswordEdit').val(entry.userPassword)
				
				$('#editUserBtn').on('click',function(event) {
					editUser(entry.distinguishedName)
				});
				
			} 
		);
	});
	
	$('#btnOpenDeleteUserModal').on('click',function(event) {
		var checkedRows = $("#treeGridUser").jqxTreeGrid('getCheckedRows');
		if(checkedRows.length==0){
			$.notify("Lütfen Kullanıcı Ağacından Kayıt Seçiniz.", "warn");
			return
		}
		getModalContent("modals/user/deleteUserModal", function content(data){
				$('#genericModalHeader').html("Kullanıcı Sil")
				$('#genericModalBodyRender').html(data);
				
				var entryNames="<ul>";
				for (var k = 0; k < checkedRows.length; k++) { 
					var row= checkedRows[k];
					if(row.type){
						entryNames+="<li> "+row.name +"</li>"
					}
				}
				entryNames+="</ul>"
				$('#userInfoDelete').html(entryNames);
		});
	});
	
	$('#btnOpenChangePasswordUserModal').on('click',function(event) {
		getModalContent("modals/user/changePasswordUserModal", function content(data){
			$('#genericModalHeader').html("Parola Güncelle")
			$('#genericModalBodyRender').html(data);
			var entry;
			var checkedRows = $("#treeGridUser").jqxTreeGrid('getCheckedRows');
			
			for (var k = 0; k < checkedRows.length; k++) { 
				var row= checkedRows[k];
				if(row.type=="USER"){
					entry=row;
				}
			}
			console.log(entry)
			$('#updateUserPasswordBtn').on('click',function(event) {
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
			    updateUserPassword(entry.distinguishedName)
			});
		});
		
		
		
	});
	
	/**
	 * begin set password policy modal
	 * 
	 */
	$('#btnSetPasswordPolicyModal').on('click',function(event) {
		
		getModalContent("modals/user/setPasswordPolicyModal", function content(data){
				$('#genericModalHeader').html("Parola Politikası Ata")
				$('#genericModalBodyRender').html(data);
				
				var checkedRows = $("#treeGridUser").jqxTreeGrid('getCheckedRows');
				var entry;
				for (var k = 0; k < checkedRows.length; k++) { 
					var row= checkedRows[k];
					if(row.type=="USER"){
						entry=row;
					}
				}
				$.ajax({
					type : 'POST',
					url : 'lider/user/getPasswordPolices',
					dataType : 'json',
					success : function(data) {
						
						if(data){
							var option='<option> Politika Seçiniz</option>'
							for (var i = 0; i < data.length; i++) {
						    	  var row = data[i];
						    	  option +='<option value="'+row.distinguishedName+'" >'+row.cn+'</option>'
							}
							$("#passwordPolicyList").append(option)
							
							$("#passwordPolicyList").on('change', function(event) {
								var selectedVal=$("#passwordPolicyList").val();
								var selectedPolicy=""
									for (var k = 0; k < data.length; k++) {
								    	  var row = data[k];
								    	  if(row.distinguishedName==selectedVal){
								    		  selectedPolicy=row
								    	  }
									}
									var html = '<table class="table table-striped table-bordered " id="attrTable">';
									html += '<thead>';
									html += '<tr>';
									html += '<th style="width: 40%"></th>';
									html += '<th style="width: 60%"></th>';
									html += '</tr>';
									html += '</thead>';
							        
							        for (key in selectedPolicy.attributes) {
							            if (selectedPolicy.attributes.hasOwnProperty(key)) {
							                
							                if( (key =="pwdExpireWarning") 
							                		|| (key =="cn") 
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
									            html += '<td>' + key + '</td>';
									            html += '<td>' + selectedPolicy.attributes[key] + '</td>';
									            html += '</tr>';
							                }
							            }
							        } 
							        html += '</table>';
							        $("#policyDetail").html("")
							        $("#policyDetail").html(html)
								
							});
							
							
							$('#setPasswordPolicydBtn').on('click', function(event) {
								
								var selectedPasswordPolicy=$('#passwordPolicyList').val();
								
								var params = {
										"passwordPolicy" :	selectedPasswordPolicy,
										"dn" : entry.distinguishedName
								};
								
								$.ajax({
									type : 'POST',
									url : 'lider/user/setPasswordPolicy',
									data : params,
									dataType : 'json',
									success : function(data) {
										$.notify("Kullanıcıya Parola Politikası Atanmıştır", "success");
									},
									error: function (data, errorThrown) {
										$.notify("Kullanıcı Parolası Güncellenirken Hata Oluştu.", "error");
									}
								});
							});
							
						}
						 
					}
				});
		});
	});
	/**
	 * end set password policy modal
	 */
});


function addUser() {
	var checkedRows = $("#treeGridUserHolderDiv").jqxTreeGrid('getCheckedRows');
	if(checkedRows.length==0){
		$.notify("Lütfen Klasör Seçiniz",{className: 'warn',position:"right top"}  );
		return
	}
	
	var parentDn=checkedRows[0].distinguishedName; 
	
	var uid=$('#uid').val();
	var cn=$('#cn').val();
	var sn=$('#sn').val();
	var homePostalAddress=$('#homePostalAddress').val();
	var telephoneNumber=$('#telephoneNumber').val();
	var userPassword=$('#userPassword').val();
	var confirm_password=$('#confirm_password').val();
	
	var lowerCase = "abcdefghijklmnopqrstuvwxyz";
	var upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var digits = "0123456789";
	var splChars = "+=.@*!_";
	
	var ucaseFlag = contains(userPassword, upperCase);
    var lcaseFlag = contains(userPassword, lowerCase);
    var digitsFlag = contains(userPassword, digits);
    var splCharsFlag = contains(userPassword, splChars);
    
    if(userPassword.length < 8 || !ucaseFlag || !lcaseFlag || !digitsFlag || !splCharsFlag){
    	$.notify("Parola en az 8 karakter olmalıdır. En az bir büyük harf, küçük harf, sayı ve karakter içermelidir.","warn");
    	return
    }
    if(userPassword!=confirm_password){
		$.notify("Parolalar Uyuşmamaktadır.",{className: 'warn',position:"right top"}  );
		return
	}
    var params = {
			"uid" : uid,
			"cn": cn,
			"sn": sn,
			"userPassword": userPassword,
			"parentName": parentDn,
			"telephoneNumber": telephoneNumber,
			"homePostalAddress": homePostalAddress,
	};
    
    $.ajax({
		type : 'POST',
		url : 'lider/user/addUser',
		data : params,
		dataType : 'json',
		success : function(ldapResult) {
			$.notify("Kullanıcı Başarı ile eklendi.",{className: 'success',position:"right top"}  );
			$('#addUserBtn').addClass('disabled');
			getUsers();
		},
	    error: function (data, errorThrown) {
			$.notify("Kullanıcı Eklenirken Hata Oluştu.", "error");
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

function deleteUsers() {
	var checkedRows = $("#treeGridUser").jqxTreeGrid('getCheckedRows');
	var dnList = [];
	for(var i = 0; i < checkedRows.length; i++) {
		var rowData = checkedRows[i];
		if(rowData.type){
			dnList.push(
					{
						distinguishedName :rowData.distinguishedName, 
						entryUUID: rowData.entryUUID, 
						name: rowData.name,
						type: rowData.type,
						uid: rowData.uid
					});
		}
	}
    $.ajax({
		type : 'POST',
		url : 'lider/user/deleteUser',
		data : JSON.stringify(dnList),
		dataType: "json",
		contentType: "application/json",
		success : function(ldapResult) {
			$.notify("Kullanıcı Başarı ile Silindi.",{className: 'success',position:"right top"}  );
			$("#deleteUserBtn").attr("disabled", true);
			$('#deleteUserModal').modal('hide');
			getUsers();
		},
	    error: function (data, errorThrown) {
			$.notify("Kullanıcı Silinirken Hata Oluştu.", "error");
		}
	});  
}

function editUser(userId) {
    var params = {
    	"distinguishedName" :	userId,
		"uid" : $('#uidEdit').val(),
		"cn": $('#cnEdit').val(),
		"sn": $('#snEdit').val(), 
		"telephoneNumber": $('#telephoneNumberEdit').val(),
		"homePostalAddress": $('#homePostalAddressEdit').val()
	};
    console.log(params)
	$.ajax({
		type : 'POST',
		url : 'lider/user/editUser',
		data : params,
		dataType : 'json',
		success : function(ldapResult) {
			$.notify("Kullanıcı Başarı ile güncellendi.",{className: 'success',position:"right top"}  );
			$('#editUserBtn').addClass('disabled');
			getUsers();
		},
	    error: function (data, errorThrown) {
			$.notify("Kullanıcı Güncellenirken Hata Oluştu.", "error");
		}
	});  
}
function updateUserPassword(userId) {
	var params = {
			"distinguishedName" :	userId,
			"userPassword" : $('#newUserPassword').val(),
	};
	$.ajax({
		type : 'POST',
		url : 'lider/user/updateUserPassword',
		data : params,
		dataType : 'json',
		success : function(ldapResult) {
			$.notify("Kullanıcı Parolası Başarı ile güncellendi.",{className: 'success',position:"right top"}  );
			$('#updateUserPasswordBtn').addClass('disabled');
			getUsers();
		},
		error: function (data, errorThrown) {
			$.notify("Kullanıcı Parolası Güncellenirken Hata Oluştu.", "error");
		}
	});  
}

function hideButtons(){
	$("#btnEditUserModal").hide();
	$("#btnOpenDeleteUserModal").hide();
	$("#btnOpenEditUserModal").hide();
	$("#btnOpenChangePasswordUserModal").hide();
	$("#btnSetPasswordPolicyModal").hide();
}

function showButtons(){
	$("#btnEditUserModal").show();
	$("#btnOpenDeleteUserModal").show();
	$("#btnOpenEditUserModal").show();
	$("#btnOpenChangePasswordUserModal").show();
	$("#btnSetPasswordPolicyModal").show();
}
