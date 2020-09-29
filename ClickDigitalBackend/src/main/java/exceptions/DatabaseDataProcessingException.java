package exceptions;

import acpmanager.logfilter.Log;
import org.apache.logging.log4j.Level;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import services.LogConstants;

import javax.ws.rs.core.Response;
import java.io.Serializable;

/**
 *
 */
public class DatabaseDataProcessingException extends Exception implements Serializable {
    private static final long serialVersionUID = 1L;
    private static final Logger logger = LogManager.getLogger(DatabaseDataProcessingException.class.getName());

    private Response.Status ResponseStatus = Response.Status.INTERNAL_SERVER_ERROR;
    public DatabaseDataProcessingException(){
        super();
        logger.log(Level.ERROR, new Log(LogConstants.EMPTY_FIELD, DatabaseDataProcessingException.class.getName(), LogConstants.EMPTY_FIELD, LogConstants.EMPTY_FIELD));
    }
    public DatabaseDataProcessingException(String msg){
        super(msg);
        logger.log(Level.ERROR, new Log(LogConstants.EMPTY_FIELD, DatabaseDataProcessingException.class.getName(), LogConstants.EMPTY_FIELD, LogConstants.EMPTY_FIELD));
    }
    public DatabaseDataProcessingException(String msg, Exception e){
        super(msg, e);
        logger.log(Level.ERROR, new Log(LogConstants.EMPTY_FIELD, DatabaseDataProcessingException.class.getName(), LogConstants.EMPTY_FIELD, LogConstants.EMPTY_FIELD));
    }
    public DatabaseDataProcessingException(String msg, Response.Status responseStatus){
        super(msg);
        this.ResponseStatus = responseStatus;
        logger.log(Level.ERROR, new Log(LogConstants.EMPTY_FIELD, DatabaseDataProcessingException.class.getName(), LogConstants.EMPTY_FIELD, LogConstants.EMPTY_FIELD));
    }

    public Response.Status getResponseStatus(){
        return this.ResponseStatus;
    }
}
