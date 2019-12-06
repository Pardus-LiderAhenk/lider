
		var selectedEntries = []; // make a global to make for different selected entries

		$("#subentryDiv").hide();

		$('#selectedEntryListModal').on('show.bs.modal', function(event) {
		
			showSelectedEntries();
			
		});


		$('#addSelectedEntry').on('click',
				function() {
					var rowCount = $('#subEntryDivTable tr').filter(':has(:checkbox:checked)').length;

					if (rowCount > 0) {

						$('#subEntryDivTable tr').filter(':has(:checkbox:checked)').each(
										function(i) {

											if (jQuery.inArray(this.id,	selectedEntries) == -1) {
												
												if(this.id!=""){
													selectedEntries.push(this.id);
												}

											}

										});
						$('#selectedEntrySize').html(selectedEntries.length);

					}

				});
		
		$('.dizin').on('click',	function(e) {
			
			var page = $(this).data("page");
			
			$.ajax({
				type : 'POST',
				url : 'getInnerHtmlPage',
				data : 'innerPage=' + page,
				dataType : 'text',
				success : function(data) {
					$('#mainArea').html(data);
				}
			});
			
		});

			$('.ldapTreeItem').on('click',	function(e) {

					var uid = $(this).data("id");
					var type = $(this).data("type");
					var parent = $(this).data("parent");
					var name = $(this).text();
					/*
					 * alert(uid) alert(type) alert(parent) alert(name)
					 */

					if(type === null) return;
					
					$("#subentryDiv").show();

					/*
					 * $('#mainArea').load('task', function(){
					 * $(this).find('a').click(function(){ alert('hey'); }); });
					 */

					/* $('#mainArea').load("task"); */

					$.ajax({
								type : 'POST',
								url : 'getOuDetails',
								data : 'uid=' + uid + '&type=' + type
										+ '&name=' + name + '&parent=' + parent,
								dataType : 'text',
								success : function(data) {

									/*
									 * $('#mainArea').html("");
									 * $('#mainArea').append(data);
									 * 
									 */
									var selectedEntry = jQuery.parseJSON(data);

									$('#selectedEntryHeader').html("")
									$('#selectedEntryHeader').html(selectedEntry.parentName)
									
									childEntryList=selectedEntry.childEntries;

								}
					
							});
				
				});


function showSelectedEntries() {

	var html = '<table class="table table-striped table-bordered " id="selectedEntry4TaskTables">';

	for (var i = 0; i < selectedEntries.length; i++) {

		html += '<tr>';

		html += '<td>' + selectedEntries[i] + '</td>';

		html += '<td> <button class="btn btn-xs btn-default removeEntry" type="button" id="' +selectedEntries[i]+ '" data-id="'+ selectedEntries[i]+'" title="Kaldir"> <img src="img/remove.png"></img> </button>  </td>';

		html += '</tr>';
	}
	html += '</table>';

	$('#selectedEntriesHolder').html(html);
	
	$('.removeEntry').on('click', function(e) {
		var uid = $(this).data("id");

		selectedEntries.splice($.inArray(uid, selectedEntries), 1);
		showSelectedEntries();
		$('#selectedEntrySize').html(selectedEntries.length);
	});
}



