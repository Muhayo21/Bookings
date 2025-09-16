const apiKey = '$2a$10$Nmr.1q1R.bUFczKU70W1Ou/dBPLwV/kCU0sVCkcuWkErvYsHaykSO'; 
const binId = '685194b18960c979a5ab8635';   
const apiUrl = `https://api.jsonbin.io/v3/b/${binId}`;

const form = document.getElementById('rsvpForm');
const message = document.getElementById("message");
const countDisplay = document.getElementById("count");
const validateBtn = document.getElementById('validateBtn');
const deleteBtn = document.getElementById('deleteBtn');
const submitBtn = form.querySelector('button[type="submit"]');

const MaxReservations = 14;
let CurrentReservations = 0;

let isUpdateMode = false;
let currentGuestIndex = -1;

// 🟢 Load current reservation count
async function loadReservationCount() {
  try {
    const res = await fetch(`${apiUrl}/latest`, { headers: { 'X-Master-Key': apiKey } });
    const data = await res.json();
    const guests = data.record || [];

    CurrentReservations = guests.reduce((sum, g) => sum + (parseInt(g.guestCount) || 0), 0);
    countDisplay.textContent = `${CurrentReservations} / ${MaxReservations} spots filled`;
  } catch (error) {
    console.error("Failed to load guest data:", error);
    message.textContent = '⚠ Could not load current reservations.';
    message.style.color = 'red';
  }
}

loadReservationCount();

// Enable/disable delete button
function setDeleteButtonState(enabled) {
    deleteBtn.disabled = !enabled;
}

// 🔍 Validate email
validateBtn.addEventListener('click', async () => {
  const emailInput = document.getElementById('email').value.trim().toLowerCase();
  if (!emailInput) return alert("Please enter an email to validate.");

  try {
    const res = await fetch(`${apiUrl}/latest`, { 
      headers: { 'X-Master-Key': apiKey } 
    });

    const data = await res.json();

    // JSONBin v3 stores the actual data in data.record
    const guests = Array.isArray(data.record) ? data.record : [];

    const guestIndex = guests.findIndex(g => g.email.toLowerCase() === emailInput);

    if (guestIndex >= 0) {
      const guest = guests[guestIndex];
      document.getElementById('name').value = guest.name || '';
      document.getElementById('attending').value = guest.attending || 'Player';
      document.getElementById('guestCount').value = guest.guestCount || 1;

      submitBtn.textContent = 'Update RSVP';
      isUpdateMode = true;
      currentGuestIndex = guestIndex;

      message.textContent = `ℹ️ Found existing RSVP for ${guest.name}. You can update or delete it.`;
      message.style.color = 'blue';

      setDeleteButtonState(true);
    } else {
      message.textContent = `ℹ️ No existing RSVP found. You can submit a new one.`;
      message.style.color = 'green';
      form.reset();
      document.getElementById('email').value = emailInput;
      submitBtn.textContent = 'Submit RSVP';
      isUpdateMode = false;
      currentGuestIndex = -1;

      setDeleteButtonState(false);
    }
  } catch (error) {
    console.error(error);
    message.textContent = '⚠ Could not validate email. Try again later.';
    message.style.color = 'red';
    setDeleteButtonState(false);
  }
});


// 🗑 Delete guest
deleteBtn.addEventListener('click', async () => {
    if (!isUpdateMode || currentGuestIndex === -1) return;
    if (!confirm("Are you sure you want to delete this RSVP?")) return;

    try {
        const res = await fetch(`${apiUrl}/latest`, { headers: { 'X-Master-Key': apiKey } });
        const data = await res.json();
        const guests = data.record || [];

        CurrentReservations -= guests[currentGuestIndex].guestCount;
        guests.splice(currentGuestIndex, 1); // remove guest

        const saveRes = await fetch(apiUrl, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'X-Master-Key': apiKey },
            body: JSON.stringify(guests)
        });

        if (saveRes.ok) {
            message.textContent = '✅ RSVP deleted successfully.';
            message.style.color = 'green';
            countDisplay.textContent = `${CurrentReservations} / ${MaxReservations} spots filled`;
            form.reset();
            submitBtn.textContent = 'Submit RSVP';
            isUpdateMode = false;
            currentGuestIndex = -1;
            setDeleteButtonState(false);
        } else {
            message.textContent = '❌ Error deleting RSVP.';
            message.style.color = 'red';
        }

    } catch (error) {
        console.error(error);
        message.textContent = '❌ Network error. Could not delete RSVP.';
        message.style.color = 'red';
    }
});

// 📝 Submit or Update RSVP
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim().toLowerCase();
  const attending = document.getElementById('attending').value;
  const guestCount = parseInt(document.getElementById('guestCount').value, 10);

  let guests = [];
  try {
    const res = await fetch(`${apiUrl}/latest`, { headers: { 'X-Master-Key': apiKey } });
    const data = await res.json();
    guests = data.record || [];
  } catch (error) {
    console.error("Error fetching guest list:", error);
    message.textContent = '⚠ Error loading guest list. Try again later.';
    message.style.color = 'red';
    return;
  }

  if (!isUpdateMode) {
    const emailExists = guests.some(g => g.email.toLowerCase() === email);
    if (emailExists) {
      message.textContent = '❌ This email has already RSVP’d. Use Validate to update.';
      message.style.color = 'red';
      return;
    }
  }

  let projectedReservations = isUpdateMode && currentGuestIndex >= 0
    ? CurrentReservations - guests[currentGuestIndex].guestCount + guestCount
    : CurrentReservations + guestCount;

  if (projectedReservations > MaxReservations) {
    message.textContent = `❌ Only ${MaxReservations - CurrentReservations + (isUpdateMode ? guests[currentGuestIndex].guestCount : 0)} spot
