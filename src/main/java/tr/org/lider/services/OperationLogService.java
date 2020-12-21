package tr.org.lider.services;

import java.util.Date;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import tr.org.lider.LiderSecurityUserDetails;
import tr.org.lider.entities.OperationLogImpl;
import tr.org.lider.entities.OperationType;
import tr.org.lider.repositories.OperationLogRepository;


/**
 * 
 * Service for operation logs.
 * @author Edip YILDIZ
 *
 */
@Service
public class OperationLogService {
	
	Logger logger = LoggerFactory.getLogger(OperationLogService.class);
	
	@Autowired
	private OperationLogRepository operationLogRepository;
	
	@Autowired 
	private HttpServletRequest httpRequest;

	public OperationLogImpl saveOperationLog(OperationType operationType,String logMessage,byte[] requestData ) {
		logger.info("Operation log saving. Log Type {} Log Message {}",operationType.name(),logMessage);
		
		OperationLogImpl operationLogImpl= new OperationLogImpl();
		
		operationLogImpl.setCreateDate(new Date());
		operationLogImpl.setCrudType(operationType);
		operationLogImpl.setLogMessage(logMessage);
		operationLogImpl.setRequestData(requestData);
		
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (!(authentication instanceof AnonymousAuthenticationToken)) {
			LiderSecurityUserDetails principal = (LiderSecurityUserDetails)authentication.getPrincipal();
			String userId=principal.getLiderUser().getDn();
		    operationLogImpl.setUserId(userId);
		}
		
		operationLogImpl.setRequestIp(httpRequest.getRemoteHost());
		return operationLogRepository.save(operationLogImpl);
	}

	public OperationLogImpl saveOperationLog(OperationType operationType,String logMessage,byte[] requestData, Long taskId, Long policyId, Long profileId  ) {
		logger.info("Operation log saving. Log Type {} Log Message {}",operationType.name(),logMessage);
		
		OperationLogImpl operationLogImpl= new OperationLogImpl();
		
		operationLogImpl.setCreateDate(new Date());
		operationLogImpl.setCrudType(operationType);
		operationLogImpl.setLogMessage(logMessage);
		operationLogImpl.setRequestData(requestData);
		operationLogImpl.setTaskId(taskId);
		operationLogImpl.setProfileId(profileId);
		operationLogImpl.setPolicyId(policyId);
		
		
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (!(authentication instanceof AnonymousAuthenticationToken)) {
			LiderSecurityUserDetails principal = (LiderSecurityUserDetails)authentication.getPrincipal();
			String userId=principal.getLiderUser().getDn();
			operationLogImpl.setUserId(userId);
		}
		
		HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
		operationLogImpl.setRequestIp(request.getRemoteAddr());
		return operationLogRepository.save(operationLogImpl);
	}
	
	public OperationLogImpl saveOperationLog(OperationLogImpl operationLogImpl) {
		return operationLogRepository.save(operationLogImpl);
	}
	
	public void deleteOperationLog(OperationLogImpl operationLogImpl) {
		operationLogRepository.delete(operationLogImpl);
	}
	
	public void updateOperationLog(OperationLogImpl operationLogImpl) {
		operationLogRepository.save(operationLogImpl);
	}
	
	public OperationLogImpl getOperationLog(Long id) {
		return operationLogRepository.findOne(id);
	}
	
	public List<OperationLogImpl> getOperationLogs() {
		return operationLogRepository.findAll();
	}
}
