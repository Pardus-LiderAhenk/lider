/**
 * userTree component 
 * this component can be use for user tree
 * edip.yildiz
 * @param page
 * @param callback
 * @returns
 */

function createUserTree(treeHolderDiv,showOnlyFolder,useCheckBox, rowSelectAction, rowCheckAction, rowUncheckAction, postTreeCreatedAction) {
	var rootDNUser = null;
	var treeGridId=treeHolderDiv+"Grid";
	/**
	 * create search area
	 */
	createUserSearch(treeHolderDiv,treeGridId,showOnlyFolder);
	
	
	/**
	 * Create popup menu div
	 */
	var baseDnMenuDiv=' <div id="baseDnMenuDiv" style="display: none;">'+
		'<ul>'+
		'<a href="#"  class="btn  btnAddOuModal" data-toggle="modal" data-target="#genericModal">  <li> <i class="fa fa-folder-plus blue">&nbsp;</i> Yeni Klasör Oluştur </li> </a> '+ 
		'<a href="#" class="btn  btnAddUserModal"  title="Kullanıcı Ekle" data-target="#genericModalLarge" data-toggle="modal">   <li>  <i class="fa fa-users blue"> &nbsp;</i>  Kullanıcı Ekle </li> </a> '+
		'</ul>'+
		'</div>';
	
	var folderPopUpMenuDiv=' <div id="folderPopUpMenuDiv" style="display: none;" >'+
	'<ul>'+
	'<a href="#" class="btn btnAddUserModal"  title="Kullanıcı Ekle" data-target="#genericModalLarge" data-toggle="modal">  <li>  <i class="fa fa-users blue"> &nbsp;</i>Kullanıcı Ekle  </li>  </a> '+
	'<a href="#"  class="btn btnAddOuModal" data-toggle="modal" data-target="#genericModal"> <li>  <i class="fa fa-folder-plus blue"> &nbsp;</i>Yeni Klasör Oluştur</li>  </a> '+  
//	'<a href="#" class="btn btnRenameOu" data-toggle="modal" data-target="#genericModal" >  <li>  <i class="fa fa-edit blue">&nbsp;</i>Klasör Adı Değiştir </li> </a>'+ 
	'<a href="#" class="btn btnMoveOuModal" data-toggle="modal" data-target="#genericModal" > <li>  <i class="fa fa-arrow-right blue">&nbsp;</i>Klasör Taşı   </li> </a>'+
	'<a href="#" class="btn btnDeleteOuModal" data-toggle="modal" data-target="#genericModal" > <li>  <i class="fa fa-trash red">&nbsp; &nbsp;</i>Klasörü Sil </li> </a>'+
	'</ul>'+
	'</div>';
	
	var userPopUpMenuDiv=' <div id="userPopUpMenuDiv" style="display: none;" >'+
		'<ul>'+
		' <a href="#"  class="btn btnMoveUserModal" data-target="#genericModal"	data-toggle="modal"> <li> <i class="fa fa-arrow-right blue">&nbsp;</i> Kullanıcı Taşı  </li> </a>'+
		' <a href="#"  class="btn btnDeleteUserModal" data-target="#genericModal"	data-toggle="modal"> <li> <i class="fa fa-trash red">&nbsp;</i> Kullanıcı Sil </li> </a>'+ 
		'</ul>'+
		'</div>';
	
	$('#'+treeHolderDiv).append(baseDnMenuDiv);
	$('#'+treeHolderDiv).append(folderPopUpMenuDiv);
	$('#'+treeHolderDiv).append(userPopUpMenuDiv);
	
	
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
//			 	$("#treeGridUser").jqxTreeGrid('destroy');
			 	
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
				 
				 var baseDnMenuDiv=$("#baseDnMenuDiv").jqxMenu({ width: 250, height: 90, autoOpenPopup: false, mode: 'popup' });
				 var folderPopUpMenuDiv=$("#folderPopUpMenuDiv").jqxMenu({ width: 250, height: 180, autoOpenPopup: false, mode: 'popup' });
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
		                    	if(baseDnMenuDiv!=null)
			                		baseDnMenuDiv.jqxMenu('close');
			                	if(folderPopUpMenuDiv!=null)
			                		folderPopUpMenuDiv.jqxMenu('close');
			                	if(userPopUpMenuDiv!=null)
			                		userPopUpMenuDiv.jqxMenu('close');
		                    }
		                    else if(row.level==0){ // this is for root dn
		                    	folderPopUpMenuDiv.jqxMenu('close');
		                    	userPopUpMenuDiv.jqxMenu('close');
		                    	baseDnMenuDiv.jqxMenu('open', parseInt(event.args.originalEvent.clientX) + 20 + scrollLeft, parseInt(event.args.originalEvent.clientY) + 5 + scrollTop);
		                    }
		                    else if(row.type=="ORGANIZATIONAL_UNIT"){
		                    	userPopUpMenuDiv.jqxMenu('close');
		                    	baseDnMenuDiv.jqxMenu('close');
		                    	folderPopUpMenuDiv.jqxMenu('open', parseInt(event.args.originalEvent.clientX) + 20 + scrollLeft, parseInt(event.args.originalEvent.clientY) + 5 + scrollTop);
		                    }
		                    else if(row.type=="USER"){
		                    	baseDnMenuDiv.jqxMenu('close');
		                    	folderPopUpMenuDiv.jqxMenu('close');
		                    	userPopUpMenuDiv.jqxMenu('open', parseInt(event.args.originalEvent.clientX) + 20 + scrollLeft, parseInt(event.args.originalEvent.clientY) + 5 + scrollTop);
		                    }
		                    else{
		                    	if(baseDnMenuDiv!=null)
			                		baseDnMenuDiv.jqxMenu('close');
			                	if(folderPopUpMenuDiv!=null)
			                		folderPopUpMenuDiv.jqxMenu('close');
			                	if(userPopUpMenuDiv!=null)
			                		userPopUpMenuDiv.jqxMenu('close');
		                    }
		                    return false;
		                }
		                else{
		                	if(baseDnMenuDiv!=null)
		                		baseDnMenuDiv.jqxMenu('close');
		                	if(folderPopUpMenuDiv!=null)
		                		folderPopUpMenuDiv.jqxMenu('close');
		                	if(userPopUpMenuDiv!=null)
		                		userPopUpMenuDiv.jqxMenu('close');
		                }
		            });
				 
				 
				 
				 $('#'+treeGridId).on('rowSelect', function (event) {
				        var args = event.args;
					    var row = args.row;
					    var name= row.name;
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
					if(postTreeCreatedAction!=null)
					postTreeCreatedAction(rootDNUser , treeGridId);
					
					/**
					  * POP UP MENU  operations START
					  */
					
					$('.btnAddUserModal').on('click',function(event) {
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
										var parentEntryUUID= selectedFolder.entryUUID;
										addUser(selectedFolder.distinguishedName,
												function(data){
														$('#genericModalLarge').trigger('click');
														$('#treeGridUserHolderDivGrid').jqxTreeGrid('addRow' , data.name , data , 'last' , parentEntryUUID);
														$("#treeGridUserHolderDivGrid").jqxTreeGrid('expandRow' , parentEntryUUID);
												}
										)
									});
								} 
							);
						}
					});
					
					
					
					$('.btnAddOuModal').on('click',function(event) {
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
					$('.btnDeleteOuModal').on('click',function(event) {
						getModalContent("modals/user/deleteOuModal", function content(data){
							$('#genericModalHeader').html("Klasör Sil")
							$('#genericModalBodyRender').html(data);
							
							$('#deleteOuBtn').on('click', function (event) {
								deleteUserOu(selectedFolder)
							});
						} 
						);
					});
					
					$('.btnMoveOuModal').on('click',function(event) {
						
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
					
					
					$('.btnMoveUserModal').on('click',function(event) {
						
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
					
					$('.btnDeleteUserModal').on('click',function(event) {
						
						getModalContent("modals/user/deleteUserModal", function content(data){
								$('#genericModalHeader').html("Kullanıcı Sil")
								$('#genericModalBodyRender').html(data);
								
								$('#userInfoDelete').html(selectedRowGen.name);
								
								$('#deleteUserBtn').on('click',function(event) {
									deleteUsers(selectedRowGen)
								});
						});
					});
					
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
