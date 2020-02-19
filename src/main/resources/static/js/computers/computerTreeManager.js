/**
 * tree component 
 * this component can be use for tree
 * edip.yildiz
 * @param page
 * @param callback
 * @returns
 */
function createComputerTree(treeHolderDiv,showOnlyFolder,useCheckBox, rowSelectAction, rowCheckAction, rowUncheckAction) {
	
	var rootDNUser = null;
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
		url : 'lider/ldap/getComputers',
		dataType : 'json',
		success : function(data) {
			rootDNUser = null;
			
			console.log(data)
			
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
							{ name: "entryUUID", type: "string" },
							{ name: "childEntries", type: "array" }
							],
							hierarchy:
							{
								root: "childEntries"
							},
							localData: data,
							id: "name"
			  };
			 
			 var cellclass = function (row, columnfield, value,rowData) {

					//if((value.indexOf("online") != -1) || (rowData.online) ){
					if(rowData.online){
						return 'green';
					}
					
//					if (rowData.online) {
//					return 'green';
//					}
//					else if (!rowData.online) {
//					return 'white';
//					}
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
				     pageSize: 15,
				     pageSizeOptions: ['15', '25', '50'],
				     icons: function (rowKey, dataRow) {
				    	    var level = dataRow.level;
				    	    if(dataRow.type == "AHENK"){
				    	    	return "img/linux.png";
				    	    }
				    	    else return "img/folder.png";
				    	},
				     ready: function () {
				    	 var allrows =$('#'+treeGridId).jqxTreeGrid('getRows');
				    	 if(allrows.length==1){
				    		 var row=allrows[0];
				    		 if(row.childEntries==null ){
				    			 $('#'+treeGridId).jqxTreeGrid('addRow', row.name+"1", {}, 'last', row.name);
				    		 }
				    	 }
				    	 $('#'+treeGridId).jqxTreeGrid('collapseAll');
				     },
				     rendered: function () {
				   	 },
				     columns: [
				    	 { text: "Bilgisayarlar", align: "center", dataField: "name", cellclassname: cellclass ,width: '100%'}
				    ]
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
						     
						      var nameList=[];
						      
						      for (var m = 0; m < row.records.length; m++) {
									var childRow = row.records[m];
									nameList.push(childRow.name);      
								}
								for (var k = 0; k < nameList.length; k++) {
									// get a row.
									var childRowname = nameList[k];
									$('#'+treeGridId).jqxTreeGrid('deleteRow', childRowname); 
								}  
						      
						      var urlPath=""
						      if(showOnlyFolder){
						    	  urlPath= 'lider/ldap/getOu'; 
						      }
						      else{
						    	  urlPath= 'lider/ldap/getOuDetails';
						      }
						      $.ajax({
									type : 'POST',
									url : urlPath,
									data : 'uid=' + row.distinguishedName + '&type=' + row.type
											+ '&name=' + row.name + '&parent=' + row.parent,
									dataType : 'text',
									success : function(ldapResult) {
										var childs = jQuery.parseJSON(ldapResult);
										var onlineCount=0;
										 for (var m = 0; m < childs.length; m++) {
											 	// get a row.
									          	var childRow = childs[m];
									          	if(childRow.online){
													onlineCount++;
												}
									          	$('#'+treeGridId).jqxTreeGrid('addRow', childRow.name, childRow, 'last', row.name);
												if(childRow.hasSubordinates=="TRUE"){
													$('#'+treeGridId).jqxTreeGrid('addRow', childRow.name+"1" , {}, 'last', childRow.name); 
												}
												$('#'+treeGridId).jqxTreeGrid('collapseRow', childRow.name);

									      } 
										 row.expandedUser="TRUE"
										if(onlineCount == 0){
														newName=row.ou+" ("+childs.length+")";
													}
													else{
														newName=row.ou+" ("+childs.length+"-"+onlineCount +")";
													}
												$('#'+treeGridId).jqxTreeGrid('updateRow',row.name, {name:newName });
												
										}
								});  
					      }
					 }); 
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
				searchHtml +='<option selected value="uid"> ID </option> '+
						'<option value="cn"> Ad </option> '+ 
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
				    	 $('#'+treeGridId).jqxTreeGrid('addRow' , entry.name , entry , 'last' ,'userSearch');
					}
					$('#'+treeGridId).jqxTreeGrid('expandRow', "userSearch")
					
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
