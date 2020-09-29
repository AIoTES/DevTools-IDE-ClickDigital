package anomalymanager.nupic.launcher;

import java.io.IOException;

import anomalymanager.nupic.Parameters;
import anomalymanager.nupic.algorithms.Anomaly;
import anomalymanager.nupic.algorithms.SpatialPooler;
import anomalymanager.nupic.algorithms.TemporalMemory;
import anomalymanager.nupic.network.Inference;
import anomalymanager.nupic.network.Network;
import anomalymanager.nupic.network.PublisherSupplier;
import anomalymanager.nupic.network.sensor.ObservableSensor;
import anomalymanager.nupic.network.sensor.Sensor;
import anomalymanager.nupic.network.sensor.SensorParams;
import anomalymanager.nupic.network.sensor.SensorParams.Keys;

import rx.Observer;

public class AnomalyDetector {
	int i = 0;

	public Network setupNetwork() throws IOException {




	    // Call your network creation method
	    Network network = getExampleNetwork();

	    // Subscribes and receives Network Output
	    network.observe().subscribe(new Observer<Inference>() {
	        @Override public void onCompleted() { /* Any finishing touches after Network is finished */ }
	        @Override public void onError(Throwable e) { /* Handle your errors here */ }
	        @Override public void onNext(Inference inf) {
	        	i++;

	            /* This is the OUTPUT of the network after each input has been "reacted" to. */
	        }
	    });


	    /////////////////////////////////////////////////////////
	    //   Network must be "started" when using a Publisher  //
	    /////////////////////////////////////////////////////////
	    network.start();

	    // This is the loop for inputting data into the network. This could be in another class, process, or thread though
	    // there should be only one thread pushing data to the network.
//	    while(data.hasNext()) {
//	        pub.onNext("your,comma-separated,data");
//
//	        // Sometimes you are entering more than one dataset or group of unrelated data, you will want
//	        // to reset inbetween so the HTM doesn't learn the transistion to the new group.
//	        network.reset(); //<--- If all your data is related, remove this line
//	    }
	    return network;
	}

	/**
	 * Example setup. Note: headers and parameters are your own and you will have tweak those
	 * to your own liking to suit whatever works best for you.
	 */
	private Network getExampleNetwork() {
		 Parameters p = NetworkDemoHarnesss.getParameters();
	        p = p.union(NetworkDemoHarnesss.getNetworkDemoTestEncoderParams());
		System.out.println("All Defaults:\n" + Parameters.getAllDefaultParameters());
		System.out.println("Spatial Defaults:\n" + Parameters.getSpatialDefaultParameters());
		System.out.println("Temporal Defaults:\n" + Parameters.getTemporalDefaultParameters());


	    Sensor<ObservableSensor<String[]>> sensor = Sensor.create(
	        ObservableSensor::create, SensorParams.create(Keys::obs, new Object[] {"name",
	            PublisherSupplier.builder()
	                .addHeader("timestamp, value")        // The "headers" are the titles of your comma separated fields; (could be "timestamp,consumption,location" for 3 fields)
	                .addHeader("datetime, float")           // The "Data Type" of the field (see FieldMetaTypes) (could be "datetime,float,geo" for 3 field types corresponding to above)
	                .addHeader("B").build() }));   // Special flag. "B" means Blank (see Tests for other examples)

	    Network network = Network.create("test network", p).add(Network.createRegion("r1")
	        .add(Network.createLayer("1", p)
//	            .alterParameter(KEY.AUTO_CLASSIFY, true)    // <--- Remove this line if doing anomalies and not predictions
	            .add(Anomaly.create())                      // <--- Remove this line if doing predictions and not anomalies
	            .add(new TemporalMemory())
	            .add(new SpatialPooler())
	            .add(sensor)));
	    return network;
	}
}
