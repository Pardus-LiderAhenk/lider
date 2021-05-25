/*
 * registration-template.js
 * 
 * This js contains registration template for ahenk registration.
 * 
 * Hasan Kara
 * hasan.kara@pardus.org.tr
 * 
 * http://www.liderahenk.org/
 */
var rootDNForAuthGroup;
var selectedEntryUUIDForAuthGroup;
var rootEntryUUIDForAuthGroup;
var selectedAuthorizedGroupDN;

var rootDNForAgentCreationDN;
var selectedEntryUUIDForAgentCreationDN;
var rootEntryUUIDForAgentCreationDN;
var selectedAgentCreationGroupDN;

var html = "";
$(document).ready(function(){
	fillRegistrationTemplateTable();
});

function fillRegistrationTemplateTable() {
	html = "";
	$.ajax({ 
	    type: 'POST', 
	    url: '/lider/registration_template/list',
	    dataType: 'json',
	    success: function (data) {
	    	if(data != null && data.length > 0) {
		    	$.each(data, function(index, element) {
		    		html += '<tr><td>' + (index+1) + '</td>'
		    			 + '<td>' + element.unitId + '</td>'
		    			 + '<td>' + element.parentDn + '</td>'
		    			 + '<td>' + element.authGroup + '</td>'
		    			 + '<td>' + element.createDate + '</td>';
		    		html += '<td class="text-center">' 
		    			+ '<button onclick="deleteTemplate(\'' + element.id + '\')"' 
		    			+ 'class="mr-2 btn-icon btn-icon-only btn btn-outline-danger btn-sm ">' 
		    			+ '<i class="pe-7s-trash btn-icon-wrapper"> </i></button>' 
		    			+ '</td></tr>';
		    	});
		    	$('#bodyRegistrationTemplate').html(html);
	    	}
	    },
	    error: function (data, errorThrown) {
	    	$.notify("Kayıt şablonları getirilirken hata oluştu.", "error");
	    },
		complete: function() {
	    	$('#tableRegistrationTemplate').dataTable( {
	    		"paging": false,
	    		"oLanguage": {
	    			"sSearch": "Kayıt Ara:",
	    			"sInfo": "Toplam kayıt sayısı: _TOTAL_",
	    			"sInfoEmpty": "Gösterilen kayıt sayısı: 0",
	    			"sZeroRecords" : "Kayıt bulunamadı",
	    			"sInfoFiltered": " - _MAX_ kayıt arasından",
	    		}
	        });
		}
	});
}

function btnCreateRegistrationTemplateClicked() {
	var templateText = $("#templateText").val();
	var authorizedUserGroupDN = $("#authorizedUserGroupDN").val();
	var agentCreationDN = $("#agentCreationDN").val();
	if(templateText == "") {
		$.notify("Lütfen şablon metni giriniz.", "error");
	} else if(authorizedUserGroupDN == "") {
		$.notify("Lütfen yetkili kullanıcı grup DN'i ya da yetkili kişi DN'i giriniz.", "error");
	} else if(agentCreationDN == "") {
		$.notify("Lütfen istemcinin oluşturulacağı klasör DN'i giriniz.", "error");
	} else {
		var params = {
			    "templateText" : templateText,
			    "authorizedUserGroupDN" : authorizedUserGroupDN,
			    "agentCreationDN" : agentCreationDN
			};
		$.ajax({ 
		    type: 'POST', 
		    url: '/lider/registration_template/create',
		    data: params,
		    dataType: 'json',
		    success: function (data) {
		    	$("#templateText").val("");
		    	$("#authorizedUserGroupDN").val("");
		    	$("#agentCreationDN").val("");
		    	var table = $('#tableRegistrationTemplate').DataTable();
		    	table.clear().draw();
		    	table.destroy();
		    	fillRegistrationTemplateTable();
		    },
		    error: function (data, errorThrown) {

		    }
		});
	}

}

/*
 * create tree for auth group selection
 */
function btnCreateTreeForAuthSelectionClicked() {
	getModalContent("modals/definitions/registration_template/select_auth_group", function content(data){
		$('#genericModalHeader').html("Kullanıcı Grubu Seç");
		$('#genericModalBodyRender').html(data);
		createTreeModalForAuthGroupSelection();
	});
}

function createTreeModalForAuthGroupSelection(){
	//if nothing is selected get rootDN of user groups.
	//so new created groups can be under root user groups
	$.ajax({
		type : 'POST',
		url : '/lider/registration_template/getGroups',
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
			 rootDNForAuthGroup = source.localData[0].distinguishedName;
			 selectedEntryUUIDForAuthGroup = source.localData[0].entryUUID;
			 rootEntryUUIDForAuthGroup  = source.localData[0].entryUUID;
			 selectedAuthorizedGroupDN = source.localData[0].distinguishedName;
			 //create user tree grid
			 createUserTreeGridForSelection(source);
		},
	    error: function (data, errorThrown) {
	    	$.notify("Kullanıcılar getirilirken hata oluştu.", "error");
	    }
	});
}

