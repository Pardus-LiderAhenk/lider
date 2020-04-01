package tr.org.lider.models;

import java.util.Date;

import tr.org.lider.entities.AgentImpl;
import tr.org.lider.entities.SessionEvent;

public class UserSessionsModel {
	
	private Long id;
	private AgentImpl agent; 
	private String username;
	private String userIp;
	private Integer sessionEvent;
	private Date createDate;
	
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public AgentImpl getAgent() {
		return agent;
	}
	public void setAgent(AgentImpl agent) {
		this.agent = agent;
	}
	public String getUsername() {
		return username;
	}
	public void setUsername(String username) {
		this.username = username;
	}
	public String getUserIp() {
		return userIp;
	}
	public void setUserIp(String userIp) {
		this.userIp = userIp;
	}
	public SessionEvent getSessionEvent() {
		return SessionEvent.getType(sessionEvent);
	}

	public void setSessionEvent(SessionEvent sessionEvent) {
		if (sessionEvent == null) {
			this.sessionEvent = null;
		} else {
			this.sessionEvent = sessionEvent.getId();
		}
	}
	public Date getCreateDate() {
		return createDate;
	}
	public void setCreateDate(Date createDate) {
		this.createDate = createDate;
	}



}
