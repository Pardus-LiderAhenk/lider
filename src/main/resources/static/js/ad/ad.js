
var treeGridHolderDiv="treeGridAdUserHolderDiv"
var treeGridId=null
var entryTable = null;
var selectedADEntries=[]
var selectedLdapRow=[]

$('#treeMenu').hide();

createTree(treeGridHolderDiv, false, false,
		// row select
		function(row, rootDn){
			selectedRow=row;
			getChildEntries(selectedRow)
		},
		//check action
		function(checkedRows, row){
		
		},
		//uncheck action
		function(unCheckedRows, row){
		
		},
		//after create tree action
		function(rootDN, treeGridId,firstRow, error){
			if(error != null ){
				console.log(error)
				$.notify("Lütfen AD bağlantı ayarlarınızı kontrol ediniz.", "error");
				$('#treeMenu').hide();
			}else{
				$('#'+ treeGridId).jqxTreeGrid('selectRow', firstRow.uid);
				getChildEntries(firstRow)
			}
		}
);



$('#btnAdUserReplication').on('click', function (event) {
	
	var selecteds= entryTable.rows( { selected: true } )
	console.log(selecteds)
	
	getModalContent("modals/ad/adUserSync", function content(data){
		$('#genericModalLargeHeader').html("AD Kullanıcı Senkronizasyonu");
		$('#genericModalLargeBodyRender').html(data);
		$('#selectedEntrySize').html(selectedADEntries.length);
		
		createUserTree("ldapUserTreeGrid", false, false,
				// row select
				function(row, rootDnUser){
					selectedLdapRow=row;
				},
				//check action
				function(checkedRows, row){
					
				},
				//uncheck action
				function(unCheckedRows, row){
					
				}
		);
		// selected AD users adding modal
		for (var i = 0; i < selectedADEntries.length; i++) {
			var entry=selectedADEntries[i]
			var html = '<tr id="'+ entry.attributesMultiValues.objectGUID +'">';
			var imgPath="";
			if(entry.type=="USER"){	imgPath="img/person.png"; }
			html += '<td> <img src='+imgPath+' alt="" height="24" width="24"> '+ entry.attributesMultiValues.name +'</td>';
			var desc=""
			if(entry.attributesMultiValues.description){desc=entry.attributesMultiValues.description}
			html += '<td>'+ desc +'</td>';
			html += '</tr>'
			
			$('#selectedEntryTableBody').append(html);
		}
	});
});

$("#adChildSearchTxt").keyup(function() {
	var txt=$('#adChildSearchTxt').val();
	 $("#adChildEntryTable > tbody > tr").filter(function() {
		 $(this).toggle($(this).text().indexOf(txt) > -1)
	 });
});

$("#treeMenu").on('itemclick', function (event) {
    var args = event.args;
//    var selection = $('#'+treeGridId).jqxTreeGrid('getSelection');
//    var rowid = selection[0].uid
//    if ($.trim($(args).text()) == "Edit Selected Row") {
//        $('#'+treeGridId).jqxTreeGrid('beginRowEdit', rowid);
//    } else {
//        $('#'+treeGridId).jqxTreeGrid('deleteRow', rowid);
//    }
});

