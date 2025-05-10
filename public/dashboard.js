import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCiLb8FcoU5i098e2ODUUFC8FucrFWvCCs",
  authDomain: "moodmirror-33d1a.firebaseapp.com",
  projectId: "moodmirror-33d1a",
  storageBucket: "moodmirror-33d1a.appspot.com",
  messagingSenderId: "731572845065",
  appId: "1:731572845065:web:0bbb0053540038a3ffd6d8",
  measurementId: "G-S06NK5LYCQ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore();


window.logout = function () {
  signOut(auth)
    .then(() => {
      alert("Logged out!");
      window.location.href = "index.html";
    })
    .catch((error) => {
      alert("Logout error: " + error.message);
    });
};

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html"; // send back to login
  } else {
    console.log("User is logged in:", user.email);
    // Optional: update UI with user's email
    const emailDisplay = document.getElementById("user-email");
    if (emailDisplay) {
      emailDisplay.textContent = user.email;
    }
  }
});

const moodButtons = document.querySelectorAll(".mood-emoji");
const saveButton = document.getElementById("save-mood");
const moodNoteInput = document.getElementById("mood-note");

let selectedMood = null;
let user = null; // To store the authenticated user

// Add click event listener to each mood emoji
moodButtons.forEach(button => {
  button.addEventListener("click", function () {
    // Reset the background color for all buttons
    moodButtons.forEach(btn => btn.classList.remove("bg-green-500"));
    
    // Set the selected mood based on the clicked emoji
    selectedMood = this.textContent.trim();

    // Highlight the selected mood emoji 
    this.classList.add("bg-green-500");
  });
});


onAuthStateChanged(auth, async (currentUser) => {
  if (currentUser) {
    user = currentUser; // Assign the authenticated user
    console.log("User logged in:", user.email);
    
    await renderMoodTable();
    await updateMoodDistribution(); 
    await updateRecentTrends(); 
   
  } else {
    console.log("No user logged in.");
    window.location.href = "index.html"; // Redirect to login
  }
});


// Handle the Save button click event
saveButton.addEventListener("click", async () => {
  if (!selectedMood) {
    alert("Please select a mood before saving.");
    return;
  }

  if (!user) {
    alert("Please log in first.");
    return;
  }

  try {
    const moodNote = moodNoteInput.value.trim(); 

    const moodEntryRef = await addDoc(collection(db, "users", user.uid, "moodEntries"), {
      mood: selectedMood,
      note: moodNote,
      timestamp: new Date()  // Save the current timestamp
    });

    console.log("Mood entry saved with ID:", moodEntryRef.id);
    alert("Your mood has been saved!");

    selectedMood = null;
    moodNoteInput.value = "";
    moodButtons.forEach(btn => btn.classList.remove("bg-green-500"));

    // Reload the page to show updated entries
    window.location.reload();

  } catch (error) {
    console.error("Error saving mood:", error);
    alert("Failed to save mood. Please try again.");
  }
});



// the calander part

// Fetch Mood Entries from Firestore
// Combined fetchMoodEntries function to handle both Firebase dat and fallback data
// Fetch mood entries
async function fetchMoodEntries() {
  const currentUser = auth.currentUser;
  const userId = currentUser ? currentUser.uid : null;

  if (!userId) {
    console.error("User ID not found.");
    return [];
  }

  try {
    const snapshot = await getDocs(collection(db, "users", userId, "moodEntries"));
    const moodEntries = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        mood: data.mood,
        note: data.note || "",
        timestamp: data.timestamp.toDate()
      };
    });

    console.log("Fetched mood entries:", moodEntries); // Debug log
    return moodEntries;
  } catch (error) {
    console.error("Error fetching mood entries:", error);
    return [];
  }
}



async function renderMoodTable() {
  const moodEntries = await fetchMoodEntries(); 

  moodEntries.sort((a, b) => b.timestamp - a.timestamp);

  const tableBody = document.getElementById("mood-table-body");
  tableBody.innerHTML = ""; // Clear any old content

  moodEntries.forEach(entry => {
      const date = new Date(entry.timestamp);
      const formattedDate = date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric"
      });

      const row = document.createElement("tr");
      row.innerHTML = `
          <td class="p-2 border">${formattedDate}</td>
          <td class="p-2 border text-xl">${entry.mood}</td>
      `;
      tableBody.appendChild(row);
  });

  initializeSlider();
}

function initializeSlider() {
  const moodEntriesContainer = document.querySelector("#mood-table-body");
  
  const scrollStep = 250; // Adjust this for the height of a row
}

document.addEventListener("DOMContentLoaded", renderMoodTable);


//mood overview

