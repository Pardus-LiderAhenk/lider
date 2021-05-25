/**
 * return modal content
 * edip.yildiz
 * @param page
 * @param callback
 * @returns
 */
function getModalContent(page, callback) {
	$.ajax({
		type : 'POST',
		url : 'lider/pages/getInnerHtmlPage',
		data : 'innerPage=' + page,
		dataType : 'text',
		success : function(data) {
			callback(data)
		},
		error : function(data, errorThrown) {

		}
	});

}