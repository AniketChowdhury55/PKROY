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
