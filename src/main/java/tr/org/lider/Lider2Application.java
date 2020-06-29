package tr.org.lider;

import java.util.Properties;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;

@SpringBootApplication
public class Lider2Application extends SpringBootServletInitializer {

	@Override
	protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
		return application.sources(Lider2Application.class)
				.sources(Lider2Application.class)
				.properties(getProperties());
	}

	public static void main(String[] args) {
		new SpringApplicationBuilder(Lider2Application.class)
		.sources(Lider2Application.class)
		.properties(getProperties())
		.run(args);
	}


	static Properties getProperties() {
		Properties props = new Properties();
		props.put("spring.config.location","file:/etc/lider/lider.properties");
		return props;
	}

}
