"use client";

import React, { useState, useEffect } from "react";
import { Bell, BellOff, Plus, Trash2, Check, X } from "lucide-react";
import { TaskReminder } from "@/lib/types";
import { taskApi } from "@/api/taskApi";

interface TaskReminderSettingsProps {
  userId: string;
}

const CATEGORY_OPTIONS = [
  { value: "SURVEY", label: "Surveys" },
  { value: "APP_TESTING", label: "App Testing" },
  { value: "AUDIO_VOICE", label: "Voice Tasks" },
  { value: "AI_ANNOTATION", label: "AI Annotation" },
  { value: "GEO_FENCED", label: "Local Tasks" },
  { value: "CPA", label: "CPA Offers" },
  { value: "CPI", label: "CPI Offers" },
];

export const TaskReminderSettings: React.FC<TaskReminderSettingsProps> = ({ userId }) => {
  const [reminders, setReminders] = useState<TaskReminder[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newMinPayout, setNewMinPayout] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      const data = await taskApi.reminders.list();
      setReminders(data);
    } catch (error) {
      console.error("Failed to load reminders:", error);
    } finally {
      setLoading(false);
    }
  };

  const addReminder = async () => {
    if (!newCategory) return;
    try {
      const reminder = await taskApi.reminders.create({
        category: newCategory,
        min_payout_usd: newMinPayout ? parseFloat(newMinPayout) : undefined,
      });
      setReminders((prev) => [...prev, reminder]);
      setNewCategory("");
      setNewMinPayout("");
      setIsAdding(false);
    } catch (error) {
      console.error("Failed to create reminder:", error);
    }
  };

  const toggleReminder = async (reminder: TaskReminder) => {
    try {
      await taskApi.reminders.toggle(reminder.id, !reminder.is_active);
      setReminders((prev) => prev.map((r) => (r.id === reminder.id ? { ...r, is_active: !r.is_active } : r)));
    } catch (error) {
      console.error("Failed to toggle reminder:", error);
    }
  };

  const deleteReminder = async (reminderId: string) => {
    try {
      await taskApi.reminders.delete(reminderId);
      setReminders((prev) => prev.filter((r) => r.id !== reminderId));
    } catch (error) {
      console.error("Failed to delete reminder:", error);
    }
  };

  return (
    <div className="glass-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">Task Reminders</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-300 hover:bg-indigo-500/20 transition-all"
        >
          <Plus size={14} />
        </button>
      </div>

      <p className="text-xs text-slate-400">Get notified when high-paying tasks in your preferred categories go live.</p>

      {isAdding && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 space-y-3">
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="">Select category</option>
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          <input
            type="number"
            value={newMinPayout}
            onChange={(e) => setNewMinPayout(e.target.value)}
            placeholder="Min payout (USD, optional)"
            step="0.01"
            min="0"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />

          <div className="flex gap-2">
            <button
              onClick={addReminder}
              disabled={!newCategory}
              className="flex-1 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50"
            >
              Add Reminder
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-lg transition-all"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-4">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {reminders.length === 0 ? (
            <div className="text-center py-4">
              <BellOff size={24} className="text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No reminders set yet</p>
            </div>
          ) : (
            reminders.map((reminder) => (
              <div key={reminder.id} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleReminder(reminder)}
                    className={`p-1.5 rounded-lg transition-all ${
                      reminder.is_active ? "bg-indigo-500/20 text-indigo-400" : "bg-slate-700 text-slate-500"
                    }`}
                  >
                    {reminder.is_active ? <Bell size={14} /> : <BellOff size={14} />}
                  </button>
                  <div>
                    <p className="text-xs font-medium text-white">{reminder.category}</p>
                    {reminder.min_payout_usd && (
                      <p className="text-[10px] text-slate-500">Min ${reminder.min_payout_usd.toFixed(2)}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteReminder(reminder.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
