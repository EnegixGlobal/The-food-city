"use client";

import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaSearch,
  FaFilter,
  FaTrash,
  FaEye,
  FaDownload,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaCalendarAlt,
  FaBriefcase,
  FaGraduationCap,
  FaSpinner,
} from "react-icons/fa";

interface JobApplication {
  _id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  experience: string;
  qualification: string;
  currentLocation: string;
  expectedSalary: string;
  noticePeriod: string;
  resumeUrl: string;
  coverLetter?: string;
  status: string;
  appliedAt: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const JobApplicationsAdmin = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Filters
  const [filters, setFilters] = useState({
    position: "all",
    status: "all",
    search: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [showModal, setShowModal] = useState(false);

  const jobPositions = [
    "Chef",
    "Semi Comi (Helper)",
    "House Keeping", 
    "Manager",
    "Sales Person",
    "Marketing Executive",
  ];

  const statusOptions = ["Applied", "Under Review", "Shortlisted", "Interviewed", "Rejected", "Hired"];

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      });

      if (filters.position !== "all") {
        params.append("position", filters.position);
      }
      if (filters.status !== "all") {
        params.append("status", filters.status);
      }

      const response = await fetch(`/api/job-application?${params}`);
      const data = await response.json();

      if (data.success) {
        setApplications(data.data.applications);
        setPagination(data.data.pagination);
      } else {
        console.error("Failed to fetch applications:", data.message);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}'s application?`)) {
      return;
    }

    try {
      setDeleteLoading(id);
      const response = await fetch(`/api/job-application/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        // Remove from local state
        setApplications(prev => prev.filter(app => app._id !== id));
        // Refresh data to update pagination
        fetchApplications();
      } else {
        alert("Failed to delete application: " + data.message);
      }
    } catch (error) {
      console.error("Error deleting application:", error);
      alert("Error deleting application");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleResumeDownload = async (application: JobApplication) => {
    try {
      console.log("Resume URL:", application.resumeUrl);
      
      if (!application.resumeUrl) {
        alert("No resume uploaded for this candidate");
        return;
      }

      // Check if it's a local file (starts with /resumes/)
      if (application.resumeUrl.startsWith('/resumes/')) {
        // Local file - create full URL and download
        const fullUrl = window.location.origin + application.resumeUrl;
        console.log("Downloading local resume:", fullUrl);
        
        // Try to open in new tab first
        const newWindow = window.open(fullUrl, '_blank');
        
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          // Fallback: direct download
          const link = document.createElement('a');
          link.href = fullUrl;
          link.download = `${application.name}_Resume.pdf`;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        return;
      }

      // Handle old URLs or external URLs
      if (!application.resumeUrl.startsWith('http')) {
        alert("Invalid resume URL format");
        return;
      }

      // Check if this is a problematic old Cloudinary URL
      const isProblematicPDF = application.resumeUrl.includes('/image/upload/') && 
                              application.resumeUrl.toLowerCase().endsWith('.pdf');

      if (isProblematicPDF) {
        // Show warning for old problematic files
        const userChoice = confirm(
          `⚠️ This resume was uploaded with an older system and may not open properly.\n\n` +
          `Please ask ${application.name} (${application.email}) to re-upload their resume.\n\n` +
          `Click "OK" to try downloading anyway, or "Cancel" to skip.`
        );

        if (!userChoice) {
          return;
        }
      }

      // Try to open the external URL
      const newWindow = window.open(application.resumeUrl, '_blank');
      
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Fallback: try direct download
        const link = document.createElement('a');
        link.href = application.resumeUrl;
        link.download = `${application.name}_Resume.pdf`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        if (isProblematicPDF) {
          setTimeout(() => {
            alert(
              "If the download failed, please contact the candidate to re-upload their resume using the new system."
            );
          }, 3000);
        }
      }
    } catch (error) {
      console.error("Error downloading resume:", error);
      alert("Failed to download resume. Please try again or ask the candidate to re-upload.");
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/job-application/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setApplications(prev => 
          prev.map(app => 
            app._id === id ? { ...app, status: newStatus } : app
          )
        );
      } else {
        alert("Failed to update status: " + data.message);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error updating status");
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [currentPage, filters]);

  const filteredApplications = applications.filter((app) =>
    app.name.toLowerCase().includes(filters.search.toLowerCase()) ||
    app.email.toLowerCase().includes(filters.search.toLowerCase()) ||
    app.phone.includes(filters.search)
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Applied": return "bg-blue-100 text-blue-800";
      case "Under Review": return "bg-yellow-100 text-yellow-800";
      case "Shortlisted": return "bg-green-100 text-green-800";
      case "Interviewed": return "bg-purple-100 text-purple-800";
      case "Rejected": return "bg-red-100 text-red-800";
      case "Hired": return "bg-emerald-100 text-emerald-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Job Applications</h1>
              <p className="text-gray-600 mt-1">
                Manage and review job applications ({pagination.totalCount} total)
              </p>
            </div>
            <div className="flex items-center bg-blue-50 px-4 py-2">
              <FaUsers className="text-blue-600 mr-2" />
              <span className="text-blue-800 font-semibold">
                {pagination.totalCount} Applications
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
              />
            </div>

            {/* Position Filter */}
            <select
              className="px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.position}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, position: e.target.value }))
              }
            >
              <option value="all">All Positions</option>
              {jobPositions.map((position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              className="px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
            >
              <option value="all">All Status</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            {/* Refresh Button */}
            <button
              onClick={fetchApplications}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <>
                  <FaFilter className="mr-2" />
                  Refresh
                </>
              )}
            </button>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <FaSpinner className="animate-spin text-3xl text-blue-600 mr-3" />
              <span className="text-gray-600">Loading applications...</span>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <FaUsers className="mx-auto text-6xl text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600">No Applications Found</h3>
              <p className="text-gray-500">No job applications match your current filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Candidate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Experience
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications.map((application) => (
                    <tr key={application._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                              {application.name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {application.name}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <FaEnvelope className="mr-1" />
                              {application.email}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <FaPhone className="mr-1" />
                              {application.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaBriefcase className="mr-2 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {application.position}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {application.experience}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={application.status}
                          onChange={(e) => handleStatusUpdate(application._id, e.target.value)}
                          className={`text-xs px-2 py-1 font-semibold border-0 focus:ring-2 focus:ring-blue-500 ${getStatusColor(application.status)}`}
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(application.appliedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedApplication(application);
                              setShowModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 transition-colors"
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => handleResumeDownload(application)}
                            className={`p-1 hover:bg-green-50 transition-colors ${
                              application.resumeUrl?.startsWith('/resumes/')
                                ? 'text-green-600 hover:text-green-800'  // Local file - green (good)
                                : application.resumeUrl?.includes('/image/upload/') && application.resumeUrl?.toLowerCase().endsWith('.pdf')
                                ? 'text-orange-600 hover:text-orange-800'  // Problematic - orange (warning)
                                : 'text-blue-600 hover:text-blue-800'     // External but ok - blue
                            }`}
                            title={
                              application.resumeUrl?.startsWith('/resumes/')
                                ? "📄 Download Resume (Local File)"
                                : application.resumeUrl?.includes('/image/upload/') && application.resumeUrl?.toLowerCase().endsWith('.pdf')
                                ? "⚠️ Download Resume (May need re-upload)"
                                : "🔗 Download Resume (External File)"
                            }
                          >
                            <FaDownload />
                            {application.resumeUrl?.startsWith('/resumes/') && (
                              <span className="text-xs text-green-500 ml-1">📄</span>
                            )}
                            {application.resumeUrl?.includes('/image/upload/') && application.resumeUrl?.toLowerCase().endsWith('.pdf') && (
                              <span className="text-xs text-orange-500 ml-1">⚠️</span>
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(application._id, application.name)}
                            disabled={deleteLoading === application._id}
                            className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 transition-colors disabled:opacity-50"
                            title="Delete Application"
                          >
                            {deleteLoading === application._id ? (
                              <FaSpinner className="animate-spin" />
                            ) : (
                              <FaTrash />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={!pagination.hasPrevPage}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!pagination.hasNextPage}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{pagination.currentPage}</span> of{" "}
                    <span className="font-medium">{pagination.totalPages}</span> ({pagination.totalCount} total)
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={!pagination.hasPrevPage}
                      className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      disabled={!pagination.hasNextPage}
                      className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal for Application Details */}
        {showModal && selectedApplication && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    Application Details - {selectedApplication.name}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <FaUsers className="mr-2 text-gray-500" />
                      <span className="font-medium">Name:</span>
                      <span className="ml-2">{selectedApplication.name}</span>
                    </div>
                    <div className="flex items-center">
                      <FaEnvelope className="mr-2 text-gray-500" />
                      <span className="font-medium">Email:</span>
                      <span className="ml-2">{selectedApplication.email}</span>
                    </div>
                    <div className="flex items-center">
                      <FaPhone className="mr-2 text-gray-500" />
                      <span className="font-medium">Phone:</span>
                      <span className="ml-2">{selectedApplication.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <FaBriefcase className="mr-2 text-gray-500" />
                      <span className="font-medium">Position:</span>
                      <span className="ml-2">{selectedApplication.position}</span>
                    </div>
                    <div className="flex items-center">
                      <FaGraduationCap className="mr-2 text-gray-500" />
                      <span className="font-medium">Qualification:</span>
                      <span className="ml-2">{selectedApplication.qualification}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="mr-2 text-gray-500" />
                      <span className="font-medium">Location:</span>
                      <span className="ml-2">{selectedApplication.currentLocation}</span>
                    </div>
                    <div className="flex items-center">
                      <FaRupeeSign className="mr-2 text-gray-500" />
                      <span className="font-medium">Expected Salary:</span>
                      <span className="ml-2">{selectedApplication.expectedSalary}</span>
                    </div>
                    <div className="flex items-center">
                      <FaCalendarAlt className="mr-2 text-gray-500" />
                      <span className="font-medium">Notice Period:</span>
                      <span className="ml-2">{selectedApplication.noticePeriod}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium">Experience:</span>
                      <span className="ml-2">{selectedApplication.experience}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium">Applied:</span>
                      <span className="ml-2">{formatDate(selectedApplication.appliedAt)}</span>
                    </div>
                  </div>
                </div>

                {selectedApplication.coverLetter && (
                  <div className="mt-4">
                    <span className="font-medium">Cover Letter:</span>
                    <p className="mt-2 text-gray-700 bg-gray-50 p-3">
                      {selectedApplication.coverLetter}
                    </p>
                  </div>
                )}

                <div className="mt-6 flex justify-end space-x-3">
                  {selectedApplication.resumeUrl?.startsWith('/resumes/') ? (
                    <div className="text-green-600 text-sm mb-2 hidden flex items-center">
                      <span className="mr-2">📄</span>
                      click to download resume
                    </div>
                  ) : selectedApplication.resumeUrl?.includes('/image/upload/') && 
                     selectedApplication.resumeUrl?.toLowerCase().endsWith('.pdf') ? (
                    <div className="text-orange-600 text-sm mb-2 flex items-center">
                      <span className="mr-2">⚠️</span>
                      This resume was uploaded with an older system and may not open properly. 
                      Consider asking the candidate to re-upload.
                    </div>
                  ) : null}
                  <button
                    onClick={() => handleResumeDownload(selectedApplication)}
                    className={`px-4 py-2 text-white flex items-center ${
                      selectedApplication.resumeUrl?.startsWith('/resumes/')
                        ? 'bg-green-600 hover:bg-green-700'  // Local file
                        : selectedApplication.resumeUrl?.includes('/image/upload/') && 
                          selectedApplication.resumeUrl?.toLowerCase().endsWith('.pdf')
                        ? 'bg-orange-600 hover:bg-orange-700'  // Problematic
                        : 'bg-blue-600 hover:bg-blue-700'     // External
                    }`}
                  >
                    <FaDownload className="mr-2" />
                    Download Resume
                    {selectedApplication.resumeUrl?.startsWith('/resumes/') && (
                      <span className="ml-2">📄</span>
                    )}
                    {selectedApplication.resumeUrl?.includes('/image/upload/') && 
                     selectedApplication.resumeUrl?.toLowerCase().endsWith('.pdf') && (
                      <span className="ml-2">⚠️</span>
                    )}
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 hover:bg-gray-400"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobApplicationsAdmin;
