function createRow(guest, index, guests) {
  const tr = document.createElement('tr');

  function td(text) {
    const cell = document.createElement('td');
    cell.textContent = text;
    tr.appendChild(cell);
  }

  // Basic guest info
  td(index + 1);
  td(guest.name);
  td(guest.email);
  td(guest.attending);
  td(guest.guestCount);

  // Seat assignment input + Save button
  const seatInput = document.createElement('input');
  seatInput.type = 'text';
  seatInput.value = guest.seat || '';
  seatInput.placeholder = 'e.g., Table 5';

  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save';
  saveBtn.addEventListener('click', async () => {
    guest.seat = seatInput.value;
    guests[index] = guest;

    await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': apiKey
      },
      body: JSON.stringify(guests)
    });

    load();
  });

  // ❌ Delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete';
  deleteBtn.style.marginLeft = '10px';
  deleteBtn.style.backgroundColor = '#c0392b';
  deleteBtn.style.color = 'white';
  deleteBtn.style.border = 'none';
  deleteBtn.style.padding = '6px 10px';
  deleteBtn.style.borderRadius = '6px';
  deleteBtn.style.cursor = 'pointer';

  deleteBtn.addEventListener('click', async () => {
    if (confirm(`Delete guest: ${guest.name}?`)) {
      guests.splice(index, 1); // Remove from array

      await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': apiKey
        },
        body: JSON.stringify(guests)
      });

      load(); // Refresh table
    }
  });

  const seatCell = document.createElement('td');
  seatCell.appendChild(seatInput);
  seatCell.appendChild(saveBtn);
  seatCell.appendChild(deleteBtn);
  tr.appendChild(seatCell);

  return tr;
}
