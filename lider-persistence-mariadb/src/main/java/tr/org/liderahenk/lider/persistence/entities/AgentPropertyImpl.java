package tr.org.liderahenk.lider.persistence.entities;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.persistence.UniqueConstraint;

import org.codehaus.jackson.annotate.JsonIgnoreProperties;

import tr.org.liderahenk.lider.core.api.persistence.entities.IAgentProperty;

/**
 * Entity class for agent properties.
 * 
 * @author <a href="mailto:emre.akkaya@agem.com.tr">Emre Kağan Akkaya</a>
 * @see tr.org.liderahenk.lider.core.api.persistence.entities.IAgentProperty
 *
 */
@JsonIgnoreProperties({ "agent" })
@Entity
@Table(name = "C_AGENT_PROPERTY", uniqueConstraints = @UniqueConstraint(columnNames = { "AGENT_ID", "PROPERTY_NAME",
		"PROPERTY_VALUE" }) )
public class AgentPropertyImpl implements IAgentProperty {

	private static final long serialVersionUID = 8570595577450847524L;

	@Id
	@GeneratedValue
	@Column(name = "AGENT_PROPERTY_ID", unique = true, nullable = false)
	private Long id;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "AGENT_ID", nullable = false)
	private AgentImpl agent; // bidirectional

	@Column(name = "PROPERTY_NAME", nullable = false)
	private String propertyName;

	@Column(name = "PROPERTY_VALUE", nullable = false, length = 1500)
	private String propertyValue;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "CREATE_DATE", nullable = false)
	private Date createDate;

	public AgentPropertyImpl() {
	}

	public AgentPropertyImpl(Long id, AgentImpl agent, String propertyName, String propertyValue, Date createDate) {
		this.id = id;
		this.agent = agent;
		this.propertyName = propertyName;
		this.propertyValue = propertyValue;
		this.createDate = createDate;
	}

	public AgentPropertyImpl(IAgentProperty property) {
		this.id = property.getId();
		this.propertyName = property.getPropertyName();
		this.propertyValue = property.getPropertyValue();
		this.createDate = property.getCreateDate();
		if (property.getAgent() instanceof AgentImpl) {
			this.agent = (AgentImpl) property.getAgent();
		}
	}

	@Override
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	@Override
	public AgentImpl getAgent() {
		return agent;
	}

	public void setAgent(AgentImpl agent) {
		this.agent = agent;
	}

	@Override
	public String getPropertyName() {
		return propertyName;
	}

	public void setPropertyName(String propertyName) {
		this.propertyName = propertyName;
	}

	@Override
	public String getPropertyValue() {
		return propertyValue;
	}

	public void setPropertyValue(String propertyValue) {
		this.propertyValue = propertyValue;
	}

	@Override
	public Date getCreateDate() {
		return createDate;
	}

	public void setCreateDate(Date createDate) {
		this.createDate = createDate;
	}

	@Override
	public String toString() {
		return "AgentPropertyImpl [id=" + id + ", propertyName=" + propertyName + ", propertyValue=" + propertyValue
				+ ", createDate=" + createDate + "]";
	}

	/**
	 * hashCode() & equals() are overridden to prevent duplicate records!
	 */
	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((propertyName == null) ? 0 : propertyName.hashCode());
		return result;
	}

	/**
	 * hashCode() & equals() are overridden to prevent duplicate records!
	 */
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		AgentPropertyImpl other = (AgentPropertyImpl) obj;
		if (propertyName == null) {
			if (other.propertyName != null)
				return false;
		} else if (!propertyName.equals(other.propertyName))
			return false;
		return true;
	}

}
