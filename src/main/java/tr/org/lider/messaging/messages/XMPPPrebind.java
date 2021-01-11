package tr.org.lider.messaging.messages;


import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.StringReader;
import java.io.StringWriter;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.util.Random;
import java.util.concurrent.ExecutionException;

import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLException;
import javax.net.ssl.SSLSession;
import javax.net.ssl.SSLSocket;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.conn.ClientConnectionManager;
import org.apache.http.conn.scheme.Scheme;
import org.apache.http.conn.scheme.SchemeRegistry;
import org.apache.http.conn.ssl.SSLSocketFactory;
import org.apache.http.conn.ssl.X509HostnameVerifier;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.w3c.dom.Attr;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

public class XMPPPrebind {

    private String jabberHost = "";
    private String boshUrl = "";
    private String boshPort;
    private String resource = "";
    private String jid = "";
    private String password = "";
    private String xmppDomain;
    private Long rid;
    private String sid = "";
    private boolean doDebug = false;
    private boolean useSsl = false;
    private int waitTime = 60;
    private DefaultHttpClient httpClient;
    /*
     * Static strings used to build the XMPP messages
     * 
     */
    String XMLNS_BODY = "http://jabber.org/protocol/httpbind";
    static final String XMLNS_BOSH = "urn:xmpp:xbosh";
    static final String XMLNS_CLIENT = "jabber:client";
    static final String XMLNS_SESSION = "urn:ietf:params:xml:ns:xmpp-session";
    static final String XMLNS_BIND = "urn:ietf:params:xml:ns:xmpp-bind";
    static final String XMLNS_SASL = "urn:ietf:params:xml:ns:xmpp-sasl";
    static final String XMLNS_VCARD = "vcard-temp";
    static final String XML_LANG = "en";
    static final String CONTENT_TYPE = "text/xml charset=utf-8";
    static final String ENCRYPTION_PLAIN = "PLAIN";
    static final String SERVICE_NAME = "xmpp";
    private static final byte UTF8NUL = 0x00;

    private boolean doSession = false;
    private boolean doBind    = false;
    private Random random;
    
    public XMPPPrebind(String jabberHost, String xmppDomain, String boshUrl, String boshPort, String resource) throws Exception {
        this(jabberHost, xmppDomain, boshUrl, boshPort, resource, false, false);

    }

    public XMPPPrebind(String jabberHost, String xmppDomain, String boshUrl, String boshPort, String resource, boolean useSsl) throws Exception {
        this(jabberHost, xmppDomain, boshUrl, boshPort, resource, useSsl, false);
    }

    public XMPPPrebind(String jabberHost, String xmppDomain, String boshPath, String boshPort, String resource, boolean useSsl, boolean doDebug) throws Exception {
        try {
            this.xmppDomain = xmppDomain;
            this.jabberHost = jabberHost;
            if (useSsl) {
                this.boshUrl = "https://" + jabberHost + ":" + boshPort + boshPath;
            } else {
                this.boshUrl = "http://" + jabberHost + ":" + boshPort + boshPath;
            }

            this.boshPort = boshPort;
            this.resource = resource;
            this.useSsl = useSsl;
            this.doDebug = doDebug;

        } catch (Exception ex) {
            throw new Exception("Could not create BoshURI: " + ex);
        }
        /*
         * The client MUST generate a large, random, positive integer for the initial 'rid' (see Security Considerations)
         * and then increment that value by one for each subsequent request. The client MUST take care to choose an
         * initial 'rid' that will never be incremented above 9007199254740991 [21] within the session.
         * In practice, a session would have to be extraordinarily long (or involve the exchange of an extraordinary
         * number of packets) to exceed the defined limit.
         *
         * @link http://xmpp.org/extensions/xep-0124.html#rids
         */
        random = new Random();
        this.rid = nextLong(random, 10000000);
        
        this.resource= new Long(this.rid).toString();

    }

    /**
     * connect to the jabber server with the supplied username & password
     *
     * @param string $username Username without jabber host
     * @param string $password Password
     */


    public void writeDebug(String logMessage) {
        // This should be replaced with a real logger, but for now it's going to system.out
        //System.out.println(logMessage);
    }

    public boolean connect(String username, String password) throws Exception {
        this.jid = username + "@" + this.xmppDomain + "/" + this.resource;
        this.password = password;
        String response = sendInitialConnection();
        if (response == null) {
            throw new XMPPPrebindException("Could not create inital connection");
        } else {
            Element body = getBodyFromXml(response);
            this.sid = body.getAttribute("sid");
            if (doDebug) {
                writeDebug("Connection got SID: " + this.sid);
            }

        }
        return true;

    }

