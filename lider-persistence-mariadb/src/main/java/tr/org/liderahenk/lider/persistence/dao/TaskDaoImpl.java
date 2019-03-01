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
package tr.org.liderahenk.lider.persistence.dao;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import javax.persistence.TemporalType;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Join;
import javax.persistence.criteria.Order;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import tr.org.liderahenk.lider.core.api.persistence.PropertyOrder;
import tr.org.liderahenk.lider.core.api.persistence.dao.ITaskDao;
import tr.org.liderahenk.lider.core.api.persistence.entities.ICommand;
import tr.org.liderahenk.lider.core.api.persistence.entities.ITask;
import tr.org.liderahenk.lider.core.api.persistence.enums.OrderType;
import tr.org.liderahenk.lider.persistence.entities.CommandExecutionImpl;
import tr.org.liderahenk.lider.persistence.entities.CommandExecutionResultImpl;
import tr.org.liderahenk.lider.persistence.entities.CommandImpl;
import tr.org.liderahenk.lider.persistence.entities.TaskImpl;

/**
 * Provides database operations for tasks. CRUD operations for task and their
 * referenced table records should be handled via this service only.
 * 
 * @author <a href="mailto:emre.akkaya@agem.com.tr">Emre Akkaya</a>
 * @see tr.org.liderahenk.lider.core.api.persistence.entities.ITask
 *
 */
@SuppressWarnings("unchecked")
public class TaskDaoImpl implements ITaskDao {

	private static Logger logger = LoggerFactory.getLogger(TaskDaoImpl.class);

	private EntityManager entityManager;

	public void init() {
		logger.info("Initializing task DAO.");
	}

	public void destroy() {
		logger.info("Destroying task DAO.");
	}

	@Override
	public ITask save(ITask task) {
		TaskImpl taskImpl = new TaskImpl(task);
		taskImpl.setCreateDate(new Date());
		taskImpl.setModifyDate(null);
		entityManager.persist(taskImpl);
		logger.debug("ITask object persisted: {}", taskImpl.toString());
		return taskImpl;
	}

	@Override
	public TaskImpl update(ITask task) {
		TaskImpl taskImpl = new TaskImpl(task);
		taskImpl.setModifyDate(new Date());
		taskImpl = entityManager.merge(taskImpl);
		logger.debug("ITask object merged: {}", taskImpl.toString());
		return taskImpl;
	}

	@Override
	public void delete(Long taskId) {
		TaskImpl taskImpl = entityManager.find(TaskImpl.class, taskId);
		// Never truly delete, just mark as deleted!
		taskImpl.setDeleted(true);
		taskImpl.setModifyDate(new Date());
		taskImpl = entityManager.merge(taskImpl);
		logger.debug("ITask object marked as deleted: {}", taskImpl.toString());
	}

	@Override
	public TaskImpl find(Long taskId) {
		TaskImpl taskImpl = entityManager.find(TaskImpl.class, taskId);
		logger.debug("ITask object found: {}", taskImpl.toString());
		return taskImpl;
	}

	@Override
	public List<? extends ITask> findAll(Class<? extends ITask> obj, Integer maxResults) {
		List<TaskImpl> taskList = entityManager
				.createQuery("select t from " + TaskImpl.class.getSimpleName() + " t", TaskImpl.class).getResultList();
		logger.debug("ITask objects found: {}", taskList);
		return taskList;
	}
	
	private static final String FIND_TASKS_WITH_ACTIVATION_DATE = 
			"SELECT c "
			+ "FROM CommandImpl c INNER JOIN c.task t "
			+ "WHERE t.deleted = False AND c.activationDate IS NOT NULL AND c.activationDate < :today AND "
			+ "NOT EXISTS (SELECT 1 FROM CommandImpl c2 INNER JOIN c2.commandExecutions ce WHERE c2.id =  c.id) "
			+ "ORDER BY c.activationDate, t.createDate, t.commandClsId DESC";
	
	@Override
	public List<? extends ICommand> findFutureTasks() {
		Query query = entityManager.createQuery(FIND_TASKS_WITH_ACTIVATION_DATE);
		query.setParameter("today", new Date(), TemporalType.TIMESTAMP);
		List<CommandImpl> taskList = query.getResultList();
		return taskList;
	}

	@Override
	public List<? extends ITask> findByProperty(Class<? extends ITask> obj, String propertyName, Object propertyValue,
			Integer maxResults) {
		TypedQuery<TaskImpl> query = entityManager.createQuery(
				"select t from " + TaskImpl.class.getSimpleName() + " t where t." + propertyName + "= :propertyValue",
				TaskImpl.class).setParameter("propertyValue", propertyValue);
		if (maxResults > 0) {
			query = query.setMaxResults(maxResults);
		}
		List<TaskImpl> taskList = query.getResultList();
		logger.debug("ITask objects found: {}", taskList);
		return taskList;
	}

