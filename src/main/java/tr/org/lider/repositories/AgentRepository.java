package tr.org.lider.repositories;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;

import tr.org.lider.entities.AgentImpl;



public interface AgentRepository extends BaseJpaRepository<AgentImpl, Long>{

	List<AgentImpl> findByJid(String jid);
	Page<AgentImpl> findByJidContaining(String jid, Pageable pageable);
	Page<AgentImpl> findByDnContaining(String dn, Pageable pageable);
	Page<AgentImpl> findByHostnameContaining(String hostname, Pageable pageable);
	Page<AgentImpl> findByIpAddressesContaining(String ipAddresses, Pageable pageable);
	Page<AgentImpl> findByMacAddressesContaining(String macAddresses, Pageable pageable);
	
	Page<AgentImpl> findByJidContainingOrDnContaining(
			String jid, String dn, Pageable pageable);
	
	@Query(value = "SELECT a FROM AgentImpl a LEFT JOIN a.properties p WHERE p.propertyName LIKE %?1% AND p.propertyValue LIKE %?2%")
	Page<AgentImpl> findByAgentProperty(String name, String value, Pageable pageable);
}
