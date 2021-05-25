/*
*
*    Copyright © 2015-2016 Tübitak ULAKBIM
*
*    This file is part of Lider Ahenk.
*
*    Lider Ahenk is free software: you can redistribute it and/or modify
*    it under the terms of the GNU General Public License as published by
*    the Free Software Foundation, either version 3 of the License, or
*    (at your option) any later version.
*
*    Lider Ahenk is distributed in the hope that it will be useful,
*    but WITHOUT ANY WARRANTY; without even the implied warranty of
*    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*    GNU General Public License for more details.
*
*    You should have received a copy of the GNU General Public License
*    along with Lider Ahenk.  If not, see <http://www.gnu.org/licenses/>.
*/
package tr.org.lider.entities;

import java.io.Serializable;
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

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;



/**
 * Entity class for agent properties.
 * 
 */
@JsonIgnoreProperties({ "agent" })
@Entity
@Table(name = "C_AGENT_PROPERTY", uniqueConstraints = @UniqueConstraint(columnNames = { "AGENT_ID", "PROPERTY_NAME" }))
public class AgentPropertyImpl implements Serializable{


	/**
	 * 
	 */
	private static final long serialVersionUID = -4183884602081789146L;

	@Id
	@GeneratedValue
	@Column(name = "AGENT_PROPERTY_ID", unique = true, nullable = false)
	private Long id;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "AGENT_ID", nullable = false)
	private AgentImpl agent; // bidirectional

	@Column(name = "PROPERTY_NAME", nullable = false)
	private String propertyName;

	@Column(name = "PROPERTY_VALUE", columnDefinition = "TEXT", nullable = false, length = 65535)
	private String propertyValue;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "CREATE_DATE", nullable = false)
	@JsonFormat(pattern="dd/MM/yyyy HH:mm:ss", timezone="Europe/Istanbul")
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

	
	public String getPropertyName() {
		return propertyName;
	}

	public void setPropertyName(String propertyName) {
		this.propertyName = propertyName;
	}

	
	public String getPropertyValue() {
		return propertyValue;
	}

	public void setPropertyValue(String propertyValue) {
		this.propertyValue = propertyValue;
	}

	
	public Date getCreateDate() {
		return createDate;
	}

	public void setCreateDate(Date createDate) {
		this.createDate = createDate;
	}

	
	public String toString() {
		return "AgentPropertyImpl [id=" + id + ", propertyName=" + propertyName + ", propertyValue=" + propertyValue
				+ ", createDate=" + createDate + "]";
	}

	/**
	 * hashCode() & equals() are overridden to prevent duplicate records!
	 */
	
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((propertyName == null) ? 0 : propertyName.hashCode());
		return result;
	}

	/**
	 * hashCode() & equals() are overridden to prevent duplicate records!
	 */
	
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
