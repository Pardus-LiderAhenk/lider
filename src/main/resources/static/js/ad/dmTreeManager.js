/**
 * DM Tree component 
 * this component can be use for user tree
 * edip.yildiz
 * @param page
 * @param callback
 * @returns
 */


function createDMTree( treeHolderDiv,showOnlyFolder,useCheckBox, rowSelectAction, rowCheckAction, rowUncheckAction , postAdTreeCreatedAction ) {
	var rootDN = null;
	var firstRow=null
	var treeGridId=treeHolderDiv+"Grid";
	$('#'+treeHolderDiv).html("");
	/**
	 * create search area
	 */
	createSearchDM(treeHolderDiv,treeGridId,showOnlyFolder);
	/**
	 * get root dn for user and set treegrid tree
	 */
	$.ajax({
		type : 'POST',
		url : 'ad/getDomainEntry',
		dataType : 'json',
		success : function(data) {
			$('#'+treeHolderDiv).append('<div id="'+treeGridId+'"></div> ')
			 var source = {
			      dataType: "json",
			      dataFields: [
			           { name: "distinguishedName", type: "string" },
			           { name: "expandedUser", type: "string" },
			           { name: "attributes", type: "array" },
			           { name: "attributesMultiValues", type: "array" },
			           { name: "childEntries", type: "array" },
			           { name: "name", type: "string" },
			           { name: "entryUUID", type: "string" }
			      ],
			      hierarchy:
			          {
			              root: "childEntries"
			          },
			      localData: data,
			      id: "distinguishedName"
			  };
			
			var dataAdapter = new $.jqx.dataAdapter(source, {
			     loadComplete: function () {
			     }
			 });
			
			 var getLocalization = function () {
		           var localizationobj = {};
		           localizationobj.filterSearchString = "Ara :";
		           return localizationobj;
			}
			 rootDN = source.localData[0].distinguishedName;
			 
			 // create jqxTreeGrid.
			 $('#'+treeGridId).jqxTreeGrid({
				 width: '100%',
				 height: 590,
				 source: dataAdapter,
			     altRows: true,
			     sortable: true,
			     columnsResize: true,
		         filterable: false,
			     hierarchicalCheckboxes: false,
			     pageable: true,
		         pagerMode: 'default',
			     checkboxes: false,
			     filterMode: "simple",
			     selectionMode: "singleRow",
			     localization: getLocalization(),
			     pageSize: 50,
			     pageSizeOptions: ['15', '25', '100'],
			     icons: function (rowKey, dataRow) {
			    	    var level = dataRow.level;
			    	    if(dataRow.type == "CONTAINER"){
			    	        return "img/entry_org.gif";
			    	    }
			    	    else if(dataRow.type == "USER"){
			    	    	return "img/person.png";
			    	    }
			    	    else if(dataRow.type == "GROUP"){
			    	    	return "img/entry_group.gif";
			    	    }
			    	    else if(dataRow.type == "ORGANIZATIONAL_UNIT"){
			    	    	return "img/folder.png";
			    	    }
			    	    else if(dataRow.type == "AHENK"){
			    	    	return "img/linux.png";
			    	    }
			    	    else if(dataRow.type == "WIND0WS_AHENK"){
			    	    	return "img/windows.png";
			    	    }
			    	    else 
			    	    	return "img/folder.png";
			    	},
			     ready: function () {
			    	 var allrows =$('#'+treeGridId).jqxTreeGrid('getRows');
			    	 if(allrows.length==1){
			    		 var row=allrows[0];
			    		 firstRow=row;
			    		 if(row.childEntries==null ){
			    			 $('#'+treeGridId).jqxTreeGrid('addRow', row.uid+"1", {}, 'last', row.uid);
			    		 }
			    	 }
			    	 $('#'+treeGridId).jqxTreeGrid('collapseAll');
			     },
			     rendered: function () {
			   	 },
			     columns: [
			       { text: "", align: "center", dataField: "name", width: '100%' }
			     ]
			 });
				 
			// create context menu
			 	var contextDomain=$("#treeMenuDomain").jqxMenu({ width: 250, autoOpenPopup: false, mode: 'popup' });;
         		var contextMenu=$("#treeMenuContainer").jqxMenu({ width: 250,  autoOpenPopup: false, mode: 'popup' });;
	            var contextMenuGroup = $("#treeMenuGroup").jqxMenu({ width: 250,  autoOpenPopup: false, mode: 'popup' });
	            var contextMenuUser = $("#treeMenuUser").jqxMenu({ width: 200,  autoOpenPopup: false, mode: 'popup' });
	            var contextMenuOu = $("#treeMenuOu").jqxMenu({ width: 250,  autoOpenPopup: false, mode: 'popup' });
		
	           
	            $('#'+treeGridId).on('contextmenu', function () {
	            	
	                return false;
	            });
	            
	            $('#'+treeGridId).on('rowClick', function (event) {
	            	
	            	var args = event.args;
	                var row = args.row;
	                
	                if ( args.originalEvent.button == 2) {
	                    var scrollTop = $(window).scrollTop();
	                    var scrollLeft = $(window).scrollLeft();
	                    if(row.type==null){ // this is for root dn
	                    	contextMenu.jqxMenu('close', parseInt(event.args.originalEvent.clientX) + 100 + scrollLeft, parseInt(event.args.originalEvent.clientY) + 5 + scrollTop);
	                    	contextMenuGroup.jqxMenu('close', parseInt(event.args.originalEvent.clientX) + 100 + scrollLeft, parseInt(event.args.originalEvent.clientY) + 5 + scrollTop);
	                    	contextMenuUser.jqxMenu('close', parseInt(event.args.originalEvent.clientX) + 100 + scrollLeft, parseInt(event.args.originalEvent.clientY) + 5 + scrollTop);
	                    	contextMenuOu.jqxMenu('close', parseInt(event.args.originalEvent.clientX) + 100 + scrollLeft, parseInt(event.args.originalEvent.clientY) + 5 + scrollTop);
	                    	contextDomain.jqxMenu('open', parseInt(event.args.originalEvent.clientX) + 100 + scrollLeft, parseInt(event.args.originalEvent.clientY) + 5 + scrollTop);
	                    }
	                    else if(row.type=="GROUP"){
	                    	contextMenu.jqxMenu('close');
	                    	contextMenuUser.jqxMenu('close');
	                    	contextMenuOu.jqxMenu('close');
	                    	contextDomain.jqxMenu('close');
	                    	contextMenuGroup.jqxMenu('open', parseInt(event.args.originalEvent.clientX) + 100 + scrollLeft, parseInt(event.args.originalEvent.clientY) + 5 + scrollTop);
	                    }
	                    else if(row.type=="USER"){
	                    	contextMenu.jqxMenu('close');
	                    	contextMenuGroup.jqxMenu('close');
	                    	contextMenuOu.jqxMenu('close'); 
	                    	contextDomain.jqxMenu('close'); 
	                    	contextMenuUser.jqxMenu('open', parseInt(event.args.originalEvent.clientX) + 100 + scrollLeft, parseInt(event.args.originalEvent.clientY) + 5 + scrollTop);
	                    }
	                    else if(row.type=="ORGANIZATIONAL_UNIT"){
	                    	contextMenu.jqxMenu('close', parseInt(event.args.originalEvent.clientX) + 100 + scrollLeft, parseInt(event.args.originalEvent.clientY) + 5 + scrollTop);
	                    	contextMenuGroup.jqxMenu('close', parseInt(event.args.originalEvent.clientX) + 100 + scrollLeft, parseInt(event.args.originalEvent.clientY) + 5 + scrollTop);
	                    	contextMenuUser.jqxMenu('close', parseInt(event.args.originalEvent.clientX) + 100 + scrollLeft, parseInt(event.args.originalEvent.clientY) + 5 + scrollTop);
	                    	contextDomain.jqxMenu('close', parseInt(event.args.originalEvent.clientX) + 100 + scrollLeft, parseInt(event.args.originalEvent.clientY) + 5 + scrollTop);
	                    	contextMenuOu.jqxMenu('open', parseInt(event.args.originalEvent.clientX) + 100 + scrollLeft, parseInt(event.args.originalEvent.clientY) + 5 + scrollTop);
	                    }
	                   
	                    else if(row.type.includes('AHENK')){
	                    	contextMenu.jqxMenu('close', parseInt(event.args.originalEvent.clientX) + 100 + scrollLeft, parseInt(event.args.originalEvent.clientY) + 5 + scrollTop);
	                    	contextMenuGroup.jqxMenu('close', parseInt(event.args.originalEvent.clientX) + 100 + scrollLeft, parseInt(event.args.originalEvent.clientY) + 5 + scrollTop);
	                    	contextMenuUser.jqxMenu('close', parseInt(event.args.originalEvent.clientX) + 100 + scrollLeft, parseInt(event.args.originalEvent.clientY) + 5 + scrollTop);
	                    	contextMenuOu.jqxMenu('close', parseInt(event.args.originalEvent.clientX) + 100 + scrollLeft, parseInt(event.args.originalEvent.clientY) + 5 + scrollTop);
	                    	contextDomain.jqxMenu('close', parseInt(event.args.originalEvent.clientX) + 100 + scrollLeft, parseInt(event.args.originalEvent.clientY) + 5 + scrollTop);
	                    }
	                    else{
	                    	contextMenuGroup.jqxMenu('close', parseInt(event.args.originalEvent.clientX) + 100 + scrollLeft, parseInt(event.args.originalEvent.clientY) + 5 + scrollTop);
	                    	contextMenuUser.jqxMenu('close', parseInt(event.args.originalEvent.clientX) + 100 + scrollLeft, parseInt(event.args.originalEvent.clientY) + 5 + scrollTop);
	                    	contextMenuOu.jqxMenu('close', parseInt(event.args.originalEvent.clientX) + 100 + scrollLeft, parseInt(event.args.originalEvent.clientY) + 5 + scrollTop);
	                    	contextDomain.jqxMenu('close', parseInt(event.args.originalEvent.clientX) + 100 + scrollLeft, parseInt(event.args.originalEvent.clientY) + 5 + scrollTop);
	                    	contextMenu.jqxMenu('open', parseInt(event.args.originalEvent.clientX) + 100 + scrollLeft, parseInt(event.args.originalEvent.clientY) + 5 + scrollTop);
	                    }
	                   
	                    return false;
	                }
	                else{
//	                	rowSelectAction(row,rootDN);
	                	if(contextMenu!=null)
	                		contextMenu.jqxMenu('close', parseInt(event.args.originalEvent.clientX) + 100 + scrollLeft, parseInt(event.args.originalEvent.clientY) + 5 + scrollTop);
	                	if(contextMenuGroup!=null)
	                		contextMenuGroup.jqxMenu('close', parseInt(event.args.originalEvent.clientX) + 100 + scrollLeft, parseInt(event.args.originalEvent.clientY) + 5 + scrollTop);
	                	if(contextMenuUser!=null)
	                		contextMenuUser.jqxMenu('close', parseInt(event.args.originalEvent.clientX) + 100 + scrollLeft, parseInt(event.args.originalEvent.clientY) + 5 + scrollTop);
	                	if(contextDomain!=null)
	                		contextDomain.jqxMenu('close', parseInt(event.args.originalEvent.clientX) + 100 + scrollLeft, parseInt(event.args.originalEvent.clientY) + 5 + scrollTop);
	                	if(contextMenuOu!=null)
	                		contextMenuOu.jqxMenu('close', parseInt(event.args.originalEvent.clientX) + 100 + scrollLeft, parseInt(event.args.originalEvent.clientY) + 5 + scrollTop);
	                }
	            });
			 
				 $('#'+treeGridId).on('rowSelect', function (event) {
				        var args = event.args;
					    var row = args.row;
					    var name= row.name;
					    rowSelectAction(row,rootDN);
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
					    	 
					    	 progress("treeGridAdUserHolderDiv","progressAdTree",'show')
						     
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
						      
						      $.ajax({
									type : 'POST',
									url : 'ad/getChildEntriesOu',
									data : 'distinguishedName=' + row.distinguishedName 	+ '&name=' + row.name + '&parent=' + row.parent,
									dataType : 'text',
									success : function(ldapResult) {
										var childs = jQuery.parseJSON(ldapResult);
										 for (var m = 0; m < childs.length; m++) {
											 	// get a row.
									          	var childRow = childs[m];
										          $('#'+treeGridId).jqxTreeGrid('addRow', childRow.distinguishedName, childRow, 'last', row.uid);
//										          if(childRow.hasSubordinates=="TRUE"){
										           $('#'+treeGridId).jqxTreeGrid('addRow', childRow.distinguishedName+"1" , {}, 'last', childRow.uid); 
//										          }
										           $('#'+treeGridId).jqxTreeGrid('collapseRow', childRow.uid);
									      } 
										 row.expandedUser="TRUE"
										 progress("treeGridAdUserHolderDiv","progressAdTree",'hide')
									}
								});  
					      }
				});
					
					postAdTreeCreatedAction(rootDN,treeGridId,firstRow,null)
		},
		error: function (data, errorThrown) {
			
			postAdTreeCreatedAction(null,null,null,errorThrown)
	    }
	});
	
}

