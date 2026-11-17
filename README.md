# AquaLink – Intelligent Underwater Communication & Monitoring System

> *"Connecting Intelligence Beneath the Surface."*

![AquaLink Badge](https://img.shields.io/badge/AquaLink-v2.4%20Simulation-00f2fe?style=for-the-badge)
![Three.js Badge](https://img.shields.io/badge/Three.js-0.162-047857?style=for-the-badge&logo=three.js)
![React Badge](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178c6?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.4-646cff?style=for-the-badge&logo=vite)

---

## 🌊 Overview

**AquaLink** is an interactive, realistic 3D subsea digital-twin web simulation of an autonomous underwater monitoring and wireless communication node. Designed as an end-to-end software simulation for marine research and testing, AquaLink accurately models underwater environmental sensing, hybrid acoustic-optical wireless transmission, in-situ ocean-current energy harvesting, an AI-driven anti-biofouling lens wiper, and satellite/cellular data forwarding via an autonomous spar buoy.

> **Note:** All sensor readings, AI biofouling predictions, power generation calculations, and communication statistics in this software are modeled via mathematical heuristic simulations.

---

## 🚀 Key Features

### 1. Realistic 3D Underwater Environment (Three.js)
- **Deep Ocean Optics:** Depth-dependent exponential fog, realistic blue water scattering, caustic god rays penetrating from the water surface, and moving seabed topography with rocks and swaying marine kelp.
- **Ocean Dynamics:** Continuously animated vertex displacement waves on the surface and dynamic current drift for suspended marine particles and ambient fish schools.
- **Interactive Controls:** OrbitControls supporting 3D zoom, rotate, pan, and 7 camera angle presets (*Node Close-up, Full System View, Lens Wiper, Hydrodynamic Turbine, PCB Internals, Surface Buoy, Seabed*).

### 2. High-Fidelity 3D AquaLink Subsea Node
- **Industrial Marine Pressure Hull:** Metallic cylindrical titanium enclosure with yellow safety clamping collars, chrome hex bolts, skid landing rails, and lifting bail.
- **Transparent Acrylic Section:** Toggleable X-Ray mode revealing the interior PCB, ESP32 microcontroller with blinking status LED, capacitor arrays, and 3S Li-ion battery pack.
- **Acoustic Transducer Dome:** Piezoelectric ring emitting animated concentric acoustic compression wave rings.
- **Optical Comm Module:** 450 nm blue LED emitter with high-intensity beam cone passing through a sapphire window.
- **Silicone Wiper Mechanism:** Animated servo arm wiping biofilm off the optical lens window.
- **Hydrodynamic Helical Turbine:** 3-blade rotor with yellow tip highlights that rotates at RPM proportional to simulated ocean-current speed.

### 3. Environmental Sensor Simulation
Real-time continuous sensor generation with physical depth and environmental variance:
- **Water Temperature:** Depth-dependent thermal profile (°C)
- **Hydrostatic Pressure:** Calculated barometric and depth pressure (bar)
- **Turbidity:** Configurable optical attenuation (NTU)
- **Depth:** Dynamic sensor telemetry based on deployment winching (m)

### 4. Hybrid Optical-Acoustic Wireless Communication
- **Dual-Carrier Physical Layer:** High-speed 450 nm blue light beam for clear water + 24 kHz acoustic carrier for turbid or fouled conditions.
- **Automatic FSM Switching:** Monitors link quality; automatically falls back from optical to acoustic when turbidity > 40 NTU or biofouling > 65%, and restores optical mode once clarity recovers.
- **Data Forwarding Visualization:** Moving glowing packet trails showing end-to-end telemetry flow:
  $$\text{Underwater Node} \xrightarrow{\text{Subsea Link}} \text{Surface Buoy} \xrightarrow{\text{Satellite / LTE}} \text{Cloud Remote Dashboard}$$

### 5. AI-Driven Anti-Biofouling Prediction & Prognostics
- Optical window cleanliness tracking (0–100%) and simulated biofilm growth curve.
- 3-tier risk classification: **LOW RISK** (Clean), **MEDIUM RISK** (Partial), **HIGH RISK** (Contamination).
- Predictive maintenance countdown forecasting cleaning requirement days in advance.

### 6. Automated Servo-Operated Silicone Wiper
- Closed-loop cleaning cycle: triggers automatically when contamination exceeds threshold or manually via user command.
- Servo sweeps wiper blade across the sapphire window, reducing biofouling and restoring optical transmission quality.

### 7. Ocean-Current Hydrodynamic Energy Harvesting
- Simulates kinetic power extraction: $P = \frac{1}{2} \rho A v^3 C_p \eta$.
- Interactive current speed slider (0.0 to 3.5 m/s) with real-time turbine RPM and watt generation calculation.

### 8. Battery Management System (BMS)
- Live State-of-Charge (SoC %), terminal voltage curve (10.2V to 12.6V), power consumption breakdown, and runtime estimation.
- Simulates active charging, net power draw, and critical low-battery conditions.

### 9. Surface Spar Buoy Gateway
- Floating buoyant spar buoy with wave heave animation, solar deck plate, navigation strobe beacon, GPS coordinates, and satellite radome.
- Animated 2D HTML5 Canvas data-flow telemetry pipeline with moving packet dots and link diagnostic indicators.

### 10. Fault Injection & Testing Panel
Simulate 8 field failure modes and observe system auto-mitigation:
1. High Turbidity Spike (>65 NTU)
2. Optical Transceiver Hardware Failure
3. Acoustic Transducer Failure
4. Extreme Biofouling Contamination (>85%)
5. Low Battery Depletion (<15% SoC)
6. Turbine Mechanical Seizure (0 RPM)
7. Multi-Sensor Telemetry Disconnect
8. Surface Buoy Tether Severance

### 11. Typography & Theme Customization
- Built-in theme selector with 4 high-tech font styles (*Rajdhani Cyber, Space Grotesk, Plus Jakarta Sans, Orbitron Tactical*) and 4 color palettes (*Electric Cyan, Maritime Gold, Bioluminescent Emerald, Titanium Ice*).

---

## 🛠️ Technology Stack

- **Frontend Core:** React 18, TypeScript, Vite
- **3D Graphics & WebGL:** Three.js, OrbitControls
- **Styling:** Tailwind CSS, PostCSS, Lucide Icons
- **Simulation State Machine:** React Context API, Web Animation Frame (60 FPS)

---

## ⚡ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [npm](https://www.npmjs.com/)

### Installation & Run

```bash
# 1. Clone repository
git clone https://github.com/GOKUL12246/aqualink-sim.git
cd aqualink-sim

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open your browser at **`http://localhost:5173/`**.

### Production Build

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
aqualink-simulation/
├── index.html                   # Entry HTML with high-tech Google Web Fonts
├── package.json                 # Project dependencies & scripts
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript compiler configuration
├── tailwind.config.js           # Tailwind marine theme & color palette
├── src/
│   ├── main.tsx                 # Application mount
│   ├── App.tsx                  # Root component & navigation routing
│   ├── index.css                # Global styles, high-contrast typography, animations
│   ├── types.ts                 # Full TypeScript interfaces for all simulation telemetry
│   ├── context/
│   │   └── SimulationContext.tsx# Complete simulation state machine & event loops
│   ├── components/
│   │   ├── Navbar.tsx           # Sticky status header, theme selector & navigation
│   │   └── views/               # 11 Dedicated functional modules
│   │       ├── OverviewView.tsx
│   │       ├── SimulationView.tsx
│   │       ├── SensorMonitoringView.tsx
│   │       ├── HybridCommunicationView.tsx
│   │       ├── AIBiofoulingView.tsx
│   │       ├── AutomaticCleaningView.tsx
│   │       ├── EnergyHarvestingView.tsx
│   │       ├── BatteryManagementView.tsx
│   │       ├── SurfaceBuoyView.tsx
│   │       ├── FaultSimulationView.tsx
│   │       ├── AlertsReportsView.tsx
│   │       └── LiveMapView.tsx
│   └── three/
│       └── UnderwaterSimulation.tsx # Realistic 3D Three.js ocean scene & node model
```

---

## 📜 License
This project is open-source and available under the [MIT License](LICENSE).
