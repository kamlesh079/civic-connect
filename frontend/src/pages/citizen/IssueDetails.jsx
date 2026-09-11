import { useState, useEffect } from 'react';
import {
  useParams,
  Link
} from 'react-router-dom';

import {
  issueService
} from '../../services/issueService';

import {
  StatusBadge,
  PriorityBadge
} from '../../components/ui/Badges';

import {
  Spinner
} from '../../components/ui/Spinner';

import {
  MapPin,
  ArrowLeft,
  Calendar,
  User
} from 'lucide-react';

export const CitizenIssueDetails = () => {
  const { id } =
    useParams();

  const [issue, setIssue] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  useEffect(() => {
    const fetchIssue =
      async () => {
        try {
          const res =
            await issueService
              .getIssueDetails(
                id
              );

          setIssue(
            res.data
          );
        } catch (err) {
          setError(
            'Failed to load issue details. It may have been deleted or you do not have permission to view it.'
          );
        } finally {
          setLoading(
            false
          );
        }
      };

    fetchIssue();
  }, [id]);

  if (loading) {
    return (
      <div className="h-64 flex">
        <Spinner
          size={40}
          className="m-auto"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200">
        {error}

        <br />

        <Link
          to="/citizen/issues"
          className="underline mt-2 inline-block"
        >
          Return to Issues
        </Link>
      </div>
    );
  }

  const proofImages =
    issue.resolutionDetails
      ?.imageUrls?.length
      ? issue.resolutionDetails
          .imageUrls
      : issue.resolutionDetails
          ?.imageUrl
        ? [
            issue
              .resolutionDetails
              .imageUrl
          ]
        : [];

  return (
    <div className="space-y-6 max-w-4xl">

      <Link
        to="/citizen/issues"
        className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600"
      >
        <ArrowLeft
          size={16}
          className="mr-1"
        />

        Back to issues
      </Link>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">

        <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">

          <div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {issue.title}
            </h1>

            <div className="flex flex-wrap gap-3 items-center text-sm text-gray-600">

              <span className="flex items-center">

                <Calendar
                  size={16}
                  className="mr-1"
                />

                {new Date(
                  issue.createdAt
                ).toLocaleString()}

              </span>

              <span className="flex items-center">

                <MapPin
                  size={16}
                  className="mr-1"
                />

                {issue.address}

              </span>

            </div>

          </div>

          <div className="flex gap-2">

            <PriorityBadge
              priority={
                issue.priority
              }
            />

            <StatusBadge
              status={
                issue.status
              }
            />

          </div>

        </div>

        <div className="p-6 space-y-6">

          <div>

            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">
              Description
            </h3>

            <p className="text-gray-800 whitespace-pre-wrap">
              {
                issue.description
              }
            </p>

          </div>

          {issue.images?.length >
            0 && (
            <div className="border-t border-gray-100 pt-6">

              <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">
                Issue Photos
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">

                {issue.images.map(
                  (
                    image,
                    index
                  ) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Issue photo ${index + 1}`}
                      className="aspect-square rounded-lg object-cover border border-gray-200 bg-gray-50"
                    />
                  )
                )}

              </div>

            </div>
          )}

          {proofImages.length >
            0 && (
            <div className="border-t border-gray-100 pt-6">

              <h3 className="text-sm font-medium text-green-700 uppercase mb-3">
                Resolution Proof
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">

                {proofImages.map(
                  (
                    image,
                    index
                  ) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Resolution proof ${index + 1}`}
                      className="aspect-square rounded-lg object-cover border border-green-200 bg-green-50"
                    />
                  )
                )}

              </div>

            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-md">

            <div>

              <h3 className="text-sm font-medium text-gray-500 uppercase mb-1">
                Category
              </h3>

              <p className="text-gray-900">
                {
                  issue.category
                    ?.name ||
                  'Uncategorized'
                }
              </p>

            </div>

            <div>

              <h3 className="text-sm font-medium text-gray-500 uppercase mb-1">
                Assigned Officer
              </h3>

              <p className="text-gray-900 flex items-center">

                {issue.assignedOfficer ? (
                  <>
                    <User
                      size={16}
                      className="mr-1 text-gray-400"
                    />

                    {
                      issue
                        .assignedOfficer
                        .name
                    }
                  </>
                ) : (
                  'Unassigned'
                )}

              </p>

            </div>

          </div>

          {issue.resolutionDetails
            ?.resolvedAt && (
            <div className="bg-green-50 p-4 rounded-md border border-green-100">

              <h3 className="text-sm font-medium text-green-800 uppercase mb-2">
                Resolution Details
              </h3>

              <p className="text-green-900 text-sm mb-2">
                {
                  issue
                    .resolutionDetails
                    .remarks
                }
              </p>

              <p className="text-xs text-green-700">

                Resolved on:
                {' '}

                {new Date(
                  issue
                    .resolutionDetails
                    .resolvedAt
                ).toLocaleString()}

              </p>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};