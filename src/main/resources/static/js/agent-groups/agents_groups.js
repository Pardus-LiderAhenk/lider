var treeGridHolderDiv="treeGridComputerGroupsDiv";

selectedEntries=[]

$(document).ready(function(){
	renderComputerGroupTree();
	
	$('#btnTreeRefresh').on('click',function(event) {
		renderComputerGroupTree();
	});
	
	setPluginPages();
	
	$('#btn-system').click(function() {
		setPluginPages();
	});
	
	$('#btn-script').click(function() {
		setScriptPluginPage();
	});
	
	$('#btn-packages').click(function() {
		setPackagesPluginPage();
	});
	
	 $('#btnCreateNewOrganizationalUnit').click(function() {
	 		getModalContent("modals/groups/computer_groups/createou", function content(data){
	 			$('#genericModalHeader').html("Yeni Klasör Oluştur");
	 			$('#genericModalBodyRender').html(data);
	 		});
	 });

	 $('#btnCreateNewOrganizationalUnitForBase').click(function() {
		 getModalContent("modals/groups/computer_groups/createou", function content(data){
			 $('#genericModalHeader').html("Yeni Klasör Oluştur");
			 $('#genericModalBodyRender').html(data);
		 });
	 });
	 
	 $('#btnMoveOuAgentGroupModal').click(function() {
		 selectedRowForMove=selectedRow;
	 		getModalContent("modals/groups/computer_groups/moveentry", function content(data){
	 			$('#genericModalHeader').html("Kayıt Taşı");
	 			$('#genericModalBodyRender').html(data);
	 			$('#moveEntryTreeDiv').html("");
	 			
	 			createAgentGroupTree('moveEntryTreeDiv', true, false,
	 					// row select
	 					function(row, rootDnComputer,treeGridIdName){
	 						destinationDNToMoveRecord = row.distinguishedName;
	 					},
	 					//check action
	 					function(checkedRows, row){
	 					},
	 					//uncheck action
	 					function(unCheckedRows, row){
	 					},
	 					
	 					function(rootDn , treeGridId){
	 						$('#'+ treeGridId).jqxTreeGrid('selectRow', rootDn);
	 						$('#'+ treeGridId).jqxTreeGrid('expandRow', rootDn);
	 					} 
	 			);
	 		});
	 	});
	 
	 
	 $('#btnCreateNewAgentGroup').on('click', function (event) {
		 openCreateGroupModal();
	 });
	 
	 $('#btnCreateNewAgentGroupForBase').on('click', function (event) {
		 openCreateGroupModal();
	 });
	 
	 $('#btnEditOrganizationalUnitName').click(function() {
	 		getModalContent("modals/groups/computer_groups/editouname", function content(data){
	 			$('#genericModalHeader').html("Klasör Adı Düzenle");
	 			$('#genericModalBodyRender').html(data);
	 			$('#ouName').val(selectedRow.name);
	 		});
	 });
	 
	 
	 $('#btnDeleteOrganizationalUnit').click(function() {
	 		getModalContent("modals/groups/computer_groups/deleteou", function content(data){
	 			$('#genericModalHeader').html("Klasörü Sil");
	 			$('#genericModalBodyRender').html(data);
	 		});
	 	});
	     
	     
	$('#deleteAgentGroup').on('click', function (event) {
	 		checkedAgents = [];
	 		checkedOUList = [];
	 		getModalContent("modals/groups/computer_groups/deletegroup", function content(data){
	 			$('#genericModalHeader').html("İstemci Grubunu Sil");
	 			$('#genericModalBodyRender').html(data);
	 		});
	});
	
	$('#editAgentGroupBtn').on('click', function (event) {
		getModalContent("modals/groups/computer_groups/editgroupname", function content(data){
			$('#genericModalHeader').html("Grup Adı Düzenle");
			$('#genericModalBodyRender').html(data);
			$('#groupName').val(selectedRow.name);
			
		});
	});
	
	$('#moveAgentGroupBtn').on('click', function (event) {
		selectedRowForMove=selectedRow;
		getModalContent("modals/groups/computer_groups/moveentry", function content(data){
			$('#genericModalHeader').html("Kayıt Taşı");
			$('#genericModalBodyRender').html(data);
			
			createAgentGroupTree('moveEntryTreeDiv', true, false,
					// row select
					function(row, rootDnComputer,treeGridIdName){
//						selectedEntryUUIDForTreeMove=selectedRow.distinguishedName;
						destinationDNToMoveRecord = row.distinguishedName;
					},
					//check action
					function(checkedRows, row){
					},
					//uncheck action
					function(unCheckedRows, row){
					},
					// post tree created
					function(rootDn , treeGridId){
						$('#'+ treeGridId).jqxTreeGrid('selectRow', rootDn);
						$('#'+ treeGridId).jqxTreeGrid('expandRow', rootDn);
					}
			);
		//	generateTreeToMoveEntry();
		});
	});
	
	$('#addMemberAgentGroupBtn').on('click', function (event) {
		checkedAgents = [];
		checkedOUList = [];
		getModalContent("modals/groups/computer_groups/addmember", function content(data){
			$('#genericModalHeader').html(selectedRow.name+" İstemci Grubuna Üye Ekle");
			$('#genericModalBodyRender').html(data);
			
			createComputerTree('lider/computer_groups/getComputers','addMembersToExistingAgentGroupTreeDiv', false, true,
					// row select
					function(row, rootDnComputer,treeGridIdName){
						
					},
					//check action
					function(checkedRows, row){
						rowCheckAndUncheckOperationToAddMembersToExistingGroup(checkedRows);
					},
					//uncheck action
					function(unCheckedRows, row){
						rowCheckAndUncheckOperationToAddMembersToExistingGroup(unCheckedRows);
					},
					// post tree created
					function(rootDn , treeGridId){
						$('#'+ treeGridId).jqxTreeGrid('selectRow', rootDn);
						$('#'+ treeGridId).jqxTreeGrid('expandRow', rootDn);
					}
			);
		});
	});
	
});

