/*
 * Copyright 2017-2020 Fraunhofer Institute for Computer Graphics Research IGD
 *
 * Licensed under the GNU AFFERO GENERAL PUBLIC LICENSE, Version 3, 19 November 2007
 * You may not use this work except in compliance with the Version 3 Licence.
 * You may obtain a copy of the Licence at:
 * https://www.gnu.org/licenses/agpl-3.0.html
 *
 * See the Licence for the specific permissions and limitations under the Licence.
 */
package authentification;



import org.apache.logging.log4j.*;
import org.glassfish.jersey.internal.util.Base64;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import javax.inject.Singleton;
import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.container.ContainerRequestFilter;
import javax.ws.rs.container.PreMatching;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.Provider;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.math.BigInteger;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.StringTokenizer;


/*
*   Filter, der angewendet wird bevor Rest anfragen weiter verarbeited werden
*/
@Provider
@Singleton
@PreMatching
public class BasicAuth implements ContainerRequestFilter {

    private static final String AUTHORIZATION_HEADER_KEY ="Authorization";
    private static final String AUTHORIZATION_HEADER_PREFIX = "Basic";
    Map<String,String> credentials;
    Map<String,String> someHashes;
    private static Logger logger = LogManager.getLogger(BasicAuth.class.getName());

    /*
    *   Da die Klasse mit @Singleton annotiert ist, wird nur eine einzige
    *   Instanz der Klasse erstellt. Hierbei wird zunächst die credentials Datei eingelesen,
    *   um die Geschwindigkeit im laufenden Betrieb zu erhöhen
    */

    public BasicAuth(){
        //credentials ist die Liste, die die gültigen Benutzernamen:Hash kombinationen enthält        
        credentials = new HashMap<>();
        //someHashes ist eine Liste die Benutzernamen:Hash kombinationen aus alten Anfragen enthält,
        //um die Geschwindigkeit zu erhöhen
        someHashes = new HashMap<>();

        File f = new File("credentials");
        try{
            f.createNewFile();
            BufferedReader br = new BufferedReader(new FileReader(f));
            String s;
            while((s = br.readLine()) != null){
                StringTokenizer tk = new StringTokenizer(s,";");
                if(tk.countTokens()==2)
                    credentials.put(tk.nextToken(),tk.nextToken());
            }

        }catch(Exception e){
            System.err.println("Woops, something went wrong! Errormessage: " + e.getMessage());
        }

    }


    /*
    *   filter(ContainerRequestContext containerRequestContext) ist die Methode die bei einer
    *   REST Anfrage ausgeführt wird. Da die Klasse mit @PreMatching anotiert ist wird die Methode
    *   ausgeführt, bevor die Anfrage weiter verarbeited wird. OPTIONS Anfragen werden einfach weitergegeben,
    *   alle anderen Anfragen müssen einen gültigen Authorization Header als ersten Header angefügt haben
    */
    @Override
    public void filter(ContainerRequestContext containerRequestContext) throws IOException {

        /*

        // OPTIONS wird weitergegeben..
        if(containerRequestContext.getMethod().equals("OPTIONS"))
            return;
        
        //.. alle anderen überprüft
        //authHeader ist eine Liste mit den Namen aller Headerfelder
        List<String> authHeader = containerRequestContext.getHeaders().get(AUTHORIZATION_HEADER_KEY);
        
        //Falls diese Liste leer ist, ist kein gültiger Authorization Header vorhanden, also kann
        //solch eine Anfrage direkt übersprungen werden
        if(authHeader != null && authHeader.size()>0){

            //Der Header ist für die Übertragung in Base64 codiert und Username und Passwort sind
            //mit einem : getrennt
            String authToken = authHeader.get(0);
            String decodedString = Base64.decodeAsString(authToken);
            StringTokenizer tokenizer = new StringTokenizer(decodedString, ":");

            //Ein korrekter Header hat genau 2 Teile
            if(tokenizer.countTokens()==2){
                String username = tokenizer.nextToken();
                String password = tokenizer.nextToken();

                //Der Username und das Passwort muss mit jedem bekanntem Username Passwort Paar das aus der
                //Datei bei Start eingelesen wurde verglichen werden
                for(Map.Entry<String,String> e: credentials.entrySet()){
                    String pw = e.getValue();
                    //Wenn der Username übereinstimmt, muss das Passwort noch überprüft werden                    
                    if(e.getKey().equals(username)) {
                    // pw = Hash aus der zu beginn eingelesenen Datei
                    

                        //in someHashes sind Passwort Klartexte und deren zugehörige Hashes aus vorhergehenden Anfragen gespeichert
                        //um Zeit beim Validieren zu sparen
                        for(Map.Entry<String,String> e2 : someHashes.entrySet()){
                            String clear = e2.getKey();
                            String h = e2.getValue();
                            if(clear.equals(password) && h.equals(pw))
                                return;
                        }

                        //wurde das Passwort noch nicht gesehen wird es gehasht
                        String[] parameters = pw.split(":");
                        int usedIterations = Integer.parseInt(parameters[0]);
                        byte[] salt = fromHexString(parameters[1]);
                        String passwordHashed = hash(password, usedIterations, salt);

                        //ist das Passwort korrekt gewesen, wird es mit seinem Hashwert in someHashes gespeichert
                        if(pw.equals(passwordHashed)){
                            someHashes.put(password, passwordHashed);
                            return;
                        }

                    }
                }
            }}

        //Dieser Teil wird ausgeführt sollte der Header auf irgend eine weise ungültig gewesen sein
        Response unauthorized = Response.status(Response.Status.UNAUTHORIZED).entity("Access Denied ").build();
        containerRequestContext.abortWith(unauthorized);
        */
    }

    private String hash(String pw, int iterations, byte[] salt) {

        try {
            char[] pwdChars = pw.toCharArray();

            PBEKeySpec keySpec = new PBEKeySpec(pwdChars, salt, iterations, 64 * 8);
            SecretKeyFactory skf = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA512");
            byte[] hashedPwd = skf.generateSecret(keySpec).getEncoded();

            pwdChars = new char[1];
            keySpec = null;
            return iterations + ":" + toHexString(salt) + ":" + toHexString(hashedPwd);
        } catch(NoSuchAlgorithmException | InvalidKeySpecException e) {
            throw new RuntimeException( e );
        }
    }

    private String toHexString(byte[] array)
    {
        BigInteger bigIn = new BigInteger(1, array);
        String hexString = bigIn.toString(16);
        int paddingLength = (array.length * 2) - hexString.length();
        if(paddingLength > 0)
        {
            return String.format("%0"  +paddingLength + "d", 0) + hexString;
        }else{
            return hexString;
        }
    }

    private byte[] fromHexString(String hex)
    {
        byte[] bytes = new byte[hex.length() / 2];
        for(int i = 0; i<bytes.length ;i++)
        {
            bytes[i] = (byte)Integer.parseInt(hex.substring(2 * i, 2 * i + 2), 16);
        }
        return bytes;
    }
}

