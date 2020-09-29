package acpmanager.logfilter;

import java.util.Calendar;

/**
 *  This class provides a username and date range filter
 */
public class LogFilterDaterangeUsername extends LogFilterDaterange {
    String username;

    public LogFilterDaterangeUsername(int offset, int rows, Calendar calendarFrom, Calendar calendarTill, String username) {
        super(offset, rows, calendarFrom, calendarTill);
        this.username = username;
    }

    /**
     * This method is called when getLogs is skipping the offset
     * if the associated user in the log line is the same as username, increase logNumber
     *
     * @param line row of a log file
     */
    @Override
    protected void skipOffset(String line) {
        Log tempLog = parseLog(line);
        if(tempLog.username.equals(username)){
            logNumber++;
        }

    }

    /**
     **This method is called when getLogs is reading logs
     * if the associated user in the log line is the same as username,
     * increase logNumber and arrayIndex and save the log in ret
     *
     * @param line row of a log file
     */
    @Override
    protected void readLog(String line) {
        Log tempLog = parseLog(line);
        if(tempLog.username.equals(username)){
            ret[arrayIndex] = parseLog(line);
            logNumber++;
            arrayIndex++;
        }
    }

}
