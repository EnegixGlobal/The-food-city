"use client";

import React, { useState } from 'react';
import { FaRupeeSign, FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { FiClock } from 'react-icons/fi';

const ProductsPage = () => {
  const [activeTab, setActiveTab] = useState('Indian');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    prepTime: '',
    veg: true,
    available: true
  });

  // Sample product data organized by category
  const categories = {
    Indian: [
      {
        id: 'IND-001',
        name: 'Butter Chicken',
        description: 'Tender chicken in rich tomato butter gravy',
        price: 249,
        prepTime: '20 mins',
        veg: false,
        available: true
      },
      {
        id: 'IND-002',
        name: 'Paneer Tikka',
        description: 'Grilled cottage cheese with spices',
        price: 199,
        prepTime: '15 mins',
        veg: true,
        available: true
      }
    ],
    'South Indian': [
      {
        id: 'SI-001',
        name: 'Masala Dosa',
        description: 'Crispy rice crepe with spiced potato',
        price: 129,
        prepTime: '10 mins',
        veg: true,
        available: true
      }
    ],
    Chinese: [
      {
        id: 'CHN-001',
        name: 'Veg Manchurian',
        description: 'Fried vegetable balls in tangy sauce',
        price: 179,
        prepTime: '15 mins',
        veg: true,
        available: true
      }
    ],
    Tandoor: [
      {
        id: 'TAN-001',
        name: 'Tandoori Chicken',
        description: 'Chicken marinated in yogurt & spices',
        price: 299,
        prepTime: '30 mins',
        veg: false,
        available: true
      }
    ]
  };

  const filteredItems = categories[activeTab as keyof typeof categories].filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availabilityBadge = (available: boolean) => (
    <span className={`px-2 py-1 rounded-full text-xs ${available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
      {available ? 'Available' : 'Unavailable'}
    </span>
  );

  const vegNonVegBadge = (veg: boolean) => (
    <span className={`w-4 h-4 rounded-full border ${veg ? 'bg-green-500 border-green-600' : 'bg-red-500 border-red-600'}`}></span>
  );

  const handleAddProduct = () => {
    // Add your logic to save the new product here
    console.log('Adding new product:', newProduct);
    setShowAddForm(false);
    setNewProduct({
      name: '',
      description: '',
      price: '',
      prepTime: '',
      veg: true,
      available: true
    });
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Menu Management</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-grow">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search menu items..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-900 text-white rounded-lg hover:bg-red-800"
            onClick={() => setShowAddForm(true)}
          >
            <FaPlus /> Add Item
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {Object.keys(categories).map((category) => (
            <button
              key={category}
              onClick={() => setActiveTab(category)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === category
                  ? 'border-red-900 text-red-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {category} ({categories[category as keyof typeof categories].length})
            </button>
          ))}
        </nav>
      </div>

      {/* Add Product Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New {activeTab} Item</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={newProduct.prepTime}
                    onChange={(e) => setNewProduct({...newProduct, prepTime: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="veg"
                    checked={newProduct.veg}
                    onChange={(e) => setNewProduct({...newProduct, veg: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="veg">Vegetarian</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="available"
                    checked={newProduct.available}
                    onChange={(e) => setNewProduct({...newProduct, available: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="available">Available</label>
                </div>
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
                onClick={handleAddProduct}
                className="px-4 py-2 bg-red-900 text-white rounded hover:bg-red-800"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prep Time</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate">{item.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {vegNonVegBadge(item.veg)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        <FaRupeeSign className="text-gray-500 mr-1" size={12} />
                        {item.price.toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <FiClock className="mr-1" size={14} />
                        {item.prepTime}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {availabilityBadge(item.available)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-red-900 hover:text-red-700 mr-3">
                        <FaEdit />
                      </button>
                      <button className="text-gray-500 hover:text-gray-700">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No items found in {activeTab} category
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Total Items</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {Object.values(categories).flat().length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">{activeTab} Items</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {categories[activeTab as keyof typeof categories].length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Veg Items</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {categories[activeTab as keyof typeof categories].filter(item => item.veg).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Avg. Price</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1 flex items-center">
            <FaRupeeSign className="mr-1" size={14} />
            {categories[activeTab as keyof typeof categories].length > 0
              ? Math.round(categories[activeTab as keyof typeof categories].reduce((sum, item) => sum + item.price, 0) / categories[activeTab as keyof typeof categories].length)
              : 0}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;