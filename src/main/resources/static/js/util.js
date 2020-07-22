/**
 * rename and order attribute key values
 * Hasan Kara
 * @param attributeList
 * @returns attributeList
 */
function renameAndOrderAttributeList(attributeList) {
	var newAttributeList = [];
	var addedAttributes = [];
	var orderedList = {
			"objectClass" : "Nesne Sınıfı",
			"memberOf" : "Üye Grubu",
			"cn" : "Ad",
			"ou" : "Grup Adı",
			"sn" : "Soyad",
			"uid" : "Kimlik",
			"homeDirectory" : "Ev Dizini",
			"entryDN" : "Kayıt DN",
			"description" : "Açıklama",
			"createTimestamp": "Oluşturulma Tarihi",
			"modifyTimestamp": "Düzenlenme Tarihi",
			"creatorsName": "Oluşturan Kişi",
			"member": "member",
	};
	for (var k in orderedList) {
		if(attributeList.hasOwnProperty(k)) {
			//console.log(orderedList[k] + " : " + attributeList[k]);
			newAttributeList[orderedList[k]] = attributeList[k];
			addedAttributes[k] = "";
		}
	}

	//adds attribute and values to list if they dont have values in orderedList
//	for (var k in attributeList) {
//		if(addedAttributes.hasOwnProperty(k)) {
//		} else {
//			newAttributeList[k] = attributeList[k];
//		}
//	}

	return newAttributeList;
}