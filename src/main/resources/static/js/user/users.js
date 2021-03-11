/**
 * When page loading getting users from LDAP 
 * and ldap users tree fill out on the treegrid 
 * that used jqxTreeGrid api..
 * M. Edip YILDIZ
 */

var treeGridHolderDiv="treeGridUserHolderDiv"
var selectedRowGen=null;
var systemSettings=null;

$(document).ready(function(){
	renderUserTree();
	getLastUser();
	
	//getting some setting params to use
	getConfigurationParams();
	
	$('#btnTreeRefresh').on('click',function(event) {
		renderUserTree();
	});
	
	$('#btnMoveOuUserModal').on('click',function(event) {
		var selectedRowForMove=null;
		
		getModalContent("modals/user/moveFolderModal", function content(data){
			$('#genericModalHeader').html("Klasör Taşı")
			$('#genericModalBodyRender').html(data);
			
			$('#userTree4MoveFolderDiv').html("");
			
			// params div, disableuser, useCheckBox, select function
			var selectedOu=null;
			createUserTree("userTree4MoveFolderDiv", true, false,
						// row select
						function(row, rootDnUser){
							selectedRowForMove=row;
						},
						//check action
						function(checkedRows, row){
							
						},
						//uncheck action
						function(unCheckedRows, row){
							
						},
						// post tree created
						function(root , treeGridId){
							$('#'+ treeGridId).jqxTreeGrid('selectRow', root);
							$('#'+ treeGridId).jqxTreeGrid('expandRow', root);
						},
						false
			);
			$('#moveUserFolderBtn').on('click',function(event) {
				moveUserFolder(selectedRowGen,selectedRowForMove);
			});
		});
	});
	
	$('#btnAddUserModal').on('click',function(event) {
		openAddUserModal()
	});

	$('#btnAddUserModalBaseDn').on('click',function(event) {
		openAddUserModal()
	});
	
	$('#updateUserPasswordBtn').on('click',function(event) {
		var userPassword  =$('#newUserPassword').val()
		var confirmPassword  =$('#newConfirmPassword').val()
		
		var lowerCase = "abcdefghijklmnopqrstuvwxyz";
		var upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		var digits = "0123456789";
//		var splChars = "+=.@*!_";
		
		var ucaseFlag = contains(userPassword, upperCase);
	    var lcaseFlag = contains(userPassword, lowerCase);
	    var digitsFlag = contains(userPassword, digits);
//	    var splCharsFlag = contains(userPassword, splChars);
	    if(userPassword!=confirmPassword){
			$.notify("Parolalar uyuşmamaktadır.","warn"  );
			return
		}
	   // if(userPassword.length < 8 || !ucaseFlag || !lcaseFlag || !digitsFlag || !splCharsFlag){
	    if(userPassword.length < 6 || !ucaseFlag || !lcaseFlag || !digitsFlag ){
	    	$.notify("Parola en az 6 karakter olmalıdır. En az bir büyük harf, küçük harf, sayı ve karakter içermelidir.","warn");
	    	return
	    }
	    updateUserPassword(selectedRowGen.distinguishedName)
	});
	
	$('#btnMoveUserModal').on('click',function(event) {
		
		getModalContent("modals/user/moveUserModal", function content(data){
			$('#genericModalHeader').html("Kullanıcı Taşı")
			$('#genericModalBodyRender').html(data);
			
			$('#infoUserMove').html(selectedRowGen.name);
			
			$('#userTree4MoveDiv').html("");
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
						
					},
					// post tree created
					function(root , treeGridId){
						$('#'+ treeGridId).jqxTreeGrid('selectRow', root);
						$('#'+ treeGridId).jqxTreeGrid('expandRow', root);
					}
			);
			$('#moveUserBtn').on('click',function(event) {
				moveUser(selectedRowGen,selectedOu)
			});
		});
	});
	
	$('#btnDeleteUserModal').on('click',function(event) {
		getModalContent("modals/user/deleteUserModal", function content(data){
				$('#genericModalHeader').html("Kullanıcı Sil")
				$('#genericModalBodyRender').html(data);
				
				$('#userInfoDelete').html(selectedRow.name);
				
				$('#deleteUserBtn').on('click',function(event) {
					deleteUsers(selectedRow);
					getLastUser();
				});
		});
	});
	
	$('#btnAddOuModalBaseDn').on('click',function(event) {
		openAddUserOuModal()
	});
	$('#btnAddOuModal').on('click',function(event) {
		openAddUserOuModal()
	});
	
	// Create ou for selected parent node. Ou modal will be open for all releated pages..
	$('#btnDeleteUserOuModal').on('click',function(event) {
		getModalContent("modals/user/deleteOuModal", function content(data){
			$('#genericModalHeader').html("Klasör Sil")
			$('#genericModalBodyRender').html(data);
			
			$('#deleteUserOuBtn').on('click', function (event) {
				deleteUserOu(selectedRow)
				getLastUser();
			});
		} 
		);
	});
	
});

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
            	renderUserTree();
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
            	renderUserTree();
			}
		},
		error: function (data, errorThrown) {
			$.notify("Kayıt taşınırken hata oluştu.", "error");
		}
	});
}

