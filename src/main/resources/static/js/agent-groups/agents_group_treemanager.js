/**
 * edip.yildiz
 * @param page
 * @param callback
 * @returns
 */

var selectedRow=null;
var selectedRowForMove=null;
var checkedEntries = [];
var destinationDNToMoveRecord=null;
var treeGridId="";

function createAgentGroupTree(treeHolderDiv,showOnlyFolder,useCheckBox, rowSelectAction, rowCheckAction, rowUncheckAction, postTreeCreatedAction) {
	var rootDNUser = null;
	treeGridId=treeHolderDiv+"Grid";
	/**
	 * create search area
	 */
	createAgentGroupSearch(treeHolderDiv,treeGridId,showOnlyFolder);
//	$('#'+treeHolderDiv).append(baseDnMenuDiv);
//	$('#'+treeHolderDiv).append(folderPopUpMenuDiv);
//	$('#'+treeHolderDiv).append(groupPopUpMenuDiv);
	
	/**
	 * get root dn for user and set treegrid tree
	 */
	$.ajax({
		type : 'POST',
		url : 'lider/computer_groups/getGroups',
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
				    	    if (dataRow.type == "AHENK") {
		                        return "img/linux.png";
		                    } else if (dataRow.type == "ORGANIZATIONAL_UNIT") {
		                        return "img/folder.png";
		                    } else {
		                        return "img/entry_group.gif";
		                    }
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
				   	columns: [{
	                    text: "İstemci Grupları",
	                    align: "center",
	                    dataField: "name",
	                    width: '100%'
	                }]
				 });
				 
				 var baseDnMenuDiv=$("#baseDnAgentGroupMenuDiv").jqxMenu({ width: 250, height: 90, autoOpenPopup: false, mode: 'popup' });
				 var folderPopUpMenuDiv=$("#folderPopUpAgentGroupMenuDiv").jqxMenu({ width: 250, height: 180, autoOpenPopup: false, mode: 'popup' });
				 var groupPopUpMenuDiv=$("#agentGroupPopUpMenuDiv").jqxMenu({ width: 250, height: 180, autoOpenPopup: false, mode: 'popup' });
				 
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
			                	if(groupPopUpMenuDiv!=null)
			                		groupPopUpMenuDiv.jqxMenu('close');
		                    }
		                    else if(row.level==0){ // this is for root dn
		                    	folderPopUpMenuDiv.jqxMenu('close');
		                    	groupPopUpMenuDiv.jqxMenu('close');
		                    	baseDnMenuDiv.jqxMenu('open', parseInt(event.args.originalEvent.clientX) + 20 + scrollLeft, parseInt(event.args.originalEvent.clientY) + 5 + scrollTop);
		                    }
		                    else if(row.type=="ORGANIZATIONAL_UNIT"){
		                    	groupPopUpMenuDiv.jqxMenu('close');
		                    	baseDnMenuDiv.jqxMenu('close');
		                    	folderPopUpMenuDiv.jqxMenu('open', parseInt(event.args.originalEvent.clientX) + 20 + scrollLeft, parseInt(event.args.originalEvent.clientY) + 5 + scrollTop);
		                    }
		                    else if(row.type=="GROUP"){
		                    	baseDnMenuDiv.jqxMenu('close');
		                    	folderPopUpMenuDiv.jqxMenu('close');
		                    	groupPopUpMenuDiv.jqxMenu('open', parseInt(event.args.originalEvent.clientX) + 20 + scrollLeft, parseInt(event.args.originalEvent.clientY) + 5 + scrollTop);
		                    }
		                    else{
		                    	if(baseDnMenuDiv!=null)
			                		baseDnMenuDiv.jqxMenu('close');
			                	if(folderPopUpMenuDiv!=null)
			                		folderPopUpMenuDiv.jqxMenu('close');
			                	if(groupPopUpMenuDiv!=null)
			                		groupPopUpMenuDiv.jqxMenu('close');
		                    }
		                    return false;
		                }
		                else{
		                	if(baseDnMenuDiv!=null)
		                		baseDnMenuDiv.jqxMenu('close');
		                	if(folderPopUpMenuDiv!=null)
		                		folderPopUpMenuDiv.jqxMenu('close');
		                	if(groupPopUpMenuDiv!=null)
		                		groupPopUpMenuDiv.jqxMenu('close');
		                }
		            });
				 
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
					    	 progressForLoad('treeGridComputerGroupsDiv','show');
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
											 progressForLoad('treeGridComputerGroupsDiv','hide');
									}
								});  
					      }
					 }); 
					if(postTreeCreatedAction!=null)
					postTreeCreatedAction(rootDNUser , treeGridId);
		}
	});
}


