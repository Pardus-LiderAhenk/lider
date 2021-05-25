/**
 * userTree component 
 * this component can be use for user tree
 * edip.yildiz
 * @param page
 * @param callback
 * @returns
 */

var selectedRow=null;

function createUserTree(treeHolderDiv,showOnlyFolder,useCheckBox, rowSelectAction, rowCheckAction, rowUncheckAction, postTreeCreatedAction,createPopupMenu) {
	var rootDNUser = null;
	var treeGridId=treeHolderDiv+"Grid";
	/**
	 * create search area
	 */
	createUserSearch(treeHolderDiv,treeGridId,showOnlyFolder);
	
	/**
	 * get root dn for user and set treegrid tree
	 */
	$.ajax({
		type : 'POST',
		url : 'lider/user/getUsers',
		dataType : 'json',
		success : function(data) {
			rootDNUser = null;
			
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
			           { name: "attributesMultiValues", type: "array" },
			           { name: "childEntries", type: "array" }
			      ],
			      hierarchy:
			          {
			              root: "childEntries"
			          },
			      localData: data,
			      id: "entryUUID"
			  };
			 
			    rootDNUser = source.localData[0].entryUUID;
//			 	$('#'+treeGridId).jqxTreeGrid('destroy');
			 	
			 	$('#'+treeHolderDiv).append('<div id="'+treeGridId+'"></div> ')
				
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
				 $('#'+treeGridId).jqxTreeGrid({
					 width: '100%',
					 height: 590,
					 source: dataAdapter,
				     altRows: true,
				     sortable: true,
				     columnsResize: true,
			         filterable: false,
				     hierarchicalCheckboxes: useCheckBox,
				     pageable: true,
			         pagerMode: 'default',
				     checkboxes: useCheckBox,
				     filterMode: "simple",
				     selectionMode: "singleRow",
				     localization: getLocalization(),
				     pageSize: 100,
				     pageSizeOptions: ['15', '25', '100'],
				     icons: function (rowKey, dataRow) {
				    	    var level = dataRow.level;
				    	    if(dataRow.type == "USER"){
				    	        return "img/person.png";
				    	    }
				    	    else return "img/folder.png";
				    	},
				     ready: function () {
				    	 var allrows =$('#'+treeGridId).jqxTreeGrid('getRows');
				    	 var main=null
				    	 if(allrows.length==1){
				    		 var row=allrows[0];
				    		 if(row.childEntries==null ){
				    			 $('#'+treeGridId).jqxTreeGrid('addRow', row.entryUUID+"1", {}, 'last', row.entryUUID);
				    			 main=row.entryUUID
				    		 }
				    	 }
				    	 $('#'+treeGridId).jqxTreeGrid('collapseAll');
				     },
				     rendered: function () {
				   	 },
				     columns: [
				       { text: "Kullanıcılar", align: "center", dataField: "name", width: '100%' }
				     ]
				 });
				 
				 if(createPopupMenu == true){
					 var baseDnUserMenuDiv=$("#baseDnUserMenuDiv").jqxMenu({ width: 250, height: 90, autoOpenPopup: false, mode: 'popup' });
					 var userFolderPopUpMenuDiv=$("#userFolderPopUpMenuDiv").jqxMenu({ width: 250, height: 180, autoOpenPopup: false, mode: 'popup' });
					 var userPopUpMenuDiv=$("#userPopUpMenuDiv").jqxMenu({ width: 250, height: 90, autoOpenPopup: false, mode: 'popup' });
					 
					 	$('#'+treeGridId).on('contextmenu', function () {
			                return false;
			            });
				
					    $('#'+treeGridId).on('rowClick', function (event) {
			            	var args = event.args;
			                var row = args.row;
			                if ( args.originalEvent.button == 2) {
			                    var scrollTop = $(window).scrollTop();
			                    var scrollLeft = $(window).scrollLeft();
			                    if(row.type==null){
			                    	if(baseDnUserMenuDiv!=null)
				                		baseDnUserMenuDiv.jqxMenu('close');
				                	if(userFolderPopUpMenuDiv!=null)
				                		userFolderPopUpMenuDiv.jqxMenu('close');
				                	if(userPopUpMenuDiv!=null)
				                		userPopUpMenuDiv.jqxMenu('close');
			                    }
			                    else if(row.level==0){ // this is for root dn
			                    	userFolderPopUpMenuDiv.jqxMenu('close');
			                    	userPopUpMenuDiv.jqxMenu('close');
			                    	baseDnUserMenuDiv.jqxMenu('open', parseInt(event.args.originalEvent.clientX) + 20 + scrollLeft, parseInt(event.args.originalEvent.clientY) + 5 + scrollTop);
			                    }
			                    else if(row.type=="ORGANIZATIONAL_UNIT"){
			                    	userPopUpMenuDiv.jqxMenu('close');
			                    	baseDnUserMenuDiv.jqxMenu('close');
			                    	userFolderPopUpMenuDiv.jqxMenu('open', parseInt(event.args.originalEvent.clientX) + 20 + scrollLeft, parseInt(event.args.originalEvent.clientY) + 5 + scrollTop);
			                    }
			                    else if(row.type=="USER"){
			                    	baseDnUserMenuDiv.jqxMenu('close');
			                    	userFolderPopUpMenuDiv.jqxMenu('close');
			                    	userPopUpMenuDiv.jqxMenu('open', parseInt(event.args.originalEvent.clientX) + 20 + scrollLeft, parseInt(event.args.originalEvent.clientY) + 5 + scrollTop);
			                    }
			                    else{
			                    	if(baseDnUserMenuDiv!=null)
				                		baseDnUserMenuDiv.jqxMenu('close');
				                	if(userFolderPopUpMenuDiv!=null)
				                		userFolderPopUpMenuDiv.jqxMenu('close');
				                	if(userPopUpMenuDiv!=null)
				                		userPopUpMenuDiv.jqxMenu('close');
			                    }
			                    return false;
			                }
			                else{
			                	if(baseDnUserMenuDiv!=null)
			                		baseDnUserMenuDiv.jqxMenu('close');
			                	if(userFolderPopUpMenuDiv!=null)
			                		userFolderPopUpMenuDiv.jqxMenu('close');
			                	if(userPopUpMenuDiv!=null)
			                		userPopUpMenuDiv.jqxMenu('close');
			                }
			            });
				 }
				 
				 	$('#'+treeGridId).on('rowSelect', function (event) {
				        var args = event.args;
					    var row = args.row;
					    var name= row.name;
					    selectedRow=row;
					    rowSelectAction(row,rootDNUser);

				    });
				 
					$('#'+treeGridId).on('rowCheck', function (event) {
					      var args = event.args;
					      var row = args.row;
					      var checkedRows = $('#'+treeGridId).jqxTreeGrid('getCheckedRows');
					      rowCheckAction(checkedRows, row)
					      
					 });
					
					$('#'+treeGridId).on('rowUncheck', function (event) {
						  var args = event.args;
						  var row = args.row;
						  var checkedRows = $('#'+treeGridId).jqxTreeGrid('getCheckedRows');
						  rowUncheckAction(checkedRows, row)
					});
					  
					$('#'+treeGridId).on('rowExpand', function (event) {
					     var args = event.args;
					     var row = args.row;
					     if(row.expandedUser=="FALSE") {
					    	 progress("treeGridUserHolderDiv","progressUserTree",'show')
						      var nameList=[];
						      
						      for (var m = 0; m < row.records.length; m++) {
						    	  var childRow = row.records[m];
									nameList.push(childRow.uid);      
							  }
						      
						      for (var k = 0; k < nameList.length; k++) {
									          // get a row.
								  var childRowname = nameList[k];
								  $('#'+treeGridId).jqxTreeGrid('deleteRow', childRowname); 
							  } 
						      
						      var urlPath=""
						      if(showOnlyFolder){
						    	  urlPath= 'lider/user/getOu'; 
						      }
						      else{
						    	  urlPath= 'lider/user/getOuDetails';
						      }
						      $.ajax({
									type : 'POST',
									url : urlPath,
									data : 'uid=' + row.distinguishedName + '&type=' + row.type
											+ '&name=' + row.name + '&parent=' + row.parent,
									dataType : 'text',
									success : function(ldapResult) {
										var childs = jQuery.parseJSON(ldapResult);
										 for (var m = 0; m < childs.length; m++) {
											 	// get a row.
									          	var childRow = childs[m];
										          $('#'+treeGridId).jqxTreeGrid('addRow', childRow.entryUUID, childRow, 'last', row.entryUUID);
										          if(childRow.hasSubordinates=="TRUE"){
										           $('#'+treeGridId).jqxTreeGrid('addRow', childRow.entryUUID+"1" , {}, 'last', childRow.entryUUID); 
										          }
										           $('#'+treeGridId).jqxTreeGrid('collapseRow', childRow.name);
									      } 
										 row.expandedUser="TRUE"
										 progress("treeGridUserHolderDiv","progressUserTree",'hide')
									}
								});  
					      }
					 }); 
					if(postTreeCreatedAction!=null){
						postTreeCreatedAction(rootDNUser , treeGridId);
					}
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
				renderUserTree();
//				getLastUser();
			}
		},
	    error: function (data, errorThrown) {
			$.notify("Kullanıcı Silinirken Hata Oluştu.", "error");
		}
	});  
}

