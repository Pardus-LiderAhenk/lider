package tr.org.lider.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;


/**
 * 
 * Getting inner page for menu items.. When menu items clicked dynamic content of div rendered with inner page. 
 * @author M. Edip YILDIZ
 *
 */
@Controller
@RequestMapping("/lider/pages")
public class PagesController {

	@RequestMapping(value="/getInnerHtmlPage", method = {RequestMethod.POST })
	public String getInnerHtmlPage(String innerPage) {
		return innerPage;
	}
}
 