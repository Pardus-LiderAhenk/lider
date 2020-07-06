package tr.org.lider.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import tr.org.lider.entities.AgentImpl;
import tr.org.lider.messaging.messages.XMPPClientImpl;
import tr.org.lider.repositories.AgentRepository;

@Service
public class AgentService {

	@Autowired
	AgentRepository agentRepository;
	
	@Autowired
	private XMPPClientImpl messagingService;
	public List<AgentImpl> findAll() {
        return agentRepository.findAll();
	}
	
	public Optional<AgentImpl> findAgentByID(Long agentID) {
        return agentRepository.findById(agentID);
	}
	
	public List<AgentImpl> findAgentByJid(String agentJid) {
        return agentRepository.findByJid(agentJid);
	}
	
	public List<AgentImpl> findAgentByDn(String agentDn) {
        return agentRepository.findByDn(agentDn);
	}
	
	public AgentImpl updateUserDirectoryAgentByJid(String jid, String userDirectoryDomain) {
		List<AgentImpl> existAgent = agentRepository.findByJid(jid);
		if(existAgent != null && existAgent.size() > 0) {
			existAgent.get(0).setUserDirectoryDomain(userDirectoryDomain);
			return agentRepository.save(existAgent.get(0));
		} else {
			return null;
		}
	}
	
	public Page<AgentImpl> findAllFiltered(int pageNumber, int pageSize, String status, Optional<String> field, Optional<String> text) {
        
		PageRequest pageable = PageRequest.of(pageNumber - 1, pageSize);
		Page<AgentImpl> agents = null;
		
		List<String> listOfOnlineUsers = messagingService.getOnlineUsers();
		List<String> listOfOfflineUsers = messagingService.getOfflineUsers();
		
		if(field.isPresent() && text.isPresent()) {
			if(field.get().equals("jid")) {
				if(status.equals("all")) {
					agents = agentRepository.findByJidContaining(text.get(), pageable);
				} else if(status.equals("online")) {
					agents = agentRepository.findByJidContainingAndJidIn(text.get(), listOfOnlineUsers, pageable);
				} else if(status.equals("offline")) {
					agents = agentRepository.findByJidContainingAndJidIn(text.get(), listOfOfflineUsers, pageable);
				}
			} else if(field.get().equals("hostname")) {
				if(status.equals("all")) {
					agents = agentRepository.findByHostnameContaining(text.get(), pageable);
				} else if(status.equals("online")) {
					agents = agentRepository.findByHostnameContainingAndJidIn(text.get(), listOfOnlineUsers, pageable);
				} else if(status.equals("offline")) {
					agents = agentRepository.findByHostnameContainingAndJidIn(text.get(), listOfOfflineUsers, pageable);
				}
			} else if(field.get().equals("ipAddresses")) {
				if(status.equals("all")) {
					agents = agentRepository.findByIpAddressesContaining(text.get(), pageable);
				} else if(status.equals("online")) {
					agents = agentRepository.findByIpAddressesContainingAndJidIn(text.get(), listOfOnlineUsers, pageable);
				} else if(status.equals("offline")) {
					agents = agentRepository.findByIpAddressesContainingAndJidIn(text.get(), listOfOfflineUsers, pageable);
				}
			} else if(field.get().equals("macAddresses")) {
				if(status.equals("all")) {
					agents = agentRepository.findByMacAddressesContaining(text.get(), pageable);
				} else if(status.equals("online")) {
					agents = agentRepository.findByMacAddressesContainingAndJidIn(text.get(), listOfOnlineUsers, pageable);
				} else if(status.equals("offline")) {
					agents = agentRepository.findByMacAddressesContainingAndJidIn(text.get(), listOfOfflineUsers, pageable);
				}
			} else if(field.get().equals("dn")) {
				if(status.equals("all")) {
					agents = agentRepository.findByDnContaining(text.get(), pageable);
				} else if(status.equals("online")) {
					agents = agentRepository.findByDnContainingAndJidIn(text.get(), listOfOnlineUsers, pageable);
				} else if(status.equals("offline")) {
					agents = agentRepository.findByDnContainingAndJidIn(text.get(), listOfOfflineUsers, pageable);
				}
			} else {
				//if agent property will be filtered
				if(status.equals("all")) {
					agents = agentRepository.findByAgentProperty(field.get(), text.get(), pageable);
				} else if(status.equals("online")) {
					agents = agentRepository.findByAgentPropertyAndStatus(field.get(), text.get(), listOfOnlineUsers, pageable);
				} else if(status.equals("offline")) {
					agents = agentRepository.findByAgentPropertyAndStatus(field.get(), text.get(), listOfOfflineUsers, pageable);
				}
			}
		} else {
			
			if(status.equals("all")) {
				agents = agentRepository.findAll(pageable);
			} else if(status.equals("online")) {
				agents = agentRepository.findAllByJidIn(listOfOnlineUsers, pageable);
			} else if(status.equals("offline")) {
				agents = agentRepository.findAllByJidIn(listOfOfflineUsers, pageable);
			}
		}
		
        if (pageNumber > agents.getTotalPages()) {
            return null;
        }
		for (int i = 0; i < agents.getContent().size(); i++) {
			if(messagingService.isRecipientOnline(agents.getContent().get(i).getJid())) {
				agents.getContent().get(i).setIsOnline(true);
			}
			else {
				agents.getContent().get(i).setIsOnline(false);
			}
		}
        return agents;
	}
}
