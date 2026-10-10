/* =========================================
   LIFEFORM — GAME LOGIC
========================================= */


/* =========================================
   ELEMENTS
========================================= */

const imageInput =
  document.getElementById(
    "imageInput"
  );

const fileName =
  document.getElementById(
    "fileName"
  );

const imagePreview =
  document.getElementById(
    "imagePreview"
  );

const previewContainer =
  document.getElementById(
    "previewContainer"
  );

const analyzeButton =
  document.getElementById(
    "analyzeButton"
  );

const xpElement =
  document.getElementById(
    "xp"
  );

const streakElement =
  document.getElementById(
    "streak"
  );

const achievementCountElement =
  document.getElementById(
    "achievementCount"
  );

const achievementsElement =
  document.getElementById(
    "achievements"
  );

const discoveryCountElement =
  document.getElementById(
    "discoveryCount"
  );

const collectionElement =
  document.getElementById(
    "collection"
  );

const levelElement =
  document.getElementById(
    "level"
  );

const xpFill =
  document.getElementById(
    "xpFill"
  );

const progressNote =
  document.getElementById(
    "progressNote"
  );

const emptyDiscovery =
  document.getElementById(
    "emptyDiscovery"
  );

const discoveryResult =
  document.getElementById(
    "discoveryResult"
  );

const discoveryName =
  document.getElementById(
    "discoveryName"
  );

const discoveryType =
  document.getElementById(
    "discoveryType"
  );

const discoveryConfidence =
  document.getElementById(
    "discoveryConfidence"
  );

const discoveryDescription =
  document.getElementById(
    "discoveryDescription"
  );

const rewardMessage =
  document.getElementById(
    "rewardMessage"
  );

const missionTitle =
  document.getElementById(
    "missionTitle"
  );

const missionDescription =
  document.getElementById(
    "missionDescription"
  );

const missionButton =
  document.getElementById(
    "missionButton"
  );


/* =========================================
   FIELD JOURNAL ELEMENTS
========================================= */

const journalModal =
  document.getElementById(
    "journalModal"
  );

const journalOverlay =
  document.getElementById(
    "journalOverlay"
  );

const journalClose =
  document.getElementById(
    "journalClose"
  );

const journalBack =
  document.getElementById(
    "journalBack"
  );

const journalPhoto =
  document.getElementById(
    "journalPhoto"
  );

const journalPhotoCaption =
  document.getElementById(
    "journalPhotoCaption"
  );

const journalName =
  document.getElementById(
    "journalName"
  );

const journalType =
  document.getElementById(
    "journalType"
  );

const journalConfidence =
  document.getElementById(
    "journalConfidence"
  );

const journalDate =
  document.getElementById(
    "journalDate"
  );

const journalXP =
  document.getElementById(
    "journalXP"
  );

const journalDescription =
  document.getElementById(
    "journalDescription"
  );

const journalNoteInput =
  document.getElementById(
    "journalNoteInput"
  );

const journalNoteButton =
  document.getElementById(
    "journalNoteButton"
  );

const journalNoteStatus =
  document.getElementById(
    "journalNoteStatus"
  );


/* =========================================
   CURRENT JOURNAL ENTRY
========================================= */

let currentJournalItem =
  null;


/* =========================================
   PLAYER STORAGE
========================================= */

const PLAYER_ID_KEY =
  "lifeformPlayerId";

const LEGACY_STORAGE_KEYS = [
  "lifeformXP",
  "lifeformCollection",
  "lifeformStreak",
  "lifeformLastDiscoveryDate",
  "lifeformMissionDate",
  "lifeformMissionIndex",
  "lifeformMissionCompleted"
];

