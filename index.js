
const apiKey = '$2a$10$Nmr.1q1R.bUFczKU70W1Ou/dBPLwV/kCU0sVCkcuWkErvYsHaykSO'; 
const binId = '685194b18960c979a5ab8635';   
const apiUrl = `https://api.jsonbin.io/v3/b/${binId}`;

const form = document.getElementById('rsvpForm');
const status = document.getElementById('status');
const message = document.getElementById("message");
const countDisplay = document.getElementById("count");

const MaxReservations = 12;
let CurrentReservations = 0;

// 🟢 Load current reservation count from JSONBin
async function loadReservationCount() {
  try {
    const res = await fetch(`${apiUrl}/latest`, {
      headers: { 'X-Master-Key': apiKey }
    });

    const data = await res.json();
    const guests = data.record || [];

    CurrentReservations = guests.reduce((sum, g) => sum + (parseInt(g.guestCount) || 0), 0);
    countDisplay.textContent = `${CurrentReservations} / ${MaxReservations} spots filled`;

  } catch (error) {
    console.error("Failed to load guest data:", error);
    message.textContent = '⚠ Could not load current reservations.';
  }
}

// 🔁 Call it once when the page loads
loadReservationCount();

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const attending = document.getElementById('attending').value;
  const guestCount = parseInt(document.getElementById('guestCount').value, 10);

  // Check capacity BEFORE submitting
  if (CurrentReservations + guestCount > MaxReservations) {
    message.textContent = `Only ${MaxReservations - CurrentReservations} spot(s) available.`;
    return;
  }

  const newGuest = { name, email, attending, guestCount, seat: '' };

  try {
    // Load existing guest list
    const res = await fetch(`${apiUrl}/latest`, {
      headers: { 'X-Master-Key': apiKey }
    });
    const data = await res.json();
    const guests = data.record || [];

    // Add the new guest
    guests.push(newGuest);

    // Save updated list
    const saveRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': apiKey
      },
      body: JSON.stringify(guests)
    });

    if (saveRes.ok) {
      CurrentReservations += guestCount;
      countDisplay.textContent = CurrentReservations;
      status.textContent = `Thanks ${name}! Your RSVP has been saved.`;
      message.textContent = `Reservation confirmed for ${guestCount}`;
      form.reset();
    } else {
      status.textContent = '❌ Error: Could not save your RSVP.';
    }
  } catch (error) {
    console.error(error);
    status.textContent = '❌ Network error. Please try again later.';
  }
});

