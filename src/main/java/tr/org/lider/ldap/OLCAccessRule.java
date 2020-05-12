package tr.org.lider.ldap;

/**
 * This method is model for storing OLCAccess rules
 * 
 * @author <a href="mailto:hasan.kara@pardus.org.tr">Hasan Kara</a>
 * 
 */
public class OLCAccessRule {
	private int order;
	//dn, dn.base, dn.one, dn.subtree
	private String accessDNType;
	private String accessDN;
	//dn, dn.one, group.exact
	private String assignedDNType;
	private String assignedDN;
	//read or write
	private String accessType;
	
	public OLCAccessRule() {
		super();
	}

	public int getOrder() {
		return order;
	}

	public void setOrder(int order) {
		this.order = order;
	}

	public String getAccessDNType() {
		return accessDNType;
	}

	public void setAccessDNType(String accessDNType) {
		this.accessDNType = accessDNType;
	}

	public String getAccessDN() {
		return accessDN;
	}

	public void setAccessDN(String accessDN) {
		this.accessDN = accessDN;
	}

	public String getAssignedDNType() {
		return assignedDNType;
	}

	public void setAssignedDNType(String assignedDNType) {
		this.assignedDNType = assignedDNType;
	}

	public String getAssignedDN() {
		return assignedDN;
	}

	public void setAssignedDN(String assignedDN) {
		this.assignedDN = assignedDN;
	}

	public String getAccessType() {
		return accessType;
	}

	public void setAccessType(String accessType) {
		this.accessType = accessType;
	}
	
	public String getOLCRuleString() {
		StringBuilder value = new StringBuilder("{" + this.getOrder()+ "}to ");
		value.append(this.getAccessDNType() + "=\"" + this.accessDN + "\" ");
		value.append("by ");
		value.append("group.exact=");
		value.append("\"" + this.getAssignedDN() + "\" ");
		value.append(this.getAccessType() + " by * break");
		return value.toString();
	}

}
