package exceptions;

import acpmanager.logfilter.Log;
import org.apache.logging.log4j.Level;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import services.LogConstants;

import java.io.Serializable;

/**

 * This exception is used to notify the frontend of expired or invalid sessions
 */
public class InvalidSessionException extends Exception implements Serializable {
    private static final long serialVersionUID = 1L;
    private static final Logger logger = LogManager.getLogger(InvalidSessionException.class.getName());
    // Standard exception constructors
    public InvalidSessionException() {
        super();
        logger.log(Level.ERROR, new Log(LogConstants.EMPTY_FIELD, InvalidSessionException.class.getName(), LogConstants.EMPTY_FIELD, LogConstants.EMPTY_FIELD));
    }
    public InvalidSessionException(String msg){
        super(msg);
        logger.log(Level.ERROR, new Log(LogConstants.EMPTY_FIELD, InvalidSessionException.class.getName(), LogConstants.EMPTY_FIELD, LogConstants.EMPTY_FIELD));
    }
    public InvalidSessionException(String msg, Exception e){
        super(msg, e);
        logger.log(Level.ERROR, new Log(LogConstants.EMPTY_FIELD, InvalidSessionException.class.getName(), LogConstants.EMPTY_FIELD, LogConstants.EMPTY_FIELD));
    }
}
