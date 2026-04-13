import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { 
  Search as SearchIcon, 
  User, 
  Users, 
  Pill, 
  FileText, 
  ChevronRight,
  Activity
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Search() {
  const { token } = useAuth();
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q') || '';
  const [results, setResults] = useState<any>({ patients: [], doctors: [], medicines: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query) {
      fetchResults();
    }
  }, [query]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      // Simple search across multiple endpoints
      const [patientsRes, doctorsRes, medicinesRes] = await Promise.all([
        fetch(`/api/patients`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/doctors`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/medicines?q=${query}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const patients = await patientsRes.json();
      const doctors = await doctorsRes.json();
      const medicines = await medicinesRes.json();

      setResults({
        patients: patients.filter((p: any) => p.name.toLowerCase().includes(query.toLowerCase())),
        doctors: doctors.filter((d: any) => d.name.toLowerCase().includes(query.toLowerCase())),
        medicines: medicines // Already filtered by backend
      });
    } catch (err) {
      console.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const totalResults = results.patients.length + results.doctors.length + results.medicines.length;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white">Search Results</h1>
        <p className="text-gray-500 font-medium">
          {loading ? 'Searching...' : `Found ${totalResults} results for "${query}"`}
        </p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Scanning Database...</p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Patients Section */}
          {results.patients.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-500" />
                <h2 className="text-xl font-bold text-white uppercase tracking-widest">Patients</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.patients.map((p: any) => (
                  <Link key={p._id} to="/patients" className="bg-white/2 p-6 rounded-3xl border border-white/5 hover:bg-white/5 transition-all group flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-400 font-bold">
                        {p.name[0]}
                      </div>
                      <div>
                        <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">{p.name}</h3>
                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{p.type}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-white transition-colors" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Doctors Section */}
          {results.doctors.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-purple-500" />
                <h2 className="text-xl font-bold text-white uppercase tracking-widest">Doctors</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.doctors.map((d: any) => (
                  <Link key={d._id} to="/doctors" className="bg-white/2 p-6 rounded-3xl border border-white/5 hover:bg-white/5 transition-all group flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-purple-600/10 flex items-center justify-center text-purple-400 font-bold">
                        {d.name[0]}
                      </div>
                      <div>
                        <h3 className="font-bold text-white group-hover:text-purple-400 transition-colors">{d.name}</h3>
                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{d.specialization}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-white transition-colors" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Medicines Section */}
          {results.medicines.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <Pill className="w-5 h-5 text-green-500" />
                <h2 className="text-xl font-bold text-white uppercase tracking-widest">Pharmacy</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.medicines.map((m: any) => (
                  <Link key={m._id} to="/pharmacy" className="bg-white/2 p-6 rounded-3xl border border-white/5 hover:bg-white/5 transition-all group flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-green-600/10 flex items-center justify-center text-green-400 font-bold">
                        <Pill className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white group-hover:text-green-400 transition-colors">{m.brand_name}</h3>
                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{m.generic_name}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-white transition-colors" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {totalResults === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-gray-700 mb-6">
                <SearchIcon className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No results found</h3>
              <p className="text-gray-500 max-w-md">We couldn't find anything matching "{query}". Try searching for patients, doctors, or medicines.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
