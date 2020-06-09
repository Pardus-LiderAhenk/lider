/**
 * When page loading getting users from LDAP and ldap users tree fill out on the treegrid that used jqxTreeGrid api..
 * M. Edip YILDIZ
 */

var selectedRowGen = null
var selectedFolder = null
var treeGridHolderDiv="treeGridUserHolderDiv"
var passwordPoliciesGen=null;

//selected row function action behave different when selected tab change.. for this use selectedTab name
var selectedUserTab="showAttributes";
getPasswordPolicies()
getLastUser()
	
$(document).ready(function(){
	
	hideUserButtons()
	/*
	 * create user tree select, check and uncheck action functions can be implemented if required
	 * params div, onlyFolder, use Checkbox, select action , check action, uncheck action
	 */
	createUserTree(treeGridHolderDiv, false, false,
			// row select
			function(row, rootDnUser){
				setUserActionButtons(row,rootDnUser);
				if(row.type=='USER'){
					selectedRowGen=row;
					showAttributes(row);
					showGroups(row);
					showRoles(row);
					fillUserInfo(row);
					fillUserSessions(row);
					
				}
				if(row.type=='ORGANIZATIONAL_UNIT'){
					selectedFolder=row;
				}
			},
			//check action
			function(checkedRows, row){
				
			},
			//uncheck action
			function(unCheckedRows, row){
				
			}
	);
	
	$('#btnAddOuModal').on('click',function(event) {
		if(selectedFolder==null){
			$.notify("Lütfen Klasör Seçiniz","warn"  );
			
		}
		else{
		
			getModalContent("modals/user/addOuModal", function content(data){
					$('#genericModalHeader').html("Klasör Yönetimi")
					$('#genericModalBodyRender').html(data);
					$('#ouInfo').html(selectedFolder.name +"/");
					$('#addOu').on('click', function (event) {
							var parentDn=selectedFolder.distinguishedName; 
							var parentName= selectedFolder.name;
							var parentEntryUUID= selectedFolder.entryUUID;
							
							var ouName= $('#ouName').val();
							$.ajax({
								type : 'POST',
								url : 'lider/user/addOu',
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
		}
	});
	// Create ou for selected parent node. Ou modal will be open for all releated pages..
	$('#btnDeleteOuModal').on('click',function(event) {
		getModalContent("modals/user/deleteOuModal", function content(data){
			$('#genericModalHeader').html("Klasör Sil")
			$('#genericModalBodyRender').html(data);
			
			$('#deleteOuBtn').on('click', function (event) {
				deleteUserOu(selectedFolder)
			});
		} 
		);
	});
	
	$('#btnAddUserModal').on('click',function(event) {
		if(selectedFolder==null){
			$.notify("Lütfen Klasör Seçiniz","warn"  );
		}
		else{
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
					
					userFolderInfo.append("Seçili Klasör : "+selectedFolder.name)
					$('#addUserBtn').on('click',function(event) {
						addUser(selectedFolder)
					});
				} 
			);
		}
	});
	
	$('#btnEditUserModal').on('click',function(event) {
		getModalContent("modals//user/editUserModal", function content(data){
				$('#genericModalHeader').html("Kullanıcı Düzenle")
				$('#genericModalBodyRender').html(data);
				
				$('#uidEdit').val(selectedRowGen.attributes.uid)
				$('#cnEdit').val(selectedRowGen.attributes.cn)
				$('#snEdit').val(selectedRowGen.attributes.sn)
				$('#telephoneNumberEdit').val(selectedRowGen.attributes.telephoneNumber)
				$('#homePostalAddressEdit').val(selectedRowGen.attributes.homePostalAddress)
				$('#userPasswordEdit').val(selectedRowGen.userPassword)
				$('#mailEdit').val(selectedRowGen.attributes.mail)
				
				$('#editUserBtn').on('click',function(event) {
					editUser(selectedRowGen.distinguishedName)
				});
				
			} 
		);
	});
	
	$('#btnDeleteUserModal').on('click',function(event) {
		
		getModalContent("modals/user/deleteUserModal", function content(data){
				$('#genericModalHeader').html("Kullanıcı Sil")
				$('#genericModalBodyRender').html(data);
				
				$('#userInfoDelete').html(selectedRowGen.name);
				
				$('#deleteUserBtn').on('click',function(event) {
					deleteUsers(selectedRowGen)
				});
		});
	});
	
	$('#btnMoveUserModal').on('click',function(event) {
		
		getModalContent("modals/user/moveUserModal", function content(data){
			$('#genericModalHeader').html("Kullanıcı Taşı")
			$('#genericModalBodyRender').html(data);
			
			$('#infoUserMove').html(selectedRowGen.name);
			// params div, disableuser, useCheckBox, select function
			var selectedOu=null;
			createUserTree("userTree4MoveDiv", true, false,
					// row select
					function(row, rootDnUser){
						selectedOu=row;
					},
					//check action
					function(checkedRows, row){
						
					},
					//uncheck action
					function(unCheckedRows, row){
						
					}
			);
			$('#moveUserBtn').on('click',function(event) {
				moveUser(selectedRowGen,selectedOu)
			});
		});
	});
	
	$('#btnMoveOuModal').on('click',function(event) {
		
		getModalContent("modals/user/moveFolderModal", function content(data){
			$('#genericModalHeader').html("Klasör Taşı")
			$('#genericModalBodyRender').html(data);
			
			$('#infoUserFolderMove').html(selectedRowGen.name);
			// params div, disableuser, useCheckBox, select function
			var selectedOu=null;
			createUserTree("userTree4MoveFolderDiv", true, false,
			// row select
			function(row, rootDnUser){
				selectedOu=row;
			},
			//check action
			function(checkedRows, row){
				
			},
			//uncheck action
			function(unCheckedRows, row){
				
			}
			);
			$('#moveUserFolderBtn').on('click',function(event) {
				moveUserFolder(selectedFolder,selectedOu)
			});
		});
	});
	
	$('#btnChangePasswordUserModal').on('click',function(event) {
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
				
				
				fillPasswordPolicyDiv();
				
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
							$('#genericModal').trigger('click');
							var selectedData = $("#treeGridUserHolderDivGrid").jqxTreeGrid('getRow', selectedRowGen.entryUUID);
							console.log(selectedData)
							if(selectedData){
								selectedData.attributes = data.attributes
								$("#treeGridUserHolderDivGrid").jqxTreeGrid('updateRow', selectedData.entryUUID, data);
								$("#treeGridUserHolderDivGrid").jqxTreeGrid('selectRow', data.entryUUID);
							}
						},
						error: function (data, errorThrown) {
							$.notify("Kullanıcı Parolası Güncellenirken Hata Oluştu.", "error");
						}
					});
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
	var mail=$('#mail').val();
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
    
    var parentEntryUUID= row.entryUUID;
    
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
			"mail": mail
	};
    $.ajax({
		type : 'POST',
		url : 'lider/user/addUser',
		data : params,
		dataType : 'json',
		success : function(data) {
			console.log(data)
			$.notify("Kullanıcı Başarı ile eklendi.",{className: 'success',position:"right top"}  );
			$('#genericModalLarge').trigger('click');
			$('#treeGridUserHolderDivGrid').jqxTreeGrid('addRow' , data.name , data , 'last' , parentEntryUUID);
			$("#treeGridUserHolderDivGrid").jqxTreeGrid('expandRow' , parentEntryUUID);
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
		"mail": $('#mailEdit').val(), 
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
			if(selectedData){
				selectedData.attributes = data.attributes
				$("#treeGridUserHolderDivGrid").jqxTreeGrid('updateRow', selectedData.entryUUID, data);
				$("#treeGridUserHolderDivGrid").jqxTreeGrid('selectRow', data.entryUUID);
			}
			
			selectedRowGen=data;
			fillUserInfo(selectedRowGen);
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

function moveUser(selectedEntry, ou) {
		var params = {
			    "sourceDN" : selectedEntry.distinguishedName,
			    "destinationDN": ou.distinguishedName
		};
		$.ajax({ 
		    type: 'POST', 
		    url: '/lider/user/move/entry',
		    dataType: 'json',
		    data: params,
		    success: function (data) {
	            $.notify("Kayıt taşındı.", "success");
	            if(selectedEntry){
	            	$('#genericModal').trigger('click');
					$("#treeGridUserHolderDivGrid").jqxTreeGrid('deleteRow', selectedEntry.entryUUID); 
					$('#treeGridUserHolderDivGrid').jqxTreeGrid('addRow' , selectedEntry.entryUUID , selectedEntry , 'last' , ou.entryUUID);
				}
		    },
		    error: function (data, errorThrown) {
		    	$.notify("Kayıt taşınırken hata oluştu.", "error");
		    }
		});
}

function moveUserFolder(selectedEntry, ou) {
	var params = {
			"sourceDN" : selectedEntry.distinguishedName,
			"destinationDN": ou.distinguishedName
	};
	$.ajax({ 
		type: 'POST', 
		url: '/lider/user/move/entry',
		dataType: 'json',
		data: params,
		success: function (data) {
			$.notify("Kayıt taşındı.", "success");
			if(selectedEntry){
            	$('#genericModal').trigger('click');
				$("#treeGridUserHolderDivGrid").jqxTreeGrid('deleteRow', selectedEntry.entryUUID); 
				$('#treeGridUserHolderDivGrid').jqxTreeGrid('addRow' , selectedEntry.entryUUID , selectedEntry , 'last' , ou.entryUUID);
			}
		},
		error: function (data, errorThrown) {
			$.notify("Kayıt taşınırken hata oluştu.", "error");
		}
	});
}

function hideUserButtons(){
//	$("#btnEditUserModal").hide();
//	$("#btnDeleteUserModal").hide();
//	$("#btnChangePasswordUserModal").hide();
//	$("#btnSetPasswordPolicyModal").hide();
	$("#btnAddOuModal").hide();
//	$("#btnAddUserModal").hide();
	$("#btnDeleteOuModal").hide();
//	$("#btnMoveUserModal").hide();
	$("#btnMoveOuModal").hide();
//	$("#btnDisableUserModal").hide();
	$("#btnAddUserModal").hide();
}

function setUserActionButtons(row,rootDNUser){
	if(row.type =="USER"){
		$("#btnEditUserModal").show();
		$("#btnChangePasswordUserModal").show();
		$("#btnSetPasswordPolicyModal").show();
		$("#btnDeleteUserModal").show();
		$("#btnMoveUserModal").show();
		$("#btnDisableUserModal").show();
		
		$("#btnDeleteOuModal").hide();
		$("#btnAddOuModal").hide();
		$("#btnAddUserModal").hide();
		$("#btnMoveOuModal").hide();
		$("#btnFolderActions").hide();
	  }
	  else if(row.type == "ORGANIZATIONAL_UNIT"){
		  
		  $("#btnEditUserModal").hide();
		  $("#btnChangePasswordUserModal").hide();
		  $("#btnSetPasswordPolicyModal").hide();
		  $("#btnDeleteUserModal").hide();
		  $("#btnMoveUserModal").hide();
		  $("#btnDisableUserModal").hide();
		  
		  if(row.entryUUID == rootDNUser){
			  $("#btnDeleteOuModal").hide();
			  $("#btnMoveOuModal").hide();
		  }else{
			  $("#btnDeleteOuModal").show();
			  $("#btnMoveOuModal").show();
		  }
		  $("#btnAddUserModal").show();
		  $("#btnAddOuModal").show();
		  $("#btnFolderActions").show();
	  }
	  else{
		$("#btnDeleteOuModal").hide();
		$("#btnAddOuModal").hide();
		$("#btnAddUserModal").hide();
		$("#btnMoveOuModal").hide();
		$("#btnEditUserModal").hide();
		$("#btnChangePasswordUserModal").hide();
		$("#btnSetPasswordPolicyModal").hide();
		$("#btnDeleteUserModal").hide();
		$("#btnAddUserModal").hide();
//		$("#btnMoveUserModal").hide();
	  }
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

function showGroups(row){
	var memberHtml='<table class="table table-striped table-bordered " id="attrMemberTable">';
	memberHtml +='<thead> <tr><th style="width: 80%" > Kullanıcı Grup Adı </th> <th style="width: 20%"> </th></tr> </thead>';
	console.log(row)
	for (key in row.attributesMultiValues) {
		if (row.attributesMultiValues.hasOwnProperty(key)) {
			if((key == "memberOf")){
				if(row.attributesMultiValues[key].length > 1) {
					for(var i = 0; i< row.attributesMultiValues[key].length; i++) {
						memberHtml += '<tr>';
						memberHtml += '<td>' + row.attributesMultiValues[key][i] + '</td>'; 
						memberHtml += '<td> <button class="btn btn-info deleteMember" data-user='+row.name +' data-value='+row.attributesMultiValues[key][i]+' >  <i class="fas fa-minus"></i>  </button></td>'; 
						memberHtml += '</tr>';
					}
				} else {
					memberHtml += '<tr>';
					memberHtml += '<td>' + row.attributesMultiValues[key] + '</td>';
					memberHtml += '<td> <button class="btn btn-info deleteMember" data-user='+row.name +' data-value='+row.attributesMultiValues[key][i]+' > <i class="fas fa-minus"></i>  </button></td>'; 
					memberHtml += '</tr>';
				}
			}
		}
	} 
	memberHtml +='</table>';
	
	$('#groupsDiv').html(memberHtml);
	
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

function showRoles(row){
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
	
}

function getLastUser() {
	$.ajax({
		type : 'POST',
		url : 'lider/user/getLastUser',
		dataType: "json",
		success : function(ldapResult) {
			selectedRowGen=ldapResult;
			fillUserInfo(ldapResult)
			fillUserSessions(ldapResult)
//			showAttributes(ldapResult);
			showGroups(ldapResult);
			showRoles(ldapResult);
			
		},
	    error: function (data, errorThrown) {
			$.notify("Kullanıcı Bulunamadı", "warn");
		}
	 }); 
}

function fillUserInfo(ldapResult) {
	console.log(ldapResult)
	$('#userName').html("");
	$('#userAddress').html("");
	$('#userPhone').html("");
	$('#userMail').html("");
	$('#userAd').html("");
	
	$('#userId').html(ldapResult.attributes.uid);
	$('#userName').html(ldapResult.cn +" "+ldapResult.sn);
	$('#userAddress').html(ldapResult.attributes.homePostalAddress);
	$('#userPhone').html(ldapResult.attributes.telephoneNumber);
	$('#userCreateDate').html(ldapResult.createDateStr);
	$('#userMail').html(ldapResult.attributes.mail);
	$('#userHomeDirectory').html(ldapResult.attributes.homeDirectory);
	$('#userDistinguishedName').html(ldapResult.distinguishedName);
	$('#userAd').html(ldapResult.attributes.employeeType);
//	$('#userPasswordPolicy').html();
	
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

function getFormattedDate(date) {
	
	var h= date.split('T');
	console.log(h[1])
	var hours=h[1].split(':')
	var d = date.slice(0, 10).split('-');  
	return d[1] +'/'+ d[2] +'/'+ d[0] + ' '+(hours[0])+":"+hours[1]; // 10/30/2010
}

function fillUserSessions(ldapResult) {
	
	$.ajax({
		type : 'POST',
		url : 'lider/user/getUserSessions',
		data: 'uid='+ldapResult.attributes.uid,
		dataType: "json",
		success : function(sessionList) {
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
			
		},
	    error: function (data, errorThrown) {
		}
	 }); 
}
function getPasswordPolicies() {
	$.ajax({
		type : 'POST',
		url : 'lider/user/getPasswordPolices',
		dataType : 'json',
		success : function(data) {
			passwordPoliciesGen=data;
		}
	});
}
function fillPasswordPolicyDiv() {
	if(passwordPoliciesGen){
		var option='<option> Politika Seçiniz</option>'
		for (var i = 0; i < passwordPoliciesGen.length; i++) {
	    	  var row = passwordPoliciesGen[i];
	    	  option +='<option value="'+row.distinguishedName+'" >'+row.cn+'</option>'
		}
		
		$("#passwordPolicyList").append(option)
		
		$("#passwordPolicyList").on('change', function(event) {
			var selectedVal=$("#passwordPolicyList").val();
			var selectedPolicy=""
				for (var k = 0; k < passwordPoliciesGen.length; k++) {
			    	  var row = passwordPoliciesGen[k];
			    	  if(row.distinguishedName==selectedVal){
			    		  selectedPolicy=row
			    	  }
				}
			var html='<table class="table">';
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
	}	
}
