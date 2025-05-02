
// dateUtils.js - класс для работы с датами
class DateUtils {
  /**
   * Форматирование даты в локальный формат
   * @param {Date|string} date - дата для форматирования
   * @returns {string} форматированная дата
   */
  static formatDate(date) {
    return new Date(date).toLocaleDateString('ru-RU');
  }

  /**
   * Проверка, является ли день выходным (суббота или воскресенье)
   * @param {Date} date - дата для проверки
   * @returns {boolean} true, если выходной
   */
  static isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 - воскресенье, 6 - суббота
  }

  /**
   * Рассчитывает количество рабочих часов между двумя датами
   * @param {Date|string} startDate - начальная дата
   * @param {Date|string} endDate - конечная дата
   * @param {number} workingHoursPerDay - рабочих часов в день
   * @returns {number} количество рабочих часов
   */
  static calculateWorkingHours(startDate, endDate, workingHoursPerDay) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let workingHours = 0;
    const currentDate = new Date(start);

    while (currentDate <= end) {
      if (!this.isWeekend(currentDate)) {
        workingHours += workingHoursPerDay;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return workingHours;
  }
}

export default DateUtils
