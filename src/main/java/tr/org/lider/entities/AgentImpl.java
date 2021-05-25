package tr.org.lider.entities;

import java.io.Serializable;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.OrderBy;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.persistence.Transient;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Entity class for agent.
 * 
 */
@Entity
@Table(name = "C_AGENT")
public class AgentImpl implements Serializable{


	/**
	 * 
	 */
	private static final long serialVersionUID = -5257006869499426216L;

	@Id
	@GeneratedValue
	@Column(name = "AGENT_ID", unique = true, nullable = false)
	private Long id;

	@Column(name = "JID", nullable = false, unique = true)
	private String jid; // XMPP JID = LDAP UID

	@Column(name = "IS_DELETED")
	private Boolean deleted;

	@Column(name = "DN", nullable = false, unique = true)
	private String dn;

	@Column(name = "PASSWORD", nullable = false)
	private String password;

	@Column(name = "HOSTNAME", nullable = false)
	private String hostname;

	@Column(name = "IP_ADDRESSES", nullable = false)
	private String ipAddresses; // Comma-separated IP addresses
	
	@Column(name = "USER_DIRECTORY_DOMAIN")
	private String userDirectoryDomain; 

	@Column(name = "MAC_ADDRESSES", nullable = false)
	private String macAddresses; // Comma-separated MAC addresses

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "CREATE_DATE", nullable = false)
	@JsonFormat(pattern="dd/MM/yyyy HH:mm:ss", timezone="Europe/Istanbul")
	private Date createDate;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "MODIFY_DATE")
	@JsonFormat(pattern="dd/MM/yyyy HH:mm:ss", timezone="Europe/Istanbul")
	private Date modifyDate;
	
	@Transient
	private Boolean isOnline = false;

	@OneToMany(mappedBy = "agent", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
	private Set<AgentPropertyImpl> properties = new HashSet<AgentPropertyImpl>(0); // bidirectional

	@OneToMany(mappedBy = "agent", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = false)
	@OrderBy("createDate DESC")
	private Set<UserSessionImpl> sessions = new HashSet<UserSessionImpl>(0); // bidirectional

	public AgentImpl() {
	}

	public AgentImpl(Long id, String jid, Boolean deleted, String dn, String password, String hostname,
			String ipAddresses, String macAddresses, Date createDate, Date modifyDate, Boolean isOnline,
			Set<AgentPropertyImpl> properties, Set<UserSessionImpl> sessions) {
		super();
		this.id = id;
		this.jid = jid;
		this.deleted = deleted;
		this.dn = dn;
		this.password = password;
		this.hostname = hostname;
		this.ipAddresses = ipAddresses;
		this.macAddresses = macAddresses;
		this.createDate = createDate;
		this.modifyDate = modifyDate;
		this.isOnline = isOnline;
		this.properties = properties;
		this.sessions = sessions;
	}
	
	public AgentImpl(Long id, String jid, Boolean deleted, String dn, String password, String hostname,
			String ipAddresses, String macAddresses, Date createDate, Date modifyDate, Boolean isOnline,
			Set<AgentPropertyImpl> properties, Set<UserSessionImpl> sessions, String userDirectoryDomain) {
		super();
		this.id = id;
		this.jid = jid;
		this.deleted = deleted;
		this.dn = dn;
		this.password = password;
		this.hostname = hostname;
		this.ipAddresses = ipAddresses;
		this.macAddresses = macAddresses;
		this.createDate = createDate;
		this.modifyDate = modifyDate;
		this.isOnline = isOnline;
		this.properties = properties;
		this.sessions = sessions;
		this.userDirectoryDomain = userDirectoryDomain;
	}

	
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	
	public String getJid() {
		return jid;
	}

	public void setJid(String jid) {
		this.jid = jid;
	}

	
	public Boolean getDeleted() {
		return deleted;
	}

	public void setDeleted(Boolean deleted) {
		this.deleted = deleted;
	}

	
	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	
	public String getHostname() {
		return hostname;
	}

	public void setHostname(String hostname) {
		this.hostname = hostname;
	}

	
	public String getIpAddresses() {
		return ipAddresses;
	}

	public void setIpAddresses(String ipAddresses) {
		this.ipAddresses = ipAddresses;
	}

	
	public String getMacAddresses() {
		return macAddresses;
	}

	public void setMacAddresses(String macAddresses) {
		this.macAddresses = macAddresses;
	}

	
	public String getDn() {
		return dn;
	}

	public void setDn(String dn) {
		this.dn = dn;
	}

	
	public Date getCreateDate() {
		return createDate;
	}

	public void setCreateDate(Date createDate) {
		this.createDate = createDate;
	}

	
	public Date getModifyDate() {
		return modifyDate;
	}

	public void setModifyDate(Date modifyDate) {
		this.modifyDate = modifyDate;
	}

	
	public Boolean getIsOnline() {
		return isOnline;
	}

	public void setIsOnline(Boolean isOnline) {
		this.isOnline = isOnline;
	}

	public Set<AgentPropertyImpl> getProperties() {
		return properties;
	}

	public void setProperties(Set<AgentPropertyImpl> properties) {
		this.properties = properties;
	}

	
	public void addProperty(AgentPropertyImpl property) {
		if (properties == null) {
			properties = new HashSet<AgentPropertyImpl>(0);
		}
		
		if (property.getAgent() != this) {
			property.setAgent(this);
		}
		boolean found = false;
		for (AgentPropertyImpl tmp : properties) {
			if (tmp.equals(property)) {
				tmp.setPropertyValue(property.getPropertyValue());
				found = true;
				break;
			}
		}
		if (!found) {
			properties.add(property);
		}
	}

	
	public Set<UserSessionImpl> getSessions() {
		return sessions;
	}

	public void setSessions(Set<UserSessionImpl> sessions) {
		this.sessions = sessions;
	}

	
	public void addUserSession(UserSessionImpl userSession) {
		if (sessions == null) {
			sessions = new HashSet<UserSessionImpl>(0);
		}
		
		if (userSession.getAgent() != this) {
			userSession.setAgent(this);
		}
		sessions.add(userSession);
	}

	
	public String toJson() {
		ObjectMapper mapper = new ObjectMapper();
		try {
			return mapper.writeValueAsString(this);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}

	
	public String toString() {
		return "AgentImpl [id=" + id + ", jid=" + jid + ", deleted=" + deleted + ", dn=" + dn + ", password=" + password
				+ ", hostname=" + hostname + ", ipAddresses=" + ipAddresses + ", macAddresses=" + macAddresses
				+ ", createDate=" + createDate + ", modifyDate=" + modifyDate + ", properties=" + properties
				+ ", sessions=" + sessions + "]";
	}

	public String getUserDirectoryDomain() {
		return userDirectoryDomain;
	}

	public void setUserDirectoryDomain(String userDirectoryDomain) {
		this.userDirectoryDomain = userDirectoryDomain;
	}

}
