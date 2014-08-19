// ----------------------------------------------------------------------------------------------------------------------------------------
// Author:      Tim Siwula
// Date:        July 23 2014
// ----------------------------------------------------------------------------------------------------------------------------------------
// File:        Code.gs
// Description: This file grabs the current google user and grabs their corresponding project and image names from the 100g testbeed 
// spreadsheet. It then will allow them to select a date/time to book a reservation, permitted availability.
// ----------------------------------------------------------------------------------------------------------------------------------------
// 100g testbeed Spreadsheet ID: https://docs.google.com/a/lbl.gov/spreadsheets/d/1qIGVzFatEAMaAFFtByIxLEUNcCkxxS1CeITStKPLMfM/edit#gid=0
// 100g testbeed Calendar ID: lbl.gov_ea7ne2nhsgao67n08guqu46bv8@group.calendar.google.com
// ----------------------------------------------------------------------------------------------------------------------------------------  
// Document Documentation:            https://developers.google.com/apps-script/reference/document/document-app
// Spreadsheet Documentation:         https://developers.google.com/apps-script/reference/spreadsheet/
// Sheet Documentation:               https://developers.google.com/apps-script/reference/spreadsheet/sheet
// UI Service Documentation:          https://developers.google.com/apps-script/guides/ui-service
// ----------------------------------------------------------------------------------------------------------------------------------------
/*
 ****************************************************************************************************************
 Part 1:    This functions implements the GUI creation, organization and layout.
 ****************************************************************************************************************
*/
// this function is REQUIRED for google apps script. Equivalent to Javas public static void main function.
function doGet(e){ 
  
  var scriptOwner = "tcsiwula@lbl.gov"; // who to notify if something goes wrong.  
  var testbedSpreadsheetId = "0AtJqjBgyyGhXdGhONUZOOGxic0FSYkZSaGotQnZ1cGc"; // the ID of the 100G testbed users spreadsheet.
  var nameOfFirstSheet = "Master";
  var nameOfSecondSheet = "Projects";
  var user = Session.getActiveUser().getEmail(); //grabs the current google user.
  var selected; //need to assign this to the image the user selects via handlers and pass into line 47 as an argument.
   
 // Create app object.
  var app = UiApp.createApplication().setTitle('TRS Baby!'); 
  
  //Widgets to add to the app.
  var submitButton = app.createButton('Submit');  // calls back handler when clicked
  var helloUserLabel = app.createLabel( 'Hey ' + user + " ! Select one of your projects.");

  // A listbox for the projects.
  var arrayOfProjects = new Array( );
  arrayOfProjects = getUsersData( testbedSpreadsheetId, nameOfFirstSheet, user, "Google ID", "Project Name" );
  arrayOfProjects =  arrayOfProjects.split(',');

  // A listbox for the images.
  var arrayOfImages = new Array();
 arrayOfImages = getUsersData( testbedSpreadsheetId, nameOfSecondSheet, "Project-X", "Project Name", "Images" );
 arrayOfImages = arrayOfImages.split(',');
  
  //handler for when a user selects a project.
  var projectsHandler = app.createServerHandler('userSelectedAProject');
  //arrayOfProjects.addClickHandler(userSelectedAProject);
 // listOfProjects.addClickHandler(userSelectedAProject);
  
  // This loops throught the length of the arrayOfProjects, creates a new project item and adds it to the listOfProjects. 
  var listOfProjects = app.createListBox(false).setName('listOfProjects').setId('userSelectedProject').addChangeHandler(projectsHandler).setWidth('300px'); 
  for (i =0; i < arrayOfProjects.length; i++) {
    listOfProjects.addItem( arrayOfProjects[i] );
  } 
  
  // This loops throught the length of the arrayOfImages, creates a new image item and adds it to the listOfImages. 
 var listOfImages = app.createListBox(false).setName('listOfImages').setId('userSelectedImage').setWidth('300px'); 
  for (i =0; i < arrayOfImages.length; i++) {
    listOfImages.addItem( arrayOfImages[i] );
  } 
  
 
   // adds the grid to the app
  app.add(app.createGrid(5, 1)
       .setWidget(0, 0, helloUserLabel)
       .setWidget(1, 0, listOfProjects)
       .setWidget(2, 0, listOfImages)
       .setWidget(3, 0, null)
       .setWidget(4, 0, submitButton)
       .setBorderWidth(1)
       .setCellSpacing(10)
       .setCellPadding(10));
  
  // adds the calendar to the app
  return app;
}

  /*
 ****************************************************************************************************************
 Part 1.3:    Handler Logic :(
 ****************************************************************************************************************
*/
function userSelectedAProject(e){
  var app = UiApp.getActiveApplication();
  
  var listOfImages = app.getElementById('userSelectedProject');//grabs the object listOfProjects to locate the event selection.
  listOfImages.setVisible(true);
  app.close();
  return app;
}
/*
 ****************************************************************************************************************
 Part 2:    This function transverses the x,y spreadsheet. It validates the logged in user to make sure they
 are on the list and then returns their corresponding array of projects.
 ****************************************************************************************************************
*/
function getUsersData(spreadsheetId, sheetName, key, keyColumn, valueColumn) 
{  
  var spreadSheet = SpreadsheetApp.openById(spreadsheetId);
  var currentSheet = spreadSheet.getSheetByName(sheetName); // this grabs sheet with the users project information.
   //Logger.log("currentSheet = " + currentSheet);
   Logger.log("sheetName = " + sheetName);
  
  if (currentSheet == null) {
    //Logger.log("Cant open sheetName = " + sheetName);
  }
  var userColumnLocation, userRowLocation, userXY, projectColumnLocation, projectRowLocation, usersGoogleID, usersProjects;
  var data = currentSheet.getDataRange().getValues();
  
  // Step 1
  // Locate userColumnLocation
  for (var i = 0; i < data[0].length; i++) 
  {
    if ( data[0][i] == keyColumn ) {
      userColumnLocation = i;
      //Logger.log("userColumnLocation = " + userColumnLocation);
    }
  }
  // Step 2
  // Locate the userRowLocation in userColumnLocation
  for (var i = 0; i < currentSheet.getLastRow(); i++) 
  {
          Logger.log("key = " + key);

    if (data[i][userColumnLocation] == key ) {
      
      //debug
      Logger.log("MADE IT BABY!! ");
      Logger.log("Step 2: userRowLocation ");
      Logger.log("key = " + key);
      Logger.log("data[i][userColumnLocation] = " + data[i][userColumnLocation]);
    
      userRowLocation = i;
      usersGoogleID = data[userRowLocation][userColumnLocation];
      break;
      //Logger.log("usersGoogleID =" + usersGoogleID);
    }
  }  
  
  // Step 3
  // Locate projectColumnLocation
  for (var i = 0; i < data[0].length; i++) 
  {
    if ( data[0][i] == valueColumn ) {
      projectColumnLocation = i;
     // Logger.log("projectColumnLocation = " + projectColumnLocation);
    }
  }
            Logger.log("data[i][projectColumnLocation] == data[userRowLocation][projectColumnLocation] = " + data[i][projectColumnLocation] == data[userRowLocation][projectColumnLocation]);

  // Step 4
  // Locate the projectRowLocation in projectColumnLocation
  for (var i = 0; i < currentSheet.getLastRow(); i++) 
  {    
          Logger.log("data[i][projectColumnLocation] == data[userRowLocation][projectColumnLocation] = " + data[i][projectColumnLocation] == data[userRowLocation][projectColumnLocation]);

    
    if ( data[i][projectColumnLocation] == data[userRowLocation][projectColumnLocation] ) 
    {
      projectRowLocation = i;
      usersProjects = data[userRowLocation][projectColumnLocation];
      Logger.log("usersProjects = " + usersProjects);

      break;
    }
    
  } 
  // Finally return current users projects.
  return usersProjects;
}


