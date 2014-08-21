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
  // global variables.
  var scriptOwner = "tcsiwula@lbl.gov"; // who to notify if something goes wrong.  
  var testbedSpreadsheetId = "0AtJqjBgyyGhXdGhONUZOOGxic0FSYkZSaGotQnZ1cGc"; // the ID of the 100G testbed users spreadsheet.
  var nameOfFirstSheet = "Master";
  var nameOfSecondSheet = "Projects";
  var user = Session.getActiveUser().getEmail(); //grabs the current google user.
// this function is REQUIRED for google apps script. Equivalent to Javas public static void main function.
function doGet(e){ 
   
 // Create app object.
  var app = UiApp.createApplication().setTitle('TRS Baby!'); 
  
  //Widgets to add to the app.
  var submitButton = app.createButton('Submit');  // calls back handler when clicked
  var helloUserLabel = app.createLabel( 'Hey ' + user + " ! Select one of your projects below: ");
  
  var grid = app.createGrid(6,2).setCellPadding(10);
  app.add(grid);
   
  grid.setText(0, 0, 'User:');
  grid.setText(0, 1, user);
  grid.setText(1, 0, 'Lease time:');
  grid.setText(2, 0, 'Project:');
  grid.setText(3, 0, 'Images:');
  grid.setText(4, 0, 'Request:');
 
  // This logic fetches the users projects and stores them in an array.
  var arrayOfProjects = new Array( );
  arrayOfProjects = getUsersData( testbedSpreadsheetId, nameOfFirstSheet, user, "Google ID", "Project Name" );
  arrayOfProjects =  arrayOfProjects.split(',');
  
  // This logic grabs each project from the array (above) and adds it to the list.
  var list1 = app.createListBox(true).setName('list1').setId('list1').setWidth(200); 
  grid.setWidget(2, 1, list1).setId('grid');
  list1.addItem('Select');
  for (i =0; i < arrayOfProjects.length; i++) {
    list1.addItem( arrayOfProjects[i] );
  } 
  
  var handler = app.createServerChangeHandler('changeList2');
  handler.addCallbackElement(grid);  
  list1.addChangeHandler(handler); 
  
  return app;
}
  /*
 ****************************************************************************************************************
 Part 1.3:    Handler function.
 ****************************************************************************************************************
*/
//Event logic for when user selects a project.
function changeList2(e){
  var app = UiApp.getActiveApplication();
  var list1Value = e.parameter.list1 //this is the name from list1 
  Logger.log("list1Value = " + list1Value);
  
  
  // for references purposes only
  var arrayOfProjects = new Array( );
  arrayOfProjects = getUsersData( testbedSpreadsheetId, nameOfFirstSheet, user, "Google ID", "Project Name" );
  arrayOfProjects =  arrayOfProjects.split(',');
  
  
 // This logic fetches the users images and stores them in an array.
 var arrayOfImages = new Array();
 arrayOfImages = getUsersData( testbedSpreadsheetId, nameOfSecondSheet, list1Value, "Project Name", "Images" );
 arrayOfImages = arrayOfImages.split(',');
  
  // This logic grabs each image from the array (above) and adds it to the list.
 var list2 = app.createListBox(true).setName('list2').setId('list2').setWidth(200); 
  app.getElementById('grid').setWidget(3, 1, list2);
  list2.addItem('Select');
  for (i =0; i < arrayOfImages.length; i++) {
    list2.addItem( arrayOfImages[i] );
  }   
   
  var handler2 = app.createServerChangeHandler('results');
  handler2.addCallbackElement(app.getElementById('grid'));  
  list2.addChangeHandler(handler2);  
  
   for (i in arrayOfProjects)
   {
     if ( arrayOfProjects[i] = list1Value)
     {
       for (i in arrayOfImages) 
       {
         list2.addItem( arrayOfImages[i] );
       }
     } 
   }
  return app;
}

function results(e){
  var app = UiApp.getActiveApplication();
  
  app.getElementById('grid').setText(4, 1, e.parameter.list1 + ', ' + e.parameter.list2);
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
   Logger.log("currentSheet = " + currentSheet);
   Logger.log("sheetName = " + sheetName);
  
  if (currentSheet == null) {
    Logger.log("Cant open sheetName = " + sheetName);
  }
  var userColumnLocation, userRowLocation, userXY, projectColumnLocation, projectRowLocation, usersGoogleID, usersProjects;
  var data = currentSheet.getDataRange().getValues();
  
  // Step 1
  // Locate userColumnLocation
  for (var i = 0; i < data[0].length; i++) 
  {
    if ( data[0][i] == keyColumn ) {
      userColumnLocation = i;
      Logger.log("userColumnLocation = " + userColumnLocation);
    }
  }
  // Step 2
  // Locate the userRowLocation in userColumnLocation
  for (var i = 0; i < currentSheet.getLastRow(); i++) 
  {
          Logger.log("key = " + key + "@ " + i);
          Logger.log("currentSheet.getLastRow() = " + currentSheet.getLastRow());

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