    /**
     * Try to authenticate
     *
     * @throws XmppPrebindException if invalid login
     * @return bool
     */
    public boolean auth() throws XMPPPrebindException {
        /* Only do PLAIN for now - I'll add the others if needed */
        try {
            Document auth = buildPlainAuth();
            String response = sendDocument(auth);
            Element body = getBodyFromXml(response);
            if (!body.hasChildNodes() || !body.getFirstChild().getNodeName().contains("success")) {
                throw new XMPPPrebindException("Invalid Login");
            }
            sendRestart();
            sendBindIfRequired();
            sendSessionIfRequired();
        } catch (Exception ex) {
            if (doDebug) {
                writeDebug("Could not authenticate:" + ex);
            }
            throw new XMPPPrebindException("Could not authenticate:" + ex);
        }
        return true;
    }

    /**
     * Get jid, sid and rid for attaching
     *
     * @return array
     */
    public SessionInfo getSessionInfo() {
        SessionInfo sessionInfo = new SessionInfo();
        sessionInfo.setJid(this.jid);
        sessionInfo.setRid(this.rid);
        sessionInfo.setSid(this.sid);
        return sessionInfo;
    }

    /**
     * Send xmpp restart message after successful auth
     *
     * @return string Response
     */
    private void sendRestart() throws XMPPPrebindException {

        Document doc = buildBody();
        Element body = getBodyFromDomDocument(doc);
        body.setAttributeNode(getNewTextAttribute(doc, "to", this.jabberHost));
        body.setAttributeNode(getNewTextAttribute(doc, "xmlns:xmpp", XMLNS_BOSH));
        body.setAttributeNode(getNewTextAttribute(doc, "xmpp:restart", "true"));
        try {
            String restartResponse = sendDocument(doc);
            Element restartResponseXML = getBodyFromXml(restartResponse);
            NodeList nodeList = restartResponseXML.getChildNodes();
            for (int i = 0, len = nodeList.getLength(); i < len; i++) {
                Node currentNode = nodeList.item(i);
                if (currentNode.getNodeName().contentEquals("stream:features")) {
                    for (int j = 0; j < currentNode.getChildNodes().getLength(); j++) { 
                        Node childNode = currentNode.getChildNodes().item(j);
                        if (childNode.getNodeName().contentEquals("bind")) {
                            this.doBind = true;
                            if (doDebug) writeDebug("Setting doBind to TRUE");
                        } else if (childNode.getNodeName().contentEquals("session")) {
                            this.doSession = true;
                            if (doDebug) writeDebug("Setting doSession to TRUE");
                        }
                    }
                }
            }
            
        } catch (Exception ex) {
            if (doDebug) {
                writeDebug("Error sending restart: " + ex);
            }
            throw new XMPPPrebindException("Could not send restart packet: " + ex);
        }
    }

    private void sendBindIfRequired() throws XMPPPrebindException {
        if (doBind) {
            Document doc = buildBody();
            Element body = getBodyFromDomDocument(doc);
            Element iq = doc.createElement("iq");
            iq.setAttributeNode(getNewTextAttribute(doc, "xmlns", XMLNS_CLIENT));
            iq.setAttributeNode(getNewTextAttribute(doc, "type", "set"));

            iq.setAttributeNode(getNewTextAttribute(doc, "id", "bind_" + random.nextInt(Integer.MAX_VALUE)));
            Element bind = doc.createElement("bind");
            bind.setAttributeNode(getNewTextAttribute(doc, "xmlns", XMLNS_BIND));
            Element resource = doc.createElement("resource");
            resource.appendChild(doc.createTextNode(this.resource));
            bind.appendChild(resource);
            iq.appendChild(bind);
            doc.getDocumentElement().appendChild(iq);
            try {
                sendDocument(doc);
            } catch (Exception ex) {
                throw new XMPPPrebindException("Could not sendBind: " + ex);

            }

        }

    }

