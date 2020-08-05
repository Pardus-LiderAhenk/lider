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

import java.io.IOException;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.Lob;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.persistence.Transient;
import javax.persistence.UniqueConstraint;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.core.JsonGenerationException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import tr.org.lider.ldap.DNType;



/**
 * Entity class for command.
 */
@Entity
@Table(name = "C_COMMAND", uniqueConstraints = @UniqueConstraint(columnNames = { "POLICY_ID", "TASK_ID" }))
public class CommandImpl implements Serializable{

	private static final long serialVersionUID = 4548613741066158807L;

	@Id
	@GeneratedValue
	@Column(name = "COMMAND_ID", unique = true, nullable = false)
	private Long id;

	// FIXME these should be FetchType.LAZY but current version of OpenJPA does
	// not retrieve the records on access.
	@OneToOne(optional = true, fetch = FetchType.EAGER)
	@JoinColumn(name = "POLICY_ID", referencedColumnName = "POLICY_ID", insertable = true, updatable = false, nullable = true, unique = false)
	private PolicyImpl policy;

	// FIXME these should be FetchType.LAZY but current version of OpenJPA does
	// not retrieve the records on access.
	@OneToOne(optional = true, fetch = FetchType.EAGER)
	@JoinColumn(name = "TASK_ID", referencedColumnName = "TASK_ID", insertable = true, updatable = false, nullable = true, unique = false)
	private TaskImpl task;

	@Lob
	@Column(name = "DN_LIST")
	private String dnListJsonString;

	@Column(name = "DN_TYPE", length = 1)
	private Integer dnType;

	@Lob
	@Column(name = "UID_LIST")
	private String uidListJsonString;

	@Column(name = "COMMAND_OWNER_UID")
	private String commandOwnerUid;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "ACTIVATION_DATE", nullable = true)
	@JsonFormat(pattern="dd/MM/yyyy HH:mm:ss", timezone="Europe/Istanbul")
	private Date activationDate;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "EXPIRATION_DATE", nullable = true)
	@JsonFormat(pattern="dd/MM/yyyy HH:mm:ss", timezone="Europe/Istanbul")
	private Date expirationDate;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "CREATE_DATE", nullable = false)
	@JsonFormat(pattern="dd/MM/yyyy HH:mm:ss", timezone="Europe/Istanbul")
	private Date createDate;

	@OneToMany(mappedBy = "command", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = false)
	private List<CommandExecutionImpl> commandExecutions = new ArrayList<CommandExecutionImpl>(); // bidirectional

	@Column(name = "SENT_MAIL")
	private boolean sentMail = false;

	
	@Column(name = "MAIL_THREADING_ACTIVE")
	private boolean mailThreadingActive = false;
	
	@Column(name = "DELETED")
	private boolean deleted = false;
	
	
	
	public CommandImpl() {
	}

	public CommandImpl(Long id, PolicyImpl policy, TaskImpl task, List<String> dnList, DNType dnType, List<String> uidList,
			String commandOwnerUid, Date activationDate, Date expirationDate, Date createDate,
			List<CommandExecutionImpl> commandExecutions, boolean sentMail, boolean deleted)
			throws JsonGenerationException, JsonMappingException, IOException {
		this.id = id;
		this.policy = policy;
		this.task =  task;
		ObjectMapper mapper = new ObjectMapper();
		this.dnListJsonString = mapper.writeValueAsString(dnList);
		setDnType(dnType);
		this.uidListJsonString = uidList != null ? mapper.writeValueAsString(uidList) : null;
		this.commandOwnerUid = commandOwnerUid;
		this.activationDate = activationDate;
		this.expirationDate = expirationDate;
		this.createDate = createDate;
		this.commandExecutions = commandExecutions;
		this.sentMail = sentMail;
		this.deleted = deleted;
	}

