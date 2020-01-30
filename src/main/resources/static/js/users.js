/**
 * When page loading getting users from LDAP and ldap users tree fill out on the treegrid that used jqxTreeGrid api..
 * M. Edip YILDIZ
 * 
 */
$(document).ready(function(){
	getUsers();
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
			getOus();
			
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
		var checkedRows = $("#treeGridUser").jqxTreeGrid('getCheckedRows');
		if(checkedRows.length==0){
			$.notify("Lütfen Kullanıcı Ağacından Kayıt Seçiniz.", "warn");
			return
		}
		getModalContent("modals/user/changePasswordUserModal", function content(data){
			$('#genericModalHeader').html("Parola Güncelle")
			$('#genericModalBodyRender').html(data);
			
			
			
		});
	});
});

function getUsers(){
	
	$.ajax({
		type : 'POST',
		url : 'lider/ldap/getUsers',
		dataType : 'json',
		success : function(data) {
			 var source =
			  {
			      dataType: "json",
			      dataFields: [
			           { name: "name", type: "string" },
			           { name: "online", type: "string" },
			           { name: "uid", type: "string" },
			           { name: "type", type: "string" },
			           { name: "cn", type: "string" },
			           { name: "ou", type: "string" },
			           { name: "parent", type: "string" },
			           { name: "distinguishedName", type: "string" },
			           { name: "hasSubordinates", type: "string" },
			           { name: "expandedUser", type: "string" },
			           { name: "entryUUID", type: "string" },
			           { name: "attributes", type: "array" },
			           { name: "childEntries", type: "array" }
			      ],
			      hierarchy:
			          {
			              root: "childEntries"
			          },
			      localData: data,
			      id: "entryUUID"
			  };
			 createUserTreeGrid(source);
		}
	});
}
function getOus(){
	$.ajax({
		type : 'POST',
		url : 'lider/ldap/getUsers',
		dataType : 'json',
		success : function(data) {
			var source =
			{
					dataType: "json",
					dataFields: [
						{ name: "name", type: "string" },
						{ name: "online", type: "string" },
						{ name: "uid", type: "string" },
						{ name: "type", type: "string" },
						{ name: "cn", type: "string" },
						{ name: "ou", type: "string" },
						{ name: "parent", type: "string" },
						{ name: "distinguishedName", type: "string" },
						{ name: "hasSubordinates", type: "string" },
						{ name: "expandedUser", type: "string" },
						{ name: "entryUUID", type: "string" },
						{ name: "attributes", type: "array" },
						{ name: "childEntries", type: "array" }
						],
						hierarchy:
						{
							root: "childEntries"
						},
						localData: data,
						id: "name"
			};
			console.log(source)
			//create UserTreeGridForUserAdd..show only ou and single selection
			createUserTreeGridForUserAdd(source);
		}
	
	});
}

