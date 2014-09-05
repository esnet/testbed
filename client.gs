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
    
    
    var handler = app.createServerHandler('changeList2');
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
function getUsersData(spreadsheetId, sheetName, firstRowKey, firstHeaderKey, secondHeaderKey)
{
    var spreadSheet = SpreadsheetApp.openById(spreadsheetId);
    var currentSheet = spreadSheet.getSheetByName(sheetName); // this grabs sheet with the users project information.
    //Logger.log("currentSheet = " + currentSheet);
    //Logger.log("sheetName = " + sheetName);
    
    if (currentSheet == null) {
        //Logger.log("Cant open sheetName = " + sheetName);
    }
    var firstHeaderKeyIndex, secondHeaderKeyIndex, firstRowKeyIndex, secondRowKeyIndex, userRowIndex, userXY, projectRowLocation, usersGoogleID;
    var data = currentSheet.getDataRange().getValues();
    var usersProjects = new Array();
    var projectColumnLocation;
    
    
    Logger.log("secondHeaderKeyIndex = " + secondHeaderKeyIndex);
    Logger.log("firstRowKey = " + firstRowKey);
    Logger.log("secondHeaderKey = " + secondHeaderKey);
    
    
    // Step 1: Locate firstHeaderKeyIndex
    for (var i = 0; i < data[0][i].length; i++)
    {
        Logger.log("data[0][i] = firstHeaderKey::::: " + data[0][i] + " = " + firstHeaderKey);
        
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
        Logger.log("data[i][firstHeaderKeyIndex]::::: " + data[i][firstHeaderKeyIndex] + " = " + firstRowKey);
        
        if ( data[i][firstHeaderKeyIndex] == firstRowKey ) {
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