
$(document).ready(function(){ 
// Create ou for selected parent node. Ou modal will be open for all releated pages..
$('#btnOpenOuManagerModal').on('click',function(event) {
	var parentNode=$(this).data('parentnode');
	getOus(parentNode);
});

$('#addOu').on('click', function (event) {
	var checkedRows = $("#treeGridOuManager").jqxTreeGrid('getCheckedRows');
	if(checkedRows.length==0){
		$.notify("Lütfen Kayıt Seçiniz",{className: 'warn',position:"right top"}  );
		return
	}
	if(checkedRows.length>1){
		$.notify("Lütfen Tek Kayıt Seçiniz",{className: 'warn',position:"right top"}  );
		return
	}
	
	var parentDn=checkedRows[0].distinguishedName; 
	var ouName= $('#ouName').val();
	$.ajax({
		type : 'POST',
		url : 'lider/ldap/addOu',
		data: 'parentName='+parentDn +'&ou='+ouName,
		dataType : 'json',
		success : function(data) {
			$.notify("Klasör Başarı İle Eklendi.", "success");
			getOus();
		}
	});
});

//Create ou for selected parent node. Treegrid show only ou when treegrid rowexpand event triggered. 
function getOus(parentNode){

	var urlPath=""
	if(parentNode=="users"){
		urlPath='lider/ldap/getUsers';
	}
	else if(parentNode=="computers"){
		urlPath='lider/ldap/getComputers';
	}
	$.ajax({
		type : 'POST',
		url : urlPath,
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
			console.log(source)
			
			$("#treeGridOuManager").jqxTreeGrid('destroy');
			$("#treeGridOuManagerHolderDiv").append('<div id="treeGridOuManager"></div> ')
			//create UserTreeGridForUserAdd..show only ou and single selection
			createUserTreeGridForUserAdd(source);
		}
	
	});
	}

function createUserTreeGridForUserAdd(source) {

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
	$("#treeGridOuManager").jqxTreeGrid(
		{
				theme :"Orange",
				width: '100%',
				source: dataAdapter,
				altRows: true,
				sortable: true,
				columnsResize: true,
				hierarchicalCheckboxes: false,
				pageable: true,
				pagerMode: 'default',
				checkboxes: true,
				localization: getLocalization(),
				pageSize: 50,
				selectionMode: "singleRow",
				pageSizeOptions: ['15', '25', '50'],
				icons: function (rowKey, dataRow) {
					var level = dataRow.level;
					if(dataRow.type == "USER"){
						return "img/checked-user-32.png";
					}
					else return "img/entry_org.gif";
				},
				ready: function () {
					var allrows =$("#treeGridOuManager").jqxTreeGrid('getRows');
					if(allrows.length==1){
						var row=allrows[0];
						if(row.childEntries==null ){
							
							$("#treeGridOuManager").jqxTreeGrid('addRow', row.name+"1", {}, 'last', row.name);
						}
					}
					$("#treeGridOuManager").jqxTreeGrid('collapseAll');
					
				},
				
				rendered: function () {
				},
				columns: [
					{ text: "Eklenecek Klasör", align: "center", dataField: "name", width: '100%', height:'100%'}
					]
	});
	
	$('#treeGridOuManager').on('rowExpand', function (event) {
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
				$("#treeGridOuManager").jqxTreeGrid('deleteRow', childRowname); 
			}  
			$.ajax({
				type : 'POST',
				url : 'lider/ldap/getOu',
				data : 'uid=' + row.distinguishedName + '&type=' + row.type+ '&name=' + row.name + '&parent=' + row.parent,
				dataType : 'text',
				success : function(ldapResult) {
					var childs = jQuery.parseJSON(ldapResult);
					for (var m = 0; m < childs.length; m++) {
						// get a row.
						var childRow = childs[m];
						$("#treeGridOuManager").jqxTreeGrid('addRow', childRow.name, childRow, 'last', row.name);
						if(childRow.hasSubordinates=="TRUE"){
							$("#treeGridOuManager").jqxTreeGrid('addRow', childRow.name+"1" , {}, 'last', childRow.name); 
						}
						$("#treeGridOuManager").jqxTreeGrid('collapseRow', childRow.name);
					} 
					row.expandedUser="TRUE"
				}
			
			});  
		}
	});
	
	}
});