async function getMoodCount() {
  try {
    const moodEntries = await fetchMoodEntries();
    console.log("Fetched entries for count:", moodEntries.length);

    if (moodEntries.length === 0) {
      console.log("No entries found, adding test data");
      return {
        count: {
          "😊": 2, 
          "😐": 3, 
          "😔": 1, 
          "😡": 2, 
          "😴": 2
        }, 
        total: 10
      };
    }

    const count = {
      "😊": 0,
      "😐": 0,
      "😔": 0,
      "😡": 0,
      "😴": 0
    };

    moodEntries.forEach(entry => {
      const mood = entry.mood;
      if (count.hasOwnProperty(mood)) {
        count[mood]++;
      } else {
        console.log("Unrecognized mood:", mood);
      }
    });

    console.log("Counted moods:", count);
    return {count, total: moodEntries.length};
  } catch (error) {
    console.error("Error in getMoodCount:", error);
    return {
      count: {
        "😊": 1, 
        "😐": 1, 
        "😔": 1, 
        "😡": 1, 
        "😴": 1
      }, 
      total: 5
    };
  }
}


async function updateMoodDistribution() {
  try {
    // Get mood counts and total
    const {count, total} = await getMoodCount();
    
    if (total === 0) {
      console.log("No mood entries found");
      document.getElementById("happy-bar").style.height = "5%";
      document.getElementById("neutral-bar").style.height = "5%";
      document.getElementById("sad-bar").style.height = "5%";
      document.getElementById("angry-bar").style.height = "5%";
      document.getElementById("tired-bar").style.height = "5%";
      return;
    }

    const getPercentage = mood => {
      const percentage = (count[mood] / total) * 100;
      // Ensure minimum height is visible (at least 5%)
      return Math.max(percentage, 5) + "%"; 
    };

    console.log("Setting bar heights:");
    console.log("Happy:", getPercentage("😊"));
    console.log("Neutral:", getPercentage("😐"));
    console.log("Sad:", getPercentage("😔"));
    console.log("Angry:", getPercentage("😡"));
    console.log("Tired:", getPercentage("😴"));

    const happyBar = document.getElementById("happy-bar");
    const neutralBar = document.getElementById("neutral-bar");
    const sadBar = document.getElementById("sad-bar");
    const angryBar = document.getElementById("angry-bar");
    const tiredBar = document.getElementById("tired-bar");

    // Set bar heights directly with % values
    if (happyBar) happyBar.style.height = getPercentage("😊");
    if (neutralBar) neutralBar.style.height = getPercentage("😐");
    if (sadBar) sadBar.style.height = getPercentage("😔");
    if (angryBar) angryBar.style.height = getPercentage("😡");
    if (tiredBar) tiredBar.style.height = getPercentage("😴");

    console.log("Mood distribution updated. Counts:", count, "Total entries:", total);
  } catch (error) {
    console.error("Error updating mood distribution:", error);
  }
}