//	public CommandImpl(ICommand command) throws JsonGenerationException, JsonMappingException, IOException {
//		this.id = command.getId();
//		this.policy = (PolicyImpl) command.getPolicy();
//		this.task = (TaskImpl) command.getTask();
//		ObjectMapper mapper = new ObjectMapper();
//		this.dnListJsonString = mapper.writeValueAsString(command.getDnList());
//		setDnType(command.getDnType());
//		this.uidListJsonString = command.getUidList() != null ? mapper.writeValueAsString(command.getUidList()) : null;
//		this.commandOwnerUid = command.getCommandOwnerUid();
//		this.activationDate = command.getActivationDate();
//		this.expirationDate = command.getExpirationDate();
//		this.createDate = command.getCreateDate();
//		this.sentMail = command.isSentMail();
//		this.mailThreadingActive=command.isMailThreadingActive();
//
//		// Convert ICommandExecution to CommandExecutionImpl
//		List<? extends ICommandExecution> tmpCommandExecutions = command.getCommandExecutions();
//		if (tmpCommandExecutions != null) {
//			for (ICommandExecution commandExecution : tmpCommandExecutions) {
//				addCommandExecution(commandExecution);
//			}
//		}
//
//	}

	
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	
	public PolicyImpl getPolicy() {
		return policy;
	}

	public void setPolicy(PolicyImpl policy) {
		this.policy = policy;
	}

	
	public TaskImpl getTask() {
		return task;
	}

	public void setTask(TaskImpl task) {
		this.task = task;
	}

	public String getDnListJsonString() {
		return dnListJsonString;
	}

	@Transient
	
	public List<String> getDnList() {
		try {
			ObjectMapper mapper = new ObjectMapper();
			if(dnListJsonString != null && !dnListJsonString.equals("")) {
				return mapper.readValue(dnListJsonString, new TypeReference<ArrayList<String>>() {
				});
			}
			else {
				return null;
			}
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}

	public void setDnListJsonString(String dnListJsonString) {
		this.dnListJsonString = dnListJsonString;
	}

	
	public DNType getDnType() {
		return DNType.getType(dnType);
	}

	public void setDnType(DNType dnType) {
		if (dnType == null) {
			this.dnType = null;
		} else {
			this.dnType = dnType.getId();
		}
	}

	@SuppressWarnings("unchecked")
	@Transient
	
	public List<String> getUidList() {
		try {
			ObjectMapper mapper = new ObjectMapper();
			return (List<String>) (uidListJsonString != null
					? mapper.readValue(uidListJsonString, new TypeReference<ArrayList<String>>() {
					}) : null);
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}

	public void setUidListJsonString(String uidListJsonString) {
		this.uidListJsonString = uidListJsonString;
	}

	
	public String getCommandOwnerUid() {
		return commandOwnerUid;
	}

	public void setCommandOwnerUid(String commandOwnerUid) {
		this.commandOwnerUid = commandOwnerUid;
	}

	
	public Date getCreateDate() {
		return createDate;
	}

	public void setCreateDate(Date createDate) {
		this.createDate = createDate;
	}

	
	public Date getActivationDate() {
		return activationDate;
	}

	public void setActivationDate(Date activationDate) {
		this.activationDate = activationDate;
	}

	
	public Date getExpirationDate() {
		return expirationDate;
	}

	public void setExpirationDate(Date expirationDate) {
		this.expirationDate = expirationDate;
	}

	
	public List<CommandExecutionImpl> getCommandExecutions() {
		return commandExecutions;
	}

	public void setCommandExecutions(List<CommandExecutionImpl> commandExecutions) {
		this.commandExecutions = commandExecutions;
	}

	
	public boolean isSentMail() {
		return sentMail;
	}

	public void setSentMail(boolean sentMail) {
		this.sentMail = sentMail;
	}
	
	public boolean isDeleted() {
		return deleted;
	}

	public void setDeleted(boolean deleted) {
		this.deleted = deleted;
	}

	
	public void addCommandExecution(CommandExecutionImpl commandExecutionImpl) {
		if (commandExecutions == null) {
			commandExecutions = new ArrayList<CommandExecutionImpl>();
		}
		
		if (commandExecutionImpl.getCommand() != this) {
			commandExecutionImpl.setCommand(this);
		}
		commandExecutions.add(commandExecutionImpl);
	}

	
	public String toString() {
		return "CommandImpl [id=" + id + ", dnListJsonString=" + dnListJsonString + ", dnType=" + dnType
				+ ", uidListJsonString=" + uidListJsonString + ", commandOwnerUid=" + commandOwnerUid
				+ ", activationDate=" + activationDate + ", expirationDate=" + expirationDate + ", createDate="
				+ createDate + ", commandExecutions=" + commandExecutions + ", sentMail=" + sentMail + "]";
	}

	
	public boolean isMailThreadingActive() {
		return mailThreadingActive;
	}

	
	public void setMailThreadingActive(boolean mailThreadingActive) {
		this.mailThreadingActive=mailThreadingActive;
		
	}


}
