
  document.addEventListener("DOMContentLoaded", () => {
    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");
    const navItems = document.querySelectorAll(".nav-links li"); // Select all list items

    let isOpen = false; // Track the state of the menu

    // Toggle the hamburger menu
    hamburger.addEventListener("click", () => {
      if (!isOpen) {
        // If menu is closed, slide in
        navLinks.classList.remove("closing");
        navLinks.classList.add("active");
        isOpen = true;
      } else {
        // If menu is open, slide out
        navLinks.classList.remove("active");
        navLinks.classList.add("closing");
        isOpen = false;
      }
    });

    // Close the hamburger menu when any navigation link is clicked
    navItems.forEach((item) => {
      item.addEventListener("click", () => {
        if (isOpen) {
          navLinks.classList.remove("active");
          navLinks.classList.add("closing");
          hamburger.classList.remove("active");
          isOpen = false;
        }
      });
    });
  });


// Select the navbar element
const navbar = document.querySelector('.navbar');

// Add a scroll event listener to the window
window.addEventListener('scroll', () => {
  // Check if the page is scrolled down
  if (window.scrollY > 0) {
    navbar.classList.add('blur'); // Add blur class
  } else {
    navbar.classList.remove('blur'); // Remove blur class
  }
});


document.addEventListener("DOMContentLoaded", () => {
  const testimonials = document.querySelectorAll(".testimonial-card");
  const prevButton = document.querySelector(".nav-btn.prev");
  const nextButton = document.querySelector(".nav-btn.next");

  let currentIndex = 0;

  // Function to update the visible testimonial
  const updateTestimonials = () => {
    testimonials.forEach((testimonial, index) => {
      testimonial.style.display = index === currentIndex ? "block" : "none";
    });
  };

  // Show the first testimonial initially
  updateTestimonials();

  // Event listener for the "Previous" button
  prevButton.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
    updateTestimonials();
  });

  // Event listener for the "Next" button
  nextButton.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % testimonials.length;
    updateTestimonials();
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const scroller = document.querySelector(".news-scroller");
  const newsCards = document.querySelectorAll(".news-card");

  if (newsCards.length > 0) {
    const totalHeight = Array.from(newsCards).reduce((total, card) => total + card.offsetHeight, 0);
    scroller.style.animationDuration = `${totalHeight / 30}s`; // Adjust speed factor here
  }
});

document.getElementById("contactForm").addEventListener("submit", async function (event) {
  event.preventDefault(); // Prevent the default form submission

  // Get form data
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData.entries());

  try {
    // Send data to the server
    const response = await fetch("/submit-contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    // Show a success message
    const responseMessage = document.getElementById("responseMessage");
    responseMessage.style.display = "block";
    responseMessage.textContent = result.message || "Thank you for contacting us!";
  } catch (error) {
    console.error("Error submitting the form:", error);
  }
});

