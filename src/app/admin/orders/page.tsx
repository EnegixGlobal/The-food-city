import React from 'react';
import { FaRupeeSign, FaSearch, FaFilter, FaPrint, FaFileExport } from 'react-icons/fa';
import { FiClock, FiCheckCircle, FiTruck, FiXCircle } from 'react-icons/fi';

const OrdersPage = () => {
  // Sample order data
  const orders = [
    {
      id: '#ORD-7894',
      customer: 'Rahul Sharma',
      items: 3,
      amount: 549,
      status: 'Delivered',
      time: '35 mins',
      address: '12, MG Road, Bangalore',
      payment: 'Paid (UPI)'
    },
    {
      id: '#ORD-7893',
      customer: 'Priya Patel',
      items: 5,
      amount: 892,
      status: 'On the way',
      time: '22 mins',
      address: '45, Koramangala, Bangalore',
      payment: 'Paid (Credit Card)'
    },
    {
      id: '#ORD-7892',
      customer: 'Arjun Singh',
      items: 2,
      amount: 325,
      status: 'Preparing',
      time: '15 mins',
      address: '78, Indiranagar, Bangalore',
      payment: 'Pending'
    },
    {
      id: '#ORD-7891',
      customer: 'Neha Gupta',
      items: 4,
      amount: 689,
      status: 'Delivered',
      time: '42 mins',
      address: '33, Whitefield, Bangalore',
      payment: 'Paid (Cash)'
    },
    {
      id: '#ORD-7890',
      customer: 'Vikram Joshi',
      items: 1,
      amount: 199,
      status: 'Cancelled',
      time: 'N/A',
      address: '90, Jayanagar, Bangalore',
      payment: 'Refunded'
    },
  ];

  const statusBadge = (status: string) => {
    switch(status) {
      case 'Delivered':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center"><FiCheckCircle className="mr-1" /> {status}</span>;
      case 'On the way':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center"><FiTruck className="mr-1" /> {status}</span>;
      case 'Preparing':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs flex items-center"><FiClock className="mr-1" /> {status}</span>;
      case 'Cancelled':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs flex items-center"><FiXCircle className="mr-1" /> {status}</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">{status}</span>;
    }
  };

  return (
    <div className="">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Order Management</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-grow">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 w-full"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <FaFilter /> Filter
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <FaFileExport /> Export
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-900">{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.customer}</div>
                    <div className="text-xs text-gray-500">{order.address}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.items} items</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex items-center">
                      <FaRupeeSign className="text-gray-500 mr-1" size={12} />
                      {order.amount.toLocaleString('en-IN')}
                    </div>
                    <div className="text-xs text-gray-500">{order.payment}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {statusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-red-900 hover:text-red-700 mr-3">View</button>
                    <button className="text-gray-500 hover:text-gray-700">
                      <FaPrint />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-500">
          Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of <span className="font-medium">24</span> orders
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

export default OrdersPage;
