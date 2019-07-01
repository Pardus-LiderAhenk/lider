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
import tr.org.liderahenk.lider.core.api.persistence.dao.IAgentDao;
import tr.org.liderahenk.lider.core.api.persistence.entities.IAgent;
import tr.org.liderahenk.lider.core.api.persistence.entities.IAgreementStatus;
import tr.org.liderahenk.lider.core.api.persistence.enums.OrderType;
import tr.org.liderahenk.lider.persistence.entities.AgentImpl;
import tr.org.liderahenk.lider.persistence.entities.AgentPropertyImpl;
import tr.org.liderahenk.lider.persistence.entities.AgreementStatusImpl;

/**
 * Provides database access for agents. CRUD operations for agents and their
 * property records should be handled via this service only.
 * 
 * @author <a href="mailto:emre.akkaya@agem.com.tr">Emre Akkaya</a>
 * @see tr.org.liderahenk.lider.core.api.persistence.dao.IAgentDao
 *
 */
@SuppressWarnings("unchecked")
public class AgentDaoImpl implements IAgentDao {

	private static Logger logger = LoggerFactory.getLogger(AgentDaoImpl.class);

	private EntityManager entityManager;

	public void init() {
		logger.info("Initializing agent DAO.");
	}

	public void destroy() {
		logger.info("Destroying agent DAO.");
	}

	@Override
	public IAgent save(IAgent agent) {
		AgentImpl agentImpl = new AgentImpl((IAgent) agent);
		entityManager.persist(agentImpl);
		logger.debug("IAgent object persisted: {}", agentImpl.toString());
		return agentImpl;
	}

	@Override
	public void addAgreementStatus(IAgreementStatus status) {
		AgreementStatusImpl statusImpl = new AgreementStatusImpl(status);
		entityManager.persist(statusImpl);
		logger.debug("IAgreementStatus object persisted: {}", statusImpl.toString());
	}

	@Override
	public AgentImpl update(IAgent agent) {
		AgentImpl agentImpl = new AgentImpl(agent);
		agentImpl = entityManager.merge(agentImpl);
		logger.debug("IAgent object merged: {}", agentImpl.toString());
		return agentImpl;
	}

	@Override
	public AgentImpl update(IAgent agent, String ipAddresses) {
		AgentImpl agentImpl = new AgentImpl(agent);
		if (ipAddresses != null && !ipAddresses.isEmpty()) {
			agentImpl.setIpAddresses(ipAddresses);
		}
		agentImpl = entityManager.merge(agentImpl);
		logger.debug("IAgent object merged: {}", agentImpl.toString());
		return agentImpl;
	}

	@Override
	public void delete(Long agentId) {
		AgentImpl agentImpl = entityManager.find(AgentImpl.class, agentId);
		// Never truly delete, just mark as deleted!
		agentImpl.setDeleted(true);
		agentImpl = entityManager.merge(agentImpl);
		logger.debug("IAgent object marked as deleted: {}", agentImpl.toString());
	}

	@Override
	public AgentImpl find(Long agentId) {
		AgentImpl agentImpl = entityManager.find(AgentImpl.class, agentId);
		logger.debug("IAgent object found: {}", agentImpl.toString());
		return agentImpl;
	}

	@Override
	public List<? extends IAgent> findAll(Class<? extends IAgent> obj, Integer maxResults) {
		List<AgentImpl> agentList = entityManager
				.createQuery("select t from " + AgentImpl.class.getSimpleName() + " t", AgentImpl.class)
				.getResultList();
		logger.debug("IAgent objects found: {}", agentList);
		return agentList;
	}

	@Override
	public List<? extends IAgent> findByProperty(Class<? extends IAgent> obj, String propertyName, Object propertyValue,
			Integer maxResults) {
		TypedQuery<AgentImpl> query = entityManager.createQuery(
				"select t from " + AgentImpl.class.getSimpleName() + " t where t." + propertyName + "= :propertyValue",
				AgentImpl.class).setParameter("propertyValue", propertyValue);
		if (maxResults > 0) {
			query = query.setMaxResults(maxResults);
		}
		List<AgentImpl> agentList = query.getResultList();
		logger.debug("IAgent objects found: {}", agentList);
		return agentList;
	}

