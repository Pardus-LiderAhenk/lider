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


/**
 * Interface for task execution messages sent <b>from Lider to agents</b>.
 *
 * 
 */
public interface IExecuteTaskMessage extends ILiderMessage {

	/**
	 * 
	 * @return JSON string representation of task
	 */
	String getTask();

	/**
	 * Optional parameter for file transfer. (If a plugin uses file transfer,
	 * which can be determined by {@link IPluginInfo} implementation, this
	 * optional parameter will be set before sending EXECUTE_TASK /
	 * EXECUTE_POLICY messages to agents)
	 * 
	 * @return configuration required to transfer file.
	 */
	FileServerConf getFileServerConf();

}
