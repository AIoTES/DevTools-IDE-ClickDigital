# ClickDigital

ClickDigital provides an interface to manage, control and operate with different IoT-platforms via a single visual dashboard. It eases the struggle of managing hardware connection, security and authentication, the collection, visualization, analysis and controlling of data or devices by providing a unique visual interface to operate with different IoT-platforms.


## Getting started
 - On the landing page, create a user account and login to use the web application. If you want to be able to edit a dashboard, you have to select "developer" as role and use "1234" as developer pin. 
 - Login to use the web application. The first project and dashboard will be created.
 - To be able to control and visualize devices, go to platforms in the main menu and connect a platform. Currently, you can choose between Aiotes or OpenHab.
 - You cand use the icon in the sidebar to create widgets.
 - Some visualization widgets can only be used if devices were added from the connected platforms through the "add Device" widget.
 
## How to deploy
ClickDigital consist in general out of two components: frontend and backend. Both are communicating through a RESTful API and WebSocket-protocol. The Frontend of ClickDigital is written in Typescript, HTML and CSS. It is based on Angular with the PrimeNG library. The Backend of ClickDigital is written in Java. 
There are docker images of these components available to be directly run.
ClickDigital is packaged in a Docker container. This Docker image consits of three parts: Frontend, Backend, Database Images. By default ClickDigital uses port 80 (frontend), 27017(database) and 9999 (backend).
 - Make sure you have installed and setup docker correctly.
 - Create a new folder, e.g. ClickDigital and open terminal.
 - Download "docker-compose.yml" into that folder
 - In command line browse to the new created folder containing the "docker-compose.yml" file
 - Pull docker image from ACTIVAGE Docker Registry
 - Install ClickDigital with the command "docker-compose up -d"
 - Wait a minute for the installtion to complete
 - Run ClickDigital in Google Chrome on "localhost:80"
 - On the landing page, create a user account and login to use the web application.  If the "user creation" is not available, it might be because the backend takes a bit longer to load. Wait for it to appear.
 - You can shutdown the image with "docker-compose down" in the commandline


## Further information

Check out the course at [here](https://poliformat.upv.es/portal/site/ESP_0_2626/tool/4136ab45-e867-4287-ac8e-d5eed63f8307/ShowPage?returnView=&studentItemId=0&backPath=&errorMessage=&messageId=&clearAttr=&source=&title=&sendingPage=6007400&newTopLevel=false&postedComment=false&itemId=6007401&addBefore=&path=log&topicId=&addTool=-1&recheck=&id=&forumId=)


## Credits

This software is maintained by: 
* Silvia Rus <silvia.rus@igd.fraunhofer.de> 

## Licence
```
 Copyright 2017-2020 Fraunhofer Institute for Computer Graphics Research IGD
 
 Licensed under the GNU AFFERO GENERAL PUBLIC LICENSE, Version 3, 19 November 2007
 
 You may not use this work except in compliance with the Version 3 Licence. 
 You may obtain a copy of the Licence at: 
 
 https://www.gnu.org/licenses/agpl-3.0.html

 See the Licence for the specific permissions and limitations under the Licence. 
```
