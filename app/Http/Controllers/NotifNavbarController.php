<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\LaporanBulanan;
use App\Models\Permohonan;
use Illuminate\Support\Facades\Auth;

class NotifNavbarController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Ambil notifikasi yang belum dibaca user
        $laporan = LaporanBulanan::orderBy('created_at', 'desc')
            ->limit(5)
            ->get(['id', 'periode', 'created_at']);

        $permohonan = Permohonan::where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get(['id', 'user_id', 'created_at']);

        $notifications = collect();

        foreach ($laporan as $item) {
            $notifications->push([
                'type' => 'Laporan Bulanan',
                'title' => $item->periode,
                'created_at' => $item->created_at,
                'notif_id' => 'laporan_'.$item->id,
            ]);
        }
        foreach ($permohonan as $item) {
            $notifications->push([
                'type' => 'Permohonan',
                'title' => 'Permohonan #' . $item->id,
                'created_at' => $item->created_at,
                'notif_id' => 'permohonan_'.$item->id,
            ]);
        }

        $notifications = $notifications->sortByDesc('created_at')->values()->take(5);

        // Ambil daftar notif yang sudah dibaca user
        $readNotifIds = $user->read_notifications ?? [];

        // Tandai mana yang sudah dibaca
        $notifications = $notifications->map(function ($notif) use ($readNotifIds) {
            $notif['read'] = in_array($notif['notif_id'], $readNotifIds ?? []);
            return $notif;
        });

        return response()->json([
            'success' => true,
            'notifications' => $notifications,
        ]);
    }

    // Endpoint untuk menandai semua notifikasi sudah dibaca
    public function markAllRead(Request $request)
    {
        $user = Auth::user();

        // Ambil notifikasi yang sama persis seperti di index()
        $laporan = LaporanBulanan::orderBy('created_at', 'desc')
            ->limit(5)
            ->get(['id', 'periode', 'created_at']);

        $permohonan = Permohonan::where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get(['id', 'user_id', 'created_at']);

        $newNotifIds = collect();
        foreach ($laporan as $item) {
            $newNotifIds->push('laporan_' . $item->id);
        }
        foreach ($permohonan as $item) {
            $newNotifIds->push('permohonan_' . $item->id);
        }

        // Merge dengan notifikasi yang sudah dibaca sebelumnya
        $existingReadNotifs = $user->read_notifications ?? [];
        $allReadNotifs = array_unique(array_merge($existingReadNotifs, $newNotifIds->toArray()));

        // Simpan ke kolom read_notifications (array)
        $user->read_notifications = $allReadNotifs;
        $user->save();

        // Return updated notifications with all marked as read
        $notifications = collect();
        foreach ($laporan as $item) {
            $notifications->push([
                'type' => 'Laporan Bulanan',
                'title' => $item->periode,
                'created_at' => $item->created_at,
                'notif_id' => 'laporan_'.$item->id,
                'read' => true,
            ]);
        }
        foreach ($permohonan as $item) {
            $notifications->push([
                'type' => 'Permohonan',
                'title' => 'Permohonan #' . $item->id,
                'created_at' => $item->created_at,
                'notif_id' => 'permohonan_'.$item->id,
                'read' => true,
            ]);
        }

        $notifications = $notifications->sortByDesc('created_at')->values()->take(5);

        return response()->json([
            'success' => true,
            'notifications' => $notifications,
        ]);
    }
}
