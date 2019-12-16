/**
 * When page loaing getting compters from LDAP and ldap computers tree fill out on the treegrid that used jqxTreeGrid api..
 * also plugin task tables load on start.
 * 
 * M. Edip YILDIZ
 * 
 */

connection.addHandler(onPresence2, null, "presence");

var selectedEntries = []; 

//creating pluginTask Table on the page
loadPluginTaskTable();

var html = '<table class="table table-striped table-bordered " id="rosterListTable">';
for (var i = 0; i < rosterList.length ; i++) {
	var roster=rosterList[i];
    	html += '<tr>';
        html += '<td>' + roster.item_name + '</td>';
     /*  html += '<td>' + roster.id + '</td>';
        html += '<td>' + roster.jid + '</td>'; */
        html += '</tr>';
}
html += '</table>';
$('#rosterListHolder').html(html);


var html = '<table class="table table-striped table-bordered " id="onlineEntryListTable">';

html += '<thead>';

html += '<tr>';
html += '<th>JID</th>';
html += '<th>Kaynak</th>';
html += '</tr>';
html += '</thead>';

for (var i = 0; i < onlineEntryList.length ; i++) {
	
	var entry=onlineEntryList[i];
	
    	html += '<tr>';
        html += '<td>' + entry.jid + '</td>';
        html += '<td>' + entry.source + '</td>';
     /*    html += '<td>' + roster.id + '</td>';
        html += '<td>' + roster.jid + '</td>'; */
        
   		 
        html += '</tr>';
}
html += '</table>';

$('#onlineEntryListHolder').html(html);

$(document).ready(function(){
	
	$.ajax({
		type : 'POST',
		url : 'lider/ldap/getComputers',
		dataType : 'json',
		success : function(data) {
			loadComputersTree(data)
		},
		error: function (data, errorThrown) {
	    	console.log(data);
	    }
	

	});

	$('#selectedEntryListModal').on('show.bs.modal', function(event) {
		showSelectedEntries();
		
	});
	

	
	$('#textTaskSearch').keyup(function() {
		
		var txt=$('#textTaskSearch').val();
		 $("#pluginListTable > tbody > tr").filter(function() {
			 $(this).toggle($(this).text().indexOf(txt) > -1)
		 });
	});
});


function showSelectedEntries() {

	var html = '<table class="table table-striped table-bordered " id="selectedEntry4TaskTables">';

	for (var i = 0; i < selectedEntries.length; i++) {

		html += '<tr>';

		html += '<td>' + selectedEntries[i].name + '</td>';
		html += '<td>' + selectedEntries[i].distinguishedName + '</td>';

		html += '<td> <button class="btn btn-xs btn-default removeEntry" type="button" id="' +selectedEntries[i]+ '" data-id="'+ selectedEntries[i]+'" title="Kaldir"> <img src="img/remove.png"></img> </button>  </td>';

		html += '</tr>';
	}
	html += '</table>';

	$('#selectedEntriesHolder').html(html);
	
	$('.removeEntry').on('click', function(e) {
		var uid = $(this).data("id");

		selectedEntries.splice($.inArray(uid, selectedEntries), 1);
		showSelectedEntries();
		$('#selectedEntrySize').html(selectedEntries.length);
	});
}
	
