package tr.org.lider.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import tr.org.lider.entities.Message;


/**
 *
 */
public interface MessageRepository extends JpaRepository<Message, Integer>{

}