function createPlayerId() {

  if (
    window.crypto &&
    typeof window.crypto.randomUUID === "function"
  ) {

    return window.crypto.randomUUID();

  }

  return `player-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;

}


let playerId =
  localStorage.getItem(
    PLAYER_ID_KEY
  );


if (!playerId) {

  playerId =
    createPlayerId();

  localStorage.setItem(
    PLAYER_ID_KEY,
    playerId
  );

}


/* =========================================
   GAME DATA
========================================= */

let xp =
  Number(
    localStorage.getItem(
      "lifeformXP"
    )
  ) || 0;


let collection = [];

try {

  collection =
    JSON.parse(
      localStorage.getItem(
        "lifeformCollection"
      )
    ) || [];

  if (!Array.isArray(collection)) {
    collection = [];
  }

} catch (error) {

  console.warn(
    "Could not read legacy collection data.",
    error
  );

  collection = [];

}


/* =========================================
   EXPLORATION STREAK
========================================= */

let streak =
  Number(
    localStorage.getItem(
      "lifeformStreak"
    )
  ) || 0;


let lastDiscoveryDate =
  localStorage.getItem(
    "lifeformLastDiscoveryDate"
  ) || "";


function getDateKey(
  date = new Date()
) {

  const year =
    date.getFullYear();


  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );


  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );


  return `${year}-${month}-${day}`;

}


function getYesterdayKey() {

  const yesterday =
    new Date();


  yesterday.setDate(
    yesterday.getDate() - 1
  );


  return getDateKey(
    yesterday
  );

}


function recordDiscoveryForStreak() {

  const todayKey =
    getDateKey();


  if (
    lastDiscoveryDate ===
    todayKey
  ) {

    return false;

  }


  if (
    lastDiscoveryDate ===
    getYesterdayKey()
  ) {

    streak += 1;

  }

  else {

    streak = 1;

  }


  lastDiscoveryDate =
    todayKey;


  return true;

}


function updateStreakDisplay() {

  if (
    streakElement
  ) {

    streakElement.textContent =
      `${streak} ${
        streak === 1
          ? "day"
          : "days"
      }`;

  }

}


/* =========================================
   LEVEL SYSTEM
========================================= */

const levelTitles = {

  1:
    "New Explorer",

  2:
    "Nature Seeker",

  3:
    "Wild Observer",

  4:
    "Field Naturalist",

  5:
    "Lifeform Tracker",

  6:
    "Ecosystem Scout",

  7:
    "Nature Keeper",

  8:
    "Wild Sage",

  9:
    "Field Scientist",

  10:
    "Lifeform Master"

};


function getCurrentLevel() {

  return (
    Math.floor(
      xp / 50
    ) + 1
  );

}


function getLevelTitle(
  level
) {

  return (
    levelTitles[level] ||
    "Legendary Naturalist"
  );

}


/* =========================================
   ACHIEVEMENTS
========================================= */

const achievementDefinitions = [

  {
    id:
      "first-step",

    icon:
      "🌱",

    title:
      "First Step",

    description:
      "Make your first lifeform discovery.",

    target:
      1,

    getProgress:
      () => collection.length,

    getLabel:
      (progress) =>
        `${Math.min(progress, 1)} / 1 discovery`

  },

  {
    id:
      "curious-explorer",

    icon:
      "🔎",

    title:
      "Curious Explorer",

    description:
      "Discover 5 different lifeforms.",

    target:
      5,

    getProgress:
      () => collection.length,

    getLabel:
      (progress) =>
        `${Math.min(progress, 5)} / 5 discoveries`

  },

  {
    id:
      "field-collector",

    icon:
      "🌿",

    title:
      "Field Collector",

    description:
      "Build a collection of 10 lifeforms.",

    target:
      10,

    getProgress:
      () => collection.length,

    getLabel:
      (progress) =>
        `${Math.min(progress, 10)} / 10 discoveries`

  },

  {
    id:
      "three-day",

    icon:
      "🔥",

    title:
      "3-Day Explorer",

    description:
      "Keep exploring for 3 consecutive days.",

    target:
      3,

    getProgress:
      () => streak,

    getLabel:
      (progress) =>
        `${Math.min(progress, 3)} / 3 day streak`

  },

  {
    id:
      "nature-seeker",

    icon:
      "🏆",

    title:
      "Nature Seeker",

    description:
      "Reach Level 2.",

    target:
      2,

    getProgress:
      () => getCurrentLevel(),

    getLabel:
      (progress) =>
        `Level ${Math.min(progress, 2)} / 2`

  },

  {
    id:
      "wild-observer",

    icon:
      "🌳",

    title:
      "Wild Observer",

    description:
      "Reach Level 3.",

    target:
      3,

    getProgress:
      () => getCurrentLevel(),

    getLabel:
      (progress) =>
        `Level ${Math.min(progress, 3)} / 3`

  }

];


function getUnlockedAchievementCount() {

  return achievementDefinitions.filter(
    achievement =>
      achievement.getProgress() >=
      achievement.target
  ).length;

}


function displayAchievements() {

  const unlockedCount =
    getUnlockedAchievementCount();


  achievementCountElement.textContent =
    `${unlockedCount} / ${achievementDefinitions.length} unlocked`;


  achievementsElement.innerHTML =
    "";


  achievementDefinitions.forEach(
    achievement => {

      const progress =
        achievement.getProgress();


      const unlocked =
        progress >=
        achievement.target;


      const card =
        document.createElement(
          "div"
        );


      card.className =
        "achievement-card";


      card.classList.add(
        unlocked
          ? "unlocked"
          : "locked"
      );


      const icon =
        document.createElement(
          "div"
        );


      icon.className =
        "achievement-icon";


      icon.textContent =
        achievement.icon;


      const content =
        document.createElement(
          "div"
        );


      content.className =
        "achievement-content";


      const title =
        document.createElement(
          "h3"
        );


      title.textContent =
        achievement.title;


      const description =
        document.createElement(
          "p"
        );


      description.textContent =
        achievement.description;


      const progressText =
        document.createElement(
          "div"
        );


      progressText.className =
        "achievement-progress";


      progressText.textContent =
        achievement.getLabel(
          progress
        );


      const status =
        document.createElement(
          "div"
        );


      status.className =
        "achievement-status";


      status.textContent =
        unlocked
          ? "✓ UNLOCKED"
          : "🔒 LOCKED";


      content.appendChild(
        title
      );


      content.appendChild(
        description
      );


      if (!unlocked) {

        content.appendChild(
          progressText
        );

      }


      content.appendChild(
        status
      );


      card.appendChild(
        icon
      );


      card.appendChild(
        content
      );


      achievementsElement.appendChild(
        card
      );

    }
  );

}


/* =========================================
   DAILY MISSIONS
========================================= */

const missions = [

  {
    title:
      "🌿 Find a plant",

    description:
      "Find a plant outdoors and scan it.",

    type:
      "plant"
  },

  {
    title:
      "🐦 Find a bird",

    description:
      "Spot a bird outdoors and scan it if you can.",

    type:
      "bird"
  },

  {
    title:
      "🦋 Find an insect",

    description:
      "Look among leaves and flowers for an insect.",

    type:
      "insect"
  },

  {
    title:
      "🍄 Find a fungus",

    description:
      "Look around trees, soil, and shaded areas.",

    type:
      "fungus"
  },

  {
    title:
      "🌱 Discover something new",

    description:
      "Find a lifeform you've never added to your collection.",

    type:
      "any"
  }

];


/* =========================================
   MISSION SETUP
========================================= */

const today =
  new Date().toLocaleDateString();


let missionIndex =
  Number(
    localStorage.getItem(
      "lifeformMissionIndex"
    )
  );


let missionCompleted =
  localStorage.getItem(
    "lifeformMissionCompleted"
  ) === today;


let todaysMission =
  missions[0];


function setMissionState(
  savedMission = {}
) {

  const savedDate =
    savedMission.date ||
    localStorage.getItem(
      "lifeformMissionDate"
    ) ||
    "";

  const savedIndex =
    Number.isInteger(
      Number(savedMission.index)
    )
      ? Number(savedMission.index)
      : missionIndex;

  if (
    savedDate !== today
  ) {

    missionIndex =
      Math.floor(
        Math.random() *
        missions.length
      );

    missionCompleted =
      false;

  }

  else {

    missionIndex =
      Number.isInteger(savedIndex) &&
      missions[savedIndex]
        ? savedIndex
        : 0;

    missionCompleted =
      savedMission.completed === true ||
      localStorage.getItem(
        "lifeformMissionCompleted"
      ) === today;

  }

  todaysMission =
    missions[missionIndex] ||
    missions[0];

  missionTitle.textContent =
    todaysMission.title;

  missionDescription.textContent =
    todaysMission.description;

  updateMissionButton();

}


setMissionState({
  date:
    localStorage.getItem(
      "lifeformMissionDate"
    ),

  index:
    missionIndex,

  completed:
    missionCompleted
});


/* =========================================
   MISSION BUTTON
========================================= */

function updateMissionButton() {

  if (
    missionCompleted
  ) {

    missionButton.textContent =
      "🎉 Mission Complete";

    missionButton.classList.add(
      "completed"
    );

    missionButton.disabled =
      true;

  }

  else {

    missionButton.textContent =
      "📷 Scan to Complete";

    missionButton.classList.remove(
      "completed"
    );

    missionButton.disabled =
      false;

  }

}


updateMissionButton();


missionButton.addEventListener(
  "click",
  () => {

    if (
      missionCompleted
    ) {

      return;

    }


    const scanner =
      document.querySelector(
        ".scanner-card"
      );


    if (scanner) {

      scanner.scrollIntoView({
        behavior:
          "smooth",

        block:
          "center"
      });

    }


    imageInput.click();

  }
);


/* =========================================
   IMAGE PREVIEW + FILE NAME
========================================= */

let previewURL =
  null;


imageInput.addEventListener(
  "change",
  () => {

    const image =
      imageInput.files[0];


    if (!image) {

      fileName.textContent =
        "No photo chosen";


      previewContainer.classList.remove(
        "visible"
      );


      imagePreview.src =
        "";


      return;

    }


    /*
    Make sure this is an image.
    */

    if (
      !image.type.startsWith(
        "image/"
      )
    ) {

      alert(
        "Please choose an image file."
      );


      imageInput.value =
        "";


      fileName.textContent =
        "No photo chosen";


      return;

    }


    /* =====================================
       SHORTEN DISPLAYED FILE NAME
    ===================================== */

    const maxLength =
      22;


    let displayName =
      image.name;


    if (
      displayName.length >
      maxLength
    ) {

      const extension =
        displayName.includes(".")
          ? displayName.slice(
              displayName.lastIndexOf(".")
            )
          : "";


      const nameWithoutExtension =
        displayName.slice(
          0,
          displayName.length -
            extension.length
        );


      const availableCharacters =
        Math.max(
          5,
          maxLength -
            extension.length -
            3
        );


      displayName =
        nameWithoutExtension.slice(
          0,
          availableCharacters
        ) +
        "..." +
        extension;

    }


    fileName.textContent =
      displayName;


    /* =====================================
       REMOVE OLD PREVIEW
    ===================================== */

    if (previewURL) {

      URL.revokeObjectURL(
        previewURL
      );

    }


    /* =====================================
       CREATE NEW PREVIEW
    ===================================== */

    previewURL =
      URL.createObjectURL(
        image
      );


    imagePreview.src =
      previewURL;


    previewContainer.classList.add(
      "visible"
    );

  }
);


/* =========================================
   AI SCANNER
========================================= */

analyzeButton.addEventListener(
  "click",
  async () => {

    const image =
      imageInput.files[0];


    if (!image) {

      alert(
        "Please choose a photo first."
      );


      return;

    }


    const previousLevel =
      getCurrentLevel();


    const previousAchievementCount =
      getUnlockedAchievementCount();


    analyzeButton.disabled =
      true;

    previewContainer.classList.add(
      "scanning"
    );

    analyzeButton.textContent =
      "🤖 Identifying...";


    const formData =
      new FormData();


    formData.append(
      "image",
      image
    );


    try {

      const response =
        await fetch(
          "/api/analyze",
          {
            method:
              "POST",

            body:
              formData
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.error ||
          "Could not analyze the image."
        );

      }


      const aiText =
        data.result;


      const imageUrl =
        data.imageUrl ||
        null;


      /* =================================
         PARSE GEMMA RESPONSE
      ================================= */

      const nameMatch =
        aiText.match(
          /Name:\s*(.+)/i
        );


      const typeMatch =
        aiText.match(
          /Type:\s*(.+)/i
        );


      const confidenceMatch =
        aiText.match(
          /Confidence:\s*(.+)/i
        );


      const descriptionMatch =
        aiText.match(
          /Description:\s*([\s\S]*)/i
        );


      const name =
        nameMatch
          ? nameMatch[1].trim()
          : "Unknown discovery";


      const type =
        typeMatch
          ? typeMatch[1].trim()
          : "Other";


      const confidence =
        confidenceMatch
          ? confidenceMatch[1].trim()
          : "Unknown";


      const description =
        descriptionMatch
          ? descriptionMatch[1].trim()
          : aiText;


      /* =================================
         SHOW DISCOVERY
      ================================= */

      emptyDiscovery.style.display =
        "none";


      discoveryResult.classList.add(
        "visible"
      );


      discoveryName.textContent =
        name;


      discoveryType.textContent =
        type;


      discoveryConfidence.textContent =
        confidence;


      discoveryDescription.textContent =
        description;


      /* =================================
         DUPLICATE CHECK
      ================================= */

      const alreadyDiscovered =
        collection.some(
          item =>
            String(
              item.name || ""
            ).toLowerCase() ===
            name.toLowerCase()
        );


      /* =================================
         NEW DISCOVERY
      ================================= */

      if (
        !alreadyDiscovered
      ) {

        const discovery = {

          name:
            name,

          type:
            type,

          confidence:
            confidence,

          description:
            description,

          note:
            "",

          date:
            new Date()
              .toLocaleDateString(),

          imageUrl:
            imageUrl,

          xpEarned:
            10

        };


        collection.push(
          discovery
        );


        /* +10 XP */

        xp += 10;


        let rewardText =
          "🌱 New discovery! +10 XP";


        /* =================================
           STREAK
        ================================= */

        const streakUpdated =
          recordDiscoveryForStreak();


        if (
          streakUpdated
        ) {

          rewardText +=
            ` · 🔥 ${streak}-day streak`;

        }


        /* =================================
           MISSION
        ================================= */

        const normalizedType =
          type.toLowerCase();


        let missionMatched =
          false;


        if (
          todaysMission.type ===
          "any"
        ) {

          missionMatched =
            true;

        }

        else if (
          normalizedType.includes(
            todaysMission.type
          )
        ) {

          missionMatched =
            true;

        }


        if (
          missionMatched &&
          !missionCompleted
        ) {

          xp += 20;


          missionCompleted =
            true;


          updateMissionButton();


          rewardText +=
            " · 🎯 Mission complete! +20 XP";

        }


        rewardMessage.textContent =
          rewardText;


        await savePlayerState();

      }


      else {

        rewardMessage.textContent =
          "🔁 Already discovered! No XP this time.";

      }


      /* =================================
         UPDATE UI
      ================================= */

      updateProgress();

      updateStreakDisplay();

      displayAchievements();

      displayCollection();


      /* =================================
         LEVEL UP
      ================================= */

      const newLevel =
        getCurrentLevel();


      if (
        newLevel >
        previousLevel
      ) {

        showLevelUp(
          newLevel
        );

      }


      /* =================================
         ACHIEVEMENT UNLOCK
      ================================= */

      const newAchievementCount =
        getUnlockedAchievementCount();


      if (
        newAchievementCount >
        previousAchievementCount
      ) {

        rewardMessage.textContent +=
          " · 🏅 Achievement unlocked!";


        displayAchievements();

      }

    }


    catch (error) {

      console.error(
        "Lifeform error:",
        error
      );


      alert(
        error.message ||
        "Something went wrong while analyzing the image."
      );

    }


    finally {

      previewContainer.classList.remove(
        "scanning"
      );

      analyzeButton.disabled =
        false;


      analyzeButton.textContent =
        "🤖 Identify Lifeform";

    }

  }
);


/* =========================================
   MONGODB PLAYER STORAGE
========================================= */

function saveLegacyLocalState() {

  localStorage.setItem(
    "lifeformXP",
    xp
  );

  localStorage.setItem(
    "lifeformCollection",
    JSON.stringify(
      collection
    )
  );

  localStorage.setItem(
    "lifeformStreak",
    streak
  );

  localStorage.setItem(
    "lifeformLastDiscoveryDate",
    lastDiscoveryDate
  );

  localStorage.setItem(
    "lifeformMissionDate",
    today
  );

  localStorage.setItem(
    "lifeformMissionIndex",
    missionIndex
  );

  localStorage.setItem(
    "lifeformMissionCompleted",
    missionCompleted
      ? today
      : ""
  );

}


function removeLegacyLocalState() {

  LEGACY_STORAGE_KEYS.forEach(
    key =>
      localStorage.removeItem(
        key
      )
  );

}


async function savePlayerState() {

  try {

    const response =
      await fetch(
        `/api/player/${encodeURIComponent(playerId)}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            xp,

            collection,

            streak,

            lastDiscoveryDate,

            mission: {
              date: today,
              index: missionIndex,
              completed: missionCompleted
            }
          })
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
        "Could not save player data."
      );
    }

    removeLegacyLocalState();

    return true;

  } catch (error) {

    console.error(
      "MongoDB save error:",
      error
    );

    saveLegacyLocalState();

    return false;

  }
}