function renderUserTree() {
		$('#'+treeGridHolderDiv).html("");
		createUserTree(treeGridHolderDiv, false, false,
				function(row, rootDnUser){
					selectedRowGen=row;
			
					if(row.type=='USER'){
						clear(row);
						fillGeneralInfoTab(row);
						fillGroupListTab(row);
						fillUserSessions(row);
					}
				},
				//check action
				function(checkedRows, row){
				},
				//uncheck action
				function(unCheckedRows, row){
				},
				// post tree created
				function(root , treeGridId){
					$('#'+ treeGridId).jqxTreeGrid('selectRow', root);
					$('#'+ treeGridId).jqxTreeGrid('expandRow', root);
				},
				//create pop up
				true
		);
}

function getLastUser() {
	$.ajax({
		type : 'POST',
		url : 'lider/user/getLastUser',
		dataType: "json",
		success : function(row) {
			clear(row);
			selectedRowGen=row;
			fillGeneralInfoTab(row);
			fillGroupListTab(row);
		},
	    error: function (data, errorThrown) {
			$.notify("Kullanıcı Bulunamadı", "warn");
		}
	 }); 
}

function clear(row) {
	$('#userName').html(row.cn +" "+row.sn);
	$('#newUserPassword').html("");
	$('#newConfirmPassword').html("");
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

function fillGeneralInfoTab(row) {
	$('#uidEdit').val("")
	$('#cnEdit').val("")
	$('#snEdit').val("")
	$('#telephoneNumberEdit').val("")
	$('#homePostalAddressEdit').val("")
	$('#userPasswordEdit').val("")
	$('#mailEdit').val("")
	
	$('#uidEdit').val(row.attributes.uid)
	$('#cnEdit').val(row.attributes.cn)
	$('#snEdit').val(row.attributes.sn)
	$('#telephoneNumberEdit').val(row.attributes.telephoneNumber)
	$('#homePostalAddressEdit').val(row.attributes.homePostalAddress)
	$('#userPasswordEdit').val(row.userPassword)
	$('#mailEdit').val(row.attributes.mail)
}

function fillGroupListTab(row) {
	
	var params = {
			"searchDn" : systemSettings.groupLdapBaseDn,
			"key" : 'member',
			"value": row.distinguishedName
	};
	
	$.ajax({
		type : 'POST',
		url : 'lider/ldap/searchEntry',
		data : params,
		dataType: "json",
		success : function(ldapResult) {
			var memberHtml='<table class="table table-striped table-bordered " id="attrMemberTable">';
			memberHtml +='<thead> <tr><th style="width: 90%" > Kullanıcı Grup Adı </th> <th style="width: 10%;" > </th></tr> </thead>';
			
			for (var i = 0; i < ldapResult.length; i++) {
		    	 var entry = ldapResult[i];
		    	memberHtml += '<tr>'
		    	memberHtml += '<td>'+entry.distinguishedName+ '</td>'
		    	memberHtml += '<td> <div class="text-center">  <button class="btn btn-sm  mr-2 btn-icon btn-icon-only btn-outline-danger deleteMember " title="Gruptan Çıkar"  data-value='+entry.distinguishedName+' > <i class="pe-7s-trash btn-icon-wrapper"></i>  </button>  </div>  </td>'
		    	memberHtml += '</tr>'
			}
			$('#groupsDiv').html(memberHtml);
			$('.deleteMember').on('click',function() {
				var userDn = selectedRowGen.distinguishedName;
				var groupDn = $(this).data('value');
				var params = {
						"dn" : groupDn,
						"attribute" : "member",
						"value": userDn
				};
				$.ajax({
					type : 'POST',
					url : 'lider/user/removeAttributeWithValue',
					data : params,
					dataType: "json",
					success : function(ldapResult) {
						fillGroupListTab(selectedRowGen);
					},
				    error: function (data, errorThrown) {
						$.notify("Grupta en az bir üye bulunmalıdır.", "error");
					}
				 }); 
				
			});
			
		},
	    error: function (data, errorThrown) {
			$.notify("Hata Oluştu.", "error");
		}
	 }); 
}



function getFormattedDate(date) {
	
	var h= date.split('T');
	var hours=h[1].split(':')
	var d = date.slice(0, 10).split('-');  
	return d[1] +'/'+ d[2] +'/'+ d[0] + ' '+(hours[0])+":"+hours[1]; // 10/30/2010
}



function showNewPassword() {
	if ($('#newUserPassword').attr('type') == "text") {
		$("#newUserPassword").attr("type","password");
		$("#newConsoleUserPasswordShowBtn").html('<i class="fas fa-eye-slash"></i>');
	} else {
		$("#newUserPassword").attr("type","text");
		$("#newConsoleUserPasswordShowBtn").html('<i class="fas fa-eye"></i>');
	}
}

function showNewConfirmPassword() {
	if ($('#newConfirmPassword').attr('type') == "text") {
		$("#newConfirmPassword").attr("type","password");
		$("#newConsoleUserConfirmPasswordShowBtn").html('<i class="fas fa-eye-slash"></i>');
	} else {
		$("#newConfirmPassword").attr("type","text");
		$("#newConsoleUserConfirmPasswordShowBtn").html('<i class="fas fa-eye"></i>');
	}
}
function showNewPasswordUserAdd() {
	if ($('#userPassword').attr('type') == "text") {
		$("#userPassword").attr("type","password");
		$("#newConsoleUserPasswordShowBtnNew").html('<i class="fas fa-eye-slash"></i>');
	} else {
		$("#userPassword").attr("type","text");
		$("#newConsoleUserPasswordShowBtnNew").html('<i class="fas fa-eye"></i>');
	}
}

function showNewConfirmPasswordUserAdd() {
	if ($('#confirm_password').attr('type') == "text") {
		$("#confirm_password").attr("type","password");
		$("#newConsoleUserConfirmPasswordShowBtnNew").html('<i class="fas fa-eye-slash"></i>');
	} else {
		$("#confirm_password").attr("type","text");
		$("#newConsoleUserConfirmPasswordShowBtnNew").html('<i class="fas fa-eye"></i>');
	}
}

function openAddUserModal() {
	if(selectedRow==null){
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
				
				userFolderInfo.append("Seçili Klasör : "+selectedRow.name);
				$('#addUserBtn').on('click',function(event) {
					var parentEntryUUID= selectedRow.entryUUID;
					addUser(selectedRow.distinguishedName,
							function(data){
									$('#genericModalLarge').trigger('click');
//									$('#treeGridUserHolderDivGrid').jqxTreeGrid('addRow' , data.name , data , 'last' , parentEntryUUID);
//									$("#treeGridUserHolderDivGrid").jqxTreeGrid('expandRow' , parentEntryUUID);
									renderUserTree();
							}
					)
				});
			} 
		);
	}
}

