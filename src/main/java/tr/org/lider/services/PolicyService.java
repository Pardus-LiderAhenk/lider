package tr.org.lider.services;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.apache.directory.api.ldap.model.exception.LdapException;
import org.apache.directory.api.ldap.model.message.SearchScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonGenerationException;
import com.fasterxml.jackson.databind.JsonMappingException;

import tr.org.lider.LiderSecurityUserDetails;
import tr.org.lider.entities.CommandExecutionImpl;
import tr.org.lider.entities.CommandImpl;
import tr.org.lider.entities.PolicyImpl;
import tr.org.lider.ldap.LDAPServiceImpl;
import tr.org.lider.ldap.LdapEntry;
import tr.org.lider.models.PolicyExecutionRequestImpl;
import tr.org.lider.repositories.PolicyRepository;

/**
 * Service for getting policy parameters from database and added, updated and deleted policy to database.
 * 
 * @author <a href="mailto:tuncay.colak@tubitak.gov.tr">Tuncay ÇOLAK</a>
 * 
 */

@Service
public class PolicyService {
	Logger logger = LoggerFactory.getLogger(PolicyService.class);
	
	@Autowired
	private PolicyRepository policyRepository;
	
	@Autowired
	private CommandService commandService;
	
	@Autowired
	private LDAPServiceImpl ldapService;
	
	@Autowired
	private ConfigurationService configService;
	
	public void executePolicy(PolicyExecutionRequestImpl request) {
		logger.debug("Finding Policy by requested policyId.");
		PolicyImpl policy = findPolicyByID(request.getId());
		logger.debug("Creating ICommand object.");
		CommandImpl command = createCommanEntity(request, policy);
		/*
		 * target entry must be group..
		 * all policies send only group entry.
		 */
		List<LdapEntry> targetEntries= getTargetList(request.getDnList());
		for (LdapEntry targetEntry : targetEntries) {
			String uid=targetEntry.get(configService.getAgentLdapIdAttribute()); // group uid is cn value.
			CommandExecutionImpl commandExecutionImpl=	new CommandExecutionImpl(null, (CommandImpl) command, uid, targetEntry.getType(), targetEntry.getDistinguishedName(),
					new Date(), null, false);
			
			command.addCommandExecution(commandExecutionImpl);
		}
		if(command!=null)
		commandService.addCommand(command);
	}

	private CommandImpl createCommanEntity(PolicyExecutionRequestImpl request, PolicyImpl policy) {
		CommandImpl command=null;
		try {
			command= new CommandImpl(null, policy, null, request.getDnList(), request.getDnType(), null, findCommandOwnerJid(), 
					request.getActivationDate(), 
					request.getExpirationDate(), new Date(), null, false);
		} catch (JsonGenerationException e) {
			e.printStackTrace();
		} catch (JsonMappingException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
		return command;
	}

	public List<PolicyImpl> list( ){
		Boolean deleted = false;
		return policyRepository.findAllByDeleted(deleted);
	}

	public PolicyImpl add(PolicyImpl policy) {
		policy.setCommandOwnerUid(null);
		PolicyImpl existPolicy = policyRepository.save(policy);
		existPolicy.setPolicyVersion(existPolicy.getId()+"-"+ 1);
		return policyRepository.save(existPolicy);
	}

	public PolicyImpl del(PolicyImpl policy) {
		PolicyImpl existPolicy = policyRepository.findOne(policy.getId());
		existPolicy.setDeleted(true);
		existPolicy.setModifyDate(new Date());
		return policyRepository.save(existPolicy);
	}

	public PolicyImpl update(PolicyImpl policy) {
		PolicyImpl existPolicy = policyRepository.findOne(policy.getId());
		existPolicy.setLabel(policy.getLabel());
		existPolicy.setDescription(policy.getDescription());
		existPolicy.setProfiles(policy.getProfiles());
		String oldVersion = existPolicy.getPolicyVersion().split("-")[1];
		Integer newVersion = new Integer(oldVersion) + 1;
		existPolicy.setPolicyVersion(policy.getId() + "-" + newVersion);
		existPolicy.setModifyDate(new Date());
		return policyRepository.save(existPolicy);
	}

	public PolicyImpl active(PolicyImpl policy) {
		PolicyImpl existPolicy = policyRepository.findOne(policy.getId());
		existPolicy.setActive(true);
		existPolicy.setModifyDate(new Date());
		return policyRepository.save(existPolicy);
	}

	public PolicyImpl passive(PolicyImpl policy) {
		PolicyImpl existPolicy = policyRepository.findOne(policy.getId());
		existPolicy.setActive(false);
		existPolicy.setModifyDate(new Date());
		return policyRepository.save(existPolicy);
	}

	public PolicyImpl findPolicyByID(Long id) {
		return policyRepository.findOne(id);
	}

	public PolicyImpl updateVersion(PolicyImpl policy) {
		String oldVersion = policy.getPolicyVersion().split("-")[1];
		Integer newVersion = new Integer(oldVersion) + 1;
		policy.setPolicyVersion(policy.getId() + "-" + newVersion);
		policy.setModifyDate(new Date());
		return policyRepository.save(policy);
	}
	
	private List<LdapEntry> getTargetList(List<String> selectedDns) {
		List<LdapEntry> targetEntries= new ArrayList<>();
		for (String dn : selectedDns) {
			try {
				List<LdapEntry> member= ldapService.findSubEntries(dn, "(objectclass=*)", new String[] { "*" }, SearchScope.OBJECT);
				if(member!=null && member.size()>0) {
					targetEntries.add(member.get(0));
				}
			} catch (LdapException e) {
				e.printStackTrace();
			}		
		}
		return targetEntries;
	}
	
	private String findCommandOwnerJid() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication != null && !(authentication instanceof AnonymousAuthenticationToken)) {
			Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
			if ( principal instanceof UserDetails) {
				LiderSecurityUserDetails userDetails = (LiderSecurityUserDetails) principal;
				logger.info(" task owner jid : "+userDetails.getLiderUser().getName());
				return userDetails.getLiderUser().getName();
			} 
		}
		return null;
	}
}