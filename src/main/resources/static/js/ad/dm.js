
var treeGridIdGlob=null
var entryTable = null;
var selectedADUserEntries=[]
var selectedADGroupEntries=[]
var selectedLdapRowForUserSync=[]
var selectedLdapRowForGroupSync=[]
var treeMenuSelection=null;

$('#treeMenu').hide(); 
$('#treeMenuGroup').hide(); 

/**
 * create directory manager treegrid and fill tree from directory entry node
 * @param event
 * @returns
 */
createDmTreeGrid();


$('#btnAdUserAddModal').on('click', function (event) {
	console.log(treeMenuSelection)
	getModalContent("modals/ad/adUserAdd", function content(data){
		$('#genericModalLargeHeader').html("Active Directory Kullanıcı Ekle");
		$('#genericModalLargeBodyRender').html(data);
		$('#userFolderInfo').html(treeMenuSelection.distinguishedName);
	
		$("#name").on('keyup',function(event){
			var name=$("#name").val();
			var sn=$("#sn").val();
			
			$("#cn").val(name+' '+sn);
		});

		$("#sn").keyup(function(){
			var name=$("#name").val();
			var sn=$("#sn").val();
			
			$("#cn").val(name+' '+sn);
		});
	});
});

$('#btnAdOuAddModal').on('click', function (event) {
	getModalContent("modals/ad/adOuAdd", function content(data){
		$('#genericModalLargeHeader').html("Organizasyon Birimi Ekle");
		$('#genericModalLargeBodyRender').html(data);
		$('#ouInfo').html(treeMenuSelection.name+"/");
		
		$('#addOuAD').on('click', function (event) {
			addOu(treeMenuSelection)
		});
	});
});



$('#btnAdGroupAddModal').on('click', function (event) {
	getModalContent("modals/ad/adGroupAdd", function content(data){
		$('#genericModalLargeHeader').html("Grup");
		$('#genericModalLargeBodyRender').html(data);
		$('#groupInfo').html(treeMenuSelection.name+"/");
		
		$('#addGroupAD').on('click', function (event) {
			addGroup(treeMenuSelection)
		});
	});
});

$('#btnAddMember2GroupModal').on('click', function (event) {
	
	getModalContent("modals/ad/addMember2Group", function content(data){
		$('#genericModalLargeHeader').html("Gruba Üye Ekle");
		$('#genericModalLargeBodyRender').html(data);
		
		$('#groupInfoMember').html(treeMenuSelection.name);
		
		$('#addMember2Group').on('click', function (event) {
			addMember2Group(treeMenuSelection)
		});
		
		
	});
});

$('.btnEntryAttributeModal').on('click', function (event) {
	getModalContent("modals/ad/adAttributes", function content(data){
		$('#genericModalLargeHeader').html("Öznitelikler");
		$('#genericModalLargeBodyRender').html(data);
		console.log(treeMenuSelection)
		   var members = "";
		    for (var key in treeMenuSelection.attributesMultiValues) {
				if (treeMenuSelection.attributesMultiValues.hasOwnProperty(key) ) {
					for(var i = 0; i< treeMenuSelection.attributesMultiValues[key].length; i++) {
						members += '<tr>';
						members += '<td>' +key + '</td>';
						members += '<td>' + treeMenuSelection.attributesMultiValues[key][i] + '</td>';
						members += '</tr>';
					}
				}
			}
			if(members == "") {
				members = '<tr><td colspan="100%" class="text-center">Kayıt bulunamadı</td></tr>';
			}
			$('#bodyMembersAdAttributes').html(members);
	});
});


$("#adChildSearchTxt").keyup(function() {
	var txt=$('#adChildSearchTxt').val();
	 $("#adChildEntryTable > tbody > tr").filter(function() {
		 $(this).toggle($(this).text().indexOf(txt) > -1)
	 });
});

