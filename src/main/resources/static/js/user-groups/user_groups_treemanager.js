/**


 * tree component 
 * this component can be use for tree
 * edip.yildiz
 * @param page
 * @param callback
 * @returns
 */

var selectedRow=[]
var selectedRowForMove=[]
var selectedRowForMoveOld=[]
var treeGridId =""
var rootComputer = null;
var searchPathGlob = null;
var treeHolderDivOld = null;
var treeHolderDivGlob = null;
var showOnlyFolderGlob=null;
var useCheckBoxGlob=null;
var rowSelectActionGlob=null;
var rowCheckActionGlob=null;
var rowUncheckActionGlob=null;
var postTreeCreatedActionGlob=null;
var destinationDNToMoveRecordGlob=""

function createUserGroupTree(searchPath,treeHolderDiv,showOnlyFolder,useCheckBox, rowSelectAction, rowCheckAction, rowUncheckAction, postTreeCreatedAction) {
	searchPathGlob=searchPath
	treeHolderDivGlob=treeHolderDiv
	rowSelectActionGlob=showOnlyFolder
	useCheckBoxGlob=useCheckBox
	rowSelectActionGlob=rowSelectAction
	rowCheckActionGlob=rowCheckAction
	rowUncheckActionGlob=rowUncheckAction
	postTreeCreatedActionGlob=postTreeCreatedAction
	
	treeGridId=treeHolderDiv+"Grid";
	/**
	 * Create popup menu div
	 */
	var baseUserGroupDnMenuDiv=' <div id="baseUserGroupDnMenuDiv" style="display: none;" >'+
		'<ul>'+
		'<li> <a href="#"  class="btn btn-info btnCreateNewOu" data-toggle="modal" data-target="#genericModal"> <i class="fa fa-folder-plus blue">&nbsp;</i> Yeni Klasör Oluştur</a> </li>  '+ 
		'<li> <a href="#" class="btn btn-info btnCreateNewUserGroup" id="btnCreateNewUserGroup" title="Kullanıcı Grubu Ekle" data-target="#genericModal" data-toggle="modal">   <i class="fa fa-users blue"> &nbsp;</i>  Kullanıcı Grubu Ekle </a></li>  '+
		'</ul>'+
		'</div>';
	
	var folderPopUpMenuDiv=' <div id="folderPopUpMenuDiv" style="display: none;" >'+
	'<ul>'+
	'<li> <a href="#" class="btn btn-info btnCreateNewUserGroup" id="btnCreateNewUserGroup" title="Kullanıcı Grubu Ekle" data-target="#genericModal" data-toggle="modal">   <i class="fa fa-users blue"> &nbsp;</i>Kullanıcı Grubu Ekle  </a></li>  '+
	'<li> <a href="#"  class="btn btn-info btnCreateNewOu" data-toggle="modal" data-target="#genericModal"> <i class="fa fa-folder-plus blue">&nbsp;</i>Yeni Klasör Oluştur</a> </li>  '+  
	'<li> <a href="#" class="btn btn-info btnRenameOu" data-toggle="modal" data-target="#genericModal" > <i class="fa fa-edit blue">&nbsp;</i>Klasör Adı Değiştir</a> </li> '+ 
	'<li> <a href="#" class="btn btn-info btnMoveOu" data-toggle="modal" data-target="#genericModal" > <i class="fa fa-arrow-right blue">&nbsp;</i>Klasör Taşı</a>   </li> '+
	'<li> <a href="#" class="btn btn-info btnDeleteOu" data-toggle="modal" data-target="#genericModal" > <i class="fa fa-trash red">&nbsp; &nbsp;</i>Klasörü Sil</a>  </li> '+
	'</ul>'+
	'</div>';
	
	var groupPopUpMenuDiv=' <div id="groupPopUpMenuDiv" style="display: none;" >'+
		'<ul>'+
		'<li> <a href="#"  class="btn btn-info addMemberUserGroupBtn" data-target="#genericModal"	data-toggle="modal"> <i class="fa fa-user-plus blue">&nbsp;</i>Kullanıcı Ekle  </a></li>  '+  
		'<li> <a href="#"  class="btn btn-info editUserGroupBtn" data-target="#genericModal"	data-toggle="modal"> <i class="fa fa-edit blue">&nbsp;</i>Grubu Düzenle </a> </li> '+ 
		'<li> <a href="#"  class="btn btn-info moveUserGroupBtn" data-target="#genericModal"	data-toggle="modal"> <i class="fa fa-arrow-right blue">&nbsp;</i>Grubu Taşı </a>  </li> '+
		'<li> <a href="#"  class="btn btn-info deleteUserGroupBtn" data-target="#genericModal"	data-toggle="modal"> <i class="fa fa-trash red">&nbsp;</i>Grubu Sil</a></li> '+ 
		'</ul>'+
		'</div>';
	
	$('#'+treeHolderDiv).append(baseUserGroupDnMenuDiv);
	$('#'+treeHolderDiv).append(folderPopUpMenuDiv);
	$('#'+treeHolderDiv).append(groupPopUpMenuDiv);
	
	/**
	 * create search area
	 */
	createSearch(treeHolderDiv,treeGridId,showOnlyFolder);
	
	
	/**
	 * get root dn for user and set treegrid tree
	 */
	$.ajax({
		type : 'POST',
		url : searchPath,
		dataType : 'json',
		success : function(data) {
			rootComputer = null;
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
							{ name: "attributes", type: "array" },
					        { name: "attributesMultiValues", type: "array" },
							{ name: "entryUUID", type: "string" },
							{ name: "childEntries", type: "array" }
							],
							hierarchy:
							{
								root: "childEntries"
							},
							localData: data,
							id: "entryUUID"
			  };
			 	rootComputer = source.localData[0].entryUUID;
			 	
			 	$('#'+treeHolderDiv).append('<div id="'+treeGridId+'"></div> ')
				
				var dataAdapter = new $.jqx.dataAdapter(source, {
				     loadComplete: function () {
				     }
				 });
				 
				 var getLocalization = function () {
			           var localizationobj = {};
			           localizationobj.filterSearchString = "Ara :";
			           localizationobj.pagerShowRowsString= "Sayfa:";
			           localizationobj.pagerGoToPageString = "";
			           return localizationobj;
				}
				 // create jqxTreeGrid.
				 $('#'+treeGridId).jqxTreeGrid({
					 width: '100%',
					 height: 590,
					 source: dataAdapter,
//					 theme : 'fresh',
//				     altRows: true,
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
				     pageSize: 500,
				     pagerMode: "default",
				     pageSizeOptions: ['15', '50', '500'],
				     icons: function (rowKey, dataRow) {
				    	    var level = dataRow.level;
				    	    if(dataRow.type == "AHENK"){
				    	    	return "img/linux.png";
				    	    }
				    	    else if(dataRow.type =="ORGANIZATIONAL_UNIT")
				    	    	{return "img/folder.png";}
				    	    else {return "img/entry_group.gif"; }
				    	},
				     ready: function () {
				    	 var allrows =$('#'+treeGridId).jqxTreeGrid('getRows');
				    	 if(allrows.length==1){
				    		 var row=allrows[0];
				    		 if(row.childEntries==null ){
				    			 $('#'+treeGridId).jqxTreeGrid('addRow', row.entryUUID+"1", {}, 'last', row.entryUUID);
				    		 }
				    	 }
				    	 $('#'+treeGridId).jqxTreeGrid('collapseAll');
//				    	 $('#'+treeGridId).jqxTreeGrid('selectRow', rootComputer);
				     },
				     rendered: function () {
				   	 },
				     columns: [
				    	 { text: "Kullanıcı Grupları", align: "center", dataField: "name", width: '100%'}
				    ]
				 });
				 
				 	var baseUserGroupDnMenu=$("#baseUserGroupDnMenuDiv").jqxMenu({ width: 250, height: 90, autoOpenPopup: false, mode: 'popup' });
				 	var folderMenu=$("#folderPopUpMenuDiv").jqxMenu({ width: 250, height: 220, autoOpenPopup: false, mode: 'popup' });
				 	var groupMenu=$("#groupPopUpMenuDiv").jqxMenu({ width: 250, height: 180, autoOpenPopup: false, mode: 'popup' });
	         		
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
		                    	groupMenu.jqxMenu('close', parseInt(event.args.originalEvent.clientX) + 100 + scrollLeft, parseInt(event.args.originalEvent.clientY) + 5 + scrollTop);
		                    }
		                    else if(row.level==0){ // this is for root dn
		                    	groupMenu.jqxMenu('close');
		                    	folderMenu.jqxMenu('close');
		                    	baseUserGroupDnMenu.jqxMenu('open', parseInt(event.args.originalEvent.clientX) + 100 + scrollLeft, parseInt(event.args.originalEvent.clientY) + 5 + scrollTop);
		                    }
		                    else if(row.type=="ORGANIZATIONAL_UNIT"){
		                    	groupMenu.jqxMenu('close');
		                    	baseUserGroupDnMenu.jqxMenu('close');
		                    	folderMenu.jqxMenu('open', parseInt(event.args.originalEvent.clientX) + 100 + scrollLeft, parseInt(event.args.originalEvent.clientY) + 5 + scrollTop);
		                    }
		                    else if(row.type=="GROUP"){
		                    	folderMenu.jqxMenu('close');
		                    	baseUserGroupDnMenu.jqxMenu('close');
		                    	groupMenu.jqxMenu('open', parseInt(event.args.originalEvent.clientX) + 100 + scrollLeft, parseInt(event.args.originalEvent.clientY) + 5 + scrollTop);
		                    }
		                    else{
		                    	baseUserGroupDnMenu.jqxMenu('open', parseInt(event.args.originalEvent.clientX) + 100 + scrollLeft, parseInt(event.args.originalEvent.clientY) + 5 + scrollTop);
		                    }
		                    return false;
		                }
		                else{
		                	if(folderMenu!=null)
		                		folderMenu.jqxMenu('close');
		                	if(groupMenu!=null)
		                		groupMenu.jqxMenu('close');
		                	if(baseUserGroupDnMenu!=null)
		                		baseUserGroupDnMenu.jqxMenu('close');
		                }
		            });
		           
		            $('#'+treeGridId).on('contextmenu', function () {
		                return false;
		            });
				 
				 	$('#'+treeGridId).on('rowSelect', function (event) {
				        var args = event.args;
					    var row = args.row;
					    selectedRow=row
					    rowSelectAction(row,rootComputer,treeGridId);
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
						      
						      var urlPath='lider/user_groups/getOuDetails'; 
						      $.ajax({
									type : 'POST',
									url : urlPath,
									data : 'uid=' + row.distinguishedName + '&type=' + row.type
											+ '&name=' + row.name + '&parent=' + row.parent,
									dataType : 'text',
									success : function(ldapResult) {
										var childs = jQuery.parseJSON(ldapResult);
										if(showOnlyFolder){
											for (var m = 0; m < childs.length; m++) {
												// get a row.
												var childRow = childs[m];
												
												if(childRow.type == "ORGANIZATIONAL_UNIT") {
													$('#'+treeGridId).jqxTreeGrid('addRow', childRow.entryUUID, childRow, 'last', row.entryUUID);
													//$("#createNewAgentGroupTreeGridAgent").jqxTreeGrid('checkRow', row.name);
													if(childRow.hasSubordinates=="TRUE"){
														$('#'+treeGridId).jqxTreeGrid('addRow', childRow.entryUUID+"1" , {}, 'last', childRow.entryUUID); 
													}
													$('#'+treeGridId).jqxTreeGrid('collapseRow', childRow.entryUUID);
												}
											}
										}
										else{
											 for (var m = 0; m < childs.length; m++) {
												 	// get a row.
										          	var childRow = childs[m];
											          $('#'+treeGridId).jqxTreeGrid('addRow', childRow.entryUUID, childRow, 'last', row.entryUUID);
											          if(childRow.hasSubordinates=="TRUE"){
											           $('#'+treeGridId).jqxTreeGrid('addRow', childRow.entryUUID+"1" , {}, 'last', childRow.entryUUID); 
											          }
											           $('#'+treeGridId).jqxTreeGrid('collapseRow', childRow.name);
										      } 
										}
										 row.expandedUser="TRUE"	
									}
								});  
					      }
					 }); 
			 postTreeCreatedAction(rootComputer , treeGridId);
			 
			 
			 /**
			  * organizational unit operations START
			  */
			 $('.btnCreateNewUserGroup').on('click', function (event) {
					checkedUsers = [];
					checkedOUList = [];
					if(selectedRow.distinguishedName == ""){
						$.notify("Lütfen klasör seçiniz", "error");
					}
					else
					{
						$('#selectedUserCountCreateNewUserGroup').html(checkedUsers.length);
						getModalContent("modals/groups/user_groups/creategroup", function content(data){
							$('#genericModalHeader').html("Kullanıcı Grubu Oluştur");
							$('#genericModalBodyRender').html(data);

							$('#userGroupsNewUserGroupName').val('');
							createUserTree('createNewUserGroupTreeDiv', false, true,
									// row select
									function(row, rootDnComputer,treeGridIdName){
							},
							//check action
							function(checkedRows, row){
								rowCheckAndUncheckOperationForCreatingGroup(checkedRows, row);
							},
							//uncheck action
							function(unCheckedRows, row){
								rowCheckAndUncheckOperationForCreatingGroup(unCheckedRows, row);
							}
							);
						});
					}
			 });
			 
			 $('.btnCreateNewOu').on('click', function (event) {
				 
				 getModalContent("modals/groups/user_groups/createou", function content(data){
						$('#genericModalHeader').html("Yeni Klasör Oluştur");
						$('#genericModalBodyRender').html(data);
					});
			
			 });
			 
			 $('.btnRenameOu').on('click', function (event) {
				 getModalContent("modals/groups/user_groups/editouname", function content(data){
						$('#genericModalHeader').html("Klasörü Adı Düzenle");
						$('#genericModalBodyRender').html(data);
						$('#ouName').val(selectedName);
					});
				 
			 });

			 $('.btnMoveOu').on('click', function (event) {
				 selectedRowForMoveOld=selectedRow;
				 getModalContent("modals/groups/user_groups/moveentry", function content(data){
						$('#genericModalHeader').html("Kayıt Taşı");
						$('#genericModalBodyRender').html(data);
						
						getModalContent("modals/groups/user_groups/moveentry", function content(data){
							$('#genericModalHeader').html("Kayıt Taşı");
							$('#genericModalBodyRender').html(data);
							createUserGroupTree('lider/user_groups/getGroups','moveEntryTreeDiv', true, false,
									// row select
									function(row, rootDnComputer,treeGridIdName){
										destinationDNToMoveRecordGlob = row.distinguishedName;
										selectedRowForMove=row;
									},
									//check action
									function(checkedRows, row){
									},
									//uncheck action
									function(unCheckedRows, row){
									},
									function(rootComputer , treeGridId){
									}
							);
							//generateTreeToMoveEntry();
						});
					});
			 });

			 $('.btnDeleteOu').on('click', function (event) {
				 getModalContent("modals/groups/user_groups/deleteou", function content(data){
						$('#genericModalHeader').html("Klasörü Sil");
						$('#genericModalBodyRender').html(data);
					});
				 
			 });
			 
			 /**
			  * organizational unit operations END
			  */

			 /**
			  * user Groups operations START
			  */
			 $('.addMemberUserGroupBtn').on('click', function (event) {
					checkedUsers = [];
					checkedOUList = [];
					
					
					getModalContent("modals/groups/user_groups/addmember", function content(data){
						$('#genericModalHeader').html("Kullanıcı Grubuna Üye Ekle");
						$('#genericModalBodyRender').html(data);
						$('#selectedUserCount').html(checkedUsers.length);
						createUserTree('addMembersToExistingUserGroupTreeDiv', false, true,
								// row select
								function(row, rootDnComputer,treeGridIdName){
								},
								//check action
								function(checkedRows, row){
									rowCheckAndUncheckOperationToAddMembersToExistingGroup(checkedRows, row);
								},
								//uncheck action
								function(unCheckedRows, row){
									rowCheckAndUncheckOperationToAddMembersToExistingGroup(unCheckedRows, row);
								},
								//post tree render  action
								function(rootDNUser , treeGridId){
									
								},
						);
						//generateTreeToAddMembersToExistingGroup();
					});
				});
				$('.editUserGroupBtn').on('click', function (event) {
					getModalContent("modals/groups/user_groups/editgroupname", function content(data){
						$('#genericModalHeader').html("Grup Adı Düzenle");
						$('#genericModalBodyRender').html(data);
						$('#groupName').val(selectedName);
					});
				});

				$('.moveUserGroupBtn').on('click', function (event) {
					selectedRowForMoveOld=selectedRow;
					treeHolderDivOld=treeHolderDivGlob;
					getModalContent("modals/groups/user_groups/moveentry", function content(data){
						$('#genericModalHeader').html("Kayıt Taşı");
						$('#genericModalBodyRender').html(data);
						createUserGroupTree('lider/user_groups/getGroups','moveEntryTreeDiv', true, false,
								// row select
								function(row, rootDnComputer,treeGridIdName){
									destinationDNToMoveRecordGlob = row.distinguishedName;
									selectedRowForMove=row;
								},
								//check action
								function(checkedRows, row){
								},
								//uncheck action
								function(unCheckedRows, row){
								},
								function(rootComputer , treeGridId){
								}
						);

						//generateTreeToMoveEntry();
					});
				});
				
				$('.deleteUserGroupBtn').on('click', function (event) {
					checkedUsers = [];
					checkedOUList = [];
					getModalContent("modals/groups/user_groups/deletegroup", function content(data){
						$('#genericModalHeader').html("Kullanıcı Grubunu Sil");
						$('#genericModalBodyRender').html(data);
					});
				});

				 /**
				  *  user Groups operations END
				  */
		}
	});
}

