/**
 * When page loading getting agents groups from LDAP.
 * M. Edip YILDIZ
 * 
 */
var selectedDN = "";
var selectedUID = "";
var treeSource;
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
						{ name: "attributes", type: "array" },
						{ name: "entryUUID", type: "string" },
						{ name: "childEntries", type: "array" }
					],
					hierarchy:
					{
						root: "childEntries",
					},
					localData: data,
					id: "entryUUID"
			};
			treeSource = source;
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
							$("#treeGridAgentGroups").jqxTreeGrid('addRow', row.entryUUID+"1", {}, 'last', row.entryUUID);
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
		var args = event.args;
		var row = args.row;
		console.log(row)

		if(row.expandedUser=="FALSE") {
			var nameList=[];
			for (var m = 0; m < row.records.length; m++) {
				var childRow = row.records[m];
				nameList.push(childRow.uid);      
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
					for (var m = 0; m < childs.length; m++) {
						// get a row.
						var childRow = childs[m];
						$("#treeGridAgentGroups").jqxTreeGrid('addRow', childRow.entryUUID, childRow, 'last', row.entryUUID);
						if(childRow.hasSubordinates=="TRUE"){
							$("#treeGridAgentGroups").jqxTreeGrid('addRow', childRow.entryUUID+"1" , {}, 'last', childRow.entryUUID); 
						}
						$("#treeGridAgentGroups").jqxTreeGrid('collapseRow', childRow.entryUUID);
					} 
					row.expandedUser="TRUE"
//					if(onlineCount == 0){
//						newName=row.ou+" ("+childs.length+")";
//					}
//					else{
//						newName=row.ou+" ("+childs.length+"-"+onlineCount +")";
//					}
//					$("#treeGridAgentGroups").jqxTreeGrid('updateRow',row.entryUUID, {name:newName });
				}
			});  
		}
	}); 
	
	$('#treeGridAgentGroups').on('rowSelect', function (event) {
		
		 var args = event.args;
	     var row = args.row;
	     var name= row.name;
	     selectedDN = row.distinguishedName;
	     selectedUID = row.entryUUID;
	     console.log("selected row uid: " + selectedUID);
	     
	     var html = '<table class="table table-striped table-bordered " id="attrTable">';
	     html += '<thead>';
	     html += '<tr>';
	     html += '<th style="width: 40%">Öznitelik</th>';
	     html += '<th style="width: 60%">Değer</th>';
	     html += '</tr>';
	     html += '</thead>';
	     
	     for (key in row.attributes) {
	    	 if (row.attributes.hasOwnProperty(key)) {
	    		 html += '<tr>';
	    		 html += '<td>' + key + '</td>';
	    		 html += '<td>' + row.attributes[key] + '</td>';
	    		 html += '</tr>';
	         }
	     }
	        
	     html += '</table>';
	     $('#selectedDnInfo').html("Seçili Kayıt: "+name);
	     $('#ldapAttrInfoHolder').html(html);
		
		var selectedRows = $("#treeGridAgentGroups").jqxTreeGrid('getSelection');
		var selectedRowData=selectedRows[0];

		if(selectedRowData.type == "ORGANIZATIONAL_UNIT"){
			html = '<a class="dropdown-item" href="#createNewAgentGroupModal" data-toggle="modal" data-target="#createNewAgentGroupModal"' 
				+ 'onclick="dropdownButtonClicked(\'createNewAgentGroup\')">Yeni İstemci Grubu Oluştur</a>';
			html += '<a class="dropdown-item" href="#createNewOrganizationalUnitModal" data-toggle="modal" data-target="#createNewOrganizationalUnitModal"' 
				+ 'onclick="dropdownButtonClicked(\'createNewOrganizationalUnit\')">Yeni Organizasyon Birimi Oluştur</a>';
			var html2 = "";
			//if root dn is selected dont allow user to delete it
			$.ajax({ 
			    type: 'GET', 
			    url: '/lider/ldap/group/rootdnofagent',
			    dataType: 'text',
			    success: function (data) {
			    	if(data != row.distinguishedName){
			    		
			    		html += '<div class="dropdown-divider"></div>';
						html += '<a class="dropdown-item" href="#deleteOrganizationalUnitModal" data-toggle="modal" data-target="#deleteOrganizationalUnitModal"' 
							+ 'onclick="dropdownButtonClicked(\'deleteOrganizationalUnit\')">Organizasyon Birimini Sil</a>';
						
			    	}
			    	$('#operationDropDown').html(html);
			    },
			    error: function (data, errorThrown) {
			    	$.notify("Something went wrong.", "error");
			    }
			});
			
		} else if(selectedRowData.type == "GROUP"){
			html = '<a class="dropdown-item" href="#addNewAgentGroupModal" data-toggle="modal" data-target="#addNewAgentGroupModal"' 
				+ 'onclick="dropdownButtonClicked(\'addAgentsToAgentGroup\')">İstemci Ekle</a>';
			html += '<div class="dropdown-divider"></div>';
			html += '<a class="dropdown-item" href="#deleteAgentGroupAndMembersModal" data-toggle="modal" data-target="#deleteAgentGroupAndMembersModal"' 
				+ 'onclick="dropdownButtonClicked(\'deleteAgentGroupAndMembers\')">İstemci Grubunu ve Üyelerini Sil</a>';
			$('#operationDropDown').html(html);
		}
	});
	
});

