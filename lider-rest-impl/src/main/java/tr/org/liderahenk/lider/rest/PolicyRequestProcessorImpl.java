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
package tr.org.liderahenk.lider.rest;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.commons.lang.StringUtils;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.subject.Subject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import tr.org.liderahenk.lider.core.api.configuration.IConfigurationService;
import tr.org.liderahenk.lider.core.api.ldap.ILDAPService;
import tr.org.liderahenk.lider.core.api.ldap.LdapSearchFilterAttribute;
import tr.org.liderahenk.lider.core.api.ldap.enums.SearchFilterEnum;
import tr.org.liderahenk.lider.core.api.ldap.exceptions.LdapException;
import tr.org.liderahenk.lider.core.api.ldap.model.IUser;
import tr.org.liderahenk.lider.core.api.ldap.model.LdapEntry;
import tr.org.liderahenk.lider.core.api.mail.IMailService;
import tr.org.liderahenk.lider.core.api.persistence.dao.ICommandDao;
import tr.org.liderahenk.lider.core.api.persistence.dao.IMailAddressDao;
import tr.org.liderahenk.lider.core.api.persistence.dao.IPolicyDao;
import tr.org.liderahenk.lider.core.api.persistence.dao.IProfileDao;
import tr.org.liderahenk.lider.core.api.persistence.entities.ICommand;
import tr.org.liderahenk.lider.core.api.persistence.entities.ICommandExecution;
import tr.org.liderahenk.lider.core.api.persistence.entities.IMailAddress;
import tr.org.liderahenk.lider.core.api.persistence.entities.IPolicy;
import tr.org.liderahenk.lider.core.api.persistence.entities.IProfile;
import tr.org.liderahenk.lider.core.api.persistence.factories.IEntityFactory;
import tr.org.liderahenk.lider.core.api.rest.IRequestFactory;
import tr.org.liderahenk.lider.core.api.rest.IResponseFactory;
import tr.org.liderahenk.lider.core.api.rest.enums.DNType;
import tr.org.liderahenk.lider.core.api.rest.enums.RestResponseStatus;
import tr.org.liderahenk.lider.core.api.rest.processors.IPolicyRequestProcessor;
import tr.org.liderahenk.lider.core.api.rest.requests.IPolicyExecutionRequest;
import tr.org.liderahenk.lider.core.api.rest.requests.IPolicyRequest;
import tr.org.liderahenk.lider.core.api.rest.responses.IRestResponse;
import tr.org.liderahenk.lider.core.api.utils.LiderCoreUtils;
import tr.org.liderahenk.lider.core.api.utils.StringJoinCursor;
import tr.org.liderahenk.lider.rest.dto.AppliedPolicy;

/**
 * Processor class for handling/processing policy data.
 * 
 * @author <a href="mailto:caner.feyzullahoglu@agem.com.tr">Caner
 *         Feyzullahoğlu</a>
 * @author <a href="mailto:emre.akkaya@agem.com.tr">Emre Akkaya</a>
 *
 */
public class PolicyRequestProcessorImpl implements IPolicyRequestProcessor {

	private static Logger logger = LoggerFactory.getLogger(PolicyRequestProcessorImpl.class);

	private IPolicyDao policyDao;
	private IProfileDao profileDao;
	private ICommandDao commandDao;
	private IRequestFactory requestFactory;
	private IResponseFactory responseFactory;
	private ILDAPService ldapService;
	private IEntityFactory entityFactory;
	private IConfigurationService configService;
	private IMailService mailService;
	private IMailAddressDao mailAddressDao;

	private SimpleDateFormat format = new SimpleDateFormat("dd-MM-yyyy H:m");

