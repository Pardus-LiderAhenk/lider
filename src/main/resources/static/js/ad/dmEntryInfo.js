
getChildEntries(selectedRow)

function getChildEntries(row) {
	 $.ajax({
			type : 'POST',
			url : 'ad/getChildEntries',
			data : 'distinguishedName=' + row.distinguishedName 	+ '&name=' + row.name + '&parent=' + row.parent,
			dataType : 'text',
			success : function(resultList) {
				var childs = jQuery.parseJSON(resultList);
				 setChildsToTable(childs)
			}
		});  
}


function setChildsToTable(childs) {
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
		html += '<tr id="'+ child.attributesMultiValues.distinguishedName +'">';
		var imgPath="";
		if(child.type=="CONTAINER"){imgPath="img/entry_org.gif"}
		if(child.type=="USER"){	imgPath="img/person.png"; }
		if(child.type=="GROUP"){imgPath="img/entry_group.gif"}
		if(child.type=="ORGANIZATIONAL_UNIT"){imgPath="img/folder.png"}
		if(child.type=="AHENK"){imgPath="img/linux.png"}
		if(child.type=="WIND0WS_AHENK"){imgPath="img/windows.png"}
		
		html += '<td> </td>';
		html += '<td> <img src='+imgPath+' alt="" height="24" width="24"> '+ child.attributesMultiValues.name +'</td>';
		var type=""
		if(child.type=="AHENK" || child.type=="WIND0WS_AHENK" ){type= child.attributesMultiValues.operatingSystem }
		else { type=child.type }
		html += '<td>'+ type  +'</td>';
		var desc=""
		if(child.attributesMultiValues.description){desc=child.attributesMultiValues.description}
		html += '<td>'+ desc +'</td>';
		html += '</tr>'
	}
	html += '</tbody>';
	html += '</table>';
	
	$('#adEntryInfoDiv').html(html);
	
	entryTable = $('#adChildEntryTable').DataTable({
		dom: 'Bfrtip',
		"select": {
	            style:    'single'
	    },
	    "buttons": [
//            {
//                text: 'Tümünü Seç',
//                action: function () {
//                	entryTable.rows().select();
//                	
//                }
//            },
//            {
//                text: 'Tümünü Kaldır',
//                action: function () {
//                	entryTable.rows().deselect();
//                }
//            }
        ],
	   
		"scrollY": "500px",
		"scrollX": false,
		"paging": false,
		"scrollCollapse": true,
		"order": [[ 1, "asc" ]],
		"columns": [
		    { "width": "5%" },
		    { "width": "30%" },
		    { "width": "20%" },
		    { "width": "45%" },
		],
		"oLanguage": {
			"sSearch": "Ara:",
			"sInfo": "Toplam Kayıt: _TOTAL_ adet ",
			"sInfoEmpty": "Gösterilen Kayıt Sayısı: 0",
			"sZeroRecords" : "Kayıt bulunamadı",
			"sInfoFiltered": " - _MAX_ kayıt arasından",
		},
		
	});
	selectedADUserEntries=[]
	selectedADGroupEntries=[]
	entryTable.on( 'select', function ( e, dt, type, indexes ) {
		for( var a = 0; a < indexes.length; a++){
			var index=indexes[a];
			var selectedEntry= childs[index];
			if(selectedEntry.type=='USER'){
				var isExist=false;
				for( var k = 0; k < selectedADUserEntries.length; k++){
					if (selectedADUserEntries[k].distinguishedName == selectedEntry.distinguishedName) { 
						isExist = true;
						break; 
					}
				}
				if(!isExist){
					selectedADUserEntries.push(selectedEntry)
				}
			}
			else if(selectedEntry.type=='GROUP'){
				
				var isCritical=	selectedEntry.attributesMultiValues.isCriticalSystemObject
				
				if(!isCritical){
					var isExist=false;
					for( var k = 0; k < selectedADGroupEntries.length; k++){
						if (selectedADGroupEntries[k].distinguishedName == selectedEntry.distinguishedName) { 
							isExist = true;
							break; 
						}
					}
					if(!isExist){
						selectedADGroupEntries.push(selectedEntry)
					}
				}
			}
		}
    });
	
	entryTable.on( 'deselect', function ( e, dt, type, indexes ) {
		for( var a = 0; a < indexes.length; a++){
			var selectedEntry= childs[indexes[a]];
			if(selectedEntry.type=='USER'){
				for( var m = 0; m < selectedADUserEntries.length; m++){ 
					if ( selectedADUserEntries[m].distinguishedName == selectedEntry.distinguishedName) { 
						selectedADUserEntries.splice(m, 1); 
						}
				}
			}
			else if(selectedEntry.type=='GROUP'){
				for( var m = 0; m < selectedADGroupEntries.length; m++){ 
					if ( selectedADGroupEntries[m].distinguishedName == selectedEntry.distinguishedName) { 
						selectedADGroupEntries.splice(m, 1); 
					}
				}
			}
		}
    });
	
	entryTable.on('dblclick', 'tr', function () {
	    var data = entryTable.row(this).data();
	    var dtSelectedRw=null
	    for (var k = 0; k < childs.length; k++) {
	    	var child=childs[k]
	    	if(data.DT_RowId==child.attributesMultiValues.distinguishedName){
	    		dtSelectedRw=child;
	    	}
	    }
	    $('#adInfoDet').html(dtSelectedRw.distinguishedName); 
	    
	    var members = "";
		//to print members at different tab
	    for (var key in dtSelectedRw.attributesMultiValues) {
			if (dtSelectedRw.attributesMultiValues.hasOwnProperty(key) ) {
				for(var i = 0; i< dtSelectedRw.attributesMultiValues[key].length; i++) {
					if(key != 'objectGUID' 
						&& key !='uSNChanged' 
						&& key !='dSCorePropagationData' 
						&& key !='systemFlags' 
						&& key !='gPLink' 
						&& key !='objectSid' 
						&& key !='instanceType'
						&& key !='codePage'
						&& key !='primaryGroupID'
						&& key !='primaryGroupID'
						&& key !='pwdLastSet'
						&& key !='whenChanged'
						&& key !='whenCreated'
						&& key !='groupType'
						&& key !='lastLogonTimestamp'
						&& key !='accountExpires'
						&& key !='lastLogon'
						&& key !='badPasswordTime'
						&& key !='badPwdCount'
						&& key !='sAMAccountType'
						&& key !='userAccountControl'
						&& key !='objectCategory'
						&& key !='wellKnownObjects'
						&& key!='uSNCreated'){
					members += '<tr>';
					members += '<td>' +key + '</td>';
					members += '<td>' + dtSelectedRw.attributesMultiValues[key][i] + '</td>';
					members += '</tr>';
					}
				}
			}
		}
		if(members == "") {
			members = '<tr><td colspan="100%" class="text-center">Kayıt bulunamadı</td></tr>';
		}
		$('#bodyMembers').html(members);
		$('#adEntryDetailModal').modal('show'); 
	} );

}