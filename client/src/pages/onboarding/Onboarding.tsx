import { useStore } from '@/store';
import { CATEGORIES } from '@/types';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Onboarding = () => {
  const setProfile = useStore(state => state.setProfile);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nickname: '',
    monthlyIncome: '',
    monthlySavings: '',
    currentSavings: '',
    useSavings: false,
    blacklistedCategories: [] as string[],
  });

  const toggleCategory = (cat: string) => {
    setForm(prev => ({
      ...prev,
      blacklistedCategories: prev.blacklistedCategories.includes(cat)
        ? prev.blacklistedCategories.filter(c => c !== cat)
        : [...prev.blacklistedCategories, cat]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile({
      nickname: form.nickname,
      monthlyIncome: Number(form.monthlyIncome),
      monthlySavings: Number(form.monthlySavings),
      currentSavings: Number(form.currentSavings),
      useSavings: form.useSavings,
      blacklistedCategories: form.blacklistedCategories
    });
    navigate('/check');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">ZenBalance 🧘</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            placeholder="Никнейм"
            className="w-full p-3 border rounded-lg"
            value={form.nickname}
            onChange={e => setForm({...form, nickname: e.target.value})}
          />
          <input
            required
            type="number"
            placeholder="Месячный доход (₽)"
            className="w-full p-3 border rounded-lg"
            value={form.monthlyIncome}
            onChange={e => setForm({...form, monthlyIncome: e.target.value})}
          />
          <input
            required
            type="number"
            placeholder="Откладываю в месяц (₽)"
            className="w-full p-3 border rounded-lg"
            value={form.monthlySavings}
            onChange={e => setForm({...form, monthlySavings: e.target.value})}
          />
          
          <label className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer">
            <input 
              type="checkbox" 
              checked={form.useSavings}
              onChange={e => setForm({...form, useSavings: e.target.checked})}
            />
            <span className="text-sm">Учитывать текущие накопления?</span>
          </label>

          {form.useSavings && (
            <input
              type="number"
              placeholder="Текущие накопления (₽)"
              className="w-full p-3 border rounded-lg animate-in fade-in"
              value={form.currentSavings}
              onChange={e => setForm({...form, currentSavings: e.target.value})}
            />
          )}

          <div className="mt-4">
            <h3 className="font-semibold mb-2">Черный список (ИИ заблокирует):</h3>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    form.blacklistedCategories.includes(cat)
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white p-4 rounded-lg font-bold mt-6 hover:bg-blue-700">
            Начать
          </button>
        </form>
      </div>
    </div>
  );
};