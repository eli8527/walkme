/* --------------------------------------------------------------------------
| Route View Controller
|
| Displays textual directions
|-------------------------------------------------------------------------- */

app.controller("routeController", function ($scope) {
    app.directionsDisplay.setPanel(document.getElementById('directions-panel'));
});