function deleteUsers(row) {
	var dnList = [];
	
	dnList.push({
			distinguishedName :row.distinguishedName, 
			type: row.type,
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
				renderUserTree();
//				getLastUser();
			}
		},
	    error: function (data, errorThrown) {
			$.notify("Kullanıcı Silinirken Hata Oluştu.", "error");
		}
	});  
}

function addUser(parentName, resultCb) {
	var parentDn=parentName; 
	var uid=$('#uid').val();
	var cn=$('#cn').val();
	var sn=$('#sn').val();
	var mail=$('#mail').val();
	var homePostalAddress=$('#homePostalAddress').val();
	var telephoneNumber=$('#telephoneNumber').val();
	var userPassword=$('#userPassword').val();
	var confirm_password=$('#confirm_password').val();
	if(uid=='' || cn=='' || sn=='' || mail=='' || homePostalAddress==''	|| telephoneNumber=='' || userPassword=='' || confirm_password==''	)
	{
		$.notify("Lütfen Zorunlu alnları Doldurunuz!","warn");
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
    if(userPassword.length < 6 || !ucaseFlag || !lcaseFlag || !digitsFlag){
    	$.notify("Parola en az 6 karakter olmalıdır. En az bir büyük harf, küçük harf ve sayı içermelidir.","warn");
    	return;
    }
    if(userPassword!=confirm_password){
		$.notify("Parolalar Uyuşmamaktadır.",{className: 'warn',position:"right top"}  );
		return;
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
			$.notify("Kullanıcı Başarı ile eklendi.",{className: 'success',position:"right top"}  );
			resultCb(data)
		},
	    error: function (data, errorThrown) {
			$.notify("Kullanıcı Eklenirken Hata Oluştu.", "error");
		}
	});  
}

