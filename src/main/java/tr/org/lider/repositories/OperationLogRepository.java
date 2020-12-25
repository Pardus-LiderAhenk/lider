package tr.org.lider.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;

import tr.org.lider.entities.OperationLogImpl;

public interface OperationLogRepository extends BaseJpaRepository<OperationLogImpl, Long> {
	
	Page<OperationLogImpl> findByUserIdAndOperationType(String userId, Integer operationType, Pageable pageable);

	@Query(value = "SELECT o FROM OperationLogImpl o WHERE o.userId = ?1 AND (o.operationType = ?2 OR o.operationType = ?3)")
	Page<OperationLogImpl> findByUserIdAndOperationTypeLoginOrOperationTypeLogout(String userId, Integer operationType, Integer operationType2, Pageable pageable);
}

