// Author:      Tim Siwula
// ----------------------------------------------------------------------------------------------------------------------------------------
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
  var scriptOwner = "tcsiwula@lbl.gov"; // who to notify if something goes wrong
  var testbedSpreadsheetId = "0AtJqjBgyyGhXdGhONUZOOGxic0FSYkZSaGotQnZ1cGc"; // the ID of the 100G testbed users spreadsheet.
  var nameOfFirstSheet = "Master", nameOfSecondSheet = "Projects"; // These are the names of the individual shee0 and sheet1.
  var user = Session.getActiveUser().getEmail(); //grabs the current google user.
  var list_time, list_day, list_project, list_image;
  var arrayOfProjects = new Array();
  var arrayOfEvents = new Array();
  var selected_time, selected_day, selected_project, selected_image;

// this function "doGet" is REQUIRED for google apps script. 
// Equivalent to Java's or C's main function.
function doGet(e){ 
   
  // Create app object.
  var app = UiApp.createApplication().setTitle('TRS Baby!');  
  var grid = app.createGrid(7,2).setCellPadding(10);
  app.add(grid);
  
  //background image
  app.add(app.createImage('http://i62.tinypic.com/eq9i1l.jpg'));
  
  
  //background color
  app.setStyleAttribute("background", "grey");
  
  //grid to hold drop down objects
  grid.setText(0, 0, 'Account:');
  grid.setText(0, 1, user);
  grid.setText(1, 0, 'Reservation Length:');
  grid.setText(2, 0, 'Project:');
  grid.setText(3, 0, 'Images:');
  grid.setText(4, 0, 'Request:');
  grid.setText(5, 0, 'Events:');

  // reservation time drop down box
  var list_time = app.createListBox().setName('list_time').setId('list_time').setWidth(200).setEnabled(true);
  grid.setWidget(1, 1, list_time).setId('grid');
  list_time.addItem('Select');
  list_time.addItem('2 Hours');
  list_time.addItem('4 Hours');
  list_time.addItem('6 Hours');
  list_time.setVisibleItemCount(1);
  
// create a calendar object so you can call its methods.
//var calendar = CalendarApp.getCalendarById('en33gc2eubmq6clivk1s0imc28k@group.calendar.google.com'); 
 
// Determines how many events are happening in the next two weeks.
var now = new Date();
var twentyFourHoursFromNow = new Date(now.getTime() + (24 * 60 * 60 * 1000));
var twoWeeksFromNow = new Date(now.getTime() + (336 * 60 * 60 * 1000));
  
// grab instance of specific calendar 
//var events = CalendarApp.getCalendarById('n33gc2eubmq6clivk1s0imc28k@group.calendar.google.com').getEvents(twentyFourHoursFromNow, twoWeeksFromNow);
//var event_object = app.createListBox().setName('event_object').setId('event_object').setWidth(200).setEnabled(true);
//grid.setWidget(5, 1, event_object).setId('grid');
//Logger.log('Number of events: ' + events.length);
  
// grab event objects and store in array
 
// for (i=0;i<events.length;i++)
 //{
 // arrayOfEvents[i] = events.valueOf(i);
 //}

  // add first static item to listbox
  //event_object.addItem('*Current Events*');

  // add all events to listbox
  //while (events != 0)
 // {
  //  event_object.addItem(event_object);
  //}
   // event_object.setVisibleItemCount(1);

  
  // This logic fetches the users projects and stores them in an array.
  //getUsersData(spreadsheetId, sheetName, firstRowKey, firstHeaderKey, secondHeaderKey) 
  arrayOfProjects = getUsersData( testbedSpreadsheetId, nameOfFirstSheet, user, "Google ID", "Project Name" );
  arrayOfProjects =  arrayOfProjects.split(','); // This breaks up the array where the commas are.
  
  // This logic grabs each project from the array (above) and adds it to the list.
  list_project = app.createListBox().setName('list_project').setId('list_project').setWidth(200).setEnabled(true); 
  grid.setWidget(2, 1, list_project).setId('grid'); // This adds the box to the grid at the given corrdinates. 
  list_project.setVisibleItemCount(1); // This makes it a drop down box.
  list_project.addItem('Select'); // The first item in the list the user will see from the dropdown box.
  for (i =0; i < arrayOfProjects.length; i++) {
    list_project.addItem( arrayOfProjects[i] );
  } 
  
  // This logic allows for event listners to respond.
  var project_handler = app.createServerHandler('get_image'); // Links the image_handler to the get_image function.
  project_handler.addCallbackElement(list_project); // Links the handlers callback to the grid for accessing cell to update.  
  list_project.addChangeHandler(project_handler); // links the list_project to the image_handler (only if it is changed/updated by the user).
  
  // This renders the finalized app.
  return app;
} 

// ****************************************************************************************************************
// Part 2: Display y based on x.
// ****************************************************************************************************************

