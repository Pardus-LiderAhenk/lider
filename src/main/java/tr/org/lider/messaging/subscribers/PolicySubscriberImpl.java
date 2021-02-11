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
package tr.org.lider.messaging.subscribers;

import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.apache.directory.api.ldap.model.exception.LdapException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import tr.org.lider.entities.CommandExecutionImpl;
import tr.org.lider.entities.CommandImpl;
import tr.org.lider.entities.PolicyImpl;
import tr.org.lider.entities.ProfileImpl;
import tr.org.lider.ldap.LDAPServiceImpl;
import tr.org.lider.ldap.LdapEntry;
import tr.org.lider.ldap.LdapSearchFilterAttribute;
import tr.org.lider.ldap.SearchFilterEnum;
import tr.org.lider.messaging.enums.DomainType;
import tr.org.lider.messaging.messages.ExecutePoliciesMessageImpl;
import tr.org.lider.messaging.messages.ExecutePolicyImpl;
import tr.org.lider.messaging.messages.IGetPoliciesMessage;
import tr.org.lider.repositories.PolicyRepository;
import tr.org.lider.services.AdService;
import tr.org.lider.services.ConfigurationService;

/**
 * Provides related agent and user policies according to specified username and
 * agent JID in received message.
 * @see tr.org.liderahenk.lider.core.api.messaging.subscribers.IPolicySubscriber
 *
 */
@Component
public class PolicySubscriberImpl implements IPolicySubscriber {

	private static Logger logger = LoggerFactory.getLogger(PolicySubscriberImpl.class);
	@Autowired
	private LDAPServiceImpl ldapService;
	
	@Autowired
	private AdService adService;
	
	@Autowired
	private ConfigurationService configurationService;
	@Autowired
	private PolicyRepository policyDao;
	
//	private IMessageFactory messageFactory;

	@Override
	public ExecutePoliciesMessageImpl messageReceived(IGetPoliciesMessage message) throws Exception {

		String agentUid = message.getFrom().split("@")[0];
		String userUid = message.getUsername();
		Map<String, String[]> agentPolicyList = message.getPolicyList();
		//String agentPolicyVersion = message.getAgentPolicyVersion();

		// Find LDAP user entry
		String userDn = findUserDn(userUid);
		// Find LDAP group entries to which user belongs
		List<LdapEntry> groupsOfUser = findGroups(userDn);

		// Find policy for user groups.
		// (User policy can be related to either user entry or group entries
		// which ever is the latest)
		List<Object[]> resultList=new ArrayList<>();
		for (LdapEntry ldapEntry : groupsOfUser) {
			List<Object[]> result = policyDao.findPoliciesByGroupDn(ldapEntry.getDistinguishedName());
			resultList.addAll(result);
		}
		PolicyImpl userPolicy = null;
		Long userCommandExecutionId = null;
		CommandImpl command = null;
		ExecutePoliciesMessageImpl response = new ExecutePoliciesMessageImpl();
		response.setUsername(userUid);
		SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
		if(resultList != null && !resultList.isEmpty()) {
			for (int i = 0; i < resultList.size(); i++) {
				userPolicy = (PolicyImpl) resultList.get(i)[0];
				userCommandExecutionId = ((CommandExecutionImpl) resultList.get(i)[1]).getId();
				command = ((CommandImpl) resultList.get(i)[2]);
				
				boolean sendUserPolicy = userPolicy != null 
						&& userPolicy.getPolicyVersion() != null;
				if(agentPolicyList != null && agentPolicyList.size() > 0) {
					
					if(agentPolicyList.containsKey(String.valueOf(userPolicy.getId()))) {
						Date assignDateOfAgentDB = formatter.parse(agentPolicyList.get(String.valueOf(userPolicy.getId()))[1]);
						LocalDateTime ldtAgentDBDate = LocalDateTime.ofInstant(assignDateOfAgentDB.toInstant(), ZoneId.systemDefault());
						LocalDateTime ldtAssignDate = LocalDateTime.ofInstant(command.getCreateDate().toInstant(), ZoneId.systemDefault());
						ldtAgentDBDate = ldtAgentDBDate.withNano(0);
						ldtAssignDate = ldtAssignDate.withNano(0);
					
						if(agentPolicyList.get(String.valueOf(userPolicy.getId()))[0].equals(userPolicy.getPolicyVersion())
								&& ldtAgentDBDate.isEqual(ldtAssignDate)) {
							sendUserPolicy = false;
						}
					}
				}
 
				// Check if one of the plugins use file transfer
				boolean usesFileTransfer = false;
				if (sendUserPolicy) {
					for (ProfileImpl profile : userPolicy.getProfiles()) {
						if (profile.getPlugin() != null && profile.getPlugin().isUsesFileTransfer()) {
							usesFileTransfer = true;
							break;
						}
					}
				}
				
				if(sendUserPolicy) {
					ExecutePolicyImpl policy = new ExecutePolicyImpl();
					policy.setPolicyID(userPolicy.getId());
					policy.setAgentCommandExecutionId(null);
					policy.setAgentPolicyExpirationDate(null);
					policy.setAgentPolicyProfiles(null);
					policy.setAgentPolicyVersion(null);
					policy.setFileServerConf(usesFileTransfer ? configurationService.getFileServerConf(agentUid) : null);
					policy.setUserCommandExecutionId(userCommandExecutionId);
					policy.setUsername(userUid);
					policy.setUserPolicyExpirationDate(sendUserPolicy ? command.getExpirationDate() : null);
					policy.setUserPolicyProfiles(sendUserPolicy ? new ArrayList<ProfileImpl>(userPolicy.getProfiles()) : null);
					policy.setUserPolicyVersion(userPolicy != null ? userPolicy.getPolicyVersion() : null);
					policy.setIsDeleted(false);
					LocalDateTime ldtAssignDate = LocalDateTime.ofInstant(command.getCreateDate().toInstant(), ZoneId.systemDefault());
					ldtAssignDate = ldtAssignDate.withNano(0);
					policy.setAssignDate(Date.from(ldtAssignDate.atZone(ZoneId.systemDefault()).toInstant()));
					response.getExecutePolicyList().add(policy);
				}
			}
		}
		// check if one or more policies in database of agent is deleted or unassigned on lider server
		// if deleted send deleted flag to ahenk to delete policy in ahenk db
		if(agentPolicyList != null && agentPolicyList.size() > 0) {
			for (String policyID : agentPolicyList.keySet())  
	        { 
	            // search  for value 
	            boolean isPolicyDeleted = true;
	    		if(resultList != null && !resultList.isEmpty()) {
	    			for (int i = 0; i < resultList.size(); i++) {
	    				userPolicy = (PolicyImpl) resultList.get(i)[0];
	    				if(String.valueOf(userPolicy.getId()).equals(policyID)) {
	    					isPolicyDeleted = false;
	    					break;
	    				}
	    			}
	    		}
				
	    		if(isPolicyDeleted) {
	    			ExecutePolicyImpl policy = new ExecutePolicyImpl();
					policy.setPolicyID(Long.valueOf(policyID));
					policy.setAgentCommandExecutionId(null);
					policy.setAgentPolicyExpirationDate(null);
					policy.setAgentPolicyProfiles(null);
					policy.setAgentPolicyVersion(null);
					policy.setFileServerConf(null);
					policy.setUserCommandExecutionId(null);
					policy.setUsername(userUid);
					policy.setUserPolicyExpirationDate(null);
					policy.setUserPolicyProfiles(null);
					policy.setUserPolicyVersion(null);
					policy.setIsDeleted(true);
					response.getExecutePolicyList().add(policy);
	    		}
	        } 
		}

		logger.debug("Execute policies message: {}", response);
		return response;
	}

