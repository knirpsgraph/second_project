"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function addEvent(event) {
    event.preventDefault();
    var addEventName = $('#eventName');
    var addEventPic = $('#uploadEventPic');
    var addStartingDate = $('#startingDate');
    var addEndingDate = $('#endingDate');
    var addStartTime = $('#startTime');
    var addEndTime = $('#endingTime');
    var addEventType = $('#Type');
    var addEventDescription = $('#eventDescription');
    var AddAdressCheck = $('#adressCheck');
    var AdressFormModal = $('#addEvent');
    var addGenre = $('#genre');
    var addPrice = $('#price');
    var eventName = addEventName.val().toString().trim();
    var eventDate = addStartingDate.val().toString().trim();
    var endingDate = addEndingDate.val().toString().trim();
    var startTime = addStartTime.val().toString().trim();
    var endTime = addEndTime.val().toString().trim();
    var eventDescription = addEventDescription.val().toString().trim();
    var eventType = addEventType.val().toString().trim();
    var adressCheck = Boolean(AddAdressCheck.val().toString().trim());
    var genre = addGenre.val().toString().trim();
    var price = Number(addPrice.val().toString().trim());
    var formData = new FormData(this);
    var newEvent = {
        "eventName": eventName,
        "eventDate": eventDate,
        "eventDateEnding": endingDate,
        "eventHour": startTime,
        "eventHourEnding": endTime,
        "eventDescription": eventDescription,
        "eventGenre": genre,
        "eventCosts": price
    };
    formData.append('newEvent', JSON.stringify(newEvent));
    if (formData && eventName && eventDate && startTime && endTime && eventDescription) {
        $.ajax("/addnewevent", {
            method: "POST",
            dataType: 'text',
            cache: false,
            contentType: false,
            processData: false,
            data: formData,
        }).then(function () {
            alert('Veranstaltung' + eventName + ' erfolgreich erstellt!');
            AdressFormModal.trigger('reset');
        }).catch(function (response) {
            alert('Veranstaltung`' + eventName + 'konnte nicht erstellt werden' + response);
        });
    }
}
function updateCalender() {
    $.ajax("/events", {
        type: "GET",
        contentType: "json",
        success: function (response) {
            renderCalender(response.eventList);
        },
        error: function (response) {
            console.log(response.responseJSON);
        }
    });
}
function renderCalender(eventList) {
    var calenderBody = $("#calenderTable");
    calenderBody.empty();
    for (var _i = 0, eventList_1 = eventList; _i < eventList_1.length; _i++) {
        var event_1 = eventList_1[_i];
        var eventDate = ("" + event_1.eventDate).slice(8, 10);
        var eventMonth = ("" + event_1.eventDate).slice(5, 7);
        var Date_1 = Number(eventDate);
        var month = Number(eventMonth);
        var monthName = void 0;
        switch (month) {
            case 1:
                monthName = "January";
                break;
            case 2:
                monthName = "February";
                break;
            case 3:
                monthName = "March";
                break;
            case 4:
                monthName = "April";
                break;
            case 5:
                monthName = "May";
                break;
            case 6:
                monthName = "June";
                break;
            case 7:
                monthName = "July";
                break;
            case 8:
                monthName = "August";
                break;
            case 9:
                monthName = "September";
                break;
            case 10:
                monthName = "October";
                break;
            case 11:
                monthName = "November";
                break;
            case 12:
                monthName = "December";
                break;
            default:
                console.log('Data error @switch monthName');
                break;
        }
        var newEvent = $("\n<div class=\"card mb-3\" id=\"event_card\">\n    <img src=\"/img/events/" + event_1.eventPic + "\" class=\"card-img-top\" alt=\"...\">\n    <div id=\"card_date\">\n       <h1 class=\"display-4\">\n          <span class=\"badge badge-secondary\">" + Date_1 + "</span>\n       </h1>\n       <h2>" + monthName + "</h2>\n    </div>\n    <div class=\"card_event_body\">\n       <h5 class=\"card-title\">" + event_1.eventName + "\n       </h5>\n       <p class=\"card-text\">" + event_1.eventDescription + "</p>\n    </div>\n    <div class=\"card_event_footer\">\n       <p class=\"card-text\">\n          <small class=\"text-muted\">\n       <ul class=\"list-inline\">\n       <li class=\"list-inline-item\">\n       <li class=\"list-inline-item\">\n       <i class=\"fas fa-clock\" aria-hidden=\"true\">" + event_1.eventHour + " - " + event_1.eventHourEnding + "</i>\n       </li>\n       <li class=\"list-inline-item\"><i class=\"fa fa-person-booth\" aria-hidden=\"true\"></i>" + event_1.eventPublisher + "</li>\n       </ul>\n       </small></p>\n    </div>\n</div>\n       \n\n\n        ");
        calenderBody.append(newEvent);
    }
}
$(function () {
    var uploadPic = $('#uploadForm');
    updateCalender();
    uploadPic.on('submit', addEvent);
});
