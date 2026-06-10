import { useState } from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';

interface ResendEmailButtonProps {
  email: string;
}

export function ResendEmailButton({ email }: ResendEmailButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleResend = async () => {
    if (status === 'loading' || status === 'sent') return;
    setStatus('loading');
    setErrorMsg('');

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    if (error) {
      setErrorMsg(error.message);
      setStatus('error');
    } else {
      setStatus('sent');
      setTimeout(() => setStatus('idle'), 8000);
    }
  };

  if (status === 'sent') {
    return (
      <p className="flex items-center gap-1.5 text-sm text-green-700">
        <CheckCircle className="h-4 w-4 flex-shrink-0" />
        Confirmation email resent to {email}
      </p>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center gap-1">
        <p className="flex items-center gap-1.5 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {errorMsg || 'Failed to resend. Please try again.'}
        </p>
        <button
          onClick={handleResend}
          className="text-sm text-[#C46A3A] hover:text-[#A85A30] underline transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleResend}
      disabled={status === 'loading'}
      className="flex items-center gap-1.5 text-sm text-[#C46A3A] hover:text-[#A85A30] underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {status === 'loading' && <Loader2 className="h-3 w-3 animate-spin" />}
      {status === 'loading' ? 'Sending…' : 'Resend email'}
    </button>
  );
}