function createSearchDM(treeHolderDiv,treeGridId, showOnlyFolder) {
	
	var srcInputId= treeHolderDiv+"srcInput";
	var srcBtnId= treeHolderDiv+"srcBtn";
	var srcSelectId= treeHolderDiv+"srcSelect";
	var searchHtml=	
			' <div class="input-group"> '+
			'    <div class="input-group-prepend">  '+
			'       <select class="form-control " style="font-family: cursive; font-size: 12px;" id="'+srcSelectId+'" > ';
	       
		   if(showOnlyFolder==false){
				searchHtml +='<option selected value="uid"> UID </option> '+
						'<option value="CN"> CN </option> '+ 
						'<option value="SN"> SN </option>'+
						'<option value="OU"> Organizational Unit </option>'+
						'<option value="description"> Description </option>'+
						'<option value="sAMAccountName"> sAMAccountName </option>'+
						'<option value="streetAddress"> Adress </option>'+
						'<option value="telephoneNumber"> Telephone Number </option>'+
						'<option value="objectclass"> Object Class </option>';
				;
			}
			else if(showOnlyFolder==true){
				searchHtml +='<option selected value="ou"> Organizational Unit </option> ';
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
				url : 'ad/searchEntry',
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
				    	 $('#'+treeGridId).jqxTreeGrid('addRow' , entry.uid , entry , 'last' ,'userSearch');
				    	 $('#'+treeGridId).jqxTreeGrid('addRow', entry.uid+"1", {}, 'last', entry.uid);
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
