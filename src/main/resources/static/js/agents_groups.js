/**
 * When page loading getting agents groups from LDAP.
 * M. Edip YILDIZ
 * 
 */
$(document).ready(function(){
	var html = '<a class="dropdown-item" href="#addNewAgentGroupModal"' 
		+ 'onclick="dropdownButtonClicked(\'addNewAgentGroup\')">Yeni İstemci Grubu Oluştur</a>';
	$('#operationDropDown').html(html);
	$.ajax({
		type : 'POST',
		url : 'lider/ldap/agentGroups',
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
			$("#treeGridAgentGroups").jqxTreeGrid({
				width: '100%',
				source: dataAdapter,
				altRows: true,
				sortable: true,
				columnsResize: true,
				filterable: true,
				pageable: true,
				pagerMode: 'default',
				filterMode: "simple",
				localization: getLocalization(),
				pageSize: 50,
				selectionMode: "singleRow",
				pageSizeOptions: ['15', '25', '50'],
				icons: function (rowKey, dataRow) {
					var level = dataRow.level;
					if(dataRow.type == "ORGANIZATIONAL_UNIT"){
						return "img/entry_org.gif";
					}
					else return "img/entry_group.gif";
				},
				ready: function () {
	
					var allrows =$("#treeGridAgentGroups").jqxTreeGrid('getRows');
					if(allrows.length==1){
						var row=allrows[0];
						if(row.childEntries==null){
	
							$("#treeGridAgentGroups").jqxTreeGrid('addRow', row.name+"1", {}, 'last', row.name);
						}
					}
					$("#treeGridAgentGroups").jqxTreeGrid('collapseAll');
	
				},
				columns: [
					{ text: "İstemci Grup Ağacı", align: "center", dataField: "name", width: '100%'}
					]
			});
		}
	});
	
	$('#treeGridAgentGroups').on('rowExpand', function (event) {
		alert("1");
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
				$("#treeGridAgentGroups").jqxTreeGrid('deleteRow', childRowname); 
			}  
			$.ajax({
				type : 'POST',
				url : 'lider/ldap/getOuDetails',
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
						$("#treeGridAgentGroups").jqxTreeGrid('addRow', childRow.name, childRow, 'last', row.name);
						if(childRow.hasSubordinates=="TRUE"){
							$("#treeGridAgentGroups").jqxTreeGrid('addRow', childRow.name+"1" , {}, 'last', childRow.name); 
						}
						$("#treeGridAgentGroups").jqxTreeGrid('collapseRow', childRow.name);
					} 
					row.expandedUser="TRUE"
					if(onlineCount == 0){
						newName=row.ou+" ("+childs.length+")";
					}
					else{
						newName=row.ou+" ("+childs.length+"-"+onlineCount +")";
					}
					$("#treeGridAgentGroups").jqxTreeGrid('updateRow',row.name, {name:newName });
				}
			});  
		}
	}); 
	
	$('#treeGridAgentGroups').on('rowSelect', function (event) {
		 var args = event.args;
	     var row = args.row;
	     var name= row.name;
	     var row = $("#treeGridAgentGroups").jqxTreeGrid('getRow', name);
	        
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
	    
	     
		var options = $("#groupOperationType");
		options.empty();
		
		var selectedRows = $("#treeGridAgentGroups").jqxTreeGrid('getSelection');
		var selectedRowData=selectedRows[0];
		//alert(selectedRowData.childEntries.length);
		//alert(selectedRowData.distinguishedName + " type: " + selectedRowData.type);
		

		if(selectedRowData.type == "ORGANIZATIONAL_UNIT"){
			 html = '<a class="dropdown-item" href="#addNewAgentGroupModal"' 
				 + 'onclick="dropdownButtonClicked(\'addNewAgentGroup\')">Yeni İstemci Grubu Oluştur</a>';
			 html += '<a class="dropdown-item" href="#addNewOrganizationalUnitModal"' 
				 + 'onclick="dropdownButtonClicked(\'addNewOrganizationalUnit\')">Yeni Organizasyon Birimi Oluştur</a>';
			 html += '<div class="dropdown-divider"></div>';
			 html += '<a class="dropdown-item" href="#deleteOrganizationalUnitModal"' 
				 + 'onclick="dropdownButtonClicked(\'deleteOrganizationalUnit\')">Organizasyon Birimini Sil</a>';
			if(selectedRowData.childEntries.length == 0) {
			}
			 $('#operationDropDown').html(html);
		} else if(selectedRowData.type == "GROUP"){
			 html = '<a class="dropdown-item" href="#addNewAgentGroupModal"' 
				 + 'onclick="dropdownButtonClicked(\'addAgentsToAgentGroup\')">İstemci Ekle</a>';
			 html += '<div class="dropdown-divider"></div>';
			 html += '<a class="dropdown-item" href="#deleteAgentGroupAndMembersModal"' 
				 + 'onclick="dropdownButtonClicked(\'deleteAgentGroupAndMembers\')">İstemci Grubunu ve Üyelerini Sil</a>';
			 $('#operationDropDown').html(html);
		}
	});
	
});

function dropdownButtonClicked(operation) {
	alert(operation);
}