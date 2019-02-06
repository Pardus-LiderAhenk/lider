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
import java.util.HashMap;
import java.util.Iterator;
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
import javax.persistence.metamodel.EntityType;
import javax.persistence.metamodel.Metamodel;

import org.apache.directory.api.util.exception.NotImplementedException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import tr.org.liderahenk.lider.core.api.ldap.model.LdapEntry;
import tr.org.liderahenk.lider.core.api.messaging.enums.StatusCode;
import tr.org.liderahenk.lider.core.api.persistence.PropertyOrder;
import tr.org.liderahenk.lider.core.api.persistence.dao.ICommandDao;
import tr.org.liderahenk.lider.core.api.persistence.entities.ICommand;
import tr.org.liderahenk.lider.core.api.persistence.entities.ICommandExecution;
import tr.org.liderahenk.lider.core.api.persistence.entities.ICommandExecutionResult;
import tr.org.liderahenk.lider.core.api.persistence.entities.IPolicy;
import tr.org.liderahenk.lider.core.api.persistence.entities.ITask;
import tr.org.liderahenk.lider.core.api.persistence.enums.OrderType;
import tr.org.liderahenk.lider.persistence.entities.CommandExecutionImpl;
import tr.org.liderahenk.lider.persistence.entities.CommandExecutionResultImpl;
import tr.org.liderahenk.lider.persistence.entities.CommandImpl;

/**
 * Provides database access for commands. CRUD operations for commands and their
 * child records should be handled via this service only.
 * 
 * @author <a href="mailto:emre.akkaya@agem.com.tr">Emre Akkaya</a>
 * @see tr.org.liderahenk.lider.core.api.persistence.dao.ICommandDao;
 *
 */
@SuppressWarnings("unchecked")
public class CommandDaoImpl implements ICommandDao {

	private static Logger logger = LoggerFactory.getLogger(CommandDaoImpl.class);

	private EntityManager entityManager;

	public void init() {
		logger.info("Initializing command DAO.");
	}

	public void destroy() {
		logger.info("Destroying command DAO.");
	}

	@Override
	public ICommand save(ICommand command) throws Exception {
		CommandImpl commandImpl = new CommandImpl(command);
		commandImpl.setCreateDate(new Date());
		entityManager.persist(commandImpl);
		logger.debug("ICommand object persisted: {}", commandImpl.toString());
		return commandImpl;
	}

	@Override
	public ICommandExecution save(ICommandExecution commandExecution) throws Exception {
		CommandExecutionImpl commandExecutionImpl = new CommandExecutionImpl(commandExecution);
		commandExecutionImpl.setCreateDate(new Date());
		entityManager.persist(commandExecutionImpl);
		logger.debug("ICommandExecution object persisted: {}", commandExecutionImpl.toString());
		return commandExecutionImpl;
	}

	@Override
	public CommandImpl update(ICommand command) throws Exception {
		CommandImpl commandImpl = new CommandImpl(command);
		commandImpl = entityManager.merge(commandImpl);
		logger.debug("ICommand object merged: {}", commandImpl.toString());
		return commandImpl;
	}

	@Override
	public void delete(Long commandId) {
		throw new NotImplementedException("Command cannot be deleted!");
	}

	@Override
	public CommandImpl find(Long commandId) {
		CommandImpl commandImpl = entityManager.find(CommandImpl.class, commandId);
		logger.debug("ICommand object found: {}", commandImpl.toString());
		return commandImpl;
	}

	@Override
	public List<? extends ICommand> findAll(Class<? extends ICommand> obj, Integer maxResults) {
		List<CommandImpl> commandList = entityManager
				.createQuery("select t from " + CommandImpl.class.getSimpleName() + " t", CommandImpl.class)
				.getResultList();
		logger.debug("ICommand objects found: {}", commandList);
		return commandList;
	}

	@Override
	public ICommand getCommandByPolicyId(Long policyId) {
		Map<String, Object> propertiesMap = new HashMap<String, Object>();
		propertiesMap.put("policy.id", policyId);
		List<? extends ICommand> commands = findByProperties(ICommand.class, propertiesMap, null, 1);
		return commands != null && !commands.isEmpty() ? commands.get(0) : null;
	}

