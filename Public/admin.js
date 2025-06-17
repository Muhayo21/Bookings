// Admin dashboard logic

// Fetch guest data from the server
async function fetchGuests() {
  const res = await fetch('/api/rsvps'); // Call backend API to get all guests
  return res.json(); // Parse and return JSON array of guest objects
}

// Build a table row (<tr>) for a single guest
function createRow(guest) {
  const tr = document.createElement('tr'); // Create row element

  // Helper function to create and append <td> with text
  function td(text) {
    const cell = document.createElement('td'); // Create cell
    cell.textContent = text; // Set its content
    tr.appendChild(cell); // Add cell to row
  }

  td(guest.id); // Add guest ID
  td(guest.name); // Add guest name
  td(guest.email); // Add guest email
  td(guest.attending); // Add attending status
  td(guest.guestCount); // Add total guest count

  td(guest.seat || ''); // Add seat assignment (blank if none)

  // --- Assign Seat Input and Save Button ---
  const seatInput = document.createElement('input'); // Create text box
  seatInput.type = 'text';
  seatInput.value = guest.seat; // Pre-fill with current value
  seatInput.placeholder = 'e.g., Table 3'; // Hint

  const saveBtn = document.createElement('button'); // Button to save seat
  saveBtn.textContent = 'Save';

  // Save button logic: send PUT request to backend
  saveBtn.addEventListener('click', async () => {
    await fetch(`/api/rsvps/${guest.id}/seat`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seat: seatInput.value })
    });
    load(); // Refresh the table after saving
  });

  // Final <td> for input + button
  const actionTd = document.createElement('td');
  actionTd.appendChild(seatInput);
  actionTd.appendChild(saveBtn);
  tr.appendChild(actionTd);

  return tr; // Return the complete <tr> row
}

// Load all guests and render them in the table
async function load() {
  const guests = await fetchGuests(); // Get array of guests from server
  const tbody = document.querySelector('#guestTable tbody'); // Find table body
  tbody.innerHTML = ''; // Clear any existing rows

  guests.forEach(guest => {
    const row = createRow(guest); // Create row for each guest
    tbody.appendChild(row); // Add row to the table
  });
}

// Run load() when page is ready
window.addEventListener('DOMContentLoaded', load);