	@Override
	public IRestResponse execute(String json) {
		try {
			logger.debug("Creating IPolicyExecutionRequest object.");
			IPolicyExecutionRequest request = requestFactory.createPolicyExecutionRequest(json);

			logger.debug("Finding IPolicy by requested policyId.");
			IPolicy policy = policyDao.find(request.getId());

			logger.debug("Finding target entries under requested dnList.");
			// DN list may contain any combination of agent, user,
			// organizational unit and group DNs,
			// and DN type indicates what kind of entries in this list are
			// subject to command execution. Therefore we need to find these
			// LDAP entries first before authorization and command execution
			// phases.
			List<LdapEntry> targetEntries = ldapService.findTargetEntries(request.getDnList(), request.getDnType());

			logger.debug("Creating ICommand object.");
			ICommand command = entityFactory.createCommand(policy, request, findCommandOwnerUid());
			logger.debug("Target entry list size: " + targetEntries.size());
			if (targetEntries != null && targetEntries.size() > 0) {
				for (LdapEntry targetEntry : targetEntries) {
					boolean isAhenk = ldapService.isAhenk(targetEntry);
					boolean isUser = ldapService.isUser(targetEntry);
					String uid = isAhenk ? targetEntry.get(configService.getAgentLdapJidAttribute())
							: (isUser ? targetEntry.get(configService.getUserLdapUidAttribute()) : null);
					command.addCommandExecution(entityFactory.createCommandExecution(targetEntry, command, uid, false));
				}
			}

			commandDao.save(command);

			sendMail(policy, targetEntries, command);

			return responseFactory.createResponse(RestResponseStatus.OK, "Record executed.", null);
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
			return responseFactory.createResponse(RestResponseStatus.ERROR, e.getMessage());
		}
	}

	private boolean sendMail(IPolicy policy, List<LdapEntry> targetEntries, ICommand command) {
		String mailSubject = "Lider Ahenk Politikası";
		StringBuilder mailContent = new StringBuilder();
		final List<String> toList = new ArrayList<String>();

		boolean mailSend = false;
		mailContent.append("Aşağıda isimleri verilen eklentilerden oluşan \"").append(policy.getLabel())
				.append("\" isimli politika ").append(format.format(new Date()))
				.append(" tarihinde aşağıda detaylarıyla belirtilen LDAP ögelerine uygulanmıştır:\n\n");
		mailContent.append("Politikayı oluşturan eklentiler:\n");

		Set<? extends IProfile> profiles = policy.getProfiles();
		List<String> plugins = new ArrayList<String>();
		StringBuilder profileContent = new StringBuilder();
		for (IProfile profile : profiles) {
			Map<String, Object> profileData = profile.getProfileData();
			// Plugin description
			plugins.add(profile.getPlugin().getDescription());
			if (profileData != null) {
				Boolean mailSendParam = (Boolean) profileData.get("mailSend");
				if (mailSendParam != null && mailSendParam.booleanValue()) {
					// At least one profile wants to send mail!
					mailSend = true;
					// Add profile content
					profileContent
							.append(replaceValues(profileData.get("mailContent").toString(), profileData, command));

					// Add admin recipients
					List<? extends IMailAddress> mailAddressList = mailAddressDao.findByProperty(IMailAddress.class,
							"plugin.id", profile.getPlugin().getId(), 0);
					if (mailAddressList != null) {
						for (IMailAddress iMailAddress : mailAddressList) {
							toList.add(iMailAddress.getMailAddress());
						}
					}
				}
			}
		}

		if (mailSend) {
			mailContent.append(StringUtils.join(plugins, ","));
			// LDAP entries and their details (TCK, username etc)
			mailContent.append("\n\nPolitikanın uygulandığı LDAP ögeleri:\n");
			mailContent.append(LiderCoreUtils.join(targetEntries, ",\n", new StringJoinCursor() {
				@Override
				public String getValue(Object object) {
					if (object instanceof LdapEntry) {
						LdapEntry entry = (LdapEntry) object;
						Map<String, String> attributes = entry.getAttributes();
						List<String> attrStr = new ArrayList<String>();
						if (attributes != null) {
							for (Entry<String, String> attr : attributes.entrySet()) {
								// Ignore liderPrivilege attribute...
								if (attr.getKey().equalsIgnoreCase(configService.getUserLdapPrivilegeAttribute())) {
									continue;
								}
								attrStr.add(attr.getKey() + "=" + attr.getValue());
							}
							String email = attributes.get(configService.getLdapEmailAttribute());
							// Add personnel email to recipients
							if (email != null && !email.isEmpty()) {
								toList.add(email);
							}
						}
						return "DN: " + entry.getDistinguishedName() + " Öznitelikler: ["
								+ StringUtils.join(attrStr, ",") + "]";
					}
					return LiderCoreUtils.EMPTY;
				}
			}));
			mailContent.append("\n\nPolitika parametreleri:\n");
			mailContent.append(profileContent).append("\n\n");
			if (toList.size() > 0) {
				mailService.sendMail(toList, mailSubject, mailContent.toString());
			}
		}

		return mailSend;
	}

