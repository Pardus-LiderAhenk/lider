package tr.org.lider.repositories;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;

import tr.org.lider.entities.AgentImpl;



public interface AgentRepository extends BaseJpaRepository<AgentImpl, Long>{

	List<AgentImpl> findByJid(String jid);
	
	List<AgentImpl> findByDn(String dn);
	
	Page<AgentImpl> findAllByJidIn(List<String> jidList, Pageable pageable);
	
	Page<AgentImpl> findByJidContaining(String jid, Pageable pageable);
	Page<AgentImpl> findByJidContainingAndJidIn(String jid, List<String> jidList, Pageable pageable);
	
	Page<AgentImpl> findByDnContaining(String dn, Pageable pageable);
	Page<AgentImpl> findByDnContainingAndJidIn(String dn, List<String> jidList, Pageable pageable);
	
	Page<AgentImpl> findByHostnameContaining(String hostname, Pageable pageable);
	Page<AgentImpl> findByHostnameContainingAndJidIn(String hostname, List<String> jidList, Pageable pageable);
	
	Page<AgentImpl> findByIpAddressesContaining(String ipAddresses, Pageable pageable);
	Page<AgentImpl> findByIpAddressesContainingAndJidIn(String ipAddresses, List<String> jidList, Pageable pageable);
	
	Page<AgentImpl> findByMacAddressesContaining(String macAddresses, Pageable pageable);
	Page<AgentImpl> findByMacAddressesContainingAndJidIn(String macAddresses, List<String> jidList, Pageable pageable);
	
	@Query(value = "SELECT a FROM AgentImpl a LEFT JOIN a.properties p WHERE p.propertyName LIKE %?1% AND p.propertyValue LIKE %?2%")
	Page<AgentImpl> findByAgentProperty(String name, String value, Pageable pageable);
	
	@Query(value = "SELECT a FROM AgentImpl a LEFT JOIN a.properties p WHERE p.propertyName LIKE %?1% AND p.propertyValue LIKE %?2% AND a.jid in ?3")
	Page<AgentImpl> findByAgentPropertyAndStatus(String name, String value, List<String> jidList, Pageable pageable);
	
	@Query(value = "SELECT a FROM AgentImpl a LEFT JOIN a.sessions s WHERE s.username = ?1")
	List<AgentImpl> findBySessionUsername(String username);
}