function openAddUserOuModal() {
	if(selectedRow==null){
		$.notify("Lütfen Klasör Seçiniz","warn"  );
	}
	else{
		getModalContent("modals/user/addOuModal", function content(data){
				$('#genericModalHeader').html("Klasör Yönetimi")
				$('#genericModalBodyRender').html(data);
				
				$('#ouInfo').html(selectedRow.name +"/");
				
				$('#addOu').on('click', function (event) {
						var parentDn=selectedRow.distinguishedName; 
						var parentName= selectedRow.name;
						var parentEntryUUID= selectedRow.entryUUID;
						
						var ouName= $('#ouName').val();
						$.ajax({
							type : 'POST',
							url : 'lider/user/addOu',
							data: 'parentName='+parentDn +'&ou='+ouName,
							dataType : 'json',
							success : function(data) {
								$.notify("Klasör Başarı İle Eklendi.", "success");
								$('#genericModal').trigger('click');
								renderUserTree();
							}
						});
				});
			} 
		);
	}
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

function fillUserSessions(ldapResult) {
	$.ajax({
		type : 'POST',
		url : 'lider/user/getUserSessions',
		data: 'uid='+ldapResult.attributes.uid,
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
				
				for (var m = 0; m < sessionList.length; m++) {
					var row = sessionList[m];
					
					html += '<tr>';
					html += '<td > <img src="img/linux.png" class="avatar" alt="Avatar"> </td>';
			        html += '<td >' + row.agent.hostname + '</td>';
			        html += '<td >' + row.agent.ipAddresses + '</td>';
			        var eventStr=""
			        if(row.sessionEvent=='LOGIN') {eventStr="Oturum Açıldı"}
			        if(row.sessionEvent=='LOGOUT') {eventStr="Oturum Kapatıldı"}
			        html += '<td >' + eventStr + '</td>';
			        html += '<td >' + getFormattedDate(row.createDate) + '</td>';
					html += '</tr>';
					
				}
				html += '</table>';
				$("#sessionListDiv").html(html);
			}
			else{
				$("#sessionListDiv").html("");
			}
			
		},
	    error: function (data, errorThrown) {
		}
	 }); 
}

function getConfigurationParams() {
	$.ajax({ 
		type: 'GET', 
		url: "/lider/config/configurations",
		dataType: 'json',
		success: function (data) { 
			if(data != null) {
				//set ldap configuration
				systemSettings=data;
			}
		},
		error: function (data, errorThrown) {
			$.notify("Ayarlar getirilirken hata oluştu. Lütfen tekrar deneyiniz.", "error");
		}
	});
}

