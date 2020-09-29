package acpmanager.logfilter;

import java.io.BufferedReader;
import java.io.FileReader;
import java.util.Calendar;

/**
 * This class provides a date range filter
 */
public class LogFilterDaterange extends LogFilter {

    public LogFilterDaterange(int offset, int rows, Calendar calendarFrom, Calendar calendarTill) {
        super(offset, rows, calendarFrom, calendarTill);
    }

    /**
     * This method returns the filtered logs
     *
     * @return the filtered log, if the timer is up, stop filtering and return ret
     */
    public Log[] getLogs() {
        setTimer();
        // if there is no file return empty logs
        if(dir == null) {
            return ret;
        }
        try{
            BufferedReader reader = new BufferedReader(new FileReader(dir.getPath()));
            String line = reader.readLine();

            // if log file is empty find next file
            while(line == null || line.isEmpty()){
                reader.close();
                dir = getNextFile();
                if(dir == null)
                    return ret;
                reader = new BufferedReader(new FileReader(dir.getPath()));
                line = reader.readLine();
                if(System.currentTimeMillis() > end)
                    return ret;
            }

            // find correct time
            setCurrLogTimeCalendar(line);
            while(currLogTimeCalendar.compareTo(calendarFrom) < 0){
                if( line == null || line.isEmpty() ) {
                    // change File
                    reader.close();
                    dir = getNextFile();
                    if(dir == null)
                        return ret;
                    reader = new BufferedReader(new FileReader(dir.getPath()));
                }
                // change line
                line = reader.readLine();
                setCurrLogTimeCalendar(line);
                if(System.currentTimeMillis() > end)
                    return ret;
            }
            if(currLogTimeCalendar.compareTo(calendarTill) > 0){
                reader.close();
                return ret;
            }


            // skip offset logs
            while (logNumber < offset ) {
                if (currLogTimeCalendar.compareTo(calendarTill) > 0) {
                    reader.close();
                    return ret;
                }
                if (line == null || line.isEmpty()) {
                    // change File
                    reader.close();
                    dir = getNextFile();
                    if(dir == null)
                        return ret;
                    reader = new BufferedReader(new FileReader(dir.getPath()));
                } else {
                    // change line
                    skipOffset(line);
                }
                line = reader.readLine();
                setCurrLogTimeCalendar(line);
                if(System.currentTimeMillis() > end)
                    return ret;
            }
            setCurrLogTimeCalendar(line);
            if(currLogTimeCalendar.compareTo(calendarTill) > 0) {
                reader.close();
                return ret;
            }

            // read 'rows' logs
            int maxNameNumber = rows + offset;
            int arrayIndex = 0;
            while (logNumber < maxNameNumber ) {
                if (currLogTimeCalendar.compareTo(calendarTill) > 0) {
                    reader.close();
                    return ret;
                }
                if (line == null || line.isEmpty()) {
                    // change file
                    reader.close();
                    dir = getNextFile();
                    if(dir == null)
                        return ret;
                    reader = new BufferedReader(new FileReader(dir.getPath()));
                } else {
                    // change line
                    readLog(line);
                }
                line = reader.readLine();
                setCurrLogTimeCalendar(line);
                if(System.currentTimeMillis() > end)
                    return ret;
            }
            reader.close();
        }catch(Exception e){
        }
        return ret;
    }

    /**
     * This method is called if readLogs is skipping the offset
     * increases logNumber
     *
     * @param line row of a log file
     */
    protected void skipOffset(String line) {
        logNumber++;
    }

    /**
     * This method is called if readLogs is reading the logs
     * saves the current log in ret
     * increases logNumber
     * increases arrayIndex
     *
     * @param line row of a log file
     */
    protected void readLog(String line) {
        ret[arrayIndex] = parseLog(line);
        arrayIndex++;
        logNumber++;
    }

}
