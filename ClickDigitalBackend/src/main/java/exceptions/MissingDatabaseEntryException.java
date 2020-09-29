package exceptions;

import acpmanager.logfilter.Log;
import org.apache.logging.log4j.Level;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import services.LogConstants;

import java.io.Serializable;

/**
 * This exception is thrown when an entry, specified by the caller, was not found in database.
 */
public class MissingDatabaseEntryException extends Exception implements Serializable {
    private static final long serialVersionUID = 1L;
    private static final Logger logger = LogManager.getLogger(MissingDatabaseEntryException.class.getName());
    public MissingDatabaseEntryException() {
        super();
        logger.log(Level.ERROR, new Log(LogConstants.EMPTY_FIELD, MissingDatabaseEntryException.class.getName(), LogConstants.EMPTY_FIELD, LogConstants.EMPTY_FIELD));
    }
    public MissingDatabaseEntryException(String msg){
        super(msg);
        logger.log(Level.ERROR, new Log(LogConstants.EMPTY_FIELD, MissingDatabaseEntryException.class.getName(), LogConstants.EMPTY_FIELD, LogConstants.EMPTY_FIELD));
    }
    public MissingDatabaseEntryException(String msg, Exception e){
        super(msg, e);
        logger.log(Level.ERROR, new Log(LogConstants.EMPTY_FIELD, MissingDatabaseEntryException.class.getName(), LogConstants.EMPTY_FIELD, LogConstants.EMPTY_FIELD));
    }
}
