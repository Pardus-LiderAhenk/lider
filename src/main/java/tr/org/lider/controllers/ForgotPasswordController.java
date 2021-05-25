package tr.org.lider.controllers;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang.StringUtils;
import org.apache.directory.api.ldap.model.exception.LdapException;
import org.apache.directory.api.ldap.model.message.SearchScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import tr.org.lider.entities.ForgotPasswordImpl;
import tr.org.lider.ldap.LDAPServiceImpl;
import tr.org.lider.ldap.LdapEntry;
import tr.org.lider.services.ConfigurationService;
import tr.org.lider.services.EmailService;
import tr.org.lider.services.ForgotPasswordService;

/**
 * 
 * @author Hasan Kara
 */
@Controller
@RequestMapping(value = "/forgot_password")
public class ForgotPasswordController {

	Logger logger = LoggerFactory.getLogger(ForgotPasswordController.class);

	@Autowired
	private ConfigurationService configurationService;

	@Autowired
	private LDAPServiceImpl ldapService;

	@Autowired
	private EmailService emailService;

	@Autowired
	private ForgotPasswordService forgotPasswordService;


	@RequestMapping(method = { RequestMethod.GET })
	public String forgotPassword(Model model) {
		if(isUserLoggedIn()) {
			return "redirect:/";
		}
		return "forgot_password";
	}

