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
 * Status code used throughout the system. These status codes can be used in
 * (XMPP or REST) all messaging mechanisms.
 * 
 * <b>REGISTERED</b>: registration successful, agent IS registered.<br/>
 * <b>REGISTERED_WITHOUT_LDAP</b>: registered only for XMPP server, LDAP
 * registration awaiting further messaging.<br/>
 * <b>ALREADY_EXISTS</b>: agent node already exists in system, agent NOT
 * registered.<br/>
 * <b>REGISTRATION_ERROR</b>: registration error, agent NOT registered.<br/>
 * 
 */
public enum StatusCode {

	REGISTERED(1), REGISTERED_WITHOUT_LDAP(2), ALREADY_EXISTS(3), REGISTRATION_ERROR(4), TASK_RECEIVED(5), 
	TASK_PROCESSING(17), TASK_PROCESSED(6), TASK_WARNING(7), TASK_ERROR(8), TASK_TIMEOUT(9), TASK_KILLED(10),
	POLICY_RECEIVED(11), POLICY_PROCESSED(12), POLICY_WARNING(13), POLICY_ERROR(14), POLICY_TIMEOUT(15), POLICY_KILLED(16) , 
	NOT_AUTHORIZED(17),UNREGISTERED(18);

	private int id;

	private StatusCode(int id) {
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
	 * @return related StatusCode enum
	 * @see http://blog.chris-ritchie.com/2013/09/mapping-enums-with-fixed-id-in
	 *      -jpa.html
	 * 
	 */
	public static StatusCode getType(Integer id) {
		if (id == null) {
			return null;
		}
		for (StatusCode position : StatusCode.values()) {
			if (id.equals(position.getId())) {
				return position;
			}
		}
		throw new IllegalArgumentException("No matching type for id: " + id);
	}

	public static List<StatusCode> getTaskEndingStates() {
		return Arrays.asList(new StatusCode[] { TASK_PROCESSED, TASK_WARNING, TASK_ERROR, TASK_KILLED });
	}

	public static List<String> getTaskEndingStateIds() {
		return Arrays.asList(new String[] { new Integer(TASK_PROCESSED.getId()).toString(),
				new Integer(TASK_WARNING.getId()).toString(), new Integer(TASK_ERROR.getId()).toString(),
				new Integer(TASK_KILLED.getId()).toString() });
	}

	public static List<StatusCode> getPolicyEndingStates() {
		return Arrays.asList(new StatusCode[] { POLICY_PROCESSED, POLICY_WARNING, POLICY_ERROR, POLICY_KILLED });
	}

	public static List<String> getPolicyEndingStateIds() {
		return Arrays.asList(new String[] { new Integer(POLICY_PROCESSED.getId()).toString(),
				new Integer(POLICY_WARNING.getId()).toString(), new Integer(POLICY_ERROR.getId()).toString(),
				new Integer(POLICY_KILLED.getId()).toString() });
	}

}