	@Override
	public List<? extends ITask> findByProperties(Class<? extends ITask> obj, Map<String, Object> propertiesMap,
			List<PropertyOrder> orders, Integer maxResults) {
		
		orders = new ArrayList<PropertyOrder>();
		
		// PropertyOrder ord = new PropertyOrder("name", OrderType.ASC);
		// orders.add(ord);
		
		CriteriaBuilder builder = entityManager.getCriteriaBuilder();
		
		CriteriaQuery<TaskImpl> criteria = (CriteriaQuery<TaskImpl>) builder.createQuery(TaskImpl.class);
		
		Root<TaskImpl> from = (Root<TaskImpl>) criteria.from(TaskImpl.class);
		
		criteria.select(from);
		
		Predicate predicate = null;

		if (propertiesMap != null) {
			Predicate pred = null;
			for (Entry<String, Object> entry : propertiesMap.entrySet()) {
				if (entry.getValue() != null && !entry.getValue().toString().isEmpty()) {
					String[] key = entry.getKey() != null ? entry.getKey().split("\\.") : null;
					if (key != null && key.length > 1) {
						Join<Object, Object> join = null;
						for (int i = 0; i < key.length - 1; i++) {
							join = join != null ? join.join(key[i]) : from.join(key[i]);
						}
						pred = builder.equal(join.get(key[key.length - 1]), entry.getValue());
					} else {
						pred = builder.equal(from.get(entry.getKey()), entry.getValue());
					}
					predicate = predicate == null ? pred : builder.and(predicate, pred);
				}
			}
			if (predicate != null) {
				criteria.where(predicate);
			}
		}

		if (orders != null && !orders.isEmpty()) {
			List<Order> orderList = new ArrayList<Order>();
			for (PropertyOrder order : orders) {
				orderList.add(order.getOrderType() == OrderType.ASC ? builder.asc(from.get(order.getPropertyName()))
						: builder.desc(from.get(order.getPropertyName())));
			}
			criteria.orderBy(orderList);
		}

		List<TaskImpl> list = null;
		
		
		if (null != maxResults) {
			list = entityManager.createQuery(criteria).setMaxResults(maxResults).getResultList();
		} else {
			list = entityManager.createQuery(criteria).getResultList();
		}
		
		return list;

	
		
	}

	private static final String EXECUTED_DEVICE_TASKS = 
			"SELECT c.task, ce "
			+ "FROM CommandImpl c "
			+ "LEFT OUTER JOIN c.commandExecutions ce "
			+ "LEFT OUTER JOIN c.task t "
			+ "WHERE ce.uid =:uidClean "
			+ "AND c.task IS NOT NULL "
			+ "AND c.uidListJsonString LIKE :uid   "
			+ "ORDER BY c.createDate DESC";
	
	@Override
	public List<? extends ICommand> listExecutedDeviceTasks(String uid) {
		Query query = entityManager.createQuery(EXECUTED_DEVICE_TASKS);
		query.setParameter("uid", "%\"" + uid + " \"%");
		query.setParameter("uidClean", uid);
		List<Object[]>  resultList = query.getResultList();
		
		TaskImpl task = null;
		CommandExecutionImpl commandExecution = null;
		CommandExecutionResultImpl commandExecutionResult = null;
		CommandImpl command = null;
		List<CommandImpl> listCommand = new ArrayList<>(); 
		List<CommandExecutionResultImpl> listCommandExecutionResult = null; 
		
		for(int i = 0; i < resultList.size(); i++) {
			listCommandExecutionResult = new ArrayList<>(); 
			task = (TaskImpl) resultList.get(i)[0];
			//if commandExecutionResult is not null 
			
			commandExecution = (CommandExecutionImpl) resultList.get(i)[1];
			CommandExecutionImpl newCommandExecution = new CommandExecutionImpl();
			newCommandExecution.setDn(commandExecution.getDn());
			newCommandExecution.setCreateDate(commandExecution.getCreateDate());
			

			if(resultList.get(i).length == 2) {
				for (int j = 0; j < commandExecution.getCommandExecutionResults().size(); j++) {
					commandExecutionResult = new CommandExecutionResultImpl();
					commandExecutionResult = commandExecution.getCommandExecutionResults().get(j);
					listCommandExecutionResult.add(commandExecutionResult);
				}
				newCommandExecution.setCommandExecutionResults(listCommandExecutionResult);
			}

			command = new CommandImpl();
			command.setTask(task);
			//newCommandExecution.setCommand(command);
			command.addCommandExecution(newCommandExecution);
			listCommand.add(command);
		}
		logger.debug("ICommand objects found: {}", resultList);
		return listCommand;
	}
	
	public void setEntityManager(EntityManager entityManager) {
		this.entityManager = entityManager;
	}


}
