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
var nameOfFirstSheet = "Master";
var nameOfSecondSheet = "Projects";
var user = Session.getActiveUser().getEmail(); //grabs the current google user.
var list1;
var arrayOfProjects = new Array();


// this function is REQUIRED for google apps script. Equivalent to Javas public static void main function.
function doGet(e){
    
    // Create app object.
    var app = UiApp.createApplication().setTitle('TRS Baby!');
    
    var grid = app.createGrid(6,2).setCellPadding(10);
    app.add(grid);
    
    // app.add(app.createImage("http://i62.tinypic.com/eq9i1l.jpg"));
    
    app.setStyleAttribute("background", "grey");
    
    grid.setText(0, 0, 'Account:');
    grid.setText(0, 1, user);
    grid.setText(1, 0, 'Reservation Length:');
    grid.setText(2, 0, 'Project:');
    grid.setText(3, 0, 'Images:');
    grid.setText(4, 0, 'Request:');
    
    // This logic defines the standarized time increments.
    var list3 = app.createListBox().setName('list3').setId('list3').setWidth(200).setEnabled(true);
    grid.setWidget(1, 1, list3).setId('grid');
    
    list3.addItem('Select');
    list3.addItem('2 Hours');
    list3.addItem('4 Hours');
    list3.addItem('6 Hours');
    list3.setVisibleItemCount(1);
    
    
    // This logic fetches the users projects and stores them in an array.
    arrayOfProjects = getUsersData( testbedSpreadsheetId, nameOfFirstSheet, user, "Google ID", "Project Name" );
    arrayOfProjects =  arrayOfProjects.split(',');
    
    Logger.log("arrayOfProjects.length = " +  arrayOfProjects.length  );
    // This logic grabs each project from the array (above) and adds it to the list.
    list1 = app.createListBox().setName('list1').setId('list1').setWidth(200).setEnabled(true);
    grid.setWidget(2, 1, list1).setId('grid');
    list1.setVisibleItemCount(1);
    
    list1.addItem('Select');
    for (i =0; i < arrayOfProjects.length; i++) {
        //Logger.log("list1.addItem( arrayOfProjects[i] ) = " +  arrayOfProjects[i]  );
        
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
    
    var parameter = e.parameter;
    var eventType = parameter.eventType;
    var source = parameter.source;
    Logger.log("parameter = " + parameter );
    Logger.log("eventType = " + eventType );
    Logger.log("source = " + source );
    
    
    // user selected
    var selected = e.parameter.list1;
    Logger.log("selected = " + selected );
    
    // This logic fetches the users images and stores them in an array.
    var arrayOfImages = new Array();
    Logger.log("testbedSpreadsheetId = " + testbedSpreadsheetId);
    Logger.log("nameOfSecondSheet = " + nameOfSecondSheet);
    Logger.log("selected = " + selected);
    Logger.log("calling getUsersData() = ");
    
    arrayOfImages = getUsersData( testbedSpreadsheetId, nameOfSecondSheet, selected, "Project Name", "Images" );
    arrayOfImages = arrayOfImages.split(',');
    
    
    // This logic grabs each image from the array (above) and adds it to the list.
    var list2 = app.createListBox().setName('list2').setId('list2').setWidth(200);
    app.getElementById('grid').setWidget(3, 1, list2);
    list2.addItem('Select');
    for (i =0; i < arrayOfImages.length; i++) {
        list2.addItem( arrayOfImages[i] )
        Logger.log(arrayOfImages[i] + " was added to list2 " );
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
    app.getElementById('grid').setText(4, 1, user + ' would like to reserve the testbed for ' + e.parameter.list3 + ' with ' + e.parameter.list1 + ' and ' + e.parameter.list2 + '?');
    app.getElementById('grid').setText(5, 0, "Confirm:");
    var submitButton = app.createButton('Submit').setVisible(true);  // calls back handler when clicked
    app.getElementById('grid').setWidget(5, 1, submitButton);
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
    //Logger.log("sheetName = " + sheetName);
    
    if (currentSheet == null) {
        //Logger.log("Cant open sheetName = " + sheetName);
    }
    var userColumnLocation, userRowLocation, userXY, projectRowLocation, usersGoogleID;
    var data = currentSheet.getDataRange().getValues();
    var usersProjects = new Array();
    var projectColumnLocation;
    
    
    // Logger.log("testbedSpreadsheetId = " + testbedSpreadsheetId);
    // Logger.log("nameOfSecondSheet = " + nameOfSecondSheet);
    // Logger.log("key = " + key);
    Logger.log("keyColumn = " + keyColumn);
    //Logger.log("valueColumn = " + valueColumn);
    
    //set header in an array to itterate over
    var header = new Array();
    for (var i = 0; i < data[0].length; i++)
    {
        header.push( data[0][i] );
    }
    
    for (i in header)
    {
        if ( header[i] = key)
        {
            Logger.log("######key = " + header[i]);
            
            // if ( )
            
        }
    }
    
    
    
    //        for (i in arrayOfProjects)
    //   {
    //     if ( arrayOfProjects[i] = list1Value)
    //     {
    //       for (i in arrayOfImages)
    //       {
    //         list2.addItem( arrayOfImages[i] );
    //       }
    
    // Step 1
    // Locate userColumnLocation
    for (var i = 0; i < data[0].length; i++)
    {
        if ( data[0][i] = keyColumn ) {
            userColumnLocation = i;
            Logger.log("Step1: userColumnLocation = " + userColumnLocation);
            Logger.log("key = " + keyColumn);
            Logger.log("matching against = " + data[i][i]);
            break;
        }
    }
    
    // Step 2
    // Locate the userRowLocation in userColumnLocation
    for (var i = 0; i < currentSheet.getLastRow(); i++)
    {
        //Logger.log("Start looking for userRowLocation in userColumnLocation");
        Logger.log("iteration i = " + i);
        Logger.log("key = " + key);
        Logger.log("lock = " + data[i][userColumnLocation]);
        Logger.log("data[i][userColumnLocation] = key = " + (data[i][userColumnLocation] = key));
        Logger.log("data[i][userColumnLocation] == key = " + (data[i][userColumnLocation] == key));
        // data[row number][column number]
        
        if (data[i][userColumnLocation] = key ) {
            //Logger.log("Entered if loop and confirming data[i][userColumnLocation] = key");
            //Logger.log("iteration i = " + i);
            //Logger.log("key = " + key);
            //Logger.log("data[i][userColumnLocation] = " + data[i][userColumnLocation]);
            userRowLocation = i;
            //usersGoogleID = data[userRowLocation][userColumnLocation];
            Logger.log("Step2: userRowLocation = " + userRowLocation);
            Logger.log("key = " + key);
            Logger.log("matching against = " + data[i][userColumnLocation]);
            break;
        }
    }
    
    // Step 3
    // Locate projectColumnLocation. This scans the top row looking for the name "Projects Name" and graps its y index location.
    for (var i = 0; i < data[0].length + 1; i++)
    {
        if ( data[0][i] = valueColumn ) {
            projectColumnLocation = i;
            Logger.log("Step3: projectColumnLocation = " + projectColumnLocation);
            break;
        }
    }
    
    usersProjects = ( data[userRowLocation][projectColumnLocation ]);
    Logger.log("Step4: usersProjects = " + usersProjects);
    Logger.log("key = " + valueColumn);
    Logger.log("matching against = " + data[0][i]);
    
    return usersProjects;
    Logger.log("##########################");
}

// Step 3
// Locate projectColumnLocation. This scans the top row looking for the name "Projects Name" and graps its y index location.
//  for (var i = 0; i < data[0].length; i++)
//  {
//       Logger.log("##########################");
//       Logger.log("Start looking for projectColumnLocation in userColumnLocation");
//       Logger.log("iteration i = " + i);
//       Logger.log("valueColumn = " + valueColumn);
//       Logger.log("userRowLocation = " + userRowLocation);
//       Logger.log("data[userRowLocation][i] = " + data[userRowLocation][i]);
//
//       Logger.log("data[0] = " + data[0]);
//       Logger.log("data[1] = " + data[1]);
//       Logger.log("data[2] = " + data[2]);
//  }
//
//
//    Logger.log("Starting for loop.");
//    for (i in data[0].length)
//   {
//     Logger.log("iteration i = " + i);
//     Logger.log("list1Value = " + list1Value);
//     Logger.log("data[i] = " + data[i]);
//     var memory = new array[];
//     if ( data[i] = list1Value)
//     {
//       projectColumnLocation = i;
//       Logger.log("Step3: projectColumnLocation = " + projectColumnLocation);
//     }
//   }
//
//       Logger.log("##########################");
//
//    if ( data[i][0] == valueColumn ) {
//      Logger.log("Entered if loop and confirming data[userRowLocation][i] = valueColumn");
//      Logger.log("iteration i = " + i);
//      Logger.log("valueColumn = " + valueColumn);
//      Logger.log("data[userRowLocation][i] = " + data[userRowLocation][i]);
//      projectColumnLocation = i;
//      Logger.log("##########################");
//      Logger.log("Step3: projectColumnLocation = " + projectColumnLocation);
//      break;
//    }
// Step 4
// Locate the projectRowLocation in projectColumnLocation
//  for (var i = 0; i < currentSheet.getLastRow(); i++)
//  {
//
//    if ( data[i][projectColumnLocation] = data[userRowLocation][projectColumnLocation] )
//    {
//      projectRowLocation = i;
//      Logger.log("projectRowLocation = " + projectRowLocation);
//      usersProjects = (data[userRowLocation][projectColumnLocation]);
//      Logger.log("Step4: usersProjects = " + usersProjects);
//      break;
//    }
//
//  }
// Finally return current users projects.
//Logger.log("projectColumnLocation = " + projectColumnLocation);
//Logger.log("userRowLocation = " + userRowLocation);
// data[row number][column number]
//data[0][0] = Type
//data[0][1] = Name
// data[0][2] = Primary emai
//Logger.log("data[0][0] = " + data[0][0]);
//Logger.log("data[0][1] = " + data[0][1]);
//Logger.log("data[0][2] = " + data[0][2]);
//Logger.log("data[userRowLocation][0] = " + data[userRowLocation][0]);
//  Logger.log("data[projectColumnLocation][0] = " + data[projectColumnLocation][0]);
//  Logger.log("data[0][projectColumnLocation] = " + data[0][projectColumnLocation]);
//  Logger.log("data[projectColumnLocation][0] = " + data[projectColumnLocation][0]);
//  Logger.log("data[0][projectColumnLocation] = " + data[0][projectColumnLocation]);
//
//    // data[row number][column number]
//Logger.log("##########################");
//Logger.log("userRowLocation = " + userRowLocation);
//Logger.log("projectColumnLocation = " + projectColumnLocation);
//Logger.log("data[userRowLocation][projectColumnLocation] = " + data[userRowLocation][projectColumnLocation]);
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
//}//function insertInSS(e){
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