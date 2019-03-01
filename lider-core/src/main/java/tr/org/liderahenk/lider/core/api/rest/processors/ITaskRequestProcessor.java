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
package tr.org.liderahenk.lider.core.api.rest.processors;

import java.util.Date;

import tr.org.liderahenk.lider.core.api.rest.responses.IRestResponse;

/**
 * 
 * @author <a href="mailto:emre.akkaya@agem.com.tr">Emre Akkaya</a>
 *
 */
public interface ITaskRequestProcessor {

	/**
	 * Execute task, send necessary task data to related agent.
	 * 
	 * @param json
	 * @return
	 */
	IRestResponse execute(String json);

	/**
	 * 
	 * @param pluginName
	 * @param onlyFutureTasks
	 * @param onlyScheduledTasks
	 * @param createDateRangeStart
	 * @param createDateRangeEnd
	 * @param status
	 * @param maxResults
	 * @return
	 */
	IRestResponse listExecutedTasks(String pluginName, Boolean onlyFutureTasks, Boolean onlyScheduledTasks,
			Date createDateRangeStart, Date createDateRangeEnd, Integer status, Integer maxResults);

	/**
	 * 
	 * @param taskId
	 * @return
	 */
	IRestResponse getCommand(Long taskId);

	/**
	 * 
	 * @param maxResults
	 * @return
	 */
	IRestResponse listCommands(Integer maxResults);

	/**
	 * 
	 * @param commandExecutionResultId
	 * @return
	 */
	IRestResponse getResponseData(Long commandExecutionResultId);

	/**
	 * 
	 * @param id
	 * @return
	 */
	IRestResponse cancelTask(Long id);

	/**
	 * 
	 * @param id
	 * @param cronExpression
	 * @return
	 */
	IRestResponse rescheduleTask(Long id, String cronExpression);

	/**
	 * 
	 * @param uid
	 * @return
	 */
	IRestResponse listExecutedDeviceTasks(String uid);
}
