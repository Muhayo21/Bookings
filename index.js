const apiKey = '$2a$10$Nmr.1q1R.bUFczKU70W1Ou/dBPLwV/kCU0sVCkcuWkErvYsHaykSO'; 
const binId = '685194b18960c979a5ab8635';   
const apiUrl = `https://api.jsonbin.io/v3/b/${binId}`;

const form = document.getElementById('rsvpForm');
const status = document.getElementById('status');
const message = document.getElementById("message");
const countDisplay = document.getElementById("count");

const MaxReservations = 14;
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

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim().toLowerCase();
  const attending = document.getElementById('attending').value;
  const guestCount = parseInt(document.getElementById('guestCount').value, 10);

  // Load existing guest list
  let guests = [];
  try {
    const res = await fetch(`${apiUrl}/latest`, {
      headers: { 'X-Master-Key': apiKey }
    });
    const data = await res.json();
    guests = data.record || [];
  } catch (error) {
    console.error("Error fetching guest list:", error);
    status.textContent = '⚠ Error loading guest list. Try again later.';
    return;
  }

  // ❌ Check if email already RSVP'd
  const emailExists = guests.some(g => g.email.toLowerCase() === email);
if (emailExists) {
  message.textContent = '❌ This email has already RSVP’d.';
  message.style.color = 'red';
  return;
}

  // ❌ Check capacity BEFORE submitting
  if (CurrentReservations + guestCount > MaxReservations) {
    message.textContent = `Only ${MaxReservations - CurrentReservations} spot(s) available.`;
    return;
  }

  // ✅ Proceed with saving
  const newGuest = { name, email, attending, guestCount, seat: '' };
  guests.push(newGuest);

  try {
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
      countDisplay.textContent = `${CurrentReservations} / ${MaxReservations} spots filled`;
      status.textContent = `✅ Thanks ${name}! Your RSVP has been saved.`;
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
