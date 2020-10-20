package tr.org.lider.services;

import java.util.Date;
import java.util.Properties;
import java.util.UUID;

import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tr.org.lider.entities.ForgotPasswordImpl;

@Service
public class EmailService {

	Logger logger = LoggerFactory.getLogger(EmailService.class);
	
	@Autowired
	private ConfigurationService configService;

	@Autowired
	private ForgotPasswordService forgotPasswordService;

	public Boolean sendmail(String username, String to, String liderURL) {
		String uuid = UUID.randomUUID().toString().replaceAll("-", "") + UUID.randomUUID().toString().replaceAll("-", "");

		Properties props = new Properties();
		props.put("mail.smtp.auth", configService.getMailSmtpAuth().toString());
		props.put("mail.smtp.starttls.enable", configService.getMailSmtpStartTlsEnable());
		props.put("mail.smtp.host", configService.getMailHost());
		props.put("mail.smtp.port", configService.getMailSmtpPort());

		Session session = Session.getInstance(props, new javax.mail.Authenticator() {
			protected PasswordAuthentication getPasswordAuthentication() {
				return new PasswordAuthentication(configService.getMailAddress(), configService.getMailPassword());
			}
		});
		Message msg = new MimeMessage(session);
		try {
			msg.setFrom(new InternetAddress(to, false));
			msg.setRecipients(Message.RecipientType.TO, InternetAddress.parse(to));
			msg.setSubject("LiderAhenk Şifre Yenileme Linki");
			String content = "Merhaba,<br><br>Şifrenizi aşağıdaki linkten 1 saat içerisinde yenileyebilirsiniz.<br><br>";
			content += "<a href=\"" + liderURL +"/forgot_password/reset/" + uuid + "\">Şifre Yenile</a>";
			msg.setContent(content, "text/html; charset=UTF-8");
			msg.setSentDate(new Date());

			Transport.send(msg);  
		} catch (AddressException e) {
			logger.error("Error occured while sending email. Error: " + e.getMessage());
			return false;
		} catch (MessagingException e) {
			logger.error("Error occured while sending email. Error: " + e.getMessage());
			return false;
		}
		ForgotPasswordImpl fp = new ForgotPasswordImpl();
		fp.setUsername(username);
		fp.setResetUID(uuid);
		forgotPasswordService.save(fp);
		return true;

 
	}

}
