/**
 * @typedef {"vocabulary" | "grammar" | "sentence" | "listening" | "writing"} LearningItemType
 */

/**
 * @typedef {"english" | "chinese" | "other"} LearningLanguage
 */

/**
 * 学習対象を表す共通データ。
 *
 * @typedef {object} LearningItem
 * @property {string} id
 * @property {LearningItemType} type
 * @property {LearningLanguage} language
 * @property {string} title
 * @property {string} meaning
 * @property {string} pinyin
 * @property {string} content
 * @property {string} example
 * @property {string} exampleTranslation
 * @property {string} examplePinyin
 * @property {string} note
 * @property {string[]} tags
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * 各 LearningItem に紐づく復習データ。
 *
 * @typedef {object} SrsData
 * @property {string} itemId
 * @property {string} nextReviewDate
 * @property {number} interval
 * @property {number} easeFactor
 * @property {number} reviewCount
 * @property {number} mistakeCount
 * @property {string} lastReviewedAt
 * @property {number} masteryLevel
 */

/**
 * 学習コースの実行記録。
 *
 * @typedef {object} LearningSession
 * @property {string} id
 * @property {string} date
 * @property {string} courseId
 * @property {string} courseName
 * @property {number} plannedMinutes
 * @property {number} actualMinutes
 * @property {string[]} completedSteps
 * @property {string[]} skippedSteps
 * @property {string[]} reviewedItemIds
 * @property {string[]} mistakeItemIds
 * @property {number} dictationCount
 * @property {number} recordingCount
 * @property {string} writingText
 * @property {string} feedbackText
 * @property {string} note
 */

/**
 * 日々の学習ログ。
 *
 * @typedef {object} StudyLog
 * @property {string} id
 * @property {string} date
 * @property {string[]} learnedItems
 * @property {string[]} mistakes
 * @property {string} feedback
 * @property {string[]} tomorrowReviewItems
 * @property {string} freeNote
 * @property {string} createdAt
 * @property {string} updatedAt
 */

export {};
