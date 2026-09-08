"use client";

import React, { useState, useEffect } from "react";
import { Send, RefreshCw, CheckCircle2, XCircle, Clock } from "lucide-react";
import { securityApi, WebhookTest, AdvertiserBadge } from "@/api/securityApi";

interface WebhookTesterProps {
  advertiserId: string;
}

export function WebhookTester({ advertiserId }: WebhookTesterProps) {
  const [tests, setTests] = useState<WebhookTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [testEvent, setTestEvent] = useState("conversion.completed");
  const [payload, setPayload] = useState(JSON.stringify({ test: true, sample: "data" }, null, 2));
  const [testing, setTesting] = useState(false);

  const loadTests = async () => {
    setLoading(true);
    try {
      const data = await securityApi.getWebhookTests(advertiserId, 20, 0);
      setTests(data);
    } catch (err) {
      console.error("Failed to load webhook tests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTests();
  }, [advertiserId]);

  const handleTest = async () => {
    setTesting(true);
    try {
      const parsedPayload = JSON.parse(payload);
      await securityApi.testWebhook({
        advertiser_id: advertiserId,
        test_event: testEvent,
        payload_sent: parsedPayload,
      });
      loadTests();
    } catch (err) {
      console.error("Failed to test webhook:", err);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Send className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">Webhook Postback Tester</h3>
        </div>
        <button
          onClick={loadTests}
          disabled={loading}
          className="p-1.5 bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-lg transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-gray-400 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="space-y-3 mb-4">
        <div>
          <label className="text-[10px] text-gray-400 font-medium mb-1 block">Test Event</label>
          <select
            value={testEvent}
            onChange={(e) => setTestEvent(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="conversion.completed">conversion.completed</option>
            <option value="offer.clicked">offer.clicked</option>
            <option value="campaign.updated">campaign.updated</option>
            <option value="webhook.test">webhook.test</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] text-gray-400 font-medium mb-1 block">Payload (JSON)</label>
          <textarea
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            rows={4}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300 font-mono focus:outline-none focus:border-cyan-500 resize-none"
          />
        </div>
        <button
          onClick={handleTest}
          disabled={testing}
          className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 active:scale-95 transition-all text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {testing ? <><RefreshCw className="w-4 h-4 animate-spin" /> Testing...</> : <><Send className="w-4 h-4" /> Send Test Request</>}
        </button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {tests.length === 0 ? (
          <div className="text-center py-6 text-gray-500 text-xs">No webhook tests yet</div>
        ) : (
          tests.map((test) => (
            <div key={test.id} className="p-3 bg-gray-900/50 border border-gray-800 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-gray-400">{test.test_event}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                  test.status === "SUCCESS" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                  test.status === "FAILED" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                  "bg-gray-500/10 text-gray-400 border-gray-500/20"
                }`}>{test.status}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-gray-500">{test.response_status || "N/A"}</span>
                {test.error_message && <span className="text-[10px] text-red-400 line-clamp-1">{test.error_message}</span>}
                {test.response_body && <span className="text-[10px] text-gray-500 line-clamp-1">{test.response_body.slice(0, 50)}...</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