async function loadPlayerState() {

  try {

    const response =
      await fetch(
        `/api/player/${encodeURIComponent(playerId)}`
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
        "Could not load player data."
      );
    }

    if (
      data.exists &&
      data.player
    ) {

      const player =
        data.player;

      xp =
        Number(player.xp) || 0;

      collection =
        Array.isArray(
          player.collection
        )
          ? player.collection
          : [];

      streak =
        Number(player.streak) || 0;

      lastDiscoveryDate =
        player.lastDiscoveryDate ||
        "";

      const playerMission =
        player.mission || {};

      setMissionState(
        playerMission
      );

      removeLegacyLocalState();

      if (
        !player.mission ||
        playerMission.date !== today
      ) {
        await savePlayerState();
      }

      return true;

    }

    /* ---------------------------------------
       FIRST DB LOAD — MIGRATE OLD LOCAL DATA
    --------------------------------------- */

    setMissionState({
      date:
        localStorage.getItem(
          "lifeformMissionDate"
        ),

      index:
        missionIndex,

      completed:
        missionCompleted
    });

    await savePlayerState();

    return true;

  } catch (error) {

    console.error(
      "MongoDB load error:",
      error
    );

    /*
      MongoDB is unavailable. Keep the existing
      local state so the app remains usable.
    */

    saveLegacyLocalState();

    return false;

  }
}


