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
import javax.persistence.metamodel.EntityType;
import javax.persistence.metamodel.Metamodel;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import tr.org.liderahenk.lider.core.api.ldap.model.LdapEntry;
import tr.org.liderahenk.lider.core.api.persistence.PropertyOrder;
import tr.org.liderahenk.lider.core.api.persistence.dao.IPolicyDao;
import tr.org.liderahenk.lider.core.api.persistence.entities.IPolicy;
import tr.org.liderahenk.lider.core.api.persistence.enums.OrderType;
import tr.org.liderahenk.lider.core.api.rest.enums.DNType;
import tr.org.liderahenk.lider.persistence.entities.PolicyImpl;

/**
 * Provides database access for policies. CRUD operations for policies and their
 * plugin or policy records should be handled via this service only.
 * 
 * @author <a href="mailto:emre.akkaya@agem.com.tr">Emre Akkaya</a>
 * @author <a href="mailto:caner.feyzullahoglu@agem.com.tr">Caner
 *         Feyzullahoğlu</a>
 * @see tr.org.liderahenk.lider.core.api.persistence.entities.IPolicy
 *
 */
public class PolicyDaoImpl implements IPolicyDao {

	private static Logger logger = LoggerFactory.getLogger(PolicyDaoImpl.class);

	private EntityManager entityManager;

	public void init() {
		logger.info("Initializing policy DAO.");
	}

	public void destroy() {
		logger.info("Destroying policy DAO.");
	}

	@Override
	public IPolicy save(IPolicy policy) {
		PolicyImpl policyImpl = new PolicyImpl(policy);
		policyImpl.setCreateDate(new Date());
		policyImpl.setModifyDate(null);
		entityManager.persist(policyImpl);
		policyImpl.setPolicyVersion(policyImpl.getId() + "-1");
		logger.debug("IPolicy object persisted: {}", policyImpl.toString());
		return policyImpl;
	}

	@Override
	public PolicyImpl update(IPolicy policy) {
		PolicyImpl policyImpl = new PolicyImpl(policy);
		policyImpl.setModifyDate(new Date());
		policyImpl = entityManager.merge(policyImpl);
		logger.debug("IPolicy object merged: {}", policyImpl.toString());
		return policyImpl;
	}

	@Override
	public void delete(Long policyId) {
		PolicyImpl policyImpl = entityManager.find(PolicyImpl.class, policyId);
		// Never truly delete, just mark as deleted!
		policyImpl.setDeleted(true);
		policyImpl.setModifyDate(new Date());
		policyImpl = entityManager.merge(policyImpl);
		logger.debug("IPolicy object marked as deleted: {}", policyImpl.toString());
	}

	@Override
	public PolicyImpl find(Long policyId) {
		PolicyImpl policyImpl = entityManager.find(PolicyImpl.class, policyId);
		logger.debug("IPolicy object found: {}", policyImpl.toString());
		return policyImpl;
	}

	@Override
	public List<? extends IPolicy> findAll(Class<? extends IPolicy> obj, Integer maxResults) {
		List<PolicyImpl> policyList = entityManager
				.createQuery("select t from " + PolicyImpl.class.getSimpleName() + " t", PolicyImpl.class)
				.getResultList();
		logger.debug("IPolicy objects found: {}", policyList);
		return policyList;
	}

	@Override
	public List<? extends IPolicy> findByProperty(Class<? extends IPolicy> obj, String propertyName,
			Object propertyValue, Integer maxResults) {
		TypedQuery<PolicyImpl> query = entityManager.createQuery(
				"select t from " + PolicyImpl.class.getSimpleName() + " t where t." + propertyName + "= :propertyValue",
				PolicyImpl.class).setParameter("propertyValue", propertyValue);
		if (maxResults > 0) {
			query = query.setMaxResults(maxResults);
		}
		List<PolicyImpl> policyList = query.getResultList();
		logger.debug("IPolicy objects found: {}", policyList);
		return policyList;
	}

	@Override
	public List<? extends IPolicy> findByProperties(Class<? extends IPolicy> obj, Map<String, Object> propertiesMap,
			List<PropertyOrder> orders, Integer maxResults) {
		orders = new ArrayList<PropertyOrder>();
		// TODO
		// PropertyOrder ord = new PropertyOrder("name", OrderType.ASC);
		// orders.add(ord);
		CriteriaBuilder builder = entityManager.getCriteriaBuilder();
		CriteriaQuery<PolicyImpl> criteria = (CriteriaQuery<PolicyImpl>) builder.createQuery(PolicyImpl.class);
		Metamodel metamodel = entityManager.getMetamodel();
		EntityType<PolicyImpl> entityType = metamodel.entity(PolicyImpl.class);
		Root<PolicyImpl> from = (Root<PolicyImpl>) criteria.from(entityType);
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

		List<PolicyImpl> list = null;
		if (null != maxResults) {
			list = entityManager.createQuery(criteria).setMaxResults(maxResults).getResultList();
		} else {
			list = entityManager.createQuery(criteria).getResultList();
		}

		return list;
	}

