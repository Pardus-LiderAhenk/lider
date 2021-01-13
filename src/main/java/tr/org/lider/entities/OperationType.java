package tr.org.lider.entities;
public enum OperationType {
	CREATE(1), READ(2), UPDATE(3), DELETE(4), LOGIN(5), LOGOUT(6), EXECUTE_TASK(7), EXECUTE_POLICY(8), CHANGE_PASSWORD(9), MOVE(10), UNASSIGMENT_POLICY(11);

	private int id;

	private OperationType(int id) {
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
	 * @return related CrudType enum
	 * @see http://blog.chris-ritchie.com/2013/09/mapping-enums-with-fixed-id-in
	 *      -jpa.html
	 * 
	 */
	public static OperationType getType(Integer id) {
		if (id == null) {
			return null;
		}
		for (OperationType crudType : OperationType.values()) {
			if (id.equals(crudType.getId())) {
				return crudType;
			}
		}
		throw new IllegalArgumentException("No matching type for id: " + id);
	}

}