function createUserTreeGrid(source) {
	
	$("#treeGridUser").jqxTreeGrid('destroy');
	
	$("#treeGridUserHolderDiv").append('<div id="treeGridUser"></div> ')
	
	var dataAdapter = new $.jqx.dataAdapter(source, {
	     loadComplete: function () {
	     }
	 });
	 
	 var getLocalization = function () {
           var localizationobj = {};
           localizationobj.filterSearchString = "Ara :";
           return localizationobj;
	}
	 // create jqxTreeGrid.
	 $("#treeGridUser").jqxTreeGrid({
		 theme :"Orange",
		 width: '100%',
		 source: dataAdapter,
	     altRows: true,
	     sortable: true,
	     columnsResize: true,
         filterable: true,
	     hierarchicalCheckboxes: true,
	     pageable: true,
         pagerMode: 'default',
	     checkboxes: true,
	     filterMode: "simple",
	     localization: getLocalization(),
	     pageSize: 50,
	     pageSizeOptions: ['15', '25', '50'],
	     icons: function (rowKey, dataRow) {
	    	    var level = dataRow.level;
	    	    if(dataRow.type == "USER"){
	    	        return "img/checked-user-32.png";
	    	    }
	    	    else return "img/folder.png";
	    	},
	     ready: function () {
	    	 var allrows =$("#treeGridUser").jqxTreeGrid('getRows');
	    	 if(allrows.length==1){
	    		 var row=allrows[0];
	    		 if(row.childEntries==null ){
	    			 
	    			 $("#treeGridUser").jqxTreeGrid('addRow', row.entryUUID+"1", {}, 'last', row.entryUUID);
	    		 }
	    	 }
	    	 $("#treeGridUser").jqxTreeGrid('collapseAll');
	    	 
	     },
	     
	     rendered: function () {
	   	},
	     columns: [
	       { text: "Kullanıcılar", align: "center", dataField: "name", width: '100%' }
	     ]
	 });
	 
	 $('#treeGridUser').on('rowSelect', function (event) {
	        var args = event.args;
		    var row = args.row;
		    var name= row.name;
	        	       
	        var html = '<table class="table table-striped table-bordered " id="attrTable">';
			html += '<thead>';
			html += '<tr>';
			html += '<th style="width: 40%"></th>';
			html += '<th style="width: 60%"></th>';
			html += '</tr>';
			html += '</thead>';
	        
	        for (key in row.attributes) {
	            if (row.attributes.hasOwnProperty(key)) {
	                console.log(key + " = " + row.attributes[key]);
	                
	                if( (   key =="homeDirectory") 
	                		|| (key =="cn") 
	                		|| (key =="uid") 
	                		|| (key =="uidNumber") 
	                		|| (key =="gidNumber") 
	                		|| (key =="sn") 
	                		|| (key =="homePostalAddress") 
	                		|| (key =="telephoneNumber") 
	                		|| (key =="entryDN") 
	                		){
	                	html += '<tr>';
			            html += '<td>' + key + '</td>';
			            html += '<td>' + row.attributes[key] + '</td>';
			            html += '</tr>';
	                }
	            }
	        } 
	        html += '</table>';
	        
		    $('#selectedDnInfo').html("Seçili Kayıt: "+name);
		    $('#ldapAttrInfoHolder').html(html);
		    
		    $('.nav-link').each(function(){               
		    	  var $tweet = $(this);                    
		    	  $tweet.removeClass('active');
		    	});
		 
		    $('#tab-c-0').tab('show');

	    });
	 
		$('#treeGridUser').on('rowCheck', function (event) {
		      var args = event.args;
		      var row = args.row;
		      var checkedRows = $("#treeGridUser").jqxTreeGrid('getCheckedRows');
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
		 });
		
		$('#treeGridUser').on('rowUncheck', function (event) {
			  var args = event.args;
			  var row = args.row;
			  var checkedRows = $("#treeGridUser").jqxTreeGrid('getCheckedRows');
				
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
		});
		  
		$('#treeGridUser').on('rowExpand', function (event) {
		     var args = event.args;
		     var row = args.row;
		     if(row.expandedUser=="FALSE") {
			     
			      var nameList=[];
			      
			      for (var m = 0; m < row.records.length; m++) {
			    	  var childRow = row.records[m];
						nameList.push(childRow.uid);      
				  }
			      
			      for (var k = 0; k < nameList.length; k++) {
						          // get a row.
					  var childRowname = nameList[k];
					  $("#treeGridUser").jqxTreeGrid('deleteRow', childRowname); 
				  }  
			      $.ajax({
						type : 'POST',
						url : 'lider/ldap/getOuDetails',
						data : 'uid=' + row.distinguishedName + '&type=' + row.type
								+ '&name=' + row.name + '&parent=' + row.parent,
						dataType : 'text',
						success : function(ldapResult) {
							var childs = jQuery.parseJSON(ldapResult);
							 for (var m = 0; m < childs.length; m++) {
								 	// get a row.
						          	var childRow = childs[m];
						          		console.log(childRow)
							          $("#treeGridUser").jqxTreeGrid('addRow', childRow.entryUUID, childRow, 'last', row.entryUUID);
							          if(childRow.hasSubordinates=="TRUE"){
							           $("#treeGridUser").jqxTreeGrid('addRow', childRow.entryUUID+"1" , {}, 'last', childRow.entryUUID); 
							          }
							           $("#treeGridUser").jqxTreeGrid('collapseRow', childRow.name);
						      } 
							 row.expandedUser="TRUE"
						}
			
					});  
		      }
		 }); 
}