function loadPluginTaskTable() {
	
	$.ajax({
		type : 'POST',
		url : 'getPluginTaskList',
		dataType : 'json',
		success : function(data) {
			
			var pluginTaskList = data;

			var html = '<table class="table table-striped table-bordered " id="pluginListTable">';
			html += '<thead>';
			
			html += '<tr>';
			html += '<th>Görev Adı</th>';
			html += '<th>Açıklama</th>';
			html += '<th></th>';
			html += '</tr>';
			html += '</thead>';
		    
		    for (var i = 0; i < pluginTaskList.length ; i++) {
		    	
		    	var entry=pluginTaskList[i];
		    	
		        	html += '<tr>';
		            html += '<td>' + entry.name + '</td>';
		            html += '<td>' + entry.description + '</td>';
		            html += '<td>  <button class="btn btn-xs btn-default sendTaskButton" type="button" id="sendTaskButtonId" data-toggle="modal" data-target="#taskModal" data-id="' + entry.id + '" data-page="'
		            + entry.page +'" data-name="'+ entry.name +'" data-description="'+ entry.description+'" > <img class="img-responsive" src="img/LiderAhenk-task.png" title="Lider MYS" alt="Lider MYS" />  </button>  </td>';
		        
		       		 
		            html += '</tr>';
		    }
		    html += '</table>';
		    
		    $('#pluginListTableDiv').html(html);
		    
		    $('.sendTaskButton').click(function() {
				var page = $(this).data('page');
				var name = $(this).data('name');
				var description = $(this).data('description');
				var id = $(this).data('id');
				
				$.ajax({
					type : 'POST',
					url : 'getPluginTaskHtmlPage',
					data : 'id=' + id + '&name=' + name
							+ '&page=' + page + '&description=' + description,
					dataType : 'text',
					success : function(data) {
						
						$('#pluginHtmpPageModal').modal('show');
						$('#pluginHtmpPageModalLabel').html(name);
						$('#pluginPageRender').html(data);
					}
				});
			});
		}
	});
}

function onPresence2(presence)
{
	 	var ptype = $(presence).attr('type');
        var from = $(presence).attr('from');
        var jid_id = jid_to_id(from);
        var name = jid_to_name(from);
        var source = jid_to_source(from);
        
        
       if (ptype === 'subscribe') {
    	   $.notify("subscribe","warn");
        } 
       
       else if (ptype !== 'error') {
        	//OFFLine state
        	
            if (ptype === 'unavailable') {
            	
            	var row = $("#treegrid").jqxTreeGrid('getRow', name);
            	
            	row.online=false;
            	
            	$("#treegrid").jqxTreeGrid('updateRow', name , {name:name}); 
            
            } else {
            	
            	var row = $("#treegrid").jqxTreeGrid('getRow', name);
            	
            	row.online=true;
            	
            	$("#treegrid").jqxTreeGrid('updateRow', name , {name:name}); 
            }
       }
       
        return true;
}


