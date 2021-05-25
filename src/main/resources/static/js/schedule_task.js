/**
 * Generic scheduler (crontab expression) page for scheduled tasks.
 * Tuncay ÇOLAK 
 * tuncay.colak@tubitak.gov.tr
 * 
 * http://www.liderahenk.org/
 */

$(document).ready(function() {
	var strDate = getNewDate();
	$("#scheduledDate").val(strDate);
	defaultScheduleSelection();
});

function getNewDate() {
	var date = new Date();
	var day = date.getDate();
	var month = date.getMonth() + 1;
	var year = date.getFullYear();

	if (day < 10) {
		day = "0" + day;
	}
	if (month < 10) {
		month = "0" + month;
	}

	var strDate = year + "-" + month + "-" + day;
	return strDate;
}

function getNewTime() {
	var time = new Date();
	return time;
}

function defaultScheduleSelection() {
	$('#scheduledSelection').val("custom").change();
	setScheduleParameters(null, null, null, null, null, false);
}

$("#scheduledSelection").on("change", function() {
	var scheduleType = $(this).val();
	if (scheduleType == "yearly") {
		setScheduleParameters("0", "0", "1", "1", "*", true);
	} else if (scheduleType == "monthly") {
		setScheduleParameters("0", "0", "1", "*", "*", true);
	} else if (scheduleType == "weekly") {
		setScheduleParameters("0", "0", "*", "*", "0", true);
	} else if (scheduleType == "daily") {
		setScheduleParameters("0", "0", "*", "*", "*", true);
	} else if (scheduleType == "hourly") {
		setScheduleParameters("0", "*", "*", "*", "*", true);
	} else if (scheduleType == "once") {
		var time = getNewTime();
		var strDate = getNewDate();
		var resDate = strDate.split("-");
		var resDay = resDate[2];
		var resMonth = resDate[1];
		setScheduleParameters(time.getMinutes(), time.getHours(),
				resDay, resMonth, "*", false);
	} else if (scheduleType == "custom") {
		setScheduleParameters("", "", "", "", "", false);
	}
});

function setScheduleParameters(min, hour, dOfMonth, month, dOfWeek, dateStatus) {
	$("#scheduledMinute").val(min);
	$("#scheduledHour").val(hour);
	$("#scheduledDayOfMonth").val(dOfMonth);
	$("#scheduledMonth").val(month);
	$("#scheduledDayOfWeek").val(dOfWeek);
	$("#scheduledDate").prop('disabled', dateStatus);
}

//get event when change date
$("#scheduledDate").on("change", function() {
	var date = $(this).val();
	var resDate = date.split("-");
	$("#scheduledDayOfMonth").val(resDate[2]);
	$("#scheduledMonth").val(resDate[1]);
});

$("#scheduledSendTask").on("click", function() {
	var minute = $("#scheduledMinute").val();
	var hour = $("#scheduledHour").val();
	var dayOfMonth = $("#scheduledDayOfMonth").val();
	var month = $("#scheduledMonth").val();
	var dayOfWeek = $("#scheduledDayOfWeek").val();
	var date = $("#scheduledDate").val();
	var type = $("#scheduledSelection").val();

	if (minute == "" || hour == "" || dayOfMonth == "" || month == "" || dayOfWeek == "") {
		$.notify("Lütfen zamanlanmış görev parametrelerini eksiksik doldurunuz.","warn");
	}else {
		$.notify("Zamanlanmış görev parametreleri başarıyla oluşturuldu. Görevi göndermek için Çalıştır butonuna tıklayınız.","success");
		if (type == "once" || type == "custom") {
			var year = $("#scheduledDate").val();
			year = year.split("-");
			if (dayOfMonth < 10 && dayOfMonth.includes("0")) {
				dayOfMonth = dayOfMonth.replace("0", "");
			}
			if (month < 10 && month.includes("0")) {
				month = month.replace("0", "");
			}
			scheduledParam = minute +" "+ hour + " " + dayOfMonth + " " + month + " " + dayOfWeek + " " + year[0];
		}else {
			scheduledParam = minute +" "+ hour + " " + dayOfMonth + " " + month + " " + dayOfWeek;
		}
	}
});