	@Override
	public List<? extends IAgent> findByProperties(Class<? extends IAgent> obj, Map<String, Object> propertiesMap,
			List<PropertyOrder> orders, Integer maxResults) {
		orders = new ArrayList<PropertyOrder>();
		// TODO
		// PropertyOrder ord = new PropertyOrder("name", OrderType.ASC);
		// orders.add(ord);
		CriteriaBuilder builder = entityManager.getCriteriaBuilder();
		CriteriaQuery<AgentImpl> criteria = (CriteriaQuery<AgentImpl>) builder.createQuery(AgentImpl.class);
		Root<AgentImpl> from = (Root<AgentImpl>) criteria.from(AgentImpl.class);
		criteria.select(from);
		Predicate predicate = null;

		if (propertiesMap != null) {
			Predicate pred = null;
			for (Entry<String, Object> entry : propertiesMap.entrySet()) {
				if (entry.getValue() != null && !entry.getValue().toString().isEmpty()) {
					String[] key = entry.getKey().split(".");
					if (key.length > 1) {
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

		List<AgentImpl> list = null;
		if (null != maxResults) {
			list = entityManager.createQuery(criteria).setMaxResults(maxResults).getResultList();
		} else {
			list = entityManager.createQuery(criteria).getResultList();
		}

		return list;
	}

	@Override
	public Map<String, String> getProperties() {
		Query query = entityManager.createQuery("SELECT DISTINCT p.propertyName, p.propertyValue FROM "
				+ AgentPropertyImpl.class.getSimpleName() + " p");
		List<Object[]> resultList = query.getResultList();
		Map<String, String> properties = null;
		if (resultList != null) {
			properties = new HashMap<String, String>();
			for (Object[] r : resultList) {
				if (r[0] == null || r[1] == null) {
					continue;
				}
				String key = r[0].toString();
				String value = r[1].toString();
				if (properties.get(key) != null) {
					// Group values belong to the same property
					String oldValue = properties.get(key);
					value = oldValue + ", " + value;
				}
				properties.put(key, value);
			}
		}
		return properties;
	}
	
	private static final String FIND_ONLINE_USERS = 
			"SELECT DISTINCT us.username "
			+ "FROM UserSessionImpl us "
			+ "INNER JOIN us.agent a "
			+ "WHERE a.dn = :dn AND us.sessionEvent = 1 AND NOT EXISTS "
			+ "(SELECT 1 FROM UserSessionImpl logout "
			+ "WHERE logout.sessionEvent = 2 and logout.agent = us.agent "
			+ "AND logout.username = us.username AND logout.createDate > us.createDate) "
			+ "ORDER BY us.createDate, us.username";
	
	@Override
	public List<String> findOnlineUsers(String dn) {
		
		dn=dn.replace("+"," ");
		Query query = entityManager.createQuery(FIND_ONLINE_USERS);
		query.setParameter("dn", dn);
		List<String> resultList = query.getResultList();
		return resultList;
	}

	public void setEntityManager(EntityManager entityManager) {
		this.entityManager = entityManager;
	}
	
	private static final String FIND_ALL_ONLINE_USERS = 
			"SELECT DISTINCT a.id, a.hostname, a.ipAddresses, a.dn, us.username, us.createDate "
			+ "FROM UserSessionImpl us "
			+ "INNER JOIN us.agent a "
			+ "WHERE us.sessionEvent = 1 AND NOT EXISTS "
			+ "(SELECT 1 FROM UserSessionImpl logout "
			+ "WHERE logout.sessionEvent = 2 and logout.agent = us.agent "
			+ "AND logout.username = us.username AND logout.createDate > us.createDate) "
			+ "ORDER BY us.createDate, us.username, a.dn";

	@Override
	public List<Object[]> findAllOnlineUsers() {
		Query query = entityManager.createQuery(FIND_ALL_ONLINE_USERS);
		List<Object[]> resultList = query.getResultList();
		return resultList;
	}
	
	private static final String FIND_AGENT_FROM_ONLINE_USERS = 
			"SELECT a.id, a.jid, a.hostname, a.ipAddresses,  a.dn, us.username, us.createDate, us.userIp "
			+ "FROM UserSessionImpl us "
			+ "INNER JOIN us.agent a "
			+ "WHERE us.username= :username and us.sessionEvent = 1 AND NOT EXISTS "
			+ "(SELECT 1 FROM UserSessionImpl logout "
			+ "WHERE logout.sessionEvent = 2 and logout.agent = us.agent "
			+ "AND logout.username = us.username AND logout.createDate > us.createDate) "
			+ "ORDER BY us.createDate, us.username, a.dn";
	
	
	@Override
	public List<Object[]> findAgentFromOnlineUsers(String userName) {
		Query query = entityManager.createQuery(FIND_AGENT_FROM_ONLINE_USERS);
		query.setParameter("username", userName);
		List<Object[]> resultList = query.getResultList();
		return resultList;
	}

	private String FIND_AGENT_NUMBER = "";
	@Override
	public int countOfAgent(String propertyName, String propertyValue, String type) {
		Query query = null;
		if(propertyName != null && !propertyName.equals("") 
				&& propertyValue != null && !propertyValue.equals("")
				&& type != null && !type.equals("")) {
			if(type.equals("AGENT")) {
				FIND_AGENT_NUMBER = "SELECT COUNT(a) "
						+ "FROM AgentImpl a WHERE a.deleted = False "
						+ "AND a." + propertyName + " LIKE '%" + propertyValue + "%' ";
				query = entityManager.createQuery(FIND_AGENT_NUMBER);
			}
			else {
				FIND_AGENT_NUMBER = "SELECT COUNT(a) "
						+ "FROM AgentPropertyImpl a "
						+ "WHERE a.propertyName = :propertyName AND a.propertyValue LIKE :propertyValue "
						+ "AND a.agent IS NOT NULL AND a.agent.deleted = False ";
				query = entityManager.createQuery(FIND_AGENT_NUMBER);
				query.setParameter("propertyName", propertyName);
				query.setParameter("propertyValue", "%" + propertyValue + "%");
			}
		}
		else {
			FIND_AGENT_NUMBER = 
					"SELECT COUNT(a) "
					+ "FROM AgentImpl a WHERE a.deleted = False";
			query = entityManager.createQuery(FIND_AGENT_NUMBER);
		}
		
		int count = 0;
		try {
			count = query.getSingleResult() != null ? Integer.parseInt(query.getSingleResult().toString()) : 0;			
		} catch (Exception e) {
			logger.error(e.getMessage());
			count = 0;
		}
		return count;
	}
	
	@Override
	public List<? extends IAgent> listFilteredAgentsWithPaging(String propertyName, String propertyValue, String type, int firstResult, int maxResult) {
		List<AgentImpl> agentList = null;
		if(propertyName != null && !propertyName.equals("") 
				&& propertyValue != null && !propertyValue.equals("")
				&& type != null && !type.equals("")) {
			if(type.equals("AGENT")) {
				FIND_AGENT_NUMBER = "SELECT COUNT(a) "
						+ "FROM AgentImpl a WHERE a.deleted = False "
						+ "AND a." + propertyName + " LIKE '%" + propertyValue + "%' ";
				agentList = entityManager
						.createQuery("select t from " + AgentImpl.class.getSimpleName() + " t "
								+ "where t.deleted = false and t." + propertyName + " LIKE '%" + propertyValue + "%'", AgentImpl.class)
						.setFirstResult(firstResult)
						.setMaxResults(maxResult)
						.getResultList();
			}
			else {
				agentList = entityManager
						.createQuery("select t.agent from " + AgentPropertyImpl.class.getSimpleName() + " t "
								+ "where t.propertyName = :propertyName and t.propertyValue LIKE :propertyValue "
								+ "and t.agent is not null and t.agent.deleted = False", AgentImpl.class)
						.setParameter("propertyName", propertyName)
						.setParameter("propertyValue", "%" + propertyValue + "%")
						.setFirstResult(firstResult)
						.setMaxResults(maxResult)
						.getResultList();
			}
		}
		else {
			agentList = entityManager
					.createQuery("select t from " + AgentImpl.class.getSimpleName() + " t", AgentImpl.class)
					.setFirstResult(firstResult)
					.setMaxResults(maxResult)
					.getResultList();
		}

		logger.debug("IAgent objects found: {}", agentList);
		return agentList;
	}
	
	@Override
	public List<? extends IAgent> listAgentsWithPaging(int firstResult, int maxResult) {
		List<AgentImpl> agentList = null;
		agentList = entityManager
				.createQuery("select t from " + AgentImpl.class.getSimpleName() + " t", AgentImpl.class)
				.setFirstResult(firstResult)
				.setMaxResults(maxResult)
				.getResultList();
		logger.debug("IAgent objects found: {}", agentList);
		return agentList;
	}
}
