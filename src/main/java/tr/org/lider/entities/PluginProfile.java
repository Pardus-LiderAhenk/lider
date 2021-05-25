package tr.org.lider.entities;

import java.io.Serializable;
import java.util.Date;
import java.util.List;
import java.util.Map;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

import tr.org.lider.ldap.DNType;
import tr.org.lider.ldap.LdapEntry;

@Entity
@Table(name = "c_plugin_profile")
public class PluginProfile implements Serializable {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(name = "id", unique = true, nullable = false)
	private Long id;
	
	@Column(name = "name")
	private String name;

	@Column(name = "page")
	private String page;
	
	@Column(name = "description")
	private String description;
	
	@Column(name = "commandId")
	private String commandId;
	
	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "plugin_id", nullable = false)
	private PluginImpl plugin; // unidirectional
	
	@Column(name = "state")
	private int state;
	
	@Transient
	private DNType dnType;
	
	@Transient
	private List<String> dnList;
	
	
	@Transient
	private List<LdapEntry> entryList;
	
	
	@Transient
	private String cronExpression;
	
	
	@Transient
	private Map<String, Object> parameterMap;
	
	@Transient
	private Date activationDate;

	public PluginProfile() {
	}
	
	public PluginProfile(String name, String page, String description, String command_id, PluginImpl plugin,
			Integer state) {
		// TODO Auto-generated constructor stub
		this.name = name;
		this.page = page;
		this.description = description;
		this.commandId = command_id;
		this.plugin = plugin;
		this.state = state;
	}

	public Long getId() {
		return id;
	}

	public String getPage() {
		return page;
	}

	public void setPage(String page) {
		this.page = page;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public PluginImpl getPlugin() {
		return plugin;
	}

	public void setPlugin(PluginImpl plugin) {
		this.plugin = plugin;
	}

	public int getState() {
		return state;
	}

	public void setState(int state) {
		this.state = state;
	}
	
	@Override
	public String toString() {
		try {
	        return new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(this);
	    } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
	        e.printStackTrace();
	    }
	    return null;
	}

	public Map<String, Object> getParameterMap() {
		return parameterMap;
	}

	public void setParameterMap(Map<String, Object> parameterMap) {
		this.parameterMap = parameterMap;
	}
	
	public String getCommandId() {
		return commandId;
	}

	public void setCommandId(String commandId) {
		this.commandId = commandId;
	}

	public DNType getDnType() {
		return dnType;
	}

	public void setDnType(DNType dnType) {
		this.dnType = dnType;
	}

	public List<String> getDnList() {
		return dnList;
	}

	public void setDnList(List<String> dnList) {
		this.dnList = dnList;
	}

	public String getCronExpression() {
		return cronExpression;
	}

	public void setCronExpression(String cronExpression) {
		this.cronExpression = cronExpression;
	}

	public List<LdapEntry> getEntryList() {
		return entryList;
	}

	public void setEntryList(List<LdapEntry> entryList) {
		this.entryList = entryList;
	}

	public Date getActivationDate() {
		return activationDate;
	}

	public void setActivationDate(Date activationDate) {
		this.activationDate = activationDate;
	}
	
}
