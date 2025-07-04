<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\User;

class AccessibilityController extends Controller
{
    /**
     * Save accessibility settings for authenticated user
     */
    public function saveSettings(Request $request)
    {
        try {
            if (!Auth::check()) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            $validated = $request->validate([
                'settings' => 'required|array',
                'settings.language' => 'required|string|in:id,en,ms',
                'settings.fontSize' => 'required|integer|min:80|max:150',
                'settings.highlightTitles' => 'required|boolean',
                'settings.highlightLinks' => 'required|boolean',
                'settings.dyslexiaFont' => 'required|boolean',
                'settings.letterSpacing' => 'required|boolean',
                'settings.lineHeight' => 'required|boolean',
                'settings.fontWeight' => 'required|boolean',
            ]);

            $user = Auth::user();
            
            // Store settings in user's accessibility_settings column
            // You'll need to add this column to users table migration
            $user->accessibility_settings = json_encode($validated['settings']);
            $user->save();

            Log::info('Accessibility settings saved', [
                'user_id' => $user->id,
                'settings' => $validated['settings']
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Accessibility settings saved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error saving accessibility settings', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to save accessibility settings'
            ], 500);
        }
    }

    /**
     * Load accessibility settings for authenticated user
     */
    public function loadSettings()
    {
        try {
            if (!Auth::check()) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            $user = Auth::user();
            
            $settings = null;
            if ($user->accessibility_settings) {
                $settings = json_decode($user->accessibility_settings, true);
            }

            return response()->json([
                'success' => true,
                'settings' => $settings
            ]);

        } catch (\Exception $e) {
            Log::error('Error loading accessibility settings', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to load accessibility settings'
            ], 500);
        }
    }

    /**
     * Delete accessibility settings for authenticated user
     */
    public function deleteSettings()
    {
        try {
            if (!Auth::check()) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            $user = Auth::user();
            $user->accessibility_settings = null;
            $user->save();

            Log::info('Accessibility settings deleted', [
                'user_id' => $user->id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Accessibility settings deleted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error deleting accessibility settings', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete accessibility settings'
            ], 500);
        }
    }

    /**
     * Get accessibility statistics (for admin dashboard)
     */
    public function getStatistics()
    {
        try {
            if (!Auth::check() || Auth::user()->role !== 'operator') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $totalUsers = User::count();
            $usersWithSettings = User::whereNotNull('accessibility_settings')->count();
            
            // Parse all settings to get usage statistics
            $allSettings = User::whereNotNull('accessibility_settings')
                ->pluck('accessibility_settings')
                ->map(function ($settings) {
                    return json_decode($settings, true);
                })
                ->filter()
                ->toArray();

            $featureUsage = [
                'highlightTitles' => 0,
                'highlightLinks' => 0,
                'dyslexiaFont' => 0,
                'letterSpacing' => 0,
                'lineHeight' => 0,
                'fontWeight' => 0,
            ];

            $languageUsage = [
                'id' => 0,
                'en' => 0,
                'ms' => 0,
            ];

            $fontSizeDistribution = [
                '80-90' => 0,
                '91-100' => 0,
                '101-120' => 0,
                '121-150' => 0,
            ];

            foreach ($allSettings as $settings) {
                // Count feature usage
                foreach ($featureUsage as $feature => $count) {
                    if (isset($settings[$feature]) && $settings[$feature]) {
                        $featureUsage[$feature]++;
                    }
                }

                // Count language usage
                if (isset($settings['language'])) {
                    $lang = $settings['language'];
                    if (array_key_exists($lang, $languageUsage)) {
                        $languageUsage[$lang]++;
                    }
                }

                // Count font size distribution
                if (isset($settings['fontSize'])) {
                    $fontSize = $settings['fontSize'];
                    if ($fontSize >= 80 && $fontSize <= 90) {
                        $fontSizeDistribution['80-90']++;
                    } elseif ($fontSize >= 91 && $fontSize <= 100) {
                        $fontSizeDistribution['91-100']++;
                    } elseif ($fontSize >= 101 && $fontSize <= 120) {
                        $fontSizeDistribution['101-120']++;
                    } elseif ($fontSize >= 121 && $fontSize <= 150) {
                        $fontSizeDistribution['121-150']++;
                    }
                }
            }

            return response()->json([
                'success' => true,
                'statistics' => [
                    'totalUsers' => $totalUsers,
                    'usersWithSettings' => $usersWithSettings,
                    'adoptionRate' => $totalUsers > 0 ? round(($usersWithSettings / $totalUsers) * 100, 2) : 0,
                    'featureUsage' => $featureUsage,
                    'languageUsage' => $languageUsage,
                    'fontSizeDistribution' => $fontSizeDistribution,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting accessibility statistics', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to get accessibility statistics'
            ], 500);
        }
    }
}
