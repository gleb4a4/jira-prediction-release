// distribution.js - класс для генерации случайных распределений
class Distribution {
  /**
   * Реализация Box-Muller transform для нормального распределения
   * Генерирует случайное значение из нормального распределения
   * @param {number} mean - среднее значение
   * @param {number} std - стандартное отклонение
   * @returns {number} случайное значение
   */
  static generateNormal(mean, std) {
    let u, v, s;
    do {
      u = Math.random() * 2 - 1;
      v = Math.random() * 2 - 1;
      s = u * u + v * v;
    } while (s >= 1 || s === 0);
    return mean + std * u * Math.sqrt(-2 * Math.log(s) / s);
  }
}

export default Distribution
