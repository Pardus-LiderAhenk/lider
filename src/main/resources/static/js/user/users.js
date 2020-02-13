/**
 * When page loading getting users from LDAP and ldap users tree fill out on the treegrid that used jqxTreeGrid api..
 * M. Edip YILDIZ
 */
$(document).ready(function(){
	/**
	 * when user selected show  only related actions
	 */
	hideUserButtons()
	hideOuButtons()
	
	var selectedRowGen = null
	var treeGridHolderDiv="treeGridUserHolderDiv"
	
	//create user tree check and uncheck action function
	createUserTree(treeGridHolderDiv, false, false,
			// row select
			function(row){
				selectedRowGen=row;
		        fillEntryDetail2Table(row);
		        setUserActionButtons(row)
			},
			//check action
			function(checkedRows, row){
				
				
			},
			//uncheck action
			function(checkedRows, row){
				
			}
	);
	
	$('#btnAddOuModal').on('click',function(event) {
		getModalContent("modals/user/addOuModal", function content(data){
				$('#genericModalHeader').html("Klasör Yönetimi")
				$('#genericModalBodyRender').html(data);
				$('#ouInfo').html(selectedRowGen.name +"/");
				$('#addOu').on('click', function (event) {
						console.log(selectedRowGen)
						
						var parentDn=selectedRowGen.distinguishedName; 
						var parentName= selectedRowGen.name;
						var parentEntryUUID= selectedRowGen.entryUUID;
						var ouName= $('#ouName').val();
						$.ajax({
							type : 'POST',
							url : 'lider/ldap/addOu',
							data: 'parentName='+parentDn +'&ou='+ouName,
							dataType : 'json',
							success : function(data) {
								
								$.notify("Klasör Başarı İle Eklendi.", "success");
							     
								$('#genericModal').trigger('click');
								$('#treeGridUserHolderDivGrid').jqxTreeGrid('addRow' , data.name , data , 'last' , parentEntryUUID);
								$("#treeGridUserHolderDivGrid").jqxTreeGrid('expandRow' , parentEntryUUID);
							}
						});
				});
			} 
		);
	});
	// Create ou for selected parent node. Ou modal will be open for all releated pages..
	$('#btnDeleteOuModal').on('click',function(event) {
		getModalContent("modals/user/deleteOuModal", function content(data){
			$('#genericModalHeader').html("Klasör Sil")
			$('#genericModalBodyRender').html(data);
			
			$('#deleteOuBtn').on('click', function (event) {
				deleteUserOu(selectedRowGen)
			});
		} 
		);
	});
	
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
				
				userFolderInfo.append("Seçili Klasör : "+selectedRowGen.name)
				$('#addUserBtn').on('click',function(event) {
					addUser(selectedRowGen)
				});
			} 
		);
	});
	
	$('#btnOpenEditUserModal').on('click',function(event) {
		getModalContent("modals//user/editUserModal", function content(data){
				$('#genericModalHeader').html("Kullanıcı Düzenle")
				$('#genericModalBodyRender').html(data);
				
				$('#uidEdit').val(selectedRowGen.attributes.uid)
				$('#cnEdit').val(selectedRowGen.name)
				$('#snEdit').val(selectedRowGen.sn)
				$('#telephoneNumberEdit').val(selectedRowGen.attributes.telephoneNumber)
				$('#homePostalAddressEdit').val(selectedRowGen.attributes.homePostalAddress)
				$('#userPasswordEdit').val(selectedRowGen.userPassword)
				
				$('#editUserBtn').on('click',function(event) {
					editUser(selectedRowGen.distinguishedName)
				});
				
			} 
		);
	});
	
	$('#btnOpenDeleteUserModal').on('click',function(event) {
		
		getModalContent("modals/user/deleteUserModal", function content(data){
				$('#genericModalHeader').html("Kullanıcı Sil")
				$('#genericModalBodyRender').html(data);
				
				$('#userInfoDelete').html(selectedRowGen.name);
				
				$('#deleteUserBtn').on('click',function(event) {
					deleteUsers(selectedRowGen)
				});
		});
	});
	
	$('#btnOpenChangePasswordUserModal').on('click',function(event) {
		getModalContent("modals/user/changePasswordUserModal", function content(data){
			$('#genericModalHeader').html("Parola Güncelle")
			$('#genericModalBodyRender').html(data);
			
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
			    updateUserPassword(selectedRowGen.distinguishedName)
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
										"dn" : selectedRowGen.distinguishedName
								};
								
								$.ajax({
									type : 'POST',
									url : 'lider/user/setPasswordPolicy',
									data : params,
									dataType : 'json',
									success : function(data) {
										$.notify("Kullanıcıya Parola Politikası Atanmıştır", "success");
										var selectedData = $("#treeGridUserHolderDivGrid").jqxTreeGrid('getRow', data.entryUUID);
										selectedData.attributes = data.attributes
										$("#treeGridUserHolderDivGrid").jqxTreeGrid('updateRow', selectedData.entryUUID, data);
										$("#treeGridUserHolderDivGrid").jqxTreeGrid('selectRow', data.entryUUID);
										$('#genericModal').trigger('click');
										
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


function addUser(row) {
	var parentDn=row.distinguishedName; 
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
			console.log(ldapResult)
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

function deleteUsers(row) {
	var dnList = [];
	
	dnList.push({
			distinguishedName :row.distinguishedName, 
			entryUUID: row.entryUUID, 
			name: row.name,
			type: row.type,
			uid: row.uid
		});
		
    $.ajax({
		type : 'POST',
		url : 'lider/user/deleteUser',
		data : JSON.stringify(dnList),
		dataType: "json",
		contentType: "application/json",
		success : function(ldapResult) {
			$.notify("Kullanıcı Başarı ile Silindi.",{className: 'success',position:"right top"}  );
			$('#genericModal').trigger('click');
			if(ldapResult){
				$("#treeGridUserHolderDivGrid").jqxTreeGrid('deleteRow', row.entryUUID); 
			}
		},
	    error: function (data, errorThrown) {
			$.notify("Kullanıcı Silinirken Hata Oluştu.", "error");
		}
	});  
}

function deleteUserOu(row) {
	var dnList = [];
	dnList.push({
			distinguishedName :row.distinguishedName, 
			entryUUID: row.entryUUID, 
			name: row.name,
			type: row.type,
			uid: row.uid
		});
		
    $.ajax({
		type : 'POST',
		url : 'lider/user/deleteUserOu',
		data : JSON.stringify(dnList),
		dataType: "json",
		contentType: "application/json",
		success : function(ldapResult) {
			$.notify("Klasör ve bulunan kullanıcılar başarı ile silindi.",{className: 'success',position:"right top"}  );
			$('#genericModal').trigger('click');
			if(ldapResult){
				$("#treeGridUserHolderDivGrid").jqxTreeGrid('deleteRow', row.entryUUID); 
			}
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
    
	$.ajax({
		type : 'POST',
		url : 'lider/user/editUser',
		data : params,
		dataType : 'json',
		success : function(data) {
			$.notify("Kullanıcı Başarı ile güncellendi.",{className: 'success',position:"right top"}  );
//			$('#editUserBtn').addClass('disabled');
			console.log(data)
			$('#genericModal').trigger('click');
			var selectedData = $("#treeGridUserHolderDivGrid").jqxTreeGrid('getRow', data.entryUUID);
			selectedData.attributes = data.attributes
			$("#treeGridUserHolderDivGrid").jqxTreeGrid('updateRow', selectedData.entryUUID, data);
			$("#treeGridUserHolderDivGrid").jqxTreeGrid('selectRow', data.entryUUID);
			
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
			$('#genericModal').trigger('click');
		},
		error: function (data, errorThrown) {
			$.notify("Kullanıcı Parolası Güncellenirken Hata Oluştu.", "error");
		}
	});  
}

function hideUserButtons(){
	$("#btnEditUserModal").hide();
	$("#btnOpenDeleteUserModal").hide();
	$("#btnOpenEditUserModal").hide();
	$("#btnOpenChangePasswordUserModal").hide();
	$("#btnSetPasswordPolicyModal").hide();
	$("#btnAddOuModal").hide();
	$("#btnAddOuModal").hide();
	$("#btnOpenAddUserModal").hide();
	  
}
function hideOuButtons(){
	$("#btnDeleteOuModal").hide();
}

function showOuButtons(){
	$("#btnDeleteOuModal").show();
}
function showUserButtons(){
	$("#btnEditUserModal").show();
	$("#btnOpenDeleteUserModal").show();
	$("#btnOpenEditUserModal").show();
	$("#btnOpenChangePasswordUserModal").show();
	$("#btnSetPasswordPolicyModal").show();
	
}
function setUserActionButtons(row){
	
	if(row.type =="USER"){
		$("#btnOpenEditUserModal").show();
		$("#btnOpenChangePasswordUserModal").show();
		$("#btnSetPasswordPolicyModal").show();
		$("#btnOpenDeleteUserModal").show();
		
		$("#btnDeleteOuModal").hide();
		$("#btnAddOuModal").hide();
		$("#btnOpenAddUserModal").hide();
	  }
	  else if(row.type =="ORGANIZATIONAL_UNIT"){
		  $("#btnOpenEditUserModal").hide();
		  $("#btnOpenChangePasswordUserModal").hide();
		  $("#btnSetPasswordPolicyModal").hide();
		  $("#btnOpenDeleteUserModal").hide();
		  
		  $("#btnAddOuModal").show();
		  
		  $("#btnDeleteOuModal").show();
		  $("#btnOpenAddUserModal").show();
	  }
	
}

function fillEntryDetail2Table(row){
	var html = '<table class="table table-striped table-bordered " id="attrTable">';
	html += '<thead>';
	html += '<tr>';
	html += '<th style="width: 40%"></th>';
	html += '<th style="width: 60%"></th>';
	html += '</tr>';
	html += '</thead>';
    
    for (key in row.attributes) {
        if (row.attributes.hasOwnProperty(key)) {
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
    
    $('#selectedDnInfo').html("Seçili Kayıt: "+row.name);
    $('#ldapAttrInfoHolder').html(html);
    
    $('.nav-link').each(function(){               
    	  var $tweet = $(this);                    
    	  $tweet.removeClass('active');
    	});
 
    $('#tab-c-0').tab('show');
	
}
