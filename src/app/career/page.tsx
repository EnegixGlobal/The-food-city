"use client";

import React, { useState } from "react";
import Container from "../components/Container";
import Button from "../components/Button";
import Input from "../components/Input";
import Spinner from "../components/Spinner";
import { useAlertStore } from "../zustand/alertStore";
import {
  FaBriefcase,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaCalendarAlt,
  FaFileUpload,
  FaCookieBite,
  FaUsers,
  FaBroom,
  FaUserTie,
  FaHandshake,
  FaBullhorn,
  FaCheckCircle,
  FaClock,
  FaGraduationCap,
} from "react-icons/fa";

const CareerPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    experience: "",
    qualification: "",
    currentLocation: "",
    expectedSalary: "",
    noticePeriod: "",
    coverLetter: "",
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const addAlert = useAlertStore((state) => state.addAlert);

  const jobPositions = [
    {
      title: "Chef",
      icon: <FaCookieBite className="text-3xl text-red-600" />,
      description: "Create delicious dishes and manage kitchen operations",
      requirements: ["Culinary degree or equivalent experience", "Food safety certification", "Leadership skills"],
    },
    {
      title: "Semi Comi (Helper)",
      icon: <FaUsers className="text-3xl text-blue-600" />,
      description: "Assist in kitchen operations and food preparation",
      requirements: ["Basic food handling knowledge", "Willingness to learn", "Good communication skills"],
    },
    {
      title: "House Keeping",
      icon: <FaBroom className="text-3xl text-green-600" />,
      description: "Maintain cleanliness and hygiene standards",
      requirements: ["Attention to detail", "Physical fitness", "Reliability"],
    },
    {
      title: "Manager",
      icon: <FaUserTie className="text-3xl text-purple-600" />,
      description: "Oversee operations and manage teams",
      requirements: ["Management experience", "Leadership skills", "Business acumen"],
    },
    {
      title: "Sales Person",
      icon: <FaHandshake className="text-3xl text-orange-600" />,
      description: "Drive sales and build customer relationships",
      requirements: ["Sales experience", "Communication skills", "Target-driven mindset"],
    },
    {
      title: "Marketing Executive",
      icon: <FaBullhorn className="text-3xl text-pink-600" />,
      description: "Develop and execute marketing strategies",
      requirements: ["Marketing degree", "Creative thinking", "Digital marketing skills"],
    },
  ];

  const experienceOptions = [
    "0-1 years",
    "1-3 years",
    "3-5 years",
    "5-10 years",
    "10+ years",
  ];

  const noticePeriodOptions = [
    "Immediate",
    "15 days",
    "1 month",
    "2 months",
    "3 months",
    "More than 3 months",
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        addAlert({
          type: "error",
          title: "Invalid File Type",
          message: "Please upload a PDF or Word document",
        });
        return;
      }

      if (file.size > maxSize) {
        addAlert({
          type: "error", 
          title: "File Too Large",
          message: "File size should be less than 5MB",
        });
        return;
      }

      setResumeFile(file);
    }
  };

  const uploadResume = async (): Promise<string | null> => {
    if (!resumeFile) return null;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", resumeFile);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return data.data.secure_url;
      } else {
        addAlert({
          type: "error",
          title: "Upload Failed",
          message: data.message || "Failed to upload resume",
        });
        return null;
      }
    } catch (error) {
      console.error("Resume upload error:", error);
      addAlert({
        type: "error",
        title: "Upload Error",
        message: "Failed to upload resume. Please try again.",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = [
      "name",
      "email",
      "phone",
      "position",
      "experience",
      "qualification",
      "currentLocation",
      "expectedSalary",
      "noticePeriod",
    ];

    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        addAlert({
          type: "error",
          title: "Validation Error",
          message: `Please fill in the ${field.replace(/([A-Z])/g, " $1").toLowerCase()} field`,
        });
        return;
      }
    }

    if (!resumeFile) {
      addAlert({
        type: "error",
        title: "Resume Required",
        message: "Please upload your resume",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload resume first
      const resumeUrl = await uploadResume();
      if (!resumeUrl) {
        setIsSubmitting(false);
        return;
      }

      // Submit application
      const response = await fetch("/api/job-application", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          resumeUrl,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        addAlert({
          type: "success",
          title: "Application Submitted!",
          message: data.message,
          duration: 6000,
        });

        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          position: "",
          experience: "",
          qualification: "",
          currentLocation: "",
          expectedSalary: "",
          noticePeriod: "",
          coverLetter: "",
        });
        setResumeFile(null);
      } else {
        addAlert({
          type: "error",
          title: "Application Failed",
          message: data.message || "Failed to submit application",
        });
      }
    } catch (error) {
      console.error("Application submission error:", error);
      addAlert({
        type: "error",
        title: "Network Error",
        message: "Failed to submit application. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-900 to-red-700 text-white py-16">
        <Container>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Join Our Team
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-red-100">
              Build your career with The Food City
            </p>
            <div className="flex justify-center items-center space-x-6 text-red-200">
              <div className="flex items-center">
                <FaCheckCircle className="mr-2" />
                <span>Competitive Salary</span>
              </div>
              <div className="flex items-center">
                <FaCheckCircle className="mr-2" />
                <span>Growth Opportunities</span>
              </div>
              <div className="flex items-center">
                <FaCheckCircle className="mr-2" />
                <span>Great Work Environment</span>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Job Positions */}
      <Container className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Available Positions
          </h2>
          <p className="text-gray-600 text-lg">
            Discover exciting career opportunities in our growing company
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {jobPositions.map((job, index) => (
            <div
              key={index}
              className="bg-white p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200"
            >
              <div className="flex items-center mb-4">
                {job.icon}
                <h3 className="text-xl font-bold text-gray-900 ml-3">
                  {job.title}
                </h3>
              </div>
              <p className="text-gray-600 mb-4">{job.description}</p>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Requirements:</h4>
                <ul className="space-y-1">
                  {job.requirements.map((req, reqIndex) => (
                    <li key={reqIndex} className="text-gray-600 text-sm flex items-center">
                      <FaCheckCircle className="text-green-500 mr-2 text-xs" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Application Form */}
        <div className="bg-white shadow-xl border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Apply Now
            </h2>
            <p className="text-gray-600">
              Fill out the form below to start your journey with us
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  <FaUsers className="inline mr-2" />
                  Full Name *
                </label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Email Address *
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Phone Number *
                </label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  <FaBriefcase className="inline mr-2" />
                  Position Applied For *
                </label>
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900"
                  required
                >
                  <option value="">Select Position</option>
                  {jobPositions.map((job, index) => (
                    <option key={index} value={job.title}>
                      {job.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  <FaClock className="inline mr-2" />
                  Experience *
                </label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900"
                  required
                >
                  <option value="">Select Experience</option>
                  {experienceOptions.map((exp, index) => (
                    <option key={index} value={exp}>
                      {exp}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  <FaGraduationCap className="inline mr-2" />
                  Qualification *
                </label>
                <Input
                  type="text"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleInputChange}
                  placeholder="Enter your highest qualification"
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  <FaMapMarkerAlt className="inline mr-2" />
                  Current Location *
                </label>
                <Input
                  type="text"
                  name="currentLocation"
                  value={formData.currentLocation}
                  onChange={handleInputChange}
                  placeholder="Enter your current location"
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  <FaRupeeSign className="inline mr-2" />
                  Expected Salary *
                </label>
                <Input
                  type="text"
                  name="expectedSalary"
                  value={formData.expectedSalary}
                  onChange={handleInputChange}
                  placeholder="e.g., 25,000 - 30,000 per month"
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  <FaCalendarAlt className="inline mr-2" />
                  Notice Period *
                </label>
                <select
                  name="noticePeriod"
                  value={formData.noticePeriod}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900"
                  required
                >
                  <option value="">Select Notice Period</option>
                  {noticePeriodOptions.map((period, index) => (
                    <option key={index} value={period}>
                      {period}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Resume Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                <FaFileUpload className="inline mr-2" />
                Upload Resume *
              </label>
              <div className="border-2 border-dashed border-gray-300 p-6 text-center hover:border-red-400 transition-colors">
                <input
                  type="file"
                  id="resume"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="resume"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <FaFileUpload className="text-4xl text-gray-400 mb-2" />
                  <span className="text-gray-600">
                    {resumeFile ? resumeFile.name : "Click to upload resume"}
                  </span>
                  <span className="text-sm text-gray-400 mt-1">
                    PDF, DOC, DOCX (Max 5MB)
                  </span>
                </label>
              </div>
            </div>

            {/* Cover Letter */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Cover Letter (Optional)
              </label>
              <textarea
                name="coverLetter"
                value={formData.coverLetter}
                onChange={handleInputChange}
                placeholder="Tell us why you want to work with us..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 resize-none"
                maxLength={1000}
              />
              <div className="text-right text-sm text-gray-400 mt-1">
                {formData.coverLetter.length}/1000 characters
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <Button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="px-12 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <Spinner h={20} className="mr-3 text-white" />
                    {isUploading ? "Uploading Resume..." : "Submitting Application..."}
                  </div>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Why Work With Us */}
        <div className="mt-16 bg-gradient-to-r from-red-50 to-orange-50 p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Work With Us?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FaCheckCircle className="text-2xl text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Growth Opportunities</h3>
              <p className="text-gray-600">
                We believe in nurturing talent and providing clear career progression paths
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FaUsers className="text-2xl text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Great Team Culture</h3>
              <p className="text-gray-600">
                Work with passionate individuals in a collaborative and supportive environment
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FaRupeeSign className="text-2xl text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Competitive Benefits</h3>
              <p className="text-gray-600">
                Attractive salary packages with additional benefits and incentives
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default CareerPage;
