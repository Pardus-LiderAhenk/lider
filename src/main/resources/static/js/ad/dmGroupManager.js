$("#dmGroupName").html(selectedRow.name)

fillMemberToTable(selectedRow);
getActivePolicies();
getPolicyListForSelectedGroup(selectedRow);
applPolicyToGroup();

$('#activePolicyTable').on('click', 'tbody tr', function(event) {
	if (policyList != null && policyList.length) {
		if($(this).hasClass('selectpolicytable')){
			$(this).removeClass('selectpolicytable');
			isPolicySelected = false;
			selectedPolicyRowId = null;
			$('#policyApplyBtn').hide();
		} else {
			$(this).addClass('selectpolicytable').siblings().removeClass('selectpolicytable');
			selectedPolicyRowId = $(this).attr('id');
			isPolicySelected = true;
			$('#policyApplyBtn').show();
		}
	}
});


function fillMemberToTable() {
	var members = "";
	for (var key in selectedRow.attributesMultiValues) {
		if (selectedRow.attributesMultiValues.hasOwnProperty(key) && key == "member") {
			if(selectedRow.attributesMultiValues[key].length > 1) {
				for(var i = 0; i< selectedRow.attributesMultiValues[key].length; i++) {
					members += '<tr>';
					members += '<td class="text-center">' + (i + 1) + '</td>';
					members += '<td>' + selectedRow.attributesMultiValues[key][i] + '</td>';
					members += '<td class="text-center">' 
						+ '<button onclick="deleteMemberFromTabList(\'' + selectedRow.attributesMultiValues[key][i] + '\')"' 
						+ 'class="mr-2 btn-icon btn-icon-only btn btn-outline-danger">' 
						+ '<i class="pe-7s-trash btn-icon-wrapper"> </i></button>' 
						+ '</td>';
					members += '</tr>';
				}
			} else {
				members += '<tr>';
				members += '<td class="text-center">1</td>';
				members += '<td>' + selectedRow.attributesMultiValues[key] + '</td>';
				members += '<td class="text-center">' 
					+ '<button onclick="deleteMemberFromTabList(\'' + selectedRow.attributesMultiValues[key] + '\')"' 
					+ 'class="mr-2 btn-icon btn-icon-only btn btn-outline-danger">' 
					+ '<i class="pe-7s-trash btn-icon-wrapper"> </i></button>' 
					+ '</td>';
				members += '</tr>';
			}
		}
	}
	$('#bodyMembers').html(members);
}

/*
 */
function deleteMemberFromTabList(dn) {
	var selectedRowData=selectedRow;
	var dnListToDelete = [];
	dnListToDelete.push(dn);
	if(selectedRowData.attributesMultiValues['member'].length > 1) {
		var params = {
				"dnList": dnListToDelete,
				"dn": selectedRowData.distinguishedName
		};
		$.ajax({
			type : 'POST',
			url  : 'ad/deleteMemberFromGroup',
			data : params,
			dataType : 'json',
			success : function(data) {

				if(data != null) {
					$.notify("Grup üyeleri başarıyla düzenlendi", "success");
					createDmTreeGrid();
				}
			},
			error: function (data, errorThrown) {
				$.notify("Grup üyesi silinirken hata oluştu.", "error");
			}
		}); 
	} else {
		$.notify("Grup en az bir üye bulundurmalıdır. Son üye silinemez", "error");
	}
}

function getActivePolicies() {
	$.ajax({
		type : 'POST',
		url : '/policy/list',
		dataType : 'json',
		success : function(data) {
			policyList = data
			if (data != null && data.length > 0) {
				if ($("#bodyPolicyRow").length > 0) {
					$("#bodyPolicyRow").remove();
				}
				var html = "";
				var number = 0;
				for (var i = 0; i < data.length; i++) {
					var policyId = data[i].id;
					var policyName = data[i].label;
					var policyDescription = data[i].description;
					var policyStatus = "Aktif";
					var createDate = data[i].createDate;
					if (data[i].deleted == false && data[i].active == true) {
						number = number + 1;
						html += '<tr id='+ policyId +'>';
						html += '<td>' + number + '</td>';
						html += '<td>' + policyName + '</td>';
						html += '<td>' + createDate + '</td>';
						html += '<td>' + policyDescription + '</td>';
						html += '</tr>';
					}
				}
			}
			$("#bodyPolicies").append(html);
		}
	});
}

