import * as admin from "firebase-admin";

// v2 specific import for scheduled functions
import {onSchedule} from "firebase-functions/v2/scheduler";

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

import {getAnimeOfTheDay, AnimeOfTheDayOutput} from
  "../../src/ai/flows/anime-of-the-day-flow";


/**
 * Daily Scheduled Function to update the "Anime of the Day" in Firestore.
 *
 * This function is triggered by a scheduler at 00:00 (midnight) UTC daily.
 * It calls the getAnimeOfTheDay Genkit flow, which determines the new anime,
 * and then writes this data to the 'app_data/anime_of_the_day'
 * document in Firestore.
 */
export const updateDailyAnimeOfTheDay = onSchedule(
  {
    schedule: "0 0 * * *", // Runs daily at midnight UTC (00:00)
    timeZone: "Etc/UTC",
  },
  async () => { // Changed from 'async (event)' as 'event' is unused
    console.log(
      `[${new Date().toISOString()}] Running daily scheduled job to update ` +
      "Anime of the Day."
    );

    try {
      // 1. Call the Genkit flow to get the new Anime of the Day
      const newAnimeData: AnimeOfTheDayOutput = await getAnimeOfTheDay();
      console.log(
        "Successfully retrieved new Anime of the Day from Genkit flow:",
        newAnimeData.title
      );

      // 2. Define the Firestore document reference
      // We'll store it in a document named "anime_of_the_day"
      // within the "app_data" collection.
      const animeOfTheDayDocRef = db.collection("app_data")
        .doc("anime_of_the_day");

      // 3. Write the returned AnimeOfTheDayOutput to Firestore
      // Using .set() without { merge: true } will overwrite the document
      // entirely, ensuring that old fields are removed if they are no longer
      // part of the new data.
      await animeOfTheDayDocRef.set(newAnimeData);

      console.log(
        `[${new Date().toISOString()}] Anime of the Day successfully updated ` +
        `to: "${newAnimeData.title}" in Firestore.`
      );
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] Error updating Anime of the Day:`,
        error
      );
      // Log the error details for debugging
      if (error instanceof Error) {
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      // For scheduled functions, re-throwing the error will mark the function
      // execution as failed which can be useful for monitoring and alerting.
      throw error;
    }
  }
);
