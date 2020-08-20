/**
 * tree component 
 * this component can be use for tree
 * edip.yildiz
 * @param page
 * @param callback
 * @returns
 */
function createComputerTree(searchPath,treeHolderDiv,showOnlyFolder,useCheckBox, rowSelectAction, rowCheckAction, rowUncheckAction,postTreeCreatedAction) {
	
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
			 
			 var cellclass = function (row, columnfield, value,rowData) {

					//if((value.indexOf("online") != -1) || (rowData.online) ){
					if(rowData.online){
						return 'treeRowOnline';
					}
					return 'treegridClass';
					
//					if (rowData.online) {
//					return 'green';
//					}
//					else if (!rowData.online) {
//					return 'white';
//					}
				};
				
				var cellsRenderer= function (row, column, value, rowData) {
					var container = '<span style="text-align: left; margin-top: 0px;" class="tooltip">' + value + '</span>';
					return container;
				}
				var cellsrenderer = function (row, column, value) { 
					return '<span>' + value + '</span>';

					}

				var columnsrenderer = function (value) {
					return '<span>' + value + '</span>';
				}
			 
			 rootComputer = source.localData[0].entryUUID;
//			 	$("#treeGridUser").jqxTreeGrid('destroy');
			 	
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
				     pageSizeOptions: ['15', '20', '50'],
				     icons: function (rowKey, dataRow) {
				    	    var level = dataRow.level;

				    	    if(dataRow.type == "AHENK"){
				    	    	if(dataRow.attributes['liderDeviceOSType'] == 'Windows')
				    	    		return "img/windows.png";
				    	    	else
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
				     },
				     rendered: function () {
				   	 },
				     columns: [
				    	 { text: "İstemciler", align: "center", dataField: "name", cellclassname: cellclass ,  
				             width: '100%'}
				    ]
				 });
				 
				 	$('#'+treeGridId).on('rowSelect', function (event) {
				        var args = event.args;
					    var row = args.row;
					    var name= row.name;
					    rowSelectAction(row,rootComputer);
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
						      
						      var urlPath=""
						      if(showOnlyFolder){
						    	  urlPath= '/lider/computer/getOu'; 
						      }
						      else{
						    	  urlPath= '/lider/computer/getOuDetails';
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
									          	$('#'+treeGridId).jqxTreeGrid('addRow', childRow.entryUUID, childRow, 'last', row.entryUUID);
												if(childRow.hasSubordinates=="TRUE"){
													$('#'+treeGridId).jqxTreeGrid('addRow', childRow.entryUUID+"1" , {}, 'last', childRow.entryUUID); 
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
										 $('#'+treeGridId).jqxTreeGrid('updateRow',row.entryUUID, {name:newName });
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
	var srcBtnOnlineClients= treeHolderDiv+"srcOnlineUsers";
	var srcSelectId= treeHolderDiv+"srcSelect";
	var searchHtml= ' <div class="col-md-12">'+	 
						'  <div class="input-group"> '+
						'    <div class="input-group-prepend">  '+
						'       <select class="form-control " style="font-family: cursive; font-size: 12px;" id="'+srcSelectId+'" > ';
				       
					   if(showOnlyFolder==false){
							searchHtml +='<option  value="uid"> ID </option> '+
									'<option selected value="cn"> Ad </option> '+ 
									'<option value="ou"> Klasör </option>';
							searchHtml +='</select> '+
							'    </div> '+ 
							'    <input placeholder="" id='+srcInputId+' type="text" class="form-control"> '+ 
							'    <div class="input-group-append"> '+ 
							'        <button class="btn btn-info" id="'+srcBtnId+'" > Ara </button> '+ 
							' <button class="btn btn-success" id="'+srcBtnOnlineClients+'" > <i class="fas fa-plug"></i> Çevrimiçi </button> '+
							'    </div> '+ 
							'    </div> '+ 
						' </div> ';
						}
						else if(showOnlyFolder==true){
							searchHtml +='<option selected value="ou"> Klasör </option> ';
							searchHtml +='</select> '+
							'    </div> '+ 
							'    <input placeholder="" id='+srcInputId+' type="text" class="form-control"> '+ 
							'    <div class="input-group-append"> '+ 
							'        <button class="btn btn-info" id="'+srcBtnId+'" > Ara </button> '+ 
//							' <button class="btn btn-success" id="'+srcBtnOnlineClients+'" > <i class="fas fa-plug"></i> Çevrimiçi </button> '+
							'    </div> '+ 
							'    </div> '+ 
						' </div> ';
						}
		
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
			
			progress("computerTreeDiv","progressComputerTree",'show')
			$.ajax({
				type : 'POST',
				url : 'lider/ldap/searchEntry',
				data : params,
				dataType: "json",
				success : function(ldapResult) {
					progress("computerTreeDiv","progressComputerTree",'hide')
					if(ldapResult.length==0){
						$.notify("Sonuç Bulunamadı", "warn");
						return;
					}
					
					$('#'+treeGridId).jqxTreeGrid('deleteRow', "Arama Sonuçları")
					$('#'+treeGridId).jqxTreeGrid('addRow', "Arama Sonuçları", { name: "Arama Sonuçları" }, 'last')
					
					for (var i = 0; i < ldapResult.length; i++) {
				    	 var entry = ldapResult[i];
				    	 $('#'+treeGridId).jqxTreeGrid('addRow' , entry.entryUUID , entry , 'last' ,'Arama Sonuçları');
				    	 if(entry.hasSubordinates=="TRUE"){
								$('#'+treeGridId).jqxTreeGrid('addRow', entry.entryUUID+"1" , {}, 'last', entry.entryUUID); 
						}
					}
					$('#'+treeGridId).jqxTreeGrid('collapseAll');
					$('#'+treeGridId).jqxTreeGrid('expandRow', "Arama Sonuçları");
					
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
						
	$('#'+srcBtnOnlineClients).on('click', function (event) {
		var selection =$('#'+treeGridId).jqxTreeGrid('getSelection');
		if(selection && selection.length>0){
			var params = {
					"searchDn" : selection[0].distinguishedName
			};
			progress("computerTreeDiv","progressComputerTree",'show')
			$.ajax({
				type : 'POST',
				url : 'lider/computer/searchOnlineEntries',
				data : params,
				dataType: "json",
				success : function(ldapResult) {
					progress("computerTreeDiv","progressComputerTree",'hide')
					if(ldapResult.length==0){
						$.notify("Sonuç Bulunamadı", "warn");
						return;
					}
					
					$('#'+treeGridId).jqxTreeGrid('deleteRow', "Arama Sonuçları")
					$('#'+treeGridId).jqxTreeGrid('addRow', "Arama Sonuçları", { name: "Arama Sonuçları" }, 'last')
					
					for (var i = 0; i < ldapResult.length; i++) {
				    	 var entry = ldapResult[i];
				    	 $('#'+treeGridId).jqxTreeGrid('addRow' , entry.name , entry , 'last' ,'Arama Sonuçları');
					}
					$('#'+treeGridId).jqxTreeGrid('collapseAll');
					$('#'+treeGridId).jqxTreeGrid('expandRow', "Arama Sonuçları");
					
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
