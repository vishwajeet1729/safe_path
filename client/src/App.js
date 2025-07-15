// Final Enhanced SafePath App.js with premium animations and UI
import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import Chart from 'chart.js/auto';
import { motion, AnimatePresence } from "framer-motion";
import "leaflet/dist/leaflet.css";
import './App.css';

const dangerZones = [{ lat: 19.045, lng: 72.850, radius: 0.005 }];

export default function App() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState("");
  const [networkType, setNetworkType] = useState("4G");
  const [downlinkSpeed, setDownlinkSpeed] = useState("12.5");
  const [alert, setAlert] = useState("");
  const [theme, setTheme] = useState("white");
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const chartRef = useRef();
  const chartInstance = useRef(null);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setLocation(loc);

          if ("connection" in navigator) {
            const connection = navigator.connection;
            setNetworkType(connection.effectiveType);
            setDownlinkSpeed(connection.downlink);
          }

          checkIfInDangerZone(loc);
        },
        (err) => setError(`Location Error: ${err.message}`)
      );
    } else setError("Geolocation not supported");
  }, []);

  useEffect(() => {
    if (location && !map) {
      const mapInstance = L.map("map", { 
        zoomControl: false,
        fadeAnimation: true,
        zoomAnimation: true
      });
      
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapInstance);
      
      mapInstance.setView([location.lat, location.lng], 15);
      
      const newMarker = L.marker([location.lat, location.lng], {
        riseOnHover: true,
        autoPan: true
      }).addTo(mapInstance)
        .bindPopup("Your current location")
        .openPopup();
      
      setMarker(newMarker);
      setMap(mapInstance);
      
      // Add danger zones
      dangerZones.forEach(zone => {
        L.circle([zone.lat, zone.lng], {
          color: '#ff0000',
          fillColor: '#f03',
          fillOpacity: 0.3,
          radius: zone.radius * 111320
        }).addTo(mapInstance)
        .bindPopup("Danger Zone");
      });
    }
  }, [location]);

 useEffect(() => {
  let frameId;

  const renderChart = () => {
    const ctx = chartRef.current?.getContext("2d");
    if (!ctx) {
      frameId = requestAnimationFrame(renderChart); // try again on next frame
      return;
    }

    chartInstance.current?.destroy(); // clear old chart

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
        datasets: [
          {
            label: 'Network Speed (Mbps)',
            data: Array.from({ length: 24 }, () => Math.floor(Math.random() * 15) + 5),
            borderColor: theme === 'dark' ? '#3b82f6' : '#2563eb',
            backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(37, 99, 235, 0.2)',
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 5
          },
          {
            label: 'Danger Alerts',
            data: Array.from({ length: 24 }, (_, i) => i === 10 || i === 15 ? 15 : 0),
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            borderDash: [5, 5],
            tension: 0.1,
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: theme === 'dark' ? '#e5e7eb' : '#1f2937',
              font: {
                family: "'Inter', sans-serif"
              }
            }
          },
          tooltip: {
            backgroundColor: theme === 'dark' ? '#1e293b' : '#f8fafc',
            titleColor: theme === 'dark' ? '#e2e8f0' : '#1e293b',
            bodyColor: theme === 'dark' ? '#cbd5e1' : '#334155',
            borderColor: theme === 'dark' ? '#334155' : '#cbd5e1',
            borderWidth: 1
          }
        },
        scales: {
          x: {
            grid: {
              color: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
            },
            ticks: {
              color: theme === 'dark' ? '#9ca3af' : '#6b7280',
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 12
            }
          },
          y: {
            grid: {
              color: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
            },
            ticks: {
              color: theme === 'dark' ? '#9ca3af' : '#6b7280',
              callback: function (value) {
                return value + ' Mbps';
              }
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });
  };

  frameId = requestAnimationFrame(renderChart);

  return () => {
    cancelAnimationFrame(frameId);
    chartInstance.current?.destroy();
  };
}, [theme]);


  const checkIfInDangerZone = (loc) => {
    dangerZones.forEach((zone) => {
      const distance = Math.sqrt(Math.pow(loc.lat - zone.lat, 2) + Math.pow(loc.lng - zone.lng, 2));
      if (distance < zone.radius) alertUser("🚨 Entered Danger Zone");
    });
  };

  const alertUser = (message) => {
    setAlert(message);
    setTimeout(() => setAlert(""), 5000);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900 to-gray-900 flex items-center justify-center z-50">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6"
          />
          <h1 className="text-3xl font-bold text-white bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            SafePath
          </h1>
          <p className="text-blue-200 mt-2">Initializing secure connection...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans p-4 relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-500">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern dark:opacity-10 opacity-5" />
        <div className="absolute top-0 left-0 w-full h-full bg-radial-gradient dark:opacity-20 opacity-10" />
        
        {/* Floating bubbles */}
        {Array.from({length: 15}).map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 100,
              y: Math.random() * 100,
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              x: [0, Math.random() * 100 - 50],
              transition: {
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut'
              }
            }}
            className={`absolute rounded-full opacity-20 ${i % 3 === 0 ? 'bg-blue-500' : i % 3 === 1 ? 'bg-purple-500' : 'bg-cyan-500'}`}
            style={{
              width: `${Math.random() * 200 + 50}px`,
              height: `${Math.random() * 200 + 50}px`,
              filter: 'blur(40px)'
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Theme toggle */}
        <motion.button 
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="fixed top-6 right-6 z-50 p-3 rounded-full backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 shadow-lg hover:shadow-xl transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {theme === 'dark' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </motion.button>

        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center py-12 relative"
        >
          <motion.div 
            className="absolute -top-10 -left-10 w-32 h-32 bg-blue-500 rounded-full filter blur-3xl opacity-20 dark:opacity-30"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.3, 0.2]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: 'reverse'
            }}
          />
          <motion.div 
            className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500 rounded-full filter blur-3xl opacity-20 dark:opacity-30"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: 'reverse',
              delay: 2
            }}
          />
          
          <motion.h1 
            className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-400 drop-shadow-md mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            SafePath
          </motion.h1>
          <motion.p 
            className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Real-time safety monitoring with advanced network analytics
          </motion.p>
        </motion.header>

        {/* Location display */}
        {location && (
          <motion.section 
            className="text-center mb-12 "
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <motion.div 
className="inline-block backdrop-blur-lg bg-white/70 dark:bg-gray-800/70 p-6 rounded-2xl shadow-lg border border-white/20"
style={{ width: '800px' }}
              whileHover={{ scale: 1.02 }}
            >
              <h2 className="text-xl font-semibold mb-3 flex items-center justify-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
                Current Location
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-left ">
                  <p className="text-gray-500 dark:text-gray-400">Latitude</p>
                  <p className="font-mono text-blue-600 dark:text-blue-400">{location.lat.toFixed(6)}</p>
                </div>
                <div className="text-right ">
                  <p className="text-gray-500 dark:text-gray-400">Longitude</p>
                  <p className="font-mono text-blue-600 dark:text-blue-400">{location.lng.toFixed(6)}</p>
                </div>
              </div>
              <p className="mt-3 text-blue-500 dark:text-blue-400 flex items-center justify-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Mumbai, India
              </p>
            </motion.div>
          </motion.section>
        )}

        {/* Stats and Chart */}
        <motion.section 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <motion.div 
            className="backdrop-blur-lg bg-white/70 dark:bg-gray-800/70 p-6 rounded-2xl shadow-lg border border-white/20"
            whileHover={{ y: -5 }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
              Network Overview
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <StatCard 
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                }
                label="Network Type"
                value={networkType}
                color="purple"
              />
              <StatCard 
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                }
                label="Speed"
                value={`${downlinkSpeed} Mbps`}
                color="blue"
              />
              <StatCard 
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                label="Ping"
                value="45 ms"
                color="green"
              />
              <StatCard 
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                }
                label="Jitter"
                value="5 ms"
                color="yellow"
              />
            </div>
          </motion.div>

          <motion.div 
            className="backdrop-blur-lg bg-white/70 dark:bg-gray-800/70 p-6 rounded-2xl shadow-lg border border-white/20"
            whileHover={{ y: -5 }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={10} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Network Analytics
            </h3>
            <div className="h-64">
              <canvas ref={chartRef} />
            </div>
          </motion.div>
        </motion.section>

        {/* Map Section */}
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Live Safety Map
          </h3>
          <motion.div 
            id="map" 
            className="w-full h-96 rounded-2xl shadow-xl border border-white/20 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          />
        </motion.section>

        {/* Alerts and Insights */}
        <motion.section 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
        >
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Recent Alerts
            </h3>
            <div className="space-y-3">
              <AlertItem 
                type="danger"
                time="10:05 AM"
                message="Entered danger zone"
                icon="🚨"
              />
              <AlertItem 
                type="warning"
                time="10:10 AM"
                message="Speed dropped below 5 Mbps"
                icon="⚠️"
              />
              <AlertItem 
                type="notice"
                time="10:20 AM"
                message="Signal interrupted"
                icon="📶"
              />
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Key Insights
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <InsightCard 
                label="Avg. Speed"
                value="8.5 Mbps"
                trend="up"
                change="12%"
                icon="🚀"
              />
              <InsightCard 
                label="Max Ping"
                value="80 ms"
                trend="down"
                change="5%"
                icon="⏱️"
              />
              <InsightCard 
                label="Danger Time"
                value="12 min"
                trend="up"
                change="20%"
                icon="⚠️"
              />
              <InsightCard 
                label="Alerts"
                value="3"
                trend="same"
                change="0%"
                icon="🔔"
              />
            </div>
          </div>
        </motion.section>

        {/* Alert notification */}
        <AnimatePresence>
          {alert && (
            <motion.div 
              className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25 }}
            >
              <div className="bg-red-600 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 backdrop-blur-lg bg-opacity-90">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {alert}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.footer 
          className="text-center text-sm text-gray-500 dark:text-gray-400 mt-16 pt-6 border-t border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
        >
          <p>© {new Date().getFullYear()} SafePath Technologies. All rights reserved.</p>
          <p className="mt-1">Real-time safety monitoring system</p>
        </motion.footer>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200',
    green: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
    red: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'
  };

  return (
    <motion.div 
      className={`p-3 rounded-xl ${colorClasses[color]}`}
      whileHover={{ scale: 1.03 }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="p-1 rounded-lg bg-white dark:bg-black/20">
          {icon}
        </div>
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-lg font-bold">{value}</p>
    </motion.div>
  );
}