	/**
	 * Find user DN by given UID
	 * 
	 * @param userUid
	 * @return
	 * @throws LdapException
	 */
	private String findUserDn(String userUid) throws LdapException {
		String userDN=null;
		
		if(configurationService.getDomainType().equals(DomainType.ACTIVE_DIRECTORY)) {

			List<LdapSearchFilterAttribute> filterAttributes = new ArrayList<LdapSearchFilterAttribute>();
			filterAttributes.add(new LdapSearchFilterAttribute("sAMAccountName", userUid, SearchFilterEnum.EQ));
			
			List<LdapEntry> users= adService.search(adService.getADDomainName(),filterAttributes, new String[] {"*"});
			if(users.size()>0) {
				userDN=users.get(0).getDistinguishedName();
			}
		}
		else{
			userDN=ldapService.getDN(configurationService.getLdapRootDn(), configurationService.getUserLdapUidAttribute(),
					userUid);
		}
		return userDN;
	}

	/**
	 * Find groups of a given user
	 * 
	 * @param userDn
	 * @return
	 * @throws LdapException
	 */
	private List<LdapEntry> findGroups(String userDn) throws LdapException {
		List<LdapSearchFilterAttribute> filterAttributesList = new ArrayList<LdapSearchFilterAttribute>();
		
		List<LdapEntry> groups=null;
		if(configurationService.getDomainType().equals(DomainType.ACTIVE_DIRECTORY)) {
			filterAttributesList.add(new LdapSearchFilterAttribute("objectClass", "group", SearchFilterEnum.EQ));
			filterAttributesList.add(new LdapSearchFilterAttribute("member", userDn, SearchFilterEnum.EQ));
			String baseDn=adService.getADDomainName();
			groups = adService.search(baseDn, filterAttributesList, new String[] {"*"});
		}
		else {
			filterAttributesList.add(new LdapSearchFilterAttribute("objectClass", configurationService.getGroupLdapObjectClasses(), SearchFilterEnum.EQ));
			filterAttributesList.add(new LdapSearchFilterAttribute("member", userDn, SearchFilterEnum.EQ));
			groups = ldapService.search(configurationService.getLdapRootDn(), filterAttributesList, new String[] {"*"});
		}
		return groups;
	}
}
