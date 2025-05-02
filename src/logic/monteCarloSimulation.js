import Distribution from "@/logic/distribution.js";

// monteCarloSimulation.js - класс для симуляции Монте-Карло
class MonteCarloSimulation {
  /**
   * @param {Object} params - параметры симуляции
   * @param {number} params.initialWork - начальный объем работы
   * @param {number} params.currentWork - текущий объем работы
   * @param {number} params.meanVelocity - средняя скорость выполнения
   * @param {number} params.stdVelocity - стандартное отклонение скорости
   * @param {number} params.meanAddvity - среднее значение добавления новых задач (%)
   * @param {number} params.stdAddvity - стандартное отклонение добавления задач (%)
   * @param {number} params.maxSprints - максимальное количество спринтов
   */
  constructor(params) {
    this.params = params;
    this.results = [];
    this.cumulativeResults = [];
    this.workHistory = [];
    this.p10Sprint = null;
    this.medianSprint = null;
    this.p90Sprint = null;
    this.mostProbableSprint = null;
    this.unfinishedPercentage = 0;
  }

  /**
   * Запускает симуляцию Монте-Карло
   * @param {Array} sprintDates - массив объектов с датами спринтов
   * @param {number} trials - количество испытаний
   * @returns {Object} результаты симуляции
   */
  runSimulation(sprintDates, trials = 10000) {
    const successCount = new Array(this.params.maxSprints).fill(0);
    this.workHistory = Array.from({ length: this.params.maxSprints + 1 }, () => []);
    let unfinishedCount = 0;

    // Добавляем начальное состояние
    for (let i = 0; i < trials; i++) {
      this.workHistory[0].push(this.params.currentWork);
    }

    for (let i = 0; i < trials; i++) {
      let work = this.params.currentWork;
      let completed = false;

      for (let sprint = 0; sprint < this.params.maxSprints; sprint++) {
        if (completed) {
          this.workHistory[sprint + 1].push(0); // Если работа завершена, записываем 0
          continue;
        }

        // Получаем количество рабочих часов для текущего спринта
        const sprintWorkingHours = sprintDates[sprint].workingHours;

        // Корректируем velocity с учетом рабочих часов
        const standardWorkingHours = 10 * this.params.workingHoursPerDay; // 10 рабочих дней в 2-недельном спринте
        const velocityFactor = sprintWorkingHours / standardWorkingHours;

        // Выполнение работы (в начале спринта)
        const adjustedMeanVelocity = this.params.meanVelocity * velocityFactor;
        const adjustedStdVelocity = this.params.stdVelocity * velocityFactor;
        const velocity = Math.max(0, Distribution.generateNormal(adjustedMeanVelocity, adjustedStdVelocity));
        work -= velocity;

        // Добавление новых задач (в конце спринта)
        if (work > 0) {
          // Учитываем addvity как процент от оставшейся работы
          const addvityPercent = Math.max(0, Distribution.generateNormal(this.params.meanAddvity, this.params.stdAddvity) / 100);
          const addvity = work * addvityPercent;
          work += addvity;
        }

        // Сохраняем текущий объем работы для этой итерации и спринта
        this.workHistory[sprint + 1].push(Math.max(0, work));

        if (work <= 0) {
          successCount[sprint]++;
          completed = true;
        }
      }

      if (!completed) {
        unfinishedCount++;
      }
    }

    // Рассчитываем вероятности завершения по спринтам
    this.results = successCount.map(count => (count / trials) * 100);

    // Рассчитываем кумулятивные вероятности
    let accumulated = 0;
    this.cumulativeResults = successCount.map(count => {
      accumulated += (count / trials) * 100;
      return accumulated;
    });

    // Определяем P10, P50, P90 спринты
    this.p10Sprint = null;
    this.medianSprint = null;
    this.p90Sprint = null;

    for (let i = 0; i < this.cumulativeResults.length; i++) {
      if (this.cumulativeResults[i] >= 10 && !this.p10Sprint) {
        this.p10Sprint = i + 1;
      }
      if (this.cumulativeResults[i] >= 50 && !this.medianSprint) {
        this.medianSprint = i + 1;
      }
      if (this.cumulativeResults[i] >= 90 && !this.p90Sprint) {
        this.p90Sprint = i + 1;
      }
    }

    // Если какой-то из показателей не определен, значит он превышает maxSprints
    if (!this.p10Sprint) this.p10Sprint = ">" + this.params.maxSprints;
    if (!this.medianSprint) this.medianSprint = ">" + this.params.maxSprints;
    if (!this.p90Sprint) this.p90Sprint = ">" + this.params.maxSprints;

    // Наиболее вероятный спринт
    this.mostProbableSprint = this.results.indexOf(Math.max(...this.results)) + 1;

    // Процент незавершенных за maxSprints
    this.unfinishedPercentage = (unfinishedCount / trials) * 100;

    return {
      results: this.results,
      cumulativeResults: this.cumulativeResults,
      p10Sprint: this.p10Sprint,
      medianSprint: this.medianSprint,
      p90Sprint: this.p90Sprint,
      mostProbableSprint: this.mostProbableSprint,
      unfinishedPercentage: this.unfinishedPercentage,
      workHistory: this.workHistory
    };
  }

  /**
   * Рассчитывает данные для графика динамики работы
   * @returns {Object} данные для графика
   */
  calculateDynamicsData() {
    const dynamicsData = [];
    const p10Data = [];
    const p50Data = [];
    const p90Data = [];

    for (let sprint = 0; sprint <= this.params.maxSprints; sprint++) {
      const sprintData = this.workHistory[sprint].sort((a, b) => a - b);
      const mean = sprintData.reduce((a, b) => a + b, 0) / sprintData.length;

      const p10Index = Math.floor(sprintData.length * 0.1);
      const p50Index = Math.floor(sprintData.length * 0.5);
      const p90Index = Math.floor(sprintData.length * 0.9);

      dynamicsData.push(mean);
      p10Data.push(sprintData[p10Index]);
      p50Data.push(sprintData[p50Index]);
      p90Data.push(sprintData[p90Index]);
    }

    return {
      dynamicsData,
      p10Data,
      p50Data,
      p90Data
    };
  }
}

export default MonteCarloSimulation
