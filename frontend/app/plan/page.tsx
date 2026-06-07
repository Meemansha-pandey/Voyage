'use client';
import { useState } from 'react';
import api from '../../lib/api';

const INTERESTS = ['🍜 Food', '🏯 Culture', '🧗 Adventure', '🛍️ Shopping', '🌿 Nature', '🎨 Art', '🏖️ Beach', '🌙 Nightlife'];
const BUDGET_TYPES = ['Low', 'Medium', 'High'] as const;

export default function PlannerPage() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(5);
  const [budgetType, setBudgetType] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [interests, setInterests] = useState<string[]>(['🍜 Food', '🏯 Culture']);
  const [itinerary, setItinerary] = useState<any[]>([]);
  const [budget, setBudget] = useState<any>(null);
  const [hotels, setHotels] = useState<any[]>([]);
  const [packingList, setPackingList] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [regenDay, setRegenDay] = useState<number | null>(null);
  const [packingLoading, setPackingLoading] = useState(false);
  const [newActivities, setNewActivities] = useState<Record<number, string>>({});
  const [activeTab, setActiveTab] = useState<'itinerary' | 'budget' | 'hotels' | 'packing'>('itinerary');
  const [savedTripId, setSavedTripId] = useState<string | null>(null);

  const toggleInterest = (i: string) =>
    setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);

  const handleGenerate = async () => {
    if (!destination.trim()) { alert('Please enter a destination'); return; }
    setGenerating(true);
    setItinerary([]); setBudget(null); setHotels([]); setPackingList(null);
    try {
      const { data } = await api.post('/ai/generate', { origin, destination, days, budgetType, interests });
      setItinerary(data.itinerary || []);
      setBudget(data.budget || null);
      setHotels(data.hotels || []);
      try {
        const tripRes = await api.post('/trips', { origin, destination, days, budgetType, interests, itinerary: data.itinerary, budget: data.budget, hotels: data.hotels });
        setSavedTripId(tripRes.data.trip._id);
      } catch {}
    } catch (e: any) {
      alert('Failed to generate: ' + (e?.response?.data?.message || e.message));
    }
    setGenerating(false);
  };

  // Helper: persist updated itinerary to DB
  const syncItinerary = async (updatedItinerary: any[]) => {
    if (!savedTripId) return;
    try { await api.put(`/trips/${savedTripId}`, { itinerary: updatedItinerary }); } catch {}
  };

  const handleRegenDay = async (di: number) => {
    setRegenDay(di);
    try {
      const { data } = await api.post('/ai/regen-day', { destination, dayNumber: itinerary[di].day, budgetType, interests });
      const updated = itinerary.map((d, i) => i === di ? { ...d, activities: data.activities } : d);
      setItinerary(updated);
      await syncItinerary(updated);
    } catch {}
    setRegenDay(null);
  };

  const removeActivity = async (di: number, ai: number) => {
    const updated = itinerary.map((d, i) => i === di ? { ...d, activities: d.activities.filter((_: any, j: number) => j !== ai) } : d);
    setItinerary(updated);
    await syncItinerary(updated);
  };

  const addActivity = async (di: number) => {
    const text = newActivities[di]?.trim();
    if (!text) return;
    const updated = itinerary.map((d, i) => i === di ? { ...d, activities: [...d.activities, text] } : d);
    setItinerary(updated);
    setNewActivities(prev => ({ ...prev, [di]: '' }));
    await syncItinerary(updated);
  };

  const handlePacking = async () => {
    setPackingLoading(true);
    try {
      const { data } = await api.post('/ai/packing-list', { origin, destination, days, budgetType, interests });
      setPackingList(data.packingList);
      setActiveTab('packing');
      // Save packing list to the trip in DB
      if (savedTripId) {
        try { await api.put(`/trips/${savedTripId}`, { packingList: data.packingList }); } catch {}
      }
    } catch {}
    setPackingLoading(false);
  };

  const hasResult = itinerary.length > 0;

  const inputStyle = {
    width: '100%', padding: '.75rem 1rem', background: '#2C2C2A',
    border: '1px solid #4A4035', borderRadius: '10px', color: '#FAF7F2',
    fontSize: '.9rem', outline: 'none', boxSizing: 'border-box' as const
  };
  const labelStyle = {
    color: '#9FE1CB', fontSize: '.72rem', fontWeight: 500,
    letterSpacing: '.1em', textTransform: 'uppercase' as const, marginBottom: '.4rem', display: 'block'
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>

      {/* LEFT PANEL */}
      <div style={{ background: '#1C1810', overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

        {/* Route row: origin → destination */}
        <div style={{ background: '#2C2C2A', borderRadius: '12px', padding: '1rem', border: '1px solid #4A4035' }}>
          <div style={{ fontSize: '.72rem', color: '#9FE1CB', fontWeight: 500, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '.75rem' }}>Route</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: '.85rem' }}>🛫</span>
              <input value={origin} onChange={e => setOrigin(e.target.value)}
                placeholder="Flying from (e.g. Mumbai)"
                style={{ ...inputStyle, paddingLeft: '2.2rem', background: '#1C1810' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4A4035', fontSize: '.8rem' }}>↓</div>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: '.85rem' }}>🛬</span>
              <input value={destination} onChange={e => setDestination(e.target.value)}
                placeholder="Flying to (e.g. Tokyo, Japan)"
                onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                style={{ ...inputStyle, paddingLeft: '2.2rem', background: '#1C1810' }} />
            </div>
          </div>
          {origin && destination && (
            <div style={{ marginTop: '.75rem', padding: '.4rem .75rem', background: '#0F6E56', borderRadius: '6px', fontSize: '.75rem', color: '#9FE1CB', textAlign: 'center' }}>
              ✈️ {origin} → {destination}
            </div>
          )}
        </div>

        <div>
          <label style={labelStyle}>Number of days</label>
          <input type="number" value={days} min={1} max={30} onChange={e => setDays(Number(e.target.value))}
            style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Budget</label>
          <div style={{ display: 'flex', gap: '.5rem' }}>
            {BUDGET_TYPES.map(b => (
              <button key={b} onClick={() => setBudgetType(b)}
                style={{ flex: 1, padding: '.6rem', border: budgetType === b ? '1px solid #9FE1CB' : '1px solid #4A4035', borderRadius: '8px', background: budgetType === b ? '#0F6E56' : '#2C2C2A', color: budgetType === b ? '#9FE1CB' : '#7A7060', fontSize: '.8rem', cursor: 'pointer', transition: '.15s' }}>
                {b === 'Low' ? '🎒' : b === 'Medium' ? '✈️' : '💎'} {b}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={labelStyle}>Interests</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
            {INTERESTS.map(i => (
              <button key={i} onClick={() => toggleInterest(i)}
                style={{ padding: '.35rem .75rem', border: interests.includes(i) ? '1px solid #9FE1CB' : '1px solid #4A4035', borderRadius: '20px', background: interests.includes(i) ? '#0F6E56' : '#2C2C2A', color: interests.includes(i) ? '#9FE1CB' : '#7A7060', fontSize: '.78rem', cursor: 'pointer', transition: '.15s' }}>
                {i}
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleGenerate} disabled={generating}
          style={{ width: '100%', padding: '.9rem', background: generating ? '#4A4035' : '#9FE1CB', color: generating ? '#7A7060' : '#1C1810', border: 'none', borderRadius: '10px', fontSize: '.95rem', fontWeight: 700, cursor: generating ? 'not-allowed' : 'pointer', transition: '.2s', marginTop: '.25rem' }}>
          {generating ? '✦ Generating your trip...' : itinerary.length ? '↻ Regenerate' : '✦ Generate itinerary'}
        </button>

        {hasResult && (
          <button onClick={handlePacking} disabled={packingLoading}
            style={{ width: '100%', padding: '.75rem', background: '#2C2C2A', color: '#BA7517', border: '1px solid #BA7517', borderRadius: '10px', fontSize: '.85rem', fontWeight: 500, cursor: 'pointer' }}>
            {packingLoading ? 'Generating...' : '🎒 Smart packing list'}
          </button>
        )}
      </div>

      {/* RIGHT PANEL */}
      <div style={{ background: '#FAF7F2', overflowY: 'auto' }}>
        {!hasResult && !generating && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#7A7060', textAlign: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '4rem' }}>🗺️</div>
            <div style={{ fontSize: '1.3rem', fontFamily: 'Georgia, serif', color: '#4A4035' }}>Where are you headed?</div>
            <div style={{ fontSize: '.88rem', maxWidth: '320px', lineHeight: 1.6 }}>Enter your origin city for accurate flight costs and a smarter itinerary</div>
          </div>
        )}

        {generating && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem' }}>
            <div style={{ fontSize: '3rem', animation: 'pulse 1.5s ease-in-out infinite' }}>✈️</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.15rem', color: '#1C1810' }}>
              {origin ? `${origin} → ${destination}` : `Planning your trip to ${destination}`}
            </div>
            <div style={{ fontSize: '.85rem', color: '#7A7060' }}>Crafting your personalized itinerary...</div>
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
          </div>
        )}

        {hasResult && (
          <div>
            {/* Trip header */}
            <div style={{ background: '#1C1810', padding: '1.25rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.3rem', color: '#FAF7F2' }}>
                  {origin ? `${origin} → ${destination}` : destination}
                </div>
                <div style={{ fontSize: '.78rem', color: '#7A7060', marginTop: '.2rem' }}>
                  {days} days · {budgetType} budget · {interests.slice(0, 3).map(i => i.split(' ').slice(1).join('')).join(', ')}
                </div>
              </div>
              <span style={{ background: '#0F6E56', color: '#9FE1CB', fontSize: '.72rem', padding: '.3rem .85rem', borderRadius: '20px', fontWeight: 500 }}>✓ Ready</span>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #E2DDD5', background: '#fff', padding: '0 2rem' }}>
              {(['itinerary', 'budget', 'hotels', ...(packingList ? ['packing'] : [])] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab as any)}
                  style={{ padding: '.85rem 1.25rem', border: 'none', borderBottom: activeTab === tab ? '2px solid #0F6E56' : '2px solid transparent', background: 'none', color: activeTab === tab ? '#0F6E56' : '#7A7060', fontSize: '.85rem', fontWeight: activeTab === tab ? 600 : 400, cursor: 'pointer', marginBottom: '-1px' }}>
                  {tab === 'itinerary' ? '📅 Itinerary' : tab === 'budget' ? '💰 Budget' : tab === 'hotels' ? '🏨 Hotels' : '🎒 Packing'}
                </button>
              ))}
            </div>

            <div style={{ padding: '1.5rem 2rem' }}>
              {/* ITINERARY TAB */}
              {activeTab === 'itinerary' && itinerary.map((day, di) => (
                <div key={di} style={{ marginBottom: '1.25rem', background: '#fff', borderRadius: '12px', border: '1px solid #E2DDD5', overflow: 'hidden' }}>
                  <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #F2EDE4', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FDFCFA' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                      <div style={{ width: '30px', height: '30px', background: '#0F6E56', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9FE1CB', fontSize: '.78rem', fontWeight: 700, flexShrink: 0 }}>{day.day}</div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#1C1810', fontSize: '.9rem' }}>Day {day.day}</div>
                        {day.theme && <div style={{ fontSize: '.73rem', color: '#7A7060' }}>{day.theme}</div>}
                      </div>
                    </div>
                    <button onClick={() => handleRegenDay(di)} disabled={regenDay === di}
                      style={{ padding: '.3rem .75rem', background: '#FAEEDA', color: '#BA7517', border: '1px solid #BA7517', borderRadius: '8px', fontSize: '.73rem', cursor: 'pointer' }}>
                      {regenDay === di ? '...' : '↻ Regen day'}
                    </button>
                  </div>
                  <div style={{ padding: '1rem 1.25rem' }}>
                    {day.activities.map((act: string, ai: number) => (
                      <div key={ai} style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.5rem .75rem', background: '#FAF7F2', borderRadius: '8px', marginBottom: '.35rem' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0F6E56', flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: '.86rem', color: '#4A4035' }}>{act}</span>
                        <button onClick={() => removeActivity(di, ai)} style={{ background: 'none', border: 'none', color: '#B4B2A9', cursor: 'pointer', fontSize: '1rem' }}>×</button>
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: '.5rem', marginTop: '.65rem' }}>
                      <input value={newActivities[di] || ''} onChange={e => setNewActivities(p => ({ ...p, [di]: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && addActivity(di)}
                        placeholder="Add an activity..."
                        style={{ flex: 1, padding: '.4rem .75rem', border: '1px solid #E2DDD5', borderRadius: '8px', fontSize: '.82rem', outline: 'none', background: '#FAF7F2' }} />
                      <button onClick={() => addActivity(di)} style={{ padding: '.4rem .85rem', background: '#1C1810', color: '#FAF7F2', border: 'none', borderRadius: '8px', fontSize: '.8rem', cursor: 'pointer' }}>+ Add</button>
                    </div>
                  </div>
                </div>
              ))}

              {/* BUDGET TAB */}
              {activeTab === 'budget' && budget && (
                <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E2DDD5', overflow: 'hidden', maxWidth: '480px' }}>
                  <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #F2EDE4', fontFamily: 'Georgia, serif', fontSize: '1.05rem', color: '#1C1810' }}>
                    Estimated budget {origin && <span style={{ fontSize: '.78rem', color: '#7A7060', fontFamily: 'sans-serif' }}>({origin} → {destination})</span>}
                  </div>
                  <div style={{ padding: '1rem 1.5rem' }}>
                    {[['✈️ Flights', budget.flights], ['🏨 Accommodation', budget.accommodation], ['🍽️ Food & dining', budget.food], ['🎟️ Activities', budget.activities]].map(([label, amount]) => (
                      <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '.7rem 0', borderBottom: '1px solid #F2EDE4', fontSize: '.88rem' }}>
                        <span style={{ color: '#4A4035' }}>{label as string}</span>
                        <span style={{ fontWeight: 500, color: '#1C1810' }}>${amount as number}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', fontSize: '1rem', fontWeight: 700 }}>
                      <span>Total estimated</span>
                      <span style={{ color: '#0F6E56' }}>${budget.total}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* HOTELS TAB */}
              {activeTab === 'hotels' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
                  {hotels.map((h: any) => (
                    <div key={h.name} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E2DDD5', padding: '1.25rem' }}>
                      <div style={{ fontSize: '.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.4rem', color: h.tier === 'budget' ? '#0F6E56' : h.tier === 'mid' ? '#BA7517' : '#993C1D' }}>
                        {h.tier === 'budget' ? '🟢 Budget friendly' : h.tier === 'mid' ? '🟡 Mid-range' : '🔴 Luxury'}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '.92rem', color: '#1C1810', marginBottom: '.25rem' }}>{h.name}</div>
                      <div style={{ fontSize: '.82rem', color: '#BA7517' }}>{h.rating}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* PACKING TAB */}
              {activeTab === 'packing' && packingList && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  {Object.entries(packingList).map(([cat, items]: any) => (
                    <div key={cat} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E2DDD5', padding: '1.25rem' }}>
                      <div style={{ fontWeight: 600, fontSize: '.85rem', color: '#1C1810', textTransform: 'capitalize', marginBottom: '.75rem' }}>
                        {cat === 'essentials' ? '📋' : cat === 'clothing' ? '👕' : cat === 'tech' ? '📱' : '🎒'} {cat}
                      </div>
                      {items.map((item: string) => (
                        <div key={item} style={{ fontSize: '.82rem', color: '#4A4035', padding: '.25rem 0', borderBottom: '1px solid #F2EDE4' }}>✓ {item}</div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}