function renderComputerGroupTree() {
	$('#'+treeGridHolderDiv).html("");
	
	createAgentGroupTree(treeGridHolderDiv, false, false,
			// row select
			function(row, rootDnUser){
				$('#agentGroupName').html(row.name);
				$('#selectedAgentGroupInfo').html(row.name);
				
				createMembersList(selectedRow);
			},
			//check action
			function(checkedRows, row){
				
			},
			//uncheck action
			function(unCheckedRows, row){
				
			},
			// post tree created
			function(root , treeGridId){
				$('#'+ treeGridId).jqxTreeGrid('selectRow', root);
				$('#'+ treeGridId).jqxTreeGrid('expandRow', root);
			}
	);
	
}

function createMembersList(row) {
	if(row.type == "GROUP") {
		progressForLoad('agentGroupsSystemPage','show');
		data={}
		data.type=row.type;
		data.entryUUID=row.entryUUID;
		data.name=row.name;
		data.online=row.online;
		data.uid=row.uid;
		data.distinguishedName=row.distinguishedName;
		data.cn=row.cn;
		data.attributesMultiValues=row.attributesMultiValues;
		/**
		 * selected entries should be one element 
		 */
		selectedEntries=[]
		selectedEntries.push(data);
		
		var members = "";
			//to print members at different tab
		for (var key in row.attributesMultiValues) {
				if (row.attributesMultiValues.hasOwnProperty(key) && key == "member") {
					if(row.attributesMultiValues[key].length > 1) {
						for(var i = 0; i< row.attributesMultiValues[key].length; i++) {
							members += '<tr>';
							members += '<td class="text-center">' + (i + 1) + '</td>';
							members += '<td> <img id="agent_image" alt="" src="img/linux.png"  width="16px;" height="16px;"> ' + row.attributesMultiValues[key][i] + '</td>';
							members += '<td class="text-center">' 
								+ '<button onclick="deleteMemberFromTabList(\'' + row.attributesMultiValues[key][i] + '\')"' 
								+ 'class="mr-2 btn-icon btn-icon-only btn btn-outline-danger">' 
								+ '<i class="pe-7s-trash btn-icon-wrapper"> </i></button>' 
								+ '</td>';
							members += '</tr>';
						}
					} else {
						members += '<tr>';
						members += '<td class="text-center">1</td>';
						members += '<td>' + row.attributesMultiValues[key] + '</td>';
						members += '<td class="text-center">' 
							+ '<button onclick="deleteMemberFromTabList(\'' + row.attributesMultiValues[key] + '\')"' 
							+ 'class="mr-2 btn-icon btn-icon-only btn btn-outline-danger">' 
							+ '<i class="pe-7s-trash btn-icon-wrapper"> </i></button>' 
							+ '</td>';
						members += '</tr>';
					}
				}
			}
			$('#bodyMembers').html(members);
			progressForLoad('agentGroupsSystemPage','hide');
	} else {
		selectedEntries=[]
		
		$('#selectedAgentGroupInfo').html("Lütfen İstemci Grubu Seçiniz");
		$('#bodyMembers').html('<tr><td colspan="100%" class="text-center">Lütfen İstemci Grubu Seçiniz.</td></tr>');
	}
}


