import React from "react";

const AboutPage: React.FC = () => {
  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>About Us</h1>
      <p>
        Welcome to our movie recommendation app! We aim to provide personalized
        movie recommendations based on your preferences. Whether you enjoy
        action-packed blockbusters, thought-provoking dramas, or light-hearted
        comedies, we have something for everyone.
      </p>
      <p>
        Our advanced AI technology analyzes your tastes and suggests movies that
        you're sure to love. We are constantly updating our database to include
        the latest releases and timeless classics.
      </p>
      <p>
        Thank you for choosing us as your trusted source for movie suggestions.
        We hope you enjoy discovering new films with us!
      </p>
    </div>
  );
};

export default AboutPage;
