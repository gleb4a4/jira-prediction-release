<template>
  <div class="container">
    <h1>Прогнозирование релиза</h1>
    <button @click="showModal">Описание приложения</button>

    <!-- Форма ввода данных -->
    <div class="inputs">
      <label>
        <span>Начальный объём (ч):</span>
        <input v-model.number="initialWork" type="number" min="0" step="1">
      </label>
      <label>
        <span>Текущий объём (ч):</span>
        <input v-model.number="currentWork" type="number" min="0" step="1">
      </label>
      <label>
        <span>Среднее velocity (ч/спринт):</span>
        <input v-model.number="meanVelocity" type="number" min="0" step="0.1">
      </label>
      <label>
        <span>Отклонение velocity:</span>
        <input v-model.number="stdVelocity" type="number" min="0" step="0.1">
      </label>
      <label>
        <span>Средний прирост задач (%):</span>
        <input v-model.number="meanAddvity" type="number" step="0.01">
      </label>
      <label>
        <span>Отклонение прироста (%):</span>
        <input v-model.number="stdAddvity" type="number" min="0" step="0.01">
      </label>
      <label>
        <span>Длительность спринта (дни):</span>
        <input v-model.number="sprintLength" type="number" min="1" step="1">
      </label>
      <label>
        <span>Рабочих часов в день:</span>
        <input v-model.number="workingHoursPerDay" type="number" min="1" max="24" step="0.5">
      </label>
      <label>
        <span>Дата начала:</span>
        <input type="date" v-model="startDate">
      </label>
      <button @click="runSimulation">
        <span>Рассчитать прогноз</span>
      </button>
    </div>

    <!-- Блок с результатами -->
    <div v-if="results.length" class="results">
      <!-- Сетка для графиков -->
      <div class="charts-grid">
        <!-- График вероятностей -->
        <div class="chart-container">
          <h3>Вероятность завершения по спринтам</h3>
          <VueApexCharts
            type="bar"
            height="300"
            :options="probabilityChartOptions"
            :series="probabilitySeries"
          />
        </div>

        <!-- График кумулятивной вероятности -->
        <div class="chart-container">
          <h3>Кумулятивная вероятность завершения</h3>
          <VueApexCharts
            type="line"
            height="300"
            :options="cumulativeChartOptions"
            :series="cumulativeSeries"
          />
        </div>

        <!-- График динамики работы - на всю ширину -->
        <div class="chart-container" style="grid-column: 1 / -1;">
          <h3>Динамика объёма работы</h3>
          <VueApexCharts
            type="line"
            height="300"
            :options="dynamicsChartOptions"
            :series="dynamicsSeries"
          />
        </div>
      </div>

      <!-- Текстовые метрики -->
      <div class="metrics">
        <p>Наиболее вероятный срок: <span class="highlight">{{ mostProbableSprint }}</span> спринт ({{ mostProbableDate }})</p>
        <p>Медианный срок (P50): <span class="highlight">{{ medianSprint }}</span> спринт ({{ medianDate }})</p>
        <p>Оптимистичный срок (P10): <span class="highlight">{{ p10Sprint }}</span> спринт ({{ p10Date }})</p>
        <p>Пессимистичный срок (P90): <span class="highlight">{{ p90Sprint }}</span> спринт ({{ p90Date }})</p>
        <p>Вероятность незавершения за {{ maxSprints }} спринтов: <span class="highlight">{{ unfinishedPercentage.toFixed(1) }}%</span></p>
        <div v-if="sprintDates.length" class="dates-table">
          <h4>Календарный план спринтов:</h4>
          <table>
            <thead>
            <tr>
              <th>Спринт</th>
              <th>Дата начала</th>
              <th>Дата окончания</th>
              <th>Рабочих часов</th>
              <th>Вероятность завершения</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(sprint, index) in sprintDates" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ sprint.start }}</td>
              <td>{{ sprint.end }}</td>
              <td>{{ sprint.workingHours }}</td>
              <td>{{ cumulativeResults[index] ? cumulativeResults[index].toFixed(1) + '%' : '0%' }}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  <Readme v-if="isModalVisible" :isVisible="isModalVisible" @close="hideModal" />
</template>

