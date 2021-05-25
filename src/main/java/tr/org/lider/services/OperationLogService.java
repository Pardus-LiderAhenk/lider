package tr.org.lider.services;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
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
 * @author <a href="mailto:tuncay.colak@tubitak.gov.tr">Tuncay ÇOLAK</a>
 *
 */
@Service
public class OperationLogService {

	Logger logger = LoggerFactory.getLogger(OperationLogService.class);

	@Autowired
	private OperationLogRepository operationLogRepository;

	@Autowired 
	private HttpServletRequest httpRequest;

	public void saveOperationLog(OperationType operationType,String logMessage,byte[] requestData ) {
		logger.info("Operation log saving. Log Type {} Log Message {}",operationType.name(),logMessage);

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication!=null && !(authentication instanceof AnonymousAuthenticationToken)) {
			LiderSecurityUserDetails principal = (LiderSecurityUserDetails)authentication.getPrincipal();
			String userId=principal.getLiderUser().getDn();
			OperationLogImpl operationLogImpl= new OperationLogImpl();
			operationLogImpl.setCreateDate(new Date());
			operationLogImpl.setCrudType(operationType);
			operationLogImpl.setLogMessage(logMessage);
			operationLogImpl.setRequestData(requestData);
			operationLogImpl.setUserId(userId);
			operationLogImpl.setRequestIp(httpRequest.getRemoteHost());
			operationLogRepository.save(operationLogImpl);
		}
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

	public Page<OperationLogImpl> getLoginLogsByLiderConsole(String userId, int pageNumber, int pageSize, String type) {
		PageRequest pageable = PageRequest.of(pageNumber - 1, pageSize, Sort.by("createDate").descending());
		Page<OperationLogImpl> pagedResult = null;
		if (type.equals("all")) {
			pagedResult = operationLogRepository.findByUserIdAndOperationTypeLoginOrOperationTypeLogout(userId, OperationType.LOGIN.getId(), OperationType.LOGOUT.getId(), pageable);
		}
		if (type.equals("login") || type.equals("logout")) {
			int typeId = OperationType.LOGIN.getId();
			if (type.equals("logout")) {
				typeId = OperationType.LOGOUT.getId();
			}
			pagedResult = operationLogRepository.findByUserIdAndOperationType(userId, typeId, pageable);
		}
		return pagedResult;
	}

	
	public OperationLogImpl getSelectedLogById(Long id) {
		return operationLogRepository.findOne(id);
	}
	
	public Page<OperationLogImpl> getOperationLogsByFilter(int pageNumber, int pageSize, String type, String field, String searchText, Optional<Date> startDate, Optional<Date> endDate) {
		PageRequest pageable = PageRequest.of(pageNumber - 1, pageSize, Sort.by("createDate").descending());
		Page<OperationLogImpl> result = null;

		if (type.equals("ALL")) {
			if (!searchText.isEmpty() && searchText != null) {
				if (field.equals("userId")) {
					if (startDate.isPresent() && endDate.isPresent()) {
						result = operationLogRepository.findByUserIdAndCreateDateGreaterThanAndCreateDateLessThan(searchText, startDate, endDate, pageable);
					} else {
						result = operationLogRepository.findByUserId(searchText, pageable);
					}
				}
				if (field.equals("requestIp")) {
					if (startDate.isPresent() && endDate.isPresent()) {
						result = operationLogRepository.findByRequestIpAndCreateDateGreaterThanAndCreateDateLessThan(searchText, startDate, endDate, pageable);
					} else {
						result = operationLogRepository.findByRequestIp(searchText, pageable);
					}
				}
			}else {
				if (startDate.isPresent() && endDate.isPresent()) {
					result = operationLogRepository.findByCreateDateGreaterThanAndCreateDateLessThan(startDate, endDate, pageable);
				} else {
					result = operationLogRepository.findAll(pageable);
				}
			}
		} else {
			OperationType typeOfValue = OperationType.valueOf(type);
			int typeId = typeOfValue.getId();

			if (!searchText.isEmpty() && searchText != null) {
				if (field.equals("userId")) {
					if (startDate.isPresent() && endDate.isPresent()) {
						result = operationLogRepository.findByUserIdAndOperationTypeAndCreateDateGreaterThanAndCreateDateLessThan(searchText, typeId, startDate, endDate, pageable);
					} else {
						result = operationLogRepository.findByUserIdAndOperationType(searchText, typeId, pageable);
					}

				}
				if (field.equals("requestIp")) {
					if (startDate.isPresent() && endDate.isPresent()) {
						result = operationLogRepository.findByrequestIpAndOperationTypeAndCreateDateGreaterThanAndCreateDateLessThan(searchText, typeId, startDate, endDate, pageable);
					} else {
						result = operationLogRepository.findByrequestIpAndOperationType(searchText, typeId, pageable);
					}
				}
			} else {
				if (startDate.isPresent() && endDate.isPresent()) {
					result = operationLogRepository.findByOperationTypeAndCreateDateGreaterThanAndCreateDateLessThan(typeId, startDate, endDate, pageable);
				} else {
					result = operationLogRepository.findByOperationType(typeId, pageable);
				}
			}
		}
		return result;
	}
}