function createUserTreeGridForUserAdd(source) {
	$("#treeGridAddUserModal").jqxTreeGrid('destroy');
	
	$("#treeGridAddUserHolderDiv").append('<div id="treeGridAddUserModal"></div> ')
	
	var dataAdapter = new $.jqx.dataAdapter(source, {
		loadComplete: function () {
		}
	});
	
	var getLocalization = function () {
		var localizationobj = {};
		localizationobj.filterSearchString = "Ara :";
		return localizationobj;
	}
	// create jqxTreeGrid.
	$("#treeGridAddUserModal").jqxTreeGrid(
			{
				theme :"Orange",
				width: '100%',
				source: dataAdapter,
				altRows: true,
				sortable: true,
				columnsResize: true,
				hierarchicalCheckboxes: false,
				pageable: true,
				pagerMode: 'default',
				checkboxes: true,
				localization: getLocalization(),
				pageSize: 50,
				selectionMode: "singleRow",
				pageSizeOptions: ['15', '25', '50'],
				icons: function (rowKey, dataRow) {
					var level = dataRow.level;
					if(dataRow.type == "USER"){
						return "img/checked-user-32.png";
					}
					else return "img/entry_org.gif";
				},
				ready: function () {
					var allrows =$("#treeGridAddUserModal").jqxTreeGrid('getRows');
					if(allrows.length==1){
						var row=allrows[0];
						if(row.childEntries==null ){
							
							$("#treeGridAddUserModal").jqxTreeGrid('addRow', row.name+"1", {}, 'last', row.name);
						}
					}
					$("#treeGridAddUserModal").jqxTreeGrid('collapseAll');
					
				},
				
				rendered: function () {
				},
				columns: [
					{ text: "Eklenecek Klasör", align: "center", dataField: "name", width: '100%', height:'100%'}
					]
			});
	
	
	$('#treeGridAddUserModal').on('rowExpand', function (event) {
		var args = event.args;
		var row = args.row;
		console.log(row)
		if(row.expandedUser=="FALSE") {
			var nameList=[];
			for (var m = 0; m < row.records.length; m++) {
				var childRow = row.records[m];
				nameList.push(childRow.name);      
			}
			for (var k = 0; k < nameList.length; k++) {
				// get a row.
				var childRowname = nameList[k];
				$("#treeGridAddUserModal").jqxTreeGrid('deleteRow', childRowname); 
			}  
			$.ajax({
				type : 'POST',
				url : 'lider/ldap/getOu',
				data : 'uid=' + row.distinguishedName + '&type=' + row.type+ '&name=' + row.name + '&parent=' + row.parent,
				dataType : 'text',
				success : function(ldapResult) {
					var childs = jQuery.parseJSON(ldapResult);
					for (var m = 0; m < childs.length; m++) {
						// get a row.
						var childRow = childs[m];
						$("#treeGridAddUserModal").jqxTreeGrid('addRow', childRow.name, childRow, 'last', row.name);
						if(childRow.hasSubordinates=="TRUE"){
							$("#treeGridAddUserModal").jqxTreeGrid('addRow', childRow.name+"1" , {}, 'last', childRow.name); 
						}
						$("#treeGridAddUserModal").jqxTreeGrid('collapseRow', childRow.name);
					} 
					row.expandedUser="TRUE"
				}
			
			});  
		}
	}); 
}

function addUser() {
	var checkedRows = $("#treeGridAddUserModal").jqxTreeGrid('getCheckedRows');
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
	var splChars = "+=.@*!";
	
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
		url : 'lider/ldap/addUser',
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
		url : 'lider/ldap/deleteUser',
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
		url : 'lider/ldap/editUser',
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

function hideButtons(){
	$("#btnEditUserModal").hide();
	$("#btnOpenDeleteUserModal").hide();
	$("#btnOpenEditUserModal").hide();
	$("#btnOpenChangePasswordUserModal").hide();
}

function showButtons(){
	$("#btnEditUserModal").show();
	$("#btnOpenDeleteUserModal").show();
	$("#btnOpenEditUserModal").show();
	$("#btnOpenChangePasswordUserModal").show();
}
