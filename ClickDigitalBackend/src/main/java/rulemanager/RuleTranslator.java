package rulemanager;

import exceptions.ActionCycleException;
import exceptions.MissingDatabaseEntryException;
import exceptions.MissingParameterException;
import rulemanager.Manager.TriggergroupManager;
import rulemanager.models.*;

import java.io.*;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
    public class RuleTranslator {

        static RuleManagement manager;

        static {
            manager = new RuleManagement();
        }

        static private TriggergroupManager tgManager;

        public RuleTranslator(TriggergroupManager Triggermanager) {
            tgManager = Triggermanager;
        }

        public static String translate(String rID) throws MissingDatabaseEntryException, MissingParameterException, ActionCycleException {

            Rule r = null;

            r = manager.getRule(Integer.parseInt(rID),null);

            //String roottgid= r.roottgID;
            System.out.println(r.toString());

            //create empty String to store result in
            String result = "";
            //store name
            result += parseName(r);

            result += "when\n";

            result += parseConditions(r);

            result += "then\n";

            result += parseActions(r);

            result += "end";


            return result;
        }



        public static String parseTrigger(Trigger t){

            String result = "";

            // t.sensorID == irgendeine condition
            parseCondition(t.condition);
            return null;

        }

        public static String parseTriggerGroup(Triggergroup tg){

            if (tg.trigger==null){
                return tg.operator; //add the operator
            }
            return parseTrigger(tg.trigger);

        }

        public static String parseCondition(Condition c){


            return c.toString();

        }




    /*
     * @param r the name of the rule
     * @return String fragment in openHab syntax defining rule name
     */

    public static String parseName (Rule r){
        return "rule \""+r.name+"\"\n";
    }

    /**
     *
     * @return String fragment in openHab syntax defining conditions for rule execution
     */
    public static String parseConditions(Rule r) throws MissingDatabaseEntryException, MissingParameterException{
        List<Triggergroup> l = new ArrayList<>();
        l = tgManager.getTGsForRule(r.rootTGID, l);
        Iterator<Triggergroup> L = l.iterator();
        String result = "";
        while (L.hasNext()){
            result += parseTriggerGroup(L.next());
        }
        return result;
    }

    /**
     *
     * @return String fragment in openHab syntax defining rule name
     * Output folgt dem syntax eines openhab skriptBlocks (https://docs.openhab.org/configuration/rules-dsl.html#scripts)
     */
    public static String parseActions(Rule r){
        List<RuleAction> ruleActions = r.ruleActions;
        Iterator i = ruleActions.iterator();

        String result ="";

        while(i.hasNext()){
            result += i.next().toString();
        }

        return result;

    }


    public void writeToFile(String input) throws IOException{
        List<String> lines = Arrays.asList("input");
        Path file = Paths.get("rule.txt");
        Files.write(file, lines, Charset.forName("UTF-8"));
    }
}
