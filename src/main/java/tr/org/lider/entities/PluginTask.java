package tr.org.lider.entities;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity
@Table(name = "c_plugin_task")
public class PluginTask implements Serializable {
		
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
	
	
	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "plugin_id", nullable = false)
	private PluginImpl plugin; // unidirectional
	
	@Column(name = "state")
	private int state;

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
	
	
}
