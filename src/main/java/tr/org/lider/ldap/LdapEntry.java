package tr.org.lider.ldap;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

public class LdapEntry implements Serializable , Comparable<LdapEntry>{
	/**
	 * distinguished name
	 */
	private String distinguishedName;
	
	private String ou;
	
	private String cn;
	
	private String uid;
	
	private String sn;
	
	private String o;
	
	private String userPassword;
	
	private String parent;
	
	private String parentName;
	
	private String entryUUID;
	
	private String hasSubordinates;

	private String name;	
	
	private String iconPath;	
	
	private String expandedUser;

	/**
	 * single valued attributes
	 */
	private Map<String, String> attributes;
	
	/**
	 * multiple valued attributes
	 */
	private Map<String, String[]> attributesMultiValues;

	private DNType type;
	
	private boolean isOnline;
	
	private List<String> priviliges;
	
	private List<LdapEntry> childEntries;
	
	private String telephoneNumber;
	
	private String homePostalAddress;
	
	private String mail;

	public LdapEntry() {
		// TODO Auto-generated constructor stub
	}
	/**
	 * 
	 * @param dn
	 * @param attributes
	 * @param type
	 */
	public LdapEntry(String dn, Map<String, String> attributes,  Map<String, String[]> attributesMultiValues,List<String> priviliges,  DNType type) {
		this.distinguishedName = dn;
		this.name = dn;
		this.attributes = attributes;
		this.attributesMultiValues = attributesMultiValues;
		this.type = type;
		this.priviliges=priviliges;
		setAttributesToFields(attributes);
	}
	
	/**
	 * set 
	 * @param attributes
	 */
	private void setAttributesToFields(Map<String, String> attributes) {
		setEntryUUID(getAttributes().get("entryUUID"));
		setHasSubordinates(getAttributes().get("hasSubordinates"));
		setOu(getAttributes().get("ou"));
		setCn(getAttributes().get("cn"));
		setSn(getAttributes().get("sn"));
		setUid(getAttributes().get("uid"));
		setO(getAttributes().get("o"));
		setUserPassword(getAttributes().get("userPassword"));
		setExpandedUser("FALSE");
		
		setName( (getAttributes().get("ou")!=null &&  !getAttributes().get("ou").equals("")) 
				? getAttributes().get("ou") : getAttributes().get("cn")!=null &&  !getAttributes().get("cn").equals("") 
				? getAttributes().get("cn") : getAttributes().get("o") );
	}
	/**
	 * 
	 * @return
	 */
	public String getDistinguishedName() {
		return distinguishedName;
	}

	/**
	 * 
	 * @return attribute name/value
	 */
	public Map<String, String> getAttributes() {
		return attributes;
	}

	/**
	 * 
	 * @param attribute
	 * @return attribute value
	 */
	public String get(String attribute) {
		return getAttributes().get(attribute);
	}

	/**
	 * 
	 * @return DN type
	 */
	public DNType getType() {
		return type;
	}

//	@Override
//	public String toString() {
//		return "LdapEntry [distinguishedName=" + distinguishedName + ", attributes=" + attributes + ", type=" + type
//				+ "]";
//	}

	public boolean isOnline() {
		return isOnline;
	}

	public void setOnline(boolean isOnline) {
		this.isOnline = isOnline;
	}

	public String getParent() {
		return parent;
	}

	public void setParent(String parent) {
		this.parent = parent;
	}

	public void setDistinguishedName(String distinguishedName) {
		this.distinguishedName = distinguishedName;
	}

	public void setAttributes(Map<String, String> attributes) {
		this.attributes = attributes;
	}

	public void setType(DNType type) {
		this.type = type;
	}

	public String getEntryUUID() {
		return entryUUID;
	}

	public void setEntryUUID(String entryUUID) {
		this.entryUUID = entryUUID;
	}

	public String getHasSubordinates() {
		return hasSubordinates;
	}

	public void setHasSubordinates(String hasSubordinates) {
		this.hasSubordinates = hasSubordinates;
	}

	public List<LdapEntry> getChildEntries() {
		return childEntries;
	}

	public void setChildEntries(List<LdapEntry> childEntries) {
		this.childEntries = childEntries;
	}

	public String getCn() {
		return cn;
	}

	public void setCn(String cn) {
		this.cn = cn;
	}

	public String getUid() {
		return uid;
	}

	public void setUid(String uid) {
		this.uid = uid;
	}

	public String getSn() {
		return sn;
	}

	public void setSn(String sn) {
		this.sn = sn;
	}

	public String getUserPassword() {
		return userPassword;
	}

	public void setUserPassword(String userPassword) {
		this.userPassword = userPassword;
	}

	public String getO() {
		return o;
	}

	public void setO(String o) {
		this.o = o;
	}

	public String getOu() {
		return ou;
	}

	public void setOu(String ou) {
		this.ou = ou;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getParentName() {
		return parentName;
	}

	public void setParentName(String parentName) {
		this.parentName = parentName;
	}

	public String getIconPath() {
		return iconPath;
	}

	public void setIconPath(String iconPath) {
		this.iconPath = iconPath;
	}
	
	public String getExpandedUser() {
		return expandedUser;
	}
	
	public void setExpandedUser(String expandedUser) {
		this.expandedUser = expandedUser;
	}
	
	public List<String> getPriviliges() {
		return priviliges;
	}
	
	public void setPriviliges(List<String> priviliges) {
		this.priviliges = priviliges;
	}
	
	public String getTelephoneNumber() {
		return telephoneNumber;
	}
	
	public void setTelephoneNumber(String telephoneNumber) {
		this.telephoneNumber = telephoneNumber;
	}
	public String getHomePostalAddress() {
		return homePostalAddress;
	}
	
	public void setHomePostalAddress(String homePostalAddress) {
		this.homePostalAddress = homePostalAddress;
	}
	
	public Map<String, String[]> getAttributesMultiValues() {
		return attributesMultiValues;
	}
	
	public void setAttributesMultiValues(Map<String, String[]> attributesMultiValues) {
		this.attributesMultiValues = attributesMultiValues;
	}
	@Override
	public int compareTo(LdapEntry o) {
		
		return  o.getType().compareTo(getType());
	}
	public String getMail() {
		return mail;
	}
	public void setMail(String mail) {
		this.mail = mail;
	}

}
