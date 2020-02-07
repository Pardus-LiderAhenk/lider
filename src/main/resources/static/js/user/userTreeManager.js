/**
 * userTree component 
 * this component can be use for user tree
 * edip.yildiz
 * @param page
 * @param callback
 * @returns
 */
function createUserTree(treeHolderDiv,disableUsers,useCheckBox, rowCheckAction, rowUncheckAction) {
	
	$('#'+treeHolderDiv).append('<div id="search" class="pull-right"> <input type="text" id="searchInput" /> <button id="btnSearchTree" > Ara </button> </div>')
	
	$('#btnSerachTree').on('click', function (event) {
		alert("dsf")
	});
	
	$.ajax({
		type : 'POST',
		url : 'lider/user/getUsers',
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
//			 	$("#treeGridUser").jqxTreeGrid('destroy');
			 	var treeGridId=treeHolderDiv+"treeGridUser"
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
					 theme :"Orange",
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
				       { text: "Kullanıcılar", align: "center", dataField: "name", width: '100%' }
				     ]
				 });
				 
				 $('#'+treeGridId).on('rowSelect', function (event) {
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
				                if( (   key =="homeDirectory") 
				                		|| (key =="cn") 
				                		|| (key =="uid") 
				                		|| (key =="sn") 
				                		|| (key =="homePostalAddress") 
				                		|| (key =="telephoneNumber") 
				                		|| (key =="entryDN") 
				                		|| (key =="pwdPolicySubentry") 
				                		){
				                	html += '<tr>';
				                	var keyStr="";
				                	if(key =="pwdPolicySubentry"){keyStr="Parola Politikası"}
				                	if(key =="homeDirectory"){keyStr="Ev Dizini"}
				                	if(key =="cn"){keyStr="Kullanıcı Adı"}
				                	if(key =="uid"){keyStr="Kimlik"}
				                	if(key =="sn"){keyStr="Kullanıcı Soyadı"}
				                	if(key =="telephoneNumber"){keyStr="Telefon"}
				                	if(key =="entryDN"){keyStr="Kayıt DN"}
				                	if(key =="homePostalAddress"){keyStr="Adres"}
						            html += '<td>' + keyStr + '</td>';
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
						      if(disableUsers){
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
									}
								});  
					      }
					 }); 
		}
	});
}
