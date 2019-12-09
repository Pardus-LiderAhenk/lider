package tr.org.lider.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import tr.org.lider.entities.AgentImpl;
import tr.org.lider.repositories.AgentRepository;

@Service
public class AgentService {

	@Autowired
	AgentRepository agentRepository;
	
	public Page<AgentImpl> findAll(int pageNumber, int size) {
		PageRequest pageable = PageRequest.of(pageNumber - 1, size);
        Page<AgentImpl> resultPage = agentRepository.findAll(pageable);
        if (pageNumber > resultPage.getTotalPages()) {
            return null;
        }
        return resultPage;
	}
	
	public Page<AgentImpl> findByJID(int pageNumber, int size, String JID) {
		PageRequest pageable = PageRequest.of(pageNumber - 1, size);
        Page<AgentImpl> resultPage = agentRepository.findByJidContaining(JID, pageable);
        if (pageNumber > resultPage.getTotalPages()) {
            return null;
        }
        return resultPage;
	}

	public Page<AgentImpl> findByDN(int pageNumber, int size, String DN) {
		PageRequest pageable = PageRequest.of(pageNumber - 1, size);
        Page<AgentImpl> resultPage = agentRepository.findByDnContaining(DN, pageable);
        if (pageNumber > resultPage.getTotalPages()) {
            return null;
        }
        return resultPage;
	}
	
	public Page<AgentImpl> findByHostname(int pageNumber, int size, String hostname) {
		PageRequest pageable = PageRequest.of(pageNumber - 1, size);
        Page<AgentImpl> resultPage = agentRepository.findByHostnameContaining(hostname, pageable);
        if (pageNumber > resultPage.getTotalPages()) {
            return null;
        }
        return resultPage;
	}
	
	public Page<AgentImpl> findByIpAddresses(int pageNumber, int size, String ipAddresses) {
		PageRequest pageable = PageRequest.of(pageNumber - 1, size);
        Page<AgentImpl> resultPage = agentRepository.findByIpAddressesContaining(ipAddresses, pageable);
        if (pageNumber > resultPage.getTotalPages()) {
            return null;
        }
        return resultPage;
	}
	
	public Page<AgentImpl> findByMacAddresses(int pageNumber, int size, String macAddresses) {
		PageRequest pageable = PageRequest.of(pageNumber - 1, size);
        Page<AgentImpl> resultPage = agentRepository.findByMacAddressesContaining(macAddresses, pageable);
        if (pageNumber > resultPage.getTotalPages()) {
            return null;
        }
        return resultPage;
	}
	
	public Page<AgentImpl> findByAgentProperty(int pageNumber, int size, String name, String value) {
        
		PageRequest pageable = PageRequest.of(pageNumber - 1, size);
        Page<AgentImpl> resultPage = agentRepository.findByAgentProperty(name, value, pageable);
        if (pageNumber > resultPage.getTotalPages()) {
            return null;
        }
        return resultPage;
	}
	
	public List<AgentImpl> findAll() {
        return agentRepository.findAll();
	}
	
	public Optional<AgentImpl> findAgentByID(Long agentID) {
        return agentRepository.findById(agentID);
	}
	
}