function createUserTreeGridForSelection(source) {
	$("#selectUserOrUserGroupTreeGrid").jqxTreeGrid('destroy');
	$("#selectUserOrUserGroupTreeDiv").append('<div id="selectUserOrUserGroupTreeGrid"></div> ');
	var dataAdapter = new $.jqx.dataAdapter(source, {
		loadComplete: function () {
	    }
	});
	
	var getLocalization = function () {
		var localizationobj = {};
        localizationobj.filterSearchString = "Ara :";
        return localizationobj;
	};
	// create jqxTreeGrid.
	$("#selectUserOrUserGroupTreeGrid").jqxTreeGrid(
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
		selectionMode: "singleRow",
		filterMode: "simple",
		localization: getLocalization(),
		pageSize: 50,
		pageSizeOptions: ['15', '25', '50'],
		icons: function (rowKey, dataRow) {
		var level = dataRow.level;
		if(dataRow.type == "USER"){
			return "img/entry_group.gif";
		}
		else return "img/folder.png";
		},
		ready: function () {
			var allrows =$("#selectUserOrUserGroupTreeGrid").jqxTreeGrid('getRows');
			if(allrows.length==1){
				var row=allrows[0];
				if(row.childEntries==null ){
					$("#selectUserOrUserGroupTreeGrid").jqxTreeGrid('addRow', row.entry+"1", {}, 'last', row.entryUUID);
				}
			}
	    	$("#selectUserOrUserGroupTreeGrid").jqxTreeGrid('collapseAll'); 
	    	$("#selectUserOrUserGroupTreeGrid").jqxTreeGrid('selectRow', selectedEntryUUIDForAuthGroup);
	    	
	    }, 
	    rendered: function () {
	   	},
	   	columns: [{ text: "Kullanıcılar", align: "center", dataField: "name", width: '100%' }]  	
	});

	$('#selectUserOrUserGroupTreeGrid').on('rowExpand', function (event) {
		var args = event.args;
		var row = args.row;
	    if(row.expandedUser == "FALSE") {
	    	var nameList=[];
	    	for (var m = 0; m < row.records.length; m++) {
	    		var childRow = row.records[m];
	    		nameList.push(childRow.uid);      
			}
		      
	    	for (var k = 0; k < nameList.length; k++) {
	    		// get a row.
	    		var childRowname = nameList[k];
				$("#selectUserOrUserGroupTreeGrid").jqxTreeGrid('deleteRow', childRowname); 
	    	}  
			$.ajax({
				type : 'POST',
				url : '/lider/registration_template/getOuDetails',
				data : 'uid=' + row.distinguishedName + '&type=' + row.type
						+ '&name=' + row.name + '&parent=' + row.parent,
				dataType : 'text',
				success : function(ldapResult) {
					var childs = jQuery.parseJSON(ldapResult);
					for (var m = 0; m < childs.length; m++) {
						// get a row.
						var childRow = childs[m];
						$("#selectUserOrUserGroupTreeGrid").jqxTreeGrid('addRow', childRow.entryUUID, childRow, 'last', row.entryUUID);
						//$("#selectMemberTreeGrid").jqxTreeGrid('checkRow', row.name);
						if(childRow.hasSubordinates=="TRUE"){
							$("#selectUserOrUserGroupTreeGrid").jqxTreeGrid('addRow', childRow.entryUUID+"1" , {}, 'last', childRow.entryUUID); 
						}
						$("#selectUserOrUserGroupTreeGrid").jqxTreeGrid('collapseRow', childRow.entryUUID);
					}
					row.expandedUser = "TRUE";
				},
			    error: function (data, errorThrown) {
			    	$.notify("Klasör bilgisi getirilirken hata oluştu.", "error");
			    }
			});  
    	}
	});
	$('#selectUserOrUserGroupTreeGrid').on('rowSelect', function (event) {
		var args = event.args;
		var row = args.row;
		var name= row.name;
		selectedAuthorizedGroupDN = row.distinguishedName;
		

	});
}

function btnUseSelectedAuthGroupClicked() {
	$('#genericModal').trigger('click');
	$("#authorizedUserGroupDN").val(selectedAuthorizedGroupDN)
}

/*
 * create tree for group selection of agent creation
 */
function btnCreateTreeForAgentGroupSelectionClicked() {
	getModalContent("modals/definitions/registration_template/select_agent_creation_dn", function content(data){
		$('#genericModalHeader').html("Ahenk'in oluşturulmasını istediğiniz grubu seçiniz.");
		$('#genericModalBodyRender').html(data);
		createTreeModalForAgentGroupSelection();
	});
}

function createTreeModalForAgentGroupSelection(){
	$.ajax({
		type : 'POST',
		url : '/lider/registration_template/getComputers',
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
			           { name: "attributesMultiValues", type: "array" },
			           { name: "childEntries", type: "array" }
			      ],
			      hierarchy:
			          {
			              root: "childEntries"
			          },
			      localData: data,
			      id: "entryUUID"
			  };
			 
			 rootDNForAgentCreationDN = source.localData[0].distinguishedName;
			 selectedEntryUUIDForAgentCreationDN = source.localData[0].entryUUID;
			 rootEntryUUIDForAgentCreationDN  = source.localData[0].entryUUID;
			 selectedAgentCreationGroupDN = source.localData[0].distinguishedName;
			 //create computer tree grid
			 createUserTreeGridForAgentCreationDNSelection(source);
		},
	    error: function (data, errorThrown) {
	    	$.notify("İstemci grup verileri alınırken hata oluştu.", "error");
	    }
	});
}

