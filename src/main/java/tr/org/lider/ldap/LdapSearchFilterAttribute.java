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
package tr.org.lider.ldap;


/**
 * This class is used to filter LDAP entries during search operations.
 * 
 * @see tr.org.liderahenk.lider.api.ldap.core.api.ldap.ILDAPService
 * @see tr.org.liderahenk.lider.api.ldap.impl.ldap.LDAPServiceImpl
 *
 */
public class LdapSearchFilterAttribute {

	private String attributeName;
	private String attributeValue;
	private SearchFilterEnum operator;

	public LdapSearchFilterAttribute() {
	}

	public LdapSearchFilterAttribute(String attributeName, String attributeValue, SearchFilterEnum operator) {
		this.attributeName = attributeName;
		this.attributeValue = attributeValue;
		this.operator = operator;
	}

	public String getAttributeName() {
		return attributeName;
	}

	public void setAttributeName(String attributeName) {
		this.attributeName = attributeName;
	}

	public String getAttributeValue() {
		return attributeValue;
	}

	public void setAttributeValue(String attributeValue) {
		this.attributeValue = attributeValue;
	}

	public SearchFilterEnum getOperator() {
		return operator;
	}

	public void setOperator(SearchFilterEnum operator) {
		this.operator = operator;
	}

}