function createUserSearch(treeHolderDiv,treeGridId, showOnlyFolder) {
	
	var srcInputId= treeHolderDiv+"srcInput";
	var srcBtnId= treeHolderDiv+"srcBtn";
	var srcSelectId= treeHolderDiv+"srcSelect";
	var searchHtml=	
			' <div class="input-group"> '+
			'    <div class="input-group-prepend">  '+
			'       <select class="form-control " style="font-size: 12px;" id="'+srcSelectId+'" > ';
	       
		   if(showOnlyFolder==false){
				searchHtml +='<option selected value="uid"> ID </option> '+
						'<option value="cn"> Ad </option> '+ 
						'<option value="sn"> Soyad </option>'+
						'<option value="ou"> Klasör </option>';
			}
			else if(showOnlyFolder==true){
				searchHtml +='<option selected value="ou"> Klasör </option> ';
						}
			searchHtml +='</select> '+
			'    </div> '+ 
			'    <input placeholder="" id='+srcInputId+' type="text" class="form-control"> '+ 
			'    <div class="input-group-append"> '+ 
			'        <button class="btn btn-info" id="'+srcBtnId+'" > Ara </button> '+ 
			'    </div> '+ 
			' </div>  ';
		
	$('#'+treeHolderDiv).append(searchHtml)
	
	$('#'+srcBtnId).on('click', function (event) {
		var selection =$('#'+treeGridId).jqxTreeGrid('getSelection');
		
		if(selection && selection.length>0){
			var key=$('#'+srcSelectId).val()
			var value=$('#'+srcInputId).val()
			if(key == -1)
				{return}
			if(value==""){
				$.notify("Lütfen aranacak değer giriniz", "warn");
				return
			}
			var params = {
					"searchDn" : selection[0].distinguishedName,
					"key" : key,
					"value": value
			};
			
			$.ajax({
				type : 'POST',
				url : 'lider/ldap/searchEntry',
				data : params,
				dataType: "json",
				success : function(ldapResult) {
					
					if(ldapResult.length==0){
						$.notify("Sonuç Bulunamadı", "warn");
						return;
					}
					$('#'+treeGridId).jqxTreeGrid('deleteRow', "userSearch")
					$('#'+treeGridId).jqxTreeGrid('addRow', "userSearch", { name: "Arama Sonuçları" }, 'last')
					
					for (var i = 0; i < ldapResult.length; i++) {
				    	 var entry = ldapResult[i];
				    	 $('#'+treeGridId).jqxTreeGrid('addRow' , entry.entryUUID , entry , 'last' ,'userSearch');
					}
					$('#'+treeGridId).jqxTreeGrid('collapseAll');
					$('#'+treeGridId).jqxTreeGrid('expandRow', "userSearch");
					
				},
			    error: function (data, errorThrown) {
					$.notify("Hata Oluştu.", "error");
				}
			 }); 
		}
		else{
			$.notify("Lütfen Arama Dizini Seçiniz", "warn");
		}
	});
}