function createUserTreeGridForAgentCreationDNSelection(source) {
	$("#selectAgentCreationDNTreeGrid").jqxTreeGrid('destroy');
	$("#selectAgentCreationDNTreeDiv").append('<div id="selectAgentCreationDNTreeGrid"></div> ');
	var dataAdapter = new $.jqx.dataAdapter(source, {
		loadComplete: function () {
	    }
	});
	
	var getLocalization = function () {
		var localizationobj = {};
        localizationobj.filterSearchString = "Ara :";
        return localizationobj;
	};
	// create jqxTreeGrid.
	$("#selectAgentCreationDNTreeGrid").jqxTreeGrid(
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
		selectionMode: "singleRow",
		filterMode: "simple",
		localization: getLocalization(),
		pageSize: 50,
		pageSizeOptions: ['15', '25', '50'],
		icons: function (rowKey, dataRow) {
		var level = dataRow.level;
		if(dataRow.type == "AHENK"){
			return "img/linux.png";
		}
		else return "img/folder.png";
		},
		ready: function () {
			var allrows =$("#selectAgentCreationDNTreeGrid").jqxTreeGrid('getRows');
			if(allrows.length==1){
				var row=allrows[0];
				if(row.childEntries==null ){
					$("#selectAgentCreationDNTreeGrid").jqxTreeGrid('addRow', row.entryUUID+"1", {}, 'last', row.entryUUID);
				}
			}
	    	$("#selectAgentCreationDNTreeGrid").jqxTreeGrid('collapseAll');
	    	$("#selectAgentCreationDNTreeGrid").jqxTreeGrid('selectRow', selectedEntryUUIDForAgentCreationDN);
	    }, 
	    rendered: function () {
	   	},
	   	columns: [{ text: "Bilgisayarlar", align: "center", dataField: "name", width: '100%' }]  	
	});
	$('#selectAgentCreationDNTreeGrid').on('rowExpand', function (event) {
		var args = event.args;
		var row = args.row;
	    if(row.expandedUser == "FALSE") {
	    	var nameList=[];
	    	for (var m = 0; m < row.records.length; m++) {
	    		var childRow = row.records[m];
	    		nameList.push(childRow.uid);      
			}
		      
	    	for (var k = 0; k < nameList.length; k++) {
	    		// get a row.
	    		var childRowname = nameList[k];
				$("#selectAgentCreationDNTreeGrid").jqxTreeGrid('deleteRow', childRowname); 
	    	}  
			$.ajax({
				type : 'POST',
				url : '/lider/registration_template/getOuDetails',
				data : 'uid=' + row.distinguishedName + '&type=' + row.type
						+ '&name=' + row.name + '&parent=' + row.parent,
				dataType : 'text',
				success : function(ldapResult) {
					var childs = jQuery.parseJSON(ldapResult);
					for (var m = 0; m < childs.length; m++) {
						// get a row.
						var childRow = childs[m];
						if(childRow.type == "ORGANIZATIONAL_UNIT") {
							$("#selectAgentCreationDNTreeGrid").jqxTreeGrid('addRow', childRow.entryUUID, childRow, 'last', row.entryUUID);
							if(childRow.hasSubordinates=="TRUE"){
								$("#selectAgentCreationDNTreeGrid").jqxTreeGrid('addRow', childRow.entryUUID+"1" , {}, 'last', childRow.entryUUID); 
							}
							$("#selectAgentCreationDNTreeGrid").jqxTreeGrid('collapseRow', childRow.entryUUID);
						}

					}
					row.expandedUser = "TRUE";
				},
			    error: function (data, errorThrown) {
			    	$.notify("Grup bilgisi getirilirken hata oluştu.", "error");
			    }
			});  
    	}
	});
	$('#selectAgentCreationDNTreeGrid').on('rowSelect', function (event) {
		var args = event.args;
		var row = args.row;
		var name= row.name;
		selectedAgentCreationGroupDN = row.distinguishedName;
	});
}

function btnUseSelectedAgentCreationDNClicked() {
	$('#genericModal').trigger('click');
	$("#agentCreationDN").val(selectedAgentCreationGroupDN)
}

/*
 * delete template
 */
function deleteTemplate(id) {
	var params = {
		    "id": id,
	};
	$.ajax({ 
	    type: 'POST', 
	    url: '/lider/registration_template/delete',
	    dataType: 'json',
	    data: params,
	    success: function (data) {
	    	$.notify("Kayıt şablonu başarıyla silindi.", "success");
	    	var table = $('#tableRegistrationTemplate').DataTable();
	    	table.clear().draw();
	    	table.destroy();
	    	fillRegistrationTemplateTable();
	    },
	    error: function (data, errorThrown) {
	    	$.notify("Kayıt şablonu silinirken hata oluştu.", "error");
	    }
	});
}