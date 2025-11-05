export const LISTING_CATEGORIES = [
  'Экскаваторы',
  'Погрузчики',
  'Краны',
  'Бульдозеры',
  'Трактора',
  'Самосвалы',
  'Прицепы',
  'Другое'
] as const;

export const SPECIALIST_ROLES = [
  'оператор крана',
  'экскаваторщик',
  'бульдозерист',
  'тракторист',
  'водитель самосвала',
  'механик/ремонтник',
  'оператор/машинист спецтехники'
] as const;

export const DEAL_TYPES = ['продажа', 'аренда', 'лизинг'] as const;

export const LISTING_STATUSES = [
  'draft',
  'pending',
  'published',
  'rejected',
  'hidden',
  'archived',
  'blocked'
] as const;

export const PROMOTION_TYPES = ['vip', 'top', 'highlight', 'autobump'] as const;
