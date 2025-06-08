import { format, parseISO, isValid, differenceInYears, addDays, startOfDay } from 'date-fns';

/**
 * Format date and time
 */
export const formatDateTime = (date) => {
  return formatDate(date, 'MMM dd, yyyy HH:mm');
};

/**
 * Format time only
 */
export const formatTime = (date) => {
  return formatDate(date, 'HH:mm');
};

/**
 * Calculate age from birth date
 */
export const calculateAge = (birthDate) => {
  if (!birthDate) return 0;
  
  try {
    const dateObj = typeof birthDate === 'string' ? parseISO(birthDate) : birthDate;
    return isValid(dateObj) ? differenceInYears(new Date(), dateObj) : 0;
  } catch (error) {
    console.error('Error calculating age:', error);
    return 0;
  }
};

/**
 * Get next available dates for appointments
 */
export const getNextAvailableDates = (daysAhead = 14, excludeWeekends = true) => {
  const dates = [];
  const today = startOfDay(new Date());
  
  for (let i = 1; i <= daysAhead; i++) {
    const date = addDays(today, i);
    
    if (excludeWeekends && (date.getDay() === 0 || date.getDay() === 6)) {
      continue;
    }
    
    dates.push(date);
  }
  
  return dates;
};

/**
 * Check if date is in the past
 */
export const isDateInPast = (date) => {
  const today = startOfDay(new Date());
  const checkDate = startOfDay(typeof date === 'string' ? parseISO(date) : date);
  return checkDate < today;
};