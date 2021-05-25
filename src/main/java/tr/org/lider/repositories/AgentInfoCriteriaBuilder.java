package tr.org.lider.repositories;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Join;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;

import org.apache.commons.collections.CollectionUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import tr.org.lider.entities.AgentImpl;
import tr.org.lider.entities.AgentPropertyImpl;

/*
 * AgentInfoCriteriaBuilder implements filtering agents with multiple data.
 * Filter can be applied over status(online, offline) registration date and agent properties
 * 
 * @author <a href="mailto:hasan.kara@pardus.org.tr">Hasan Kara</a>
 */

@Service
public class AgentInfoCriteriaBuilder {

	@PersistenceContext
	EntityManager entityManager;
	
	public Page<AgentImpl> filterAgents(int pageNumber, int pageSize, String status,
			Optional<String> field, Optional<String> text,
			Optional<Date> registrationStartDate, Optional<Date> registrationEndDate, List<String> listOfOnlineUsers) {
		PageRequest pageable = PageRequest.of(pageNumber - 1, pageSize);

		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		//for filtered result count
		CriteriaBuilder criteriaBuilderCount = entityManager.getCriteriaBuilder();
		CriteriaQuery<Long> criteriaCount = criteriaBuilderCount.createQuery(Long.class);
		Root<AgentImpl> fromCount = criteriaCount.from(AgentImpl.class);
		criteriaCount.select(criteriaBuilderCount.count(fromCount));

		CriteriaQuery<AgentImpl> criteriaQuery = criteriaBuilder.createQuery(AgentImpl.class);
		Root<AgentImpl> from = criteriaQuery.from(AgentImpl.class);
		CriteriaQuery<AgentImpl> select = criteriaQuery.select(from);

		List<Predicate> predicates = new ArrayList<>();
		//for filtered result count
		List<Predicate> predicatesCount = new ArrayList<>();
		if(field.isPresent() && text.isPresent()) {
			if(field.get().equals("jid")) {
				predicates.add(criteriaBuilder.like(from.get("jid").as(String.class), "%" + text.get() + "%"));
				predicatesCount.add(criteriaBuilderCount.like(fromCount.get("jid").as(String.class), "%" + text.get() + "%"));
			} else if(field.get().equals("hostname")) {
				predicates.add(criteriaBuilder.like(from.get("hostname").as(String.class), "%" + text.get() + "%"));
				predicatesCount.add(criteriaBuilderCount.like(fromCount.get("hostname").as(String.class), "%" + text.get() + "%"));
			} else if(field.get().equals("ipAddresses")) {
				predicates.add(criteriaBuilder.like(from.get("ipAddresses").as(String.class), "%" + text.get() + "%"));
				predicatesCount.add(criteriaBuilderCount.like(fromCount.get("ipAddresses").as(String.class), "%" + text.get() + "%"));
			} else if(field.get().equals("macAddresses")) {
				predicates.add(criteriaBuilder.like(from.get("macAddresses").as(String.class), "%" + text.get() + "%"));
				predicatesCount.add(criteriaBuilderCount.like(fromCount.get("macAddresses").as(String.class), "%" + text.get() + "%"));
			} else if(field.get().equals("dn")) {
				predicates.add(criteriaBuilder.like(from.get("dn").as(String.class), "%" + text.get() + "%"));
				predicatesCount.add(criteriaBuilderCount.like(fromCount.get("dn").as(String.class), "%" + text.get() + "%"));
			} else {
				Join<AgentImpl, AgentPropertyImpl> properties = from.join("properties");

				Predicate namePredicate = criteriaBuilder.like(properties.get("propertyName").as(String.class), "%" + field.get() + "%");
				Predicate valuePredicate = criteriaBuilder.like(properties.get("propertyValue").as(String.class), "%" + text.get() + "%");
				predicates.add(criteriaBuilder.and(namePredicate, valuePredicate));

				//for count 
				Join<AgentImpl, AgentPropertyImpl> propertiesCount = fromCount.join("properties");
				Predicate namePredicateCount = criteriaBuilderCount.like(propertiesCount.get("propertyName").as(String.class), "%" + field.get() + "%");
				Predicate valuePredicateCount = criteriaBuilderCount.like(propertiesCount.get("propertyValue").as(String.class), "%" + text.get() + "%");
				predicatesCount.add(criteriaBuilderCount.and(namePredicateCount, valuePredicateCount));
			}
		}

		if(status.equals("online") ) {
			predicates.add(criteriaBuilder.in(from.get("jid"))
					.value(!CollectionUtils.isEmpty(listOfOnlineUsers)? listOfOnlineUsers : new ArrayList<String>(Arrays.asList(""))));
			predicatesCount.add(criteriaBuilderCount.in(fromCount.get("jid"))
					.value(!CollectionUtils.isEmpty(listOfOnlineUsers)? listOfOnlineUsers : new ArrayList<String>(Arrays.asList(""))));
		} else if(status.equals("offline")) {
			predicates.add(
					criteriaBuilder.not(from.get("jid").in(
							!CollectionUtils.isEmpty(listOfOnlineUsers)? listOfOnlineUsers : new ArrayList<String>(Arrays.asList("")))));
			predicatesCount.add(
					criteriaBuilderCount.not(fromCount.get("jid").in(
							!CollectionUtils.isEmpty(listOfOnlineUsers)? listOfOnlineUsers : new ArrayList<String>(Arrays.asList("")))));
		}

		if (registrationStartDate.isPresent()) {
			predicates.add(criteriaBuilder.greaterThanOrEqualTo(from.get("createDate"), registrationStartDate.get()));
			predicatesCount.add(criteriaBuilderCount.greaterThanOrEqualTo(fromCount.get("createDate"), registrationStartDate.get()));
		}
		if (registrationEndDate.isPresent()) {
			predicates.add(criteriaBuilder.lessThanOrEqualTo(from.get("createDate"), registrationEndDate.get()));
			predicatesCount.add(criteriaBuilderCount.lessThanOrEqualTo(fromCount.get("createDate"), registrationEndDate.get()));
		}

		criteriaQuery.where(predicates.toArray(new Predicate[predicates.size()]));
		criteriaQuery.orderBy(criteriaBuilder.desc(from.get("createDate")));
		Long count = count(criteriaBuilderCount, predicatesCount, criteriaCount);

		TypedQuery<AgentImpl> typedQuery = entityManager.createQuery(select);
		typedQuery.setFirstResult((pageNumber - 1)*pageSize);
		if(pageNumber*pageSize > count) {
			typedQuery.setMaxResults((int) (count%pageSize));
		} else {
			typedQuery.setMaxResults(pageSize);
		}
		
		Page<AgentImpl> agents = new PageImpl<AgentImpl>(typedQuery.getResultList(), pageable, count);

		return agents;
	}

	/*
	 * get count of filtered data for paging
	 */
	public Long count(CriteriaBuilder builder, List<Predicate> restrictions, CriteriaQuery<Long> criteria ) {
		criteria.where(restrictions.toArray(new Predicate[restrictions.size()]));
		TypedQuery<Long> query = entityManager.createQuery(criteria);
		return query.getSingleResult();
	}
}
