package exceptions;

import acpmanager.logfilter.Log;
import org.apache.logging.log4j.Level;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import services.LogConstants;

import java.io.Serializable;

/**
 * This exception is thrown if an identification number was invalid.
 */
public class InvalidIdentificationNumberException extends Exception implements Serializable {
    private static final long serialVersionUID = 1L;
    private static final Logger logger = LogManager.getLogger(InvalidIdentificationNumberException.class.getName());
    public InvalidIdentificationNumberException() {
        super();
        logger.log(Level.ERROR, new Log(LogConstants.EMPTY_FIELD, InvalidIdentificationNumberException.class.getName(), LogConstants.EMPTY_FIELD, LogConstants.EMPTY_FIELD));
    }
    public InvalidIdentificationNumberException(String msg){
        super(msg);
        logger.log(Level.ERROR, new Log(LogConstants.EMPTY_FIELD, InvalidIdentificationNumberException.class.getName(), LogConstants.EMPTY_FIELD, LogConstants.EMPTY_FIELD));
    }
    public InvalidIdentificationNumberException(String msg, Exception e){
        super(msg, e);
        logger.log(Level.ERROR, new Log(LogConstants.EMPTY_FIELD, InvalidIdentificationNumberException.class.getName(), LogConstants.EMPTY_FIELD, LogConstants.EMPTY_FIELD));
    }
}
