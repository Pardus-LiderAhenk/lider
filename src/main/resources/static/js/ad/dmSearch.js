/**
 *  treeMenuSelection group name
 * @param event
 * @returns
 */

$('#groupName').html("Grup Adı: "+treeMenuSelection.name)
$('#searchMemberDM').on('click',  function(event) {
	var key=$('#searchKey').val()
	var value=$('#value').val()
	if(key == -1)
		{return}
	if(value==""){
		$.notify("Lütfen aranacak değer giriniz", "warn");
		return
	}
	var params = {
			"searchDn" : "",
			"key" : key,
			"value": value
	};
	
	$.ajax({
		type : 'POST',
		url : 'ad/searchEntryUser',
		data : params,
		dataType: "json",
		success : function(ldapResult) {
			
			if(ldapResult.length==0){
				$.notify("Sonuç Bulunamadı", "warn");
				return;
			}
			var members = "";
			for (var i = 0; i < ldapResult.length; i++) {
		    	 var entry = ldapResult[i];
		    	members += '<tr>';
				members += '<td>' + entry.name + '</td>';
				members += '<td>' + entry.type + '</td>';
				members += '<td>' + entry.distinguishedName + '</td>';
				members += '<td> <button class="btn btn-info btnAddMember2AdGroup" id="btnAddMember2AdGroup" data-id="'+entry.distinguishedName+'"> <i class="fa fa-plus"> </i> </button> </td>';
				members += '</tr>';
			}
			$('#bodyMembersAdSearch').html(members);
			
			$('.btnAddMember2AdGroup').on('click',  function(event) {
				var distinguishedName= $(this).data('id')
				addMember(distinguishedName, treeMenuSelection.distinguishedName);
				
			});
		},
	    error: function (data, errorThrown) {
			$.notify("Hata Oluştu.", "error");
		}
	 }); 
});


function addMember(distinguishedName, groupName) {
	var params = {
			"parentName" : groupName,
			"distinguishedName": distinguishedName
	};
	$.ajax({
		type : 'POST',
		url : 'ad/addMember2ADGroup',
		data : params,
		dataType: "json",
		success : function(ldapResult) {
			$.notify("Üye Başarı ile eklendi.",{className: 'success',position:"right top"}  );
			$('#genericModalLarge').trigger('click');
			createDmTreeGrid();
		},
	    error: function (data, errorThrown) {
			$.notify("Hata Oluştu.", "error");
		}
	 }); 
}



