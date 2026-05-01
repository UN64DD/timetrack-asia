import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Routes, Route, Link, NavLink, useNavigate, useLocation, Navigate
} from 'react-router-dom';
import { 
  Users, Calendar, BarChart3, Settings, LogOut, 
  Plus, Search, FileDown, Edit3, Trash2, 
  ChevronRight, ArrowLeft, Save, Loader2,
  Trophy, MapPin, Globe, ImageIcon, Check, Fingerprint,
  LayoutDashboard, Zap
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNotification } from '../lib/NotificationContext';
import { playTap } from '../lib/sounds';
import CustomCalendar from '../components/CustomCalendar';
import CustomDropdown from '../components/CustomDropdown';

// --- Sub-Components ---

const Overview = ({ stats, startCreate }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-12"
  >
    <header className="flex justify-between items-end">
      <div>
        <h1 className="text-5xl md:text-6xl font-display font-black uppercase tracking-tighter leading-none italic">
          Events <span className="text-blue-600">HUB</span>
        </h1>
        <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em] mt-4">Overview</p>
      </div>
      <button 
        onClick={startCreate}
        className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-2xl shadow-blue-600/30 transition-all hover:scale-105 active:scale-95"
      >
        <Plus size={18} /> New Event
      </button>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[
        { label: 'Total Events', value: stats.events, icon: Calendar },
        { label: 'Total Athletes', value: stats.athletes, icon: Users },
        { label: 'Gross Revenue', value: `RM ${(typeof stats.revenue === 'number' && !isNaN(stats.revenue)) ? stats.revenue.toFixed(2) : '0.00'}`, icon: BarChart3 },
      ].map((stat, i) => (
        <motion.div 
          key={i} 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] hover:border-blue-500/20 transition-all group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
            <stat.icon size={80} />
          </div>
          <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white text-blue-600 duration-500">
            <stat.icon size={18} />
          </div>
          <p className="text-white/40 text-[8px] font-black uppercase tracking-[0.3em] mb-1">{stat.label}</p>
          <h4 className="text-3xl font-display font-black tracking-tight italic">{stat.value}</h4>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

const Events = ({ events, loading, startCreate, handleDeleteEvent }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-6"
  >
    <div className="flex items-center justify-between px-4">
      <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Operational Event Registry</h3>
      <div className="flex items-center gap-4">
        <button 
          onClick={startCreate}
          className="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-white transition-colors mr-4"
        >
          Initialize
        </button>
        <Search className="text-white/20 hover:text-white cursor-pointer transition-colors" size={14} />
        <FileDown className="text-white/20 hover:text-white cursor-pointer transition-colors" size={14} />
      </div>
    </div>

    <div className="grid grid-cols-1 gap-3">
      {loading ? (
        <div className="py-12 flex items-center justify-center bg-white/5 rounded-[2.5rem] border border-white/5">
          <Loader2 className="animate-spin text-white" size={32} />
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white/5 border border-dashed border-white/10 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-blue-600/5 rounded-full flex items-center justify-center mb-6 border border-blue-500/10 text-blue-900">
            <Calendar size={24} />
          </div>
          <h3 className="text-lg font-black uppercase tracking-widest text-white/20">Zero Events Detected</h3>
          <button onClick={startCreate} className="mt-4 text-[10px] font-black text-blue-500 hover:text-white uppercase tracking-widest transition-colors underline underline-offset-8">Initialize First Event</button>
        </div>
      ) : (
        events.map((event: any, i: number) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-white/5 border border-white/5 p-6 rounded-[1.5rem] flex items-center justify-between group hover:border-blue-500/20 hover:bg-blue-600/[0.02] transition-all"
          >
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-black rounded-2xl overflow-hidden border border-white/10 shrink-0">
                {event.banner_image ? (
                  <img src={event.banner_image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/5">
                    <Trophy size={24} />
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h4 className="text-xl font-display font-black uppercase tracking-tight italic group-hover:text-blue-500 transition-colors">{event.title}</h4>
                  <span className={`px-3 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest ${
                    event.status === 'published' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'
                  }`}>
                    {event.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">
                  <span className="flex items-center gap-1.5"><MapPin size={10} className="text-blue-600" /> {event.location}</span>
                  <span className="flex items-center gap-1.5"><Calendar size={10} className="text-blue-600" /> {new Date(event.date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => handleDeleteEvent(event.id)}
                className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/20 hover:bg-red-600 hover:text-white transition-all duration-300"
              >
                <Trash2 size={16} />
              </button>
              <div className="w-px h-8 bg-white/5 mx-1" />
              <button className="flex items-center gap-2 pl-2 group/btn">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/10 group-hover/btn:text-white transition-colors">Manifest</span>
                <ChevronRight size={16} className="text-white/5 group-hover/btn:translate-x-1 group-hover/btn:text-blue-600 transition-all" />
              </button>
            </div>
          </motion.div>
        ))
      )}
    </div>
  </motion.div>
);

const Registrations = ({ registrations, loading }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-8"
  >
    <div className="flex items-center justify-between px-4">
      <h3 className="text-xs font-black uppercase tracking-[0.4em] text-white/20">Participant Manifest</h3>
    </div>
    
    <div className="grid grid-cols-1 gap-4">
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center bg-white/5 rounded-[3rem] border border-white/5">
          <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
          <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Syncing Manifest Data...</p>
        </div>
      ) : registrations.length === 0 ? (
        <div className="bg-white/5 border border-dashed border-white/10 rounded-[3rem] p-20 text-center">
          <Users size={48} className="mx-auto text-blue-600/10 mb-6" />
          <h3 className="text-lg font-black uppercase tracking-widest text-white/20">No Active Registrations</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/10 mt-2">Awaiting athlete deployment</p>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/5 rounded-[2.5rem] overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/[0.02] border-b border-white/5">
              <tr>
                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-white/40">Athlete</th>
                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-white/40">Event</th>
                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-white/40">Status</th>
                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-white/40 text-right">Registered At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {registrations.map((reg: any, i: number) => (
                <tr key={reg.id} className="group hover:bg-white/[0.01] transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-600/10 rounded-full flex items-center justify-center border border-blue-500/20 text-blue-500 font-bold text-xs uppercase">
                        {reg.profiles?.full_name?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase tracking-tight">{reg.profiles?.full_name || 'Anonymous'}</p>
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{reg.profiles?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">{reg.events?.title}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                      reg.status === 'Confirmed' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'
                    }`}>
                      {reg.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                      {new Date(reg.created_at).toLocaleDateString()}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </motion.div>
);

const Export = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-8"
  >
    <div className="flex items-center justify-between px-4">
      <h3 className="text-xs font-black uppercase tracking-[0.4em] text-white/20">Data Export Hub</h3>
    </div>
    <div className="bg-white/5 border border-white/5 rounded-[3rem] p-12 text-center">
      <FileDown size={48} className="mx-auto text-blue-600/20 mb-6" />
      <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Select event to export registration data</p>
      <div className="mt-8 flex justify-center gap-4">
         <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all">CSV Format</button>
         <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all">Excel Format</button>
      </div>
    </div>
  </motion.div>
);

const Analytics = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-8"
  >
    <div className="flex items-center justify-between px-4">
      <h3 className="text-xs font-black uppercase tracking-[0.4em] text-white/20">Operational Analytics</h3>
    </div>
    <div className="grid grid-cols-2 gap-8">
      <div className="bg-white/5 border border-white/5 rounded-[3rem] p-12 h-64 flex items-center justify-center italic text-white/10 font-black uppercase tracking-widest">Growth Vector Analysis</div>
      <div className="bg-white/5 border border-white/5 rounded-[3rem] p-12 h-64 flex items-center justify-center italic text-white/10 font-black uppercase tracking-widest">Revenue Streams</div>
    </div>
  </motion.div>
);


const EventForge = ({ eventForm, setEventForm, handleSaveEvent, handleFileUpload, loading, navigate }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.98 }}
    className="w-full max-w-[1600px] mx-auto"
  >
    <div className="flex items-center justify-between mb-8">
      <button 
        onClick={() => navigate('/events')}
        className="flex items-center gap-2 text-blue-500 hover:text-white transition-colors group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Back to Events</span>
      </button>
      <div className="flex items-center gap-4">
         <span className="text-[10px] font-black text-blue-600/40 uppercase tracking-widest">Protocol: Event Forge v2.4</span>
      </div>
    </div>

    <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8">
      <form onSubmit={handleSaveEvent} className="space-y-8">
        <div className="bg-white/5 border border-white/5 p-8 md:p-10 rounded-[2.5rem] space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter italic">
              Create <span className="text-blue-600">Event</span>
            </h1>
            <div className="px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-600/10 text-blue-500 border border-blue-500/10">
              NEW EVENT
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-500 ml-2">Event Title</label>
              <input 
                type="text"
                value={eventForm.title}
                onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm focus:border-blue-600 outline-none transition-all font-bold"
                required
                placeholder="EVENT DESIGNATION"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-500 ml-2">Location</label>
              <input 
                type="text"
                value={eventForm.location}
                onChange={(e) => setEventForm({...eventForm, location: e.target.value})}
                className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm focus:border-blue-600 outline-none transition-all font-bold"
                required
                placeholder="VENUE / COORDINATES"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-500 ml-2">Event Description</label>
            <textarea 
              value={eventForm.description}
              onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
              className="w-full bg-black border border-white/10 rounded-2xl p-4 text-sm focus:border-blue-600 outline-none transition-all h-24 font-medium"
              required
              placeholder="EVENT SUMMARY"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-500 ml-2">Event Date</label>
              <CustomCalendar 
                selected={eventForm.date ? new Date(eventForm.date) : undefined}
                onSelect={(date) => setEventForm({...eventForm, date: date.toISOString().split('T')[0]})}
              />
            </div>
            <div className="space-y-2">
              <CustomDropdown 
                label="Status"
                value={eventForm.status}
                onChange={(val) => setEventForm({...eventForm, status: val})}
                className="blue-label"
                options={[
                  { value: 'draft', label: 'DRAFT' },
                  { value: 'published', label: 'PUBLISHED' },
                  { value: 'closed', label: 'CLOSED' }
                ]}
              />
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/5 p-8 md:p-10 rounded-[2.5rem] space-y-8">
          <div className="flex items-center gap-3">
            <Zap size={18} className="text-blue-500" />
            <h3 className="text-xl font-display font-black uppercase tracking-tight italic">Event <span className="text-blue-600">Details</span></h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-blue-500">Pricing & Tiers</h4>
                <button 
                  type="button"
                  onClick={() => setEventForm({
                    ...eventForm,
                    variants: [...eventForm.variants, { name: '', price: '' }]
                  })}
                  className="px-4 py-1.5 bg-blue-600/10 border border-blue-600/20 rounded-full text-[8px] font-black uppercase tracking-widest text-blue-500 hover:bg-blue-600 hover:text-white transition-all"
                >
                  + Add Price Tier
                </button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-500 ml-2">Main Price Range</label>
                  <input 
                    type="text"
                    value={eventForm.price_range}
                    onChange={(e) => setEventForm({...eventForm, price_range: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm focus:border-blue-600 outline-none transition-all font-bold uppercase tracking-tight"
                    placeholder="e.g. RM 50 - RM 150"
                  />
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {eventForm.variants.map((v: any, i: number) => (
                    <div key={i} className="flex gap-2 group animate-in fade-in slide-in-from-left-2 duration-300">
                      <input 
                        type="text"
                        value={v.name}
                        onChange={(e) => {
                          const newV = [...eventForm.variants];
                          newV[i].name = e.target.value;
                          setEventForm({...eventForm, variants: newV});
                        }}
                        placeholder="NAME (e.g. Early Bird)"
                        className="flex-1 bg-black border border-white/5 rounded-xl p-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-blue-500/50"
                      />
                      <input 
                        type="text"
                        value={v.price}
                        onChange={(e) => {
                          const newV = [...eventForm.variants];
                          newV[i].price = e.target.value;
                          setEventForm({...eventForm, variants: newV});
                        }}
                        placeholder="PRICE"
                        className="w-28 bg-black border border-white/5 rounded-xl p-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-blue-500/50 text-right"
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          const newV = [...eventForm.variants];
                          newV.splice(i, 1);
                          setEventForm({...eventForm, variants: newV});
                        }}
                        className="w-12 flex items-center justify-center text-white/10 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-blue-500">Event Category</h4>
              <div className="grid grid-cols-2 gap-2">
                {['Running', 'Cycling', 'Trail', 'Ultra', 'Triathlon'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => { playTap(); setEventForm({...eventForm, category: cat}); }}
                    className={`
                      px-4 py-4 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all
                      ${eventForm.category === cat 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.2)] scale-[1.02]' 
                        : 'bg-black/40 border-white/5 text-white/30 hover:border-white/20'}
                    `}
                  >
                    {cat}
                  </button>
                ))}
                <input 
                  type="text"
                  value={['Running', 'Cycling', 'Trail', 'Ultra', 'Triathlon'].includes(eventForm.category) ? '' : eventForm.category}
                  onChange={(e) => setEventForm({...eventForm, category: e.target.value})}
                  placeholder="OTHER..."
                  className={`
                    px-4 py-4 rounded-xl border text-[9px] font-black uppercase tracking-widest outline-none transition-all
                    ${!['Running', 'Cycling', 'Trail', 'Ultra', 'Triathlon'].includes(eventForm.category) && eventForm.category !== ''
                      ? 'bg-blue-600 border-blue-600 text-white placeholder:text-white/50 shadow-[0_0_20px_rgba(37,99,235,0.2)] scale-[1.02]' 
                      : 'bg-black/40 border-white/5 text-white/30 placeholder:text-white/10 focus:border-white/20'}
                  `}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/5 p-8 md:p-10 rounded-[2.5rem] space-y-6">
          <div className="flex items-center gap-3">
            <Settings size={18} className="text-blue-500" />
            <h3 className="text-xl font-display font-black uppercase tracking-tight italic">Registration <span className="text-blue-600">Form</span></h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-blue-500 border-b border-blue-500/10 pb-3">Payment Information</h4>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(eventForm.registration_config.billing).map(([key, value]) => (
                  <button 
                    key={key} 
                    type="button"
                    onClick={() => setEventForm({
                      ...eventForm,
                      registration_config: {
                        ...eventForm.registration_config,
                        billing: { ...eventForm.registration_config.billing, [key]: !value }
                      }
                    })}
                    className="flex items-center justify-between group p-4 bg-black/40 rounded-2xl border border-white/5 hover:border-blue-600/30 transition-all text-left"
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${value ? 'bg-blue-600 border-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.3)]' : 'border-white/10 bg-white/5'}`}>
                      {value ? <Check size={12} className="text-white stroke-[4]" /> : null}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-blue-500 border-b border-blue-500/10 pb-3">Participant Details</h4>
              <div className="grid grid-cols-1 gap-2 max-h-[440px] overflow-y-auto pr-2 custom-scrollbar">
                {Object.entries(eventForm.registration_config.attendee).map(([key, value]) => (
                  <button 
                    key={key} 
                    type="button"
                    onClick={() => setEventForm({
                      ...eventForm,
                      registration_config: {
                        ...eventForm.registration_config,
                        attendee: { ...eventForm.registration_config.attendee, [key]: !value }
                      }
                    })}
                    className="flex items-center justify-between group p-4 bg-black/40 rounded-2xl border border-white/5 hover:border-blue-600/30 transition-all text-left"
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${value ? 'bg-blue-600 border-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.3)]' : 'border-white/10 bg-white/5'}`}>
                      {value ? <Check size={12} className="text-white stroke-[4]" /> : null}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Tactical Action Sidebar */}
      <div className="space-y-6">
        <div className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] space-y-6 sticky top-0">
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-500 ml-2">Event Asset</label>
            <div className="aspect-video bg-black border border-white/10 rounded-2xl overflow-hidden group relative">
              <img src={eventForm.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Preview" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                 <label className="bg-white text-black px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-blue-600 hover:text-white transition-all">
                   Update
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                 </label>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
             <button 
              onClick={() => { playTap(); handleSaveEvent(new Event('click') as any); }}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-2xl shadow-blue-600/20 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
              Deploy Event
            </button>
            <button 
              onClick={() => { playTap(); navigate('/events'); }}
              className="w-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white p-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all"
            >
              Abort Operation
            </button>
          </div>

          <div className="p-6 bg-blue-600/5 border border-blue-500/10 rounded-2xl">
            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-blue-500/60 leading-relaxed">
              Notice: Changes committed to the registry are live. Ensure all event coordinates and intake protocols are verified before syncing.
            </p>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

// --- Main Dashboard Layout ---

export default function OrganizerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotification();
  const [events, setEvents] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [stats, setStats] = useState({ events: 0, athletes: 0, revenue: 0 });

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    category: 'Running',
    price_range: '',
    variants: [] as any[],
    status: 'draft',
    image_url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5',
    registration_config: {
      billing: { first_name: true, phone: true, email: true, persons_count: true, country: true, town_city: true, postcode: true },
      attendee: { full_name: true, bib_name: false, email: true, phone: true, gender: true, ic_passport: true, dob: true, age: true, address: false, postcode: false, country: false, category_age: true, medical_status: false, medical_details: false, emergency_name: true, emergency_phone: true }
    }
  });

  useEffect(() => {
    fetchOrganizerData();
  }, []);

  const fetchOrganizerData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('organizer_id', user.id)
        .order('created_at', { ascending: false });

      if (eventsError) throw eventsError;
      setEvents(eventsData || []);
      setUserProfile({ id: user.id });
      
      const eventIds = eventsData?.map(e => e.id) || [];
      if (eventIds.length > 0) {
        const { data: regData, error: regError } = await supabase
          .from('registrations')
          .select(`
            *,
            events (title),
            profiles (full_name, email)
          `)
          .in('event_id', eventIds)
          .order('created_at', { ascending: false });
          
        if (!regError) {
          setRegistrations(regData || []);
          setStats({
            events: eventsData?.length || 0,
            athletes: regData?.length || 0,
            revenue: 0
          });
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('banners').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('banners').getPublicUrl(fileName);
      setEventForm({ ...eventForm, image_url: publicUrl });
      showNotification('Banner Uploaded', 'success');
    } catch (err: any) {
      showNotification('Upload Failed: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const payload = { 
        title: eventForm.title,
        description: eventForm.description,
        location: eventForm.location,
        date: eventForm.date,
        category: eventForm.category,
        price_range: eventForm.price_range,
        status: eventForm.status,
        organizer_id: user?.id,
        image_url: eventForm.image_url,
        registration_config: eventForm.registration_config
      };
      
      const { data, error } = await supabase
        .from('events')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      
      // Save variants properly
      if (eventForm.variants && eventForm.variants.length > 0) {
        const variantsWithEvent = eventForm.variants
          .filter(v => v.name && v.price)
          .map(v => ({ 
            name: v.name, 
            price: parseFloat(v.price) || 0, 
            event_id: data.id 
          }));
          
        if (variantsWithEvent.length > 0) {
          const { error: variantError } = await supabase
            .from('event_variants')
            .insert(variantsWithEvent);
          if (variantError) throw variantError;
        }
      }
      
      showNotification('Event Created', 'success');
      fetchOrganizerData();
      navigate('/events');
    } catch (err: any) {
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('PROTOCOL: Are you sure you want to delete this event?')) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
      showNotification('Event Purged', 'success');
      fetchOrganizerData();
    } catch (err: any) {
      showNotification('Purge Failed: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const startCreate = () => {
    setEventForm({
      title: '',
      description: '',
      location: '',
      date: '',
      category: 'Running',
      price_range: '',
      variants: [],
      status: 'draft',
      image_url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5',
      registration_config: {
        billing: { first_name: true, phone: true, email: true, persons_count: true, country: true, town_city: true, postcode: true },
        attendee: { full_name: true, bib_name: false, email: true, phone: true, gender: true, ic_passport: true, dob: true, age: true, address: false, postcode: false, country: false, category_age: true, medical_status: false, medical_details: false, emergency_name: true, emergency_phone: true }
      }
    });
    playTap();
    navigate('/events/new');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex organizer-hub overflow-hidden">
      <aside className="w-64 bg-blue-950/10 border-r border-blue-500/10 flex flex-col p-6 relative shrink-0">
        <div className="mb-12 flex flex-col items-center text-center">
          <img 
            src="https://www.timetrack.asia/wp-content/uploads/2024/12/TIme-Track-logo-01-2-2048x542.png" 
            alt="Time Track"
            className="h-9 w-auto grayscale invert opacity-80 mb-6"
          />
          <div className="space-y-1.5">
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-600 leading-none">Organizer Panel</h2>
            <div className="flex items-center justify-center gap-2">
              <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
              <p className="text-white/20 text-[7px] font-black uppercase tracking-[0.2em]">Operational Hub</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { path: '/overview', label: 'Overview', icon: LayoutDashboard },
            { path: '/events', label: 'My Events', icon: Calendar },
            { path: '/registrations', label: 'Registrations', icon: Users },
            { path: '/export', label: 'Export', icon: FileDown },
            { path: '/analytics', label: 'Analytics', icon: BarChart3 },
          ].map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => playTap()}
              className={({ isActive }) => `w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all group ${
                isActive ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30 translate-x-1' : 'text-blue-500/40 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button onClick={handleLogout} className="mt-auto flex items-center gap-3 px-5 py-4 text-blue-900 hover:text-red-500 transition-colors text-[10px] font-black uppercase tracking-widest group">
          <LogOut size={16} />
          Sign Out
        </button>
      </aside>

      <main className="flex-1 h-screen overflow-y-auto p-8 md:p-12 relative">
        <div className="absolute top-0 right-0 p-10 opacity-[0.01] pointer-events-none"><Globe size={400} /></div>
        
        <Routes>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route path="/overview" element={<Overview stats={stats} startCreate={startCreate} />} />
          <Route path="/events" element={<Events events={events} loading={loading} startCreate={startCreate} handleDeleteEvent={handleDeleteEvent} />} />
          <Route path="/events/new" element={<EventForge eventForm={eventForm} setEventForm={setEventForm} handleSaveEvent={handleSaveEvent} handleFileUpload={handleFileUpload} loading={loading} navigate={navigate} />} />
          <Route path="/registrations" element={<Registrations registrations={registrations} loading={loading} />} />
          <Route path="/export" element={<Export />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </main>
    </div>
  );
}
