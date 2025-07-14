import { useEffect, useState, useRef } from "react";
import useIntersectionObserver from "./hooks/useIntersectionObserver";
import L from "leaflet";
import Chart from 'chart.js/auto';
import "leaflet/dist/leaflet.css";
import './App.css'; // Add this line if you're placing custom CSS there

const dangerZones = [
  { lat: 19.045, lng: 72.850, radius: 0.005 },
];

export default function App() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState("");
  const [networkType, setNetworkType] = useState("");
  const [downlinkSpeed, setDownlinkSpeed] = useState("");
  const [alert, setAlert] = useState("");
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const chartRef = useRef();
  const chartInstance = useRef(null);

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
            const type = connection.effectiveType;
            const speed = connection.downlink;

            setNetworkType(type);
            setDownlinkSpeed(speed);

            fetch("http://localhost:5000/api/location", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                latitude: loc.lat,
                longitude: loc.lng,
                networkType: type,
                speed,
              }),
            })
              .then((res) => res.json())
              .then((data) => console.log("✅ Logged to DB:", data))
              .catch((err) => console.error("❌ Failed to log:", err));

            connection.addEventListener("change", () => {
              setNetworkType(connection.effectiveType);
              setDownlinkSpeed(connection.downlink);
              alertUser("Network changed to " + connection.effectiveType);
            });
          } else {
            setNetworkType("Not supported on this browser. Use Chrome.");
          }

          checkIfInDangerZone(loc);
        },
        (err) => {
          setError(`Location Error: ${err.message}`);
        }
      );
    } else {
      setError("Geolocation not supported");
    }
  }, []);

  useEffect(() => {
    if (location) {
      if (!map) {
        const mapInstance = L.map("map", { zoomControl: false });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(mapInstance);
        mapInstance.setView([location.lat, location.lng], 15);

        const newMarker = L.marker([location.lat, location.lng]).addTo(mapInstance);
        setMarker(newMarker);
        setMap(mapInstance);
      } else {
        if (marker) {
          marker.setLatLng([location.lat, location.lng]);
        }
        map.setView([location.lat, location.lng], 15);
      }
    }
  }, [location]);

  useEffect(() => {
    const ctx = chartRef.current?.getContext("2d");
    if (ctx) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['10:00', '10:05', '10:10', '10:15', '10:20'],
          datasets: [
            {
              label: 'Network Speed (Mbps)',
              data: [10, 8, 6, 7, 12],
              borderColor: 'cyan',
              backgroundColor: 'rgba(0,255,255,0.2)',
              tension: 0.4,
            },
            {
              label: 'Danger Zone Entry',
              data: [0, 0, 1, 0, 1],
              borderColor: 'red',
              backgroundColor: 'rgba(255,0,0,0.2)',
              borderDash: [5, 5],
              tension: 0.4,
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { labels: { color: 'white' } },
          },
          scales: {
            x: { ticks: { color: 'white' } },
            y: { ticks: { color: 'white' } }
          }
        }
      });
    }
  }, []);

  const checkIfInDangerZone = (loc) => {
    dangerZones.forEach((zone) => {
      const distance = Math.sqrt(
        Math.pow(loc.lat - zone.lat, 2) + Math.pow(loc.lng - zone.lng, 2)
      );
      if (distance < zone.radius) {
        alertUser("You have entered a danger zone!");
      }
    });
  };

  const alertUser = (message) => {
    setAlert(message);
    setTimeout(() => setAlert(""), 4000);
  };

  return (
    <div className="min-h-screen text-white p-4 md:p-8 font-sans relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(-45deg,#0f0c29,#302b63,#24243e,#0f0c29)] bg-[length:400%_400%] animate-gradient-x"></div>

      <header className="w-full text-center py-6">
        <h1 className="text-5xl font-black text-yellow-400 drop-shadow-2xl tracking-wide">
          🌍 SafePath Elite Dashboard
        </h1>
        <p className="text-base text-gray-400 mt-3 italic">
          Premium real-time safety and network insights
        </p>
      </header>

      {alert && <div className="bg-gradient-to-r from-red-600 to-red-400 text-white p-3 rounded-xl text-center shadow-md mb-6 animate-pulse">{alert}</div>}

      <main className="flex flex-col gap-10 items-center max-w-6xl mx-auto">
        <section className="bg-gradient-to-br from-gray-800 to-gray-900 border border-yellow-500 rounded-3xl shadow-2xl w-full p-8 text-center">
          <h2 className="text-3xl font-bold text-teal-400 mb-4">
            📍 Current Location
          </h2>
          {error && <p className="text-red-500">{error}</p>}
          {location ? (
            <div className="space-y-2 text-lg">
              <p>Latitude: <span className="text-green-400 font-mono">{location.lat}</span></p>
              <p>Longitude: <span className="text-green-400 font-mono">{location.lng}</span></p>
            </div>
          ) : (
            <p className="text-gray-400">Fetching location...</p>
          )}
        </section>

        <section className="bg-gradient-to-br from-gray-800 to-gray-900 border border-blue-500 rounded-3xl shadow-2xl w-full p-8 text-center">
          <h2 className="text-3xl font-bold text-blue-400 mb-4">
            🔌 Network Status
          </h2>
          <div className="space-y-2 text-lg">
            <p>Type: <span className="text-yellow-300 font-mono">{networkType}</span></p>
            <p>Speed: <span className="text-green-300 font-mono">{downlinkSpeed ? `${downlinkSpeed} Mbps` : "Unknown"}</span></p>
          </div>
        </section>

        <section className="bg-gradient-to-br from-gray-800 to-gray-900 border border-green-500 rounded-3xl shadow-2xl w-full p-8">
          <h2 className="text-3xl font-bold text-green-400 mb-4 text-center">
            🗘️ Location Map
          </h2>
          <div id="map" className="w-full h-96 rounded-xl border-2 border-gray-700 shadow-lg" />
        </section>

        <section className="bg-gradient-to-br from-gray-800 to-gray-900 border border-indigo-500 rounded-3xl shadow-2xl w-full p-8">
          <h2 className="text-3xl font-bold text-indigo-300 mb-4 text-center">
            📈 Network & Safety Analytics
          </h2>
          <div className="w-full h-96">
            <canvas ref={chartRef} className="w-full h-full" />
          </div>
        </section>

        <section className="w-full">
          <h2 className="text-3xl font-bold text-pink-400 text-center mb-6">
            🔒 Safety Tips
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SafetyTip>
              🕵️‍♂️ Share your location only with trusted people.
            </SafetyTip>
            <SafetyTip>
              📶 Avoid areas with weak network signal.
            </SafetyTip>
            <SafetyTip>
              ⚠️ If something feels unsafe, trust your instincts.
            </SafetyTip>
          </div>
        </section>
      </main>

      <footer className="text-center text-sm text-gray-500 mt-16 border-t pt-6">
        &copy; {new Date().getFullYear()} SafePath Elite. All rights reserved.
      </footer>
    </div>
  );
}

function SafetyTip({ children }) {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.3 });
  return (
    <div
      ref={ref}
      className={`transition duration-1000 ease-in-out p-6 rounded-2xl bg-gray-700 shadow-lg text-base tracking-wide leading-relaxed border-l-4 border-pink-500
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      {children}
    </div>
  );
}