/* =========================================
   PLAYER PROGRESS
========================================= */

function updateProgress() {

  const level =
    getCurrentLevel();


  const title =
    getLevelTitle(
      level
    );


  const xpIntoLevel =
    xp % 50;


  const percentage =
    (
      xpIntoLevel /
      50
    ) * 100;


  xpElement.textContent =
    xp;


  discoveryCountElement.textContent =
    collection.length;


  levelElement.textContent =
    `Level ${level} — ${title}`;


  xpFill.style.width =
    `${percentage}%`;


  if (
    xpIntoLevel === 0 &&
    xp > 0
  ) {

    progressNote.textContent =
      `🎉 ${title} · 50 XP until Level ${level + 1}`;

  }

  else {

    progressNote.textContent =
      `${50 - xpIntoLevel} XP until Level ${level + 1}`;

  }

}


/* =========================================
   LEVEL-UP
========================================= */

function showLevelUp(
  level
) {

  const title =
    getLevelTitle(
      level
    );


  rewardMessage.textContent =
    `🎉 LEVEL UP! You are now a ${title} · ⭐ ${xp} XP`;


  rewardMessage.animate(
    [
      {
        transform:
          "scale(1)",

        opacity:
          0.7
      },

      {
        transform:
          "scale(1.04)",

        opacity:
          1
      },

      {
        transform:
          "scale(1)",

        opacity:
          1
      }

    ],
    {
      duration:
        700,

      easing:
        "ease-out"
    }
  );

}


