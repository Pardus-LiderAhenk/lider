/**
 * When page loading getting users from LDAP and ldap users tree fill out on the treegrid that used jqxTreeGrid api..
 * M. Edip YILDIZ
 * 
 */
$(document).ready(function(){
	
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
			 $("#treeGridUser").jqxTreeGrid(
			 {
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
			    	    else return "img/entry_org.gif";
			    	},
			     ready: function () {
			    	 
			    	 var allrows =$("#treeGridUser").jqxTreeGrid('getRows');
			    	 if(allrows.length==1){
			    		 var row=allrows[0];
			    		 if(row.childEntries==null ){
			    			 
			    			 $("#treeGridUser").jqxTreeGrid('addRow', row.name+"1", {}, 'last', row.name);
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
			 
				$('#treeGridUser').on('rowDoubleClick', function (event) {
			        var args = event.args;
				       var row = args.row;
				       var name= row.name;
			        
			        var row = $("#treeGridUser").jqxTreeGrid('getRow', name);
			       
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
			                
			                html += '<tr>';
				            html += '<td>' + key + '</td>';
				            html += '<td>' + row.attributes[key] + '</td>';
				            html += '</tr>';
			            }
			        } 
			        html += '</table>';
			        
				    $('#selectedDnInfo').html("Seçili Kayıt: "+name);
				    $('#ldapAttrInfoHolder').html(html);
				    
				    $('.nav-link').each(function(){               
				    	  var $tweet = $(this);                    
				    	  $tweet.removeClass('active');
				    	});
				    $('#tab-c-0').addClass('nav-link active');
				    $('#tab-c-0').click();

			    });
				
				 $('#treeGridUser').on('rowExpand', function (event) {
					 
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
								          
								          
									          $("#treeGridUser").jqxTreeGrid('addRow', childRow.name, childRow, 'last', row.name);
									          
									          if(childRow.hasSubordinates=="TRUE"){
									           $("#treeGridUser").jqxTreeGrid('addRow', childRow.name+"1" , {}, 'last', childRow.name); 
									          }
									           $("#treeGridUser").jqxTreeGrid('collapseRow', childRow.name);
								          
								      } 
									 row.expandedUser="TRUE"
								}
					
							});  
				      }
				 }); 
		}

	});
});