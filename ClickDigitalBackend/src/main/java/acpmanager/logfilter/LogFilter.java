package acpmanager.logfilter;

import exceptions.MissingDatabaseEntryException;
import services.LogConstants;
import services.UtilityService;
import usermanager.User;

import java.io.File;
import java.util.Calendar;
import java.util.GregorianCalendar;

import static com.mongodb.client.model.Filters.eq;
import static services.UtilityService.*;
import static services.UtilityService.loadUserFromDatabase;

/**
 * This abstract class provides useful methods for filtering logs
 */
public abstract class LogFilter {
    /**
     * the maximum time the readLog method runs, after the time is up, ret gets returned
     */
    protected  static  final long MAXDELAYMILLIS =  6000;
    /**
     * interval in hours of the roll over of the log file
     */
    protected static final int interval = 1;

    protected static final String FIELDUSERID = "userId";
    protected static final String LOGFILEPATH = "logs/";
    protected static final String CURRENTLOGFILEPATH = LOGFILEPATH + "current.log";
    /**
     * is set when the timer starts
     */
    protected long start = 0;
    /**
     * states when the timer is up
     */
    protected long end = Long.MAX_VALUE;
    /**
     * calendar with the current time
     */
    protected Calendar currCalendar = new GregorianCalendar();
    /**
     * calendar with the time of the current log
     */
    protected Calendar currLogTimeCalendar = null;
    /**
     * first date of the date range
     */
    protected Calendar calendarFrom;
    /**
     * second date of the date range
     */
    protected Calendar calendarTill;

    /**
     * time of the calendar calendarFrom
     */
    int yearFrom;
    int monthFrom;
    int dayFrom;
    int hourFrom;
    int minuteFrom;

    /**
     * time of the calendar calendarTill
     */
    int yearTill;
    int monthTill;
    int dayTill;
    int hourTill;
    int minuteTill;

    /**
     * the directory that is currently being searched
     */
    File dir;

    /**
     * the array of logs that is going to be returned
     */
    Log[] ret;
    /**
     * index of ret
     */
    int arrayIndex = 0;
    /**
     * total number of logs that the algorithm has found with the filter
     */
    int logNumber = 0;
    /**
     * length of ret
     */
    int rows;
    /**
     * how many logs to skip
     */
    int offset;


    LogFilter(int offset, int rows, Calendar calendarFrom, Calendar calendarTill) {
        this.rows = rows;
        this.offset = offset;
        this.calendarFrom = calendarFrom;
        this.calendarFrom.set(Calendar.MILLISECOND, 0);
        this.calendarTill = calendarTill;
        currCalendar.set(Calendar.MINUTE, 0);
        currCalendar.set(Calendar.SECOND, 0);
        currCalendar.set(Calendar.MILLISECOND, 0);
        currLogTimeCalendar = new GregorianCalendar();
        currLogTimeCalendar.setTimeInMillis(calendarFrom.getTimeInMillis());
        currLogTimeCalendar.add(Calendar.HOUR_OF_DAY, -1);

        yearFrom = (calendarFrom.get(Calendar.YEAR));
        monthFrom = (calendarFrom.get(Calendar.MONTH) + 1);
        dayFrom = (calendarFrom.get(Calendar.DAY_OF_MONTH));
        hourFrom = (calendarFrom.get(Calendar.HOUR_OF_DAY));
        minuteFrom = (calendarFrom.get(Calendar.MINUTE));

        yearTill = (calendarTill.get(Calendar.YEAR));
        monthTill = (calendarTill.get(Calendar.MONTH) + 1);
        dayTill = (calendarTill.get(Calendar.DAY_OF_MONTH));
        hourTill = (calendarTill.get(Calendar.HOUR_OF_DAY));
        minuteTill = (calendarTill.get(Calendar.MINUTE));

        // fill ret with empty logs
        ret = new Log[rows];
        for(int i = 0; i < ret.length; i++)
            ret[i] = new Log();

        dir = findFirstFile();
     }


    /**
     * This method returns the next file in the given date range
     *
     * @return the next file, if there are no more files or if there is no file in the given date range return null
     */
    protected File getNextFile() {
        if(dir.getPath().equals(CURRENTLOGFILEPATH))
            return null;
        addIntervalToCalendar();
        return findExistingFile();
    }

    /**
     * This method returns the first file in the given date range
     *
     * @return the first file, if there is no file or if there is no file in the given date range return null
     */
    protected File findFirstFile() {
        return findExistingFile();
    }

    /**
     * This method returns the first file in the date range
     *
     * @return the first file in the date range, if there is no file in the given date range return null
     */
    private File findExistingFile() {
        File tempDir = buildFile();
        while (!tempDir.exists()) {
            // change file
            // the first file is the current log file
            if(calendarFrom.compareTo(currCalendar) >= 0) {
                if(tempDir.getPath().equals(CURRENTLOGFILEPATH)){
                    return null;
                }
                tempDir = new File(CURRENTLOGFILEPATH);
            }
            // next file
            else {
                addIntervalToCalendar();
                tempDir = buildFile();
            }
            // there are no logs in the given date range -> return null
            if(!tempDir.exists() && calendarFrom.compareTo(calendarTill) > 0) {
                return null;
            }
        }
        return tempDir;
    }