    /**
     * Send session if there's a session node in the restart response (within
     * stream:features)
     */
    private void sendSessionIfRequired() throws XMPPPrebindException {
        if (doSession) {
            Document doc = buildBody();
            Element body = getBodyFromDomDocument(doc);
            Element iq = doc.createElement("iq");
            iq.setAttributeNode(getNewTextAttribute(doc, "xmlns", XMLNS_CLIENT));
            iq.setAttributeNode(getNewTextAttribute(doc, "type", "set"));

            iq.setAttributeNode(getNewTextAttribute(doc, "id", "session_auth_" + random.nextInt(Integer.MAX_VALUE )));
            Element session = doc.createElement("session");
            session.setAttributeNode(getNewTextAttribute(doc, "xmlns", XMLNS_SESSION));
            iq.appendChild(session);
            doc.getDocumentElement().appendChild(iq);
            try {
                sendDocument(doc);
            } catch (Exception ex) {
                throw new XMPPPrebindException("Could not sendBind: " + ex);

            }
        }

    }

    
    /**
     * Send initial connection string
     *
     * @return string Response
     */
    private String sendInitialConnection() throws XMPPPrebindException {
        try {
            Document doc = buildBody();

            Element body = getBodyFromDomDocument(doc);

            body.setAttributeNode(getNewTextAttribute(doc, "hold", "1"));
            body.setAttributeNode(getNewTextAttribute(doc, "to", this.xmppDomain));
            body.setAttributeNode(getNewTextAttribute(doc, "xmlns:xmpp", XMLNS_BOSH));
            body.setAttributeNode(getNewTextAttribute(doc, "xmpp:version", "1.0"));
            body.setAttributeNode(getNewTextAttribute(doc, "wait", "" + waitTime));
            String response = sendDocument(doc);
            if (doDebug) writeDebug(response);
            return response;
        } catch (Exception ex) {
            if (doDebug) {
                writeDebug("Exception sending inital connection: " + ex);
            }
            throw new XMPPPrebindException("Could not send inital connection: " + ex);
        }


    }

    private String sendDocument(Document doc) throws Exception {
        StringWriter writer = new StringWriter();
        TransformerFactory tf = TransformerFactory.newInstance();
        Transformer transformer = tf.newTransformer();
        transformer.transform(new DOMSource(doc), new StreamResult(writer));
        httpClient = buildHttpClient();
        HttpPost httppost = new HttpPost(this.boshUrl);
        if (doDebug) {
            writeDebug("----- Sending --------");
            writeDebug(writer.toString());
            writeDebug("-----         --------");
        }
        StringEntity requestEntity = new StringEntity(writer.toString(), ContentType.TEXT_XML);
        httppost.setEntity(requestEntity);
        HttpResponse response = httpClient.execute(httppost);
        HttpEntity httpEntity = response.getEntity();
        InputStream instream = httpEntity.getContent();
        String reply = readHttpStream(instream);
        if (doDebug) {
            writeDebug("----- Received --------");
            writeDebug(reply);
            writeDebug("-----          --------");
        }
        httppost.abort();
        return reply;
    }

    private Document buildPlainAuth() throws XMPPPrebindException {

        String authString;
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        try {
            outputStream.write(this.jid.getBytes());
            outputStream.write(UTF8NUL);
            outputStream.write(getNodeFromJid(this.jid).getBytes());
            outputStream.write(UTF8NUL);
            outputStream.write(password.getBytes());
            authString = Base64.encodeToString(outputStream.toByteArray(), false);
        } catch (Exception ex) {
            throw new XMPPPrebindException("Could not build PLAIN AUTH string");
        }
        if (doDebug) {
            writeDebug("PLAIN Auth String: " + authString);
        }
        Document doc = buildBody();
        Element auth = doc.createElement("auth");
        doc.getDocumentElement().appendChild(auth);
        auth.setAttributeNode(getNewTextAttribute(doc, "xmlns", XMLNS_SASL));
        auth.setAttributeNode(getNewTextAttribute(doc, "mechanism", ENCRYPTION_PLAIN));
        auth.appendChild(doc.createTextNode(authString));
        return doc;
    }

    /**
     * Build DOMDocument with standard xmpp body child node.
     *
     * @return DOMDocument
     */
    private Document buildBody() throws XMPPPrebindException {
        try {
            DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = dbf.newDocumentBuilder();
            Document doc = builder.newDocument();
            doc.setXmlVersion("1.0");
            Element body = doc.createElement("body");
            doc.appendChild(body);
            body.setAttributeNode(getNewTextAttribute(doc, "xmlns", XMLNS_BODY));
            body.setAttributeNode(getNewTextAttribute(doc, "content", CONTENT_TYPE));
            body.setAttributeNode(getNewTextAttribute(doc, "rid", Long.toString(getAndIncrementRid())));
            body.setAttributeNode(getNewTextAttribute(doc, "xml:lang", XML_LANG));
            if (!this.sid.isEmpty()) {
                body.setAttributeNode(getNewTextAttribute(doc, "sid", this.sid));
            }

            return doc;
        } catch (Exception ex) {
            if (doDebug) {
                writeDebug("Exception in buildBody: " + ex);
            }
            throw new XMPPPrebindException("Could not build XML document body");
        }

    }

