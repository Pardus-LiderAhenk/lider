/*
*
*    Copyright © 2015-2016 Tübitak ULAKBIM
*
*    This file is part of Lider Ahenk.
*
*    Lider Ahenk is free software: you can redistribute it and/or modify
*    it under the terms of the GNU General Public License as published by
*    the Free Software Foundation, either version 3 of the License, or
*    (at your option) any later version.
*
*    Lider Ahenk is distributed in the hope that it will be useful,
*    but WITHOUT ANY WARRANTY; without even the implied warranty of
*    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*    GNU General Public License for more details.
*
*    You should have received a copy of the GNU General Public License
*    along with Lider Ahenk.  If not, see <http://www.gnu.org/licenses/>.
*/
package tr.org.lider.messaging.enums;

import java.util.Arrays;
import java.util.List;


/**
 * Common content types used to indicate type of the stored content in the
 * database.
 */
public enum ContentType {

	APPLICATION_JSON(1), APPLICATION_PDF(2), APPLICATION_VND_MS_EXCEL(3), APPLICATION_MS_WORD(4), TEXT_PLAIN(
			5), TEXT_HTML(6), IMAGE_PNG(7), IMAGE_JPEG(8);

	private int id;

	private ContentType(int id) {
		this.id = id;
	}

	public int getId() {
		return id;
	}

	/**
	 * Provide mapping enums with a fixed ID in JPA (a more robust alternative
	 * to EnumType.String and EnumType.Ordinal)
	 * 
	 * @param id
	 * @return related ContentType enum
	 * @see http://blog.chris-ritchie.com/2013/09/mapping-enums-with-fixed-id-in
	 *      -jpa.html
	 * 
	 */
	public static ContentType getType(Integer id) {
		if (id == null) {
			return null;
		}
		for (ContentType position : ContentType.values()) {
			if (id.equals(position.getId())) {
				return position;
			}
		}
		throw new IllegalArgumentException("No matching type for id: " + id);
	}

	public static List<ContentType> getFileContentTypes() {
		return Arrays.asList(new ContentType[] { APPLICATION_PDF, APPLICATION_VND_MS_EXCEL, APPLICATION_MS_WORD,
				IMAGE_PNG, IMAGE_JPEG, TEXT_PLAIN, TEXT_HTML });
	}

	public static List<ContentType> getImageContentTypes() {
		return Arrays.asList(new ContentType[] { IMAGE_PNG, IMAGE_JPEG });
	}


	public static String getFileExtension(ContentType type) {
		switch (type) {
		case APPLICATION_PDF:
			return "pdf";
		case APPLICATION_VND_MS_EXCEL:
			return "xlsx";
		case APPLICATION_MS_WORD:
			return "docx";
		case IMAGE_PNG:
			return "png";
		case IMAGE_JPEG:
			return "jpg";
		case TEXT_PLAIN:
			return "txt";
		case TEXT_HTML:
			return "html";
		default:
			return "";
		}
	}

}
