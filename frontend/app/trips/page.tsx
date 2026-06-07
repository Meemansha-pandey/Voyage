'use client';
import { useState, useEffect } from 'react';
import api from '../../lib/api';

export default function TripsPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'budget' | 'hotels' | 'packing'>('itinerary');

  useEffect(() => {
    api.get('/trips').then(({ data }) => {
      setTrips(data.trips || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const openTrip = async (trip: any) => {
    // Fetch full trip details
    try {
      const { data } = await api.get(`/trips/${trip._id}`);
      setSelectedTrip(data.trip);
      setActiveTab('itinerary');
    } catch {
      setSelectedTrip(trip);
      setActiveTab('itinerary');
    }
  };

  const deleteTrip = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await api.delete(`/trips/${id}`);
    setTrips(prev => prev.filter((t: any) => t._id !== id));
    if (selectedTrip?._id === id) setSelectedTrip(null);
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 56px)', color: '#7A7060' }}>
      Loading your trips...
    </div>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: trips.length > 0 ? '320px 1fr' : '1fr', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>

      {/* LEFT — trips list */}
      <div style={{ background: '#1C1810', overflowY: 'auto', padding: '1.5rem', borderRight: '1px solid #2C2C2A' }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', color: '#FAF7F2', marginBottom: '.25rem' }}>My trips</div>
        <div style={{ fontSize: '.78rem', color: '#4A4035', marginBottom: '1.25rem' }}>{trips.length} saved {trips.length === 1 ? 'itinerary' : 'itineraries'}</div>

        {trips.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: '#4A4035' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '.75rem' }}>🗺️</div>
            <p style={{ fontSize: '.85rem', marginBottom: '1rem' }}>No trips yet</p>
            <a href="/plan" style={{ background: '#9FE1CB', color: '#1C1810', padding: '.6rem 1.25rem', borderRadius: '8px', textDecoration: 'none', fontSize: '.82rem', fontWeight: 600 }}>Plan your first trip</a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
            {trips.map((trip: any) => (
              <div key={trip._id} onClick={() => openTrip(trip)}
                style={{ padding: '1rem', borderRadius: '10px', border: selectedTrip?._id === trip._id ? '1px solid #9FE1CB' : '1px solid #2C2C2A', background: selectedTrip?._id === trip._id ? '#0F6E56' : '#2C2C2A', cursor: 'pointer', transition: '.15s' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '.9rem', color: selectedTrip?._id === trip._id ? '#9FE1CB' : '#FAF7F2', marginBottom: '.2rem' }}>
                      {trip.origin ? `${trip.origin} → ${trip.destination}` : trip.destination}
                    </div>
                    <div style={{ fontSize: '.72rem', color: selectedTrip?._id === trip._id ? '#9FE1CB' : '#7A7060' }}>
                      {trip.days} days · {trip.budgetType} · {new Date(trip.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <button onClick={(e) => deleteTrip(trip._id, e)}
                    style={{ background: 'none', border: 'none', color: '#4A4035', cursor: 'pointer', fontSize: '1rem', flexShrink: 0, padding: '0 4px' }}
                    title="Delete trip">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT — trip detail */}
      {trips.length > 0 && (
        <div style={{ background: '#FAF7F2', overflowY: 'auto' }}>
          {!selectedTrip ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#7A7060', gap: '1rem' }}>
              <div style={{ fontSize: '3rem' }}>👈</div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', color: '#4A4035' }}>Select a trip to view details</div>
            </div>
          ) : (
            <div>
              {/* Header */}
              <div style={{ background: '#1C1810', padding: '1.25rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.3rem', color: '#FAF7F2' }}>
                    {selectedTrip.origin ? `${selectedTrip.origin} → ${selectedTrip.destination}` : selectedTrip.destination}
                  </div>
                  <div style={{ fontSize: '.78rem', color: '#7A7060', marginTop: '.2rem' }}>
                    {selectedTrip.days} days · {selectedTrip.budgetType} budget · {selectedTrip.interests?.slice(0, 3).map((i: string) => i.replace(/^[^\s]+\s/, '')).join(', ')}
                  </div>
                </div>
                <a href="/plan" style={{ fontSize: '.82rem', color: '#9FE1CB', textDecoration: 'none', border: '1px solid #0F6E56', padding: '.4rem .9rem', borderRadius: '8px' }}>
                  + New trip
                </a>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid #E2DDD5', background: '#fff', padding: '0 2rem' }}>
                {([
                  'itinerary',
                  'budget',
                  'hotels',
                  ...(selectedTrip.packingList ? ['packing'] : [])
                ] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab as any)}
                    style={{ padding: '.85rem 1.25rem', border: 'none', borderBottom: activeTab === tab ? '2px solid #0F6E56' : '2px solid transparent', background: 'none', color: activeTab === tab ? '#0F6E56' : '#7A7060', fontSize: '.85rem', fontWeight: activeTab === tab ? 600 : 400, cursor: 'pointer', marginBottom: '-1px', textTransform: 'capitalize' }}>
                    {tab === 'itinerary' ? '📅 Itinerary' : tab === 'budget' ? '💰 Budget' : tab === 'hotels' ? '🏨 Hotels' : '🎒 Packing'}
                  </button>
                ))}
              </div>

              <div style={{ padding: '1.5rem 2rem' }}>

                {/* ITINERARY TAB */}
                {activeTab === 'itinerary' && (
                  selectedTrip.itinerary?.length > 0 ? (
                    selectedTrip.itinerary.map((day: any, di: number) => (
                      <div key={di} style={{ marginBottom: '1.25rem', background: '#fff', borderRadius: '12px', border: '1px solid #E2DDD5', overflow: 'hidden' }}>
                        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #F2EDE4', display: 'flex', alignItems: 'center', gap: '.75rem', background: '#FDFCFA' }}>
                          <div style={{ width: '30px', height: '30px', background: '#0F6E56', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9FE1CB', fontSize: '.78rem', fontWeight: 700, flexShrink: 0 }}>{day.day}</div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#1C1810', fontSize: '.9rem' }}>Day {day.day}</div>
                            {day.theme && <div style={{ fontSize: '.73rem', color: '#7A7060' }}>{day.theme}</div>}
                          </div>
                        </div>
                        <div style={{ padding: '1rem 1.25rem' }}>
                          {day.activities?.map((act: string, ai: number) => (
                            <div key={ai} style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.5rem .75rem', background: '#FAF7F2', borderRadius: '8px', marginBottom: '.35rem' }}>
                              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0F6E56', flexShrink: 0 }} />
                              <span style={{ fontSize: '.86rem', color: '#4A4035' }}>{act}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: '#7A7060', fontSize: '.88rem', textAlign: 'center', padding: '2rem' }}>No itinerary data saved for this trip.</div>
                  )
                )}

                {/* BUDGET TAB */}
                {activeTab === 'budget' && (
                  selectedTrip.budget ? (
                    <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E2DDD5', overflow: 'hidden', maxWidth: '480px' }}>
                      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #F2EDE4', fontFamily: 'Georgia, serif', fontSize: '1.05rem', color: '#1C1810' }}>Estimated budget</div>
                      <div style={{ padding: '1rem 1.5rem' }}>
                        {[['✈️ Flights', selectedTrip.budget.flights], ['🏨 Accommodation', selectedTrip.budget.accommodation], ['🍽️ Food & dining', selectedTrip.budget.food], ['🎟️ Activities', selectedTrip.budget.activities]].map(([label, amount]) => (
                          <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '.7rem 0', borderBottom: '1px solid #F2EDE4', fontSize: '.88rem' }}>
                            <span style={{ color: '#4A4035' }}>{label as string}</span>
                            <span style={{ fontWeight: 500 }}>${amount as number}</span>
                          </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', fontSize: '1rem', fontWeight: 700 }}>
                          <span>Total</span>
                          <span style={{ color: '#0F6E56' }}>${selectedTrip.budget.total}</span>
                        </div>
                      </div>
                    </div>
                  ) : <div style={{ color: '#7A7060', fontSize: '.88rem' }}>No budget data saved.</div>
                )}

                {/* HOTELS TAB */}
                {activeTab === 'hotels' && (
                  selectedTrip.hotels?.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
                      {selectedTrip.hotels.map((h: any) => (
                        <div key={h.name} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E2DDD5', padding: '1.25rem' }}>
                          <div style={{ fontSize: '.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.4rem', color: h.tier === 'budget' ? '#0F6E56' : h.tier === 'mid' ? '#BA7517' : '#993C1D' }}>
                            {h.tier === 'budget' ? '🟢 Budget friendly' : h.tier === 'mid' ? '🟡 Mid-range' : '🔴 Luxury'}
                          </div>
                          <div style={{ fontWeight: 600, fontSize: '.92rem', color: '#1C1810', marginBottom: '.25rem' }}>{h.name}</div>
                          <div style={{ fontSize: '.82rem', color: '#BA7517' }}>{h.rating}</div>
                        </div>
                      ))}
                    </div>
                  ) : <div style={{ color: '#7A7060', fontSize: '.88rem' }}>No hotel data saved.</div>
                )}

                {/* PACKING TAB */}
                {activeTab === 'packing' && selectedTrip.packingList && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {Object.entries(selectedTrip.packingList).map(([cat, items]: any) => (
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
      )}
    </div>
  );
}