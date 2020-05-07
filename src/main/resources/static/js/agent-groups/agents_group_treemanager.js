/**
 * tree component 
 * this component can be use for tree
 * edip.yildiz
 * @param page
 * @param callback
 * @returns
 */
function createAgentsGroupTree(searchPath,treeHolderDiv,showOnlyFolder,useCheckBox, rowSelectAction, rowCheckAction, rowUncheckAction,postTreeCreatedAction) {
	var rootComputer = null;
	var treeGridId=treeHolderDiv+"Grid";
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
				    	 { text: "İstemci Grupları", align: "center", dataField: "name", width: '100%'}
				    ]
				 });
				 
				 $('#'+treeGridId).on('rowSelect', function (event) {
				        var args = event.args;
					    var row = args.row;
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
						      var urlPath='lider/computer_groups/getOuDetails'; 
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
					
					
					 postTreeCreatedAction(rootComputer , treeGridId)
		}
	});
}



function createSearch(treeHolderDiv,treeGridId, showOnlyFolder) {
	
	var srcInputId= treeHolderDiv+"srcInput";
	var srcBtnId= treeHolderDiv+"srcBtn";
	var srcSelectId= treeHolderDiv+"srcSelect";
	var searchHtml=	 '<div class="input-group"> '+
			'    <div class="input-group-prepend">  '+
			'       <select class="form-control " style="font-family: cursive; font-size: 12px;" id="'+srcSelectId+'" > ';
	       
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
