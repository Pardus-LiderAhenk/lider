package tr.org.lider.messaging.messages;

public class SessionInfo {
	 //jid' => $this->jid, 'sid' => $this->sid, 'rid' => $this->rid);
	    private String jid;
	    private String rid;
	    private String sid;

	    /**
	     * @return the jid
	     */
	    public String getJid() {
	        return jid;
	    }

	    /**
	     * @param jid the jid to set
	     */
	    public void setJid(String jid) {
	        this.jid = jid;
	    }

	    /**
	     * @return the rid
	     */
	    public String getRid() {
	        return rid;
	    }

	    /**
	     * @param rid the rid to set
	     */
	    public void setRid(String rid) {
	        this.rid = rid;
	    }

	    public void setRid(Long rid) {
	        this.rid = Long.toString(rid);
	    }
	    /**
	     * @return the sid
	     */
	    public String getSid() {
	        return sid;
	    }

	    /**
	     * @param sid the sid to set
	     */
	    public void setSid(String sid) {
	        this.sid = sid;
	    }
	    
	    
	}
