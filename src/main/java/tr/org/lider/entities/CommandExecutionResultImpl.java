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

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.Lob;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.persistence.Transient;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;

import tr.org.lider.messaging.enums.ContentType;
import tr.org.lider.messaging.enums.StatusCode;


/**
 * Entity class for execution result.
 * 
 */
@JsonIgnoreProperties({ "commandExecution" })
@Entity
@Table(name = "C_COMMAND_EXECUTION_RESULT")
public class CommandExecutionResultImpl {

	private static final long serialVersionUID = -8995839892973401085L;

	@Id
	@GeneratedValue
	@Column(name = "COMMAND_EXECUTION_RESULT_ID", unique = true, nullable = false)
	private Long id;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "COMMAND_EXECUTION_ID", nullable = false)
	private CommandExecutionImpl commandExecution; // bidirectional

	@Column(name = "AGENT_ID")
	private Long agentId;

	@Column(name = "RESPONSE_CODE", nullable = false, length = 3)
	private Integer responseCode;

	@Lob
	@Column(name = "RESPONSE_MESSAGE")
	private String responseMessage;

	/**
	 * Response data can be anything (JSON data, alphanumeric value, file such
	 * as JPEG, doc etc.)
	 */
	@Lob
	@Column(name = "RESPONSE_DATA", length = 4 * 1024 * 1024 * 1024)
	private byte[] responseData;

	@Column(name = "CONTENT_TYPE", length = 3)
	private Integer contentType;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "CREATE_DATE", nullable = false)
	@JsonFormat(pattern="dd/MM/yyyy HH:mm:ss", timezone="Europe/Istanbul")
	private Date createDate;

	@Column(name = "MAIL_SUBJECT", length = 1000)
	private String mailSubject;

	@Column(name = "MAIL_CONTENT", columnDefinition = "TEXT", length = 65535)
	private String mailContent;
	
	@Transient
	private String responseDataStr;

	

	public CommandExecutionResultImpl() {
	}

	public CommandExecutionResultImpl(Long id, CommandExecutionImpl commandExecution, Long agentId,
			StatusCode responseCode, String responseMessage, byte[] responseData, ContentType contentType,
			Date createDate, String mailSubject, String mailContent) {
		super();
		this.id = id;
		this.commandExecution = commandExecution;
		this.agentId = agentId;
		setResponseCode(responseCode);
		this.responseMessage = responseMessage;
		this.responseData = responseData;
		setContentType(contentType);
		this.createDate = createDate;
		this.mailSubject = mailSubject;
		this.mailContent = mailContent;
	}

//	public CommandExecutionResultImpl(ICommandExecutionResult commandExecutionResult) {
//		this.id = commandExecutionResult.getId();
//		this.agentId = commandExecutionResult.getAgentId();
//		setResponseCode(commandExecutionResult.getResponseCode());
//		this.responseMessage = commandExecutionResult.getResponseMessage();
//		this.responseData = commandExecutionResult.getResponseData();
//		setContentType(commandExecutionResult.getContentType());
//		this.createDate = commandExecutionResult.getCreateDate();
//		if (commandExecutionResult.getCommandExecution() instanceof CommandExecutionImpl) {
//			this.commandExecution = (CommandExecutionImpl) commandExecutionResult.getCommandExecution();
//		}
//		this.mailContent = commandExecutionResult.getMailContent();
//		this.mailSubject = commandExecutionResult.getMailSubject();
//	}

	
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	
	public CommandExecutionImpl getCommandExecution() {
		return commandExecution;
	}

	public void setCommandExecution(CommandExecutionImpl commandExecution) {
		this.commandExecution = commandExecution;
	}

	
	public StatusCode getResponseCode() {
		return StatusCode.getType(responseCode);
	}

	public void setResponseCode(StatusCode responseCode) {
		if (responseCode == null) {
			this.responseCode = null;
		} else {
			this.responseCode = responseCode.getId();
		}
	}

	
	public Long getAgentId() {
		return agentId;
	}

	public void setAgentId(Long agentId) {
		this.agentId = agentId;
	}

	
	public String getResponseMessage() {
		return responseMessage;
	}

	public void setResponseMessage(String responseMessage) {
		this.responseMessage = responseMessage;
	}

	
	public byte[] getResponseData() {
		return responseData;
	}

	public void setResponseData(byte[] responseData) {
		this.responseData = responseData;
	}

	
	public ContentType getContentType() {
		return ContentType.getType(contentType);
	}

	public void setContentType(ContentType contentType) {
		if (contentType == null) {
			this.contentType = null;
		} else {
			this.contentType = contentType.getId();
		}
	}

	
	public Date getCreateDate() {
		return createDate;
	}

	public void setCreateDate(Date createDate) {
		this.createDate = createDate;
	}

	
	public String getMailSubject() {
		return mailSubject;
	}

	public void setMailSubject(String mailSubject) {
		this.mailSubject = mailSubject;
	}

	
	public String getMailContent() {
		return mailContent;
	}

	public void setMailContent(String mailContent) {
		this.mailContent = mailContent;
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
		return "CommandExecutionResultImpl [id=" + id + ", agentId=" + agentId + ", responseCode=" + responseCode
				+ ", responseMessage=" + responseMessage + ", contentType=" + contentType + ", createDate=" + createDate
				+ ", mailSubject=" + mailSubject + ", mailContent=" + mailContent + "]";
	}
	
	public String getResponseDataStr() {
		return responseDataStr;
	}

	public void setResponseDataStr(String responseDataStr) {
		this.responseDataStr = responseDataStr;
	}

}