//getting all policy history for selected group
function getPolicyListForSelectedGroup(selectedGroup) {
	var params ={
			"distinguishedName" : selectedGroup.distinguishedName,
	}
	var paramsJson = JSON.stringify(params);
	$.ajax({
		type: "POST",
		url: "/policy/getPoliciesForGroup",
		headers: {
			'Content-Type':'application/json',
		}, 
		data: paramsJson,
		contentType: "application/json",
		dataType: "json",
		converters: {
			'text json': true
		},
		success: function(result) {
			var data = jQuery.parseJSON(result);
			if (data != null && data.length > 0) {
				policyOfSelectedGroup = data;
				var number = 0;
				var html = "";
				for (var i = 0; i < data.length; i++) {
					number = number + 1
					var commandId = data[i].commandImpl.id;
					html += '<tr id="'+ data[i].policyImpl.id +'">';
					html += '<td>'+ number +' </td>';
					html += '<td>'+ data[i].policyImpl.label +'</td>';
					html += '<td>'+ data[i].commandExecutionImpl.createDate +'</td>';
					html += '<td>'+ data[i].policyImpl.policyVersion +'</td>';
					html += '<td class="text-center">' 
						+ '<button onclick="removeUserPolicy(\'' + commandId + '\')"' 
						+ 'class="mr-2 btn-icon btn-icon-only btn btn-outline-danger" title="Kaldır">' 
						+ '<i class="fas fa-times"></i></button>' 
						+ '</td>';
					html += '</tr>'
				}
				$("#bodyExecutedPolicies").html(html);
			} else {
				if (selectedRow.type == "GROUP" ) {
					$('#bodyExecutedPolicies').html('<tr id="bodyExecutedPoliciesRow"><td colspan="5" class="text-center">Atanmış Politika Bulunamadı.</td></tr>');
					policyOfSelectedGroup = null;
				}
			}
		},
		error: function(result) {
			$.notify(result, "error");
		}
	});
}


function removeUserPolicy(commandId) {
	params = {
			"id": commandId
	}
	$.confirm({
		title: 'Uyarı!',
		content: 'Politikayı kullanıcı grubundan kaldırmak istiyor musunuz?',
		theme: 'light',
		buttons: {
			Evet: function () {
				$.ajax({
					type: "POST",
					url: "/policy/unassignment",
					headers: {
						'Content-Type':'application/json',
					}, 
					data: JSON.stringify(params),
					contentType: "application/json",
					dataType: "json",
					converters: {
						'text json': true
					},
					success: function(data) {
						if (data != null && data.length > 0) {
							$.notify("Politika başarıyla kaldırıldı.", "success");
							getPolicyListForSelectedGroup(selectedRow);
						} else {
							$.notify("Politika kaldırılırken hata oluştu.", "error");
						}
					}
				});
			},
			Hayır: function () {
			}
		}
	});
}

function applPolicyToGroup() {
	$("#policyApplyBtn").click(function(e){
		if (selectedRow.type != "GROUP" ) {
			$.notify("Lütfen kullanıcı grubu seçiniz.", "warn");
			return;
		}
		if (isPolicySelected) {
			var selectedPolicy = null;
			for (var i = 0; i < policyList.length; i++) {
				if(policyList[i].id==selectedPolicyRowId){
					selectedPolicy = policyList[i];
				}
			}
			var params ={
					"id" : selectedPolicy.id,
					"dnType" : selectedRow.type,
					"dnList" : [selectedRow.distinguishedName],
			}
			var paramsJson = JSON.stringify(params);
			if (isExistPolicyOfSelectedGroup(selectedPolicy.id) == false) {
				$.ajax({
					type: "POST",
					url: "/policy/execute",
					headers: {
						'Content-Type':'application/json',
					}, 
					data: paramsJson,
					contentType: "application/json",
					dataType: "json",
					converters: {
						'text json': true
					},
					success: function(result) {
						var res = jQuery.parseJSON(result);
						$.notify("Politika başarıyla uygulandı.", "success");
						getPolicyListForSelectedGroup(selectedRow);
					},
					error: function(result) {
						$.notify(result, "error");
					}
				});
			} else {
				$.notify("Politika zaten uygulanmış", "warn");
			}
		} else {
			$.notify("Lütfen politika seçiniz.", "warn");
		}
	});
}

function isExistPolicyOfSelectedGroup(id) {
	var isExist = false;
	if (policyOfSelectedGroup != null) {
		for (var i = 0; i < policyOfSelectedGroup.length; i++) {
			if (id == policyOfSelectedGroup[i].policyImpl.id) {
				isExist = true;
			}
		}
	}
	return isExist;
}