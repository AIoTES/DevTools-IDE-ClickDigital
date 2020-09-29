package devicemanager;

import java.util.function.Predicate;

/**
 * This class provides predicates to validate input.
 */
public class Predicates {

    /**
     * Checks if an id is valid.
     * @return a predicate
     */
    public static Predicate<String> isValidId(){
        return (String id)->(id !=null && !id.equals(""));
    }
}
