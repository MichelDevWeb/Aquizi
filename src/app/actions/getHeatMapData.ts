import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db, COLLECTIONS } from '@/lib/firestore/firestore-config';
import { convertDateToString } from '@/lib/utils';

const getHeatMapData = async (userId?: string) => {
  if (!userId) {
    return null;
  }

  try {
    // Get all games for the user
    // Firestore doesn't allow multiple != filters, so we'll filter in memory instead
    const gamesQuery = query(
      collection(db, COLLECTIONS.GAMES),
      where('userId', '==', userId)
    );
    
    const gamesSnapshot = await getDocs(gamesQuery);
    
    // Group games by day
    const gamesByDay = new Map<string, number>();
    
    gamesSnapshot.forEach((doc) => {
      const data = doc.data();
      // Filter out entries with null timeStarted or timeEnded in memory
      if (data.timeStarted && data.timeEnded) {
        // Convert Firestore timestamp to Date
        const date = data.timeStarted instanceof Timestamp 
          ? data.timeStarted.toDate() 
          : new Date(data.timeStarted);
        
        // Format date using our standardized format
        const dateKey = convertDateToString(date, false); // Use YYYY/MM/DD format for sorting
        
        // Increment count for this day
        const currentCount = gamesByDay.get(dateKey) || 0;
        gamesByDay.set(dateKey, currentCount + 1);
      }
    });
    
    // Convert Map to array format expected by the heatmap
    const data = Array.from(gamesByDay.entries()).map(([createdAt, count]) => ({
      createdAt,
      count
    }));
    
    return { data };
  } catch (error) {
    console.error("Error fetching heat map data:", error);
    return { data: [] };
  }
};

export default getHeatMapData;
