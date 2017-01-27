$(document).ready(function() {

  $logo = $('.navbar-header .navbar-brand img');
  $countdown = $(".countdown");

  $logo.mouseover(function() { $(this).attr("src", 'img/scgold.png'); })
  $logo.mouseout(function() { $(this).attr("src", 'img/sc.png');})
  $countdown.text(getDays() + " Days");

  function getDays() {
    var now = moment(); //todays date
    var end = moment("2017-09-09"); // another date
    var duration = moment.duration(now.diff(end));
    var days = duration.asDays();
    return Math.floor(Math.abs(days));
  }
})
