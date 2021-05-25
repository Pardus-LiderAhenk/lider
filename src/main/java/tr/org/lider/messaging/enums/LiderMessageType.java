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

/**
 * Types used when sending messages <b>from Lider to agents</b>.<br/>
 * <br/>
 * 
 * <b>EXECUTE_TASK</b>: Commands agent to execute a provided machine task.<br/>
 * <b>EXECUTE_POLICY</b>: Commands agent to execute a provided policy.<br/>
 * <b>EXECUTE_SCRIPT</b>: Commands agent to execute a provided script and return
 * its result as response.<br/>
 * <b>REQUEST_FILE</b>: Commands agent to send a desired file back to Lider.
 * <br/>
 * <b>MOVE_FILE</b>: Commands agent to move file in Ahenk file system. <br/>
 * <b>INSTALL_PLUGIN</b>: Commands agent to install new plugin according to
 * provided parameters. <br/>
 * 
 * 
 */
public enum LiderMessageType {
	EXECUTE_TASK(1), EXECUTE_SCRIPT(2), EXECUTE_POLICY(3), REGISTRATION_RESPONSE(4), INSTALL_PLUGIN(
			5), PLUGIN_NOT_FOUND(6), RESPONSE_AGREEMENT(7), UPDATE_SCHEDULED_TASK(8), LOGIN_RESPONSE(9);

	private int id;

	private LiderMessageType(int id) {
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
	 * @return related LiderMessageType enum
	 * @see http://blog.chris-ritchie.com/2013/09/mapping-enums-with-fixed-id-in
	 *      -jpa.html
	 * 
	 */
	public static LiderMessageType getType(Integer id) {
		if (id == null) {
			return null;
		}
		for (LiderMessageType type : LiderMessageType.values()) {
			if (id.equals(type.getId())) {
				return type;
			}
		}
		throw new IllegalArgumentException("No matching type for id: " + id);
	}

}
