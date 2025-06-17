
<!DOCTYPE html>
<html>
    <header>
        <title>Guest Bookings</title>
        <link rel="stylesheet" href="styles.css">
    </header>
    <body>
        <div class="FormDiv" >
        <main>
            <h1>You're Invited for a night of Adventure</h1>
            <form id="rsvpForm">
                <label>
                    Name :
                <input type="text" id="name" required>
                </label>
                <label>
                    Email :
                <input type="email" id="email" required>
                </label>
                 <label>
                    Will You Attend :
                <select id="attending">
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                </select>
                </label>
                  <label>
                    Number of Guests (Including You) :
                <input type="number" id="guestCount" value="1" min="1" max="2">
                </label>
                <div class="ButtonDiv">
                <button type="submit">Submit RSVP</button>
                </div>
            </form>
            <p id="status"></p>
            <p id="message"></p>
            <p >Reservations Made : <span id ="count">0</span></p>
        </main>
        </div>
        <script>
           const MaxReservations = 12;
           let CurrentReservations = 0;
           const form = document.getElementById("rsvpForm") ;
           const message = document.getElementById("message");
           const countDisplay = document.getElementById("count");
           const remainderDisplay = MaxReservations - countDisplay;

           form.addEventListener("submit", function(event){
           event.preventDefault();

           const amountToAdd = parseInt(document.getElementById("guestCount").value,12)
            const name = document.getElementById("name").value;
           if (CurrentReservations + amountToAdd <= MaxReservations){
            CurrentReservations += amountToAdd;
            countDisplay.textContent = CurrentReservations;
            message.textContent("Reservation confirmed for ${amountToAdd}");
            form.reset();
            } else {
                 message.textContent("Only ${MaxReservations-CurrentReservations} spots available.");
            }           
           })
        </script>
        <script src="index.js"></script>
   </body>
</html>
