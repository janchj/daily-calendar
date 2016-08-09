"use strict";

// set default object with configuration elements
var defaults = {
    startHour: 9,
    hoursCount: 13,
    hours: [],
    events: [],
    pxPerMinute: 1.333333333333333,
    W: 575,
    template: `<table class="calendar">
                <tbody>
                    <tr>
                        <td>
                            <% _.each(hours, function(hour) { %><div class="row-hour"><span class="text-hour"><%- hour.format('h') %>:00</span></div><% }); %>
                        </td>
                        <td>
                            <div class="row-half-hour"><span class="text-half-hour">AM</span></div>
                            <% _.times(hours.length-1, function(index) { %>
                                <div class="row-half-hour"><span class="text-half-hour"><%- hours[index].format('h') %>:30</span></div>
                                <div class="row-half-hour"><span class="text-half-hour"><%- hours[index].format('A') %></span></div><% }); %>
                        </td>
                        <td style="position:relative">
                            <% _.times(hours.length-1, function() { %><div class="row-events"></div><% }); %>
                            <% _.each(events, function(event) { %>
                                <div class="event" style="left:<%- event.left%>px;top:<%- event.top%>px;width:<%- event.width%>px;height:<%- event.height%>px;position:absolute;">
                                    <div class="event-details">
                                        <span class="title"><%-event.title%></span>
                                        <span class="details"><%-event.details%></span>
                                    </div>
                                </div><% }); %>
                        </td>
                    </tr>
                </tbody>
                </table>`
}

// get calendar from UI
var calendar = $('.calendar', this.element);

// returns the hours to be rendered
var getCalendarHours = function () {
    var hour = moment().set('hour', defaults.startHour);
    _.times(defaults.hoursCount, function () {
        defaults.hours.push(moment(hour));
        hour.add(1, 'hours');
    });
}

// get the events from provided list
var getCalendarEvents = function () {
    var sortedEvents = [];
    var width = 0;
    var clashes = {};

    // sort by date
    sortedEvents = _.sortBy(defaults.events, ['start']);

    // get the position of all events
    _.each(sortedEvents, function (event, index) {
        event.width = defaults.W;
        event.left = 0;
        event.height = ((event.end - event.start) * defaults.pxPerMinute).toFixed(2);
        event.top = (event.start * defaults.pxPerMinute).toFixed(2);
    });

    // group events by date
    var lastStartTime, lastEndTime;
    var groupedItems = [];
    var eventOverLappingCount = 0;
    var left = 0;

    _.each(sortedEvents, function (event, index) {

        // check if another event belongs to the same period
        if (dateOverlaps(event.start, event.end, lastStartTime, lastEndTime)) {
            groupedItems.push(index);
            sortedEvents[index].width = sortedEvents[index - 1].width = (defaults.W - 20) / 2;
            sortedEvents[index].left = (defaults.W / 2) + 10;
        }

        // update pointers
        lastStartTime = event.start;
        lastEndTime = event.end;

    });

    // update list of events
    sortedEvents[sortedEvents.length-1].left = 0;
    defaults.events = sortedEvents;
}

/**
 * Checks if two dates belong to the same range
 */
function dateOverlaps(d1Start, d1End, d2Start, d2End) {

    // date2 part of date#1
    if (d1Start <= d2Start && d2Start <= d1End)
        return true;

    // date2 within date1
    if (d1Start <= d2End && d2End <= d1End)
        return true;

    // date2 ends within date1
    if (d2Start < d1Start && d1End < d2End)
        return true;

    // dates not clashing
    return false;
}


/* initializes the calendar */
var initCalendar = function (events) {

    // populate hours
    getCalendarHours();

    // populate events
    getCalendarEvents();

    // render all calendar elements
    renderCalendar();

}

/* removes the calendar */
var destroyCalendar = function () {
    this.calendar.empty().remove();
}

/* renders all the event in a calendar */
var renderCalendar = function () {

    // load the calendar template
    var compiled = _.template(defaults.template);

    // render template on page
    calendar.html(compiled({ hours: defaults.hours, events: defaults.events }));
}

/* entry method */
var layOutDay = function (events) {

    // assign a title/location to all events
    _.each(events, function (event) {
        event.title = "Sample Item";
        event.details = "Sample Location";
    });

    // set dataSource for events
    defaults.events = events;

    // initialize the calendar and set defaults
    initCalendar();

};

window.layOutDay = layOutDay;