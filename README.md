# AI Movie Recommender 🎬

Welcome to **AI Movie Recommender**, a web application built with **React** and **Next.js** that uses AI to help you discover your next favorite movie. Whether you're looking for hidden gems or popular blockbusters, our AI-powered recommendations have got you covered!

[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-13.0%2B-blue)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.0%2B-blue)](https://reactjs.org/)

---

## Features ✨

- **AI-Powered Recommendations**: Get personalized movie suggestions based on your preferences.
- **Search and Discover**: Explore movies by genre, popularity, or release year.
- **Responsive Design**: Enjoy a seamless experience on any device.
- **Fast and Scalable**: Built with Next.js for optimized performance and server-side rendering.

---

## Demo 🚀

Check out the live demo of the project: [AI Movie Recommender Demo](#) _(add your live link here)_

---

## Technologies Used 🛠️

- **Frontend**: React, Next.js, Tailwind CSS _(or your CSS framework)_
- **Backend**: Next.js API Routes
- **AI Integration**: OpenAI API _(or your AI service)_
- **Movie Data**: TMDB API _(or your movie data source)_

---

## Getting Started 🏁

Follow these steps to set up the project locally.

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- API keys for [TMDB](https://www.themoviedb.org/) and [OpenAI](https://openai.com/) _(or your AI service)_

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/ai-movie-recommender.git
   cd ai-movie-recommender
   ```
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Create a .env.local file in the root directory and add your API keys:
   ```bash
   TMDB_API_KEY=your_tmdb_api_key
   OPENAI_API_KEY=your_openai_api_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```
5. Open your web browser and navigate to [http://localhost:3000](http://localhost:3000)

### API Routes

The project uses Next.js API Routes for the backend. You can find the API routes in the `pages/api` directory.
The API endpoint is located at `http://localhost:3000/api/search` and it expects a query string parameter `q` with the user's search query. The response will be a JSON object with the following structure:

```json
{
  "movies": [
    {
      "adult": false,
      "backdrop_path": null,
      "genre_ids": [18],
      "id": 703731,
      "original_language": "en",
      "original_title": "A Separation",
      "overview": "On a warm autumn day in 1990, Huixian, a young Chinese woman, arrives in Florida to reunite with her PhD husband, after a four-year separation. Filled with blossoming hope and desire, she is introduced to another side of American life.",
      "popularity": 0.363,
      "poster_path": "/fmngHGvRYC9wT3nEFOcVsXGp9pH.jpg",
      "release_date": "2019-08-03",
      "title": "A Separation",
      "video": false,
      "vote_average": 7,
      "vote_count": 1
    },
    {
      "adult": false,
      "backdrop_path": "/pUKIUdLMHvPkCs5pQeB2TFhPSYM.jpg",
      "genre_ids": [18, 53],
      "id": 264644,
      "original_language": "en",
      "original_title": "Room",
      "overview": "Held captive for 7 years in an enclosed space, a woman and her young son finally gain their freedom, allowing the boy to experience the outside world for the first time.",
      "popularity": 29.572,
      "poster_path": "/pCURNjeomWbMSdiP64gj8NVVHTQ.jpg",
      "release_date": "2015-10-16",
      "title": "Room",
      "video": false,
      "vote_average": 8,
      "vote_count": 9222
    },
    {
      "adult": false,
      "backdrop_path": "/dVr11o9or7AS8AMPfwjSpEU83iU.jpg",
      "genre_ids": [18, 10752],
      "id": 423,
      "original_language": "en",
      "original_title": "The Pianist",
      "overview": "The true story of pianist Władysław Szpilman's experiences in Warsaw during the Nazi occupation. When the Jews of the city find themselves forced into a ghetto, Szpilman finds work playing in a café; and when his family is deported in 1942, he stays behind, works for a while as a laborer, and eventually goes into hiding in the ruins of the war-torn city.",
      "popularity": 62.164,
      "poster_path": "/2hFvxCCWrTmCYwfy7yum0GKRi3Y.jpg",
      "release_date": "2002-09-17",
      "title": "The Pianist",
      "video": false,
      "vote_average": 8.379,
      "vote_count": 9288
    },
    {
      "adult": false,
      "backdrop_path": "/m4MGxxEgAMqIX9x8MCg5pYeyYjU.jpg",
      "genre_ids": [18, 36],
      "id": 45269,
      "original_language": "en",
      "original_title": "The King's Speech",
      "overview": "The King's Speech tells the story of the man who became King George VI, the father of Queen Elizabeth II. After his brother abdicates, George ('Bertie') reluctantly assumes the throne. Plagued by a dreaded stutter and considered unfit to be king, Bertie engages the help of an unorthodox speech therapist named Lionel Logue. Through a set of unexpected techniques, and as a result of an unlikely friendship, Bertie is able to find his voice and boldly lead the country into war.",
      "popularity": 34.426,
      "poster_path": "/pVNKXVQFukBaCz6ML7GH3kiPlQP.jpg",
      "release_date": "2010-11-26",
      "title": "The King's Speech",
      "video": false,
      "vote_average": 7.737,
      "vote_count": 8741
    },
    {
      "adult": false,
      "backdrop_path": "/4Bb1kMIfrT2tYRZ9M6Jhqy6gkeF.jpg",
      "genre_ids": [18, 36],
      "id": 76203,
      "original_language": "en",
      "original_title": "12 Years a Slave",
      "overview": "In the pre-Civil War United States, Solomon Northup, a free black man from upstate New York, is abducted and sold into slavery. Facing cruelty as well as unexpected kindnesses Solomon struggles not only to stay alive, but to retain his dignity. In the twelfth year of his unforgettable odyssey, Solomon’s chance meeting with a Canadian abolitionist will forever alter his life.",
      "popularity": 41.969,
      "poster_path": "/xdANQijuNrJaw1HA61rDccME4Tm.jpg",
      "release_date": "2013-10-18",
      "title": "12 Years a Slave",
      "video": false,
      "vote_average": 7.936,
      "vote_count": 11309
    }
  ]
}
```
