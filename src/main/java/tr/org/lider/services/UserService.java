package tr.org.lider.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tr.org.lider.entities.UserSessionImpl;
import tr.org.lider.repositories.AgentUserSessionRepository;

@Service
public class UserService {
	
	@Autowired
	private AgentUserSessionRepository agentUserSessionRepository;
	

	public List<UserSessionImpl> getUserSessions(String userName) {
		return agentUserSessionRepository.findByUsername(userName);
	}
}
