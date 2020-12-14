package tr.org.lider.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import tr.org.lider.entities.NotifyTemplate;
import tr.org.lider.services.NotifyService;

/**
 * 
 * Return the Notify Template list, saved, edited and deleted notify for ETA
 * @author <a href="mailto:tuncay.colak@tubitak.gov.tr">Tuncay ÇOLAK</a>
 *
 */

@RestController
@RequestMapping("/notify")
public class NotifyController {

	@Autowired
	private NotifyService notifyService;
	
	@Secured({"ROLE_ADMIN", "ROLE_ETA_MESSAGE_DEFINITION", "ROLE_COMPUTERS" })
	@RequestMapping(method=RequestMethod.POST ,value = "/list", produces = MediaType.APPLICATION_JSON_VALUE)
	public List<NotifyTemplate> notifyList() {
		return notifyService.list();
	}

	@Secured({"ROLE_ADMIN", "ROLE_ETA_MESSAGE_DEFINITION" })
	@RequestMapping(method=RequestMethod.POST ,value = "/add", produces = MediaType.APPLICATION_JSON_VALUE)
	public NotifyTemplate notifyAdd(@RequestBody NotifyTemplate file){
		return notifyService.add(file);
	}
	
	@Secured({"ROLE_ADMIN", "ROLE_ETA_MESSAGE_DEFINITION" })
	@RequestMapping(method=RequestMethod.POST ,value = "/del", produces = MediaType.APPLICATION_JSON_VALUE)
	public NotifyTemplate notifyDel(@RequestBody NotifyTemplate file){
		return notifyService.del(file);
	}
	
	@Secured({"ROLE_ADMIN", "ROLE_ETA_MESSAGE_DEFINITION" })
	@RequestMapping(method=RequestMethod.POST ,value = "/update", produces = MediaType.APPLICATION_JSON_VALUE)
	public NotifyTemplate notifyUpdate(@RequestBody NotifyTemplate file){
		return notifyService.update(file);
	}
}
