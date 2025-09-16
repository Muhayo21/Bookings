const apiKey = '$2a$10$Nmr.1q1R.bUFczKU70W1Ou/dBPLwV/kCU0sVCkcuWkErvYsHaykSO'; 
const binId = '685194b18960c979a5ab8635';   
const apiUrl = `https://api.jsonbin.io/v3/b/${binId}`;

const form = document.getElementById('rsvpForm');
const status = document.getElementById('status');
const message = document.getElementById("message");
const countDisplay = document.getElementById("count");

const MaxReservations = 14;
let CurrentReservations = 0;
let isUpdateMode = false; // Tracks if we are updating an existing guest
let currentGuestIndex = -1; // Stores the index of the guest to update

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
    if (message) {
      message.textContent = '⚠ Could not load current reservations.';
      message.style.color = 'red';
    }
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
    guests = Array.isArray(data.record) ? data.record : [];
  } catch (error) {
    console.error("Error fetching guest list:", error);
    message.textContent = '⚠ Error loading guest list. Try again later.';
    message.style.color = 'red';
    return;
  }

  if (isUpdateMode && currentGuestIndex >= 0) {
    // ❌ Check capacity for update
    const projectedReservations = CurrentReservations - guests[currentGuestIndex].guestCount + guestCount;
    if (projectedReservations > MaxReservations) {
      message.textContent = `❌ Only ${MaxReservations - (CurrentReservations - guests[currentGuestIndex].guestCount)} spot(s) available.`;
      message.style.color = 'red';
      return;
    }

    // ✅ Update existing guest
    guests[currentGuestIndex] = { name, email, attending, guestCount, seat: '' };
    CurrentReservations = projectedReservations;

  } else {
    // ❌ Check if email already RSVP'd
    const emailExists = guests.some(g => g.email.toLowerCase() === email);
    if (emailExists) {
      message.textContent = '❌ This email has already RSVP’d. Use Validate to update.';
      message.style.color = 'red';
      return;
    }

    // ❌ Check capacity for new RSVP
    if (CurrentReservations + guestCount > MaxReservations) {
      message.textContent = `❌ Only ${MaxReservations - CurrentReservations} spot(s) available.`;
      message.style.color = 'red';
      return;
    }

    // ✅ Add new guest
    guests.push({ name, email, attending, guestCount, seat: '' });
    CurrentReservations += guestCount;
  }

  // Save to JSONBin
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
      countDisplay.textContent = `${CurrentReservations} / ${MaxReservations} spots filled`;
      message.textContent = isUpdateMode ? `✅ RSVP updated for ${name}.` : `✅ Reservation confirmed for ${guestCount}`;
      message.style.color = 'green';
      form.reset();
      submitBtn.textContent = 'Submit RSVP';
      isUpdateMode = false;
      currentGuestIndex = -1;
      setDeleteButtonState(false);
    } else {
      message.textContent = '❌ Error: Could not save your RSVP.';
      message.style.color = 'red';
    }
  } catch (error) {
    console.error(error);
    message.textContent = '❌ Network error. Please try again later.';
    message.style.color = 'red';
  }
});

    if (guestIndex >= 0) {
      // Email found → populate form
      const guest = guests[guestIndex];
      document.getElementById('name').value = guest.name;
      document.getElementById('attending').value = guest.attending;
      document.getElementById('guestCount').value = guest.guestCount;