    /**
     * Get jid in form of username@jabberHost
     *
     * @param string $jid Jid in form username@jabberHost/Resource
     * @return string JID
     */
    public static String getBareJidFromJid(String jid) {
        if (jid.isEmpty()) {
            return null;
        } else {
            return jid.substring(0, jid.indexOf("/"));
        }

    }

    /**
     * Get node (username) from jid
     *
     * @param string $jid
     * @return string Node
     */
    public static String getNodeFromJid(String jid) {
        if (!jid.contains("@")) {
            return null;
        } else {
            return jid.substring(0, jid.indexOf("@"));
        }
    }

    /**
     * Append new attribute to existing DOMDocument.
     *
     * @param DOMDocument $domDocument
     * @param string $attributeName
     * @param string $value
     * @return DOMNode
     */
    private static Attr getNewTextAttribute(Document domDocument, String attributeName, String value) {
        Attr attr = domDocument.createAttribute(attributeName);
        attr.appendChild(domDocument.createTextNode(value));
        return attr;

    }

    /**
     * Get body node from DOMDocument
     *
     * @param DOMDocument $domDocument
     * @return DOMNode
     */
    private Element getBodyFromDomDocument(Document domDocument) {
        return (Element) domDocument.getElementsByTagName("body").item(0);
    }

    /**
     * Parse XML and return DOMNode of the body
     *
     * @uses XmppPrebind::getBodyFromDomDocument()
     * @param string $xml
     * @return DOMNode
     */
    private Element getBodyFromXml(String xml) throws Exception {
        if (doDebug) {
            writeDebug("------ Parsing XML ---------");
            writeDebug(xml);
            writeDebug("------             ---------");
        }
        DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();

        DocumentBuilder builder = dbf.newDocumentBuilder();
        InputSource is = new InputSource();
        is.setCharacterStream(new StringReader(xml));

        Document doc = builder.parse(is);
        return getBodyFromDomDocument(doc);


    }

    /**
     * Get the rid and increment it by one. Required by RFC
     *
     * @return int
     */
    private Long getAndIncrementRid() {
        return this.rid++;

    }

    public DefaultHttpClient buildHttpClient() throws ExecutionException, NoSuchAlgorithmException, KeyManagementException {
        this.httpClient = new DefaultHttpClient();

        if (this.useSsl) {
            /* This is techncially bad - we shouldn't accept all certs */
            X509HostnameVerifier verifier = new X509HostnameVerifier() {
                @Override
                public void verify(String string, SSLSocket ssls) throws IOException {
                }

                @Override
                public void verify(String string, X509Certificate xc) throws SSLException {
                }

                @Override
                public void verify(String string, String[] strings, String[] strings1) throws SSLException {
                }

                @Override
                public boolean verify(String string, SSLSession ssls) {
                    return true;
                }
            };

            X509TrustManager tm = new X509TrustManager() {
                @Override
                public void checkClientTrusted(X509Certificate[] xcs, String string) throws CertificateException {
                }

                @Override
                public void checkServerTrusted(X509Certificate[] xcs, String string) throws CertificateException {
                }

                @Override
                public X509Certificate[] getAcceptedIssuers() {
                    return null;
                }
            };
            SSLContext ctx = SSLContext.getInstance("TLS");
            ctx.init(null, new TrustManager[]{tm}, null);

            SSLSocketFactory ssf = new SSLSocketFactory(ctx);
            ssf.setHostnameVerifier(verifier);
            ClientConnectionManager ccm = httpClient.getConnectionManager();
            SchemeRegistry sr = ccm.getSchemeRegistry();
            sr.register(new Scheme("https", ssf, Integer.parseInt(this.boshPort)));
        }

        return httpClient;

    }

    public static String readHttpStream(InputStream in) throws IOException {
        StringBuilder sb = new StringBuilder();
        BufferedReader r = new BufferedReader(new InputStreamReader(in), 1000);
        for (String line = r.readLine(); line != null; line = r.readLine()) {
            sb.append(line);
        }
        in.close();
        return sb.toString();
    }

    long nextLong(Random rng, long n) {
        // error checking and 2^x checking removed for simplicity.
        long bits, val;
        do {
            bits = (rng.nextLong() << 1) >>> 1;
            val = bits % n;
        } while (bits - val + (n - 1) < 0L);
        return val;
    }
}