function createNewOrganizationalUnitClicked() {
	var ouName = $("#ouNamecreateNewOrganizationalUnitModal").val();
	var params = {
		    "parentName" : selectedDN,
		    "ou": ouName,
		    "type": 'ORGANIZATIONAL_UNIT',
		    "distinguishedName": 'ou=' + ouName + ',' + selectedDN,
		    "name": ouName
	};
	$.ajax({ 
	    type: 'POST', 
	    url: '/lider/ldap/addOu',
	    dataType: 'json',
	    data: params,
	    success: function (data) {
            // add new empty row.
            $("#treeGridAgentGroups").jqxTreeGrid('addRow', data.entryUUID, data, 'last', selectedUID);
            $("#treeGridAgentGroups").jqxTreeGrid('expandRow', selectedUID);
            $("#createNewOrganizationalUnitModal .close").click();
            $.notify("Organizasyon Birimi Oluşturuldu.", "success");
	    },
	    error: function (data, errorThrown) {
	    	$.notify("Something went wrong.", "error");
	    }
	});
}

function deleteOrganizationalUnitClicked() {
	var params = {
		    "dn": selectedDN,
	};
	$.ajax({ 
	    type: 'POST', 
	    url: '/lider/ldap/deleteEntry',
	    dataType: 'json',
	    data: params,
	    success: function (data) {
	    	$("#treeGridAgentGroups").jqxTreeGrid('deleteRow', selectedUID);
	    	$("#deleteOrganizationalUnitModal .close").click();
            $.notify("Organizasyon Birimi Silindi.", "success");
	    },
	    error: function (data, errorThrown) {
	    	$.notify("Something went wrong.", "error");
	    }
	});
}

function deleteAgentGroupAndMembersClicked() {
	var params = {
		    "dn": selectedDN,
	};
	$.ajax({ 
	    type: 'POST', 
	    url: '/lider/ldap/deleteEntry',
	    dataType: 'json',
	    data: params,
	    success: function (data) {
	    	$("#treeGridAgentGroups").jqxTreeGrid('deleteRow', selectedUID);
	    	$("#deleteAgentGroupAndMembersModal .close").click();
            $.notify("İstemci Grubu Silindi.", "success");
	    },
	    error: function (data, errorThrown) {
	    	$.notify("Something went wrong.", "error");
	    }
	});
}

function dropdownButtonClicked(operation) {
	
}