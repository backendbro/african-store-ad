console.log("Hello world");
document.getElementById("messageForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get the message from the textarea
  const message = document.getElementById("message").value.trim();

  // Retrieve token (this may be set by your checkadmin.js)
  const token = localStorage.getItem("token");

  // Optional: Validate that message isn't empty
  if (!message) {
    Swal.fire({
      icon: "warning",
      title: "Empty Message",
      text: "Please enter a message before sending.",
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
    });
    return;
  }

  // Loader: disable the button and show a spinner
  const submitButton = document.querySelector(
    "#messageForm button[type='submit']"
  );
  submitButton.disabled = true;
  const originalText = submitButton.innerHTML;
  submitButton.innerHTML = `<i class="ri-loader-4-line animate-spin"></i> Sending...`;

  try {
    // Call the admin API endpoint with the token in headers
    const response = await fetch(
      "https://african-store.onrender.com/api/v1/admin-review",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      }
    );

    const data = await response.json();

    // Restore the button's state
    submitButton.disabled = false;
    submitButton.innerHTML = originalText;

    if (response.ok) {
      Swal.fire({
        icon: "success",
        title: "Message Sent",
        text: data.message,
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      // Clear the form if needed
      document.getElementById("messageForm").reset();
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          data.message || "Something went wrong while sending your message.",
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }
  } catch (error) {
    // Restore the button's state
    submitButton.disabled = false;
    submitButton.innerHTML = originalText;

    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message || "Something went wrong while sending your message.",
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
    });
  }
});
