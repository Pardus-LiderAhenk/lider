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
package tr.org.liderahenk.lider.core.api.persistence.dao;

import java.util.Date;
import java.util.List;
import java.util.Map;

import tr.org.liderahenk.lider.core.api.ldap.model.LdapEntry;
import tr.org.liderahenk.lider.core.api.persistence.IBaseDao;
import tr.org.liderahenk.lider.core.api.persistence.PropertyOrder;
import tr.org.liderahenk.lider.core.api.persistence.entities.ICommand;
import tr.org.liderahenk.lider.core.api.persistence.entities.ICommandExecution;
import tr.org.liderahenk.lider.core.api.persistence.entities.ICommandExecutionResult;

/**
 * Provides command database operations.
 * 
 * @author <a href="mailto:emre.akkaya@agem.com.tr">Emre Akkaya</a>
 *
 */
public interface ICommandDao extends IBaseDao<ICommand> {

	/**
	 * 
	 * @param command
	 * @return
	 * @throws Exception
	 */
	ICommand save(ICommand command) throws Exception;

	/**
	 * 
	 * @param command
	 * @return
	 * @throws Exception
	 */
	ICommand update(ICommand command) throws Exception;

	/**
	 * 
	 * @param commandId
	 */
	void delete(Long commandId);

	/**
	 * 
	 * @param commandId
	 * @return
	 */
	ICommand find(Long commandId);

	/**
	 * 
	 * @return
	 */
	List<? extends ICommand> findAll(Class<? extends ICommand> obj, Integer maxResults);

	/**
	 * 
	 * @return
	 */
	List<? extends ICommand> findByProperty(Class<? extends ICommand> obj, String propertyName, Object propertyValue,
			Integer maxResults);

	/**
	 * 
	 * @return
	 */
	List<? extends ICommand> findByProperties(Class<? extends ICommand> obj, Map<String, Object> propertiesMap,
			List<PropertyOrder> orders, Integer maxResults);

	/**
	 * 
	 * @param commandExecution
	 * @return
	 * @throws Exception
	 */
	ICommandExecution save(ICommandExecution commandExecution) throws Exception;

	/**
	 * 
	 * @param result
	 */
	ICommandExecutionResult save(ICommandExecutionResult result) throws Exception;

	/**
	 * Find command execution record by given task ID and UID
	 * 
	 * @param taskId
	 * @param uid
	 * @return
	 */
	ICommandExecution findExecution(Long taskId, String uid);

	/**
	 * Find command execution record by given ID.
	 * 
	 * @param commandExecutionId
	 * @return
	 */
	ICommandExecution findExecution(Long id);

	/**
	 * Find command with its details (task, plugin, command execution, command
	 * execution results).
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
	List<Object[]> findTaskCommand(String pluginName, Boolean onlyFutureTasks, Boolean onlyScheduledTasks,
			Date createDateRangeStart, Date createDateRangeEnd, Integer status, Integer maxResults);

	/**
	 * Find command with its details (policy, command execution, command
	 * execution results).
	 * 
	 * @param label
	 * @param createDateRangeStart
	 * @param createDateRangeEnd
	 * @param status
	 * @param maxResults
	 * @return
	 */
	List<Object[]> findPolicyCommand(String label, Date createDateRangeStart, Date createDateRangeEnd, Integer status,
			Integer maxResults, String containsPlugin);

	/**
	 * 
	 * @param maxResults
	 * @return
	 */
	List<? extends ICommand> findTaskCommands(Integer maxResults);

	/**
	 * 
	 * @param id
	 * @return
	 */
	ICommandExecutionResult findExecutionResult(Long id);

	List<? extends ICommand> findTaskCommandsWithMailNotification();

	ICommand getCommandByPolicyId(Long id);

	List<? extends ICommand> findPolicyCommandsWithMailNotification();

	List<Object[]> getCommandExecutionResultsOfPolicy(Long policyID, String uid, List<LdapEntry> groupDns);

}
