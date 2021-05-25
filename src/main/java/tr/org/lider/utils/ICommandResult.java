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
package tr.org.lider.utils;

import java.util.List;
import java.util.Map;


/**
 * 
 * Keeps information about a Command execution result
 * 
 * @author <a href="mailto:birkan.duman@gmail.com">Birkan Duman</a>
 */
public interface ICommandResult {

	/**
	 * 
	 * @return command result status {@link CommandResultStatus}
	 */
	CommandResultStatus getStatus();

	/**
	 * 
	 * @return list of info text provided by
	 *         {@link ICommand#execute(ICommandContext)}
	 */
	List<String> getMessages();

	/**
	 * 
	 * @return map containing values provided by
	 *         {@link ICommand#execute(ICommandContext)}
	 */
	Map<String, Object> getResultMap();

	/**
	 * 
	 * @return ICommand that created this specific result
	 */
	ICommand getCommand();

}