    /**
     * This method states if the user can be found in the database
     *
     * @param userID of the user that is being checked
     * @return true if user is in the database, false if the user is not in the database
     */
    protected boolean userExists(String userID) {

        return getDatabase(UtilityService.PropertyKeys.BACKEND_DATABASE_NAME).
                getCollection(USERCOLLECTIONSTRING, User.class).find(eq(FIELDUSERID, userID)).first() != null;
    }

    /**
     * This method builds a log from the given string and returns it
     *
     * @param textLog line of a log file
     * @return the log built from the row of the log file, empty log if the string can not be parsed
     */
    protected Log parseLog(String textLog) {
        // date         Leerzeichen
        // priority     Leerzeichen
        // source       Leerzeichen
        // Bindestrich  Leerzeichen
        // username     Leerzeichen
        // action       Leerzeichen
        // object       Leerzeichen
        // status

        String[] array = textLog.split(" ");
        if(array.length == 8) {
            User activeUser = null;
            User object = null;

            if(userExists(array[4])) {
                try {
                    activeUser = loadUserFromDatabase(array[4], null);
                } catch (MissingDatabaseEntryException e) {
                }
            }
            if(userExists(array[6])) {
                try {
                    object = loadUserFromDatabase(array[6], null);
                } catch (MissingDatabaseEntryException e) {
                }
            }
            if(activeUser == null && object == null)
                return new Log(array[0], array[1], array[2], LogConstants.EMPTY_FIELD, array[5], array[6], array[7]);
            if ((activeUser == null && object != null))
                return new Log(array[0], array[1], array[2], LogConstants.EMPTY_FIELD, array[5], object.username, array[7]);
            if(activeUser != null && object == null)
                return new Log(array[0], array[1], array[2], activeUser.username, array[5], array[6], array[7]);
            return new Log(array[0], array[1], array[2], activeUser.username, array[5], object.username, array[7]);
        }
        return new Log();
    }


    /**
     * This method gets a row of a log file and returns an array with day, month, year, hour, minute and seconds
     *
     * @param textLog row of a log file
     * @return an array with day, month, year, hour, minute and seconds of the log
     */
    protected String[] parseLogDate(String textLog) {
        String[] time;
        String[] date;
        String[] temp = textLog.split(",");
        temp = temp[0].split("T");
        date = temp[0].split("-");
        time = temp[1].split(":");
        return new String[]{date[0], date[1], date[2], time[0], time[1], time[2]};
    }


    /**
     * This method gets a number and returns it as string, if number < 10 put a 0 before the number
     *
     * @param number
     * @return number as string, if number < 10 return 0number
     */
    private String getCorrectString(int number) {
        if(number < 10)
            return "0" + number;
        return "" + number;
    }

    /**
     * This method adds interval hours to calendarFrom, sets the variables of calendarFrom
     */
    protected void addIntervalToCalendar() {
        calendarFrom.add(Calendar.HOUR_OF_DAY, interval);
        calendarFrom.set(Calendar.MINUTE, 0);
        yearFrom = (calendarFrom.get(Calendar.YEAR));
        monthFrom = (calendarFrom.get(Calendar.MONTH) + 1);
        dayFrom = (calendarFrom.get(Calendar.DAY_OF_MONTH));
        hourFrom = (calendarFrom.get(Calendar.HOUR_OF_DAY));
        minuteFrom = (calendarFrom.get(Calendar.MINUTE));
    }

    /**
     * This method builds a file where the next logs in the date range are located
     *
     * @return file where the next logs in the date range are located
     */
    protected File buildFile() {
        return new File(LOGFILEPATH + getCorrectString(yearFrom) + "-" + getCorrectString(monthFrom)
                + "-" + getCorrectString(dayFrom) + "-" + getCorrectString(hourFrom));
    }

    /**
     * This method sets the currLogTimeCalendar to the time the log was made
     *
     * @param log line of a log file
     */
    protected void setCurrLogTimeCalendar(String log) {
        if(log != null && !log.isEmpty()) {
            currLogTimeCalendar = stringToCalendar(log);
        }
    }

    /**
     * This method builds a calendar from the time the log was made
     *
     * @param log line of a log file
     * @return calendar with the time the log was made
     */
    private Calendar stringToCalendar(String log) {
        String[] currLogDate = parseLogDate(log);
        return new GregorianCalendar(Integer.parseInt(currLogDate[0]), Integer.parseInt(currLogDate[1]) - 1,
                Integer.parseInt(currLogDate[2]), Integer.parseInt(currLogDate[3]), Integer.parseInt(currLogDate[4]),
                Integer.parseInt(currLogDate[5]));
    }

    /**
     * This method implements the filter algorithm
     *
     * @return the array with the filtered logs
     */
    public Log[] getLogs(){return ret;}

    /**
     * This method ets the timer with MAXDELAYMILLIS
     */
    protected void setTimer() {
        start = System.currentTimeMillis();
        end = start + MAXDELAYMILLIS;
    }
}
