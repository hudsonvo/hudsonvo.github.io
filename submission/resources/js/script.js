document.addEventListener('DOMContentLoaded', function () {
  updateLocationOptions();
  const saveBtn = document.getElementById('saveEventBtn');
  if (saveBtn) saveBtn.addEventListener('click', saveEvent);
});

const events = [];
let editingEventIndex = null; // Track which event is being edited

function updateLocationOptions() {
  const modEl = document.getElementById('event_modality');
  const locGroup = document.getElementById('group_event_location');
  const remGroup = document.getElementById('group_event_remote_url');
  const locInput = document.getElementById('event_location');
  const remInput = document.getElementById('event_remote_url');
  
  if (!modEl || !locGroup || !remGroup) return;
  
  function apply() {
    if (modEl.value === 'in-person') {
      locGroup.style.display = 'block';
      remGroup.style.display = 'none';
      // Set required attribute based on modality
      if (locInput) locInput.required = true;
      if (remInput) remInput.required = false;
    } else {
      locGroup.style.display = 'none';
      remGroup.style.display = 'block';
      // Set required attribute based on modality
      if (locInput) locInput.required = false;
      if (remInput) remInput.required = true;
    }
  }
  
  modEl.addEventListener('change', apply);
  apply();
}

function saveEvent() {
  const form = document.getElementById('event_form');
  
  // Check if form is valid
  if (!form.checkValidity()) {
    // Show validation errors
    form.classList.add('was-validated');
    return; // Stop execution if form is invalid
  }
  
  const nameEl = document.getElementById('event_name');
  const categoryEl = document.getElementById('event_category');
  const weekdayEl = document.getElementById('event_weekday');
  const timeEl = document.getElementById('event_time');
  const modalityEl = document.getElementById('event_modality');
  const locationEl = document.getElementById('event_location');
  const remoteEl = document.getElementById('event_remote_url');
  const attendeesEl = document.getElementById('event_attendees');
  
  const modality = modalityEl.value;
  
  const eventDetails = {
    name: nameEl.value,
    category: categoryEl.value,
    weekday: weekdayEl.value,
    time: timeEl.value,
    modality: modality,
    location: modality === 'in-person' ? locationEl.value : null,
    remote_url: modality === 'remote' ? remoteEl.value : null,
    attendees: attendeesEl.value
  };
  
  if (editingEventIndex !== null) {
    // Update existing event
    events[editingEventIndex] = eventDetails;
    console.log(events);
    
    // Remove old event card and add updated one
    updateEventOnCalendarUI(eventDetails, editingEventIndex);
    
    // Reset editing state
    editingEventIndex = null;
  } else {
    // Add new event
    events.push(eventDetails);
    console.log(events);
    
    addEventToCalendarUI(eventDetails, events.length - 1);
  }
  
  // Reset form and remove validation classes
  form.reset();
  form.classList.remove('was-validated');
  
  const myModalElement = document.getElementById('event_modal');
  const myModal = bootstrap.Modal.getOrCreateInstance(myModalElement);
  myModal.hide();
}

function addEventToCalendarUI(eventInfo, eventIndex) {
  let event_card = createEventCard(eventInfo, eventIndex);
  
  const dayDiv = document.getElementById(eventInfo.weekday);
  
  if (dayDiv) {
    dayDiv.appendChild(event_card);
  }
}

function updateEventOnCalendarUI(eventInfo, eventIndex) {
  // Find and remove the old event card
  const oldCard = document.querySelector(`[data-event-index="${eventIndex}"]`);
  if (oldCard) {
    oldCard.remove();
  }
  
  // Add the updated event card
  addEventToCalendarUI(eventInfo, eventIndex);
}

function createEventCard(eventDetails, eventIndex) {
  let event_element = document.createElement('div');
  event_element.classList = 'event row border rounded m-1 py-1';
  event_element.style.cursor = 'pointer'; // Show it's clickable
  event_element.setAttribute('data-event-index', eventIndex); // Store the index
  
  // Apply background color based on category
  const categoryColors = {
    'academic': '#d4edda',    // light green
    'work': '#cce5ff',        // light blue
    'personal': '#fff3cd',    // light yellow
    'athletic': '#f8d7da'     // light red
  };
  
  event_element.style.backgroundColor = categoryColors[eventDetails.category] || '#f8f9fa';
  
  // Add click event to open modal with pre-filled values
  event_element.addEventListener('click', function() {
    openEditModal(eventIndex);
  });
  
  let info = document.createElement('div');
  
  info.innerHTML = `
    <strong>${eventDetails.name}</strong><br>
    Category: ${eventDetails.category.charAt(0).toUpperCase() + eventDetails.category.slice(1)}<br>
    Time: ${eventDetails.time}<br>
    Modality: ${eventDetails.modality}<br>
    ${eventDetails.location ? 'Location: ' + eventDetails.location : ''}
    ${eventDetails.remote_url ? 'URL: ' + eventDetails.remote_url : ''}<br>
    Attendees: ${eventDetails.attendees}
  `;
  
  event_element.appendChild(info);
  
  return event_element;
}

function openEditModal(eventIndex) {
  editingEventIndex = eventIndex;
  const event = events[eventIndex];
  const form = document.getElementById('event_form');
  
  // Remove validation classes when opening for edit
  form.classList.remove('was-validated');
  
  // Pre-fill the form with existing event data
  document.getElementById('event_name').value = event.name;
  document.getElementById('event_category').value = event.category;
  document.getElementById('event_weekday').value = event.weekday;
  document.getElementById('event_time').value = event.time;
  document.getElementById('event_modality').value = event.modality;
  
  if (event.location) {
    document.getElementById('event_location').value = event.location;
  } else {
    document.getElementById('event_location').value = '';
  }
  
  if (event.remote_url) {
    document.getElementById('event_remote_url').value = event.remote_url;
  } else {
    document.getElementById('event_remote_url').value = '';
  }
  
  document.getElementById('event_attendees').value = event.attendees;
  
  // Update the location/remote URL visibility based on modality
  updateLocationOptions();
  
  // Open the modal
  const myModalElement = document.getElementById('event_modal');
  const myModal = new bootstrap.Modal(myModalElement);
  myModal.show();
}