function loadComputersTree(data){
	
	
	
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
           else{
               return 'white';
           }
//           if (rowData.online) {
//           	return 'green';
//           }
//           else if (!rowData.online) {
//           	return 'white';
//           }
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
	 $("#treegrid").jqxTreeGrid(
	 {
	     source: dataAdapter,
	     altRows: true,
	     sortable: true,
	     theme :"Orange",
	     columnsResize: true,
        filterable: true,
	     hierarchicalCheckboxes: true,
	     pageable: true,
        pagerMode: 'default',
	     checkboxes: true,
	     filterMode: "simple",
	     localization: getLocalization(),
	     pageSize: 30,
	     pageSizeOptions: ['15', '25', '50'],
	     icons: function (rowKey, dataRow) {
	    	    var level = dataRow.level;
	    	    if(dataRow.type == "AHENK"){
	    	        return "img/linux.png";
	    	    }
	    	    else return "img/entry_org.gif";
	    	},
	     ready: function () {
	    	 
	    	 var allrows =$("#treegrid").jqxTreeGrid('getRows');
	    	 if(allrows.length==1){
	    		 var row=allrows[0];
	    		 if(row.childEntries==null && row.name=="Ahenkler"){
	    			 
	    			 $("#treegrid").jqxTreeGrid('addRow', row.name+"1", {}, 'last', row.name);
	    		 }
	    	 }
	    	 $("#treegrid").jqxTreeGrid('collapseAll');
	     },
	     rendering: function()
           {
               /* // destroys all buttons.
               if ($(".editButtons").length > 0) {
                   $(".editButtons").jqxButton('destroy');
               } */
             
           },

	     rendered: function () {

	   	},
	     
	     columns: [
	       { text: "Bilgisayarlar", align: "center", dataField: "name", cellclassname: cellclass, width: 450 }
	     
	     ]
	 });
	 
	 $('#treegrid').on('rowExpand', function (event) {
		 
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
					          $("#treegrid").jqxTreeGrid('deleteRow', childRowname); 
			  }  
	     
		      $.ajax({
					type : 'POST',
					url : 'getOuDetails',
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
					          
						          $("#treegrid").jqxTreeGrid('addRow', childRow.name, childRow, 'last', row.name);
						          
						          if(childRow.hasSubordinates=="TRUE"){
						           $("#treegrid").jqxTreeGrid('addRow', childRow.name+"1" , {}, 'last', childRow.name); 
						          }
						           $("#treegrid").jqxTreeGrid('collapseRow', childRow.name);
					          
					      } 
						 row.expandedUser="TRUE"
							 
							 if(onlineCount == 0){
								newName=row.ou+" ("+childs.length+")";
							}
							else{
								newName=row.ou+" ("+childs.length+"-"+onlineCount +")";
							}
						
						 $("#treegrid").jqxTreeGrid('updateRow',row.name, {name:newName });
					     
					}
		
				});  
	      }
	 }); 
	
	$('#addSelectedEntry2').on('click',function() {
			 
							var checkedRows = $("#treegrid").jqxTreeGrid('getCheckedRows');
							console.log(checkedRows)
							var checkedEntryArray=[]
							
							 for (var i = 0; i < checkedRows.length; i++) {
						          // get a row.
						          var rowData = checkedRows[i];
						         
						          checkedEntryArray.push(
						        		  {
						        			  distinguishedName :rowData.distinguishedName, 
						        			  entryUUID: rowData.entryUUID, 
						        			  name: rowData.name,
						        			  type: rowData.type,
						        			  uid: rowData.uid
						        			  });
						      }
							
							$.ajax({
						        url : 'getAhenks',
						        type : 'POST',
						        data: JSON.stringify(checkedEntryArray),
						        dataType: "json",
						        contentType: "application/json",
						        success : function(data) {
						        	var ahenks = data;
						        	
						        	for (var i = 0; i < ahenks.length; i++) {
								          // get a row.
								          var rowData = ahenks[i];
								          if(rowData.type=="AHENK"){
								        	  var indexx=$.grep(selectedEntries, function(item){
								                  return item.entryUUID == rowData.entryUUID;
								           			}).length
								        	 
								           			if(indexx ==0 ){
														selectedEntries.push(rowData);
								           			}
								          }
								      }
									 $('#selectedEntrySize').html(selectedEntries.length);
								}
						    });
		});
	$('#addOnlyOnlineAhenk').on('click',function() {
		
		var checkedRows = $("#treegrid").jqxTreeGrid('getCheckedRows');
		console.log(checkedRows)
		var checkedEntryArray=[]
		
		for (var i = 0; i < checkedRows.length; i++) {
			// get a row.
			var rowData = checkedRows[i];
			
			checkedEntryArray.push(
					{
						distinguishedName :rowData.distinguishedName, 
						entryUUID: rowData.entryUUID, 
						name: rowData.name,
						type: rowData.type,
						uid: rowData.uid
					});
		}
		
		$.ajax({
			url : 'getOnlineAhenks',
			type : 'POST',
			data: JSON.stringify(checkedEntryArray),
			dataType: "json",
			contentType: "application/json",
			success : function(data) {
				var ahenks = data;
				
				for (var i = 0; i < ahenks.length; i++) {
					// get a row.
					var rowData = ahenks[i];
					if(rowData.type=="AHENK"){
						var indexx=$.grep(selectedEntries, function(item){
							return item.entryUUID == rowData.entryUUID;
						}).length
						
						if(indexx ==0 ){
							selectedEntries.push(rowData);
						}
					}
				}
				$('#selectedEntrySize').html(selectedEntries.length);
			}
		});
	});
	 
		$('#treegrid').on('rowDoubleClick', function (event) {
	        var args = event.args;
	        var row = args.row;
	       
	        var name= row.name;
	        alert(name);
	        var entries = jQuery.parseJSON(data);
	        alert(entries.length);
	        
	        for (var i = 0; i < entries.length; i++) {
		          // get a row.
		          var entry = entries[i];
		          if(entry.name==name){
		        	  console.log(entry.attributes);
		          }
		      }

	    });
}