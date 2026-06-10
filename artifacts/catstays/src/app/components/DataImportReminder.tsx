import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from './ui/button';
import { Database, X, ArrowRight } from 'lucide-react';

interface DataImportReminderProps {
  onDismiss?: () => void;
}

export function DataImportReminder({ onDismiss }: DataImportReminderProps) {
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('catstays_import_reminder_dismissed', 'true');
    if (onDismiss) onDismiss();
  };

  // Don't show if previously dismissed
  if (dismissed || localStorage.getItem('catstays_import_reminder_dismissed')) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-[#F8F7F5] border-l-4 border-[#C46A3A] rounded-xl p-4 mb-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-[#C46A3A]/10 flex items-center justify-center flex-shrink-0">
          <Database className="w-5 h-5 text-[#C46A3A]" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-[#0A1128] mb-1">
            Import your existing data to get started faster
          </h4>
          <p className="text-sm text-[#0A1128]/70 mb-3">
            Move your customers, pets, and bookings into CatStays in just a few minutes. Our AI handles everything automatically.
          </p>
          <Link to="/admin/settings/data">
            <Button 
              size="sm" 
              variant="outline"
              className="border-[#C46A3A]/30 hover:bg-[#C46A3A]/10 text-[#C46A3A] hover:text-[#C46A3A]"
            >
              Import Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        <button
          onClick={handleDismiss}
          className="text-[#0A1128]/30 hover:text-[#0A1128]/60 transition-colors flex-shrink-0"
          aria-label="Dismiss reminder"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
