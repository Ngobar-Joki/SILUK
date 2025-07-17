<?php

namespace App\Service;

use Illuminate\Support\Facades\Http;

class WhatsAppService
{
    protected $apiUrl = 'https://api.fonnte.com/send';

    public function sendMessage(string $to, string $message, string $delay = '0'): array
    {
        $response = Http::withHeaders([
            'Authorization' => env('FONNTE_API_KEY')
        ])->asForm()->post($this->apiUrl, [
            'target'  => $to,
            'message' => $message,
            'delay'   => $delay,
        ]);

        return $response->json();
    }
}
