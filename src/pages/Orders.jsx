import React, { useState, useEffect } from "react";
import { Package, Search, Filter, Eye, TrendingUp, Clock, CheckCircle, Truck } from "lucide-react";
import { getOrdersByVendorId, updateOrderStatus } from "../services/api.service";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const vendor = JSON.parse(localStorage.getItem("vendor")); // Assuming vendor info stored in localStorage

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await getOrdersByVendorId();
        setOrders(res.data.orders);
        setLoading(false);
      } catch (error) {
        alert("Unable to fetch orders");
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Paid":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "Shipped":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "Completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "Approved":
        return "bg-indigo-100 text-indigo-800 border-indigo-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <Clock className="w-4 h-4" />;
      case "Paid":
        return <CheckCircle className="w-4 h-4" />;
      case "Shipped":
        return <Truck className="w-4 h-4" />;
      case "Completed":
        return <CheckCircle className="w-4 h-4" />;
      case "Approved":
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userId.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "All" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "Pending").length,
    shipped: orders.filter((o) => o.status === "Shipped").length,
    completed: orders.filter((o) => o.status === "Completed").length,
    approved: orders.filter((o) => o.status === "Approved").length,
    revenue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus); // Call API
      setOrders((prev) =>
        prev.map((order) => (order._id === orderId ? { ...order, status: newStatus } : order))
      );
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      alert("Failed to update status");
    }
  };

  // Suspended logic
  if (vendor?.isSuspended) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-600 text-lg">
          Your account is suspended. You cannot view or update orders.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders Management</h1>
          <p className="text-gray-600">Track and manage all your vendor orders</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Package className="w-8 h-8 text-indigo-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Shipped</p>
                <p className="text-2xl font-bold text-gray-900">{stats.shipped}</p>
              </div>
              <Truck className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-indigo-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.revenue.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by order ID, customer name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Shipped">Shipped</option>
                <option value="Completed">Completed</option>
                <option value="Approved">Approved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between">
                  <div className="mb-4 lg:mb-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Order #{order._id}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getStatusColor(order.status)}`}
                    >
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      Customer: {order.userId.name} ({order.userId.email})
                    </p>
                    <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-2xl font-bold text-indigo-600">₹{order.totalAmount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{order.paymentMethod}</p>
                    </div>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" /> Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Order Info */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Order Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Order ID:</span> {selectedOrder._id}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Date:</span> {formatDate(selectedOrder.createdAt)}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Status:</span>{" "}
                      <span
                        className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          selectedOrder.status
                        )}`}
                      >
                        {selectedOrder.status}
                      </span>
                    </p>

                    {/* Status Update Dropdown */}
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleUpdateStatus(selectedOrder._id, e.target.value)}
                      className="mt-2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 w-full"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Completed">Completed</option>
                      <option value="Approved">Approved</option>
                    </select>

                    <p className="text-sm text-gray-500 mt-1">Payment Method: {selectedOrder.paymentMethod}</p>
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Name:</span> {selectedOrder.userId.name}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Email:</span> {selectedOrder.userId.email}
                    </p>
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Shipping Address</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm">{selectedOrder.shippingAddress.name}</p>
                    <p className="text-sm">{selectedOrder.shippingAddress.phone}</p>
                    <p className="text-sm">{selectedOrder.shippingAddress.street}</p>
                    <p className="text-sm">
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} -{" "}
                      {selectedOrder.shippingAddress.zip}
                    </p>
                    <p className="text-sm">{selectedOrder.shippingAddress.country}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg">
                        <img
                          src={item.productId.images[0]}
                          alt={item.productId.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.productId.name}</p>
                          <p className="text-sm text-gray-600">
                            ₹{item.price.toLocaleString()} × {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold text-gray-900">
                          ₹{(item.quantity * item.price).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total Amount</span>
                    <span className="text-2xl font-bold text-indigo-600">
                      ₹{selectedOrder.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
