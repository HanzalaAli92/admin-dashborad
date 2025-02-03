"use client";

import React, { useEffect, useState } from "react";
import { client } from "@/sanity/lib/client";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import Swal from "sweetalert2";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { FaBox, FaShippingFast, FaCheckCircle, FaClock } from "react-icons/fa";

interface Order {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  zipCode: string;
  total: number;
  discount: number;
  orderDate: string;
  status: string | null;
  cartItems: { productName: string; image: string }[];
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [filter] = useState("All");

  useEffect(() => {
    client
      .fetch(
        `*[_type == "order"]{
          _id,
          firstName,
          lastName,
          phone,
          email,
          address,
          city,
          zipCode,
          total,
          discount,
          orderDate,
          status,
          cartItems[]->{
            productName,
            image
          }
        }`
      )
      .then((data) => setOrders(data))
      .catch((error) => console.error("Error fetching orders:", error));
  }, []);

  const filteredOrders =
    filter === "All" ? orders : orders.filter((order) => order.status === filter);

  const toggleOrderDetails = (orderId: string) => {
    setSelectedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const handleDelete = async (orderId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await client.delete(orderId);
      setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId));
      Swal.fire("Deleted!", "Your order has been deleted.", "success");
    } catch (error) {
      console.error("Error deleting order:", error);
      Swal.fire("Error!", "Something went wrong while deleting.", "error");
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await client
        .patch(orderId)
        .set({ status: newStatus })
        .commit();
      
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );

      if (newStatus === "dispatch") {
        Swal.fire("Dispatch", "The order is now dispatched.", "success");
      } else if (newStatus === "success") {
        Swal.fire("Success", "The order has been completed.", "success");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      Swal.fire("Error!", "Something went wrong while updating the status.", "error");
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg p-5">
          <h2 className="text-xl font-bold text-gray-800">Admin Dashboard</h2>
          <ul className="mt-4 space-y-2">
            <li className="p-2 bg-blue-500 text-white rounded-lg">Orders</li>
            <li className="p-2 hover:bg-gray-200 rounded-lg cursor-pointer">Customers</li>
            <li className="p-2 hover:bg-gray-200 rounded-lg cursor-pointer">Reports</li>
          </ul>
        </aside>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-4">
              <FaBox className="text-blue-500 text-2xl" />
              <div>
                <h3 className="text-lg font-semibold">Total Orders</h3>
                <p className="text-gray-600">{orders.length}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-4">
              <FaClock className="text-yellow-500 text-2xl" />
              <div>
                <h3 className="text-lg font-semibold">Pending</h3>
                <p className="text-gray-600">{filteredOrders.filter((order) => order.status === "pending").length}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-4">
              <FaShippingFast className="text-blue-500 text-2xl" />
              <div>
                <h3 className="text-lg font-semibold">Dispatched</h3>
                <p className="text-gray-600">{filteredOrders.filter((order) => order.status === "dispatch").length}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-4">
              <FaCheckCircle className="text-green-500 text-2xl" />
              <div>
                <h3 className="text-lg font-semibold">Completed</h3>
                <p className="text-gray-600">{filteredOrders.filter((order) => order.status === "success").length}</p>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Orders</h2>
            <table className="min-w-full divide-y divide-gray-200 text-sm lg:text-base">
              <thead className="bg-gray-50 text-blue-600">
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Address</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 ">
                {filteredOrders.map((order) => (
                  <React.Fragment key={order._id}>
                    <tr
                      className="cursor-pointer hover:bg-red-100 transition-all text-center pt-7"
                      onClick={() => toggleOrderDetails(order._id)}
                    >
                     
                      <td >{order._id}</td>
                      <td>{order.firstName} {order.lastName}</td>
                      <td>{order.address}</td>
                      <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                      <td>${order.total}</td>
                      <td>
                        <select
                          value={order.status || ""}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className="bg-gray-100 p-1 rounded"
                        >
                          <option value="pending">Pending</option>
                          <option value="dispatch">Dispatch</option>
                          <option value="success">Completed</option>
                        </select>
                      </td>
                      <td>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(order._id);
                          }}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                    {selectedOrderId === order._id && (
                      <tr>
                        <td colSpan={7} className="bg-gray-50 p-4">
                          <h3 className="font-bold">Order Details</h3>
                          <p><strong>Phone:</strong> {order.phone}</p>
                          <p><strong>Email:</strong> {order.email}</p>
                          <p><strong>City:</strong> {order.city}</p>
                          <ul>
                            {order.cartItems.map((item, index) => (
                              <li key={`${order._id}-${index}`} className="flex items-center gap-2">
                                {item.productName}
                                {item.image && (
                                  <Image src={urlFor(item.image).url()} width={40} height={40} alt={item.productName} />
                                )}
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}