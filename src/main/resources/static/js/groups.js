/**
 * When page loading getting groups from LDAP and ldap users tree fill out on the treegrid that used jqxTreeGrid api..
 * M. Edip YILDIZ
 * 
 */
$(document).ready(function(){
	
	$.ajax({
		type : 'POST',
		url : 'lider/ldap/getGroups',
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
			 $("#treeGridUser").jqxTreeGrid(
			 {
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
			       { text: "Gruplar", align: "center", dataField: "name", width: 320 }
			     ]
			 });
			 
				$('#treeGridUser').on('rowDoubleClick', function (event) {
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

	});
});