	private Pattern EXPRESSION = Pattern.compile("\\{(.*?)\\}");

	private String replaceValues(String message, Map<String, Object> values, ICommand command) {
		Matcher m = EXPRESSION.matcher(message);
		while (m.find()) {
			String expr = m.group(1);
			Object value = null;
			if (values.containsKey(expr)) {
				message = message.replaceAll("\\{" + expr + "\\}", values.get(expr).toString());
			} else if ((value = LiderCoreUtils.getFieldValueIfExists(command, expr)) != null) {
				message = message.replaceAll("\\{" + expr + "\\}", value.toString());
			} else {
				message = message.replaceAll("\\{" + expr + "\\}", "");
			}
		}
		return message;
	}

	/**
	 * This JID will be used to notify same user after task/policy execution.
	 * 
	 * @return JID of the user who sends the request
	 */
	private String findCommandOwnerUid() {
		try {
			Subject currentUser = SecurityUtils.getSubject();
			String userDn = currentUser.getPrincipal().toString();
			IUser user = ldapService.getUser(userDn);
			return user.getUid();
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
		}
		return null;
	}

	@Override
	public IRestResponse add(String json) {
		try {
			IPolicyRequest request = requestFactory.createPolicyRequest(json);

			IPolicy policy = entityFactory.createPolicy(request);
			if (request.getProfileIdList() != null) {
				for (Long profileId : request.getProfileIdList()) {
					IProfile profile = profileDao.find(profileId);
					policy.addProfile(profile);
				}
			}
			policy = policyDao.save(policy);

			Map<String, Object> resultMap = new HashMap<String, Object>();
			resultMap.put("policy", policy);

			return responseFactory.createResponse(RestResponseStatus.OK, "Record saved.", resultMap);
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
			return responseFactory.createResponse(RestResponseStatus.ERROR, e.getMessage());
		}
	}

	@Override
	public IRestResponse update(String json) {
		try {
			IPolicyRequest request = requestFactory.createPolicyRequest(json);
			IPolicy policy = policyDao.find(request.getId());

			incrementPolicyVersion(policy);

			policy = entityFactory.createPolicy(policy, request);
			// TODO IMPROVEMENT: instead of simply querying & adding profiles,
			// merge them with policy.getProfiles() first!
			if (request.getProfileIdList() != null) {
				for (Long profileId : request.getProfileIdList()) {
					IProfile profile = profileDao.find(profileId);
					policy.addProfile(profile);
				}
			}
			policy = policyDao.update(policy);

			Map<String, Object> resultMap = new HashMap<String, Object>();
			resultMap.put("policy", policy);

			return responseFactory.createResponse(RestResponseStatus.OK, "Record updated.", resultMap);
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
			return responseFactory.createResponse(RestResponseStatus.ERROR, e.getMessage());
		}
	}

	/**
	 * Increments version number of a policy by one.
	 * 
	 * @param policy
	 */
	private void incrementPolicyVersion(IPolicy policy) {
		if (policy.getPolicyVersion() != null) {
			String oldVersion = policy.getPolicyVersion().split("-")[1];
			Integer newVersion = new Integer(oldVersion) + 1;
			policy.setPolicyVersion(policy.getId() + "-" + newVersion);
			logger.debug(
					"Version of policy: " + policy.getId() + " is increased from " + oldVersion + " to " + newVersion);
		}
	}

	@Override
	public IRestResponse list(String label, Boolean active) {
		// Build search criteria
		Map<String, Object> propertiesMap = new HashMap<String, Object>();
		propertiesMap.put("deleted", false);
		if (label != null && !label.isEmpty()) {
			propertiesMap.put("label", label);
		}
		//if this comment is open it will not show inactive policies
//		if (active != null) {
//			propertiesMap.put("active", active);
//		}

		// Find desired policies
		List<? extends IPolicy> policies = policyDao.findByProperties(IPolicy.class, propertiesMap, null, null);

		// Construct result map
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try {
			resultMap.put("policies", policies);
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
		}

		return responseFactory.createResponse(RestResponseStatus.OK, "Records listed.", resultMap);
	}

	@Override
	public IRestResponse get(Long id) {
		if (id == null) {
			throw new IllegalArgumentException("ID was null.");
		}
		IPolicy policy = policyDao.find(new Long(id));
		Map<String, Object> resultMap = new HashMap<String, Object>();
		resultMap.put("policy", policy);
		return responseFactory.createResponse(RestResponseStatus.OK, "Record retrieved.", resultMap);
	}

