"use client";

import React, { useState } from 'react';
import { FaRupeeSign, FaPlus, FaEdit, FaTrash, FaPercentage, FaCalendarAlt, FaTicketAlt } from 'react-icons/fa';
import { FiCheckCircle } from 'react-icons/fi';

interface Offer {
  id: string;
  title: string;
  code: string;
  discount: number;
  type: string;
  minOrder: number;
  redeemed: number;
  validUntil: string;
  active: boolean;
}

const OffersPage = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newOffer, setNewOffer] = useState({
    title: '',
    code: '',
    discount: '',
    type: 'percentage',
    minOrder: '',
    validUntil: '',
    active: true
  });

  // Sample offers data
  const offers = [
    {
      id: 'OFF-001',
      title: 'Weekend Special',
      code: 'WEEKEND20',
      discount: 20,
      type: 'percentage',
      minOrder: 299,
      redeemed: 142,
      validUntil: '2023-12-31',
      active: true
    },
    {
      id: 'OFF-002',
      title: 'First Order',
      code: 'NEW50',
      discount: 50,
      type: 'flat',
      minOrder: 199,
      redeemed: 89,
      validUntil: '2023-12-15',
      active: true
    },
    {
      id: 'OFF-003',
      title: 'Tandoori Lovers',
      code: 'TANDOOR100',
      discount: 100,
      type: 'flat',
      minOrder: 499,
      redeemed: 56,
      validUntil: '2023-11-30',
      active: false
    }
  ];

  const handleAddOffer = () => {
    // Add your logic to save the new offer here
    console.log('Adding new offer:', newOffer);
    setShowAddForm(false);
    setNewOffer({
      title: '',
      code: '',
      discount: '',
      type: 'percentage',
      minOrder: '',
      validUntil: '',
      active: true
    });
  };

  const statusBadge = (active: boolean) => (
    <span className={`px-2 py-1 rounded-full text-xs flex items-center ${active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
      {active ? (
        <>
          <FiCheckCircle className="mr-1" /> Active
        </>
      ) : 'Inactive'}
    </span>
  );

  const discountDisplay = (offer: Offer) => (
    <div className="flex items-center">
      {offer.type === 'percentage' ? (
        <>
          <FaPercentage className="text-gray-500 mr-1" size={12} />
          <span className="font-medium">{offer.discount}%</span>
        </>
      ) : (
        <>
          <FaRupeeSign className="text-gray-500 mr-1" size={12} />
          <span className="font-medium">{offer.discount}</span>
        </>
      )}
    </div>
  );

  return (
    <div className="">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Offers & Promotions</h1>
          <p className="text-sm text-gray-500 mt-1">Manage discounts and promotional campaigns</p>
        </div>
        
        <button 
          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-900 text-white rounded-lg hover:bg-red-800 mt-4 md:mt-0"
          onClick={() => setShowAddForm(true)}
        >
          <FaPlus /> Create Offer
        </button>
      </div>

      {/* Add Offer Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Offer</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Offer Title</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newOffer.title}
                  onChange={(e) => setNewOffer({...newOffer, title: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Promo Code</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={newOffer.code}
                    onChange={(e) => setNewOffer({...newOffer, code: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded"
                    value={newOffer.type}
                    onChange={(e) => setNewOffer({...newOffer, type: e.target.value})}
                  >
                    <option value="percentage">Percentage</option>
                    <option value="flat">Flat Amount</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {newOffer.type === 'percentage' ? 'Discount %' : 'Discount Amount (₹)'}
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={newOffer.discount}
                    onChange={(e) => setNewOffer({...newOffer, discount: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min. Order (₹)</label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={newOffer.minOrder}
                    onChange={(e) => setNewOffer({...newOffer, minOrder: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="date"
                    className="w-full pl-10 p-2 border border-gray-300 rounded"
                    value={newOffer.validUntil}
                    onChange={(e) => setNewOffer({...newOffer, validUntil: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={newOffer.active}
                  onChange={(e) => setNewOffer({...newOffer, active: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="active">Activate this offer immediately</label>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddOffer}
                className="px-4 py-2 bg-red-900 text-white rounded hover:bg-red-800"
              >
                Create Offer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer) => (
          <div key={offer.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{offer.title}</h3>
                  <div className="flex items-center mt-1">
                    <FaTicketAlt className="text-red-900 mr-2" />
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">{offer.code}</span>
                  </div>
                </div>
                {statusBadge(offer.active)}
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Discount</p>
                  <p className="text-lg font-medium mt-1">
                    {discountDisplay(offer)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Min. Order</p>
                  <p className="text-lg font-medium mt-1 flex items-center">
                    <FaRupeeSign className="mr-1" size={12} />
                    {offer.minOrder}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Redeemed</p>
                  <p className="text-lg font-medium mt-1">
                    {offer.redeemed} times
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Valid Until</p>
                  <p className="text-lg font-medium mt-1 flex items-center">
                    <FaCalendarAlt className="mr-1 text-gray-400" size={14} />
                    {new Date(offer.validUntil).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end space-x-2">
                <button className="text-red-900 hover:text-red-700 p-2">
                  <FaEdit />
                </button>
                <button className="text-gray-500 hover:text-gray-700 p-2">
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Total Offers</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{offers.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Active Offers</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {offers.filter(o => o.active).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Total Redeemed</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {offers.reduce((sum, offer) => sum + offer.redeemed, 0)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Avg. Discount</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {offers.length > 0 
              ? Math.round(offers.reduce((sum, offer) => sum + offer.discount, 0) / offers.length)
              : 0}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default OffersPage;