function btnCreateNewOUClicked() {
	if(selectedRow!=null){
		var selectedDN=selectedRow.distinguishedName;
		
		var ouName = $("#ouName").val();
		if(ouName == "") {
			$.notify("Klasör adı giriniz.", "error");
		} else {
			var params = {
				    "parentName" : selectedDN,
				    "ou": ouName,
				    "type": 'ORGANIZATIONAL_UNIT',
				    "distinguishedName": 'ou=' + ouName + ',' + selectedDN,
				    "name": ouName
			};
			$.ajax({ 
			    type: 'POST', 
			    url: '/lider/computer_groups/addOu',
			    dataType: 'json',
			    data: params,
			    success: function (data) {
		            // add new empty row.
//		            $('#'+treeGridId).jqxTreeGrid('addRow', data.entryUUID, data, 'first', selectedEntryUUID);
//		            $('#'+treeGridId).jqxTreeGrid('expandRow', selectedEntryUUID);
		            $('#genericModal').trigger('click');
		            $.notify("Klasör oluşturuldu.", "success");
		            renderComputerGroupTree();
			    },
			    error: function (data, errorThrown) {
			    	$.notify("Klasör oluşturulurken hata oluştu.", "error");
			    }
			});
		}
	}
}

/*
 * edit organizational unit name
 */
function btnEditOUNameClicked() {
	var newOuName = $("#ouName").val();
	if(newOuName == "") {
		$.notify("Klasör adı giriniz.", "error");
	} else {
		var selectedDN=selectedRow.distinguishedName;
		if(newOuName == selectedRow.name) {
			$('#genericModal').trigger('click');
			return;
		} 
		var params = {
				"oldDN" : selectedDN,
				"newName": "ou=" + newOuName
		};
		$.ajax({
		    type: 'POST', 
		    url: '/lider/computer_groups/rename/entry',
		    dataType: 'json',
		    data: params,
		    success: function (data) {
		    	$.notify("Grup adı düzenlendi.", "success");
	            $('#genericModal').trigger('click');
	            renderComputerGroupTree();
		    },
		    error: function (data, errorThrown) {
		    	$.notify("Grup adı düzenlenirken hata oluştu.", "error");
		    }
		});
	}
}

function btnCreateAgentGroupClicked() {
	var selectedDNList = [];
	for (var i = 0; i < checkedEntries.length; i++) {
		selectedDNList.push(checkedEntries[i].distinguishedName);
	}
	
	checkedEntries = [];
	var checkedRows = $("#createNewAgentGroupTreeDivGrid").jqxTreeGrid('getCheckedRows');
	if(checkedRows.length > 0){
		for (var i = 0; i < checkedRows.length; i++) {
			if(checkedRows[i].distinguishedName != null) {
				checkedEntries.push({
					distinguishedName: checkedRows[i].distinguishedName, 
					entryUUID: checkedRows[i].entryUUID, 
					name: checkedRows[i].name,
					type: checkedRows[i].type,
					uid: checkedRows[i].uid
				});	
			}
		}
	}
	if($('#agentGroupsNewAgentGroupName').val() == "") {
		$.notify("Lütfen grup adı giriniz.", "error");
		return;
	} else if(checkedEntries.length == 0) {
		$.notify("Grup oluşturabilmek için klasör veya istemci seçiniz.", "error");
		return;
	}
	$.LoadingOverlay("show", {image: "", text: "Grup oluşturuluyor..."});
	var params = {
		"selectedOUDN" : selectedRow.distinguishedName,
	    "groupName" : $('#agentGroupsNewAgentGroupName').val(),
		"checkedEntries": JSON.stringify(checkedEntries)
	};
	//JSON.stringify({ 'things': things });
	$.ajax({ 
	    type: 'POST', 
	    url: "/lider/computer_groups/createNewAgentGroup",
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
		data: JSON.stringify(params),
	    success: function (data) { 
	    	$.notify("Grup oluşturuldu ve ahenkler bu gruba dahil edildi.", "success");
	    	//after agent group is added get newly addded group detail from servic add this group to main tree
	    	 renderComputerGroupTree();
	    },
	    error: function (xhr, textStatus, errorThrown) {
			if(xhr != null && xhr.responseText != null && xhr.responseText != "")
				$.notify(xhr.responseText, "error");
			else
				$.notify("Yeni istemci grubu oluştururken hata oluştu.", "error");
	    }, 
		complete: function() {
			$.LoadingOverlay("hide", true);
//			progress('mainBody',null,'hide');
			$('#genericModal').trigger('click');
		}
	});
}