$("#treeMenuContainer").on('itemclick', function (event) {
    var args = event.args;
    var selection = $('#'+treeGridIdGlob).jqxTreeGrid('getSelection');
    var rowid = selection[0].uid
    treeMenuSelection=selection[0];
});
$("#treeMenuGroup").on('itemclick', function (event) {
	console.log(treeGridIdGlob)
	var args = event.args;
	console.log(args)
	var selection = $('#'+treeGridIdGlob).jqxTreeGrid('getSelection');
	console.log(selection)
	var rowid = selection[0].uid
	treeMenuSelection=selection[0];
});

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
	
	$('#adEntryDiv').html(html);
	
	entryTable = $('#adChildEntryTable').DataTable({
		dom: 'Bfrtip',
		"select": {
	            style:    'multi'
	    },
	    "buttons": [
            {
                text: 'Tümünü Seç',
                action: function () {
                	entryTable.rows().select();
                	
                }
            },
            {
                text: 'Tümünü Kaldır',
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
		console.log(indexes)
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
	    console.log(data)
	    console.log(data.DT_RowId)
	    var dtSelectedRw=null
	    for (var k = 0; k < childs.length; k++) {
	    	var child=childs[k]
	    	if(data.DT_RowId==child.attributesMultiValues.distinguishedName){
	    		dtSelectedRw=child;
	    	}
	    }
	    console.log(dtSelectedRw);
	    
	    $('#adInfoDet').html(dtSelectedRw.distinguishedName); 
	    
	    var members = "";
		//to print members at different tab
	    for (var key in dtSelectedRw.attributesMultiValues) {
			if (dtSelectedRw.attributesMultiValues.hasOwnProperty(key) ) {
				console.log(key)
				for(var i = 0; i< dtSelectedRw.attributesMultiValues[key].length; i++) {
					members += '<tr>';
					members += '<td>' +key + '</td>';
					members += '<td>' + dtSelectedRw.attributesMultiValues[key][i] + '</td>';
					members += '</tr>';
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

function btnAdUserAddClicked() {
	addUser(treeMenuSelection)
}

function addUser(treeMenuSelection) {
	var parentDn=treeMenuSelection.distinguishedName; 
	var name=$('#name').val();
	var uid=$('#uid').val();
	var cn=$('#cn').val();
	var sn=$('#sn').val();
	var mail=$('#mail').val();
	var homePostalAddress=$('#homePostalAddress').val();
	var telephoneNumber=$('#telephoneNumber').val();
	var userPassword=$('#userPassword').val();
	var confirm_password=$('#confirm_password').val();
	
	var lowerCase = "abcdefghijklmnopqrstuvwxyz";
	var upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var digits = "0123456789";
	var splChars = "+=.@*!_";
	
	var ucaseFlag = contains(userPassword, upperCase);
    var lcaseFlag = contains(userPassword, lowerCase);
    var digitsFlag = contains(userPassword, digits);
    var splCharsFlag = contains(userPassword, splChars);
    
    var parentEntryUUID= treeMenuSelection.entryUUID;
    
    if(userPassword.length < 8 || !ucaseFlag || !lcaseFlag || !digitsFlag || !splCharsFlag){
    	$.notify("Parola en az 8 karakter olmalıdır. En az bir büyük harf, küçük harf, sayı ve karakter içermelidir.","warn");
    	return
    }
    if(userPassword!=confirm_password){
		$.notify("Parolalar Uyuşmamaktadır.",{className: 'warn',position:"right top"}  );
		return
	}
    var params = {
			"uid" : uid,
			"name": name,
			"cn": cn,
			"sn": sn,
			"userPassword": userPassword,
			"parentName": parentDn,
			"telephoneNumber": telephoneNumber,
			"homePostalAddress": homePostalAddress,
			"mail": mail
	};
    $.ajax({
		type : 'POST',
		url : 'ad/addUser2AD',
		data : params,
		dataType : 'json',
		success : function(data) {
			console.log(data)
			$.notify("Kullanıcı Başarı ile eklendi.",{className: 'success',position:"right top"}  );
			$('#genericModalLarge').trigger('click');
			createDmTreeGrid();
		},
	    error: function (data, errorThrown) {
			$.notify("Kullanıcı Eklenirken Hata Oluştu.", "error");
		}
	});  
}
function addOu(treeMenuSelection) {
	var parentDn=treeMenuSelection.distinguishedName; 
	var ouName=$('#ouName').val();
	if(ouName==""){
		$.notify("Lütfen Birim Adı Giriniz.","warn");
		return
	}
	
	var params = {
			"ou": ouName,
			"parentName": parentDn
	};
	$.ajax({
		type : 'POST',
		url : 'ad/addOu2AD',
		data : params,
		dataType : 'json',
		success : function(data) {
			$.notify("Organizasyon Birimi Başarı ile eklendi.",{className: 'success',position:"right top"}  );
			$('#genericModalLarge').trigger('click');
			createDmTreeGrid();
		},
		error: function (data, errorThrown) {
			$.notify("Birim Eklenirken Hata Oluştu.", "error");
		}
	});  
}
function addGroup(treeMenuSelection) {
	var parentDn=treeMenuSelection.distinguishedName; 
	var groupName=$('#groupName').val();
	if(groupName==""){
		$.notify("Lütfen Grup Adı Giriniz.","warn");
		return
	}
	
	var params = {
			"cn": groupName,
			"parentName": parentDn
	};
	$.ajax({
		type : 'POST',
		url : 'ad/addGroup2AD',
		data : params,
		dataType : 'json',
		success : function(data) {
			$.notify("Grup Başarı ile eklendi.",{className: 'success',position:"right top"}  );
			$('#genericModalLarge').trigger('click');
			createDmTreeGrid();
		},
		error: function (data, errorThrown) {
			$.notify("Grup Eklenirken Hata Oluştu.", "error");
		}
	});  
}

function addMember2Group(selection) {
	var parentDn=selection.distinguishedName; 
	var distinguishedName=$('#userInfoMember').val();
	if(distinguishedName==""){
		$.notify("Lütfen Üye Seçiniz.","warn");
		return
	}
	
	var params = {
			"distinguishedName": distinguishedName,
			"parentName": parentDn
	};
	$.ajax({
		type : 'POST',
		url : 'ad/addMember2ADGroup',
		data : params,
		dataType : 'json',
		success : function(data) {
			$.notify("Üye Başarı ile eklendi.",{className: 'success',position:"right top"}  );
			$('#genericModalLarge').trigger('click');
			createDmTreeGrid();
		},
		error: function (data, errorThrown) {
			$.notify("Üye Eklenirken Hata Oluştu.", "error");
		}
	});  
}

function contains(rootPassword, allowedChars) {
    for (i = 0; i < rootPassword.length; i++) {
            var char = rootPassword.charAt(i);
             if (allowedChars.indexOf(char) >= 0){
            	 return true;
             }
         }
     return false;
}

function getInnerPageContent(pageName) {
	$.ajax({
		type : 'POST',
		url : 'getDMInnerPage',
		data : 'pageName='+pageName,
		dataType : 'text',
		success : function(res1) {
			$('#innerPageContent').html(res1);
		}
	});
}

function createDmTreeGrid() {
	$('#treeGridAdUserHolderDiv').html("");
	var treeGridHolderDiv="treeGridAdUserHolderDiv"
	createTree(treeGridHolderDiv, false, false,
			// row select
			function(row, rootDn){
				selectedRow=row;
				if(row.type=="USER"){
					getInnerPageContent("DMUserManager")
				}
				else if(row.type=="GROUP"){
					getInnerPageContent("DMGroupManager")
				}
				
				else{
					getInnerPageContent("DMEntryInfo")
				}
			},
			//check action
			function(checkedRows, row){
			
			},
			//uncheck action
			function(unCheckedRows, row){
			
			},
			//after create tree action
			function(rootDN, treeGridId,firstRow, error){
				
				treeGridIdGlob=treeGridId
				if(error != null ){
					console.log(error)
					$.notify("Lütfen AD bağlantı ayarlarınızı kontrol ediniz.", "error");
					$('#treeMenu').hide();
				}else{
					getChildEntries(firstRow)
					$('#'+ treeGridId).jqxTreeGrid('selectRow', firstRow.uid);
					$('#'+ treeGridId).jqxTreeGrid('expandRow', firstRow.uid);
				}
			}
	);
}