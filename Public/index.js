// This script handles the guest‑side RSVP form
document.getElementById('rsvpForm').addEventListener('submit', async (e) => { // attach submit handler
  e.preventDefault(); // stop normal form POST which reloads page

  // Gather values from form inputs
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const attending = document.getElementById('attending').value;
  const guestCount = parseInt(document.getElementById('guestCount').value, 10);


  // Build request body object
  const body = { name, email, attending, guestCount };

  try {
    // Send POST request to our Express backend
    const res = await fetch('/api/rsvp', { // endpoint defined in server.js
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, // tell server JSON is coming
      body: JSON.stringify(body) // serialize body object
    });

    // Parse JSON response
    const data = await res.json();

    // Show success or error on page
    if (data.success) {
      document.getElementById('status').textContent =
        `Thanks ${data.guest.name}! We saved your RSVP.`;
      document.getElementById('rsvpForm').reset(); // clear form for next guest
    } else {
      document.getElementById('status').textContent = 'Sorry, something went wrong.';
    }
  } catch (err) {
    console.error(err); // log any error to console
    document.getElementById('status').textContent =
      'Network error. Please try again later.';
  }
});