	private static final String LATEST_USER_POLICY = 
			"SELECT DISTINCT pol, ce.id, c.expirationDate " 
			+ "FROM CommandImpl c "
			+ "INNER JOIN c.policy pol " 
			+ "INNER JOIN c.commandExecutions ce "
			+ "WHERE ((ce.uid = :sUid)##WHERE##) "
			+ "AND (c.activationDate IS NULL OR c.activationDate < :today) "
			+ "AND (c.expirationDate IS NULL OR c.expirationDate > :today) "
			+ "AND pol.deleted = False "
			+ "ORDER BY ce.createDate DESC";
	private static final String GROUP_CONDITION = " OR (ce.dnType = :gDnType AND ce.dn IN :gDnList)";

	/**
	 * Returns the latest policy with its version number and child profiles iff
	 * user or his group(s) has at least one policy.
	 */
	@SuppressWarnings("unchecked")
	@Override
	public List<Object[]> getLatestUserPolicy(String uid, List<LdapEntry> groupDns) {
		List<String> list = convertStringList(groupDns);
		String sql = LATEST_USER_POLICY;
		// User may or may not have groups! Handle 'WHERE' clause here
		if (list != null && !list.isEmpty()) {
			sql = sql.replaceFirst("##WHERE##", GROUP_CONDITION);
		} else {
			sql = sql.replaceFirst("##WHERE##", "");
		}
		Query query = entityManager.createQuery(sql);
		query.setParameter("sUid", uid);
		if (list != null && !list.isEmpty()) {
			query.setParameter("gDnType", DNType.GROUP.getId());
			query.setParameter("gDnList", list);
		}
		query.setParameter("today", new Date(), TemporalType.TIMESTAMP);
		List<Object[]> resultList = query.setMaxResults(1).getResultList();
		logger.debug("User policy result list: {}",
				resultList != null && !resultList.isEmpty() && resultList.get(0) != null && resultList.get(0).length > 0
						? (IPolicy) resultList.get(0)[0] : null);
		return resultList;
	}

	private List<String> convertStringList(List<LdapEntry> entries) {
		List<String> list = null;
		if (entries != null) {
			list = new ArrayList<String>();
			for (LdapEntry entry : entries) {
				list.add(entry.getDistinguishedName());
			}
		}
		return list;
	}

	private static final String LATEST_MACHINE_POLICY = 
			"SELECT DISTINCT pol, ce.id, c.expirationDate "
			+ "FROM CommandImpl c "
			+ "INNER JOIN c.policy pol "
			+ "INNER JOIN c.commandExecutions ce "
			+ "WHERE ce.uid = :uid "
			+ "AND (c.activationDate IS NULL OR c.activationDate < :today) "
			+ "AND (c.expirationDate IS NULL OR c.expirationDate > :today) "
			+ "AND pol.deleted = False "
			+ "ORDER BY ce.createDate DESC";

	/**
	 * Return the latest policy with its version number and child profiles iff
	 * agent has at least one policy.
	 */
	@SuppressWarnings("unchecked")
	@Override
	public List<Object[]> getLatestAgentPolicy(String uid) {
		Query query = entityManager.createQuery(LATEST_MACHINE_POLICY);
		query.setParameter("uid", uid);
		query.setParameter("today", new Date(), TemporalType.TIMESTAMP);
		List<Object[]> resultList = query.setMaxResults(1).getResultList();
		logger.debug("Agent policy result list: {}",
				resultList != null && !resultList.isEmpty() && resultList.get(0) != null && resultList.get(0).length > 0
						? (IPolicy) resultList.get(0)[0] : null);
		return resultList;
	}

	/**
	 * 
	 * @param entityManager
	 */
	public void setEntityManager(EntityManager entityManager) {
		this.entityManager = entityManager;
	}

	private static final String LATEST_GROUP_POLICY = 
			"SELECT DISTINCT pol, ce.id, c.expirationDate "
			+ "FROM CommandImpl c "
			+ "INNER JOIN c.policy pol "
			+ "INNER JOIN c.commandExecutions ce "
			+ "WHERE c.dnListJsonString IN :dnList "
			+ "AND (c.activationDate IS NULL OR c.activationDate < :today) "
			+ "AND (c.expirationDate IS NULL OR c.expirationDate > :today) "
			+ "AND pol.deleted = False "
			+ "ORDER BY ce.createDate DESC";
	
	/**
	 * Return the latest applied policy to group or to groupOfNames for Lider Console
	 * 
	 */
	@SuppressWarnings("unchecked")
	@Override
	public List<Object[]> getLatestGroupPolicy(List<String> dnList) {
		Query query = entityManager.createQuery(LATEST_GROUP_POLICY);
		query.setParameter("dnList", dnList);
		query.setParameter("today", new Date(), TemporalType.TIMESTAMP);
		List<Object[]> resultList = query.setMaxResults(1).getResultList();
		logger.debug("Agent policy result list: {}",
				resultList != null && !resultList.isEmpty() && resultList.get(0) != null && resultList.get(0).length > 0
						? (IPolicy) resultList.get(0)[0] : null);
		return resultList;
	}

}