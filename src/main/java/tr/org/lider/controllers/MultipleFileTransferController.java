package tr.org.lider.controllers;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.xml.bind.DatatypeConverter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import tr.org.lider.entities.PluginTask;
import tr.org.lider.models.ConfigParams;
import tr.org.lider.services.ConfigurationService;
import tr.org.lider.services.TaskService;
import tr.org.lider.utils.FileCopyUtils;
import tr.org.lider.utils.IRestResponse;

/**
 *  Task execute for file transfer. This controller encoded data convert to string and send to file server
 * @author <a href="mailto:tuncay.colak@tubitak.gov.tr">Tuncay ÇOLAK</a>
 *
 */

@Secured({"ROLE_ADMIN", "ROLE_COMPUTERS" })
@RestController()
@RequestMapping("/file_transfer/task")
public class MultipleFileTransferController {
	Logger logger = LoggerFactory.getLogger(MultipleFileTransferController.class);
	
	@Autowired
	public TaskService taskService;
	
	@Autowired
	ConfigurationService configurationService;
	
	@RequestMapping(value = "/execute", method = { RequestMethod.POST })
	public IRestResponse executeTask(@RequestBody PluginTask requestBody, HttpServletRequest request)
			throws UnsupportedEncodingException {
		
		Map<String, Object> parameterMap = requestBody.getParameterMap();
		String encodedFile = (String) parameterMap.get("encodedFile");
		byte[] fileAsByteArr = DatatypeConverter.parseBase64Binary(encodedFile);
		
		// Send file to file server
		logger.info("Sending file to file server");
		
		String absPathOfRemoteFile = null;
		
		ConfigParams params = configurationService.getConfigParams();
		
		try {
			absPathOfRemoteFile = new FileCopyUtils().sendFile(
					params.getFileServerHost(), 
					params.getFileServerPort(),
					params.getFileServerUsername(), 
					params.getFileServerPassword(),
					fileAsByteArr, 
					params.getFileServerAgentFilePath().replace("{0}", "lider"));
		} catch (IOException | InterruptedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		logger.info("Putting remote path and removing encoded file at parameter map");
		parameterMap.put("remotePath", absPathOfRemoteFile);
		parameterMap.remove("encodedFile");
		
		logger.info("Request received. URL: '/lider/task/execute' Body: {}", requestBody);
		
		IRestResponse restResponse = taskService.execute(requestBody);
		logger.debug("Completed processing request, returning result: {}", restResponse.toJson());
		
		return restResponse;
	}
}