//Event logic for when user selects a project.
function get_image(e){
  var app = UiApp.getActiveApplication();     

  Logger.log("parameter = " + parameter );
  Logger.log("eventType = " + eventType );
  Logger.log("source = " + source );
    
  var parameter = e.parameter;
  var eventType = parameter.eventType;
  var source = parameter.source;
 
  // user selected 
     Logger.log("selected = " + selected );
   var selected = e.parameter.list_project;

 // This logic fetches the users images and stores them in an array.
 var arrayOfImages = new Array();
 arrayOfImages = getUsersData( testbedSpreadsheetId, nameOfSecondSheet, selected, "Project Name", "Images" );
 arrayOfImages = arrayOfImages.split(',');
  
 // This logic grabs each image from the array (above) and adds it to the list.
 list_image = app.createListBox().setName('list_image').setId('list_image').setWidth(200); 
 app.getElementById('grid').setWidget(3, 1, list_image);
  list_image.addItem('Select');
  for (i =0; i < arrayOfImages.length; i++) {
    list_image.addItem( arrayOfImages[i] )
    Logger.log(arrayOfImages[i] + " was added to list_image " );
  }   
   
  // This logic allows for event listners to respond.
  var handler2 = app.createServerChangeHandler('results');
  handler2.addCallbackElement(app.getElementById('grid'));  
  list_image.addChangeHandler(handler2);  
  
   for (i in arrayOfProjects)
   {
     if ( arrayOfProjects[i] = list_projectValue)
     {
       for (i in arrayOfImages) 
       {
         list_image.addItem( arrayOfImages[i] );
       }
     } 
   }
  return app;
}

function results(e){
  var app = UiApp.getActiveApplication();
  app.getElementById('grid').setText(4, 1, '"' + user + '"' + ' would like to reserve the testbed for: ' + e.parameter.list_time + '  ' + e.parameter.list_project + '  ' + e.parameter.list_image + '?');
  app.getElementById('grid').setText(5, 0, "Confirm:");
  var submitButton = app.createButton('Submit').setVisible(true);  // calls back handler when clicked
  app.getElementById('grid').setWidget(5, 1, submitButton);
  return app;
}



//****************************************************************************************************************
// Part 2:    This function transverses the x,y spreadsheet. It validates the logged in user to make sure they
// are on the list and then returns their corresponding array of projects.
//****************************************************************************************************************

function getUsersData(spreadsheetId, sheetName, firstRowKey, firstHeaderKey, secondHeaderKey) 
{  
  var spreadSheet = SpreadsheetApp.openById(spreadsheetId);
  var currentSheet = spreadSheet.getSheetByName(sheetName); // this grabs sheet with the users project information.
  
  if (currentSheet == null) {
    Logger.log("Cant open sheetName = " + sheetName);
  }
  var firstHeaderKeyIndex, secondHeaderKeyIndex, firstRowKeyIndex, secondRowKeyIndex, userRowIndex, userXY, projectRowLocation, usersGoogleID;
  var data = currentSheet.getDataRange().getValues();
  var usersProjects = new Array();
  var projectColumnLocation;
  
  // Step 1: Locate firstHeaderKeyIndex
  for (var i = 0; i < data[0][i].length; i++) 
  {
    if ( data[0][i] == firstHeaderKey ) {
      Logger.log("i = " + i);
      firstHeaderKeyIndex = i;
      Logger.log("Step1: Locate firstHeaderKeyIndex = " + firstHeaderKeyIndex + " is ***complete***.");
      break;
    }
  }
  
  // Step 2: Locate secondHeaderKeyIndex
  for (var i = 0; i < data[0][i].length; i++) 
  {
    Logger.log("data[0][i] = secondHeaderKeyIndex::::: " + data[0][i] + " = " + secondHeaderKey);

    if ( data[0][i] == secondHeaderKey ) {
      Logger.log("i = " + i);
      secondHeaderKeyIndex = i;
      Logger.log("Step2: Locate secondHeaderKeyIndex = " + secondHeaderKeyIndex + " is ***complete***.");
      break;
    }
  }
  
  // Step 3: Locate firstRowKeyIndex
  for (var i = 0; i < data[i][firstHeaderKeyIndex].length; i++) 
  {
      //Logger.log("data[i][firstHeaderKeyIndex]::::: " + data[i][firstHeaderKeyIndex] + " = " + firstRowKey);
    if ( (data[i][firstHeaderKeyIndex]).trim().equals(firstRowKey.trim()) ) {
      Logger.log("i = " + i);
      firstRowKeyIndex = i;
      Logger.log("Step3: Locate firstRowKeyIndex = " + firstRowKeyIndex + " is ***complete***.");
      break;
    }
  }
  
  // Step 4: Assign secondRowKeyIndex
   secondRowKeyIndex = data[firstRowKeyIndex][secondHeaderKeyIndex]; 
  Logger.log("Step4: Assign secondRowKeyIndex = " + secondRowKeyIndex + " is ***complete***.");

  return secondRowKeyIndex;  
}

//end file