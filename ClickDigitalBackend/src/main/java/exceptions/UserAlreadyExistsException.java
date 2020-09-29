package exceptions;

import acpmanager.logfilter.Log;
import org.apache.logging.log4j.Level;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import services.LogConstants;

import java.io.Serializable;

/**
 * This exception is used to communicate that there was an error trying to create a User.
 */
public class UserAlreadyExistsException extends Exception implements Serializable {
    private static final long serialVersionUID = 1L;
    private static final Logger logger = LogManager.getLogger(UserAlreadyExistsException.class.getName());

    // Standard exception constructors
    public UserAlreadyExistsException() {
        super();
        logger.log(Level.ERROR, new Log(LogConstants.EMPTY_FIELD, UserAlreadyExistsException.class.getName(), LogConstants.EMPTY_FIELD, LogConstants.EMPTY_FIELD));
    }
    public UserAlreadyExistsException(String msg){
        super(msg);
        logger.log(Level.ERROR, new Log(LogConstants.EMPTY_FIELD, UserAlreadyExistsException.class.getName(), LogConstants.EMPTY_FIELD, LogConstants.EMPTY_FIELD));
    }
    public UserAlreadyExistsException(String msg, Exception e){
        super(msg, e);
        logger.log(Level.ERROR, new Log(LogConstants.EMPTY_FIELD, UserAlreadyExistsException.class.getName(), LogConstants.EMPTY_FIELD, LogConstants.EMPTY_FIELD));
    }
}