function AlertItem({ type, time, message, icon }) {
  const typeClasses = {
    danger: 'bg-red-100 border-red-200 dark:bg-red-900/30 dark:border-red-800',
    warning: 'bg-yellow-100 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800',
    notice: 'bg-blue-100 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800'
  };

  return (
    <motion.div 
      className={`p-4 rounded-xl border ${typeClasses[type]} flex items-start gap-3`}
      whileHover={{ x: 5 }}
    >
      <span className="text-xl">{icon}</span>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium opacity-70">{time}</span>
          {type === 'danger' && (
            <span className="text-xs px-2 py-0.5 bg-red-500 text-white rounded-full">Critical</span>
          )}
        </div>
        <p className="font-medium">{message}</p>
      </div>
    </motion.div>
  );
}

function InsightCard({ label, value, trend, change, icon }) {
  const trendColors = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    same: 'text-gray-600 dark:text-gray-400'
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    same: '→'
  };

  return (
    <motion.div 
      className="backdrop-blur-lg bg-white/70 dark:bg-gray-800/70 p-4 rounded-xl shadow border border-white/20"
      whileHover={{ scale: 1.03 }}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-xl font-bold mt-1">{value}</p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className={`flex items-center gap-1 mt-2 text-sm ${trendColors[trend]}`}>
        <span>{trendIcons[trend]}</span>
        <span>{change}</span>
        {trend !== 'same' && <span>from avg.</span>}
      </div>
    </motion.div>
  );
}