	@Override
	public IRestResponse delete(Long id) {
		if (id == null) {
			throw new IllegalArgumentException("ID was null.");
		}
		policyDao.delete(new Long(id));
		logger.info("Policy record deleted: {}", id);
		return responseFactory.createResponse(RestResponseStatus.OK, "Record deleted.");
	}

	@Override
	public IRestResponse listAppliedPolicies(String label, Date createDateRangeStart, Date createDateRangeEnd,
			Integer status, Integer maxResults, String containsPlugin, DNType dnType, String dn) {
		// Try to find command results
		List<Object[]> resultList = commandDao.findPolicyCommand(label, createDateRangeStart, createDateRangeEnd,
				status, maxResults, containsPlugin);
		List<AppliedPolicy> policies = null;
		// Convert SQL result to collection of tasks.
		if (resultList != null) {
			// FIXME MSB solution to list applied policies under an
			// organizational unit:
			ArrayList<String> targetDnList = new ArrayList<String>();
			targetDnList.add(dn);
			if (dnType != null && dnType == DNType.ORGANIZATIONAL_UNIT && dn != null && !dn.isEmpty()) {
				List<LdapSearchFilterAttribute> filterAttributes = new ArrayList<LdapSearchFilterAttribute>();
				String[] groupLdapObjectClasses = configService.getUserLdapObjectClasses().split(",");
				for (String groupObjCls : groupLdapObjectClasses) {
					filterAttributes
							.add(new LdapSearchFilterAttribute("objectClass", groupObjCls, SearchFilterEnum.EQ));
				}
				try {
					List<LdapEntry> entries = ldapService.search(dn, filterAttributes,
							new String[] { configService.getUserLdapUidAttribute() });
					if (entries != null) {
						for (LdapEntry entry : entries) {
							targetDnList.add(entry.getDistinguishedName());
						}
					}
				} catch (LdapException e) {
					e.printStackTrace();
				}
			}
			
			if(targetDnList != null){
				for (int i = 0; i < targetDnList.size(); i++) {
					String tdn = targetDnList.get(i);
					tdn = tdn.replace("+", " ");
					targetDnList.set(i, tdn);
					
				}
			}

			policies = new ArrayList<AppliedPolicy>();
			for (Object[] arr : resultList) {
				if (arr.length != 5) {
					continue;
				}
				IPolicy pol = (IPolicy) arr[0];
				ICommand cmd = (ICommand) arr[1];
				// Filter by plugin name!
				if (containsPlugin != null && !containsPlugin(containsPlugin, pol)) {
					continue;
				}
				// Filter by DN type (user, OU etc)
//				if (dnType != null && dnType != DNType.ALL) {
//					boolean result = true;
//					for (ICommandExecution exec : cmd.getCommandExecutions()) {
//						if (dnType != exec.getDnType()) {
//							result = false;
//							break;
//						}
//					}
//					if (!result) {
//						continue;
//					}
//				}
				// Filter by dn
				if (dn != null) {
					boolean result = false;
					for (ICommandExecution exec : cmd.getCommandExecutions()) {
						if (targetDnList.contains(exec.getDn())) {
							result = true;
							break;
						}
					}
					if (!result) {
						continue;
					}
				}
				AppliedPolicy policy = new AppliedPolicy(pol, (Integer) arr[2], (Integer) arr[3], (Integer) arr[4],
						cmd);
				policies.add(policy);
			}
		}

		// Construct result map
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try {
			resultMap.put("policies", policies);
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
		}

		return responseFactory.createResponse(RestResponseStatus.OK, "Records listed.", resultMap);
	}

	private boolean containsPlugin(String containsPlugin, IPolicy pol) {
		if (pol.getProfiles() == null || pol.getProfiles().size() == 0) {
			return false;
		}
		for (IProfile profile : pol.getProfiles()) {
			if (profile.getPlugin().getName().equalsIgnoreCase(containsPlugin)) {
				return true;
			}
		}
		return false;
	}

