package anomalymanager.nupic.network.sensor;

import anomalymanager.nupic.util.Tuple;

/**
 * Contains rows of immutable {@link Tuple}s
 * 

 */
public interface ValueList {
    /** 
     * Returns a collection of values in the form of a {@link Tuple}
     * @return Tuple of values 
     */
    public Tuple getRow(int row);
    /**
     * Returns the number of rows.
     * @return the number of rows
     */
    public int size();
    
}