/* =========================================
   COLLECTION
========================================= */

function displayCollection() {

  if (
    collection.length === 0
  ) {

    collectionElement.innerHTML = `
      <div class="empty-collection">
        Your field journal is empty.<br>
        Go outside and find your first lifeform.
      </div>
    `;

    return;

  }


  collectionElement.innerHTML =
    "";


  collection.forEach(
    (item) => {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "collection-card";


      card.addEventListener(
        "click",
        () => {

          openJournal(
            item
          );

        }
      );


      const icon =
        getLifeformIcon(
          item.type
        );


      /* =================================
         PHOTO
      ================================= */

      if (
        item.imageUrl
      ) {

        const image =
          document.createElement(
            "img"
          );


        image.className =
          "collection-image";


        image.src =
          item.imageUrl;


        image.alt =
          item.name ||
          "Lifeform";


        image.loading =
          "lazy";


        image.onerror =
          () => {

            image.style.display =
              "none";


            const placeholder =
              document.createElement(
                "div"
              );


            placeholder.className =
              "collection-photo-placeholder";


            placeholder.textContent =
              icon;


            card.insertBefore(
              placeholder,
              card.firstChild
            );

          };


        card.appendChild(
          image
        );

      }


      else {

        const placeholder =
          document.createElement(
            "div"
          );


        placeholder.className =
          "collection-photo-placeholder";


        placeholder.textContent =
          icon;


        card.appendChild(
          placeholder
        );

      }


      /* =================================
         CARD CONTENT
      ================================= */

      const content =
        document.createElement(
          "div"
        );


      content.className =
        "collection-card-content";


      const iconElement =
        document.createElement(
          "div"
        );


      iconElement.className =
        "collection-icon";


      iconElement.textContent =
        icon;


      const titleElement =
        document.createElement(
          "h3"
        );


      titleElement.textContent =
        item.name ||
        "Unknown";


      const infoElement =
        document.createElement(
          "p"
        );


      infoElement.textContent =
        `${item.type || "Other"}
Confidence: ${item.confidence || "Unknown"}
Found: ${item.date || "Unknown"}`;


      content.appendChild(
        iconElement
      );


      content.appendChild(
        titleElement
      );


      content.appendChild(
        infoElement
      );


      card.appendChild(
        content
      );


      collectionElement.appendChild(
        card
      );

    }
  );

}


