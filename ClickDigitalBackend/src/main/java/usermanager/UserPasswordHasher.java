package usermanager;

import acpmanager.logfilter.Log;
import exceptions.InvalidUserDataException;
import org.apache.logging.log4j.Level;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import services.LogConstants;
import usermanager.User;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.math.BigInteger;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;

/**
 * This class handles all actions with a users password
 */
public class UserPasswordHasher {

    private final Logger logger = LogManager.getLogger(UserPasswordHasher.class.getName());

    /**
     * Number of iterations used in PBKDF2, increasing this slows down the algorithm to make the hashes more secure
     * changing this only affects newly created Users
     * Users should change their password when this is updated, to have it hashed with the updated number of iterations
     */
    private final int iterations = 1000000;


    /**
     * Hashes the given users password, uses the iteration count defined in this class
     * @param user the user for whom the password is being hashed
     */
    public void createUserWithHashedPassword(User user) {

        try {
            String pwdToHash = user.password;
            byte[] salt = generateSalt();
            char[] pwdChars = pwdToHash.toCharArray();

            PBEKeySpec keySpec = new PBEKeySpec(pwdChars, salt, iterations, 64 * 8);
            SecretKeyFactory skf = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA512");
            byte[] hashedPwd = skf.generateSecret(keySpec).getEncoded();

            user.password = iterations + ":" + toHexString(salt) + ":" + toHexString(hashedPwd);
            pwdChars = new char[1];
            keySpec = null;
        } catch(NoSuchAlgorithmException | InvalidKeySpecException e) {
            throw new RuntimeException( e );
        }

    }

    /**
     * Validates an entered password by hashing it with the users salt and iteration count and then comparing the result
     * @param user the user trying to log in
     * @param password the password entered by the user
     * @return true if user and password match
     */
    public boolean validateUser(User user, String password) {

        try {
            String[] parameters = user.password.split(":");
            int usedIterations = Integer.parseInt(parameters[0]);
            byte[] salt = fromHexString(parameters[1]);
            byte[] hash = fromHexString(parameters[2]);

            PBEKeySpec keySpec = new PBEKeySpec(password.toCharArray(), salt, usedIterations, hash.length * 8);
            SecretKeyFactory skf = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA512");
            byte[] hashOfEnteredPwd = skf.generateSecret(keySpec).getEncoded();

            int incorrectBytes = 0;

            for (int i = 0; i < hash.length; i++) {
                if (hash[i] != hashOfEnteredPwd[i]) incorrectBytes++;
            }
            if(incorrectBytes != 0)
                logger.log(Level.WARN, new Log(user.toString(), LogConstants.AUTHORIZATION, user.toString(), LogConstants.FAILED));

            return incorrectBytes == 0;
        } catch(NoSuchAlgorithmException | InvalidKeySpecException e) {
            throw new RuntimeException( e );
        }
    }

    /**
     *
     * Changes password of a user given the users old password and the new password
     * @param user the user whose password is being changed
     * @param newPwd the users new Password
     * @throws InvalidUserDataException throws an exception if the users old password doesn't match the one stored in the database
     */
    public void changePasswordHash(User user, String newPwd, String oldPwd) throws InvalidUserDataException {
        try {
            byte[] salt = generateSalt();
            char[] pwdChars = newPwd.toCharArray();
            if(validateUser(user, oldPwd)) {
                PBEKeySpec keySpec = new PBEKeySpec(pwdChars, salt, iterations, 64 * 8);
                SecretKeyFactory skf = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA512");
                byte[] hashedPwd = skf.generateSecret(keySpec).getEncoded();

                user.password = iterations + ":" + toHexString(salt) + ":" + toHexString(hashedPwd);
                pwdChars = new char[1];
                keySpec = null;
            }else{
                throw new InvalidUserDataException();
            }

        } catch(NoSuchAlgorithmException | InvalidKeySpecException e) {
            throw new RuntimeException( e );
        }

    }

    /**
     * Sets a given users password to the new password
     * @param user the user whose password is being reset
     * @param newPwd the new password for the given user
     */
    public void resetPasswordHash(User user, String newPwd) {
        try {
            byte[] salt = generateSalt();
            char[] pwdChars = newPwd.toCharArray();

            PBEKeySpec keySpec = new PBEKeySpec(pwdChars, salt, iterations, 64 * 8);
            SecretKeyFactory skf = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA512");
            byte[] hashedPwd = skf.generateSecret(keySpec).getEncoded();

            user.password = iterations + ":" + toHexString(salt) + ":" + toHexString(hashedPwd);
            pwdChars = new char[1];
            keySpec = null;


        } catch(NoSuchAlgorithmException | InvalidKeySpecException e) {
            throw new RuntimeException( e );
        }
    }

    /**
     * Generates a random salt
     * @return returns a randomly generated salt
     * @throws NoSuchAlgorithmException
     */
    private byte[] generateSalt() throws NoSuchAlgorithmException{
        byte[] salt = new byte[16];
        SecureRandom random = SecureRandom.getInstance("SHA1PRNG");
        random.nextBytes(salt);
        return salt;
    }

    /**
     * transfroms a given array of bytes into a String representing the bytes as a hex value
     * @param array the array of bytes to be transformed
     * @return the hex representation of the bytes
     */
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

    /**
     * tranforms the given string into an array of bytes
     * @param hex the hex representation as a String
     * @return returns an array of bytes that is representing the value of the given hex
     */
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
