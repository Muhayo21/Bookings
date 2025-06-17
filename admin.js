
// Displays and updates guest list in JSONBin

const apiKey = '$2a$10$Nmr.1q1R.bUFczKU70W1Ou/dBPLwV/kCU0sVCkcuWkErvYsHaykSO'; 
const binId = '685194b18960c979a5ab8635';   
const apiUrl = `https://api.jsonbin.io/v3/b/${binId}`;

//  Load guest list from JSONBin
async function fetchGuests() {
  const res = await fetch(`${apiUrl}/latest`, {
    headers: { 'X-Master-Key': apiKey }
  });
  const data = await res.json();
  return data.record || [];
}

//  Build a row for each guest, with editable seat assignment
function createRow(guest, index, guests) {
  const tr = document.createElement('tr');

  function td(text) {
    const cell = document.createElement('td');
    cell.textContent = text;
    tr.appendChild(cell);
  }

  //  Basic details
  td(index + 1); // Guest #
  td(guest.name);
  td(guest.email);
  td(guest.attending);
  td(guest.guestCount);

  //  Editable seat
  const seatInput = document.createElement('input');
  seatInput.type = 'text';
  seatInput.value = guest.seat || '';
  seatInput.placeholder = 'e.g., Table 5';

  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save';
  saveBtn.addEventListener('click', async () => {
    guest.seat = seatInput.value;
    guests[index] = guest;

    //  Save updated guest list
    await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': apiKey
      },
      body: JSON.stringify(guests)
    });

    load(); //  Refresh table
  });

  const seatCell = document.createElement('td');
  seatCell.appendChild(seatInput);
  seatCell.appendChild(saveBtn);
  tr.appendChild(seatCell);

  return tr;
}

//  Load guest list and populate table
async function load() {
  const guests = await fetchGuests();
  const tbody = document.querySelector('#guestTable tbody');
  tbody.innerHTML = '';
  guests.forEach((g, i) => tbody.appendChild(createRow(g, i, guests)));
}

load(); //  Initial load
