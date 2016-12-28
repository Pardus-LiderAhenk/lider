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
package tr.org.liderahenk.lider.core.api.service;

import tr.org.liderahenk.lider.core.api.plugin.ICommand;
import tr.org.liderahenk.lider.core.api.rest.requests.ICommandRequest;
import tr.org.liderahenk.lider.core.api.rest.requests.ITaskRequest;

/**
 * 
 * Provides request data context to {@link ICommand#execute(ICommandContext)}
 *
 * @author <a href="mailto:birkan.duman@gmail.com">Birkan Duman</a>
 * 
 */
public interface ICommandContext {

	/**
	 * @return {@link ICommandRequest} that fired this command
	 */
	ITaskRequest getRequest();

}
