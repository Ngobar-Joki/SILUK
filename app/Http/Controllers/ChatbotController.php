<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatbotController extends Controller
{
    public function chat(Request $request)
    {
        try {
            $request->validate([
                'text' => 'required|string'
            ]);

            $text = $request->input('text');

            // Get chatbot configuration from environment
            $chatbotUrl = env('CHATBOT_URL');
            $chatbotToken = env('CHATBOT_TOKEN');

            if (!$chatbotUrl || !$chatbotToken) {
                Log::warning('Chatbot configuration missing');
                return $this->getFallbackResponse();
            }

            // Make HTTP GET request to external chatbot API with JSON body
            $response = Http::timeout(30)
                ->withHeaders([
                    'Bearer' => $chatbotToken,  // Fixed: removed colon, space will be added automatically
                    'Content-Type' => 'application/json',
                    'Accept' => 'text/plain',
                ])
                ->withBody(json_encode(['text' => $text]), 'application/json')
                ->get($chatbotUrl);

            if ($response->successful()) {
                $responseBody = $response->body();

                // Validate response is not empty
                if (empty(trim($responseBody))) {
                    Log::warning('Chatbot API returned empty response');
                    return $this->getFallbackResponse();
                }

                // Log the response for debugging
                Log::info('Chatbot API Response:', [
                    'text' => substr($text, 0, 100),
                    'response_length' => strlen($responseBody)
                ]);

                return response($responseBody)
                    ->header('Content-Type', 'text/plain');
            } else {
                $status = $response->status();
                $body = $response->body();

                Log::error('Chatbot API Error:', [
                    'status' => $status,
                    'body' => substr($body, 0, 200),
                    'request_text' => substr($text, 0, 100)
                ]);

                // Check for authorization errors
                if ($status === 401 || $status === 403) {
                    Log::error('Chatbot authorization failed - check CHATBOT_TOKEN in .env file');
                }

                return $this->getFallbackResponse();
            }
        } catch (\Exception $e) {
            Log::error('Chatbot Controller Error:', [
                'message' => $e->getMessage(),
                'request_text' => substr($request->input('text', ''), 0, 100)
            ]);

            return $this->getFallbackResponse();
        }
    }

    private function getFallbackResponse()
    {
        $fallbackResponses = [
            "**Sistem Chatbot SILUK Sedang Maintenance** 🔧\n\nTerima kasih telah menghubungi SILUK! Sistem chatbot kami sedang dalam perbaikan untuk memberikan pelayanan yang lebih baik.\n\n📞 **Hubungi Customer Service:**\nTelepon: (021) 123-4567\nEmail: info@siluk.co.id\nJam operasional: Senin-Jumat 08:00-17:00\n\n🏦 **Layanan yang tersedia:**\n• Simpanan dan Pinjaman\n• Informasi Keanggotaan  \n• Laporan Keuangan\n• Konsultasi Koperasi\n\nTerima kasih atas pengertian Anda! 😊",

            "**Maaf atas Ketidaknyamanan** ⚠️\n\nSistem chatbot sedang mengalami gangguan teknis. Tim IT kami sedang memperbaikinya.\n\n💡 **Alternatif bantuan:**\n• Website: www.siluk.co.id\n• FAQ: Pertanyaan yang sering diajukan\n• Kantor cabang terdekat\n• WhatsApp customer service\n\n📋 **Info Penting:**\nUntuk urusan mendesak, silakan langsung hubungi customer service di (021) 123-4567\n\nTerima kasih! 🙏",

            "**Sistem Dalam Perbaikan** 🛠️\n\nHai! Sistem chatbot SILUK sedang di-upgrade untuk melayani Anda lebih baik lagi.\n\n🏢 **Kantor Pusat SILUK:**\nJl. Koperasi No. 123, Jakarta\nTelepon: (021) 123-4567\nEmail: info@siluk.co.id\n\n📱 **Media Sosial:**\n• Instagram: @siluk_official\n• Facebook: SILUK Koperasi\n• YouTube: SILUK Channel\n\n⏰ Silakan coba lagi dalam beberapa saat atau hubungi customer service kami langsung!",

            "**Notifikasi Sistem** 📢\n\nTerima kasih telah menggunakan layanan chatbot SILUK! Sistem sedang maintenance rutin.\n\n🎯 **Yang bisa Anda lakukan:**\n• Kunjungi halaman FAQ lengkap\n• Download brosur layanan digital\n• Jadwalkan konsultasi dengan advisor\n• Bergabung dengan webinar koperasi\n\n☎️ **Kontak Darurat:**\nHotline 24/7: (021) 123-4567\nWhatsApp: +62-821-xxxx-xxxx\n\nKami akan segera kembali melayani Anda! 💪"
        ];

        $randomResponse = $fallbackResponses[array_rand($fallbackResponses)];

        return response($randomResponse, 200)
            ->header('Content-Type', 'text/plain');
    }
}