// Function to calculate and update Recent Trends section
async function updateRecentTrends() {
  try {
    const moodEntries = await fetchMoodEntries();
    
    // Exit if no entries
    if (moodEntries.length === 0) return;
    
    // Sort entries by date (newest first)
    moodEntries.sort((a, b) => b.timestamp - a.timestamp);
    
    // 1. Find most frequent mood
    const moodCounts = {
      "😊": 0, "😐": 0, "😔": 0, "😡": 0, "😴": 0
    };
    
    moodEntries.forEach(entry => {
      if (moodCounts.hasOwnProperty(entry.mood)) {
        moodCounts[entry.mood]++;
      }
    });
    
    // Find the mood with highest count
    let mostFrequentMood = "😊"; // Default
    let maxCount = 0;
    
    for (const [mood, count] of Object.entries(moodCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostFrequentMood = mood;
      }
    }
    
    // 2. Calculate mood streak (consecutive days with same mood)
    let currentStreak = 1;
    let maxStreak = 1;
    let streakMood = moodEntries[0]?.mood;
    
    // Convert dates to day strings for comparison
    const getDayString = date => {
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    };
    
    // Group entries by day
    const entriesByDay = {};
    moodEntries.forEach(entry => {
      const dayStr = getDayString(entry.timestamp);
      if (!entriesByDay[dayStr]) {
        entriesByDay[dayStr] = [];
      }
      entriesByDay[dayStr].push(entry);
    });
    
    // Get predominant mood per day
    const dailyMoods = [];
    Object.keys(entriesByDay).sort().reverse().forEach(dayStr => {
      const entries = entriesByDay[dayStr];
      const moodCounts = {};
      
      entries.forEach(entry => {
        if (!moodCounts[entry.mood]) moodCounts[entry.mood] = 0;
        moodCounts[entry.mood]++;
      });
      
      let predominantMood = entries[0].mood;
      let maxCount = 0;
      
      for (const [mood, count] of Object.entries(moodCounts)) {
        if (count > maxCount) {
          maxCount = count;
          predominantMood = mood;
        }
      }
      
      dailyMoods.push({
        date: new Date(dayStr),
        mood: predominantMood
      });
    });
    
    // Calculate streak based on daily moods
    if (dailyMoods.length > 0) {
      let currentStreak = 1;
      let maxStreak = 1;
      let streakMood = dailyMoods[0].mood;
      
      for (let i = 1; i < dailyMoods.length; i++) {
        // Check if consecutive days
        const currDate = dailyMoods[i].date;
        const prevDate = dailyMoods[i-1].date;
        const dayDiff = Math.round((prevDate - currDate) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1 && dailyMoods[i].mood === streakMood) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 1;
          streakMood = dailyMoods[i].mood;
        }
      }
    }
    
    // 3. Find best day (day of week with most positive moods)
    const dayScores = {
      0: 0, // Sunday
      1: 0, // Monday
      2: 0, // Tuesday
      3: 0, // Wednesday
      4: 0, // Thursday
      5: 0, // Friday
      6: 0  // Saturday
    };
    
    // Score moods: Happy = +2, Neutral = +1, Sad/Angry = -1, Tired = 0
    const moodScores = {
      "😊": 2,
      "😐": 1,
      "😔": -1,
      "😡": -1,
      "😴": 0
    };
    
    moodEntries.forEach(entry => {
      const dayOfWeek = entry.timestamp.getDay();
      dayScores[dayOfWeek] += moodScores[entry.mood] || 0;
    });
    
    // Find day with highest score
    let bestDay = 1; // Default to Monday
    let highestScore = -Infinity;
    
    for (const [day, score] of Object.entries(dayScores)) {
      if (score > highestScore) {
        highestScore = score;
        bestDay = parseInt(day);
      }
    };
    
    // Convert day number to name
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const bestDayName = dayNames[bestDay];
    
    const moodNameMap = {
      "😊": "Happy",
      "😐": "Neutral",
      "😔": "Sad",
      "😡": "Angry",
      "😴": "Tired"
    };
    
    // Update the DOM elements
    const freqMoodElem = document.querySelector('.recent-trends .most-frequent-mood');
    const moodStreakElem = document.querySelector('.recent-trends .mood-streak');
    const bestDayElem = document.querySelector('.recent-trends .best-day');
    
    // If we found the elements by class, update them
    if (freqMoodElem) {
      freqMoodElem.innerHTML = `
        <span class="mr-1">${moodNameMap[mostFrequentMood]}</span>
        <span class="text-lg">${mostFrequentMood}</span>
      `;
    } else {
      // Otherwise update by position in the DOM
      const recentTrendsDiv = document.querySelector('.space-y-2');
      if (recentTrendsDiv) {
        const divs = recentTrendsDiv.querySelectorAll('.flex.items-center.justify-between');
        
        // Most frequent mood
        if (divs[0]) {
          const valueDiv = divs[0].querySelector('div:nth-child(2)');
          if (valueDiv) {
            valueDiv.innerHTML = `
              <span class="mr-1">${moodNameMap[mostFrequentMood]}</span>
              <span class="text-lg">${mostFrequentMood}</span>
            `;
          }
        }
        
        // Mood streak
        if (divs[1]) {
          const valueDiv = divs[1].querySelector('div:nth-child(2)');
          if (valueDiv) {
            valueDiv.textContent = `${maxStreak} days`;
          }
        }
        
        // Best day
        if (divs[2]) {
          const valueDiv = divs[2].querySelector('div:nth-child(2)');
          if (valueDiv) {
            valueDiv.textContent = bestDayName;
          }
        }
      }
    }
    
    console.log("Recent trends updated:", {
      mostFrequentMood: moodNameMap[mostFrequentMood],
      streak: maxStreak,
      bestDay: bestDayName
    });
    
  } catch (error) {
    console.error("Error updating recent trends:", error);
  }
}

window.onload = function() {
  setTimeout(() => {
    updateMoodDistribution();
    updateRecentTrends();
    console.log("Window onload: Running updates");
  }, 1000); // Short delay to ensure DOM is fully ready
};

document.addEventListener("DOMContentLoaded", function() {
  setTimeout(() => {
    updateMoodDistribution();
    updateRecentTrends();
    console.log("DOMContentLoaded: Running updates");
  }, 1000); 
  window.updateMoodDistribution = updateMoodDistribution;
  window.updateRecentTrends = updateRecentTrends;
  
  const testButton = document.getElementById('test-mood-button');
  if (testButton) {
    testButton.addEventListener('click', function() {
      console.log("Test button clicked in JS file");
      updateMoodDistribution();
      updateRecentTrends();
    });
  }
});