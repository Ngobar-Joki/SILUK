<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\LaporanBulanan;
use App\Models\Permohonan;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    public function index()
    {
        try {
            $dashboardData = $this->getDashboardDataArray();
            
            return Inertia::render('operator/Dashboard', [
                'dashboardData' => $dashboardData
            ]);
        } catch (\Exception $e) {
            Log::error('Dashboard error: ' . $e->getMessage());
            return Inertia::render('operator/Dashboard', [
                'error' => 'Error loading dashboard data: ' . $e->getMessage()
            ]);
        }
    }

    public function getDashboardData()
    {
        try {
            return response()->json($this->getDashboardDataArray());
        } catch (\Exception $e) {
            Log::error('Dashboard API error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error fetching dashboard data: ' . $e->getMessage()
            ], 500);
        }
    }

    private function getDashboardDataArray()
    {
        try {
            // Check if models exist, if not return default data
            $totalReports = 0;
            $pendingReports = 0;
            $acceptedReports = 0;
            $rejectedReports = 0;
            $recentReports = [];

            if (class_exists('App\Models\LaporanBulanan')) {
                $totalReports = LaporanBulanan::count();
                $pendingReports = LaporanBulanan::where('status', 'pending')->count();
                $acceptedReports = LaporanBulanan::where('status', 'accepted')->count();
                $rejectedReports = LaporanBulanan::where('status', 'rejected')->count();

                // Fetch recent reports with user relationship
                $recentReports = LaporanBulanan::with(['user' => function($query) {
                    $query->select('id', 'name');
                }])
                    ->latest()
                    ->take(5)
                    ->get()
                    ->map(function ($report) {
                        return [
                            'id' => $report->id,
                            'judul' => $report->judul ?? 'Laporan Bulanan',
                            'status' => $report->status ?? 'pending',
                            'created_at' => $report->created_at,
                            'user' => [
                                'name' => $report->user->name ?? 'Unknown'
                            ]
                        ];
                    });
            }

            // Check if Permohonan model exists
            $totalApplications = 0;
            $pendingApplications = 0;
            $acceptedApplications = 0;
            $rejectedApplications = 0;
            $recentApplications = [];

            if (class_exists('App\Models\Permohonan')) {
                $totalApplications = Permohonan::count();
                $pendingApplications = Permohonan::where('status', 'pending')->count();
                $acceptedApplications = Permohonan::where('status', 'accepted')->count();
                $rejectedApplications = Permohonan::where('status', 'rejected')->count();

                // Fetch recent applications with user relationship
                $recentApplications = Permohonan::with(['user' => function($query) {
                    $query->select('id', 'name');
                }])
                    ->latest()
                    ->take(5)
                    ->get()
                    ->map(function ($application) {
                        return [
                            'id' => $application->id,
                            'judul' => $application->judul ?? 'Permohonan',
                            'status' => $application->status ?? 'pending',
                            'created_at' => $application->created_at,
                            'user' => [
                                'name' => $application->user->name ?? 'Unknown'
                            ]
                        ];
                    });
            }

            // Reports by status
            $reportsByStatus = [
                ['status' => 'pending', 'count' => $pendingReports],
                ['status' => 'accepted', 'count' => $acceptedReports],
                ['status' => 'rejected', 'count' => $rejectedReports]
            ];

            // Applications by status
            $applicationsByStatus = [
                ['status' => 'pending', 'count' => $pendingApplications],
                ['status' => 'accepted', 'count' => $acceptedApplications],
                ['status' => 'rejected', 'count' => $rejectedApplications]
            ];

            // Monthly data (placeholder)
            $monthlyReports = [];
            $monthlyApplications = [];

            return [
                'statistics' => [
                    'totalReports' => $totalReports,
                    'totalApplications' => $totalApplications,
                    'pendingApplications' => $pendingApplications,
                    'acceptedApplications' => $acceptedApplications,
                    'rejectedApplications' => $rejectedApplications,
                    'pendingReports' => $pendingReports,
                    'acceptedReports' => $acceptedReports,
                    'rejectedReports' => $rejectedReports,
                ],
                'recentReports' => $recentReports,
                'recentApplications' => $recentApplications,
                'monthlyReports' => $monthlyReports,
                'monthlyApplications' => $monthlyApplications,
                'reportsByStatus' => $reportsByStatus,
                'applicationsByStatus' => $applicationsByStatus,
            ];
        } catch (\Exception $e) {
            Log::error('Dashboard data array error: ' . $e->getMessage());
            throw $e;
        }
    }
}