	@Override
	public IRestResponse listCommands(Long policyId) {
		if (policyId == null) {
			throw new IllegalArgumentException("ID was null.");
		}
		Map<String, Object> propertiesMap = new HashMap<String, Object>();
		propertiesMap.put("policy.id", policyId);
		List<? extends ICommand> commands = commandDao.findByProperties(ICommand.class, propertiesMap, null, null);
		// Explicitly write object as json string, it will handled by
		// related rest utility class in Lider Console
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try {
			resultMap.put("commands", commands);
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
		}
		return responseFactory.createResponse(RestResponseStatus.OK, "Record retrieved.", resultMap);
	}

	/**
	 * 
	 * @param policyDao
	 */
	public void setPolicyDao(IPolicyDao policyDao) {
		this.policyDao = policyDao;
	}

	/**
	 * 
	 * @param profileDao
	 */
	public void setProfileDao(IProfileDao profileDao) {
		this.profileDao = profileDao;
	}

	/**
	 * 
	 * @param requestFactory
	 */
	public void setRequestFactory(IRequestFactory requestFactory) {
		this.requestFactory = requestFactory;
	}

	/**
	 * 
	 * @param responseFactory
	 */
	public void setResponseFactory(IResponseFactory responseFactory) {
		this.responseFactory = responseFactory;
	}

	/**
	 * 
	 * @param ldapService
	 */
	public void setLdapService(ILDAPService ldapService) {
		this.ldapService = ldapService;
	}

	/**
	 * 
	 * @param commandDao
	 */
	public void setCommandDao(ICommandDao commandDao) {
		this.commandDao = commandDao;
	}

	/**
	 * 
	 * @param entityFactory
	 */
	public void setEntityFactory(IEntityFactory entityFactory) {
		this.entityFactory = entityFactory;
	}

	/**
	 * 
	 * @param configService
	 */
	public void setConfigService(IConfigurationService configService) {
		this.configService = configService;
	}

	public void setMailService(IMailService mailService) {
		this.mailService = mailService;
	}

	public void setMailAddressDao(IMailAddressDao mailAddressDao) {
		this.mailAddressDao = mailAddressDao;
	}

	@Override
	public IRestResponse getLatestAgentPolicy(String uid) {
		List<Object[]> policies = policyDao.getLatestAgentPolicy(uid);
		List<IPolicy> listPolicy = null;
		if(policies != null) {
			listPolicy = new ArrayList<>();
			for(int i = 0; i < policies.size(); i++) {
				IPolicy policy = (IPolicy) policies.get(i)[0];
				listPolicy.add(policy);
			}
		}
		Map<String, Object> resultMap = new HashMap<String, Object>();
		resultMap.put("policy", listPolicy);
		return responseFactory.createResponse(RestResponseStatus.OK, "Record retrieved.", resultMap);
	}

	@Override
	public IRestResponse getLatestUserPolicy(String uid, List<LdapEntry> groupDns) {
		List<Object[]> policies = policyDao.getLatestUserPolicy(uid, groupDns);
		List<IPolicy> listPolicy = null;
		if(policies != null) {
			listPolicy = new ArrayList<>();
			for(int i = 0; i < policies.size(); i++) {
				IPolicy policy = (IPolicy) policies.get(i)[0];
				listPolicy.add(policy);
			}
		}
		Map<String, Object> resultMap = new HashMap<String, Object>();
		resultMap.put("policy", listPolicy);
		return responseFactory.createResponse(RestResponseStatus.OK, "Record retrieved.", resultMap);
	}

	@Override
	public IRestResponse getCommandExecutionResult(Long policyID, String uid, List<LdapEntry> groupDns) {
		List<Object[]> executionResults = commandDao.getCommandExecutionResultsOfPolicy(policyID, uid, groupDns);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		resultMap.put("commandExecutionResult", executionResults);
		return responseFactory.createResponse(RestResponseStatus.OK, "Record retrieved.", resultMap);
	}

	@Override
	public IRestResponse getLatestGroupPolicy(List<String> dnList) {
		List<Object[]> policies = policyDao.getLatestGroupPolicy(dnList);
		List<IPolicy> listPolicy = null;
		if(policies != null) {
			listPolicy = new ArrayList<>();
			for(int i = 0; i < policies.size(); i++) {
				IPolicy policy = (IPolicy) policies.get(i)[0];
				listPolicy.add(policy);
			}
		}
		Map<String, Object> resultMap = new HashMap<String, Object>();
		resultMap.put("policy", listPolicy);
		return responseFactory.createResponse(RestResponseStatus.OK, "Record retrieved.", resultMap);
	}



}