function createSearch(treeHolderDiv,treeGridId, showOnlyFolder) {
	var srcInputId= treeHolderDiv+"srcInput";
	var srcBtnId= treeHolderDiv+"srcBtn";
	var srcSelectId= treeHolderDiv+"srcSelect";
	var searchHtml=	 '<div class="input-group"> '+
			'    <div class="input-group-prepend">  '+
			'       <select class="form-control " style="font-size: 12px;" id="'+srcSelectId+'" > ';
	       
		   if(showOnlyFolder==false){
				searchHtml +='<option  value="uid"> ID </option> '+
						'<option selected value="cn"> Ad </option> '+ 
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
					$('#'+treeGridId).jqxTreeGrid('deleteRow', "Results")
					$('#'+treeGridId).jqxTreeGrid('addRow', "Results", { name: "Arama Sonuçları" }, 'last')
					for (var i = 0; i < ldapResult.length; i++) {
				    	 var entry = ldapResult[i];
				    	 $('#'+treeGridId).jqxTreeGrid('addRow' , entry.name , entry , 'last' ,'Results');
					}
					$('#'+treeGridId).jqxTreeGrid('collapseAll');
					$('#'+treeGridId).jqxTreeGrid('expandRow', "Results");
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

/*
 * this function triggered by delete button on DeleteGroupModal
 */
function btnDeleteGroupClicked() {
	var params = {
			"dn": selectedRow.distinguishedName,
	};
	$.ajax({ 
		type: 'POST', 
		url: '/lider/user_groups/deleteEntry',
		dataType: 'json',
		data: params,
		success: function (data) {
			$('#'+treeGridId).jqxTreeGrid('deleteRow', selectedRow.entryUUID);
			$('#'+treeGridId).jqxTreeGrid('selectRow', rootComputer);
			$.notify("Kullanıcı grubu başarıyla silindi.", "success");
			clearAndHide();
		},
		error : function(jqXHR, textStatus, errorThrown) {
			if(jqXHR != null && jqXHR.responseJSON != null && jqXHR.responseJSON[0] != null && jqXHR.responseJSON[0] != "")
				$.notify("Kullanıcı grubu silinirken hata oluştu: " + jqXHR.responseJSON[0], "error");
			else
				$.notify("Kullanıcı grubu silinirken hata oluştu.", "error");
		},
		complete : function() {
			$("#genericModal").trigger('click');
			$("#genericModalLarge").trigger('click');
		}
	});
}


/*
 * this function triggered by edit button on EditGroupModal
 */
function btnEditGroupNameClicked() {
	var newOuName = $("#groupName").val();
	if(newOuName == "") {
		$.notify("Grup adı giriniz.", "error");
	} else {
		if(newOuName == selectedName) {
			$('#genericModal').trigger('click');
			return;
		} 
		var params = {
				"oldDN" : selectedRow.distinguishedName,
				"newName": "cn=" + newOuName
		};
		$.ajax({
			type: 'POST', 
			url: '/lider/user_groups/rename/entry',
			dataType: 'json',
			data: params,
			success: function (data) {
				$.notify("Grup adı düzenlendi.", "success");
				$('#genericModal').trigger('click');
				$('#'+ treeHolderDivGlob).html("");
				createUserGroupTree(searchPathGlob,treeHolderDivGlob,showOnlyFolderGlob,useCheckBoxGlob, rowSelectActionGlob, rowCheckActionGlob, rowUncheckActionGlob, postTreeCreatedActionGlob);
				clearAndHide()
			},
			error: function (data, errorThrown) {
				$.notify("Grup adı düzenlenirken hata oluştu.", "error");
			}
		});
	}
}

function btnMoveEntryClicked() {
	if(selectedDN == destinationDNToMoveRecordGlob) {
		$.notify("Kayıt kendi altına taşınamaz.", "error");
	}
	else if(selectedRowForMoveOld.parent.distinguishedName != destinationDNToMoveRecordGlob) {
		var params = {
				"sourceDN" : selectedDN,
				"destinationDN": destinationDNToMoveRecordGlob
		};
		$.ajax({ 
			type: 'POST', 
			url: '/lider/user_groups/move/entry',
			dataType: 'json',
			data: params,
			success: function (data) {
				$.notify("Seçili Grup başarı ile taşındı.", "success");
				$('#genericModal').trigger('click');
				clearAndHide()
			},
			error: function (data, errorThrown) {
				$.notify("Kayıt taşınırken hata oluştu.", "error");
			}
		});
	} else {
		$.notify("Kayıt aynı yere taşınamaz.", "error");
	}
}


