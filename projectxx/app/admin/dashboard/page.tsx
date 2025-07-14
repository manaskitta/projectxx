"use client";
import React, { useEffect, useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { ShieldCheckIcon, BuildingStorefrontIcon, UserGroupIcon, MapPinIcon } from '@heroicons/react/24/solid';

interface Warehouse {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  walmartEmployees?: Employee[];
}

interface Employee {
  id: string;
  name: string;
  position: string;
  user: { email: string };
}

export default function AdminDashboard() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selected, setSelected] = useState<Warehouse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [unassignedEmployees, setUnassignedEmployees] = useState<Employee[]>([]);
  const [newWarehouse, setNewWarehouse] = useState({ name: '', latitude: '', longitude: '', employeeIds: [] as string[] });
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [addStep, setAddStep] = useState(1);

  const MapPicker = dynamic(() => import('../../register/MapPicker'), { ssr: false });

  const fetchUnassignedEmployees = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const res = await fetch('http://localhost:4000/api/warehouse/unassigned-employees', {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      credentials: 'include',
    });
    if (res.ok) {
      setUnassignedEmployees(await res.json());
    }
  };

  const handleAddWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError('');
    if (lat === null || lng === null) {
      setAddError('Please select a location on the map.');
      setAddLoading(false);
      return;
    }
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const res = await fetch('http://localhost:4000/api/warehouse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      body: JSON.stringify({
        name: newWarehouse.name,
        latitude: lat,
        longitude: lng,
        employeeIds: newWarehouse.employeeIds,
      }),
    });
    setAddLoading(false);
    if (res.ok) {
      setShowAddModal(false);
      setNewWarehouse({ name: '', latitude: '', longitude: '', employeeIds: [] });
      setLat(null); setLng(null);
      setAddError('');
      // Refresh warehouses
      fetch('http://localhost:4000/api/warehouse')
        .then(res => res.json())
        .then(data => setWarehouses(data));
    } else {
      setAddError('Failed to add warehouse');
    }
  };

  const openAddModal = () => {
    setShowAddModal(true);
    setAddStep(1);
    setNewWarehouse({ name: '', latitude: '', longitude: '', employeeIds: [] });
    setLat(null); setLng(null);
    setAddError('');
  };

  useEffect(() => {
    fetch('http://localhost:4000/api/warehouse')
      .then(res => res.json())
      .then(data => {
        setWarehouses(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load warehouses');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (showAddModal && addStep === 3) {
      fetchUnassignedEmployees();
    }
  }, [showAddModal, addStep]);

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="min-h-screen w-full bg-gradient-to-br from-purple-100 via-blue-50 to-white flex flex-col items-center justify-start px-4 py-8 relative overflow-hidden">
        {/* Decorative background shapes */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-200 rounded-full opacity-30 blur-2xl -z-10" style={{top: '-4rem', left: '-4rem'}} />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-200 rounded-full opacity-30 blur-2xl -z-10" style={{bottom: '-4rem', right: '-4rem'}} />
        {/* Header */}
        <div className="w-full max-w-3xl bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl p-0 mb-8 border border-purple-100 flex flex-col items-center animate-fade-in-up">
          <div className="flex flex-col items-center justify-center bg-gradient-to-r from-purple-600 to-blue-500 p-6 w-full rounded-t-3xl">
            <ShieldCheckIcon className="h-12 w-12 text-white mb-2" />
            <h2 className="text-3xl font-bold text-white mb-1 tracking-wide">Admin Dashboard</h2>
            <span className="text-white/80 text-sm">Manage Warehouses & Employees</span>
          </div>
        </div>
        {/* Add Warehouse Button */}
        <button
          className="mb-8 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl shadow font-bold text-lg transition"
          onClick={openAddModal}
        >
          + Add Warehouse
        </button>
        {/* Add Warehouse Modal */}
        {showAddModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-2xl w-full max-w-lg relative border border-purple-100">
              <button className="absolute top-2 right-4 text-gray-500 text-2xl font-bold hover:text-gray-700" onClick={() => setShowAddModal(false)}>&times;</button>
              <h3 className="text-2xl font-bold mb-6 text-purple-700 flex items-center gap-2"><BuildingStorefrontIcon className="h-7 w-7 text-purple-400" /> Add New Warehouse</h3>
              {/* Stepper */}
              <div className="flex justify-between mb-6">
                <div className={`flex-1 flex flex-col items-center ${addStep >= 1 ? 'text-purple-700' : 'text-gray-400'}`}>1<div className="w-2 h-2 rounded-full bg-current mt-1" /></div>
                <div className={`flex-1 flex flex-col items-center ${addStep >= 2 ? 'text-purple-700' : 'text-gray-400'}`}>2<div className="w-2 h-2 rounded-full bg-current mt-1" /></div>
                <div className={`flex-1 flex flex-col items-center ${addStep === 3 ? 'text-purple-700' : 'text-gray-400'}`}>3<div className="w-2 h-2 rounded-full bg-current mt-1" /></div>
              </div>
              <form onSubmit={handleAddWarehouse} className="space-y-6">
                {addStep === 1 && (
                  <>
                    <input
                      type="text"
                      placeholder="Warehouse Name"
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                      value={newWarehouse.name}
                      onChange={e => setNewWarehouse({ ...newWarehouse, name: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition"
                      onClick={() => setAddStep(2)}
                      disabled={!newWarehouse.name}
                    >
                      Next: Set Location
                    </button>
                  </>
                )}
                {addStep === 2 && (
                  <>
                    <label className="block font-semibold mb-1 flex items-center gap-2"><MapPinIcon className="h-5 w-5 text-blue-400" />Select Location</label>
                    <MapPicker lat={lat} lng={lng} setLat={setLat} setLng={setLng} />
                    {lat !== null && lng !== null && (
                      <div className="mt-2 text-sm text-gray-700">Selected: {lat.toFixed(5)}, {lng.toFixed(5)}</div>
                    )}
                    <div className="flex gap-2 mt-4">
                      <button
                        type="button"
                        className="flex-1 bg-gray-300 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-400 transition"
                        onClick={() => setAddStep(1)}
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition"
                        onClick={() => lat !== null && lng !== null && setAddStep(3)}
                        disabled={lat === null || lng === null}
                      >
                        Next: Assign Employees
                      </button>
                    </div>
                  </>
                )}
                {addStep === 3 && (
                  <>
                    <label className="block font-semibold mb-1 flex items-center gap-2"><UserGroupIcon className="h-5 w-5 text-green-400" />Assign Employees</label>
                    <div className="flex gap-4">
                      {/* Unassigned Employees List */}
                      <div className="flex-1">
                        <div className="font-semibold mb-2">Unassigned</div>
                        <ul className="border rounded-xl h-48 overflow-y-auto bg-gray-50">
                          {unassignedEmployees.filter(emp => !newWarehouse.employeeIds.includes(emp.id)).map(emp => (
                            <li
                              key={emp.id}
                              className="px-3 py-2 cursor-pointer hover:bg-blue-100 rounded"
                              onClick={() => setNewWarehouse({ ...newWarehouse, employeeIds: [...newWarehouse.employeeIds, emp.id] })}
                            >
                              {emp.name} ({emp.user.email})
                            </li>
                          ))}
                        </ul>
                      </div>
                      {/* Assigned Employees List */}
                      <div className="flex-1">
                        <div className="font-semibold mb-2">To Add</div>
                        <ul className="border rounded-xl h-48 overflow-y-auto bg-green-50">
                          {unassignedEmployees.filter(emp => newWarehouse.employeeIds.includes(emp.id)).map(emp => (
                            <li
                              key={emp.id}
                              className="px-3 py-2 cursor-pointer hover:bg-green-100 rounded"
                              onClick={() => setNewWarehouse({ ...newWarehouse, employeeIds: newWarehouse.employeeIds.filter(id => id !== emp.id) })}
                            >
                              {emp.name} ({emp.user.email})
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        type="button"
                        className="flex-1 bg-gray-300 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-400 transition"
                        onClick={() => setAddStep(2)}
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition"
                        disabled={addLoading}
                      >
                        {addLoading ? 'Adding...' : 'Add Warehouse'}
                      </button>
                    </div>
                  </>
                )}
                {addError && <div className="text-red-500 text-sm text-center">{addError}</div>}
              </form>
            </div>
          </div>
        )}
        {/* Warehouse List */}
        {loading ? (
          <div className="text-gray-600">Loading warehouses...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
            {warehouses.map(wh => (
              <div
                key={wh.id}
                className={`cursor-pointer bg-white/70 backdrop-blur-lg hover:bg-blue-100 rounded-2xl shadow-lg p-6 transition border-2 ${selected?.id === wh.id ? 'border-blue-600' : 'border-transparent'}`}
                onClick={() => setSelected(wh)}
              >
                <div className="flex items-center gap-3 mb-2">
                  <BuildingStorefrontIcon className="h-7 w-7 text-blue-400" />
                  <h3 className="text-xl font-semibold text-blue-900">{wh.name}</h3>
                </div>
                <div className="flex items-center gap-2 text-gray-600"><MapPinIcon className="h-5 w-5" />Lat: {wh.latitude}, Lng: {wh.longitude}</div>
              </div>
            ))}
          </div>
        )}
        {/* Warehouse Details */}
        {selected && (
          <div className="mt-10 w-full max-w-2xl bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-blue-200 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-4">
              <BuildingStorefrontIcon className="h-8 w-8 text-blue-400" />
              <h3 className="text-2xl font-bold text-blue-800">{selected.name} Details</h3>
            </div>
            <div className="mb-2 flex items-center gap-2 text-gray-700"><MapPinIcon className="h-5 w-5" />Location: <span className="font-mono">{selected.latitude}, {selected.longitude}</span></div>
            <div className="mb-4">
              <span className="font-semibold text-gray-800 flex items-center gap-2"><UserGroupIcon className="h-5 w-5 text-green-400" />Employees:</span>
              {selected.walmartEmployees && selected.walmartEmployees.length > 0 ? (
                <ul className="list-disc ml-8 mt-1">
                  {selected.walmartEmployees.map(emp => (
                    <li key={emp.id} className="text-gray-700">
                      {emp.name} ({emp.user?.email})
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-gray-500 ml-2">No employees assigned</span>
              )}
            </div>
            <div>
              <span className="font-semibold text-gray-800">Inventory:</span>
              <span className="text-gray-500 ml-2">(Coming soon)</span>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
} 