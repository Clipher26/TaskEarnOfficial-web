"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { securityApi, DeviceResponse } from "@/api/securityEnhancedApi";
import { ArrowLeft, Smartphone, Monitor, Tablet, Trash2, Shield, CheckCircle2, XCircle } from "lucide-react";

export default function DevicesPage() {
  const router = useRouter();
  const { isLoggedIn } = useAppStore();
  const [devices, setDevices] = useState<DeviceResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/auth");
      return;
    }
    loadDevices();
  }, [isLoggedIn]);

  const loadDevices = async () => {
    setLoading(true);
    try {
      const data = await securityApi.listDevices();
      setDevices(data);
    } catch (err) {
      console.error("Failed to load devices:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (deviceId: string) => {
    if (!confirm("Are you sure you want to revoke this device?")) return;
    try {
      await securityApi.revokeDevice(deviceId);
      loadDevices();
    } catch (err) {
      alert("Failed to revoke device");
    }
  };

  const handleTrust = async (deviceId: string) => {
    try {
      await securityApi.trustDevice(deviceId);
      loadDevices();
    } catch (err) {
      alert("Failed to trust device");
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "mobile": return <Smartphone className="w-5 h-5" />;
      case "desktop": return <Monitor className="w-5 h-5" />;
      case "tablet": return <Tablet className="w-5 h-5" />;
      default: return <Monitor className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-800 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Smartphone className="w-6 h-6 text-emerald-400" />
              Trusted Devices
            </h1>
            <p className="text-gray-400 text-sm mt-1">Manage devices that can access your account</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : devices.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Smartphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No devices registered</p>
          </div>
        ) : (
          <div className="space-y-3">
            {devices.map((device) => (
              <div key={device.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-800 rounded-lg">
                      {getDeviceIcon(device.device_type)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{device.device_name}</h3>
                      <p className="text-sm text-gray-400">{device.os} • {device.browser}</p>
                      <p className="text-xs text-gray-500 mt-1">Last active: {device.last_active ? new Date(device.last_active).toLocaleDateString() : "Never"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {device.is_trusted ? (
                      <span className="text-xs px-2 py-1 bg-emerald-900/30 text-emerald-400 rounded flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Trusted
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-yellow-900/30 text-yellow-400 rounded flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Untrusted
                      </span>
                    )}
                    {!device.is_primary && (
                      <button onClick={() => handleRevoke(device.device_id)} className="p-2 hover:bg-red-900/30 rounded-lg text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    {!device.is_trusted && (
                      <button onClick={() => handleTrust(device.device_id)} className="p-2 hover:bg-emerald-900/30 rounded-lg text-emerald-400">
                        <Shield className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
