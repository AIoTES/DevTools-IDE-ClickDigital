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
package  services;



import com.mongodb.client.MongoCollection;

import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import java.util.Properties;

/**
 * This class sends emails.
 */
public class EMailSender {
    private static String sender = "noreply@clickdigital.igd.fraunhofer.de";
    private static String host= "smtp.igd.fraunhofer.de";
    private static MongoCollection<EMail> emails = UtilityService.getDatabase(UtilityService.PropertyKeys.BACKEND_DATABASE_NAME)
            .getCollection(UtilityService.CONFIRMATIONEMAILCOLLECTION, EMail.class);

    public static void sendConfirmationMail(String recipient, String link) throws MessagingException
    {
        String subject= "E-Mail Verification";
        String text = "Please click the link to verify your e-mail address. " + link +
                "\n By clicking this link you agree to our terms of service and our privacy policy. \n" +
                "The withdrawal of consent shall not affect the lawfulness of processing based on consent before its withdrawal.";

        Properties properties = System.getProperties();
        properties.setProperty( "mail.smtp.host", host); //igd server address
        Session session = Session.getDefaultInstance( properties );
        MimeMessage message = new MimeMessage( session );
        message.setFrom( new InternetAddress( sender ) );
        message.addRecipient( Message.RecipientType.TO, new InternetAddress( recipient ) );
        message.setSubject( subject, "ISO-8859-1" );
        message.setText( text , "UTF-8" );
        Transport.send( message );
        emails.insertOne(new EMail(text, recipient, sender, subject));


    }

    public static void sendResetMail(String recipient, String link) throws MessagingException
    {
        String subject= "Password Reset";

        Properties properties = System.getProperties();
        properties.setProperty( "mail.smtp.host", host); //igd server address
        Session session = Session.getDefaultInstance( properties );
        MimeMessage message = new MimeMessage( session );
        message.setFrom( new InternetAddress( sender ) );
        message.addRecipient( Message.RecipientType.TO, new InternetAddress( recipient ) );
        message.setSubject( subject, "ISO-8859-1" );
        message.setText( "Please click the link to your Password. \n" + link , "UTF-8" );
        Transport.send( message );
    }

    public static void sendInfoMail(String recipient, String content) throws MessagingException
    {
        String subject= "Your user data has been changed.";

        Properties properties = System.getProperties();
        properties.setProperty( "mail.smtp.host", host); //igd server address
        Session session = Session.getDefaultInstance( properties );
        MimeMessage message = new MimeMessage( session );
        message.setFrom( new InternetAddress( sender ) );
        message.addRecipient( Message.RecipientType.TO, new InternetAddress( recipient ) );
        message.setSubject( subject, "ISO-8859-1" );
        message.setText( "There has been a change to your user data: \n" + content , "UTF-8" );
        Transport.send( message );
    }
}