/*
 ****************************************************************************************************************
 Part y:    This function grabs the current events from the calendar ... tbc
 ****************************************************************************************************************
*/
//function getCalendear() 
//{
// 
//  // create a calendar object so you can call its methods.
// var calendar = CalendarApp.getCalendarById('en33gc2eubmq6clivk1s0imc28k@group.calendar.google.com'); 
// 
//  // Determines how many events are happening in the next two weeks.
//  var now = new Date();
//  var twentyFourHoursFromNow = new Date(now.getTime() + (24 * 60 * 60 * 1000));
//  var twoWeeksFromNow = new Date(now.getTime() + (336 * 60 * 60 * 1000));
//  var events = CalendarApp.getDefaultCalendar().getEvents(twentyFourHoursFromNow, twoWeeksFromNow);
// Logger.log('Number of events: ' + events.length);
//  
//  
//  
//}
/*
 ****************************************************************************************************************
 Part x:   Demo email and demo insert data into spreadsheet
 ****************************************************************************************************************
*/
//function emailConfimation()
//{
//  MailApp.sendEmail("timsiwula@icloud.com", "Hi Tim", "Your testbed reservation has been completed");
//}



//function insertInSS(e){
//  var responseSpreadSheet = '1AYNK4roBhzyeF95w4-GzOVYHdXfPv7pCZImrHFTf-xE';
//  var app = UiApp.getActiveApplication();
//  var name = e.parameter.name;
//  var message = e.parameter.message;
//  app.getElementById('info').setVisible(true).setStyleAttribute('color','red');
//  
//  var sheet = SpreadsheetApp.openById(responseSpreadSheet).getActiveSheet();
//  var lastRow = sheet.getLastRow();
//  var targetRange = sheet.getRange(lastRow+1, 1, 1, 2).setValues([[name,message]]);
//  return app;
//}