/**
 * @fileoverview Filter constants for text filtering and validation
 */

/**
 * Benefit-related keywords to exclude from skill tags
 * These words indicate benefits/perks rather than skills
 */
export const BENEFIT_WORDS = [
  '薪', '假', '补', '贴', '金', '险', '利', '旅游', '团建', '聚餐',
  '下午茶', '零食', '包吃', '包住', '住房', '生日', '体检', '期权', '股票',
  '五险', '公积金', '社保', '医保', '节假日', '加班费', '餐补', '定期体检',
  '保底工资', '年终奖', '餐补', '交通补助', '有无线网', '待优化'
];

/**
 * Experience-related patterns to exclude from skill tags
 * Matches: "3-5年", "经验不限", "无需经验", "应届毕业生"
 */
export const EXPERIENCE_PATTERNS = [
  /\d+[-\d]*年/,
  /经验不限/,
  /无需经验/,
  /应届/
];

/**
 * Education-related patterns to exclude from skill tags
 * Matches: "本科", "硕士", "博士", "大专", etc.
 */
export const EDUCATION_PATTERNS = [
  /本科/,
  /硕士/,
  /博士/,
  /大专/,
  /中专/,
  /高中/,
  /学历/,
  /及以上/
];

/**
 * Salary-related patterns
 * Used to identify salary text and filter from other fields
 */
export const SALARY_PATTERNS = [
  /^\d+[-~]?\d*K/i,
  /\d+[-~]?\d*元\/月/,
  /月薪/,
  /年薪/,
  /面议/,
  /薪/,
  /工资/
];

/**
 * Agency/placeholder company name patterns
 * These indicate the company name is not disclosed (recruiting agency)
 */
export const AGENCY_PATTERNS = [
  /代招公司/,
  /代招：/,
  /某大型/,
  /某知名/,
  /某互联网/,
  /某上市/,
  /某外资/,
  /某国企/,
  /某央企/,
  /某\w+公司/
];

/**
 * Company name cleanup patterns
 * Remove these strings from extracted company names
 */
export const COMPANY_CLEANUP_PATTERNS = [
  /公司介绍/,
  /我要提问/,
  /查看全部\d+个职位/,
  /招聘/
];

/**
 * Company name validation patterns
 * Used to filter out invalid company names
 */
export const INVALID_COMPANY_PATTERNS = [
  /·/,
  /招聘/
];

/**
 * HTML tag patterns for description cleanup
 * Used when converting HTML to text
 */
export const HTML_CLEANUP_PATTERNS = {
  lineBreak: /<br\s*\/?>/gi,
  listItem: /<li[^>]*>/gi,
  listItemClose: /<\/li>/gi,
  allTags: /<[^>]+>/g
};

/**
 * Section title patterns for finding description sections
 * Used as fallback when primary selectors fail
 */
export const DESCRIPTION_SECTION_PATTERNS = [
  /职位描述/,
  /岗位职责/,
  /岗位描述/
];

/**
 * Page title patterns for company name extraction
 * Matches: "Job Title · Company Name - BOSS直聘"
 */
export const TITLE_COMPANY_PATTERN = /[·-]\s*(.+?)\s*-\s*BOSS直聘$/;

/**
 * Experience extraction pattern
 * Matches: "3-5年", "经验不限", "无需经验", "应届毕业生"
 */
export const EXPERIENCE_EXTRACTION_PATTERN = /(\d+[-\d]*年|经验不限|无需经验|应届毕业生)/;
