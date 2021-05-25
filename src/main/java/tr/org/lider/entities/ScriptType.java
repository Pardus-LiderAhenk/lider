package tr.org.lider.entities;

/**
 * This enum is used to indicate script file type.
 * 
 *
 */
public enum ScriptType {

	BASH(1), PYTHON(2), PERL(3), RUBY(4), POWERSHELL(5);

	private int id;

	private ScriptType(int id) {
		this.id = id;
	}

	public int getId() {
		return id;
	}

	/**
	 * Provide mapping enums with a fixed ID in JPA (a more robust alternative
	 * to EnumType.String and EnumType.Ordinal)
	 * 
	 * @param id
	 * @return related SessionEvent enum
	 * @see http://blog.chris-ritchie.com/2013/09/mapping-enums-with-fixed-id-in
	 *      -jpa.html
	 * 
	 */
	public static ScriptType getType(Integer id) {
		if (id == null) {
			return null;
		}
		for (ScriptType type : ScriptType.values()) {
			if (id.equals(type.getId())) {
				return type;
			}
		}
		throw new IllegalArgumentException("No matching type for id: " + id);
	}

}
