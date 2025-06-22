
// Handles RSVP form submission and stores data in JSONBin

const apiKey = '$2a$10$Nmr.1q1R.bUFczKU70W1Ou/dBPLwV/kCU0sVCkcuWkErvYsHaykSO'; 
const binId = '685194b18960c979a5ab8635';   
const apiUrl = `https://api.jsonbin.io/v3/b/${binId}`;

const form = document.getElementById('rsvpForm');
const status = document.getElementById('status');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  //  Read form input values
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const attending = document.getElementById('attending').value;
  const guestCount = parseInt(document.getElementById('guestCount').value, 10);

  //  Create a new guest object
  const newGuest = { name, email, attending, guestCount, seat: '' };

  try {
    //  Load existing guest list
    const res = await fetch(`${apiUrl}/latest`, {
      headers: { 'X-Master-Key': apiKey }
    });
    const data = await res.json();
    const guests = data.record || [];

    //  Add the new guest
    guests.push(newGuest);

    //  Save updated guest list
    const saveRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': apiKey
      },
      body: JSON.stringify(guests)
    });

    if (saveRes.ok) {
      status.textContent = `Thanks ${name}! Your RSVP has been saved.`;
      form.reset();
    } else {
      status.textContent = 'Error: Could not save your RSVP.';
    }
  } catch (error) {
    console.error(error);
    status.textContent = 'Network error. Please try again later.';
  }
});
     const MaxReservations = 12;
    let CurrentReservations = 0;
   
    const message = document.getElementById("message");
    const countDisplay = document.getElementById("count");

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const amountToAdd = parseInt(document.getElementById("guestCount").value);
      const name = document.getElementById("name").value;

      if (CurrentReservations + amountToAdd <= MaxReservations) {
        CurrentReservations += amountToAdd;
        countDisplay.textContent = CurrentReservations;
        message.textContent = `Reservation confirmed for ${amountToAdd}`;
        form.reset();
      } else {
        message.textContent = `Only ${MaxReservations - CurrentReservations} spots available.`;
      }
    });