/* =========================================
   FIELD JOURNAL
========================================= */

function openJournal(
  item
) {

  if (!item) {

    return;

  }


  currentJournalItem =
    item;


  journalName.textContent =
    item.name ||
    "Unknown discovery";


  journalType.textContent =
    item.type ||
    "Other";


  journalConfidence.textContent =
    item.confidence ||
    "Unknown";


  journalDate.textContent =
    item.date ||
    "Unknown";


  journalXP.textContent =
    `+${item.xpEarned || 10}`;


  journalDescription.textContent =
    item.description ||
    "No additional notes were recorded for this discovery.";


  /* =================================
     PHOTO
  ================================= */

  journalPhoto.innerHTML =
    "";


  if (
    item.imageUrl
  ) {

    const image =
      document.createElement(
        "img"
      );


    image.src =
      item.imageUrl;


    image.alt =
      item.name ||
      "Lifeform discovery";


    image.onerror =
      () => {

        journalPhoto.innerHTML =
          "";


        const placeholder =
          document.createElement(
            "div"
          );


        placeholder.className =
          "journal-placeholder";


        placeholder.textContent =
          getLifeformIcon(
            item.type
          );


        journalPhoto.appendChild(
          placeholder
        );

      };


    journalPhoto.appendChild(
      image
    );


    journalPhotoCaption.textContent =
      `A ${String(
        item.type ||
        "lifeform"
      ).toLowerCase()} observed during your exploration.`;

  }

  else {

    const placeholder =
      document.createElement(
        "div"
      );


    placeholder.className =
      "journal-placeholder";


    placeholder.textContent =
      getLifeformIcon(
        item.type
      );


    journalPhoto.appendChild(
      placeholder
    );


    journalPhotoCaption.textContent =
      "This discovery was recorded before photo storage was added.";

  }


  /* =================================
     PERSONAL NOTE
  ================================= */

  journalNoteInput.value =
    item.note ||
    "";


  if (
    item.note &&
    item.note.trim()
  ) {

    journalNoteInput.readOnly =
      true;


    journalNoteButton.textContent =
      "✏️ Edit Note";


    journalNoteStatus.textContent =
      "Saved note";

  }

  else {

    journalNoteInput.readOnly =
      false;


    journalNoteButton.textContent =
      "✍️ Save Note";


    journalNoteStatus.textContent =
      "";

  }


  /* =================================
     OPEN
  ================================= */

  journalModal.classList.add(
    "open"
  );


  journalModal.setAttribute(
    "aria-hidden",
    "false"
  );


  document.body.style.overflow =
    "hidden";

}


