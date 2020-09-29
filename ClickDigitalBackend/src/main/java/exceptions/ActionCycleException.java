package exceptions;

import acpmanager.logfilter.Log;
import org.apache.logging.log4j.Level;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import services.LogConstants;

import java.io.Serializable;

public class ActionCycleException extends Exception implements Serializable {
    private static final Logger logger = LogManager.getLogger(ActionCycleException.class.getName());
    private static final long serialVersionUID = 1L;
    public ActionCycleException() {
        super();
        logger.log(Level.ERROR, new Log(LogConstants.EMPTY_FIELD, ActionCycleException.class.getName(), LogConstants.EMPTY_FIELD, LogConstants.EMPTY_FIELD));

    }
    public ActionCycleException(String msg){
        super(msg);
        logger.log(Level.ERROR, new Log(LogConstants.EMPTY_FIELD, ActionCycleException.class.getName(), LogConstants.EMPTY_FIELD, LogConstants.EMPTY_FIELD));
    }
    public ActionCycleException(String msg, Exception e){
        super(msg, e);
        logger.log(Level.ERROR, new Log(LogConstants.EMPTY_FIELD, ActionCycleException.class.getName(), LogConstants.EMPTY_FIELD, LogConstants.EMPTY_FIELD));
    }
}