function btnMoveEntryClicked() {
	if(selectedRowForMove.distinguishedName == destinationDNToMoveRecord) {
		$.notify("Kayıt kendi altına taşınamaz.", "error");
	}
	else if(selectedRowForMove.parent.distinguishedName != destinationDNToMoveRecord) {
		var params = {
			    "sourceDN" : selectedRowForMove.distinguishedName,
			    "destinationDN": destinationDNToMoveRecord
		};
		progressForLoad('mainBody','show');
		$.ajax({ 
		    type: 'POST', 
		    url: '/lider/computer_groups/move/entry',
		    dataType: 'json',
		    data: params,
		    success: function (data) {
		    	
	            $.notify("Kayıt taşındı.", "success");
	            $('#genericModal').trigger('click');
	            
	            if(selectedRow){
	            	$('#genericModal').trigger('click');
	            	renderComputerGroupTree();
				}
	            progressForLoad('mainBody','hide');
		    },
		    error: function (data, errorThrown) {
		    	$.notify("Kayıt taşınırken hata oluştu.", "error");
		    }
		});
	} else {
		$.notify("Kayıt aynı yere taşınamaz.", "error");
	}
}

function btnDeleteOUClicked() {
	var selectedDN=selectedRow.distinguishedName;
	var params = {
		    "dn": selectedDN,
	};
	progressForLoad('mainBody','show');
	$.ajax({ 
	    type: 'POST', 
	    url: '/lider/computer_groups/deleteEntry',
	    dataType: 'json',
	    data: params,
	    success: function (data) {
	    	$('#genericModal').trigger('click');
            $.notify("Klasör silindi.", "success");
            renderComputerGroupTree();
            progressForLoad('mainBody','hide');
	    },
	    error: function (data, errorThrown) {
	    	$.notify("Klasör silinirken hata oluştu.", "error");
	    }
	});
}

function btnDeleteGroupClicked() {
	
	var selectedDN=selectedRow.distinguishedName;
	
	var params = {
		    "dn": selectedDN,
	};
	progressForLoad('mainBody','show');
	$.ajax({ 
	    type: 'POST', 
	    url: '/lider/computer_groups/deleteEntry',
	    dataType: 'json',
	    data: params,
	    success: function (data) {
	    	$('#genericModal').trigger('click');
            $.notify("İstemci Grubu Silindi.", "success");
            renderComputerGroupTree();
            progressForLoad('mainBody','hide');
	    },
	    error: function (data, errorThrown) {
	    	$.notify("Grup silinirken hata oluştu.", "error");
	    }
	});
}