/* =========================================
   SAVE / EDIT NOTE
========================================= */

journalNoteButton.addEventListener(
  "click",
  async () => {

    if (
      !currentJournalItem
    ) {

      return;

    }


    if (
      journalNoteInput.readOnly
    ) {

      journalNoteInput.readOnly =
        false;


      journalNoteInput.focus();


      journalNoteButton.textContent =
        "💾 Save Note";


      journalNoteStatus.textContent =
        "Editing...";


      return;

    }


    const note =
      journalNoteInput.value.trim();


    currentJournalItem.note =
      note;


    const saved =
      await savePlayerState();


    if (
      note
    ) {

      journalNoteInput.readOnly =
        true;


      journalNoteButton.textContent =
        "✏️ Edit Note";


      journalNoteStatus.textContent =
        saved
          ? "✓ Note saved"
          : "✓ Saved locally — MongoDB unavailable";

    }

    else {

      journalNoteButton.textContent =
        "✍️ Save Note";


      journalNoteStatus.textContent =
        "Write something first";

    }

  }
);


/* =========================================
   CLOSE JOURNAL
========================================= */

function closeJournal() {

  journalModal.classList.remove(
    "open"
  );


  journalModal.setAttribute(
    "aria-hidden",
    "true"
  );


  document.body.style.overflow =
    "";


  currentJournalItem =
    null;

}


journalClose.addEventListener(
  "click",
  closeJournal
);


journalBack.addEventListener(
  "click",
  closeJournal
);


journalOverlay.addEventListener(
  "click",
  closeJournal
);


document.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key === "Escape" &&
      journalModal.classList.contains(
        "open"
      )
    ) {

      closeJournal();

    }

  }
);


/* =========================================
   LIFEFORM ICON
========================================= */

function getLifeformIcon(
  type
) {

  const normalized =
    String(
      type || ""
    ).toLowerCase();


  if (
    normalized.includes("bird")
  ) {

    return "🐦";

  }


  if (
    normalized.includes("insect")
  ) {

    return "🦋";

  }


  if (
    normalized.includes("fungus")
  ) {

    return "🍄";

  }


  if (
    normalized.includes("animal")
  ) {

    return "🦎";

  }


  if (
    normalized.includes("plant")
  ) {

    return "🌿";

  }


  return "🌱";

}


/* =========================================
   INITIAL LOAD
========================================= */

updateProgress();

updateStreakDisplay();

displayAchievements();

displayCollection();


loadPlayerState()
  .then(
    () => {

      updateProgress();
      updateStreakDisplay();
      displayAchievements();
      displayCollection();
      updateMissionButton();

    }
  );