import DateUtils from "@/utils/dateUtils.js";

// sprintManager.js - класс для работы со спринтами
class SprintManager {
  /**
   * @param {number} maxSprints - максимальное количество спринтов
   * @param {number} sprintLength - длительность спринта в днях
   * @param {number} workingHoursPerDay - рабочих часов в день
   */
  constructor(maxSprints, sprintLength, workingHoursPerDay) {
    this.maxSprints = maxSprints;
    this.sprintLength = sprintLength;
    this.workingHoursPerDay = workingHoursPerDay;
    this.sprintDates = [];
  }

  /**
   * Рассчитывает даты спринтов на основе даты начала и длительности спринта
   * @param {string} startDate - дата начала первого спринта
   * @returns {Array} массив объектов с датами спринтов
   */
  calculateSprintDates(startDate) {
    this.sprintDates = [];
    const startDateObj = new Date(startDate);

    for (let i = 0; i < this.maxSprints; i++) {
      const sprintStartDate = new Date(startDateObj);
      sprintStartDate.setDate(sprintStartDate.getDate() + i * this.sprintLength);

      const sprintEndDate = new Date(sprintStartDate);
      sprintEndDate.setDate(sprintEndDate.getDate() + this.sprintLength - 1);

      // Расчет рабочих часов для спринта
      const workingHours = DateUtils.calculateWorkingHours(
        sprintStartDate,
        sprintEndDate,
        this.workingHoursPerDay
      );

      this.sprintDates.push({
        start: DateUtils.formatDate(sprintStartDate),
        end: DateUtils.formatDate(sprintEndDate),
        workingHours: workingHours
      });
    }

    return this.sprintDates;
  }

  /**
   * Получает дату окончания указанного спринта
   * @param {number} sprintNumber - номер спринта (1-based)
   * @returns {string} дата окончания спринта или 'не определена'
   */
  getSprintEndDate(sprintNumber) {
    if (typeof sprintNumber === 'number' && this.sprintDates[sprintNumber - 1]) {
      return this.sprintDates[sprintNumber - 1].end;
    }
    return 'не определена';
  }
}

export default SprintManager
