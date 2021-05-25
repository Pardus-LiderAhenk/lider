package tr.org.lider.models;

import java.util.Date;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import tr.org.lider.ldap.DNType;
import tr.org.lider.ldap.LdapEntry;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PolicyExecutionRequestImpl {

	private static final long serialVersionUID = -4023348875434687232L;

	private Long id;

	private List<String> dnList;

	private DNType dnType;

	private Date activationDate;

	private Date expirationDate;

	private Date timestamp;
	
	private List<LdapEntry> entryList;

	public PolicyExecutionRequestImpl() {
	}

	public PolicyExecutionRequestImpl(Long id, List<String> dnList, DNType dnType, Date activationDate,
			Date expirationDate, Date timestamp) {
		super();
		this.id = id;
		this.dnList = dnList;
		this.dnType = dnType;
		this.activationDate = activationDate;
		this.expirationDate = expirationDate;
		this.timestamp = timestamp;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public List<String> getDnList() {
		return dnList;
	}

	public void setDnList(List<String> dnList) {
		this.dnList = dnList;
	}

	public DNType getDnType() {
		return dnType;
	}

	public void setDnType(DNType dnType) {
		this.dnType = dnType;
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

	
	public Date getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(Date timestamp) {
		this.timestamp = timestamp;
	}

	public List<LdapEntry> getEntryList() {
		return entryList;
	}

	public void setEntryList(List<LdapEntry> entryList) {
		this.entryList = entryList;
	}

}
