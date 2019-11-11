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
 * Types used when sending messages <b>from agents to Lider</b>.<br/>
 * <br/>
 * 
 * <b>TASK_STATUS</b>: Contains task-related messages.<br/>
 * <b>REGISTER</b>: Indicates that sender (agent) wants to register to the
 * system.<br/>
 * <b>REGISTER_LDAP</b>: Indicates that sender (agent) wants to register to the
 * ldap.<br/>
 * <b>UNREGISTER</b>: Indicates that sender (agent) wants to unregister from the
 * system.<br/>
 * <b>GET_POLICIES</b>: Agent sends this message during user login.<br/>
 * <b>LOGIN</b>: Agent sends this message for log purposes during user login.
 * <br/>
 * <b>LOGOUT</b>: Agent sends this message for log purposes during user logout.
 * <br/>
 * 
 * 
 */
public enum AgentMessageType {
	TASK_STATUS(1), REGISTER(2), UNREGISTER(3), REGISTER_LDAP(4), GET_POLICIES(5), LOGIN(6), LOGOUT(7), POLICY_STATUS(
			8), MISSING_PLUGIN(9), REQUEST_AGREEMENT(10), AGREEMENT_STATUS(11), SCRIPT_RESULT(12);

	private int id;

	private AgentMessageType(int id) {
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
	 * @return related AgentMessageType enum
	 * @see http://blog.chris-ritchie.com/2013/09/mapping-enums-with-fixed-id-in
	 *      -jpa.html
	 * 
	 */
	public static AgentMessageType getType(Integer id) {
		if (id == null) {
			return null;
		}
		for (AgentMessageType type : AgentMessageType.values()) {
			if (id.equals(type.getId())) {
				return type;
			}
		}
		throw new IllegalArgumentException("No matching type for id: " + id);
	}

}