function btnAddMemberAgentGroupsClicked() {
	var selectedDN= selectedRow.distinguishedName
	var selectedDNList = [];
	for (var i = 0; i < checkedEntries.length; i++) {
		selectedDNList.push(checkedEntries[i].distinguishedName);
	}
	checkedEntries = [];
	var checkedRows = $("#addMembersToExistingAgentGroupTreeDivGrid").jqxTreeGrid('getCheckedRows');
	if(checkedRows.length > 0){
		for (var i = 0; i < checkedRows.length; i++) {
			if(checkedRows[i].distinguishedName != null) {
				checkedEntries.push({
					distinguishedName: checkedRows[i].distinguishedName, 
					entryUUID: checkedRows[i].entryUUID, 
					name: checkedRows[i].name,
					type: checkedRows[i].type,
					uid: checkedRows[i].uid
				});	
			}
		}
	}
	if(checkedEntries.length == 0) {
		$.notify("Grup oluşturabilmek için klasör veya istemci seçiniz.", "error");
		return;
	}
//	$.LoadingOverlay("show", {image: "", text: "Üyeler gruba ekleniyor..."});
	progressForLoad('mainBody','show');
	var params = {
	    "groupDN" : selectedDN,
		"checkedEntries": JSON.stringify(checkedEntries)
	};
	$.ajax({ 
	    type: 'POST', 
	    url: "/lider/computer_groups/group/existing",
        dataType: 'json',
		data: JSON.stringify(params),
		contentType: "application/json",
	    success: function (data) { 
			$.notify("Seçilen istemciler gruba başarıyla eklendi.", "success");
//			//get selected data and update it with new data result from service call
//			var selectedData = selectedRow;
//			selectedData.attributesMultiValues = data.attributesMultiValues;
			$('#genericModal').trigger('click');
			renderComputerGroupTree();
//			createMembersList(data) 
	    },
	    error: function (xhr, textStatus, errorThrown) {
			if(xhr != null && xhr.responseText != null && xhr.responseText != "")
				$.notify(xhr.responseText, "error");
			else
				$.notify("Üyeler gruba eklenirken hata oluştu.", "error");
	    },
		complete: function() {
//			$.LoadingOverlay("hide", true);
			progressForLoad('mainBody','hide');
			$('#genericModal').trigger('click');
		}
	});
}

function btnEditGroupNameClicked() {
	
	var selectedDN=selectedRow.distinguishedName;
	
	var newOuName = $("#groupName").val();
	if(newOuName == "") {
		$.notify("Grup adı giriniz.", "error");
	} else {
		if(newOuName == selectedRow.name) {
			$('#genericModal').trigger('click');
			return;
		} 
		var params = {
				"oldDN" : selectedDN,
				"newName": "cn=" + newOuName
		};
		$.ajax({
		    type: 'POST', 
		    url: '/lider/computer_groups/rename/entry',
		    dataType: 'json',
		    data: params,
		    success: function (data) {
		    	$.notify("Grup adı düzenlendi.", "success");
	            $('#genericModal').trigger('click');
	            renderComputerGroupTree();
		    },
		    error: function (data, errorThrown) {
		    	$.notify("Grup adı düzenlenirken hata oluştu.", "error");
		    }
		});
	}
}

function rowCheckAndUncheckOperationForCreatingGroup(checkedRows,row) {
	checkedEntries = [];
	var checkedRows = $("#createNewAgentGroupTreeDivGrid").jqxTreeGrid('getCheckedRows');
	if(checkedRows.length > 0){
		for (var i = 0; i < checkedRows.length; i++) {
			if(checkedRows[i].distinguishedName != null) {
				checkedEntries.push({
					distinguishedName: checkedRows[i].distinguishedName, 
					entryUUID: checkedRows[i].entryUUID, 
					name: checkedRows[i].name,
					type: checkedRows[i].type,
					uid: checkedRows[i].uid
				});	
			}
		}
	}
}

function rowCheckAndUncheckOperationToAddMembersToExistingGroup(checkedRows) {
	checkedEntries = [];
	var checkedRows = $("#addMembersToExistingAgentGroupTreeDivGrid").jqxTreeGrid('getCheckedRows');
	if(checkedRows.length > 0){
		for (var i = 0; i < checkedRows.length; i++) {
			if(checkedRows[i].distinguishedName != null) {
				checkedEntries.push({
					distinguishedName: checkedRows[i].distinguishedName, 
					entryUUID: checkedRows[i].entryUUID, 
					name: checkedRows[i].name,
					type: checkedRows[i].type,
					uid: checkedRows[i].uid
				});	
			}
		}
	}
}


/*
 * delete group member from tab list
 */
