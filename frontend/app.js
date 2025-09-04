async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("https://script.google.com/macros/s/AKfycbz5X-byHqxgSdyO26ibUrnb60rn6YXdkSxUXY0OzdMrs19dlcKXcJaR6nU9i3VziBXbXw/exec", {
      method: "POST",
      body: JSON.stringify({ username, password })
    });

    const result = await res.json();
    if (result.success) {
      localStorage.setItem("loggedIn", "true");
      window.location.href = "speed.html"; // redirect to protected page
    } else {
      document.getElementById("error").innerText = "Invalid login!";
    }
  } catch (err) {
    document.getElementById("error").innerText = "Error connecting to server.";
  }
}

// Protect pages
if (window.location.pathname.includes("speed.html")) {
  if (localStorage.getItem("loggedIn") !== "true") {
    window.location.href = "index.html";
  }
}
