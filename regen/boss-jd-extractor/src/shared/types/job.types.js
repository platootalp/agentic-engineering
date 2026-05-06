/**
 * @fileoverview JSDoc type definitions for Boss直聘JD提取器
 */

/**
 * @typedef {Object} JobBasicInfo
 * @property {string} jobName - Job title
 * @property {string} company - Company name
 * @property {string} salary - Salary range
 * @property {string} location - Work location
 * @property {string} experience - Experience requirement
 * @property {string} education - Education requirement
 * @property {string[]} skillTags - Array of skill tags
 * @property {string} bossName - Recruiter name
 * @property {string} bossTitle - Recruiter title
 * @property {string} url - Job detail URL
 */

/**
 * @typedef {Object} JobDetailInfo
 * @property {string} jobName - Job title
 * @property {string} company - Company name
 * @property {string} salary - Salary range
 * @property {string} location - Work location
 * @property {string} experience - Experience requirement
 * @property {string} education - Education requirement
 * @property {string[]} skillTags - Array of skill tags
 * @property {string} jobDescription - Full job description
 * @property {string} bossName - Recruiter name
 * @property {string} bossTitle - Recruiter title
 * @property {string} bossActive - Recruiter activity status
 * @property {string[]} companyTags - Company tags (funding, size)
 * @property {boolean} isAgency - Whether it's an agency posting
 * @property {string} url - Page URL
 * @property {string} extractedAt - ISO timestamp
 * @property {string} pageType - 'detail' or 'list'
 */

/**
 * @typedef {Object} ListJobInfo
 * @property {number} index - Job index in list
 * @property {string} jobName - Job title
 * @property {string} company - Company name
 * @property {string} salary - Salary range
 * @property {string} location - Work location
 * @property {string} experience - Experience requirement
 * @property {string} education - Education requirement
 * @property {string[]} skillTags - Array of skill tags
 * @property {string} bossName - Recruiter name
 * @property {string} bossTitle - Recruiter title
 * @property {string} url - Job detail URL
 */

/**
 * @typedef {Object} ExtractionResult
 * @property {boolean} success - Whether extraction succeeded
 * @property {JobDetailInfo|ListJobInfo[]} data - Extracted data
 * @property {string} [error] - Error message if failed
 * @property {string} [markdown] - Generated markdown
 * @property {string} [pageType] - 'detail' or 'list'
 */

/**
 * @typedef {Object} ExtractionState
 * @property {boolean} isRunning - Whether extraction is in progress
 * @property {ListJobInfo[]} jobs - Jobs to extract
 * @property {number} currentIndex - Current job index
 * @property {Array} results - Extraction results
 * @property {Array} errors - Extraction errors
 * @property {number|null} startTime - Start timestamp
 * @property {boolean} cancelRequested - Whether cancel was requested
 */

/**
 * @typedef {Object} BatchExtractionResult
 * @property {Array} results - All extraction results
 * @property {number} count - Total count
 * @property {string} markdown - Generated markdown
 * @property {Array} errors - Errors encountered
 */

/**
 * @typedef {Object} ProgressMessage
 * @property {string} action - 'extractionProgress'
 * @property {string} status - 'started' | 'progress' | 'waiting' | 'completed' | 'cancelled'
 * @property {number} [current] - Current job index
 * @property {number} [total] - Total jobs
 * @property {string} [message] - Status message
 * @property {number} [success] - Success count
 * @property {number} [errors] - Error count
 * @property {number} [duration] - Duration in seconds
 */

/**
 * @typedef {Object} StoredExtraction
 * @property {string} type - 'detail' or 'list'
 * @property {Object} data - Extracted data
 * @property {string} markdown - Generated markdown
 * @property {number} count - Item count
 * @property {string} timestamp - ISO timestamp
 * @property {string} pageUrl - Source page URL
 */

// Export empty object since this file is for JSDoc types only
export {};
