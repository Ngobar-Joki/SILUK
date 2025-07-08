<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\User;

class VerifyMail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $token;

    /**
     * Create a new message instance.
     */
    public function __construct(User $user, $token = null)
    {
        $this->user = $user;
        $this->token = $token;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        // Jika token tidak diberikan, coba ambil dari relasi
        if (!$this->token) {
            $verifyUser = $this->user->verify_users()->first();
            $this->token = $verifyUser ? $verifyUser->token : null;
        }

        return $this->subject('Verifikasi Email SILUK')
                    ->view('emails.verify-email')
                    ->with([
                        'user' => $this->user,
                        'verifyUrl' => route('verify', ['token' => $this->token])
                    ]);
    }
}
