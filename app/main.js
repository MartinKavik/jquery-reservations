/**
 * Application entry point
 */

// Load application styles
require('styles/main.scss');
require('styles/reservation.scss');

// Load jQuery
window.$ = window.jQuery = require("jquery");
// Load JSON DB
var jsonDbURL = require("../db.json");
// Load reservation plugin
require('reservation');


$(document).ready(function(){
     
    // -- INIT --   
    window.resView = $('#reservation-view').reservation({
        mode: 'mode-view'
    });

    window.resAdmin = $('#reservation-admin').reservation({
        mode: 'mode-admin'
    });
    // -- //INIT --


    // -- LOAD DATA --
    window.resView.loadData(jsonDbURL, function(){
        console.log('reservation-view', 'loaded');
    }); 
    window.resAdmin.loadData(jsonDbURL, function(){
        console.log('reservation-admin', 'loaded');
    }); 
    // -- //LOAD DATA --   
    
});
