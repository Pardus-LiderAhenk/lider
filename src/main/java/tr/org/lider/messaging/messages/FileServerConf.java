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
package tr.org.lider.messaging.messages;

import java.io.Serializable;
import java.util.Map;

import tr.org.lider.messaging.enums.Protocol;


/**
 * Optional parameter for file transfer. (If a plugin uses file transfer, which
 * can be determined by {@link IPluginInfo} implementation, this optional
 * parameter will be set before sending EXECUTE_TASK / EXECUTE_POLICY messages
 * to agents)
 * 
 */
public class FileServerConf implements Serializable {

	private static final long serialVersionUID = 1039344020464416617L;

	private Map<String, Object> parameterMap;

	private Protocol protocol;

	public FileServerConf(Map<String, Object> parameterMap, Protocol protocol) {
		this.parameterMap = parameterMap;
		this.protocol = protocol;
	}

	public Map<String, Object> getParameterMap() {
		return parameterMap;
	}

	public void setParameterMap(Map<String, Object> parameterMap) {
		this.parameterMap = parameterMap;
	}

	public Protocol getProtocol() {
		return protocol;
	}

	public void setProtocol(Protocol protocol) {
		this.protocol = protocol;
	}

}