function attributeTable(orderedAttributes) {
	
}
function getChildEntries(row) {
	 $.ajax({
			type : 'POST',
			url : 'ad/getChildEntries',
			data : 'distinguishedName=' + row.distinguishedName 	+ '&name=' + row.name + '&parent=' + row.parent,
			dataType : 'text',
			success : function(resultList) {
				var childs = jQuery.parseJSON(resultList);
				console.log(childs)
				var html ='<table class="table table-striped table-bordered display table-hover" id="adChildEntryTable" > ';
				html += '<thead>';
				html +=	 '<tr>';
				html +=	'<th style="width: 5%"> </th>';
				html +=	'<th style="width: 30%">Ad </th>';
				html +=	'<th style="width: 20%">Türü</th>';
				html +=	'<th style="width: 45%">Açıklama</th>';
				html += '</tr>';
				html += '</thead>';
				html += '<tbody id="adChildEntryBody">';
				
				for (var i = 0; i < childs.length; i++) {
					var child=childs[i]
					html += '<tr id="'+ child.attributesMultiValues.objectGUID +'">';
					var imgPath="";
					if(child.type=="CONTAINER"){imgPath="img/entry_org.gif"}
					if(child.type=="USER"){	imgPath="img/person.png"; }
					if(child.type=="GROUP"){imgPath="img/entry_group.gif"}
					if(child.type=="ORGANIZATIONAL_UNIT"){imgPath="img/folder.png"}
					if(child.type=="AHENK"){imgPath="img/linux.png"}
					if(child.type=="WIND0WS_AHENK"){imgPath="img/windows.png"}
					
					html += '<td> </td>';
					html += '<td> <img src='+imgPath+' alt="" height="24" width="24"> '+ child.attributesMultiValues.name +'</td>';
					html += '<td>'+ child.type +'</td>';
					var desc=""
					if(child.attributesMultiValues.description){desc=child.attributesMultiValues.description}
					html += '<td>'+ desc +'</td>';
					html += '</tr>'
				}
				html += '</tbody>';
				html += '</table>';
				
				$('#adEntryDiv').html(html);
				
				entryTable = $('#adChildEntryTable').DataTable({
					dom: 'Bfrtip',
					"select": {
				            style:    'multi'
				    },
				    "buttons": [
			            {
			                text: 'Seç',
			                action: function () {
			                	entryTable.rows().select();
			                	
			                }
			            },
			            {
			                text: 'Kaldır',
			                action: function () {
			                	entryTable.rows().deselect();
			                }
			            }
			        ],
					"scrollY": "500px",
					"scrollX": false,
					"paging": false,
					"scrollCollapse": true,
					"order": [[ 1, "asc" ]],
					"columns": [
					    { "width": "10%" },
					    { "width": "30%" },
					    { "width": "20%" },
					    { "width": "40%" },
					],
					"oLanguage": {
						"sSearch": "Ara:",
						"sInfo": "Toplam Kayıt: _TOTAL_ adet ",
						"sInfoEmpty": "Gösterilen Kayıt Sayısı: 0",
						"sZeroRecords" : "Kayıt bulunamadı",
						"sInfoFiltered": " - _MAX_ kayıt arasından",
					},
					
				});
				selectedADEntries=[]
				entryTable.on( 'select', function ( e, dt, type, indexes ) {
					console.log(indexes)
					for( var a = 0; a < indexes.length; a++){
						var index=indexes[a];
						var selectedEntry= childs[index];
						if(selectedEntry.type=='USER'){
							var isExist=false;
							for( var k = 0; k < selectedADEntries.length; k++){
								if (selectedADEntries[k].distinguishedName == selectedEntry.distinguishedName) { 
									isExist = true;
									break; 
								}
							}
							if(!isExist){
								selectedADEntries.push(selectedEntry)
					            console.log(selectedADEntries)
							}
						}
					}
		        });
				
				entryTable.on( 'deselect', function ( e, dt, type, indexes ) {
					for( var a = 0; a < indexes.length; a++){
						var selectedEntry= childs[indexes[a]];
						if(selectedEntry.type=='USER'){
							for( var m = 0; m < selectedADEntries.length; m++){ 
								if ( selectedADEntries[m].distinguishedName == selectedEntry.distinguishedName) { 
									selectedADEntries.splice(m, 1); 
									}
							}
							console.log(selectedADEntries)
						}
					}
		        });
				
			}
		});  
}
function btnSyncUserAd2LdapClicked() {
	if(selectedLdapRow.type != "ORGANIZATIONAL_UNIT")
		{
			$.notify("Lütfen Ldap Dizini Seçiniz.", "warn");
			return;
		}
	if(selectedADEntries.length ==0){
		$.notify("Lütfen aktarılacak kullanıcı Seçiniz.", "warn");
		return;
	}
	console.log(selectedADEntries)
	console.log(selectedLdapRow)
	
	 $.ajax({
			type : 'POST',
			url : 'ad/syncUserFromAd2Ldap',
			data : 'distinguishedName=' + row.distinguishedName 	+ '&name=' + row.name + '&parent=' + row.parent,
			dataType : 'text',
			success : function(resultList) {
				
			}
	 });
}
