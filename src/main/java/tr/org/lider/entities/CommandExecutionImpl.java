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
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.OrderBy;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;

import tr.org.lider.ldap.DNType;


/**
 * Entity class for command execution.
 * 
 * @author <a href="mailto:emre.akkaya@agem.com.tr">Emre Kağan Akkaya</a>
 * @see tr.org.liderahenk.lider.core.api.persistence.entities.ICommandExecution
 *
 */
@JsonIgnoreProperties({ "command" })
@Entity
@Table(name = "C_COMMAND_EXECUTION")
public class CommandExecutionImpl implements Serializable {


	/**
	 * 
	 */
	private static final long serialVersionUID = 6762422648814400663L;

	@Id
	@GeneratedValue
	@Column(name = "COMMAND_EXECUTION_ID", unique = true, nullable = false)
	private Long id;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "COMMAND_ID", nullable = false)
	private CommandImpl command; // bidirectional

	@Column(name = "UID")
	private String uid; // This may be null if C_COMMAND record belongs to a
						// policy of an Organizational Unit or User Group.

	@Column(name = "DN_TYPE", length = 1)
	private Integer dnType;

	@Column(name = "DN",columnDefinition = "TEXT", length = 1000)
	private String dn;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "CREATE_DATE", nullable = false)
	@JsonFormat(pattern="dd/MM/yyyy HH:mm:ss", timezone="Europe/Istanbul")
	private Date createDate;

	@OneToMany(mappedBy = "commandExecution", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = false)
	@OrderBy("createDate DESC")
	private List<CommandExecutionResultImpl> commandExecutionResults = new ArrayList<CommandExecutionResultImpl>(); // bidirectional

	@Column(name = "ONLINE")
	private boolean online; // True if the agent is online during the task
							// execution, false otherwise

	public CommandExecutionImpl() {
	}

	public CommandExecutionImpl(Long id, CommandImpl command, String uid, DNType dnType, String dn, Date createDate,
			List<CommandExecutionResultImpl> commandExecutionResults, boolean online) {
		this.id = id;
		this.command = command;
		this.uid = uid;
		setDnType(dnType);
		this.dn = dn;
		this.createDate = createDate;
		this.commandExecutionResults = commandExecutionResults;
		this.online = online;
	}

//	public CommandExecutionImpl(ICommandExecution commandExecution) {
//		this.id = commandExecution.getId();
//		this.uid = commandExecution.getUid();
//		setDnType(commandExecution.getDnType());
//		this.dn = commandExecution.getDn();
//		this.createDate = commandExecution.getCreateDate();
//		this.online = commandExecution.isOnline();
//
//		// Convert ICommandExecutionResult to CommandExecutionResultImpl
//		List<? extends ICommandExecutionResult> tmpCommandExecutionResults = commandExecution
//				.getCommandExecutionResults();
//		if (tmpCommandExecutionResults != null) {
//			for (ICommandExecutionResult tmpCommandExecutionResult : tmpCommandExecutionResults) {
//				addCommandExecutionResult(tmpCommandExecutionResult);
//			}
//		}
//
//		if (commandExecution.getCommand() instanceof CommandImpl) {
//			this.command = (CommandImpl) commandExecution.getCommand();
//		}
//	}


	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}


	public CommandImpl getCommand() {
		return command;
	}

	public void setCommand(CommandImpl command) {
		this.command = command;
	}


	public String getUid() {
		return uid;
	}

	public void setUid(String uid) {
		this.uid = uid;
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


	public String getDn() {
		return dn;
	}

	public void setDn(String dn) {
		this.dn = dn;
	}


	public List<CommandExecutionResultImpl> getCommandExecutionResults() {
		return commandExecutionResults;
	}

	public void setCommandExecutionResults(List<CommandExecutionResultImpl> commandExecutionResults) {
		this.commandExecutionResults = commandExecutionResults;
	}


	public void addCommandExecutionResult(CommandExecutionResultImpl commandExecutionResult) {
		if (commandExecutionResults == null) {
			commandExecutionResults = new ArrayList<CommandExecutionResultImpl>();
		}
		
		if (commandExecutionResult.getCommandExecution() != this) {
			commandExecutionResult.setCommandExecution(this);
		}
		commandExecutionResults.add(commandExecutionResult);
	}


	public Date getCreateDate() {
		return createDate;
	}

	public void setCreateDate(Date createDate) {
		this.createDate = createDate;
	}


	public boolean isOnline() {
		return online;
	}

	public void setOnline(boolean online) {
		this.online = online;
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
		return "CommandExecutionImpl [id=" + id + ", uid=" + uid + ", dnType=" + dnType + ", dn=" + dn + ", createDate="
				+ createDate + ", commandExecutionResults=" + commandExecutionResults + ", online=" + online + "]";
	}

}