function setPluginPages() {
	$("#agentGroupsSystemPage").show();
	$("#agentGroupsScriptPage").hide();
	$("#agentGroupsPackageManagePage").hide();
	$.ajax({
		type : 'POST',
		url : 'getPluginTaskList',
		dataType : 'json',
		success : function(data) {
			pluginTaskList = data;

			for (var i = 0; i < pluginTaskList.length; i++) {
				var pluginTask = pluginTaskList[i];
				
				if(pluginTask.page == 'manage-root'){
					$.ajax({
						type : 'POST',
						url : 'getPluginTaskHtmlPage',
						data : 'id=' + pluginTask.id + '&name=' + pluginTask.name	+ '&page=' + pluginTask.page + '&description=' + pluginTask.description,
						dataType : 'text',
						success : function(res1) {
							$('#manage-root').html(res1);
						}
					});
				}
				if(pluginTask.page == 'end-sessions'){
					$.ajax({
						type : 'POST',
						url : 'getPluginTaskHtmlPage',
						data : 'id=' + pluginTask.id + '&name=' + pluginTask.name	+ '&page=' + pluginTask.page + '&description=' + pluginTask.description,
						dataType : 'text',
						success : function(res1) {
							$('#end-sessions').html(res1);
						}
					});
				}
				if(pluginTask.page == 'conky'){
					$.ajax({
						type : 'POST',
						url : 'getPluginTaskHtmlPage',
						data : 'id=' + pluginTask.id + '&name=' + pluginTask.name	+ '&page=' + pluginTask.page + '&description=' + pluginTask.description,
						dataType : 'text',
						success : function(res1) {
							$('#conky').html(res1);
						}
					});
				}
				if(pluginTask.page == 'eta-notify'){
					$.ajax({
						type : 'POST',
						url : 'getPluginTaskHtmlPage',
						data : 'id=' + pluginTask.id + '&name=' + pluginTask.name	+ '&page=' + pluginTask.page + '&description=' + pluginTask.description,
						dataType : 'text',
						success : function(res1) {
							$('#eta-notify').html(res1);
						}
					});
				}
				if(pluginTask.page == 'ldap-login'){
					$.ajax({
						type : 'POST',
						url : 'getPluginTaskHtmlPage',
						data : 'id=' + pluginTask.id + '&name=' + pluginTask.name	+ '&page=' + pluginTask.page + '&description=' + pluginTask.description,
						dataType : 'text',
						success : function(res1) {
							$('#ldap-login').html(res1);
						}
					});
				}
				if(pluginTask.page == 'xmessage'){
					$.ajax({
						type : 'POST',
						url : 'getPluginTaskHtmlPage',
						data : 'id=' + pluginTask.id + '&name=' + pluginTask.name	+ '&page=' + pluginTask.page + '&description=' + pluginTask.description,
						dataType : 'text',
						success : function(res1) {
							$('#xmessage').html(res1);
						}
					});
				}
				if(pluginTask.page == 'usb-management'){
					$.ajax({
						type : 'POST',
						url : 'getPluginTaskHtmlPage',
						data : 'id=' + pluginTask.id + '&name=' + pluginTask.name	+ '&page=' + pluginTask.page + '&description=' + pluginTask.description,
						dataType : 'text',
						success : function(res1) {
							$('#usb-management').html(res1);
						}
					});
				}
				if(pluginTask.page == 'file-transfer'){
					$.ajax({
						type : 'POST',
						url : 'getPluginTaskHtmlPage',
						data : 'id=' + pluginTask.id + '&name=' + pluginTask.name	+ '&page=' + pluginTask.page + '&description=' + pluginTask.description,
						dataType : 'text',
						success : function(res1) {
							$('#file-transfer').html(res1);
						}
					});
				}
			}
		}
	});
}

