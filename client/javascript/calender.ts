import {Events} from "../../server/model/Events";

function addEvent(event) {

    event.preventDefault();

    const addEventName: JQuery = $('#eventName');
    const addEventPic: JQuery = $('#uploadEventPic');
    const addStartingDate: JQuery = $('#startingDate');
    const addEndingDate: JQuery = $('#endingDate');
    const addStartTime: JQuery = $('#startTime');
    const addEndTime: JQuery = $('#endingTime');
    const addEventType: JQuery = $('#Type');
    const addEventDescription: JQuery = $('#eventDescription');
    const AddAdressCheck: JQuery = $('#adressCheck');
    const AdressFormModal: JQuery = $('#addEvent');
    const addGenre: JQuery = $('#genre');
    const addPrice: JQuery = $('#price');

    const eventName: string = addEventName.val().toString().trim();
    const eventDate: string = addStartingDate.val().toString().trim();
    const endingDate: string = addEndingDate.val().toString().trim();
    const startTime: string = addStartTime.val().toString().trim();
    const endTime: string = addEndTime.val().toString().trim();
    const eventDescription: string = addEventDescription.val().toString().trim();
    const eventType: string = addEventType.val().toString().trim();
    const adressCheck: boolean = Boolean(AddAdressCheck.val().toString().trim());
    const genre: string = addGenre.val().toString().trim();
    const price: number = Number(addPrice.val().toString().trim());

    let formData = new FormData(this);

    let newEvent = {
        "eventName": eventName,
        "eventDate": eventDate,
        "eventDateEnding": endingDate,
        "eventHour": startTime,
        "eventHourEnding": endTime,
        "eventDescription": eventDescription,
        "eventGenre": genre,
        "eventCosts": price
    }

    formData.append('newEvent', JSON.stringify(newEvent));

    if (formData && eventName && eventDate && startTime && endTime && eventDescription) {
        $.ajax("/addnewevent", {
            method: "POST",
            dataType: 'text',
            cache: false,
            contentType: false,
            processData: false,
            data: formData,
        }).then(() => {
            alert('Veranstaltung' + eventName + ' erfolgreich erstellt!')
            AdressFormModal.trigger('reset');

        }).catch((response) => {
            alert('Veranstaltung`' + eventName + 'konnte nicht erstellt werden' + response)
        })
    }
}

function updateCalender() {
    $.ajax("/events", {
        type: "GET",
        contentType: "json",
        success: (response) => {
            renderCalender(response.eventList);
        },
        error: (response) => {
            console.log(response.responseJSON)
        }
    })
}

function renderCalender (eventList: Events[]) {
    let calenderBody: JQuery = $("#calenderTable");


    calenderBody.empty();

    for (let event of eventList) {
        const eventDate:string =`${event.eventDate}`.slice(8, 10);
        let eventMonth: string = `${event.eventDate}`.slice(5, 7);

        let Date: number = Number(eventDate);
        let month: number = Number(eventMonth);
        let monthName: string;

            switch(month){
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

        let newEvent: JQuery = $(`
<div class="card mb-3" id="event_card">
    <img src="/img/events/${event.eventPic}" class="card-img-top" alt="...">
    <div id="card_date">
       <h1 class="display-4">
          <span class="badge badge-secondary">${Date}</span>
       </h1>
       <h2>${monthName}</h2>
    </div>
    <div class="card_event_body">
       <h5 class="card-title">${event.eventName}
       </h5>
       <p class="card-text">${event.eventDescription}</p>
    </div>
    <div class="card_event_footer">
       <p class="card-text">
          <small class="text-muted">
       <ul class="list-inline">
       <li class="list-inline-item">
       <li class="list-inline-item">
       <i class="fas fa-clock" aria-hidden="true">${event.eventHour} - ${event.eventHourEnding}</i>
       </li>
       <li class="list-inline-item"><i class="fa fa-person-booth" aria-hidden="true"></i>${event.eventPublisher}</li>
       </ul>
       </small></p>
    </div>
</div>
       


        `);
            calenderBody.append(newEvent)
    }
}

$(() => {

    const uploadPic: JQuery = $('#uploadForm');

    updateCalender()

    uploadPic.on('submit', addEvent)
})
