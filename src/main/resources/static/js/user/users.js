/**
 * When page loading getting users from LDAP 
 * and ldap users tree fill out on the treegrid 
 * that used jqxTreeGrid api..
 * M. Edip YILDIZ
 */

var treeGridHolderDiv="treeGridUserHolderDiv"
var selectedRowGen=null;

$(document).ready(function(){
	renderUserTree();
	getLastUser();
	
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
						$('#userName').html(row.cn +" "+row.sn);
						fillGeneralInfoTab(row);
						fillGroupListTab(row);
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
			$('#userName').html(row.cn +" "+row.sn);
			selectedRowGen=row;
			fillGeneralInfoTab(row);
			fillGroupListTab(row);
		},
	    error: function (data, errorThrown) {
			$.notify("Kullanıcı Bulunamadı", "warn");
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
	var memberHtml='<table class="table table-striped table-bordered " id="attrMemberTable">';
	memberHtml +='<thead> <tr><th style="width: 90%" > Kullanıcı Grup Adı </th> <th style="width: 10%;" > </th></tr> </thead>';
	var isGroupExist=false;
	for (key in row.attributesMultiValues) {
		if (row.attributesMultiValues.hasOwnProperty(key)) {
			if((key == "memberOf")){
				if(row.attributesMultiValues[key].length > 1) {
					isGroupExist=true;
					for(var i = 0; i< row.attributesMultiValues[key].length; i++) {
						memberHtml += '<tr>';
						memberHtml += '<td>' + row.attributesMultiValues[key][i] + '</td>'; 
						memberHtml += '<td> <div class="text-center"> <button class="btn btn-sm deleteMember mr-2 btn-icon btn-icon-only btn-outline-danger" title="Gruptan Çıkar" data-user='+row.name +' data-value='+row.attributesMultiValues[key][i]+' >  <i class="pe-7s-trash btn-icon-wrapper"></i>  </button> </div> </td>'; 
						memberHtml += '</tr>';
					}
				} else {
					isGroupExist=true;
					memberHtml += '<tr>';
					memberHtml += '<td>' + row.attributesMultiValues[key] + '</td>';
					memberHtml += '<td> <div class="text-center">  <button class="btn btn-sm deleteMember mr-2 btn-icon btn-icon-only btn-outline-danger" title="Gruptan Çıkar" data-user='+row.name +' data-value='+row.attributesMultiValues[key][i]+' > <i class="pe-7s-trash btn-icon-wrapper"></i>  </button>  </div> </td>'; 
					memberHtml += '</tr>';
				}
			}
		}
	} 
	memberHtml +='</table>';
	
	$('#groupsDiv').html(memberHtml);
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

