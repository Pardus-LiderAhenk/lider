/**
 * When page loading getting users groups from LDAP.
 * M. Edip YILDIZ
 * 
 */
$(document).ready(function(){
	
	$.ajax({
		type : 'POST',
		url : 'lider/ldap/userGroups',
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
			           { name: "expanded", type: "string" },
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
			 $("#treeGridUserGroups").jqxTreeGrid(
			 {
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
			    	    if(dataRow.type == "ORGANIZATIONAL_UNIT"){
			    	        return "img/entry_org.gif";
			    	    }
			    	    else return "img/entry_group.gif";
			    	},
			     ready: function () {
			    	 
			     },
			     columns: [
			       { text: "Kullanıcı Grupları", align: "center", dataField: "name", width: '100%' }
			     ]
			 });
			 
			 $('#treeGridUserGroups').on('rowDoubleClick', function (event) {
				   var args = event.args;
			       var row = args.row;
			       var name= row.name;
			       var row = $("#treeGridUserGroups").jqxTreeGrid('getRow', name);
			        
			       var html = '<table class="table table-striped table-bordered " id="attrTable">';
					html += '<thead>';
					html += '<tr>';
					html += '<th style="width: 40%">Öznitelik</th>';
					html += '<th style="width: 60%">Değer</th>';
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
				    
				    $('#tab-c-4-info').tab('show');

			  });
			 
			
			 
			
		}

	});
});