<script>
import VueApexCharts from 'vue3-apexcharts';
import SprintManager from "@/logic/sprintManager.js";
import MonteCarloSimulation from "@/logic/monteCarloSimulation.js";
import ChartOptionsFactory from "@/logic/factory/chartOptions.js";
import Readme from "@/components/modals/Readme.vue";
export default {
  components: { VueApexCharts, Readme },
  data() {
    return {
      isModalVisible: false,

      // Исходные данные
      initialWork: 265,
      currentWork: 281,
      meanVelocity: 56,
      stdVelocity: 33.22,
      meanAddvity: 1.14,
      stdAddvity: 2.59,
      maxSprints: 8,
      sprintLength: 14, // продолжительность спринта в днях
      workingHoursPerDay: 8, // рабочих часов в день
      startDate: new Date().toISOString().slice(0, 10), // текущая дата в формате YYYY-MM-DD

      // Результаты
      results: [],
      cumulativeResults: [],
      mostProbableSprint: 0,
      medianSprint: 0,
      p10Sprint: 0,
      p90Sprint: 0,
      unfinishedPercentage: 0,
      dynamicsData: [],
      p10Data: [],
      p50Data: [],
      p90Data: [],
      sprintDates: [],
      mostProbableDate: '',
      medianDate: '',
      p10Date: '',
      p90Date: '',

      // Настройки графиков
      probabilityChartOptions: ChartOptionsFactory.createProbabilityChartOptions(
        Array.from({length: 8}, (_, i) => `Спринт ${i+1}`)
      ),
      cumulativeChartOptions: ChartOptionsFactory.createCumulativeChartOptions(
        Array.from({length: 8}, (_, i) => `Спринт ${i+1}`)
      ),
      dynamicsChartOptions: ChartOptionsFactory.createDynamicsChartOptions()
    };
  },
  computed: {
    probabilitySeries() {
      return [{
        name: 'Вероятность',
        data: this.results
      }];
    },
    cumulativeSeries() {
      return [{
        name: 'Кумулятивная вероятность',
        data: this.cumulativeResults
      }];
    },
    dynamicsSeries() {
      return [
        {
          name: 'Средний объём',
          data: this.dynamicsData
        },
        {
          name: 'P10 (оптимистично)',
          data: this.p10Data
        },
        {
          name: 'P50 (медиана)',
          data: this.p50Data
        },
        {
          name: 'P90 (пессимистично)',
          data: this.p90Data
        }
      ];
    }
  },
  methods: {
    showModal() {
      this.isModalVisible = true;
    },
    hideModal() {
      this.isModalVisible = false;
    },
    runSimulation() {
      // Создаем экземпляр менеджера спринтов
      const sprintManager = new SprintManager(
        this.maxSprints,
        this.sprintLength,
        this.workingHoursPerDay
      );

      // Рассчитываем даты спринтов
      this.sprintDates = sprintManager.calculateSprintDates(this.startDate);

      // Обновляем категории на графиках
      this.probabilityChartOptions.xaxis.categories = Array.from(
        {length: this.maxSprints},
        (_, i) => `Спринт ${i+1}`
      );
      this.cumulativeChartOptions.xaxis.categories = Array.from(
        {length: this.maxSprints},
        (_, i) => `Спринт ${i+1}`
      );

      // Создаем симуляцию Монте-Карло
      const simulationParams = {
        initialWork: this.initialWork,
        currentWork: this.currentWork,
        meanVelocity: this.meanVelocity,
        stdVelocity: this.stdVelocity,
        meanAddvity: this.meanAddvity,
        stdAddvity: this.stdAddvity,
        maxSprints: this.maxSprints,
        workingHoursPerDay: this.workingHoursPerDay
      };

      const simulation = new MonteCarloSimulation(simulationParams);

      // Запускаем симуляцию
      const simulationResults = simulation.runSimulation(this.sprintDates);

      // Обновляем результаты
      this.results = simulationResults.results;
      this.cumulativeResults = simulationResults.cumulativeResults;
      this.p10Sprint = simulationResults.p10Sprint;
      this.medianSprint = simulationResults.medianSprint;
      this.p90Sprint = simulationResults.p90Sprint;
      this.mostProbableSprint = simulationResults.mostProbableSprint;
      this.unfinishedPercentage = simulationResults.unfinishedPercentage;

      // Рассчитываем данные для графика динамики
      const dynamicsData = simulation.calculateDynamicsData();
      this.dynamicsData = dynamicsData.dynamicsData;
      this.p10Data = dynamicsData.p10Data;
      this.p50Data = dynamicsData.p50Data;
      this.p90Data = dynamicsData.p90Data;

      // Обновляем даты для прогнозов
      this.updatePredictionDates();
    },

    updatePredictionDates() {
      // Создаем экземпляр менеджера спринтов для получения дат
      const sprintManager = new SprintManager(
        this.maxSprints,
        this.sprintLength,
        this.workingHoursPerDay
      );

      // Устанавливаем даты спринтов в менеджере
      sprintManager.sprintDates = this.sprintDates;

      // Получаем даты для прогнозов
      this.mostProbableDate = sprintManager.getSprintEndDate(this.mostProbableSprint);
      this.medianDate = sprintManager.getSprintEndDate(this.medianSprint);
      this.p10Date = sprintManager.getSprintEndDate(this.p10Sprint);
      this.p90Date = sprintManager.getSprintEndDate(this.p90Sprint);
    }
  }
}
</script>

<style>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  color: #334155;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #003aff;
  font-size: 2.2rem;
  font-weight: 700;
}

h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 16px;
}

.results {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
}

.chart-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
}

.chart-container:hover {
  box-shadow: 0 6px 16px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.metrics {
  padding: 24px;
  background: #f8fafc;
  border-radius: 12px;
  font-size: 16px;
  line-height: 1.6;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.highlight {
  font-weight: 700;
  color: #1E40AF;
  font-size: 18px;
}

.inputs {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
  margin-bottom: 30px;
  background: #f8fafc;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

@media (min-width: 768px) {
  .inputs {
    grid-template-columns: repeat(3, 1fr);
  }
}

button {
  grid-column: 1 / -1;
  padding: 14px;
  background: #3B82F6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 16px;
  font-weight: 600;
  margin-top: 10px;
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
}

button:hover {
  background: #2563EB;
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(59, 130, 246, 0.4);
}

button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

label {
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-weight: 500;
  font-size: 15px;
  color: #475569;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.2s;
}

input:focus {
  outline: none;
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

.dates-table {
  margin-top: 24px;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-top: 12px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

table th, table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  text-align: center;
}

table th {
  background-color: #f1f5f9;
  font-weight: 600;
  color: #334155;
  position: sticky;
  top: 0;
}

table tr:last-child td {
  border-bottom: none;
}

table tr:hover td {
  background-color: #f8fafc;
}

@media (max-width: 640px) {
  .inputs {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  button {
    grid-column: 1;
  }

  h1 {
    font-size: 1.8rem;
  }

  table th, table td {
    padding: 10px 12px;
    font-size: 14px;
  }
}
</style>