	@RequestMapping(method = { RequestMethod.POST })
	public String forgotPasswordSendLink(Model model, 
			RedirectAttributes redirectAttrs,
			HttpServletRequest request,
			@RequestParam(value = "username", required=true) String username) {
		//get full current url of lider server to send reset link to user
		String fullURL = request.getRequestURL().toString();
		fullURL = fullURL.substring(0, StringUtils.ordinalIndexOf(fullURL, "/", 3)); 
		
		if(isUserLoggedIn()) {
			return "redirect:/";
		}
		Boolean isEmailSent = false;
		if(!configurationService.isEmailConfigurationComplete()) {
			model.addAttribute("errorMessage", "Henüz Lider üzerinden email ayarlarınız yapılmamıştır. "
					+ "Lütfen email sıfırlama linki alabilmek için öncelikle Ayarlar > Email Ayarları sayfasından email ayarlarınızı tamamlayınız.");
			return "forgot_password";
		}
		LdapEntry ldapEntry=null;
		try {
			configurationService.destroyConfigParams();
			String filter= "(&(objectClass=pardusAccount)(objectClass=pardusLider)(liderPrivilege=ROLE_USER)(uid=$1))".replace("$1", username);
			List<LdapEntry> ldapEntries  = ldapService.findSubEntries(filter,
					new String[] { "*" }, SearchScope.SUBTREE);

			if(ldapEntries.size()>0) {
				ldapEntry=ldapEntries.get(0);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		if(ldapEntry!=null) {
			if(!ldapEntry.getAttributes().containsKey("mail")) {
				model.addAttribute("errorMessage", "Bu kullanıcı için henüz mail bilgisi eklenmemiştir.");
				return "forgot_password";
			}
			//if user has active link do not send again.
			Optional<ForgotPasswordImpl> fp = forgotPasswordService.findAllByUsername(username);
			if(fp.isPresent()) {
				long linkAllowedTill= fp.get().getCreateDate().getTime() + 1000*60*60;
				long nowMillis = new Date().getTime();
				if(linkAllowedTill > nowMillis) {
					model.addAttribute("errorMessage", "Emailinize gönderilmiş aktif şifre yenileme linki bulunmaktadır.");
					return "forgot_password";
				} else {
					forgotPasswordService.deleteByUsername(username);
				}
			}
			String userEmail = ldapEntry.getAttributes().get("mail");
			isEmailSent = emailService.sendmail(username, userEmail, fullURL);
		}
		else {
			redirectAttrs.addFlashAttribute("errorMessage", "Kullanıcı bulunamadı.");
			return "redirect:/login";
		}
		if(isEmailSent) {
			redirectAttrs.addFlashAttribute("infoMessage", "Email yenileme linki email adresinize gönderildi.");
			return "redirect:/login";
		} else {
			redirectAttrs.addFlashAttribute("errorMessage", "Email gönderilirken hata oluştu lütfen tekrar deneyiniz.");
			return "redirect:/login";
		}

	}
	
	@RequestMapping(value = "/reset/{uuid}", method = { RequestMethod.GET })
	public String passwordResetPage(Model model, RedirectAttributes redirectAttrs, @PathVariable String uuid) {
		
		Optional<ForgotPasswordImpl> fp = forgotPasswordService.findAllByUUID(uuid);
		if(!fp.isPresent()) {
			redirectAttrs.addFlashAttribute("errorMessage", "Email yenileme linki bulunamadı veya bu linkin süresi doldu.");
			return "redirect:/login";
		} else {
			long linkAllowedTill= fp.get().getCreateDate().getTime() + 1000*60*60;
			long nowMillis = new Date().getTime();
			if(linkAllowedTill < nowMillis) {
				model.addAttribute("errorMessage", "Email yenileme linki bulunamadı veya bu linkin süresi doldu.");
				return "forgot_password";
			} else {
				if(isUserLoggedIn()) {
					SecurityContextHolder.getContext().setAuthentication(null);
				}
				model.addAttribute("uuid", uuid);
				return "password_reset";
			}
		}
	}
	
	@RequestMapping(value = "/reset/{uuid}", method = { RequestMethod.POST })
	public String passwordResetSave(Model model, 
			RedirectAttributes redirectAttrs,
			@PathVariable String uuid, 
			@RequestParam(value = "password", required=true) String password,
			@RequestParam(value = "repeatPassword", required=true) String repeatPassword) {
		//if user has active link do not send again.
		Optional<ForgotPasswordImpl> fp = forgotPasswordService.findAllByUUID(uuid);
		if(!fp.isPresent()) {
			redirectAttrs.addFlashAttribute("errorMessage", "Email yenileme linki bulunamadı veya bu linkin süresi doldu.");
			return "redirect:/login";
		} else {
			long linkAllowedTill= fp.get().getCreateDate().getTime() + 1000*60*60;
			long nowMillis = new Date().getTime();
			if(linkAllowedTill < nowMillis) {
				model.addAttribute("errorMessage", "Email yenileme linki bulunamadı veya bu linkin süresi doldu.");
				return "forgot_password";
			} else {
				if(isUserLoggedIn()) {
					SecurityContextHolder.getContext().setAuthentication(null);
				}
				//update user password
				LdapEntry ldapEntry=null;
				try {
					configurationService.destroyConfigParams();
					String filter= "(&(objectClass=pardusAccount)(objectClass=pardusLider)(liderPrivilege=ROLE_USER)(uid=$1))".replace("$1", fp.get().getUsername());
					List<LdapEntry> ldapEntries  = ldapService.findSubEntries(filter,
							new String[] { "*" }, SearchScope.SUBTREE);

					if(ldapEntries.size()>0) {
						ldapEntry=ldapEntries.get(0);
					}
				} catch (Exception e) {
					e.printStackTrace();
				}
				try {
					ldapService.updateConsoleUserPassword(ldapEntry.getDistinguishedName(), "userPassword", password);
				} catch (LdapException e) {
					logger.error("Error occured while updating user password. Error: " + e.getMessage());
					redirectAttrs.addFlashAttribute("errorMessage", "Şifreniz değiştirilirken hata oluştu lütfen tekrar deneyiniz.");
					return "redirect:/forgot_password/reset/" + uuid;
				}
				//delete forgot password key
				forgotPasswordService.deleteByUsername(fp.get().getUsername());
				
				model.addAttribute("uuid", uuid);
				redirectAttrs.addFlashAttribute("infoMessage", "Şifreniz başarılı bir şekilde yenilendi. Şimdi giriş yapabilirsiniz.");
				return "redirect:/login";
			}
		}

	}
	public Boolean isUserLoggedIn() {
		final Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return null != authentication && !("anonymousUser").equals(authentication.getName());
	}
}