function setScriptPluginPage() {
	$("#agentGroupsSystemPage").hide();
	$("#agentGroupsScriptPage").show();
	$("#agentGroupsPackageManagePage").hide();
	for (var i = 0; i < pluginTaskList.length; i++) {
		var pluginTask = pluginTaskList[i];
		if(pluginTask.page == 'execute-script'){
			$.ajax({
				type : 'POST',
				url : 'getPluginTaskHtmlPage',
				data : 'id=' + pluginTask.id + '&name=' + pluginTask.name	+ '&page=' + pluginTask.page + '&description=' + pluginTask.description,
				dataType : 'text',
				success : function(res2) {
					$('#execute-script').html(res2);
				}
			});
		}
	}
}

function setPackagesPluginPage() {
	$("#agentGroupsSystemPage").hide();
	$("#agentGroupsScriptPage").hide();
	$("#agentGroupsPackageManagePage").show();
	
	for (var i = 0; i < pluginTaskList.length; i++) {
		var pluginTask = pluginTaskList[i];
		if(pluginTask.page == 'packages'){
			$.ajax({
				type : 'POST',
				url : 'getPluginTaskHtmlPage',
				data : 'id=' + pluginTask.id + '&name=' + pluginTask.name	+ '&page=' + pluginTask.page + '&description=' + pluginTask.description,
				dataType : 'text',
				success : function(res2) {
					$('#packages').html(res2);
				}
			});
		}
	}
}

function openCreateGroupModal() {
	 checkedAgents = [];
	 checkedOUList = [];
	 getModalContent("modals/groups/computer_groups/creategroup", function content(data){
		 $('#genericModalHeader').html("İstemci Grubu Oluştur");
		 $('#genericModalBodyRender').html(data);
		 
		 $('#agentGroupsNewAgentGroupName').val('');
		 
		 $('#createNewAgentGroupTreeDiv').html('');
		 
		 createComputerTree('lider/computer/getComputers','createNewAgentGroupTreeDiv', false, true,
				 // row select
				 function(row, rootDnUser){
			 
		 },
		 //check action
		 function(checkedRows, row){
			 rowCheckAndUncheckOperationForCreatingGroup(checkedRows,row);
		 },
		 //uncheck action
		 function(unCheckedRows, row){
			 rowCheckAndUncheckOperationForCreatingGroup(unCheckedRows,row);
		 },
		 // post tree created
		 function(root , treeGridId){
			 $('#'+ treeGridId).jqxTreeGrid('selectRow', root);
			 $('#'+ treeGridId).jqxTreeGrid('expandRow', root);
		 }
		 );
	 });
}


