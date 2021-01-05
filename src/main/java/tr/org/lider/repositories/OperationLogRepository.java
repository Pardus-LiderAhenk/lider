package tr.org.lider.repositories;

import java.util.Date;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;

import tr.org.lider.entities.OperationLogImpl;

public interface OperationLogRepository extends BaseJpaRepository<OperationLogImpl, Long> {
	
	@Query(value = "SELECT o FROM OperationLogImpl o WHERE o.userId LIKE %?1% AND o.operationType = ?2")
	Page<OperationLogImpl> findByUserIdAndOperationType(String userId, Integer operationType, Pageable pageable);

	@Query(value = "SELECT o FROM OperationLogImpl o WHERE o.userId = ?1 AND (o.operationType = ?2 OR o.operationType = ?3)")
	Page<OperationLogImpl> findByUserIdAndOperationTypeLoginOrOperationTypeLogout(String userId, Integer operationType, Integer operationType2, Pageable pageable);
	
	Page<OperationLogImpl> findByOperationType(Integer operationType, Pageable pageable);
	
	Page<OperationLogImpl> findByOperationTypeAndCreateDateGreaterThanAndCreateDateLessThan(int operationType, Optional<Date> startDate,
			Optional<Date> endDate, Pageable pageable);

	Page<OperationLogImpl> findByCreateDateGreaterThanAndCreateDateLessThan(Optional<Date> startDate,
			Optional<Date> endDate,  Pageable pageable);

	@Query(value = "SELECT o FROM OperationLogImpl o WHERE o.userId LIKE %?1% AND o.createDate BETWEEN ?2 AND ?3")
	Page<OperationLogImpl> findByUserIdAndCreateDateGreaterThanAndCreateDateLessThan(String userId,
			Optional<Date> startDate, Optional<Date> endDate, Pageable pageable);

	@Query(value = "SELECT o FROM OperationLogImpl o WHERE o.userId LIKE %?1%")
	Page<OperationLogImpl> findByUserId(String userId, Pageable pageable);
	
	@Query(value = "SELECT o FROM OperationLogImpl o WHERE o.requestIp LIKE %?1% AND o.createDate BETWEEN ?2 AND ?3")
	Page<OperationLogImpl> findByRequestIpAndCreateDateGreaterThanAndCreateDateLessThan(String searchText,
			Optional<Date> startDate, Optional<Date> endDate, Pageable pageable);

	@Query(value = "SELECT o FROM OperationLogImpl o WHERE o.requestIp LIKE %?1%")
	Page<OperationLogImpl> findByRequestIp(String requestIp, Pageable pageable);

	@Query(value = "SELECT o FROM OperationLogImpl o WHERE o.userId LIKE %?1% AND o.operationType = ?2 AND o.createDate BETWEEN ?3 AND ?4")
	Page<OperationLogImpl> findByUserIdAndOperationTypeAndCreateDateGreaterThanAndCreateDateLessThan(String userId,
			int operationType, Optional<Date> startDate, Optional<Date> endDate, Pageable pageable);
	
	@Query(value = "SELECT o FROM OperationLogImpl o WHERE o.requestIp LIKE %?1% AND o.operationType = ?2 AND o.createDate BETWEEN ?3 AND ?4")
	Page<OperationLogImpl> findByrequestIpAndOperationTypeAndCreateDateGreaterThanAndCreateDateLessThan(
			String requestIp, int typeId, Optional<Date> startDate, Optional<Date> endDate, Pageable pageable);
	
	@Query(value = "SELECT o FROM OperationLogImpl o WHERE o.requestIp LIKE %?1% AND o.operationType = ?2")
	Page<OperationLogImpl> findByrequestIpAndOperationType(String requestIp, int typeId, PageRequest pageable);
	
}

