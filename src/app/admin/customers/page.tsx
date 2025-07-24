import React from 'react';
import { FaRupeeSign, FaSearch, FaFilter, FaUserEdit, FaPhoneAlt, FaRegStar, FaStar } from 'react-icons/fa';
import {  FiCheckCircle, FiXCircle } from 'react-icons/fi';

const CustomersPage = () => {
  // Sample customer data
  const customers = [
    {
      id: 'CUST-7894',
      name: 'Rahul Sharma',
      phone: '+91 98765 43210',
      orders: 12,
      spent: 5490,
      lastOrder: '2 hours ago',
      status: 'Active',
      favorite: true
    },
    {
      id: 'CUST-7893',
      name: 'Priya Patel',
      phone: '+91 87654 32109',
      orders: 8,
      spent: 3920,
      lastOrder: '1 day ago',
      status: 'Active',
      favorite: false
    },
    {
      id: 'CUST-7892',
      name: 'Arjun Singh',
      phone: '+91 76543 21098',
      orders: 5,
      spent: 1825,
      lastOrder: '3 days ago',
      status: 'Active',
      favorite: true
    },
    {
      id: 'CUST-7891',
      name: 'Neha Gupta',
      phone: '+91 65432 10987',
      orders: 15,
      spent: 8690,
      lastOrder: '5 hours ago',
      status: 'Active',
      favorite: false
    },
    {
      id: 'CUST-7890',
      name: 'Vikram Joshi',
      phone: '+91 54321 09876',
      orders: 2,
      spent: 598,
      lastOrder: '2 weeks ago',
      status: 'Inactive',
      favorite: false
    },
  ];

  const statusBadge = (status: string) => {
    switch(status) {
      case 'Active':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center"><FiCheckCircle className="mr-1" /> {status}</span>;
      case 'Inactive':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs flex items-center"><FiXCircle className="mr-1" /> {status}</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">{status}</span>;
    }
  };

  return (
    <div >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Customer Management</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-grow">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 w-full"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <FaFilter /> Filter
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-red-900 text-white rounded-lg hover:bg-red-800">
            + Add Customer
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Order</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map((customer, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-red-100 rounded-full flex items-center justify-center text-red-900 font-medium">
                        {customer.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          {customer.name}
                          {customer.favorite ? (
                            <FaStar className="ml-2 text-yellow-400" size={14} />
                          ) : (
                            <FaRegStar className="ml-2 text-gray-300" size={14} />
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{customer.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <FaPhoneAlt className="mr-2 text-gray-400" />
                      {customer.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {customer.orders}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex items-center">
                      <FaRupeeSign className="text-gray-500 mr-1" size={12} />
                      {customer.spent.toLocaleString('en-IN')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.lastOrder}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {statusBadge(customer.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-red-900 hover:text-red-700 mr-3 flex items-center">
                      <FaUserEdit className="mr-1" /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Total Customers</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">1,248</p>
          <p className="text-xs text-green-600 mt-1">↑ 12.5% from last month</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Active Customers</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">982</p>
          <p className="text-xs text-green-600 mt-1">↑ 8.3% from last month</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Avg. Orders</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">4.2</p>
          <p className="text-xs text-green-600 mt-1">↑ 1.2% from last month</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Avg. Spend</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1 flex items-center">
            <FaRupeeSign className="mr-1" size={14} /> 1,245
          </p>
          <p className="text-xs text-green-600 mt-1">↑ 5.7% from last month</p>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-500">
          Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of <span className="font-medium">1,248</span> customers
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            Previous
          </button>
          <button className="px-3 py-1 border border-red-900 rounded-md text-sm font-medium text-white bg-red-900 hover:bg-red-800">
            1
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            2
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            3
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomersPage;