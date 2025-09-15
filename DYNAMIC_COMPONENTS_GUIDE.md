# Hướng Dẫn Sử Dụng Các Component Động

Tất cả các component đã được cập nhật để nhận dữ liệu động thông qua props thay vì sử dụng dữ liệu cứng.

## 1. WaterTank Component

### Props mới:

```vue
<WaterTank
  :water-level="75"
  tank-id="TANK-001"
  :capacity="2000"
  :enable-animation="true"
  :show-bubbles="true"
  :width="500"
  :height="640"
/>
```

### Thuộc tính:

- `waterLevel`: Mức nước (0-100%)
- `tankId`: ID của bể chứa
- `capacity`: Dung tích (lít)
- `enableAnimation`: Bật/tắt hiệu ứng animation
- `showBubbles`: Hiển thị bọt khí

## 2. GateWave Component

### Props mới:

```vue
<GateWave
  :is-open="true"
  valve-id="VALVE-001"
  :position="75"
  :pressure="120"
  :max-pressure="200"
  :enable-control="true"
  @valve-toggle="handleValveToggle"
  @position-change="handlePositionChange"
/>
```

### Thuộc tính:

- `isOpen`: Trạng thái mở/đóng
- `valveId`: ID của van
- `position`: Vị trí van (0-100%)
- `pressure`: Áp suất hiện tại
- `maxPressure`: Áp suất tối đa
- `enableControl`: Cho phép điều khiển

### Events:

- `valve-toggle`: Khi van được bật/tắt
- `position-change`: Khi vị trí van thay đổi

## 3. WaterLevelSensor Component

### Props mới:

```vue
<WaterLevelSensor
  :water-level="60"
  sensor-id="LEVEL-001"
  unit="%"
  :min-level="0"
  :max-level="100"
  :enable-control="true"
  :show-bubbles="true"
  :alert-thresholds="{ low: 20, high: 80 }"
  @level-change="handleLevelChange"
  @alert="handleAlert"
/>
```

### Thuộc tính:

- `waterLevel`: Mức nước
- `sensorId`: ID cảm biến
- `unit`: Đơn vị đo
- `minLevel`, `maxLevel`: Giới hạn đo
- `enableControl`: Cho phép điều khiển
- `alertThresholds`: Ngưỡng cảnh báo

### Events:

- `level-change`: Khi mức nước thay đổi
- `alert`: Khi có cảnh báo

## 4. PressureGauge Component

### Props mới:

```vue
<PressureGauge
  :pressure="85"
  :max-pressure="150"
  :min-pressure="0"
  unit="PSI"
  gauge-id="PG-001"
  :enable-control="true"
  :danger-zone="80"
  :alert-threshold="90"
  @pressure-change="handlePressureChange"
  @alert="handleAlert"
/>
```

### Thuộc tính:

- `pressure`: Áp suất hiện tại
- `maxPressure`, `minPressure`: Phạm vi đo
- `unit`: Đơn vị (PSI, Bar, kPa, etc.)
- `gaugeId`: ID đồng hồ đo
- `dangerZone`: Vùng nguy hiểm (%)
- `alertThreshold`: Ngưỡng cảnh báo (%)

## 5. WaterPump Component

### Props mới:

```vue
<WaterPump
  :is-running="true"
  pump-id="PUMP-001"
  :flow-rate="45.5"
  :power-consumption="750"
  :enable-control="true"
  status-text="WORKING"
  @status-change="handleStatusChange"
  @toggle="handleToggle"
/>
```

### Thuộc tính:

- `isRunning`: Trạng thái hoạt động
- `pumpId`: ID máy bơm
- `flowRate`: Lưu lượng (L/min)
- `powerConsumption`: Công suất tiêu thụ (W)
- `enableControl`: Cho phép điều khiển
- `statusText`: Text trạng thái tùy chỉnh

## 6. Device Component

### Props mới:

```vue
<Device
  device-id="DEVICE-001"
  serial-number="ABC123"
  model-number="IOT-2024"
  :data="{
    temperature: 25.5,
    humidity: 68.2,
    pressure: 1015.3,
    voltage: 12.6,
    current: 3.2,
    power: 40.3,
    status: 'ONLINE',
  }"
  :enable-simulation="false"
  :update-interval="1000"
  @data-update="handleDataUpdate"
  @status-change="handleStatusChange"
  @alert="handleAlert"
/>
```

### Thuộc tính:

- `deviceId`: ID thiết bị
- `serialNumber`: Số serial
- `modelNumber`: Số model
- `data`: Dữ liệu cảm biến
- `enableSimulation`: Bật simulation
- `updateInterval`: Tần suất cập nhật (ms)

### Events:

- `data-update`: Khi dữ liệu cập nhật
- `status-change`: Khi trạng thái thay đổi
- `alert`: Khi có cảnh báo

## Ví Dụ Sử Dụng Trong Ứng Dụng

```vue
<template>
  <div class="scada-dashboard">
    <!-- Bể chứa với dữ liệu từ API -->
    <WaterTank :water-level="tankData.level" :tank-id="tankData.id" :capacity="tankData.capacity" />

    <!-- Van với điều khiển -->
    <GateWave
      :is-open="valveState.isOpen"
      :pressure="valveState.pressure"
      @valve-toggle="toggleValve"
    />

    <!-- Máy bơm với dữ liệu real-time -->
    <WaterPump
      :is-running="pumpData.running"
      :flow-rate="pumpData.flowRate"
      :power-consumption="pumpData.power"
      @toggle="controlPump"
    />

    <!-- Device với dữ liệu từ IoT -->
    <Device :data="sensorData" :enable-simulation="false" @alert="handleDeviceAlert" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const tankData = ref({
  level: 65,
  id: 'TANK-001',
  capacity: 1500,
})

const valveState = ref({
  isOpen: false,
  pressure: 0,
})

const pumpData = ref({
  running: false,
  flowRate: 0,
  power: 0,
})

const sensorData = ref({
  temperature: 23.5,
  humidity: 65.2,
  pressure: 1013.25,
  voltage: 12.4,
  status: 'ONLINE',
})

// Hàm xử lý events
const toggleValve = (isOpen) => {
  console.log('Valve toggled:', isOpen)
  // Gửi lệnh điều khiển đến server
}

const controlPump = () => {
  console.log('Pump toggled')
  // Gửi lệnh điều khiển máy bơm
}

const handleDeviceAlert = (type, message) => {
  console.log('Device alert:', type, message)
  // Xử lý cảnh báo
}

// Simulate real-time data updates
onMounted(() => {
  setInterval(() => {
    // Cập nhật dữ liệu từ API hoặc WebSocket
    updateDataFromAPI()
  }, 1000)
})

const updateDataFromAPI = async () => {
  // Fetch data from your API
  // tankData.value = await fetchTankData()
  // sensorData.value = await fetchSensorData()
}
</script>
```

## Lưu Ý Quan Trọng

1. **Tất cả props đều có giá trị mặc định** - Components vẫn hoạt động mà không cần truyền props
2. **Events được emit** - Bạn có thể lắng nghe thay đổi từ components
3. **Validation** - Các props quan trọng có validation (VD: waterLevel từ 0-100)
4. **Backward Compatible** - Components vẫn hoạt động như cũ nếu không truyền props mới
5. **Type Safety** - Tất cả components đều có TypeScript interfaces

Với những thay đổi này, bạn có thể dễ dàng tích hợp dữ liệu real-time từ API, WebSocket, hoặc bất kỳ nguồn dữ liệu nào khác vào các components SCADA của mình.
