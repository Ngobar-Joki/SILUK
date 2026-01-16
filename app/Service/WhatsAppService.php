<?php

namespace App\Service;

use Illuminate\Support\Facades\Http;

class WhatsAppService
{
    protected $apiUrl = 'https://api.fonnte.com/send';

    public function sendMessage(string $to, string $message, string $delay = '0', string $url = ''): array
    {
        $data = [
            'target'  => $to,
            'message' => $message,
            'delay'   => $delay,
        ];
        
        // Jika ada URL, tambahkan parameter url agar menjadi button clickable
        if (!empty($url)) {
            $data['url'] = $url;
            $data['buttonurl'] = 'Klik Untuk Verifikasi';
        }
        
        $response = Http::withHeaders([
            'Authorization' => env('FONNTE_API_KEY')
        ])->asForm()->post($this->apiUrl, $data);

        return $response->json();
    }
    
    /**
     * Send message with clickable button URL
     */
    public function sendMessageWithButton(string $to, string $message, string $url, string $buttonText = 'Klik Di Sini'): array
    {
        $response = Http::withHeaders([
            'Authorization' => env('FONNTE_API_KEY')
        ])->asForm()->post($this->apiUrl, [
            'target'    => $to,
            'message'   => $message,
            'url'       => $url,
            'buttonurl' => $buttonText,
        ]);

        return $response->json();
    }
}
