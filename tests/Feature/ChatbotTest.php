<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ChatbotTest extends TestCase
{
    public function test_chatbot_api_can_receive_request()
    {
        // Mock the external API response
        Http::fake([
            config('app.env') === 'testing' ? 'https://example.com/webhook/chat' : env('CHATBOT_URL') => Http::response(
                'SOP Pelatihan Perkoperasian dijelaskan secara lengkap sebagai berikut:\n\n**Halaman Dokumen:** Halaman 13-14\n\n**Dasar Hukum:**\n1. Undang-Undang Nomor 25 Tahun 1992 tentang Perkoperasian.',
                200
            ),
        ]);

        $response = $this->postJson('/api/chatbot', [
            'text' => 'Pada dokumen SOP KOP pelatihan koperasi'
        ]);

        $response->assertStatus(200);
        $this->assertStringContainsString('SOP Pelatihan Perkoperasian', $response->getContent());
    }

    public function test_chatbot_api_validates_text_input()
    {
        $response = $this->postJson('/api/chatbot', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['text']);
    }

    public function test_chatbot_api_handles_external_api_failure()
    {
        // Mock external API failure
        Http::fake([
            '*' => Http::response('Server Error', 500),
        ]);

        $response = $this->postJson('/api/chatbot', [
            'text' => 'Pada dokumen SOP KOP test'
        ]);

        $response->assertStatus(500);
        $response->assertJson(['error' => 'Failed to get response from chatbot']);
    }
}
