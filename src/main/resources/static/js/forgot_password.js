$(document).ready(function(){
});



$("#passwordResetForm").on("submit", function(){
	var userPassword  =$('#password').val()
	var confirmPassword  =$('#repeatPassword').val()
	var lowerCase = "abcdefghijklmnopqrstuvwxyz";
	var upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var digits = "0123456789";
	var splChars = "+=.@*!_";
	
	var ucaseFlag = contains(userPassword, upperCase);
	var lcaseFlag = contains(userPassword, lowerCase);
	var digitsFlag = contains(userPassword, digits);
	var splCharsFlag = contains(userPassword, "*");
	if(userPassword!=confirmPassword){
		$.notify("Parolalar uyuşmamaktadır.","warn");
		//alert("Parolalar uyuşmamaktadır.");
		return false;
	}
	if (splCharsFlag) {
    	$.notify("Parola * içermemelidir.","warn");
		return;
	}
	if(userPassword.length < 6 || !ucaseFlag || !lcaseFlag || !digitsFlag){
		$.notify("Parola en az 6 karakter olmalıdır. En az bir büyük harf, küçük harf ve sayı içermelidir.","warn");
		//alert("Parola en az 8 karakter olmalıdır. En az bir büyük harf, küçük harf, sayı ve karakter içermelidir.");
		return false;
	}
	//updateUserPassword(selectedRowGen.distinguishedName)
   return true;
});

function contains(rootPassword, allowedChars) {
    for (i = 0; i < rootPassword.length; i++) {
            var char = rootPassword.charAt(i);
             if (allowedChars.indexOf(char) >= 0){
            	 return true;
             }
         }
     return false;
}