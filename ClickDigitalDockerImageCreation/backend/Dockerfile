FROM payara/server-full:5.191

#ENV CONTEXT_ROOT=/development/clickdigital/api

COPY /ClickDigitalBackend_war_exploded /opt/payara/deployments/ClickDigitalBackend_war_exploded
COPY /hosts /opt/payara/appserver/glassfish/domains/production/config/
COPY /credentials /opt/payara/appserver/glassfish/domains/production/config/
COPY init_1_generate_deploy_commands.sh  /opt/payara/scripts/



#RUN /opt/payara/scripts/init_1_generate_deploy_commands.sh --contextroot "${CONTEXT_ROOT}" 

#| /opt/payara/config/post-boot-commands.asadmin
#ENV POSTBOOT_COMMANDS=/opt/payara/deployments/command.asadmin
#ENV POSTBOOT_COMMANDS=--contextroot "${CONTEXT_ROOT}"
#COPY command.asadmin /opt/payara/deployments/
#RUN chmod +x /opt/payara/deployments/command.asadmin