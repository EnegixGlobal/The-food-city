"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  Users,
  Edit,
  Trash2,
  Plus,
  Save,
  X,
  User,
  Upload,
} from "lucide-react";
import { FiRefreshCw } from "react-icons/fi";
import Input from "@/app/components/Input";
import Spinner from "@/app/components/Spinner";
import Image from "next/image";

// Types
interface Company {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  logo: string;
  createdAt: string;
  updatedAt: string;
}

interface Employee {
  _id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  avatar: string;
  createdAt: string;
  updatedAt: string;
}

const COMPANY_ID = "6888be3b6db74d474efde7f1"; // Fixed company ID as per requirement

const SettingsPage = () => {
  // State management
  const [activeTab, setActiveTab] = useState<"company" | "employees">(
    "company"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState<
    "company" | "employee" | null
  >(null);

  // Company state
  const [company, setCompany] = useState<Company | null>(null);
  const [editingCompany, setEditingCompany] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    logo: "",
  });

  // Employee state
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [editingEmployee, setEditingEmployee] = useState<string | null>(null);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({
    name: "",
    email: "",
    phone: "",
    whatsapp: "",
    address: "",
    avatar: "",
  });

  // Image modal state
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState("");
  const [modalImageAlt, setModalImageAlt] = useState("");

  // Fetch company data
  const fetchCompany = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/company/${COMPANY_ID}`, {
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (data.success) {
        setCompany(data.data);
        setCompanyForm({
          name: data.data.name || "",
          email: data.data.email || "",
          phone: data.data.phone || "",
          address: data.data.address || "",
          logo: data.data.logo || "",
        });
      } else {
        setError(data.message || "Failed to fetch company data");
      }
    } catch (err) {
      setError("Failed to fetch company data");
      console.error("Error fetching company:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees data
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/employee", {
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (data.success) {
        setEmployees(data.data || []);
      } else {
        setError(data.message || "Failed to fetch employees");
      }
    } catch (err) {
      setError("Failed to fetch employees");
      console.error("Error fetching employees:", err);
    } finally {
      setLoading(false);
    }
  };

  // Update company
  const updateCompany = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/company/${COMPANY_ID}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(companyForm),
      });

      const data = await response.json();

      if (data.success) {
        setCompany(data.data);
        setEditingCompany(false);
        setError("");
      } else {
        setError(data.message || "Failed to update company");
      }
    } catch (err) {
      setError("Failed to update company");
      console.error("Error updating company:", err);
    } finally {
      setLoading(false);
    }
  };

  // Upload image to Cloudinary
  const uploadImage = async (file: File, type: "company" | "employee") => {
    try {
      setUploadingImage(type);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.url) {
        if (type === "company") {
          setCompanyForm((prev) => ({ ...prev, logo: data.url }));
        } else {
          setEmployeeForm((prev) => ({ ...prev, avatar: data.url }));
        }
        return data.url;
      } else {
        throw new Error(data.error || "Failed to upload image");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
      console.error("Error uploading image:", err);
      return null;
    } finally {
      setUploadingImage(null);
    }
  };

  // Handle file selection for company logo
  const handleCompanyLogoUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadImage(file, "company");
    }
  };

  // Handle file selection for employee avatar
  const handleEmployeeAvatarUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadImage(file, "employee");
    }
  };

  // Create employee
  const createEmployee = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employeeForm),
      });

      const data = await response.json();

      if (data.success) {
        setEmployees((prev) => [...prev, data.data]);
        setShowAddEmployee(false);
        resetEmployeeForm();
        setError("");
      } else {
        setError(data.message || "Failed to create employee");
      }
    } catch (err) {
      setError("Failed to create employee");
      console.error("Error creating employee:", err);
    } finally {
      setLoading(false);
    }
  };

  // Update employee
  const updateEmployee = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/employee/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employeeForm),
      });

      const data = await response.json();

      if (data.success) {
        setEmployees((prev) =>
          prev.map((emp) => (emp._id === id ? data.data : emp))
        );
        setEditingEmployee(null);
        resetEmployeeForm();
        setError("");
      } else {
        setError(data.message || "Failed to update employee");
      }
    } catch (err) {
      setError("Failed to update employee");
      console.error("Error updating employee:", err);
    } finally {
      setLoading(false);
    }
  };

  // Delete employee
  const deleteEmployee = async (id: string) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/employee/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (data.success) {
        setEmployees((prev) => prev.filter((emp) => emp._id !== id));
        setError("");
      } else {
        setError(data.message || "Failed to delete employee");
      }
    } catch (err) {
      setError("Failed to delete employee");
      console.error("Error deleting employee:", err);
    } finally {
      setLoading(false);
    }
  };

  // Reset employee form
  const resetEmployeeForm = () => {
    setEmployeeForm({
      name: "",
      email: "",
      phone: "",
      whatsapp: "",
      address: "",
      avatar: "",
    });
  };

  // Start editing employee
  const startEditingEmployee = (employee: Employee) => {
    setEmployeeForm({
      name: employee.name,
      email: employee.email || "",
      phone: employee.phone,
      whatsapp: employee.whatsapp,
      address: employee.address,
      avatar: employee.avatar || "",
    });
    setEditingEmployee(employee._id);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingEmployee(null);
    setShowAddEmployee(false);
    resetEmployeeForm();
    setEditingCompany(false);
    if (company) {
      setCompanyForm({
        name: company.name || "",
        email: company.email || "",
        phone: company.phone || "",
        address: company.address || "",
        logo: company.logo || "",
      });
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Open image modal
  const openImageModal = (imageSrc: string, imageAlt: string) => {
    setModalImageSrc(imageSrc);
    setModalImageAlt(imageAlt);
    setShowImageModal(true);
  };

  // Close image modal
  const closeImageModal = () => {
    setShowImageModal(false);
    setModalImageSrc("");
    setModalImageAlt("");
  };

  useEffect(() => {
    fetchCompany();
    fetchEmployees();
  }, []);

  return (
    <div className="space-y-4 ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Manage company and employee information
          </p>
        </div>
        <button
          onClick={() => {
            fetchCompany();
            fetchEmployees();
          }}
          disabled={loading}
          className="flex items-center gap-2 bg-red-900 text-white px-3 py-2 sm:px-4 hover:bg-red-800 disabled:opacity-50 transition-colors text-sm">
          <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 sm:px-4 sm:py-3 text-sm">
          <p>{error}</p>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white border border-gray-200 shadow-sm">
        <div className="flex overflow-x-auto">
          <button
            onClick={() => setActiveTab("company")}
            className={`flex items-center gap-2 px-4 py-3 sm:px-6 sm:py-4 font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
              activeTab === "company"
                ? "bg-red-900 text-white border-b-2 border-red-900"
                : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            }`}>
            <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
            Company Settings
          </button>
          <button
            onClick={() => setActiveTab("employees")}
            className={`flex items-center gap-2 px-4 py-3 sm:px-6 sm:py-4 font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
              activeTab === "employees"
                ? "bg-red-900 text-white border-b-2 border-red-900"
                : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            }`}>
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            Employee Management
          </button>
        </div>
      </div>

      {/* Company Settings Tab */}
      {activeTab === "company" && (
        <div className="bg-white p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Company Information
            </h2>
            {!editingCompany && (
              <button
                onClick={() => setEditingCompany(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 sm:px-4 hover:bg-blue-700 transition-colors text-sm">
                <Edit className="w-4 h-4" />
                Edit
              </button>
            )}
          </div>

          {editingCompany ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Company Name"
                  value={companyForm.name}
                  onChange={(e) =>
                    setCompanyForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Enter company name"
                />
                <Input
                  label="Email"
                  type="email"
                  value={companyForm.email}
                  onChange={(e) =>
                    setCompanyForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="Enter email address"
                />
                <Input
                  label="Phone"
                  value={companyForm.phone}
                  onChange={(e) =>
                    setCompanyForm((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  placeholder="Enter phone number"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Logo
                  </label>
                  <div className="flex items-center gap-4">
                    {companyForm.logo && (
                      <div className="w-16 h-16 border border-gray-300 overflow-hidden bg-gray-50">
                        <Image
                          width={64}
                          height={64}
                          src={companyForm.logo}
                          alt="Company Logo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCompanyLogoUpload}
                        disabled={uploadingImage === "company"}
                        className="hidden"
                        id="company-logo-upload"
                      />
                      <label
                        htmlFor="company-logo-upload"
                        className={`flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors ${
                          uploadingImage === "company"
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}>
                        {uploadingImage === "company" ? (
                          <Spinner h={16} w={16} />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        {uploadingImage === "company"
                          ? "Uploading..."
                          : companyForm.logo
                          ? "Change Logo"
                          : "Upload Logo"}
                      </label>
                      <p className="text-xs mt-1 text-gray-600">
                        Prefer upload logo by removing its background, and
                        should be in its original height and width.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <Input
                  label="Address"
                  value={companyForm.address}
                  onChange={(e) =>
                    setCompanyForm((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  placeholder="Enter company address"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={updateCompany}
                  disabled={loading}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 hover:bg-green-700 disabled:opacity-50 transition-colors">
                  {loading ? (
                    <Spinner h={16} w={16} />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {loading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={cancelEditing}
                  className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 hover:bg-gray-600 transition-colors">
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {company ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6 border border-blue-200 hover:shadow-lg transition-shadow">
                    <h3 className="text-xs sm:text-sm font-bold text-blue-800 mb-2 uppercase tracking-wide">
                      Company Name
                    </h3>
                    <p className="text-lg sm:text-xl font-bold text-blue-900">
                      {company.name}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 sm:p-6 border border-green-200 hover:shadow-lg transition-shadow">
                    <h3 className="text-xs sm:text-sm font-bold text-green-800 mb-2 uppercase tracking-wide">
                      Email Address
                    </h3>
                    <p className="text-sm sm:text-lg font-semibold text-green-900 break-all">
                      {company.email}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 sm:p-6 border border-purple-200 hover:shadow-lg transition-shadow">
                    <h3 className="text-xs sm:text-sm font-bold text-purple-800 mb-2 uppercase tracking-wide">
                      Phone Number
                    </h3>
                    <p className="text-sm sm:text-lg font-semibold text-purple-900">
                      {company.phone || "Not provided"}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 sm:p-6 border border-orange-200 hover:shadow-lg transition-shadow">
                    <h3 className="text-xs sm:text-sm font-bold text-orange-800 mb-2 uppercase tracking-wide">
                      Company Logo
                    </h3>
                    {company.logo ? (
                      <div className="flex items-center gap-3">
                        <Image
                          src={company.logo}
                          alt="Company Logo"
                          className="w-12 h-12 sm:w-16 sm:h-16 object-cover border border-orange-300"
                        />
                      </div>
                    ) : (
                      <p className="text-sm sm:text-lg font-semibold text-orange-900">
                        Not provided
                      </p>
                    )}
                  </div>
                  <div className="sm:col-span-2 bg-gradient-to-br from-red-50 to-red-100 p-4 sm:p-6 border border-red-200 hover:shadow-lg transition-shadow">
                    <h3 className="text-xs sm:text-sm font-bold text-red-800 mb-2 uppercase tracking-wide">
                      Business Address
                    </h3>
                    <p className="text-sm sm:text-lg font-semibold text-red-900">
                      {company.address || "Not provided"}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">
                      Established
                    </h3>
                    <p className="text-sm sm:text-lg font-semibold text-gray-900">
                      {formatDate(company.createdAt)}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 sm:p-6 border border-indigo-200 hover:shadow-lg transition-shadow">
                    <h3 className="text-xs sm:text-sm font-bold text-indigo-800 mb-2 uppercase tracking-wide">
                      Last Updated
                    </h3>
                    <p className="text-sm sm:text-lg font-semibold text-indigo-900">
                      {formatDate(company.updatedAt)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-32">
                  <Spinner h={36} />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Employee Management Tab */}
      {activeTab === "employees" && (
        <div className="bg-white shadow-sm border border-gray-200">
          <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Employee Management
              </h2>
              <button
                onClick={() => setShowAddEmployee(true)}
                className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 sm:px-4 hover:bg-green-700 transition-colors text-sm">
                <Plus className="w-4 h-4" />
                Add Employee
              </button>
            </div>
          </div>

          {/* Add Employee Form */}
          {showAddEmployee && (
            <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">
                Add New Employee
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name *"
                    value={employeeForm.name}
                    onChange={(e) =>
                      setEmployeeForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Enter full name"
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={employeeForm.email}
                    onChange={(e) =>
                      setEmployeeForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="Enter email address"
                  />
                  <Input
                    label="Phone Number *"
                    value={employeeForm.phone}
                    onChange={(e) =>
                      setEmployeeForm((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="Enter phone number"
                  />
                  <Input
                    label="WhatsApp Number *"
                    value={employeeForm.whatsapp}
                    onChange={(e) =>
                      setEmployeeForm((prev) => ({
                        ...prev,
                        whatsapp: e.target.value,
                      }))
                    }
                    placeholder="Enter WhatsApp number"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employee Avatar
                    </label>
                    <div className="flex items-center gap-4">
                      {employeeForm.avatar && (
                        <div className="w-16 h-16 border border-gray-300 overflow-hidden bg-gray-50">
                          <Image
                            src={employeeForm.avatar}
                            alt="Employee Avatar"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleEmployeeAvatarUpload}
                          disabled={uploadingImage === "employee"}
                          className="hidden"
                          id="employee-avatar-upload"
                        />
                        <label
                          htmlFor="employee-avatar-upload"
                          className={`flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors ${
                            uploadingImage === "employee"
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}>
                          {uploadingImage === "employee" ? (
                            <Spinner h={16} w={16} />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          {uploadingImage === "employee"
                            ? "Uploading..."
                            : "Upload Avatar"}
                        </label>
                        <Input
                          value={employeeForm.avatar}
                          onChange={(e) =>
                            setEmployeeForm((prev) => ({
                              ...prev,
                              avatar: e.target.value,
                            }))
                          }
                          placeholder="Or paste avatar URL"
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <Input
                  label="Address *"
                  value={employeeForm.address}
                  onChange={(e) =>
                    setEmployeeForm((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  placeholder="Enter address"
                />
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={createEmployee}
                    disabled={loading}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 hover:bg-green-700 disabled:opacity-50 transition-colors">
                    {loading ? (
                      <Spinner h={16} w={16} />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {loading ? "Creating..." : "Create Employee"}
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 hover:bg-gray-600 transition-colors">
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Employee List */}
          <div className="p-3 sm:p-4 lg:p-6">
            {employees.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {employees.map((employee) => (
                  <div
                    key={employee._id}
                    className="border p-3 sm:p-4 border-gray-200 hover:bg-gray-50 transition-colors">
                    {editingEmployee === employee._id ? (
                      <div className="space-y-4">
                        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">
                          Edit Employee
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label="Full Name *"
                            value={employeeForm.name}
                            onChange={(e) =>
                              setEmployeeForm((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            placeholder="Enter full name"
                          />
                          <Input
                            label="Email"
                            type="email"
                            value={employeeForm.email}
                            onChange={(e) =>
                              setEmployeeForm((prev) => ({
                                ...prev,
                                email: e.target.value,
                              }))
                            }
                            placeholder="Enter email address"
                          />
                          <Input
                            label="Phone Number *"
                            value={employeeForm.phone}
                            onChange={(e) =>
                              setEmployeeForm((prev) => ({
                                ...prev,
                                phone: e.target.value,
                              }))
                            }
                            placeholder="Enter phone number"
                          />
                          <Input
                            label="WhatsApp Number *"
                            value={employeeForm.whatsapp}
                            onChange={(e) =>
                              setEmployeeForm((prev) => ({
                                ...prev,
                                whatsapp: e.target.value,
                              }))
                            }
                            placeholder="Enter WhatsApp number"
                          />
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Employee Avatar
                            </label>
                            <div className="flex items-center gap-4">
                              {employeeForm.avatar && (
                                <div className="w-16 h-16 border border-gray-300 overflow-hidden bg-gray-50">
                                  <Image
                                    src={employeeForm.avatar}
                                    alt="Employee Avatar"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex-1">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleEmployeeAvatarUpload}
                                  disabled={uploadingImage === "employee"}
                                  className="hidden"
                                  id="employee-avatar-edit-upload"
                                />
                                <label
                                  htmlFor="employee-avatar-edit-upload"
                                  className={`flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors ${
                                    uploadingImage === "employee"
                                      ? "opacity-50 cursor-not-allowed"
                                      : ""
                                  }`}>
                                  {uploadingImage === "employee" ? (
                                    <Spinner h={16} w={16} />
                                  ) : (
                                    <Upload className="w-4 h-4" />
                                  )}
                                  {uploadingImage === "employee"
                                    ? "Uploading..."
                                    : "Upload Avatar"}
                                </label>
                                <Input
                                  value={employeeForm.avatar}
                                  onChange={(e) =>
                                    setEmployeeForm((prev) => ({
                                      ...prev,
                                      avatar: e.target.value,
                                    }))
                                  }
                                  placeholder="Or paste avatar URL"
                                  className="mt-2"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <Input
                          label="Address *"
                          value={employeeForm.address}
                          onChange={(e) =>
                            setEmployeeForm((prev) => ({
                              ...prev,
                              address: e.target.value,
                            }))
                          }
                          placeholder="Enter address"
                        />
                        <div className="flex gap-2 pt-4">
                          <button
                            onClick={() => updateEmployee(employee._id)}
                            disabled={loading}
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 hover:bg-green-700 disabled:opacity-50 transition-colors">
                            {loading ? (
                              <Spinner h={16} w={16} />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                            {loading ? "Updating..." : "Save Changes"}
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 hover:bg-gray-600 transition-colors">
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-3 sm:p-4 lg:p-6 border border-slate-200 hover:shadow-xl transition-all duration-300">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                          <div className="flex items-start gap-3 sm:gap-4 lg:gap-6">
                            <div className="relative group flex-shrink-0">
                              <div 
                                className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 font-bold flex items-center justify-center border-2 border-blue-300 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                                onClick={() => employee.avatar && openImageModal(employee.avatar, employee.name)}
                              >
                                {employee.avatar ? (
                                  <Image
                                    src={employee.avatar}
                                    alt={employee.name}
                                    className="w-full h-full object-cover pointer-events-none"
                                  />
                                ) : (
                                  <User className="w-6 h-6 sm:w-8 sm:h-8" />
                                )}
                              </div>
                              {employee.avatar && (
                                <div className="absolute inset-0  group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center pointer-events-none">
                                  <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    View
                                  </span>
                                </div>
                              )}
                              <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 bg-green-500 border-2 border-white shadow-md flex items-center justify-center pointer-events-none">
                                <div className="w-1 h-1 sm:w-2 sm:h-2 bg-white"></div>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="mb-3 sm:mb-4">
                                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1 truncate">
                                  {employee.name}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-500 font-medium">
                                  Employee ID: {employee._id.slice(-8).toUpperCase()}
                                </p>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
                                <div className="bg-white p-2 sm:p-3 lg:p-4 border border-blue-200 shadow-sm">
                                  <div className="flex items-center gap-2 mb-1 sm:mb-2">
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 text-blue-600 flex items-center justify-center text-xs sm:text-sm">
                                      📞
                                    </div>
                                    <h4 className="font-semibold text-gray-800 text-xs sm:text-sm">
                                      Phone
                                    </h4>
                                  </div>
                                  <p className="text-gray-900 font-medium text-xs sm:text-sm break-all">
                                    {employee.phone}
                                  </p>
                                </div>

                                <div className="bg-white p-2 sm:p-3 lg:p-4 border border-green-200 shadow-sm">
                                  <div className="flex items-center gap-2 mb-1 sm:mb-2">
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 text-green-600 flex items-center justify-center text-xs sm:text-sm">
                                      💬
                                    </div>
                                    <h4 className="font-semibold text-gray-800 text-xs sm:text-sm">
                                      WhatsApp
                                    </h4>
                                  </div>
                                  <p className="text-gray-900 font-medium text-xs sm:text-sm break-all">
                                    {employee.whatsapp}
                                  </p>
                                </div>

                                {employee.email && (
                                  <div className="bg-white p-2 sm:p-3 lg:p-4 border border-purple-200 shadow-sm">
                                    <div className="flex items-center gap-2 mb-1 sm:mb-2">
                                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 text-purple-600 flex items-center justify-center text-xs sm:text-sm">
                                        ✉️
                                      </div>
                                      <h4 className="font-semibold text-gray-800 text-xs sm:text-sm">
                                        Email
                                      </h4>
                                    </div>
                                    <p className="text-gray-900 font-medium text-xs sm:text-sm break-all">
                                      {employee.email}
                                    </p>
                                  </div>
                                )}

                                <div className="bg-white p-2 sm:p-3 lg:p-4 border border-orange-200 shadow-sm sm:col-span-2 lg:col-span-1">
                                  <div className="flex items-center gap-2 mb-1 sm:mb-2">
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-100 text-orange-600 flex items-center justify-center text-xs sm:text-sm">
                                      📍
                                    </div>
                                    <h4 className="font-semibold text-gray-800 text-xs sm:text-sm">
                                      Address
                                    </h4>
                                  </div>
                                  <p className="text-gray-900 font-medium text-xs sm:text-sm">
                                    {employee.address}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-gray-50 border border-gray-200">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 gap-1">
                                  <span>Joined: {formatDate(employee.createdAt)}</span>
                                  <span>Updated: {formatDate(employee.updatedAt)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-row lg:flex-col gap-2 lg:ml-4">
                            <button
                              onClick={() => startEditingEmployee(employee)}
                              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 sm:px-4 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg text-xs sm:text-sm">
                              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => deleteEmployee(employee._id)}
                              disabled={loading}
                              className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-2 sm:px-4 hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 text-xs sm:text-sm">
                              {loading ? (
                                <Spinner h={12} w={12} />
                              ) : (
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              )}
                              {loading ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Employees Found
                </h3>
                <p className="text-gray-500 mb-4">
                  Get started by adding your first employee
                </p>
                <button
                  onClick={() => setShowAddEmployee(true)}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 hover:bg-green-700 transition-colors mx-auto">
                  <Plus className="w-4 h-4" />
                  Add Employee
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          onClick={closeImageModal}>
          <div
            className="relative w-full max-w-4xl max-h-full flex flex-col"
            onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={closeImageModal}
              className="absolute top-2 right-2 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm text-gray-800 hover:bg-white transition-colors flex items-center justify-center shadow-lg rounded-full md:w-8 md:h-8 md:-top-2 md:-right-2 md:rounded-none"
            >
              <X className="w-5 h-5 md:w-5 md:h-5" />
            </button>
            
            {/* Image Container */}
            <div className="flex-1 flex items-center justify-center min-h-0">
              <Image
                src={modalImageSrc}
                alt={modalImageAlt}
                className="max-w-full max-h-full object-contain shadow-2xl rounded-lg md:rounded-none"
              />
            </div>
            
            {/* Image Caption */}
            <div className="bg-white/95 backdrop-blur-sm px-4 py-3 mt-2 shadow-lg rounded-lg md:rounded-none">
              <p className="text-center text-gray-800 font-medium text-sm md:text-base">
                {modalImageAlt}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