	@Override
	public List<? extends ICommand> findByProperty(Class<? extends ICommand> obj, String propertyName,
			Object propertyValue, Integer maxResults) {
		TypedQuery<CommandImpl> query = entityManager.createQuery("select t from " + CommandImpl.class.getSimpleName()
				+ " t where t." + propertyName + "= :propertyValue", CommandImpl.class)
				.setParameter("propertyValue", propertyValue);
		if (maxResults > 0) {
			query = query.setMaxResults(maxResults);
		}
		List<CommandImpl> commandList = query.getResultList();
		logger.debug("ICommand objects found: {}", commandList);
		return commandList;
	}

	@Override
	public List<? extends ICommand> findByProperties(Class<? extends ICommand> obj, Map<String, Object> propertiesMap,
			List<PropertyOrder> orders, Integer maxResults) {
		orders = new ArrayList<PropertyOrder>();
		// TODO
		// PropertyOrder ord = new PropertyOrder("name", OrderType.ASC);
		// orders.add(ord);
		CriteriaBuilder builder = entityManager.getCriteriaBuilder();
		CriteriaQuery<CommandImpl> criteria = (CriteriaQuery<CommandImpl>) builder.createQuery(CommandImpl.class);
		Metamodel metamodel = entityManager.getMetamodel();
		EntityType<CommandImpl> entityType = metamodel.entity(CommandImpl.class);
		Root<CommandImpl> from = (Root<CommandImpl>) criteria.from(entityType);
		criteria.select(from);
		Predicate predicate = null;

		if (propertiesMap != null) {
			Predicate pred = null;
			for (Entry<String, Object> entry : propertiesMap.entrySet()) {
				if (entry.getValue() != null && !entry.getValue().toString().isEmpty()) {
					String[] key = entry.getKey().split("\\.");
					if (key.length > 1) {
						Join<Object, Object> join = null;
						for (int i = 0; i < key.length - 1; i++) {
							join = join != null ? join.join(key[i]) : from.join(key[i]);
							from.fetch(key[i]);
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

		List<CommandImpl> list = null;
		if (null != maxResults) {
			list = entityManager.createQuery(criteria).setMaxResults(maxResults).getResultList();
		} else {
			list = entityManager.createQuery(criteria).getResultList();
		}

		return list;
	}

	private static final String FIND_EXECUTION = "SELECT DISTINCT ce FROM CommandImpl c INNER JOIN c.commandExecutions ce INNER JOIN c.task t WHERE ce.uid = :uid AND t.id = :taskId";

	@Override
	public ICommandExecution findExecution(Long taskId, String uid) {
		Query query = entityManager.createQuery(FIND_EXECUTION);
		query.setParameter("uid", uid);
		query.setParameter("taskId", taskId);
		List<CommandExecutionImpl> resultList = query.setMaxResults(1).getResultList();
		
		CommandExecutionImpl commandExecutionImpl=null;
		
		if(resultList!=null && resultList.size()>0)
		commandExecutionImpl= resultList.get(0);
		
		return commandExecutionImpl;
	}

	@Override
	public ICommandExecution findExecution(Long id) {
		CommandExecutionImpl executionImpl = entityManager.find(CommandExecutionImpl.class, id);
		logger.debug("ICommandExecution object found: {}", executionImpl.toString());
		return executionImpl;
	}

	@Override
	public ICommandExecutionResult findExecutionResult(Long id) {
		CommandExecutionResultImpl resultImpl = entityManager.find(CommandExecutionResultImpl.class, id);
		logger.debug("CommandExecutionResultImpl object found: {}", resultImpl.toString());
		return resultImpl;
	}

	private static final String FIND_TASK_COMMAND_WITH_DETAILS = "SELECT t, "
			+ "COUNT(ce.id) as executions ,  "
			+ "SUM(CASE WHEN cer.responseCode = :resp_success then 1 ELSE 0 END) as success, "
			+ "SUM(CASE WHEN cer.responseCode = :resp_warning then 1 ELSE 0 END) as warning, "
			+ "SUM(CASE WHEN cer.responseCode = :resp_error then 1 ELSE 0 END) as error, "
			+ "MAX(cer.createDate) as last_execution_date "
			+ "FROM CommandImpl c LEFT JOIN c.commandExecutions ce LEFT JOIN ce.commandExecutionResults cer INNER JOIN c.task t INNER JOIN t.plugin p "
			+ "##WHERE## GROUP BY t ORDER BY t.createDate DESC";

	@Override
	public List<Object[]> findTaskCommand(String pluginName, Boolean onlyFutureTasks, Boolean onlyScheduledTasks,
			Date createDateRangeStart, Date createDateRangeEnd, Integer status, Integer maxResults) {
		String sql = FIND_TASK_COMMAND_WITH_DETAILS;
		// Collect query conditions/parameters
		List<String> whereConditions = new ArrayList<String>();
		Map<String, Object> params = new HashMap<String, Object>();
		if (pluginName != null && !pluginName.isEmpty()) {
			whereConditions.add("p.name LIKE :pluginName");
			params.put("pluginName", pluginName);
		}
		if (onlyFutureTasks != null && onlyFutureTasks.booleanValue()) {
			whereConditions.add("c.activationDate IS NOT NULL AND c.activationDate > :today");
			params.put("today", new Date());
		}
		if (onlyScheduledTasks != null && onlyScheduledTasks.booleanValue()) {
			whereConditions.add("t.cronExpression IS NOT NULL");
		}
		if (createDateRangeStart != null && createDateRangeEnd != null) {
			whereConditions.add("t.createDate BETWEEN :startDate AND :endDate");
			params.put("startDate", createDateRangeStart);
			params.put("endDate", createDateRangeEnd);
		}
		// Dynamically generate where condition according to collected
		// parameters
		if (whereConditions.size() > 0) {
			String where = join(whereConditions, " AND ");
			sql = sql.replaceFirst("##WHERE##", " WHERE " + where);
		} else {
			sql = sql.replaceFirst("##WHERE##", "");
		}
		// Add parameter values for 'CASE WHEN' statements
		params.put("resp_success", StatusCode.TASK_PROCESSED.getId());
		params.put("resp_warning", StatusCode.TASK_WARNING.getId());
		params.put("resp_error", StatusCode.TASK_ERROR.getId());

		Query query = entityManager.createQuery(sql);
		// Iterate over map and set query parameters
		Iterator<Entry<String, Object>> iterator = params.entrySet().iterator();
		while (iterator.hasNext()) {
			Entry<String, Object> entry = iterator.next();
			if (entry.getValue() == null) {
				continue;
			}
			// Handle special date params.
			if (entry.getValue() instanceof Date) {
				query.setParameter(entry.getKey(), (Date) entry.getValue(), TemporalType.TIMESTAMP);
			} else {
				query.setParameter(entry.getKey(), entry.getValue());
			}
		}
		// Execute query
		if (maxResults != null) {
			query.setMaxResults(maxResults);
		}
		List<Object[]> resultList = query.getResultList();
		logger.debug("Command with details result list: {}",
				resultList != null && !resultList.isEmpty() && resultList.get(0) != null && resultList.get(0).length > 0
						? (ITask) resultList.get(0)[0] : null);

		return resultList;
	}

	private static final String FIND_POLICY_COMMAND_WITH_DETAILS = "SELECT p, c, "
			+ "SUM(CASE WHEN cer.responseCode = :resp_success then 1 ELSE 0 END) as success, "
			+ "SUM(CASE WHEN cer.responseCode = :resp_warning then 1 ELSE 0 END) as warning, "
			+ "SUM(CASE WHEN cer.responseCode = :resp_error then 1 ELSE 0 END) as error "
			+ "FROM CommandImpl c LEFT JOIN c.commandExecutions ce LEFT JOIN ce.commandExecutionResults cer INNER JOIN c.policy p "
			+ "##WHERE## GROUP BY p, c ORDER BY p.createDate DESC";

	@Override
	public List<Object[]> findPolicyCommand(String label, Date createDateRangeStart, Date createDateRangeEnd,
			Integer status, Integer maxResults, String containsPlugin) {
		String sql = FIND_POLICY_COMMAND_WITH_DETAILS;
		// Collect query conditions/parameters
		List<String> whereConditions = new ArrayList<String>();
		Map<String, Object> params = new HashMap<String, Object>();
		if (label != null && !label.isEmpty()) {
			whereConditions.add("p.label LIKE :label");
			params.put("label", label);
		}
		if (createDateRangeStart != null && createDateRangeEnd != null) {
			whereConditions.add("p.createDate BETWEEN :startDate AND :endDate");
			params.put("startDate", createDateRangeStart);
			params.put("endDate", createDateRangeEnd);
		}
		// FIXME No way to do this in this version of OpenJPA..! We'll just filter the results accordingly.
//		if (containsPlugin != null && !containsPlugin.isEmpty()) {
//			whereConditions.add("TODO");
//			params.put("containsPlugin", containsPlugin);
//		}
		// Dynamically generate where condition according to collected
		// parameters
		if (whereConditions.size() > 0) {
			String where = join(whereConditions, " AND ");
			sql = sql.replaceFirst("##WHERE##", " WHERE " + where);
		} else {
			sql = sql.replaceFirst("##WHERE##", "");
		}
		// Add parameter values for 'CASE WHEN' statements
		params.put("resp_success", StatusCode.POLICY_PROCESSED.getId());
		params.put("resp_warning", StatusCode.POLICY_WARNING.getId());
		params.put("resp_error", StatusCode.POLICY_ERROR.getId());

		Query query = entityManager.createQuery(sql);
		// Iterate over map and set query parameters
		Iterator<Entry<String, Object>> iterator = params.entrySet().iterator();
		while (iterator.hasNext()) {
			Entry<String, Object> entry = iterator.next();
			if (entry.getValue() == null) {
				continue;
			}
			// Handle special date params.
			if (entry.getValue() instanceof Date) {
				query.setParameter(entry.getKey(), (Date) entry.getValue(), TemporalType.TIMESTAMP);
			} else {
				query.setParameter(entry.getKey(), entry.getValue());
			}
		}
		// Execute query
		if (maxResults != null) {
			query.setMaxResults(maxResults);
		}
		List<Object[]> resultList = query.getResultList();
		logger.debug("Command with details result list: {}",
				resultList != null && !resultList.isEmpty() && resultList.get(0) != null && resultList.get(0).length > 0
						? (IPolicy) resultList.get(0)[0] : null);

		return resultList;
	}

	private static final String FIND_TASK_COMMANDS = 
			"SELECT DISTINCT c " 
			+ "FROM CommandImpl c "
			+ "LEFT JOIN c.commandExecutions ce " 
			+ "LEFT JOIN ce.commandExecutionResults cer " 
			+ "INNER JOIN c.task t "
			+ "INNER JOIN t.plugin p " + "ORDER BY t.createDate DESC";

	@Override
	public List<? extends ICommand> findTaskCommands(Integer maxResults) {
		Query query = entityManager.createQuery(FIND_TASK_COMMANDS, CommandImpl.class);
		if (maxResults != null) {
			query.setMaxResults(maxResults);
		}
		return (List<CommandImpl>) query.getResultList();
	}

	@Override
	public ICommandExecutionResult save(ICommandExecutionResult result) throws Exception {
		CommandExecutionResultImpl resultImpl = new CommandExecutionResultImpl(result);
		entityManager.persist(resultImpl);
		logger.debug("ICommandExecutionResult object persisted: {}", resultImpl.toString());
		return resultImpl;
	}

	/**
	 * We use 'ce.online' here because we only want to query results of the agents online at the time of task execution
	 */
	private static final String FIND_TASK_COMMANDS_WITH_MAIL_NOTIFICATION = 
			"SELECT DISTINCT c " 
			+ "FROM CommandImpl c "
			+ "INNER JOIN c.commandExecutions ce " 
			+ "INNER JOIN ce.commandExecutionResults cer "
			+ "WHERE c.sentMail = False AND ce.online = True AND cer.responseCode IN ( :taskEndingStates ) "
			+ "ORDER BY c.createDate DESC";

	@Override
	public List<? extends ICommand> findTaskCommandsWithMailNotification() {
		Query query = entityManager.createQuery(FIND_TASK_COMMANDS_WITH_MAIL_NOTIFICATION);
		query.setParameter("taskEndingStates", StatusCode.getTaskEndingStateIds());
		return (List<CommandImpl>) query.getResultList();
	}
	
	private static final String FIND_POLICY_COMMANDS_WITH_MAIL_NOTIFICATION = 
			"SELECT DISTINCT c " 
			+ "FROM CommandImpl c "
			+ "INNER JOIN c.commandExecutions ce " 
			+ "INNER JOIN ce.commandExecutionResults cer "
			+ "WHERE c.sentMail = False "
			+ "AND cer.responseCode IN ( :policyEndingStates ) "
		//	+ "AND (c.expirationDate IS NULL OR c.expirationDate < :today) " // ensure policy is continuous OR expired
			+ "ORDER BY c.createDate DESC";
	
	@Override
	public List<? extends ICommand> findPolicyCommandsWithMailNotification() {
		logger.debug("Finding Policy Command for mail notification...");
		Query query = entityManager.createQuery(FIND_POLICY_COMMANDS_WITH_MAIL_NOTIFICATION);
		query.setParameter("policyEndingStates", StatusCode.getPolicyEndingStateIds());
//		query.setParameter("today", new Date(), TemporalType.TIMESTAMP);
		return (List<CommandImpl>) query.getResultList();
	}

	private static final String COMMAND_EXECUTION_RESULT_LIST_BY_POLICY_ID_AND_DN = 
			"SELECT cer.id, cer.responseCode, cer.responseMessage " + 
			"FROM CommandImpl as com " + 
			"LEFT OUTER JOIN com.commandExecutions cex " + 
			"LEFT OUTER JOIN cex.commandExecutionResults cer " + 
			"LEFT OUTER JOIN com.policy as pol " + 
			"WHERE com.dnListJsonString = :uid " + 
			"AND pol.id = :policyID " +
			"ORDER BY cer.createDate DESC";
	
	@SuppressWarnings("unchecked")
	@Override
	public List<Object[]> getCommandExecutionResultsOfPolicy(String uid, List<LdapEntry> groupDns) {
		uid = "[\"uid=edip,ou=Ankara,ou=Kullanıcılar,dc=liderahenk,dc=org\"]";
		int policyID = 30652;
		Query query = entityManager.createQuery(COMMAND_EXECUTION_RESULT_LIST_BY_POLICY_ID_AND_DN);
		query.setParameter("uid", uid);
		query.setParameter("policyID", policyID);
		List<Object[]>  resultList = query.getResultList();
		
		for (Object[] objects : resultList) {
	        Long id = ((Long) objects[0]).longValue();
	        int responseCode = (Integer) objects[1];
	        String responseMessage = (String) objects[2];
	        logger.info(responseMessage + id + responseCode);
		}

		//logger.info(resultList.get(0).getResponseMessage());
		return resultList;
	}
	/**
	 * 
	 * @param tokens
	 * @param separator
	 * @return
	 */
	private String join(List<String> tokens, String separator) {
		if (tokens != null) {
			StringBuilder sb = new StringBuilder();
			String sep = "";
			for (String token : tokens) {
				sb.append(sep).append(token);
				sep = separator;
			}
			return sb.toString();
		}
		return null;
	}

	/**
	 * 
	 * @param entityManager
	 */
	public void setEntityManager(EntityManager entityManager) {
		this.entityManager = entityManager;
	}

}