function deleteMemberFromTabList(dn) {
	var selectedRowData=selectedRow;
	var dnListToDelete = [];
	dnListToDelete.push(dn);
	
	if(selectedRowData.attributesMultiValues['member'].length > 1) {
		var params = {
			    "dnList": dnListToDelete,
			    "dn": selectedRow.distinguishedName
		};
		$.ajax({
			type : 'POST',
			url  : 'lider/computer_groups/delete/group/members',
			data : params,
			dataType : 'json',
			success : function(data) {
				if(data != null) {
					$.notify("Seçili Grup Üyesi Başarı ile Kaldırıldı.", "success");
					//get selected data and update it with new data result from service call
					var selectedData=selectedRow;
					selectedData.attributesMultiValues = data.attributesMultiValues;
					$('#'+treeGridId).jqxTreeGrid('updateRow', selectedData.entryUUID, data);
					$('#'+treeGridId).jqxTreeGrid('getRow', data.entryUUID);
					$('#'+treeGridId).jqxTreeGrid('selectRow', data.entryUUID);
				}
			},
		    error: function (data, errorThrown) {
		    	$.notify("Grup üyesi silinirken hata oluştu.", "error");
		    }
		}); 
	} else {
		$.notify("Grup en az bir üye bulundurmalıdır. Son üye silinemez", "error");
	}
}
function createAgentGroupSearch(treeHolderDiv,treeGridId, showOnlyFolder) {
    var srcInputId = treeHolderDiv + "srcInput";
    var srcBtnId = treeHolderDiv + "srcBtn";
    var srcSelectId = treeHolderDiv + "srcSelect";
    var searchHtml = '<div class="input-group"> ' +
        '    <div class="input-group-prepend">  ' +
        '       <select class="form-control " style="font-size: 12px;" id="' + srcSelectId + '" > ';
    if (showOnlyFolder == false) {
        searchHtml += '<option  value="uid"> ID </option> ' +
            '<option selected value="cn"> Ad </option> ' +
            '<option value="ou"> Klasör </option>';
    } else if (showOnlyFolder == true) {
        searchHtml += '<option selected value="ou"> Klasör </option> ';
    }
    searchHtml += '</select> ' +
        '    </div> ' +
        '    <input placeholder="" id=' + srcInputId + ' type="text" class="form-control"> ' +
        '    <div class="input-group-append"> ' +
        '        <button class="btn btn-info" id="' + srcBtnId + '" > Ara </button> ' +
        '    </div> ' +
        ' </div>  ';
    $('#' + treeHolderDiv).append(searchHtml)
    $('#' + srcBtnId).on('click', function(event) {
        var selection = $('#' + treeGridId).jqxTreeGrid('getSelection');
        if (selection && selection.length > 0) {
            var key = $('#' + srcSelectId).val()
            var value = $('#' + srcInputId).val()
            if (key == -1) {
                return
            }
            if (value == "") {
                $.notify("Lütfen aranacak değer giriniz", "warn");
                return
            }
            var params = {
                "searchDn": selection[0].distinguishedName,
                "key": key,
                "value": value
            };
            $.ajax({
                type: 'POST',
                url: 'lider/ldap/searchEntry',
                data: params,
                dataType: "json",
                success: function(ldapResult) {
                    if (ldapResult.length == 0) {
                        $.notify("Sonuç Bulunamadı", "warn");
                        return;
                    }
                    $('#' + treeGridId).jqxTreeGrid('deleteRow', "Results")
                    $('#' + treeGridId).jqxTreeGrid('addRow', "Results", {
                        name: "Arama Sonuçları"
                    }, 'last')
                    for (var i = 0; i < ldapResult.length; i++) {
                        var entry = ldapResult[i];
                        $('#' + treeGridId).jqxTreeGrid('addRow', entry.name, entry, 'last', 'Results');
                    }
                    $('#' + treeGridId).jqxTreeGrid('collapseAll');
                    $('#' + treeGridId).jqxTreeGrid('expandRow', "Results");
                },
                error: function(data, errorThrown) {
                    $.notify("Hata Oluştu.", "error");
                }
            });
        } else {
            $.notify("Lütfen Arama Dizini Seçiniz", "warn");
        }
    });
	
}
