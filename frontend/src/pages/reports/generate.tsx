'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { apiClient } from '@/utils/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import {
  DocumentTextIcon,
  CalendarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const generateReportSchema = z.object({
  clientName: z.string().min(2, 'Client name is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  title: z.string().optional(),
});

type GenerateReportForm = z.infer<typeof generateReportSchema>;

const GenerateReportPage: React.FC = () => {
  const { checkRole } = useAuth();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [harvestClients, setHarvestClients] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<GenerateReportForm>({
    resolver: zodResolver(generateReportSchema),
  });

  const clientName = watch('clientName');
  const startDate = watch('startDate');

  useEffect(() => {
    fetchHarvestClients();
  }, []);

  useEffect(() => {
    // Auto-generate title when client name and start date change
    if (clientName && startDate) {
      const date = new Date(startDate);
      const period = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      setValue('title', `${clientName} - Monthly Report - ${period}`);
    }
  }, [clientName, startDate, setValue]);

  const fetchHarvestClients = async () => {
    try {
      const response = await apiClient.get('/api/harvest/clients');
      if (response.success && response.data) {
        setHarvestClients(response.data.filter((client: any) => client.is_active));
      }
    } catch (error) {
      console.error('Error fetching Harvest clients:', error);
    }
  };

  const onSubmit = async (data: GenerateReportForm) => {
    setIsGenerating(true);
    try {
      const response = await apiClient.post('/api/reports', data);

      if (response.success && response.data) {
        toast.success('Report generated successfully!');
        router.push(`/reports/${response.data.id}`);
      } else {
        toast.error(response.error || 'Failed to generate report');
      }
    } catch (error) {
      toast.error('Error generating report');
    }
    setIsGenerating(false);
  };

  // Check permissions
  if (!checkRole([UserRole.AE, UserRole.ADMIN])) {
    return (
      <Layout>
        <div className="text-center py-12">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have permission to generate reports.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Generate New Report</h1>
          <p className="text-gray-600">
            Create a new monthly status report with Harvest time tracking data.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Client Selection */}
            <div>
              <label htmlFor="clientName" className="form-label">
                Client Name
              </label>
              {harvestClients.length > 0 ? (
                <select {...register('clientName')} className="form-input">
                  <option value="">Select a client</option>
                  {harvestClients.map((client) => (
                    <option key={client.id} value={client.name}>
                      {client.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  {...register('clientName')}
                  type="text"
                  className="form-input"
                  placeholder="Enter client name"
                />
              )}
              {errors.clientName && (
                <p className="mt-1 text-sm text-red-600">{errors.clientName.message}</p>
              )}
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="startDate" className="form-label">
                  <CalendarIcon className="h-4 w-4 inline mr-1" />
                  Report Start Date
                </label>
                <input
                  {...register('startDate')}
                  type="date"
                  className="form-input"
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="endDate" className="form-label">
                  <CalendarIcon className="h-4 w-4 inline mr-1" />
                  Report End Date
                </label>
                <input
                  {...register('endDate')}
                  type="date"
                  className="form-input"
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="form-label">
                Report Title (Optional)
              </label>
              <input
                {...register('title')}
                type="text"
                className="form-input"
                placeholder="Auto-generated based on client and date"
              />
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <ClockIcon className="h-5 w-5 text-blue-400 mt-0.5 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900">
                    How it works
                  </h4>
                  <div className="mt-1 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>We'll fetch time tracking data from Harvest for the selected date range</li>
                      <li>AI will analyze the data and generate a professional report</li>
                      <li>You can review and edit the report before submitting for approval</li>
                      <li>The report will go through the approval workflow</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isGenerating}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <div className="loading-spinner mr-2"></div>
                    Generating Report...
                  </>
                ) : (
                  <>
                    <DocumentTextIcon className="h-5 w-5 mr-2" />
                    Generate Report
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default GenerateReportPage;
